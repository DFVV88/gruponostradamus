/* ==================================================
   Grupo Nostradamus - Menú móvil institucional PRO
   Mejora visual del menú lateral en celulares.
   - Sin emojis decorativos.
   - Estilo más limpio, premium e institucional.
   - Mantiene acceso claro a clases en vivo.
   No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function injectMobileMenuStyles() {
    if (document.getElementById('nostra-mobile-menu-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-mobile-menu-pro-style';
    style.textContent = `
      @media(max-width: 991.98px){
        .th-menu-wrapper{
          background:rgba(2,7,13,.80) !important;
          backdrop-filter:blur(8px) !important;
        }

        .th-menu-wrapper .th-menu-area{
          width:min(82vw,320px) !important;
          max-width:320px !important;
          background:
            radial-gradient(circle at 15% 8%, rgba(0,194,209,.14), transparent 34%),
            linear-gradient(180deg,#071523 0%,#02070d 62%,#07111c 100%) !important;
          border-right:1px solid rgba(0,194,209,.38) !important;
          box-shadow:18px 0 48px rgba(0,0,0,.54) !important;
          padding:20px 18px 26px !important;
          overflow-y:auto !important;
        }

        .th-menu-wrapper .th-menu-area:before{
          content:'GRUPO NOSTRADAMUS';
          display:block;
          color:rgba(255,255,255,.72);
          font-size:10px;
          line-height:1;
          font-weight:900;
          letter-spacing:1.9px;
          text-align:left;
          margin:2px 0 12px;
          text-transform:uppercase;
        }

        .th-menu-wrapper .mobile-logo{
          background:#ffffff !important;
          border:1px solid rgba(0,194,209,.20) !important;
          border-radius:16px !important;
          padding:12px 14px !important;
          margin:0 0 18px !important;
          box-shadow:0 14px 32px rgba(0,0,0,.22) !important;
          text-align:center !important;
        }

        .th-menu-wrapper .mobile-logo img{
          max-width:150px !important;
          width:auto !important;
          height:auto !important;
          display:inline-block !important;
        }

        .th-menu-wrapper .th-menu-toggle{
          top:14px !important;
          right:-17px !important;
          width:40px !important;
          height:40px !important;
          line-height:40px !important;
          border-radius:50% !important;
          background:linear-gradient(135deg,#078c95,#00c2d1) !important;
          color:#ffffff !important;
          border:1px solid rgba(255,255,255,.24) !important;
          box-shadow:0 0 20px rgba(0,194,209,.38) !important;
          font-size:17px !important;
        }

        .only-mobile-live{
          margin:0 0 16px !important;
          padding:0 !important;
          list-style:none !important;
          text-align:center !important;
        }

        .btn-live-mobile{
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          gap:10px !important;
          width:100% !important;
          min-height:50px !important;
          padding:12px 14px !important;
          border-radius:14px !important;
          background:linear-gradient(135deg,#00c2d1 0%,#008dff 100%) !important;
          color:#ffffff !important;
          font-size:13px !important;
          font-weight:900 !important;
          line-height:1.15 !important;
          letter-spacing:.8px !important;
          text-transform:uppercase !important;
          box-shadow:0 14px 30px rgba(0,141,255,.24), inset 0 1px 0 rgba(255,255,255,.20) !important;
          border:1px solid rgba(255,255,255,.18) !important;
        }

        .btn-live-mobile:before{
          content:'';
          width:9px;
          height:9px;
          flex:0 0 9px;
          border-radius:50%;
          background:#ffffff;
          box-shadow:0 0 12px rgba(255,255,255,.80);
        }

        .live-help-text{
          color:rgba(255,255,255,.68) !important;
          font-size:11.5px !important;
          line-height:1.45 !important;
          font-weight:650 !important;
          margin:8px auto 0 !important;
          max-width:230px !important;
        }

        .th-mobile-menu{
          margin-top:4px !important;
        }

        .th-mobile-menu ul{
          padding:0 !important;
          margin:0 !important;
        }

        .th-mobile-menu li{
          border:0 !important;
          margin:0 0 7px !important;
          list-style:none !important;
        }

        .th-mobile-menu li > a{
          display:flex !important;
          align-items:center !important;
          min-height:42px !important;
          padding:10px 13px !important;
          border-radius:12px !important;
          background:rgba(255,255,255,.044) !important;
          border:1px solid rgba(255,255,255,.08) !important;
          color:rgba(255,255,255,.90) !important;
          font-size:14px !important;
          font-weight:820 !important;
          letter-spacing:.2px !important;
          text-transform:none !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.035) !important;
        }

        .th-mobile-menu li > a:before{
          content:'';
          width:6px;
          height:6px;
          flex:0 0 6px;
          border-radius:50%;
          background:#00c2d1;
          margin-right:11px;
          box-shadow:0 0 9px rgba(0,194,209,.52);
        }

        .th-mobile-menu li > a:hover,
        .th-mobile-menu li.th-active > a,
        .th-mobile-menu li > a:focus{
          background:linear-gradient(90deg,rgba(0,194,209,.18),rgba(255,255,255,.055)) !important;
          border-color:rgba(0,194,209,.32) !important;
          color:#ffffff !important;
          transform:translateX(2px) !important;
        }

        .th-mobile-menu .th-item-has-children > a,
        .th-mobile-menu .menu-item-has-children > a{
          padding-right:50px !important;
        }

        .th-mobile-menu .th-mean-expand{
          width:30px !important;
          height:30px !important;
          line-height:30px !important;
          right:7px !important;
          top:6px !important;
          border-radius:50% !important;
          background:rgba(255,255,255,.94) !important;
          color:#061426 !important;
          border:1px solid rgba(0,194,209,.18) !important;
          font-size:16px !important;
          box-shadow:0 0 12px rgba(0,194,209,.14) !important;
        }

        .th-mobile-menu .sub-menu{
          margin:7px 0 9px 11px !important;
          padding:7px !important;
          border-radius:14px !important;
          background:rgba(0,0,0,.22) !important;
          border:1px solid rgba(0,194,209,.11) !important;
        }

        .th-mobile-menu .sub-menu li{
          margin-bottom:5px !important;
        }

        .th-mobile-menu .sub-menu a{
          min-height:36px !important;
          font-size:13px !important;
          font-weight:740 !important;
          padding:9px 11px !important;
          background:rgba(255,255,255,.032) !important;
        }

        .th-menu-wrapper .th-menu-area::-webkit-scrollbar{
          width:5px;
        }
        .th-menu-wrapper .th-menu-area::-webkit-scrollbar-thumb{
          background:#00c2d1;
          border-radius:20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeLabel(text) {
    return (text || '')
      .replace(/[🏠📚👨‍🏫🎓📍📰📲➡️🔴]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function cleanMobileLabels() {
    document.querySelectorAll('.th-mobile-menu a').forEach(function (a) {
      var text = normalizeLabel(a.textContent);
      if (text === 'inicio') a.textContent = 'Inicio';
      if (text === 'ciclos') a.textContent = 'Ciclos';
      if (text === 'docentes') a.textContent = 'Docentes';
      if (text === 'cachimbos') a.textContent = 'Cachimbos';
      if (text === 'sede' || text === 'sedes') a.textContent = 'Sede';
      if (text === 'noticias') a.textContent = 'Noticias';
      if (text === 'contacto') a.textContent = 'Contacto';
    });

    document.querySelectorAll('.btn-live-mobile').forEach(function (a) {
      a.textContent = 'Clases en vivo';
    });

    document.querySelectorAll('.live-help-text').forEach(function (p) {
      p.textContent = 'Acceso a clases virtuales y soporte de ingreso';
    });
  }

  function init() {
    injectMobileMenuStyles();
    cleanMobileLabels();
    setTimeout(cleanMobileLabels, 250);
    setTimeout(cleanMobileLabels, 900);
    setTimeout(cleanMobileLabels, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
