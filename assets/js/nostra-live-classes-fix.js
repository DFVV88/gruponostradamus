/* ==================================================
   Grupo Nostradamus - Acceso a Clases en Vivo PRO
   Redirige los botones de CLASES EN VIVO a una página interna
   y aplica un estilo premium con brillo, pulso y efecto hover.
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

  function injectLiveButtonStyles() {
    if (document.getElementById('nostra-live-classes-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-live-classes-pro-style';
    style.textContent = `
      @keyframes nostraLivePulse {
        0% { box-shadow:0 0 0 0 rgba(255,55,26,.58), 0 0 22px rgba(255,55,26,.48), 0 12px 28px rgba(0,0,0,.12); }
        70% { box-shadow:0 0 0 13px rgba(255,55,26,0), 0 0 34px rgba(255,55,26,.72), 0 14px 34px rgba(0,0,0,.16); }
        100% { box-shadow:0 0 0 0 rgba(255,55,26,0), 0 0 22px rgba(255,55,26,.48), 0 12px 28px rgba(0,0,0,.12); }
      }

      @keyframes nostraLiveDot {
        0%,100% { transform:scale(1); opacity:1; }
        50% { transform:scale(1.28); opacity:.74; }
      }

      @keyframes nostraLiveShine {
        0% { left:-90%; opacity:0; }
        22% { opacity:.75; }
        55% { left:120%; opacity:0; }
        100% { left:120%; opacity:0; }
      }

      .btn-live,
      .btn-live-mobile,
      .nostra-live,
      .nostra-live-pro,
      a[data-nostra-live-fixed="internal-live-page"]{
        position:relative !important;
        isolation:isolate !important;
        overflow:hidden !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:9px !important;
        min-height:42px !important;
        padding:10px 22px !important;
        border:1px solid rgba(255,255,255,.28) !important;
        border-radius:14px !important;
        background:linear-gradient(135deg,#ff2145 0%,#ff3b1f 46%,#ff7a18 100%) !important;
        color:#fff !important;
        font-family:'Jost', Arial, sans-serif !important;
        font-size:14px !important;
        font-weight:950 !important;
        line-height:1 !important;
        letter-spacing:.32px !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        text-shadow:0 1px 1px rgba(0,0,0,.18) !important;
        transform:translateZ(0) !important;
        box-shadow:0 0 22px rgba(255,55,26,.48), 0 12px 28px rgba(0,0,0,.12) !important;
        transition:transform .22s ease, filter .22s ease, box-shadow .22s ease !important;
        animation:nostraLivePulse 2.4s infinite !important;
      }

      .btn-live::before,
      .btn-live-mobile::before,
      .nostra-live::before,
      .nostra-live-pro::before,
      a[data-nostra-live-fixed="internal-live-page"]::before{
        content:'' !important;
        width:14px !important;
        height:14px !important;
        flex:0 0 14px !important;
        border-radius:999px !important;
        background:radial-gradient(circle at 35% 35%,#fff 0 10%,#ff8aa3 18%,#ff2f62 54%,#9a4dff 100%) !important;
        box-shadow:0 0 0 3px rgba(255,255,255,.12),0 0 14px rgba(255,124,164,.92) !important;
        animation:nostraLiveDot 1.15s ease-in-out infinite !important;
      }

      .btn-live::after,
      .btn-live-mobile::after,
      .nostra-live::after,
      .nostra-live-pro::after,
      a[data-nostra-live-fixed="internal-live-page"]::after{
        content:'' !important;
        position:absolute !important;
        top:-40% !important;
        left:-90% !important;
        width:58% !important;
        height:190% !important;
        z-index:-1 !important;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent) !important;
        transform:rotate(18deg) !important;
        animation:nostraLiveShine 3.2s ease-in-out infinite !important;
      }

      .btn-live:hover,
      .btn-live-mobile:hover,
      .nostra-live:hover,
      .nostra-live-pro:hover,
      a[data-nostra-live-fixed="internal-live-page"]:hover{
        color:#fff !important;
        transform:translateY(-3px) scale(1.025) !important;
        filter:saturate(1.18) brightness(1.06) !important;
        box-shadow:0 0 30px rgba(255,72,31,.82), 0 16px 34px rgba(255,49,35,.26), 0 12px 26px rgba(0,0,0,.18) !important;
      }

      .btn-live:active,
      .btn-live-mobile:active,
      .nostra-live:active,
      .nostra-live-pro:active,
      a[data-nostra-live-fixed="internal-live-page"]:active{
        transform:translateY(-1px) scale(.99) !important;
      }

      .dropdown-link .dropdown-menu,
      .btn-live + .dropdown-menu{
        border-radius:14px !important;
        border:0 !important;
        box-shadow:0 18px 40px rgba(0,0,0,.18) !important;
      }

      @media(max-width:991px){
        .btn-live,
        .btn-live-mobile,
        .nostra-live,
        .nostra-live-pro,
        a[data-nostra-live-fixed="internal-live-page"]{
          min-height:42px !important;
          padding:10px 18px !important;
          font-size:13px !important;
          border-radius:13px !important;
        }
      }
    `;
    document.head.appendChild(style);
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
      cls.indexOf('nostra-live') !== -1 ||
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
    link.classList.add('nostra-live-pro');
    link.style.cursor = 'pointer';
    cleanDropdownBehavior(link);

    if (label) link.innerHTML = label;
  }

  function fixLiveLinks() {
    injectLiveButtonStyles();

    document.querySelectorAll('a, button, .btn-live, .btn-live-mobile, .nostra-live, .dropdown-link > a').forEach(function (el) {
      if (isLiveElement(el)) {
        if (el.tagName && el.tagName.toLowerCase() === 'a') {
          makeInternalLiveLink(el, 'CLASES EN VIVO');
        } else {
          el.setAttribute('data-nostra-live-fixed', 'internal-live-page');
          el.classList.add('nostra-live-pro');
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
    var target = event.target && event.target.closest ? event.target.closest('a, button, .btn-live, .btn-live-mobile, .nostra-live, .dropdown-link > a') : null;
    if (!target) return;

    if (isLiveElement(target) || target.getAttribute('data-nostra-live-fixed') === 'internal-live-page') {
      if (target.tagName && target.tagName.toLowerCase() === 'a') return;
      event.preventDefault();
      window.location.href = LIVE_PAGE_URL;
    }
  }, true);

  function init() {
    injectLiveButtonStyles();
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
