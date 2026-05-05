/* ==================================================
   NostraCHAT Admin - MathJax + formato DAMUS
   Renderiza ecuaciones LaTeX y mejora lectura en moderación.
================================================== */
(function () {
  var pending = false;

  function injectStyles() {
    if (document.getElementById('nchat-admin-mathjax-style')) return;
    var style = document.createElement('style');
    style.id = 'nchat-admin-mathjax-style';
    style.textContent = `
      .admin-text.nchat-damus-formatted{
        line-height:1.75;
        font-size:15px;
      }
      .admin-text.nchat-damus-formatted .nchat-damus-line{
        display:block;
        margin:8px 0;
      }
      .admin-text.nchat-damus-formatted .nchat-damus-title{
        display:block;
        margin:10px 0 6px;
        font-weight:950;
        color:#061426;
      }
      .admin-text.nchat-damus-formatted .nchat-damus-step{
        display:block;
        margin:7px 0;
        padding:8px 10px;
        border-left:4px solid rgba(7,140,149,.38);
        background:#f7fdff;
        border-radius:10px;
      }
      .admin-text mjx-container{
        overflow-x:auto;
        overflow-y:hidden;
        max-width:100%;
      }
    `;
    document.head.appendChild(style);
  }

  function configureMathJax() {
    if (window.MathJax) return;
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      },
      startup: {
        ready: function () {
          window.MathJax.startup.defaultReady();
          typesetAdmin();
        }
      }
    };
  }

  function loadMathJax() {
    if (document.getElementById('nchat-admin-mathjax-script')) return;
    configureMathJax();
    var script = document.createElement('script');
    script.id = 'nchat-admin-mathjax-script';
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    document.head.appendChild(script);
  }

  function protectMath(html) {
    var store = [];
    var protectedHtml = html.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g, function (match) {
      var key = '%%NCHAT_MATH_' + store.length + '%%';
      store.push(match);
      return key;
    });
    return { html: protectedHtml, store: store };
  }

  function restoreMath(html, store) {
    return html.replace(/%%NCHAT_MATH_(\d+)%%/g, function (_, i) {
      return store[Number(i)] || '';
    });
  }

  function formatDamusHtml(rawHtml) {
    var protectedBlock = protectMath(rawHtml);
    var h = protectedBlock.html;

    h = h
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    h = h
      .replace(/(🤖\s*DAMUS Académico)/g, '<span class="nchat-damus-title">$1</span>')
      .replace(/(📌\s*Tema probable:)/g, '<span class="nchat-damus-line"><b>$1</b>')
      .replace(/(🧠\s*Datos o condición clave:)/g, '</span><span class="nchat-damus-line"><b>$1</b>')
      .replace(/(🧪\s*Desarrollo paso a paso:)/g, '</span><span class="nchat-damus-title">$1</span>')
      .replace(/(✅\s*Posible respuesta final:)/g, '<span class="nchat-damus-title">$1</span>')
      .replace(/(🔑\s*Posible clave:)/g, '<span class="nchat-damus-line"><b>$1</b>')
      .replace(/(⚠️\s*Verificación:)/g, '</span><span class="nchat-damus-line"><b>$1</b>')
      .replace(/(⚠️\s*Esta es una respuesta generada automáticamente\.)/g, '</span><span class="nchat-damus-line"><b>$1</b>');

    h = h.replace(/\s(\d+\.\s)/g, '<span class="nchat-damus-step">$1');
    h = h.replace(/(<span class="nchat-damus-step">\d+\.\s[\s\S]*?)(?=<span class="nchat-damus-step">|<span class="nchat-damus-title">|<span class="nchat-damus-line">|$)/g, function (m) {
      return m + '</span>';
    });

    h = h.replace(/<span class="nchat-damus-line"><b>📌\s*Tema probable:<\/b>([\s\S]*?)(?=<\/span>|<span)/g, '<span class="nchat-damus-line"><b>📌 Tema probable:</b>$1');

    return restoreMath(h, protectedBlock.store);
  }

  function normalizeLatex(root) {
    if (!root) return;
    root.querySelectorAll('.admin-text').forEach(function (el) {
      if (el.dataset.nchatLatexFixed === '1') return;

      el.innerHTML = el.innerHTML
        .replace(/\\sen/g, '\\sin')
        .replace(/\\tg/g, '\\tan')
        .replace(/\\senh/g, '\\sinh')
        .replace(/\\arcsen/g, '\\arcsin');

      if (/DAMUS Académico|Desarrollo paso a paso|Tema probable|Posible respuesta final/.test(el.textContent || '')) {
        el.innerHTML = formatDamusHtml(el.innerHTML);
        el.classList.add('nchat-damus-formatted');
      }

      el.dataset.nchatLatexFixed = '1';
    });
  }

  function typesetAdmin() {
    var root = document.getElementById('admin-list');
    if (!root) return;
    normalizeLatex(root);
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    if (pending) return;
    pending = true;
    window.MathJax.typesetPromise([root]).catch(function (err) {
      console.warn('NostraCHAT Admin MathJax error:', err);
    }).finally(function () {
      pending = false;
    });
  }

  function observeAdminList() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var list = document.getElementById('admin-list');
      if (list) {
        clearInterval(timer);
        var observer = new MutationObserver(function () {
          setTimeout(typesetAdmin, 100);
        });
        observer.observe(list, { childList: true, subtree: true });
        typesetAdmin();
      }
      if (tries > 80) clearInterval(timer);
    }, 250);
  }

  function run() {
    injectStyles();
    loadMathJax();
    observeAdminList();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.admin-tab')) {
        setTimeout(typesetAdmin, 400);
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
