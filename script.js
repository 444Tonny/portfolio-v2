(function () {
  'use strict';

  const body = document.body;
  const themeKey = 'portfolio-theme'; // Clé utilisée pour persister le thème choisi dans localStorage
  const THEMES = ['classic', 'neobrutalist', 'retro', 'futurism', 'maximalism', 'glassmorphism', 'organic', 'magazine'];
  const LOADER_MIN_MS = 200;   // Durée minimale d'affichage du loader en millisecondes
  const THEME_AUTO_MS = 400;   // Intervalle de rotation automatique des thèmes en millisecondes

  // ═══════════════════════════════════════════════════════════════
  // LOADER 3D — afficher au moins 2 secondes puis transition
  // On utilise requestAnimationFrame pour vérifier l'écoulement du temps
  // sans bloquer le thread principal, puis on retire la classe "loading"
  // et on ajoute "loaded" pour déclencher la transition CSS de disparition.
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
      requestAnimationFrame(check); // Rappel à chaque frame tant que le temps min n'est pas écoulé
    }
    requestAnimationFrame(check);
  }
  // Attendre que le DOM soit prêt si le script est chargé avant la fin du parsing HTML
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  // ═══════════════════════════════════════════════════════════════
  // THEME SWITCHER + rotation automatique toutes les 4s
  // Le thème actif est stocké dans localStorage pour persister
  // entre les sessions. La rotation repart depuis 0 à chaque clic manuel.
  // ═══════════════════════════════════════════════════════════════
  var themeInterval = null; // Référence à l'intervalle en cours, pour pouvoir le réinitialiser

  // Lit le thème sauvegardé en localStorage, avec fallback sur 'classic' si indisponible
  function getStoredTheme() {
    try {
      return localStorage.getItem(themeKey) || THEMES[0];
    } catch (e) {
      return THEMES[0]; // Fallback si localStorage est bloqué (mode privé strict, etc.)
    }
  }

  // Applique un thème : met à jour data-theme sur body, sauvegarde en localStorage,
  // et synchronise l'état aria-pressed + la classe "active" des boutons du picker
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

  // Passe au thème suivant dans le tableau THEMES, en bouclant (modulo)
  function nextTheme() {
    var current = body.getAttribute('data-theme');
    var idx = THEMES.indexOf(current);
    idx = (idx + 1) % THEMES.length;
    setTheme(THEMES[idx]);
  }

  // Lance (ou relance) la rotation automatique.
  // On efface l'éventuel intervalle précédent pour éviter les doublons.
  function startAutoRotate() {
    if (themeInterval) clearInterval(themeInterval);
    themeInterval = setInterval(nextTheme, THEME_AUTO_MS);
  }

  // Initialisation : appliquer le thème stocké puis démarrer la rotation
  setTheme(getStoredTheme());
  //startAutoRotate();

  // Clic sur un bouton du picker : applique le thème choisi et repart la rotation depuis zéro
  document.querySelectorAll('.theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var theme = this.getAttribute('data-theme');
      setTheme(theme);
      //startAutoRotate();  // Réinitialise le timer pour éviter un saut immédiat après le clic
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SCROLL REVEAL (Intersection Observer)
  // Tous les éléments portant la classe "reveal" sont observés.
  // Quand ils entrent dans le viewport (avec une marge de 60px en bas),
  // la classe "visible" est ajoutée pour déclencher leur animation CSS.
  // ═══════════════════════════════════════════════════════════════
  var revealEls = document.querySelectorAll('.reveal');
  var revealOptions = {
    root: null,                      // Viewport comme zone de référence
    rootMargin: '0px 0px -60px 0px', // L'élément doit être 60px au-dessus du bas du viewport
    threshold: 0.1                   // 10% de l'élément visible suffit à déclencher
  };

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible'); // CSS prend le relais pour l'animation
        // Note : on ne "unobserve" pas, l'animation peut se rejouer au re-scroll si le CSS le permet
      }
    });
  }, revealOptions);

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ═══════════════════════════════════════════════════════════════
  // SMOOTH SCROLL for anchor links
  // On intercepte tous les liens internes (href="#...") pour utiliser
  // scrollIntoView avec behavior:'smooth' au lieu du saut natif abrupt.
  // Les liens href="#" seuls sont ignorés pour éviter un scroll vers le haut.
  // ═══════════════════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return; // Ignorer les liens vides (placeholders)
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ═══════════════════════════════════════════════════════════════
  // ANIMATION DES COMPTEURS
  // Chaque .stat-number porte data-target (valeur finale) et
  // data-suffix (ex: "+" ou "%"). On lance l'animation quand
  // l'élément devient visible via l'IntersectionObserver existant.
  // ═══════════════════════════════════════════════════════════════
  var statNumbers = document.querySelectorAll('.stat-number');
  var statObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true'; // Évite de relancer l'anim au re-scroll
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1500; // ms
        var start = null;
        function step(timestamp) {
          if (!start) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          // Easing ease-out : décélère vers la fin
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix; // Valeur exacte finale
        }
        requestAnimationFrame(step);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(function(el) {
    statObserver.observe(el);
  });