/* ==================================================
   NostraCHAT DAMUS Vision
   Botón para pedir posible solución de ejercicios con imagen.
   No expone API keys. Usa endpoint seguro si existe.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var ENDPOINT = window.NOSTRA_DAMUS_VISION_ENDPOINT || '';
  var DAMUS_DAILY_LIMIT = 5;
  var app = null;
  var db = null;
  var fs = null;
  var imageCache = {};
  var currentRoomId = '';
  var unsubscribe = null;
  var working = {};

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'\"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c] || c;
    });
  }

  function cleanText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function getSavedUser() {
    try { return JSON.parse(localStorage.getItem('nostrachat_user') || 'null'); }
    catch (e) { return null; }
  }

  function getSessionId() {
    var id = localStorage.getItem('nostrachat_session_id');
    if (!id) {
      id = 'nc_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      localStorage.setItem('nostrachat_session_id', id);
    }
    return id;
  }

  function getActiveRoomId() {
    var btn = document.querySelector('.nchat-room.active');
    return btn ? btn.getAttribute('data-room-id') : 'alumnos-general';
  }

  function getActiveZone() {
    var btn = document.querySelector('.nchat-zone.active');
    return btn ? btn.getAttribute('data-zone') : 'alumnos';
  }

  function getRoomLabel() {
    var btn = document.querySelector('.nchat-room.active span');
    return btn ? cleanText(btn.textContent.replace(/^[^\wÁÉÍÓÚáéíóúÑñ]+/, '')) : 'General';
  }

  function isAllowedContext() {
    var roomId = getActiveRoomId();
    return getActiveZone() === 'alumnos' && roomId.indexOf('alumnos-') === 0;
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dailyCount() {
    try {
      var data = JSON.parse(localStorage.getItem('nostrachat_damus_vision_daily_count') || '{}');
      return data.date === todayKey() ? Number(data.count || 0) : 0;
    } catch (e) { return 0; }
  }

  function increaseDailyCount() {
    localStorage.setItem('nostrachat_damus_vision_daily_count', JSON.stringify({ date: todayKey(), count: dailyCount() + 1 }));
  }

  function showNotice(message, type) {
    var host = document.getElementById('nchat-image-notice');
    if (!host) return alert(message);
    host.textContent = message;
    host.className = 'nchat-image-notice show ' + (type || 'info');
    setTimeout(function () { host.className = 'nchat-image-notice'; }, 6500);
  }

  function ensureFirebase() {
    if (db && fs) return Promise.resolve();
    if (!firebaseConfig) return Promise.reject(new Error('Falta configuración Firebase.'));
    return Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function (mods) {
      var appMod = mods[0];
      fs = mods[1];
      app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      db = fs.getFirestore(app);
    });
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-damus-vision-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-damus-vision-style';
    style.textContent = '\
      .nchat-damus-vision{margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;}\
      .nchat-damus-btn{border:0;border-radius:999px;padding:7px 10px;background:linear-gradient(135deg,#ff941e,#078c95,#061426);color:#fff;font-size:11px;font-weight:950;cursor:pointer;box-shadow:0 8px 18px rgba(6,20,38,.12);}\
      .nchat-damus-btn:disabled{opacity:.58;cursor:not-allowed;}\
      .nchat-damus-mini{font-size:11px;font-weight:850;opacity:.72;}\
      .nchat-msg.other .nchat-text{white-space:pre-wrap;}\
      .nchat-msg.other .nchat-text strong{font-weight:950;color:#061426;}\
      .nchat-damus-answer{white-space:pre-wrap;}\
    ';
    document.head.appendChild(style);
  }

  function formatDamusMessages() {
    document.querySelectorAll('.nchat-msg.other .nchat-text').forEach(function (el) {
      var text = el.textContent || '';
      if (text.indexOf('DAMUS Académico') === -1 && text.indexOf('📌 Tema probable') === -1) return;
      if (el.getAttribute('data-damus-formatted') === '1') return;

      var cleaned = text
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .replace(/\s*(📌 Tema probable:)/g, '\n\n$1')
        .replace(/\s*(🧠 Datos o condición clave:)/g, '\n\n$1')
        .replace(/\s*(✏️ Desarrollo paso a paso:)/g, '\n\n$1')
        .replace(/\s*(✅ Posible respuesta final:)/g, '\n\n$1')
        .replace(/\s*(🔑 Posible clave:)/g, '\n\n$1')
        .replace(/\s*(⚠️ Verificación:)/g, '\n\n$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      el.innerHTML = escapeHTML(cleaned)
        .replace(/(📌 Tema probable:)/g, '<strong>$1</strong>')
        .replace(/(🧠 Datos o condición clave:)/g, '<strong>$1</strong>')
        .replace(/(✏️ Desarrollo paso a paso:)/g, '<strong>$1</strong>')
        .replace(/(✅ Posible respuesta final:)/g, '<strong>$1</strong>')
        .replace(/(🔑 Posible clave:)/g, '<strong>$1</strong>')
        .replace(/(⚠️ Verificación:)/g, '<strong>$1</strong>');
      el.setAttribute('data-damus-formatted', '1');
    });
  }

  function listenImages() {
    var roomId = getActiveRoomId();
    if (!roomId || roomId === currentRoomId || !db || !fs) return;
    currentRoomId = roomId;
    imageCache = {};
    if (unsubscribe) {
      try { unsubscribe(); } catch (e) {}
      unsubscribe = null;
    }
    var q = fs.query(fs.collection(db, 'rooms/' + roomId + '/messages'), fs.orderBy('createdAt', 'asc'), fs.limit(80));
    unsubscribe = fs.onSnapshot(q, function (snapshot) {
      snapshot.forEach(function (doc) {
        var d = doc.data();
        if (d && d.hasImage && d.imageData) {
          d.id = doc.id;
          imageCache[doc.id] = d;
        }
      });
      enhanceButtons();
      formatDamusMessages();
    }, function (err) {
      console.warn('DAMUS Vision listener:', err);
    });
  }

  function enhanceButtons() {
    if (!isAllowedContext()) return;
    document.querySelectorAll('.nchat-report[data-report-id]').forEach(function (reportBtn) {
      var id = reportBtn.getAttribute('data-report-id');
      var data = imageCache[id];
      if (!data || !data.imageData) return;
      var msg = reportBtn.closest('.nchat-msg');
      if (!msg || msg.querySelector('.nchat-damus-vision')) return;
      var row = document.createElement('div');
      row.className = 'nchat-damus-vision';
      row.innerHTML = '<button class="nchat-damus-btn" type="button" data-damus-vision-id="' + escapeHTML(id) + '">🤖 Pedir posible solución a DAMUS</button><span class="nchat-damus-mini">Orientación IA, verificar con docente.</span>';
      var imageWrap = msg.querySelector('.nchat-image-wrap') || msg.querySelector('.nchat-actions');
      if (imageWrap) imageWrap.insertAdjacentElement('afterend', row);
    });
  }

  function buildPrompt(originalText) {
    return 'Eres DAMUS Académico, tutor del Grupo Nostradamus para postulantes UNI. Analiza la imagen del ejercicio. Da una POSIBLE solución educativa, no una respuesta absoluta. Si el enunciado no se lee bien, dilo claramente. Responde en español peruano académico con esta estructura:\n\n📌 Tema probable:\n🧠 Datos o condición clave:\n✏️ Desarrollo paso a paso:\n✅ Posible respuesta final:\n🔑 Posible clave:\n⚠️ Verificación:\n\nTexto escrito por el alumno: ' + (originalText || 'Sin texto adicional');
  }

  function callEndpoint(data) {
    if (!ENDPOINT) {
      return Promise.resolve({
        pending: true,
        answer: '🤖 DAMUS Académico\n\nLa imagen fue recibida, pero el motor de IA todavía no está conectado.\n\nPara que DAMUS dé una posible solución automática, falta conectar un endpoint seguro con Gemini u otra IA de visión.\n\nMientras tanto, un docente o moderador puede revisar esta imagen desde el panel admin.\n\n⚠️ Cuando esté conectado, DAMUS responderá como guía educativa, no como respuesta absoluta.'
      });
    }

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      redirect: 'follow'
    }).then(function (res) {
      if (!res.ok) throw new Error('Endpoint DAMUS respondió con estado ' + res.status + '.');
      return res.text();
    }).then(function (text) {
      var json = {};
      try { json = JSON.parse(text || '{}'); }
      catch (e) { throw new Error('Endpoint DAMUS no devolvió JSON válido.'); }
      if (json.ok === false) throw new Error(json.answer || json.error || 'DAMUS Endpoint devolvió error.');
      return { answer: json.answer || json.text || 'DAMUS no pudo generar una respuesta clara.' };
    }).catch(function (err) {
      var msg = err && err.message ? err.message : String(err || 'Error desconocido');
      if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
        msg = 'No se pudo conectar con Google Apps Script desde el navegador. Probable bloqueo CORS o endpoint no accesible.';
      }
      throw new Error(msg);
    });
  }

  function postDamusAnswer(answer, sourceMessageId) {
    var user = getSavedUser();
    var roomId = getActiveRoomId();
    return fs.addDoc(fs.collection(db, 'rooms/' + roomId + '/messages'), {
      text: String(answer || '').slice(0, 2400),
      name: 'DAMUS Académico 🤖',
      extra: 'Posible solución generada con IA · verificar con docente',
      zone: 'alumnos',
      roomId: roomId,
      roomLabel: getRoomLabel(),
      sessionId: 'damus_vision_' + getSessionId(),
      type: 'message',
      moderationStatus: 'visible',
      damusVision: true,
      sourceMessageId: sourceMessageId,
      requestedBy: user && user.name ? user.name : 'Alumno',
      createdAt: fs.serverTimestamp()
    });
  }

  function requestDamus(messageId, btn) {
    if (working[messageId]) return;
    if (!isAllowedContext()) return showNotice('DAMUS con imagen solo está disponible para alumnos en salas académicas.', 'error');
    if (dailyCount() >= DAMUS_DAILY_LIMIT) return showNotice('Llegaste al límite de ' + DAMUS_DAILY_LIMIT + ' solicitudes a DAMUS por día en este dispositivo.', 'error');
    var data = imageCache[messageId];
    if (!data || !data.imageData) return showNotice('No se encontró la imagen del ejercicio.', 'error');

    working[messageId] = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'DAMUS analizando...';
    }

    var payload = {
      messageId: messageId,
      roomId: getActiveRoomId(),
      roomLabel: getRoomLabel(),
      studentText: data.text || '',
      prompt: buildPrompt(data.text || ''),
      imageData: data.imageData,
      imageMime: data.imageMime || 'image/jpeg',
      imageSizeBytes: data.imageSizeBytes || 0,
      requestedAt: new Date().toISOString()
    };

    ensureFirebase().then(function () {
      return callEndpoint(payload);
    }).then(function (result) {
      increaseDailyCount();
      return postDamusAnswer(result.answer, messageId);
    }).then(function () {
      showNotice('DAMUS publicó una posible orientación en el chat.', 'info');
      if (btn) btn.textContent = '✅ Solicitud enviada a DAMUS';
    }).catch(function (err) {
      console.error(err);
      showNotice('No se pudo generar la respuesta de DAMUS: ' + (err && err.message ? err.message : 'error desconocido'), 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🤖 Pedir posible solución a DAMUS';
      }
    }).finally(function () {
      working[messageId] = false;
    });
  }

  function bindClicks() {
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-damus-vision-id]') : null;
      if (!btn) return;
      requestDamus(btn.getAttribute('data-damus-vision-id'), btn);
    }, true);
  }

  function run() {
    injectStyles();
    bindClicks();
    ensureFirebase().then(function () {
      setInterval(function () {
        listenImages();
        enhanceButtons();
        formatDamusMessages();
      }, 1200);
    }).catch(function (err) {
      console.warn('DAMUS Vision init:', err);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
