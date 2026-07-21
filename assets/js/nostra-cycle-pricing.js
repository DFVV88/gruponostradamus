/* ==================================================
   Grupo Nostradamus - Tarifarios públicos por producto
   Precios, promociones, horarios y preinscripción desde Firebase.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if(file === 'ciclo-anual-uni.html') return; // Nostra 360 conserva su controlador validado.

  var PROGRAMS = {
    'ciclo-semianual-uni.html':{id:'nostra-power-uni',name:'Nostra Power UNI'},
    'ciclo-semestral-uni.html':{id:'nostra-elite-uni',name:'Nostra Élite UNI'},
    'ciclo-repaso-uni.html':{id:'nostra-prime-uni',name:'Nostra Prime UNI'},
    'ciclo-elite-uni.html':{id:'nostra-talentum-uni',name:'Nostra Talentum UNI'},
    'ciclo-ien.html':{id:'ciclo-ien',name:'IEN UNI'},
    'ciclo-proyecto-escolar.html':{id:'proyecto-escolar',name:'Proyecto Escolar'},
    'ciclo-paralelo-cepre-uni.html':{id:'paralelo-cepre-uni',name:'Paralelo CEPRE UNI'},
    'ciclo-verano-uni.html':{id:'ciclo-verano-uni',name:'Ciclo Verano UNI'}
  };
  var program = PROGRAMS[file];
  if(!program) return;

  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var MORNING_SCHEDULE = ['Lunes a Sábado','8:00 a.m. a 1:00 p.m.'];
  var FULL_SCHEDULE = ['Lunes a Viernes','8:00 a.m. a 6:00 p.m.','Sábados','8:00 a.m. a 1:00 p.m.'];
  var AFTERNOON_SCHEDULE = ['Lunes a Sábado','2:00 p.m. a 7:00 p.m.'];

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
  function slug(value){
    return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'plan';
  }
  function lineList(value,fallback,max){
    var list = Array.isArray(value) ? value : String(value == null ? '' : value).split(/\r?\n/);
    var normalized = list.map(clean).filter(Boolean).slice(0,max || 8);
    return normalized.length ? normalized : (fallback || []).slice();
  }
  function scheduleFallback(name){
    var normalized = clean(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(normalized.indexOf('full') !== -1 || normalized.indexOf('unico') !== -1) return FULL_SCHEDULE.slice();
    if(normalized.indexOf('tarde') !== -1) return AFTERNOON_SCHEDULE.slice();
    if(normalized.indexOf('manana') !== -1) return MORNING_SCHEDULE.slice();
    return ['Horario por confirmar'];
  }
  function normalizePlan(plan,index){
    var name = clean(plan && plan.nombre) || ('Plan ' + (index + 1));
    return {
      id:clean(plan && plan.id) || slug(name),
      nombre:name,
      activo:!plan || plan.activo !== false,
      destacado:!!(plan && plan.destacado === true),
      tipoCobro:plan && plan.tipoCobro === 'unico' ? 'unico' : 'mensual',
      precio:num(plan && plan.precio),
      matricula:num(plan && plan.matricula),
      horarioLineas:lineList(plan && plan.horarioLineas,scheduleFallback(name),6),
      beneficios:lineList(plan && plan.beneficios,[],8),
      promocionActiva:!!(plan && plan.promocionActiva === true),
      precioPromocional:num(plan && plan.precioPromocional),
      promocionHasta:clean(plan && plan.promocionHasta)
    };
  }
  function promoActive(plan){
    if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
    if(!plan.promocionHasta) return true;
    var end = new Date(plan.promocionHasta + 'T23:59:59');
    return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
  }
  function dateLabel(value){
    if(!value) return '';
    var date = new Date(value + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
  }
  function preUrl(plan){
    var params = new URLSearchParams();
    params.set('programa',program.id);
    params.set('programaNombre',program.name);
    if(plan){
      params.set('plan',plan.id || slug(plan.nombre));
      params.set('planNombre',plan.nombre || 'Plan seleccionado');
    }
    return 'preinscripcion.html?' + params.toString();
  }
  function addStyles(){
    if(document.getElementById('nostra-products-pricing-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-products-pricing-style';
    style.textContent = [
      '.nostra-price-current{display:block;color:inherit}',
      '.nostra-price-regular{display:block;margin-bottom:5px;color:#7f8b99;font-size:18px;font-weight:800;text-decoration:line-through}',
      '.nostra-plan-promo{display:inline-flex;margin-top:10px;padding:5px 10px;border-radius:999px;background:#fff3df;color:#8a4c00;font-size:12px;font-weight:900}',
      '.nostra-plan-schedule{margin:15px 0 17px;padding:12px;border-radius:15px;background:#f2f8fa;border:1px solid rgba(0,143,162,.14);text-align:center;color:#08233d}',
      '.nostra-plan-schedule span{display:block;line-height:1.42}',
      '.nostra-plan-schedule .day{font-weight:900;color:#078c95}',
      '.nostra-plan-schedule .time{font-size:14px;font-weight:750}',
      '.nostra-plan-schedule .extra{font-size:13px;font-weight:800;color:#4c6374;margin-top:3px}',
      '.nostra-plan-matricula{font-weight:850;color:#075b65}',
      '.nostra-pricing-note{width:min(1180px,92%);margin:18px auto 0;padding:12px 16px;border-radius:16px;background:#eef8fa;border:1px solid rgba(7,140,149,.18);color:#075b65;text-align:center;font-weight:800}',
      '.nostra-pricing-unavailable{width:100%;padding:26px;border-radius:22px;background:#fff8e8;border:1px solid rgba(255,148,30,.3);color:#6a4700;text-align:center;font-weight:850}',
      '[data-nostra-product-pricing="1"] .price-card .th-btn{white-space:normal!important;text-align:center}',
      '[data-nostra-product-pricing="1"]{scroll-margin-top:110px}'
    ].join('');
    document.head.appendChild(style);
  }
  function scheduleLineClass(line){
    if(/\d{1,2}\s*:\s*\d{2}/.test(line)) return 'time';
    if(/^más\b/i.test(line) || /^incluye\b/i.test(line) || /^horario por confirmar$/i.test(line)) return 'extra';
    return 'day';
  }
  function scheduleHtml(lines){
    return lines.map(function(line){
      return '<span class="' + scheduleLineClass(line) + '">' + esc(line) + '</span>';
    }).join('');
  }
  function locatePricingSection(){
    return Array.from(document.querySelectorAll('section')).find(function(section){
      var title = clean(section.querySelector('.title-area .sec-title') && section.querySelector('.title-area .sec-title').textContent).toLowerCase();
      var subtitle = clean(section.querySelector('.title-area .sub-title') && section.querySelector('.title-area .sub-title').textContent).toLowerCase();
      return section.querySelectorAll('.price-card').length > 0 &&
        (title.indexOf('nuestros planes para tu futuro') !== -1 || subtitle.indexOf('precios academicos') !== -1 || subtitle.indexOf('precios académicos') !== -1);
    }) || null;
  }
  function removeDescriptionSchedule(){
    var pane = document.getElementById('Coursedescription');
    if(!pane) return false;
    var rows = Array.from(pane.querySelectorAll('.row.gy-4.justify-content-center'));
    var row = rows.find(function(item){
      var cards = Array.from(item.querySelectorAll('.price-card'));
      if(!cards.length || item.querySelector('.price-card_content')) return false;
      return cards.every(function(card){
        var title = clean(card.querySelector('.price-card_title') && card.querySelector('.price-card_title').textContent).toLowerCase();
        var body = clean(card.textContent).toLowerCase();
        return /turno|mañana|manana|full|único|unico|tarde/.test(title + ' ' + body) && /\d{1,2}\s*:\s*\d{2}/.test(body);
      });
    });
    if(row){ row.remove(); return true; }
    return false;
  }
  function updateSidebar(){
    var link = document.querySelector('.nostra-cycle-panel__btn--pre');
    if(link){
      link.href = preUrl(null);
      link.innerHTML = '📝 Preinscribirme ahora';
    }
  }
  function renderSchedule(card,lines){
    var content = card.querySelector('.price-card_content');
    if(!content) return;
    var schedule = card.querySelector('.nostra-plan-schedule');
    if(!schedule){
      schedule = document.createElement('div');
      schedule.className = 'nostra-plan-schedule';
      var checklist = content.querySelector('.checklist');
      if(checklist) content.insertBefore(schedule,checklist);
      else content.insertBefore(schedule,content.firstChild);
    }
    schedule.innerHTML = scheduleHtml(lines);
    schedule.style.display = lines.length ? '' : 'none';
  }
  function enhanceStaticCards(){
    var section = locatePricingSection();
    if(!section) return false;
    section.setAttribute('data-nostra-product-pricing','1');
    if(section.getAttribute('data-nostra-remote-pricing') === '1'){
      removeDescriptionSchedule();
      updateSidebar();
      return true;
    }
    var subtitle = section.querySelector('.title-area .sub-title');
    var heading = section.querySelector('.title-area .sec-title');
    if(subtitle) subtitle.innerHTML = '<i class="fal fa-book me-1"></i> PRECIOS ACADÉMICOS';
    if(heading) heading.textContent = 'Nuestros planes para tu futuro';
    Array.from(section.querySelectorAll('.price-card')).forEach(function(card,index){
      var title = clean(card.querySelector('.price-card_title') && card.querySelector('.price-card_title').textContent) || ('Plan ' + (index + 1));
      var plan = normalizePlan({id:slug(title),nombre:title,horarioLineas:scheduleFallback(title)},index);
      renderSchedule(card,plan.horarioLineas);
      var link = card.querySelector('.price-card_content a.th-btn, a.th-btn');
      if(link){
        link.href = preUrl(plan);
        link.removeAttribute('target');
        link.innerHTML = 'Preinscribirme en este plan <i class="fa-regular fa-arrow-right ms-2"></i>';
      }
      card.setAttribute('data-nostra-plan-id',plan.id);
    });
    removeDescriptionSchedule();
    updateSidebar();
    return true;
  }
  function benefitsHtml(plan){
    var items = [];
    if(num(plan.matricula) > 0) items.push('<li class="nostra-plan-matricula"><i class="far fa-check-circle"></i> Matrícula: ' + money(plan.matricula) + '</li>');
    items = items.concat((plan.beneficios || []).slice(0,8).map(function(item){
      return '<li><i class="far fa-check-circle"></i> ' + esc(item) + '</li>';
    }));
    if(!items.length) items.push('<li><i class="far fa-check-circle"></i> Acompañamiento académico Nostradamus</li>');
    return items.join('');
  }
  function cardHtml(plan,index,count){
    var promo = promoActive(plan);
    var regular = num(plan.precio);
    var current = promo ? num(plan.precioPromocional) : regular;
    var duration = plan.tipoCobro === 'unico' ? '/PAGO ÚNICO' : '/MENSUAL';
    var col = count >= 4 ? 'col-xl-3 col-md-6' : count === 3 ? 'col-xl-4 col-md-6' : count === 2 ? 'col-xl-6 col-md-6' : 'col-xl-7 col-md-9';
    var price = promo
      ? '<span class="nostra-price-regular">' + money(regular) + '</span><span class="nostra-price-current">' + money(current) + ' <span class="duration">' + duration + '</span></span>'
      : money(current) + ' <span class="duration">' + duration + '</span>';
    return '<div class="' + col + '">' +
      '<div class="price-card ' + (plan.destacado ? 'active' : '') + '" data-nostra-plan-id="' + esc(plan.id) + '">' +
        '<div class="price-card_top"><h3 class="price-card_title">' + esc(plan.nombre) + '</h3><h4 class="price-card_price">' + price + '</h4>' +
        (promo ? '<span class="nostra-plan-promo">Promoción' + (plan.promocionHasta ? ' hasta ' + esc(dateLabel(plan.promocionHasta)) : ' vigente') + '</span>' : '') + '</div>' +
        '<div class="price-card_content"><div class="nostra-plan-schedule">' + scheduleHtml(plan.horarioLineas) + '</div>' +
        '<div class="checklist"><ul>' + benefitsHtml(plan) + '</ul></div>' +
        '<a href="' + esc(preUrl(plan)) + '" class="th-btn style10">Preinscribirme en este plan <i class="fa-regular fa-arrow-right ms-2"></i></a></div>' +
      '</div></div>';
  }
  function renderRemote(data){
    var section = locatePricingSection();
    if(!section) return false;
    section.setAttribute('data-nostra-product-pricing','1');
    section.setAttribute('data-nostra-remote-pricing','1');
    var subtitle = section.querySelector('.title-area .sub-title');
    var heading = section.querySelector('.title-area .sec-title');
    if(subtitle) subtitle.innerHTML = '<i class="fal fa-book me-1"></i> PRECIOS ACADÉMICOS';
    if(heading) heading.textContent = 'Nuestros planes para tu futuro';
    var row = section.querySelector('.row.gy-4.justify-content-center') || section.querySelector('.row');
    if(!row) return false;
    var plans = Array.isArray(data.planes) ? data.planes.map(normalizePlan).filter(function(plan){ return plan.activo !== false && plan.precio > 0; }) : [];
    if(data.publicado === false){
      row.innerHTML = '<div class="col-12"><div class="nostra-pricing-unavailable">El tarifario de este programa se encuentra en actualización. Solicita información por WhatsApp.</div></div>';
      removeDescriptionSchedule();
      updateSidebar();
      return true;
    }
    if(!plans.length) return false;
    row.innerHTML = plans.map(function(plan,index){ return cardHtml(plan,index,plans.length); }).join('');
    var oldNote = section.querySelector('.nostra-pricing-note');
    if(oldNote) oldNote.remove();
    var noteParts = ['Precios vigentes de ' + program.name];
    if(data.fechaInicio) noteParts.push('Inicio: ' + dateLabel(data.fechaInicio));
    if(data.duracion) noteParts.push(data.duracion);
    var note = document.createElement('div');
    note.className = 'nostra-pricing-note';
    note.textContent = noteParts.join(' · ');
    section.appendChild(note);
    removeDescriptionSchedule();
    updateSidebar();
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
      return fs.getDoc(fs.doc(fs.getFirestore(app),'programas_publicos',program.id));
    }).then(function(snapshot){
      if(snapshot.exists()) renderRemote(snapshot.data());
    }).catch(function(error){
      console.warn('Se mantienen los planes estáticos porque no se pudo leer el tarifario:',error);
    });
  }
  function start(){
    addStyles();
    enhanceStaticCards();
    var attempts = 0;
    var timer = setInterval(function(){
      enhanceStaticCards();
      attempts += 1;
      if(attempts >= 30) clearInterval(timer);
    },400);
    loadRemote();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',function(){ enhanceStaticCards(); updateSidebar(); });
})();