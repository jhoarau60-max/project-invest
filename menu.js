// Sidebar dashboard permanent - partagé sur toutes les pages
(function () {

  var SW = 220; // largeur sidebar en px

  // Icônes Font Awesome pour chaque page
  var PAGE_ICONS = {
    'index.html':                    'fa-house',
    'home.html':                     'fa-house',
    'parametres.html':               'fa-gear',
    'investissements.html':          'fa-chart-line',
    'pdf-societe.html':              'fa-screwdriver-wrench',
    'planning-webinaire.html':       'fa-video',
    'e-state-immobilier.html':       'fa-building',
    'smart-mev-trading.html':        'fa-robot',
    'mlm-center.html':               'fa-sitemap',
    'portage-salarial.html':         'fa-briefcase',
    'pdf-portage.html':              'fa-file-pdf',
    'videos-portage.html':           'fa-video',
    'bibliotheque-immobilier.html':  'fa-book',
    'bibliotheque-trading.html':     'fa-robot',
    'videos-trading.html':           'fa-video',
    'pdf-trading.html':              'fa-file-pdf',
    'videos-mlm.html':               'fa-video',
    'pdf-mlm.html':                  'fa-file-pdf',
    'strategie-mlm.html':            'fa-chess',
    'videos-immobilier.html':        'fa-video',
    'pdf-immobilier.html':           'fa-file-pdf',
    'bibliotheque-mlm.html':         'fa-star',
    'journal.html':                  'fa-newspaper',
    'boutique.html':                 'fa-store',
    'roue.html':                     'fa-vault',
    'admin.html':                    'fa-shield-halved',
    'arthena.html':                  'fa-gem',
    'pdf-arthena.html':              'fa-file-pdf',
    'videos-arthena.html':           'fa-video',
  };

  // Renommer les onglets
  var RENAME_MAP = {
    'pdf-societe.html':        'Outils',
    'planning-webinaire.html': 'Conférences',
    'e-state-immobilier.html': 'Immobilier Digital',
    'smart-mev-trading.html':  'Bot Trading',
    'mlm-center.html':         'Système Matriciel',
    'bibliotheque-mlm.html':   'Avis Clients',
    'admin.html':              '⚙ Admin',
  };

  // Redirection href (ancien lien → nouveau lien)
  var HREF_REDIRECT = {
  };

  // Sous-menus
  var SUB_ITEMS = {
    'arbcore.html': [
      { href: 'arbcore.html',    label: 'ArbCore',              icon: 'fa-chart-line' },
      { href: 'pdf-arbcore.html',  label: 'Documentation PDF', icon: 'fa-file-pdf' },
      { href: 'videos-arbcore.html',                             label: 'Vidéo',                icon: 'fa-video' },
    ],
    'arthena.html': [
      { href: 'arthena.html',        label: 'Arthena',          icon: 'fa-gem' },
      { href: 'pdf-arthena.html',    label: 'Documents PDF',    icon: 'fa-file-pdf' },
      { href: 'videos-arthena.html', label: 'Vidéos',           icon: 'fa-video' },
    ],
    'e-state-immobilier.html': [
      { href: 'bibliotheque-immobilier.html', label: 'Biens Immobiliers', icon: 'fa-building' },
      { href: 'videos-immobilier.html',       label: 'Outils Vidéo',     icon: 'fa-video' },
      { href: 'pdf-immobilier.html',          label: 'Documents Officiels', icon: 'fa-file-pdf' },
    ],
    'smart-mev-trading.html': [
      { href: 'bibliotheque-trading.html', label: 'Smart Bot',           icon: 'fa-robot' },
      { href: 'videos-trading.html',       label: 'Outils Vidéo',        icon: 'fa-video' },
      { href: 'pdf-trading.html',          label: 'Documents Officiels', icon: 'fa-file-pdf' },
    ],
    'mlm-center.html': [
      { href: 'mlm-center.html',       label: 'MLM Center', icon: 'fa-sitemap' },
      { href: 'videos-mlm.html',       label: 'Outils Vidéo', icon: 'fa-video' },
      { href: 'pdf-mlm.html',          label: 'Documents & Stratégie', icon: 'fa-file-pdf' },
    ],
    'portage-salarial.html': [
      { href: 'pdf-portage.html',    label: 'Document',  icon: 'fa-file-pdf' },
      { href: 'videos-portage.html', label: 'Vidéo',     icon: 'fa-video' },
    ],
  };

  // ── PWA : balises iOS + manifest + service worker ──
  if (!document.querySelector('link[rel="manifest"]')) {
    var mf = document.createElement('link');
    mf.rel = 'manifest'; mf.href = '/manifest.json';
    document.head.appendChild(mf);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    var tc = document.createElement('meta');
    tc.name = 'theme-color'; tc.content = '#00c8ff';
    document.head.appendChild(tc);
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    var am = document.createElement('meta');
    am.name = 'apple-mobile-web-app-capable'; am.content = 'yes';
    document.head.appendChild(am);
    var as = document.createElement('meta');
    as.name = 'apple-mobile-web-app-status-bar-style'; as.content = 'black-translucent';
    document.head.appendChild(as);
    var at = document.createElement('meta');
    at.name = 'apple-mobile-web-app-title'; at.content = "Project inves'T";
    document.head.appendChild(at);
    var ai = document.createElement('link');
    ai.rel = 'apple-touch-icon'; ai.href = '/logo-project-invest.jpg';
    document.head.appendChild(ai);
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(){});
  }

  // Charger Font Awesome si absent
  if (!document.querySelector('link[href*="font-awesome"]')) {
    var fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    document.head.appendChild(fa);
  }

  // Styles
  var style = document.createElement('style');
  style.textContent = `
    /* Sidebar — base commune */
    nav {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      height: 100vh !important;
      background: #0b0f1a !important;
      border-right: 1px solid rgba(0,200,255,0.18) !important;
      z-index: 9998 !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: column !important;
    }
    /* Desktop : sidebar fixe visible */
    body:not(.is-mobile) nav {
      width: ${SW}px !important;
      transform: none !important;
      transition: none !important;
    }
    /* Mobile : sidebar cachée par défaut */
    body.is-mobile nav {
      width: 270px !important;
      transform: translateX(-100%) !important;
      transition: transform 0.35s cubic-bezier(0.4,0,0.2,1) !important;
      z-index: 9999 !important;
    }
    body.is-mobile nav.mobile-open {
      transform: translateX(0) !important;
    }

    /* Logo dans la sidebar */
    .logo-svg {
      display: block !important;
      padding: 18px 12px 14px !important;
      border-bottom: none !important;
      text-decoration: none !important;
      flex-shrink: 0 !important;
    }
    .logo-svg svg {
      width: 100% !important;
      height: auto !important;
    }

    /* Barre de recherche dans la sidebar */
    #header-search {
      position: relative;
      padding: 10px 12px 6px;
    }
    #header-search input {
      background: #ffffff;
      border: 1px solid rgba(255,255,255,0.75);
      border-radius: 3px;
      padding: 6px 14px 6px 32px;
      color: #111;
      font-size: 0.82rem;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      box-shadow: none;
    }
    #header-search input::placeholder { color: rgba(0,0,0,0.4); }
    #header-search i {
      position: absolute;
      left: 23px;
      top: 50%;
      transform: translateY(-30%);
      color: #555;
      font-size: 0.8rem;
      pointer-events: none;
      filter: none;
    }

    /* Titre Dashboard */
    .nav-title {
      padding: 4px 18px 10px;
      color: #ffffff;
      font-size: 1.3rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 300;
      flex-shrink: 0;
      border-bottom: 1px solid #ffffff;
    }

    nav ul {
      list-style: none !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 2px !important;
      padding: 6px 10px !important;
      flex: 1 !important;
    }
    nav ul li a {
      display: flex !important;
      align-items: center !important;
      gap: 11px !important;
      color: #e8f4ff !important;
      text-decoration: none !important;
      padding: 10px 12px !important;
      font-size: 0.85rem !important;
      border-radius: 8px !important;
      border-left: none !important;
      background: none !important;
      box-shadow: none !important;
      transition: all 0.2s !important;
      white-space: nowrap !important;
      overflow: hidden !important;
    }
    nav ul li a i {
      width: 16px !important;
      text-align: center !important;
      font-size: 0.9rem !important;
      flex-shrink: 0 !important;
      color: #c9a84c !important;
    }
    nav ul li a:hover {
      background: rgba(0,200,255,0.1) !important;
      color: #fff !important;
    }
    nav ul li a:hover i { color: #e8c96a !important; }
    nav ul li a.active {
      background: rgba(0,200,255,0.15) !important;
      color: #00c8ff !important;
      font-weight: 400 !important;
    }
    nav ul li a.active i { color: #c9a84c !important; }

    /* ── DESKTOP : décaler le contenu ── */
    body:not(.is-mobile) > header,
    body:not(.is-mobile) > section,
    body:not(.is-mobile) > footer,
    body:not(.is-mobile) > div:not(#bg-curves):not(#nav-overlay):not(.settings-wrapper):not(#crop-modal):not(#lang-menu):not(.section) {
      margin-left: ${SW}px !important;
    }
    body:not(.is-mobile) > .section {
      margin-left: max(${SW}px, calc(50vw - 550px + ${SW/2}px)) !important;
      margin-right: auto !important;
    }
    body:not(.is-mobile) > .settings-wrapper {
      max-width: 600px !important;
      width: 600px !important;
      margin-left: max(${SW}px, calc(50vw - 300px + ${SW/2}px)) !important;
      margin-right: auto !important;
    }
    body:not(.is-mobile) header {
      width: calc(100% - ${SW}px) !important;
    }

    /* ── MOBILE : pleine largeur ── */
    body.is-mobile > header,
    body.is-mobile > section,
    body.is-mobile > footer,
    body.is-mobile > div:not(#bg-curves):not(#nav-overlay):not(.settings-wrapper):not(#crop-modal):not(#lang-menu):not(.section) {
      margin-left: 0 !important;
    }
    body.is-mobile > .section {
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 15px !important;
      padding-right: 15px !important;
    }
    body.is-mobile > .settings-wrapper {
      margin-left: auto !important;
      margin-right: auto !important;
      width: calc(100% - 30px) !important;
      max-width: 600px !important;
    }
    body.is-mobile header {
      width: 100% !important;
    }
    body.is-mobile .header-top {
      flex-wrap: wrap !important;
      gap: 8px !important;
      padding: 8px 0 !important;
    }
    body.is-mobile #mobile-menu-btn { display: flex !important; }
    body:not(.is-mobile) #mobile-menu-btn { display: none !important; }

    /* Sur mobile : cacher les boutons non-essentiels du header */
    body.is-mobile #sound-btn,
    body.is-mobile #boutique-btn { display: none !important; }

    /* Header mobile : ligne unique propre */
    body.is-mobile .header-top {
      flex-wrap: nowrap !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 10px 0 !important;
      gap: 8px !important;
    }
    body.is-mobile .social-links {
      gap: 6px !important;
      flex-wrap: nowrap !important;
    }

    /* Overlay mobile */
    #nav-mobile-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      z-index: 9998;
      backdrop-filter: blur(2px);
    }
    #nav-mobile-overlay.open { display: block !important; }
    .header-top {
      justify-content: flex-end !important;
      gap: 12px !important;
    }
    /* Cacher le logo dans le header-top (il est dans la sidebar) */
    .header-top .logo-svg { display: none !important; }
    #user-badge {
      color: #ffffff !important;
      font-size: 0.85rem;
      font-weight: 700 !important;
      white-space: nowrap;
    }
    #user-badge:hover {
      background: rgba(0,200,255,0.15) !important;
      border-color: rgba(0,200,255,0.4) !important;
    }

    /* Supprimer l'ancien espace réservé au header nav */
    header nav { display: none !important; }

    /* Sous-menus */
    .nav-sub { list-style:none !important; padding:0 0 4px 0 !important; display:none !important; }
    .nav-sub.open { display:block !important; }
    .nav-sub li a {
      padding: 8px 12px 8px 38px !important;
      font-size: 0.8rem !important;
      color: #6a90b0 !important;
    }
    .nav-sub li a:hover { color: #00c8ff !important; background: rgba(0,200,255,0.08) !important; }
    @keyframes arrowShimmer {
      0%   { color: #00c8ff; text-shadow: none; }
      50%  { color: #ffffff; text-shadow: 0 0 8px #00c8ff, 0 0 16px #00c8ff; }
      100% { color: #00c8ff; text-shadow: none; }
    }
    .nav-has-sub > a .nav-arrow {
      margin-left: auto !important;
      font-size: 1.3rem !important;
      line-height: 1 !important;
      color: #00c8ff !important;
      font-weight: 300 !important;
      transition: transform 0.2s !important;
      flex-shrink: 0 !important;
      display: inline-block !important;
      animation: arrowShimmer 2.5s ease-in-out infinite !important;
    }
    .nav-has-sub.open > a .nav-arrow {
      transform: rotate(90deg) !important;
      animation: none !important;
      color: #ffffff !important;
      text-shadow: 0 0 8px #00c8ff !important;
    }

    /* Masquer les boutons sociaux texte du header */
    .social-links a[href*="t.me"],
    .social-links a[href*="youtube"],
    .social-links a[href*="wa.me"] {
      display: none !important;
    }

    /* RÉSEAUX SOCIAUX SIDEBAR */
    #social-float {
      border-top: 1px solid rgba(0,200,255,0.12) !important;
      margin-top: auto !important;
      flex-shrink: 0 !important;
    }
    .sfloat-btn {
      width: 58px; height: 58px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none;
      font-size: 1.7rem;
      transition: all 0.25s ease;
    }
    .sfloat-btn:hover { transform: scale(1.15); }
    .sfloat-telegram {
      background: rgba(34,158,217,0.15);
      border: 1px solid rgba(34,158,217,0.6);
      color: #229ED9;
      box-shadow: 0 0 15px rgba(34,158,217,0.25);
    }
    .sfloat-telegram:hover { box-shadow: 0 0 28px rgba(34,158,217,0.55); }
    .sfloat-youtube {
      background: rgba(255,0,0,0.12);
      border: 1px solid rgba(255,60,60,0.6);
      color: #ff4444;
      box-shadow: 0 0 15px rgba(255,0,0,0.2);
    }
    .sfloat-youtube:hover { box-shadow: 0 0 28px rgba(255,0,0,0.45); }
    .sfloat-whatsapp {
      background: rgba(37,211,102,0.12);
      border: 1px solid rgba(37,211,102,0.6);
      color: #25D366;
      box-shadow: 0 0 15px rgba(37,211,102,0.2);
    }
    .sfloat-whatsapp:hover { box-shadow: 0 0 28px rgba(37,211,102,0.45); }

    .social-links a[href="parametres.html"]:not(#user-badge) { display: none !important; }

    /* Hamburger mobile */
    #mobile-menu-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      padding: 8px;
      border: 1px solid rgba(0,200,255,0.45);
      border-radius: 8px;
      background: rgba(0,200,255,0.08);
      cursor: pointer;
      flex-shrink: 0;
      order: -1;
    }
    #mobile-menu-btn span {
      display: block;
      width: 22px;
      height: 2px;
      background: #3ab8d4;
      border-radius: 2px;
      transition: all 0.3s;
      transform-origin: center;
    }
    #mobile-menu-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #mobile-menu-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    #mobile-menu-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    .social-links a,
    #lang-btn {
      box-shadow: none !important;
      border-radius: 20px !important;
      border: 1px solid rgba(255,255,255,0.75) !important;
      transition: border-color 0.3s, background 0.3s !important;
    }
    .social-links a:hover,
    #lang-btn:hover {
      box-shadow: none !important;
      border-color: #fff !important;
    }
    #sound-btn {
      color: #c9a84c !important;
      border: none !important;
      background: transparent !important;
    }
    #lang-globe { display: none !important; }
  `;
  document.head.appendChild(style);

  // ── Détection mobile ──
  function syncLayout() {
    var isMobileUA = /android|iphone|ipad|ipod|mobile|miui|xiaomi/i.test(navigator.userAgent);
    var isNarrow = window.innerWidth <= 1024;
    var isMob = isMobileUA || isNarrow;
    document.body.classList.toggle('is-mobile', isMob);
    // Corriger les grilles et flex avec styles inline (ne peuvent pas être écrasés par CSS)
    if (isMob) {
      document.querySelectorAll('[style*="grid-template-columns"]').forEach(function(el) {
        el.style.setProperty('grid-template-columns', '1fr', 'important');
        el.style.setProperty('gap', '15px', 'important');
      });
      document.querySelectorAll('[style*="display:flex"],[style*="display: flex"]').forEach(function(el) {
        if (el.querySelector('.card') || el.className.indexOf('cards') !== -1) {
          el.style.setProperty('flex-direction', 'column', 'important');
          el.style.setProperty('align-items', 'stretch', 'important');
        }
      });
      document.querySelectorAll('.card[style*="min-width"],.card[style*="flex:"],.card[style*="flex: "]').forEach(function(el) {
        el.style.setProperty('min-width', '0', 'important');
        el.style.setProperty('max-width', '100%', 'important');
        el.style.setProperty('flex', '1 1 100%', 'important');
        el.style.setProperty('width', '100%', 'important');
      });
    }
  }
  syncLayout();
  window.addEventListener('resize', syncLayout);
  // Ré-appliquer après chargement complet (images, scripts)
  window.addEventListener('load', syncLayout);

  window.addEventListener('DOMContentLoaded', function () {
    syncLayout(); // Re-check after DOM ready
    var nav = document.querySelector('nav');
    var logo = document.querySelector('header .logo-svg');

    if (!nav) return;

    // Déplacer le nav dans body (hors header)
    document.body.appendChild(nav);

    // ── Contrôle du nav via styles inline (priorité absolue sur tout CSS) ──
    function setNavStyle(open) {
      var isMob = window.innerWidth <= 768;
      if (isMob) {
        nav.style.setProperty('width', '270px', 'important');
        nav.style.setProperty('transition', 'transform 0.35s cubic-bezier(0.4,0,0.2,1)', 'important');
        nav.style.setProperty('transform', open ? 'translateX(0)' : 'translateX(-100%)', 'important');
        nav.style.setProperty('z-index', '9999', 'important');
      } else {
        nav.style.setProperty('transform', 'none', 'important');
        nav.style.setProperty('width', SW + 'px', 'important');
        nav.style.setProperty('transition', 'none', 'important');
      }
    }
    setNavStyle(false);
    window.addEventListener('resize', function() { syncLayout(); setNavStyle(false); });

    // ── Bouton hamburger mobile ──
    var hamburger = document.createElement('div');
    hamburger.id = 'mobile-menu-btn';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    var headerTop = document.querySelector('.header-top');
    if (headerTop) headerTop.insertBefore(hamburger, headerTop.firstChild);

    // Overlay mobile
    var overlay = document.createElement('div');
    overlay.id = 'nav-mobile-overlay';
    document.body.appendChild(overlay);

    function openNav() {
      setNavStyle(true);
      overlay.classList.add('open');
      hamburger.classList.add('open');
    }
    function closeNav() {
      setNavStyle(false);
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
    }
    hamburger.addEventListener('click', function() {
      hamburger.classList.contains('open') ? closeNav() : openNav();
    });
    overlay.addEventListener('click', closeNav);
    // Fermer quand on clique un lien du menu (navigation)
    nav.addEventListener('click', function(e) {
      var a = e.target.closest('a');
      if (a && !a.parentElement.classList.contains('nav-has-sub')) closeNav();
    });

    // Mettre le logo en haut de la sidebar avec la nouvelle image
    if (logo) {
      logo.innerHTML = '<img src="logo-project-invest.jpg" alt="Project Inves\'T" style="width:100%;max-width:130px;display:block;margin:0 auto;padding:8px 12px;">';
      nav.insertBefore(logo, nav.firstChild);
    }

    // Titre Dashboard
    var title = document.createElement('div');
    title.className = 'nav-title';
    title.textContent = 'Dashboard';
    // Insérer après le logo
    var ul = nav.querySelector('ul');
    nav.insertBefore(title, ul);

    // Barre de recherche dans la sidebar (au-dessus d'Accueil)
    var searchSidebar = document.createElement('div');
    searchSidebar.id = 'header-search';
    searchSidebar.style.cssText = 'padding:10px 12px 6px;flex-shrink:0;';
    searchSidebar.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Rechercher un profil..." style="width:100%;">';
    var ul = nav.querySelector('ul');
    if (ul) nav.insertBefore(searchSidebar, ul);

    // Badge utilisateur dans la sidebar — créé immédiatement, mis à jour après auth
    var badge = document.createElement('a');
    badge.id = 'user-badge';
    badge.href = 'parametres.html';
    badge.style.cssText = 'display:flex;align-items:center;gap:7px;padding:6px 10px;margin:4px 10px;border-radius:8px;background:rgba(0,200,255,0.08);border:1px solid rgba(0,200,255,0.2);text-decoration:none;cursor:pointer;flex-shrink:0;';
    badge.innerHTML = '<i class="fa-solid fa-circle-user" style="font-size:1rem;color:#229ED9;flex-shrink:0;"></i><span style="color:#fff;font-size:0.78rem;font-weight:700;">Mon compte</span>';

    // Insérer entre recherche et Accueil
    var ulEl = nav.querySelector('ul');
    if (ulEl) nav.insertBefore(badge, ulEl);

    // Mettre à jour avec le vrai pseudo dès que Supabase répond
    var _sbClient = (typeof _sb !== 'undefined') ? _sb : (typeof supabase !== 'undefined' ? supabase : null);
    function updateBadge(user) {
      if (!user) return;
      var meta = user.user_metadata || {};
      var pseudo = meta.username || meta.pseudo || meta.full_name || (user.email ? user.email.split('@')[0] : 'Utilisateur');
      var avatar = meta.avatar_url || meta.avatar || '';
      var span = badge.querySelector('span');
      if (span) span.textContent = pseudo;
      if (avatar && badge.querySelector('i')) {
        badge.querySelector('i').outerHTML = '<img src="' + avatar + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;">';
      }
    }
    if (_sbClient) {
      // Essai 1 : getUser() — appel direct au serveur
      _sbClient.auth.getUser().then(function(res) {
        if (res.data && res.data.user) {
          updateBadge(res.data.user);
        } else {
          // Essai 2 : getSession() comme fallback
          return _sbClient.auth.getSession().then(function(r) {
            if (r.data && r.data.session) updateBadge(r.data.session.user);
          });
        }
      }).catch(function() {});
    }

    // Réseaux sociaux en bas de la sidebar
    var sf = document.createElement('div');
    sf.id = 'social-float';
    sf.innerHTML = `
      <div style="padding:8px 12px 4px;font-size:0.65rem;letter-spacing:2px;color:rgba(200,220,255,0.4);text-transform:uppercase;font-weight:600;">Nous suivre</div>
      <div style="display:flex;gap:8px;padding:0 12px 16px;">
        <a href="https://t.me/+X55Bl0qpvx42ZmE0" target="_blank" class="sfloat-btn sfloat-telegram" title="Telegram">
          <i class="fa-brands fa-telegram"></i>
        </a>
        <a href="http://www.youtube.com/@Projectinvest-q3o" target="_blank" class="sfloat-btn sfloat-youtube" title="YouTube">
          <i class="fa-brands fa-youtube"></i>
        </a>
        <a href="https://wa.me/320492931040" target="_blank" class="sfloat-btn sfloat-whatsapp" title="WhatsApp">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </div>
    `;
    nav.appendChild(sf);

    // Ajouter Boutique si absent du nav
    var ul = nav.querySelector('ul');
    if (ul && !ul.querySelector('a[href="boutique.html"]')) {
      var liB = document.createElement('li');
      var aB  = document.createElement('a');
      aB.href = 'boutique.html';
      aB.textContent = 'Boutique';
      liB.appendChild(aB);
      ul.appendChild(liB);
    }
    // Coffre des Gains masqué — page secrète en développement

    // Renommer + icônes + sous-menus
    nav.querySelectorAll('ul > li').forEach(function (li) {
      var a = li.querySelector('a');
      if (!a) return;
      var href = a.getAttribute('href');

      // Renommer le label (avant redirection pour garder la bonne clé)
      if (RENAME_MAP[href]) {
        a.textContent = RENAME_MAP[href];
      }

      // Rediriger href si nécessaire
      if (HREF_REDIRECT[href]) {
        a.setAttribute('href', HREF_REDIRECT[href]);
        href = HREF_REDIRECT[href];
      }

      // Icône
      var iconClass = PAGE_ICONS[href];
      if (iconClass) {
        // Supprimer les emojis/symboles en tête du texte (ex: ⚙ Paramètres)
        a.childNodes.forEach(function(node){
          if(node.nodeType === 3) node.textContent = node.textContent.replace(/^[^\wÀ-ÿ]+\s*/, '');
        });
        var icon = document.createElement('i');
        icon.className = 'fa-solid ' + iconClass;
        a.insertBefore(icon, a.firstChild);
      }

      // Sous-menu
      if (SUB_ITEMS[href]) {
        li.classList.add('nav-has-sub');

        // Flèche
        var arrow = document.createElement('span');
        arrow.className = 'nav-arrow';
        arrow.textContent = '›';
        a.appendChild(arrow);

        // Liste enfants
        var subUl = document.createElement('ul');
        subUl.className = 'nav-sub';
        SUB_ITEMS[href].forEach(function (sub) {
          var subLi = document.createElement('li');
          var subA = document.createElement('a');
          subA.href = sub.href;
          subA.innerHTML = '<i class="fa-solid ' + sub.icon + '"></i> ' + sub.label;
          subLi.appendChild(subA);
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);

        // Clic n'importe où sur le lien → ouvre/ferme le sous-menu uniquement
        a.addEventListener('click', function (e) {
          e.preventDefault();
          li.classList.toggle('open');
          subUl.classList.toggle('open');
        });
      }
    });
  });

})();

// ─── PWA : Service Worker ────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
