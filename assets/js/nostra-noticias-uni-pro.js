/* ==================================================
   Grupo Nostradamus - Noticias UNI PRO
   Reestructura la página Noticias en 3 bloques útiles:
   Modalidades de ingreso, Orientación vocacional y Noticias UNI.
   Incluye CTA comercial por WhatsApp para generar ventas.
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || '').toLowerCase();
  if (file !== 'blog.html' && file !== 'noticias.html') return;

  var whatsappURL = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, vengo de la sección Noticias UNI y quiero informes sobre los ciclos de preparación para la UNI.');

  var bloques = [
    {
      icono: '🎓',
      etiqueta: 'Admisión UNI',
      titulo: 'Modalidades de ingreso',
      texto: 'Conoce las formas oficiales para postular e ingresar a la Universidad Nacional de Ingeniería. Esta sección ayuda al postulante a identificar la modalidad que mejor se ajusta a su perfil académico y a planificar su preparación con mayor claridad.',
      url: 'https://admision.uni.edu.pe/modalidades/',
      boton: 'Ver modalidades oficiales',
      clase: 'modalidades'
    },
    {
      icono: '🧭',
      etiqueta: 'Elección de carrera',
      titulo: 'Orientación vocacional',
      texto: 'Un espacio clave para estudiantes que todavía están definiendo su carrera. Aquí podrán revisar información de orientación vocacional, reflexionar sobre sus intereses y tomar mejores decisiones antes de iniciar o continuar su preparación UNI.',
      url: 'https://admision.uni.edu.pe/orientacion-vocacional/',
      boton: 'Ir a orientación vocacional',
      clase: 'vocacional'
    },
    {
      icono: '📰',
      etiqueta: 'Actualidad UNI',
      titulo: 'Noticias UNI',
      texto: 'Accede a las novedades, comunicados, actividades e información institucional publicada por la Universidad Nacional de Ingeniería. Ideal para que los postulantes se mantengan informados sobre el entorno universitario al que desean ingresar.',
      url: 'https://portal.uni.edu.pe/index.php/accesos/prensa/noticias-uni',
      boton: 'Leer noticias oficiales',
      clase: 'noticias'
    }
  ];

  function injectStyles() {
    var old = document.getElementById('nostra-noticias-uni-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-noticias-uni-pro-style';
    style.textContent = `
      body.nostra-noticias-pro .breadcumb-title{
        font-size:clamp(38px,4vw,60px) !important;
        font-weight:950 !important;
        letter-spacing:-.8px !important;
      }

      body.nostra-noticias-pro .breadcumb-title::after{
        content:' UNI' !important;
        color:#00c2d1 !important;
      }

      body.nostra-noticias-pro .nostra-news-section{
        position:relative !important;
        padding:90px 0 !important;
        background:
          radial-gradient(circle at 15% 0%, rgba(0,194,209,.16), transparent 34%),
          radial-gradient(circle at 90% 20%, rgba(0,139,150,.11), transparent 34%),
          linear-gradient(180deg,#f7fdff 0%,#ffffff 100%) !important;
        overflow:hidden !important;
      }

      body.nostra-noticias-pro .nostra-news-head{
        max-width:950px !important;
        margin:0 auto 42px !important;
        text-align:center !important;
      }

      body.nostra-noticias-pro .nostra-news-kicker{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:8px !important;
        margin-bottom:12px !important;
        padding:8px 14px !important;
        border-radius:999px !important;
        background:#e9fbfd !important;
        border:1px solid rgba(0,194,209,.28) !important;
        color:#008b96 !important;
        font-size:13px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.6px !important;
      }

      body.nostra-noticias-pro .nostra-news-title{
        margin:0 0 14px !important;
        color:#061426 !important;
        font-size:clamp(34px,4.5vw,62px) !important;
        line-height:1.02 !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:-1px !important;
      }

      body.nostra-noticias-pro .nostra-news-title span{
        color:#008b96 !important;
      }

      body.nostra-noticias-pro .nostra-news-intro{
        margin:0 auto 24px !important;
        max-width:820px !important;
        color:#516172 !important;
        font-size:17px !important;
        line-height:1.65 !important;
        font-weight:650 !important;
      }

      body.nostra-noticias-pro .nostra-news-head-cta{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:10px !important;
        min-height:52px !important;
        padding:14px 24px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#25d366 0%,#13a54d 48%,#061426 100%) !important;
        color:#fff !important;
        font-size:15px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 16px 34px rgba(37,211,102,.28),0 0 28px rgba(0,194,209,.16) !important;
        transition:transform .22s ease, box-shadow .22s ease, filter .22s ease !important;
      }

      body.nostra-noticias-pro .nostra-news-head-cta:hover{
        color:#fff !important;
        transform:translateY(-3px) scale(1.02) !important;
        filter:saturate(1.08) !important;
        box-shadow:0 22px 42px rgba(37,211,102,.34),0 0 34px rgba(0,194,209,.22) !important;
      }

      body.nostra-noticias-pro .nostra-news-grid{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:28px !important;
        align-items:stretch !important;
      }

      body.nostra-noticias-pro .nostra-news-card{
        position:relative !important;
        min-height:420px !important;
        display:flex !important;
        flex-direction:column !important;
        padding:28px !important;
        border-radius:28px !important;
        background:linear-gradient(180deg,#ffffff,#f3fdff) !important;
        border:1px solid rgba(0,194,209,.24) !important;
        box-shadow:0 22px 54px rgba(6,20,38,.09),0 0 34px rgba(0,194,209,.08) !important;
        overflow:hidden !important;
        transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease !important;
      }

      body.nostra-noticias-pro .nostra-news-card::before{
        content:'' !important;
        position:absolute !important;
        inset:0 0 auto 0 !important;
        height:7px !important;
        background:linear-gradient(90deg,#00c2d1,#008b96,#061426) !important;
      }

      body.nostra-noticias-pro .nostra-news-card:hover{
        transform:translateY(-8px) !important;
        border-color:rgba(0,194,209,.46) !important;
        box-shadow:0 30px 70px rgba(6,20,38,.14),0 0 42px rgba(0,194,209,.16) !important;
      }

      body.nostra-noticias-pro .nostra-news-icon{
        width:68px !important;
        height:68px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        margin-bottom:20px !important;
        border-radius:22px !important;
        background:linear-gradient(135deg,#061426,#008b96) !important;
        color:#fff !important;
        font-size:30px !important;
        box-shadow:0 16px 30px rgba(0,139,150,.22) !important;
      }

      body.nostra-noticias-pro .nostra-news-label{
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

      body.nostra-noticias-pro .nostra-news-card h3{
        margin:0 0 14px !important;
        color:#061426 !important;
        font-size:clamp(25px,2vw,34px) !important;
        line-height:1.08 !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:-.5px !important;
      }

      body.nostra-noticias-pro .nostra-news-card p{
        margin:0 0 22px !important;
        color:#566575 !important;
        font-size:15.5px !important;
        line-height:1.68 !important;
        font-weight:620 !important;
        text-align:left !important;
      }

      body.nostra-noticias-pro .nostra-news-actions{
        margin-top:auto !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:10px !important;
      }

      body.nostra-noticias-pro .nostra-news-btn,
      body.nostra-noticias-pro .nostra-news-whatsapp{
        min-height:48px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:10px !important;
        padding:13px 18px !important;
        border-radius:999px !important;
        color:#fff !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        transition:transform .22s ease, box-shadow .22s ease !important;
      }

      body.nostra-noticias-pro .nostra-news-btn{
        background:linear-gradient(135deg,#008b96 0%,#05313d 55%,#061426 100%) !important;
        box-shadow:0 14px 28px rgba(0,139,150,.22) !important;
      }

      body.nostra-noticias-pro .nostra-news-whatsapp{
        background:linear-gradient(135deg,#25d366 0%,#13a54d 48%,#061426 100%) !important;
        box-shadow:0 14px 28px rgba(37,211,102,.22) !important;
      }

      body.nostra-noticias-pro .nostra-news-btn:hover,
      body.nostra-noticias-pro .nostra-news-whatsapp:hover{
        color:#fff !important;
        transform:translateY(-2px) !important;
        box-shadow:0 20px 36px rgba(0,194,209,.30) !important;
      }

      body.nostra-noticias-pro .nostra-news-sales{
        margin:42px auto 0 !important;
        max-width:1040px !important;
        display:grid !important;
        grid-template-columns:1fr auto !important;
        gap:20px !important;
        align-items:center !important;
        padding:24px !important;
        border-radius:26px !important;
        background:linear-gradient(135deg,#061426,#083044 60%,#008b96) !important;
        color:#fff !important;
        box-shadow:0 24px 54px rgba(6,20,38,.16),0 0 32px rgba(0,194,209,.16) !important;
      }

      body.nostra-noticias-pro .nostra-news-sales h3{
        margin:0 0 6px !important;
        color:#fff !important;
        font-size:clamp(22px,2.2vw,34px) !important;
        font-weight:950 !important;
        line-height:1.1 !important;
      }

      body.nostra-noticias-pro .nostra-news-sales p{
        margin:0 !important;
        color:rgba(255,255,255,.82) !important;
        font-size:15.5px !important;
        line-height:1.55 !important;
        font-weight:650 !important;
      }

      body.nostra-noticias-pro .nostra-news-sales a{
        min-height:54px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        white-space:nowrap !important;
        padding:15px 24px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#25d366,#13a54d) !important;
        color:#fff !important;
        font-size:15px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 16px 32px rgba(37,211,102,.26) !important;
      }

      body.nostra-noticias-pro .nostra-news-floating-wa{
        position:fixed !important;
        right:24px !important;
        bottom:96px !important;
        z-index:10050 !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:10px !important;
        min-height:56px !important;
        padding:14px 22px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#25d366,#13a54d 52%,#061426) !important;
        color:#fff !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 18px 40px rgba(37,211,102,.34),0 0 28px rgba(0,194,209,.18) !important;
      }

      body.nostra-noticias-pro .nostra-news-floating-wa i,
      body.nostra-noticias-pro .nostra-news-sales a i,
      body.nostra-noticias-pro .nostra-news-whatsapp i,
      body.nostra-noticias-pro .nostra-news-head-cta i{
        font-size:18px !important;
      }

      body.nostra-noticias-pro .nostra-news-note{
        margin:24px auto 0 !important;
        max-width:960px !important;
        padding:18px 22px !important;
        border-radius:20px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.14) !important;
        color:#445569 !important;
        text-align:center !important;
        box-shadow:0 14px 34px rgba(6,20,38,.07) !important;
        font-weight:700 !important;
      }

      body.nostra-noticias-pro .nostra-news-note strong{
        color:#008b96 !important;
      }

      body.nostra-noticias-pro .sidebar-area .widget,
      body.nostra-noticias-pro .widget_categories{
        border-radius:22px !important;
        border:1px solid rgba(0,137,150,.14) !important;
        box-shadow:0 18px 42px rgba(6,20,38,.08) !important;
      }

      @media(max-width:1199px){
        body.nostra-noticias-pro .nostra-news-grid{grid-template-columns:1fr !important;}
        body.nostra-noticias-pro .nostra-news-card{min-height:auto !important;}
      }

      @media(max-width:767px){
        body.nostra-noticias-pro .nostra-news-sales{grid-template-columns:1fr !important;text-align:center !important;}
        body.nostra-noticias-pro .nostra-news-sales a{width:100% !important;white-space:normal !important;}
        body.nostra-noticias-pro .nostra-news-floating-wa{left:14px !important;right:14px !important;bottom:18px !important;width:auto !important;}
      }

      @media(max-width:575px){
        body.nostra-noticias-pro .nostra-news-section{padding:58px 0 92px !important;}
        body.nostra-noticias-pro .nostra-news-card{padding:22px !important;border-radius:22px !important;}
        body.nostra-noticias-pro .nostra-news-intro{font-size:15px !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function cardHTML(item) {
    return '' +
      '<article class="nostra-news-card nostra-news-card--' + item.clase + '">' +
        '<div class="nostra-news-icon">' + item.icono + '</div>' +
        '<span class="nostra-news-label">' + item.etiqueta + '</span>' +
        '<h3>' + item.titulo + '</h3>' +
        '<p>' + item.texto + '</p>' +
        '<div class="nostra-news-actions">' +
          '<a class="nostra-news-btn" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.boton + ' <i class="fas fa-arrow-right"></i></a>' +
          '<a class="nostra-news-whatsapp" href="' + whatsappURL + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Quiero prepararme</a>' +
        '</div>' +
      '</article>';
  }

  function buildSection() {
    return '' +
      '<section class="nostra-news-section th-blog-wrapper space-top space-extra2-bottom">' +
        '<div class="container">' +
          '<div class="nostra-news-head">' +
            '<span class="nostra-news-kicker">📌 Información oficial para postulantes</span>' +
            '<h2 class="nostra-news-title">Centro de <span>Noticias UNI</span></h2>' +
            '<p class="nostra-news-intro">Organizamos esta sección en tres accesos clave para que el postulante encuentre rápidamente información oficial sobre admisión, orientación vocacional y novedades de la Universidad Nacional de Ingeniería.</p>' +
            '<a class="nostra-news-head-cta" href="' + whatsappURL + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Solicitar asesoría por WhatsApp</a>' +
          '</div>' +
          '<div class="nostra-news-grid">' + bloques.map(cardHTML).join('') + '</div>' +
          '<div class="nostra-news-sales"><div><h3>¿Quieres convertir esta información en un plan de ingreso?</h3><p>Un asesor de Grupo Nostradamus puede orientarte sobre el ciclo más conveniente según tu nivel, experiencia previa y fecha de postulación.</p></div><a href="' + whatsappURL + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Hablar con un asesor</a></div>' +
          '<div class="nostra-news-note"><strong>Grupo Nostradamus</strong> recomienda revisar estas fuentes oficiales antes de tomar decisiones sobre postulación, elección de carrera y planificación académica.</div>' +
        '</div>' +
      '</section>';
  }

  function addFloatingWhatsapp() {
    if (document.querySelector('.nostra-news-floating-wa')) return;
    var a = document.createElement('a');
    a.className = 'nostra-news-floating-wa';
    a.href = whatsappURL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = '<i class="fab fa-whatsapp"></i> Informes por WhatsApp';
    document.body.appendChild(a);
  }

  function replaceNews() {
    document.body.classList.add('nostra-noticias-pro');
    document.title = 'Noticias UNI | Grupo Nostradamus';

    var bread = document.querySelector('.breadcumb-title');
    if (bread) bread.textContent = 'Noticias';

    var wrapper = document.querySelector('.th-blog-wrapper');
    if (!wrapper || wrapper.dataset.nostraNoticiasPro === '2') return;

    var temp = document.createElement('div');
    temp.innerHTML = buildSection();
    var newSection = temp.firstChild;
    newSection.dataset.nostraNoticiasPro = '2';
    wrapper.parentNode.replaceChild(newSection, wrapper);
  }

  function init() {
    injectStyles();
    replaceNews();
    addFloatingWhatsapp();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
  });
})();
