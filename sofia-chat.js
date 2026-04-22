(function() {
  var chatHistory = [];
  var isFirstMessage = true;
  var isOpen = false;

  var style = document.createElement('style');
  style.textContent = `
    #sofia-btn {
      position:fixed; bottom:24px; right:24px; z-index:99998;
      width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,#ffb300,#ff8c00);
      box-shadow:0 4px 20px rgba(255,179,0,0.5);
      display:flex; align-items:center; justify-content:center;
      font-size:28px; transition:transform 0.2s;
    }
    #sofia-btn:hover { transform:scale(1.1); }
    #sofia-panel {
      position:fixed; bottom:95px; right:24px; z-index:99997;
      width:340px; max-width:calc(100vw - 48px);
      background:linear-gradient(160deg,#0a1e3d,#071020);
      border:1.5px solid rgba(255,179,0,0.35);
      border-radius:18px; box-shadow:0 8px 40px rgba(0,0,0,0.5);
      display:none; flex-direction:column; overflow:hidden;
      font-family:inherit;
    }
    #sofia-header {
      background:linear-gradient(90deg,#ffb300,#ff8c00);
      padding:12px 16px; display:flex; align-items:center; gap:10px;
    }
    #sofia-header img { width:38px; height:38px; border-radius:50%; object-fit:cover; border:2px solid #fff; }
    #sofia-header-text { flex:1; }
    #sofia-header-name { font-weight:800; color:#000; font-size:0.95rem; }
    #sofia-header-status { font-size:0.75rem; color:#333; }
    #sofia-close { background:none; border:none; cursor:pointer; color:#000; font-size:20px; line-height:1; }
    #sofia-messages {
      flex:1; padding:14px; overflow-y:auto; max-height:320px;
      display:flex; flex-direction:column; gap:10px;
    }
    .sofia-msg { max-width:82%; padding:10px 13px; border-radius:14px; font-size:0.88rem; line-height:1.5; word-break:break-word; }
    .sofia-msg.bot { background:rgba(255,179,0,0.12); color:#e0f0ff; align-self:flex-start; border-bottom-left-radius:4px; }
    .sofia-msg.user { background:linear-gradient(90deg,#ffb300,#ff8c00); color:#000; font-weight:600; align-self:flex-end; border-bottom-right-radius:4px; }
    .sofia-typing { display:flex; gap:4px; align-items:center; padding:10px 13px; }
    .sofia-typing span { width:7px; height:7px; background:#ffb300; border-radius:50%; animation:sofia-bounce 1.2s infinite; }
    .sofia-typing span:nth-child(2) { animation-delay:0.2s; }
    .sofia-typing span:nth-child(3) { animation-delay:0.4s; }
    @keyframes sofia-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
    #sofia-input-row { display:flex; padding:10px 12px; gap:8px; border-top:1px solid rgba(255,179,0,0.2); }
    #sofia-input {
      flex:1; background:rgba(255,255,255,0.07); border:1px solid rgba(255,179,0,0.3);
      border-radius:10px; padding:9px 12px; color:#fff; font-size:0.88rem; outline:none;
    }
    #sofia-input::placeholder { color:rgba(255,255,255,0.35); }
    #sofia-send {
      background:linear-gradient(90deg,#ffb300,#ff8c00); border:none; border-radius:10px;
      padding:0 14px; cursor:pointer; font-size:18px; color:#000;
    }
    #sofia-send:disabled { opacity:0.5; cursor:not-allowed; }
  `;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.id = 'sofia-btn';
  btn.title = 'Parler à Sofia';
  btn.innerHTML = '💬';
  document.body.appendChild(btn);

  var panel = document.createElement('div');
  panel.id = 'sofia-panel';
  panel.innerHTML = `
    <div id="sofia-header">
      <img src="/sofia.jpg" alt="Sofia" onerror="this.style.display='none'">
      <div id="sofia-header-text">
        <div id="sofia-header-name">Sofia — Project Inves'T</div>
        <div id="sofia-header-status">🟢 En ligne</div>
      </div>
      <button id="sofia-close">✕</button>
    </div>
    <div id="sofia-messages"></div>
    <div id="sofia-input-row">
      <input id="sofia-input" type="text" placeholder="Posez votre question...">
      <button id="sofia-send">➤</button>
    </div>
  `;
  document.body.appendChild(panel);

  function addMsg(text, role) {
    var msgs = document.getElementById('sofia-messages');
    var div = document.createElement('div');
    div.className = 'sofia-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    var msgs = document.getElementById('sofia-messages');
    var div = document.createElement('div');
    div.className = 'sofia-msg bot sofia-typing';
    div.id = 'sofia-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function togglePanel() {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
    btn.innerHTML = isOpen ? '✕' : '💬';
    if (isOpen && chatHistory.length === 0) {
      setTimeout(function() {
        addMsg("Bonjour ! Je suis Sofia, l'assistante de John 😊 Comment puis-je vous aider avec nos projets d'investissement ?", 'bot');
      }, 300);
    }
  }

  async function sendMessage() {
    var input = document.getElementById('sofia-input');
    var sendBtn = document.getElementById('sofia-send');
    var msg = input.value.trim();
    if (!msg) return;

    addMsg(msg, 'user');
    input.value = '';
    sendBtn.disabled = true;

    var typing = showTyping();

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: chatHistory,
          isFirst: isFirstMessage,
          visitorName: 'Visiteur site'
        })
      });
      var data = await res.json();
      typing.remove();
      addMsg(data.reply || "Désolée, une erreur s'est produite.", 'bot');
      chatHistory.push({ role: 'user', content: msg });
      chatHistory.push({ role: 'model', content: data.reply });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      isFirstMessage = false;
    } catch(e) {
      typing.remove();
      addMsg("Une erreur s'est produite. Veuillez réessayer.", 'bot');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  btn.addEventListener('click', togglePanel);
  document.getElementById('sofia-close').addEventListener('click', togglePanel);
  document.getElementById('sofia-send').addEventListener('click', sendMessage);
  document.getElementById('sofia-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
})();
