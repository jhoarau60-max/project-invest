// Sidebar dashboard permanent - partagé sur toutes les pages

// Fix bfcache : force rechargement si page restaurée depuis le cache avant/arrière
window.addEventListener('pageshow', function(e) {
  if (e.persisted) {
    window.location.reload(true);
  }
});

// Fix SW : rechargement auto quand nouveau SW prend le contrôle
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'RELOAD') window.location.reload(true);
  });
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    window.location.reload(true);
  });
}

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
    'arthena.html':            'Artena',
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
      { href: 'arthena.html',        label: 'Artena',           icon: 'fa-gem' },
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
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function(){});
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
    body.is-mobile #sidebar-lang { display: none !important; }

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

    /* Notifications panel scrollable si besoin */
    #notif-panel { max-height: 220px; overflow-y: auto; }

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
    body.is-mobile #nav-close-btn { display: flex !important; }

    /* Sur mobile : cacher les boutons non-essentiels du header */
    body.is-mobile #sound-btn { display: none !important; }

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
    #sidebar-phone-btn, #sidebar-notif-btn { user-select: none; }

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
        if (el.classList.contains('grid-2col')) {
          el.style.setProperty('grid-template-columns', 'repeat(2,1fr)', 'important');
        } else {
          el.style.setProperty('grid-template-columns', '1fr', 'important');
        }
        if (el.id !== 'grid-niveau1') {
          el.style.setProperty('gap', '15px', 'important');
        }
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

    // Bouton × pour fermer le menu sur mobile
    var closeBtn = document.createElement('button');
    closeBtn.id = 'nav-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:absolute;top:8px;right:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:50%;color:#fff;font-size:1.4rem;line-height:1;cursor:pointer;width:34px;height:34px;display:none;align-items:center;justify-content:center;padding:0;z-index:10000;';
    closeBtn.addEventListener('click', function() {
      setNavStyle(false);
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
    });
    nav.insertBefore(closeBtn, nav.firstChild);

    // Réseaux sociaux sous le logo (petites icônes)
    var socialTop = document.createElement('div');
    socialTop.style.cssText = 'display:flex;gap:10px;padding:6px 12px 12px;border-bottom:1px solid rgba(0,200,255,0.12);flex-shrink:0;justify-content:center;';
    socialTop.innerHTML = '<a href="http://www.youtube.com/@Projectinvest-q3o" target="_blank" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,0,0,0.12);border:1px solid rgba(255,60,60,0.5);color:#ff4444;font-size:1.1rem;text-decoration:none;" title="YouTube"><i class="fa-brands fa-youtube"></i></a>'
      + '<a href="https://t.me/+X55Bl0qpvx42ZmE0" target="_blank" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(34,158,217,0.12);border:1px solid rgba(34,158,217,0.5);color:#229ED9;font-size:1.1rem;text-decoration:none;" title="Telegram"><i class="fa-brands fa-telegram"></i></a>'
      + '<a href="https://wa.me/320492931040" target="_blank" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(37,211,102,0.12);border:1px solid rgba(37,211,102,0.5);color:#25D366;font-size:1.1rem;text-decoration:none;" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>';
    var ul = nav.querySelector('ul');
    nav.insertBefore(socialTop, ul);

    // (notifications gérées par audio.js)

    // ── Badge utilisateur (pseudo + avatar) ──
    var badge = document.createElement('a');
    badge.id = 'user-badge';
    badge.href = 'parametres.html';
    badge.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;margin:6px 10px 2px;border-radius:10px;background:rgba(0,200,255,0.08);border:1px solid rgba(0,200,255,0.22);text-decoration:none;cursor:pointer;flex-shrink:0;transition:background 0.2s,border-color 0.2s;';
    badge.innerHTML = '<i class="fa-solid fa-circle-user" style="font-size:1.1rem;color:#229ED9;flex-shrink:0;"></i><span style="color:#fff;font-size:0.8rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">Mon compte</span>';
    badge.addEventListener('mouseenter', function(){ this.style.background='rgba(0,200,255,0.15)'; this.style.borderColor='rgba(0,200,255,0.45)'; });
    badge.addEventListener('mouseleave', function(){ this.style.background='rgba(0,200,255,0.08)'; this.style.borderColor='rgba(0,200,255,0.22)'; });

    // Mettre à jour avec le vrai pseudo dès que Supabase répond
    var _sbClient = (typeof _sb !== 'undefined') ? _sb : (typeof supabase !== 'undefined' ? supabase : null);
    if (_sbClient) {
      _sbClient.auth.getUser().then(function(res) {
        if (res.data && res.data.user) {
          var meta = res.data.user.user_metadata || {};
          var pseudo = meta.username || meta.pseudo || meta.full_name || meta.name
                    || (res.data.user.email ? res.data.user.email.split('@')[0] : 'Mon compte');
          var avatar = meta.avatar_url || meta.avatar || '';
          var span = badge.querySelector('span');
          if (span) span.textContent = pseudo;
          if (avatar) {
            badge.querySelector('i').outerHTML = '<img src="' + avatar + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;">';
          }
        }
      }).catch(function(){});
    }

    // ── Bouton Numérique (Boutique) déplacé depuis le header ──
    var btnNum = document.createElement('a');
    btnNum.id = 'boutique-btn';
    btnNum.href = 'boutique.html';
    btnNum.style.cssText = 'display:flex;align-items:center;gap:9px;padding:8px 12px;margin:6px 10px 2px;border-radius:10px;background:linear-gradient(135deg,rgba(255,149,0,0.15),rgba(230,92,0,0.1));border:1px solid rgba(255,149,0,0.45);text-decoration:none;cursor:pointer;flex-shrink:0;transition:background 0.2s,border-color 0.2s;';
    btnNum.innerHTML = '<i class="fa-solid fa-store" style="font-size:1rem;color:#ff9500;flex-shrink:0;"></i>'
      + '<span style="color:#fff;font-size:0.85rem;font-weight:700;">Numérique</span>';
    btnNum.addEventListener('mouseenter', function(){ this.style.background='linear-gradient(135deg,rgba(255,149,0,0.28),rgba(230,92,0,0.2))'; this.style.borderColor='rgba(255,149,0,0.8)'; });
    btnNum.addEventListener('mouseleave', function(){ this.style.background='linear-gradient(135deg,rgba(255,149,0,0.15),rgba(230,92,0,0.1))'; this.style.borderColor='rgba(255,149,0,0.45)'; });

    var ulEl = nav.querySelector('ul');
    if (ulEl) {
      nav.insertBefore(badge, ulEl);
    }

    // ── Bouton SURPRISE / COFFRE FORT au-dessus de Accueil ──
    (function(){
      var LAUNCH = new Date('2026-04-15T20:30:00');
      var launched = Date.now() >= LAUNCH.getTime();
      var surpriseStyle = document.createElement('style');
      surpriseStyle.textContent = launched ? ''
        : '@keyframes surprisePulse{0%,100%{box-shadow:0 0 8px rgba(255,30,0,0.3)}50%{box-shadow:0 0 22px rgba(255,30,0,0.8)}}'
          + '#btn-surprise{animation:surprisePulse 1.3s ease-in-out infinite}';
      document.head.appendChild(surpriseStyle);

      var btnSurprise = document.createElement('a');
      btnSurprise.id = 'btn-surprise';
      if(launched){
        btnSurprise.href = 'roue.html';
        btnSurprise.style.cssText = 'display:flex;align-items:center;gap:9px;padding:10px 14px;margin:4px 10px 6px;border-radius:12px;background:linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.1));border:1px solid rgba(255,215,0,0.55);text-decoration:none;cursor:pointer;transition:all 0.2s;';
        btnSurprise.innerHTML = '<i class="fa-solid fa-vault" style="font-size:1.1rem;color:#ffd700;flex-shrink:0;"></i>'
          + '<span style="color:#ffd700;font-size:0.92rem;font-weight:900;letter-spacing:0.04em;">Coffre Fort</span>';
      } else {
        btnSurprise.href = 'surprise.html';
        btnSurprise.style.cssText = 'display:flex;align-items:center;gap:9px;padding:10px 14px;margin:4px 10px 6px;border-radius:12px;background:linear-gradient(135deg,rgba(255,30,0,0.2),rgba(180,0,0,0.12));border:1px solid rgba(255,50,0,0.6);text-decoration:none;cursor:pointer;transition:all 0.2s;';
        btnSurprise.innerHTML = '<i class="fa-solid fa-gift" style="font-size:1.1rem;color:#ff3300;flex-shrink:0;"></i>'
          + '<span style="color:#ff3300;font-size:0.92rem;font-weight:900;letter-spacing:0.08em;">🔴 SURPRISE</span>';
      }
      // Insérer au-dessus du premier li (Accueil)
      var firstLi = ulEl ? ulEl.querySelector('li') : null;
      if(firstLi){
        var wrapLi = document.createElement('li');
        wrapLi.appendChild(btnSurprise);
        ulEl.insertBefore(wrapLi, firstLi);
      }
    })();

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

    // ── Numérique sous Paramètres ──
    var paramLi = nav.querySelector('ul li a[href="parametres.html"]');
    if (paramLi) {
      var liNum = document.createElement('li');
      btnNum.style.cssText = 'display:flex;align-items:center;gap:11px;color:#ff9500;text-decoration:none;padding:10px 12px;font-size:0.85rem;border-radius:8px;background:linear-gradient(135deg,rgba(255,149,0,0.12),rgba(230,92,0,0.07));border:1px solid rgba(255,149,0,0.35);margin:2px 0;transition:all 0.2s;white-space:nowrap;overflow:hidden;';
      liNum.appendChild(btnNum);
      paramLi.closest('li').insertAdjacentElement('afterend', liNum);
    }

    // ── Outils (pdf-societe.html) → juste après Conférences (planning-webinaire.html) ──
    var outilsLi   = nav.querySelector('ul li a[href="pdf-societe.html"]');
    var confLi     = nav.querySelector('ul li a[href="planning-webinaire.html"]');
    if (outilsLi && confLi) {
      confLi.closest('li').insertAdjacentElement('afterend', outilsLi.closest('li'));
    }

    // ── Injecter ArbCore et Arthena dans le nav si absents ──
    var ulNav = nav.querySelector('ul');
    function injectNavItem(mainHref, mainLabel, mainIcon, subs, insertAfterHref) {
      if (nav.querySelector('ul li a[href="' + mainHref + '"]')) return; // déjà présent
      var li = document.createElement('li');
      li.classList.add('nav-has-sub');
      var a = document.createElement('a');
      a.href = mainHref;
      a.innerHTML = '<i class="fa-solid ' + mainIcon + '"></i>' + mainLabel + '<span class="nav-arrow">›</span>';
      var subUl = document.createElement('ul');
      subUl.className = 'nav-sub';
      subs.forEach(function(sub) {
        var subLi = document.createElement('li');
        var subA = document.createElement('a');
        subA.href = sub.href;
        subA.innerHTML = '<i class="fa-solid ' + sub.icon + '"></i> ' + sub.label;
        subLi.appendChild(subA);
        subUl.appendChild(subLi);
      });
      a.addEventListener('click', function(e) {
        e.preventDefault();
        li.classList.toggle('open');
        subUl.classList.toggle('open');
      });
      li.appendChild(a);
      li.appendChild(subUl);
      var anchor = nav.querySelector('ul li a[href="' + insertAfterHref + '"]');
      if (anchor) {
        anchor.closest('li').insertAdjacentElement('afterend', li);
      } else {
        ulNav.appendChild(li);
      }
    }

    injectNavItem('arbcore.html', 'ArbCore', 'fa-chart-line', [
      { href: 'arbcore.html',         label: 'ArbCore',           icon: 'fa-chart-line' },
      { href: 'pdf-arbcore.html',     label: 'Documentation PDF', icon: 'fa-file-pdf' },
      { href: 'videos-arbcore.html',  label: 'Vidéo',             icon: 'fa-video' },
    ], 'investissements.html');

    injectNavItem('arthena.html', 'Artena', 'fa-gem', [
      { href: 'arthena.html',         label: 'Artena',        icon: 'fa-gem' },
      { href: 'pdf-arthena.html',     label: 'Documents PDF', icon: 'fa-file-pdf' },
      { href: 'videos-arthena.html',  label: 'Vidéos',        icon: 'fa-video' },
    ], 'arbcore.html');

    // ── Bouton Admin flottant (visible uniquement pour jhoarau60@gmail.com) ──
    (function(){
      function injectAdminBtn() {
        if (document.getElementById('floating-admin-btn')) return;
        var btn = document.createElement('a');
        btn.id = 'floating-admin-btn';
        btn.href = 'admin.html';
        btn.title = 'Panel Admin';
        btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;'
          + 'width:48px;height:48px;border-radius:50%;'
          + 'background:linear-gradient(135deg,#ff4400,#ff8800);'
          + 'color:#fff;display:flex;align-items:center;justify-content:center;'
          + 'font-size:1.2rem;box-shadow:0 0 18px rgba(255,80,0,0.6);'
          + 'text-decoration:none;border:2px solid rgba(255,150,0,0.6);';
        btn.innerHTML = '<i class="fa-solid fa-shield-halved"></i>';
        document.body.appendChild(btn);
      }
      function checkAdmin() {
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (!k) continue;
            var raw = localStorage.getItem(k);
            if (!raw || raw.indexOf('jhoarau60@gmail.com') === -1) continue;
            return true;
          }
          return false;
        } catch(e) { return false; }
      }
      if (checkAdmin()) {
        injectAdminBtn();
      } else {
        setTimeout(function(){ if (checkAdmin()) injectAdminBtn(); }, 2000);
      }
    })();

  });

})();

// ─── PWA : Service Worker ────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
}
