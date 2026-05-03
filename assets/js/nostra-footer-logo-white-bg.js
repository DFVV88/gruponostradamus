/* ==================================================
   Grupo Nostradamus - Logo del footer con fondo blanco
   Mejora la visibilidad del logo inferior sobre fondos oscuros.
================================================== */
(function () {
  function injectFooterLogoStyle() {
    var old = document.getElementById('nostra-footer-logo-white-bg-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-footer-logo-white-bg-style';
    style.textContent = `
      .footer-wrapper .about-logo,
      .footer-wrapper .th-widget-about .about-logo,
      footer .about-logo{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        width:auto !important;
        max-width:300px !important;
        margin-bottom:22px !important;
        padding:14px 18px !important;
        border-radius:18px !important;
        background:linear-gradient(180deg,#ffffff 0%,#f4fbfd 100%) !important;
        border:1px solid rgba(0,194,209,.28) !important;
        box-shadow:0 16px 34px rgba(0,0,0,.22),0 0 22px rgba(0,194,209,.18), inset 0 1px 0 rgba(255,255,255,.9) !important;
      }

      .footer-wrapper .about-logo a,
      .footer-wrapper .th-widget-about .about-logo a,
      footer .about-logo a{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        width:100% !important;
      }

      .footer-wrapper .about-logo img,
      .footer-wrapper .th-widget-about .about-logo img,
      footer .about-logo img{
        display:block !important;
        max-width:240px !important;
        width:100% !important;
        height:auto !important;
        opacity:1 !important;
        filter:none !important;
      }

      @media(max-width:575px){
        .footer-wrapper .about-logo,
        .footer-wrapper .th-widget-about .about-logo,
        footer .about-logo{
          max-width:260px !important;
          padding:12px 15px !important;
          border-radius:16px !important;
        }

        .footer-wrapper .about-logo img,
        .footer-wrapper .th-widget-about .about-logo img,
        footer .about-logo img{
          max-width:220px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooterLogoStyle);
  } else {
    injectFooterLogoStyle();
  }
  window.addEventListener('load', injectFooterLogoStyle);
})();
