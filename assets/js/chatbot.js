// chatbot.js — Valthr AI Research Assistant
// Primary: Gemini 2.5 Flash, grounded in window.REPORT_CONTEXT (assets/data/report-extract.js).
// Fallback: precomputed Q&A from window.VALTHR_QA (assets/data/qa.js) — engages when the
// Gemini API is unreachable, rate-limited, or otherwise erroring, so users never see a
// raw API error message.
// Depends on: marked.js (CDN, optional).

window.ValthrChat = (function () {

  // ── API configuration ──────────────────────────────────────────────────────
  // Key is loaded from assets/data/config.js (gitignored) via window.VALTHR_CONFIG.
  // If that file is absent the key defaults to an empty string, which will cause
  // Gemini requests to fail immediately and flip the chatbot into fallback mode.
  const VALTHR_GEMINI_KEY = (window.VALTHR_CONFIG && window.VALTHR_CONFIG.geminiKey) || '';
  const GEMINI_MODEL = 'gemini-2.5-flash';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${VALTHR_GEMINI_KEY}`;
  const CACHE_URL = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${VALTHR_GEMINI_KEY}`;
  const CACHE_STORAGE_KEY = 'valthr-gemini-cache-v1';

  let history = [];
  let systemPrompt = null;
  let isTyping = false;
  let cacheNamePromise = null;
  let fallbackMode = false; // flips true on API failure; persists for the session

  function buildSystemPrompt() {
    const ctx = window.REPORT_CONTEXT || '[Report text not loaded]';
    return `You are a research assistant for Valthr, an autonomous drone delivery service operating at the BAPCO industrial complex in Bahrain.

You answer questions ONLY based on the research report provided below. If a question cannot be answered from the report, say clearly: "The report does not cover that topic."

Keep answers concise, factual, and formatted in markdown where helpful. Do not speculate beyond the report's content.

Temperature is set low (0.2) — stick closely to what the report says.

---

RESEARCH REPORT:

${ctx}`;
  }

  // Attempts to create (or reuse) a Gemini context cache for the system prompt.
  // Returns the cache name string on success, null on failure (graceful fallback).
  async function initCache() {
    try {
      const stored = localStorage.getItem(CACHE_STORAGE_KEY);
      if (stored) {
        const { name, expireTime } = JSON.parse(stored);
        // Reuse if more than 5 minutes remain before expiry
        if (new Date(expireTime) > new Date(Date.now() + 5 * 60 * 1000)) {
          return name;
        }
      }
    } catch (_) {}

    try {
      const res = await fetch(CACHE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${GEMINI_MODEL}`,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [],
          ttl: '3600s'
        })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({
          name: data.name,
          expireTime: data.expireTime
        }));
        return data.name;
      }
    } catch (_) {}

    return null;
  }

  function secsUntilMidnightPT() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    }).formatToParts(new Date());
    const h = parseInt(parts.find(p => p.type === 'hour').value) % 24;
    const m = parseInt(parts.find(p => p.type === 'minute').value);
    const s = parseInt(parts.find(p => p.type === 'second').value);
    const elapsed = h * 3600 + m * 60 + s;
    return elapsed === 0 ? 86400 : 86400 - elapsed;
  }

  function formatResetCountdown() {
    const secs = secsUntilMidnightPT();
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return secs < 60 ? '< 1m' : h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function startQuotaTimer() {
    function render() {
      const el = document.getElementById('quota-reset-timer');
      if (!el) return;
      el.textContent = `quota resets in ${formatResetCountdown()}`;
    }

    render();
    setInterval(render, 60000);
  }

  function init() {
    const placeholder = document.getElementById('chat-placeholder');
    const container   = document.getElementById('chat-container');

    if (placeholder) placeholder.style.display = 'none';
    if (container) container.style.display = 'flex';

    systemPrompt = buildSystemPrompt();
    cacheNamePromise = initCache(); // fire-and-forget; awaited before first send
    showChatInterface();
    wireControls();
    startQuotaTimer();
  }

  function showChatInterface() {
    const chat = document.getElementById('chat-interface');
    if (chat) chat.style.display = 'flex';

    if (history.length === 0) {
      appendMessage('model',
        'Hello! I\'m grounded in the Valthr research report on autonomous drone delivery at BAPCO.\n\n' +
        'Ask me about the routing algorithm, fleet optimisation, delivery network, cost analysis, or any other topic covered in the report.'
      );
    }
  }

  function wireControls() {
    const chatForm  = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const clearBtn  = document.getElementById('chat-clear');

    if (chatForm) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!chatInput || !chatInput.value.trim() || isTyping) return;
        const text = chatInput.value.trim();
        chatInput.value = '';
        autoResizeTextarea(chatInput);
        await routeMessage(text);
      });
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          chatForm && chatForm.dispatchEvent(new Event('submit'));
        }
      });
      chatInput.addEventListener('input', () => autoResizeTextarea(chatInput));
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        history = [];
        const msgs = document.getElementById('chat-messages');
        if (msgs) msgs.innerHTML = '';
        const sug = document.getElementById('chat-suggestions');
        if (sug) sug.classList.remove('is-hidden');
        showChatInterface();
      });
    }

    // Delegate so dynamically added chips (in fallback mode) work too.
    const sugWrap = document.getElementById('chat-suggestions');
    if (sugWrap) {
      sugWrap.addEventListener('click', e => {
        const chip = e.target.closest('.chat-suggestion-chip');
        if (!chip || isTyping) return;
        const qaId = chip.dataset.qaId;
        const promptText = chip.dataset.prompt || chip.textContent.trim();
        // In fallback mode, prefer the precomputed Q&A entry directly.
        if (fallbackMode && qaId) {
          const qa = findQAById(qaId);
          if (qa) return renderPrecomputed(qa);
        }
        routeMessage(promptText, qaId);
      });
    }
  }

  // ── Routing layer ──────────────────────────────────────────────────────────

  async function routeMessage(userText, qaId) {
    if (fallbackMode) return handleFallback(userText, qaId);
    return sendMessage(userText, qaId);
  }

  // ── Gemini path ────────────────────────────────────────────────────────────

  async function sendMessage(userText, qaId) {
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.classList.add('is-hidden');

    appendMessage('user', userText);
    history.push({ role: 'user', parts: [{ text: userText }] });

    showTyping(true);

    const cacheName = await cacheNamePromise;

    const payload = cacheName
      ? { cachedContent: cacheName, contents: history, generationConfig: { temperature: 0.2, maxOutputTokens: 1024 } }
      : { system_instruction: { parts: [{ text: systemPrompt }] }, contents: history, generationConfig: { temperature: 0.2, maxOutputTokens: 1024 } };

    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Cache may have expired mid-session — invalidate and retry inline
      if (!res.ok && cacheName && (res.status === 404 || res.status === 400)) {
        localStorage.removeItem(CACHE_STORAGE_KEY);
        cacheNamePromise = initCache();
        const fallback = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: history,
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
          })
        });
        if (fallback.ok) {
          const fd = await fallback.json();
          const fr = fd.candidates?.[0]?.content?.parts?.[0]?.text || '(No response received)';
          history.push({ role: 'model', parts: [{ text: fr }] });
          showTyping(false);
          appendMessage('model', fr);
          return;
        }
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `API error ${res.status}`;
        const isQuota = res.status === 429
          || msg.toLowerCase().includes('quota')
          || msg.toLowerCase().includes('resource_exhausted')
          || msg.toLowerCase().includes('rate limit');
        appendMessage('error', isQuota
          ? `API usage limit exceeded. Quota resets in ${formatResetCountdown()}.`
          : `Error: ${msg}`);
        showTyping(false);
        // Roll back the just-appended user turn so the fallback path can re-render it cleanly.
        history.pop();
        rollbackLastUserBubble();
        return enterFallbackMode(userText, qaId);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '(No response received)';

      history.push({ role: 'model', parts: [{ text: reply }] });
      showTyping(false);
      appendMessage('model', reply);

    } catch (err) {
      showTyping(false);
      history.pop();
      rollbackLastUserBubble();
      return enterFallbackMode(userText, qaId);
    }
  }

  // ── Fallback path (precomputed Q&A) ────────────────────────────────────────

  function enterFallbackMode(originalUserText, qaId) {
    if (!fallbackMode) {
      fallbackMode = true;
      appendMessage('model',
        '_AI chat is temporarily unavailable — switching to curated answers from the Valthr team. Pick any question below._'
      );
      ensureFullChipList();
    }
    return handleFallback(originalUserText, qaId);
  }

  function handleFallback(userText, qaId) {
    const qa = (qaId && findQAById(qaId)) || matchQAByText(userText);

    appendMessage('user', userText);
    history.push({ role: 'user', parts: [{ text: userText }] });
    showTyping(true);

    const reply = qa
      ? qa.answer
      : "I can only answer the curated questions below while AI chat is unavailable. Pick one and I'll show the precomputed answer.";

    const delay = computeTypingDelay(reply);
    setTimeout(() => {
      showTyping(false);
      appendMessage('model', reply);
      history.push({ role: 'model', parts: [{ text: reply }] });
      const sug = document.getElementById('chat-suggestions');
      if (sug) sug.classList.remove('is-hidden');
    }, delay);
  }

  function renderPrecomputed(qa) {
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.classList.add('is-hidden');

    appendMessage('user', qa.question);
    history.push({ role: 'user', parts: [{ text: qa.question }] });
    showTyping(true);
    const delay = computeTypingDelay(qa.answer);
    setTimeout(() => {
      showTyping(false);
      appendMessage('model', qa.answer);
      history.push({ role: 'model', parts: [{ text: qa.answer }] });
      if (sug) sug.classList.remove('is-hidden');
    }, delay);
  }

  // Append any Q&A entries that aren't already represented as chips.
  function ensureFullChipList() {
    const list = document.querySelector('#chat-suggestions .chat-suggestions-list');
    if (!list) return;
    const items = window.VALTHR_QA || [];
    const existingIds = new Set(
      Array.from(list.querySelectorAll('.chat-suggestion-chip'))
        .map(chip => chip.dataset.qaId)
        .filter(Boolean)
    );
    items.forEach(qa => {
      if (existingIds.has(qa.id)) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-suggestion-chip';
      btn.dataset.qaId = qa.id;
      btn.dataset.prompt = qa.question;
      btn.textContent = qa.chip || qa.question;
      list.appendChild(btn);
    });
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.classList.remove('is-hidden');
  }

  function findQAById(id) {
    return (window.VALTHR_QA || []).find(item => item.id === id) || null;
  }

  function matchQAByText(text) {
    if (!text) return null;
    const norm = s => (s || '').toLowerCase().trim();
    const t = norm(text);
    const items = window.VALTHR_QA || [];
    return items.find(qa =>
      norm(qa.question) === t ||
      norm(qa.chip) === t
    ) || null;
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  function rollbackLastUserBubble() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const msgs = container.querySelectorAll('.chat-message.chat-user');
    if (msgs.length) msgs[msgs.length - 1].remove();
  }

  function computeTypingDelay(text) {
    const len = (text || '').length;
    return Math.min(1400, 500 + Math.floor(len / 4));
  }

  function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-message chat-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    if (role === 'error') {
      bubble.innerHTML = `<span class="chat-error-icon">⚠</span> ${escapeHtml(text)}`;
    } else {
      if (window.marked) {
        bubble.innerHTML = window.marked.parse(text, { breaks: true });
      } else {
        bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
      }
    }

    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping(show) {
    isTyping = show;
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.style.display = show ? 'flex' : 'none';
  }

  function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init };
})();

// Register lazy init
document.addEventListener('DOMContentLoaded', function () {
  if (window.registerLazy) {
    window.registerLazy('chatbot', () => window.ValthrChat.init());
  }
});
