/* ==================================================
   Grupo Nostradamus - FAQ PRO en index
   Mejora diseño y contenido de Preguntas Frecuentes Estudiantiles.
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isIndex = file === 'index.html' || file === '' || window.location.pathname === '/';
  if (!isIndex) return;

  var whatsappURL = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, tengo una consulta sobre los ciclos de preparación UNI.');

  var faqs = [
    {
      q: '¿Qué ciclo debo elegir según mi nivel?',
      a: 'Si empiezas desde cero, el Ciclo Anual UNI es la ruta más completa. Si ya tienes base, el Semianual o Semestral pueden ayudarte a ordenar conocimientos, corregir vacíos y elevar tu rendimiento. Si estás cerca del examen, el Repaso UNI refuerza los temas más frecuentes.'
    },
    {
      q: '¿Las clases son presenciales, virtuales o grabadas?',
      a: 'Trabajamos con clases presenciales y apoyo virtual. Además, usamos Microsoft 365 para organizar recursos académicos, materiales, accesos y grabaciones disponibles según la dinámica de cada ciclo.'
    },
    {
      q: '¿Cómo puedo matricularme o separar mi vacante?',
      a: 'Puedes solicitar informes por WhatsApp, indicar tu nivel actual y el ciclo de interés. Un asesor te orientará, confirmará disponibilidad de cupos y te enviará los pasos para separar tu matrícula.'
    },
    {
      q: '¿Qué incluye la preparación en Grupo Nostradamus?',
      a: 'Incluye teoría ordenada, práctica constante, evaluaciones, simulacros tipo admisión, acompañamiento académico y una ruta de trabajo enfocada en mejorar el rendimiento del postulante hacia la UNI.'
    },
    {
      q: '¿También preparan a escolares?',
      a: 'Sí. Contamos con Proyecto Escolar para estudiantes que desean adelantarse desde el colegio, fortalecer bases en Matemáticas, Ciencias y Aptitud Académica, y construir una visión preuniversitaria desde temprano.'
    },
    {
      q: '¿Qué pasa si ya postulé y no ingresé?',
      a: 'En ese caso se recomienda una evaluación de tu base y de tus errores más frecuentes. El Ciclo Semestral, Repaso o Élite pueden ayudarte según tu nivel, tiempo disponible y cercanía al examen.'
    }
  ];

  function injectStyles() {
    var old = document.getElementById('nostra-faq-index-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-faq-index-pro-style';
    style.textContent = `
      body .nostra-faq-pro-section{
        position:relative !important;
        padding:86px 0 !important;
        background:
          radial-gradient(circle at 14% 4%, rgba(0,194,209,.16), transparent 34%),
          radial-gradient(circle at 88% 30%, rgba(0,139,150,.12), transparent 34%),
          linear-gradient(180deg,#f7fdff 0%,#edf7fa 100%) !important;
        overflow:hidden !important;
      }

      body .nostra-faq-pro-section::before{
        content:'' !important;
        position:absolute !important;
        inset:24px auto auto -90px !important;
        width:280px !important;
        height:280px !important;
        border-radius:50% !important;
        background:radial-gradient(circle, rgba(0,194,209,.18), transparent 70%) !important;
        pointer-events:none !important;
      }

      body .nostra-faq-pro-grid{
        display:grid !important;
        grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr) !important;
        gap:42px !important;
        align-items:center !important;
      }

      body .nostra-faq-pro-kicker{
        display:inline-flex !important;
        align-items:center !important;
        gap:8px !important;
        margin-bottom:12px !important;
        padding:8px 13px !important;
        border-radius:999px !important;
        background:rgba(0,194,209,.10) !important;
        border:1px solid rgba(0,194,209,.26) !important;
        color:#008b96 !important;
        font-size:13px !important;
        font-weight:950 !important;
        letter-spacing:.65px !important;
        text-transform:uppercase !important;
      }

      body .nostra-faq-pro-title{
        margin:0 0 16px !important;
        color:#061426 !important;
        font-size:clamp(34px,4.3vw,64px) !important;
        line-height:1.03 !important;
        font-weight:950 !important;
        font-style:italic !important;
        letter-spacing:-1px !important;
        text-transform:uppercase !important;
        background:linear-gradient(180deg,#061426 0%,#103344 46%,#008b96 78%,#061426 100%) !important;
        -webkit-background-clip:text !important;
        background-clip:text !important;
        -webkit-text-fill-color:transparent !important;
        filter:drop-shadow(0 2px 0 rgba(255,255,255,.76)) !important;
      }

      body .nostra-faq-pro-title span{
        color:#008b96 !important;
      }

      body .nostra-faq-pro-intro{
        max-width:720px !important;
        margin:0 0 24px !important;
        color:#506173 !important;
        font-size:16.5px !important;
        line-height:1.65 !important;
        font-weight:650 !important;
      }

      body .nostra-faq-pro-list{
        display:grid !important;
        gap:12px !important;
      }

      body .nostra-faq-pro-item{
        border-radius:18px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.14) !important;
        box-shadow:0 14px 34px rgba(6,20,38,.07) !important;
        overflow:hidden !important;
      }

      body .nostra-faq-pro-question{
        width:100% !important;
        min-height:62px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:18px !important;
        padding:18px 20px !important;
        background:transparent !important;
        border:0 !important;
        color:#061426 !important;
        text-align:left !important;
        font-size:16.5px !important;
        font-weight:950 !important;
        line-height:1.25 !important;
        cursor:pointer !important;
      }

      body .nostra-faq-pro-question span:first-child{
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
      }

      body .nostra-faq-pro-number{
        width:30px !important;
        height:30px !important;
        min-width:30px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:50% !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:13px !important;
        font-weight:950 !important;
      }

      body .nostra-faq-pro-toggle{
        width:32px !important;
        height:32px !important;
        min-width:32px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:50% !important;
        background:#eefbfc !important;
        color:#008b96 !important;
        font-size:18px !important;
        font-weight:950 !important;
        transition:transform .2s ease, background .2s ease !important;
      }

      body .nostra-faq-pro-item.active .nostra-faq-pro-toggle{
        transform:rotate(45deg) !important;
        background:#008b96 !important;
        color:#fff !important;
      }

      body .nostra-faq-pro-answer{
        max-height:0 !important;
        overflow:hidden !important;
        transition:max-height .28s ease !important;
      }

      body .nostra-faq-pro-answer-inner{
        padding:0 20px 20px 60px !important;
        color:#516172 !important;
        font-size:15.5px !important;
        line-height:1.65 !important;
        font-weight:620 !important;
      }

      body .nostra-faq-pro-item.active .nostra-faq-pro-answer{
        max-height:240px !important;
      }

      body .nostra-faq-pro-visual{
        position:relative !important;
        min-height:560px !important;
        border-radius:32px !important;
        overflow:hidden !important;
        background:linear-gradient(135deg,#061426,#008b96) !important;
        box-shadow:0 28px 72px rgba(6,20,38,.18),0 0 40px rgba(0,194,209,.14) !important;
      }

      body .nostra-faq-pro-visual img{
        width:100% !important;
        height:100% !important;
        min-height:560px !important;
        object-fit:cover !important;
        display:block !important;
        filter:saturate(1.08) contrast(1.03) !important;
      }

      body .nostra-faq-pro-visual::after{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        background:linear-gradient(180deg,rgba(6,20,38,.02),rgba(6,20,38,.38)) !important;
        pointer-events:none !important;
      }

      body .nostra-faq-pro-card{
        position:absolute !important;
        left:22px !important;
        right:22px !important;
        bottom:22px !important;
        z-index:2 !important;
        padding:22px !important;
        border-radius:24px !important;
        background:linear-gradient(135deg,rgba(6,20,38,.88),rgba(0,139,150,.82)) !important;
        border:1px solid rgba(255,255,255,.16) !important;
        box-shadow:0 18px 42px rgba(6,20,38,.28) !important;
        color:#fff !important;
      }

      body .nostra-faq-pro-card h3{
        margin:0 0 8px !important;
        color:#fff !important;
        font-size:24px !important;
        font-weight:950 !important;
        line-height:1.1 !important;
      }

      body .nostra-faq-pro-card p{
        margin:0 0 14px !important;
        color:rgba(255,255,255,.82) !important;
        font-size:14.5px !important;
        line-height:1.5 !important;
        font-weight:650 !important;
      }

      body .nostra-faq-pro-wa{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:9px !important;
        min-height:46px !important;
        padding:12px 18px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#25d366,#13a54d) !important;
        color:#fff !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 14px 28px rgba(37,211,102,.26) !important;
      }

      body .nostra-faq-pro-actions{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:12px !important;
        margin-top:24px !important;
      }

      body .nostra-faq-pro-btn{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        min-height:50px !important;
        padding:13px 22px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#008b96,#05313d 55%,#061426) !important;
        color:#fff !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 16px 32px rgba(0,139,150,.22) !important;
      }

      body .nostra-faq-pro-btn:hover,
      body .nostra-faq-pro-wa:hover{
        color:#fff !important;
        transform:translateY(-2px) !important;
      }

      @media(max-width:1199px){
        body .nostra-faq-pro-grid{grid-template-columns:1fr !important;}
        body .nostra-faq-pro-visual{min-height:420px !important;}
        body .nostra-faq-pro-visual img{min-height:420px !important;}
      }

      @media(max-width:575px){
        body .nostra-faq-pro-section{padding:58px 0 !important;}
        body .nostra-faq-pro-question{font-size:15px !important;padding:16px !important;}
        body .nostra-faq-pro-answer-inner{padding:0 16px 18px 16px !important;}
        body .nostra-faq-pro-visual{min-height:360px !important;border-radius:24px !important;}
        body .nostra-faq-pro-visual img{min-height:360px !important;}
        body .nostra-faq-pro-card{left:14px !important;right:14px !important;bottom:14px !important;padding:18px !important;}
        body .nostra-faq-pro-actions{display:grid !important;grid-template-columns:1fr !important;}
        body .nostra-faq-pro-btn{width:100% !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function normalize(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  }

  function findFAQSection() {
    var candidates = Array.from(document.querySelectorAll('section'));
    return candidates.find(function (el) {
      var txt = normalize(el.textContent);
      return txt.indexOf('preguntas frecuentes') !== -1 ||
        txt.indexOf('resuelve tus dudas') !== -1 ||
        txt.indexOf('como puedo inscribirme') !== -1 ||
        txt.indexOf('como puedo acceder a la intranet') !== -1;
    });
  }

  function getExistingImage(section) {
    var img = section ? section.querySelector('img') : null;
    return img && img.getAttribute('src') ? img.getAttribute('src') : 'assets/img/normal/about_5_1.jpg';
  }

  function faqHTML(item, index) {
    return '' +
      '<div class="nostra-faq-pro-item ' + (index === 0 ? 'active' : '') + '">' +
        '<button class="nostra-faq-pro-question" type="button" aria-expanded="' + (index === 0 ? 'true' : 'false') + '">' +
          '<span><span class="nostra-faq-pro-number">' + (index + 1) + '</span>' + item.q + '</span>' +
          '<span class="nostra-faq-pro-toggle">+</span>' +
        '</button>' +
        '<div class="nostra-faq-pro-answer"><div class="nostra-faq-pro-answer-inner">' + item.a + '</div></div>' +
      '</div>';
  }

  function buildSection(imgSrc) {
    return '' +
      '<div class="container">' +
        '<div class="nostra-faq-pro-grid">' +
          '<div class="nostra-faq-pro-content">' +
            '<span class="nostra-faq-pro-kicker">📘 Resuelve tus dudas</span>' +
            '<h2 class="nostra-faq-pro-title">Preguntas frecuentes para <span>postulantes UNI</span></h2>' +
            '<p class="nostra-faq-pro-intro">Respondemos las dudas más importantes antes de elegir un ciclo: nivel, modalidad, matrícula, recursos académicos y acompañamiento.</p>' +
            '<div class="nostra-faq-pro-list">' + faqs.map(faqHTML).join('') + '</div>' +
            '<div class="nostra-faq-pro-actions">' +
              '<a class="nostra-faq-pro-btn" href="ciclos.html">Ver ciclos académicos</a>' +
              '<a class="nostra-faq-pro-btn" target="_blank" rel="noopener" href="' + whatsappURL + '">Consultar por WhatsApp</a>' +
            '</div>' +
          '</div>' +
          '<div class="nostra-faq-pro-visual">' +
            '<img src="' + imgSrc + '" alt="Preguntas frecuentes Grupo Nostradamus">' +
            '<div class="nostra-faq-pro-card">' +
              '<h3>¿Aún no sabes qué ciclo elegir?</h3>' +
              '<p>Cuéntanos tu nivel actual, si ya postulaste y cuándo deseas rendir examen. Te orientamos hacia la ruta más conveniente.</p>' +
              '<a class="nostra-faq-pro-wa" target="_blank" rel="noopener" href="' + whatsappURL + '"><i class="fab fa-whatsapp"></i> Hablar con un asesor</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function bindAccordion(section) {
    section.querySelectorAll('.nostra-faq-pro-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.nostra-faq-pro-item');
        var active = item.classList.contains('active');
        section.querySelectorAll('.nostra-faq-pro-item').forEach(function (el) {
          el.classList.remove('active');
          var b = el.querySelector('.nostra-faq-pro-question');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!active) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function init() {
    injectStyles();
    var section = findFAQSection();
    if (!section || section.dataset.nostraFaqPro === '1') return;

    var imgSrc = getExistingImage(section);
    section.classList.add('nostra-faq-pro-section');
    section.innerHTML = buildSection(imgSrc);
    section.dataset.nostraFaqPro = '1';
    bindAccordion(section);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', function () {
    init();
    setTimeout(init, 800);
  });
})();
