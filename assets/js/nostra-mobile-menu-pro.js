/* ==================================================
   Grupo Nostradamus - Menú móvil institucional ELITE
   Panel móvil más moderno, limpio y compacto.
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
          background:rgba(0,5,10,.74) !important;
          backdrop-filter:blur(12px) saturate(1.15) !important;
        }

        .th-menu-wrapper .th-menu-area{
          width:min(82vw,292px) !important;
          max-width:292px !important;
          min-height:100vh !important;
          background:
            radial-gradient(circle at 8% 0%, rgba(0,212,223,.22), transparent 31%),
            radial-gradient(circle at 100% 24%, rgba(0,141,255,.13), transparent 28%),
            linear-gradient(180deg,#061426 0%,#02070d 62%,#06111d 100%) !important;
          border-right:1px solid rgba(0,212,223,.42) !important;
          box-shadow:18px 0 46px rgba(0,0,0,.58), inset -1px 0 0 rgba(255,255,255,.04) !important;
          padding:14px 13px 18px !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
        }

        .th-menu-wrapper .th-menu-area:before{
          content:'GRUPO NOSTRADAMUS';
          display:flex;
          align-items:center;
          gap:8px;
          color:rgba(255,255,255,.76);
          font-size:9.5px;
          line-height:1;
          font-weight:950;
          letter-spacing:1.8px;
          text-align:left;
          margin:1px 0 9px 1px;
          text-transform:uppercase;
        }

        .th-menu-wrapper .th-menu-area:after{
          content:'La ruta que transforma alumnos en cachimbos';
          display:block;
          color:rgba(255,255,255,.48);
          font-size:10.5px;
          line-height:1.25;
          font-weight:650;
          margin:-4px 0 11px 1px;
        }

        .th-menu-wrapper .mobile-logo{
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          min-height:96px !important;
          background:linear-gradient(135deg,#ffffff,#eefcff) !important;
          border:1px solid rgba(0,194,209,.24) !important;
          border-radius:20px !important;
          padding:10px 14px !important;
          margin:0 0 12px !important;
          box-shadow:0 14px 28px rgba(0,0,0,.22),0 0 22px rgba(0,194,209,.08) !important;
          text-align:center !important;
        }

        .th-menu-wrapper .mobile-logo img{
          max-width:168px !important;
          max-height:72px !important;
          width:auto !important;
          height:auto !important;
          object-fit:contain !important;
          display:block !important;
        }

        .th-menu-wrapper .th-menu-toggle{
          top:18px !important;
          right:-18px !important;
          width:40px !important;
          height:40px !important;
          line-height:40px !important;
          border-radius:50% !important;
          background:linear-gradient(135deg,#00c2d1,#007f8a) !important;
          color:#ffffff !important;
          border:1px solid rgba(255,255,255,.24) !important;
          box-shadow:0 0 24px rgba(0,194,209,.42),0 8px 18px rgba(0,0,0,.24) !important;
          font-size:16px !important;
        }

        .only-mobile-live{
          margin:0 0 10px !important;
          padding:0 !important;
          list-style:none !important;
          text-align:center !important;
        }

        .btn-live-mobile{
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          gap:9px !important;
          width:100% !important;
          min-height:44px !important;
          padding:10px 12px !important;
          border-radius:15px !important;
          background:linear-gradient(135deg,#ff3434 0%,#d71313 50%,#ff6a00 100%) !important;
          color:#ffffff !important;
          font-size:12.5px !important;
          font-weight:950 !important;
          line-height:1.05 !important;
          letter-spacing:.8px !important;
          text-transform:uppercase !important;
          box-shadow:0 12px 24px rgba(255,65,35,.24), inset 0 1px 0 rgba(255,255,255,.22) !important;
          border:1px solid rgba(255,255,255,.16) !important;
        }

        .btn-live-mobile:before{
          content:'';
          width:8px;
          height:8px;
          flex:0 0 8px;
          border-radius:50%;
          background:#ffffff;
          box-shadow:0 0 12px rgba(255,255,255,.95),0 0 20px rgba(255,0,0,.9);
          animation:nostraLiveDot 1.2s ease-in-out infinite;
        }

        .live-help-text{
          color:rgba(255,255,255,.58) !important;
          font-size:10.5px !important;
          line-height:1.28 !important;
          font-weight:650 !important;
          margin:6px auto 0 !important;
          max-width:225px !important;
        }

        .th-mobile-menu{margin-top:2px !important;}
        .th-mobile-menu ul{padding:0 !important;margin:0 !important;}

        .th-mobile-menu > ul > li{
          border:0 !important;
          margin:0 0 6px !important;
          list-style:none !important;
          position:relative !important;
        }

        .th-mobile-menu li > a{
          display:flex !important;
          align-items:center !important;
          min-height:40px !important;
          padding:9px 12px 9px 13px !important;
          border-radius:13px !important;
          background:rgba(255,255,255,.052) !important;
          border:1px solid rgba(255,255,255,.075) !important;
          color:rgba(255,255,255,.93) !important;
          font-size:13.6px !important;
          font-weight:860 !important;
          letter-spacing:.15px !important;
          text-transform:none !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.035) !important;
          transition:transform .22s ease, background .22s ease, border-color .22s ease, box-shadow .22s ease !important;
        }

        .th-mobile-menu li > a:before{
          content:'';
          width:7px;
          height:7px;
          flex:0 0 7px;
          border-radius:50%;
          background:#00d4df;
          margin-right:10px;
          box-shadow:0 0 11px rgba(0,212,223,.70);
        }

        .th-mobile-menu li > a:hover,
        .th-mobile-menu li.th-active > a,
        .th-mobile-menu li > a:focus{
          background:linear-gradient(90deg,rgba(0,194,209,.22),rgba(255,255,255,.062)) !important;
          border-color:rgba(0,194,209,.34) !important;
          color:#ffffff !important;
          transform:translateX(2px) !important;
          box-shadow:0 8px 16px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.05) !important;
        }

        .th-mobile-menu .th-item-has-children > a,
        .th-mobile-menu .menu-item-has-children > a{
          padding-right:45px !important;
        }

        .th-mobile-menu .th-mean-expand{
          position:absolute !important;
          right:7px !important;
          top:6px !important;
          width:29px !important;
          height:29px !important;
          line-height:29px !important;
          border-radius:12px !important;
          background:linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,.05)) !important;
          color:#ffffff !important;
          border:1px solid rgba(0,194,209,.24) !important;
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

        .th-mobile-menu li.th-active > .th-mean-expand:after{transform:translate(-50%,-50%) rotate(0deg) !important;}

        .th-mobile-menu .sub-menu{
          margin:6px 0 8px 0 !important;
          padding:7px 7px 4px !important;
          border-radius:14px !important;
          background:rgba(0,0,0,.22) !important;
          border:1px solid rgba(0,194,209,.09) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.035) !important;
        }

        .th-mobile-menu .sub-menu li{margin-bottom:5px !important;}

        .th-mobile-menu .sub-menu a{
          min-height:34px !important;
          font-size:12.2px !important;
          font-weight:760 !important;
          padding:8px 10px !important;
          background:rgba(255,255,255,.035) !important;
          border-radius:10px !important;
          color:rgba(255,255,255,.86) !important;
        }

        .th-mobile-menu .sub-menu a:before{
          width:4px !important;
          height:4px !important;
          border-radius:50% !important;
          margin-right:8px !important;
          background:rgba(0,212,223,.82) !important;
        }

        .th-menu-wrapper .th-menu-area::-webkit-scrollbar{width:4px;}
        .th-menu-wrapper .th-menu-area::-webkit-scrollbar-thumb{background:#00c2d1;border-radius:20px;}

        @keyframes nostraLiveDot{
          0%,100%{transform:scale(1);opacity:1;}
          50%{transform:scale(.72);opacity:.65;}
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
      if (text === 'sede' || text === 'sedes') a.textContent = 'Sede UNI';
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
