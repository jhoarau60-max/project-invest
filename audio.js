// Musique de fond - partagée sur toutes les pages
(function() {
  const STORAGE_KEY = 'music_playing';

  const MUSIC_SRC = 'jo-project.mp3'; // Mettre ici le nom du fichier audio quand disponible ex: 'music.mp3'
  if (!MUSIC_SRC) return; // Pas de fichier audio → on ne fait rien

  const music = document.createElement('audio');
  music.src = MUSIC_SRC;
  music.loop = true;
  music.volume = 0.15;
  document.body.appendChild(music);

  const btn = document.createElement('div');
  btn.id = 'sound-btn';
  btn.title = 'Activer/Désactiver la musique';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'all 0.3s';

  // Insérer dans le header (à côté de YouTube) ou en fixe sur la page de connexion
  function placeBtn() {
    const headerTop = document.querySelector('.header-top');
    if (headerTop) {
      // Bouton son : icône seule, reste à gauche
      btn.style.cssText = 'color:#fff;font-size:0.9rem;padding:6px 10px;border:1px solid #229ED9;border-radius:20px;transition:all 0.3s;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:#229ED9;';
      headerTop.insertBefore(btn, headerTop.firstChild);

      // Bouton Boutique — à gauche avec margin-right:auto pour pousser les liens sociaux à droite
      if (!document.getElementById('boutique-btn')) {
        const style = document.createElement('style');
        style.textContent = `
          #boutique-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 0.82rem;
            font-weight: 700;
            text-decoration: none;
            flex-shrink: 0;
            background: linear-gradient(135deg, #ff9500, #e65c00);
            color: #fff;
            border: 1px solid rgba(255,150,0,0.5);
            box-shadow: 0 0 10px rgba(255,120,0,0.35);
            margin-right: auto;
            transition: box-shadow 0.3s, transform 0.2s;
          }
          #boutique-btn:hover {
            box-shadow: 0 0 18px rgba(255,150,0,0.7);
            transform: scale(1.04);
          }
        `;
        document.head.appendChild(style);

        const boutiqueBtn = document.createElement('a');
        boutiqueBtn.id = 'boutique-btn';
        boutiqueBtn.href = 'boutique.html';
        boutiqueBtn.innerHTML = '<i class="fa-solid fa-store"></i> Numérique';
        headerTop.insertBefore(boutiqueBtn, btn.nextSibling);
      }

      // Bouton installer — toujours après Numérique, indépendant
      if (!document.getElementById('install-btn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-btn';
        installBtn.title = "Installer l'application";
        installBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:0.82rem;font-weight:700;border:1px solid #229ED9;background:#229ED9;color:#fff;cursor:pointer;flex-shrink:0;';
        installBtn.innerHTML = '<i class="fa-solid fa-mobile-screen"></i> Installer';
        const boutiqueRef = document.getElementById('boutique-btn') || btn;
        headerTop.insertBefore(installBtn, boutiqueRef.nextSibling);

        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', function(e) {
          e.preventDefault();
          deferredPrompt = e;
        });
        installBtn.addEventListener('click', function() {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function() { deferredPrompt = null; installBtn.style.display = 'none'; });
          } else {
            alert("Sur iPhone :\n1. Appuyez sur le bouton Partage (carré avec flèche)\n2. Choisissez 'Sur l'écran d'accueil'\n\nSur Android :\nMenu (3 points) → 'Ajouter à l'écran d'accueil'");
          }
        });
        window.addEventListener('appinstalled', function() { installBtn.style.display = 'none'; });
      }
    } else {
      // Page de connexion : fixe en haut à gauche
      btn.style.cssText = 'position:fixed;top:20px;left:20px;z-index:9999;background:rgba(10,42,94,0.7);border:1px solid rgba(0,200,255,0.4);border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(10px);font-size:1.2rem;transition:all 0.3s;';
      document.body.appendChild(btn);
    }
  }
  window.addEventListener('load', placeBtn);
  window.addEventListener('resize', function() {
    const badge = document.querySelector('.badge');
    if (badge && btn.style.position === 'fixed') {
      const rect = badge.getBoundingClientRect();
      btn.style.top = (rect.top + rect.height / 2 - 22) + 'px';
      btn.style.left = (rect.right + 14) + 'px';
    }
  });

  let playing = sessionStorage.getItem(STORAGE_KEY) === 'true';
  let audioCtx, analyser, dataArray, animFrame;

  function setupAnalyser() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(music);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function animateLogo() {
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    // Moyenne des basses fréquences (beat)
    const bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;
    const level = bass / 255;

    // Cible le logo SVG
    const logos = document.querySelectorAll('.logo-svg svg, .logo-center svg, .logo-welcome svg');
    logos.forEach(svg => {
      const scale = 1 + level * 0.08;
      const glow = Math.round(level * 20);
      svg.style.transform = `scale(${scale})`;
      svg.style.filter = `drop-shadow(0 0 ${glow}px rgba(0,200,255,${0.3 + level * 0.7}))`;
      svg.style.transition = 'transform 0.05s, filter 0.05s';
    });

    animFrame = requestAnimationFrame(animateLogo);
  }

  function updateBtn() {
    btn.innerHTML = playing
      ? '<i class="fa-solid fa-volume-high" style="color:#fff;font-size:0.9rem;"></i>'
      : '<i class="fa-solid fa-volume-xmark" style="color:#fff;font-size:0.9rem;"></i>';
  }

  function startMusic() {
    music.play().then(() => {
      playing = true;
      sessionStorage.setItem(STORAGE_KEY, 'true');
      updateBtn();
      setupAnalyser();
      animateLogo();
    }).catch(() => {});
  }

  function stopMusic() {
    music.pause();
    playing = false;
    sessionStorage.setItem(STORAGE_KEY, 'false');
    cancelAnimationFrame(animFrame);
    // Réinitialise le logo
    document.querySelectorAll('.logo-svg svg, .logo-center svg, .logo-welcome svg').forEach(svg => {
      svg.style.transform = '';
      svg.style.filter = '';
    });
    updateBtn();
  }

  if (playing) {
    window.addEventListener('load', startMusic);
  }

  btn.addEventListener('click', function() {
    if (playing) stopMusic(); else startMusic();
  });

  updateBtn();
})();
