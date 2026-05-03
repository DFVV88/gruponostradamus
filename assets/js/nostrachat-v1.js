/* ==================================================
   NostraCHAT v1.2 - Salas oficiales
   Zonas + salas oficiales + bot básico + reportes.
   Sin fotos todavía.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var maxMessageLength = 420;
  var badWords = ['mierda','carajo','puta','puto','imbecil','imbécil','idiota','estupido','estúpido','huevon','huevón','ctm','conchatumare'];
  var blockedPatterns = [/https?:\/\//i, /www\./i, /t\.me\//i, /bit\.ly/i, /tinyurl/i, /wa\.me\//i, /\.com\b/i, /\.pe\b/i, /\.net\b/i];

  var officialRooms = {
    alumnos: [
      { id: 'alumnos-general', label: 'General', icon: '💬' },
      { id: 'alumnos-matematica', label: 'Matemática', icon: '📐' },
      { id: 'alumnos-fisica', label: 'Física', icon: '⚙️' },
      { id: 'alumnos-quimica', label: 'Química', icon: '🧪' },
      { id: 'alumnos-aptitud-academica', label: 'Aptitud Académica', icon: '🧠' },
      { id: 'alumnos-humanidades', label: 'Humanidades', icon: '📚' }
    ],
    externos: [
      { id: 'externos-general', label: 'General', icon: '💬' },
      { id: 'externos-informes', label: 'Informes', icon: '📲' },
      { id: 'externos-orientacion-uni', label: 'Orientación UNI', icon: '🎯' }
    ]
  };

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }

  function cleanText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function containsBadWords(text) {
    var lower = cleanText(text).toLowerCase();
    return badWords.some(function (w) { return lower.indexOf(w) !== -1; });
  }

  function containsBlockedPattern(text) {
    return blockedPatterns.some(function (rx) { return rx.test(text || ''); });
  }

  function looksLikeSpam(text) {
    var t = cleanText(text).toLowerCase();
    if (!t) return false;
    if (/(.)\1{8,}/.test(t)) return true;
    if (t.length > 25 && t === t.toUpperCase()) return true;
    var words = t.split(' ');
    if (words.length >= 6) {
      var unique = Array.from(new Set(words));
      if (unique.length <= 2) return true;
    }
    return false;
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-v1-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-v1-style';
    style.textContent = `
      #nostrachat-live,#nostrachat-live *{box-sizing:border-box;}
      #nostrachat-live{padding:76px 0;background:linear-gradient(180deg,#eef8fa,#fff);font-family:'Jost',Arial,sans-serif;color:#172033;}
      .nchat-wrap{width:min(1180px,92%);margin:auto;}
      .nchat-title{text-align:center;max-width:900px;margin:0 auto 34px;}
      .nchat-title span{display:inline-flex;padding:8px 14px;border-radius:999px;background:#fff7e6;color:#9b5a00;font-weight:950;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;}
      .nchat-title h2{font-family:'Baloo 2','Jost',Arial,sans-serif;font-size:clamp(34px,5vw,58px);line-height:1;color:#061426;margin:0 0 10px;text-transform:uppercase;}
      .nchat-title p{font-size:18px;line-height:1.65;color:#4b5d70;margin:0;}
      .nchat-shell{display:grid;grid-template-columns:360px 1fr;gap:20px;align-items:stretch;}
      .nchat-card{background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:28px;box-shadow:0 22px 60px rgba(6,20,38,.10);overflow:hidden;}
      .nchat-side{padding:22px;}
      .nchat-side h3{font-size:26px;margin:0 0 8px;color:#061426;font-weight:950;}
      .nchat-side p{color:#5f6b7a;line-height:1.55;margin:0 0 16px;}
      .nchat-zone{display:flex;align-items:center;gap:10px;width:100%;padding:13px 15px;border:1px solid rgba(7,140,149,.16);background:#f7fdff;border-radius:16px;margin:10px 0;cursor:pointer;font-weight:950;color:#061426;text-align:left;}
      .nchat-zone.active{background:linear-gradient(135deg,#078c95,#061426);color:#fff;border-color:transparent;box-shadow:0 12px 28px rgba(7,140,149,.22);}
      .nchat-room-title{font-size:15px;font-weight:950;color:#061426;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.4px;}
      .nchat-room-grid{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:16px;}
      .nchat-room{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:1px solid rgba(7,140,149,.16);background:#fff;border-radius:14px;padding:10px 12px;cursor:pointer;color:#26384a;font-weight:900;text-align:left;}
      .nchat-room.active{background:linear-gradient(135deg,#ff941e,#078c95);color:#fff;border-color:transparent;box-shadow:0 10px 24px rgba(255,148,30,.20);}
      .nchat-form label{display:block;font-weight:900;color:#061426;margin:14px 0 6px;}
      .nchat-form input{width:100%;border:1px solid rgba(7,140,149,.22);border-radius:14px;padding:12px 13px;font:inherit;outline:none;background:#fff;}
      .nchat-check{display:flex;gap:10px;align-items:flex-start;margin:14px 0;color:#405066;font-size:14px;line-height:1.4;}
      .nchat-check input{width:auto;margin-top:3px;}
      .nchat-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;width:100%;border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#ff941e,#078c95,#061426);color:#fff;font-weight:950;text-transform:uppercase;cursor:pointer;box-shadow:0 16px 36px rgba(255,148,30,.22);}
      .nchat-warning{display:none;background:#fff2f2;border:1px solid #ffd3d3;color:#941b1b;padding:11px 12px;border-radius:14px;margin-top:12px;font-weight:800;font-size:14px;}
      .nchat-warning.show{display:block;}
      .nchat-main{display:flex;flex-direction:column;min-height:650px;}
      .nchat-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;background:linear-gradient(135deg,#02070d,#07333b,#078c95);color:#fff;}
      .nchat-head strong{display:block;font-size:20px;line-height:1.1;}
      .nchat-head span{display:block;color:rgba(255,255,255,.75);font-size:13px;margin-top:4px;}
      .nchat-pill{display:inline-flex;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.12);font-weight:900;font-size:13px;white-space:nowrap;}
      .nchat-messages{flex:1;padding:20px;background:linear-gradient(180deg,#f7fdff,#fff);overflow-y:auto;max-height:550px;}
      .nchat-empty{text-align:center;color:#69788a;padding:44px 12px;font-weight:800;}
      .nchat-msg{max-width:82%;margin:0 0 12px;padding:12px 14px;border-radius:18px;box-shadow:0 8px 22px rgba(6,20,38,.06);position:relative;}
      .nchat-msg.mine{margin-left:auto;background:linear-gradient(135deg,#078c95,#00c2d1);color:#fff;border-bottom-right-radius:6px;}
      .nchat-msg.other{background:#fff;color:#26384a;border:1px solid rgba(7,140,149,.12);border-bottom-left-radius:6px;}
      .nchat-msg.reported{opacity:.72;}
      .nchat-meta{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:5px;font-size:12px;opacity:.78;font-weight:900;}
      .nchat-text{font-size:15px;line-height:1.5;word-break:break-word;}
      .nchat-actions{display:flex;justify-content:flex-end;margin-top:8px;gap:8px;}
      .nchat-report{border:0;background:rgba(6,20,38,.08);color:inherit;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900;cursor:pointer;}
      .nchat-msg.mine .nchat-report{background:rgba(255,255,255,.18);color:#fff;}
      .nchat-report:disabled{opacity:.65;cursor:not-allowed;}
      .nchat-composer{display:flex;gap:10px;padding:15px;background:#fff;border-top:1px solid rgba(7,140,149,.14);}
      .nchat-composer textarea{flex:1;min-height:48px;max-height:110px;resize:vertical;border:1px solid rgba(7,140,149,.22);border-radius:16px;padding:12px 13px;font:inherit;outline:none;}
      .nchat-send{width:auto;min-width:112px;border:0;border-radius:16px;padding:0 18px;background:linear-gradient(135deg,#078c95,#061426);color:#fff;font-weight:950;cursor:pointer;}
      .nchat-send:disabled{opacity:.55;cursor:not-allowed;}
      .nchat-note{font-size:12px;color:#687789;padding:0 15px 14px;background:#fff;line-height:1.4;}
      @media(max-width:991px){.nchat-shell{grid-template-columns:1fr}.nchat-main{min-height:560px}.nchat-composer{flex-direction:column}.nchat-send{min-height:46px}.nchat-msg{max-width:94%;}}
    `;
    document.head.appendChild(style);
  }

  function roomsHTML(zone) {
    return officialRooms[zone].map(function (room) {
      return '<button class="nchat-room" type="button" data-room-id="' + room.id + '">' +
        '<span>' + room.icon + ' ' + room.label + '</span><small>›</small></button>';
    }).join('');
  }

  function buildUI() {
    if (document.getElementById('nostrachat-live')) return;
    var anchor = document.getElementById('zonas') || document.querySelector('.section');
    var section = document.createElement('section');
    section.id = 'nostrachat-live';
    section.innerHTML = `
      <div class="nchat-wrap">
        <div class="nchat-title">
          <span>Salas oficiales activas</span>
          <h2>Entrar al chat académico</h2>
          <p>Ahora NostraCHAT tiene salas por zona y por curso. Elige una sala oficial, identifícate y participa con respeto.</p>
        </div>
        <div class="nchat-shell">
          <aside class="nchat-card nchat-side">
            <h3>Acceso</h3>
            <p>Elige tu zona y la sala donde quieres participar. Todo mensaje debe ser académico y respetuoso.</p>
            <button class="nchat-zone active" data-zone="alumnos">🔒 Zona alumnos</button>
            <button class="nchat-zone" data-zone="externos">🧭 Zona externos</button>
            <div class="nchat-room-title">Salas oficiales</div>
            <div class="nchat-room-grid" id="nchat-room-grid">${roomsHTML('alumnos')}</div>
            <form class="nchat-form" id="nchat-form">
              <label>Nombre y apellido</label>
              <input id="nchat-name" maxlength="60" placeholder="Ej. Daniel Villavicencio" autocomplete="name">
              <label id="nchat-extra-label">Ciclo o código de alumno</label>
              <input id="nchat-extra" maxlength="80" placeholder="Ej. Semianual UNI / WTC-001">
              <div class="nchat-check"><input id="nchat-rules" type="checkbox"><span>Acepto las reglas: solo consultas académicas, respeto obligatorio, sin datos personales, sin spam, sin enlaces externos y con moderación institucional.</span></div>
              <button class="nchat-btn" type="submit">Ingresar al chat</button>
              <div class="nchat-warning" id="nchat-warning"></div>
            </form>
          </aside>
          <main class="nchat-card nchat-main">
            <div class="nchat-head">
              <div><strong id="nchat-room-title-main">NostraCHAT · Alumnos · General</strong><span id="nchat-room-subtitle">Ingresa tus datos para empezar</span></div>
              <div class="nchat-pill" id="nchat-status">Sin iniciar</div>
            </div>
            <div class="nchat-messages" id="nchat-messages"><div class="nchat-empty">Ingresa para ver y enviar mensajes.</div></div>
            <div class="nchat-composer">
              <textarea id="nchat-message" maxlength="420" placeholder="Escribe tu consulta académica..." disabled></textarea>
              <button class="nchat-send" id="nchat-send" disabled>Enviar</button>
            </div>
            <div class="nchat-note">Sistema mixto: salas oficiales + filtro automático + reportes + revisión humana. Por ahora no se permite subir fotos ni enlaces externos.</div>
          </main>
        </div>
      </div>
    `;
    if (anchor && anchor.parentNode) anchor.insertAdjacentElement('afterend', section);
    else document.body.appendChild(section);
  }

  function showWarning(msg) {
    var el = document.getElementById('nchat-warning');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }

  function hideWarning() {
    var el = document.getElementById('nchat-warning');
    if (el) el.classList.remove('show');
  }

  function initChat() {
    if (!firebaseConfig) {
      showWarning('Falta la configuración de Firebase.');
      return;
    }

    import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js').then(function (appMod) {
      return Promise.all([Promise.resolve(appMod), import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')]);
    }).then(function (mods) {
      var initializeApp = mods[0].initializeApp;
      var fs = mods[1];
      var app = initializeApp(firebaseConfig);
      var db = fs.getFirestore(app);

      var state = {
        zone: 'alumnos',
        roomId: 'alumnos-general',
        user: null,
        unsubscribe: null,
        lastSendAt: 0,
        lastMessageText: '',
        reportedIds: JSON.parse(localStorage.getItem('nostrachat_reported_ids') || '{}'),
        sessionId: localStorage.getItem('nostrachat_session_id') || ('nc_' + Date.now() + '_' + Math.random().toString(36).slice(2))
      };
      localStorage.setItem('nostrachat_session_id', state.sessionId);

      var zoneButtons = document.querySelectorAll('.nchat-zone');
      var roomGrid = document.getElementById('nchat-room-grid');
      var form = document.getElementById('nchat-form');
      var nameInput = document.getElementById('nchat-name');
      var extraInput = document.getElementById('nchat-extra');
      var extraLabel = document.getElementById('nchat-extra-label');
      var rulesInput = document.getElementById('nchat-rules');
      var title = document.getElementById('nchat-room-title-main');
      var subtitle = document.getElementById('nchat-room-subtitle');
      var status = document.getElementById('nchat-status');
      var messages = document.getElementById('nchat-messages');
      var messageInput = document.getElementById('nchat-message');
      var sendBtn = document.getElementById('nchat-send');

      function getRoomLabel(roomId) {
        var all = officialRooms.alumnos.concat(officialRooms.externos);
        var found = all.find(function (r) { return r.id === roomId; });
        return found ? found.label : 'General';
      }

      function roomPath() { return 'rooms/' + state.roomId + '/messages'; }
      function reportsPath() { return 'rooms/' + state.roomId + '/reports'; }

      function updateRoomButtons() {
        roomGrid.innerHTML = roomsHTML(state.zone);
        roomGrid.querySelectorAll('.nchat-room').forEach(function (btn) {
          btn.classList.toggle('active', btn.dataset.roomId === state.roomId);
        });
      }

      function updateTitle() {
        var zoneLabel = state.zone === 'alumnos' ? 'Alumnos' : 'Externos';
        title.textContent = 'NostraCHAT · ' + zoneLabel + ' · ' + getRoomLabel(state.roomId);
        if (state.user) subtitle.textContent = 'Participas como ' + state.user.name;
      }

      function setZone(zone) {
        state.zone = zone;
        state.roomId = officialRooms[zone][0].id;
        zoneButtons.forEach(function (btn) { btn.classList.toggle('active', btn.dataset.zone === zone); });
        extraLabel.textContent = zone === 'alumnos' ? 'Ciclo o código de alumno' : 'WhatsApp o motivo de consulta';
        extraInput.placeholder = zone === 'alumnos' ? 'Ej. Semianual UNI / WTC-001' : 'Ej. 993 750 351 / informes de ciclos';
        updateRoomButtons();
        updateTitle();
        if (state.user) startListening();
      }

      function setRoom(roomId) {
        state.roomId = roomId;
        updateRoomButtons();
        updateTitle();
        if (state.user) startListening();
      }

      function enableChat() {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        status.textContent = 'Conectado';
        updateTitle();
      }

      function renderMessages(items) {
        if (!items.length) {
          messages.innerHTML = '<div class="nchat-empty">Aún no hay mensajes en esta sala. Sé el primero en escribir una consulta académica.</div>';
          return;
        }
        messages.innerHTML = items.map(function (m) {
          var mine = m.sessionId === state.sessionId;
          var cls = mine ? 'mine' : 'other';
          var date = m.createdAt && m.createdAt.toDate ? m.createdAt.toDate() : null;
          var time = date ? date.toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'}) : '';
          var id = escapeHTML(m.id || '');
          var reported = state.reportedIds[m.id] ? ' reported' : '';
          var reportText = state.reportedIds[m.id] ? 'Reportado' : 'Reportar';
          var reportDisabled = state.reportedIds[m.id] ? ' disabled' : '';
          return '<div class="nchat-msg ' + cls + reported + '"><div class="nchat-meta"><span>' + escapeHTML(m.name || 'NostraCHAT') + '</span><span>' + escapeHTML(time) + '</span></div><div class="nchat-text">' + escapeHTML(m.text || '') + '</div><div class="nchat-actions"><button class="nchat-report" data-report-id="' + id + '"' + reportDisabled + '>' + reportText + '</button></div></div>';
        }).join('');
        messages.scrollTop = messages.scrollHeight;
      }

      function startListening() {
        if (state.unsubscribe) state.unsubscribe();
        messages.innerHTML = '<div class="nchat-empty">Cargando mensajes...</div>';
        var q = fs.query(fs.collection(db, roomPath()), fs.orderBy('createdAt', 'asc'), fs.limit(80));
        state.unsubscribe = fs.onSnapshot(q, function (snapshot) {
          var items = [];
          snapshot.forEach(function (doc) { var data = doc.data(); data.id = doc.id; items.push(data); });
          renderMessages(items);
        }, function (error) {
          messages.innerHTML = '<div class="nchat-empty">No se pudieron cargar mensajes. Revisa reglas de Firestore para salas oficiales.</div>';
          console.error('NostraCHAT Firestore error:', error);
        });
      }

      zoneButtons.forEach(function (btn) { btn.addEventListener('click', function () { setZone(btn.dataset.zone); }); });
      roomGrid.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.nchat-room') : null;
        if (btn) setRoom(btn.dataset.roomId);
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        hideWarning();
        var name = cleanText(nameInput.value);
        var extra = cleanText(extraInput.value);
        if (name.length < 3) return showWarning('Escribe tu nombre y apellido.');
        if (extra.length < 3) return showWarning(state.zone === 'alumnos' ? 'Escribe tu ciclo o código de alumno.' : 'Escribe tu WhatsApp o motivo de consulta.');
        if (!rulesInput.checked) return showWarning('Debes aceptar las reglas de uso.');
        if (containsBadWords(name) || containsBadWords(extra)) return showWarning('Revisa tus datos. No se permiten palabras ofensivas.');
        state.user = { name: name, extra: extra, zone: state.zone };
        localStorage.setItem('nostrachat_user', JSON.stringify(state.user));
        enableChat();
        startListening();
      });

      function sendMessage() {
        if (!state.user) return showWarning('Primero debes ingresar al chat.');
        var now = Date.now();
        if (now - state.lastSendAt < 3500) return showWarning('Espera unos segundos antes de enviar otro mensaje.');
        var text = cleanText(messageInput.value);
        if (!text) return;
        if (text.length > maxMessageLength) return showWarning('El mensaje es demasiado largo.');
        if (containsBadWords(text)) return showWarning('Tu mensaje contiene palabras no permitidas.');
        if (containsBlockedPattern(text)) return showWarning('Por seguridad, NostraCHAT no permite enlaces externos por ahora.');
        if (looksLikeSpam(text)) return showWarning('El sistema detectó posible spam. Escribe tu consulta con más claridad.');
        if (state.lastMessageText && state.lastMessageText === text.toLowerCase()) return showWarning('No envíes el mismo mensaje repetido.');
        state.lastSendAt = now;
        state.lastMessageText = text.toLowerCase();
        sendBtn.disabled = true;
        fs.addDoc(fs.collection(db, roomPath()), {
          text: text,
          name: state.user.name,
          extra: state.user.extra,
          zone: state.zone,
          roomId: state.roomId,
          roomLabel: getRoomLabel(state.roomId),
          sessionId: state.sessionId,
          type: 'message',
          moderationStatus: 'visible',
          createdAt: fs.serverTimestamp()
        }).then(function () {
          messageInput.value = '';
          hideWarning();
        }).catch(function (err) {
          showWarning('No se pudo enviar. Revisa reglas de Firestore para salas oficiales.');
          console.error(err);
        }).finally(function () {
          sendBtn.disabled = false;
          messageInput.focus();
        });
      }

      function reportMessage(messageId) {
        if (!state.user) return showWarning('Primero debes ingresar al chat.');
        if (!messageId || state.reportedIds[messageId]) return;
        var reason = window.prompt('¿Por qué reportas este mensaje? Ej: insulto, spam, contenido no académico');
        reason = cleanText(reason || 'Reporte del usuario');
        if (reason.length < 3) reason = 'Reporte del usuario';
        fs.addDoc(fs.collection(db, reportsPath()), {
          messageId: messageId,
          room: state.zone,
          roomId: state.roomId,
          roomLabel: getRoomLabel(state.roomId),
          reportedBy: state.user.name,
          reporterExtra: state.user.extra,
          reporterSessionId: state.sessionId,
          reason: reason.slice(0, 180),
          status: 'pendiente',
          createdAt: fs.serverTimestamp()
        }).then(function () {
          state.reportedIds[messageId] = true;
          localStorage.setItem('nostrachat_reported_ids', JSON.stringify(state.reportedIds));
          startListening();
          showWarning('Reporte enviado. Coordinación podrá revisarlo.');
        }).catch(function (err) {
          showWarning('No se pudo enviar el reporte. Revisa las reglas de Firestore.');
          console.error(err);
        });
      }

      messages.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-report-id]') : null;
        if (btn) reportMessage(btn.getAttribute('data-report-id'));
      });

      sendBtn.addEventListener('click', sendMessage);
      messageInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });

      updateRoomButtons();
      updateTitle();
      try {
        var saved = JSON.parse(localStorage.getItem('nostrachat_user') || 'null');
        if (saved && saved.name && saved.extra) {
          state.user = saved;
          if (saved.zone && officialRooms[saved.zone]) setZone(saved.zone);
          nameInput.value = saved.name;
          extraInput.value = saved.extra;
          rulesInput.checked = true;
          enableChat();
          startListening();
        }
      } catch (e) {}
    }).catch(function (err) {
      showWarning('No se pudo cargar Firebase. Revisa tu conexión.');
      console.error(err);
    });
  }

  function run() { injectStyles(); buildUI(); initChat(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
