/* ==================================================
   NostraCHAT Admin - Usuarios institucionales v2
   Consulta bajo demanda, sin listener permanente.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
  var app, db, auth, fs, authMod;
  var loading = false;

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }
  function formatDate(value) {
    try { var d = value && value.toDate ? value.toDate() : null; return d ? d.toLocaleString('es-PE') : ''; }
    catch (e) { return ''; }
  }
  function notice(msg) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var n = document.createElement('div');
    n.className = 'admin-empty';
    n.style.cssText = 'background:#fff7e6;border:1px solid #ffe0ad;border-radius:16px;margin-bottom:12px';
    n.textContent = msg; list.prepend(n);
    setTimeout(function () { n.remove(); }, 2500);
  }
  function roleLabel(role) { return role === 'teacher' ? 'Docente' : 'Alumno'; }
  function statusLabel(status, blocked) { return blocked ? 'blocked' : (status || 'pending'); }

  function injectTab() {
    var tabs = document.querySelector('.admin-tabs');
    if (!tabs || document.querySelector('[data-view="users"]')) return false;
    var btn = document.createElement('button');
    btn.className = 'admin-tab'; btn.type = 'button'; btn.dataset.view = 'users'; btn.textContent = 'Usuarios';
    tabs.appendChild(btn);
    btn.addEventListener('click', function () {
      document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active'); loadUsers();
    });
    return true;
  }

  function renderUsers(snapshot) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var items = [];
    snapshot.forEach(function (doc) { var data = doc.data(); data.id = doc.id; items.push(data); });
    items.sort(function (a, b) {
      var av = a.status === 'pending' ? 0 : 1, bv = b.status === 'pending' ? 0 : 1;
      if (av !== bv) return av - bv;
      var at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      var bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return bt - at;
    });
    if (!items.length) { list.innerHTML = '<div class="admin-empty">Aún no hay usuarios registrados.</div>'; return; }
    list.innerHTML = items.map(function (u) {
      var status = statusLabel(u.status, u.blocked);
      return '<article class="admin-item" data-user-id="' + escapeHTML(u.id) + '">' +
        '<div class="admin-meta"><span><b>Usuario:</b> ' + escapeHTML(u.username || '') + '</span><span>' + escapeHTML(formatDate(u.createdAt)) + '</span></div>' +
        '<div><span class="admin-badge">' + escapeHTML(roleLabel(u.role)) + '</span> <span class="admin-badge">' + escapeHTML(status) + '</span></div>' +
        '<div class="admin-text"><b>' + escapeHTML(u.name || '') + '</b><br><small>Correo Microsoft: ' + escapeHTML(u.institutionalEmail || '') + '</small><br><small>Detalle: ' + escapeHTML(u.detail || '') + '</small><br><small>Auth interno: ' + escapeHTML(u.authEmail || '') + '</small></div>' +
        '<div class="admin-actions"><button class="admin-btn small" type="button" data-user-action="active" data-user-id="' + escapeHTML(u.id) + '">Aprobar</button><button class="admin-btn small" type="button" data-user-action="pending" data-user-id="' + escapeHTML(u.id) + '">Pendiente</button><button class="admin-btn small danger" type="button" data-user-action="blocked" data-user-id="' + escapeHTML(u.id) + '">Bloquear</button><button class="admin-btn small danger" type="button" data-user-action="rejected" data-user-id="' + escapeHTML(u.id) + '">Rechazar</button></div></article>';
    }).join('');
  }

  function loadUsers() {
    if (!fs || !db || loading) return Promise.resolve();
    loading = true;
    var list = document.getElementById('admin-list');
    if (list) list.innerHTML = '<div class="admin-empty">Cargando usuarios institucionales...</div>';
    var q = fs.query(fs.collection(db, 'users'), fs.limit(100));
    return fs.getDocs(q).then(renderUsers).catch(function (error) {
      console.error(error);
      if (list) list.innerHTML = '<div class="admin-empty">No se pudieron cargar usuarios. Revisa reglas de Firestore.</div>';
    }).finally(function () { loading = false; });
  }

  function updateUser(userId, action) {
    if (!userId || !action) return;
    var current = auth.currentUser;
    var email = current && current.email ? current.email : '';
    if (email !== ADMIN_EMAIL) return notice('Esta acción requiere la cuenta administradora.');
    var data = { status: action, blocked: action === 'blocked', reviewedAt: fs.serverTimestamp(), reviewedBy: email };
    if (action === 'active') data.approvedAt = fs.serverTimestamp();
    fs.updateDoc(fs.doc(db, 'users/' + userId), data).then(function () {
      notice('Usuario actualizado: ' + action); return loadUsers();
    }).catch(function (error) { console.error(error); notice('No se pudo actualizar el usuario.'); });
  }

  function bindListActions() {
    var list = document.getElementById('admin-list');
    if (!list || list.dataset.usersBound === '1') return;
    list.dataset.usersBound = '1';
    list.addEventListener('click', function (event) {
      var btn = event.target && event.target.closest ? event.target.closest('[data-user-action]') : null;
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
      db = fs.getFirestore(app); auth = authMod.getAuth(app);
    });
  }

  function run() {
    if (!firebaseConfig) return;
    initFirebase().then(function () {
      bindListActions();
      var tries = 0;
      var timer = setInterval(function () {
        tries += 1;
        if (injectTab() || tries > 60) clearInterval(timer);
      }, 250);
    }).catch(function (error) { console.error('NostraCHAT users init:', error); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();