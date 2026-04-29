// chatbot.js — Valthr Research Assistant
// Uses precomputed Q&A pairs grounded in the Valthr report.
// Depends on: window.VALTHR_QA (assets/data/qa.js), marked.js (CDN, optional).

window.ValthrChat = (function () {

  let isTyping = false;
  let history = []; // tracks transcript for the reset button only

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  function init() {
    const placeholder = document.getElementById('chat-placeholder');
    const container   = document.getElementById('chat-container');

    if (placeholder) placeholder.style.display = 'none';
    if (container) container.style.display = 'flex';

    renderSuggestions();
    showChatInterface();
    wireControls();
  }

  function showChatInterface() {
    const chat = document.getElementById('chat-interface');
    if (chat) chat.style.display = 'flex';

    if (history.length === 0) {
      appendMessage('model',
        "Hello! I'm grounded in the Valthr research report on autonomous drone delivery at BAPCO.\n\n" +
        "Pick one of the suggested questions below for a curated answer covering the routing algorithm, fleet, costs, risks, KPIs, contract terms and more."
      );
    }
  }

  function renderSuggestions() {
    const list = document.querySelector('#chat-suggestions .chat-suggestions-list');
    if (!list) return;

    const items = window.VALTHR_QA || [];
    list.innerHTML = '';
    items.forEach(qa => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-suggestion-chip';
      btn.dataset.qaId = qa.id;
      btn.textContent = qa.chip || qa.question;
      list.appendChild(btn);
    });
  }

  function wireControls() {
    const chatForm  = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const clearBtn  = document.getElementById('chat-clear');

    if (chatForm) {
      chatForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!chatInput || !chatInput.value.trim() || isTyping) return;
        const text = chatInput.value.trim();
        chatInput.value = '';
        autoResizeTextarea(chatInput);
        handleFreeText(text);
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

    // Delegate so dynamically rendered chips work too.
    const sugWrap = document.getElementById('chat-suggestions');
    if (sugWrap) {
      sugWrap.addEventListener('click', e => {
        const chip = e.target.closest('.chat-suggestion-chip');
        if (!chip || isTyping) return;
        const qa = (window.VALTHR_QA || []).find(item => item.id === chip.dataset.qaId);
        if (!qa) return;
        answerWith(qa);
      });
    }
  }

  // ── Conversation handlers ──────────────────────────────────────────────────

  function answerWith(qa) {
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.classList.add('is-hidden');

    appendMessage('user', qa.question);
    history.push({ role: 'user', text: qa.question });

    showTyping(true);
    const delay = computeTypingDelay(qa.answer);
    setTimeout(() => {
      showTyping(false);
      appendMessage('model', qa.answer);
      history.push({ role: 'model', text: qa.answer });
      revealSuggestionsAfterReply();
    }, delay);
  }

  function handleFreeText(text) {
    appendMessage('user', text);
    history.push({ role: 'user', text });

    showTyping(true);
    setTimeout(() => {
      showTyping(false);
      const fallback =
        "I can only answer from a curated set of questions about the Valthr research report. " +
        "Pick one of the suggestions below — they cover the routing algorithm, fleet design, costs, risks, KPIs, contract terms, and more.";
      appendMessage('model', fallback);
      history.push({ role: 'model', text: fallback });

      const sug = document.getElementById('chat-suggestions');
      if (sug) {
        sug.classList.remove('is-hidden');
        sug.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 600);
  }

  function revealSuggestionsAfterReply() {
    // Re-show chips after each curated answer so users can ask another.
    const sug = document.getElementById('chat-suggestions');
    if (sug) sug.classList.remove('is-hidden');
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  function computeTypingDelay(text) {
    // Feels live without being annoying — between 500ms and 1400ms.
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

    if (window.marked) {
      bubble.innerHTML = window.marked.parse(text, { breaks: true });
    } else {
      bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
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
