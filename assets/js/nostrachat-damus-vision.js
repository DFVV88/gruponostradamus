/* ==================================================
   NostraCHAT DAMUS Vision
   Botón para pedir posible solución de ejercicios con imagen.
   No expone API keys. Usa endpoint seguro si existe.
================================================== */
(function () {
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var ENDPOINT = window.NOSTRA_DAMUS_VISION_ENDPOINT || '';
  var DAMUS_DAILY_LIMIT = 5;
  var DAMUS_MAX_CHARS = 6000;
  var DAMUS_COOLDOWN_SECONDS = 60;
  var COOLDOWN_KEY = 'nostrachat_damus_vision_cooldown_until';
  var app = null;
  var db = null;
  var fs = null;
  var imageCache = {};
  var currentRoomId = '';
  var unsubscribe = null;
  var working = {};
  var mathJaxLoading = false;
  var cooldownTimer = null;

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

  function getCooldownRemaining() {
    var until = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    var remaining = Math.ceil((until - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  function startCooldown(seconds) {
    var duration = Number(seconds || DAMUS_COOLDOWN_SECONDS);
    if (!duration || duration < 1) duration = DAMUS_COOLDOWN_SECONDS;
    duration = Math.max(duration, DAMUS_COOLDOWN_SECONDS);
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + duration * 1000));
    updateCooldownButtons();
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(function () {
      updateCooldownButtons();
      if (getCooldownRemaining() <= 0) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
        localStorage.removeItem(COOLDOWN_KEY);
        updateCooldownButtons();
      }
    }, 1000);
  }

  function updateCooldownButtons() {
    var remaining = getCooldownRemaining();
    document.querySelectorAll('[data-damus-vision-id]').forEach(function (btn) {
      if (working[btn.getAttribute('data-damus-vision-id')]) return;
      if (remaining > 0) {
        btn.disabled = true;
        btn.textContent = '⏳ DAMUS disponible en ' + remaining + ' s';
      } else if (btn.textContent.indexOf('Solicitud enviada') === -1) {
        btn.disabled = false;
        btn.textContent = '🤖 Pedir posible solución a DAMUS';
      }
    });
  }

  function parseRetrySeconds(message) {
    var text = String(message || '');
    var m = text.match(/retryDelay"?\s*:\s*"?(\d+(?:\.\d+)?)s/i) || text.match(/retryDelay[^0-9]*(\d+(?:\.\d+)?)/i);
    if (m && m[1]) return Math.ceil(Number(m[1]));
    m = text.match(/Please retry in\s*(\d+(?:\.\d+)?)s/i);
    if (m && m[1]) return Math.ceil(Number(m[1]));
    return DAMUS_COOLDOWN_SECONDS;
  }

  function isQuotaError(message) {
    return /429|RESOURCE_EXHAUSTED|quota|retryDelay|GenerateRequestsPerDay|FreeTier/i.test(String(message || ''));
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
      .nchat-damus-btn:disabled{opacity:.76;cursor:not-allowed;background:linear-gradient(135deg,#7e8792,#36515d,#061426);}\
      .nchat-damus-mini{font-size:11px;font-weight:850;opacity:.72;}\
      .nchat-msg.other .nchat-text{white-space:pre-wrap;line-height:1.58;}\
      .nchat-msg.other .nchat-text strong{font-weight:950;color:#061426;}\
      .nchat-msg.other .nchat-text mjx-container{margin:3px 0;max-width:100%;overflow-x:auto;overflow-y:hidden;}\
      .nchat-msg.other .nchat-text mjx-container[jax="CHTML"][display="true"]{display:block;text-align:left;}\
      .nchat-damus-answer{white-space:pre-wrap;}\
    ';
    document.head.appendChild(style);
  }

  function ensureMathJax(callback) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      callback();
      return;
    }
    if (mathJaxLoading) {
      setTimeout(function () { ensureMathJax(callback); }, 500);
      return;
    }
    mathJaxLoading = true;
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        processEscapes: true,
        packages: {'[+]': ['ams', 'noerrors', 'noundefined']}
      },
      loader: {load: ['[tex]/ams', '[tex]/noerrors', '[tex]/noundefined']},
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      }
    };
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    script.onload = function () {
      mathJaxLoading = false;
      callback();
    };
    script.onerror = function () {
      mathJaxLoading = false;
      console.warn('No se pudo cargar MathJax.');
    };
    document.head.appendChild(script);
  }

  function renderMath(el) {
    ensureMathJax(function () {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([el]).catch(function (err) {
          console.warn('MathJax render:', err);
        });
      }
    });
  }

  function fixLatexAliases(text) {
    return String(text || '')
      .replace(/\\sen/g, '\\sin')
      .replace(/\\tg/g, '\\tan')
      .replace(/\\cotg/g, '\\cot')
      .replace(/\\arcsen/g, '\\arcsin')
      .replace(/\bsen\s*([αa-zA-Z0-9])/g, '\\(\\sin $1\\)')
      .replace(/\bcos\s*([αa-zA-Z0-9])/g, '\\(\\cos $1\\)')
      .replace(/\btan\s*([αa-zA-Z0-9])/g, '\\(\\tan $1\\)')
      .replace(/\blog\s*([0-9a-zA-Z])/g, '\\(\\log $1\\)')
      .replace(/\bln\s*([0-9a-zA-Z])/g, '\\(\\ln $1\\)')
      .replace(/\blim\s/g, '\\(\\lim \\) ')
      .replace(/\bα\b/g, '\\(\\alpha\\)')
      .replace(/\bβ\b/g, '\\(\\beta\\)')
      .replace(/\bγ\b/g, '\\(\\gamma\\)')
      .replace(/\bθ\b/g, '\\(\\theta\\)')
      .replace(/\bπ\b/g, '\\(\\pi\\)')
      .replace(/∞/g, '\\(\\infty\\)')
      .replace(/≤/g, '\\(\\leq\\)')
      .replace(/≥/g, '\\(\\geq\\)')
      .replace(/≠/g, '\\(\\neq\\)')
      .replace(/≈/g, '\\(\\approx\\)')
      .replace(/→/g, '\\(\\to\\)')
      .replace(/±/g, '\\(\\pm\\)')
      .replace(/∑/g, '\\(\\sum\\)')
      .replace(/∫/g, '\\(\\int\\)')
      .replace(/√\s*([0-9a-zA-Z]+)/g, '\\(\\sqrt{$1}\\)');
  }

  function wrapLooseLatexLines(text) {
    return String(text || '').split('\n').map(function (line) {
      var trimmed = line.trim();
      if (!trimmed) return line;
      if (/^\s*(📌|🧠|✏️|✅|🔑|⚠️)/.test(line)) return line;
      if (trimmed.indexOf('\\(') !== -1 || trimmed.indexOf('\\[') !== -1) return line;
      if (/\\(frac|sqrt|sin|cos|tan|cot|sec|csc|log|ln|lim|sum|int|alpha|beta|gamma|theta|pi|Delta|vec|overline|angle|parallel|perp|leq|geq|neq|approx|to|pm|cdot|times)/.test(line)) {
        return '\\(' + trimmed + '\\)';
      }
      return line;
    }).join('\n');
  }

  function balanceInlineDelimiters(text) {
    var s = String(text || '');
    var openInline = (s.match(/\\\(/g) || []).length;
    var closeInline = (s.match(/\\\)/g) || []).length;
    if (openInline > closeInline) s += '\\)';
    var openDisplay = (s.match(/\\\[/g) || []).length;
    var closeDisplay = (s.match(/\\\]/g) || []).length;
    if (openDisplay > closeDisplay) s += '\\]';
    return s;
  }

  function normalizeMathDelimiters(text) {
    return balanceInlineDelimiters(
      wrapLooseLatexLines(
        fixLatexAliases(
          String(text || '')
            .replace(/\$\$([\s\S]*?)\$\$/g, '\\[$1\\]')
            .replace(/(^|[^\\])\$([^$\n]+?)\$/g, '$1\\($2\\)')
            .replace(/\\\[\s*$/gm, '')
            .replace(/^\s*\\\]\s*$/gm, '')
        )
      )
    );
  }

  function formatDamusMessages() {
    document.querySelectorAll('.nchat-msg.other .nchat-text').forEach(function (el) {
      var text = el.textContent || '';
      if (text.indexOf('DAMUS Académico') === -1 && text.indexOf('📌 Tema probable') === -1) return;
      if (el.getAttribute('data-damus-formatted') === '1') return;

      var cleaned = normalizeMathDelimiters(text)
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
      renderMath(el);
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
      updateCooldownButtons();
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
    updateCooldownButtons();
  }

  function buildPrompt(originalText) {
    return 'Eres DAMUS Académico, tutor del Grupo Nostradamus para postulantes UNI. Analiza la imagen del ejercicio. Da una POSIBLE solución educativa, no una respuesta absoluta. Si el enunciado no se lee bien, dilo claramente. Responde en español peruano académico con esta estructura:\n\n📌 Tema probable:\n🧠 Datos o condición clave:\n✏️ Desarrollo paso a paso:\n✅ Posible respuesta final:\n🔑 Posible clave:\n⚠️ Verificación:\n\nUsa LaTeX estándar para toda fórmula matemática de cualquier área: álgebra, geometría, trigonometría, cálculo, física, química, estadística, matrices, vectores y logaritmos. Usa fórmulas inline entre \\( y \\). Solo usa bloques \\[ \\] si son cortos y completos. No uses signos de dólar. Para trigonometría usa \\sin, \\cos y \\tan, NO uses \\sen. Para raíces usa \\sqrt{}, fracciones \\frac{}{}, límites \\lim, integrales \\int, sumatorias \\sum, vectores \\vec{}, ángulos \\angle, grados ^\\circ. Nunca dejes una fórmula sin cerrar.\n\nTexto escrito por el alumno: ' + (originalText || 'Sin texto adicional');
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
      text: String(answer || '').slice(0, DAMUS_MAX_CHARS),
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
    var remaining = getCooldownRemaining();
    if (remaining > 0) {
      updateCooldownButtons();
      return showNotice('⏳ DAMUS está ocupado. Espera ' + remaining + ' segundos y vuelve a intentarlo. No necesitas subir la imagen otra vez.', 'info');
    }
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
      var message = err && err.message ? err.message : 'error desconocido';
      if (isQuotaError(message)) {
        var wait = parseRetrySeconds(message);
        startCooldown(wait);
        showNotice('⏳ DAMUS está ocupado por muchas solicitudes. Espera ' + Math.max(wait, DAMUS_COOLDOWN_SECONDS) + ' segundos y vuelve a intentarlo. Tu imagen ya está en el chat.', 'info');
      } else {
        showNotice('No se pudo generar la respuesta de DAMUS. Intenta nuevamente en unos segundos.', 'error');
      }
      if (btn && !getCooldownRemaining()) {
        btn.disabled = false;
        btn.textContent = '🤖 Pedir posible solución a DAMUS';
      }
    }).finally(function () {
      working[messageId] = false;
      updateCooldownButtons();
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
    if (getCooldownRemaining() > 0) startCooldown(getCooldownRemaining());
    ensureFirebase().then(function () {
      setInterval(function () {
        listenImages();
        enhanceButtons();
        formatDamusMessages();
        updateCooldownButtons();
      }, 1200);
    }).catch(function (err) {
      console.warn('DAMUS Vision init:', err);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
