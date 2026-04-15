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
            margin-right: 0;
            transition: box-shadow 0.3s, transform 0.2s;
          }
          #boutique-btn:hover {
            box-shadow: 0 0 18px rgba(255,150,0,0.7);
            transform: scale(1.04);
          }
        `;
        document.head.appendChild(style);

      }

      // Bouton Admin (visible uniquement pour jhoarau60@gmail.com)
      if (!document.getElementById('admin-top-btn')) {
        const _sbAudio = (typeof _sb !== 'undefined') ? _sb : null;
        if (_sbAudio) {
          _sbAudio.auth.getSession().then(function(r) {
            if (!r.data || !r.data.session) return;
            var em = (r.data.session.user.email || '').toLowerCase().trim();
            if (em !== 'jhoarau60@gmail.com') return;
            var adminTopBtn = document.createElement('a');
            adminTopBtn.id = 'admin-top-btn';
            adminTopBtn.href = 'admin.html';
            adminTopBtn.title = 'Panel Admin';
            adminTopBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:0.82rem;font-weight:700;border:1px solid #ff4400;background:#ff4400;color:#fff;text-decoration:none;flex-shrink:0;';
            adminTopBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
            headerTop.appendChild(adminTopBtn);
          });
        }
      }

      // Bouton installer
      if (!document.getElementById('install-btn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-btn';
        installBtn.title = "Installer l'application";
        const isMobAudio = window.innerWidth <= 1024;
        installBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:0.82rem;font-weight:700;border:1px solid #229ED9;background:#229ED9;color:#fff;cursor:pointer;flex-shrink:0;margin-right:auto;';
        installBtn.innerHTML = isMobAudio ? '<i class="fa-solid fa-mobile-screen"></i>' : '<i class="fa-solid fa-mobile-screen"></i> Installer';
        const boutiqueRef = btn;
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

        // Bouton notifications — juste après Installer
        if (!document.getElementById('notif-header-btn')) {
          const notifBtn = document.createElement('div');
          notifBtn.id = 'notif-header-btn';
          notifBtn.title = 'Notifications';
          notifBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:0.82rem;font-weight:700;border:1px solid rgba(255,160,0,0.6);background:rgba(255,160,0,0.12);color:#ffa000;cursor:pointer;flex-shrink:0;position:relative;';
          notifBtn.innerHTML = (window.innerWidth <= 1024 ? '<i class="fa-solid fa-bell"></i>' : '<i class="fa-solid fa-bell"></i> Notifications')
            + '<span id="notif-count" style="position:absolute;top:-5px;right:-4px;background:#ff3333;color:#fff;font-size:0.6rem;font-weight:700;border-radius:50%;width:16px;height:16px;align-items:center;justify-content:center;display:none;">0</span>';
          headerTop.insertBefore(notifBtn, installBtn.nextSibling);

          // Charger le badge au démarrage
          setTimeout(function() {
            var sbClient = (typeof _sb !== 'undefined') ? _sb : null;
            if (!sbClient) return;
            sbClient.auth.getUser().then(function(res) {
              if (!res.data || !res.data.user) return;
              sbClient.from('notifications').select('id',{count:'exact'}).eq('user_id', res.data.user.id).eq('read', false)
                .then(function(rc) {
                  var cnt = rc.count || 0;
                  var badge = document.getElementById('notif-count');
                  if (badge) { badge.textContent = cnt > 9 ? '9+' : cnt; badge.style.display = cnt > 0 ? 'flex' : 'none'; }
                });
            });
          }, 1200);

          notifBtn.addEventListener('click', function() {
            var panel = document.getElementById('notif-header-panel');
            if (panel) { panel.remove(); return; }
            panel = document.createElement('div');
            panel.id = 'notif-header-panel';
            panel.style.cssText = 'position:fixed;top:60px;right:20px;z-index:99999;width:320px;background:#0d1525;border:1px solid rgba(255,160,0,0.35);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.6);overflow:hidden;';
            panel.innerHTML = '<div style="padding:10px 14px;border-bottom:1px solid rgba(255,160,0,0.2);display:flex;align-items:center;justify-content:space-between;">'
              + '<span style="font-weight:700;color:#ffa000;font-size:0.85rem;"><i class="fa-solid fa-bell" style="margin-right:6px;"></i>Notifications</span>'
              + '<button onclick="document.getElementById(\'notif-header-panel\').remove()" style="background:none;border:none;color:#888;font-size:1rem;cursor:pointer;padding:0;line-height:1;">&times;</button>'
              + '</div>'
              + '<div id="notif-header-content" style="max-height:260px;overflow-y:auto;"><div style="padding:14px;color:#888;font-size:0.78rem;text-align:center;">Chargement…</div></div>';
            document.body.appendChild(panel);
            document.addEventListener('click', function hide(e) {
              if (!panel.contains(e.target) && e.target !== notifBtn && !notifBtn.contains(e.target)) {
                panel.remove(); document.removeEventListener('click', hide);
              }
            });
            // Charger depuis Supabase
            var sbClient = (typeof _sb !== 'undefined') ? _sb : null;
            var content = document.getElementById('notif-header-content');
            if (!sbClient || !content) return;
            sbClient.auth.getUser().then(function(res) {
              if (!res.data || !res.data.user) { content.innerHTML = '<div style="padding:14px;color:#888;font-size:0.78rem;text-align:center;">Non connecté</div>'; return; }
              var uid = res.data.user.id;
              sbClient.from('notifications').select('*').eq('user_id', uid).order('created_at', {ascending:false}).limit(10)
                .then(function(r) {
                  var rows = r.data || [];
                  if (!rows.length) { content.innerHTML = '<div style="padding:16px;color:#888;font-size:0.78rem;text-align:center;">Aucune notification</div>'; return; }
                  var html = '';
                  rows.forEach(function(n) {
                    var date = new Date(n.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
                    var bg = n.read ? 'rgba(255,255,255,0.03)' : 'rgba(255,160,0,0.08)';
                    var dot = n.read ? '' : '<span class="notif-dot" style="width:7px;height:7px;border-radius:50%;background:#ffa000;display:inline-block;flex-shrink:0;margin-right:6px;"></span>';
                    html += '<div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.06);background:' + bg + ';position:relative;" data-id="' + n.id + '">'
                      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
                      +   '<div style="display:flex;align-items:center;gap:4px;">' + dot + '<span style="font-size:0.62rem;color:rgba(255,160,0,0.7);">' + (n.type==='gain'?'🏆 Gain':'📢 Info') + ' — ' + date + '</span></div>'
                      +   '<button class="notif-del" data-id="' + n.id + '" style="background:none;border:none;color:#666;font-size:1rem;cursor:pointer;padding:0 0 0 8px;line-height:1;flex-shrink:0;" title="Supprimer">&times;</button>'
                      + '</div>'
                      + '<div style="font-size:0.75rem;color:#ddd;line-height:1.5;white-space:pre-line;">' + n.message + '</div>'
                      + '</div>';
                  });
                  content.innerHTML = html;

                  function updateBadge() {
                    sbClient.from('notifications').select('id',{count:'exact'}).eq('user_id', uid).eq('read', false)
                      .then(function(rc) {
                        var cnt = rc.count || 0;
                        var badge = document.getElementById('notif-count');
                        if (badge) { badge.textContent = cnt > 9 ? '9+' : cnt; badge.style.display = cnt > 0 ? 'flex' : 'none'; }
                      });
                  }

                  // Boutons suppression ×
                  content.querySelectorAll('.notif-del').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                      e.stopPropagation();
                      var nid = this.getAttribute('data-id');
                      var row = content.querySelector('[data-id="' + nid + '"]');
                      sbClient.from('notifications').delete().eq('id', nid).then(function() {
                        if (row) row.remove();
                        if (!content.querySelector('[data-id]')) {
                          content.innerHTML = '<div style="padding:16px;color:#888;font-size:0.78rem;text-align:center;">Aucune notification</div>';
                        }
                        updateBadge();
                      });
                    });
                  });

                  // Clic sur la ligne → marquer comme lu
                  content.querySelectorAll('[data-id]').forEach(function(el) {
                    el.addEventListener('click', function(e) {
                      if (e.target.classList.contains('notif-del')) return;
                      var nid = this.getAttribute('data-id');
                      sbClient.from('notifications').update({read:true}).eq('id', nid).then(function(){});
                      this.style.background = 'rgba(255,255,255,0.03)';
                      var d = this.querySelector('.notif-dot');
                      if (d) d.remove();
                      updateBadge();
                    });
                  });
                }).catch(function() { content.innerHTML = '<div style="padding:12px;color:#f66;font-size:0.78rem;text-align:center;">Erreur de chargement</div>'; });
            });
          });
        }
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
