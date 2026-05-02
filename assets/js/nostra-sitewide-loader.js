/* ==================================================
   Grupo Nostradamus - Loader global de estilo institucional
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  var isIq100 = path.indexOf('iq100.html') !== -1;

  if (isIq100) return;

  var VERSION = '2026-14';

  function assetAlreadyLoaded(urlPart) {
    return !!document.querySelector('link[href*="' + urlPart + '"], script[src*="' + urlPart + '"]');
  }

  function loadJS(src) {
    if (assetAlreadyLoaded(src.split('?')[0])) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function init() {
    loadJS('assets/js/nostra-analytics.js?v=' + VERSION);
    loadJS('assets/js/nostra-mobile-menu-pro.js?v=' + VERSION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
