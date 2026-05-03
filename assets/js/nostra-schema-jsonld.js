/* ==================================================
   Grupo Nostradamus - Schema JSON-LD
   Agrega datos estructurados para SEO sin alterar el diseño.
================================================== */
(function () {
  var base = 'https://gruponostradamus.edu.pe/';
  var path = location.pathname.split('/').pop() || 'index.html';
  var currentUrl = base + (path === 'index.html' ? '' : path);

  function addSchema(id, data) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  }

  var organization = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': base + '#organization',
    name: 'Grupo Nostradamus',
    alternateName: 'Grupo de Estudio Nostradamus',
    url: base,
    logo: base + 'assets/img/logo.png',
    image: base + 'assets/img/logo.png',
    description: 'Grupo de estudio preuniversitario especializado en preparación para la Universidad Nacional de Ingeniería, con ciclos académicos, simulacros tipo admisión y seguimiento académico.',
    telephone: '+51 993 750 351',
    email: 'informes@gruponostradamus.edu.pe',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Gerardo Unger 193',
      addressLocality: 'San Martín de Porres',
      addressRegion: 'Lima',
      addressCountry: 'PE'
    },
    areaServed: [
      { '@type': 'Country', name: 'Perú' },
      { '@type': 'City', name: 'Lima' }
    ],
    sameAs: [
      'https://www.facebook.com/gruponostradamus',
      'https://www.instagram.com/gruponostradamus/',
      'https://www.tiktok.com/@grupo_nostradamus',
      'https://www.youtube.com/@GrupoNostradamus'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+51 993 750 351',
      contactType: 'Admisiones e informes',
      areaServed: 'PE',
      availableLanguage: ['Spanish']
    }
  };

  var website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': base + '#website',
    url: base,
    name: 'Grupo Nostradamus',
    publisher: { '@id': base + '#organization' },
    inLanguage: 'es-PE',
    potentialAction: {
      '@type': 'SearchAction',
      target: base + 'blog.html?s={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  var webpageNames = {
    'index.html': 'Grupo Nostradamus | Grupo de estudio preuniversitario para la UNI',
    'ciclos.html': 'Ciclos de preparación UNI | Grupo Nostradamus',
    'grupo-de-estudio-preuniversitario.html': 'Grupo de estudio preuniversitario para la UNI',
    'academia-preuniversitaria-uni.html': 'Alternativa a academia preuniversitaria UNI',
    'ingresa-uni.html': 'Ingresa a la UNI con método y preparación constante',
    'sedes.html': 'Sede Grupo Nostradamus',
    'docentes.html': 'Docentes especializados en preparación UNI',
    'cachimbos.html': 'Cachimbos UNI e ingresantes Grupo Nostradamus',
    'blog.html': 'Blog UNI | Consejos para postulantes UNI',
    'iq100.html': 'IQ100 San Marcos | Preparación para la UNMSM'
  };

  var webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': currentUrl + '#webpage',
    url: currentUrl,
    name: webpageNames[path] || document.title || 'Grupo Nostradamus',
    isPartOf: { '@id': base + '#website' },
    about: { '@id': base + '#organization' },
    inLanguage: 'es-PE'
  };

  var courses = {
    'ciclo-anual-uni.html': 'Ciclo Anual UNI',
    'ciclo-semianual-uni.html': 'Ciclo Semianual UNI',
    'ciclo-semestral-uni.html': 'Ciclo Semestral UNI',
    'ciclo-elite-uni.html': 'Ciclo Élite UNI',
    'ciclo-ien.html': 'Ciclo IEN UNI',
    'ciclo-proyecto-escolar.html': 'Proyecto Escolar',
    'ciclo-repaso-uni.html': 'Ciclo Repaso UNI',
    'ciclo-paralelo-cepre-uni.html': 'Ciclo Paralelo CEPRE UNI',
    'ciclo-verano-uni.html': 'Ciclo Verano UNI'
  };

  var articles = {
    'blog1.html': 'Cómo saber si estás listo para postular a la UNI',
    'blog2.html': 'Qué ciclo UNI elegir según tu nivel actual',
    'blog3.html': 'Cómo dejar de estancarte en Matemática, Física y Química',
    'prepararse-para-la-uni-desde-cero.html': 'Cómo prepararse para la UNI desde cero',
    'cuantas-horas-estudiar-para-ingresar-uni.html': 'Cuántas horas estudiar para ingresar a la UNI',
    'errores-comunes-postulantes-uni.html': 'Errores comunes de postulantes UNI',
    'simulacros-uni-por-que-son-importantes.html': 'Simulacros UNI: por qué son importantes',
    'como-elegir-grupo-de-estudio-preuniversitario-uni.html': 'Cómo elegir un grupo de estudio preuniversitario UNI',
    'diferencia-academia-preuniversitaria-y-grupo-de-estudio.html': 'Diferencia entre academia preuniversitaria y grupo de estudio'
  };

  addSchema('nostra-schema-organization', organization);
  addSchema('nostra-schema-website', website);
  addSchema('nostra-schema-webpage', webpage);

  if (courses[path]) {
    addSchema('nostra-schema-course', {
      '@context': 'https://schema.org',
      '@type': 'Course',
      '@id': currentUrl + '#course',
      name: courses[path],
      description: 'Programa académico de preparación preuniversitaria del Grupo Nostradamus orientado a postulantes UNI, con teoría, práctica, simulacros y seguimiento académico.',
      provider: { '@id': base + '#organization' },
      educationalLevel: 'Preuniversitario',
      inLanguage: 'es-PE',
      url: currentUrl
    });
  }

  if (articles[path]) {
    addSchema('nostra-schema-article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': currentUrl + '#article',
      headline: articles[path],
      url: currentUrl,
      image: base + 'assets/img/logo.png',
      author: { '@id': base + '#organization' },
      publisher: { '@id': base + '#organization' },
      mainEntityOfPage: { '@id': currentUrl + '#webpage' },
      inLanguage: 'es-PE',
      dateModified: '2026-05-03'
    });
  }

  if (path === 'sedes.html' || path === 'contacto.html' || path === 'index.html') {
    addSchema('nostra-schema-localbusiness-extra', {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': base + '#localbusiness',
      name: 'Grupo Nostradamus',
      image: base + 'assets/img/logo.png',
      url: base,
      telephone: '+51 993 750 351',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Gerardo Unger 193',
        addressLocality: 'San Martín de Porres',
        addressRegion: 'Lima',
        addressCountry: 'PE'
      },
      priceRange: 'S/',
      parentOrganization: { '@id': base + '#organization' }
    });
  }
})();
