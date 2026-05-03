/* ==================================================
   NostraCHAT Lead Bot v1
   Bot comercial suave para salas externas.
   Objetivo: orientar y generar posibles matrículas por WhatsApp.
================================================== */
(function () {
  var WA_NUMBER = '51993750351';
  var botInjected = false;
  var lastRoomTitle = '';

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function encodeWA(text) {
    return encodeURIComponent(text);
  }

  function currentRoomText() {
    var title = document.getElementById('nchat-room-title-main');
    return cleanText(title ? title.textContent : '');
  }

  function isExternalRoom() {
    var text = currentRoomText().toLowerCase();
    return text.indexOf('externos') !== -1;
  }

  function roomLabel() {
    var text = currentRoomText();
    if (text.indexOf('·') !== -1) {
      var parts = text.split('·').map(cleanText);
      return parts[2] || 'General';
    }
    return 'General';
  }

  function userName() {
    var input = document.getElementById('nchat-name');
    return cleanText(input ? input.value : '') || 'Postulante';
  }

  function userExtra() {
    var input = document.getElementById('nchat-extra');
    return cleanText(input ? input.value : '');
  }

  function leadMessage(intent) {
    var sala = roomLabel();
    var nombre = userName();
    var dato = userExtra();
    var base = 'Hola Nostradamus, vengo desde NostraCHAT.\n\n' +
      'Nombre: ' + nombre + '\n' +
      (dato ? 'Dato/WhatsApp: ' + dato + '\n' : '') +
      'Sala: Externos - ' + sala + '\n' +
      'Interés: ' + intent + '\n\n' +
      'Quiero recibir orientación para una posible matrícula.';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeWA(base);
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-lead-bot-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-lead-bot-style';
    style.textContent = `
      .nchat-leadbot{
        display:none;
        margin:14px 15px 0;
        padding:15px;
        border-radius:20px;
        background:linear-gradient(135deg,#fff7e6,#f3fdff);
        border:1px solid rgba(255,148,30,.28);
        box-shadow:0 12px 30px rgba(6,20,38,.08);
      }
      .nchat-leadbot.show{display:block;}
      .nchat-leadbot-head{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;}
      .nchat-leadbot-avatar{width:38px;height:38px;border-radius:14px;background:linear-gradient(135deg,#ff941e,#078c95);display:grid;place-items:center;color:#fff;font-size:20px;flex:0 0 auto;}
      .nchat-leadbot-title{font-weight:950;color:#061426;line-height:1.1;}
      .nchat-leadbot-text{font-size:13px;color:#506176;line-height:1.45;margin-top:4px;}
      .nchat-leadbot-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;}
      .nchat-leadbot-btn{border:0;border-radius:999px;padding:9px 12px;font-size:12px;font-weight:950;cursor:pointer;text-decoration:none!important;display:inline-flex;align-items:center;gap:6px;}
      .nchat-leadbot-btn.primary{background:linear-gradient(135deg,#25d366,#078c95);color:#fff!important;}
      .nchat-leadbot-btn.secondary{background:#fff;color:#061426!important;border:1px solid rgba(7,140,149,.18);}
      .nchat-botmsg{max-width:86%;margin:0 0 12px;padding:12px 14px;border-radius:18px;background:#fff7e6;border:1px solid #ffe0ad;color:#513500;box-shadow:0 8px 22px rgba(6,20,38,.06);border-bottom-left-radius:6px;}
      .nchat-botmsg .nchat-meta{opacity:.85;}
      @media(max-width:700px){.nchat-leadbot-actions{flex-direction:column}.nchat-leadbot-btn{justify-content:center;width:100%;}.nchat-botmsg{max-width:96%;}}
    `;
    document.head.appendChild(style);
  }

  function botHTML() {
    return `
      <div class="nchat-leadbot" id="nchat-leadbot">
        <div class="nchat-leadbot-head">
          <div class="nchat-leadbot-avatar">🤖</div>
          <div>
            <div class="nchat-leadbot-title">Asistente de matrícula Nostra</div>
            <div class="nchat-leadbot-text" id="nchat-leadbot-text">Estoy aquí para ayudarte a elegir una ruta de preparación UNI y derivarte con un asesor.</div>
          </div>
        </div>
        <div class="nchat-leadbot-actions">
          <a class="nchat-leadbot-btn primary" id="nchat-leadbot-wa-matricula" target="_blank" rel="noopener">📲 Quiero matricularme</a>
          <a class="nchat-leadbot-btn secondary" id="nchat-leadbot-wa-ciclos" target="_blank" rel="noopener">📚 Ver ciclos</a>
          <a class="nchat-leadbot-btn secondary" id="nchat-leadbot-wa-orientacion" target="_blank" rel="noopener">🎯 Necesito orientación</a>
        </div>
      </div>
    `;
  }

  function ensureBotBox() {
    if (botInjected) return;
    var composer = document.querySelector('.nchat-composer');
    if (!composer || !composer.parentNode) return;
    composer.insertAdjacentHTML('beforebegin', botHTML());
    botInjected = true;
  }

  function updateBotBox() {
    ensureBotBox();
    var box = document.getElementById('nchat-leadbot');
    if (!box) return;

    if (!isExternalRoom()) {
      box.classList.remove('show');
      return;
    }

    var sala = roomLabel();
    var text = document.getElementById('nchat-leadbot-text');
    if (text) {
      if (sala.toLowerCase().indexOf('informes') !== -1) {
        text.textContent = 'Puedo ayudarte a pedir informes de ciclos, horarios, vacantes y matrícula. Déjanos tu consulta o escribe directo a WhatsApp.';
      } else if (sala.toLowerCase().indexOf('orientación') !== -1 || sala.toLowerCase().indexOf('orientacion') !== -1) {
        text.textContent = 'Cuéntanos tu situación: base académica, universidad objetivo y tiempo disponible. Te derivamos a una ruta de preparación UNI.';
      } else {
        text.textContent = 'Bienvenido a la zona externa. Si estás interesado en estudiar con Nostradamus, puedes pedir orientación o iniciar una posible matrícula.';
      }
    }

    var a1 = document.getElementById('nchat-leadbot-wa-matricula');
    var a2 = document.getElementById('nchat-leadbot-wa-ciclos');
    var a3 = document.getElementById('nchat-leadbot-wa-orientacion');
    if (a1) a1.href = leadMessage('Deseo matricularme');
    if (a2) a2.href = leadMessage('Quiero información de ciclos, horarios y costos');
    if (a3) a3.href = leadMessage('Necesito orientación para elegir mi preparación UNI');

    box.classList.add('show');
  }

  function addBotMessage(text) {
    var messages = document.getElementById('nchat-messages');
    if (!messages || !isExternalRoom()) return;
    var now = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    var div = document.createElement('div');
    div.className = 'nchat-botmsg';
    div.innerHTML = '<div class="nchat-meta"><span>Asistente Nostra</span><span>' + now + '</span></div><div class="nchat-text">' + text + '</div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function maybeBotReply(userText) {
    if (!isExternalRoom()) return;
    var t = cleanText(userText).toLowerCase();
    if (!t) return;

    var reply = '';
    if (/matric|inscrib|vacante|precio|costo|pago|mensualidad/.test(t)) {
      reply = 'Puedo derivarte con un asesor de matrícula. Usa el botón verde “Quiero matricularme” y se abrirá WhatsApp con tus datos listos.';
    } else if (/horario|ciclo|semianual|anual|semestral|cepre|ien|módulo|modulo/.test(t)) {
      reply = 'Para ayudarte mejor, indica tu nivel actual, carrera objetivo y horario disponible. También puedes tocar “Ver ciclos” para pedir informes por WhatsApp.';
    } else if (/orient|no sé|no se|recomienda|recomiendan|empezar|desde cero|base/.test(t)) {
      reply = 'Te recomiendo pedir orientación. Un asesor puede ayudarte a elegir entre ciclo, módulos o preparación desde cero según tu nivel.';
    }

    if (reply) {
      setTimeout(function () { addBotMessage(reply); }, 850);
    }
  }

  function hookSend() {
    document.addEventListener('click', function (e) {
      var send = e.target && e.target.closest ? e.target.closest('#nchat-send') : null;
      if (!send) return;
      var input = document.getElementById('nchat-message');
      var text = input ? input.value : '';
      maybeBotReply(text);
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey) return;
      var input = e.target && e.target.id === 'nchat-message' ? e.target : null;
      if (!input) return;
      maybeBotReply(input.value);
    }, true);
  }

  function run() {
    injectStyles();
    updateBotBox();
    if (currentRoomText() !== lastRoomTitle) {
      lastRoomTitle = currentRoomText();
      updateBotBox();
    }
  }

  function init() {
    hookSend();
    run();
    setInterval(run, 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
