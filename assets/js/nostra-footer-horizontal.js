/* ==================================================
   Grupo Nostradamus - Footer horizontal global
   Reemplaza la distribución vertical por un footer compacto de tres áreas.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function addStyles() {
    var old = document.getElementById('nostra-footer-horizontal-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-footer-horizontal-style';
    style.textContent = `
      body.nostra-footer-horizontal-active .footer-wrapper.nfh-footer,
      body.nostra-footer-horizontal-active footer.nfh-footer{
        position:relative!important;
        overflow:hidden!important;
        background:
          radial-gradient(circle at 8% 10%,rgba(0,194,209,.18),transparent 31%),
          radial-gradient(circle at 92% 85%,rgba(0,139,150,.12),transparent 30%),
          linear-gradient(135deg,#03111e 0%,#02070d 54%,#061426 100%)!important;
        border-top:1px solid rgba(0,194,209,.34)!important;
        box-shadow:0 -16px 42px rgba(6,20,38,.18)!important;
      }
      body.nostra-footer-horizontal-active .nfh-footer>.shape-mockup{display:none!important;}
      body.nostra-footer-horizontal-active .nfh-footer .widget-area{
        position:relative!important;
        z-index:2!important;
        padding:42px 0 28px!important;
      }
      body.nostra-footer-horizontal-active .nfh-footer .widget-area>.container{
        width:min(1400px,calc(100% - 44px))!important;
        max-width:none!important;
      }
      body.nostra-footer-horizontal-active .nfh-main{
        display:grid!important;
        grid-template-columns:minmax(260px,.92fr) minmax(520px,1.72fr) minmax(300px,1fr)!important;
        gap:18px!important;
        align-items:stretch!important;
      }
      body.nostra-footer-horizontal-active .nfh-card{
        position:relative!important;
        min-width:0!important;
        padding:24px!important;
        border-radius:24px!important;
        background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025))!important;
        border:1px solid rgba(0,194,209,.18)!important;
        box-shadow:0 18px 42px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)!important;
        backdrop-filter:blur(10px)!important;
      }
      body.nostra-footer-horizontal-active .nfh-brand{
        display:grid!important;
        grid-template-columns:156px 1fr!important;
        gap:20px!important;
        align-items:center!important;
      }
      body.nostra-footer-horizontal-active .nfh-logo{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:12px!important;
        border-radius:19px!important;
        background:linear-gradient(180deg,#fff,#f1fbfd)!important;
        border:1px solid rgba(0,194,209,.28)!important;
        box-shadow:0 14px 30px rgba(0,0,0,.22),0 0 20px rgba(0,194,209,.11)!important;
      }
      body.nostra-footer-horizontal-active .nfh-logo img{
        display:block!important;
        width:100%!important;
        max-width:138px!important;
        height:auto!important;
        filter:none!important;
        opacity:1!important;
      }
      body.nostra-footer-horizontal-active .nfh-brand-copy p{
        margin:0 0 13px!important;
        color:rgba(232,245,250,.78)!important;
        font-size:14px!important;
        line-height:1.55!important;
        font-weight:650!important;
      }
      body.nostra-footer-horizontal-active .nfh-label{
        display:block!important;
        margin:0 0 12px!important;
        color:#fff!important;
        font-size:13px!important;
        font-weight:950!important;
        letter-spacing:.55px!important;
        text-transform:uppercase!important;
      }
      body.nostra-footer-horizontal-active .nfh-social{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
      }
      body.nostra-footer-horizontal-active .nfh-social a{
        display:grid!important;
        place-items:center!important;
        width:38px!important;
        height:38px!important;
        border-radius:13px!important;
        background:rgba(0,194,209,.10)!important;
        border:1px solid rgba(0,194,209,.26)!important;
        color:#00dbe8!important;
        box-shadow:none!important;
        transform:none!important;
      }
      body.nostra-footer-horizontal-active .nfh-social a:hover{
        background:linear-gradient(135deg,#078c95,#061426)!important;
        color:#fff!important;
        transform:translateY(-2px)!important;
      }
      body.nostra-footer-horizontal-active .nfh-nav-card{
        display:grid!important;
        grid-template-columns:minmax(160px,.72fr) minmax(330px,1.45fr)!important;
        gap:28px!important;
      }
      body.nostra-footer-horizontal-active .nfh-title{
        position:relative!important;
        margin:0 0 17px!important;
        padding-bottom:10px!important;
        color:#fff!important;
        font-size:20px!important;
        line-height:1.1!important;
        font-style:normal!important;
        font-weight:950!important;
        text-transform:uppercase!important;
        letter-spacing:.3px!important;
      }
      body.nostra-footer-horizontal-active .nfh-title::before{
        content:''!important;
        position:absolute!important;
        left:0!important;
        bottom:0!important;
        width:58px!important;
        height:3px!important;
        border-radius:999px!important;
        background:linear-gradient(90deg,#00dce8,#078c95,transparent)!important;
        box-shadow:0 0 13px rgba(0,194,209,.45)!important;
      }
      body.nostra-footer-horizontal-active .nfh-title::after{display:none!important;content:none!important;}
      body.nostra-footer-horizontal-active .nfh-list{
        list-style:none!important;
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:7px 18px!important;
        margin:0!important;
        padding:0!important;
      }
      body.nostra-footer-horizontal-active .nfh-program-list{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
      body.nostra-footer-horizontal-active .nfh-list li{
        position:relative!important;
        margin:0!important;
        padding-left:14px!important;
        line-height:1.25!important;
      }
      body.nostra-footer-horizontal-active .nfh-list li::before{
        content:''!important;
        position:absolute!important;
        left:0!important;
        top:.62em!important;
        width:5px!important;
        height:5px!important;
        border-radius:50%!important;
        background:#00dce8!important;
        box-shadow:0 0 8px rgba(0,220,232,.58)!important;
      }
      body.nostra-footer-horizontal-active .nfh-list a{
        display:inline!important;
        color:rgba(231,244,249,.82)!important;
        font-size:13.5px!important;
        line-height:1.35!important;
        font-weight:750!important;
        text-decoration:none!important;
        transform:none!important;
      }
      body.nostra-footer-horizontal-active .nfh-list a:hover{
        color:#00e5f2!important;
        text-shadow:0 0 9px rgba(0,194,209,.42)!important;
      }
      body.nostra-footer-horizontal-active .nfh-contact{
        display:flex!important;
        flex-direction:column!important;
      }
      body.nostra-footer-horizontal-active .nfh-contact-intro{
        margin:0 0 15px!important;
        color:rgba(232,245,250,.76)!important;
        font-size:14px!important;
        line-height:1.5!important;
        font-weight:650!important;
      }
      body.nostra-footer-horizontal-active .nfh-contact-list{
        display:grid!important;
        gap:10px!important;
        margin-bottom:18px!important;
      }
      body.nostra-footer-horizontal-active .nfh-contact-item{
        display:grid!important;
        grid-template-columns:34px 1fr!important;
        gap:10px!important;
        align-items:start!important;
      }
      body.nostra-footer-horizontal-active .nfh-contact-icon{
        display:grid!important;
        place-items:center!important;
        width:34px!important;
        height:34px!important;
        border-radius:11px!important;
        background:rgba(0,194,209,.11)!important;
        border:1px solid rgba(0,194,209,.24)!important;
        color:#00dce8!important;
      }
      body.nostra-footer-horizontal-active .nfh-contact-item a,
      body.nostra-footer-horizontal-active .nfh-contact-item span{
        color:rgba(237,247,250,.86)!important;
        font-size:13.5px!important;
        line-height:1.42!important;
        font-weight:700!important;
        word-break:break-word!important;
        transform:none!important;
      }
      body.nostra-footer-horizontal-active .nfh-actions{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:9px!important;
        margin-top:auto!important;
      }
      body.nostra-footer-horizontal-active .nfh-btn{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:44px!important;
        padding:11px 13px!important;
        border-radius:14px!important;
        color:#fff!important;
        font-size:12px!important;
        line-height:1.15!important;
        font-weight:950!important;
        text-align:center!important;
        text-transform:uppercase!important;
        text-decoration:none!important;
        transform:none!important;
      }
      body.nostra-footer-horizontal-active .nfh-btn--primary{
        background:linear-gradient(135deg,#d89b27 0%,#078c95 48%,#061426 100%)!important;
        border:1px solid rgba(255,255,255,.22)!important;
        box-shadow:0 12px 26px rgba(0,139,150,.20)!important;
      }
      body.nostra-footer-horizontal-active .nfh-btn--secondary{
        background:rgba(255,255,255,.07)!important;
        border:1px solid rgba(0,194,209,.26)!important;
      }
      body.nostra-footer-horizontal-active .nfh-btn:hover{
        color:#fff!important;
        transform:translateY(-2px)!important;
        box-shadow:0 16px 30px rgba(0,194,209,.23)!important;
      }
      body.nostra-footer-horizontal-active .nfh-footer .copyright-wrap,
      body.nostra-footer-horizontal-active .nfh-footer .copyright-area{
        position:relative!important;
        z-index:2!important;
        padding:0!important;
        background:rgba(0,0,0,.30)!important;
        border-top:1px solid rgba(0,194,209,.16)!important;
      }
      body.nostra-footer-horizontal-active .nfh-bottom{
        width:min(1400px,calc(100% - 44px))!important;
        margin:0 auto!important;
        padding:16px 0 22px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:18px!important;
      }
      body.nostra-footer-horizontal-active .nfh-bottom p{
        margin:0!important;
        color:rgba(230,243,248,.72)!important;
        font-size:12.5px!important;
        line-height:1.4!important;
        font-weight:700!important;
      }
      body.nostra-footer-horizontal-active .nfh-bottom-links{
        display:flex!important;
        flex-wrap:wrap!important;
        justify-content:flex-end!important;
        gap:8px 16px!important;
      }
      body.nostra-footer-horizontal-active .nfh-bottom-links a{
        color:#a9eaf0!important;
        font-size:12px!important;
        font-weight:850!important;
        text-decoration:none!important;
        transform:none!important;
      }
      @media(max-width:1199.98px){
        body.nostra-footer-horizontal-active .nfh-main{
          grid-template-columns:minmax(250px,.86fr) minmax(0,1.55fr)!important;
        }
        body.nostra-footer-horizontal-active .nfh-contact{grid-column:1/-1!important;}
        body.nostra-footer-horizontal-active .nfh-contact{
          display:grid!important;
          grid-template-columns:1fr 1.25fr auto!important;
          gap:20px!important;
          align-items:center!important;
        }
        body.nostra-footer-horizontal-active .nfh-contact .nfh-title,
        body.nostra-footer-horizontal-active .nfh-contact .nfh-contact-intro{grid-column:1!important;}
        body.nostra-footer-horizontal-active .nfh-contact-list{grid-column:2!important;grid-row:1/3!important;margin:0!important;}
        body.nostra-footer-horizontal-active .nfh-actions{grid-column:3!important;grid-row:1/3!important;grid-template-columns:1fr!important;min-width:190px!important;}
      }
      @media(max-width:899.98px){
        body.nostra-footer-horizontal-active .nfh-main{grid-template-columns:1fr!important;}
        body.nostra-footer-horizontal-active .nfh-contact{grid-column:auto!important;display:flex!important;}
        body.nostra-footer-horizontal-active .nfh-brand{grid-template-columns:132px 1fr!important;}
        body.nostra-footer-horizontal-active .nfh-nav-card{grid-template-columns:.7fr 1.3fr!important;}
      }
      @media(max-width:575.98px){
        body.nostra-footer-horizontal-active .nfh-footer .widget-area{padding:30px 0 20px!important;}
        body.nostra-footer-horizontal-active .nfh-footer .widget-area>.container,
        body.nostra-footer-horizontal-active .nfh-bottom{width:min(100% - 28px,1400px)!important;}
        body.nostra-footer-horizontal-active .nfh-card{padding:20px!important;border-radius:20px!important;}
        body.nostra-footer-horizontal-active .nfh-brand{grid-template-columns:1fr!important;text-align:center!important;}
        body.nostra-footer-horizontal-active .nfh-logo{max-width:210px!important;margin:0 auto!important;}
        body.nostra-footer-horizontal-active .nfh-social{justify-content:center!important;}
        body.nostra-footer-horizontal-active .nfh-nav-card{grid-template-columns:1fr!important;gap:22px!important;}
        body.nostra-footer-horizontal-active .nfh-program-list{grid-template-columns:1fr!important;}
        body.nostra-footer-horizontal-active .nfh-actions{grid-template-columns:1fr!important;}
        body.nostra-footer-horizontal-active .nfh-bottom{align-items:flex-start!important;flex-direction:column!important;padding-bottom:104px!important;}
        body.nostra-footer-horizontal-active .nfh-bottom-links{justify-content:flex-start!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function footerHTML() {
    return '' +
      '<div class="container">' +
        '<div class="nfh-main">' +
          '<section class="nfh-card nfh-brand" aria-label="Grupo Nostradamus">' +
            '<a class="nfh-logo" href="index.html" aria-label="Ir al inicio"><img src="assets/img/logo-nostradamus-1.png" alt="Grupo Nostradamus"></a>' +
            '<div class="nfh-brand-copy">' +
              '<p>Grupo de estudio especializado en preparación UNI, práctica intensiva y acompañamiento académico.</p>' +
              '<span class="nfh-label">Síguenos</span>' +
              '<div class="nfh-social">' +
                '<a href="https://www.facebook.com/gruponostradamus" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
                '<a href="https://www.instagram.com/gruponostradamus/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
                '<a href="https://www.tiktok.com/@grupo_nostradamus" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>' +
                '<a href="https://www.youtube.com/@GrupoNostradamus" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fab fa-youtube"></i></a>' +
              '</div>' +
            '</div>' +
          '</section>' +
          '<section class="nfh-card nfh-nav-card" aria-label="Navegación y programas">' +
            '<div>' +
              '<h3 class="nfh-title">Enlaces</h3>' +
              '<ul class="nfh-list">' +
                '<li><a href="index.html">Inicio</a></li>' +
                '<li><a href="ciclos.html">Ciclos</a></li>' +
                '<li><a href="sedes.html">Sede UNI</a></li>' +
                '<li><a href="docentes.html">Docentes</a></li>' +
                '<li><a href="cachimbos.html">Cachimbos</a></li>' +
                '<li><a href="blog.html">Noticias</a></li>' +
                '<li><a href="cuenta-nostra.html">NostraCUENTA</a></li>' +
              '</ul>' +
            '</div>' +
            '<div>' +
              '<h3 class="nfh-title">Programas académicos</h3>' +
              '<ul class="nfh-list nfh-program-list">' +
                '<li><a href="ciclo-anual-uni.html">Nostra 360 UNI</a></li>' +
                '<li><a href="ciclo-semianual-uni.html">Nostra Power UNI</a></li>' +
                '<li><a href="ciclo-semestral-uni.html">Nostra Élite UNI</a></li>' +
                '<li><a href="ciclo-repaso-uni.html">Nostra Prime UNI</a></li>' +
                '<li><a href="ciclo-elite-uni.html">Nostra Talentum UNI</a></li>' +
                '<li><a href="ciclo-ien.html">IEN UNI</a></li>' +
                '<li><a href="ciclo-proyecto-escolar.html">Proyecto Escolar</a></li>' +
                '<li><a href="ciclo-paralelo-cepre-uni.html">Paralelo CEPRE UNI</a></li>' +
                '<li><a href="ciclo-verano-uni.html">Ciclo Verano UNI</a></li>' +
              '</ul>' +
            '</div>' +
          '</section>' +
          '<section class="nfh-card nfh-contact" aria-label="Contacto y matrícula">' +
            '<div>' +
              '<h3 class="nfh-title">Matrícula e informes</h3>' +
              '<p class="nfh-contact-intro">Conoce el programa adecuado y asegura tu vacante para iniciar tu preparación.</p>' +
            '</div>' +
            '<div class="nfh-contact-list">' +
              '<div class="nfh-contact-item"><span class="nfh-contact-icon"><i class="fas fa-location-dot"></i></span><a href="https://maps.app.goo.gl/XUF3vLuP6svEMZzj7" target="_blank" rel="noopener noreferrer">Gerardo Unger 193, Lima 15102</a></div>' +
              '<div class="nfh-contact-item"><span class="nfh-contact-icon"><i class="fas fa-envelope"></i></span><a href="mailto:informes@gruponostradamus.edu.pe">informes@gruponostradamus.edu.pe</a></div>' +
              '<div class="nfh-contact-item"><span class="nfh-contact-icon"><i class="fas fa-phone"></i></span><a href="https://wa.me/51993750351?text=Hola%20Nostradamus,%20quiero%20informes%20sobre%20los%20ciclos%20UNI." target="_blank" rel="noopener noreferrer">+51 993 750 351</a></div>' +
            '</div>' +
            '<div class="nfh-actions">' +
              '<a class="nfh-btn nfh-btn--primary" href="preinscripcion.html">Preinscribirme</a>' +
              '<a class="nfh-btn nfh-btn--secondary" href="https://wa.me/51993750351?text=Hola%20Nostradamus,%20quiero%20informes%20para%20matricularme." target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>';
  }

  function bottomHTML() {
    return '' +
      '<div class="nfh-bottom">' +
        '<p>© 2026 NOSTRA S.A.C. · Grupo Nostradamus. Todos los derechos reservados.</p>' +
        '<div class="nfh-bottom-links">' +
          '<a href="index.html">Inicio</a>' +
          '<a href="ciclos.html">Programas</a>' +
          '<a href="cuenta-nostra.html">NostraCUENTA</a>' +
          '<a href="index.html#contacto">Contacto</a>' +
        '</div>' +
      '</div>';
  }

  function enhanceFooter() {
    var footer = document.querySelector('footer.footer-wrapper,.footer-wrapper');
    if (!footer) return false;
    if (footer.getAttribute('data-nfh-ready') === '1') return true;

    var widgetArea = footer.querySelector('.widget-area');
    var copyright = footer.querySelector('.copyright-wrap,.copyright-area');
    if (!widgetArea || !copyright) return false;

    addStyles();
    document.body.classList.add('nostra-footer-horizontal-active');
    footer.classList.add('nfh-footer');
    widgetArea.innerHTML = footerHTML();
    copyright.innerHTML = bottomHTML();
    footer.setAttribute('data-nfh-ready', '1');
    return true;
  }

  function start() {
    addStyles();
    if (enhanceFooter()) return;

    var observer = new MutationObserver(function () {
      if (enhanceFooter()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (enhanceFooter() || attempts >= 30) {
        window.clearInterval(timer);
        observer.disconnect();
      }
    }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();