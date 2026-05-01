/* ==================================================
   Grupo Nostradamus - Pulido global de contenido
   Mejora títulos SEO, metadescripciones y textos visibles
   en subpáginas, sin afectar iq100.html.
   Incluye mejora comercial para páginas internas de ciclos.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var WHATSAPP_INSCRIPCION = 'https://wa.me/51993750351?text=Hola%20Grupo%20Nostradamus%2C%20quiero%20inscribirme%20y%20recibir%20informes%20sobre%20los%20ciclos%20acad%C3%A9micos.';

  var SEO = {
    'ciclos.html': {
      title: 'Ciclos Académicos UNI | Grupo Nostradamus',
      description: 'Conoce los ciclos académicos del Grupo Nostradamus para preparación UNI: anual, semianual, semestral, élite, repaso, verano, IEN y paralelo CEPRE UNI.'
    },
    'ciclo-anual-uni.html': {
      title: 'Ciclo Anual UNI | Grupo Nostradamus',
      description: 'Ciclo Anual UNI del Grupo Nostradamus: preparación completa desde base hasta nivel admisión, con teoría, práctica, simulacros y seguimiento académico.'
    },
    'ciclo-semianual-uni.html': {
      title: 'Ciclo Semianual UNI | Grupo Nostradamus',
      description: 'Ciclo Semianual UNI para postulantes con base previa que buscan elevar su rendimiento académico con entrenamiento intensivo y orientación a resultados.'
    },
    'ciclo-semestral-uni.html': {
      title: 'Ciclo Semestral UNI | Grupo Nostradamus',
      description: 'Preparación semestral para postulantes a la UNI con clases, práctica constante, evaluaciones y simulacros tipo admisión.'
    },
    'ciclo-elite-uni.html': {
      title: 'Ciclo Élite UNI | Alto Rendimiento | Grupo Nostradamus',
      description: 'Programa de alto rendimiento para postulantes que buscan máxima exigencia académica y competir por los primeros puestos en la UNI.'
    },
    'ciclo-ien.html': {
      title: 'Ciclo IEN UNI | Grupo Nostradamus',
      description: 'Ciclo IEN del Grupo Nostradamus para preparación especializada con enfoque académico, práctica intensiva y acompañamiento al postulante.'
    },
    'ciclo-verano-uni.html': {
      title: 'Ciclo Verano UNI | Grupo Nostradamus',
      description: 'Ciclo Verano UNI para avanzar durante vacaciones con preparación intensiva, práctica académica y orientación a la admisión.'
    },
    'ciclo-repaso-uni.html': {
      title: 'Ciclo Repaso UNI | Grupo Nostradamus',
      description: 'Ciclo de repaso UNI para reforzar temas clave, practicar preguntas tipo admisión y consolidar el rendimiento antes del examen.'
    },
    'ciclo-paralelo-cepre-uni.html': {
      title: 'Paralelo CEPRE UNI | Grupo Nostradamus',
      description: 'Preparación paralela CEPRE UNI con reforzamiento académico, práctica dirigida y acompañamiento para mejorar el rendimiento del postulante.'
    },
    'ciclo-proyecto-escolar.html': {
      title: 'Proyecto Escolar | Grupo Nostradamus',
      description: 'Programa escolar del Grupo Nostradamus para fortalecer bases académicas, hábitos de estudio y rendimiento en matemáticas y ciencias.'
    },
    'docentes.html': {
      title: 'Docentes | Grupo Nostradamus',
      description: 'Conoce al equipo docente del Grupo Nostradamus, especialistas en preparación UNI y formación académica de alto nivel.'
    },
    'cachimbos.html': {
      title: 'Cachimbos UNI | Grupo Nostradamus',
      description: 'Resultados, logros e historias de alumnos del Grupo Nostradamus que alcanzaron su ingreso a la Universidad Nacional de Ingeniería.'
    },
    'sedes.html': {
      title: 'Sede UNI | Grupo Nostradamus',
      description: 'Información de la sede del Grupo Nostradamus, ubicación, contacto y canales de atención para postulantes y familias.'
    },
    'blog.html': {
      title: 'Noticias y Consejos UNI | Grupo Nostradamus',
      description: 'Noticias, consejos académicos, orientación y contenido útil para postulantes a la UNI y estudiantes preuniversitarios.'
    },
    'contacto.html': {
      title: 'Contacto | Grupo Nostradamus',
      description: 'Comunícate con Grupo Nostradamus para recibir informes sobre ciclos académicos, horarios, matrícula y preparación UNI.'
    },
    'sobre-nosotros.html': {
      title: 'Sobre Nosotros | Grupo Nostradamus',
      description: 'Conoce la trayectoria del Grupo Nostradamus, institución especializada en preparación UNI y formación académica de postulantes.'
    },
    'politica-de-privacidad.html': {
      title: 'Política de Privacidad | Grupo Nostradamus',
      description: 'Política de privacidad del Grupo Nostradamus para el tratamiento responsable de datos personales y canales de contacto.'
    },
    'terminos-y-condiciones.html': {
      title: 'Términos y Condiciones | Grupo Nostradamus',
      description: 'Términos y condiciones de uso de los servicios, plataformas y canales digitales del Grupo Nostradamus.'
    }
  };

  var CYCLE_COPY = {
    'ciclo-anual-uni.html': {
      badge: 'Preparación completa UNI',
      title: 'Ciclo Anual UNI',
      lead: 'Ideal para estudiantes que inician desde base y quieren construir una preparación sólida, ordenada y progresiva hasta alcanzar nivel admisión UNI.',
      bullets: ['Base teórica completa', 'Práctica por niveles', 'Simulacros tipo admisión', 'Seguimiento académico']
    },
    'ciclo-semianual-uni.html': {
      badge: 'Entrenamiento intensivo',
      title: 'Ciclo Semianual UNI',
      lead: 'Pensado para postulantes con base previa que necesitan acelerar su rendimiento, reforzar puntos débiles y entrenar con exigencia tipo UNI.',
      bullets: ['Ritmo académico intensivo', 'Evaluaciones constantes', 'Reforzamiento estratégico', 'Orientación a resultados']
    },
    'ciclo-semestral-uni.html': {
      badge: 'Preparación estratégica',
      title: 'Ciclo Semestral UNI',
      lead: 'Una ruta académica equilibrada para avanzar con método, práctica constante y enfoque en los temas más importantes del examen de admisión UNI.',
      bullets: ['Plan de avance ordenado', 'Práctica dirigida', 'Control de progreso', 'Simulacros mensuales']
    },
    'ciclo-elite-uni.html': {
      badge: 'Alto rendimiento',
      title: 'Ciclo Élite UNI',
      lead: 'Programa para alumnos que buscan máxima exigencia, competencia académica y preparación de alto nivel para alcanzar los mejores resultados.',
      bullets: ['Mayor exigencia académica', 'Problemas de alto nivel', 'Competencia constante', 'Meta: primeros puestos']
    },
    'ciclo-ien.html': {
      badge: 'Preparación especializada',
      title: 'Ciclo IEN',
      lead: 'Diseñado para estudiantes que necesitan una preparación enfocada, con práctica intensiva y seguimiento para mejorar su desempeño académico.',
      bullets: ['Clases enfocadas', 'Práctica continua', 'Seguimiento académico', 'Acompañamiento docente']
    },
    'ciclo-verano-uni.html': {
      badge: 'Avance intensivo de verano',
      title: 'Ciclo Verano UNI',
      lead: 'Aprovecha las vacaciones para adelantar, reforzar bases y entrar al año académico con ventaja competitiva frente a otros postulantes.',
      bullets: ['Ritmo intensivo', 'Refuerzo de bases', 'Práctica constante', 'Preparación anticipada']
    },
    'ciclo-repaso-uni.html': {
      badge: 'Refuerzo final',
      title: 'Ciclo Repaso UNI',
      lead: 'Enfocado en consolidar conocimientos, resolver preguntas tipo admisión y llegar al examen con mayor seguridad, velocidad y precisión.',
      bullets: ['Repaso de temas clave', 'Resolución tipo examen', 'Entrenamiento de velocidad', 'Cierre de brechas']
    },
    'ciclo-paralelo-cepre-uni.html': {
      badge: 'Refuerzo CEPRE UNI',
      title: 'Paralelo CEPRE UNI',
      lead: 'Complemento académico para alumnos de CEPRE UNI que buscan reforzar temas, mejorar su rendimiento y sostener una preparación más competitiva.',
      bullets: ['Refuerzo paralelo', 'Práctica adicional', 'Seguimiento de avance', 'Mejora de rendimiento']
    },
    'ciclo-proyecto-escolar.html': {
      badge: 'Formación escolar sólida',
      title: 'Proyecto Escolar',
      lead: 'Programa para fortalecer bases académicas, hábitos de estudio y seguridad en Matemáticas, Ciencias y Aptitud Académica desde etapa escolar.',
      bullets: ['Base escolar fuerte', 'Hábitos de estudio', 'Acompañamiento', 'Preparación progresiva']
    }
  };

  function currentFileName() {
    var parts = path.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  function setMeta(name, value) {
    var meta = document.querySelector('meta[name="' + name + '"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', value);
  }

  function applySEO() {
    var file = currentFileName();
    var data = SEO[file];
    if (!data) return;

    document.title = data.title;
    setMeta('author', 'Grupo de Estudio Nostradamus');
    setMeta('description', data.description);
    setMeta('keywords', 'Grupo Nostradamus, preparación UNI, academia UNI, ciclos UNI, simulacros UNI, Universidad Nacional de Ingeniería, postulantes UNI');
  }

  function fixQ10Links() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf('gruponostradamus.q10.com/Preinscripcion') !== -1) {
        link.setAttribute('href', WHATSAPP_INSCRIPCION);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  function polishTextNodes() {
    var replacements = [
      [/GRUPO DE ESTUDIOS UNI/g, 'GRUPO DE ESTUDIO UNI'],
      [/Elite UNI/g, 'Élite UNI'],
      [/Matriculate/g, 'Matricúlate'],
      [/MATRICULATE/g, 'MATRICÚLATE'],
      [/teoria/g, 'teoría'],
      [/Teoria/g, 'Teoría'],
      [/comprension/g, 'comprensión'],
      [/Comprension/g, 'Comprensión'],
      [/tutoria/g, 'tutoría'],
      [/Tutoria/g, 'Tutoría'],
      [/encontras/g, 'encontrarás'],
      [/Encontras/g, 'Encontrarás'],
      [/calificaciónes/g, 'calificaciones'],
      [/Calificaciónes/g, 'Calificaciones'],
      [/interacccion/g, 'interacción'],
      [/Interacccion/g, 'Interacción'],
      [/Sabados/g, 'Sábados'],
      [/Sabado/g, 'Sábado'],
      [/SABADOS/g, 'SÁBADOS'],
      [/SABADO/g, 'SÁBADO'],
      [/cada aul cuenta/g, 'cada aula cuenta'],
      [/Bridando/g, 'Brindando'],
      [/visualizacion/g, 'visualización'],
      [/Visualizacion/g, 'Visualización']
    ];

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'textarea', 'input'].indexOf(tag) !== -1) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var value = node.nodeValue;
      replacements.forEach(function (pair) {
        value = value.replace(pair[0], pair[1]);
      });
      node.nodeValue = value;
    });
  }

  function improveAccountDropdown() {
    document.querySelectorAll('.dropdown-link > a.dropdown-toggle').forEach(function (link) {
      var text = (link.textContent || '').toLowerCase();
      if (text.indexOf('mi cuenta') !== -1) {
        link.innerHTML = '🔴 CLASES EN VIVO';
        link.classList.add('btn-live');
      }
    });
  }

  function injectCycleStyles() {
    if (document.getElementById('nostra-cycle-sales-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-cycle-sales-style';
    style.textContent = `
      .nostra-cycle-sales-box{
        margin:0 0 28px;
        padding:26px 26px 24px;
        border-radius:22px;
        background:
          radial-gradient(circle at top right,rgba(0,194,209,.16),transparent 36%),
          linear-gradient(135deg,#061426 0%,#02070d 48%,#083943 100%);
        border:1px solid rgba(0,194,209,.32);
        box-shadow:0 18px 44px rgba(0,0,0,.20),0 0 28px rgba(0,194,209,.18);
        color:#fff;
      }
      .nostra-cycle-badge{
        display:inline-block;
        padding:7px 14px;
        border-radius:999px;
        background:linear-gradient(90deg,rgba(0,194,209,.26),rgba(255,255,255,.10));
        border:1px solid rgba(255,255,255,.18);
        font-weight:900;
        font-size:13px;
        letter-spacing:.6px;
        text-transform:uppercase;
        color:#eaffff;
        margin-bottom:12px;
      }
      .nostra-cycle-sales-box h2{
        color:#ffffff !important;
        font-size:clamp(28px,3vw,44px);
        line-height:1.05;
        margin-bottom:12px;
        font-style:italic;
        text-transform:uppercase;
        text-shadow:0 3px 10px rgba(0,0,0,.58),0 0 16px rgba(0,194,209,.24);
      }
      .nostra-cycle-sales-box p{
        color:rgba(255,255,255,.88) !important;
        font-size:17px;
        line-height:1.65;
        margin-bottom:18px;
      }
      .nostra-cycle-points{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px 14px;
        margin:18px 0 22px;
        padding:0;
        list-style:none;
      }
      .nostra-cycle-points li{
        color:#ffffff;
        font-weight:800;
        background:rgba(255,255,255,.07);
        border:1px solid rgba(255,255,255,.12);
        border-radius:12px;
        padding:10px 12px;
      }
      .nostra-cycle-points li::before{
        content:'✓';
        color:#00e5f2;
        margin-right:8px;
        font-weight:900;
      }
      .nostra-cycle-actions{
        display:flex;
        flex-wrap:wrap;
        gap:12px;
        align-items:center;
      }
      .nostra-cycle-mini{
        color:rgba(255,255,255,.78);
        font-weight:700;
        font-size:14px;
      }
      .sidebar-area .widget_info{
        border-radius:22px !important;
        border:1px solid rgba(0,194,209,.22) !important;
        box-shadow:0 18px 38px rgba(0,0,0,.16),0 0 22px rgba(0,194,209,.10) !important;
      }
      @media(max-width:767px){
        .nostra-cycle-sales-box{padding:22px 18px;}
        .nostra-cycle-points{grid-template-columns:1fr;}
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceCyclePage() {
    var file = currentFileName();
    var copy = CYCLE_COPY[file];
    if (!copy || document.querySelector('.nostra-cycle-sales-box')) return;

    injectCycleStyles();

    var courseTop = document.querySelector('.course-single-top');
    if (!courseTop) return;

    var box = document.createElement('div');
    box.className = 'nostra-cycle-sales-box';
    box.innerHTML = `
      <span class="nostra-cycle-badge">${copy.badge}</span>
      <h2>${copy.title}</h2>
      <p>${copy.lead}</p>
      <ul class="nostra-cycle-points">
        ${copy.bullets.map(function (item) { return '<li>' + item + '</li>'; }).join('')}
      </ul>
      <div class="nostra-cycle-actions">
        <a href="${WHATSAPP_INSCRIPCION}" target="_blank" rel="noopener noreferrer" class="th-btn style3">📲 Solicitar informes</a>
        <span class="nostra-cycle-mini">Cupos limitados · Atención por WhatsApp</span>
      </div>
    `;

    var title = courseTop.querySelector('.course-title');
    if (title) {
      title.insertAdjacentElement('afterend', box);
    } else {
      courseTop.appendChild(box);
    }

    document.querySelectorAll('.widget_info .th-btn').forEach(function (btn) {
      var text = (btn.textContent || '').toLowerCase();
      if (text.indexOf('matric') !== -1) {
        btn.textContent = '📲 Solicitar informes';
        btn.setAttribute('href', WHATSAPP_INSCRIPCION);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
        btn.classList.add('style3');
      }
    });
  }

  function init() {
    applySEO();
    fixQ10Links();
    polishTextNodes();
    improveAccountDropdown();
    enhanceCyclePage();
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
