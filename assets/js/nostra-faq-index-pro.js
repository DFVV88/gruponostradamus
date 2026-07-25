/* ==================================================
   Grupo Nostradamus - FAQ INTERACTIVO PRO en index
   Contenido actualizado para la arquitectura académica vigente.
================================================== */
(function () {
  'use strict';

  var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isIndex = file === 'index.html' || file === '' || window.location.pathname === '/';
  if (!isIndex) return;

  var initialized = false;
  var resizeTimer = 0;
  var whatsappURL = 'https://wa.me/51993750351?text=' + encodeURIComponent(
    'Hola Nostradamus, quiero orientación para elegir el programa UNI adecuado según mi nivel.'
  );

  var faqs = [
    {
      tag: 'Programa ideal',
      icon: '🎯',
      q: '¿Qué programa debo elegir según mi nivel?',
      a: '<strong>Nostra 360 UNI</strong> forma desde las bases; <strong>Nostra Power UNI</strong> corrige debilidades de una preparación anterior; <strong>Nostra Élite UNI</strong> perfecciona a quienes estuvieron cerca de ingresar; <strong>Nostra Prime UNI</strong> prepara la etapa final antes del examen; y <strong>Nostra Talentum UNI</strong> entrena a estudiantes de alto rendimiento. También contamos con IEN UNI, Proyecto Escolar, Paralelo CEPRE UNI y Ciclo Verano UNI. <a href="ciclos.html">Compara todos los programas</a>.'
    },
    {
      tag: 'Modalidad y recursos',
      icon: '💻',
      q: '¿Las clases son presenciales, virtuales o grabadas?',
      a: 'La modalidad depende del programa elegido. Contamos con clases presenciales y sesiones virtuales mediante Microsoft Teams. A través de <strong>NostraCUENTA</strong>, el estudiante puede acceder a recursos académicos, comunicados y servicios institucionales; además, <strong>NostraCHAT</strong> facilita la comunicación académica. La disponibilidad de grabaciones y materiales se confirma según cada programa.'
    },
    {
      tag: 'Matrícula',
      icon: '📝',
      q: '¿Cómo puedo matricularme o separar mi vacante?',
      a: 'Primero solicita orientación y cuéntanos tu nivel, si ya postulaste y cuándo rendirás el examen. Un asesor te ayudará a elegir el programa, confirmará horarios y cupos, y te indicará el proceso de pago y matrícula. También puedes completar ahora la <a href="preinscripcion.html">preinscripción en línea</a> para registrar tus datos.'
    },
    {
      tag: 'Preparación',
      icon: '📚',
      q: '¿Qué incluye la preparación en Grupo Nostradamus?',
      a: 'La preparación integra teoría orientada al nivel UNI, práctica intensiva, problemas de alta exigencia, evaluaciones, simulacros tipo admisión, análisis de errores, material académico especializado, docentes especialistas y seguimiento del rendimiento. El objetivo es que cada estudiante avance con método, disciplina y una estrategia adecuada para su nivel.'
    },
    {
      tag: 'Escolares',
      icon: '🚀',
      q: '¿Grupo Nostradamus también prepara a escolares?',
      a: 'Sí. <strong>Proyecto Escolar</strong> fortalece Matemáticas, Ciencias, Aptitud Académica y hábitos de estudio; <strong>IEN UNI</strong> acompaña la preparación vinculada al Ingreso Escolar Nacional; y <strong>Ciclo Verano UNI</strong> permite avanzar intensivamente durante las vacaciones. La recomendación depende del grado, la base académica y el objetivo del estudiante.'
    },
    {
      tag: 'Ya postulé',
      icon: '🔥',
      q: '¿Qué programa me conviene si ya postulé y no ingresé?',
      a: 'Analizamos tu puntaje, tus errores frecuentes y la distancia respecto de la vacante. Si todavía existen vacíos importantes, la ruta recomendada suele ser <strong>Nostra Power UNI</strong>; si quedaste cerca, <strong>Nostra Élite UNI</strong>; si estás en la etapa decisiva, <strong>Nostra Prime UNI</strong>; y si ya tienes rendimiento sobresaliente, <strong>Nostra Talentum UNI</strong>. La orientación final se realiza según tu diagnóstico.'
    }
  ];

  function injectStyles() {
    if (document.getElementById('nostra-faq-index-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-faq-index-pro-style';
    style.textContent = `
      body .nostra-faq-pro-section{
        position:relative !important;
        padding:92px 0 !important;
        background:
          radial-gradient(circle at 10% 0%, rgba(0,194,209,.18), transparent 33%),
          radial-gradient(circle at 92% 20%, rgba(0,139,150,.13), transparent 35%),
          linear-gradient(180deg,#f7fdff 0%,#edf7fa 100%) !important;
        overflow:hidden !important;
      }
      body .nostra-faq-pro-section::before{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        background-image:linear-gradient(rgba(0,139,150,.06) 1px, transparent 1px),linear-gradient(90deg, rgba(0,139,150,.06) 1px, transparent 1px) !important;
        background-size:44px 44px !important;
        mask-image:radial-gradient(circle at center, black, transparent 78%) !important;
        pointer-events:none !important;
      }
      body .nostra-faq-pro-wrap{position:relative !important;z-index:2 !important;}
      body .nostra-faq-pro-head{
        display:grid !important;
        grid-template-columns:minmax(0,1fr) auto !important;
        gap:24px !important;
        align-items:end !important;
        margin-bottom:34px !important;
      }
      body .nostra-faq-pro-kicker{
        display:inline-flex !important;
        align-items:center !important;
        gap:8px !important;
        margin-bottom:12px !important;
        padding:8px 14px !important;
        border-radius:999px !important;
        background:rgba(0,194,209,.10) !important;
        border:1px solid rgba(0,194,209,.26) !important;
        color:#008b96 !important;
        font-size:13px !important;
        font-weight:950 !important;
        letter-spacing:.7px !important;
        text-transform:uppercase !important;
      }
      body .nostra-faq-pro-title{
        margin:0 !important;
        max-width:900px !important;
        color:#061426 !important;
        font-size:clamp(34px,4.4vw,64px) !important;
        line-height:1.02 !important;
        font-weight:950 !important;
        font-style:italic !important;
        letter-spacing:-1px !important;
        text-transform:uppercase !important;
        background:linear-gradient(180deg,#061426 0%,#123747 42%,#008b96 73%,#061426 100%) !important;
        -webkit-background-clip:text !important;
        background-clip:text !important;
        -webkit-text-fill-color:transparent !important;
        filter:drop-shadow(0 2px 0 rgba(255,255,255,.76)) !important;
      }
      body .nostra-faq-pro-title span{color:#008b96 !important;}
      body .nostra-faq-pro-intro{
        max-width:790px !important;
        margin:15px 0 0 !important;
        color:#506173 !important;
        font-size:16.5px !important;
        line-height:1.65 !important;
        font-weight:650 !important;
      }
      body .nostra-faq-pro-head-card{
        width:285px !important;
        padding:18px !important;
        border-radius:24px !important;
        background:linear-gradient(135deg,#061426,#083044 62%,#008b96) !important;
        color:#fff !important;
        box-shadow:0 22px 48px rgba(6,20,38,.17),0 0 34px rgba(0,194,209,.15) !important;
      }
      body .nostra-faq-pro-head-card strong{display:block !important;font-size:23px !important;font-weight:950 !important;line-height:1.08 !important;color:#a8f7ff !important;}
      body .nostra-faq-pro-head-card span{display:block !important;margin-top:8px !important;font-size:13.5px !important;font-weight:700 !important;line-height:1.35 !important;color:rgba(255,255,255,.82) !important;}
      body .nostra-faq-pro-grid{
        display:grid !important;
        grid-template-columns:minmax(0,1.04fr) minmax(360px,.96fr) !important;
        gap:34px !important;
        align-items:stretch !important;
      }
      body .nostra-faq-pro-panel{
        padding:18px !important;
        border-radius:30px !important;
        background:rgba(255,255,255,.68) !important;
        border:1px solid rgba(0,194,209,.18) !important;
        box-shadow:0 24px 62px rgba(6,20,38,.09) !important;
        backdrop-filter:blur(10px) !important;
      }
      body .nostra-faq-pro-list{display:grid !important;gap:12px !important;}
      body .nostra-faq-pro-item{
        border-radius:22px !important;
        background:#fff !important;
        border:1px solid rgba(0,137,150,.13) !important;
        box-shadow:0 12px 28px rgba(6,20,38,.055) !important;
        overflow:hidden !important;
        transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease !important;
      }
      body .nostra-faq-pro-item:hover{transform:translateY(-2px) !important;border-color:rgba(0,194,209,.34) !important;box-shadow:0 18px 38px rgba(6,20,38,.09) !important;}
      body .nostra-faq-pro-item.active{border-color:rgba(0,194,209,.55) !important;box-shadow:0 20px 44px rgba(0,139,150,.14) !important;}
      body .nostra-faq-pro-question{
        width:100% !important;
        min-height:74px !important;
        display:grid !important;
        grid-template-columns:auto 1fr auto !important;
        align-items:center !important;
        gap:14px !important;
        padding:18px 19px !important;
        background:transparent !important;
        border:0 !important;
        color:#061426 !important;
        text-align:left !important;
        cursor:pointer !important;
      }
      body .nostra-faq-pro-ico{
        width:46px !important;
        height:46px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:16px !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:20px !important;
        box-shadow:0 12px 24px rgba(0,139,150,.20) !important;
      }
      body .nostra-faq-pro-qtext{display:block !important;}
      body .nostra-faq-pro-tag{
        display:inline-flex !important;
        margin-bottom:5px !important;
        padding:3px 8px !important;
        border-radius:999px !important;
        background:#eafffb !important;
        color:#008b96 !important;
        font-size:10.5px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.5px !important;
      }
      body .nostra-faq-pro-question-title{
        display:block !important;
        color:#061426 !important;
        font-size:17px !important;
        font-weight:950 !important;
        line-height:1.25 !important;
      }
      body .nostra-faq-pro-toggle{
        width:40px !important;
        height:40px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:50% !important;
        background:#eefbfc !important;
        color:#008b96 !important;
        font-size:21px !important;
        font-weight:950 !important;
        transition:transform .22s ease, background .22s ease, color .22s ease !important;
      }
      body .nostra-faq-pro-toggle::before{content:'+' !important;line-height:1 !important;}
      body .nostra-faq-pro-item.active .nostra-faq-pro-toggle{background:#008b96 !important;color:#fff !important;transform:rotate(45deg) !important;}
      body .nostra-faq-pro-answer{max-height:0;overflow:hidden !important;transition:max-height .34s ease !important;}
      body .nostra-faq-pro-answer-inner{
        margin:0 19px 19px 79px !important;
        padding:16px 18px !important;
        border-left:4px solid #00c2d1 !important;
        border-radius:0 18px 18px 0 !important;
        background:linear-gradient(180deg,#f8feff,#eefbfc) !important;
        color:#455669 !important;
        font-size:15.5px !important;
        line-height:1.65 !important;
        font-weight:650 !important;
      }
      body .nostra-faq-pro-answer-inner strong{color:#061426 !important;font-weight:900 !important;}
      body .nostra-faq-pro-answer-inner a{color:#007f89 !important;font-weight:900 !important;text-decoration:underline !important;text-underline-offset:3px !important;}
      body .nostra-faq-pro-visual{
        position:relative !important;
        min-height:100% !important;
        border-radius:30px !important;
        overflow:hidden !important;
        background:linear-gradient(135deg,#061426,#008b96) !important;
        box-shadow:0 28px 72px rgba(6,20,38,.18),0 0 40px rgba(0,194,209,.14) !important;
      }
      body .nostra-faq-pro-visual img{
        width:100% !important;
        height:100% !important;
        min-height:620px !important;
        object-fit:cover !important;
        display:block !important;
        filter:saturate(1.08) contrast(1.04) !important;
      }
      body .nostra-faq-pro-visual::after{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        background:linear-gradient(180deg,rgba(6,20,38,.04),rgba(6,20,38,.48)) !important;
        pointer-events:none !important;
      }
      body .nostra-faq-pro-card{
        position:absolute !important;
        left:24px !important;
        right:24px !important;
        bottom:24px !important;
        z-index:2 !important;
        padding:24px !important;
        border-radius:26px !important;
        background:linear-gradient(135deg,rgba(6,20,38,.91),rgba(0,139,150,.86)) !important;
        border:1px solid rgba(255,255,255,.18) !important;
        box-shadow:0 18px 42px rgba(6,20,38,.28) !important;
        color:#fff !important;
      }
      body .nostra-faq-pro-card h3{margin:0 0 9px !important;color:#fff !important;font-size:26px !important;font-weight:950 !important;line-height:1.1 !important;}
      body .nostra-faq-pro-card p{margin:0 0 15px !important;color:rgba(255,255,255,.84) !important;font-size:14.5px !important;line-height:1.5 !important;font-weight:650 !important;}
      body .nostra-faq-pro-wa,
      body .nostra-faq-pro-btn{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:9px !important;
        min-height:48px !important;
        padding:12px 18px !important;
        border-radius:999px !important;
        color:#fff !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
      }
      body .nostra-faq-pro-wa{background:linear-gradient(135deg,#25d366,#13a54d,#061426) !important;box-shadow:0 14px 28px rgba(37,211,102,.26) !important;}
      body .nostra-faq-pro-actions{display:flex !important;flex-wrap:wrap !important;gap:12px !important;margin-top:18px !important;}
      body .nostra-faq-pro-btn{background:linear-gradient(135deg,#008b96,#05313d 55%,#061426) !important;box-shadow:0 16px 32px rgba(0,139,150,.22) !important;}
      body .nostra-faq-pro-btn--gold{background:linear-gradient(135deg,#ffbd42,#f08b17 55%,#8c4b00) !important;}
      body .nostra-faq-pro-btn:hover,
      body .nostra-faq-pro-wa:hover{color:#fff !important;transform:translateY(-2px) !important;}
      @media(max-width:1199px){
        body .nostra-faq-pro-head{grid-template-columns:1fr !important;}
        body .nostra-faq-pro-head-card{width:100% !important;}
        body .nostra-faq-pro-grid{grid-template-columns:1fr !important;}
        body .nostra-faq-pro-visual img{min-height:420px !important;}
      }
      @media(max-width:575px){
        body .nostra-faq-pro-section{padding:58px 0 !important;}
        body .nostra-faq-pro-panel{padding:12px !important;border-radius:24px !important;backdrop-filter:none !important;}
        body .nostra-faq-pro-question{grid-template-columns:auto 1fr auto !important;gap:10px !important;padding:15px !important;}
        body .nostra-faq-pro-ico{width:38px !important;height:38px !important;border-radius:13px !important;font-size:17px !important;}
        body .nostra-faq-pro-question-title{font-size:15px !important;}
        body .nostra-faq-pro-answer-inner{margin:0 15px 15px 15px !important;padding:14px !important;font-size:14.5px !important;}
        body .nostra-faq-pro-visual{border-radius:24px !important;}
        body .nostra-faq-pro-card{left:14px !important;right:14px !important;bottom:14px !important;padding:18px !important;}
        body .nostra-faq-pro-actions{display:grid !important;grid-template-columns:1fr !important;}
        body .nostra-faq-pro-btn{width:100% !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function findFAQSection() {
    var candidates = Array.from(document.querySelectorAll('section, .space, .space-top, .space-bottom'));
    return candidates.find(function (element) {
      if (element.dataset && element.dataset.nostraFaqPro === '3') return false;
      var text = normalize(element.textContent);
      return text.indexOf('preguntas frecuentes estudiantiles') !== -1 ||
        text.indexOf('resuelve tus dudas') !== -1 ||
        text.indexOf('como puedo acceder a la intranet') !== -1 ||
        (text.indexOf('que ciclos ofrece') !== -1 && text.indexOf('grupo de estudio nostradamus') !== -1);
    });
  }

  function getExistingImage(section) {
    var image = section ? section.querySelector('img') : null;
    return image && image.getAttribute('src') ? image.getAttribute('src') : 'assets/img/normal/about_5_1.jpg';
  }

  function faqHTML(item, index) {
    var answerId = 'nostra-faq-answer-' + index;
    return '' +
      '<div class="nostra-faq-pro-item ' + (index === 0 ? 'active' : '') + '">' +
        '<button class="nostra-faq-pro-question" type="button" aria-expanded="' + (index === 0 ? 'true' : 'false') + '" aria-controls="' + answerId + '">' +
          '<span class="nostra-faq-pro-ico">' + item.icon + '</span>' +
          '<span class="nostra-faq-pro-qtext"><span class="nostra-faq-pro-tag">' + item.tag + '</span><span class="nostra-faq-pro-question-title">' + item.q + '</span></span>' +
          '<span class="nostra-faq-pro-toggle" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="nostra-faq-pro-answer" id="' + answerId + '"><div class="nostra-faq-pro-answer-inner">' + item.a + '</div></div>' +
      '</div>';
  }

  function buildSection(imageSource) {
    return '' +
      '<div class="container nostra-faq-pro-wrap">' +
        '<div class="nostra-faq-pro-head">' +
          '<div>' +
            '<span class="nostra-faq-pro-kicker">💬 Centro de ayuda para postulantes</span>' +
            '<h2 class="nostra-faq-pro-title">Preguntas frecuentes para <span>elegir tu programa UNI</span></h2>' +
            '<p class="nostra-faq-pro-intro">Resuelve tus dudas sobre programas, modalidad, matrícula, recursos académicos y acompañamiento antes de comenzar tu preparación.</p>' +
          '</div>' +
          '<div class="nostra-faq-pro-head-card"><strong>Encuentra tu programa ideal</strong><span>Seis respuestas claras para elegir la preparación que realmente necesitas.</span></div>' +
        '</div>' +
        '<div class="nostra-faq-pro-grid">' +
          '<div class="nostra-faq-pro-panel">' +
            '<div class="nostra-faq-pro-list">' + faqs.map(faqHTML).join('') + '</div>' +
            '<div class="nostra-faq-pro-actions">' +
              '<a class="nostra-faq-pro-btn" href="ciclos.html">Ver programas académicos</a>' +
              '<a class="nostra-faq-pro-btn nostra-faq-pro-btn--gold" href="preinscripcion.html">Preinscribirme</a>' +
              '<a class="nostra-faq-pro-btn" target="_blank" rel="noopener noreferrer" href="' + whatsappURL + '">Consultar por WhatsApp</a>' +
            '</div>' +
          '</div>' +
          '<div class="nostra-faq-pro-visual">' +
            '<img src="' + imageSource + '" alt="Orientación para elegir un programa UNI en Grupo Nostradamus" loading="lazy" decoding="async">' +
            '<div class="nostra-faq-pro-card">' +
              '<h3>¿Aún no sabes qué programa elegir?</h3>' +
              '<p>Cuéntanos tu nivel, si ya postulaste y cuándo rendirás el examen. Te orientaremos hacia la ruta académica más conveniente.</p>' +
              '<a class="nostra-faq-pro-wa" target="_blank" rel="noopener noreferrer" href="' + whatsappURL + '"><i class="fab fa-whatsapp"></i> Hablar con un asesor</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function closeItem(item) {
    item.classList.remove('active');
    var button = item.querySelector('.nostra-faq-pro-question');
    var answer = item.querySelector('.nostra-faq-pro-answer');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (answer) answer.style.maxHeight = '0px';
  }

  function openItem(item) {
    item.classList.add('active');
    var button = item.querySelector('.nostra-faq-pro-question');
    var answer = item.querySelector('.nostra-faq-pro-answer');
    if (button) button.setAttribute('aria-expanded', 'true');
    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  function refreshActiveAnswer(section) {
    var active = section.querySelector('.nostra-faq-pro-item.active');
    if (!active) return;
    var answer = active.querySelector('.nostra-faq-pro-answer');
    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  function bindAccordion(section) {
    var items = Array.from(section.querySelectorAll('.nostra-faq-pro-item'));
    items.forEach(function (item) {
      var button = item.querySelector('.nostra-faq-pro-question');
      if (!button) return;

      button.addEventListener('click', function () {
        var wasActive = item.classList.contains('active');
        items.forEach(closeItem);
        if (!wasActive) openItem(item);
      });
    });

    var first = section.querySelector('.nostra-faq-pro-item.active');
    if (first) window.requestAnimationFrame(function () { openItem(first); });

    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { refreshActiveAnswer(section); }, 160);
    }, { passive:true });
  }

  function init() {
    if (initialized) return true;
    injectStyles();

    var section = findFAQSection();
    if (!section) return false;

    var imageSource = getExistingImage(section);
    section.classList.add('nostra-faq-pro-section');
    section.innerHTML = buildSection(imageSource);
    section.dataset.nostraFaqPro = '3';
    bindAccordion(section);
    initialized = true;
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.addEventListener('load', function () {
    if (!initialized) init();
  }, { once:true });
})();