/* ==================================================
   NostraCHAT Admin v2.0 - consumo optimizado
   Carga bajo demanda, sin listeners permanentes por sala.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var state = { view: 'alumnos', app: null, db: null, auth: null, user: null, fs: null, docsByPath: {}, loading: false };
  var ROOM_LIMIT = 20;
  var officialRoomIds = {
    alumnos: ['alumnos-general','alumnos-matematica','alumnos-fisica','alumnos-quimica','alumnos-aptitud-academica','alumnos-humanidades'],
    externos: ['externos-general','externos-informes','externos-orientacion-uni']
  };

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c;
    });
  }
  function formatDate(value) {
    try { var d = value && value.toDate ? value.toDate() : null; return d ? d.toLocaleString('es-PE') : ''; }
    catch (e) { return ''; }
  }
  function showWarning(msg) {
    var el = document.getElementById('admin-warning');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
  }
  function hideWarning() { var el = document.getElementById('admin-warning'); if (el) el.classList.remove('show'); }
  function showPanelNotice(msg) {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var notice = document.createElement('div');
    notice.className = 'admin-empty';
    notice.style.cssText = 'background:#fff7e6;border:1px solid #ffe0ad;border-radius:16px;margin-bottom:12px';
    notice.textContent = msg; list.prepend(notice);
    setTimeout(function () { notice.remove(); }, 2800);
  }
  function setActiveTab() {
    document.querySelectorAll('.admin-tab').forEach(function (btn) { btn.classList.toggle('active', btn.dataset.view === state.view); });
  }
  function isReportView() { return state.view.indexOf('reports') === 0; }
  function currentZone() { return (state.view === 'alumnos' || state.view === 'reports-alumnos') ? 'alumnos' : 'externos'; }
  function docsArraySorted() {
    return Object.keys(state.docsByPath).map(function (path) { return state.docsByPath[path]; }).sort(function (a, b) {
      var at = a.data.createdAt && a.data.createdAt.toMillis ? a.data.createdAt.toMillis() : 0;
      var bt = b.data.createdAt && b.data.createdAt.toMillis ? b.data.createdAt.toMillis() : 0;
      return bt - at;
    }).slice(0, 80);
  }

  function renderCurrentDocs() {
    var list = document.getElementById('admin-list');
    if (!list) return;
    var docs = docsArraySorted();
    if (!docs.length) { list.innerHTML = '<div class="admin-empty">No hay registros en esta vista.</div>'; return; }
    var html = '';
    docs.forEach(function (entry) {
      var d = entry.data, report = isReportView();
      var status = d.status || d.moderationStatus || 'visible';
      var roomLabel = d.roomLabel || d.roomId || 'Sala';
      var imageSrc = d.imageUrl || d.imageData || '';
      html += '<article class="admin-item" data-item-path="' + escapeHTML(entry.path) + '" data-image-src="' + escapeHTML(imageSrc) + '" data-image-size="' + escapeHTML(d.imageSizeBytes || '') + '" data-image-mime="' + escapeHTML(d.imageMime || '') + '">' +
        '<div class="admin-meta"><span><b>ID:</b> ' + escapeHTML(entry.id) + '</span><span>' + escapeHTML(formatDate(d.createdAt)) + '</span></div>' +
        '<div><span class="admin-badge' + (report ? ' report' : '') + '">' + (report ? 'REPORTE' : escapeHTML(d.zone || 'mensaje')) + '</span> <span class="admin-badge">' + escapeHTML(roomLabel) + '</span> <span class="admin-badge">' + escapeHTML(status) + '</span></div>' +
        (report
          ? '<div class="admin-text"><b>Mensaje reportado:</b> ' + escapeHTML(d.messageId || '') + '<br><b>Sala:</b> ' + escapeHTML(roomLabel) + '<br><b>Motivo:</b> ' + escapeHTML(d.reason || '') + '<br><b>Reportado por:</b> ' + escapeHTML(d.reportedBy || '') + '<br><b>Dato:</b> ' + escapeHTML(d.reporterExtra || '') + '</div>'
          : '<div class="admin-text"><b>' + escapeHTML(d.name || '') + '</b><br><small>' + escapeHTML(d.extra || '') + '</small><br><small>Sala: ' + escapeHTML(roomLabel) + '</small><br><br>' + escapeHTML(d.text || '') + '</div>') +
        '<div class="admin-actions"><button class="admin-btn small" type="button" data-admin-action="review" data-item-path="' + escapeHTML(entry.path) + '">' + (report ? 'Marcar reporte revisado' : 'Marcar revisado') + '</button><button class="admin-btn small danger" type="button" data-admin-action="delete" data-item-path="' + escapeHTML(entry.path) + '">' + (report ? 'Eliminar reporte' : 'Eliminar mensaje') + '</button></div></article>';
    });
    list.innerHTML = html;
    window.dispatchEvent(new CustomEvent('nostrachat-admin:rendered'));
  }

  function loadView() {
    if (!state.fs || !state.db || state.loading) return Promise.resolve();
    state.loading = true;
    setActiveTab();
    state.docsByPath = {};
    var list = document.getElementById('admin-list');
    if (list) list.innerHTML = '<div class="admin-empty">Cargando registros recientes...</div>';
    var zone = currentZone();
    var collectionName = isReportView() ? 'reports' : 'messages';
    var rooms = officialRoomIds[zone] || [];
    var tasks = rooms.map(function (roomId) {
      var q = state.fs.query(
        state.fs.collection(state.db, 'rooms/' + roomId + '/' + collectionName),
        state.fs.orderBy('createdAt', 'desc'),
        state.fs.limit(ROOM_LIMIT)
      );
      return state.fs.getDocs(q).then(function (snapshot) {
        snapshot.forEach(function (doc) {
          state.docsByPath[doc.ref.path] = { id: doc.id, path: doc.ref.path, data: doc.data() };
        });
      });
    });
    return Promise.all(tasks).then(renderCurrentDocs).catch(function (error) {
      console.error(error);
      if (list) list.innerHTML = '<div class="admin-empty">No se pudieron cargar los registros. Revisa las reglas de Firebase.</div>';
    }).finally(function () { state.loading = false; });
  }

  function reviewItem(itemPath) {
    if (!state.fs || !state.db || !itemPath) return;
    var data = isReportView()
      ? { status: 'revisado', reviewedAt: state.fs.serverTimestamp(), reviewedBy: state.user.email || 'admin' }
      : { moderationStatus: 'revisado', reviewedAt: state.fs.serverTimestamp(), reviewedBy: state.user.email || 'admin' };
    state.fs.updateDoc(state.fs.doc(state.db, itemPath), data).then(function () {
      showPanelNotice('Marcado como revisado.'); return loadView();
    }).catch(function (error) { console.error(error); showPanelNotice('No se pudo actualizar.'); });
  }
  function deleteItem(itemPath) {
    if (!state.fs || !state.db || !itemPath) return;
    var label = isReportView() ? 'este reporte' : 'este mensaje';
    if (!window.confirm('¿Seguro que deseas eliminar ' + label + '? Esta acción no se puede deshacer.')) return;
    state.fs.deleteDoc(state.fs.doc(state.db, itemPath)).then(function () {
      showPanelNotice('Elemento eliminado correctamente.'); return loadView();
    }).catch(function (error) { console.error(error); showPanelNotice('No se pudo eliminar.'); });
  }
  function addRefreshButton() {
    var tabs = document.querySelector('.admin-tabs');
    if (!tabs || document.getElementById('admin-refresh-chat')) return;
    var button = document.createElement('button');
    button.id = 'admin-refresh-chat'; button.type = 'button'; button.className = 'admin-tab'; button.textContent = 'Actualizar';
    button.addEventListener('click', function () { loadView(); });
    tabs.appendChild(button);
  }

  function init() {
    if (!firebaseConfig) { showWarning('Falta configuración Firebase.'); return; }
    Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js')
    ]).then(function (mods) {
      var appMod = mods[0], fs = mods[1], authMod = mods[2];
      state.fs = fs;
      state.app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      state.db = fs.getFirestore(state.app);
      state.auth = authMod.getAuth(state.app);
      var loginForm = document.getElementById('admin-login');
      var panel = document.getElementById('admin-panel');
      var logoutBtn = document.getElementById('admin-logout');
      var googleBtn = document.getElementById('admin-google-login');
      var list = document.getElementById('admin-list');

      addRefreshButton();
      googleBtn.addEventListener('click', function () {
        hideWarning();
        var provider = new authMod.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        authMod.signInWithPopup(state.auth, provider).catch(function (error) { console.error(error); showWarning('No se pudo ingresar con Google.'); });
      });
      logoutBtn.addEventListener('click', function () { authMod.signOut(state.auth); });
      document.querySelectorAll('.admin-tab[data-view]').forEach(function (button) {
        button.addEventListener('click', function () { state.view = button.dataset.view; loadView(); });
      });
      if (list) list.addEventListener('click', function (event) {
        var button = event.target && event.target.closest ? event.target.closest('[data-admin-action]') : null;
        if (!button) return;
        var action = button.getAttribute('data-admin-action');
        var itemPath = button.getAttribute('data-item-path');
        if (action === 'review') reviewItem(itemPath);
        if (action === 'delete') deleteItem(itemPath);
      });
      authMod.onAuthStateChanged(state.auth, function (user) {
        state.user = user;
        if (user) {
          loginForm.style.display = 'none'; panel.classList.add('show');
          var info = document.getElementById('admin-user-info');
          if (info) info.textContent = 'Sesión iniciada como: ' + (user.email || user.displayName || 'Administrador');
          loadView();
        } else {
          state.docsByPath = {};
          loginForm.style.display = 'block'; panel.classList.remove('show');
        }
      });
    }).catch(function (error) { console.error(error); showWarning('No se pudo cargar Firebase Auth.'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();