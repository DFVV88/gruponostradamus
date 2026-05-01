/* ==================================================
   Grupo Nostradamus - Fix Clases en Vivo
   Hace que todo botón/enlace de CLASES EN VIVO abra Teams directamente.
   Corrige dropdowns que antes impedían navegar.
   No afecta iq100.html.
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
    var id = normalizeText(link.id || '');

    return (
      text.indexOf('clases en vivo') !== -1 ||
      text.indexOf('clase en vivo') !== -1 ||
      cls.indexOf('btn-live') !== -1 ||
      cls.indexOf('live') !== -1 ||
      id.indexOf('dropdownmenulink') !== -1 && text.indexOf('clases') !== -1 ||
      href.indexOf('q10.com') !== -1 && (text.indexOf('clases') !== -1 || text.indexOf('iniciar sesion') !== -1)
    );
  }

  function makeTeamsDirectLink(link, label) {
    link.setAttribute('href', TEAMS_URL);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('data-nostra-live-fixed', 'teams-direct');

    // Evita que Bootstrap trate el botón como dropdown y bloquee la navegación.
    link.removeAttribute('data-bs-toggle');
    link.removeAttribute('data-toggle');
    link.removeAttribute('aria-expanded');
    link.removeAttribute('role');
    link.classList.remove('dropdown-toggle');

    if (label) link.innerHTML = label;

    if (!link.dataset.nostraLiveClickBound) {
      link.dataset.nostraLiveClickBound = '1';
      link.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        window.open(TEAMS_URL, '_blank', 'noopener,noreferrer');
      }, true);
    }
  }

  function fixLiveLinks() {
    document.querySelectorAll('a[href], a.btn-live, a.btn-live-mobile, .dropdown-link > a').forEach(function (link) {
      var text = normalizeText(link.textContent);
      if (isLiveClassesLink(link)) {
        var label = (text.indexOf('clases') !== -1 || link.classList.contains('btn-live') || link.classList.contains('btn-live-mobile'))
          ? '🔴 CLASES EN VIVO'
          : null;
        makeTeamsDirectLink(link, label);
      }
    });

    // En el menú desplegable, las opciones internas también deben ir a Teams si son de acceso.
    document.querySelectorAll('.dropdown-menu a, .sub-menu a').forEach(function (link) {
      var text = normalizeText(link.textContent);
      var href = (link.getAttribute('href') || '').toLowerCase();
      if (href.indexOf('q10') !== -1 && (text.indexOf('iniciar') !== -1 || text.indexOf('clases') !== -1 || text.indexOf('vivo') !== -1)) {
        makeTeamsDirectLink(link, 'Iniciar sesión');
      }
    });
  }

  function init() {
    fixLiveLinks();
    setTimeout(fixLiveLinks, 300);
    setTimeout(fixLiveLinks, 900);
    setTimeout(fixLiveLinks, 1800);
    setTimeout(fixLiveLinks, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
