/* ==================================================
   Grupo Nostradamus - Etapa 1A Nostra 360 UNI
   Conecta los cuatro planes actuales con preinscripcion.html.
   No realiza cobros ni consulta Firebase.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if(file !== 'ciclo-anual-uni.html') return;

  var PROGRAM_ID = 'nostra-360-uni';
  var PROGRAM_NAME = 'Nostra 360 UNI';
  var PLANS = [
    {id:'presencial-turno-manana',nombre:'Presencial - Turno Mañana'},
    {id:'presencial-full',nombre:'Presencial - FULL'},
    {id:'virtual-turno-manana',nombre:'Virtual - Turno Mañana'},
    {id:'virtual-full',nombre:'Virtual - FULL'}
  ];

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

  function apply(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.price-card'));
    if(cards.length < 4) return false;

    cards.slice(0,4).forEach(function(card,index){
      var plan = PLANS[index];
      var title = card.querySelector('.price-card_title');
      var link = card.querySelector('.price-card_content a.th-btn, a.th-btn');
      if(!plan || !link) return;

      if(title) title.textContent = plan.nombre;
      card.setAttribute('data-nostra-plan-id',plan.id);
      link.href = preUrl(plan);
      link.removeAttribute('target');
      link.setAttribute('data-programa',PROGRAM_ID);
      link.setAttribute('data-plan',plan.id);
      link.innerHTML = 'Preinscribirme en este plan <i class="fa-regular fa-arrow-right ms-2"></i>';
    });

    var sidebarLink = document.querySelector('.nostra-cycle-panel__btn--pre');
    if(sidebarLink){
      sidebarLink.href = preUrl(null);
      sidebarLink.innerHTML = '📝 Preinscribirme ahora';
    }
    return true;
  }

  function start(){
    apply();
    var attempts = 0;
    var timer = setInterval(function(){
      apply();
      attempts += 1;
      if(attempts >= 40) clearInterval(timer);
    },500);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',apply);
})();