/* ==================================================
   Grupo Nostradamus - Fix Clases en Vivo
   Hace que todo botón/enlace de CLASES EN VIVO apunte a Teams,
   igual que en el index. No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var TEAMS_URL = 'https://teams.microsoft.com';

  function normalizeText(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isLiveClassesLink(link) {
    var text = normalizeText(link.textContent);
    var href = (link.getAttribute('href') || '').toLowerCase();
    var cls = normalizeText(link.className || '');

    return (
      text.indexOf('clases en vivo') !== -1 ||
      text.indexOf('clase en vivo') !== -1 ||
      text.indexOf('iniciar sesion') !== -1 && href.indexOf('q10') !== -1 ||
      cls.indexOf('btn-live') !== -1 ||
      cls.indexOf('live') !== -1 && href.indexOf('q10') !== -1
    );
  }

  function fixLiveLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      var text = normalizeText(link.textContent);

      if (isLiveClassesLink(link) || (href.indexOf('q10.com') !== -1 && (text.indexOf('clases') !== -1 || text.indexOf('iniciar sesion') !== -1))) {
        link.setAttribute('href', TEAMS_URL);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('data-nostra-live-fixed', 'teams');

        if (text.indexOf('clases') !== -1 || link.classList.contains('btn-live') || link.classList.contains('btn-live-mobile')) {
          link.innerHTML = '🔴 CLASES EN VIVO';
        }
      }
    });

    document.querySelectorAll('.dropdown-menu a[href*="q10"], .sub-menu a[href*="q10"]').forEach(function (link) {
      var text = normalizeText(link.textContent);
      if (text.indexOf('iniciar') !== -1 || text.indexOf('clases') !== -1 || text.indexOf('vivo') !== -1) {
        link.setAttribute('href', TEAMS_URL);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = 'Iniciar sesión';
      }
    });
  }

  function init() {
    fixLiveLinks();
    setTimeout(fixLiveLinks, 400);
    setTimeout(fixLiveLinks, 1200);
    setTimeout(fixLiveLinks, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
