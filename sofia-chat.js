(function() {
  var chatHistory = [];
  var isFirstMessage = true;
  var isOpen = false;
  var inactivityTimer = null;
  var INACTIVITY_MS = 5 * 60 * 1000;

  var style = document.createElement('style');
  style.textContent = `
    #sofia-btn-wrap {
      position:fixed !important; bottom:24px !important; right:24px !important;
      left:auto !important; top:auto !important;
      z-index:999999 !important;
      display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer;
      pointer-events:all !important;
    }
    #sofia-btn {
      width:80px; height:80px; border-radius:14px; border:3px solid #ffb300; cursor:pointer;
      background:none; padding:0; overflow:hidden;
      box-shadow:0 4px 24px rgba(255,179,0,0.6);
      transition:transform 0.2s;
    }
    #sofia-btn:hover { transform:scale(1.07); }
    #sofia-btn img {
      width:100%; height:100%; object-fit:cover; object-position:center top; display:block;
    }
    #sofia-btn-label {
      background:linear-gradient(90deg,#ffb300,#ff8c00);
      color:#000; font-weight:800; font-size:0.72rem;
      padding:3px 10px; border-radius:20px;
      box-shadow:0 2px 8px rgba(255,179,0,0.4);
      white-space:nowrap; letter-spacing:0.03em;
    }
    #sofia-panel {
      position:fixed !important; bottom:24px !important; right:24px !important;
      z-index:999998 !important;
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
    #sofia-header img { width:52px; height:52px; border-radius:10px; object-fit:cover; border:2px solid #fff; }
    #sofia-header-text { flex:1; }
    #sofia-header-name { font-weight:800; color:#000; font-size:0.95rem; }
    #sofia-header-status { font-size:0.75rem; color:#333; }
    #sofia-close { background:none; border:none; cursor:pointer; color:#000; font-size:20px; line-height:1; }
    #sofia-messages {
      flex:1; padding:14px; overflow-y:auto; max-height:340px;
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
    .sofia-choices { display:flex; flex-direction:column; gap:8px; align-self:stretch; margin-top:4px; }
    .sofia-choice-btn {
      background:linear-gradient(90deg,#ffb300,#ff8c00); border:none; border-radius:10px;
      padding:11px 14px; color:#000; font-weight:700; font-size:0.85rem;
      cursor:pointer; text-align:left; transition:opacity 0.2s;
    }
    .sofia-choice-btn:hover { opacity:0.85; }
    .sofia-choice-btn.offline { background:rgba(255,255,255,0.08); color:#666; cursor:not-allowed; border:1px solid rgba(255,255,255,0.1); }
    .sofia-tg-link {
      display:inline-block; margin-top:8px;
      background:linear-gradient(90deg,#0088cc,#006699);
      color:#fff; padding:10px 16px; border-radius:10px;
      text-decoration:none; font-weight:700; font-size:0.85rem;
    }
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

  var wrap = document.createElement('div');
  wrap.id = 'sofia-btn-wrap';
  var btn = document.createElement('button');
  btn.id = 'sofia-btn';
  btn.title = 'Parler à Sofia';
  btn.innerHTML = '<img src="/sofia.jpg" alt="Sofia">';
  var label = document.createElement('div');
  label.id = 'sofia-btn-label';
  label.textContent = '💬 Assistant Sofia';
  wrap.appendChild(btn);
  wrap.appendChild(label);
  document.body.appendChild(wrap);

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
    <div id="sofia-input-row" style="display:none;">
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
    return div;
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

  function showChoiceButtons(johnOnline) {
    var msgs = document.getElementById('sofia-messages');
    var choiceDiv = document.createElement('div');
    choiceDiv.className = 'sofia-choices';

    var btnIA = document.createElement('button');
    btnIA.className = 'sofia-choice-btn';
    btnIA.textContent = '💬 Discuter avec l\'assistante';
    btnIA.addEventListener('click', chooseIA);

    var btnJohn = document.createElement('button');
    choiceDiv.appendChild(btnIA);
    if (johnOnline) {
      btnJohn.className = 'sofia-choice-btn';
      btnJohn.textContent = '📱 Parler avec John en direct';
      btnJohn.addEventListener('click', chooseJohn);
      choiceDiv.appendChild(btnJohn);
    }
    msgs.appendChild(choiceDiv);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function chooseIA() {
    var choices = document.querySelector('.sofia-choices');
    if (choices) choices.remove();
    document.getElementById('sofia-input-row').style.display = 'flex';
    addMsg('Parfait ! Posez-moi votre question, je suis là pour vous aider 😊', 'bot');
    document.getElementById('sofia-input').focus();
  }

  function chooseJohn() {
    var choices = document.querySelector('.sofia-choices');
    if (choices) choices.remove();
    var msgs = document.getElementById('sofia-messages');
    var div = document.createElement('div');
    div.className = 'sofia-msg bot';
    div.innerHTML = 'Super ! Cliquez ci-dessous pour rejoindre John directement sur Telegram :<br><a href="https://t.me/Investprojecttttt" target="_blank" class="sofia-tg-link">📱 Contacter John sur Telegram</a>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function resetChat() {
    chatHistory = [];
    isFirstMessage = true;
    document.getElementById('sofia-messages').innerHTML = '';
    document.getElementById('sofia-input-row').style.display = 'none';
  }

  function startInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function() {
      if (isOpen) togglePanel();
    }, INACTIVITY_MS);
  }

  function togglePanel() {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
    wrap.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
      if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }
      resetChat();
    }
    if (isOpen) {
      startInactivityTimer();
      setTimeout(async function() {
        addMsg('Bonjour ! Sofia vous répondra à toutes vos questions 😊\n\nComment souhaitez-vous être aidé ?', 'bot');
        var johnOnline = true;
        try {
          var r = await fetch('/api/status?t=' + Date.now(), { cache: 'no-store' });
          var d = await r.json();
          johnOnline = d.online;
        } catch(e) {}
        showChoiceButtons(johnOnline);
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
      startInactivityTimer();
    } catch(e) {
      typing.remove();
      addMsg("Une erreur s'est produite. Veuillez réessayer.", 'bot');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  btn.addEventListener('click', function(e){ e.stopPropagation(); togglePanel(); });
  label.addEventListener('click', function(e){ e.stopPropagation(); togglePanel(); });
  wrap.addEventListener('click', togglePanel);
  document.getElementById('sofia-close').addEventListener('click', togglePanel);
  document.getElementById('sofia-send').addEventListener('click', sendMessage);
  document.getElementById('sofia-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
})();
