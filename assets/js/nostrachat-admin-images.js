/* ==================================================
   NostraCHAT Admin Images
   Muestra imágenes comprimidas guardadas en Firestore.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var app = null;
  var db = null;
  var fs = null;
  var cache = {};

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'\"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c] || c;
    });
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-admin-images-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-admin-images-style';
    style.textContent = '\
      .admin-image-box{margin:12px 0 4px;padding:10px;border:1px solid rgba(7,140,149,.16);border-radius:16px;background:#f7fdff;}\
      .admin-image-box img{display:block;width:min(360px,100%);max-height:380px;object-fit:contain;border-radius:14px;background:#fff;border:1px solid rgba(6,20,38,.12);cursor:zoom-in;}\
      .admin-image-info{margin-top:7px;font-size:12px;font-weight:900;color:#5f6b7a;}\
    ';
    document.head.appendChild(style);
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

  function loadImageForItem(item) {
    var path = item.getAttribute('data-item-path');
    if (!path || item.querySelector('.admin-image-box')) return;
    if (path.indexOf('/messages/') === -1) return;

    if (cache[path]) {
      appendImage(item, cache[path]);
      return;
    }

    ensureFirebase().then(function () {
      return fs.getDoc(fs.doc(db, path));
    }).then(function (snap) {
      if (!snap.exists()) return;
      var data = snap.data();
      if (!data || !data.hasImage || !data.imageData) return;
      cache[path] = data;
      appendImage(item, data);
    }).catch(function (err) {
      console.warn('NostraCHAT admin image:', err);
    });
  }

  function appendImage(item, data) {
    if (!item || item.querySelector('.admin-image-box')) return;
    var box = document.createElement('div');
    box.className = 'admin-image-box';
    box.innerHTML = '<img src="' + escapeHTML(data.imageData) + '" alt="Imagen académica adjunta" loading="lazy">' +
      '<div class="admin-image-info">📷 Imagen académica · ' + Math.round((data.imageSizeBytes || 0) / 1024) + ' KB · ' + escapeHTML(data.imageMime || '') + '</div>';
    var text = item.querySelector('.admin-text');
    if (text) text.insertAdjacentElement('afterend', box);
    else item.appendChild(box);
  }

  function scan() {
    document.querySelectorAll('.admin-item[data-item-path]').forEach(loadImageForItem);
  }

  function openImageOnClick() {
    document.addEventListener('click', function (e) {
      var img = e.target && e.target.closest ? e.target.closest('.admin-image-box img') : null;
      if (!img) return;
      var win = window.open('about:blank', '_blank');
      if (win) {
        win.document.write('<title>Imagen NostraCHAT</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="' + img.src + '" style="max-width:98vw;max-height:98vh;object-fit:contain"></body>');
        win.document.close();
      }
    });
  }

  function run() {
    injectStyles();
    openImageOnClick();
    ensureFirebase().then(function () {
      scan();
      setInterval(scan, 1500);
    }).catch(function (err) {
      console.warn('NostraCHAT admin images init:', err);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
