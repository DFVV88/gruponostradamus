/* ==================================================
   Grupo Nostradamus - Páginas individuales de ciclos PRO
   Mejora texto, diseño, navegación lateral y llamada comercial
   en cada subpágina de ciclo.
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || '').toLowerCase();

  var ciclos = {
    'ciclo-anual-uni.html': {
      titulo: 'Ciclo Anual UNI',
      corto: 'Anual UNI',
      perfil: 'Para alumnos que no tienen base o necesitan empezar desde cero.',
      descripcion: 'Este ciclo está diseñado para estudiantes que requieren una preparación completa durante un año. Se construyen los fundamentos desde lo más básico y se avanza progresivamente hasta alcanzar el nivel requerido por el examen de admisión UNI.',
      enfoque: 'Base desde cero, teoría ordenada, práctica progresiva y acompañamiento constante.',
      nivel: 'Desde cero · Básico · Intermedio · Avanzado',
      duracion: 'Preparación anual completa',
      ideal: 'Ideal para alumnos que necesitan formar una base sólida antes de competir por una vacante UNI.',
      url: 'ciclo-anual-uni.html'
    },
    'ciclo-semianual-uni.html': {
      titulo: 'Ciclo Semianual UNI',
      corto: 'Semianual UNI',
      perfil: 'Para alumnos con base que necesitan una preparación más efectiva.',
      descripcion: 'Este programa está orientado a estudiantes que ya tienen conocimientos previos, pero que aún no han postulado a la UNI o no han obtenido buenos resultados con preparaciones anteriores. El objetivo es ordenar la base, corregir vacíos y elevar el rendimiento con entrenamiento constante.',
      enfoque: 'Corrección de vacíos, práctica intensiva, seguimiento y mejora del rendimiento.',
      nivel: 'Base previa · Intermedio · Avanzado',
      duracion: 'Preparación intensiva semianual',
      ideal: 'Ideal para alumnos que ya estudiaron antes, pero necesitan método, exigencia y dirección clara.',
      url: 'ciclo-semianual-uni.html'
    },
    'ciclo-semestral-uni.html': {
      titulo: 'Ciclo Semestral UNI',
      corto: 'Semestral UNI',
      perfil: 'Para alumnos con base que ya postularon y aún no lograron ingresar.',
      descripcion: 'Este ciclo está pensado para postulantes con experiencia previa en admisión que necesitan ajustar su preparación. Se trabaja en reforzar puntos débiles, mejorar la velocidad de resolución y fortalecer la estrategia para afrontar el examen con mayor seguridad.',
      enfoque: 'Refuerzo estratégico, velocidad, corrección de errores y entrenamiento tipo examen.',
      nivel: 'Intermedio · Avanzado',
      duracion: 'Preparación semestral estratégica',
      ideal: 'Ideal para alumnos que ya intentaron ingresar y quieren convertir su experiencia previa en una ventaja.',
      url: 'ciclo-semestral-uni.html'
    },
    'ciclo-repaso-uni.html': {
      titulo: 'Ciclo Repaso UNI',
      corto: 'Repaso UNI',
      perfil: 'Para postulantes que están cerca del examen y necesitan repasar lo más frecuente.',
      descripcion: 'Ciclo corto e intensivo enfocado en repasar los temas más frecuentes y relevantes del examen de admisión UNI. Su objetivo es reforzar métodos, fórmulas, preguntas tipo y estrategias de resolución para llegar con mayor precisión a la evaluación.',
      enfoque: 'Temas frecuentes, práctica tipo examen, rapidez y seguridad antes de postular.',
      nivel: 'Repaso estratégico · Intermedio · Avanzado',
      duracion: 'Ciclo corto de alta intensidad',
      ideal: 'Ideal para quienes ya estudiaron y necesitan un repaso final enfocado en lo que más aparece en admisión.',
      url: 'ciclo-repaso-uni.html'
    },
    'ciclo-elite-uni.html': {
      titulo: 'Ciclo Élite UNI',
      corto: 'Élite UNI',
      perfil: 'Para alumnos con alto rendimiento que buscan competir al máximo nivel.',
      descripcion: 'Ciclo de exigencia superior para postulantes con buena base académica. Se profundiza en problemas de mayor dificultad, técnicas de resolución y entrenamiento avanzado orientado al estándar competitivo de la UNI.',
      enfoque: 'Problemas de alto nivel, estrategia avanzada y entrenamiento competitivo.',
      nivel: 'Avanzado',
      duracion: 'Entrenamiento especializado',
      ideal: 'Ideal para estudiantes que desean potenciar su rendimiento y competir por mejores resultados.',
      url: 'ciclo-elite-uni.html'
    },
    'ciclo-ien.html': {
      titulo: 'Ciclo IEN',
      corto: 'IEN',
      perfil: 'Para estudiantes que necesitan reforzar fundamentos y ganar confianza académica.',
      descripcion: 'Programa orientado a ordenar la preparación, mejorar la comprensión de los cursos clave y reforzar bases mediante clases claras, práctica constante y seguimiento académico.',
      enfoque: 'Fundamentos, práctica guiada y avance progresivo.',
      nivel: 'Básico · Intermedio',
      duracion: 'Refuerzo académico estructurado',
      ideal: 'Ideal para alumnos que buscan consolidar su base y avanzar con mayor seguridad.',
      url: 'ciclo-ien.html'
    },
    'ciclo-proyecto-escolar.html': {
      titulo: 'Ciclo Proyecto Escolar',
      corto: 'Proyecto Escolar',
      perfil: 'Para escolares que desean adelantarse y fortalecer su rendimiento.',
      descripcion: 'Formación académica para estudiantes de colegio que quieren mejorar su desempeño y construir una base preuniversitaria desde etapas tempranas. Se refuerzan Matemáticas, Ciencias y Aptitud Académica con método y acompañamiento.',
      enfoque: 'Base escolar, visión preuniversitaria y disciplina académica.',
      nivel: 'Escolar · Preuniversitario inicial',
      duracion: 'Formación progresiva escolar',
      ideal: 'Ideal para escolares que quieren llegar mejor preparados a futuros ciclos UNI.',
      url: 'ciclo-proyecto-escolar.html'
    },
    'ciclo-paralelo-cepre-uni.html': {
      titulo: 'Ciclo Paralelo CEPRE UNI',
      corto: 'Paralelo CEPRE UNI',
      perfil: 'Para alumnos de CEPRE UNI que necesitan reforzar y practicar más.',
      descripcion: 'Acompañamiento especializado para estudiantes que llevan CEPRE UNI y necesitan ordenar su avance, reforzar lo aprendido, resolver dudas y practicar con mayor intensidad para sostener un rendimiento competitivo.',
      enfoque: 'Refuerzo paralelo, resolución de dudas y práctica intensiva.',
      nivel: 'Intermedio · Avanzado',
      duracion: 'Acompañamiento paralelo',
      ideal: 'Ideal para alumnos de CEPRE UNI que quieren complementar su preparación y mejorar resultados.',
      url: 'ciclo-paralelo-cepre-uni.html'
    },
    'ciclo-verano-uni.html': {
      titulo: 'Ciclo Verano UNI',
      corto: 'Ciclo Verano UNI',
      perfil: 'Para estudiantes que quieren aprovechar el verano para avanzar.',
      descripcion: 'Ciclo intensivo de verano para iniciar o reforzar la preparación UNI durante las vacaciones. Permite avanzar rápidamente en cursos principales, desarrollar disciplina académica y llegar mejor preparado al siguiente ciclo.',
      enfoque: 'Avance rápido, refuerzo de cursos clave y disciplina de estudio.',
      nivel: 'Básico · Intermedio',
      duracion: 'Intensivo de verano',
      ideal: 'Ideal para estudiantes que quieren ganar ventaja académica durante las vacaciones.',
      url: 'ciclo-verano-uni.html'
    }
  };

  var actual = ciclos[file];
  if (!actual) return;

  var lista = [
    'ciclo-anual-uni.html',
    'ciclo-semianual-uni.html',
    'ciclo-semestral-uni.html',
    'ciclo-elite-uni.html',
    'ciclo-ien.html',
    'ciclo-proyecto-escolar.html',
    'ciclo-repaso-uni.html',
    'ciclo-paralelo-cepre-uni.html',
    'ciclo-verano-uni.html'
  ];

  function injectStyles() {
    var old = document.getElementById('nostra-ciclo-detalle-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-ciclo-detalle-pro-style';
    style.textContent = `
      body.nostra-ciclo-detalle-pro .breadcumb-wrapper{
        padding-top:72px !important;
        padding-bottom:72px !important;
        background-position:center !important;
      }

      body.nostra-ciclo-detalle-pro .breadcumb-title{
        font-size:clamp(34px,4vw,58px) !important;
        font-weight:950 !important;
        letter-spacing:-.8px !important;
      }

      body.nostra-ciclo-detalle-pro .course-single{
        border-radius:28px !important;
        overflow:hidden !important;
        border:1px solid rgba(0,137,150,.14) !important;
        box-shadow:0 24px 60px rgba(6,20,38,.10),0 0 32px rgba(0,194,209,.08) !important;
      }

      body.nostra-ciclo-detalle-pro .course-single-top{
        background:radial-gradient(circle at 12% 0%,rgba(0,194,209,.16),transparent 30%),linear-gradient(135deg,#f8ffff,#eefbfc) !important;
        padding:22px !important;
      }

      body.nostra-ciclo-detalle-pro .course-img,
      body.nostra-ciclo-detalle-pro .course-img iframe,
      body.nostra-ciclo-detalle-pro .course-img img{
        border-radius:22px !important;
        overflow:hidden !important;
      }

      body.nostra-ciclo-detalle-pro .course-img iframe{
        width:100% !important;
        aspect-ratio:16/9 !important;
        height:auto !important;
        display:block !important;
        box-shadow:0 18px 40px rgba(6,20,38,.16) !important;
      }

      body.nostra-ciclo-detalle-pro .course-title{
        margin-top:22px !important;
        font-size:clamp(30px,3.3vw,48px) !important;
        line-height:1.06 !important;
        font-weight:950 !important;
        color:#061426 !important;
        text-transform:uppercase !important;
        letter-spacing:-.8px !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-hero{
        margin-top:18px !important;
        padding:18px !important;
        border-radius:22px !important;
        background:linear-gradient(135deg,#061426 0%,#08263a 54%,#008b96 100%) !important;
        color:#fff !important;
        box-shadow:0 18px 42px rgba(6,20,38,.16),0 0 24px rgba(0,194,209,.16) !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-hero__eyebrow{
        display:inline-flex !important;
        align-items:center !important;
        gap:8px !important;
        padding:6px 11px !important;
        border-radius:999px !important;
        background:rgba(255,255,255,.10) !important;
        border:1px solid rgba(255,255,255,.14) !important;
        color:#a8f7ff !important;
        font-size:12px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.5px !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-hero__title{
        margin:12px 0 8px !important;
        color:#fff !important;
        font-size:clamp(20px,2vw,30px) !important;
        font-weight:950 !important;
        line-height:1.15 !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-hero__text{
        margin:0 !important;
        color:rgba(255,255,255,.84) !important;
        font-size:15.5px !important;
        line-height:1.6 !important;
        font-weight:600 !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-tags{
        margin-top:14px !important;
        display:flex !important;
        flex-wrap:wrap !important;
        gap:9px !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-tags span{
        display:inline-flex !important;
        align-items:center !important;
        padding:8px 11px !important;
        border-radius:999px !important;
        background:rgba(255,255,255,.11) !important;
        border:1px solid rgba(255,255,255,.14) !important;
        color:#fff !important;
        font-size:12.5px !important;
        font-weight:850 !important;
      }

      body.nostra-ciclo-detalle-pro .course-single-bottom{
        padding:24px !important;
      }

      body.nostra-ciclo-detalle-pro .course-tab{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:10px !important;
        padding:10px !important;
        border-radius:18px !important;
        background:linear-gradient(135deg,#061426,#082238) !important;
        border:1px solid rgba(0,194,209,.22) !important;
      }

      body.nostra-ciclo-detalle-pro .course-tab .nav-item{width:100% !important;}
      body.nostra-ciclo-detalle-pro .course-tab .nav-link{
        width:100% !important;
        min-height:48px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:8px !important;
        border-radius:14px !important;
        color:rgba(255,255,255,.88) !important;
        background:rgba(255,255,255,.08) !important;
        border:1px solid rgba(255,255,255,.08) !important;
        font-weight:900 !important;
      }

      body.nostra-ciclo-detalle-pro .course-tab .nav-link.active,
      body.nostra-ciclo-detalle-pro .course-tab .nav-link:hover{
        color:#fff !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        box-shadow:0 12px 26px rgba(0,194,209,.25) !important;
      }

      body.nostra-ciclo-detalle-pro .tab-content{
        margin-top:18px !important;
        padding:24px !important;
        border-radius:22px !important;
        background:linear-gradient(180deg,#ffffff,#f7fcfd) !important;
        border:1px solid rgba(0,137,150,.12) !important;
      }

      body.nostra-ciclo-detalle-pro .course-description .h5,
      body.nostra-ciclo-detalle-pro .course-curriculam .h5{
        display:inline-flex !important;
        align-items:center !important;
        gap:9px !important;
        margin-bottom:16px !important;
        padding:9px 14px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#e7fbfd,#fff) !important;
        border:1px solid rgba(0,194,209,.24) !important;
        color:#061426 !important;
        font-size:21px !important;
        font-weight:950 !important;
      }

      body.nostra-ciclo-detalle-pro .course-description p{
        color:#263648 !important;
        font-size:16px !important;
        line-height:1.75 !important;
        font-weight:560 !important;
        text-align:justify !important;
        text-justify:inter-word !important;
      }

      body.nostra-ciclo-detalle-pro .course-description p strong{
        display:block !important;
        margin:14px 0 10px !important;
        padding:12px 14px !important;
        border-radius:13px !important;
        border-left:5px solid #00c2d1 !important;
        background:linear-gradient(90deg,rgba(0,194,209,.14),#fff) !important;
        color:#061426 !important;
        font-size:15px !important;
        font-weight:950 !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-ideal{
        display:block !important;
        margin-top:10px !important;
        padding:13px 14px !important;
        border-radius:15px !important;
        background:#fff !important;
        border:1px solid rgba(0,137,150,.13) !important;
        color:#008b96 !important;
        font-size:15px !important;
        font-weight:850 !important;
        line-height:1.45 !important;
        box-shadow:0 8px 18px rgba(6,20,38,.045) !important;
      }
      body.nostra-ciclo-detalle-pro .nostra-cycle-ideal:before{content:'🎯 ';}

      body.nostra-ciclo-detalle-pro .checklist ul{
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
        padding:0 !important;
        margin:0 !important;
      }

      body.nostra-ciclo-detalle-pro .checklist li{
        position:relative !important;
        list-style:none !important;
        margin:0 !important;
        padding:14px 16px 14px 46px !important;
        border-radius:16px !important;
        background:#fff !important;
        border:1px solid rgba(0,137,150,.12) !important;
        box-shadow:0 8px 20px rgba(6,20,38,.045) !important;
        color:#263648 !important;
        font-size:15.5px !important;
        font-weight:560 !important;
        line-height:1.58 !important;
      }
      body.nostra-ciclo-detalle-pro .checklist li:before{
        content:'✓' !important;
        position:absolute !important;
        left:14px !important;
        top:14px !important;
        width:22px !important;
        height:22px !important;
        border-radius:50% !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:12px !important;
        font-weight:900 !important;
      }

      body.nostra-ciclo-detalle-pro .sidebar-area{
        position:sticky !important;
        top:96px !important;
      }

      body.nostra-ciclo-detalle-pro .widget_info,
      body.nostra-ciclo-detalle-pro .sidebar-area .widget{
        border-radius:24px !important;
        background:linear-gradient(180deg,#ffffff,#f5fdff) !important;
        border:1px solid rgba(0,137,150,.14) !important;
        box-shadow:0 18px 42px rgba(6,20,38,.08) !important;
        overflow:hidden !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-side{
        margin-bottom:18px !important;
        padding:16px !important;
        border-radius:20px !important;
        background:linear-gradient(135deg,#061426,#083044 62%,#008b96) !important;
        color:#fff !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-side h3{
        margin:0 0 8px !important;
        color:#fff !important;
        font-size:19px !important;
        font-weight:950 !important;
        line-height:1.15 !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-side p{
        margin:0 0 12px !important;
        color:rgba(255,255,255,.78) !important;
        font-size:13px !important;
        line-height:1.45 !important;
        font-weight:650 !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-side a{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        min-height:44px !important;
        padding:11px 14px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#25d366,#13a54d) !important;
        color:#fff !important;
        font-size:13px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
      }

      body.nostra-ciclo-detalle-pro .nostra-cycle-detail-nav{
        margin-top:18px !important;
        padding:15px !important;
        border-radius:20px !important;
        background:#fff !important;
        border:1px solid rgba(0,137,150,.12) !important;
      }
      body.nostra-ciclo-detalle-pro .nostra-cycle-detail-nav h4{
        margin:0 0 10px !important;
        color:#061426 !important;
        font-size:16px !important;
        font-weight:950 !important;
      }
      body.nostra-ciclo-detalle-pro .nostra-cycle-detail-nav a{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:10px !important;
        padding:10px 11px !important;
        margin-bottom:7px !important;
        border-radius:13px !important;
        background:#f4fbfc !important;
        color:#061426 !important;
        font-size:13px !important;
        font-weight:850 !important;
        text-decoration:none !important;
        border:1px solid rgba(0,137,150,.10) !important;
      }
      body.nostra-ciclo-detalle-pro .nostra-cycle-detail-nav a.active,
      body.nostra-ciclo-detalle-pro .nostra-cycle-detail-nav a:hover{
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
      }

      @media(max-width:991px){
        body.nostra-ciclo-detalle-pro .course-tab{grid-template-columns:1fr !important;}
        body.nostra-ciclo-detalle-pro .sidebar-area{position:relative !important;top:auto !important;margin-top:28px !important;}
        body.nostra-ciclo-detalle-pro .course-description p{text-align:left !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function updateText() {
    document.body.classList.add('nostra-ciclo-detalle-pro');
    document.title = actual.titulo + ' | Grupo Nostradamus';

    var bread = document.querySelector('.breadcumb-title');
    if (bread) bread.textContent = actual.titulo;

    var courseTitle = document.querySelector('.course-title');
    if (courseTitle) courseTitle.textContent = actual.titulo;

    var desc = document.querySelector('.course-description p');
    if (desc) {
      desc.innerHTML = actual.descripcion +
        '<br><br><strong>NIVEL: ' + actual.nivel + '</strong>' +
        '<span class="nostra-cycle-ideal">' + actual.ideal + '</span>';
    }
  }

  function addHero() {
    var top = document.querySelector('.course-single-top');
    if (!top || top.querySelector('.nostra-cycle-hero')) return;

    var title = top.querySelector('.course-title');
    var hero = document.createElement('div');
    hero.className = 'nostra-cycle-hero';
    hero.innerHTML = '<div class="nostra-cycle-hero__eyebrow">🚀 Perfil del ciclo</div>' +
      '<h3 class="nostra-cycle-hero__title">' + actual.perfil + '</h3>' +
      '<p class="nostra-cycle-hero__text">' + actual.enfoque + '</p>' +
      '<div class="nostra-cycle-tags"><span>' + actual.nivel + '</span><span>' + actual.duracion + '</span><span>Modalidad presencial y virtual</span></div>';

    if (title && title.parentNode) title.parentNode.insertBefore(hero, title.nextSibling);
    else top.appendChild(hero);
  }

  function addSidebar() {
    var sidebar = document.querySelector('.sidebar-area');
    if (!sidebar || sidebar.querySelector('.nostra-cycle-side')) return;

    var side = document.createElement('div');
    side.className = 'nostra-cycle-side';
    side.innerHTML = '<h3>¿Este ciclo es para ti?</h3><p>' + actual.perfil + '</p><a href="https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, quiero informes sobre ' + actual.titulo) + '" target="_blank" rel="noopener">Solicitar informes</a>';
    sidebar.insertBefore(side, sidebar.firstChild);

    var nav = document.createElement('div');
    nav.className = 'nostra-cycle-detail-nav';
    nav.innerHTML = '<h4>Todos los ciclos</h4>' + lista.map(function (url) {
      var item = ciclos[url];
      return '<a class="' + (url === file ? 'active' : '') + '" href="' + url + '"><span>' + item.corto + '</span><span>›</span></a>';
    }).join('');
    side.insertAdjacentElement('afterend', nav);
  }

  function polishLists() {
    document.querySelectorAll('.checklist li').forEach(function (li) {
      li.innerHTML = li.innerHTML
        .replace(/comprension/g, 'comprensión')
        .replace(/encontras/g, 'encontrarás')
        .replace(/tambien/g, 'también')
        .replace(/visualizacion/g, 'visualización')
        .replace(/Tutoria/g, 'Tutoría')
        .replace(/calificaciónes/g, 'calificaciones')
        .replace(/Bridando/g, 'Brindando')
        .replace(/duracion/g, 'duración')
        .replace(/admision/g, 'admisión')
        .replace(/Revision/g, 'Revisión')
        .replace(/scaner/g, 'escáner')
        .replace(/Comodos/g, 'Cómodos')
        .replace(/aul cuenta/g, 'aula cuenta')
        .replace(/interacccion/g, 'interacción')
        .replace(/envian/g, 'envían');
    });
  }

  function init() {
    injectStyles();
    updateText();
    addHero();
    addSidebar();
    polishLists();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 600);
    setTimeout(init, 1600);
  });
})();
