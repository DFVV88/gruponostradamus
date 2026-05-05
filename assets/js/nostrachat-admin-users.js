/* ==================================================
   NostraCHAT Admin - Usuarios institucionales v1
   Permite aprobar, bloquear y rechazar cuentas creadas.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
  var app, db, auth, fs, authMod;
  var unsub = null;

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }

  function formatDate(value) {
    try {
      var d = value && value.toDate ? value.toDate() : null;
      return d ? d.toLocaleString('es-PE') : '';
    } catch (e) { return ''; }
  }

  function notice(msg) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var n = document.createElement('div');
    n.className = 'admin-empty';
    n.style.background = '#fff7e6';
    n.style.border = '1px solid #ffe0ad';
    n.style.borderRadius = '16px';
    n.style.marginBottom = '12px';
    n.textContent = msg;
    list.prepend(n);
    setTimeout(function () { n.remove(); }, 2500);
  }

  function injectTab() {
    var tabs = document.querySelector('.admin-tabs');
    if (!tabs || document.querySelector('[data-view="users"]')) return false;
    var btn = document.createElement('button');
    btn.className = 'admin-tab';
    btn.type = 'button';
    btn.dataset.view = 'users';
    btn.textContent = 'Usuarios';
    tabs.appendChild(btn);
    btn.addEventListener('click', function () {
      document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadUsers();
    });
    return true;
  }

  function stop() {
    if (unsub) {
      try { unsub(); } catch (e) {}
      unsub = null;
    }
  }

  function roleLabel(role) {
    return role === 'teacher' ? 'Docente' : 'Alumno';
  }

  function statusLabel(status, blocked) {
    if (blocked) return 'blocked';
    return status || 'pending';
  }

  function renderUsers(snapshot) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var items = [];
    snapshot.forEach(function (doc) {
      var d = doc.data();
      d.id = doc.id;
      items.push(d);
    });

    items.sort(function (a, b) {
      var av = a.status === 'pending' ? 0 : 1;
      var bv = b.status === 'pending' ? 0 : 1;
      if (av !== bv) return av - bv;
      var at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      var bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return bt - at;
    });

    if (!items.length) {
      list.innerHTML = '<div class="admin-empty">Aún no hay usuarios registrados.</div>';
      return;
    }

    list.innerHTML = items.map(function (u) {
      var status = statusLabel(u.status, u.blocked);
      return '<article class="admin-item" data-user-id="' + escapeHTML(u.id) + '">' +
        '<div class="admin-meta"><span><b>Usuario:</b> ' + escapeHTML(u.username || '') + '</span><span>' + escapeHTML(formatDate(u.createdAt)) + '</span></div>' +
        '<div><span class="admin-badge">' + escapeHTML(roleLabel(u.role)) + '</span> <span class="admin-badge">' + escapeHTML(status) + '</span></div>' +
        '<div class="admin-text"><b>' + escapeHTML(u.name || '') + '</b><br>' +
        '<small>Correo Microsoft: ' + escapeHTML(u.institutionalEmail || '') + '</small><br>' +
        '<small>Detalle: ' + escapeHTML(u.detail || '') + '</small><br>' +
        '<small>Auth interno: ' + escapeHTML(u.authEmail || '') + '</small></div>' +
        '<div class="admin-actions">' +
          '<button class="admin-btn small" type="button" data-user-action="active" data-user-id="' + escapeHTML(u.id) + '">Aprobar</button>' +
          '<button class="admin-btn small" type="button" data-user-action="pending" data-user-id="' + escapeHTML(u.id) + '">Pendiente</button>' +
          '<button class="admin-btn small danger" type="button" data-user-action="blocked" data-user-id="' + escapeHTML(u.id) + '">Bloquear</button>' +
          '<button class="admin-btn small danger" type="button" data-user-action="rejected" data-user-id="' + escapeHTML(u.id) + '">Rechazar</button>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function loadUsers() {
    stop();
    var list = document.getElementById('admin-list');
    if (list) list.innerHTML = '<div class="admin-empty">Cargando usuarios institucionales...</div>';
    var q = fs.query(fs.collection(db, 'users'), fs.limit(200));
    unsub = fs.onSnapshot(q, renderUsers, function (err) {
      console.error(err);
      if (list) list.innerHTML = '<div class="admin-empty">No se pudieron cargar usuarios. Revisa reglas de Firestore.</div>';
    });
  }

  function updateUser(userId, action) {
    if (!userId || !action) return;
    var user = auth.currentUser;
    var email = user && user.email ? user.email : '';
    var data = {
      status: action,
      blocked: action === 'blocked',
      reviewedAt: fs.serverTimestamp(),
      reviewedBy: email
    };
    if (action === 'active') data.approvedAt = fs.serverTimestamp();
    fs.updateDoc(fs.doc(db, 'users/' + userId), data).then(function () {
      notice('Usuario actualizado: ' + action);
    }).catch(function (err) {
      console.error(err);
      notice('No se pudo actualizar el usuario. Revisa reglas de Firestore.');
    });
  }

  function bindListActions() {
    var list = document.getElementById('admin-list');
    if (!list || list.dataset.usersBound === '1') return;
    list.dataset.usersBound = '1';
    list.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-user-action]') : null;
      if (!btn) return;
      updateUser(btn.getAttribute('data-user-id'), btn.getAttribute('data-user-action'));
    });
  }

  function initFirebase() {
    return Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js')
    ]).then(function (mods) {
      var appMod = mods[0]; fs = mods[1]; authMod = mods[2];
      app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      db = fs.getFirestore(app);
      auth = authMod.getAuth(app);
    });
  }

  function run() {
    if (!firebaseConfig) return;
    initFirebase().then(function () {
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (injectTab()) {
          bindListActions();
          clearInterval(timer);
        }
        if (tries > 60) clearInterval(timer);
      }, 250);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
