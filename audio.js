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
      // Premier élément du header avec margin-right:auto pour rester à gauche
      btn.style.cssText = 'color:#c9a84c;font-size:0.85rem;padding:5px 12px;border:none;border-radius:3px;transition:all 0.3s;cursor:pointer;display:inline-flex;align-items:center;flex-shrink:0;margin-right:auto;background:transparent;';
      headerTop.insertBefore(btn, headerTop.firstChild);
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
    btn.textContent = playing ? '🔊' : '🔇';
    btn.style.borderColor = playing ? 'rgba(0,200,255,0.7)' : 'rgba(0,200,255,0.3)';
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
