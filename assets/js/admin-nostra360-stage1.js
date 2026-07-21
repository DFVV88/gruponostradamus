/* ==================================================
   Grupo Nostradamus - Etapa 1A
   Verificación visual de los cuatro planes de Nostra 360 UNI.
   No guarda en Firebase hasta habilitar reglas seguras.
================================================== */
(function(){
  'use strict';

  var PROGRAM_ID = 'nostra-360-uni';
  var PLANS = [
    {
      id:'presencial-turno-manana',
      nombre:'Presencial - Turno Mañana',
      tipoCobro:'mensual',
      precio:400,
      matricula:0,
      activo:true,
      destacado:false,
      beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos']
    },
    {
      id:'presencial-full',
      nombre:'Presencial - FULL',
      tipoCobro:'mensual',
      precio:500,
      matricula:0,
      activo:true,
      destacado:true,
      beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos','Experiencia práctica']
    },
    {
      id:'virtual-turno-manana',
      nombre:'Virtual - Turno Mañana',
      tipoCobro:'mensual',
      precio:200,
      matricula:0,
      activo:true,
      destacado:false,
      beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria']
    },
    {
      id:'virtual-full',
      nombre:'Virtual - FULL',
      tipoCobro:'mensual',
      precio:300,
      matricula:0,
      activo:true,
      destacado:true,
      beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria','Interacción en tiempo real']
    }
  ];

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }

  function planHtml(plan,index){
    return '<div class="np-plan" data-plan data-program-id="' + PROGRAM_ID + '" data-plan-index="' + index + '">' +
      '<div class="np-plan-top">' +
        '<span class="np-plan-title">Plan ' + (index + 1) + '</span>' +
        '<div>' +
          '<label class="np-check" style="display:inline-flex!important"><input type="checkbox" data-plan-field="activo" ' + (plan.activo ? 'checked' : '') + '> Activo</label>' +
          '<label class="np-check" style="display:inline-flex!important;margin-left:9px"><input type="checkbox" data-plan-field="destacado" ' + (plan.destacado ? 'checked' : '') + '> Destacado</label>' +
        '</div>' +
      '</div>' +
      '<div class="np-plan-grid">' +
        '<label><span>Nombre del plan</span><input data-plan-field="nombre" value="' + esc(plan.nombre) + '"></label>' +
        '<label><span>Tipo de cobro</span><select data-plan-field="tipoCobro"><option value="mensual" selected>Mensual</option><option value="unico">Pago único</option></select></label>' +
        '<label><span>Precio regular (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precio" value="' + plan.precio + '"></label>' +
        '<label><span>Matrícula (S/)</span><input type="number" min="0" step="0.01" data-plan-field="matricula" value="" placeholder="Opcional"></label>' +
        '<label class="wide"><span>Beneficios — uno por línea</span><textarea data-plan-field="beneficios">' + esc(plan.beneficios.join('\n')) + '</textarea></label>' +
        '<div class="np-promo">' +
          '<label class="np-check"><input type="checkbox" data-plan-field="promocionActiva"> Promoción</label>' +
          '<label><span>Precio promocional (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precioPromocional" value=""></label>' +
          '<label><span>Válida hasta</span><input type="date" data-plan-field="promocionHasta" value=""></label>' +
        '</div>' +
        '<div class="np-preview" data-plan-preview>' + esc(plan.nombre) + ': S/ ' + plan.precio.toFixed(2) + ' mensual</div>' +
      '</div>' +
    '</div>';
  }

  function focusNostra360(){
    var panel = document.getElementById('nostra-pricing-admin-panel');
    var grid = document.getElementById('nostra-program-grid');
    if(!panel || !grid) return false;

    var card = grid.querySelector('[data-program="' + PROGRAM_ID + '"]');
    if(!card) return false;

    Array.prototype.forEach.call(grid.querySelectorAll('.np-program'),function(item){
      item.style.display = item === card ? '' : 'none';
    });

    var heading = panel.querySelector('.np-head h2');
    var copy = panel.querySelector('.np-head p');
    var help = panel.querySelector('.np-help');
    if(heading) heading.textContent = 'Parte 1 · Precios de Nostra 360 UNI';
    if(copy) copy.textContent = 'Primero verificaremos únicamente los cuatro planes de Nostra 360. Los demás ciclos se incorporarán después de aprobar esta prueba.';
    if(help) help.innerHTML = '<b>Planes verificados:</b> Presencial mañana S/400, Presencial FULL S/500, Virtual mañana S/200 y Virtual FULL S/300. Todos son cobros mensuales.';

    var saveAll = document.getElementById('nostra-pricing-save-all');
    if(saveAll){
      saveAll.disabled = true;
      saveAll.style.display = 'none';
    }

    var addButton = card.querySelector('[data-add-plan]');
    if(addButton) addButton.style.display = 'none';

    var plansHost = card.querySelector('.np-plans');
    if(plansHost && card.getAttribute('data-nostra360-verified') !== '1'){
      plansHost.innerHTML = PLANS.map(planHtml).join('');
      card.setAttribute('data-nostra360-verified','1');
    }

    var saveOne = card.querySelector('[data-save-program]');
    if(saveOne){
      saveOne.disabled = true;
      saveOne.textContent = 'Guardar se habilitará en la siguiente parte';
      saveOne.title = 'Primero habilitaremos las reglas seguras de Firebase.';
      saveOne.style.opacity = '.65';
      saveOne.style.cursor = 'not-allowed';
    }

    var message = document.getElementById('nostra-pricing-message');
    if(message){
      message.className = 'msg info';
      message.innerHTML = '✅ Nostra 360 fue cargado con los cuatro planes y precios verificados. En esta parte solo revisaremos la visualización y la selección del plan. El guardado se habilitará al configurar Firebase de forma segura.';
    }
    return true;
  }

  function start(){
    focusNostra360();
    var attempts = 0;
    var timer = setInterval(function(){
      focusNostra360();
      attempts += 1;
      if(attempts >= 40) clearInterval(timer);
    },500);

    var root = document.getElementById('admin-panel');
    if(root && window.MutationObserver){
      var observer = new MutationObserver(function(){ focusNostra360(); });
      observer.observe(root,{childList:true,subtree:true});
      setTimeout(function(){ observer.disconnect(); },30000);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();