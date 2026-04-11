// features.js — Valthr feature widget loader
// Injects iframes for feature slots where the file exists

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.feature-slot[data-src]').forEach(function (slot) {
    const src = slot.getAttribute('data-src');

    fetch(src, { method: 'HEAD' })
      .then(function (res) {
        if (res.ok) {
          const placeholder = slot.querySelector('.feature-slot-placeholder');
          const iframe = document.createElement('iframe');
          iframe.src = src;
          iframe.className = 'feature-iframe';
          iframe.title = slot.getAttribute('data-title') || 'Feature Widget';
          iframe.setAttribute('loading', 'lazy');
          iframe.setAttribute('allowfullscreen', '');
          if (placeholder) {
            placeholder.replaceWith(iframe);
          } else {
            slot.appendChild(iframe);
          }
        }
        // If not ok, placeholder remains ("Coming Soon")
      })
      .catch(function () {
        // Network error or file not found — keep placeholder
      });
  });
});
