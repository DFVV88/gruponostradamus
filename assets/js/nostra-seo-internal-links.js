/* ==================================================
   Grupo Nostradamus - Refuerzo SEO interno
   Inserta una sección con enlaces estratégicos desde el inicio
   hacia landings y artículos de posicionamiento orgánico.
================================================== */
(function(){
  function createSeoSection(){
    if(document.getElementById('nostra-seo-internal-links')) return;

    var target = document.getElementById('course-sec') || document.querySelector('main') || document.body;
    if(!target || !target.parentNode) return;

    var section = document.createElement('section');
    section.id = 'nostra-seo-internal-links';
    section.className = 'space bg-smoke';
    section.innerHTML = '' +
      '<div class="container">' +
        '<div class="title-area text-center mb-35">' +
          '<span class="sub-title"><i class="fal fa-book me-2"></i> Grupo de estudio preuniversitario</span>' +
          '<h2 class="sec-title">Más que una academia, una ruta de preparación para la UNI</h2>' +
        '</div>' +
        '<div style="max-width:960px;margin:0 auto;text-align:center;">' +
          '<p style="font-size:18px;line-height:1.7;margin-bottom:18px;">' +
            'Grupo Nostradamus es un <strong>grupo de estudio preuniversitario especializado en preparación UNI</strong>. ' +
            'Combinamos clases, práctica intensiva, simulacros tipo admisión y seguimiento académico para formar postulantes competitivos.' +
          '</p>' +
          '<p style="font-size:17px;line-height:1.7;margin-bottom:26px;">' +
            'Si buscas una alternativa más enfocada que una academia preuniversitaria tradicional, conoce nuestra metodología, nuestros ciclos académicos y nuestras guías para futuros ingenieros UNI.' +
          '</p>' +
          '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:28px;">' +
            '<a href="grupo-de-estudio-preuniversitario.html" class="th-btn style3">Ver grupo de estudio preuniversitario <i class="fas fa-arrow-right ms-2"></i></a>' +
            '<a href="academia-preuniversitaria-uni.html" class="th-btn style6">Alternativa a academia UNI <i class="fas fa-arrow-right ms-2"></i></a>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;text-align:left;">' +
            '<a href="como-elegir-grupo-de-estudio-preuniversitario-uni.html" style="display:block;background:#fff;border:1px solid rgba(7,140,149,.18);border-radius:22px;padding:22px;box-shadow:0 14px 34px rgba(6,20,38,.08);">' +
              '<strong style="display:block;color:#061426;font-size:20px;margin-bottom:8px;">Cómo elegir un grupo de estudio para la UNI</strong>' +
              '<span style="color:#415166;line-height:1.6;">Guía para alumnos y padres que buscan una preparación seria, con método, práctica y seguimiento.</span>' +
            '</a>' +
            '<a href="diferencia-academia-preuniversitaria-y-grupo-de-estudio.html" style="display:block;background:#fff;border:1px solid rgba(7,140,149,.18);border-radius:22px;padding:22px;box-shadow:0 14px 34px rgba(6,20,38,.08);">' +
              '<strong style="display:block;color:#061426;font-size:20px;margin-bottom:8px;">Academia vs. grupo de estudio</strong>' +
              '<span style="color:#415166;line-height:1.6;">Conoce la diferencia y descubre qué opción puede convenir más para postular a la UNI.</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    target.parentNode.insertBefore(section, target);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createSeoSection);
  }else{
    createSeoSection();
  }
})();
