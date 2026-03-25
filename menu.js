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
    'wallet-decentralise.html':      'fa-wallet',
    'bibliotheque-immobilier.html':  'fa-book',
    'bibliotheque-trading.html':     'fa-book',
  };

  // Renommer les onglets
  var RENAME_MAP = {
    'pdf-societe.html':        'Outils',
    'planning-webinaire.html': 'Conférences',
    'e-state-immobilier.html': 'Immobilier',
    'smart-mev-trading.html':  'Bot Trading',
    'mlm-center.html':         'Système Matriciel',
  };

  // Sous-menus
  var SUB_ITEMS = {
    'e-state-immobilier.html': [
      { href: 'bibliotheque-immobilier.html', label: 'Bibliothèque', icon: 'fa-book' }
    ],
    'smart-mev-trading.html': [
      { href: 'bibliotheque-trading.html', label: 'Bibliothèque', icon: 'fa-book' }
    ],
  };

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
    /* Sidebar toujours visible */
    nav {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: ${SW}px !important;
      height: 100vh !important;
      background: #0b0f1a !important;
      border-right: 1px solid rgba(0,200,255,0.18) !important;
      z-index: 9998 !important;
      transform: none !important;
      transition: none !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: column !important;
    }

    /* Logo dans la sidebar */
    .logo-svg {
      display: block !important;
      padding: 18px 12px 14px !important;
      border-bottom: 1px solid rgba(0,200,255,0.15) !important;
      text-decoration: none !important;
      flex-shrink: 0 !important;
    }
    .logo-svg svg {
      width: 100% !important;
      height: auto !important;
    }

    /* Barre de recherche dans le header */
    #header-search {
      position: relative;
      flex-shrink: 0;
      margin-right: auto !important;
    }
    #header-search input {
      background: rgba(0,200,255,0.08);
      border: 2px solid rgba(0,200,255,0.7);
      border-radius: 20px;
      padding: 6px 14px 6px 32px;
      color: #fff;
      font-size: 0.82rem;
      outline: none;
      width: 200px;
      box-shadow: 0 0 10px rgba(0,200,255,0.4), inset 0 0 8px rgba(0,200,255,0.05);
      transition: border-color 0.3s, box-shadow 0.3s, width 0.3s;
    }
    #header-search input::placeholder { color: rgba(0,200,255,0.7); }
    #header-search input:focus {
      border-color: #00c8ff;
      box-shadow: 0 0 16px rgba(0,200,255,0.7), inset 0 0 10px rgba(0,200,255,0.08);
      width: 240px;
    }
    #header-search i {
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      color: #00c8ff;
      font-size: 0.8rem;
      pointer-events: none;
      filter: drop-shadow(0 0 4px #00c8ff);
    }

    /* Titre Dashboard */
    .nav-title {
      padding: 16px 18px 10px;
      color: rgba(0,200,255,0.8);
      font-size: 1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 700;
      flex-shrink: 0;
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
      color: #8aa8c8 !important;
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
      color: rgba(0,200,255,0.5) !important;
    }
    nav ul li a:hover {
      background: rgba(0,200,255,0.1) !important;
      color: #fff !important;
    }
    nav ul li a:hover i { color: #00c8ff !important; }
    nav ul li a.active {
      background: rgba(0,200,255,0.15) !important;
      color: #00c8ff !important;
      font-weight: 600 !important;
    }
    nav ul li a.active i { color: #00c8ff !important; }

    /* Décaler tout le contenu vers la droite */
    body > header,
    body > section,
    body > footer,
    body > div:not(#bg-curves):not(#nav-overlay):not(.settings-wrapper):not(#crop-modal):not(#lang-menu):not(.section) {
      margin-left: ${SW}px !important;
    }

    /* Sections : centrées dans la zone de contenu */
    body > .section {
      margin-left: max(${SW}px, calc(50vw - 550px + ${SW/2}px)) !important;
      margin-right: auto !important;
    }

    /* Settings : centré dans la zone de contenu */
    body > .settings-wrapper {
      max-width: 600px !important;
      width: 600px !important;
      margin-left: max(${SW}px, calc(50vw - 300px + ${SW/2}px)) !important;
      margin-right: auto !important;
    }

    /* Header ajusté */
    header {
      width: calc(100% - ${SW}px) !important;
    }
    .header-top {
      justify-content: flex-end !important;
      gap: 12px !important;
    }
    #user-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #00c8ff;
      font-size: 0.82rem;
      padding: 5px 14px;
      border: 1px solid rgba(0,200,255,0.35);
      border-radius: 20px;
      background: rgba(0,200,255,0.07);
      white-space: nowrap;
    }
    #user-badge i { font-size: 0.85rem; }

    /* Supprimer l'ancien espace réservé au header nav */
    header nav { display: none !important; }

    /* Sous-menus */
    .nav-sub { list-style:none !important; padding:0 0 4px 0 !important; display:none; }
    .nav-sub.open { display:block !important; }
    .nav-sub li a {
      padding: 8px 12px 8px 38px !important;
      font-size: 0.8rem !important;
      color: #6a90b0 !important;
    }
    .nav-sub li a:hover { color: #00c8ff !important; background: rgba(0,200,255,0.08) !important; }
    .nav-has-sub > a .nav-arrow {
      margin-left: auto !important;
      font-size: 0.7rem !important;
      transition: transform 0.2s !important;
      flex-shrink: 0 !important;
    }
    .nav-has-sub.open > a .nav-arrow { transform: rotate(90deg) !important; }

    /* Effet ombre lumineuse sur les boutons du header */
    .social-links a,
    #lang-btn,
    #sound-btn,
    #user-badge {
      box-shadow: 0 0 8px rgba(0,200,255,0.25), 0 0 18px rgba(0,200,255,0.1) !important;
      transition: box-shadow 0.3s, background 0.3s !important;
    }
    .social-links a:hover,
    #lang-btn:hover,
    #sound-btn:hover {
      box-shadow: 0 0 14px rgba(0,200,255,0.6), 0 0 30px rgba(0,200,255,0.25) !important;
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('nav');
    var logo = document.querySelector('header .logo-svg');

    if (!nav) return;

    // Déplacer le nav dans body (hors header)
    document.body.appendChild(nav);

    // Mettre le logo en haut de la sidebar
    if (logo) {
      nav.insertBefore(logo, nav.firstChild);
    }

    // Titre Dashboard
    var title = document.createElement('div');
    title.className = 'nav-title';
    title.textContent = 'Dashboard';
    // Insérer après le logo
    var ul = nav.querySelector('ul');
    nav.insertBefore(title, ul);

    // Barre de recherche dans le header (à gauche)
    var headerTop = document.querySelector('.header-top');
    if (headerTop) {
      var searchEl = document.createElement('div');
      searchEl.id = 'header-search';
      searchEl.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Rechercher un profil...">';
      headerTop.insertBefore(searchEl, headerTop.firstChild);
    }

    // Afficher le pseudo et la photo dans la sidebar + header
    var _sbClient = (typeof _sb !== 'undefined') ? _sb : null;
    if (_sbClient) {
      _sbClient.auth.getSession().then(function(res) {
        var session = res.data && res.data.session;
        if (!session) return;
        var user = session.user;
        var meta = user.user_metadata || {};
        var pseudo = meta.username || meta.pseudo || user.email.split('@')[0];
        var avatar = meta.avatar || '';

        // Badge pseudo dans le header (cliquable → paramètres)
        var badge = document.createElement('a');
        badge.id = 'user-badge';
        badge.href = 'parametres.html';
        badge.style.textDecoration = 'none';
        badge.style.cursor = 'pointer';
        if (avatar) {
          badge.innerHTML = '<img src="' + avatar + '" style="width:22px;height:22px;border-radius:50%;object-fit:cover;"> ' + pseudo;
        } else {
          badge.innerHTML = '<i class="fa-solid fa-circle-user"></i> ' + pseudo;
        }
        var socialLinks = document.querySelector('.social-links');
        if (socialLinks) socialLinks.insertBefore(badge, socialLinks.firstChild);

      });
    }

    // Renommer + icônes + sous-menus
    nav.querySelectorAll('ul > li').forEach(function (li) {
      var a = li.querySelector('a');
      if (!a) return;
      var href = a.getAttribute('href');

      // Renommer le label
      if (RENAME_MAP[href]) {
        a.textContent = RENAME_MAP[href];
      }

      // Icône
      var iconClass = PAGE_ICONS[href];
      if (iconClass) {
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
        arrow.innerHTML = '&#9658;';
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

        // Clic pour ouvrir/fermer
        a.addEventListener('click', function (e) {
          e.preventDefault();
          li.classList.toggle('open');
          subUl.classList.toggle('open');
        });
      }
    });
  });

})();

