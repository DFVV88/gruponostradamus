/* ==================================================
   NostraCHAT - Usuarios conectados
   Muestra una columna lateral con presencia por sala.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var app = null;
  var db = null;
  var fs = null;
  var unsubscribePresence = null;
  var heartbeatTimer = null;
  var currentRoomId = '';
  var sessionId = localStorage.getItem('nostrachat_session_id') || ('nc_' + Date.now() + '_' + Math.random().toString(36).slice(2));
  localStorage.setItem('nostrachat_session_id', sessionId);

  function cleanText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'\"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c] || c;
    });
  }

  function getSavedUser() {
    try { return JSON.parse(localStorage.getItem('nostrachat_user') || 'null'); }
    catch (e) { return null; }
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

  function injectStyles() {
    if (document.getElementById('nostrachat-online-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-online-style';
    style.textContent = '\
      @media(min-width:992px){.nchat-shell{grid-template-columns:320px minmax(0,1fr) 260px!important;align-items:stretch;}}\
      .nchat-online-card{padding:18px;display:flex;flex-direction:column;min-height:650px;}\
      .nchat-online-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;}\
      .nchat-online-head h3{margin:0;color:#061426;font-size:22px;font-weight:950;}\
      .nchat-online-count{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;border-radius:999px;background:linear-gradient(135deg,#078c95,#061426);color:#fff;font-weight:950;font-size:13px;}\
      .nchat-online-sub{font-size:12px;color:#687789;line-height:1.35;margin-bottom:12px;font-weight:800;}\
      .nchat-online-list{display:flex;flex-direction:column;gap:9px;overflow:auto;max-height:560px;padding-right:3px;}\
      .nchat-online-item{border:1px solid rgba(7,140,149,.15);background:#f9fdff;border-radius:16px;padding:10px 11px;}\
      .nchat-online-name{display:flex;align-items:center;gap:7px;font-weight:950;color:#061426;font-size:14px;line-height:1.2;}\
      .nchat-online-dot{width:9px;height:9px;border-radius:999px;background:#13c45e;box-shadow:0 0 0 4px rgba(19,196,94,.12);flex:0 0 auto;}\
      .nchat-online-extra{font-size:12px;color:#617184;margin-top:5px;line-height:1.25;}\
      .nchat-online-empty{font-size:13px;color:#69788a;line-height:1.4;font-weight:800;padding:18px 4px;text-align:center;}\
      @media(max-width:991px){.nchat-online-card{min-height:auto}.nchat-online-list{max-height:220px}.nchat-online-card{order:3}}\
    ';
    document.head.appendChild(style);
  }

  function ensurePanel() {
    var shell = document.querySelector('.nchat-shell');
    if (!shell) return null;
    var panel = document.getElementById('nchat-online-panel');
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = 'nchat-online-panel';
    panel.className = 'nchat-card nchat-online-card';
    panel.innerHTML = '<div class="nchat-online-head"><h3>Conectados</h3><span class="nchat-online-count" id="nchat-online-count">0</span></div><div class="nchat-online-sub" id="nchat-online-sub">Personas activas en esta sala.</div><div class="nchat-online-list" id="nchat-online-list"><div class="nchat-online-empty">Ingresa al chat para ver usuarios conectados.</div></div>';
    shell.appendChild(panel);
    return panel;
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

  function presencePath(roomId) {
    return 'rooms/' + roomId + '/presence';
  }

  function writePresence() {
    var user = getSavedUser();
    var roomId = getActiveRoomId();
    if (!user || !user.name || !db || !fs || !roomId) return;
    return fs.setDoc(fs.doc(db, presencePath(roomId), sessionId), {
      name: String(user.name || '').slice(0, 60),
      extra: String(user.extra || '').slice(0, 80),
      zone: getActiveZone(),
      roomId: roomId,
      roomLabel: getRoomLabel(),
      sessionId: sessionId,
      lastSeen: fs.serverTimestamp()
    }, { merge: true }).catch(function (err) {
      console.warn('NostraCHAT presence write:', err);
    });
  }

  function renderPresence(items) {
    var list = document.getElementById('nchat-online-list');
    var count = document.getElementById('nchat-online-count');
    var sub = document.getElementById('nchat-online-sub');
    if (!list || !count) return;

    var now = Date.now();
    var active = items.filter(function (u) {
      var d = u.lastSeen && u.lastSeen.toDate ? u.lastSeen.toDate() : null;
      return d && (now - d.getTime()) <= 90000;
    });

    var unique = {};
    active.forEach(function (u) {
      var key = cleanText(u.name).toLowerCase() + '|' + cleanText(u.extra).toLowerCase();
      if (!unique[key]) unique[key] = u;
    });
    active = Object.keys(unique).map(function (k) { return unique[k]; });

    count.textContent = String(active.length);
    if (sub) sub.textContent = 'Activos en ' + getRoomLabel() + '.';

    if (!active.length) {
      list.innerHTML = '<div class="nchat-online-empty">Todavía no hay personas activas en esta sala.</div>';
      return;
    }

    list.innerHTML = active.map(function (u) {
      return '<div class="nchat-online-item"><div class="nchat-online-name"><span class="nchat-online-dot"></span><span>' + escapeHTML(u.name || 'Usuario') + '</span></div><div class="nchat-online-extra">' + escapeHTML(u.extra || 'Sin dato adicional') + '</div></div>';
    }).join('');
  }

  function listenPresence() {
    var roomId = getActiveRoomId();
    if (!roomId || !db || !fs) return;
    if (roomId === currentRoomId && unsubscribePresence) return;
    currentRoomId = roomId;
    if (unsubscribePresence) {
      try { unsubscribePresence(); } catch (e) {}
      unsubscribePresence = null;
    }
    var q = fs.query(fs.collection(db, presencePath(roomId)), fs.orderBy('lastSeen', 'desc'), fs.limit(80));
    unsubscribePresence = fs.onSnapshot(q, function (snapshot) {
      var items = [];
      snapshot.forEach(function (doc) {
        var data = doc.data();
        if (data) items.push(data);
      });
      renderPresence(items);
    }, function (err) {
      console.warn('NostraCHAT presence read:', err);
      var list = document.getElementById('nchat-online-list');
      if (list) list.innerHTML = '<div class="nchat-online-empty">Falta activar reglas de presencia en Firestore.</div>';
    });
  }

  function start() {
    injectStyles();
    ensurePanel();
    ensureFirebase().then(function () {
      writePresence();
      listenPresence();
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(function () {
        ensurePanel();
        writePresence();
        listenPresence();
      }, 15000);
    }).catch(function (err) {
      console.warn('NostraCHAT online init:', err);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
