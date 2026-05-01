/* ==================================================
   Grupo Nostradamus - Loader global de estilo institucional
   Aplica en subpáginas el mismo look futurista del index.
   Excepción: iq100.html conserva su formato original.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  var isIq100 = path.indexOf('iq100.html') !== -1;

  if (isIq100) return;

  var VERSION = '2026-05';

  function assetAlreadyLoaded(urlPart) {
    return !!document.querySelector('link[href*="' + urlPart + '"], script[src*="' + urlPart + '"]');
  }

  function loadCSS(href) {
    if (assetAlreadyLoaded(href.split('?')[0])) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadJS(src) {
    if (assetAlreadyLoaded(src.split('?')[0])) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function applyBodyClass() {
    if (document.body) {
      document.body.classList.add('nostra-sitewide-format');
    }
  }

  function injectBaseEnhancements() {
    if (document.getElementById('nostra-sitewide-base-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-sitewide-base-style';
    style.textContent = `
      body.nostra-sitewide-format{
        background:
          radial-gradient(circle at top left, rgba(0,194,209,.10), transparent 32%),
          linear-gradient(180deg,#ffffff 0%,#f4f8fa 40%,#eef4f7 100%) !important;
      }
      .breadcumb-wrapper,
      .breadcumb-area{
        background:
          radial-gradient(circle at 20% 20%, rgba(0,194,209,.30), transparent 30%),
          linear-gradient(135deg,#02070d 0%,#061426 50%,#062c34 100%) !important;
        border-bottom:1px solid rgba(0,194,209,.35) !important;
      }
      .breadcumb-title,
      .breadcumb-menu,
      .breadcumb-menu a{
        color:#ffffff !important;
        text-shadow:0 3px 10px rgba(0,0,0,.65) !important;
      }
      .breadcumb-title{
        font-style:italic !important;
        text-transform:uppercase !important;
        background:linear-gradient(180deg,#ffffff,#dfe7ed 48%,#8f9aa5 70%,#ffffff) !important;
        -webkit-background-clip:text !important;
        background-clip:text !important;
        -webkit-text-fill-color:transparent !important;
        filter:drop-shadow(0 2px 0 rgba(0,0,0,.55)) drop-shadow(0 0 14px rgba(0,194,209,.28)) !important;
      }
      .space,
      .space-top,
      .space-bottom,
      .bg-smoke{
        background:
          linear-gradient(135deg,rgba(255,255,255,.96),rgba(232,240,244,.92)),
          radial-gradient(circle at top right,rgba(0,194,209,.18),transparent 34%) !important;
      }
      .th-btn,
      .th-btn:visited{
        position:relative !important;
        isolation:isolate !important;
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    applyBodyClass();
    injectBaseEnhancements();

    loadCSS('assets/css/nostra-futurista.css?v=' + VERSION);
    loadJS('assets/js/nostra-grid-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-footer-pro.js?v=' + VERSION);
    loadJS('assets/js/nostra-button-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-whatsapp-inscripcion.js?v=' + VERSION);
    loadJS('assets/js/nostra-content-polish.js?v=' + VERSION);
    loadJS('assets/js/nostra-page-polish.js?v=' + VERSION);
    loadJS('assets/js/nostra-mobile-menu-pro.js?v=' + VERSION);
    loadJS('assets/js/nostra-performance-pro.js?v=' + VERSION);
     loadJS('assets/js/nostra-social-seo.js?v=' + VERSION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
