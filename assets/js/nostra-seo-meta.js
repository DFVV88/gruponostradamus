/* ==================================================
   Grupo Nostradamus - SEO Meta Manager
   Actualiza title, description, canonical y Open Graph por página.
================================================== */
(function () {
  var base = 'https://gruponostradamus.edu.pe/';
  var path = location.pathname.split('/').pop() || 'index.html';

  var metas = {
    'index.html': {
      title: 'Grupo Nostradamus | Grupo de estudio preuniversitario para la UNI',
      description: 'Grupo Nostradamus: preparación para la UNI con ciclos académicos, simulacros tipo admisión, docentes especializados y seguimiento académico para futuros ingenieros.'
    },
    'grupo-de-estudio-preuniversitario.html': {
      title: 'Grupo de estudio preuniversitario para la UNI | Grupo Nostradamus',
      description: 'Conoce Grupo Nostradamus, grupo de estudio preuniversitario especializado en preparación UNI con método, práctica, simulacros y acompañamiento académico.'
    },
    'academia-preuniversitaria-uni.html': {
      title: 'Alternativa a academia preuniversitaria UNI | Grupo Nostradamus',
      description: 'Prepárate para la UNI con una alternativa enfocada a la academia preuniversitaria tradicional: grupos de estudio, seguimiento, simulacros y entrenamiento académico.'
    },
    'ingresa-uni.html': {
      title: 'Ingresa a la UNI con método y preparación constante | Grupo Nostradamus',
      description: 'Descubre una ruta de preparación para ingresar a la UNI con teoría, práctica intensiva, simulacros tipo admisión y acompañamiento académico.'
    },
    'ciclos.html': {
      title: 'Ciclos de preparación UNI | Grupo Nostradamus',
      description: 'Explora los ciclos académicos de Grupo Nostradamus para la preparación UNI: anual, semianual, semestral, repaso, verano, IEN y paralelo CEPRE UNI.'
    },
    'ciclo-anual-uni.html': {
      title: 'Ciclo Anual UNI | Preparación completa desde cero',
      description: 'Ciclo Anual UNI de Grupo Nostradamus: preparación completa, base académica, práctica constante, simulacros y seguimiento para postulantes UNI.'
    },
    'ciclo-semianual-uni.html': {
      title: 'Ciclo Semianual UNI | Preparación intensiva UNI',
      description: 'Ciclo Semianual UNI para postulantes con base previa que buscan elevar su rendimiento con práctica, simulacros y acompañamiento académico.'
    },
    'ciclo-semestral-uni.html': {
      title: 'Ciclo Semestral UNI | Preparación estratégica para la UNI',
      description: 'Ciclo Semestral UNI con entrenamiento académico, práctica constante y enfoque en admisión para postulantes a la Universidad Nacional de Ingeniería.'
    },
    'ciclo-elite-uni.html': {
      title: 'Ciclo Élite UNI | Alto rendimiento para postulantes UNI',
      description: 'Ciclo Élite UNI para estudiantes que buscan entrenamiento avanzado, mayor exigencia, simulacros y estrategia de examen de admisión.'
    },
    'ciclo-ien.html': {
      title: 'Ciclo IEN UNI | Preparación especializada UNI',
      description: 'Ciclo IEN de Grupo Nostradamus: preparación académica con enfoque en práctica, seguimiento y avance progresivo para postulantes UNI.'
    },
    'ciclo-proyecto-escolar.html': {
      title: 'Proyecto Escolar | Refuerzo académico escolar',
      description: 'Proyecto Escolar de Grupo Nostradamus: formación y refuerzo académico para estudiantes escolares con método, práctica y acompañamiento.'
    },
    'ciclo-repaso-uni.html': {
      title: 'Ciclo Repaso UNI | Entrenamiento final para admisión',
      description: 'Ciclo Repaso UNI para reforzar temas clave, resolver problemas tipo admisión, entrenar velocidad y prepararse para el examen UNI.'
    },
    'ciclo-paralelo-cepre-uni.html': {
      title: 'Ciclo Paralelo CEPRE UNI | Refuerzo para CEPRE UNI',
      description: 'Ciclo Paralelo CEPRE UNI para reforzar cursos, practicar problemas, mejorar rendimiento y acompañar la preparación del postulante.'
    },
    'ciclo-verano-uni.html': {
      title: 'Ciclo Verano UNI | Preparación intensiva de verano',
      description: 'Ciclo Verano UNI de Grupo Nostradamus: aprovecha las vacaciones con preparación intensiva, práctica académica y orientación para postulantes.'
    },
    'clases-en-vivo.html': {
      title: 'Clases en vivo | Grupo Nostradamus',
      description: 'Accede a las clases en vivo del Grupo Nostradamus y sigue tu preparación académica desde la plataforma indicada por la institución.'
    },
    'docentes.html': {
      title: 'Docentes especializados en preparación UNI | Grupo Nostradamus',
      description: 'Conoce la plana docente de Grupo Nostradamus: profesores especializados en preparación UNI, Matemática, Ciencias, Aptitud Académica y Humanidades.'
    },
    'cachimbos.html': {
      title: 'Cachimbos UNI | Ingresantes Grupo Nostradamus',
      description: 'Conoce los logros e ingresantes del Grupo Nostradamus. Historias de cachimbos UNI que reflejan esfuerzo, método y preparación constante.'
    },
    'sedes.html': {
      title: 'Sede Grupo Nostradamus | Preparación UNI en Lima Norte',
      description: 'Encuentra la sede del Grupo Nostradamus para preparación UNI. Ubicación, contacto, mapa y orientación para postulantes y familias.'
    },
    'contacto.html': {
      title: 'Contacto Grupo Nostradamus | Informes y matrícula',
      description: 'Comunícate con Grupo Nostradamus para informes, matrícula, ciclos académicos, horarios y orientación para la preparación UNI.'
    },
    'blog.html': {
      title: 'Blog UNI | Consejos para postulantes UNI | Grupo Nostradamus',
      description: 'Lee guías, noticias y consejos para postulantes UNI: preparación, simulacros, ciclos, errores comunes y estrategias de estudio.'
    },
    'blog1.html': {
      title: 'Cómo saber si estás listo para postular a la UNI | Grupo Nostradamus',
      description: 'Aprende a identificar si ya estás listo para postular a la UNI: simulacros, base académica, velocidad, estrategia y señales de preparación real.'
    },
    'blog2.html': {
      title: 'Qué ciclo UNI elegir según tu nivel actual | Grupo Nostradamus',
      description: 'Guía para elegir el ciclo UNI ideal según tu nivel: desde cero, base intermedia, práctica intensiva, repaso final o preparación estratégica.'
    },
    'blog3.html': {
      title: 'Cómo dejar de estancarte en Matemática, Física y Química | UNI',
      description: 'Descubre por qué te estancas en Matemática, Física o Química durante tu preparación UNI y cómo mejorar con método, práctica y simulacros.'
    },
    'prepararse-para-la-uni-desde-cero.html': {
      title: 'Cómo prepararse para la UNI desde cero | Grupo Nostradamus',
      description: 'Guía para prepararse para la UNI desde cero: base académica, rutina de estudio, práctica progresiva, simulacros y orientación para postulantes.'
    },
    'cuantas-horas-estudiar-para-ingresar-uni.html': {
      title: 'Cuántas horas estudiar para ingresar a la UNI | Grupo Nostradamus',
      description: 'Conoce cuántas horas debe estudiar un postulante UNI y cómo organizar una rutina efectiva con práctica, simulacros y seguimiento académico.'
    },
    'errores-comunes-postulantes-uni.html': {
      title: 'Errores comunes de postulantes UNI | Grupo Nostradamus',
      description: 'Identifica los errores más comunes que frenan a los postulantes UNI y aprende cómo corregirlos con método, práctica y acompañamiento.'
    },
    'simulacros-uni-por-que-son-importantes.html': {
      title: 'Simulacros UNI: por qué son importantes | Grupo Nostradamus',
      description: 'Descubre por qué los simulacros tipo UNI son clave para medir avance, entrenar velocidad, corregir errores y prepararse para admisión.'
    },
    'como-elegir-grupo-de-estudio-preuniversitario-uni.html': {
      title: 'Cómo elegir un grupo de estudio preuniversitario UNI',
      description: 'Aprende qué revisar antes de elegir un grupo de estudio preuniversitario para la UNI: método, docentes, simulacros, seguimiento y resultados.'
    },
    'diferencia-academia-preuniversitaria-y-grupo-de-estudio.html': {
      title: 'Diferencia entre academia preuniversitaria y grupo de estudio',
      description: 'Conoce la diferencia entre una academia preuniversitaria y un grupo de estudio, y qué opción puede convenir más para preparar la UNI.'
    },
    'iq100.html': {
      title: 'IQ100 San Marcos | Preparación para la UNMSM',
      description: 'IQ100 es la marca del Grupo Nostradamus especializada en preparación para San Marcos: ciclos, planes, práctica, simulacros y acompañamiento académico.'
    },
    'sobre-nosotros.html': {
      title: 'Sobre nosotros | Grupo Nostradamus',
      description: 'Conoce la historia, trayectoria y propuesta académica del Grupo Nostradamus, institución especializada en preparación preuniversitaria.'
    },
    'politica-de-privacidad.html': {
      title: 'Política de privacidad | Grupo Nostradamus',
      description: 'Consulta la política de privacidad del Grupo Nostradamus y el tratamiento de datos personales de estudiantes, padres y visitantes.'
    },
    'terminos-y-condiciones.html': {
      title: 'Términos y condiciones | Grupo Nostradamus',
      description: 'Consulta los términos y condiciones de uso de los servicios, plataformas y contenidos del Grupo Nostradamus.'
    }
  };

  var data = metas[path] || metas['index.html'];
  var canonicalUrl = base + (path === 'index.html' ? '' : path);

  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setProperty(property, content) {
    var el = document.querySelector('meta[property="' + property + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setCanonical(url) {
    var el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  document.title = data.title;
  setMeta('description', data.description);
  setMeta('robots', 'INDEX,FOLLOW');
  setCanonical(canonicalUrl);

  setProperty('og:type', 'website');
  setProperty('og:site_name', 'Grupo Nostradamus');
  setProperty('og:title', data.title);
  setProperty('og:description', data.description);
  setProperty('og:url', canonicalUrl);
  setProperty('og:image', base + 'assets/img/logo.png');

  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', data.title);
  setMeta('twitter:description', data.description);
  setMeta('twitter:image', base + 'assets/img/logo.png');
})();
