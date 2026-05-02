/* ==================================================
   Grupo Nostradamus - Textos PRO para ciclos.html
   Mejora las descripciones comerciales de cada miniatura/ciclo.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  var textos = {
    'ciclo anual uni': {
      descripcion: 'Ciclo diseñado para alumnos que no tienen base académica o sienten que deben empezar desde cero. Durante un año completo se construyen los fundamentos paso a paso, desde nivel básico hasta nivel admisión UNI, con teoría ordenada, práctica progresiva, evaluaciones y acompañamiento constante.',
      nivel: 'Desde cero – Básico – Intermedio – Avanzado',
      ideal: 'Ideal para estudiantes que necesitan una preparación completa, paciente y sostenida durante todo el año antes de postular.'
    },
    'ciclo semianual uni': {
      descripcion: 'Programa intensivo para alumnos que ya tienen una base académica, pero aún no han postulado a la UNI o no han tenido éxito con preparaciones anteriores. Reordena conocimientos, corrige vacíos y eleva el nivel con práctica exigente y seguimiento académico.',
      nivel: 'Base previa – Intermedio – Avanzado',
      ideal: 'Ideal para postulantes que ya estudiaron antes, pero necesitan una preparación más seria, guiada y efectiva.'
    },
    'ciclo semestral uni': {
      descripcion: 'Ciclo dirigido a alumnos con base académica que ya han postulado y todavía no lograron el ingreso. Se enfoca en reforzar puntos débiles, mejorar la velocidad de resolución, afinar estrategia de examen y consolidar los temas clave para competir mejor.',
      nivel: 'Intermedio – Avanzado',
      ideal: 'Ideal para postulantes con experiencia previa en admisión que necesitan ajustar su preparación y convertir el intento anterior en una ventaja.'
    },
    'ciclo repaso uni': {
      descripcion: 'Ciclo corto e intensivo para repasar los temas más frecuentes y relevantes del examen de admisión UNI. Está orientado a reforzar fórmulas, métodos, preguntas tipo, rapidez de resolución y seguridad antes de la evaluación.',
      nivel: 'Repaso estratégico – Intermedio – Avanzado',
      ideal: 'Ideal para quienes están próximos a postular y necesitan un repaso final enfocado en lo que más aparece en el examen.'
    },
    'ciclo élite uni': {
      descripcion: 'Ciclo de exigencia superior para postulantes con buena base académica que buscan competir por los primeros puestos. Profundiza en problemas de alto nivel, técnicas de resolución y entrenamiento intensivo orientado al estándar UNI.',
      nivel: 'Avanzado',
      ideal: 'Ideal para estudiantes con alto rendimiento que desean potenciar su capacidad al máximo.'
    },
    'ciclo elite uni': {
      descripcion: 'Ciclo de exigencia superior para postulantes con buena base académica que buscan competir por los primeros puestos. Profundiza en problemas de alto nivel, técnicas de resolución y entrenamiento intensivo orientado al estándar UNI.',
      nivel: 'Avanzado',
      ideal: 'Ideal para estudiantes con alto rendimiento que desean potenciar su capacidad al máximo.'
    },
    'ciclo ien': {
      descripcion: 'Programa enfocado en estudiantes que buscan reforzar su preparación con clases ordenadas, práctica constante y seguimiento académico. Permite mejorar la comprensión de los cursos clave y avanzar con mayor seguridad hacia el nivel requerido por la UNI.',
      nivel: 'Básico – Intermedio',
      ideal: 'Ideal para quienes necesitan consolidar fundamentos y ganar confianza académica.'
    },
    'ciclo proyecto escolar': {
      descripcion: 'Formación académica para escolares que desean fortalecer su rendimiento desde el colegio y prepararse con visión preuniversitaria. Refuerza bases en Matemáticas, Ciencias y Aptitud Académica con método, disciplina y acompañamiento.',
      nivel: 'Escolar – Preuniversitario inicial',
      ideal: 'Ideal para estudiantes de colegio que quieren adelantarse y construir una base sólida.'
    },
    'ciclo paralelo cepre uni': {
      descripcion: 'Acompañamiento especializado para estudiantes que llevan CEPRE UNI y necesitan reforzar lo aprendido, resolver dudas y practicar con mayor intensidad. Ayuda a ordenar el avance, mejorar el rendimiento y sostener un ritmo competitivo.',
      nivel: 'Intermedio – Avanzado',
      ideal: 'Ideal para alumnos de CEPRE UNI que desean complementar su preparación y mejorar resultados.'
    },
    'ciclo verano uni': {
      descripcion: 'Ciclo intensivo de verano para iniciar o reforzar la preparación UNI durante las vacaciones. Permite avanzar rápidamente en los cursos principales, desarrollar disciplina académica y llegar mejor preparado al siguiente ciclo.',
      nivel: 'Básico – Intermedio',
      ideal: 'Ideal para estudiantes que quieren aprovechar el verano para ganar ventaja académica.'
    }
  };

  function normalizar(texto) {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buscarTexto(titulo) {
    var limpio = normalizar(titulo);
    if (textos[limpio]) return textos[limpio];

    var keys = Object.keys(textos);
    for (var i = 0; i < keys.length; i++) {
      if (limpio.indexOf(normalizar(keys[i])) !== -1 || normalizar(keys[i]).indexOf(limpio) !== -1) {
        return textos[keys[i]];
      }
    }
    return null;
  }

  function mejorarDescripcion(card) {
    if (!card) return;

    var titleNode = card.querySelector('.course-title');
    var descBox = card.querySelector('.course-description');
    var paragraph = descBox ? descBox.querySelector('p') : null;
    if (!titleNode || !paragraph) return;

    var data = buscarTexto(titleNode.textContent);
    if (!data) return;

    paragraph.innerHTML =
      data.descripcion +
      '<br><br><strong>NIVEL: ' + data.nivel + '</strong>' +
      '<br><span class="nostra-copy-ideal">' + data.ideal + '</span>';

    card.dataset.nostraCopyPro = '3';
  }

  function injectStyles() {
    var oldStyle = document.getElementById('nostra-ciclos-copy-pro-style');
    if (oldStyle) oldStyle.remove();

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-copy-pro-style';
    style.textContent = `
      body #course-sec .course-description p{
        color:#263648 !important;
        font-size:15px !important;
        line-height:1.68 !important;
        font-weight:560 !important;
        text-align:justify !important;
        text-justify:inter-word !important;
        hyphens:auto !important;
        letter-spacing:.01em !important;
      }

      body #course-sec .course-description p strong{
        display:block !important;
        width:100% !important;
        margin:12px 0 10px !important;
        padding:11px 13px !important;
        border-left:5px solid #00c2d1 !important;
        border-radius:12px !important;
        background:linear-gradient(90deg,rgba(0,194,209,.14),rgba(255,255,255,.95)) !important;
        color:#061426 !important;
        font-size:14.5px !important;
        font-weight:950 !important;
        line-height:1.38 !important;
        text-align:justify !important;
        text-justify:inter-word !important;
      }

      body #course-sec .nostra-copy-ideal{
        display:block !important;
        margin-top:8px !important;
        padding:11px 13px !important;
        border-radius:14px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.13) !important;
        color:#008b96 !important;
        font-size:14px !important;
        font-weight:850 !important;
        line-height:1.42 !important;
        text-align:justify !important;
        text-justify:inter-word !important;
        hyphens:auto !important;
        box-shadow:0 8px 18px rgba(6,20,38,.045) !important;
      }

      body #course-sec .nostra-copy-ideal:before{
        content:'🎯 ';
      }

      @media(max-width:575px){
        body #course-sec .course-description p,
        body #course-sec .course-description p strong,
        body #course-sec .nostra-copy-ideal{
          text-align:left !important;
          hyphens:none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
    document.querySelectorAll('#course-sec .course-single').forEach(mejorarDescripcion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
    setTimeout(init, 3000);
  });
})();
