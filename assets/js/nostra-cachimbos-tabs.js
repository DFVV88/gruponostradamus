/* ==================================================
   Grupo Nostradamus - Selector de periodos NostraCACHIMBOS
   Aplica solo a cachimbos.html
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('cachimbos.html') === -1 && path !== '/cachimbos') return;

  /* Evita una doble inicialización si el módulo se carga por más de una vía. */
  if (window.__NOSTRA_CACHIMBOS_TABS__) return;
  window.__NOSTRA_CACHIMBOS_TABS__ = true;

  function injectStyles() {
    if (document.getElementById('nostra-cachimbos-tabs-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-cachimbos-tabs-style';
    style.textContent = `
      body .tab-menu2.filter-menu-active{
        position: relative;
        display: flex !important;
        flex-wrap: nowrap !important;
        justify-content: flex-start;
        align-items: center;
        gap: 9px;
        padding: 12px 14px !important;
        margin-top: 8px;
        margin-bottom: 38px !important;
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.98), rgba(243,252,253,.96));
        border: 1px solid rgba(6,134,149,.16);
        box-shadow:
          0 14px 36px rgba(2,45,51,.07),
          inset 0 1px 0 rgba(255,255,255,.96);
        overflow-x: auto !important;
        overflow-y: hidden !important;
        overscroll-behavior-x: contain;
        scroll-snap-type: x proximity;
        scroll-padding-inline: 14px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
      }

      body .tab-menu2.filter-menu-active::-webkit-scrollbar{
        display: none;
      }

      body .tab-menu2.filter-menu-active .filter-btn{
        position: relative;
        z-index: 1;
        flex: 0 0 auto !important;
        scroll-snap-align: center;
        min-width: 96px;
        min-height: 42px;
        padding: 9px 16px !important;
        border-radius: 999px !important;
        border: 1px solid rgba(6,134,149,.20) !important;
        background: rgba(255,255,255,.98) !important;
        color: #102231 !important;
        -webkit-text-fill-color: #102231 !important;
        text-shadow: none !important;
        font-weight: 850 !important;
        font-size: 14px !important;
        line-height: 1.1 !important;
        letter-spacing: .20px;
        text-transform: uppercase;
        white-space: nowrap;
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
        animation: none !important;
        box-shadow: 0 5px 14px rgba(2,45,51,.045);
        transition:
          transform .22s ease,
          box-shadow .22s ease,
          background .22s ease,
          color .22s ease,
          border-color .22s ease;
      }

      body .tab-menu2.filter-menu-active .filter-btn:not(:first-child)::before{
        content: '';
        position: absolute;
        left: 13px;
        top: 50%;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ffffff;
        transform: translateY(-50%) scale(.4);
        opacity: 0;
        box-shadow: 0 0 0 3px rgba(255,255,255,.14);
        transition: opacity .2s ease, transform .2s ease;
      }

      body .tab-menu2.filter-menu-active .filter-btn:hover{
        color: #022D33 !important;
        -webkit-text-fill-color: #022D33 !important;
        background: #f7feff !important;
        border-color: rgba(6,134,149,.46) !important;
        transform: translateY(-2px) !important;
        box-shadow:
          0 9px 20px rgba(2,45,51,.08),
          0 0 0 3px rgba(6,134,149,.045);
      }

      /* Periodo seleccionado: siempre visible. Corrige el antiguo opacity:0. */
      body .tab-menu2.filter-menu-active .filter-btn.active{
        padding-left: 30px !important;
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: linear-gradient(135deg, #068695 0%, #079bab 100%) !important;
        border-color: rgba(6,134,149,.94) !important;
        opacity: 1 !important;
        transform: translateY(-2px) !important;
        animation: none !important;
        box-shadow:
          0 10px 22px rgba(6,134,149,.20),
          0 0 0 3px rgba(6,134,149,.08);
      }

      body .tab-menu2.filter-menu-active .filter-btn.active:not(:first-child)::before{
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }

      /* Botón principal: mantiene identidad propia y funciona como "ver todos". */
      body .tab-menu2.filter-menu-active .filter-btn:first-child{
        min-width: 190px;
        padding-left: 22px !important;
        padding-right: 22px !important;
        background: linear-gradient(135deg, #022D33 0%, #046c78 100%) !important;
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        border-color: rgba(6,134,149,.72) !important;
        letter-spacing: .45px;
        box-shadow: 0 9px 22px rgba(2,45,51,.16);
      }

      body .tab-menu2.filter-menu-active .filter-btn:first-child:hover,
      body .tab-menu2.filter-menu-active .filter-btn:first-child.active{
        padding-left: 22px !important;
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: linear-gradient(135deg, #022D33 0%, #068695 100%) !important;
        border-color: rgba(6,134,149,.92) !important;
        box-shadow:
          0 11px 24px rgba(2,45,51,.18),
          0 0 0 3px rgba(6,134,149,.07);
      }

      body .filter-active .filter-item{
        transition: transform .35s ease, opacity .35s ease;
      }

      body .filter-active .filter-item .video-course{
        transition: transform .30s ease, box-shadow .30s ease, filter .30s ease;
        border-radius: 18px;
        overflow: hidden;
      }

      body .filter-active .filter-item .video-course:hover{
        transform: translateY(-6px) scale(1.01);
        box-shadow: 0 20px 42px rgba(2,45,51,.14), 0 0 20px rgba(6,134,149,.10);
        filter: saturate(1.035);
      }

      @media (min-width: 1500px){
        body .tab-menu2.filter-menu-active{
          justify-content: center;
        }
      }

      @media (max-width: 1199px){
        body .tab-menu2.filter-menu-active{
          gap: 8px;
          padding: 11px 12px !important;
          border-radius: 19px;
        }

        body .tab-menu2.filter-menu-active .filter-btn{
          min-width: 91px;
          min-height: 40px;
          padding: 9px 14px !important;
          font-size: 13px !important;
        }

        body .tab-menu2.filter-menu-active .filter-btn:first-child{
          min-width: 172px;
          padding-left: 18px !important;
          padding-right: 18px !important;
        }

        body .tab-menu2.filter-menu-active .filter-btn:first-child:hover,
        body .tab-menu2.filter-menu-active .filter-btn:first-child.active{
          padding-left: 18px !important;
        }
      }

      @media (max-width: 575px){
        body .tab-menu2.filter-menu-active{
          width: calc(100% + 24px);
          margin-left: -12px;
          margin-right: -12px;
          margin-bottom: 30px !important;
          padding: 10px 12px !important;
          border-left: 0;
          border-right: 0;
          border-radius: 0;
          scroll-padding-inline: 12px;
          box-shadow: 0 8px 24px rgba(2,45,51,.055);
        }

        body .tab-menu2.filter-menu-active .filter-btn{
          min-width: auto;
          min-height: 39px;
          padding: 8px 14px !important;
          font-size: 12.5px !important;
        }

        body .tab-menu2.filter-menu-active .filter-btn.active{
          padding-left: 28px !important;
        }

        body .tab-menu2.filter-menu-active .filter-btn:first-child,
        body .tab-menu2.filter-menu-active .filter-btn:first-child:hover,
        body .tab-menu2.filter-menu-active .filter-btn:first-child.active{
          min-width: 160px;
          padding-left: 17px !important;
          padding-right: 17px !important;
        }
      }

      @media (prefers-reduced-motion: reduce){
        body .tab-menu2.filter-menu-active,
        body .tab-menu2.filter-menu-active .filter-btn,
        body .filter-active .filter-item,
        body .filter-active .filter-item .video-course{
          scroll-behavior: auto !important;
          transition: none !important;
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function centerButtonInMenu(button) {
    var menu = button && button.closest
      ? button.closest('.tab-menu2.filter-menu-active')
      : null;

    if (!menu || menu.scrollWidth <= menu.clientWidth) return;

    var targetLeft = button.offsetLeft - ((menu.clientWidth - button.offsetWidth) / 2);
    var maxLeft = Math.max(0, menu.scrollWidth - menu.clientWidth);
    targetLeft = Math.max(0, Math.min(targetLeft, maxLeft));

    try {
      menu.scrollTo({
        left: targetLeft,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    } catch (error) {
      menu.scrollLeft = targetLeft;
    }
  }

  function syncAccessibility(buttons) {
    buttons.forEach(function (btn) {
      var selected = btn.classList.contains('active');
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function enhanceClicks() {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll('.tab-menu2.filter-menu-active .filter-btn')
    );

    if (!buttons.length) return;

    syncAccessibility(buttons);

    buttons.forEach(function (button) {
      if (button.dataset.nostraEnhanced === '1') return;
      button.dataset.nostraEnhanced = '1';

      button.addEventListener('click', function () {
        buttons.forEach(function (btn) {
          btn.classList.remove('nostra-clicked');
        });
        button.classList.add('nostra-clicked');

        /* main.js aplica .active durante el bubbling; esperamos un frame y sincronizamos. */
        window.requestAnimationFrame(function () {
          syncAccessibility(buttons);
          centerButtonInMenu(button);
        });

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'click_filtro_cachimbos', {
            event_category: 'engagement',
            event_label: (button.textContent || '').trim(),
            page_path: window.location.pathname
          });
        }
      });
    });
  }

  function init() {
    injectStyles();
    enhanceClicks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    setTimeout(init, 250);
  });
})();
