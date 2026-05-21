/* Cuenta Nostra - navegacion superior limpia */
(function () {
  'use strict';

  function applyCuentaNav() {
    if (!/cuenta-nostra\.html$/i.test(location.pathname)) return;
    var menu = document.querySelector('header.nav .menu');
    if (!menu || menu.dataset.cuentaNavReady === '1') return;

    menu.innerHTML = [
      '<a href="index.html">Inicio</a>',
      '<a href="ciclos.html">Ciclos</a>',
      '<a href="cachimbos.html">Cachimbos</a>',
      '<a href="blog.html">Noticias</a>',
      '<a href="clases-en-vivo.html">Clases en vivo</a>'
    ].join('');
    menu.dataset.cuentaNavReady = '1';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCuentaNav);
  } else {
    applyCuentaNav();
  }

  setTimeout(applyCuentaNav, 400);
  setTimeout(applyCuentaNav, 1200);
})();
