/* ==================================================
   NostraCHAT Images - Firestore compacto
   Subida de imágenes SIN Firebase Storage.
   Solo alumnos + compresión + límite diario local.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var MAX_ORIGINAL_BYTES = 2 * 1024 * 1024; // 2 MB antes de comprimir
  var MAX_DATA_URL_BYTES = 260 * 1024;      // aprox. 260 KB ya comprimida
  var MAX_DAILY_IMAGES = 5;
  var MAX_SIDE = 900;
  var selectedImage = null;
  var app = null;
  var db = null;
  var fs = null;
  var unsubscribe = null;
  var currentRoomId = '';
  var imageCache = {};
  var warningTimer = null;

  function cleanText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'\"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c] || c;
    });
  }

  function showImageNotice(message, type) {
    var host = document.getElementById('nchat-image-notice');
    if (!host) return;
    host.textContent = message;
    host.className = 'nchat-image-notice show ' + (type || 'info');
    clearTimeout(warningTimer);
    warningTimer = setTimeout(function () {
      host.className = 'nchat-image-notice';
    }, 3600);
  }

  function getSessionId() {
    var id = localStorage.getItem('nostrachat_session_id');
    if (!id) {
      id = 'nc_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      localStorage.setItem('nostrachat_session_id', id);
    }
    return id;
  }

  function getSavedUser() {
    try { return JSON.parse(localStorage.getItem('nostrachat_user') || 'null'); }
    catch (e) { return null; }
  }

  function getActiveZone() {
    var btn = document.querySelector('.nchat-zone.active');
    return btn ? btn.getAttribute('data-zone') : 'alumnos';
  }

  function getActiveRoomId() {
    var btn = document.querySelector('.nchat-room.active');
    return btn ? btn.getAttribute('data-room-id') : 'alumnos-general';
  }

  function getRoomLabel() {
    var btn = document.querySelector('.nchat-room.active span');
    return btn ? cleanText(btn.textContent.replace(/^[^\wÁÉÍÓÚáéíóúÑñ]+/, '')) : 'General';
  }

  function canUseImages() {
    var user = getSavedUser();
    var zone = getActiveZone();
    var roomId = getActiveRoomId();
    return !!(user && user.name && user.extra && zone === 'alumnos' && roomId.indexOf('alumnos-') === 0);
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dailyCount() {
    try {
      var data = JSON.parse(localStorage.getItem('nostrachat_image_daily_count') || '{}');
      return data.date === todayKey() ? Number(data.count || 0) : 0;
    } catch (e) { return 0; }
  }

  function increaseDailyCount() {
    var count = dailyCount() + 1;
    localStorage.setItem('nostrachat_image_daily_count', JSON.stringify({ date: todayKey(), count: count }));
  }

  function dataUrlBytes(dataUrl) {
    return new Blob([String(dataUrl || '')]).size;
  }

  function fileToImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function canvasToDataURL(canvas, mime, quality) {
    try { return canvas.toDataURL(mime, quality); }
    catch (e) { return canvas.toDataURL('image/jpeg', quality); }
  }

  function compressImage(file) {
    return fileToImage(file).then(function (img) {
      var width = img.naturalWidth || img.width;
      var height = img.naturalHeight || img.height;
      var scale = Math.min(1, MAX_SIDE / Math.max(width, height));
      var targetWidth = Math.max(1, Math.round(width * scale));
      var targetHeight = Math.max(1, Math.round(height * scale));
      var canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      var mime = 'image/webp';
      var quality = 0.72;
      var dataUrl = canvasToDataURL(canvas, mime, quality);
      if (dataUrl.indexOf('data:image/webp') !== 0) {
        mime = 'image/jpeg';
        dataUrl = canvasToDataURL(canvas, mime, quality);
      }
      while (dataUrlBytes(dataUrl) > MAX_DATA_URL_BYTES && quality > 0.34) {
        quality -= 0.08;
        dataUrl = canvasToDataURL(canvas, mime, quality);
      }

      if (dataUrlBytes(dataUrl) > MAX_DATA_URL_BYTES) {
        throw new Error('La imagen sigue siendo muy pesada. Toma una foto más cercana o recórtala.');
      }

      return {
        dataUrl: dataUrl,
        mime: mime,
        width: targetWidth,
        height: targetHeight,
        sizeBytes: dataUrlBytes(dataUrl),
        originalName: file.name || 'imagen'
      };
    });
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-images-firestore-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-images-firestore-style';
    style.textContent = '\
      .nchat-image-tool{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:0 15px 12px;background:#fff;border-top:1px solid rgba(7,140,149,.08);}\
      .nchat-image-btn{border:1px solid rgba(7,140,149,.22);background:#f7fdff;color:#061426;border-radius:999px;padding:9px 13px;font-weight:950;cursor:pointer;}\
      .nchat-image-btn:disabled{opacity:.52;cursor:not-allowed;}\
      .nchat-image-preview{display:none;align-items:center;gap:10px;background:#fff7e6;border:1px solid #ffe0ad;border-radius:16px;padding:8px 10px;max-width:100%;}\
      .nchat-image-preview.show{display:flex;}\
      .nchat-image-preview img{width:52px;height:52px;border-radius:12px;object-fit:cover;border:1px solid rgba(6,20,38,.12);}\
      .nchat-image-preview span{font-size:12px;font-weight:900;color:#5b3a07;}\
      .nchat-image-remove{border:0;background:#061426;color:#fff;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:950;cursor:pointer;}\
      .nchat-image-notice{display:none;margin:0 15px 12px;padding:10px 12px;border-radius:14px;font-size:13px;font-weight:850;background:#eef8fa;color:#17414a;}\
      .nchat-image-notice.show{display:block;}\
      .nchat-image-notice.error{background:#fff2f2;color:#941b1b;border:1px solid #ffd3d3;}\
      .nchat-image-wrap{margin-top:9px;}\
      .nchat-image-wrap img{display:block;width:min(320px,100%);max-height:360px;object-fit:contain;border-radius:16px;border:1px solid rgba(6,20,38,.12);background:#fff;cursor:zoom-in;}\
      .nchat-msg.mine .nchat-image-wrap img{border-color:rgba(255,255,255,.35);}\
      .nchat-image-caption{font-size:11px;font-weight:850;opacity:.72;margin-top:5px;}\
    ';
    document.head.appendChild(style);
  }

  function buildImageUI() {
    var composer = document.querySelector('.nchat-composer');
    var sendBtn = document.getElementById('nchat-send');
    if (!composer || !sendBtn || document.getElementById('nchat-image-file')) return false;

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'nchat-image-file';
    fileInput.accept = 'image/jpeg,image/png,image/webp';
    fileInput.style.display = 'none';

    var tool = document.createElement('div');
    tool.className = 'nchat-image-tool';
    tool.innerHTML = '<button class="nchat-image-btn" id="nchat-image-pick" type="button">📷 Adjuntar imagen</button>' +
      '<div class="nchat-image-preview" id="nchat-image-preview"><img alt="Vista previa"><span></span><button class="nchat-image-remove" type="button">Quitar</button></div>';

    var notice = document.createElement('div');
    notice.id = 'nchat-image-notice';
    notice.className = 'nchat-image-notice';

    composer.parentNode.insertBefore(fileInput, composer);
    composer.parentNode.insertBefore(tool, composer.nextSibling);
    composer.parentNode.insertBefore(notice, tool.nextSibling);

    var pickBtn = document.getElementById('nchat-image-pick');
    var preview = document.getElementById('nchat-image-preview');
    var previewImg = preview.querySelector('img');
    var previewText = preview.querySelector('span');
    var removeBtn = preview.querySelector('button');

    pickBtn.addEventListener('click', function () {
      if (!canUseImages()) {
        showImageNotice('Las imágenes están activas solo para alumnos dentro de salas académicas. Primero ingresa como alumno.', 'error');
        return;
      }
      if (dailyCount() >= MAX_DAILY_IMAGES) {
        showImageNotice('Llegaste al límite de 5 imágenes por día en este dispositivo.', 'error');
        return;
      }
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        fileInput.value = '';
        showImageNotice('Solo se permiten imágenes JPG, PNG o WEBP.', 'error');
        return;
      }
      if (file.size > MAX_ORIGINAL_BYTES) {
        fileInput.value = '';
        showImageNotice('La imagen original pesa más de 2 MB. Toma una foto más ligera o recórtala.', 'error');
        return;
      }
      pickBtn.disabled = true;
      pickBtn.textContent = 'Comprimiendo...';
      compressImage(file).then(function (img) {
        selectedImage = img;
        previewImg.src = img.dataUrl;
        previewText.textContent = 'Imagen lista · ' + Math.round(img.sizeBytes / 1024) + ' KB';
        preview.classList.add('show');
        showImageNotice('Imagen comprimida y lista para enviar.', 'info');
      }).catch(function (err) {
        selectedImage = null;
        preview.classList.remove('show');
        showImageNotice(err && err.message ? err.message : 'No se pudo procesar la imagen.', 'error');
      }).finally(function () {
        pickBtn.disabled = false;
        pickBtn.textContent = '📷 Adjuntar imagen';
        fileInput.value = '';
      });
    });

    removeBtn.addEventListener('click', function () {
      selectedImage = null;
      preview.classList.remove('show');
      previewImg.removeAttribute('src');
      previewText.textContent = '';
    });

    sendBtn.addEventListener('click', function (e) {
      if (!selectedImage) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      sendImageMessage();
    }, true);

    var textarea = document.getElementById('nchat-message');
    if (textarea) {
      textarea.addEventListener('keydown', function (e) {
        if (!selectedImage) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          sendImageMessage();
        }
      }, true);
    }

    updateAvailability();
    return true;
  }

  function updateAvailability() {
    var pickBtn = document.getElementById('nchat-image-pick');
    if (!pickBtn) return;
    if (canUseImages()) {
      pickBtn.disabled = false;
      pickBtn.title = 'Adjuntar imagen académica';
    } else {
      pickBtn.disabled = false;
      pickBtn.title = 'Disponible solo para alumnos';
    }
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

  function sendImageMessage() {
    if (!selectedImage) return;
    if (!canUseImages()) return showImageNotice('Solo los alumnos pueden enviar imágenes académicas.', 'error');
    if (dailyCount() >= MAX_DAILY_IMAGES) return showImageNotice('Llegaste al límite de 5 imágenes por día.', 'error');

    var user = getSavedUser();
    var roomId = getActiveRoomId();
    var textInput = document.getElementById('nchat-message');
    var sendBtn = document.getElementById('nchat-send');
    var text = cleanText(textInput ? textInput.value : '').slice(0, 420);
    var payloadImage = selectedImage;

    if (sendBtn) sendBtn.disabled = true;
    ensureFirebase().then(function () {
      return fs.addDoc(fs.collection(db, 'rooms/' + roomId + '/messages'), {
        text: text || '📷 Imagen académica adjunta',
        name: user.name,
        extra: user.extra,
        zone: 'alumnos',
        roomId: roomId,
        roomLabel: getRoomLabel(),
        sessionId: getSessionId(),
        type: 'message',
        hasImage: true,
        imageData: payloadImage.dataUrl,
        imageMime: payloadImage.mime,
        imageWidth: payloadImage.width,
        imageHeight: payloadImage.height,
        imageSizeBytes: payloadImage.sizeBytes,
        imageOriginalName: payloadImage.originalName,
        moderationStatus: 'visible',
        createdAt: fs.serverTimestamp()
      });
    }).then(function () {
      increaseDailyCount();
      selectedImage = null;
      var preview = document.getElementById('nchat-image-preview');
      if (preview) preview.classList.remove('show');
      if (textInput) textInput.value = '';
      showImageNotice('Imagen enviada correctamente.', 'info');
    }).catch(function (err) {
      console.error(err);
      showImageNotice('No se pudo enviar la imagen. Revisa las reglas de Firestore o el tamaño.', 'error');
    }).finally(function () {
      if (sendBtn) sendBtn.disabled = false;
      if (textInput) textInput.focus();
    });
  }

  function listenRoomImages() {
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
        if (d && d.hasImage && d.imageData) imageCache[doc.id] = d;
      });
      enhanceRenderedImages();
    }, function (err) {
      console.warn('NostraCHAT images listener:', err);
    });
  }

  function enhanceRenderedImages() {
    document.querySelectorAll('.nchat-report[data-report-id]').forEach(function (btn) {
      var id = btn.getAttribute('data-report-id');
      var data = imageCache[id];
      if (!data || !data.imageData) return;
      var msg = btn.closest('.nchat-msg');
      if (!msg || msg.querySelector('.nchat-image-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'nchat-image-wrap';
      wrap.innerHTML = '<img src="' + escapeHTML(data.imageData) + '" alt="Imagen académica adjunta" loading="lazy"><div class="nchat-image-caption">📷 Imagen académica · ' + Math.round((data.imageSizeBytes || 0) / 1024) + ' KB</div>';
      var text = msg.querySelector('.nchat-text');
      if (text) text.insertAdjacentElement('afterend', wrap);
    });
  }

  function openImageOnClick() {
    document.addEventListener('click', function (e) {
      var img = e.target && e.target.closest ? e.target.closest('.nchat-image-wrap img') : null;
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
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (buildImageUI() || tries > 30) clearInterval(timer);
    }, 300);

    ensureFirebase().then(function () {
      setInterval(function () {
        updateAvailability();
        listenRoomImages();
        enhanceRenderedImages();
      }, 1200);
    }).catch(function (err) {
      console.warn('NostraCHAT images init:', err);
    });
    openImageOnClick();

    var noteTimer = setInterval(function () {
      var note = document.querySelector('.nchat-note');
      if (!note) return;
      note.textContent = 'Sistema mixto: texto + imágenes académicas comprimidas solo para alumnos. Máximo 5 imágenes por día por dispositivo. No se permiten enlaces externos, videos ni PDFs.';
      clearInterval(noteTimer);
    }, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
