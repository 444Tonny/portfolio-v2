(function () {
  'use strict';

  const body = document.body;
  const themeKey = 'portfolio-theme';
  const THEMES = ['classic', 'neobrutalist', 'retro', 'futurism', 'maximalism', 'glassmorphism', 'organic', 'magazine'];
  const LOADER_MIN_MS = 2200;
  const THEME_AUTO_MS = 4000;

  // ═══════════════════════════════════════════════════════════════
  // LOADER 3D — afficher au moins 2 secondes puis transition
  // ═══════════════════════════════════════════════════════════════
  function initLoader() {
    var start = Date.now();
    function check() {
      var elapsed = Date.now() - start;
      if (elapsed >= LOADER_MIN_MS) {
        body.classList.remove('loading');
        body.classList.add('loaded');
        return;
      }
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  // ═══════════════════════════════════════════════════════════════
  // THEME SWITCHER + rotation automatique toutes les 4s
  // ═══════════════════════════════════════════════════════════════
  var themeInterval = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem(themeKey) || THEMES[0];
    } catch (e) {
      return THEMES[0];
    }
  }

  function setTheme(theme) {
    body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(themeKey, theme);
    } catch (e) {}
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
      var isActive = btn.getAttribute('data-theme') === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function nextTheme() {
    var current = body.getAttribute('data-theme');
    var idx = THEMES.indexOf(current);
    idx = (idx + 1) % THEMES.length;
    setTheme(THEMES[idx]);
  }

  function startAutoRotate() {
    if (themeInterval) clearInterval(themeInterval);
    themeInterval = setInterval(nextTheme, THEME_AUTO_MS);
  }

  setTheme(getStoredTheme());
  startAutoRotate();

  document.querySelectorAll('.theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var theme = this.getAttribute('data-theme');
      setTheme(theme);
      startAutoRotate();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SCROLL REVEAL (Intersection Observer)
  // ═══════════════════════════════════════════════════════════════
  var revealEls = document.querySelectorAll('.reveal');
  var revealOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, revealOptions);

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ═══════════════════════════════════════════════════════════════
  // SMOOTH SCROLL for anchor links
  // ═══════════════════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
