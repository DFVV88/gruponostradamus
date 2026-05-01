/* ==================================================
   Grupo Nostradamus - Menú móvil PRO
   Mejora visual del menú lateral en celulares.
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
          background:rgba(0,0,0,.72) !important;
          backdrop-filter:blur(5px) !important;
        }

        .th-menu-wrapper .th-menu-area{
          width:min(86vw,340px) !important;
          max-width:340px !important;
          background:
            radial-gradient(circle at 18% 12%, rgba(0,194,209,.20), transparent 32%),
            radial-gradient(circle at 100% 25%, rgba(255,255,255,.08), transparent 25%),
            linear-gradient(180deg,#061426 0%,#02070d 52%,#07121f 100%) !important;
          border-right:2px solid rgba(0,194,209,.62) !important;
          box-shadow:16px 0 46px rgba(0,0,0,.55), 0 0 28px rgba(0,194,209,.22) !important;
          padding:22px 22px 28px !important;
          overflow-y:auto !important;
        }

        .th-menu-wrapper .th-menu-area:before{
          content:'GRUPO NOSTRADAMUS';
          display:block;
          color:rgba(255,255,255,.72);
          font-size:11px;
          line-height:1;
          font-weight:900;
          letter-spacing:1.4px;
          text-align:left;
          margin:2px 0 14px;
          text-transform:uppercase;
        }

        .th-menu-wrapper .mobile-logo{
          background:rgba(255,255,255,.95) !important;
          border:1px solid rgba(0,194,209,.28) !important;
          border-radius:18px !important;
          padding:12px 14px !important;
          margin:0 0 22px !important;
          box-shadow:0 12px 30px rgba(0,0,0,.25),0 0 18px rgba(0,194,209,.18) !important;
          text-align:center !important;
        }

        .th-menu-wrapper .mobile-logo img{
          max-width:170px !important;
          width:auto !important;
          height:auto !important;
          display:inline-block !important;
        }

        .th-menu-wrapper .th-menu-toggle{
          top:14px !important;
          right:-18px !important;
          width:42px !important;
          height:42px !important;
          line-height:42px !important;
          border-radius:50% !important;
          background:linear-gradient(135deg,#078c95,#00c2d1) !important;
          color:#ffffff !important;
          border:1px solid rgba(255,255,255,.25) !important;
          box-shadow:0 0 22px rgba(0,194,209,.48) !important;
          font-size:18px !important;
        }

        .only-mobile-live{
          margin:0 0 22px !important;
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
          min-height:58px !important;
          padding:13px 14px !important;
          border-radius:17px !important;
          background:linear-gradient(135deg,#f02816 0%,#e74713 56%,#9c170c 100%) !important;
          color:#ffffff !important;
          font-size:15px !important;
          font-weight:950 !important;
          line-height:1.15 !important;
          letter-spacing:.3px !important;
          text-transform:uppercase !important;
          box-shadow:0 0 30px rgba(255,80,24,.55), inset 0 1px 0 rgba(255,255,255,.25) !important;
          border:1px solid rgba(255,255,255,.18) !important;
        }

        .btn-live-mobile:before{
          content:'';
          width:12px;
          height:12px;
          flex:0 0 12px;
          border-radius:50%;
          background:#ff5a5a;
          box-shadow:0 0 12px rgba(255,80,80,.9);
        }

        .live-help-text{
          color:rgba(255,255,255,.88) !important;
          font-size:12px !important;
          line-height:1.45 !important;
          font-weight:750 !important;
          margin:11px auto 0 !important;
          max-width:220px !important;
        }

        .th-mobile-menu{
          margin-top:8px !important;
        }

        .th-mobile-menu ul{
          padding:0 !important;
          margin:0 !important;
        }

        .th-mobile-menu li{
          border:0 !important;
          margin:0 0 8px !important;
          list-style:none !important;
        }

        .th-mobile-menu li > a{
          display:flex !important;
          align-items:center !important;
          min-height:46px !important;
          padding:12px 14px !important;
          border-radius:14px !important;
          background:rgba(255,255,255,.045) !important;
          border:1px solid rgba(255,255,255,.09) !important;
          color:rgba(255,255,255,.92) !important;
          font-size:15px !important;
          font-weight:900 !important;
          letter-spacing:.2px !important;
          text-transform:capitalize !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.04) !important;
        }

        .th-mobile-menu li > a:before{
          content:'›';
          color:#00e5f2;
          font-size:22px;
          line-height:1;
          margin-right:9px;
          text-shadow:0 0 10px rgba(0,194,209,.68);
        }

        .th-mobile-menu li > a:hover,
        .th-mobile-menu li.th-active > a,
        .th-mobile-menu li > a:focus{
          background:linear-gradient(90deg,rgba(0,194,209,.25),rgba(255,255,255,.07)) !important;
          border-color:rgba(0,194,209,.35) !important;
          color:#ffffff !important;
          transform:translateX(2px) !important;
        }

        .th-mobile-menu .th-item-has-children > a,
        .th-mobile-menu .menu-item-has-children > a{
          padding-right:52px !important;
        }

        .th-mobile-menu .th-mean-expand{
          width:34px !important;
          height:34px !important;
          line-height:34px !important;
          right:8px !important;
          top:6px !important;
          border-radius:50% !important;
          background:rgba(255,255,255,.92) !important;
          color:#061426 !important;
          border:1px solid rgba(0,194,209,.22) !important;
          font-size:18px !important;
          box-shadow:0 0 14px rgba(0,194,209,.18) !important;
        }

        .th-mobile-menu .sub-menu{
          margin:8px 0 10px 12px !important;
          padding:8px !important;
          border-radius:16px !important;
          background:rgba(0,0,0,.20) !important;
          border:1px solid rgba(0,194,209,.12) !important;
        }

        .th-mobile-menu .sub-menu li{
          margin-bottom:6px !important;
        }

        .th-mobile-menu .sub-menu a{
          min-height:40px !important;
          font-size:14px !important;
          font-weight:800 !important;
          padding:10px 12px !important;
          background:rgba(255,255,255,.035) !important;
        }

        .th-menu-wrapper .th-menu-area::-webkit-scrollbar{
          width:6px;
        }
        .th-menu-wrapper .th-menu-area::-webkit-scrollbar-thumb{
          background:#00c2d1;
          border-radius:20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceLabels() {
    document.querySelectorAll('.th-mobile-menu a').forEach(function (a) {
      var text = (a.textContent || '').trim().toLowerCase();
      if (text === 'inicio') a.innerHTML = '🏠 Inicio';
      if (text === 'ciclos') a.innerHTML = '📚 Ciclos';
      if (text === 'docentes') a.innerHTML = '👨‍🏫 Docentes';
      if (text === 'cachimbos') a.innerHTML = '🎓 Cachimbos';
      if (text === 'sede' || text === 'sedes') a.innerHTML = '📍 Sede';
      if (text === 'noticias') a.innerHTML = '📰 Noticias';
      if (text === 'contacto') a.innerHTML = '📲 Contacto';
    });
  }

  function init() {
    injectMobileMenuStyles();
    enhanceLabels();
    setTimeout(enhanceLabels, 400);
    setTimeout(enhanceLabels, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
