/* ==================================================
   Grupo Nostradamus - Corrección ortográfica global
   Corrige textos visibles sin alterar estructura ni enlaces.
================================================== */
(function () {
  var correcciones = new Map([
    ['Noticias Academicas', 'Noticias Académicas'],
    ['Noticias academicas', 'Noticias académicas'],
    ['Explora Nuestro Mundo Academico', 'Explora nuestro mundo académico'],
    ['Explora Nuestros Ciclos Académicos', 'Explora nuestros ciclos académicos'],
    ['Enlaces Rapidos', 'Enlaces rápidos'],
    ['Enlaces rapidos', 'Enlaces rápidos'],
    ['Matricúlate ahora!', '¡Matricúlate ahora!'],
    ['MATRICÚLATE AHORA', '¡MATRICÚLATE AHORA!'],
    ['MATRICULATE', 'MATRICÚLATE'],
    ['Matriculate', 'Matricúlate'],
    ['Clases en Vivo', 'Clases en vivo'],
    ['Examen de Admisión', 'Examen de admisión'],
    ['Conoces las Modalidades para ingresar a la UNI', 'Conoce las modalidades para ingresar a la UNI'],
    ['Guía para la Elección de Carreras', 'Guía para la elección de carreras'],
    ['Orientación Vocacional para Estudiantes', 'Orientación vocacional para estudiantes'],
    ['Academicas', 'Académicas'],
    ['Academicos', 'Académicos'],
    ['Academico', 'Académico'],
    ['academicas', 'académicas'],
    ['academicos', 'académicos'],
    ['academico', 'académico'],
    ['Rapidos', 'Rápidos'],
    ['rapidos', 'rápidos'],
    ['Nuestras Redes', 'Nuestras redes'],
    ['Siguenos', 'Síguenos'],
    ['Sigenos', 'Síguenos'],
    ['Direccion', 'Dirección'],
    ['direccion', 'dirección'],
    ['Informacion', 'Información'],
    ['informacion', 'información'],
    ['Preparacion', 'Preparación'],
    ['preparacion', 'preparación'],
    ['admision', 'admisión'],
    ['Admision', 'Admisión'],
    ['Matematica', 'Matemática'],
    ['matematica', 'matemática'],
    ['Fisica', 'Física'],
    ['fisica', 'física'],
    ['Quimica', 'Química'],
    ['quimica', 'química'],
    ['Tecnologia', 'Tecnología'],
    ['tecnologia', 'tecnología'],
    ['metodologia', 'metodología'],
    ['Metodologia', 'Metodología'],
    ['orientacion', 'orientación'],
    ['Orientacion', 'Orientación'],
    ['evaluacion', 'evaluación'],
    ['Evaluacion', 'Evaluación'],
    ['inscripcion', 'inscripción'],
    ['Inscripcion', 'Inscripción'],
    ['Acompanamiento', 'Acompañamiento'],
    ['acompanamiento', 'acompañamiento'],
    ['Exito', 'Éxito'],
    ['exito', 'éxito'],
    ['Practica', 'Práctica'],
    ['practica', 'práctica'],
    ['Practicas', 'Prácticas'],
    ['practicas', 'prácticas'],
    ['Teoria', 'Teoría'],
    ['teoria', 'teoría'],
    ['Basico', 'Básico'],
    ['basico', 'básico'],
    ['Avanzado', 'Avanzado'],
    ['Av.Gerardo', 'Av. Gerardo'],
    ['Av.Gerardo Unger', 'Av. Gerardo Unger'],
    ['Gerardo Unger\n                                    193', 'Gerardo Unger 193'],
    ['Preparando a los futuros ingenieros del Perú', 'Preparando a los futuros ingenieros del Perú.'],
    ['Resultados que respaldan', 'Resultados que nos respaldan'],
    ['Seguimiento academico', 'Seguimiento académico'],
    ['Egresados Satisfechos', 'Egresados satisfechos'],
    ['Clases Completadas', 'Clases completadas'],
    ['Satisfacción Porcentual', 'Satisfacción estudiantil'],
    ['Estudiantes Satisfechos', 'Estudiantes satisfechos'],
    ['QUIERO INGRESAR', 'QUIERO INGRESAR'],
    ['VER TODOS', 'VER TODO'],
    ['Leer Más', 'Leer más'],
    ['LEER MÁS', 'LEER MÁS'],
    ['Ver Mapa', 'Ver mapa'],
    ['Ver mapa', 'Ver mapa'],
    ['anos', 'años'],
    ['Anos', 'Años']
  ]);

  function corregirTexto(texto) {
    var nuevo = texto;
    correcciones.forEach(function (correcto, incorrecto) {
      nuevo = nuevo.split(incorrecto).join(correcto);
    });
    return nuevo;
  }

  function recorrer(nodo) {
    if (!nodo) return;
    if (nodo.nodeType === Node.TEXT_NODE) {
      var original = nodo.nodeValue;
      var corregido = corregirTexto(original);
      if (original !== corregido) nodo.nodeValue = corregido;
      return;
    }

    if (nodo.nodeType !== Node.ELEMENT_NODE) return;
    var tag = nodo.tagName;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'PATH'].indexOf(tag) !== -1) return;

    Array.prototype.forEach.call(nodo.childNodes, recorrer);
  }

  function corregirAtributos() {
    document.querySelectorAll('[alt], [title], [placeholder], [aria-label]').forEach(function (el) {
      ['alt', 'title', 'placeholder', 'aria-label'].forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var original = el.getAttribute(attr);
        var corregido = corregirTexto(original);
        if (original !== corregido) el.setAttribute(attr, corregido);
      });
    });
  }

  function corregirSedesBlogs() {
    if (!location.pathname.toLowerCase().includes('sedes.html')) return;
    var nuevos = {
      'blog1.html': 'Cómo saber si ya estás listo para postular a la UNI',
      'blog2.html': 'Qué ciclo UNI elegir según tu nivel actual',
      'blog3.html': 'Cómo dejar de estancarte en Matemática, Física y Química'
    };
    Object.keys(nuevos).forEach(function (url) {
      document.querySelectorAll('#blog-sec .box-title a[href="' + url + '"]').forEach(function (a) {
        a.textContent = nuevos[url];
      });
    });
  }

  function mejorarIndex() {
    if (!/index\.html$|\/$/.test(location.pathname)) return;
    document.querySelectorAll('.counter-card_text').forEach(function (el) {
      el.innerHTML = el.innerHTML
        .replace('<strong>Egresados</strong> Satisfechos', '<strong>Egresados</strong> satisfechos')
        .replace('<strong>Clases</strong> Completadas', '<strong>Clases</strong> completadas')
        .replace('<strong>Satisfacción</strong> Porcentual', '<strong>Satisfacción</strong> estudiantil')
        .replace('<strong>Estudiantes</strong> Satisfechos', '<strong>Estudiantes</strong> satisfechos');
    });
  }

  function corregirTodo() {
    recorrer(document.body);
    corregirAtributos();
    corregirSedesBlogs();
    mejorarIndex();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', corregirTodo);
  } else {
    corregirTodo();
  }
})();
