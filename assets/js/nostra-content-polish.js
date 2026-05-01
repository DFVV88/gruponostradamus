/* ==================================================
   Grupo Nostradamus - Pulido global de contenido
   Mejora títulos SEO, metadescripciones y textos visibles
   en subpáginas, sin afectar iq100.html.
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
      [/aula cuenta/g, 'aula cuenta'],
      [/cada aul cuenta/g, 'cada aula cuenta'],
      [/Bridando/g, 'Brindando'],
      [/brindando/g, 'brindando'],
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

  function init() {
    applySEO();
    fixQ10Links();
    polishTextNodes();
    improveAccountDropdown();
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
