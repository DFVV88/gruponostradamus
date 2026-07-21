/* ==================================================
   Grupo Nostradamus - Nostra 360 UNI
   Precios, promociones y horarios dinámicos desde Firebase.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if(file !== 'ciclo-anual-uni.html') return;

  var PROGRAM_ID = 'nostra-360-uni';
  var PROGRAM_NAME = 'Nostra 360 UNI';
  var MORNING_SCHEDULE = ['Lunes a Sábado','8:00 a.m. a 1:00 p.m.','Más dos tardes RM y RV'];
  var FULL_SCHEDULE = ['Lunes a Viernes','8:00 a.m. a 6:00 p.m.','Sábados','8:00 a.m. a 1:00 p.m.'];
  var DEFAULT_PLANS = [
    {id:'presencial-turno-manana',nombre:'Presencial - Turno Mañana',tipoCobro:'mensual',precio:400,matricula:0,activo:true,destacado:false,horarioLineas:MORNING_SCHEDULE,beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos']},
    {id:'presencial-full',nombre:'Presencial - FULL',tipoCobro:'mensual',precio:500,matricula:0,activo:true,destacado:true,horarioLineas:FULL_SCHEDULE,beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos','Experiencia práctica']},
    {id:'virtual-turno-manana',nombre:'Virtual - Turno Mañana',tipoCobro:'mensual',precio:200,matricula:0,activo:true,destacado:false,horarioLineas:MORNING_SCHEDULE,beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria']},
    {id:'virtual-full',nombre:'Virtual - FULL',tipoCobro:'mensual',precio:300,matricula:0,activo:true,destacado:true,horarioLineas:FULL_SCHEDULE,beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria','Interacción en tiempo real']}
  ];
  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var currentPlans = DEFAULT_PLANS.map(normalizePlan);

  function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }
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
  function lineList(value,fallback,max){
    var list = Array.isArray(value) ? value : clean(value).split(/\r?\n/);
    var normalized = list.map(clean).filter(Boolean).slice(0,max || 8);
    return normalized.length ? normalized : fallback.slice();
  }
  function promoActive(plan){
    if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
    if(!plan.promocionHasta) return true;
    var end = new Date(plan.promocionHasta + 'T23:59:59');
    return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
  }
  function normalizePlan(plan,index){
    var fallback = DEFAULT_PLANS[index] || DEFAULT_PLANS[0];
    return {
      id:clean(plan && plan.id) || fallback.id,
      nombre:clean(plan && plan.nombre) || fallback.nombre,
      tipoCobro:plan && plan.tipoCobro === 'unico' ? 'unico' : 'mensual',
      precio:num(plan && plan.precio != null ? plan.precio : fallback.precio),
      matricula:num(plan && plan.matricula),
      activo:!plan || plan.activo !== false,
      destacado:!!(plan && plan.destacado === true),
      horarioLineas:lineList(plan && plan.horarioLineas,fallback.horarioLineas,6),
      beneficios:lineList(plan && plan.beneficios,fallback.beneficios,8),
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
    if(document.getElementById('nostra360-stage3-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra360-stage3-style';
    style.textContent = [
      '.nostra360-old{display:block;font-size:17px;color:#7c8998;text-decoration:line-through;margin-bottom:4px}',
      '.nostra360-promo{display:inline-flex;margin-top:9px;padding:5px 10px;border-radius:999px;background:#fff3df;color:#8a4c00;font-size:12px;font-weight:900}',
      '[data-nostra360-official-pricing="1"] .price-card .th-btn{white-space:normal!important;text-align:center}',
      '[data-nostra360-official-pricing="1"]{scroll-margin-top:110px}',
      '.nostra360-plan-schedule{margin:16px 0 18px;padding:13px 12px;border-radius:15px;background:#f2f8fa;border:1px solid rgba(0,143,162,.14);text-align:center;color:#08233d}',
      '.nostra360-plan-schedule span{display:block;line-height:1.42}',
      '.nostra360-plan-schedule .day{font-weight:900;color:#078c95}',
      '.nostra360-plan-schedule .time{font-size:14px;font-weight:750}',
      '.nostra360-plan-schedule .extra{font-size:13px;font-weight:800;color:#4c6374;margin-top:3px}',
      '#Coursedescription .nostra360-description-schedule .price-card_price{display:flex;flex-direction:column;gap:4px}',
      '#Coursedescription .nostra360-description-schedule .day{display:block;color:#078c95;font-size:clamp(25px,3vw,42px);font-weight:800;line-height:1.08}',
      '#Coursedescription .nostra360-description-schedule .time{display:block;color:#061426;font-size:18px;font-weight:600;line-height:1.35}',
      '#Coursedescription .nostra360-description-schedule .extra{display:block;color:#061426;font-size:17px;font-weight:650;line-height:1.35;margin-top:2px}'
    ].join('');
    document.head.appendChild(style);
  }
  function scheduleLineClass(line){
    if(/\d{1,2}\s*:\s*\d{2}/.test(line)) return 'time';
    if(/^más\b/i.test(line) || /^incluye\b/i.test(line)) return 'extra';
    return 'day';
  }
  function scheduleHtml(lines,context){
    return lines.map(function(line){
      var cls = scheduleLineClass(line);
      var text = line;
      if(context === 'description' && cls === 'time' && text.charAt(0) !== '(') text = '(' + text + ')';
      return '<span class="' + cls + '">' + esc(text) + '</span>';
    }).join('');
  }
  function benefitsHtml(plan){
    var items = [];
    if(num(plan.matricula) > 0) items.push('Matrícula: ' + money(plan.matricula));
    items = items.concat(plan.beneficios || []);
    return items.slice(0,8).map(function(item){
      return '<li><i class="far fa-check-circle"></i> ' + esc(item) + '</li>';
    }).join('');
  }
  function locateOfficialPricingSection(){
    var sections = Array.prototype.slice.call(document.querySelectorAll('section'));
    return sections.find(function(section){
      var title = section.querySelector('.title-area .sec-title');
      var subtitle = section.querySelector('.title-area .sub-title');
      var titleText = clean(title && title.textContent).toLowerCase();
      var subtitleText = clean(subtitle && subtitle.textContent).toLowerCase();
      return section.querySelectorAll('.price-card').length >= 4 &&
        (titleText.indexOf('nuestros planes para tu futuro') !== -1 || subtitleText.indexOf('precios academicos') !== -1 || subtitleText.indexOf('precios académicos') !== -1);
    }) || null;
  }
  function locateDescriptionScheduleRow(){
    var pane = document.getElementById('Coursedescription');
    if(!pane) return null;
    var rows = Array.prototype.slice.call(pane.querySelectorAll('.row.gy-4.justify-content-center'));
    return rows.find(function(item){ return item.querySelector('.price-card'); }) || null;
  }
  function descriptionCardHtml(plan,index){
    var title = index === 0 ? 'Turno mañana' : 'Turno Único - Full';
    var visible = plan.activo === false ? ' style="display:none"' : '';
    return '<div class="col-xl-6 col-md-6"' + visible + '>' +
      '<div class="price-card nostra360-description-schedule">' +
        '<div class="price-card_top">' +
          '<h3 class="price-card_title">' + title + '</h3>' +
          '<div class="price-card_price">' + scheduleHtml(plan.horarioLineas,'description') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  function renderDescriptionSchedules(){
    var row = locateDescriptionScheduleRow();
    if(!row) return false;
    var signature = JSON.stringify(currentPlans.slice(0,2).map(function(plan){
      return [plan.activo,plan.horarioLineas];
    }));
    if(row.getAttribute('data-nostra360-schedule-signature') === signature) return true;
    row.innerHTML = descriptionCardHtml(currentPlans[0],0) + descriptionCardHtml(currentPlans[1],1);
    row.setAttribute('data-nostra360-schedule-signature',signature);
    document.querySelectorAll('.nostra-pricing-note').forEach(function(note){ note.remove(); });
    return true;
  }
  function renderCardSchedule(card,plan){
    var content = card.querySelector('.price-card_content');
    if(!content) return;
    var schedule = card.querySelector('.nostra360-plan-schedule');
    if(!schedule){
      schedule = document.createElement('div');
      schedule.className = 'nostra360-plan-schedule';
      var checklist = content.querySelector('.checklist');
      if(checklist) content.insertBefore(schedule,checklist);
      else content.insertBefore(schedule,content.firstChild);
    }
    schedule.innerHTML = scheduleHtml(plan.horarioLineas,'price');
    schedule.style.display = plan.horarioLineas.length ? '' : 'none';
  }
  function apply(){
    addStyles();
    renderDescriptionSchedules();

    var section = locateOfficialPricingSection();
    if(!section) return false;

    section.setAttribute('data-nostra360-official-pricing','1');
    var subtitle = section.querySelector('.title-area .sub-title');
    var heading = section.querySelector('.title-area .sec-title');
    if(subtitle) subtitle.innerHTML = '<i class="fal fa-book me-1"></i> PRECIOS ACADÉMICOS';
    if(heading) heading.textContent = 'Nuestros planes para tu futuro';

    var cards = Array.prototype.slice.call(section.querySelectorAll('.price-card')).slice(0,4);
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
      var column = card.closest('.col-xl-3, .col-md-6');

      if(title) title.textContent = plan.nombre;
      card.classList.toggle('active',plan.destacado === true);
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
      renderCardSchedule(card,plan);
      if(list) list.innerHTML = benefitsHtml(plan);
      card.setAttribute('data-nostra-plan-id',plan.id);
      if(column) column.style.display = plan.activo === false ? 'none' : '';
      else card.style.display = plan.activo === false ? 'none' : '';
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
      console.warn('Se mantienen los precios y horarios verificados de Nostra 360:',error);
    });
  }
  function start(){
    currentPlans = DEFAULT_PLANS.map(normalizePlan);
    apply();
    var attempts = 0;
    var timer = setInterval(function(){
      apply();
      attempts += 1;
      if(attempts >= 50) clearInterval(timer);
    },400);
    loadRemote();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',apply);
})();
