/* ==================================================
   Grupo Nostradamus - Loader global restaurado + analytics
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  var isIq100 = path.indexOf('iq100.html') !== -1;

  if (isIq100) return;

  var VERSION = '2026-25';

  function assetAlreadyLoaded(urlPart) {
    return !!document.querySelector('script[src*="' + urlPart + '"]');
  }

  function loadJS(src) {
    if (assetAlreadyLoaded(src.split('?')[0])) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function init() {
    /* 🔥 ANALYTICS */
    loadJS('assets/js/nostra-analytics.js?v=' + VERSION);

    /* 🧭 HEADER PREMIUM PARA SUBPÁGINAS */
    loadJS('assets/js/shared-header.js?v=' + VERSION);
    loadJS('assets/js/nostra-contact-whatsapp-fix.js?v=' + VERSION);

    /* 🎨 RESTO DEL SISTEMA VISUAL */
    loadJS('assets/js/nostra-uni-campus-only.js?v=' + VERSION);
    loadJS('assets/js/nostra-ciclos-design-pro.js?v=' + VERSION);
    loadJS('assets/js/nostra-ciclos-horarios-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-ciclos-layout-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-ciclos-turnos-final.js?v=' + VERSION);
    loadJS('assets/js/nostra-ciclos-links.js?v=' + VERSION);
    loadJS('assets/js/nostra-grid-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-footer-pro.js?v=' + VERSION);
    loadJS('assets/js/nostra-button-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-whatsapp-inscripcion.js?v=' + VERSION);
    loadJS('assets/js/nostra-content-polish.js?v=' + VERSION);
    loadJS('assets/js/nostra-page-polish.js?v=' + VERSION);
    loadJS('assets/js/nostra-cachimbos-tabs.js?v=' + VERSION);
    loadJS('assets/js/nostra-mobile-menu-pro.js?v=' + VERSION);
    loadJS('assets/js/nostra-performance-pro.js?v=' + VERSION);
    loadJS('assets/js/nostra-social-seo.js?v=' + VERSION);
    loadJS('assets/js/nostra-offer-section-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-offer-uniform-override.js?v=' + VERSION);
    loadJS('assets/js/nostra-header-footer-premium.js?v=' + VERSION);
    loadJS('assets/js/nostra-live-classes-fix.js?v=' + VERSION);
    loadJS('assets/js/nostra-offer-hard-uniform.js?v=' + VERSION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
