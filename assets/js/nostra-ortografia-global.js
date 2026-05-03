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
    ['CLASES EN VIVO', 'CLASES EN VIVO'],
    ['Examen de Admisión', 'Examen de admisión'],
    ['Conoces las Modalidades para ingresar a la UNI', 'Conoce las modalidades para ingresar a la UNI'],
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

  function corregirTodo() {
    recorrer(document.body);
    corregirAtributos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', corregirTodo);
  } else {
    corregirTodo();
  }
})();
