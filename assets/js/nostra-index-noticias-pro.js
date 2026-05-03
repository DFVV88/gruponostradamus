/* ==================================================
   Grupo Nostradamus - Noticias PRO en index
   Reemplaza las noticias antiguas del index por los 3 bloques oficiales:
   Modalidades de ingreso, Orientación vocacional y Noticias UNI.
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isIndex = file === 'index.html' || file === '' || window.location.pathname === '/';
  if (!isIndex) return;

  var whatsappURL = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, vi la sección de información UNI y quiero informes para prepararme.');

  var bloques = [
    {
      icono: '🎓',
      etiqueta: 'Admisión UNI',
      titulo: 'Modalidades de ingreso',
      texto: 'Revisa las modalidades oficiales para postular a la Universidad Nacional de Ingeniería y elige la ruta que mejor se adapta a tu perfil académico.',
      url: 'https://admision.uni.edu.pe/modalidades/',
      boton: 'Ver modalidades',
      clase: 'modalidades'
    },
    {
      icono: '🧭',
      etiqueta: 'Decide tu carrera',
      titulo: 'Orientación vocacional',
      texto: 'Accede a información útil para elegir mejor tu carrera, reconocer tus intereses y tomar una decisión más segura antes de iniciar tu preparación.',
      url: 'https://admision.uni.edu.pe/orientacion-vocacional/',
      boton: 'Ver orientación',
      clase: 'vocacional'
    },
    {
      icono: '📰',
      etiqueta: 'Actualidad UNI',
      titulo: 'Noticias UNI',
      texto: 'Mantente informado con novedades, comunicados y actividades oficiales de la Universidad Nacional de Ingeniería para postulantes y comunidad UNI.',
      url: 'https://portal.uni.edu.pe/index.php/accesos/prensa/noticias-uni',
      boton: 'Leer noticias',
      clase: 'noticias'
    }
  ];

  function injectStyles() {
    var old = document.getElementById('nostra-index-noticias-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-index-noticias-pro-style';
    style.textContent = `
      body .nostra-index-news-section{
        position:relative !important;
        padding:88px 0 !important;
        background:
          radial-gradient(circle at 12% 0%, rgba(0,194,209,.16), transparent 34%),
          radial-gradient(circle at 88% 18%, rgba(0,139,150,.11), transparent 34%),
          linear-gradient(180deg,#f8fdff 0%,#ffffff 100%) !important;
        overflow:hidden !important;
      }

      body .nostra-index-news-head{
        display:grid !important;
        grid-template-columns:1fr auto !important;
        gap:24px !important;
        align-items:end !important;
        margin-bottom:38px !important;
      }

      body .nostra-index-news-kicker{
        display:inline-flex !important;
        align-items:center !important;
        gap:8px !important;
        margin-bottom:12px !important;
        color:#008b96 !important;
        font-size:15px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.75px !important;
      }

      body .nostra-index-news-title{
        margin:0 !important;
        max-width:860px !important;
        color:#061426 !important;
        font-size:clamp(38px,4.6vw,72px) !important;
        line-height:1.02 !important;
        font-weight:950 !important;
        font-style:italic !important;
        text-transform:uppercase !important;
        letter-spacing:-1.2px !important;
        background:linear-gradient(180deg,#061426 0%,#0b3444 42%,#008b96 72%,#061426 100%) !important;
        -webkit-background-clip:text !important;
        background-clip:text !important;
        -webkit-text-fill-color:transparent !important;
        filter:drop-shadow(0 2px 0 rgba(255,255,255,.72)) !important;
      }

      body .nostra-index-news-title span{color:#008b96 !important;}

      body .nostra-index-news-cta{
        min-height:56px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:10px !important;
        padding:15px 24px !important;
        border-radius:18px !important;
        background:linear-gradient(135deg,#008b96 0%,#05313d 55%,#061426 100%) !important;
        color:#fff !important;
        font-size:15px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 18px 38px rgba(0,139,150,.22) !important;
        white-space:nowrap !important;
      }

      body .nostra-index-news-cta:hover{color:#fff !important;transform:translateY(-3px) !important;box-shadow:0 24px 48px rgba(0,194,209,.30) !important;}

      body .nostra-index-news-grid{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:28px !important;
      }

      body .nostra-index-news-card{
        position:relative !important;
        min-height:390px !important;
        display:flex !important;
        flex-direction:column !important;
        padding:28px !important;
        border-radius:28px !important;
        background:linear-gradient(180deg,#ffffff,#f2fdff) !important;
        border:1px solid rgba(0,194,209,.24) !important;
        box-shadow:0 20px 50px rgba(6,20,38,.08),0 0 28px rgba(0,194,209,.08) !important;
        overflow:hidden !important;
        transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease !important;
      }

      body .nostra-index-news-card::before{
        content:'' !important;
        position:absolute !important;
        inset:0 0 auto 0 !important;
        height:7px !important;
        background:linear-gradient(90deg,#00c2d1,#008b96,#061426) !important;
      }

      body .nostra-index-news-card:hover{transform:translateY(-8px) !important;border-color:rgba(0,194,209,.48) !important;box-shadow:0 30px 68px rgba(6,20,38,.13),0 0 38px rgba(0,194,209,.14) !important;}

      body .nostra-index-news-icon{
        width:70px !important;
        height:70px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        margin-bottom:20px !important;
        border-radius:22px !important;
        background:linear-gradient(135deg,#061426,#008b96) !important;
        color:#fff !important;
        font-size:31px !important;
        box-shadow:0 16px 30px rgba(0,139,150,.22) !important;
      }

      body .nostra-index-news-label{
        display:inline-flex !important;
        align-self:flex-start !important;
        margin-bottom:10px !important;
        padding:6px 10px !important;
        border-radius:999px !important;
        background:rgba(0,194,209,.10) !important;
        color:#008b96 !important;
        font-size:11px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.45px !important;
      }

      body .nostra-index-news-card h3{
        margin:0 0 14px !important;
        color:#061426 !important;
        font-size:clamp(24px,2vw,34px) !important;
        line-height:1.08 !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:-.45px !important;
      }

      body .nostra-index-news-card p{
        margin:0 0 22px !important;
        color:#566575 !important;
        font-size:15.5px !important;
        line-height:1.62 !important;
        font-weight:650 !important;
      }

      body .nostra-index-news-actions{
        margin-top:auto !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:10px !important;
      }

      body .nostra-index-news-btn,
      body .nostra-index-news-wa{
        min-height:47px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:9px !important;
        padding:12px 16px !important;
        border-radius:999px !important;
        color:#fff !important;
        font-size:13.5px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
      }

      body .nostra-index-news-btn{background:linear-gradient(135deg,#008b96 0%,#05313d 55%,#061426 100%) !important;box-shadow:0 13px 26px rgba(0,139,150,.20) !important;}
      body .nostra-index-news-wa{background:linear-gradient(135deg,#25d366 0%,#13a54d 48%,#061426 100%) !important;box-shadow:0 13px 26px rgba(37,211,102,.20) !important;}
      body .nostra-index-news-btn:hover,
      body .nostra-index-news-wa:hover{color:#fff !important;transform:translateY(-2px) !important;box-shadow:0 18px 34px rgba(0,194,209,.28) !important;}

      body .nostra-index-news-note{
        margin:36px auto 0 !important;
        max-width:980px !important;
        padding:20px 22px !important;
        border-radius:22px !important;
        background:linear-gradient(135deg,#061426,#083044 62%,#008b96) !important;
        color:#fff !important;
        text-align:center !important;
        box-shadow:0 22px 48px rgba(6,20,38,.15) !important;
        font-size:15.5px !important;
        font-weight:700 !important;
        line-height:1.55 !important;
      }

      body .nostra-index-news-note strong{color:#a8f7ff !important;}

      @media(max-width:1199px){body .nostra-index-news-grid{grid-template-columns:1fr !important;} body .nostra-index-news-card{min-height:auto !important;}}
      @media(max-width:767px){body .nostra-index-news-head{grid-template-columns:1fr !important;align-items:start !important;} body .nostra-index-news-cta{width:100% !important;}}
      @media(max-width:575px){body .nostra-index-news-section{padding:58px 0 !important;} body .nostra-index-news-card{padding:22px !important;border-radius:22px !important;}}
    `;
    document.head.appendChild(style);
  }

  function normalize(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  }

  function findSection() {
    var selectors = [
      'section',
      '.blog-area',
      '.blog-sec',
      '.th-blog-wrapper',
      '.blog-section',
      '.space',
      '.space-top',
      '.space-bottom',
      '.overflow-hidden'
    ];

    var nodes = Array.from(document.querySelectorAll(selectors.join(',')));
    var matches = nodes.filter(function (el) {
      if (el.closest('.nostra-index-news-section')) return false;
      var txt = normalize(el.textContent);
      var hasOldNews = txt.indexOf('conoces las modalidades') !== -1 ||
        txt.indexOf('examen de admision uni') !== -1 ||
        txt.indexOf('orientacion vocacional') !== -1 ||
        txt.indexOf('explora nuestro mundo academico') !== -1;
      var hasCards = !!el.querySelector('.blog-card, .blog-box, .blog-grid, .th-blog, [class*="blog"]');
      return hasOldNews && (hasCards || el.tagName.toLowerCase() === 'section');
    });

    if (!matches.length) return null;

    matches.sort(function (a, b) {
      return a.querySelectorAll('.blog-card, .blog-box, .blog-grid, .th-blog, [class*="blog"]').length -
        b.querySelectorAll('.blog-card, .blog-box, .blog-grid, .th-blog, [class*="blog"]').length;
    });

    return matches[0].tagName.toLowerCase() === 'section' ? matches[0] : (matches[0].closest('section') || matches[0]);
  }

  function cardHTML(item) {
    return '' +
      '<article class="nostra-index-news-card nostra-index-news-card--' + item.clase + '">' +
        '<div class="nostra-index-news-icon">' + item.icono + '</div>' +
        '<span class="nostra-index-news-label">' + item.etiqueta + '</span>' +
        '<h3>' + item.titulo + '</h3>' +
        '<p>' + item.texto + '</p>' +
        '<div class="nostra-index-news-actions">' +
          '<a class="nostra-index-news-btn" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.boton + ' <i class="fas fa-arrow-right"></i></a>' +
          '<a class="nostra-index-news-wa" href="' + whatsappURL + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Quiero prepararme</a>' +
        '</div>' +
      '</article>';
  }

  function buildSection() {
    return '' +
      '<div class="container">' +
        '<div class="nostra-index-news-head">' +
          '<div>' +
            '<span class="nostra-index-news-kicker">📌 Información oficial para postulantes</span>' +
            '<h2 class="nostra-index-news-title">Explora información clave para ingresar a la <span>UNI</span></h2>' +
          '</div>' +
          '<a class="nostra-index-news-cta" href="blog.html">Ver sección noticias <i class="fas fa-arrow-right"></i></a>' +
        '</div>' +
        '<div class="nostra-index-news-grid">' + bloques.map(cardHTML).join('') + '</div>' +
        '<div class="nostra-index-news-note"><strong>Tip Nostradamus:</strong> revisa estas fuentes oficiales y luego solicita asesoría para elegir el ciclo que mejor se ajusta a tu nivel y objetivo de ingreso.</div>' +
      '</div>';
  }

  function init() {
    injectStyles();
    var section = findSection();
    if (!section) return;

    section.classList.add('nostra-index-news-section');
    section.innerHTML = buildSection();
    section.dataset.nostraIndexNoticiasPro = '2';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1200);
    setTimeout(init, 2500);
  });
})();
