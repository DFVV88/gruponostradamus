/* ==================================================
   Grupo Nostradamus - Ruta Nostra estable para el index
   Inserta el bloque una sola vez y evita saltos de desplazamiento.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  var file = path.split('/').pop() || 'index.html';
  var isHome = path === '/' || file === 'index.html' || file === '';
  if (!isHome) return;

  var programs = [
    {
      href: 'ciclo-anual-uni.html',
      icon: '🌐',
      name: 'Nostra 360 UNI',
      verb: 'FORMA',
      tag: 'Formación completa desde las bases hasta nivel UNI.'
    },
    {
      href: 'ciclo-semianual-uni.html',
      icon: '⚡',
      name: 'Nostra Power UNI',
      verb: 'TRANSFORMA',
      tag: 'Corrige errores y convierte tu experiencia en estrategia.'
    },
    {
      href: 'ciclo-semestral-uni.html',
      icon: '🎯',
      name: 'Nostra Élite UNI',
      verb: 'PERFECCIONA',
      tag: 'Para quienes estuvieron cerca y van por su vacante.'
    },
    {
      href: 'ciclo-repaso-uni.html',
      icon: '🚀',
      name: 'Nostra Prime UNI',
      verb: 'DEFINE',
      tag: 'Etapa final: velocidad, seguridad y máximo rendimiento.'
    },
    {
      href: 'ciclo-elite-uni.html',
      icon: '🏆',
      name: 'Nostra Talentum UNI',
      verb: 'COMPITE',
      tag: 'Talento superior para competir por primeros lugares.'
    }
  ];

  function addStyles() {
    if (document.getElementById('nostra-ruta-premium-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ruta-premium-style';
    style.textContent = `
      #nostra-ruta-premium{
        position:relative!important;
        overflow:hidden!important;
        overflow-anchor:none!important;
        padding:92px 0 88px!important;
        background:
          radial-gradient(circle at 12% 18%,rgba(0,194,209,.30),transparent 31%),
          radial-gradient(circle at 88% 78%,rgba(255,181,57,.18),transparent 30%),
          linear-gradient(135deg,#02070d 0%,#061426 38%,#063a48 68%,#078c95 100%)!important;
        color:#fff!important;
      }
      #nostra-ruta-premium::before{
        content:"";
        position:absolute;
        inset:0;
        background-image:
          linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
        background-size:46px 46px;
        opacity:.5;
        pointer-events:none;
      }
      .nostra-ruta-wrap{
        position:relative;
        z-index:2;
        width:min(1180px,92%);
        margin:auto;
        text-align:center;
      }
      .nostra-ruta-kicker{
        display:inline-flex;
        align-items:center;
        gap:10px;
        padding:9px 18px;
        border-radius:999px;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(168,247,255,.32);
        color:#a8f7ff;
        font-weight:950;
        text-transform:uppercase;
        letter-spacing:1px;
      }
      .nostra-ruta-title{
        margin:18px 0 14px!important;
        font-size:clamp(45px,6vw,86px)!important;
        line-height:.92!important;
        font-style:italic!important;
        text-transform:uppercase!important;
        font-weight:950!important;
        background:linear-gradient(180deg,#fff 0%,#a8f7ff 28%,#00c2d1 58%,#ffcf75 100%);
        -webkit-background-clip:text;
        background-clip:text;
        -webkit-text-fill-color:transparent;
        filter:drop-shadow(0 6px 0 rgba(0,0,0,.25));
      }
      .nostra-ruta-lead{
        max-width:930px;
        margin:0 auto 36px!important;
        color:rgba(255,255,255,.88)!important;
        font-size:clamp(17px,1.45vw,21px)!important;
        line-height:1.58!important;
        font-weight:750;
      }
      .nostra-ruta-grid{
        position:relative;
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:14px;
        text-align:left;
        align-items:stretch;
      }
      .nostra-ruta-card{
        position:relative;
        min-height:156px;
        padding:17px 16px 16px;
        border-radius:22px;
        background:linear-gradient(180deg,rgba(255,255,255,.135),rgba(255,255,255,.055));
        border:1px solid rgba(255,255,255,.19);
        box-shadow:0 16px 40px rgba(0,0,0,.22);
        color:#fff!important;
        text-decoration:none!important;
        overflow:hidden;
        transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease;
      }
      .nostra-ruta-card::after{
        content:"→";
        position:absolute;
        right:15px;
        top:15px;
        width:28px;
        height:28px;
        border-radius:50%;
        display:grid;
        place-items:center;
        background:rgba(255,255,255,.10);
        color:#a8f7ff;
        font-weight:950;
      }
      .nostra-ruta-card:hover{
        transform:translateY(-8px);
        border-color:rgba(168,247,255,.58);
        box-shadow:0 24px 54px rgba(0,0,0,.32),0 0 34px rgba(0,194,209,.18);
      }
      .nostra-ruta-number{
        width:45px;
        height:45px;
        display:grid;
        place-items:center;
        border-radius:15px;
        background:linear-gradient(135deg,#00c2d1,#078c95 48%,#ffb539);
        font-size:21px;
        margin-bottom:12px;
      }
      .nostra-ruta-name{
        display:block;
        max-width:150px;
        margin-bottom:8px;
        color:#fff;
        font-size:18px;
        line-height:1.08;
        font-weight:950;
      }
      .nostra-ruta-verb{
        display:inline-flex;
        margin-bottom:8px;
        padding:5px 9px;
        border-radius:999px;
        background:rgba(255,181,57,.14);
        border:1px solid rgba(255,181,57,.34);
        color:#ffda85;
        font-size:10px;
        font-weight:950;
      }
      .nostra-ruta-tag{
        display:block;
        color:rgba(255,255,255,.76);
        font-size:12.5px;
        line-height:1.32;
        font-weight:650;
      }
      .nostra-ruta-motto{
        margin:34px auto 0!important;
        color:#fff!important;
        font-size:clamp(25px,2.9vw,43px)!important;
        font-weight:950!important;
      }
      .nostra-ruta-motto span{color:#a8f7ff;}

      @media(max-width:1100px){
        .nostra-ruta-grid{grid-template-columns:repeat(2,1fr);}
        .nostra-ruta-card{min-height:150px;}
        .nostra-ruta-name{max-width:none;}
      }
      @media(max-width:640px){
        #nostra-ruta-premium{padding:72px 0!important;}
        .nostra-ruta-grid{grid-template-columns:1fr;}
        .nostra-ruta-card{min-height:auto;}
      }
      @media(prefers-reduced-motion:reduce){
        .nostra-ruta-card{transition:none!important;}
        .nostra-ruta-card:hover{transform:none!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function cardHTML(program) {
    return '' +
      '<a class="nostra-ruta-card" href="' + program.href + '">' +
        '<span class="nostra-ruta-number">' + program.icon + '</span>' +
        '<b class="nostra-ruta-name">' + program.name + '</b>' +
        '<span class="nostra-ruta-verb">' + program.verb + '</span>' +
        '<span class="nostra-ruta-tag">' + program.tag + '</span>' +
      '</a>';
  }

  function insertRuta() {
    if (document.getElementById('nostra-ruta-premium')) return true;

    var target = document.querySelector('#course-sec,.course-area,.space');
    if (!target || !target.parentNode) return false;

    addStyles();

    var section = document.createElement('section');
    section.id = 'nostra-ruta-premium';
    section.setAttribute('data-nostra-ruta-ready', '1');
    section.innerHTML = '' +
      '<div class="nostra-ruta-wrap">' +
        '<span class="nostra-ruta-kicker">✦ Nueva línea premium Nostra UNI</span>' +
        '<h2 class="nostra-ruta-title">La Ruta Nostra UNI</h2>' +
        '<p class="nostra-ruta-lead">No todos los postulantes comienzan desde el mismo punto. Identificamos su nivel, entendemos su historia y le asignamos el programa que realmente necesita para avanzar con exigencia.</p>' +
        '<div class="nostra-ruta-grid">' + programs.map(cardHTML).join('') + '</div>' +
        '<h3 class="nostra-ruta-motto"><span>360 forma.</span> Power transforma. Élite perfecciona. Prime define. Talentum compite.</h3>' +
      '</div>';

    target.parentNode.insertBefore(section, target);
    document.dispatchEvent(new CustomEvent('nostra:ruta-ready'));
    return true;
  }

  function start() {
    addStyles();
    if (insertRuta()) return;

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (insertRuta() || attempts >= 12) window.clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();
