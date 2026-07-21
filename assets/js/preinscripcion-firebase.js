/* ==================================================
   Grupo Nostradamus - Preinscripciones Firebase
   Programa y plan pueden llegar precargados desde cada ciclo.
================================================== */
(function(){
  'use strict';

  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var PROGRAMS = [
    {id:'nostra-360-uni',name:'Nostra 360 UNI'},
    {id:'nostra-power-uni',name:'Nostra Power UNI'},
    {id:'nostra-elite-uni',name:'Nostra Élite UNI'},
    {id:'nostra-prime-uni',name:'Nostra Prime UNI'},
    {id:'nostra-talentum-uni',name:'Nostra Talentum UNI'},
    {id:'ciclo-ien',name:'Ciclo IEN'},
    {id:'paralelo-cepre-uni',name:'Paralelo CEPRE UNI'},
    {id:'ciclo-verano-uni',name:'Ciclo Verano UNI'},
    {id:'nostra-modulos',name:'NostraMÓDULOS'},
    {id:'proyecto-escolar',name:'Proyecto Escolar'}
  ];

  var WHATSAPP_ASESOR = '51993750351';
  var form = document.getElementById('preinscripcion-form');
  var box = document.getElementById('preinscripcion-message');
  if(!form || !box) return;

  var firebaseReady = null;
  var selectedPlan = null;
  var query = new URLSearchParams(location.search);
  var preferredProgram = query.get('programa') || query.get('programaNombre') || '';
  var preferredPlanId = query.get('plan') || '';
  var preferredPlanName = query.get('planNombre') || '';

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
  function money(value){ return 'S/ ' + num(value).toFixed(2); }
  function msg(type,text){ box.className = 'form-message ' + type; box.innerHTML = text; }
  function value(name){ return clean(form.elements[name] && form.elements[name].value); }
  function programBy(valueToFind){
    var search = clean(valueToFind).toLowerCase();
    return PROGRAMS.find(function(item){
      return item.id.toLowerCase() === search || item.name.toLowerCase() === search;
    }) || null;
  }
  function selectedProgram(){
    var select = form.elements.ciclo;
    if(!select) return null;
    return PROGRAMS.find(function(item){ return item.id === select.value; }) || null;
  }

  function updatePremiumCycles(){
    var select = form.elements.ciclo;
    if(!select) return;
    select.innerHTML = '<option value="">Seleccionar programa</option>' + PROGRAMS.map(function(item){
      return '<option value="' + esc(item.id) + '">' + esc(item.name) + '</option>';
    }).join('');
    var initial = programBy(preferredProgram);
    if(initial) select.value = initial.id;
  }

  function ensurePlanField(){
    if(form.elements.plan) return;
    var cycleSelect = form.elements.ciclo;
    var cycleField = cycleSelect && cycleSelect.closest('.field');
    if(!cycleField) return;
    var label = document.createElement('label');
    label.className = 'field';
    label.innerHTML = '<span>Plan / modalidad</span><select name="plan"><option value="">Selecciona primero un programa</option></select><div class="form-help">Puedes cambiar el plan antes de enviar la preinscripción.</div>';
    cycleField.insertAdjacentElement('afterend',label);

    var summary = document.createElement('div');
    summary.id = 'selected-plan-summary';
    summary.className = 'notice';
    summary.style.cssText = 'display:none;grid-column:1/-1;padding:14px 16px;border-radius:16px;';
    label.insertAdjacentElement('afterend',summary);

    form.elements.plan.addEventListener('change',syncSelectedPlan);
  }

  function initFirebase(){
    if(firebaseReady) return firebaseReady;
    firebaseReady = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function(mods){
      var appMod = mods[0];
      var fs = mods[1];
      var app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      return {fs:fs,db:fs.getFirestore(app)};
    });
    return firebaseReady;
  }

  function planSummary(){
    var summary = document.getElementById('selected-plan-summary');
    if(!summary) return;
    if(!selectedPlan){
      summary.style.display = 'none';
      summary.textContent = '';
      return;
    }
    var current = selectedPlan.promocionVigente ? selectedPlan.precioPromocional : selectedPlan.precio;
    summary.style.display = 'block';
    summary.innerHTML = '<b>Plan seleccionado:</b> ' + esc(selectedPlan.nombre) +
      (num(current) > 0 ? ' · <b>' + money(current) + '</b> ' + (selectedPlan.tipoCobro === 'unico' ? 'pago único' : 'mensual') : '') +
      (num(selectedPlan.matricula) > 0 ? ' · Matrícula: ' + money(selectedPlan.matricula) : '') +
      '<br><small>El monto definitivo será verificado por el sistema antes de generar el pago.</small>';
  }

  function syncSelectedPlan(){
    var select = form.elements.plan;
    if(!select || !select.value){
      selectedPlan = null;
      planSummary();
      return;
    }
    var option = select.options[select.selectedIndex];
    selectedPlan = {
      id:select.value,
      nombre:option.textContent,
      precio:num(option.dataset.precio),
      matricula:num(option.dataset.matricula),
      tipoCobro:option.dataset.tipoCobro || 'mensual',
      promocionVigente:option.dataset.promo === '1',
      precioPromocional:num(option.dataset.precioPromocional)
    };
    planSummary();
  }

  function promotionIsActive(plan){
    if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
    if(!plan.promocionHasta) return true;
    var end = new Date(plan.promocionHasta + 'T23:59:59');
    return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
  }

  function populatePlans(plans,preferredId,preferredName){
    var select = form.elements.plan;
    if(!select) return;
    var active = Array.isArray(plans) ? plans.filter(function(plan){
      return plan && plan.activo !== false && num(plan.precio) > 0;
    }) : [];
    var options = '<option value="">Seleccionar plan</option>';
    options += active.map(function(plan){
      var promo = promotionIsActive(plan);
      return '<option value="' + esc(plan.id || '') + '" data-precio="' + num(plan.precio) +
        '" data-matricula="' + num(plan.matricula) + '" data-tipo-cobro="' + esc(plan.tipoCobro || 'mensual') +
        '" data-promo="' + (promo ? '1' : '0') + '" data-precio-promocional="' + num(plan.precioPromocional) + '">' +
        esc(plan.nombre || 'Plan') + '</option>';
    }).join('');
    if(!active.length && preferredName){
      options += '<option value="' + esc(preferredId || 'plan-seleccionado') + '">' + esc(preferredName) + '</option>';
    }
    select.innerHTML = options;
    if(preferredId && Array.from(select.options).some(function(option){ return option.value === preferredId; })){
      select.value = preferredId;
    }else if(preferredName){
      var byName = Array.from(select.options).find(function(option){ return clean(option.textContent).toLowerCase() === clean(preferredName).toLowerCase(); });
      if(byName) select.value = byName.value;
    }
    syncSelectedPlan();
  }

  function loadPlans(programId,preferredId,preferredName){
    var select = form.elements.plan;
    if(!select) return Promise.resolve();
    selectedPlan = null;
    planSummary();
    if(!programId){
      select.innerHTML = '<option value="">Selecciona primero un programa</option>';
      return Promise.resolve();
    }
    select.innerHTML = '<option value="">Cargando planes...</option>';
    return initFirebase().then(function(ctx){
      return ctx.fs.getDoc(ctx.fs.doc(ctx.db,'programas_publicos',programId));
    }).then(function(snapshot){
      var data = snapshot.exists() ? snapshot.data() : {};
      populatePlans(data.planes || [],preferredId,preferredName);
    }).catch(function(error){
      console.warn('No se pudieron cargar los planes:',error);
      populatePlans([],preferredId,preferredName);
    });
  }

  updatePremiumCycles();
  ensurePlanField();
  var initialProgram = selectedProgram();
  loadPlans(initialProgram && initialProgram.id,preferredPlanId,preferredPlanName);

  form.elements.ciclo.addEventListener('change',function(){
    preferredPlanId = '';
    preferredPlanName = '';
    loadPlans(value('ciclo'),'','');
  });

  function validate(data){
    if(data.nombre.length < 5) return 'Escribe nombres y apellidos completos.';
    if(data.dni.length < 8) return 'Escribe un DNI válido.';
    if(data.celular.length < 9) return 'Escribe un celular válido.';
    if(data.correo.indexOf('@') === -1) return 'Escribe un correo personal válido.';
    if(!data.programaId) return 'Selecciona un programa de interés.';
    if(!data.metodoPagoPreferido) return 'Selecciona una forma de pago para continuar el proceso.';
    if(!data.confirmacion) return 'Debes aceptar que Coordinación se comunique contigo para continuar el proceso.';
    return '';
  }

  function collect(){
    var metodoPago = value('metodoPagoPreferido');
    var estadoPago = metodoPago === 'pago_online' ? 'pendiente_pago_online' : 'pendiente_envio_voucher';
    var program = selectedProgram();
    syncSelectedPlan();

    return {
      nombre:value('nombre'),
      dni:value('dni'),
      celular:value('celular'),
      correo:value('correo').toLowerCase(),
      colegio:value('colegio'),
      situacion:value('situacion'),
      programaId:program ? program.id : value('ciclo'),
      ciclo:program ? program.name : value('ciclo'),
      planId:selectedPlan ? selectedPlan.id : value('plan'),
      planNombre:selectedPlan ? selectedPlan.nombre : '',
      precioReferencia:selectedPlan ? (selectedPlan.promocionVigente ? selectedPlan.precioPromocional : selectedPlan.precio) : 0,
      matriculaReferencia:selectedPlan ? selectedPlan.matricula : 0,
      tipoCobroReferencia:selectedPlan ? selectedPlan.tipoCobro : '',
      turno:value('turno'),
      apoderado:value('apoderado'),
      celularApoderado:value('celularApoderado'),
      comentario:value('comentario'),
      confirmacion:value('confirmacion'),

      metodoPagoPreferido:metodoPago,
      metodoPagoLabel:metodoPago === 'pago_online' ? 'Pago en línea' : 'Voucher por WhatsApp',
      estadoPago:estadoPago,
      pagoValidado:false,
      pagoObservacion:'',
      asesorAsignado:'',

      estado:'nuevo',
      origen:'web_preinscripcion',
      tipo:'preinscripcion_inicial',
      lineaAcademica:'Nostra UNI Premium',
      correoInstitucionalAsignado:false,
      matriculaAprobada:false,
      userAgent:navigator.userAgent || '',
      pageUrl:location.href
    };
  }

  function voucherButtonHtml(data,id){
    var text = [
      'Hola Nostradamus, soy ' + data.nombre + '.',
      'Mi código de preinscripción es: ' + id + '.',
      'Programa: ' + data.ciclo + '.',
      data.planNombre ? 'Plan: ' + data.planNombre + '.' : '',
      'DNI: ' + data.dni + '.',
      'Adjunto mi voucher para validación del pago inicial.'
    ].filter(Boolean).join('\n');
    var url = 'https://wa.me/' + WHATSAPP_ASESOR + '?text=' + encodeURIComponent(text);
    return '<br><br><a href="' + url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#25d366,#078c95);color:#fff;font-weight:950;text-decoration:none;">📲 Enviar voucher por WhatsApp</a>' +
      '<br><small>Cuando abras WhatsApp, adjunta la imagen o captura del voucher en ese mismo chat.</small>';
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    e.stopImmediatePropagation();

    var btn = form.querySelector('button[type="submit"]');
    var data = collect();
    var error = validate(data);
    if(error) return msg('error',error);

    if(btn){ btn.disabled = true; btn.textContent = 'Guardando preinscripción...'; }
    msg('info','Guardando tus datos de preinscripción en el sistema...');

    initFirebase().then(function(ctx){
      data.createdAt = ctx.fs.serverTimestamp();
      data.updatedAt = ctx.fs.serverTimestamp();
      return ctx.fs.addDoc(ctx.fs.collection(ctx.db,'preinscripciones'),data);
    }).then(function(ref){
      var extra = '';
      if(data.metodoPagoPreferido === 'voucher_whatsapp'){
        extra = '<br>Forma de pago elegida: voucher por WhatsApp. Un asesor verificará el comprobante antes de aprobar la matrícula.' + voucherButtonHtml(data,ref.id);
      }else{
        extra = '<br>Forma de pago elegida: pago en línea. Coordinación activará o confirmará el enlace de pago correspondiente.';
      }
      msg('ok','✅ Preinscripción registrada correctamente.<br><small>Código de solicitud: ' + ref.id + '</small>' + extra + '<br>Coordinación revisará tus datos y se comunicará contigo.');
      form.reset();
      selectedPlan = null;
      planSummary();
      updatePremiumCycles();
      if(typeof gtag === 'function'){
        gtag('event','preinscripcion_firebase_guardada',{
          event_category:'lead',
          event_label:data.ciclo + (data.planNombre ? ' - ' + data.planNombre : ''),
          metodo_pago:data.metodoPagoPreferido
        });
      }
    }).catch(function(err){
      console.error('Error guardando preinscripción:',err);
      msg('error','No se pudo guardar la preinscripción en Firebase. Revisa las reglas de Firestore o intenta nuevamente.');
    }).finally(function(){
      if(btn){ btn.disabled = false; btn.textContent = 'Enviar preinscripción'; }
    });
  },true);
})();
