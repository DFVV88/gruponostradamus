/* ==================================================
   NostraCHAT Admin v1.3
   Compatible con salas oficiales.
   Lee mensajes/reportes desde todas las subcolecciones oficiales.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var state = { view: 'alumnos', app: null, db: null, auth: null, unsubscribe: null, user: null, fs: null };

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

  function showPanelNotice(msg) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var notice = document.createElement('div');
    notice.className = 'admin-empty';
    notice.style.background = '#fff7e6';
    notice.style.border = '1px solid #ffe0ad';
    notice.style.borderRadius = '16px';
    notice.style.marginBottom = '12px';
    notice.textContent = msg;
    list.prepend(notice);
    setTimeout(function () { notice.remove(); }, 2800);
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

  function isReportView() {
    return state.view.indexOf('reports') === 0;
  }

  function currentZone() {
    return (state.view === 'alumnos' || state.view === 'reports-alumnos') ? 'alumnos' : 'externos';
  }

  function sortDocsByDateDesc(docs) {
    return docs.sort(function (a, b) {
      var ad = a.data().createdAt && a.data().createdAt.toMillis ? a.data().createdAt.toMillis() : 0;
      var bd = b.data().createdAt && b.data().createdAt.toMillis ? b.data().createdAt.toMillis() : 0;
      return bd - ad;
    });
  }

  function renderMessages(snapshot) {
    var list = document.getElementById('admin-list');
    if (!list) return;

    var docs = sortDocsByDateDesc(snapshot.docs || []);
    if (!docs.length) {
      list.innerHTML = '<div class="admin-empty">No hay registros en esta vista.</div>';
      return;
    }

    var html = '';
    docs.forEach(function (docSnap) {
      var d = docSnap.data();
      var isReport = isReportView();
      var status = d.status || d.moderationStatus || 'visible';
      var itemPath = docSnap.ref.path;
      var roomLabel = d.roomLabel || d.roomId || 'Sala';

      html += '<article class="admin-item" data-item-path="' + escapeHTML(itemPath) + '">' +
        '<div class="admin-meta">' +
          '<span><b>ID:</b> ' + escapeHTML(docSnap.id) + '</span>' +
          '<span>' + escapeHTML(formatDate(d.createdAt)) + '</span>' +
        '</div>' +
        '<div>' +
          '<span class="admin-badge' + (isReport ? ' report' : '') + '">' + (isReport ? 'REPORTE' : escapeHTML(d.zone || 'mensaje')) + '</span> ' +
          '<span class="admin-badge">' + escapeHTML(roomLabel) + '</span> ' +
          '<span class="admin-badge">' + escapeHTML(status) + '</span>' +
        '</div>' +
        (isReport
          ? '<div class="admin-text"><b>Mensaje reportado:</b> ' + escapeHTML(d.messageId || '') + '<br><b>Sala:</b> ' + escapeHTML(roomLabel) + '<br><b>Motivo:</b> ' + escapeHTML(d.reason || '') + '<br><b>Reportado por:</b> ' + escapeHTML(d.reportedBy || '') + '<br><b>Dato:</b> ' + escapeHTML(d.reporterExtra || '') + '</div>'
          : '<div class="admin-text"><b>' + escapeHTML(d.name || '') + '</b><br><small>' + escapeHTML(d.extra || '') + '</small><br><small>Sala: ' + escapeHTML(roomLabel) + '</small><br><br>' + escapeHTML(d.text || '') + '</div>') +
        '<div class="admin-actions">' +
          '<button class="admin-btn small" type="button" data-admin-action="review" data-item-path="' + escapeHTML(itemPath) + '">' + (isReport ? 'Marcar reporte revisado' : 'Marcar revisado') + '</button>' +
          '<button class="admin-btn small danger" type="button" data-admin-action="delete" data-item-path="' + escapeHTML(itemPath) + '">' + (isReport ? 'Eliminar reporte' : 'Eliminar mensaje') + '</button>' +
        '</div>' +
      '</article>';
    });
    list.innerHTML = html;
  }

  function loadView(fs) {
    if (state.unsubscribe) state.unsubscribe();
    setActiveTab();
    var list = document.getElementById('admin-list');
    if (list) list.innerHTML = '<div class="admin-empty">Cargando registros de salas oficiales...</div>';

    var zone = currentZone();
    var collectionName = isReportView() ? 'reports' : 'messages';
    var field = isReportView() ? 'room' : 'zone';

    var q = fs.query(
      fs.collectionGroup(state.db, collectionName),
      fs.where(field, '==', zone),
      fs.limit(100)
    );

    state.unsubscribe = fs.onSnapshot(q, renderMessages, function (err) {
      if (list) list.innerHTML = '<div class="admin-empty">No se pudo cargar. Revisa reglas de Firebase o índices de Firestore.</div>';
      console.error(err);
    });
  }

  function reviewItem(itemPath) {
    if (!state.fs || !state.db || !itemPath) return;
    var fs = state.fs;
    var data = isReportView()
      ? { status: 'revisado', reviewedAt: fs.serverTimestamp(), reviewedBy: state.user.email || 'admin' }
      : { moderationStatus: 'revisado', reviewedAt: fs.serverTimestamp(), reviewedBy: state.user.email || 'admin' };

    fs.updateDoc(fs.doc(state.db, itemPath), data).then(function () {
      showPanelNotice('Marcado como revisado.');
    }).catch(function (err) {
      showPanelNotice('No se pudo marcar como revisado. Revisa reglas de Firebase.');
      console.error(err);
    });
  }

  function deleteItem(itemPath) {
    if (!state.fs || !state.db || !itemPath) return;
    var label = isReportView() ? 'este reporte' : 'este mensaje';
    if (!window.confirm('¿Seguro que deseas eliminar ' + label + '? Esta acción no se puede deshacer.')) return;

    state.fs.deleteDoc(state.fs.doc(state.db, itemPath)).then(function () {
      showPanelNotice('Elemento eliminado correctamente.');
    }).catch(function (err) {
      showPanelNotice('No se pudo eliminar. Revisa reglas de Firebase.');
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
      state.fs = fs;
      state.app = appMod.initializeApp(firebaseConfig);
      state.db = fs.getFirestore(state.app);
      state.auth = authMod.getAuth(state.app);

      var loginForm = document.getElementById('admin-login');
      var panel = document.getElementById('admin-panel');
      var logoutBtn = document.getElementById('admin-logout');
      var googleBtn = document.getElementById('admin-google-login');
      var list = document.getElementById('admin-list');

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

      if (list) {
        list.addEventListener('click', function (e) {
          var btn = e.target && e.target.closest ? e.target.closest('[data-admin-action]') : null;
          if (!btn) return;
          var action = btn.getAttribute('data-admin-action');
          var itemPath = btn.getAttribute('data-item-path');
          if (action === 'review') reviewItem(itemPath);
          if (action === 'delete') deleteItem(itemPath);
        });
      }

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