// ─── PWA : Service Worker + Bouton Installer ─────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

var _pwaPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _pwaPrompt = e;
  var btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'inline-flex';
});

window.addEventListener('load', function() {
  // Créer le bouton dans le header-top
  var headerTop = document.querySelector('.header-top');
  if (!headerTop) return;

  var btn = document.createElement('a');
  btn.id = 'pwa-install-btn';
  btn.title = 'Installer l\'application';
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,255,0.15);color:#00c8ff;border:1px solid rgba(0,200,255,0.5);border-radius:20px;padding:8px 18px;cursor:pointer;font-size:1rem;font-weight:700;text-decoration:none;flex-shrink:0;box-shadow:0 0 12px rgba(0,200,255,0.3);';
  btn.innerHTML = '<i class="fa-solid fa-download"></i> Project App';

  btn.addEventListener('click', function() {
    if (_pwaPrompt) {
      _pwaPrompt.prompt();
      _pwaPrompt.userChoice.then(function() { _pwaPrompt = null; btn.style.display = 'none'; });
    } else {
      alert('Pour installer sur iPhone : appuyez sur le bouton Partager puis "Sur l\'écran d\'accueil"');
    }
  });

  // Insérer juste après la barre de recherche
  var searchEl = headerTop.querySelector('#header-search, input[type="search"], input[type="text"]');
  if (searchEl && searchEl.parentNode) {
    searchEl.parentNode.insertBefore(btn, searchEl.nextSibling);
  } else {
    var socialLinks = headerTop.querySelector('.social-links');
    if (socialLinks) socialLinks.insertBefore(btn, socialLinks.firstChild);
    else headerTop.appendChild(btn);
  }

  // Sur iOS : toujours visible car pas de beforeinstallprompt
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !isStandalone) btn.style.display = 'inline-flex';
});
