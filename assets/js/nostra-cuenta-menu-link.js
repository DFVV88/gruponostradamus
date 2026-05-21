/* Grupo Nostradamus - Link global NostraCUENTA en menus */
(function () {
  'use strict';

  var path = location.pathname.toLowerCase();
  var fileName = path.split('/').pop() || 'index.html';
  var isCuenta = fileName === 'cuenta-nostra.html';
  var isIq100 = fileName === 'iq100.html';

  if (isIq100) return;

  function hasCuenta(root) {
    return !!root.querySelector('a[href="cuenta-nostra.html"]');
  }

  function makeClassicItem() {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = 'cuenta-nostra.html';
    a.textContent = 'NostraCUENTA';
    if (isCuenta) {
      a.classList.add('active');
      li.classList.add('active');
    }
    li.appendChild(a);
    return li;
  }

  function addToClassicMenus() {
    document.querySelectorAll('.main-menu > ul, .th-mobile-menu > ul').forEach(function (menu) {
      if (hasCuenta(menu)) return;
      var chat = Array.prototype.slice.call(menu.querySelectorAll(':scope > li > a')).find(function (a) {
        return (a.textContent || '').trim().toLowerCase().indexOf('nostrachat') !== -1;
      });
      var li = makeClassicItem();
      if (chat && chat.parentElement) chat.parentElement.insertAdjacentElement('afterend', li);
      else menu.insertBefore(li, menu.firstElementChild);
    });
  }

  function makeSharedItem() {
    var item = document.createElement('div');
    item.className = 'nostra-nav-item nostra-cuenta-nav-item';
    var a = document.createElement('a');
    a.className = 'nostra-nav-link nostra-cuenta-nav-link' + (isCuenta ? ' active' : '');
    a.href = 'cuenta-nostra.html';
    a.textContent = 'NOSTRACUENTA';
    item.appendChild(a);
    return item;
  }

  function addToSharedHeader() {
    var nav = document.querySelector('.nostra-nav');
    if (nav && !hasCuenta(nav)) {
      var chatItem = Array.prototype.slice.call(nav.querySelectorAll('.nostra-nav-link')).find(function (a) {
        return (a.textContent || '').trim().toLowerCase().indexOf('nostrachat') !== -1;
      });
      var item = makeSharedItem();
      if (chatItem && chatItem.closest('.nostra-nav-item')) chatItem.closest('.nostra-nav-item').insertAdjacentElement('afterend', item);
      else nav.insertBefore(item, nav.firstElementChild);
    }

    var mobile = document.querySelector('.nostra-mobile-panel');
    if (mobile && !hasCuenta(mobile)) {
      var aMobile = document.createElement('a');
      aMobile.href = 'cuenta-nostra.html';
      aMobile.textContent = 'NOSTRACUENTA';
      if (isCuenta) aMobile.className = 'active';
      var chatMobile = Array.prototype.slice.call(mobile.querySelectorAll('a')).find(function (a) {
        return (a.textContent || '').trim().toLowerCase().indexOf('nostrachat') !== -1;
      });
      if (chatMobile) chatMobile.insertAdjacentElement('afterend', aMobile);
      else mobile.insertBefore(aMobile, mobile.firstElementChild);
    }
  }

  function addStyles() {
    if (document.getElementById('nostra-cuenta-menu-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-cuenta-menu-style';
    style.textContent = '.nostra-cuenta-nav-link{color:#078c95!important;font-weight:950!important}.nostra-cuenta-nav-link.active,.nostra-cuenta-nav-link:hover{color:#ff941e!important}';
    document.head.appendChild(style);
  }

  function run() {
    addStyles();
    addToClassicMenus();
    addToSharedHeader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  setTimeout(run, 500);
  setTimeout(run, 1400);
  setTimeout(run, 2600);
  setTimeout(run, 4200);
})();
