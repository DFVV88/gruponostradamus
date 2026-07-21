/* ==================================================
   Grupo Nostradamus - Parte 2 Nostra 360 UNI
   Muestra precios guardados en Firebase y conserva respaldo local.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if(file !== 'ciclo-anual-uni.html') return;

  var PROGRAM_ID = 'nostra-360-uni';
  var PROGRAM_NAME = 'Nostra 360 UNI';
  var DEFAULT_PLANS = [
    {id:'presencial-turno-manana',nombre:'Presencial - Turno Mañana',tipoCobro:'mensual',precio:400,matricula:0,activo:true,beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos']},
    {id:'presencial-full',nombre:'Presencial - FULL',tipoCobro:'mensual',precio:500,matricula:0,activo:true,beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos','Experiencia práctica']},
    {id:'virtual-turno-manana',nombre:'Virtual - Turno Mañana',tipoCobro:'mensual',precio:200,matricula:0,activo:true,beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria']},
    {id:'virtual-full',nombre:'Virtual - FULL',tipoCobro:'mensual',precio:300,matricula:0,activo:true,beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria','Interacción en tiempo real']}
  ];
  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var currentPlans = DEFAULT_PLANS;

  function clean(value){ return String(value == null ? '' : value).trim(); }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }
  function num(value){
    var parsed = Number(String(value == null ? '' : value).replace(',','.'));
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
  }
  function money(value){
    var amount = num(value);
    return 'S/. ' + (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
  }
  function promoActive(plan){
    if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
    if(!plan.promocionHasta) return true;
    var end = new Date(plan.promocionHasta + 'T23:59:59');
    return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
  }
  function normalizePlan(plan,index){
    var fallback = DEFAULT_PLANS[index] || DEFAULT_PLANS[0];
    var benefits = Array.isArray(plan && plan.beneficios) ? plan.beneficios.map(clean).filter(Boolean).slice(0,8) : fallback.beneficios;
    return {
      id:clean(plan && plan.id) || fallback.id,
      nombre:clean(plan && plan.nombre) || fallback.nombre,
      tipoCobro:plan && plan.tipoCobro === 'unico' ? 'unico' : 'mensual',
      precio:num(plan && plan.precio != null ? plan.precio : fallback.precio),
      matricula:num(plan && plan.matricula),
      activo:!plan || plan.activo !== false,
      beneficios:benefits.length ? benefits : fallback.beneficios,
      promocionActiva:!!(plan && plan.promocionActiva === true),
      precioPromocional:num(plan && plan.precioPromocional),
      promocionHasta:clean(plan && plan.promocionHasta)
    };
  }
  function preUrl(plan){
    var params = new URLSearchParams();
    params.set('programa',PROGRAM_ID);
    params.set('programaNombre',PROGRAM_NAME);
    if(plan){
      params.set('plan',plan.id);
      params.set('planNombre',plan.nombre);
    }
    return 'preinscripcion.html?' + params.toString();
  }
  function addStyles(){
    if(document.getElementById('nostra360-stage2-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra360-stage2-style';
    style.textContent = '.nostra360-old{display:block;font-size:17px;color:#7c8998;text-decoration:line-through;margin-bottom:4px}.nostra360-promo{display:inline-flex;margin-top:9px;padding:5px 10px;border-radius:999px;background:#fff3df;color:#8a4c00;font-size:12px;font-weight:900}.price-card .th-btn{white-space:normal!important;text-align:center}';
    document.head.appendChild(style);
  }
  function benefitsHtml(plan){
    var items = [];
    if(num(plan.matricula) > 0) items.push('Matrícula: ' + money(plan.matricula));
    items = items.concat(plan.beneficios || []);
    return items.slice(0,8).map(function(item){ return '<li><i class="far fa-check-circle"></i> ' + esc(item) + '</li>'; }).join('');
  }
  function apply(){
    addStyles();
    var cards = Array.prototype.slice.call(document.querySelectorAll('.price-card'));
    if(cards.length < 4) return false;

    currentPlans.slice(0,4).forEach(function(plan,index){
      var card = cards[index];
      if(!card || !plan) return;
      var title = card.querySelector('.price-card_title');
      var price = card.querySelector('.price-card_price');
      var list = card.querySelector('.checklist ul');
      var link = card.querySelector('.price-card_content a.th-btn, a.th-btn');
      var promo = promoActive(plan);
      var amount = promo ? plan.precioPromocional : plan.precio;
      var duration = plan.tipoCobro === 'unico' ? '/PAGO ÚNICO' : '/MENSUAL';

      if(title) title.textContent = plan.nombre;
      if(price){
        price.innerHTML = (promo ? '<span class="nostra360-old">' + money(plan.precio) + '</span>' : '') + money(amount) + ' <span class="duration">' + duration + '</span>';
        var previousBadge = card.querySelector('.nostra360-promo');
        if(previousBadge) previousBadge.remove();
        if(promo){
          var badge = document.createElement('span');
          badge.className = 'nostra360-promo';
          badge.textContent = 'Promoción' + (plan.promocionHasta ? ' hasta ' + plan.promocionHasta : ' vigente');
          price.insertAdjacentElement('afterend',badge);
        }
      }
      if(list) list.innerHTML = benefitsHtml(plan);
      card.setAttribute('data-nostra-plan-id',plan.id);
      card.style.display = plan.activo === false ? 'none' : '';
      if(link){
        link.href = preUrl(plan);
        link.removeAttribute('target');
        link.setAttribute('data-programa',PROGRAM_ID);
        link.setAttribute('data-plan',plan.id);
        link.innerHTML = 'Preinscribirme en este plan <i class="fa-regular fa-arrow-right ms-2"></i>';
      }
    });

    var sidebarLink = document.querySelector('.nostra-cycle-panel__btn--pre');
    if(sidebarLink){
      sidebarLink.href = preUrl(null);
      sidebarLink.innerHTML = '📝 Preinscribirme ahora';
    }
    return true;
  }
  function loadRemote(){
    return Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function(mods){
      var appMod = mods[0];
      var fs = mods[1];
      var app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      return fs.getDoc(fs.doc(fs.getFirestore(app),'programas_publicos',PROGRAM_ID));
    }).then(function(snapshot){
      if(!snapshot.exists()) return;
      var data = snapshot.data() || {};
      var plans = Array.isArray(data.planes) ? data.planes.slice(0,4).map(normalizePlan) : [];
      if(data.publicado !== false && plans.length === 4){
        currentPlans = plans;
        apply();
      }
    }).catch(function(error){
      console.warn('Se mantienen los precios verificados de Nostra 360:',error);
    });
  }
  function start(){
    currentPlans = DEFAULT_PLANS.map(normalizePlan);
    apply();
    var attempts = 0;
    var timer = setInterval(function(){
      apply();
      attempts += 1;
      if(attempts >= 40) clearInterval(timer);
    },500);
    loadRemote();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',apply);
})();
