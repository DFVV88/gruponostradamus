/* ==================================================
   Grupo Nostradamus - Distribución del bloque de marca del footer
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function injectStyles() {
    var old = document.getElementById('nostra-footer-brand-layout-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-footer-brand-layout-style';
    style.textContent = `
      body.nostra-footer-horizontal-active .nfh-brand{
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:16px!important;
        text-align:center!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand .nfh-logo{
        width:min(100%,190px)!important;
        max-width:190px!important;
        margin:0 auto!important;
        padding:13px 15px!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand .nfh-logo img{
        width:100%!important;
        max-width:160px!important;
        margin:0 auto!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand-copy{
        width:100%!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand-copy p{
        width:100%!important;
        max-width:250px!important;
        margin:0 auto 17px!important;
        color:rgba(238,248,251,.84)!important;
        font-size:12.5px!important;
        line-height:1.42!important;
        font-weight:850!important;
        letter-spacing:.24px!important;
        text-align:center!important;
        text-wrap:balance!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand .nfh-label{
        margin:0 0 11px!important;
        text-align:center!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand .nfh-social{
        width:100%!important;
        display:flex!important;
        flex-wrap:nowrap!important;
        justify-content:center!important;
        align-items:center!important;
        gap:9px!important;
      }

      body.nostra-footer-horizontal-active .nfh-brand .nfh-social a{
        flex:0 0 38px!important;
      }

      @media(max-width:1199.98px){
        body.nostra-footer-horizontal-active .nfh-brand{
          min-height:100%!important;
        }
        body.nostra-footer-horizontal-active .nfh-brand-copy p{
          max-width:300px!important;
        }
      }

      @media(max-width:575.98px){
        body.nostra-footer-horizontal-active .nfh-brand{
          gap:14px!important;
        }
        body.nostra-footer-horizontal-active .nfh-brand .nfh-logo{
          width:min(100%,205px)!important;
          max-width:205px!important;
        }
        body.nostra-footer-horizontal-active .nfh-brand-copy p{
          max-width:280px!important;
          font-size:12px!important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
  window.addEventListener('load', injectStyles);
})();
