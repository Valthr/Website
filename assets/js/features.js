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
          iframe.setAttribute('allowfullscreen', '');
          iframe.addEventListener('load', function () {
            autoSizeIframe(iframe);
          });
          if (placeholder) {
            placeholder.replaceWith(iframe);
          } else {
            slot.appendChild(iframe);
          }
        }
      })
      .catch(function () {
      });
  });

  function autoSizeIframe(iframe) {
    let doc;
    try {
      doc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
      return; // cross-origin — leave default height
    }
    if (!doc || !doc.body) return;

    // Measure the actual content element rather than scrollHeight, which
    // latches to the iframe's set height and prevents shrinking when
    // collapsible sections (e.g. <details>) close.
    function measure() {
      const root = doc.querySelector('.svc-root') || doc.body.firstElementChild || doc.body;
      const rect = root.getBoundingClientRect();
      return Math.ceil(rect.bottom + 12); // small buffer absorbs sub-pixel rounding
    }

    let scheduled = false;
    function resize() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        iframe.style.height = measure() + 'px';
      });
    }

    resize();

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(resize);
      ro.observe(doc.body);
      const root = doc.querySelector('.svc-root');
      if (root) ro.observe(root);
    }
    // <details> toggle and other DOM mutations inside the iframe
    doc.addEventListener('toggle', resize, true);
    window.addEventListener('resize', resize);

    // Re-measure once webfonts inside the iframe finish loading (text reflow)
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(resize);
    }
  }
});
