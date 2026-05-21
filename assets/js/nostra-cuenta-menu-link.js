/* Grupo Nostradamus - Boton global NostraCUENTA junto a CLASES EN VIVO */
(function () {
  'use strict';

  var path = location.pathname.toLowerCase();
  var fileName = path.split('/').pop() || 'index.html';
  var isCuenta = fileName === 'cuenta-nostra.html';
  var isIq100 = fileName === 'iq100.html';

  if (isIq100) return;

  function hasCuenta(root) {
    return !!root.querySelector('a[href^="cuenta-nostra.html"]');
  }

  function removeMenuCuentaLinks() {
    document.querySelectorAll('.nostra-nav a[href^="cuenta-nostra.html"], .main-menu a[href^="cuenta-nostra.html"], .th-mobile-menu a[href^="cuenta-nostra.html"]').forEach(function (a) {
      var li = a.closest('li');
      var item = a.closest('.nostra-nav-item');
      if (li) li.remove();
      else if (item) item.remove();
      else a.remove();
    });
  }

  function addStyles() {
    if (document.getElementById('nostra-cuenta-top-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-cuenta-top-style';
    style.textContent = `
      .nostra-cuenta-top-btn{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        min-height:40px!important;
        padding:9px 20px!important;
        border-radius:10px!important;
        background:linear-gradient(135deg,#00b8d9 0%,#0b63ff 55%,#1a237e 100%)!important;
        color:#fff!important;
        font-size:14px!important;
        font-weight:950!important;
        line-height:1!important;
        letter-spacing:.35px!important;
        text-transform:uppercase!important;
        text-decoration:none!important;
        box-shadow:0 0 22px rgba(11,99,255,.35),0 12px 28px rgba(0,0,0,.12)!important;
        white-space:nowrap!important;
      }
      .nostra-cuenta-top-btn:hover{color:#fff!important;filter:saturate(1.15) brightness(1.06)!important;transform:translateY(-2px)!important;}
      .nostra-mobile-panel a.nostra-cuenta-mobile-btn{background:linear-gradient(135deg,#00b8d9,#0b63ff,#1a237e)!important;color:#fff!important;}
      @media(max-width:1199px){.nostra-cuenta-top-btn{font-size:12px!important;padding:9px 15px!important;}}
    `;
    document.head.appendChild(style);
  }

  function createTopButton() {
    var a = document.createElement('a');
    a.className = 'nostra-cuenta-top-btn' + (isCuenta ? ' active' : '');
    a.href = 'cuenta-nostra.html';
    a.textContent = '🔐 NOSTRACUENTA';
    a.setAttribute('aria-label', 'Ingresar o activar NostraCUENTA');
    return a;
  }

  function addNextToLiveSharedHeader() {
    var infoRight = document.querySelector('.nostra-info-right');
    if (!infoRight || hasCuenta(infoRight)) return;
    var live = infoRight.querySelector('.nostra-live');
    var btn = createTopButton();
    if (live) live.insertAdjacentElement('afterend', btn);
    else infoRight.insertBefore(btn, infoRight.firstElementChild);
  }

  function addNextToLiveClassicHeader() {
    document.querySelectorAll('.header-top, .top-area, .header-layout1, .header-layout2').forEach(function (area) {
      if (hasCuenta(area)) return;
      var live = area.querySelector('a[data-nostra-live-fixed="internal-live-page"], a[href*="clases-en-vivo.html"], a[href*="teams.microsoft.com"]');
      if (!live) return;
      var btn = createTopButton();
      var li = live.closest('li');
      if (li && li.parentElement) {
        var item = document.createElement('li');
        item.className = 'd-none d-lg-inline-block nostra-cuenta-top-item';
        item.appendChild(btn);
        li.insertAdjacentElement('afterend', item);
      } else {
        live.insertAdjacentElement('afterend', btn);
      }
    });
  }

  function addToMobileSharedHeader() {
    var mobile = document.querySelector('.nostra-mobile-panel');
    if (!mobile || hasCuenta(mobile)) return;
    var aMobile = document.createElement('a');
    aMobile.href = 'cuenta-nostra.html';
    aMobile.textContent = '🔐 NOSTRACUENTA';
    aMobile.className = 'nostra-cuenta-mobile-btn' + (isCuenta ? ' active' : '');
    var liveMobile = Array.prototype.slice.call(mobile.querySelectorAll('a')).find(function (a) {
      return (a.textContent || '').toLowerCase().indexOf('clases') !== -1 || (a.href || '').toLowerCase().indexOf('teams.microsoft.com') !== -1;
    });
    if (liveMobile) liveMobile.insertAdjacentElement('afterend', aMobile);
    else mobile.insertBefore(aMobile, mobile.firstElementChild);
  }

  function run() {
    addStyles();
    removeMenuCuentaLinks();
    addNextToLiveSharedHeader();
    addNextToLiveClassicHeader();
    addToMobileSharedHeader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  setTimeout(run, 500);
  setTimeout(run, 1400);
  setTimeout(run, 2600);
  setTimeout(run, 4200);
})();
