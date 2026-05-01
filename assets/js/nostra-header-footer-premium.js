/* ==================================================
   Grupo Nostradamus - Header/Footer Premium
   Mejora barras superiores, footer y CTA flotante en subpáginas.
   No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function injectStyles() {
    if (document.getElementById('nostra-header-footer-premium-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-header-footer-premium-style';
    style.textContent = `
      /* Barra superior / anuncios */
      .header-top,
      .top-header,
      .top-area,
      .topbar,
      .th-header .header-top{
        min-height:46px !important;
        background:
          radial-gradient(circle at 14% 50%, rgba(0,194,209,.30), transparent 26%),
          linear-gradient(90deg,#02070d 0%,#061426 42%,#078c95 100%) !important;
        border-bottom:1px solid rgba(0,194,209,.35) !important;
        box-shadow:0 8px 28px rgba(0,0,0,.22),0 0 22px rgba(0,194,209,.20) !important;
      }

      .header-top *,
      .top-header *,
      .top-area *,
      .topbar *{
        color:#ffffff !important;
        opacity:1 !important;
        visibility:visible !important;
      }

      .header-top a,
      .top-header a,
      .top-area a,
      .topbar a{
        color:#eaffff !important;
        font-weight:850 !important;
        text-decoration:none !important;
      }

      .header-top a:hover,
      .top-header a:hover,
      .top-area a:hover,
      .topbar a:hover{
        color:#00e5f2 !important;
        text-shadow:0 0 12px rgba(0,194,209,.55) !important;
      }

      .header-top .header-links ul,
      .top-header ul,
      .top-area ul,
      .topbar ul{
        gap:18px !important;
      }

      /* Barra de anuncio tipo marquee, cuando exista */
      .nostra-announcement-bar,
      .announcement-bar,
      .marquee,
      .marquee-area,
      .ticker-area,
      [class*='marquee']{
        background:
          linear-gradient(90deg,#02070d 0%,#062a32 45%,#078c95 100%) !important;
        color:#ffffff !important;
        border-top:1px solid rgba(0,194,209,.34) !important;
        border-bottom:1px solid rgba(0,194,209,.34) !important;
        box-shadow:0 0 24px rgba(0,194,209,.20) !important;
        min-height:44px !important;
        display:flex !important;
        align-items:center !important;
        overflow:hidden !important;
      }

      .nostra-announcement-bar *,
      .announcement-bar *,
      .marquee *,
      .marquee-area *,
      .ticker-area *,
      [class*='marquee'] *{
        color:#ffffff !important;
        font-weight:900 !important;
        letter-spacing:.8px !important;
        text-transform:uppercase !important;
      }

      /* Footer premium */
      .footer-wrapper,
      .footer-layout,
      .footer-layout6,
      footer,
      .copyright-wrap,
      .copyright-area{
        background:
          radial-gradient(circle at 15% 22%, rgba(0,194,209,.18), transparent 30%),
          radial-gradient(circle at 88% 18%, rgba(255,255,255,.06), transparent 26%),
          linear-gradient(135deg,#02070d 0%,#061426 58%,#02070d 100%) !important;
        color:#dce8ef !important;
      }

      .footer-wrapper,
      .footer-layout,
      .footer-layout6,
      footer{
        border-top:1px solid rgba(0,194,209,.30) !important;
        box-shadow:0 -18px 44px rgba(0,0,0,.26),0 0 28px rgba(0,194,209,.12) !important;
      }

      .footer-wrapper *,
      .footer-layout *,
      .footer-layout6 *,
      footer *,
      .copyright-wrap *,
      .copyright-area *{
        color:#dce8ef !important;
        opacity:1 !important;
      }

      .footer-wrapper h1,
      .footer-wrapper h2,
      .footer-wrapper h3,
      .footer-wrapper h4,
      .footer-wrapper h5,
      .footer-wrapper h6,
      footer h1,
      footer h2,
      footer h3,
      footer h4,
      footer h5,
      footer h6,
      .footer-widget .widget_title,
      .footer-widget .widget-title{
        color:#ffffff !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.4px !important;
        text-shadow:0 3px 12px rgba(0,0,0,.55),0 0 14px rgba(0,194,209,.20) !important;
      }

      .footer-wrapper h1::after,
      .footer-wrapper h2::after,
      .footer-wrapper h3::after,
      .footer-wrapper h4::after,
      .footer-wrapper h5::after,
      .footer-wrapper h6::after,
      footer h1::after,
      footer h2::after,
      footer h3::after,
      footer h4::after,
      footer h5::after,
      footer h6::after,
      .footer-widget .widget_title::after,
      .footer-widget .widget-title::after{
        content:'' !important;
        display:block !important;
        width:70px !important;
        height:3px !important;
        margin-top:10px !important;
        background:linear-gradient(90deg,#00e5f2,transparent) !important;
        box-shadow:0 0 14px rgba(0,194,209,.55) !important;
        transform:skewX(-18deg) !important;
      }

      .footer-wrapper a,
      .footer-layout a,
      .footer-layout6 a,
      footer a,
      .copyright-wrap a,
      .copyright-area a{
        color:#dce8ef !important;
        text-decoration:none !important;
        transition:.25s ease !important;
      }

      .footer-wrapper a:hover,
      .footer-layout a:hover,
      .footer-layout6 a:hover,
      footer a:hover,
      .copyright-wrap a:hover,
      .copyright-area a:hover{
        color:#00e5f2 !important;
        text-shadow:0 0 12px rgba(0,194,209,.55) !important;
        transform:translateX(2px) !important;
      }

      .footer-wrapper ul,
      footer ul{
        padding-left:0 !important;
      }

      .footer-wrapper li,
      footer li{
        margin-bottom:9px !important;
      }

      .footer-wrapper li::marker,
      footer li::marker{
        color:#00e5f2 !important;
      }

      .copyright-wrap,
      .copyright-area{
        padding:20px 0 84px !important;
        border-top:1px solid rgba(0,194,209,.18) !important;
      }

      .copyright-text,
      .copyright-wrap p,
      .copyright-area p,
      .copyright-wrap .container,
      .copyright-area .container{
        color:#dce8ef !important;
        font-weight:800 !important;
      }

      .copyright-text a,
      .copyright-wrap a,
      .copyright-area a{
        color:#00e5f2 !important;
        font-weight:950 !important;
      }

      /* Corrige año viejo visible */
      .nostra-year-fixed{display:inline !important;}

      /* CTA flotante WhatsApp */
      .nostra-floating-whatsapp,
      .whatsapp-float,
      .wa-float,
      .floating-whatsapp,
      [class*='whatsapp'][class*='float']{
        right:26px !important;
        bottom:24px !important;
        z-index:9998 !important;
        max-width:min(340px,calc(100vw - 34px)) !important;
        background:linear-gradient(135deg,#078c95 0%,#03333c 52%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.26) !important;
        box-shadow:0 18px 44px rgba(0,0,0,.32),0 0 28px rgba(0,194,209,.36) !important;
        color:#ffffff !important;
      }

      .nostra-floating-whatsapp *,
      .whatsapp-float *,
      .wa-float *,
      .floating-whatsapp *,
      [class*='whatsapp'][class*='float'] *{
        color:#ffffff !important;
      }

      .scroll-top,
      .back-to-top,
      #scrollUp{
        right:24px !important;
        bottom:104px !important;
        background:linear-gradient(135deg,#00c2d1,#078c95) !important;
        color:#ffffff !important;
        border:1px solid rgba(255,255,255,.38) !important;
        box-shadow:0 0 24px rgba(0,194,209,.46) !important;
        z-index:9999 !important;
      }

      @media(max-width:767.98px){
        .header-top,
        .top-header,
        .top-area,
        .topbar{
          min-height:42px !important;
          font-size:12px !important;
          text-align:center !important;
        }

        .nostra-announcement-bar,
        .announcement-bar,
        .marquee,
        .marquee-area,
        .ticker-area,
        [class*='marquee']{
          min-height:40px !important;
          font-size:12px !important;
          padding:0 8px !important;
        }

        .footer-wrapper,
        .footer-layout,
        .footer-layout6,
        footer{
          text-align:left !important;
        }

        .copyright-wrap,
        .copyright-area{
          padding-bottom:108px !important;
          text-align:center !important;
        }

        .nostra-floating-whatsapp,
        .whatsapp-float,
        .wa-float,
        .floating-whatsapp,
        [class*='whatsapp'][class*='float']{
          left:12px !important;
          right:12px !important;
          bottom:16px !important;
          max-width:none !important;
          width:auto !important;
          justify-content:center !important;
        }

        .scroll-top,
        .back-to-top,
        #scrollUp{
          right:16px !important;
          bottom:86px !important;
          width:46px !important;
          height:46px !important;
          line-height:46px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fixCopyrightYear() {
    var nodes = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf('2024') === -1) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var inFooter = parent.closest('footer,.footer-wrapper,.footer-layout,.footer-layout6,.copyright-wrap,.copyright-area');
        return inFooter ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      node.nodeValue = node.nodeValue.replace(/2024/g, '2026').replace(/2025/g, '2026');
    });
  }

  function upgradeAnnouncementText() {
    var selectors = '.nostra-announcement-bar,.announcement-bar,.marquee,.marquee-area,.ticker-area,[class*="marquee"]';
    document.querySelectorAll(selectors).forEach(function (bar) {
      if (!bar.dataset.nostraPremiumText) {
        bar.dataset.nostraPremiumText = '1';
        if ((bar.textContent || '').trim().length < 160) {
          bar.innerHTML = '🚀 <strong>Nuevos ciclos UNI disponibles</strong> · Cupos limitados · <a href="https://wa.me/51993750351?text=Hola%20quiero%20informes%20sobre%20los%20nuevos%20ciclos%20UNI" target="_blank" rel="noopener noreferrer">Solicitar informes por WhatsApp</a>';
        }
      }
    });
  }

  function init() {
    injectStyles();
    fixCopyrightYear();
    upgradeAnnouncementText();
    setTimeout(fixCopyrightYear, 600);
    setTimeout(upgradeAnnouncementText, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
