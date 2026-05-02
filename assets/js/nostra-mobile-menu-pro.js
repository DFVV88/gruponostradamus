/* ==================================================
   Grupo Nostradamus - Menú móvil institucional PRO
   Rediseño compacto y limpio para celulares.
   - Sin emojis decorativos.
   - Botones más delgados y legibles.
   - Submenús integrados sin círculos que tapen texto.
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
          background:rgba(2,7,13,.70) !important;
          backdrop-filter:blur(9px) !important;
        }

        .th-menu-wrapper .th-menu-area{
          width:min(84vw,310px) !important;
          max-width:310px !important;
          min-height:100vh !important;
          background:
            radial-gradient(circle at 15% 7%, rgba(0,194,209,.16), transparent 32%),
            linear-gradient(180deg,#071421 0%,#02070d 70%,#06111d 100%) !important;
          border-right:1px solid rgba(0,194,209,.45) !important;
          box-shadow:18px 0 48px rgba(0,0,0,.55) !important;
          padding:18px 16px 22px !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
        }

        .th-menu-wrapper .th-menu-area:before{
          content:'GRUPO NOSTRADAMUS';
          display:block;
          color:rgba(255,255,255,.72);
          font-size:10px;
          line-height:1;
          font-weight:900;
          letter-spacing:2px;
          text-align:left;
          margin:2px 0 10px;
          text-transform:uppercase;
        }

        .th-menu-wrapper .mobile-logo{
          background:#ffffff !important;
          border:1px solid rgba(0,194,209,.20) !important;
          border-radius:18px !important;
          padding:12px 14px !important;
          margin:0 0 14px !important;
          box-shadow:0 12px 28px rgba(0,0,0,.20) !important;
          text-align:center !important;
        }

        .th-menu-wrapper .mobile-logo img{
          max-width:165px !important;
          width:auto !important;
          height:auto !important;
          display:inline-block !important;
        }

        .th-menu-wrapper .th-menu-toggle{
          top:24px !important;
          right:-19px !important;
          width:42px !important;
          height:42px !important;
          line-height:42px !important;
          border-radius:50% !important;
          background:linear-gradient(135deg,#078c95,#00c2d1) !important;
          color:#ffffff !important;
          border:1px solid rgba(255,255,255,.24) !important;
          box-shadow:0 0 22px rgba(0,194,209,.38) !important;
          font-size:17px !important;
        }

        .only-mobile-live{
          margin:0 0 12px !important;
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
          min-height:46px !important;
          padding:11px 13px !important;
          border-radius:15px !important;
          background:linear-gradient(135deg,#00c2d1 0%,#008dff 100%) !important;
          color:#ffffff !important;
          font-size:13px !important;
          font-weight:900 !important;
          line-height:1.1 !important;
          letter-spacing:.8px !important;
          text-transform:uppercase !important;
          box-shadow:0 12px 26px rgba(0,141,255,.22), inset 0 1px 0 rgba(255,255,255,.18) !important;
          border:1px solid rgba(255,255,255,.18) !important;
        }

        .btn-live-mobile:before{
          content:'';
          width:9px;
          height:9px;
          flex:0 0 9px;
          border-radius:50%;
          background:#ff3131;
          box-shadow:0 0 12px rgba(255,49,49,.85);
        }

        .live-help-text{
          color:rgba(255,255,255,.68) !important;
          font-size:11.5px !important;
          line-height:1.35 !important;
          font-weight:650 !important;
          margin:7px auto 0 !important;
          max-width:235px !important;
        }

        .th-mobile-menu{
          margin-top:3px !important;
        }

        .th-mobile-menu ul{
          padding:0 !important;
          margin:0 !important;
        }

        .th-mobile-menu li{
          border:0 !important;
          margin:0 0 7px !important;
          list-style:none !important;
          position:relative !important;
        }

        .th-mobile-menu li > a{
          display:flex !important;
          align-items:center !important;
          min-height:42px !important;
          padding:10px 13px 10px 16px !important;
          border-radius:14px !important;
          background:rgba(255,255,255,.045) !important;
          border:1px solid rgba(255,255,255,.075) !important;
          color:rgba(255,255,255,.92) !important;
          font-size:14px !important;
          font-weight:830 !important;
          letter-spacing:.2px !important;
          text-transform:none !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.035) !important;
          transition:transform .22s ease, background .22s ease, border-color .22s ease !important;
        }

        .th-mobile-menu li > a:before{
          content:'';
          width:5px;
          height:18px;
          flex:0 0 5px;
          border-radius:999px;
          background:#00c2d1;
          margin-right:11px;
          box-shadow:0 0 10px rgba(0,194,209,.52);
        }

        .th-mobile-menu li > a:hover,
        .th-mobile-menu li.th-active > a,
        .th-mobile-menu li > a:focus{
          background:linear-gradient(90deg,rgba(0,194,209,.18),rgba(255,255,255,.052)) !important;
          border-color:rgba(0,194,209,.32) !important;
          color:#ffffff !important;
          transform:translateX(2px) !important;
        }

        .th-mobile-menu .th-item-has-children > a,
        .th-mobile-menu .menu-item-has-children > a{
          padding-right:48px !important;
        }

        .th-mobile-menu .th-mean-expand{
          position:absolute !important;
          right:9px !important;
          top:7px !important;
          width:28px !important;
          height:28px !important;
          line-height:28px !important;
          border-radius:10px !important;
          background:rgba(255,255,255,.10) !important;
          color:#ffffff !important;
          border:1px solid rgba(0,194,209,.22) !important;
          font-size:0 !important;
          box-shadow:none !important;
          z-index:5 !important;
        }

        .th-mobile-menu .th-mean-expand:before,
        .th-mobile-menu .th-mean-expand:after{
          content:'' !important;
          position:absolute !important;
          left:50% !important;
          top:50% !important;
          width:12px !important;
          height:2px !important;
          border-radius:99px !important;
          background:#ffffff !important;
          transform:translate(-50%,-50%) !important;
        }

        .th-mobile-menu .th-mean-expand:after{
          transform:translate(-50%,-50%) rotate(90deg) !important;
          transition:transform .22s ease !important;
        }

        .th-mobile-menu li.th-active > .th-mean-expand:after{
          transform:translate(-50%,-50%) rotate(0deg) !important;
        }

        .th-mobile-menu .sub-menu{
          margin:7px 0 9px 8px !important;
          padding:7px !important;
          border-radius:14px !important;
          background:rgba(0,0,0,.24) !important;
          border:1px solid rgba(0,194,209,.10) !important;
        }

        .th-mobile-menu .sub-menu li{
          margin-bottom:5px !important;
        }

        .th-mobile-menu .sub-menu a{
          min-height:35px !important;
          font-size:12.5px !important;
          font-weight:720 !important;
          padding:8px 10px !important;
          background:rgba(255,255,255,.032) !important;
          border-radius:10px !important;
        }

        .th-mobile-menu .sub-menu a:before{
          width:4px !important;
          height:4px !important;
          border-radius:50% !important;
          margin-right:9px !important;
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
