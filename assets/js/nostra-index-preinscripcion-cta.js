/* Grupo Nostradamus - Preinscripción estratégica en el index */
(function () {
  'use strict';

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!(file === 'index.html' || file === '' || location.pathname === '/')) return;

  var PRE = 'https://gruponostradamus.edu.pe/preinscripcion.html';
  var WA = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, necesito orientación para elegir mi ciclo y completar mi preinscripción.');

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
      #nostra-mobile-conversion-bar{display:none;}
      @media(max-width:991px){.nostra-pre-wrap{grid-template-columns:1fr;text-align:center}.nostra-pre-actions{justify-content:center}.nostra-pre-copy{margin-left:auto!important;margin-right:auto!important;}}
      @media(max-width:767px){
        body{padding-bottom:72px!important;}
        #hero .nostra-home-actions{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;}
        #hero .nostra-home-actions .th-btn,#hero .nostra-home-actions .nostra-pre-btn{min-width:min(260px,100%)!important;}
        .nostra-pre-section{padding:28px 0;}
        .nostra-pre-wrap{width:min(94%,620px);padding:24px 18px;border-radius:22px;gap:20px;}
        .nostra-pre-title{font-size:29px!important;}
        .nostra-pre-actions{display:grid;width:100%;}
        .nostra-pre-btn{width:100%;}
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
      'Completa tu preinscripción en pocos minutos. Nuestro equipo revisará tus datos y te orientará para elegir el ciclo adecuado según tu nivel y tu meta UNI.',
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
          event_category: 'conversion',
          event_label: link.getAttribute('data-nostra-pre-source') || 'index',
          link_url: PRE,
          page_name: 'home'
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
    ensureMobileBar();
    trackClicks();
  }

  function start() {
    run();
    var attempts = 0;
    var timer = setInterval(function () {
      run();
      attempts += 1;
      if (attempts >= 40) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('load', run);
})();
