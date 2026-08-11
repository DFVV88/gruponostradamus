/* ==================================================
   Grupo Nostradamus - Catálogo dinámico de ciclos
   Resume cada producto, sincroniza Firebase y añade navegación rápida.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if(file !== 'ciclos.html' && file !== 'ciclos') return;

  var PROGRAMS = [
    {id:'nostra-360-uni',nombre:'Nostra 360 UNI',ruta:'ciclo-anual-uni.html',grupo:'premium',orden:1,promesa:'Formación integral desde las bases.',ideal:'Estudiantes que están iniciando su preparación y necesitan construir una base completa.',descripcion:'Preparación integral desde el nivel básico hasta alcanzar el rendimiento exigido por la UNI.'},
    {id:'nostra-power-uni',nombre:'Nostra Power UNI',ruta:'ciclo-semianual-uni.html',grupo:'premium',orden:2,promesa:'Corrige debilidades y transforma tu rendimiento.',ideal:'Postulantes que ya estudiaron, pero necesitan reforzar vacíos y cambiar su estrategia.',descripcion:'Programa intensivo para fortalecer conocimientos, corregir errores y elevar el nivel competitivo.'},
    {id:'nostra-elite-uni',nombre:'Nostra Élite UNI',ruta:'ciclo-semestral-uni.html',grupo:'premium',orden:3,promesa:'Perfeccionamiento para competir por una vacante.',ideal:'Postulantes con buen nivel que estuvieron cerca de ingresar y necesitan mayor precisión.',descripcion:'Entrenamiento avanzado para consolidar el dominio académico y mejorar el rendimiento en examen.'},
    {id:'nostra-prime-uni',nombre:'Nostra Prime UNI',ruta:'ciclo-repaso-uni.html',grupo:'premium',orden:4,promesa:'Preparación decisiva para la etapa final.',ideal:'Postulantes que se encuentran a pocas semanas del examen de admisión UNI.',descripcion:'Repaso estratégico, práctica intensiva y simulacros para llegar al examen con máxima seguridad.'},
    {id:'nostra-talentum-uni',nombre:'Nostra Talentum UNI',ruta:'ciclo-elite-uni.html',grupo:'premium',orden:5,promesa:'Alto rendimiento y máxima exigencia.',ideal:'Estudiantes de nivel competitivo alto que buscan entrenamiento académico especializado.',descripcion:'Programa especial para desarrollar rendimiento superior, disciplina y competencia académica.'},
    {id:'ciclo-ien',nombre:'IEN UNI',ruta:'ciclo-ien.html',grupo:'escolar',orden:6,promesa:'Preparación progresiva para el ingreso escolar UNI.',ideal:'Escolares que desean prepararse con anticipación y desarrollar bases sólidas.',descripcion:'Formación académica orientada al proceso de Ingreso Escolar Nacional de la UNI.'},
    {id:'proyecto-escolar',nombre:'Proyecto Escolar',ruta:'ciclo-proyecto-escolar.html',grupo:'escolar',orden:7,promesa:'Refuerzo y formación escolar continua.',ideal:'Estudiantes que necesitan nivelación, acompañamiento y mejora sostenida en el colegio.',descripcion:'Programa de refuerzo académico, nivelación y seguimiento para fortalecer el desempeño escolar.'},
    {id:'paralelo-cepre-uni',nombre:'Paralelo CEPRE UNI',ruta:'ciclo-paralelo-cepre-uni.html',grupo:'complementario',orden:8,promesa:'Acompañamiento estratégico para CEPRE UNI.',ideal:'Alumnos de CEPRE UNI que requieren refuerzo, práctica adicional y seguimiento.',descripcion:'Preparación complementaria alineada al avance de CEPRE UNI para mejorar resultados y competencia.'},
    {id:'ciclo-verano-uni',nombre:'Ciclo Verano UNI',ruta:'ciclo-verano-uni.html',grupo:'complementario',orden:9,promesa:'Avanza y fortalece tus bases en vacaciones.',ideal:'Escolares y egresados que desean aprovechar el verano para elevar su nivel académico.',descripcion:'Programa intensivo de vacaciones para reforzar fundamentos y avanzar en la preparación UNI.'},
    {id:'nostra-weekend-uni',nombre:'NostraWEEKEND',ruta:'ciclo-weekend-uni.html',grupo:'complementario',orden:10,promesa:'Tu preparación UNI también avanza el fin de semana.',ideal:'Estudiantes que necesitan concentrar su preparación especializada en sábado o domingo.',descripcion:'Programa complementario UNI con opciones Sabatino y Dominical, práctica tipo admisión y seguimiento académico.'}
  ];

  var GROUPS = [
    {id:'premium',titulo:'Línea Premium UNI',descripcion:'Una ruta diferenciada para cada etapa de tu preparación.'},
    {id:'escolar',titulo:'Preparación Escolar',descripcion:'Formación progresiva, nivelación y acompañamiento académico.'},
    {id:'complementario',titulo:'Programas Complementarios UNI',descripcion:'Refuerzo estratégico para etapas y necesidades específicas.'}
  ];

  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var catalog = PROGRAMS.map(function(item){
    return Object.assign({},item,{publicado:true,fechaInicio:'',duracion:'',planes:[]});
  });
  var activeQuickProgram = '';

  function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g,function(character){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character];
    });
  }
  function num(value){
    var parsed = Number(String(value == null ? '' : value).replace(',','.'));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
  function normalized(value){
    return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }
  function dateLabel(value){
    var raw = clean(value);
    if(!raw) return 'Por anunciar';
    var date = new Date(raw + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? 'Por anunciar' : date.toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'});
  }
  function shorten(value,max){
    var text = clean(value);
    if(text.length <= max) return text;
    return text.slice(0,max).replace(/\s+\S*$/,'') + '…';
  }
  function activePlans(program){
    return Array.isArray(program.planes) ? program.planes.filter(function(plan){
      return plan && plan.activo !== false && num(plan.precio) > 0;
    }) : [];
  }
  function modalityNames(program){
    var plans = activePlans(program);
    var names = [];
    plans.forEach(function(plan){
      var name = normalized(plan.nombre);
      if(name.indexOf('presencial') !== -1 && names.indexOf('Presencial') === -1) names.push('Presencial');
      if(name.indexOf('virtual') !== -1 && names.indexOf('Virtual') === -1) names.push('Virtual');
    });
    if(!names.length){
      plans.slice(0,3).forEach(function(plan){
        var label = clean(plan.nombre);
        if(label && names.indexOf(label) === -1) names.push(label);
      });
    }
    return names;
  }
  function preUrl(program){
    var params = new URLSearchParams();
    params.set('programa',program.id);
    params.set('programaNombre',program.nombre);
    return 'preinscripcion.html?' + params.toString();
  }
  function statusLabel(program){
    return program.publicado === false ? 'En actualización' : 'Inscripciones disponibles';
  }
  function modalityHtml(program){
    var names = modalityNames(program);
    if(!names.length) return '<span class="nc-chip nc-chip--muted">Modalidades por confirmar</span>';
    return names.map(function(name){ return '<span class="nc-chip">' + esc(name) + '</span>'; }).join('');
  }
  function quickNavHtml(){
    return '<nav class="nc-quick-nav" aria-label="Accesos rápidos a los programas">' + PROGRAMS.map(function(program){
      return '<button type="button" class="nc-quick-nav__btn' + (activeQuickProgram === program.id ? ' active' : '') + '" data-nc-program="' + esc(program.id) + '">' + esc(program.nombre) + '</button>';
    }).join('') + '</nav>';
  }
  function cardHtml(program){
    var plans = activePlans(program);
    var description = shorten(program.descripcion || '',220) || program.promesa;
    return '<article id="programa-' + esc(program.id) + '" class="nc-card' + (program.publicado === false ? ' nc-card--paused' : '') + '" data-nc-card="' + esc(program.id) + '">' +
      '<div class="nc-card__top"><span class="nc-order">' + String(program.orden).padStart(2,'0') + '</span><span class="nc-status">' + esc(statusLabel(program)) + '</span></div>' +
      '<div class="nc-card__body">' +
        '<p class="nc-kicker">' + esc(program.promesa) + '</p>' +
        '<h3>' + esc(program.nombre) + '</h3>' +
        '<p class="nc-description">' + esc(description) + '</p>' +
        '<div class="nc-ideal"><span>Ideal para</span><strong>' + esc(program.ideal) + '</strong></div>' +
        '<div class="nc-meta">' +
          '<div><small>Inicio</small><strong>' + esc(dateLabel(program.fechaInicio)) + '</strong></div>' +
          '<div><small>Duración</small><strong>' + esc(clean(program.duracion) || 'Por anunciar') + '</strong></div>' +
        '</div>' +
        '<div class="nc-plans-head"><span>Modalidades</span><small>' + (plans.length ? plans.length + (plans.length === 1 ? ' plan disponible' : ' planes disponibles') : 'Información en actualización') + '</small></div>' +
        '<div class="nc-chips">' + modalityHtml(program) + '</div>' +
      '</div>' +
      '<div class="nc-actions">' +
        '<a class="nc-btn nc-btn--details" href="' + esc(program.ruta) + '">Ver detalles</a>' +
        '<a class="nc-btn nc-btn--pre" href="' + esc(preUrl(program)) + '">Preinscribirme</a>' +
      '</div>' +
    '</article>';
  }
  function groupHtml(group){
    var products = catalog.filter(function(program){ return program.grupo === group.id; }).sort(function(a,b){ return a.orden - b.orden; });
    return '<section class="nc-group" data-group="' + esc(group.id) + '">' +
      '<div class="nc-group__head"><div><span>Programas académicos</span><h2>' + esc(group.titulo) + '</h2><p>' + esc(group.descripcion) + '</p></div><strong>' + products.length + ' programas</strong></div>' +
      '<div class="nc-grid">' + products.map(cardHtml).join('') + '</div>' +
    '</section>';
  }

  function addStyles(){
    if(document.getElementById('nostra-ciclos-catalog-dynamic-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-ciclos-catalog-dynamic-style';
    style.textContent = [
      '#course-sec[data-nostra-catalog="1"] .tab-menu1.filter-menu-active,#course-sec[data-nostra-catalog="1"] .filter-active{display:none!important}',
      '#nostra-ciclos-catalog{width:min(1220px,100%);margin:0 auto;padding:4px 0 34px}',
      '.nc-intro{position:relative;overflow:hidden;margin:0 0 30px;padding:24px 26px 26px;border:1px solid rgba(0,194,209,.28);border-radius:28px;background:radial-gradient(circle at 12% 18%,rgba(0,194,209,.18),transparent 30%),radial-gradient(circle at 88% 12%,rgba(255,255,255,.12),transparent 22%),linear-gradient(135deg,#061426 0%,#082238 58%,#06353c 100%);color:#fff;box-shadow:0 22px 55px rgba(0,0,0,.16),0 0 32px rgba(0,194,209,.12)}',
      '.nc-intro:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 0%,rgba(255,255,255,.08) 46%,transparent 62%);transform:translateX(-130%);animation:nostraCiclosSweep 6s ease-in-out infinite;pointer-events:none}',
      '.nc-intro>*{position:relative;z-index:1}',
      '.nc-intro>.nc-label{display:inline-flex;margin-bottom:9px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.10);font-size:11px;font-weight:900;letter-spacing:.5px;text-transform:uppercase}',
      '.nc-intro h2{margin:0 0 7px;color:#fff;font-family:"Baloo 2",sans-serif;font-size:clamp(31px,4vw,48px);line-height:1}',
      '.nc-intro>p{max-width:800px;margin:0;color:rgba(255,255,255,.78);font-size:16px;line-height:1.55}',
      '.nc-quick-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;width:100%;margin:21px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.13)}',
      '.nc-quick-nav__btn{position:relative;z-index:2;width:100%;min-width:0;min-height:66px;display:flex;align-items:center;justify-content:center;padding:12px 13px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 9px 20px rgba(0,0,0,.13);color:#fff;font:950 13.5px/1.18 "Jost",sans-serif;letter-spacing:.25px;text-align:center;text-transform:uppercase;white-space:normal;word-break:normal;overflow-wrap:normal;cursor:pointer;transition:transform .25s ease,background .25s ease,box-shadow .25s ease,border-color .25s ease}',
      '.nc-quick-nav__btn:before{content:"";position:absolute;left:12px;top:12px;width:8px;height:8px;border-radius:50%;background:#00d4df;box-shadow:0 0 12px rgba(0,212,223,.75)}',
      '.nc-quick-nav__btn:after{content:"Ver más";position:absolute;right:10px;bottom:8px;margin:0;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.78);font-size:9.5px;font-weight:900;line-height:1;opacity:1;transform:none}',
      '.nc-quick-nav__btn:hover,.nc-quick-nav__btn:focus-visible,.nc-quick-nav__btn.active{background:linear-gradient(135deg,#00c2d1,#008b96 52%,#045a69);border-color:rgba(255,255,255,.28);color:#fff;transform:translateY(-5px) scale(1.02);box-shadow:0 16px 30px rgba(0,194,209,.22),0 0 24px rgba(0,194,209,.18);outline:none}',
      '.nc-group{margin:0 0 42px}',
      '.nc-group__head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:0 0 17px;padding:0 4px}',
      '.nc-group__head span{display:block;color:#078c95;font-size:11px;font-weight:950;letter-spacing:.65px;text-transform:uppercase}',
      '.nc-group__head h2{margin:2px 0 3px;color:#061426;font-family:"Baloo 2",sans-serif;font-size:clamp(27px,3vw,38px);line-height:1}',
      '.nc-group__head p{margin:0;color:#607080;font-size:14px}',
      '.nc-group__head>strong{flex:0 0 auto;padding:7px 11px;border-radius:999px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:900}',
      '.nc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch}',
      '.nc-card{display:flex;flex-direction:column;min-width:0;overflow:hidden;scroll-margin-top:120px;border:1px solid rgba(7,140,149,.16);border-radius:24px;background:#fff;box-shadow:0 16px 42px rgba(6,20,38,.08);transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}',
      '.nc-card:hover{transform:translateY(-5px);border-color:rgba(7,140,149,.32);box-shadow:0 24px 56px rgba(6,20,38,.13)}',
      '.nc-card--focus{border-color:#00c2d1!important;box-shadow:0 0 0 5px rgba(0,194,209,.15),0 28px 62px rgba(6,20,38,.17)!important;animation:ncCardFocus 1.45s ease}',
      '@keyframes ncCardFocus{0%,100%{transform:translateY(0)}35%{transform:translateY(-8px)}}',
      '@keyframes nostraCiclosSweep{0%,42%{transform:translateX(-130%)}62%,100%{transform:translateX(130%)}}',
      '.nc-card--paused{opacity:.82}',
      '.nc-card__top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 17px 0}',
      '.nc-order{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#061426;color:#fff;font-size:11px;font-weight:950}',
      '.nc-status{padding:6px 9px;border-radius:999px;background:#edfbea;color:#17672a;font-size:10px;font-weight:900;text-transform:uppercase}',
      '.nc-card--paused .nc-status{background:#fff3df;color:#8a4c00}',
      '.nc-card__body{display:flex;flex-direction:column;flex:1;padding:16px 18px 18px}',
      '.nc-kicker{min-height:34px;margin:0 0 5px;color:#078c95;font-size:12px;font-weight:900;line-height:1.35;text-transform:uppercase}',
      '.nc-card h3{margin:0 0 9px;color:#061426;font-family:"Baloo 2",sans-serif;font-size:27px;line-height:1.02}',
      '.nc-description{min-height:66px;margin:0 0 14px;color:#46586a;font-size:14px;line-height:1.55}',
      '.nc-ideal{margin:0 0 14px;padding:12px 13px;border-radius:15px;background:#f7fbfc;border:1px solid #e1eef1}',
      '.nc-ideal span{display:block;margin-bottom:3px;color:#078c95;font-size:10px;font-weight:950;text-transform:uppercase}',
      '.nc-ideal strong{display:block;color:#263648;font-size:12.5px;line-height:1.45}',
      '.nc-meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:0 0 14px}',
      '.nc-meta>div{padding:11px 12px;border-radius:14px;background:#fff;border:1px solid #dfecef}',
      '.nc-meta small{display:block;margin-bottom:2px;color:#738190;font-size:9px;font-weight:950;text-transform:uppercase}',
      '.nc-meta strong{display:block;color:#061426;font-size:12.5px;line-height:1.3}',
      '.nc-plans-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto}',
      '.nc-plans-head span{color:#061426;font-size:11px;font-weight:950;text-transform:uppercase}',
      '.nc-plans-head small{color:#607080;font-size:10px;font-weight:800}',
      '.nc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.nc-chip{display:inline-flex;padding:6px 9px;border-radius:999px;background:#e8f8fa;color:#075b65;font-size:10.5px;font-weight:900}',
      '.nc-chip--muted{background:#f2f4f5;color:#67717d}',
      '.nc-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:14px 17px 17px;border-top:1px solid #edf2f4;background:#fbfdfe}',
      '.nc-btn{display:flex;align-items:center;justify-content:center;min-height:44px;padding:10px 12px;border-radius:999px;font-size:12px;font-weight:950;text-align:center;text-decoration:none!important;transition:transform .2s ease,box-shadow .2s ease}',
      '.nc-btn:hover{transform:translateY(-2px)}',
      '.nc-btn--details{border:1px solid #cfe1e5;background:#fff;color:#075b65!important}',
      '.nc-btn--pre{background:linear-gradient(135deg,#ff941e,#078c95 65%,#061426);color:#fff!important;box-shadow:0 10px 22px rgba(7,140,149,.18)}',
      '@media(min-width:1200px){.nc-quick-nav{grid-template-columns:repeat(5,minmax(0,1fr))}}',
      '@media(min-width:992px) and (max-width:1199px){.nc-quick-nav{grid-template-columns:repeat(3,minmax(0,1fr))}.nc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media(max-width:991px){.nc-quick-nav{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.nc-quick-nav__btn{min-height:58px;font-size:12.5px}.nc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media(max-width:575px){#nostra-ciclos-catalog{padding-bottom:16px}.nc-intro{padding:21px 16px;border-radius:22px}.nc-quick-nav{grid-template-columns:1fr}.nc-quick-nav__btn{min-height:50px}.nc-group{margin-bottom:34px}.nc-group__head{display:block}.nc-group__head>strong{display:inline-flex;margin-top:9px}.nc-grid{grid-template-columns:1fr}.nc-description,.nc-kicker{min-height:0}.nc-meta{grid-template-columns:1fr}.nc-actions{grid-template-columns:1fr}.nc-card h3{font-size:25px}}',
      '@media(prefers-reduced-motion:reduce){.nc-intro:after,.nc-card--focus{animation:none}.nc-quick-nav__btn,.nc-card{transition:none}}'
    ].join('');
    document.head.appendChild(style);
  }

  function locateSection(){
    return document.getElementById('course-sec') || Array.from(document.querySelectorAll('section')).find(function(section){
      return section.querySelector('.tab-menu1.filter-menu-active') && section.querySelector('.filter-active');
    }) || null;
  }
  function prepareHost(){
    var section = locateSection();
    if(!section) return null;
    section.setAttribute('data-nostra-catalog','1');
    Array.from(section.querySelectorAll('.tab-menu1.filter-menu-active,.filter-active')).forEach(function(element){
      element.style.setProperty('display','none','important');
      element.setAttribute('aria-hidden','true');
    });
    var host = document.getElementById('nostra-ciclos-catalog');
    if(!host){
      host = document.createElement('div');
      host.id = 'nostra-ciclos-catalog';
      var container = section.querySelector('.container') || section;
      var titleArea = container.querySelector('.title-area');
      if(titleArea && titleArea.nextSibling) container.insertBefore(host,titleArea.nextSibling);
      else container.appendChild(host);
    }
    return host;
  }
  function render(){
    var host = prepareHost();
    if(!host) return false;
    addStyles();
    host.innerHTML = '<div class="nc-intro"><span class="nc-label">Encuentra tu ruta UNI</span><h2>Elige el programa correcto para tu etapa</h2><p>Selecciona un programa para ir directamente a su fecha de inicio, duración, modalidades y opciones de preinscripción.</p>' + quickNavHtml() + '</div>' + GROUPS.map(groupHtml).join('');
    return true;
  }
  function mergeRemote(documents){
    var remoteMap = new Map(documents.map(function(item){ return [item.id,item]; }));
    catalog = PROGRAMS.map(function(base){
      var remote = remoteMap.get(base.id) || {};
      return Object.assign({},base,remote,{
        id:base.id,
        nombre:clean(remote.nombre || base.nombre),
        ruta:base.ruta,
        grupo:base.grupo,
        orden:base.orden,
        promesa:base.promesa,
        ideal:base.ideal,
        descripcion:clean(remote.descripcion || base.descripcion),
        publicado:remote.publicado !== false,
        fechaInicio:clean(remote.fechaInicio),
        duracion:clean(remote.duracion),
        planes:Array.isArray(remote.planes) ? remote.planes : []
      });
    });
  }
  function loadRemote(){
    return Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function(modules){
      var appModule = modules[0];
      var firestore = modules[1];
      var app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(firebaseConfig);
      return firestore.getDocs(firestore.collection(firestore.getFirestore(app),'programas_publicos'));
    }).then(function(snapshot){
      mergeRemote(snapshot.docs.map(function(document){ return Object.assign({id:document.id},document.data()); }));
      render();
    }).catch(function(error){
      console.warn('Se mantiene el catálogo base porque no se pudieron leer los productos:',error);
    });
  }
  function bindQuickNavigation(){
    document.addEventListener('click',function(event){
      var button = event.target && event.target.closest ? event.target.closest('.nc-quick-nav__btn[data-nc-program]') : null;
      if(!button) return;
      activeQuickProgram = button.getAttribute('data-nc-program') || '';
      document.querySelectorAll('.nc-quick-nav__btn').forEach(function(item){
        item.classList.toggle('active',item === button);
      });
      var target = document.getElementById('programa-' + activeQuickProgram);
      if(!target) return;
      target.scrollIntoView({behavior:'smooth',block:'start'});
      target.classList.remove('nc-card--focus');
      void target.offsetWidth;
      target.classList.add('nc-card--focus');
      window.setTimeout(function(){ target.classList.remove('nc-card--focus'); },1600);
    });
  }
  function start(){
    addStyles();
    bindQuickNavigation();
    render();
    loadRemote();
    var attempts = 0;
    var timer = setInterval(function(){
      prepareHost();
      attempts += 1;
      if(attempts >= 20) clearInterval(timer);
    },400);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',function(){ prepareHost(); });
})();