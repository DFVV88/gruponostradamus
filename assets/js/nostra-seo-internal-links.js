/* ==================================================
   Grupo Nostradamus - Refuerzo SEO interno
   Inserta una sección con enlaces estratégicos desde el inicio
   hacia landings y artículos de posicionamiento orgánico.
================================================== */
(function(){
  function createPlataformaSection(){
    if(document.getElementById('nostra-plataforma-home')) return;

    var target = document.getElementById('about-sec') || document.getElementById('course-sec') || document.body;
    if(!target || !target.parentNode) return;

    var section = document.createElement('section');
    section.id = 'nostra-plataforma-home';
    section.className = 'space';
    section.style.background = 'linear-gradient(180deg,#ffffff 0%,#eef8fa 100%)';
    section.innerHTML = '' +
      '<div class="container">' +
        '<div class="title-area text-center mb-35">' +
          '<span class="sub-title"><i class="fal fa-laptop me-2"></i> Ecosistema académico digital</span>' +
          '<h2 class="sec-title">NostraPLATAFORMA: beneficios conectados para tu preparación</h2>' +
          '<p style="max-width:900px;margin:16px auto 0;font-size:18px;line-height:1.7;color:#4b5d70;">En el Grupo de Estudio Nostradamus no solo recibes clases: formas parte de una plataforma académica conectada para acceder a tu cuenta, clases, comunidad, materiales y beneficios según tu estado académico.</p>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;">' +
          '<article style="background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:24px;padding:24px;box-shadow:0 16px 42px rgba(6,20,38,.08);"><strong style="display:block;color:#061426;font-size:23px;margin-bottom:8px;">🔐 NostraCUENTA</strong><p style="margin:0;color:#4b5d70;line-height:1.6;">Acceso principal para nuevo alumno, alumno aprobado o cuenta activa.</p></article>' +
          '<article style="background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:24px;padding:24px;box-shadow:0 16px 42px rgba(6,20,38,.08);"><strong style="display:block;color:#061426;font-size:23px;margin-bottom:8px;">🔴 Clases en vivo</strong><p style="margin:0;color:#4b5d70;line-height:1.6;">Ingreso rápido a sesiones académicas mediante Microsoft Teams.</p></article>' +
          '<article style="background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:24px;padding:24px;box-shadow:0 16px 42px rgba(6,20,38,.08);"><strong style="display:block;color:#061426;font-size:23px;margin-bottom:8px;">💬 NostraCHAT</strong><p style="margin:0;color:#4b5d70;line-height:1.6;">Comunidad interna para acompañamiento, consultas y comunicación académica.</p></article>' +
          '<article style="background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:24px;padding:24px;box-shadow:0 16px 42px rgba(6,20,38,.08);"><strong style="display:block;color:#061426;font-size:23px;margin-bottom:8px;">📚 Material académico</strong><p style="margin:0;color:#4b5d70;line-height:1.6;">Recursos, separatas, simulacros y documentos de apoyo para estudiar mejor.</p></article>' +
          '<article style="background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:24px;padding:24px;box-shadow:0 16px 42px rgba(6,20,38,.08);"><strong style="display:block;color:#061426;font-size:23px;margin-bottom:8px;">📢 Comunicados oficiales</strong><p style="margin:0;color:#4b5d70;line-height:1.6;">Avisos, horarios, evaluaciones, cambios de clase y mensajes institucionales.</p></article>' +
          '<article style="background:#fff;border:1px solid rgba(7,140,149,.16);border-radius:24px;padding:24px;box-shadow:0 16px 42px rgba(6,20,38,.08);"><strong style="display:block;color:#061426;font-size:23px;margin-bottom:8px;">💳 Pagos y matrícula</strong><p style="margin:0;color:#4b5d70;line-height:1.6;">Consulta futura de cuotas, pagos, deudas, ciclo, aula, turno y estado académico.</p></article>' +
        '</div>' +
        '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:32px;">' +
          '<a href="cuenta-nostra.html" class="th-btn style3">Ingresar a NostraCUENTA <i class="fas fa-arrow-right ms-2"></i></a>' +
          '<a href="ciclos.html" class="th-btn style6">Ver ciclos académicos</a>' +
        '</div>' +
      '</div>';

    target.parentNode.insertBefore(section, target);
  }

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

  function init(){
    createPlataformaSection();
    createSeoSection();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();