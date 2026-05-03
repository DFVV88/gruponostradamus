/* ==================================================
   NostraCHAT Admin v1.1
   Login con Google + lectura de mensajes/reportes.
   Seguridad real: Firebase Auth + reglas por email/dominio.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var state = { view: 'alumnos', app: null, db: null, auth: null, unsubscribe: null, user: null };

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }

  function showWarning(msg) {
    var el = document.getElementById('admin-warning');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }

  function hideWarning() {
    var el = document.getElementById('admin-warning');
    if (el) el.classList.remove('show');
  }

  function formatDate(value) {
    try {
      var d = value && value.toDate ? value.toDate() : null;
      return d ? d.toLocaleString('es-PE') : '';
    } catch (e) { return ''; }
  }

  function setActiveTab() {
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.view === state.view);
    });
  }

  function collectionPath() {
    if (state.view === 'alumnos') return 'rooms/alumnos/messages';
    if (state.view === 'externos') return 'rooms/externos/messages';
    if (state.view === 'reports-alumnos') return 'rooms/alumnos/reports';
    return 'rooms/externos/reports';
  }

  function renderMessages(snapshot) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    if (snapshot.empty) {
      list.innerHTML = '<div class="admin-empty">No hay registros en esta vista.</div>';
      return;
    }
    var html = '';
    snapshot.forEach(function (doc) {
      var d = doc.data();
      var isReport = state.view.indexOf('reports') === 0;
      html += '<article class="admin-item">' +
        '<div class="admin-meta">' +
          '<span><b>ID:</b> ' + escapeHTML(doc.id) + '</span>' +
          '<span>' + escapeHTML(formatDate(d.createdAt)) + '</span>' +
        '</div>' +
        '<div>' +
          '<span class="admin-badge' + (isReport ? ' report' : '') + '">' + (isReport ? 'REPORTE' : escapeHTML(d.zone || 'mensaje')) + '</span>' +
        '</div>' +
        (isReport
          ? '<div class="admin-text"><b>Mensaje reportado:</b> ' + escapeHTML(d.messageId || '') + '<br><b>Motivo:</b> ' + escapeHTML(d.reason || '') + '<br><b>Reportado por:</b> ' + escapeHTML(d.reportedBy || '') + '<br><b>Dato:</b> ' + escapeHTML(d.reporterExtra || '') + '</div>'
          : '<div class="admin-text"><b>' + escapeHTML(d.name || '') + '</b><br><small>' + escapeHTML(d.extra || '') + '</small><br><br>' + escapeHTML(d.text || '') + '</div>') +
        '<div class="admin-actions">' +
          '<button class="admin-btn small" type="button" disabled>Revisado próximamente</button>' +
          '<button class="admin-btn small danger" type="button" disabled>Eliminar próximamente</button>' +
        '</div>' +
      '</article>';
    });
    list.innerHTML = html;
  }

  function loadView(fs) {
    if (state.unsubscribe) state.unsubscribe();
    setActiveTab();
    var list = document.getElementById('admin-list');
    if (list) list.innerHTML = '<div class="admin-empty">Cargando...</div>';
    var q = fs.query(fs.collection(state.db, collectionPath()), fs.orderBy('createdAt', 'desc'), fs.limit(100));
    state.unsubscribe = fs.onSnapshot(q, renderMessages, function (err) {
      if (list) list.innerHTML = '<div class="admin-empty">No se pudo cargar. Revisa que tu correo tenga permiso en las reglas de Firebase.</div>';
      console.error(err);
    });
  }

  function init() {
    if (!firebaseConfig) {
      showWarning('Falta configuración Firebase.');
      return;
    }

    Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js')
    ]).then(function (mods) {
      var appMod = mods[0];
      var fs = mods[1];
      var authMod = mods[2];
      state.app = appMod.initializeApp(firebaseConfig);
      state.db = fs.getFirestore(state.app);
      state.auth = authMod.getAuth(state.app);

      var loginForm = document.getElementById('admin-login');
      var panel = document.getElementById('admin-panel');
      var logoutBtn = document.getElementById('admin-logout');
      var googleBtn = document.getElementById('admin-google-login');

      googleBtn.addEventListener('click', function () {
        hideWarning();
        var provider = new authMod.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        authMod.signInWithPopup(state.auth, provider).catch(function (err) {
          showWarning('No se pudo ingresar con Google. Revisa que Google esté habilitado en Authentication.');
          console.error(err);
        });
      });

      logoutBtn.addEventListener('click', function () {
        authMod.signOut(state.auth);
      });

      document.querySelectorAll('.admin-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.view = btn.dataset.view;
          loadView(fs);
        });
      });

      authMod.onAuthStateChanged(state.auth, function (user) {
        state.user = user;
        if (user) {
          loginForm.style.display = 'none';
          panel.classList.add('show');
          var info = document.getElementById('admin-user-info');
          if (info) info.textContent = 'Sesión iniciada como: ' + (user.email || user.displayName || 'Administrador');
          loadView(fs);
        } else {
          if (state.unsubscribe) state.unsubscribe();
          loginForm.style.display = 'block';
          panel.classList.remove('show');
        }
      });
    }).catch(function (err) {
      showWarning('No se pudo cargar Firebase Auth.');
      console.error(err);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
