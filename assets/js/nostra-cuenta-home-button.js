/* Grupo Nostradamus - Renombra el boton de registro del inicio a NostraCUENTA */
(function () {
  'use strict';

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path.endsWith('/');
  }

  function apply() {
    if (!isHomePage()) return;

    document.querySelectorAll('a.nostra-register-btn, a.nostra-register-mobile-btn').forEach(function (link) {
      link.href = 'cuenta-nostra.html';
      link.innerHTML = '🔐 NostraCUENTA';
      link.setAttribute('aria-label', 'Ingresar o activar NostraCUENTA');
      link.setAttribute('title', 'Ingresar o activar NostraCUENTA');
    });

    document.querySelectorAll('.nostra-register-mobile .live-help-text').forEach(function (text) {
      text.textContent = 'Activa tu cuenta, ingresa a NostraCHAT y accede a tus beneficios académicos';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 2300);
  setTimeout(apply, 4500);
})();
