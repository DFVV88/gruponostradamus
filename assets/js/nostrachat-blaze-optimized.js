/* ==================================================
   NostraCHAT Blaze Optimized v1
   - Presencia cada 90 s y solo con pestaña visible.
   - Usa el único listener del núcleo para imágenes y DAMUS.
   - Imágenes en Cloud Storage, no como Base64 en Firestore.
================================================== */
(function () {
  var runtime = window.NOSTRACHAT_RUNTIME || null;
  var latestDetail = null;
  var messageCache = {};

  var PRESENCE_HEARTBEAT_MS = 90000;
  var PRESENCE_ACTIVE_MS = 210000;
  var PRESENCE_TTL_MINUTES = 5;
  var PRESENCE_LIMIT = 30;
  var IMAGE_RETENTION_DAYS = 10;
  var DAMUS_RETENTION_DAYS = 30;
  var MAX_ORIGINAL_BYTES = 2 * 1024 * 1024;
  var MAX_IMAGE_BYTES = 120 * 1024;
  var MAX_IMAGE_SIDE = 800;
  var MAX_DAILY_IMAGES = 5;
  var DAMUS_DAILY_LIMIT = 5;
  var DAMUS_COOLDOWN_SECONDS = 60;
  var ENDPOINT = window.NOSTRA_DAMUS_VISION_ENDPOINT || '';

  var presenceUnsubscribe = null;
  var presenceRoomId = '';
  var presenceTimer = null;
  var lastPresenceWrite = 0;
  var selectedImage = null;
  var storageModulesPromise = null;
  var workingDamus = {};
  var cooldownTimer = null;
  var mathJaxLoading = false;

  function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function escapeHTML(value) {
    return String(value || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c;
    });
  }
  function getUser() { return runtime && runtime.state ? runtime.state.user : null; }
  function getRoomId() { return latestDetail && latestDetail.roomId ? latestDetail.roomId : (runtime && runtime.state ? runtime.state.roomId : ''); }
  function getZone() { return latestDetail && latestDetail.zone ? latestDetail.zone : (runtime && runtime.state ? runtime.state.zone : ''); }
  function getRoomLabel() { return latestDetail && latestDetail.roomLabel ? latestDetail.roomLabel : (runtime && runtime.getRoomLabel ? runtime.getRoomLabel(getRoomId()) : 'General'); }
  function getSessionId() { return runtime && runtime.state ? runtime.state.sessionId : (localStorage.getItem('nostrachat_session_id') || ''); }
  function expiryDays(days) { return runtime.expiry(days); }
  function expiryMinutes(minutes) { return runtime.fs.Timestamp.fromMillis(Date.now() + Number(minutes) * 60000); }
  function isAlumnoContext() { return getZone() === 'alumnos' && getRoomId().indexOf('alumnos-') === 0 && !!getUser(); }

  function showNotice(message, type) {
    var host = document.getElementById('nchat-image-notice');
    if (!host) {
      var warning = document.getElementById('nchat-warning');
      if (warning) {
        warning.className = 'nchat-warning show ' + (type === 'error' ? '' : 'info');
        warning.textContent = message;
      }
      return;
    }
    host.textContent = message;
    host.className = 'nchat-image-notice show ' + (type || 'info');
    setTimeout(function () { host.className = 'nchat-image-notice'; }, 5500);
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-blaze-optimized-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-blaze-optimized-style';
    style.textContent = '\
      .nchat-image-tool{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:0 15px 12px;background:#fff;border-top:1px solid rgba(7,140,149,.08)}\
      .nchat-image-btn{border:1px solid rgba(7,140,149,.22);background:#f7fdff;color:#061426;border-radius:999px;padding:9px 13px;font-weight:950;cursor:pointer}.nchat-image-btn:disabled{opacity:.52;cursor:not-allowed}\
      .nchat-image-preview{display:none;align-items:center;gap:10px;background:#fff7e6;border:1px solid #ffe0ad;border-radius:16px;padding:8px 10px;max-width:100%}.nchat-image-preview.show{display:flex}.nchat-image-preview img{width:52px;height:52px;border-radius:12px;object-fit:cover;border:1px solid rgba(6,20,38,.12)}.nchat-image-preview span{font-size:12px;font-weight:900;color:#5b3a07}.nchat-image-remove{border:0;background:#061426;color:#fff;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:950;cursor:pointer}\
      .nchat-image-notice{display:none;margin:0 15px 12px;padding:10px 12px;border-radius:14px;font-size:13px;font-weight:850;background:#eef8fa;color:#17414a}.nchat-image-notice.show{display:block}.nchat-image-notice.error{background:#fff2f2;color:#941b1b;border:1px solid #ffd3d3}\
      .nchat-image-wrap{margin-top:9px}.nchat-image-wrap img{display:block;width:min(320px,100%);max-height:360px;object-fit:contain;border-radius:16px;border:1px solid rgba(6,20,38,.12);background:#fff;cursor:zoom-in}.nchat-msg.mine .nchat-image-wrap img{border-color:rgba(255,255,255,.35)}.nchat-image-caption{font-size:11px;font-weight:850;opacity:.72;margin-top:5px}\
      .nchat-damus-row{margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.nchat-damus-btn{border:0;border-radius:999px;padding:7px 10px;background:linear-gradient(135deg,#ff941e,#078c95,#061426);color:#fff;font-size:11px;font-weight:950;cursor:pointer}.nchat-damus-btn:disabled{opacity:.68;cursor:not-allowed}.nchat-damus-mini{font-size:11px;font-weight:850;opacity:.72}\
    ';
    document.head.appendChild(style);
  }

  /* ---------- Presencia optimizada ---------- */
  function presencePath(roomId) { return 'rooms/' + roomId + '/presence'; }
  function renderPresence(items) {
    var list = document.getElementById('nchat-online-list');
    var count = document.getElementById('nchat-online-count');
    var sub = document.getElementById('nchat-online-sub');
    if (!list || !count) return;
    var now = Date.now(), unique = {};
    items.forEach(function (item) {
      var date = item.lastSeen && item.lastSeen.toDate ? item.lastSeen.toDate() : null;
      if (!date || now - date.getTime() > PRESENCE_ACTIVE_MS) return;
      var key = cleanText(item.name).toLowerCase() + '|' + cleanText(item.extra).toLowerCase();
      if (!unique[key]) unique[key] = item;
    });
    var active = Object.keys(unique).map(function (key) { return unique[key]; });
    count.textContent = String(active.length);
    if (sub) sub.textContent = 'Activos en ' + getRoomLabel() + ' · actualización eficiente.';
    if (!active.length) {
      list.innerHTML = '<div class="nchat-online-empty">Todavía no hay personas activas en esta sala.</div>';
      return;
    }
    list.innerHTML = active.map(function (item) {
      return '<div class="nchat-online-item"><div class="nchat-online-name"><span class="nchat-online-dot"></span><span>' + escapeHTML(item.name || 'Usuario') + '</span></div><div class="nchat-online-extra">' + escapeHTML(item.extra || 'Sin dato adicional') + '</div></div>';
    }).join('');
  }
  function stopPresenceListener() {
    if (presenceUnsubscribe) { try { presenceUnsubscribe(); } catch (e) {} }
    presenceUnsubscribe = null;
    presenceRoomId = '';
  }
  function writePresence(force) {
    if (!runtime || document.hidden || !isAlumnoContext()) return Promise.resolve();
    var now = Date.now();
    if (!force && now - lastPresenceWrite < PRESENCE_HEARTBEAT_MS - 1000) return Promise.resolve();
    lastPresenceWrite = now;
    var user = getUser(), roomId = getRoomId();
    return runtime.fs.setDoc(runtime.fs.doc(runtime.db, presencePath(roomId), getSessionId()), {
      name: String(user.name || '').slice(0, 60),
      extra: String(user.extra || '').slice(0, 80),
      zone: getZone(), roomId: roomId, roomLabel: getRoomLabel(), sessionId: getSessionId(),
      lastSeen: runtime.fs.serverTimestamp(), expiresAt: expiryMinutes(PRESENCE_TTL_MINUTES)
    }, { merge: true }).catch(function (error) { console.warn('NostraCHAT presence write:', error); });
  }
  function startPresence() {
    if (!runtime || document.hidden || !isAlumnoContext()) { stopPresenceListener(); return; }
    var roomId = getRoomId();
    if (presenceUnsubscribe && presenceRoomId === roomId) return;
    stopPresenceListener();
    presenceRoomId = roomId;
    var q = runtime.fs.query(runtime.fs.collection(runtime.db, presencePath(roomId)), runtime.fs.orderBy('lastSeen', 'desc'), runtime.fs.limit(PRESENCE_LIMIT));
    presenceUnsubscribe = runtime.fs.onSnapshot(q, function (snapshot) {
      var items = [];
      snapshot.forEach(function (doc) { var data = doc.data(); if (data) items.push(data); });
      renderPresence(items);
    }, function (error) { console.warn('NostraCHAT presence read:', error); });
    writePresence(true);
  }
  function startPresenceTimer() {
    if (presenceTimer) clearInterval(presenceTimer);
    presenceTimer = setInterval(function () {
      if (document.hidden) return;
      startPresence();
      writePresence(false);
    }, PRESENCE_HEARTBEAT_MS);
  }

  /* ---------- Imágenes en Storage ---------- */
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function imageDailyCount() {
    try {
      var data = JSON.parse(localStorage.getItem('nostrachat_image_daily_count') || '{}');
      return data.date === todayKey() ? Number(data.count || 0) : 0;
    } catch (e) { return 0; }
  }
  function increaseImageCount() { localStorage.setItem('nostrachat_image_daily_count', JSON.stringify({ date: todayKey(), count: imageDailyCount() + 1 })); }
  function fileToImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var image = new Image();
        image.onload = function () { resolve(image); };
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function dataUrlBytes(dataUrl) { return new Blob([String(dataUrl || '')]).size; }
  function dataUrlToBlob(dataUrl) {
    var parts = String(dataUrl).split(',');
    var mime = (parts[0].match(/data:([^;]+)/) || [])[1] || 'image/webp';
    var binary = atob(parts[1] || '');
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  function compressImage(file) {
    return fileToImage(file).then(function (image) {
      var width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
      var scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
      var targetWidth = Math.max(1, Math.round(width * scale));
      var targetHeight = Math.max(1, Math.round(height * scale));
      var canvas = document.createElement('canvas');
      canvas.width = targetWidth; canvas.height = targetHeight;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, targetWidth, targetHeight); ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
      var mime = 'image/webp', quality = 0.68;
      var dataUrl = canvas.toDataURL(mime, quality);
      if (dataUrl.indexOf('data:image/webp') !== 0) { mime = 'image/jpeg'; dataUrl = canvas.toDataURL(mime, quality); }
      while (dataUrlBytes(dataUrl) > MAX_IMAGE_BYTES && quality > 0.28) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL(mime, quality);
      }
      if (dataUrlBytes(dataUrl) > MAX_IMAGE_BYTES) throw new Error('La imagen sigue siendo pesada. Recórtala o toma una foto más cercana.');
      return { blob: dataUrlToBlob(dataUrl), preview: dataUrl, mime: mime, width: targetWidth, height: targetHeight, sizeBytes: dataUrlBytes(dataUrl), originalName: file.name || 'imagen' };
    });
  }
  function loadStorageModules() {
    if (storageModulesPromise) return storageModulesPromise;
    storageModulesPromise = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js')
    ]).then(function (mods) {
      var storageMod = mods[0], appMod = mods[1];
      var app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(window.NOSTRACHAT_FIREBASE_CONFIG);
      return { mod: storageMod, storage: storageMod.getStorage(app) };
    });
    return storageModulesPromise;
  }
  function safePathPart(value) { return String(value || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80); }
  function uploadImage(image) {
    return loadStorageModules().then(function (storage) {
      var user = getUser();
      var month = todayKey().slice(0, 7);
      var owner = safePathPart((user && user.uid) || getSessionId());
      var fileName = Date.now() + '_' + Math.random().toString(36).slice(2, 9) + (image.mime === 'image/webp' ? '.webp' : '.jpg');
      var path = 'nostrachat/' + safePathPart(getRoomId()) + '/' + month + '/' + owner + '/' + fileName;
      var ref = storage.mod.ref(storage.storage, path);
      return storage.mod.uploadBytes(ref, image.blob, { contentType: image.mime, cacheControl: 'public,max-age=86400' })
        .then(function () { return storage.mod.getDownloadURL(ref); })
        .then(function (url) { return { url: url, path: path }; });
    });
  }
  function clearSelectedImage() {
    selectedImage = null;
    var preview = document.getElementById('nchat-image-preview');
    if (preview) preview.classList.remove('show');
    var img = preview && preview.querySelector('img');
    if (img) img.removeAttribute('src');
  }
  function sendImageMessage() {
    if (!selectedImage || !runtime) return;
    if (!isAlumnoContext()) return showNotice('Solo alumnos con sesión activa pueden enviar imágenes.', 'error');
    if (imageDailyCount() >= MAX_DAILY_IMAGES) return showNotice('Llegaste al límite de 5 imágenes por día.', 'error');
    var image = selectedImage;
    var textInput = document.getElementById('nchat-message');
    var sendBtn = document.getElementById('nchat-send');
    var text = cleanText(textInput ? textInput.value : '').slice(0, 420);
    if (sendBtn) sendBtn.disabled = true;
    showNotice('Subiendo imagen optimizada...', 'info');
    uploadImage(image).then(function (uploaded) {
      var user = getUser();
      return runtime.fs.addDoc(runtime.fs.collection(runtime.db, 'rooms/' + getRoomId() + '/messages'), {
        text: text || '📷 Imagen académica adjunta', name: user.name, extra: user.extra,
        zone: 'alumnos', roomId: getRoomId(), roomLabel: getRoomLabel(), sessionId: getSessionId(),
        type: 'message', hasImage: true, imageUrl: uploaded.url, imagePath: uploaded.path,
        imageMime: image.mime, imageWidth: image.width, imageHeight: image.height, imageSizeBytes: image.sizeBytes,
        imageOriginalName: image.originalName, moderationStatus: 'visible', pinned: false,
        createdAt: runtime.fs.serverTimestamp(), expiresAt: expiryDays(IMAGE_RETENTION_DAYS)
      });
    }).then(function () {
      increaseImageCount(); clearSelectedImage(); if (textInput) textInput.value = '';
      showNotice('Imagen enviada. Se conservará durante 10 días.', 'info');
    }).catch(function (error) {
      console.error('NostraCHAT image upload:', error);
      showNotice('No se pudo subir la imagen. Verifica las reglas de Storage.', 'error');
    }).finally(function () { if (sendBtn) sendBtn.disabled = false; });
  }
  function buildImageUI() {
    var composer = document.querySelector('.nchat-composer');
    var sendBtn = document.getElementById('nchat-send');
    if (!composer || !sendBtn || document.getElementById('nchat-image-file')) return !!document.getElementById('nchat-image-file');
    var fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.id = 'nchat-image-file'; fileInput.accept = 'image/jpeg,image/png,image/webp'; fileInput.style.display = 'none';
    var tool = document.createElement('div');
    tool.className = 'nchat-image-tool';
    tool.innerHTML = '<button class="nchat-image-btn" id="nchat-image-pick" type="button">📷 Adjuntar imagen</button><div class="nchat-image-preview" id="nchat-image-preview"><img alt="Vista previa"><span></span><button class="nchat-image-remove" type="button">Quitar</button></div>';
    var notice = document.createElement('div'); notice.id = 'nchat-image-notice'; notice.className = 'nchat-image-notice';
    composer.parentNode.insertBefore(fileInput, composer);
    composer.parentNode.insertBefore(tool, composer.nextSibling);
    composer.parentNode.insertBefore(notice, tool.nextSibling);
    var pick = document.getElementById('nchat-image-pick');
    var preview = document.getElementById('nchat-image-preview');
    pick.addEventListener('click', function () {
      if (!isAlumnoContext()) return showNotice('Disponible solo para alumnos con sesión activa.', 'error');
      if (imageDailyCount() >= MAX_DAILY_IMAGES) return showNotice('Llegaste al límite de 5 imágenes por día.', 'error');
      fileInput.click();
    });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return showNotice('Solo se permiten imágenes JPG, PNG o WEBP.', 'error');
      if (file.size > MAX_ORIGINAL_BYTES) return showNotice('La imagen original supera 2 MB.', 'error');
      pick.disabled = true; pick.textContent = 'Comprimiendo...';
      compressImage(file).then(function (image) {
        selectedImage = image;
        preview.querySelector('img').src = image.preview;
        preview.querySelector('span').textContent = 'Lista · ' + Math.round(image.sizeBytes / 1024) + ' KB';
        preview.classList.add('show');
      }).catch(function (error) { showNotice(error.message || 'No se pudo procesar la imagen.', 'error'); })
        .finally(function () { pick.disabled = false; pick.textContent = '📷 Adjuntar imagen'; fileInput.value = ''; });
    });
    preview.querySelector('button').addEventListener('click', clearSelectedImage);
    sendBtn.addEventListener('click', function (event) {
      if (!selectedImage) return;
      event.preventDefault(); event.stopImmediatePropagation(); sendImageMessage();
    }, true);
    var textarea = document.getElementById('nchat-message');
    if (textarea) textarea.addEventListener('keydown', function (event) {
      if (selectedImage && event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.stopImmediatePropagation(); sendImageMessage(); }
    }, true);
    return true;
  }
  function renderImages() {
    Object.keys(messageCache).forEach(function (id) {
      var data = messageCache[id];
      var src = data && (data.imageUrl || data.imageData);
      if (!src) return;
      var item = document.querySelector('.nchat-msg[data-message-id="' + CSS.escape(id) + '"]');
      if (!item || item.querySelector('.nchat-image-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'nchat-image-wrap';
      wrap.innerHTML = '<img src="' + escapeHTML(src) + '" alt="Imagen académica adjunta" loading="lazy"><div class="nchat-image-caption">📷 Imagen académica · ' + Math.round((data.imageSizeBytes || 0) / 1024) + ' KB</div>';
      var text = item.querySelector('.nchat-text');
      if (text) text.insertAdjacentElement('afterend', wrap);
    });
  }

  /* ---------- DAMUS sin listener adicional ---------- */
  function damusCount() {
    try { var data = JSON.parse(localStorage.getItem('nostrachat_damus_daily_count') || '{}'); return data.date === todayKey() ? Number(data.count || 0) : 0; }
    catch (e) { return 0; }
  }
  function increaseDamusCount() { localStorage.setItem('nostrachat_damus_daily_count', JSON.stringify({ date: todayKey(), count: damusCount() + 1 })); }
  function cooldownRemaining() {
    var until = Number(localStorage.getItem('nostrachat_damus_cooldown_until') || 0);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  }
  function startCooldown(seconds) {
    var duration = Math.max(Number(seconds || DAMUS_COOLDOWN_SECONDS), DAMUS_COOLDOWN_SECONDS);
    localStorage.setItem('nostrachat_damus_cooldown_until', String(Date.now() + duration * 1000));
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(function () {
      updateDamusButtons();
      if (!cooldownRemaining()) { clearInterval(cooldownTimer); cooldownTimer = null; }
    }, 1000);
  }
  function canAskDamus(data) {
    if (!data || data.damusVision || data.type !== 'message') return false;
    if (/^🤖|DAMUS Académico/i.test(data.name || '')) return false;
    return data.hasImage || cleanText(data.text || '').length >= 6;
  }
  function updateDamusButtons() {
    var remaining = cooldownRemaining();
    document.querySelectorAll('[data-damus-id]').forEach(function (button) {
      var id = button.getAttribute('data-damus-id');
      if (workingDamus[id]) return;
      button.disabled = remaining > 0;
      button.textContent = remaining > 0 ? ('⏳ Disponible en ' + remaining + ' s') : '🤖 Pedir respuesta a DAMUS';
    });
  }
  function renderDamusButtons() {
    if (!isAlumnoContext()) return;
    Object.keys(messageCache).forEach(function (id) {
      var data = messageCache[id];
      if (!canAskDamus(data)) return;
      var item = document.querySelector('.nchat-msg[data-message-id="' + CSS.escape(id) + '"]');
      if (!item || item.querySelector('.nchat-damus-row')) return;
      var row = document.createElement('div');
      row.className = 'nchat-damus-row';
      row.innerHTML = '<button class="nchat-damus-btn" type="button" data-damus-id="' + escapeHTML(id) + '">🤖 Pedir respuesta a DAMUS</button><span class="nchat-damus-mini">Orientación IA, verificar con docente.</span>';
      var actions = item.querySelector('.nchat-actions');
      if (actions) actions.insertAdjacentElement('afterend', row);
    });
    updateDamusButtons();
  }
  function buildPrompt(data) {
    var mode = data.hasImage ? 'imagen' : 'texto';
    return 'Eres DAMUS Académico, tutor del Grupo Nostradamus para postulantes UNI. Analiza la consulta en modo ' + mode + '. Explica paso a paso, con claridad y brevedad. Usa LaTeX estándar entre \\( y \\). Estructura: Tema probable, Datos clave, Desarrollo, Respuesta final y Verificación.\n\nConsulta: ' + (data.text || 'Analiza la imagen adjunta.');
  }
  function callDamus(data, id) {
    if (!ENDPOINT) return Promise.reject(new Error('DAMUS_ENDPOINT_NO_CONFIGURADO'));
    return fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow',
      body: JSON.stringify({
        messageId: id, mode: data.hasImage ? 'image' : 'text', roomId: getRoomId(), roomLabel: getRoomLabel(),
        studentText: data.text || '', prompt: buildPrompt(data), imageData: data.imageUrl || data.imageData || '', imageMime: data.imageMime || 'image/jpeg', requestedAt: new Date().toISOString()
      })
    }).then(function (response) { if (!response.ok) throw new Error('DAMUS_HTTP_' + response.status); return response.text(); })
      .then(function (text) { var json = JSON.parse(text || '{}'); if (json.ok === false) throw new Error(json.error || json.answer || 'DAMUS_ERROR'); return json.answer || json.text; });
  }
  function requestDamus(id, button) {
    if (!runtime || workingDamus[id]) return;
    if (!isAlumnoContext()) return showNotice('DAMUS está disponible solo para alumnos.', 'error');
    if (cooldownRemaining()) return showNotice('DAMUS está en pausa. Espera unos segundos.', 'info');
    if (damusCount() >= DAMUS_DAILY_LIMIT) return showNotice('Llegaste al límite de 5 solicitudes diarias a DAMUS.', 'error');
    var data = messageCache[id];
    if (!canAskDamus(data)) return showNotice('Esta consulta no está disponible para DAMUS.', 'error');
    workingDamus[id] = true;
    if (button) { button.disabled = true; button.textContent = 'DAMUS analizando...'; }
    callDamus(data, id).then(function (answer) {
      increaseDamusCount();
      return runtime.fs.addDoc(runtime.fs.collection(runtime.db, 'rooms/' + getRoomId() + '/messages'), {
        text: String(answer || 'DAMUS no pudo generar una respuesta clara.').slice(0, 6000),
        name: 'DAMUS Académico 🤖', extra: 'Respuesta generada con IA · verificar con docente',
        zone: 'alumnos', roomId: getRoomId(), roomLabel: getRoomLabel(), sessionId: 'damus_' + getSessionId(),
        type: 'message', moderationStatus: 'visible', damusVision: true, sourceMessageId: id,
        requestedBy: getUser() && getUser().name ? getUser().name : 'Alumno', pinned: false,
        createdAt: runtime.fs.serverTimestamp(), expiresAt: expiryDays(DAMUS_RETENTION_DAYS)
      });
    }).then(function () {
      showNotice('DAMUS publicó una respuesta en el chat.', 'info');
      if (button) button.textContent = '✅ Solicitud enviada';
    }).catch(function (error) {
      console.error('NostraCHAT DAMUS:', error);
      if (/429|QUOTA|RESOURCE_EXHAUSTED/i.test(String(error.message || ''))) startCooldown(DAMUS_COOLDOWN_SECONDS);
      showNotice('No se pudo generar la respuesta de DAMUS.', 'error');
      if (button) { button.disabled = false; button.textContent = '🤖 Pedir respuesta a DAMUS'; }
    }).finally(function () { workingDamus[id] = false; });
  }
  function ensureMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) return Promise.resolve();
    if (mathJaxLoading) return new Promise(function (resolve) { setTimeout(function () { ensureMathJax().then(resolve); }, 400); });
    mathJaxLoading = true;
    window.MathJax = { tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']], processEscapes: true }, options: { skipHtmlTags: ['script','noscript','style','textarea','pre','code'] } };
    return new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'; script.async = true;
      script.onload = function () { mathJaxLoading = false; resolve(); };
      script.onerror = function () { mathJaxLoading = false; resolve(); };
      document.head.appendChild(script);
    });
  }
  function formatDamusMessages() {
    var targets = [];
    document.querySelectorAll('.nchat-msg .nchat-text').forEach(function (element) {
      var item = element.closest('.nchat-msg');
      var id = item && item.getAttribute('data-message-id');
      var data = id && messageCache[id];
      if (data && data.damusVision && element.getAttribute('data-damus-formatted') !== '1') {
        element.setAttribute('data-damus-formatted', '1'); targets.push(element);
      }
    });
    if (!targets.length) return;
    ensureMathJax().then(function () { if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise(targets).catch(function () {}); });
  }

  function handleMessages(detail) {
    latestDetail = detail;
    messageCache = {};
    (detail.items || []).forEach(function (item) { if (item && item.id) messageCache[item.id] = item; });
    buildImageUI();
    renderImages();
    renderDamusButtons();
    formatDamusMessages();
    startPresence();
  }

  function bindGlobalEvents() {
    window.addEventListener('nostrachat:runtime-ready', function (event) {
      runtime = event.detail || window.NOSTRACHAT_RUNTIME;
      startPresenceTimer();
    });
    window.addEventListener('nostrachat:messages', function (event) { handleMessages(event.detail || {}); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopPresenceListener();
      else { startPresence(); writePresence(true); }
    });
    document.addEventListener('click', function (event) {
      var damus = event.target && event.target.closest ? event.target.closest('[data-damus-id]') : null;
      if (damus) { event.preventDefault(); requestDamus(damus.getAttribute('data-damus-id'), damus); return; }
      var image = event.target && event.target.closest ? event.target.closest('.nchat-image-wrap img') : null;
      if (!image) return;
      var win = window.open('about:blank', '_blank');
      if (win) { win.document.write('<title>Imagen NostraCHAT</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="' + image.src + '" style="max-width:98vw;max-height:98vh;object-fit:contain"></body>'); win.document.close(); }
    }, true);
  }

  function run() {
    injectStyles();
    bindGlobalEvents();
    var tries = 0;
    var timer = setInterval(function () { tries += 1; if (buildImageUI() || tries > 40) clearInterval(timer); }, 250);
    if (runtime) startPresenceTimer();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();