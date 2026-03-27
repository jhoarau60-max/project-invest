// Sélecteur de langue
(function () {
  const LANGS = [
    { code: 'fr',    label: 'Français',    flag: 'fr' },
    { code: 'es',    label: 'Espagnol',    flag: 'es' },
    { code: 'it',    label: 'Italien',     flag: 'it' },
    { code: 'ro',    label: 'Roumain',     flag: 'ro' },
    { code: 'hu',    label: 'Hongrois',    flag: 'hu' },
    { code: 'ar',    label: 'Arabe',       flag: 'sa' },
    { code: 'vi',    label: 'Vietnamien',  flag: 'vn' },
    { code: 'zh-CN', label: 'Chinois',     flag: 'cn' },
    { code: 'ko',    label: 'Coréen',      flag: 'kr' },
  ];

  const STORAGE_KEY = 'site_lang';

  const style = document.createElement('style');
  style.textContent = `
    .goog-te-banner-frame, .skiptranslate { display: none !important; }
    body { top: 0 !important; }
    #google_translate_element { display: none; }
    @keyframes globeSpin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
    #lang-globe {
      display: inline-block;
      width: 28px; height: 20px;
      border-radius: 3px;
      overflow: hidden;
      animation: globeSpin 3s linear infinite;
      flex-shrink: 0;
      box-shadow: 0 0 5px rgba(0,200,255,0.5);
    }
    #lang-globe img { width:100%; height:100%; object-fit:cover; display:block; }
    #lang-widget { display: inline-flex; align-items: center; gap: 6px; position: relative; }
    #lang-btn {
      display: inline-flex; align-items: center; gap: 6px;
      color: #e8f4ff; font-size: 0.85rem; font-weight: 400; padding: 5px 12px;
      border: 1px solid rgba(58,184,212,0.7); border-radius: 3px;
      background: transparent; cursor: pointer; transition: all 0.3s;
      user-select: none; white-space: nowrap; line-height: 1.4;
    }
    #lang-btn:hover { border-color: #3ab8d4; }
    .lf { width:18px; height:13px; border-radius:2px; object-fit:cover; vertical-align:middle; }

    #lang-menu {
      position: fixed;
      background: #05122b;
      border: 1px solid rgba(0,200,255,0.4);
      border-radius: 12px;
      z-index: 2147483647;
      min-width: 160px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      overflow-y: auto;
      max-height: 320px;
    }
    .lopt {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 15px; color: #a0d4f0; font-size: 0.83rem;
      cursor: pointer; white-space: nowrap;
    }
    .lopt:hover { background: rgba(0,200,255,0.13); color: #fff; }
    .lopt.active { color: #00c8ff; font-weight: 700; }
  `;
  document.head.appendChild(style);

  // Google Translate caché
  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  document.body.appendChild(gtDiv);
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'fr', autoDisplay: false }, 'google_translate_element');
  };
  const gtScript = document.createElement('script');
  gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(gtScript);

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : null;
  }
  function applyLang(code) {
    if (code === 'fr') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + location.hostname;
      localStorage.setItem(STORAGE_KEY, 'fr');
    } else {
      document.cookie = 'googtrans=/fr/' + code + '; path=/';
      document.cookie = 'googtrans=/fr/' + code + '; path=/; domain=.' + location.hostname;
      localStorage.setItem(STORAGE_KEY, code);
    }
    location.reload();
  }
  function getCurrentLang() {
    const cookie = getCookie('googtrans');
    if (cookie) {
      const parts = cookie.split('/');
      const code = parts[parts.length - 1];
      if (code && code !== 'fr') return code;
    }
    return localStorage.getItem(STORAGE_KEY) || 'fr';
  }

  function flagImg(f) {
    return '<img class="lf" src="https://flagcdn.com/20x15/' + f + '.png" alt="">';
  }

  // Contours simplifiés des pays en SVG
  const COUNTRY_SVG = {
    fr: '<polygon points="50,4 82,18 92,48 78,82 50,92 22,82 8,52 18,18" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    es: '<polygon points="10,28 30,8 70,8 90,28 92,60 75,88 25,88 8,60" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    it: '<polygon points="38,4 55,4 60,20 68,38 82,50 88,65 78,72 65,62 58,72 54,88 44,84 46,68 36,54 28,38 30,18" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    ro: '<polygon points="12,25 35,8 65,8 88,25 90,55 75,85 25,85 10,55" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    hu: '<polygon points="8,38 25,20 50,15 75,20 92,38 88,62 70,78 30,78 12,62" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    sa: '<polygon points="15,15 85,15 88,50 75,70 65,88 50,92 35,88 25,70 12,50" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    vn: '<polygon points="42,4 58,4 65,18 68,35 60,48 65,62 62,78 55,92 45,92 38,78 35,62 40,48 32,35 35,18" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    cn: '<polygon points="15,20 45,8 75,12 90,30 92,55 78,75 55,88 28,85 10,68 8,42" fill="none" stroke="#00c8ff" stroke-width="3"/>',
    kr: '<polygon points="25,22 50,10 75,22 85,48 75,75 50,88 25,75 15,48" fill="none" stroke="#00c8ff" stroke-width="3"/>',
  };

  function countryGlobe(flag) {
    const shape = COUNTRY_SVG[flag] || COUNTRY_SVG['fr'];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" style="display:block;">' + shape + '</svg>';
  }

  // Mapping pays → langue
  const COUNTRY_LANG = {
    FR:'fr', BE:'fr', CH:'fr', LU:'fr', MC:'fr',
    ES:'es', MX:'es', AR:'es', CO:'es', PE:'es', CL:'es', VE:'es',
    IT:'it',
    RO:'ro',
    HU:'hu',
    SA:'ar', AE:'ar', EG:'ar', MA:'ar', DZ:'ar', TN:'ar', IQ:'ar', SY:'ar', JO:'ar', KW:'ar', QA:'ar',
    VN:'vi',
    CN:'zh-CN', TW:'zh-CN', HK:'zh-CN',
    KR:'ko',
  };

  // Détecter la langue automatiquement à la 1ère visite
  function autoDetectLang(callback) {
    if (localStorage.getItem(STORAGE_KEY)) { callback(); return; }
    fetch('https://ipapi.co/json/')
      .then(function(r){ return r.json(); })
      .then(function(data) {
        const code = COUNTRY_LANG[data.country_code];
        if (code && code !== 'fr') {
          document.cookie = 'googtrans=/fr/' + code + '; path=/';
          localStorage.setItem(STORAGE_KEY, code);
          location.reload();
        } else {
          localStorage.setItem(STORAGE_KEY, 'fr');
          callback();
        }
      })
      .catch(function(){ callback(); });
  }

  window.addEventListener('load', function () {
    autoDetectLang(function() {
    setTimeout(function () {
      const socialLinks = document.querySelector('.social-links');
      if (!socialLinks) return;

      const saved   = getCurrentLang();
      const current = LANGS.find(l => l.code === saved) || LANGS[0];

      // Créer le menu et l'attacher au body
      const menu = document.createElement('div');
      menu.id = 'lang-menu';
      menu.setAttribute('translate', 'no');
      menu.style.cssText = 'display:none;position:fixed;top:70px;right:20px;background:#05122b;border:1px solid rgba(0,200,255,0.4);border-radius:12px;z-index:2147483647;min-width:160px;max-height:320px;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.8);';

      LANGS.forEach(function (lang) {
        const opt = document.createElement('div');
        opt.className = 'lopt' + (lang.code === saved ? ' active' : '');
        opt.setAttribute('translate', 'no');
        opt.innerHTML = flagImg(lang.flag) + ' ' + lang.label;
        opt.addEventListener('click', function (e) {
          e.stopPropagation();
          menu.style.display = 'none';
          applyLang(lang.code);
        });

        menu.appendChild(opt);
      });
      document.body.appendChild(menu);

      // Créer le bouton dans social-links
      const widget = document.createElement('div');
      widget.id = 'lang-widget';

      const globe = document.createElement('div');
      globe.id = 'lang-globe';
      globe.innerHTML = '<img src="https://flagcdn.com/40x30/' + current.flag + '.png" alt="">';

      const btn = document.createElement('div');
      btn.id = 'lang-btn';
      btn.setAttribute('translate', 'no');
      btn.innerHTML = 'Langue';

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (menu.style.display === 'none') {
          const rect = btn.getBoundingClientRect();
          menu.style.top   = (rect.bottom + 4) + 'px';
          menu.style.left  = rect.left + 'px';
          menu.style.right = 'auto';
          menu.style.display = 'block';
        } else {
          menu.style.display = 'none';
        }
      });

      document.addEventListener('click', function () {
        menu.style.display = 'none';
      });

      // Insérer avant le premier lien (après le badge)
      const firstLink = socialLinks.querySelector('a');
      widget.appendChild(globe);
      widget.appendChild(btn);
      if (firstLink) {
        socialLinks.insertBefore(widget, firstLink);
      } else {
        socialLinks.appendChild(widget);
      }
    }, 400);
    }); // fin autoDetectLang
  });
})();
