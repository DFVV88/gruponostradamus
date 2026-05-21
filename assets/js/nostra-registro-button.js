/* Grupo Nostradamus - Boton de registro en inicio */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path.endsWith('/');
  }

  function addStyles() {
    if (document.getElementById('nostra-register-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-register-style';
    style.textContent = '.nostra-register-btn,.nostra-register-mobile-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-height:42px!important;padding:10px 20px!important;border-radius:14px!important;border:1px solid rgba(255,255,255,.30)!important;background:linear-gradient(135deg,#00b8d9 0%,#0b63ff 55%,#1a237e 100%)!important;color:#fff!important;font-family:Jost,Arial,sans-serif!important;font-size:14px!important;font-weight:950!important;line-height:1!important;letter-spacing:.32px!important;text-transform:uppercase!important;text-decoration:none!important;box-shadow:0 0 22px rgba(11,99,255,.35),0 12px 28px rgba(0,0,0,.12)!important;transition:transform .22s ease,filter .22s ease,box-shadow .22s ease!important}.nostra-register-btn:hover,.nostra-register-mobile-btn:hover{color:#fff!important;transform:translateY(-3px) scale(1.025)!important;filter:saturate(1.15) brightness(1.06)!important}.nostra-register-mobile .live-help-text{margin:6px 12px 0!important;font-size:12px!important;line-height:1.35!important}@media(max-width:991px){.nostra-register-btn,.nostra-register-mobile-btn{min-height:42px!important;padding:10px 18px!important;font-size:13px!important;border-radius:13px!important}}';
    document.head.appendChild(style);
  }

  function cleanOldItems() {
    document.querySelectorAll('.nostra-registro-desktop,.nostra-registro-mobile').forEach(function (item) {
      item.parentNode && item.parentNode.removeChild(item);
    });
  }

  function addMobileButton() {
    var list = document.querySelector('.th-mobile-menu ul');
    if (!list || document.querySelector('.nostra-registro-mobile')) return;
    var liveItem = list.querySelector('.only-mobile-live');
    var item = document.createElement('li');
    item.className = 'only-mobile-live nostra-registro-mobile nostra-register-mobile';
    item.style.margin = '12px 0';
    item.style.textAlign = 'center';
    item.innerHTML = '<a href="registro.html" class="nostra-register-mobile-btn">📝 REGÍSTRATE</a><p class="live-help-text">Accede a matrícula online, NostraCHAT y beneficios académicos</p>';
    if (liveItem) liveItem.insertAdjacentElement('afterend', item);
    else list.insertBefore(item, list.firstChild);
  }

  function addDesktopButton() {
    if (document.querySelector('.nostra-registro-desktop')) return;
    var live = document.querySelector('.header-top a[data-nostra-live-fixed="internal-live-page"], .header-top .dropdown-link > a');
    if (!live) return;
    var liveItem = live.closest('li');
    if (!liveItem || !liveItem.parentNode) return;
    var item = document.createElement('li');
    item.className = 'd-none d-lg-inline-block nostra-registro-desktop';
    item.innerHTML = '<a href="registro.html" class="nostra-register-btn">📝 REGÍSTRATE</a>';
    liveItem.insertAdjacentElement('afterend', item);
  }

  function init() {
    if (!isHomePage()) return;
    addStyles();
    cleanOldItems();
    addMobileButton();
    addDesktopButton();
  }

  ready(function () {
    init();
    setTimeout(init, 700);
    setTimeout(init, 2200);
    setTimeout(init, 4200);
  });
})();
