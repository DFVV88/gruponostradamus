/* ==================================================
   Grupo Nostradamus - Refuerzo SEO interno
   Inserta una sección con enlaces estratégicos desde el inicio
   hacia landings y artículos de posicionamiento orgánico.
================================================== */
(function(){
  function fixHomeSliders(){
    if(document.getElementById('nostra-home-slider-position-fix')) return;

    var style = document.createElement('style');
    style.id = 'nostra-home-slider-position-fix';
    style.textContent = `
      /* ==================================================
         Corrección de posición para Slider 1 y Slider 2
         Mantiene estable el alto del hero y centra contenido/video.
      ================================================== */
      #hero,
      #hero .hero-slider-6,
      #hero .slick-list,
      #hero .slick-track,
      #hero .slick-slide,
      #hero .slick-slide > div,
      #hero .th-hero-slide {
        min-height: clamp(560px, 72vh, 720px) !important;
      }

      #hero .th-hero-slide {
        position: relative !important;
        overflow: hidden !important;
      }

      #hero .th-hero-bg,
      #hero .img-min-slider {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: clamp(560px, 72vh, 720px) !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        background-position: center center !important;
      }

      #hero .th-hero-slide > .container {
        position: relative !important;
        z-index: 3 !important;
        min-height: clamp(560px, 72vh, 720px) !important;
        display: flex !important;
        align-items: center !important;
      }

      /* Slider 1: texto principal */
      #hero .nostra-home-hero,
      #hero .nostra-future-hero {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        margin-top: -18px !important;
        max-width: 780px !important;
      }

      #hero .nostra-home-hero h1,
      #hero .nostra-future-hero h1 {
        margin-top: 14px !important;
        margin-bottom: 20px !important;
      }

      #hero .nostra-home-hero p,
      #hero .nostra-future-hero p {
        margin-bottom: 20px !important;
      }

      /* Slider 2: video centrado */
      #hero .contenido-max-slider.contenido-min-slider-tovideo,
      #hero .contenido-min-slider-tovideo {
        width: min(920px, 82vw) !important;
        max-width: 920px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        z-index: 4 !important;
        transform: translateY(-18px) !important;
      }

      #hero iframe.frame-video,
      #hero .contenido-min-slider-tovideo .frame-video {
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: min(54vh, 520px) !important;
        border-radius: 24px !important;
        overflow: hidden !important;
        border: 1px solid rgba(255,255,255,.30) !important;
        background: #02070d !important;
        box-shadow: 0 24px 70px rgba(0,0,0,.48), 0 0 32px rgba(0,194,209,.22) !important;
      }

      #hero .th-hero-slide:has(.frame-video) > .container {
        justify-content: center !important;
      }

      @media (max-width: 991px) {
        #hero,
        #hero .hero-slider-6,
        #hero .slick-list,
        #hero .slick-track,
        #hero .slick-slide,
        #hero .slick-slide > div,
        #hero .th-hero-slide,
        #hero .th-hero-bg,
        #hero .img-min-slider,
        #hero .th-hero-slide > .container {
          min-height: 540px !important;
        }

        #hero .contenido-max-slider.contenido-min-slider-tovideo,
        #hero .contenido-min-slider-tovideo {
          width: min(760px, 88vw) !important;
          transform: translateY(-10px) !important;
        }
      }

      @media (max-width: 767px) {
        #hero,
        #hero .hero-slider-6,
        #hero .slick-list,
        #hero .slick-track,
        #hero .slick-slide,
        #hero .slick-slide > div,
        #hero .th-hero-slide,
        #hero .th-hero-bg,
        #hero .img-min-slider,
        #hero .th-hero-slide > .container {
          min-height: 500px !important;
        }

        #hero .th-hero-slide > .container {
          justify-content: center !important;
          text-align: center !important;
          padding-top: 24px !important;
          padding-bottom: 30px !important;
        }

        #hero .nostra-home-hero,
        #hero .nostra-future-hero {
          margin-top: 0 !important;
          max-width: 100% !important;
        }

        #hero .contenido-max-slider.contenido-min-slider-tovideo,
        #hero .contenido-min-slider-tovideo {
          width: calc(100vw - 28px) !important;
          max-width: 440px !important;
          transform: translateY(0) !important;
        }

        #hero iframe.frame-video,
        #hero .contenido-min-slider-tovideo .frame-video {
          border-radius: 16px !important;
          max-height: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

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
    fixHomeSliders();
    createPlataformaSection();
    createSeoSection();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();