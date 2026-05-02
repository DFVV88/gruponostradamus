/* ==================================================
   Grupo Nostradamus - Animación filtros NostraCACHIMBOS
   Aplica solo a cachimbos.html
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('cachimbos.html') === -1 && path !== '/cachimbos') return;

  function injectStyles() {
    if (document.getElementById('nostra-cachimbos-tabs-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-cachimbos-tabs-style';
    style.textContent = `
      body .tab-menu2.filter-menu-active{
        position: relative;
        display: flex !important;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 14px 16px;
        padding: 20px 18px !important;
        margin-top: 10px;
        margin-bottom: 42px !important;
        border-radius: 28px;
        background:
          radial-gradient(circle at 18% 18%, rgba(0,194,209,.13), transparent 32%),
          linear-gradient(135deg, rgba(255,255,255,.96), rgba(236,250,252,.88));
        border: 1px solid rgba(0, 137, 150, .18);
        box-shadow: 0 20px 45px rgba(0,0,0,.08), 0 0 30px rgba(0,194,209,.09);
        overflow: hidden;
      }

      body .tab-menu2.filter-menu-active::before{
        content: '';
        position: absolute;
        inset: -1px;
        background: linear-gradient(115deg, transparent 0%, rgba(0,194,209,.10) 38%, rgba(255,255,255,.40) 50%, transparent 64%);
        transform: translateX(-120%);
        animation: nostraTabsSweep 5.5s ease-in-out infinite;
        pointer-events: none;
      }

      body .tab-menu2.filter-menu-active .filter-btn{
        position: relative;
        z-index: 2;
        isolation: isolate;
        min-height: 44px;
        padding: 11px 19px !important;
        border-radius: 999px !important;
        border: 1px solid rgba(0, 137, 150, .22) !important;
        background: rgba(255,255,255,.82) !important;
        color: #061426 !important;
        font-weight: 900 !important;
        letter-spacing: .35px;
        text-transform: uppercase;
        box-shadow: 0 8px 18px rgba(0,0,0,.06);
        transform: translateY(12px) scale(.96);
        opacity: 0;
        animation: nostraTabEnter .65s cubic-bezier(.2,.75,.25,1.2) forwards;
        transition:
          transform .28s ease,
          box-shadow .28s ease,
          background .28s ease,
          color .28s ease,
          border-color .28s ease;
      }

      body .tab-menu2.filter-menu-active .filter-btn:nth-child(1){ animation-delay: .03s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(2){ animation-delay: .08s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(3){ animation-delay: .13s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(4){ animation-delay: .18s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(5){ animation-delay: .23s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(6){ animation-delay: .28s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(7){ animation-delay: .33s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(8){ animation-delay: .38s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(9){ animation-delay: .43s; }
      body .tab-menu2.filter-menu-active .filter-btn:nth-child(10){ animation-delay: .48s; }

      body .tab-menu2.filter-menu-active .filter-btn::before{
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background: linear-gradient(135deg, #062033, #008b96 56%, #00d4df);
        opacity: 0;
        transition: opacity .28s ease;
      }

      body .tab-menu2.filter-menu-active .filter-btn::after{
        content: '';
        position: absolute;
        width: 42px;
        height: 120%;
        top: -10%;
        left: -70px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent);
        transform: rotate(18deg);
        opacity: 0;
        transition: left .55s ease, opacity .2s ease;
      }

      body .tab-menu2.filter-menu-active .filter-btn:hover,
      body .tab-menu2.filter-menu-active .filter-btn.active{
        color: #ffffff !important;
        border-color: rgba(0, 212, 223, .65) !important;
        transform: translateY(-5px) scale(1.045);
        box-shadow: 0 16px 28px rgba(0,137,150,.22), 0 0 22px rgba(0,194,209,.20);
      }

      body .tab-menu2.filter-menu-active .filter-btn:hover::before,
      body .tab-menu2.filter-menu-active .filter-btn.active::before{
        opacity: 1;
      }

      body .tab-menu2.filter-menu-active .filter-btn:hover::after,
      body .tab-menu2.filter-menu-active .filter-btn.active::after{
        left: calc(100% + 45px);
        opacity: .9;
      }

      body .tab-menu2.filter-menu-active .filter-btn.active{
        animation: nostraActivePulse 2.6s ease-in-out infinite;
      }

      body .tab-menu2.filter-menu-active .filter-btn:first-child{
        padding-left: 24px !important;
        padding-right: 24px !important;
        background: linear-gradient(135deg, #061426, #008b96) !important;
        color: #fff !important;
        border-color: rgba(0,212,223,.56) !important;
        box-shadow: 0 16px 34px rgba(0,137,150,.22), 0 0 22px rgba(0,194,209,.22);
      }

      body .tab-menu2.filter-menu-active .filter-btn:first-child::before{
        opacity: .35;
      }

      body .filter-active .filter-item{
        transition: transform .35s ease, opacity .35s ease;
      }

      body .filter-active .filter-item .video-course{
        transition: transform .32s ease, box-shadow .32s ease, filter .32s ease;
        border-radius: 18px;
        overflow: hidden;
      }

      body .filter-active .filter-item .video-course:hover{
        transform: translateY(-7px) scale(1.015);
        box-shadow: 0 22px 45px rgba(0,0,0,.16), 0 0 24px rgba(0,194,209,.16);
        filter: saturate(1.05);
      }

      @keyframes nostraTabEnter{
        from{ opacity: 0; transform: translateY(12px) scale(.96); }
        to{ opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes nostraTabsSweep{
        0%, 42%{ transform: translateX(-120%); }
        62%, 100%{ transform: translateX(120%); }
      }

      @keyframes nostraActivePulse{
        0%, 100%{ box-shadow: 0 16px 28px rgba(0,137,150,.22), 0 0 22px rgba(0,194,209,.20); }
        50%{ box-shadow: 0 19px 36px rgba(0,137,150,.30), 0 0 34px rgba(0,194,209,.35); }
      }

      @media (max-width: 991px){
        body .tab-menu2.filter-menu-active{
          gap: 10px;
          padding: 16px 12px !important;
          border-radius: 22px;
        }
        body .tab-menu2.filter-menu-active .filter-btn{
          flex: 1 1 calc(50% - 10px);
          min-width: 132px;
          padding: 10px 12px !important;
          font-size: 13px !important;
        }
      }

      @media (max-width: 520px){
        body .tab-menu2.filter-menu-active .filter-btn{
          flex-basis: 100%;
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce){
        body .tab-menu2.filter-menu-active,
        body .tab-menu2.filter-menu-active::before,
        body .tab-menu2.filter-menu-active .filter-btn,
        body .tab-menu2.filter-menu-active .filter-btn.active{
          animation: none !important;
        }
        body .tab-menu2.filter-menu-active .filter-btn{opacity:1; transform:none;}
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceClicks() {
    var buttons = document.querySelectorAll('.tab-menu2.filter-menu-active .filter-btn');
    buttons.forEach(function (button) {
      if (button.dataset.nostraAnimated === '1') return;
      button.dataset.nostraAnimated = '1';
      button.addEventListener('click', function () {
        buttons.forEach(function (btn) { btn.classList.remove('nostra-clicked'); });
        button.classList.add('nostra-clicked');

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
    setTimeout(init, 300);
    setTimeout(init, 1200);
  });
})();
