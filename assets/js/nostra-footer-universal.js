/* ==================================================
   Grupo Nostradamus - Footer universal
   Replica el footer comercial del index en todas las páginas,
   excepto iq100.html. Sustituye pies antiguos o simplificados.
================================================== */
(function () {
  'use strict';

  var path = String(window.location.pathname || '').toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;
  if (window.__NOSTRA_UNIVERSAL_FOOTER__) return;
  window.__NOSTRA_UNIVERSAL_FOOTER__ = true;

  var VERSION = '2026-91';
  var FOOTER_ID = 'nostra-global-footer';
  var STYLE_ID = 'nostra-global-footer-style';
  var WHATSAPP = 'https://wa.me/51993750351?text=Hola%20Nostradamus,%20quiero%20informes%20sobre%20los%20ciclos%20UNI.';

  function svgIcon(name) {
    var icons = {
      facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 22v-9h3l.5-3.5h-3.5V7.2c0-1 .3-1.7 1.8-1.7h1.9V2.4c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.4H6.7V13h3.1v9h3.8z"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2zm-.2 2A3 3 0 0 0 4 7v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm10.3 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>',
      tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 2c.4 2.4 1.8 3.8 4.2 4.2v3.3a8.5 8.5 0 0 1-4.2-1.1v6.4a6.2 6.2 0 1 1-5.4-6.1v3.4a2.9 2.9 0 1 0 2.1 2.8V2h3.3z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"/></svg>',
      pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>',
      mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm9 7 8-5H4l8 5zm0 2L3 8.4V17h18V8.4L12 14z"/></svg>',
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.7 15.7 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.7 3.8.7.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 3.7c0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.3.2 2.6.7 3.8.1.4 0 .8-.2 1.1l-2.2 2.2z"/></svg>',
      up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4-8 8 1.8 1.8 4.9-4.9V21h2.6V8.9l4.9 4.9L20 12l-8-8z"/></svg>'
    };
    return icons[name] || '';
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '\
      #nostra-global-footer{position:relative;z-index:30;isolation:isolate;overflow:hidden;width:100%;max-width:none;margin:0;padding:0!important;background:radial-gradient(circle at 8% 10%,rgba(0,194,209,.17),transparent 31%),radial-gradient(circle at 92% 82%,rgba(0,139,150,.12),transparent 29%),linear-gradient(135deg,#03111e 0%,#02070d 54%,#061426 100%);border:0;border-top:1px solid rgba(0,194,209,.34);border-radius:0;box-shadow:0 -16px 42px rgba(6,20,38,.18);color:#fff;font-family:Jost,Arial,sans-serif;font-size:16px;line-height:1.4;text-align:left}\
      #nostra-global-footer *{box-sizing:border-box}\
      #nostra-global-footer a{text-decoration:none}\
      #nostra-global-footer .ngf-wrap{width:min(1760px,calc(100% - 82px));margin:0 auto}\
      #nostra-global-footer .ngf-main{display:grid;grid-template-columns:minmax(330px,.95fr) minmax(650px,1.75fr) minmax(360px,1fr);gap:22px;align-items:stretch;padding:48px 0 36px}\
      #nostra-global-footer .ngf-card{min-width:0;padding:28px;border:1px solid rgba(0,194,209,.19);border-radius:29px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025));box-shadow:0 18px 42px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06);backdrop-filter:blur(10px)}\
      #nostra-global-footer .ngf-brand{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}\
      #nostra-global-footer .ngf-logo{display:flex;align-items:center;justify-content:center;width:min(240px,84%);padding:14px;border-radius:22px;background:linear-gradient(180deg,#fff,#f1fbfd);border:1px solid rgba(0,194,209,.28);box-shadow:0 14px 30px rgba(0,0,0,.22),0 0 20px rgba(0,194,209,.11)}\
      #nostra-global-footer .ngf-logo img{display:block;width:100%;height:auto;max-width:210px;filter:none;opacity:1}\
      #nostra-global-footer .ngf-brand-copy{max-width:310px;margin:21px auto 0;color:rgba(232,245,250,.78);font-size:15px;line-height:1.45;font-weight:800;text-transform:uppercase}\
      #nostra-global-footer .ngf-follow{display:block;margin:24px 0 13px;color:#fff;font-size:18px;font-weight:950;text-transform:uppercase;letter-spacing:.45px}\
      #nostra-global-footer .ngf-social{display:flex;flex-wrap:wrap;justify-content:center;gap:11px}\
      #nostra-global-footer .ngf-social a{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;background:rgba(0,194,209,.10);border:1px solid rgba(0,194,209,.31);color:#00dbe8;transition:.2s ease}\
      #nostra-global-footer .ngf-social a:hover{background:linear-gradient(135deg,#078c95,#061426);color:#fff;transform:translateY(-2px)}\
      #nostra-global-footer svg{display:block;width:21px;height:21px;fill:currentColor}\
      #nostra-global-footer .ngf-navigation{display:grid;grid-template-columns:minmax(190px,.72fr) minmax(390px,1.45fr);gap:38px}\
      #nostra-global-footer .ngf-title{position:relative;margin:0 0 23px;padding-bottom:12px;color:#fff;font-family:"Baloo 2",Jost,Arial,sans-serif;font-size:28px;line-height:1.05;font-weight:950;text-transform:uppercase;letter-spacing:.25px}\
      #nostra-global-footer .ngf-title:after{content:"";position:absolute;left:0;bottom:0;width:64px;height:3px;border-radius:999px;background:linear-gradient(90deg,#00dce8,#078c95,transparent);box-shadow:0 0 13px rgba(0,194,209,.45)}\
      #nostra-global-footer .ngf-list{display:grid;grid-template-columns:1fr;gap:12px;margin:0;padding:0;list-style:none}\
      #nostra-global-footer .ngf-programs{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 24px}\
      #nostra-global-footer .ngf-list li{position:relative;margin:0;padding-left:18px;line-height:1.28}\
      #nostra-global-footer .ngf-list li:before{content:"";position:absolute;left:0;top:.62em;width:6px;height:6px;border-radius:50%;background:#00dce8;box-shadow:0 0 9px rgba(0,220,232,.58)}\
      #nostra-global-footer .ngf-list a{color:rgba(231,244,249,.82);font-size:16px;font-weight:800;transition:.2s ease}\
      #nostra-global-footer .ngf-list a:hover{color:#00e5f2;text-shadow:0 0 9px rgba(0,194,209,.42)}\
      #nostra-global-footer .ngf-contact{display:flex;flex-direction:column}\
      #nostra-global-footer .ngf-contact-intro{margin:0 0 20px;color:rgba(232,245,250,.76);font-size:16px;line-height:1.5;font-weight:700}\
      #nostra-global-footer .ngf-contact-list{display:grid;gap:14px;margin-bottom:24px}\
      #nostra-global-footer .ngf-contact-item{display:grid;grid-template-columns:44px 1fr;gap:13px;align-items:center}\
      #nostra-global-footer .ngf-contact-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:rgba(0,194,209,.11);border:1px solid rgba(0,194,209,.27);color:#00dce8}\
      #nostra-global-footer .ngf-contact-item a{color:rgba(237,247,250,.88);font-size:15px;line-height:1.35;font-weight:800;word-break:break-word}\
      #nostra-global-footer .ngf-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto}\
      #nostra-global-footer .ngf-btn{display:inline-flex;align-items:center;justify-content:center;min-height:64px;padding:13px 16px;border-radius:18px;color:#fff;font-size:14px;line-height:1.1;font-weight:950;text-align:center;text-transform:uppercase;transition:.2s ease}\
      #nostra-global-footer .ngf-btn--primary{background:linear-gradient(135deg,#d89b27 0%,#16bfb7 42%,#078c95 67%,#061426 100%);border:1px solid rgba(255,255,255,.24);box-shadow:0 12px 26px rgba(0,139,150,.23)}\
      #nostra-global-footer .ngf-btn--secondary{background:rgba(255,255,255,.07);border:1px solid rgba(0,194,209,.31)}\
      #nostra-global-footer .ngf-btn:hover{color:#fff;transform:translateY(-2px);box-shadow:0 16px 30px rgba(0,194,209,.24)}\
      #nostra-global-footer .ngf-bottom{border-top:1px solid rgba(0,194,209,.16);background:rgba(0,0,0,.30)}\
      #nostra-global-footer .ngf-bottom-inner{width:min(1760px,calc(100% - 82px));margin:0 auto;padding:20px 0 24px;display:flex;align-items:center;justify-content:space-between;gap:22px}\
      #nostra-global-footer .ngf-copy{margin:0;color:rgba(230,243,248,.72);font-size:14px;line-height:1.4;font-weight:750;white-space:nowrap}\
      #nostra-global-footer .ngf-legal{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px 21px}\
      #nostra-global-footer .ngf-legal a{color:#a9eaf0;font-size:13px;font-weight:900;white-space:nowrap}\
      #nostra-global-footer .ngf-legal a:hover{color:#fff}\
      .ngf-scroll-top{position:fixed;right:18px;bottom:83px;z-index:9990;display:grid;place-items:center;width:58px;height:58px;padding:0;border-radius:50%;border:5px solid #0794a2;background:#fff;color:#078c95;box-shadow:0 10px 28px rgba(2,7,13,.28);cursor:pointer}\
      .ngf-scroll-top svg{width:27px;height:27px;fill:currentColor}\
      .ngf-floating-wa{position:fixed;right:18px;bottom:18px;z-index:9985;display:flex;align-items:center;gap:11px;padding:12px 20px;border-radius:999px;background:linear-gradient(135deg,#078c95,#02070d);border:1px solid rgba(0,220,232,.35);box-shadow:0 16px 38px rgba(2,7,13,.32);color:#fff!important;font-family:Jost,Arial,sans-serif;text-decoration:none!important}\
      .ngf-floating-wa .ngf-wa-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);font-size:21px}\
      .ngf-floating-wa small,.ngf-floating-wa strong{display:block;line-height:1.05;text-transform:uppercase}\
      .ngf-floating-wa small{font-size:12px;font-weight:850}.ngf-floating-wa strong{font-size:17px;font-weight:950}\
      @media(max-width:1299px){#nostra-global-footer .ngf-wrap,#nostra-global-footer .ngf-bottom-inner{width:min(100% - 44px,1400px)}#nostra-global-footer .ngf-main{grid-template-columns:minmax(270px,.9fr) minmax(0,1.5fr)}#nostra-global-footer .ngf-contact{grid-column:1/-1;display:grid;grid-template-columns:1fr 1.15fr auto;gap:24px;align-items:center}#nostra-global-footer .ngf-contact .ngf-title,#nostra-global-footer .ngf-contact .ngf-contact-intro{grid-column:1}#nostra-global-footer .ngf-contact-list{grid-column:2;grid-row:1/3;margin:0}#nostra-global-footer .ngf-actions{grid-column:3;grid-row:1/3;grid-template-columns:1fr;min-width:210px}}\
      @media(max-width:900px){#nostra-global-footer .ngf-main{grid-template-columns:1fr}#nostra-global-footer .ngf-navigation{grid-template-columns:1fr 1.35fr}#nostra-global-footer .ngf-contact{grid-column:auto;display:flex}#nostra-global-footer .ngf-bottom-inner{align-items:flex-start;flex-direction:column}#nostra-global-footer .ngf-legal{justify-content:flex-start}.ngf-floating-wa{max-width:calc(100vw - 36px)}}\
      @media(max-width:620px){#nostra-global-footer .ngf-wrap,#nostra-global-footer .ngf-bottom-inner{width:min(100% - 28px,1400px)}#nostra-global-footer .ngf-main{padding:30px 0 22px;gap:16px}#nostra-global-footer .ngf-card{padding:21px;border-radius:22px}#nostra-global-footer .ngf-navigation{grid-template-columns:1fr;gap:27px}#nostra-global-footer .ngf-programs{grid-template-columns:1fr}#nostra-global-footer .ngf-title{font-size:23px}#nostra-global-footer .ngf-actions{grid-template-columns:1fr}#nostra-global-footer .ngf-bottom-inner{padding-bottom:100px}#nostra-global-footer .ngf-copy{white-space:normal}.ngf-scroll-top{right:13px;bottom:85px;width:52px;height:52px}.ngf-floating-wa{right:13px;bottom:14px;padding:10px 14px}.ngf-floating-wa small{display:none}.ngf-floating-wa strong{font-size:14px}}\
      @media print{#nostra-global-footer,.ngf-scroll-top,.ngf-floating-wa,.nostra-floating-whatsapp,.float-wa,.scroll-top{display:none!important}}';
    document.head.appendChild(style);
  }

  function footerMarkup() {
    return '' +
      '<footer id="' + FOOTER_ID + '" data-version="' + VERSION + '">' +
        '<div class="ngf-wrap">' +
          '<div class="ngf-main">' +
            '<section class="ngf-card ngf-brand" aria-label="Grupo Nostradamus">' +
              '<a class="ngf-logo" href="index.html" aria-label="Ir al inicio"><img src="assets/img/logo-nostradamus-1.png" alt="Grupo Nostradamus"></a>' +
              '<p class="ngf-brand-copy">Grupo de estudio especializado en preparación UNI.</p>' +
              '<span class="ngf-follow">Síguenos</span>' +
              '<div class="ngf-social">' +
                '<a href="https://www.facebook.com/gruponostradamus" target="_blank" rel="noopener noreferrer" aria-label="Facebook">' + svgIcon('facebook') + '</a>' +
                '<a href="https://www.instagram.com/gruponostradamus/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' + svgIcon('instagram') + '</a>' +
                '<a href="https://www.tiktok.com/@grupo_nostradamus" target="_blank" rel="noopener noreferrer" aria-label="TikTok">' + svgIcon('tiktok') + '</a>' +
                '<a href="https://www.youtube.com/@GrupoNostradamus" target="_blank" rel="noopener noreferrer" aria-label="YouTube">' + svgIcon('youtube') + '</a>' +
              '</div>' +
            '</section>' +
            '<section class="ngf-card ngf-navigation" aria-label="Navegación y programas">' +
              '<div>' +
                '<h2 class="ngf-title">Enlaces</h2>' +
                '<ul class="ngf-list">' +
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
                '<h2 class="ngf-title">Programas académicos</h2>' +
                '<ul class="ngf-list ngf-programs">' +
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
            '<section class="ngf-card ngf-contact" aria-label="Matrícula e informes">' +
              '<div>' +
                '<h2 class="ngf-title">Matrícula e informes</h2>' +
                '<p class="ngf-contact-intro">Conoce el programa adecuado y asegura tu vacante para iniciar tu preparación.</p>' +
              '</div>' +
              '<div class="ngf-contact-list">' +
                '<div class="ngf-contact-item"><span class="ngf-contact-icon">' + svgIcon('pin') + '</span><a href="https://www.google.com/maps/search/?api=1&query=Av.%20Gerardo%20Unger%20239%2C%20San%20Mart%C3%ADn%20de%20Porres%2C%20Lima" target="_blank" rel="noopener noreferrer">Gerardo Unger 239, Lima 15102</a></div>' +
                '<div class="ngf-contact-item"><span class="ngf-contact-icon">' + svgIcon('mail') + '</span><a href="mailto:informes@gruponostradamus.edu.pe">informes@gruponostradamus.edu.pe</a></div>' +
                '<div class="ngf-contact-item"><span class="ngf-contact-icon">' + svgIcon('phone') + '</span><a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer">+51 993 750 351</a></div>' +
              '</div>' +
              '<div class="ngf-actions">' +
                '<a class="ngf-btn ngf-btn--primary" href="preinscripcion.html">Matricularme y pagar</a>' +
                '<a class="ngf-btn ngf-btn--secondary" href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
              '</div>' +
            '</section>' +
          '</div>' +
        '</div>' +
        '<div class="ngf-bottom">' +
          '<div class="ngf-bottom-inner">' +
            '<p class="ngf-copy">© 2026 NOSTRA S.A.C. · Grupo Nostradamus. Todos los derechos reservados.</p>' +
            '<nav class="ngf-legal" aria-label="Enlaces legales">' +
              '<a href="index.html">Inicio</a>' +
              '<a href="ciclos.html">Programas</a>' +
              '<a href="cuenta-nostra.html">NostraCUENTA</a>' +
              '<a href="contacto.html">Contacto</a>' +
              '<a href="terminos-y-condiciones.html">Términos y condiciones</a>' +
              '<a href="politica-cambios-devoluciones.html">Cambios y devoluciones</a>' +
              '<a href="politica-de-privacidad.html">Política de privacidad</a>' +
              '<a href="libro-de-reclamaciones.html">Libro de Reclamaciones</a>' +
            '</nav>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  function removeLegacyFooters() {
    var selectors = [
      'body > footer:not(#' + FOOTER_ID + ')',
      'body > .footer-wrapper:not(#' + FOOTER_ID + ')',
      'footer.footer-wrapper:not(#' + FOOTER_ID + ')',
      'footer.footer:not(#' + FOOTER_ID + ')',
      '.footer-wrapper:not(#' + FOOTER_ID + ')'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (node) {
      if (node && node.id !== FOOTER_ID) node.remove();
    });
  }

  function removeLegacyFloatingControls() {
    document.querySelectorAll('.nostra-floating-whatsapp,.float-wa,.scroll-top').forEach(function (node) {
      if (node && !node.classList.contains('ngf-floating-wa') && !node.classList.contains('ngf-scroll-top')) {
        node.remove();
      }
    });
  }

  function ensureFooter() {
    addStyles();
    removeLegacyFooters();
    removeLegacyFloatingControls();

    var existing = document.getElementById(FOOTER_ID);
    if (!existing) {
      var holder = document.createElement('div');
      holder.innerHTML = footerMarkup();
      document.body.appendChild(holder.firstElementChild);
    }

    if (!document.querySelector('.ngf-scroll-top')) {
      var top = document.createElement('button');
      top.type = 'button';
      top.className = 'ngf-scroll-top';
      top.setAttribute('aria-label', 'Volver arriba');
      top.innerHTML = svgIcon('up');
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(top);
    }

    if (!document.querySelector('.ngf-floating-wa')) {
      var wa = document.createElement('a');
      wa.className = 'ngf-floating-wa';
      wa.href = WHATSAPP;
      wa.target = '_blank';
      wa.rel = 'noopener noreferrer';
      wa.setAttribute('aria-label', 'Informes y matrícula por WhatsApp');
      wa.innerHTML = '<span class="ngf-wa-icon">☎</span><span><small>Informes y matrícula</small><strong>WhatsApp ahora</strong></span>';
      document.body.appendChild(wa);
    }
  }

  function start() {
    ensureFooter();
    [250, 700, 1500, 3000].forEach(function (delay) {
      window.setTimeout(ensureFooter, delay);
    });

    var observer = new MutationObserver(function (mutations) {
      var needsRepair = false;
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.matches && (
            node.matches('footer,.footer-wrapper,.nostra-floating-whatsapp,.float-wa,.scroll-top') ||
            node.querySelector('footer,.footer-wrapper,.nostra-floating-whatsapp,.float-wa,.scroll-top')
          )) {
            needsRepair = true;
          }
        });
      });
      if (needsRepair) window.setTimeout(ensureFooter, 0);
    });
    observer.observe(document.body, { childList: true, subtree: false });
    window.setTimeout(function () { observer.disconnect(); }, 12000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
