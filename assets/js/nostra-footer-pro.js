/* ==================================================
   Grupo Nostradamus - Footer PRO futurista
   Mejora visual del footer sin modificar el HTML base.
================================================== */
(function () {
  function injectFooterStyles() {
    if (document.getElementById('nostra-footer-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-footer-pro-style';
    style.textContent = `
      .footer-wrapper,
      .footer-layout2,
      footer.footer-wrapper{
        position:relative !important;
        overflow:hidden !important;
        background:
          radial-gradient(circle at 12% 20%, rgba(0,194,209,.20), transparent 32%),
          radial-gradient(circle at 82% 28%, rgba(255,255,255,.09), transparent 26%),
          linear-gradient(135deg,#061426 0%,#02070d 48%,#0a0708 100%) !important;
        border-top:1px solid rgba(0,194,209,.38) !important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 -18px 48px rgba(0,194,209,.12) !important;
      }
      .footer-wrapper::before{
        content:"" !important;
        position:absolute !important;
        inset:0 !important;
        background:
          linear-gradient(120deg,transparent 0%,rgba(0,194,209,.08) 42%,transparent 58%),
          repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 80px) !important;
        pointer-events:none !important;
      }
      .footer-wrapper .container,
      .footer-wrapper .widget-area,
      .footer-wrapper .footer-top{
        position:relative !important;
        z-index:2 !important;
      }
      .footer-wrapper .row{
        align-items:stretch !important;
      }
      .footer-wrapper .widget{
        background:rgba(255,255,255,.035) !important;
        border:1px solid rgba(0,194,209,.16) !important;
        border-radius:22px !important;
        padding:28px 26px !important;
        min-height:100% !important;
        box-shadow:0 18px 44px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05) !important;
        backdrop-filter:blur(8px) !important;
      }
      .footer-wrapper .about-logo,
      .footer-wrapper .footer-logo{
        margin-bottom:24px !important;
      }
      .footer-wrapper .about-logo img,
      .footer-wrapper .footer-logo img{
        max-width:230px !important;
        filter:drop-shadow(0 0 16px rgba(0,194,209,.30)) !important;
      }
      .footer-wrapper .widget_title,
      .footer-wrapper .widget-title{
        color:#ffffff !important;
        font-size:clamp(22px,1.6vw,30px) !important;
        line-height:1.1 !important;
        margin-bottom:26px !important;
        font-weight:900 !important;
        font-style:italic !important;
        letter-spacing:-.4px !important;
        text-transform:none !important;
        text-shadow:0 2px 0 rgba(0,0,0,.45),0 0 16px rgba(0,194,209,.22) !important;
      }
      .footer-wrapper .widget_title:after,
      .footer-wrapper .widget-title:after{
        width:78px !important;
        height:3px !important;
        background:linear-gradient(90deg,#00c2d1,#078c95,transparent) !important;
        box-shadow:0 0 14px rgba(0,194,209,.5) !important;
      }
      .footer-wrapper p,
      .footer-wrapper li,
      .footer-wrapper a,
      .footer-wrapper .footer-text{
        color:rgba(255,255,255,.82) !important;
        font-size:16px !important;
        line-height:1.75 !important;
        font-weight:600 !important;
      }
      .footer-wrapper a:hover{
        color:#00e5f2 !important;
        text-shadow:0 0 10px rgba(0,194,209,.55) !important;
      }
      .footer-wrapper ul{
        padding-left:0 !important;
      }
      .footer-wrapper li{
        margin-bottom:10px !important;
      }
      .footer-wrapper .menu li,
      .footer-wrapper .widget_nav_menu li{
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
      }
      .footer-wrapper .menu li:before,
      .footer-wrapper .widget_nav_menu li:before{
        color:#00c2d1 !important;
        text-shadow:0 0 10px rgba(0,194,209,.6) !important;
      }
      .footer-wrapper .th-social a,
      .footer-wrapper .footer-social a{
        width:48px !important;
        height:48px !important;
        line-height:48px !important;
        border-radius:50% !important;
        background:linear-gradient(135deg,rgba(0,194,209,.22),rgba(255,255,255,.08)) !important;
        border:1px solid rgba(0,194,209,.28) !important;
        color:#00e5f2 !important;
        box-shadow:0 0 22px rgba(0,194,209,.18) !important;
      }
      .footer-wrapper .th-social a:hover,
      .footer-wrapper .footer-social a:hover{
        background:linear-gradient(135deg,#078c95,#061426) !important;
        color:#ffffff !important;
        transform:translateY(-3px) !important;
      }
      .footer-wrapper .info-box,
      .footer-wrapper .footer-info,
      .footer-wrapper .contact-feature{
        display:flex !important;
        align-items:flex-start !important;
        gap:14px !important;
        margin-bottom:18px !important;
      }
      .footer-wrapper i,
      .footer-wrapper .icon{
        color:#00c2d1 !important;
      }
      .copyright-wrap{
        background:#030607 !important;
        border-top:1px solid rgba(0,194,209,.18) !important;
      }
      .copyright-text{
        color:#ffffff !important;
        font-weight:700 !important;
      }
      .copyright-text a{
        color:#00c2d1 !important;
        font-weight:900 !important;
      }
      @media(max-width:991.98px){
        .footer-wrapper .widget{
          margin-bottom:22px !important;
        }
      }
      @media(max-width:767.98px){
        .footer-wrapper{
          text-align:left !important;
        }
        .footer-wrapper .widget{
          padding:24px 20px !important;
        }
        .footer-wrapper .about-logo img,
        .footer-wrapper .footer-logo img{
          max-width:190px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', injectFooterStyles);
  window.addEventListener('load', injectFooterStyles);
})();
