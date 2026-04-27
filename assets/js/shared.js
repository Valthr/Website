// shared.js — Valthr global utilities
// Nav, lazy-init, scroll-reveal, scroll-spy, hero canvas animation

(function () {

  // ─── Lazy-load registry ─────────────────────────────────────────────────────
  window._lazyInits = {};
  window.registerLazy = function (id, fn) {
    window._lazyInits[id] = fn;
    const el = document.getElementById(id);
    if (el && lazyObs) lazyObs.observe(el);
  };

  const lazyObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const fn = window._lazyInits[entry.target.id];
        if (fn) {
          fn();
          delete window._lazyInits[entry.target.id];
          lazyObs.unobserve(entry.target);
        }
      }
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });


  // ─── Scroll reveal ────────────────────────────────────────────────────────────
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });


  // ─── Nav scroll-spy ──────────────────────────────────────────────────────────
  function initNav() {
    const nav = document.getElementById('site-nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#site-nav a[href^="#"]');

    // Background blur on scroll
    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Scroll-spy: highlight active section link
    const spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const link = document.querySelector(`#site-nav a[href="#${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });

    sections.forEach(s => spyObs.observe(s));

    // Smooth-scroll for all in-page anchor links (nav + hero CTAs etc.)
    // Accounts for the fixed nav so the section heading isn't hidden behind it.
    const NAV_OFFSET = 72;
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#' || hash.length < 2) return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
        history.replaceState(null, '', hash);
      });
    });

    // Mobile nav toggle
    const mobileBtn = document.getElementById('nav-mobile-btn');
    const mobileMenu = document.getElementById('nav-mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', function () {
        const open = mobileMenu.classList.toggle('open');
        mobileBtn.setAttribute('aria-expanded', open);
      });
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', false);
        });
      });
    }
  }


  // ─── Hero canvas animation ────────────────────────────────────────────────────
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Three drones flying bezier paths across the canvas
    const droneColors = ['#e0521a', '#2b8fd4', '#6ab330'];
    const drones = droneColors.map((color, i) => ({
      color,
      t: (i / droneColors.length),
      speed: 0.0008 + i * 0.0003,
      path: null,
      trail: []
    }));

    function makePath(i) {
      const w = canvas.width, h = canvas.height;
      const phase = i * 2.1;
      return {
        x0: w * (0.05 + 0.1 * i),
        y0: h * (0.3  + 0.2 * Math.sin(phase)),
        cx1: w * (0.3  + 0.15 * i),
        cy1: h * (0.1  + 0.3 * Math.cos(phase + 1)),
        cx2: w * (0.6  + 0.1  * i),
        cy2: h * (0.7  + 0.2 * Math.sin(phase + 2)),
        x1: w * (0.9  + 0.05 * (i - 1)),
        y1: h * (0.4  + 0.15 * Math.cos(phase + 3))
      };
    }

    function bezierPoint(p, t) {
      const mt = 1 - t;
      return {
        x: mt*mt*mt*p.x0 + 3*mt*mt*t*p.cx1 + 3*mt*t*t*p.cx2 + t*t*t*p.x1,
        y: mt*mt*mt*p.y0 + 3*mt*mt*t*p.cy1 + 3*mt*t*t*p.cy2 + t*t*t*p.y1
      };
    }

    let frameNum = 0;
    function animateHero() {
      frameNum++;
      if (frameNum % 2 === 0) { // run at ~30fps
        requestAnimationFrame(animateHero);
        return;
      }

      // Fade background
      ctx.fillStyle = 'rgba(8, 10, 15, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drones.forEach((drone, i) => {
        if (!drone.path || drone.t >= 1) {
          drone.path = makePath(i);
          drone.t = 0;
          drone.trail = [];
        }

        drone.t += drone.speed;
        const pos = bezierPoint(drone.path, Math.min(drone.t, 1));
        drone.trail.push({ x: pos.x, y: pos.y });
        if (drone.trail.length > 40) drone.trail.shift();

        // Draw trail
        if (drone.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(drone.trail[0].x, drone.trail[0].y);
          for (let j = 1; j < drone.trail.length; j++) {
            ctx.lineTo(drone.trail[j].x, drone.trail[j].y);
          }
          ctx.strokeStyle = drone.color + '55';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw drone dot with glow
        const alpha = 0.6 + 0.4 * Math.sin(frameNum * 0.05 + i);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = drone.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
        grd.addColorStop(0, drone.color + '66');
        grd.addColorStop(1, drone.color + '00');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      requestAnimationFrame(animateHero);
    }

    animateHero();
  }


  // ─── Scroll-to-top cue animation ─────────────────────────────────────────────
  function initScrollCue() {
    const cue = document.getElementById('scroll-cue');
    if (!cue) return;
    let frame = 0;
    function bounce() {
      frame++;
      const y = Math.sin(frame * 0.05) * 6;
      cue.style.transform = `translateX(-50%) translateY(${y}px)`;
      requestAnimationFrame(bounce);
    }
    bounce();
  }


  // ─── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHeroCanvas();
    initScrollCue();

    // Observe all reveal items
    document.querySelectorAll('.reveal-item').forEach(el => revealObs.observe(el));

    // Register lazy sections (after other scripts have run)
    setTimeout(function () {
      ['simulation', 'chatbot'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el && window._lazyInits[id]) {
          lazyObs.observe(el);
        }
      });
    }, 100);
  });

})();
