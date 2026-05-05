/* ==================================================
   NostraCHAT Admin - MathJax para moderación
   Renderiza ecuaciones LaTeX en mensajes del panel admin.
================================================== */
(function () {
  var isReady = false;
  var pending = false;

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
          isReady = true;
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

  function normalizeLatex(root) {
    if (!root) return;
    root.querySelectorAll('.admin-text').forEach(function (el) {
      if (el.dataset.nchatLatexFixed === '1') return;
      el.innerHTML = el.innerHTML
        .replace(/\\sen/g, '\\sin')
        .replace(/\\tg/g, '\\tan')
        .replace(/\\senh/g, '\\sinh')
        .replace(/\\arcsen/g, '\\arcsin');
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
          setTimeout(typesetAdmin, 80);
        });
        observer.observe(list, { childList: true, subtree: true });
        typesetAdmin();
      }
      if (tries > 80) clearInterval(timer);
    }, 250);
  }

  function run() {
    loadMathJax();
    observeAdminList();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.admin-tab')) {
        setTimeout(typesetAdmin, 350);
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
