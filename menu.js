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
    /* Cacher le logo dans le header-top (il est dans la sidebar) */
    .header-top .logo-svg { display: none !important; }
    #user-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #ffffff !important;
      font-size: 0.82rem;
      font-weight: 700 !important;
      padding: 5px 12px !important;
      border: 1px solid #229ED9 !important;
      border-radius: 20px !important;
      background: #229ED9 !important;
      white-space: nowrap;
    }
    #user-badge i { font-size: 0.85rem; }

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
  `;
  document.head.appendChild(style);

  window.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('nav');
    var logo = document.querySelector('header .logo-svg');

    if (!nav) return;

    // Déplacer le nav dans body (hors header)
    document.body.appendChild(nav);

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

// ─── PWA : Service Worker + Bouton Installer ─────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

var _pwaPrompt = null;
var _pwaBtn = null;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _pwaPrompt = e;
  if (_pwaBtn) _pwaBtn.style.display = 'inline-flex';
});

window.addEventListener('load', function() {
  var headerTop = document.querySelector('.header-top');
  if (!headerTop) return;

  var btn = document.createElement('a');
  _pwaBtn = btn;
  btn.id = 'pwa-install-btn';
  btn.title = 'Installer l\'application';
  btn.style.cssText = 'display:none;align-items:center;gap:6px;background:rgba(0,200,255,0.15);color:#00c8ff;border:1px solid rgba(0,200,255,0.5);border-radius:20px;padding:6px 14px;cursor:pointer;font-size:0.88rem;font-weight:700;text-decoration:none;flex-shrink:0;box-shadow:0 0 10px rgba(0,200,255,0.25);';
  btn.innerHTML = '<i class="fa-solid fa-download"></i> Installer';

  btn.addEventListener('click', function() {
    if (_pwaPrompt) {
      _pwaPrompt.prompt();
      _pwaPrompt.userChoice.then(function() { _pwaPrompt = null; btn.style.display = 'none'; });
    } else {
      alert('iPhone/iPad : bouton Partager → "Sur l\'écran d\'accueil"');
    }
  });

  headerTop.insertBefore(btn, headerTop.firstChild);

  // Si beforeinstallprompt a déjà eu lieu avant la création du bouton
  if (_pwaPrompt) btn.style.display = 'inline-flex';

  // iOS : toujours visible si pas déjà installé
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !isStandalone) btn.style.display = 'inline-flex';
});
