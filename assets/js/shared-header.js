/* ==================================================
   Grupo Nostradamus - Encabezado compartido
   Subpáginas con el mismo encabezado visual del index.
   No reemplaza index.html ni iq100.html.
================================================== */
(function () {
  var currentPath = window.location.pathname.toLowerCase();
  var fileName = currentPath.split('/').pop() || 'index.html';
  var isIndex = currentPath === '/' || fileName === 'index.html' || fileName === '';
  var isIq100 = currentPath.indexOf('iq100.html') !== -1;

  if (isIndex || isIq100) return;
  if (document.querySelector('.nostra-index-header-clone')) return;

  var ciclos = [
    ['Anual UNI', 'ciclo-anual-uni.html'],
    ['Semianual UNI', 'ciclo-semianual-uni.html'],
    ['Semestral UNI', 'ciclo-semestral-uni.html'],
    ['Élite UNI', 'ciclo-elite-uni.html'],
    ['IEN', 'ciclo-ien.html'],
    ['Proyecto Escolar', 'ciclo-proyecto-escolar.html'],
    ['Repaso UNI', 'ciclo-repaso-uni.html'],
    ['Paralelo CEPRE UNI', 'ciclo-paralelo-cepre-uni.html'],
    ['Ciclo Verano UNI', 'ciclo-verano-uni.html']
  ];

  var cicloPages = ciclos.map(function (item) { return item[1]; });

  function active(page, group) {
    if (group === 'ciclos' && (fileName === 'ciclos.html' || cicloPages.indexOf(fileName) !== -1)) return ' active';
    if (group === 'sedes' && (fileName === 'sedes.html' || currentPath.indexOf('sede') !== -1)) return ' active';
    if (group === 'blog' && (fileName === 'blog.html' || currentPath.indexOf('blog') !== -1 || currentPath.indexOf('noticia') !== -1)) return ' active';
    return fileName === page ? ' active' : '';
  }

  function injectStyles() {
    if (document.getElementById('nostra-shared-header-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-shared-header-style';
    style.textContent = `
      body.nostra-subpage-index-header .th-header,
      body.nostra-subpage-index-header header.th-header,
      body.nostra-subpage-index-header .header-layout1,
      body.nostra-subpage-index-header .header-layout2,
      body.nostra-subpage-index-header .header-default,
      body.nostra-subpage-index-header .header-layout6,
      body.nostra-subpage-index-header .header-top,
      body.nostra-subpage-index-header .sticky-wrapper,
      body.nostra-subpage-index-header .menu-area,
      body.nostra-subpage-index-header .main-menu-area,
      body.nostra-subpage-index-header .top-area,
      body.nostra-subpage-index-header .th-menu-wrapper,
      body.nostra-subpage-index-header .popup-search-box{
        display:none !important;
      }

      .nostra-index-header-clone,
      .nostra-index-header-clone *{
        box-sizing:border-box;
      }
      .nostra-index-header-clone{
        width:100%;
        position:relative;
        z-index:9999;
        background:#fff;
        font-family:'Jost', Arial, sans-serif !important;
      }
      .nostra-index-header-clone a{text-decoration:none;}

      .nostra-top-alert{
        background:linear-gradient(90deg,#02070d 0%,#053f49 52%,#098c94 100%);
        color:#fff;
        text-align:center;
        min-height:36px;
        padding:8px 14px;
        font-size:15px;
        line-height:1.2;
        font-weight:900;
        letter-spacing:.65px;
        text-transform:uppercase;
      }
      .nostra-top-alert a{color:#fff;}
      .nostra-top-alert span{text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:2px;}

      .nostra-info-row{
        background:linear-gradient(90deg,#062335 0%,#063e4b 46%,#098c94 100%);
        color:#fff;
      }
      .nostra-info-inner{
        max-width:1460px;
        min-height:54px;
        margin:0 auto;
        padding:0 38px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
        flex-wrap:nowrap;
      }
      .nostra-info-left,
      .nostra-info-right{
        display:flex;
        align-items:center;
        gap:18px;
        flex-wrap:nowrap;
        min-width:0;
      }
      .nostra-info-link,
      .nostra-social-title{
        color:#fff !important;
        font-size:14px;
        font-weight:700;
        line-height:1;
        white-space:nowrap;
      }
      .nostra-info-link i{margin-right:8px;font-size:14px;vertical-align:middle;}
      .nostra-info-sep{width:1px;height:18px;background:#3c8fff;opacity:.9;display:inline-block;flex:0 0 auto;}
      .nostra-live{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        min-height:40px;
        padding:9px 20px;
        border-radius:10px;
        background:linear-gradient(135deg,#ff1635,#ff5718);
        color:#fff !important;
        font-size:14px;
        font-weight:900;
        box-shadow:0 0 24px rgba(255,66,25,.65),0 0 42px rgba(255,66,25,.32);
        white-space:nowrap;
      }
      .nostra-live:before{
        content:'';
        width:14px;
        height:14px;
        border-radius:50%;
        background:linear-gradient(135deg,#ff4d73,#ad67ff);
        box-shadow:0 0 10px rgba(255,255,255,.35) inset;
      }
      .nostra-social{display:flex;align-items:center;gap:14px;white-space:nowrap;}
      .nostra-social a{color:#fff !important;font-size:14px;line-height:1;}

      .nostra-main-row{
        background:#fff;
        position:relative;
        overflow:visible;
      }
      .nostra-main-inner{
        max-width:1460px;
        min-height:138px;
        margin:0 auto;
        padding:22px 38px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:32px;
        position:relative;
      }
      .nostra-logo{display:inline-flex;align-items:center;position:relative;z-index:2;flex:0 0 auto;}
      .nostra-logo img{width:185px;max-width:185px;height:auto;display:block;}
      .nostra-nav{
        display:flex;
        align-items:center;
        justify-content:center;
        gap:32px;
        flex:1 1 auto;
        position:relative;
        z-index:4;
      }
      .nostra-nav-item{position:relative;}
      .nostra-nav-link{
        display:inline-flex;
        align-items:center;
        gap:6px;
        color:#071326 !important;
        font-size:16px;
        font-weight:900;
        letter-spacing:.25px;
        text-transform:uppercase;
        padding:18px 0;
        white-space:nowrap;
        line-height:1;
      }
      .nostra-nav-link.active,
      .nostra-nav-link:hover{color:#008b96 !important;}
      .nostra-submenu{
        position:absolute;
        top:100%;
        left:-18px;
        min-width:235px;
        padding:12px;
        margin:0;
        list-style:none;
        background:#fff;
        border-radius:12px;
        box-shadow:0 18px 45px rgba(0,0,0,.14);
        opacity:0;
        visibility:hidden;
        transform:translateY(10px);
        transition:.22s ease;
      }
      .nostra-nav-item:hover .nostra-submenu{opacity:1;visibility:visible;transform:translateY(0);}
      .nostra-submenu a{
        display:block;
        color:#071326 !important;
        font-size:14px;
        font-weight:800;
        padding:10px 12px;
        border-radius:10px;
      }
      .nostra-submenu a:hover{background:#eefbfd;color:#008b96 !important;}
      .nostra-cta{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:10px;
        min-height:52px;
        padding:13px 24px;
        border-radius:16px;
        background:linear-gradient(135deg,#098e96 0%,#051427 100%);
        color:#fff !important;
        font-size:13px;
        font-weight:950;
        letter-spacing:.35px;
        text-transform:uppercase;
        box-shadow:0 14px 32px rgba(0,137,150,.25),0 0 0 3px rgba(255,255,255,.84) inset;
        white-space:nowrap;
        position:relative;
        z-index:5;
      }
      .nostra-cta i:last-child{font-size:14px;}
      .nostra-iq{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        position:relative;
        z-index:1;
        flex:0 0 auto;
      }
      .nostra-iq img{width:118px;max-width:118px;height:auto;display:block;}
      .nostra-mobile-toggle{
        display:none;
        width:46px;
        height:46px;
        border:0;
        border-radius:12px;
        background:linear-gradient(135deg,#098e96,#051427);
        color:#fff;
        font-size:22px;
        position:relative;
        z-index:6;
      }
      .nostra-mobile-panel{display:none;background:linear-gradient(180deg,#061426,#02070d);padding:14px;}
      .nostra-mobile-panel a{
        display:block;
        color:#fff !important;
        font-size:14px;
        font-weight:900;
        text-transform:uppercase;
        padding:13px 14px;
        border-radius:12px;
        margin-bottom:8px;
        background:rgba(255,255,255,.075);
        border:1px solid rgba(255,255,255,.08);
      }
      .nostra-mobile-panel a.active{background:linear-gradient(135deg,#00c2d1,#008b96);}
      .nostra-mobile-panel.open{display:block;}

      @media(max-width:1399px){
        .nostra-info-link,.nostra-social-title{font-size:13px;}
        .nostra-nav{gap:24px;}
        .nostra-nav-link{font-size:14px;}
        .nostra-logo img{width:170px;max-width:170px;}
        .nostra-cta{font-size:12px;padding:12px 18px;min-height:48px;}
        .nostra-iq img{width:105px;max-width:105px;}
      }
      @media(max-width:1199px){
        .nostra-info-inner{padding:0 22px;gap:12px;}
        .nostra-info-left,.nostra-info-right{gap:12px;}
        .nostra-info-link,.nostra-social-title{font-size:12px;}
        .nostra-main-inner{padding:18px 22px;gap:18px;min-height:112px;}
        .nostra-nav{gap:16px;}
        .nostra-nav-link{font-size:13px;}
        .nostra-iq{display:none;}
      }
      @media(max-width:991px){
        .nostra-info-row{display:none;}
        .nostra-top-alert{font-size:12px;line-height:1.35;padding:9px 12px;min-height:auto;}
        .nostra-main-inner{min-height:88px;padding:14px 18px;}
        .nostra-logo img{width:150px;max-width:150px;}
        .nostra-nav,.nostra-cta,.nostra-iq{display:none;}
        .nostra-mobile-toggle{display:inline-flex;align-items:center;justify-content:center;}
      }
    `;
    document.head.appendChild(style);
  }

  function menuCiclos() {
    return ciclos.map(function (item) {
      return '<li><a href="' + item[1] + '">' + item[0] + '</a></li>';
    }).join('');
  }

  function navDesktop() {
    return `
      <nav class="nostra-nav" aria-label="Menú principal">
        <div class="nostra-nav-item"><a class="nostra-nav-link${active('index.html')}" href="index.html">INICIO</a></div>
        <div class="nostra-nav-item">
          <a class="nostra-nav-link${active('ciclos.html', 'ciclos')}" href="ciclos.html">CICLOS <i class="far fa-chevron-down"></i></a>
          <ul class="nostra-submenu">${menuCiclos()}</ul>
        </div>
        <div class="nostra-nav-item"><a class="nostra-nav-link${active('docentes.html')}" href="docentes.html">DOCENTES</a></div>
        <div class="nostra-nav-item"><a class="nostra-nav-link${active('cachimbos.html')}" href="cachimbos.html">CACHIMBOS</a></div>
        <div class="nostra-nav-item">
          <a class="nostra-nav-link${active('sedes.html', 'sedes')}" href="sedes.html">SEDE <i class="far fa-chevron-down"></i></a>
          <ul class="nostra-submenu"><li><a href="sedes.html">UNI</a></li></ul>
        </div>
        <div class="nostra-nav-item"><a class="nostra-nav-link${active('blog.html', 'blog')}" href="blog.html">NOTICIAS</a></div>
        <div class="nostra-nav-item"><a class="nostra-nav-link" href="index.html#contacto">CONTACTO</a></div>
      </nav>
    `;
  }

  function navMobile() {
    var links = [
      ['INICIO', 'index.html', active('index.html')],
      ['CICLOS', 'ciclos.html', active('ciclos.html', 'ciclos')],
      ['DOCENTES', 'docentes.html', active('docentes.html')],
      ['CACHIMBOS', 'cachimbos.html', active('cachimbos.html')],
      ['SEDE', 'sedes.html', active('sedes.html', 'sedes')],
      ['NOTICIAS', 'blog.html', active('blog.html', 'blog')],
      ['CONTACTO', 'index.html#contacto', ''],
      ['📲 SOLICITAR INFORMES', 'https://wa.me/51993750351?text=Hola%20quiero%20informes%20sobre%20la%20matr%C3%ADcula%20en%20el%20Grupo%20Nostradamus', '']
    ];
    return links.map(function (item) {
      var external = item[1].indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
      return '<a class="' + item[2].trim() + '" href="' + item[1] + '"' + external + '>' + item[0] + '</a>';
    }).join('');
  }

  function createHeader() {
    document.body.classList.add('nostra-subpage-index-header');

    var wrapper = document.getElementById('site-header');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'site-header';
      document.body.insertBefore(wrapper, document.body.firstChild);
    }

    wrapper.innerHTML = `
      <header class="nostra-index-header-clone">
        <div class="nostra-top-alert">
          <a href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20informes%20sobre%20los%20nuevos%20ciclos%20UNI" target="_blank" rel="noopener">
            🚀 NUEVOS CICLOS UNI DISPONIBLES · CUPOS LIMITADOS · <span>SOLICITAR INFORMES POR WHATSAPP</span>
          </a>
        </div>

        <div class="nostra-info-row">
          <div class="nostra-info-inner">
            <div class="nostra-info-left">
              <a class="nostra-info-link" href="https://wa.me/51993750351?text=Hola%20Nostradamus,%20quiero%20informes%20sobre%20los%20ciclos%20de%20preparaci%C3%B3n." target="_blank" rel="noopener"><i class="far fa-phone"></i>993 750 351</a>
              <span class="nostra-info-sep"></span>
              <a class="nostra-info-link" href="https://maps.app.goo.gl/XUF3vLuP6svEMZzj7" target="_blank" rel="noopener"><i class="far fa-location-dot"></i>Av.Gerardo Unger 193, SMP.</a>
              <span class="nostra-info-sep"></span>
              <a class="nostra-info-link" href="index.html#contacto"><i class="far fa-envelope"></i>informes@gruponostradamus.edu.pe</a>
            </div>
            <div class="nostra-info-right">
              <a class="nostra-live" href="https://teams.microsoft.com" target="_blank" rel="noopener">CLASES EN VIVO</a>
              <span class="nostra-info-sep"></span>
              <div class="nostra-social">
                <span class="nostra-social-title">Síguenos en:</span>
                <a href="https://www.facebook.com/gruponostradamus" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://www.instagram.com/gruponostradamus/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://www.tiktok.com/@grupo_nostradamus" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                <a href="https://www.youtube.com/@GrupoNostradamus" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>
        </div>

        <div class="nostra-main-row">
          <div class="nostra-main-inner">
            <a class="nostra-logo" href="index.html"><img src="assets/img/logo.png" alt="Grupo Nostradamus"></a>
            ${navDesktop()}
            <a class="nostra-cta" href="https://wa.me/51993750351?text=Hola%20quiero%20informes%20sobre%20la%20matr%C3%ADcula%20en%20el%20Grupo%20Nostradamus" target="_blank" rel="noopener"><i class="fas fa-mobile-alt"></i> SOLICITAR INFORMES <i class="fas fa-arrow-right"></i></a>
            <a class="nostra-iq" href="iq100.html"><img src="assets/img/logo-iq100.png" alt="IQ100 Grupo de Estudio"></a>
            <button class="nostra-mobile-toggle" type="button" aria-label="Abrir menú"><i class="far fa-bars"></i></button>
          </div>
        </div>

        <div class="nostra-mobile-panel">${navMobile()}</div>
      </header>
    `;

    var toggle = wrapper.querySelector('.nostra-mobile-toggle');
    var panel = wrapper.querySelector('.nostra-mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
        toggle.innerHTML = panel.classList.contains('open') ? '<i class="fal fa-times"></i>' : '<i class="far fa-bars"></i>';
      });
    }
  }

  function init() {
    injectStyles();
    createHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
