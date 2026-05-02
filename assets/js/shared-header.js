/* ==================================================
   Grupo Nostradamus - Header premium compartido
   Subpáginas con la misma línea visual del index, sin ser idénticas.
   No afecta index.html ni iq100.html.
================================================== */
(function () {
  var currentPath = window.location.pathname.toLowerCase();
  var fileName = currentPath.split('/').pop() || 'index.html';
  var isIndex = currentPath === '/' || fileName === 'index.html' || fileName === '';
  var isIq100 = currentPath.indexOf('iq100.html') !== -1;

  if (isIndex || isIq100) return;
  if (document.querySelector('.nostra-premium-header')) return;

  var navItems = [
    { label: 'INICIO', url: 'index.html', key: 'index' },
    { label: 'CICLOS', url: 'ciclos.html', key: 'ciclos' },
    { label: 'DOCENTES', url: 'docentes.html', key: 'docentes' },
    { label: 'CACHIMBOS', url: 'cachimbos.html', key: 'cachimbos' },
    { label: 'SEDE', url: 'sedes.html', key: 'sedes' },
    { label: 'NOTICIAS', url: 'blog.html', key: 'blog' },
    { label: 'CONTACTO', url: 'contacto.html', key: 'contacto' }
  ];

  var cicloPages = [
    'ciclo-anual-uni.html', 'ciclo-semianual-uni.html', 'ciclo-semestral-uni.html',
    'ciclo-repaso-uni.html', 'ciclo-elite-uni.html', 'ciclo-ien.html',
    'ciclo-paralelo-cepre-uni.html', 'ciclo-proyecto-escolar.html', 'ciclo-verano-uni.html'
  ];

  function isActive(item) {
    if (item.key === 'ciclos' && (fileName === 'ciclos.html' || cicloPages.indexOf(fileName) !== -1)) return 'active';
    if (item.key === 'sedes' && (fileName === 'sedes.html' || currentPath.indexOf('sede') !== -1)) return 'active';
    if (item.key === 'blog' && (fileName === 'blog.html' || currentPath.indexOf('blog') !== -1 || currentPath.indexOf('noticia') !== -1)) return 'active';
    if (currentPath.indexOf(item.key) !== -1) return 'active';
    return '';
  }

  function injectStyles() {
    if (document.getElementById('nostra-shared-header-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-shared-header-style';
    style.textContent = `
      body.nostra-subpage-with-premium-header .th-header,
      body.nostra-subpage-with-premium-header header.th-header,
      body.nostra-subpage-with-premium-header .header-layout1,
      body.nostra-subpage-with-premium-header .header-layout2,
      body.nostra-subpage-with-premium-header .header-default,
      body.nostra-subpage-with-premium-header .sticky-wrapper,
      body.nostra-subpage-with-premium-header .header-top,
      body.nostra-subpage-with-premium-header .header-links,
      body.nostra-subpage-with-premium-header .header-notice,
      body.nostra-subpage-with-premium-header .top-area,
      body.nostra-subpage-with-premium-header .main-menu-area{
        display:none !important;
      }

      body.nostra-subpage-with-premium-header > .text-center,
      body.nostra-subpage-with-premium-header > .marquee,
      body.nostra-subpage-with-premium-header > .announcement-bar{
        display:none !important;
      }

      .nostra-premium-header{
        width:100%;
        position:relative;
        z-index:9999;
        background:#fff;
        box-shadow:0 10px 30px rgba(0,0,0,.075);
        font-family:inherit;
      }

      .nostra-promo-bar{
        background:linear-gradient(90deg,#02070d 0%,#053b44 46%,#008b96 100%);
        color:#fff;
        text-align:center;
        padding:10px 16px;
        font-size:14px;
        font-weight:950;
        letter-spacing:.65px;
        line-height:1.25;
      }

      .nostra-promo-bar a{color:#fff;text-decoration:none;}
      .nostra-promo-bar span{text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px;}

      .nostra-info-bar{
        background:linear-gradient(90deg,#062033 0%,#003d4d 46%,#008b96 100%);
        color:#fff;
      }

      .nostra-info-inner{
        max-width:1460px;
        margin:0 auto;
        min-height:54px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:22px;
        padding:11px 38px;
        font-size:13.5px;
        font-weight:830;
      }

      .nostra-info-bar a{color:#fff;text-decoration:none;}
      .nostra-info-left,.nostra-info-right{display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
      .nostra-info-left span,.nostra-info-left a{white-space:nowrap;}

      .nostra-live-btn{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        min-height:38px;
        padding:9px 20px;
        border-radius:999px;
        background:linear-gradient(135deg,#ff2020,#ff5b1f);
        color:#fff !important;
        font-weight:950;
        box-shadow:0 0 24px rgba(255,60,30,.44);
        white-space:nowrap;
      }

      .nostra-live-btn:before{
        content:'';
        width:10px;
        height:10px;
        border-radius:50%;
        background:#ff7ca4;
        box-shadow:0 0 12px rgba(255,124,164,.95);
      }

      .nostra-main-header{
        background:#fff;
        position:relative;
        overflow:hidden;
      }

      .nostra-main-inner{
        max-width:1460px;
        min-height:118px;
        margin:0 auto;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:30px;
        padding:20px 38px;
        position:relative;
      }

      .nostra-main-inner:after{
        content:'N100';
        position:absolute;
        right:34px;
        bottom:10px;
        color:rgba(0,137,150,.12);
        font-size:70px;
        font-weight:950;
        line-height:1;
        pointer-events:none;
      }

      .nostra-logo{display:inline-flex;align-items:center;position:relative;z-index:2;flex:0 0 auto;}
      .nostra-logo img{width:188px;max-width:188px;height:auto;display:block;}

      .nostra-nav{
        display:flex;
        align-items:center;
        justify-content:center;
        gap:30px;
        flex:1 1 auto;
        position:relative;
        z-index:2;
      }

      .nostra-nav a{
        position:relative;
        padding:10px 0;
        color:#061426;
        font-size:14.5px;
        font-weight:950;
        letter-spacing:.45px;
        text-decoration:none;
        white-space:nowrap;
      }

      .nostra-nav a:after{
        content:'';
        position:absolute;
        left:0;
        bottom:0;
        width:0;
        height:3px;
        border-radius:999px;
        background:#00c2d1;
        transition:width .25s ease;
      }

      .nostra-nav a:hover:after,.nostra-nav a.active:after{width:100%;}
      .nostra-nav a.active{color:#008b96;}

      .nostra-cta{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:10px;
        min-height:52px;
        padding:13px 24px;
        border-radius:18px;
        background:linear-gradient(135deg,#008b96,#061426);
        color:#fff;
        text-decoration:none;
        font-size:13.5px;
        font-weight:950;
        box-shadow:0 14px 34px rgba(0,137,150,.30),0 0 28px rgba(0,194,209,.13);
        white-space:nowrap;
        position:relative;
        z-index:2;
        transition:transform .22s ease,box-shadow .22s ease;
      }

      .nostra-cta:hover{color:#fff;transform:translateY(-3px);box-shadow:0 18px 40px rgba(0,137,150,.38),0 0 30px rgba(0,194,209,.22);}
      .nostra-cta span{font-size:21px;line-height:1;}

      .nostra-mobile-toggle{
        display:none;
        width:46px;
        height:46px;
        border:none;
        border-radius:14px;
        background:linear-gradient(135deg,#008b96,#061426);
        color:#fff;
        font-size:24px;
        font-weight:950;
        align-items:center;
        justify-content:center;
        position:relative;
        z-index:3;
      }

      .nostra-mobile-panel{display:none;background:linear-gradient(180deg,#061426,#02070d);padding:14px;}

      .nostra-mobile-panel a{
        display:block;
        color:#fff;
        text-decoration:none;
        font-size:14px;
        font-weight:900;
        padding:13px 14px;
        border-radius:12px;
        margin-bottom:8px;
        background:rgba(255,255,255,.065);
        border:1px solid rgba(255,255,255,.08);
      }

      .nostra-mobile-panel a.active{background:linear-gradient(135deg,#00c2d1,#008b96);}
      .nostra-mobile-cta{background:linear-gradient(135deg,#25d366,#13a54d) !important;text-align:center;margin-top:10px;}

      @media(max-width:1280px){
        .nostra-main-inner{padding:18px 28px;gap:18px;}
        .nostra-nav{gap:22px;}
        .nostra-cta{padding:12px 18px;font-size:12.8px;}
        .nostra-logo img{width:170px;max-width:170px;}
        .nostra-info-inner{padding-left:28px;padding-right:28px;}
      }

      @media(max-width:991px){
        .nostra-info-bar{display:none;}
        .nostra-main-inner{min-height:86px;padding:14px 18px;}
        .nostra-logo img{width:150px;max-width:150px;}
        .nostra-nav,.nostra-cta{display:none;}
        .nostra-mobile-toggle{display:inline-flex;}
        .nostra-mobile-panel.open{display:block;}
        .nostra-promo-bar{font-size:12px;line-height:1.4;padding:9px 14px;}
        .nostra-main-inner:after{font-size:42px;right:18px;bottom:10px;}
      }
    `;
    document.head.appendChild(style);
  }

  function createHeader() {
    document.body.classList.add('nostra-subpage-with-premium-header');

    var wrapper = document.getElementById('site-header');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'site-header';
      document.body.insertBefore(wrapper, document.body.firstChild);
    }

    wrapper.innerHTML = `
      <header class="nostra-premium-header">
        <div class="nostra-promo-bar">
          <a href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20informes%20sobre%20los%20nuevos%20ciclos%20UNI" target="_blank" rel="noopener">
            🚀 NUEVOS CICLOS UNI DISPONIBLES · CUPOS LIMITADOS · <span>SOLICITAR INFORMES POR WHATSAPP</span>
          </a>
        </div>

        <div class="nostra-info-bar">
          <div class="nostra-info-inner">
            <div class="nostra-info-left">
              <a href="tel:+51993750351">☎ 993 750 351</a>
              <span>⌖ Av. Gerardo Unger 193, SMP.</span>
              <a href="mailto:informes@gruponostradamus.edu.pe">✉ informes@gruponostradamus.edu.pe</a>
            </div>
            <div class="nostra-info-right">
              <a class="nostra-live-btn" href="https://gruponostradamus.edu.pe/" target="_blank" rel="noopener">CLASES EN VIVO</a>
              <span>Síguenos en:</span>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="TikTok">♪</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>
        </div>

        <div class="nostra-main-header">
          <div class="nostra-main-inner">
            <a class="nostra-logo" href="index.html">
              <img src="assets/img/logo.png" alt="Grupo Nostradamus">
            </a>
            <nav class="nostra-nav">
              ${navItems.map(function (item) {
                return '<a class="' + isActive(item) + '" href="' + item.url + '">' + item.label + '</a>';
              }).join('')}
            </nav>
            <a class="nostra-cta" href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20solicitar%20informes" target="_blank" rel="noopener">📲 SOLICITAR INFORMES <span>→</span></a>
            <button class="nostra-mobile-toggle" type="button" aria-label="Abrir menú">☰</button>
          </div>
        </div>

        <div class="nostra-mobile-panel">
          ${navItems.map(function (item) {
            return '<a class="' + isActive(item) + '" href="' + item.url + '">' + item.label + '</a>';
          }).join('')}
          <a class="nostra-mobile-cta" href="https://wa.me/51993750351?text=Hola%20Nostradamus%2C%20quiero%20solicitar%20informes" target="_blank" rel="noopener">📲 Solicitar informes</a>
        </div>
      </header>
    `;

    var toggle = wrapper.querySelector('.nostra-mobile-toggle');
    var panel = wrapper.querySelector('.nostra-mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
        toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
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
