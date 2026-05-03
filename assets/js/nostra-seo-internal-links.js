/* ==================================================
   Grupo Nostradamus - Refuerzo SEO interno
   Inserta una sección con enlaces estratégicos desde el inicio
   hacia las landings de posicionamiento orgánico.
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
        '<div style="max-width:930px;margin:0 auto;text-align:center;">' +
          '<p style="font-size:18px;line-height:1.7;margin-bottom:18px;">' +
            'Grupo Nostradamus es un <strong>grupo de estudio preuniversitario especializado en preparación UNI</strong>. ' +
            'Combinamos clases, práctica intensiva, simulacros tipo admisión y seguimiento académico para formar postulantes competitivos.' +
          '</p>' +
          '<p style="font-size:17px;line-height:1.7;margin-bottom:26px;">' +
            'Si buscas una alternativa más enfocada que una academia preuniversitaria tradicional, conoce nuestra metodología y nuestros ciclos académicos para futuros ingenieros UNI.' +
          '</p>' +
          '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">' +
            '<a href="grupo-de-estudio-preuniversitario.html" class="th-btn style3">Ver grupo de estudio preuniversitario <i class="fas fa-arrow-right ms-2"></i></a>' +
            '<a href="academia-preuniversitaria-uni.html" class="th-btn style6">Alternativa a academia UNI <i class="fas fa-arrow-right ms-2"></i></a>' +
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
