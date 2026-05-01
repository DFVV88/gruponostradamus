/* ==================================================
   Grupo Nostradamus - Acceso a Clases en Vivo PRO
   Redirige los botones de CLASES EN VIVO a una página interna
   con instrucciones, soporte y enlaces seguros a Microsoft Teams.
   No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;
  if (path.indexOf('clases-en-vivo.html') !== -1) return;

  var LIVE_PAGE_URL = 'clases-en-vivo.html';

  function normalizeText(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isLiveElement(el) {
    if (!el) return false;
    var text = normalizeText(el.textContent || '');
    var href = normalizeText(el.getAttribute && el.getAttribute('href') || '');
    var cls = normalizeText(el.className || '');
    var id = normalizeText(el.id || '');

    return (
      text.indexOf('clases en vivo') !== -1 ||
      text.indexOf('clase en vivo') !== -1 ||
      cls.indexOf('btn-live') !== -1 ||
      (cls.indexOf('live') !== -1 && text.indexOf('clases') !== -1) ||
      (id.indexOf('dropdownmenulink') !== -1 && text.indexOf('clases') !== -1) ||
      (href.indexOf('teams.microsoft.com') !== -1 && (text.indexOf('clases') !== -1 || text.indexOf('iniciar sesion') !== -1)) ||
      (href.indexOf('q10.com') !== -1 && (text.indexOf('clases') !== -1 || text.indexOf('iniciar sesion') !== -1))
    );
  }

  function cleanDropdownBehavior(link) {
    link.removeAttribute('data-bs-toggle');
    link.removeAttribute('data-toggle');
    link.removeAttribute('aria-expanded');
    link.removeAttribute('role');
    link.classList.remove('dropdown-toggle');
  }

  function makeInternalLiveLink(link, label) {
    if (!link) return;

    link.setAttribute('href', LIVE_PAGE_URL);
    link.removeAttribute('target');
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('data-nostra-live-fixed', 'internal-live-page');
    link.style.cursor = 'pointer';
    cleanDropdownBehavior(link);

    if (label) link.innerHTML = label;
  }

  function fixLiveLinks() {
    document.querySelectorAll('a, button, .btn-live, .btn-live-mobile, .dropdown-link > a').forEach(function (el) {
      if (isLiveElement(el)) {
        if (el.tagName && el.tagName.toLowerCase() === 'a') {
          makeInternalLiveLink(el, '🔴 CLASES EN VIVO');
        } else {
          el.setAttribute('data-nostra-live-fixed', 'internal-live-page');
          el.style.cursor = 'pointer';
        }
      }
    });

    document.querySelectorAll('.dropdown-menu a, .sub-menu a').forEach(function (link) {
      var text = normalizeText(link.textContent);
      var href = normalizeText(link.getAttribute('href') || '');
      if ((href.indexOf('teams.microsoft.com') !== -1 || href.indexOf('q10') !== -1) &&
          (text.indexOf('iniciar') !== -1 || text.indexOf('clases') !== -1 || text.indexOf('vivo') !== -1)) {
        makeInternalLiveLink(link, 'Instrucciones de acceso');
      }
    });
  }

  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('a, button, .btn-live, .btn-live-mobile, .dropdown-link > a') : null;
    if (!target) return;

    if (isLiveElement(target) || target.getAttribute('data-nostra-live-fixed') === 'internal-live-page') {
      if (target.tagName && target.tagName.toLowerCase() === 'a') return;
      event.preventDefault();
      window.location.href = LIVE_PAGE_URL;
    }
  }, true);

  function init() {
    fixLiveLinks();
    setTimeout(fixLiveLinks, 250);
    setTimeout(fixLiveLinks, 800);
    setTimeout(fixLiveLinks, 1600);
    setTimeout(fixLiveLinks, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
