/* Grupo Nostradamus - Acceso público a programas y precios */
(function () {
  'use strict';

  var PRICES = 'programas-precios.html';
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('admin-preinscripciones.html') !== -1 || path.indexOf('iq100.html') !== -1) return;

  function addMenuLinks() {
    document.querySelectorAll('.main-menu > ul, .th-mobile-menu > ul').forEach(function (menu) {
      if (menu.querySelector('a[href*="programas-precios.html"]')) return;
      var li = document.createElement('li');
      li.setAttribute('data-nostra-prices-link', '1');
      li.innerHTML = '<a href="' + PRICES + '">Precios</a>';
      var contact = Array.from(menu.children).find(function (item) {
        var link = item.querySelector && item.querySelector('a');
        return link && /contacto/i.test(link.textContent || '');
      });
      if (contact) menu.insertBefore(li, contact);
      else menu.appendChild(li);
    });
  }

  function addHeroLink() {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!(file === 'index.html' || file === '' || location.pathname === '/')) return;
    var actions = document.querySelector('#hero .nostra-home-actions');
    if (!actions || document.getElementById('nostra-prices-hero')) return;
    var link = document.createElement('a');
    link.id = 'nostra-prices-hero';
    link.href = PRICES;
    link.className = 'th-btn style6';
    link.innerHTML = '💰 VER PROGRAMAS Y PRECIOS';
    actions.appendChild(link);
  }

  function addFooterLink() {
    var footer = document.querySelector('footer, .footer-wrapper');
    if (!footer || footer.querySelector('a[href*="programas-precios.html"]')) return;
    var link = document.createElement('a');
    link.href = PRICES;
    link.textContent = 'Programas y precios';
    link.style.cssText = 'display:inline-flex;margin:8px 10px 8px 0;font-weight:850;text-decoration:none;';
    var target = footer.querySelector('.footer-menu, .widget_nav_menu, .copyright-wrap, .container') || footer;
    target.appendChild(link);
  }

  function run() {
    addMenuLinks();
    addHeroLink();
    addFooterLink();
  }

  function start() {
    run();
    var attempts = 0;
    var timer = setInterval(function () {
      run();
      attempts += 1;
      if (attempts >= 20) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('load', run);
})();
