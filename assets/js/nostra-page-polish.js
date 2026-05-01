/* ==================================================
   Grupo Nostradamus - Pulido comercial de páginas internas
   Mejora páginas generales: ciclos, docentes, cachimbos, sedes, blog,
   contacto y sobre nosotros. No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var WHATSAPP = 'https://wa.me/51993750351?text=Hola%20Grupo%20Nostradamus%2C%20quiero%20recibir%20informes%20sobre%20los%20ciclos%20acad%C3%A9micos.';

  var PAGES = {
    'ciclos.html': {
      badge: 'Elige tu ruta hacia la UNI',
      title: 'Ciclos académicos diseñados para cada etapa del postulante',
      text: 'En Grupo Nostradamus organizamos la preparación según el nivel, ritmo y objetivo del estudiante: desde formación completa hasta repaso intensivo, alto rendimiento o refuerzo paralelo.',
      points: ['Preparación UNI por niveles', 'Simulacros tipo admisión', 'Seguimiento académico', 'Clases presenciales y recursos virtuales'],
      cta: '📲 Recibir orientación de ciclos'
    },
    'docentes.html': {
      badge: 'Plana docente especializada',
      title: 'Docentes con experiencia en preparación UNI',
      text: 'Nuestro equipo académico está enfocado en enseñar con método, resolver dudas con claridad y exigir al alumno con el nivel que demanda la Universidad Nacional de Ingeniería.',
      points: ['Especialistas por curso', 'Experiencia preuniversitaria', 'Metodología orientada a resultados', 'Acompañamiento académico'],
      cta: '📲 Consultar por nuestros docentes'
    },
    'cachimbos.html': {
      badge: 'Resultados que inspiran',
      title: 'Historias de alumnos que transformaron esfuerzo en ingreso',
      text: 'Cada cachimbo representa disciplina, constancia y preparación estratégica. En Nostradamus celebramos los logros porque son la prueba de que el método y el acompañamiento importan.',
      points: ['Ingresantes UNI', 'Historias reales', 'Motivación para postulantes', 'Cultura de alto rendimiento'],
      cta: '📲 Quiero ser el próximo cachimbo'
    },
    'sedes.html': {
      badge: 'Sede y atención',
      title: 'Un espacio pensado para estudiar con concentración y exigencia',
      text: 'Nuestra sede brinda un entorno académico para que el estudiante pueda asistir, practicar, resolver dudas y mantenerse conectado con su proceso de preparación.',
      points: ['Ubicación accesible', 'Ambientes académicos', 'Atención por WhatsApp', 'Orientación para familias'],
      cta: '📲 Pedir ubicación e informes'
    },
    'blog.html': {
      badge: 'Noticias y orientación',
      title: 'Contenido útil para postulantes y familias',
      text: 'Encuentra información, consejos y novedades que ayudan a entender mejor la preparación, la vida académica y el camino hacia la UNI.',
      points: ['Consejos para postulantes', 'Noticias académicas', 'Orientación vocacional', 'Cultura UNI'],
      cta: '📲 Recibir asesoría académica'
    },
    'contacto.html': {
      badge: 'Estamos para orientarte',
      title: 'Comunícate con Grupo Nostradamus',
      text: 'Resolvemos tus dudas sobre ciclos, horarios, matrícula, sedes, modalidad de clases y el mejor camino de preparación según tu situación actual.',
      points: ['Atención por WhatsApp', 'Informes de ciclos', 'Orientación personalizada', 'Respuesta rápida'],
      cta: '📲 Escribir a informes'
    },
    'sobre-nosotros.html': {
      badge: 'Trayectoria Nostradamus',
      title: 'Años formando postulantes con método, disciplina y resultados',
      text: 'Somos una institución enfocada en preparación académica exigente, acompañamiento continuo y formación de estudiantes que buscan competir por una vacante en la UNI.',
      points: ['Experiencia académica', 'Método de trabajo', 'Seguimiento al alumno', 'Compromiso con resultados'],
      cta: '📲 Conocer nuestros ciclos'
    }
  };

  function currentFileName() {
    var parts = path.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  function injectStyles() {
    if (document.getElementById('nostra-page-polish-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-page-polish-style';
    style.textContent = `
      .nostra-page-hero-card{
        margin:38px auto 0;
        padding:30px 30px 28px;
        max-width:1120px;
        border-radius:26px;
        background:
          radial-gradient(circle at 18% 18%, rgba(0,194,209,.20), transparent 30%),
          radial-gradient(circle at 86% 22%, rgba(255,255,255,.10), transparent 26%),
          linear-gradient(135deg,#061426 0%,#02070d 52%,#083943 100%);
        border:1px solid rgba(0,194,209,.34);
        box-shadow:0 24px 60px rgba(0,0,0,.24),0 0 34px rgba(0,194,209,.16);
        color:#fff;
        position:relative;
        overflow:hidden;
      }
      .nostra-page-hero-card::before{
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.07) 44%,transparent 58%);
        pointer-events:none;
      }
      .nostra-page-hero-card > *{position:relative;z-index:2;}
      .nostra-page-badge{
        display:inline-block;
        padding:8px 15px;
        border-radius:999px;
        background:linear-gradient(90deg,rgba(0,194,209,.28),rgba(255,255,255,.10));
        border:1px solid rgba(255,255,255,.18);
        color:#eaffff;
        font-size:13px;
        font-weight:900;
        letter-spacing:.7px;
        text-transform:uppercase;
        margin-bottom:14px;
      }
      .nostra-page-hero-card h2{
        color:#fff !important;
        font-size:clamp(28px,3vw,46px);
        line-height:1.08;
        margin-bottom:14px;
        font-style:italic;
        text-transform:uppercase;
        text-shadow:0 3px 12px rgba(0,0,0,.68),0 0 16px rgba(0,194,209,.26);
      }
      .nostra-page-hero-card p{
        color:rgba(255,255,255,.88) !important;
        font-size:17px;
        line-height:1.65;
        max-width:880px;
        margin-bottom:20px;
      }
      .nostra-page-grid{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:12px;
        list-style:none;
        padding:0;
        margin:20px 0 24px;
      }
      .nostra-page-grid li{
        color:#fff;
        font-weight:850;
        background:rgba(255,255,255,.075);
        border:1px solid rgba(255,255,255,.13);
        border-radius:14px;
        padding:13px 14px;
        line-height:1.3;
      }
      .nostra-page-grid li::before{
        content:'✓';
        color:#00e5f2;
        margin-right:7px;
        font-weight:900;
      }
      .nostra-page-actions{
        display:flex;
        flex-wrap:wrap;
        gap:13px;
        align-items:center;
      }
      .nostra-page-note{
        color:rgba(255,255,255,.75);
        font-weight:700;
        font-size:14px;
      }
      .nostra-trust-strip{
        margin:28px auto 8px;
        max-width:1120px;
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:16px;
      }
      .nostra-trust-item{
        padding:18px 18px;
        border-radius:18px;
        background:linear-gradient(180deg,#ffffff,#eef5f7);
        border:1px solid rgba(7,140,149,.18);
        box-shadow:0 14px 32px rgba(0,0,0,.10),0 0 18px rgba(0,194,209,.08);
        text-align:center;
      }
      .nostra-trust-item strong{
        display:block;
        color:#061426;
        font-size:22px;
        font-weight:950;
        font-style:italic;
      }
      .nostra-trust-item span{
        color:#405060;
        font-weight:750;
        font-size:14px;
      }
      @media(max-width:991px){
        .nostra-page-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
        .nostra-trust-strip{grid-template-columns:1fr;}
      }
      @media(max-width:767px){
        .nostra-page-hero-card{padding:24px 18px;margin-top:24px;}
        .nostra-page-grid{grid-template-columns:1fr;}
      }
    `;
    document.head.appendChild(style);
  }

  function addPageHero() {
    var file = currentFileName();
    var data = PAGES[file];
    if (!data || document.querySelector('.nostra-page-hero-card')) return;

    injectStyles();

    var bread = document.querySelector('.breadcumb-wrapper, .breadcumb-area');
    if (!bread) return;

    var card = document.createElement('div');
    card.className = 'container';
    card.innerHTML = `
      <div class="nostra-page-hero-card">
        <span class="nostra-page-badge">${data.badge}</span>
        <h2>${data.title}</h2>
        <p>${data.text}</p>
        <ul class="nostra-page-grid">
          ${data.points.map(function (point) { return '<li>' + point + '</li>'; }).join('')}
        </ul>
        <div class="nostra-page-actions">
          <a href="${WHATSAPP}" target="_blank" rel="noopener noreferrer" class="th-btn style3">${data.cta}</a>
          <span class="nostra-page-note">Atención personalizada · Respuesta por WhatsApp</span>
        </div>
      </div>
      <div class="nostra-trust-strip">
        <div class="nostra-trust-item"><strong>16 años</strong><span>formando postulantes</span></div>
        <div class="nostra-trust-item"><strong>UNI</strong><span>preparación especializada</span></div>
        <div class="nostra-trust-item"><strong>Simulacros</strong><span>entrenamiento tipo admisión</span></div>
      </div>
    `;

    bread.insertAdjacentElement('afterend', card);
  }

  function improveGenericButtons() {
    document.querySelectorAll('a.th-btn').forEach(function (btn) {
      var text = (btn.textContent || '').toLowerCase();
      var href = btn.getAttribute('href') || '';
      if (href.indexOf('gruponostradamus.q10.com/Preinscripcion') !== -1 || text.indexOf('matric') !== -1) {
        btn.setAttribute('href', WHATSAPP);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
        if (text.indexOf('nostranet') === -1) {
          btn.innerHTML = '📲 Solicitar informes <i class="fas fa-arrow-right ms-2"></i>';
          btn.classList.add('style3');
        }
      }
    });
  }

  function init() {
    addPageHero();
    improveGenericButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    setTimeout(init, 300);
    setTimeout(init, 1200);
  });
})();
