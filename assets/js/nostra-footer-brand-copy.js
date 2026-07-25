/* ==================================================
   Grupo Nostradamus - Texto institucional breve del footer
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var BRAND_TEXT = 'GRUPO DE ESTUDIO ESPECIALIZADO EN PREPARACIÓN UNI.';

  function updateBrandCopy() {
    var text = document.querySelector('.nfh-brand-copy p');
    if (!text) return false;

    text.textContent = BRAND_TEXT;
    text.setAttribute('data-nfh-brand-copy-ready', '1');
    return true;
  }

  function start() {
    if (updateBrandCopy()) return;

    var observer = new MutationObserver(function () {
      if (updateBrandCopy()) observer.disconnect();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (updateBrandCopy() || attempts >= 30) {
        window.clearInterval(timer);
        observer.disconnect();
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
