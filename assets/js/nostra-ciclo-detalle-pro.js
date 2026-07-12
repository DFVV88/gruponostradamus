/* ==================================================
   Grupo Nostradamus - Páginas individuales de ciclos PRO
   Diseño premium + panel lateral comercial para todos los ciclos
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || '').toLowerCase();

  var ciclos = {
    'ciclo-anual-uni.html': {
      titulo: 'Nostra 360 UNI', corto: 'Nostra 360 UNI', icon: '🌐', badge: 'Ruta premium UNI',
      perfil: 'Preparación integral. Formación completa. Mentalidad de ingreso.',
      descripcion: 'Nostra 360 UNI está diseñado para estudiantes que necesitan desarrollar una preparación completa desde las bases hasta alcanzar el nivel exigido por la Universidad Nacional de Ingeniería. Fortalece conocimientos, disciplina, razonamiento, hábitos de estudio y capacidad para resolver problemas de alta exigencia.',
      enfoque: 'Base desde cero, teoría ordenada, práctica progresiva y acompañamiento constante.',
      nivel: 'Desde cero · Básico · Intermedio · Avanzado', duracion: 'Preparación anual completa',
      ideal: 'Domina cada área, fortalece tu nivel y transforma tu preparación.', url: 'ciclo-anual-uni.html'
    },
    'ciclo-semianual-uni.html': {
      titulo: 'Nostra Power UNI', corto: 'Nostra Power UNI', icon: '⚡', badge: 'Ruta premium UNI',
      perfil: 'Corrige tus errores. Potencia tu nivel. Vuelve más fuerte.',
      descripcion: 'Nostra Power UNI está dirigido a estudiantes que ya tuvieron una preparación anterior, pero todavía no alcanzaron el resultado esperado. Identifica fallas, corrige debilidades, fortalece conocimientos y desarrolla una estrategia académica mucho más efectiva.',
      enfoque: 'Corrección de vacíos, práctica intensiva, seguimiento y mejora del rendimiento.',
      nivel: 'Base previa · Intermedio · Avanzado', duracion: 'Preparación intensiva semianual',
      ideal: 'Convierte tus intentos anteriores en la fuerza que te llevará hacia tu vacante.', url: 'ciclo-semianual-uni.html'
    },
    'ciclo-semestral-uni.html': {
      titulo: 'Nostra Élite UNI', corto: 'Nostra Élite UNI', icon: '🎯', badge: 'Ruta premium UNI',
      perfil: 'Estuviste cerca. Ahora ve por tu vacante.',
      descripcion: 'Nostra Élite UNI es un programa de alto rendimiento para postulantes que ya rindieron el examen de admisión, alcanzaron un nivel competitivo y quedaron a pocos puntos de ingresar. Trabaja velocidad, precisión, estrategia, manejo del tiempo y reducción de errores bajo presión.',
      enfoque: 'Refuerzo estratégico, velocidad, corrección de errores y entrenamiento tipo examen.',
      nivel: 'Intermedio · Avanzado', duracion: 'Preparación semestral estratégica',
      ideal: 'Cuando estar cerca ya no es suficiente.', url: 'ciclo-semestral-uni.html'
    },
    'ciclo-repaso-uni.html': {
      titulo: 'Nostra Prime UNI', corto: 'Nostra Prime UNI', icon: '🚀', badge: 'Ruta premium UNI',
      perfil: 'Tu máximo nivel. Tu momento decisivo.',
      descripcion: 'Nostra Prime UNI está diseñado para postulantes en la etapa final antes del examen. Cada clase, simulacro y problema tiene un objetivo preciso: llegar al examen con velocidad, seguridad, estrategia y máxima concentración.',
      enfoque: 'Temas frecuentes, práctica tipo examen, rapidez y seguridad antes de postular.',
      nivel: 'Repaso estratégico · Intermedio · Avanzado', duracion: 'Ciclo corto de alta intensidad',
      ideal: 'No llegues solamente preparado. Llega en tu máximo nivel.', url: 'ciclo-repaso-uni.html'
    },
    'ciclo-elite-uni.html': {
      titulo: 'Nostra Talentum UNI', corto: 'Nostra Talentum UNI', icon: '🏆', badge: 'Ruta premium UNI',
      perfil: 'Talento superior. Exigencia máxima. Rendimiento extraordinario.',
      descripcion: 'Nostra Talentum UNI es un programa especializado para estudiantes con nivel académico sobresaliente, preparados para competir por los primeros lugares del examen de admisión UNI. Desarrolla velocidad, precisión, estrategia, dominio de problemas de alta complejidad y respuesta bajo máxima exigencia.',
      enfoque: 'Problemas de alto nivel, estrategia avanzada y entrenamiento competitivo.',
      nivel: 'Avanzado', duracion: 'Entrenamiento especializado',
      ideal: 'Donde el talento compite por los primeros lugares.', url: 'ciclo-elite-uni.html'
    },
    'ciclo-ien.html': {
      titulo: 'Ciclo IEN', corto: 'IEN', icon: '📘', badge: 'Programa académico',
      perfil: 'Refuerza fundamentos y gana confianza académica.',
      descripcion: 'Programa orientado a ordenar la preparación, mejorar la comprensión de los cursos clave y reforzar bases mediante clases claras, práctica constante y seguimiento académico.',
      enfoque: 'Fundamentos, práctica guiada y avance progresivo.', nivel: 'Básico · Intermedio', duracion: 'Refuerzo académico estructurado',
      ideal: 'Ideal para alumnos que buscan consolidar su base y avanzar con mayor seguridad.', url: 'ciclo-ien.html'
    },
    'ciclo-proyecto-escolar.html': {
      titulo: 'Proyecto Escolar', corto: 'Proyecto Escolar', icon: '🎒', badge: 'Programa escolar',
      perfil: 'Base escolar sólida, hábitos de estudio y acompañamiento.',
      descripcion: 'Formación académica para estudiantes de colegio que quieren mejorar su desempeño y construir una base preuniversitaria desde etapas tempranas. Se refuerzan Matemáticas, Ciencias y Aptitud Académica con método y acompañamiento.',
      enfoque: 'Base escolar, visión preuniversitaria y disciplina académica.', nivel: 'Escolar · Preuniversitario inicial', duracion: 'Formación progresiva escolar',
      ideal: 'Ideal para escolares que quieren llegar mejor preparados a futuros ciclos UNI.', url: 'ciclo-proyecto-escolar.html'
    },
    'ciclo-paralelo-cepre-uni.html': {
      titulo: 'Paralelo CEPRE UNI', corto: 'Paralelo CEPRE UNI', icon: '🏛️', badge: 'Programa CEPRE',
      perfil: 'Refuerzo paralelo para estudiantes orientados a CEPRE UNI.',
      descripcion: 'Acompañamiento especializado para estudiantes que llevan CEPRE UNI y necesitan ordenar su avance, reforzar lo aprendido, resolver dudas y practicar con mayor intensidad para sostener un rendimiento competitivo.',
      enfoque: 'Refuerzo paralelo, resolución de dudas y práctica intensiva.', nivel: 'Intermedio · Avanzado', duracion: 'Acompañamiento paralelo',
      ideal: 'Ideal para alumnos de CEPRE UNI que quieren complementar su preparación y mejorar resultados.', url: 'ciclo-paralelo-cepre-uni.html'
    },
    'ciclo-verano-uni.html': {
      titulo: 'Ciclo Verano UNI', corto: 'Ciclo Verano UNI', icon: '☀️', badge: 'Programa intensivo',
      perfil: 'Avance intensivo de verano para elevar tu nivel académico.',
      descripcion: 'Ciclo intensivo de verano para iniciar o reforzar la preparación UNI durante las vacaciones. Permite avanzar rápidamente en cursos principales, desarrollar disciplina académica y llegar mejor preparado al siguiente ciclo.',
      enfoque: 'Avance rápido, refuerzo de cursos clave y disciplina de estudio.', nivel: 'Básico · Intermedio', duracion: 'Intensivo de verano',
      ideal: 'Ideal para estudiantes que quieren ganar ventaja académica durante las vacaciones.', url: 'ciclo-verano-uni.html'
    }
  };

  var actual = ciclos[file];
  if (!actual) return;

  var lista = [
    'ciclo-anual-uni.html','ciclo-semianual-uni.html','ciclo-semestral-uni.html','ciclo-elite-uni.html','ciclo-ien.html','ciclo-proyecto-escolar.html','ciclo-repaso-uni.html','ciclo-paralelo-cepre-uni.html','ciclo-verano-uni.html'
  ];

  var PRE = 'https://gruponostradamus.edu.pe/preinscripcion.html';
  var LIVE = 'https://gruponostradamus.edu.pe/clases-en-vivo.html';
  var MAPA_UNI = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15609.098250165553!2d-77.04858391073591!3d-12.02460935322607!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf05f8bcc23b%3A0xa4969aade22a3db5!2sGRUPO%20NOSTRADAMUS%20UNI!5e0!3m2!1ses-419!2spe!4v1720420344476!5m2!1ses-419!2spe';

  function wa(name) {
    return 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, quiero informes sobre ' + name + '.');
  }

  function injectStyles() {
    var old = document.getElementById('nostra-ciclo-detalle-pro-style');
    if (old) old.remove();
    var style = document.createElement('style');
    style.id = 'nostra-ciclo-detalle-pro-style';
    style.textContent = `
      body.nostra-ciclo-detalle-pro .breadcumb-wrapper{padding-top:72px!important;padding-bottom:72px!important;background-position:center!important;}
      body.nostra-ciclo-detalle-pro .breadcumb-title{font-size:clamp(34px,4vw,58px)!important;font-weight:950!important;letter-spacing:-.8px!important;}
      body.nostra-ciclo-detalle-pro .course-single{border-radius:28px!important;overflow:hidden!important;border:1px solid rgba(0,137,150,.14)!important;box-shadow:0 24px 60px rgba(6,20,38,.10),0 0 32px rgba(0,194,209,.08)!important;}
      body.nostra-ciclo-detalle-pro .course-single-top{background:radial-gradient(circle at 12% 0%,rgba(0,194,209,.16),transparent 30%),linear-gradient(135deg,#f8ffff,#eefbfc)!important;padding:22px!important;}
      body.nostra-ciclo-detalle-pro .course-img,body.nostra-ciclo-detalle-pro .course-img iframe,body.nostra-ciclo-detalle-pro .course-img img{border-radius:22px!important;overflow:hidden!important;}
      body.nostra-ciclo-detalle-pro .course-img iframe{width:100%!important;aspect-ratio:16/9!important;height:auto!important;display:block!important;box-shadow:0 18px 40px rgba(6,20,38,.16)!important;}
      body.nostra-ciclo-detalle-pro .course-title{margin-top:22px!important;font-size:clamp(30px,3.3vw,48px)!important;line-height:1.06!important;font-weight:950!important;color:#061426!important;text-transform:uppercase!important;letter-spacing:-.8px!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-hero{margin-top:18px!important;padding:18px!important;border-radius:22px!important;background:linear-gradient(135deg,#061426 0%,#08263a 54%,#008b96 100%)!important;color:#fff!important;box-shadow:0 18px 42px rgba(6,20,38,.16),0 0 24px rgba(0,194,209,.16)!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-hero__eyebrow{display:inline-flex!important;align-items:center!important;gap:8px!important;padding:6px 11px!important;border-radius:999px!important;background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.14)!important;color:#a8f7ff!important;font-size:12px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.5px!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-hero__title{margin:12px 0 8px!important;color:#fff!important;font-size:clamp(20px,2vw,30px)!important;font-weight:950!important;line-height:1.15!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-hero__text{margin:0!important;color:rgba(255,255,255,.84)!important;font-size:15.5px!important;line-height:1.6!important;font-weight:600!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-tags{margin-top:14px!important;display:flex!important;flex-wrap:wrap!important;gap:9px!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-tags span{display:inline-flex!important;align-items:center!important;padding:8px 11px!important;border-radius:999px!important;background:rgba(255,255,255,.11)!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important;font-size:12.5px!important;font-weight:850!important;}
      body.nostra-ciclo-detalle-pro .course-single-bottom{padding:24px!important;}
      body.nostra-ciclo-detalle-pro .course-tab{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;padding:10px!important;border-radius:18px!important;background:linear-gradient(135deg,#061426,#082238)!important;border:1px solid rgba(0,194,209,.22)!important;}
      body.nostra-ciclo-detalle-pro .course-tab .nav-item{width:100%!important;} body.nostra-ciclo-detalle-pro .course-tab .nav-link{width:100%!important;min-height:48px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;border-radius:14px!important;color:rgba(255,255,255,.88)!important;background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.08)!important;font-weight:900!important;}
      body.nostra-ciclo-detalle-pro .course-tab .nav-link.active,body.nostra-ciclo-detalle-pro .course-tab .nav-link:hover{color:#fff!important;background:linear-gradient(135deg,#00c2d1,#008b96)!important;box-shadow:0 12px 26px rgba(0,194,209,.25)!important;}
      body.nostra-ciclo-detalle-pro .tab-content{margin-top:18px!important;padding:24px!important;border-radius:22px!important;background:linear-gradient(180deg,#ffffff,#f7fcfd)!important;border:1px solid rgba(0,137,150,.12)!important;}
      body.nostra-ciclo-detalle-pro .course-description p{color:#263648!important;font-size:16px!important;line-height:1.75!important;font-weight:560!important;text-align:justify!important;text-justify:inter-word!important;}
      body.nostra-ciclo-detalle-pro .course-description p strong{display:block!important;margin:14px 0 10px!important;padding:12px 14px!important;border-radius:13px!important;border-left:5px solid #00c2d1!important;background:linear-gradient(90deg,rgba(0,194,209,.14),#fff)!important;color:#061426!important;font-size:15px!important;font-weight:950!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-ideal{display:block!important;margin-top:10px!important;padding:13px 14px!important;border-radius:15px!important;background:#fff!important;border:1px solid rgba(0,137,150,.13)!important;color:#008b96!important;font-size:15px!important;font-weight:850!important;line-height:1.45!important;box-shadow:0 8px 18px rgba(6,20,38,.045)!important;}
      body.nostra-ciclo-detalle-pro .nostra-cycle-ideal:before{content:'🎯 ';}
      body.nostra-ciclo-detalle-pro .sidebar-area{position:sticky!important;top:96px!important;}
      .nostra-cycle-panel{position:sticky;top:105px;border-radius:28px;overflow:hidden;background:radial-gradient(circle at 12% 12%,rgba(0,229,255,.18),transparent 34%),linear-gradient(155deg,#02070d 0%,#061426 46%,#063a48 100%);border:1px solid rgba(168,247,255,.24);box-shadow:0 28px 70px rgba(0,0,0,.18),0 0 34px rgba(0,194,209,.12);color:#fff;padding:24px;}
      .nostra-cycle-panel__badge{display:inline-flex;gap:8px;padding:8px 13px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(168,247,255,.26);color:#a8f7ff;font-weight:900;font-size:13px;text-transform:uppercase;}
      .nostra-cycle-panel__title{margin:16px 0 6px;color:#fff;font-size:27px;line-height:1.05;font-weight:950;}.nostra-cycle-panel__tag{margin:0 0 18px;color:rgba(255,255,255,.78);line-height:1.45;font-weight:700;}
      .nostra-cycle-panel__btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:52px;border-radius:16px;margin-top:10px;color:#fff!important;text-decoration:none!important;font-weight:950;box-shadow:0 16px 32px rgba(0,0,0,.18);transition:.22s;}.nostra-cycle-panel__btn:hover{transform:translateY(-3px);filter:brightness(1.05);}.nostra-cycle-panel__btn--wa{background:linear-gradient(135deg,#16c763,#079b4d);}.nostra-cycle-panel__btn--pre{background:linear-gradient(135deg,#ffb539,#ff7a18);color:#061426!important;}.nostra-cycle-panel__btn--live{background:linear-gradient(135deg,#00c2d1,#1749e8);}
      .nostra-cycle-panel__trust{display:grid;gap:9px;margin:18px 0 20px;}.nostra-cycle-panel__trust span{display:flex;gap:9px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.86);font-weight:750;font-size:14px;}
      .nostra-cycle-map{margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.13);}.nostra-cycle-map h4{margin:0 0 8px;color:#fff;font-size:18px;font-weight:950;}.nostra-cycle-map p{margin:0 0 12px;color:rgba(255,255,255,.72);font-size:14px;line-height:1.45;}.nostra-cycle-map iframe{width:100%!important;height:210px!important;border:0!important;border-radius:18px;}.nostra-cycle-side-note{margin-top:13px;color:#a8f7ff;font-weight:850;font-size:13px;text-align:center;}
      .nostra-cycle-detail-nav{margin-top:18px;padding:15px;border-radius:20px;background:#fff;border:1px solid rgba(0,137,150,.12);}.nostra-cycle-detail-nav h4{margin:0 0 10px;color:#061426;font-size:16px;font-weight:950;}.nostra-cycle-detail-nav a{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 11px;margin-bottom:7px;border-radius:13px;background:#f4fbfc;color:#061426;font-size:13px;font-weight:850;text-decoration:none;border:1px solid rgba(0,137,150,.10);}.nostra-cycle-detail-nav a.active,.nostra-cycle-detail-nav a:hover{background:linear-gradient(135deg,#00c2d1,#008b96);color:#fff;}
      @media(max-width:991px){body.nostra-ciclo-detalle-pro .course-tab{grid-template-columns:1fr!important;}body.nostra-ciclo-detalle-pro .sidebar-area{position:relative!important;top:auto!important;margin-top:28px!important;}body.nostra-ciclo-detalle-pro .course-description p{text-align:left!important;}.nostra-cycle-panel{position:relative;top:auto;}}
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
    document.querySelectorAll('.breadcumb-menu li:last-child').forEach(function (li) { li.textContent = actual.titulo; });
    var desc = document.querySelector('.course-description p');
    if (desc) desc.innerHTML = actual.descripcion + '<br><br><strong>NIVEL: ' + actual.nivel + '</strong><span class="nostra-cycle-ideal">' + actual.ideal + '</span>';
  }

  function addHero() {
    var top = document.querySelector('.course-single-top');
    if (!top || top.querySelector('.nostra-cycle-hero')) return;
    var title = top.querySelector('.course-title');
    var hero = document.createElement('div');
    hero.className = 'nostra-cycle-hero';
    hero.innerHTML = '<div class="nostra-cycle-hero__eyebrow">🚀 Perfil del ciclo</div><h3 class="nostra-cycle-hero__title">' + actual.perfil + '</h3><p class="nostra-cycle-hero__text">' + actual.enfoque + '</p><div class="nostra-cycle-tags"><span>' + actual.nivel + '</span><span>' + actual.duracion + '</span><span>Modalidad presencial y virtual</span></div>';
    if (title && title.parentNode) title.parentNode.insertBefore(hero, title.nextSibling);
    else top.appendChild(hero);
  }

  function addSidebar() {
    var sidebar = document.querySelector('.sidebar-area');
    if (!sidebar) return;
    var nav = '<div class="nostra-cycle-detail-nav"><h4>Todos los ciclos</h4>' + lista.map(function (url) {
      var item = ciclos[url];
      return '<a class="' + (url === file ? 'active' : '') + '" href="' + url + '"><span>' + item.corto + '</span><span>›</span></a>';
    }).join('') + '</div>';
    sidebar.innerHTML = '<div class="nostra-cycle-panel"><span class="nostra-cycle-panel__badge">' + actual.icon + ' ' + actual.badge + '</span><h3 class="nostra-cycle-panel__title">' + actual.titulo + '</h3><p class="nostra-cycle-panel__tag">' + actual.perfil + '</p><a class="nostra-cycle-panel__btn nostra-cycle-panel__btn--wa" href="' + wa(actual.titulo) + '" target="_blank" rel="noopener noreferrer">💬 Solicitar informes</a><a class="nostra-cycle-panel__btn nostra-cycle-panel__btn--pre" href="' + PRE + '">📝 Preinscribirme ahora</a><a class="nostra-cycle-panel__btn nostra-cycle-panel__btn--live" href="' + LIVE + '">🔴 Clases en vivo</a><div class="nostra-cycle-panel__trust"><span>✅ Cupos limitados</span><span>✅ Seguimiento académico</span><span>✅ Simulacros tipo UNI</span><span>✅ Plana docente especialista</span></div><div class="nostra-cycle-map"><h4>📍 Sede UNI</h4><p>Ubícanos cerca de la Universidad Nacional de Ingeniería.</p><iframe src="' + MAPA_UNI + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><div class="nostra-cycle-side-note">Atención rápida por WhatsApp</div></div>' + nav;
  }

  function polishLists() {
    document.querySelectorAll('.checklist li').forEach(function (li) {
      li.innerHTML = li.innerHTML.replace(/comprension/g, 'comprensión').replace(/encontras/g, 'encontrarás').replace(/tambien/g, 'también').replace(/visualizacion/g, 'visualización').replace(/Tutoria/g, 'Tutoría').replace(/calificaciónes/g, 'calificaciones').replace(/Bridando/g, 'Brindando').replace(/duracion/g, 'duración').replace(/admision/g, 'admisión').replace(/Revision/g, 'Revisión').replace(/scaner/g, 'escáner').replace(/Comodos/g, 'Cómodos').replace(/aul cuenta/g, 'aula cuenta').replace(/interacccion/g, 'interacción').replace(/envian/g, 'envían');
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
  window.addEventListener('load', function () { init(); setTimeout(init, 600); setTimeout(init, 1600); setTimeout(init, 3000); });
})();