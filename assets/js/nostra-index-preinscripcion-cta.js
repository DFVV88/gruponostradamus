/* ==================================================
   Grupo Nostradamus - Preinscripción estratégica en el index
   Incluye orientación rápida, CTA y sección de contacto renovada.
================================================== */
(function () {
  'use strict';

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!(file === 'index.html' || file === '' || location.pathname === '/')) return;

  var PRE = 'https://gruponostradamus.edu.pe/preinscripcion.html';
  var WA_BASE = 'https://wa.me/51993750351?text=';
  var WA = WA_BASE + encodeURIComponent('Hola Nostradamus, necesito orientación para elegir mi programa y completar mi preinscripción.');

  var PROGRAMS = [
    'Nostra 360 UNI',
    'Nostra Power UNI',
    'Nostra Élite UNI',
    'Nostra Prime UNI',
    'Nostra Talentum UNI',
    'IEN UNI',
    'Proyecto Escolar',
    'Paralelo CEPRE UNI',
    'Ciclo Verano UNI'
  ];

  function addStyle() {
    if (document.getElementById('nostra-index-pre-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-index-pre-style';
    style.textContent = `
      .nostra-pre-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;min-height:52px!important;padding:13px 23px!important;border-radius:999px!important;text-decoration:none!important;font-weight:950!important;line-height:1.1!important;letter-spacing:.15px!important;transition:transform .22s ease,box-shadow .22s ease,filter .22s ease!important;}
      .nostra-pre-btn:hover{transform:translateY(-3px)!important;filter:brightness(1.05)!important;}
      .nostra-pre-btn--gold{background:linear-gradient(135deg,#ffd36a 0%,#ffb539 45%,#ff7a18 100%)!important;color:#061426!important;border:1px solid rgba(255,255,255,.35)!important;box-shadow:0 16px 34px rgba(255,145,24,.27)!important;}
      .nostra-pre-btn--ghost{background:rgba(255,255,255,.09)!important;color:#fff!important;border:1px solid rgba(168,247,255,.35)!important;box-shadow:0 13px 30px rgba(0,0,0,.18)!important;}
      #hero .nostra-pre-hero{background:linear-gradient(135deg,#ffd36a,#ff9e25)!important;color:#061426!important;border:1px solid rgba(255,255,255,.55)!important;box-shadow:0 15px 34px rgba(255,181,57,.34)!important;}

      .nostra-pre-section{position:relative;overflow:hidden;padding:42px 0;background:radial-gradient(circle at 10% 20%,rgba(0,229,255,.18),transparent 34%),radial-gradient(circle at 90% 80%,rgba(255,181,57,.18),transparent 34%),linear-gradient(135deg,#02070d 0%,#061426 48%,#07515a 100%);color:#fff;}
      .nostra-pre-section:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:38px 38px;pointer-events:none;}
      .nostra-pre-wrap{position:relative;z-index:2;width:min(1160px,92%);margin:auto;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:28px;padding:28px 32px;border-radius:28px;background:rgba(255,255,255,.075);border:1px solid rgba(168,247,255,.2);box-shadow:0 24px 60px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(9px);}
      .nostra-pre-eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:9px;padding:7px 12px;border-radius:999px;background:rgba(0,229,255,.11);border:1px solid rgba(168,247,255,.22);color:#a8f7ff;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.7px;}
      .nostra-pre-title{margin:0 0 8px!important;color:#fff!important;font-size:clamp(27px,3vw,43px)!important;line-height:1.06!important;font-weight:950!important;letter-spacing:-.7px!important;}
      .nostra-pre-copy{max-width:760px;margin:0!important;color:rgba(255,255,255,.8)!important;font-size:16px!important;line-height:1.55!important;font-weight:650!important;}
      .nostra-pre-actions{display:flex;align-items:center;justify-content:flex-end;gap:11px;flex-wrap:wrap;}
      .nostra-pre-results{background:radial-gradient(circle at 85% 30%,rgba(255,181,57,.23),transparent 34%),linear-gradient(135deg,#061426,#083746 70%,#087d84);}
      .nostra-pre-final{padding:54px 0;background:radial-gradient(circle at 15% 50%,rgba(0,229,255,.23),transparent 32%),radial-gradient(circle at 88% 20%,rgba(255,181,57,.22),transparent 30%),linear-gradient(135deg,#02070d,#061426 50%,#064a52);}
      .nostra-pre-final .nostra-pre-wrap{text-align:center;grid-template-columns:1fr;max-width:980px;}
      .nostra-pre-final .nostra-pre-copy{margin-left:auto!important;margin-right:auto!important;}
      .nostra-pre-final .nostra-pre-actions{justify-content:center;margin-top:8px;}

      #contacto.nostra-contact-section{position:relative!important;margin:0!important;padding:86px 0!important;background:radial-gradient(circle at 8% 10%,rgba(0,194,209,.17),transparent 31%),radial-gradient(circle at 92% 88%,rgba(255,181,57,.15),transparent 27%),linear-gradient(180deg,#f8feff 0%,#edf8fa 100%)!important;overflow:hidden!important;}
      #contacto.nostra-contact-section:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(0,139,150,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(0,139,150,.055) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(circle at center,#000,transparent 82%);pointer-events:none;}
      .nostra-contact-shell{position:relative;z-index:2;width:min(1220px,92%);margin:auto;display:grid;grid-template-columns:minmax(0,.96fr) minmax(0,1.04fr);overflow:hidden;border-radius:34px;background:#fff;border:1px solid rgba(0,139,150,.15);box-shadow:0 30px 80px rgba(6,20,38,.13),0 0 42px rgba(0,194,209,.08);}
      .nostra-contact-media{position:relative;min-height:640px;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(145deg,#0b9eaa 0%,#00c2d1 48%,#e8fbfd 100%);overflow:hidden;}
      .nostra-contact-media:before{content:"";position:absolute;inset:18px;border:1px solid rgba(255,255,255,.34);border-radius:26px;pointer-events:none;}
      .nostra-contact-media img{position:relative;z-index:1;width:100%;height:100%;max-height:592px;object-fit:contain!important;object-position:center!important;display:block;border-radius:22px;background:#079ca8;}
      .nostra-contact-badge{position:absolute;left:38px;right:38px;bottom:38px;z-index:3;display:flex;align-items:center;gap:13px;padding:15px 17px;border-radius:18px;background:rgba(6,20,38,.88);border:1px solid rgba(255,255,255,.2);box-shadow:0 18px 40px rgba(6,20,38,.25);backdrop-filter:blur(9px);color:#fff;}
      .nostra-contact-badge strong{display:block;color:#fff;font-size:16px;line-height:1.15;font-weight:950;}
      .nostra-contact-badge span{display:block;margin-top:3px;color:rgba(255,255,255,.76);font-size:12.5px;font-weight:650;}
      .nostra-contact-badge__ico{width:46px;height:46px;flex:0 0 46px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(135deg,#ffd36a,#ff9a24);color:#061426;font-size:21px;}

      .nostra-contact-content{padding:58px clamp(30px,4vw,62px);display:flex;flex-direction:column;justify-content:center;background:linear-gradient(180deg,#fff 0%,#f9feff 100%);}
      .nostra-contact-kicker{display:inline-flex;align-self:flex-start;align-items:center;gap:8px;padding:8px 13px;border-radius:999px;background:#eafffb;border:1px solid rgba(0,194,209,.25);color:#008b96;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.65px;}
      .nostra-contact-title{margin:18px 0 14px!important;color:#061426!important;font-size:clamp(38px,4.4vw,64px)!important;line-height:.98!important;font-style:italic!important;font-weight:950!important;letter-spacing:-1.4px!important;text-transform:uppercase!important;}
      .nostra-contact-title span{color:#008b96!important;}
      .nostra-contact-lead{max-width:670px;margin:0 0 26px!important;color:#526477!important;font-size:16.5px!important;line-height:1.62!important;font-weight:650!important;}
      .nostra-contact-points{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 27px;}
      .nostra-contact-point{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:#f0fbfc;border:1px solid rgba(0,139,150,.13);color:#214457;font-size:12.5px;font-weight:850;}
      .nostra-contact-point:before{content:"✓";width:20px;height:20px;display:grid;place-items:center;border-radius:50%;background:#008b96;color:#fff;font-size:11px;font-weight:950;}

      .nostra-quick-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
      .nostra-quick-field{position:relative;}
      .nostra-quick-field--wide{grid-column:1/-1;}
      .nostra-quick-field label{display:block;margin:0 0 7px;color:#173449;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.45px;}
      .nostra-quick-field input,.nostra-quick-field select{width:100%;height:54px;padding:0 15px;border-radius:15px;border:1px solid rgba(0,139,150,.19);background:#f8fcfd;color:#061426;font-size:14.5px;font-weight:700;outline:none;box-shadow:none;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease;}
      .nostra-quick-field input:focus,.nostra-quick-field select:focus{border-color:#00aebd;background:#fff;box-shadow:0 0 0 4px rgba(0,194,209,.10);}
      .nostra-quick-field select{appearance:auto;}
      .nostra-quick-actions{grid-column:1/-1;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px;}
      .nostra-quick-submit,.nostra-quick-pre{min-height:54px;display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 20px;border-radius:15px;text-decoration:none!important;font-size:13px;font-weight:950;text-transform:uppercase;letter-spacing:.25px;transition:transform .2s ease,box-shadow .2s ease,filter .2s ease;}
      .nostra-quick-submit{border:0;background:linear-gradient(135deg,#00c2d1 0%,#008b96 55%,#06404a 100%);color:#fff;box-shadow:0 15px 32px rgba(0,139,150,.23);cursor:pointer;}
      .nostra-quick-pre{background:linear-gradient(135deg,#ffd36a,#ffb539 48%,#ff8c1a);color:#061426!important;border:1px solid rgba(255,181,57,.35);box-shadow:0 15px 30px rgba(255,158,37,.20);}
      .nostra-quick-submit:hover,.nostra-quick-pre:hover{transform:translateY(-2px);filter:brightness(1.04);}
      .nostra-contact-note{grid-column:1/-1;margin:2px 0 0!important;color:#728090!important;font-size:12px!important;line-height:1.45!important;font-weight:650!important;}

      #nostra-mobile-conversion-bar{display:none;}
      @media(max-width:991px){
        .nostra-pre-wrap{grid-template-columns:1fr;text-align:center}.nostra-pre-actions{justify-content:center}.nostra-pre-copy{margin-left:auto!important;margin-right:auto!important;}
        .nostra-contact-shell{grid-template-columns:1fr;max-width:760px;}
        .nostra-contact-media{min-height:auto;padding:20px;}
        .nostra-contact-media img{height:auto;max-height:none;aspect-ratio:auto;}
        .nostra-contact-badge{left:32px;right:32px;bottom:32px;}
      }
      @media(max-width:767px){
        body{padding-bottom:72px!important;}
        #hero .nostra-home-actions{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;}
        #hero .nostra-home-actions .th-btn,#hero .nostra-home-actions .nostra-pre-btn{min-width:min(260px,100%)!important;}
        .nostra-pre-section{padding:28px 0;}
        .nostra-pre-wrap{width:min(94%,620px);padding:24px 18px;border-radius:22px;gap:20px;}
        .nostra-pre-title{font-size:29px!important;}
        .nostra-pre-actions{display:grid;width:100%;}
        .nostra-pre-btn{width:100%;}
        #contacto.nostra-contact-section{padding:58px 0!important;}
        .nostra-contact-shell{width:min(94%,620px);border-radius:25px;}
        .nostra-contact-media{padding:14px;}
        .nostra-contact-media:before{inset:10px;border-radius:20px;}
        .nostra-contact-media img{border-radius:18px;}
        .nostra-contact-badge{position:relative;left:auto;right:auto;bottom:auto;width:calc(100% - 4px);margin:-72px auto 5px;}
        .nostra-contact-content{padding:38px 20px 34px;}
        .nostra-contact-title{font-size:39px!important;}
        .nostra-quick-form{grid-template-columns:1fr;}
        .nostra-quick-field--wide,.nostra-quick-actions,.nostra-contact-note{grid-column:auto;}
        .nostra-quick-actions{display:grid;grid-template-columns:1fr;}
        .nostra-quick-submit,.nostra-quick-pre{width:100%;}
        #nostra-mobile-conversion-bar{position:fixed;left:0;right:0;bottom:0;z-index:99998;display:grid;grid-template-columns:1fr 1.25fr;gap:8px;padding:9px 10px calc(9px + env(safe-area-inset-bottom));background:rgba(2,7,13,.96);border-top:1px solid rgba(168,247,255,.25);box-shadow:0 -12px 32px rgba(0,0,0,.32);backdrop-filter:blur(13px);}
        #nostra-mobile-conversion-bar a{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:14px;text-decoration:none!important;font-size:13px;font-weight:950;}
        #nostra-mobile-conversion-bar .nostra-mobile-wa{background:linear-gradient(135deg,#16c763,#079b4d);color:#fff!important;}
        #nostra-mobile-conversion-bar .nostra-mobile-pre{background:linear-gradient(135deg,#ffd36a,#ff8c1a);color:#061426!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function preButton(label, source, extraClass) {
    return '<a href="' + PRE + '" class="nostra-pre-btn nostra-pre-btn--gold ' + (extraClass || '') + '" data-nostra-pre-source="' + source + '">📝 ' + label + '</a>';
  }

  function ensureHeroButton() {
    var actions = document.querySelector('#hero .nostra-home-actions');
    if (!actions) return false;

    var btn = document.getElementById('nostra-pre-hero');
    if (!btn) {
      btn = document.createElement('a');
      btn.id = 'nostra-pre-hero';
      btn.href = PRE;
      btn.className = 'th-btn nostra-pre-hero';
      btn.setAttribute('data-nostra-pre-source', 'hero');
      btn.innerHTML = '📝 PREINSCRÍBETE AHORA';
    }

    var cycles = actions.querySelector('a[href="#course-sec"]');
    if (cycles) actions.insertBefore(btn, cycles);
    else actions.appendChild(btn);
    return true;
  }

  function makeSection(id, className, eyebrow, title, copy, source, label, includeWa) {
    var section = document.getElementById(id);
    if (!section) {
      section = document.createElement('section');
      section.id = id;
      section.className = 'nostra-pre-section ' + (className || '');
    }

    section.innerHTML = '<div class="nostra-pre-wrap"><div><span class="nostra-pre-eyebrow">' + eyebrow + '</span><h2 class="nostra-pre-title">' + title + '</h2><p class="nostra-pre-copy">' + copy + '</p></div><div class="nostra-pre-actions">' + preButton(label, source, '') + (includeWa ? '<a href="' + WA + '" target="_blank" rel="noopener noreferrer" class="nostra-pre-btn nostra-pre-btn--ghost">💬 Necesito orientación</a>' : '') + '</div></div>';
    return section;
  }

  function ensureRouteCTA() {
    var route = document.getElementById('nostra-ruta-premium');
    var fallback = document.getElementById('course-sec');
    var target = route || fallback;
    if (!target || !target.parentNode) return false;

    var section = makeSection(
      'nostra-pre-after-route',
      '',
      '✦ Tu ruta comienza aquí',
      '¿Ya identificaste el programa que necesitas?',
      'Completa tu preinscripción en pocos minutos. Nuestro equipo revisará tus datos y te orientará para elegir el programa adecuado según tu nivel y tu meta UNI.',
      'ruta-nostra',
      'INICIAR MI PREINSCRIPCIÓN',
      true
    );
    target.insertAdjacentElement('afterend', section);
    return true;
  }

  function ensureResultsCTA() {
    var impact = document.querySelector('.impact-title');
    var target = impact && impact.closest('.space.overflow-hidden');
    if (!target || !target.parentNode) return false;

    var section = makeSection(
      'nostra-pre-after-results',
      'nostra-pre-results',
      '🏆 El próximo resultado puede ser el tuyo',
      'Ellos comenzaron tomando una decisión. Ahora te toca a ti.',
      'Da el primer paso hacia tu vacante. Registra tus datos y empieza a construir una preparación con método, seguimiento y exigencia UNI.',
      'resultados',
      'QUIERO SER EL PRÓXIMO CACHIMBO',
      false
    );
    target.insertAdjacentElement('afterend', section);
    return true;
  }

  function ensureFinalCTA() {
    var contact = document.getElementById('contacto');
    if (!contact || !contact.parentNode) return false;

    var section = makeSection(
      'nostra-pre-final',
      'nostra-pre-final',
      '🚀 Cupos limitados',
      'Tu preparación no puede seguir esperando',
      'Preinscríbete ahora y permite que nuestro equipo académico te ayude a elegir la ruta que realmente necesitas para avanzar hacia la UNI.',
      'cierre-index',
      'RESERVAR MI VACANTE',
      true
    );
    contact.parentNode.insertBefore(section, contact);
    return true;
  }

  function optionHTML(label) {
    return '<option value="' + label + '">' + label + '</option>';
  }

  function contactHTML() {
    return '' +
      '<div class="nostra-contact-shell">' +
        '<div class="nostra-contact-media">' +
          '<img src="assets/img/normal/banner-1-contacto.jpg" alt="Estudiantes de Grupo Nostradamus preparados para ingresar a la UNI" loading="lazy" decoding="async">' +
          '<div class="nostra-contact-badge">' +
            '<span class="nostra-contact-badge__ico">🏆</span>' +
            '<span><strong>16 años formando postulantes</strong><span>Método, exigencia y acompañamiento académico.</span></span>' +
          '</div>' +
        '</div>' +
        '<div class="nostra-contact-content">' +
          '<span class="nostra-contact-kicker">✦ Orientación académica personalizada</span>' +
          '<h2 class="nostra-contact-title">Da el siguiente paso hacia <span>tu vacante UNI</span></h2>' +
          '<p class="nostra-contact-lead">Déjanos tus datos y recibe orientación para elegir el programa adecuado según tu nivel, experiencia y fecha de examen.</p>' +
          '<div class="nostra-contact-points">' +
            '<span class="nostra-contact-point">Orientación según tu nivel</span>' +
            '<span class="nostra-contact-point">Cupos sujetos a disponibilidad</span>' +
            '<span class="nostra-contact-point">Respuesta rápida por WhatsApp</span>' +
          '</div>' +
          '<form class="nostra-quick-form" id="formNostra" novalidate>' +
            '<div class="nostra-quick-field"><label for="name">Nombre completo</label><input type="text" id="name" name="name" autocomplete="name" placeholder="Escribe tu nombre" required></div>' +
            '<div class="nostra-quick-field"><label for="number">WhatsApp</label><input type="tel" id="number" name="number" autocomplete="tel" inputmode="tel" placeholder="Ejemplo: 999 999 999" required></div>' +
            '<div class="nostra-quick-field"><label for="course">Programa de interés</label><select id="course" name="course" required><option value="">Selecciona un programa</option>' + PROGRAMS.map(optionHTML).join('') + '</select></div>' +
            '<div class="nostra-quick-field"><label for="modalidad">Modalidad</label><select id="modalidad" name="modalidad" required><option value="">Selecciona una modalidad</option><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Necesito orientación">Necesito orientación</option></select></div>' +
            '<div class="nostra-quick-actions">' +
              '<button type="submit" class="nostra-quick-submit">💬 Quiero orientación académica</button>' +
              '<a href="' + PRE + '" class="nostra-quick-pre" data-nostra-pre-source="contacto-index">📝 Preinscribirme ahora</a>' +
            '</div>' +
            '<p class="nostra-contact-note">Al enviar, se abrirá WhatsApp con tus datos para que un asesor continúe la orientación. La preinscripción completa se realiza en el formulario institucional.</p>' +
          '</form>' +
        '</div>' +
      '</div>';
  }

  function bindContactForm(section) {
    var form = section.querySelector('#formNostra');
    if (!form || form.getAttribute('data-nostra-bound') === '1') return;
    form.setAttribute('data-nostra-bound', '1');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = (form.querySelector('#name').value || '').trim();
      var phone = (form.querySelector('#number').value || '').trim();
      var program = form.querySelector('#course').value || '';
      var modality = form.querySelector('#modalidad').value || '';

      if (!name || !phone || !program || !modality) {
        form.reportValidity();
        return;
      }

      var message = 'Hola Nostradamus, quiero orientación académica.\n\n' +
        'Nombre: ' + name + '\n' +
        'WhatsApp: ' + phone + '\n' +
        'Programa de interés: ' + program + '\n' +
        'Modalidad: ' + modality;

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'submit_orientacion_index', {
          event_category:'lead',
          event_label:program,
          modalidad:modality,
          page_name:'home'
        });
      }

      window.open(WA_BASE + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    });
  }

  function ensureContactSection() {
    var section = document.getElementById('contacto');
    if (!section) return false;

    if (section.getAttribute('data-nostra-contact-ready') !== '1') {
      section.className = 'nostra-contact-section';
      section.removeAttribute('data-bg-src');
      section.removeAttribute('style');
      section.style.backgroundImage = 'none';
      section.innerHTML = contactHTML();
      section.setAttribute('data-nostra-contact-ready', '1');
    }

    bindContactForm(section);
    return true;
  }

  function ensureMobileBar() {
    var bar = document.getElementById('nostra-mobile-conversion-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'nostra-mobile-conversion-bar';
      bar.innerHTML = '<a class="nostra-mobile-wa" href="' + WA + '" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a><a class="nostra-mobile-pre" href="' + PRE + '" data-nostra-pre-source="barra-movil">📝 Preinscripción</a>';
      document.body.appendChild(bar);
    }
    return true;
  }

  function trackClicks() {
    if (document.documentElement.getAttribute('data-nostra-pre-tracking') === '1') return;
    document.documentElement.setAttribute('data-nostra-pre-tracking', '1');

    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('[data-nostra-pre-source]') : null;
      if (!link) return;

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'click_preinscripcion', {
          event_category:'conversion',
          event_label:link.getAttribute('data-nostra-pre-source') || 'index',
          link_url:PRE,
          page_name:'home'
        });
      }
    }, true);
  }

  function run() {
    addStyle();
    ensureHeroButton();
    ensureRouteCTA();
    ensureResultsCTA();
    ensureFinalCTA();
    ensureContactSection();
    ensureMobileBar();
    trackClicks();
  }

  function start() {
    run();
    [450, 1100, 2200].forEach(function (delay) {
      window.setTimeout(run, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }

  window.addEventListener('load', run, { once:true });
})();