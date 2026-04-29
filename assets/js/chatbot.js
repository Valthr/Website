// chatbot.js — Valthr AI Research Assistant
// Depends on: window.REPORT_CONTEXT (from report-extract.js), marked.js (CDN)

window.ValthrChat = (function () {

  // ── API configuration ──────────────────────────────────────────────────────
  const VALTHR_GEMINI_KEY = 'AIzaSyBnpLodKDyaNplskiDCKBGXYmCmK0NmM8A';
  const GEMINI_MODEL = 'gemini-2.5-flash';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${VALTHR_GEMINI_KEY}`;
  const CACHE_URL = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${VALTHR_GEMINI_KEY}`;
  const CACHE_STORAGE_KEY = 'valthr-gemini-cache-v1';

  let history = [];
  let systemPrompt = null;
  let isTyping = false;
  let cacheNamePromise = null;

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

  function init() {
    const placeholder = document.getElementById('chat-placeholder');
    const container   = document.getElementById('chat-container');

    if (placeholder) placeholder.style.display = 'none';
    if (container) container.style.display = 'flex';

    systemPrompt = buildSystemPrompt();
    cacheNamePromise = initCache(); // fire-and-forget; awaited before first send
    showChatInterface();
    wireControls();
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
        await sendMessage(text);
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

    document.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (isTyping) return;
        const text = chip.dataset.prompt || chip.textContent.trim();
        sendMessage(text);
      });
    });
  }

  async function sendMessage(userText) {
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
          ? 'API quota exceeded. To fix: go to aistudio.google.com → your API key → enable billing, or create a new key in a fresh project to reset the free tier. The chatbot will work again once billing is enabled.'
          : `Error: ${msg}`);
        showTyping(false);
        return;
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '(No response received)';

      history.push({ role: 'model', parts: [{ text: reply }] });
      showTyping(false);
      appendMessage('model', reply);

    } catch (err) {
      showTyping(false);
      appendMessage('error', `Network error: ${err.message}. Please check your connection.`);
    }
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
