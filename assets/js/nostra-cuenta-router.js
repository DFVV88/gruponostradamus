/* ==================================================
   Cuenta Nostra - Router hacia login/registro real
   Abre automáticamente la pestaña correcta en NostraCHAT.
================================================== */
(function () {
  'use strict';

  function getMode() {
    var params = new URLSearchParams(window.location.search || '');
    var raw = (params.get('cuenta') || params.get('auth') || params.get('modo') || '').toLowerCase();
    if (raw === 'registro' || raw === 'registrarme' || raw === 'register') return 'register';
    if (raw === 'login' || raw === 'ingresar' || raw === 'iniciar') return 'login';
    if ((window.location.hash || '').toLowerCase().indexOf('registro') !== -1) return 'register';
    if ((window.location.hash || '').toLowerCase().indexOf('login') !== -1) return 'login';
    return '';
  }

  function openTab(mode) {
    if (!mode) return false;
    var btn = document.querySelector('[data-auth-tab="' + mode + '"]');
    if (!btn) return false;
    btn.click();
    var panel = document.getElementById('nchat-auth-panel');
    if (panel && panel.scrollIntoView) {
      setTimeout(function () {
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 180);
    }
    return true;
  }

  function addBackLink() {
    if (document.getElementById('cuenta-nostra-back-link')) return;
    var panel = document.getElementById('nchat-auth-panel');
    if (!panel) return;
    var a = document.createElement('a');
    a.id = 'cuenta-nostra-back-link';
    a.href = 'registro.html';
    a.textContent = '← Volver al portal de registro';
    a.style.display = 'inline-flex';
    a.style.margin = '0 0 10px';
    a.style.fontWeight = '900';
    a.style.color = '#078c95';
    a.style.textDecoration = 'none';
    panel.insertAdjacentElement('beforebegin', a);
  }

  function init() {
    var mode = getMode();
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      addBackLink();
      if (openTab(mode) || tries > 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
