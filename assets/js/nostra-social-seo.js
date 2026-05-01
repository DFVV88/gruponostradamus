/* ==================================================
   Grupo Nostradamus - Social SEO PRO
   Agrega metadatos Open Graph, Twitter Cards y datos estructurados.
   No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var BASE = 'https://gruponostradamus.edu.pe';
  var file = path.split('/').pop() || 'index.html';
  var canonical = BASE + (file === 'index.html' ? '/' : '/' + file);

  var DEFAULT = {
    title: 'Grupo Nostradamus | Preparación UNI',
    description: 'Grupo de Estudio Nostradamus: preparación UNI con método, tecnología, simulacros tipo admisión y acompañamiento académico para futuros ingenieros.',
    image: BASE + '/assets/img/slider/slider-1.jpg'
  };

  var DATA = {
    'index.html': DEFAULT,
    '': DEFAULT,
    'ciclos.html': {
      title: 'Ciclos Académicos UNI | Grupo Nostradamus',
      description: 'Conoce nuestros ciclos de preparación UNI: anual, semianual, semestral, élite, repaso, verano, IEN y paralelo CEPRE UNI.',
      image: BASE + '/assets/img/ciclos/ciclo-anual.jpg'
    },
    'ciclo-anual-uni.html': {
      title: 'Ciclo Anual UNI | Grupo Nostradamus',
      description: 'Preparación completa desde base hasta nivel admisión UNI, con teoría, práctica intensiva, simulacros y seguimiento académico.',
      image: BASE + '/assets/img/ciclos/ciclo-anual.jpg'
    },
    'ciclo-semianual-uni.html': {
      title: 'Ciclo Semianual UNI | Grupo Nostradamus',
      description: 'Entrenamiento intensivo para postulantes con base previa que quieren elevar su rendimiento hacia la UNI.',
      image: BASE + '/assets/img/ciclos/ciclo-semianual.jpg'
    },
    'ciclo-semestral-uni.html': {
      title: 'Ciclo Semestral UNI | Grupo Nostradamus',
      description: 'Preparación estratégica para avanzar con práctica constante, evaluaciones y enfoque en admisión UNI.',
      image: BASE + '/assets/img/ciclos/ciclo-semestral.jpg'
    },
    'ciclo-elite-uni.html': {
      title: 'Ciclo Élite UNI | Alto Rendimiento',
      description: 'Programa de alta exigencia para postulantes que buscan competir por los primeros puestos en la UNI.',
      image: BASE + '/assets/img/ciclos/ciclo-elite.jpg'
    },
    'ciclo-ien.html': {
      title: 'Ciclo IEN UNI | Grupo Nostradamus',
      description: 'Preparación especializada con práctica intensiva, acompañamiento docente y seguimiento académico.',
      image: BASE + '/assets/img/logo.png'
    },
    'ciclo-verano-uni.html': {
      title: 'Ciclo Verano UNI | Grupo Nostradamus',
      description: 'Avanza durante vacaciones con preparación intensiva, refuerzo de bases y práctica académica.',
      image: BASE + '/assets/img/ciclos/ciclo-verano.jpg'
    },
    'ciclo-repaso-uni.html': {
      title: 'Ciclo Repaso UNI | Grupo Nostradamus',
      description: 'Refuerza temas clave, practica preguntas tipo admisión y consolida tu rendimiento antes del examen.',
      image: BASE + '/assets/img/ciclos/ciclo-repaso.jpg'
    },
    'ciclo-paralelo-cepre-uni.html': {
      title: 'Paralelo CEPRE UNI | Grupo Nostradamus',
      description: 'Refuerzo paralelo para alumnos de CEPRE UNI que buscan mejorar rendimiento y sostener una preparación competitiva.',
      image: BASE + '/assets/img/logo.png'
    },
    'ciclo-proyecto-escolar.html': {
      title: 'Proyecto Escolar | Grupo Nostradamus',
      description: 'Fortalece bases académicas, hábitos de estudio y rendimiento en Matemáticas, Ciencias y Aptitud Académica.',
      image: BASE + '/assets/img/logo.png'
    },
    'docentes.html': {
      title: 'Docentes | Grupo Nostradamus',
      description: 'Conoce a nuestra plana docente especializada en preparación UNI y formación académica de alto nivel.',
      image: BASE + '/assets/img/logo.png'
    },
    'cachimbos.html': {
      title: 'Cachimbos UNI | Grupo Nostradamus',
      description: 'Historias y resultados de alumnos que alcanzaron su ingreso a la Universidad Nacional de Ingeniería.',
      image: BASE + '/assets/img/logo.png'
    },
    'sedes.html': {
      title: 'Sede | Grupo Nostradamus',
      description: 'Ubicación, contacto y canales de atención del Grupo Nostradamus para postulantes y familias.',
      image: BASE + '/assets/img/logo.png'
    },
    'blog.html': {
      title: 'Noticias y Consejos UNI | Grupo Nostradamus',
      description: 'Contenido útil, orientación académica y novedades para postulantes a la UNI.',
      image: BASE + '/assets/img/logo.png'
    },
    'sobre-nosotros.html': {
      title: 'Sobre Nosotros | Grupo Nostradamus',
      description: 'Conoce nuestra trayectoria, método académico y compromiso con la preparación de postulantes UNI.',
      image: BASE + '/assets/img/logo.png'
    },
    'contacto.html': {
      title: 'Contacto | Grupo Nostradamus',
      description: 'Solicita informes sobre ciclos, horarios, matrícula y preparación UNI en Grupo Nostradamus.',
      image: BASE + '/assets/img/logo.png'
    }
  };

  var page = DATA[file] || DEFAULT;

  function setMeta(selector, attrName, attrValue, content) {
    var meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attrName, attrValue);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  function setLink(rel, href) {
    var link = document.querySelector('link[rel="' + rel + '"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  function applySocialMeta() {
    setLink('canonical', canonical);

    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'es_PE');
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Grupo Nostradamus');
    setMeta('meta[property="og:title"]', 'property', 'og:title', page.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', page.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:image"]', 'property', 'og:image', page.image);
    setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', page.image);
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', page.title);

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', page.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', page.image);
  }

  function applyStructuredData() {
    if (document.getElementById('nostra-structured-data')) return;

    var data = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Grupo de Estudio Nostradamus',
      alternateName: 'Grupo Nostradamus',
      url: BASE + '/',
      logo: BASE + '/assets/img/logo.png',
      image: page.image,
      description: DEFAULT.description,
      telephone: '+51 993 750 351',
      email: 'informes@gruponostradamus.edu.pe',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Gerardo Unger 193',
        addressLocality: 'San Martín de Porres',
        addressRegion: 'Lima',
        addressCountry: 'PE'
      },
      sameAs: [
        'https://www.facebook.com/gruponostradamus',
        'https://www.instagram.com/gruponostradamus/',
        'https://www.tiktok.com/@grupo_nostradamus',
        'https://www.youtube.com/@GrupoNostradamus'
      ]
    };

    var script = document.createElement('script');
    script.id = 'nostra-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function init() {
    applySocialMeta();
    applyStructuredData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
