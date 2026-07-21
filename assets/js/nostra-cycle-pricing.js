/* ==================================================
   Grupo Nostradamus - Precios dinámicos por ciclo y plan
   Lee programas_publicos/{programaId}. Conserva el HTML
   actual como respaldo cuando Firebase no está disponible.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();

  /* Nostra 360 usa un controlador específico para conservar
     la sección oficial de precios al final de su subpágina. */
  if(file === 'ciclo-anual-uni.html') return;

  var PROGRAMS = {
    'ciclo-semianual-uni.html': { id:'nostra-power-uni', name:'Nostra Power UNI' },
    'ciclo-semestral-uni.html': { id:'nostra-elite-uni', name:'Nostra Élite UNI' },
    'ciclo-repaso-uni.html': { id:'nostra-prime-uni', name:'Nostra Prime UNI' },
    'ciclo-elite-uni.html': { id:'nostra-talentum-uni', name:'Nostra Talentum UNI' },
    'ciclo-ien.html': { id:'ciclo-ien', name:'Ciclo IEN' },
    'ciclo-proyecto-escolar.html': { id:'proyecto-escolar', name:'Proyecto Escolar' },
    'ciclo-paralelo-cepre-uni.html': { id:'paralelo-cepre-uni', name:'Paralelo CEPRE UNI' },
    'ciclo-verano-uni.html': { id:'ciclo-verano-uni', name:'Ciclo Verano UNI' }
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
    if(document.getElementById('nostra-cycle-pricing-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-cycle-pricing-style';
    style.textContent = `
      .nostra-price-current{display:block;color:inherit}
      .nostra-price-regular{display:block;margin-bottom:5px;color:#7f8b99;font-size:18px;font-weight:800;text-decoration:line-through}
      .nostra-plan-promo{display:inline-flex;margin-top:11px;padding:6px 10px;border-radius:999px;background:#fff3df;color:#8a4c00;font-size:12px;font-weight:900}
      .nostra-plan-matricula{font-weight:850;color:#075b65}
      .nostra-pricing-note{width:min(1180px,92%);margin:18px auto 0;padding:12px 16px;border-radius:16px;background:#eef8fa;border:1px solid rgba(7,140,149,.18);color:#075b65;text-align:center;font-weight:800}
      .nostra-pricing-unavailable{width:100%;padding:26px;border-radius:22px;background:#fff8e8;border:1px solid rgba(255,148,30,.3);color:#6a4700;text-align:center;font-weight:850}
      .price-card .th-btn{white-space:normal!important;text-align:center}
    `;
    document.head.appendChild(style);
  }
  function locatePricingSection(){
    var cards = Array.from(document.querySelectorAll('.price-card'));
    if(!cards.length) return null;
    var section = cards[0].closest('section');
    if(!section) return null;
    var row = cards[0].closest('.row');
    return row ? {section:section,row:row} : null;
  }
  function enhanceStaticCards(){
    var located = locatePricingSection();
    if(!located) return false;
    Array.from(located.row.querySelectorAll('.price-card')).forEach(function(card,index){
      var title = clean(card.querySelector('.price-card_title')?.textContent) || ('Plan ' + (index + 1));
      var link = card.querySelector('.price-card_content a.th-btn, a.th-btn');
      if(link){
        link.href = preUrl({id:slug(title),nombre:title});
        link.textContent = 'Preinscribirme en este plan →';
        link.removeAttribute('target');
      }
      card.setAttribute('data-nostra-plan-id',slug(title));
    });
    updateSidebar();
    return true;
  }
  function updateSidebar(){
    var link = document.querySelector('.nostra-cycle-panel__btn--pre');
    if(link) link.href = preUrl(null);
  }
  function benefitsHtml(plan){
    var items = Array.isArray(plan.beneficios) ? plan.beneficios.filter(Boolean).slice(0,8) : [];
    var html = '';
    if(num(plan.matricula) > 0){
      html += '<li class="nostra-plan-matricula"><i class="far fa-check-circle"></i> Matrícula: ' + money(plan.matricula) + '</li>';
    }
    html += items.map(function(item){
      return '<li><i class="far fa-check-circle"></i> ' + esc(item) + '</li>';
    }).join('');
    if(!html) html = '<li><i class="far fa-check-circle"></i> Acompañamiento académico Nostradamus</li>';
    return html;
  }
  function cardHtml(plan,index,count){
    var promo = promoActive(plan);
    var regular = num(plan.precio);
    var current = promo ? num(plan.precioPromocional) : regular;
    var duration = plan.tipoCobro === 'unico' ? '/PAGO ÚNICO' : '/MENSUAL';
    var col = count >= 4 ? 'col-xl-3 col-md-6' : count === 3 ? 'col-xl-4 col-md-6' : 'col-xl-5 col-md-6';
    var price = promo
      ? '<span class="nostra-price-regular">' + money(regular) + '</span><span class="nostra-price-current">' + money(current) + ' <span class="duration">' + duration + '</span></span>'
      : money(current) + ' <span class="duration">' + duration + '</span>';
    return '<div class="' + col + '">' +
      '<div class="price-card ' + (plan.destacado ? 'active' : '') + '" data-nostra-plan-id="' + esc(plan.id || slug(plan.nombre)) + '">' +
        '<div class="price-card_top">' +
          '<h3 class="price-card_title">' + esc(plan.nombre) + '</h3>' +
          '<h4 class="price-card_price">' + price + '</h4>' +
          (promo ? '<span class="nostra-plan-promo">Promoción' + (plan.promocionHasta ? ' hasta ' + esc(dateLabel(plan.promocionHasta)) : ' vigente') + '</span>' : '') +
        '</div>' +
        '<div class="price-card_content">' +
          '<div class="checklist"><ul>' + benefitsHtml(plan) + '</ul></div>' +
          '<a href="' + esc(preUrl(plan)) + '" class="th-btn style10">Preinscribirme en este plan <i class="fa-regular fa-arrow-right ms-2"></i></a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  function renderRemote(data){
    var located = locatePricingSection();
    if(!located) return false;
    var plans = Array.isArray(data.planes) ? data.planes.filter(function(plan){ return plan && plan.activo !== false && num(plan.precio) > 0; }) : [];
    if(data.publicado === false){
      located.row.innerHTML = '<div class="col-12"><div class="nostra-pricing-unavailable">El tarifario de este programa se encuentra en actualización. Solicita información por WhatsApp.</div></div>';
      return true;
    }
    if(!plans.length) return false;
    located.row.innerHTML = plans.map(function(plan,index){ return cardHtml(plan,index,plans.length); }).join('');
    var oldNote = located.section.querySelector('.nostra-pricing-note');
    if(oldNote) oldNote.remove();
    var note = document.createElement('div');
    note.className = 'nostra-pricing-note';
    note.textContent = 'Precios vigentes de ' + program.name + (data.fechaInicio ? ' · Inicio: ' + dateLabel(data.fechaInicio) : '') + (data.duracion ? ' · ' + data.duracion : '');
    located.section.appendChild(note);
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
      var db = fs.getFirestore(app);
      return fs.getDoc(fs.doc(db,'programas_publicos',program.id));
    }).then(function(snapshot){
      if(snapshot.exists()) renderRemote(snapshot.data());
    }).catch(function(error){
      console.warn('Se mantienen los precios estáticos porque no se pudo leer el tarifario:',error);
    });
  }
  function start(){
    addStyles();
    enhanceStaticCards();
    var attempts = 0;
    var timer = setInterval(function(){
      enhanceStaticCards();
      attempts += 1;
      if(attempts >= 20) clearInterval(timer);
    },500);
    loadRemote();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',function(){ enhanceStaticCards(); updateSidebar(); });
})();