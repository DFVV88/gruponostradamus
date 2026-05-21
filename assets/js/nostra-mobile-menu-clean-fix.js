/* ==================================================
   Grupo Nostradamus - Limpieza visual del menú móvil
   Corrige viñetas y botón de submenú en celulares.
================================================== */
(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('nostra-mobile-menu-clean-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-mobile-menu-clean-fix-style';
    style.textContent = `
      @media(max-width:991.98px){
        .th-mobile-menu ul,
        .th-mobile-menu li{
          list-style:none!important;
        }

        .th-mobile-menu li > a{
          position:relative!important;
          padding-left:18px!important;
          padding-right:18px!important;
          overflow:hidden!important;
        }

        .th-mobile-menu li > a:before,
        .th-mobile-menu li > a:after{
          content:none!important;
          display:none!important;
        }

        .th-mobile-menu .th-item-has-children > a,
        .th-mobile-menu .menu-item-has-children > a{
          padding-right:54px!important;
        }

        .th-mobile-menu .th-mean-expand,
        .th-mobile-menu a .th-mean-expand{
          position:absolute!important;
          right:12px!important;
          top:50%!important;
          transform:translateY(-50%)!important;
          width:28px!important;
          height:28px!important;
          min-width:28px!important;
          min-height:28px!important;
          max-width:28px!important;
          max-height:28px!important;
          padding:0!important;
          margin:0!important;
          border-radius:10px!important;
          background:rgba(0,194,209,.14)!important;
          border:1px solid rgba(0,194,209,.30)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
          color:transparent!important;
          font-size:0!important;
          line-height:28px!important;
          text-indent:-9999px!important;
          z-index:20!important;
        }

        .th-mobile-menu .th-mean-expand:before,
        .th-mobile-menu a .th-mean-expand:before{
          content:''!important;
          display:block!important;
          position:absolute!important;
          left:50%!important;
          top:50%!important;
          width:10px!important;
          height:10px!important;
          border-right:2px solid #ffffff!important;
          border-bottom:2px solid #ffffff!important;
          background:transparent!important;
          border-radius:0!important;
          box-shadow:none!important;
          transform:translate(-58%,-62%) rotate(45deg)!important;
          margin:0!important;
        }

        .th-mobile-menu .th-mean-expand:after,
        .th-mobile-menu a .th-mean-expand:after{
          content:none!important;
          display:none!important;
        }

        .th-mobile-menu li.th-active > a .th-mean-expand:before,
        .th-mobile-menu li.th-active > .th-mean-expand:before{
          transform:translate(-50%,-38%) rotate(225deg)!important;
        }

        .th-mobile-menu .sub-menu a{
          padding-left:16px!important;
          padding-right:16px!important;
        }

        .th-mobile-menu .sub-menu a:before,
        .th-mobile-menu .sub-menu a:after{
          content:none!important;
          display:none!important;
        }

        .nostra-registro-mobile .nostra-register-mobile-btn:before,
        .nostra-registro-mobile .nostra-register-mobile-btn:after{
          content:none!important;
          display:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
