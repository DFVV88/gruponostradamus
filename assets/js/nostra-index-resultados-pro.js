/* Grupo Nostradamus - Resultados institucionales premium en el index */
(function () {
  'use strict';

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!(file === 'index.html' || file === '' || location.pathname === '/')) return;

  var RESULTS = [
    {
      value: 16,
      decimals: 0,
      suffix: '+',
      icon: 'fa-award',
      label: 'Años de experiencia',
      copy: 'Preparación especializada para postulantes a la UNI.'
    },
    {
      value: 2.5,
      decimals: 1,
      suffix: 'K+',
      icon: 'fa-user-graduate',
      label: 'Egresados formados',
      copy: 'Una comunidad que respalda nuestra trayectoria académica.'
    },
    {
      value: 3.1,
      decimals: 1,
      suffix: 'K+',
      icon: 'fa-users',
      label: 'Estudiantes acompañados',
      copy: 'Formación, seguimiento y orientación durante su preparación.'
    },
    {
      value: 90,
      decimals: 0,
      suffix: '%+',
      icon: 'fa-star',
      label: 'Satisfacción estudiantil',
      copy: 'Confianza construida con método, exigencia y acompañamiento.'
    }
  ];

  function addStyle() {
    if (document.getElementById('nostra-index-resultados-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-index-resultados-pro-style';
    style.textContent = `
      .counter-area-2.nostra-results-pro{position:relative!important;padding:76px 0 70px!important;background:radial-gradient(circle at 8% 12%,rgba(15,175,194,.28),transparent 30%),radial-gradient(circle at 92% 84%,rgba(255,181,57,.13),transparent 26%),linear-gradient(135deg,#03111d 0%,#062b38 48%,#087e88 100%)!important;overflow:hidden!important;isolation:isolate!important}
      .counter-area-2.nostra-results-pro:before{content:'';position:absolute;inset:0;z-index:-2;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent);pointer-events:none}
      .counter-area-2.nostra-results-pro:after{content:'';position:absolute;width:430px;height:430px;right:-170px;top:-210px;z-index:-1;border:1px solid rgba(168,247,255,.14);border-radius:50%;box-shadow:0 0 0 48px rgba(168,247,255,.025),0 0 0 96px rgba(168,247,255,.02);pointer-events:none}
      .nostra-results-pro .nostra-results-head{max-width:820px;margin:0 auto 34px;text-align:center}
      .nostra-results-pro .nostra-results-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:12px;padding:7px 12px;border:1px solid rgba(168,247,255,.28);border-radius:999px;background:rgba(15,175,194,.10);color:#a8f7ff;font-size:11.5px;font-weight:900;letter-spacing:.75px;text-transform:uppercase}
      .nostra-results-pro .nostra-results-kicker:before{content:'';width:7px;height:7px;border-radius:50%;background:#ffd36a;box-shadow:0 0 0 4px rgba(255,211,106,.15)}
      .nostra-results-pro .nostra-results-title{margin:0 0 10px!important;color:#fff!important;font-size:clamp(32px,4vw,52px)!important;line-height:1.02!important;font-weight:950!important;letter-spacing:-1.2px!important}
      .nostra-results-pro .nostra-results-lead{max-width:680px;margin:0 auto!important;color:rgba(255,255,255,.76)!important;font-size:15.5px!important;line-height:1.58!important;font-weight:600!important}
      .nostra-results-pro .nostra-results-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:0}
      .nostra-results-pro .nostra-result-card{position:relative;min-height:228px;padding:25px 22px 23px;border:1px solid rgba(168,247,255,.18);border-radius:22px;background:linear-gradient(155deg,rgba(255,255,255,.10),rgba(255,255,255,.045));box-shadow:0 20px 46px rgba(0,0,0,.19),inset 0 1px 0 rgba(255,255,255,.10);backdrop-filter:blur(10px);overflow:hidden;transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease}
      .nostra-results-pro .nostra-result-card:before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#0fafc2,#4ac7d3,#ffd36a);opacity:.82}
      .nostra-results-pro .nostra-result-card:after{content:'';position:absolute;width:120px;height:120px;right:-52px;bottom:-66px;border-radius:50%;background:radial-gradient(circle,rgba(74,199,211,.18),transparent 68%);pointer-events:none}
      .nostra-results-pro .nostra-result-card:hover{transform:translateY(-6px);border-color:rgba(168,247,255,.34);box-shadow:0 28px 58px rgba(0,0,0,.24),0 0 30px rgba(15,175,194,.10)}
      .nostra-results-pro .nostra-result-icon{width:44px;height:44px;display:grid;place-items:center;margin-bottom:17px;border:1px solid rgba(168,247,255,.24);border-radius:14px;background:rgba(15,175,194,.13);color:#a8f7ff;font-size:18px;box-shadow:0 10px 22px rgba(0,0,0,.12)}
      .nostra-results-pro .nostra-result-number{display:flex;align-items:flex-start;gap:2px;margin:0 0 7px!important;font-style:normal!important;font-size:clamp(38px,4.2vw,57px)!important;line-height:.92!important;font-weight:950!important;letter-spacing:-1.8px!important;background:linear-gradient(180deg,#fff 0%,#91e9ef 58%,#24b6c3 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;text-shadow:none!important}
      .nostra-results-pro .nostra-result-suffix{margin-top:3px;font-size:.48em;line-height:1;font-weight:900;letter-spacing:-.3px}
      .nostra-results-pro .nostra-result-label{margin:0 0 7px!important;color:#fff!important;font-size:16px!important;line-height:1.2!important;font-weight:850!important}
      .nostra-results-pro .nostra-result-copy{margin:0!important;color:rgba(255,255,255,.66)!important;font-size:12.75px!important;line-height:1.46!important;font-weight:550!important}
      .nostra-results-pro .nostra-results-note{margin:23px 0 0!important;text-align:center;color:rgba(255,255,255,.52)!important;font-size:11.5px!important;line-height:1.45!important;font-weight:600!important}
      @media(max-width:1100px){
        .nostra-results-pro .nostra-results-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .nostra-results-pro .nostra-result-card{min-height:210px}
      }
      @media(max-width:767px){
        .counter-area-2.nostra-results-pro{padding:58px 0 54px!important}
        .nostra-results-pro .container{width:min(94%,620px)}
        .nostra-results-pro .nostra-results-head{margin-bottom:26px}
        .nostra-results-pro .nostra-results-title{font-size:34px!important}
        .nostra-results-pro .nostra-results-lead{font-size:14.5px!important}
        .nostra-results-pro .nostra-results-grid{grid-template-columns:1fr;gap:13px}
        .nostra-results-pro .nostra-result-card{min-height:auto;padding:22px 20px}
        .nostra-results-pro .nostra-result-number{font-size:45px!important}
      }
      @media(prefers-reduced-motion:reduce){
        .nostra-results-pro .nostra-result-card{transition:none}
      }
    `;
    document.head.appendChild(style);
  }

  function cardHTML(item, index) {
    return '' +
      '<article class="nostra-result-card" data-result-index="' + index + '">' +
        '<span class="nostra-result-icon" aria-hidden="true"><i class="fas ' + item.icon + '"></i></span>' +
        '<h3 class="nostra-result-number"><span class="nostra-result-value" data-value="' + item.value + '" data-decimals="' + item.decimals + '">0</span><span class="nostra-result-suffix">' + item.suffix + '</span></h3>' +
        '<p class="nostra-result-label">' + item.label + '</p>' +
        '<p class="nostra-result-copy">' + item.copy + '</p>' +
      '</article>';
  }

  function animateNumber(el) {
    if (!el || el.getAttribute('data-animated') === '1') return;
    el.setAttribute('data-animated', '1');

    var target = parseFloat(el.getAttribute('data-value') || '0');
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !window.requestAnimationFrame) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    var start = null;
    var duration = 1150;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) window.requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }

    window.requestAnimationFrame(step);
  }

  function observeNumbers(section) {
    var values = section.querySelectorAll('.nostra-result-value');

    if (!('IntersectionObserver' in window)) {
      values.forEach(animateNumber);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        values.forEach(animateNumber);
        observer.disconnect();
      });
    }, { threshold: 0.25 });

    observer.observe(section);
  }

  function render() {
    addStyle();

    var section = document.querySelector('.counter-area-2');
    if (!section) return false;
    if (section.getAttribute('data-nostra-results-ready') === '1') return true;

    var container = section.querySelector('.container');
    if (!container) return false;

    section.classList.add('nostra-results-pro');
    section.removeAttribute('data-bg-src');
    section.style.backgroundImage = 'none';

    container.innerHTML = '' +
      '<header class="nostra-results-head">' +
        '<span class="nostra-results-kicker">Nuestra trayectoria</span>' +
        '<h2 class="nostra-results-title">Resultados que hablan por nosotros</h2>' +
        '<p class="nostra-results-lead">Más de 16 años acompañando a estudiantes con preparación especializada, seguimiento académico y exigencia orientada a la UNI.</p>' +
      '</header>' +
      '<div class="nostra-results-grid">' + RESULTS.map(cardHTML).join('') + '</div>' +
      '<p class="nostra-results-note">Cifras acumuladas de la comunidad académica de Grupo Nostradamus.</p>';

    section.setAttribute('data-nostra-results-ready', '1');
    observeNumbers(section);
    return true;
  }

  function start() {
    render();
    [220, 650, 1300, 2400].forEach(function (delay) {
      window.setTimeout(render, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('load', render, { once: true });
})();
