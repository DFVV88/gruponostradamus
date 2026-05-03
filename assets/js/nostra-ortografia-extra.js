/* ==================================================
   Grupo Nostradamus - Corrección extra para docentes, cachimbos y blog
================================================== */
(function () {
  function replaceText(text) {
    var pairs = [
      ['Docentes Especializados', 'Docentes especializados'],
      ['Nuestros Docentes', 'Nuestros docentes'],
      ['Plana Docente', 'Plana docente'],
      ['Conoce a Nuestros Docentes', 'Conoce a nuestros docentes'],
      ['Profesores Especialistas', 'Profesores especialistas'],
      ['Equipo Academico', 'Equipo académico'],
      ['Equipo Académico', 'Equipo académico'],
      ['Experiencia Academica', 'Experiencia académica'],
      ['Experiencia Académica', 'Experiencia académica'],
      ['Asesoria', 'Asesoría'],
      ['asesoria', 'asesoría'],
      ['Tutorias', 'Tutorías'],
      ['tutorias', 'tutorías'],
      ['Tutoría Academica', 'Tutoría académica'],
      ['tutoría academica', 'tutoría académica'],
      ['Cachimbos UNI', 'Cachimbos UNI'],
      ['Nuestros Cachimbos', 'Nuestros cachimbos'],
      ['Historias de Exito', 'Historias de éxito'],
      ['Historias de Éxito', 'Historias de éxito'],
      ['Ingresantes Destacados', 'Ingresantes destacados'],
      ['Logros Academicos', 'Logros académicos'],
      ['Logros Académicos', 'Logros académicos'],
      ['Noticias UNI', 'Noticias UNI'],
      ['Noticias Academicas', 'Noticias Académicas'],
      ['Noticias Académicas', 'Noticias académicas'],
      ['Ultimas Noticias', 'Últimas noticias'],
      ['Últimas Noticias', 'Últimas noticias'],
      ['Articulos', 'Artículos'],
      ['articulos', 'artículos'],
      ['Mas contenido', 'Más contenido'],
      ['Mas información', 'Más información'],
      ['Más Informacion', 'Más información'],
      ['Informes y Matriculas', 'Informes y matrículas'],
      ['Informes y Matrículas', 'Informes y matrículas'],
      ['Matrículas Abiertas', 'Matrículas abiertas'],
      ['Vacantes Disponibles', 'Vacantes disponibles'],
      ['Cupos Limitados', 'Cupos limitados'],
      ['Postulantes UNI', 'Postulantes UNI'],
      ['Preparación Preuniversitaria', 'Preparación preuniversitaria'],
      ['Grupo de Estudio', 'Grupo de estudio'],
      ['Grupo De Estudio', 'Grupo de estudio'],
      ['Universidad Nacional de Ingenieria', 'Universidad Nacional de Ingeniería'],
      ['Ingenieria', 'Ingeniería'],
      ['ingenieria', 'ingeniería'],
      ['Aptitud Academica', 'Aptitud Académica'],
      ['aptitud academica', 'aptitud académica'],
      ['Humanidades', 'Humanidades'],
      ['Ciencias', 'Ciencias'],
      ['Razonamiento', 'Razonamiento'],
      ['razonamiento', 'razonamiento'],
      ['Raz. Matemático', 'Razonamiento Matemático'],
      ['Raz. Verbal', 'Razonamiento Verbal'],
      ['Matematico', 'Matemático'],
      ['matematico', 'matemático'],
      ['Comunicacion', 'Comunicación'],
      ['comunicacion', 'comunicación'],
      ['Quienes Somos', 'Quiénes somos'],
      ['Quiénes Somos', 'Quiénes somos'],
      ['Sobre Nosotros', 'Sobre nosotros'],
      ['Mision', 'Misión'],
      ['Vision', 'Visión'],
      ['Valores Institucionales', 'Valores institucionales'],
      ['Politica de Privacidad', 'Política de privacidad'],
      ['Términos y Condiciones', 'Términos y condiciones'],
      ['Terminos y Condiciones', 'Términos y condiciones']
    ];
    var out = text;
    pairs.forEach(function (p) { out = out.split(p[0]).join(p[1]); });
    return out;
  }

  function walk(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      var old = node.nodeValue;
      var next = replaceText(old);
      if (old !== next) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (/^(SCRIPT|STYLE|NOSCRIPT|IFRAME|SVG|PATH)$/i.test(node.tagName)) return;
    Array.prototype.forEach.call(node.childNodes, walk);
  }

  function attrs() {
    document.querySelectorAll('[alt], [title], [placeholder], [aria-label]').forEach(function (el) {
      ['alt', 'title', 'placeholder', 'aria-label'].forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var old = el.getAttribute(attr);
        var next = replaceText(old);
        if (old !== next) el.setAttribute(attr, next);
      });
    });
  }

  function blogTitles() {
    var path = location.pathname.toLowerCase();
    if (!path.includes('blog') && !path.includes('sedes')) return;
    var titles = {
      'blog1.html': 'Cómo saber si ya estás listo para postular a la UNI',
      'blog2.html': 'Qué ciclo UNI elegir según tu nivel actual',
      'blog3.html': 'Cómo dejar de estancarte en Matemática, Física y Química'
    };
    Object.keys(titles).forEach(function (url) {
      document.querySelectorAll('a[href="' + url + '"]').forEach(function (a) {
        var txt = a.textContent.trim();
        if (txt.length > 15 && txt !== 'LEER MÁS' && txt !== 'Leer más') a.textContent = titles[url];
      });
    });
  }

  function run() {
    walk(document.body);
    attrs();
    blogTitles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
