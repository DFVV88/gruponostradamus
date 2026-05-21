/* ==================================================
   Grupo Nostradamus - Botón de registro / beneficios
   Inserta el acceso a registro al costado de Clases en Vivo
   y dentro del menú móvil.
================================================== */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path.endsWith('/');
  }

  function insertMobileButton() {
    var mobileList = document.querySelector('.th-mobile-menu ul');
    if (!mobileList || document.querySelector('.nostra-registro-mobile')) return;

    var liveItem = mobileList.querySelector('.only-mobile-live');
    var item = document.createElement('li');
    item.className = 'only-mobile-live nostra-registro-mobile';
    item.style.margin = '12px 0';
    item.style.textAlign = 'center';
    item.innerHTML = [
      '<a href="registro.html" class="btn-live-mobile">',
      '  📝 REGÍSTRATE',
      '</a>',
      '<p class="live-help-text">Accede a matrícula online, NostraCHAT y beneficios académicos</p>'
    ].join('');

    if (liveItem && liveItem.parentNode) {
      liveItem.insertAdjacentElement('afterend', item);
    } else {
      mobileList.insertBefore(item, mobileList.firstChild);
    }
  }

  function insertDesktopButton() {
    if (document.querySelector('.nostra-registro-desktop')) return;

    var liveDesktop = document.querySelector('.header-top .dropdown-link .btn-live');
    if (!liveDesktop) return;

    var liveLi = liveDesktop.closest('li');
    if (!liveLi || !liveLi.parentNode) return;

    var item = document.createElement('li');
    item.className = 'd-none d-lg-inline-block nostra-registro-desktop';
    item.innerHTML = [
      '<a href="registro.html" class="btn-live" style="padding:8px 16px;border-radius:30px;display:inline-block;text-decoration:none;">',
      '  📝 REGÍSTRATE',
      '</a>'
    ].join('');

    liveLi.insertAdjacentElement('afterend', item);
  }

  ready(function () {
    if (!isHomePage()) return;
    insertMobileButton();
    insertDesktopButton();
  });
})();
