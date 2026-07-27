/* ==================================================
   Grupo Nostradamus - Preinscripción + Culqi Checkout Custom
   - Lee el tarifario oficial desde Firestore.
   - Guarda una fotografía histórica de la compra.
   - Prepara el monto nuevamente en Cloud Functions.
   - Tokeniza la tarjeta con Culqi Checkout Custom.
   - Envía únicamente el token al backend seguro.
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

  var API_BASE = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/';
  var PREPARE_URL = API_BASE + 'culqiPreparePayment';
  var CHARGE_URL = API_BASE + 'culqiCreateCharge';
  var PUBLIC_CONFIG_URL = 'assets/js/culqi-public-config.js?v=2026-01';
  var CULQI_CHECKOUT_URL = 'https://js.culqi.com/checkout-js';
  var WHATSAPP_ASESOR = '51993750351';
  var LEGAL_VERSION = '2026-07-25';
  var INITIAL_TYPES = {
    matricula_y_primera_cuota:true,
    solo_matricula:true,
    primera_cuota:true,
    pago_total:true
  };

  var firebaseReady = null;
  var currentOfficial = null;
  var summaryRequest = 0;
  var activePayment = null;
  var culqiCheckout = null;
  var scriptPromises = {};

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
    return 'S/ ' + (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
  }
  function normalized(value){
    return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }
  function inferModalidad(name){
    var value = normalized(name);
    if(value.indexOf('virtual') !== -1) return 'Virtual';
    if(value.indexOf('mixto') !== -1 || value.indexOf('hibrido') !== -1) return 'Mixta';
    return 'Presencial';
  }
  function inferTurno(name){
    var value = normalized(name);
    if(value.indexOf('manana') !== -1) return 'Mañana';
    if(value.indexOf('tarde') !== -1) return 'Tarde';
    if(value.indexOf('noche') !== -1) return 'Noche';
    if(value.indexOf('full') !== -1 || value.indexOf('unico') !== -1) return 'FULL';
    return 'Por confirmar';
  }
  function promotionIsActive(plan){
    if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
    if(!plan.promocionHasta) return true;
    var end = new Date(plan.promocionHasta + 'T23:59:59');
    return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
  }
  function defaultInitialType(type,matricula){
    if(type === 'unico') return 'pago_total';
    return num(matricula) > 0 ? 'matricula_y_primera_cuota' : 'primera_cuota';
  }
  function initialType(value,type,matricula){
    return INITIAL_TYPES[value] ? value : defaultInitialType(type,matricula);
  }
  function conceptLabel(value,type){
    var labels = {
      matricula_y_primera_cuota:'Matrícula + primera pensión',
      solo_matricula:'Solo matrícula',
      primera_cuota:type === 'unico' ? 'Pago único del programa' : 'Primera pensión',
      pago_total:'Pago completo del programa'
    };
    return labels[value] || labels[defaultInitialType(type,0)];
  }
  function calculate(plan){
    var promo = promotionIsActive(plan);
    var price = promo ? num(plan.precioPromocional) : num(plan.precio);
    var matricula = num(plan.matricula);
    var mode = initialType(clean(plan.cobroInicial),plan.tipoCobro,matricula);
    var total = price;
    if(mode === 'solo_matricula') total = matricula;
    if(mode === 'matricula_y_primera_cuota' || mode === 'pago_total') total = matricula + price;
    return {
      promocionAplicada:promo,
      precioAplicado:price,
      cobroInicial:mode,
      conceptoInicial:conceptLabel(mode,plan.tipoCobro),
      totalInicial:Math.round(total * 100) / 100
    };
  }
  function laterPayments(plan,calc){
    var saved = clean(plan.detallePagosPosteriores);
    if(saved) return saved;
    if(plan.tipoCobro === 'unico'){
      return calc.cobroInicial === 'solo_matricula'
        ? 'Queda pendiente el pago único del programa.'
        : 'No registra pagos posteriores por este plan.';
    }
    return calc.cobroInicial === 'solo_matricula'
      ? 'Primera pensión y pensiones mensuales según el cronograma académico.'
      : 'Pensiones mensuales posteriores según el cronograma académico.';
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
  function formValue(form,name){ return clean(form.elements[name] && form.elements[name].value); }
  function selectedText(select){
    if(!select || select.selectedIndex < 0) return '';
    return clean(select.options[select.selectedIndex] && select.options[select.selectedIndex].textContent);
  }
  function getPlanId(form){ return formValue(form,'plan'); }
  function selectedPaymentMethod(form){ return formValue(form,'metodoPagoPreferido'); }

  function addStyles(){
    if(document.getElementById('nostra-preinscripcion-culqi-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-preinscripcion-culqi-style';
    style.textContent = '\
      .npc-summary{display:none;grid-column:1/-1;margin:6px 0 2px;border:1px solid rgba(7,140,149,.22);border-radius:24px;overflow:hidden;background:#fff;box-shadow:0 14px 36px rgba(6,20,38,.08)}\
      .npc-summary.is-visible{display:block}.npc-summary__head{padding:17px 19px;background:linear-gradient(135deg,#061426,#07515a,#078c95);color:#fff}\
      .npc-summary__head small{display:block;margin-bottom:4px;color:#8ef1f4;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.55px}\
      .npc-summary__head strong{display:block;font-family:"Baloo 2",Jost,Arial,sans-serif;font-size:25px;line-height:1.05}.npc-summary__body{padding:18px 19px}\
      .npc-summary__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.npc-summary__item{padding:12px 13px;border-radius:14px;background:#f4fbfc;border:1px solid rgba(7,140,149,.13)}\
      .npc-summary__item span{display:block;margin-bottom:3px;color:#607080;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.npc-summary__item b{display:block;color:#061426;font-size:15px;line-height:1.3}\
      .npc-summary__total{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:13px;padding:16px;border-radius:17px;background:#061426;color:#fff}.npc-summary__total span{font-size:13px;font-weight:850}.npc-summary__total strong{color:#62e5eb;font-size:28px;line-height:1}\
      .npc-summary__after{margin:12px 0 0;color:#4b5d70;font-size:13px;line-height:1.5;font-weight:750}.npc-summary__status{padding:16px 19px;color:#075b65;font-size:13px;font-weight:850}.npc-summary__status.error{color:#b42318;background:#fff2f2}\
      .npc-legal{grid-column:1/-1;margin-top:4px;padding:18px;border-radius:20px;background:#f5fbfc;border:1px solid rgba(7,140,149,.2)}.npc-legal label{display:grid;grid-template-columns:auto 1fr;gap:11px;align-items:start;cursor:pointer}.npc-legal input{width:20px!important;height:20px;margin-top:2px;accent-color:#078c95}\
      .npc-legal strong{display:block;color:#061426;font-size:15px;line-height:1.4}.npc-legal p{margin:7px 0 0;color:#5f6b7a;font-size:13px;line-height:1.55}.npc-legal a{color:#007b86;font-weight:900;text-decoration:underline}\
      .npc-pay-button{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#ff941e,#078c95,#061426);color:#fff;font:inherit;font-weight:950;cursor:pointer;text-decoration:none;margin-top:12px}.npc-pay-button:disabled{opacity:.58;cursor:wait}\
      .npc-secure{display:block;margin-top:8px;color:#4b5d70;font-size:12px;font-weight:750}.npc-secure b{color:#075b65}\
      @media(max-width:620px){.npc-summary__grid{grid-template-columns:1fr}.npc-summary__total{align-items:flex-start;flex-direction:column}.npc-summary__total strong{font-size:25px}}';
    document.head.appendChild(style);
  }
  function ensureUi(form){
    addStyles();
    var legacySummary = document.getElementById('selected-plan-summary');
    if(legacySummary) legacySummary.remove();
    var plan = form.elements.plan;
    var planField = plan && plan.closest('.field');
    if(planField && !document.getElementById('nostra-purchase-summary')){
      var summary = document.createElement('section');
      summary.id = 'nostra-purchase-summary';
      summary.className = 'npc-summary';
      summary.setAttribute('aria-live','polite');
      planField.insertAdjacentElement('afterend',summary);
    }
    if(!document.getElementById('nostra-legal-acceptance')){
      var submit = form.querySelector('button[type="submit"]');
      if(submit){
        var legal = document.createElement('div');
        legal.id = 'nostra-legal-acceptance';
        legal.className = 'npc-legal';
        legal.innerHTML = '<label><input type="checkbox" id="acepta-condiciones-compra" required><span><strong>Acepto las condiciones del programa y del pago.</strong><p>Declaro que revisé el programa, plan, modalidad, precio y monto inicial. Acepto los <a href="terminos-y-condiciones.html" target="_blank" rel="noopener">Términos y Condiciones</a>, la <a href="politica-cambios-devoluciones.html" target="_blank" rel="noopener">Política de Cambios y Devoluciones</a> y la <a href="politica-de-privacidad.html" target="_blank" rel="noopener">Política de Privacidad</a>.</p></span></label>';
        submit.insertAdjacentElement('beforebegin',legal);
      }
    }
  }
  function renderLoading(){
    var box = document.getElementById('nostra-purchase-summary');
    if(!box) return;
    box.className = 'npc-summary is-visible';
    box.innerHTML = '<div class="npc-summary__status">Consultando el precio oficial del panel administrativo...</div>';
  }
  function renderUnavailable(text){
    currentOfficial = null;
    var box = document.getElementById('nostra-purchase-summary');
    if(!box) return;
    box.className = 'npc-summary is-visible';
    box.innerHTML = '<div class="npc-summary__status error">' + esc(text) + '</div>';
  }
  function renderEmpty(){
    currentOfficial = null;
    var box = document.getElementById('nostra-purchase-summary');
    if(!box) return;
    box.className = 'npc-summary';
    box.innerHTML = '';
  }
  function renderOfficial(official){
    currentOfficial = official;
    var box = document.getElementById('nostra-purchase-summary');
    if(!box) return;
    var promo = official.calc.promocionAplicada
      ? '<div class="npc-summary__item"><span>Promoción aplicada</span><b>' + money(official.plan.precio) + ' → ' + money(official.calc.precioAplicado) + '</b></div>'
      : '<div class="npc-summary__item"><span>Precio del plan</span><b>' + money(official.calc.precioAplicado) + ' ' + (official.plan.tipoCobro === 'unico' ? 'pago único' : 'mensual') + '</b></div>';
    box.className = 'npc-summary is-visible';
    box.innerHTML = '<div class="npc-summary__head"><small>Resumen oficial de compra</small><strong>' + esc(official.program.nombre) + ' · ' + esc(official.plan.nombre) + '</strong></div>' +
      '<div class="npc-summary__body"><div class="npc-summary__grid">' +
      '<div class="npc-summary__item"><span>Modalidad y turno</span><b>' + esc(official.modalidad) + ' · ' + esc(official.turno) + '</b></div>' +
      '<div class="npc-summary__item"><span>Concepto inicial</span><b>' + esc(official.calc.conceptoInicial) + '</b></div>' + promo +
      '<div class="npc-summary__item"><span>Matrícula</span><b>' + (num(official.plan.matricula) > 0 ? money(official.plan.matricula) : 'No aplica') + '</b></div>' +
      '</div><div class="npc-summary__total"><span>Total que se cobrará inicialmente</span><strong>' + money(official.calc.totalInicial) + '</strong></div>' +
      '<p class="npc-summary__after"><b>Pagos posteriores:</b> ' + esc(official.detallePagosPosteriores) + '<br>El servidor volverá a consultar el tarifario antes de efectuar el cargo.</p></div>';
  }
  function officialSelection(form){
    var programId = formValue(form,'ciclo');
    var planId = getPlanId(form);
    if(!programId || !planId) return Promise.reject(new Error('Selecciona un programa y un plan.'));
    return initFirebase().then(function(ctx){
      return ctx.fs.getDoc(ctx.fs.doc(ctx.db,'programas_publicos',programId)).then(function(snapshot){
        if(!snapshot.exists()) throw new Error('El programa todavía no tiene un tarifario publicado.');
        var program = snapshot.data() || {};
        if(program.publicado === false) throw new Error('El programa seleccionado no está disponible actualmente.');
        var plans = Array.isArray(program.planes) ? program.planes : [];
        var plan = plans.find(function(item){ return item && clean(item.id) === planId; });
        if(!plan || plan.activo === false) throw new Error('El plan seleccionado ya no está disponible.');
        if(num(plan.precio) <= 0) throw new Error('El plan no tiene un precio válido en el panel administrativo.');
        var calc = calculate(plan);
        if(calc.totalInicial <= 0) throw new Error('El monto inicial del plan no es válido.');
        return {
          ctx:ctx,
          program:{
            id:programId,
            nombre:clean(program.nombre) || selectedText(form.elements.ciclo),
            fechaInicio:clean(program.fechaInicio),
            duracion:clean(program.duracion),
            esquemaPrecios:num(program.esquemaPrecios) || 3
          },
          plan:plan,
          modalidad:clean(plan.modalidad) || inferModalidad(plan.nombre),
          turno:clean(plan.turno) || inferTurno(plan.nombre),
          calc:calc,
          detallePagosPosteriores:laterPayments(plan,calc)
        };
      });
    });
  }
  function refreshSummary(form){
    var programId = formValue(form,'ciclo');
    var planId = getPlanId(form);
    if(!programId || !planId){ renderEmpty(); return; }
    var requestId = ++summaryRequest;
    renderLoading();
    officialSelection(form).then(function(official){
      if(requestId === summaryRequest) renderOfficial(official);
    }).catch(function(error){
      if(requestId === summaryRequest) renderUnavailable(error.message || 'No se pudo consultar el tarifario oficial.');
    });
  }
  function message(type,text){
    var box = document.getElementById('preinscripcion-message');
    if(!box) return;
    box.className = 'form-message ' + type;
    box.innerHTML = text;
  }
  function validateBasic(form){
    if(formValue(form,'nombre').length < 5) return 'Escribe nombres y apellidos completos.';
    if(formValue(form,'dni').length < 8) return 'Escribe un DNI válido.';
    if(formValue(form,'celular').length < 9) return 'Escribe un celular válido.';
    if(formValue(form,'correo').indexOf('@') === -1) return 'Escribe un correo personal válido.';
    if(!formValue(form,'ciclo')) return 'Selecciona un programa.';
    if(!getPlanId(form)) return 'Selecciona un plan.';
    if(!selectedPaymentMethod(form)) return 'Selecciona una forma de pago.';
    if(!formValue(form,'confirmacion')) return 'Acepta que Coordinación se comunique contigo.';
    var legal = document.getElementById('acepta-condiciones-compra');
    if(!legal || !legal.checked) return 'Debes aceptar los términos, la política de cambios y la política de privacidad.';
    return '';
  }
  function operationCode(id){
    return 'PRE-' + new Date().getFullYear() + '-' + String(id || '').slice(0,8).toUpperCase();
  }
  function buildData(form,official,refId){
    var method = selectedPaymentMethod(form);
    var plan = official.plan;
    var calc = official.calc;
    var now = new Date().toISOString();
    return {
      nombre:formValue(form,'nombre'),
      dni:formValue(form,'dni'),
      celular:formValue(form,'celular'),
      correo:formValue(form,'correo').toLowerCase(),
      colegio:formValue(form,'colegio'),
      situacion:formValue(form,'situacion'),
      programaId:official.program.id,
      ciclo:official.program.nombre,
      planId:clean(plan.id),
      planNombre:clean(plan.nombre),
      modalidad:official.modalidad,
      turno:official.turno,
      precioReferencia:calc.precioAplicado,
      matriculaReferencia:num(plan.matricula),
      tipoCobroReferencia:plan.tipoCobro === 'unico' ? 'unico' : 'mensual',
      cobroInicial:calc.cobroInicial,
      conceptoPagoInicial:calc.conceptoInicial,
      totalInicial:calc.totalInicial,
      montoPagoInicial:calc.totalInicial,
      montoPagoInicialCentimos:Math.round(calc.totalInicial * 100),
      moneda:'PEN',
      detallePagosPosteriores:official.detallePagosPosteriores,
      apoderado:formValue(form,'apoderado'),
      celularApoderado:formValue(form,'celularApoderado'),
      comentario:formValue(form,'comentario'),
      confirmacion:formValue(form,'confirmacion'),
      metodoPagoPreferido:method,
      metodoPagoLabel:method === 'pago_online' ? 'Pago en línea' : 'Voucher por WhatsApp',
      estadoPago:method === 'pago_online' ? 'pendiente_pago_online' : 'pendiente_envio_voucher',
      pagoValidado:false,
      pagoObservacion:'',
      precioValidadoServidor:false,
      estadoPrecio:'pendiente_validacion_servidor',
      intentoPagoCreado:false,
      matriculaAprobada:false,
      asesorAsignado:'',
      estado:'nuevo',
      origen:'web_preinscripcion',
      tipo:'preinscripcion_inicial',
      lineaAcademica:'Nostra UNI Premium',
      correoInstitucionalAsignado:false,
      codigoSolicitud:operationCode(refId),
      aceptacionLegal:{terminos:true,cambiosDevoluciones:true,privacidad:true,version:LEGAL_VERSION,fechaCliente:now},
      aceptaTerminos:true,
      aceptaCambiosDevoluciones:true,
      aceptaPrivacidad:true,
      aceptacionLegalVersion:LEGAL_VERSION,
      tarifarioSnapshot:{
        programaId:official.program.id,
        programaNombre:official.program.nombre,
        programaFechaInicio:official.program.fechaInicio,
        programaDuracion:official.program.duracion,
        planId:clean(plan.id),
        planNombre:clean(plan.nombre),
        modalidad:official.modalidad,
        turno:official.turno,
        tipoCobro:plan.tipoCobro === 'unico' ? 'unico' : 'mensual',
        cobroInicial:calc.cobroInicial,
        conceptoInicial:calc.conceptoInicial,
        precioRegular:num(plan.precio),
        promocionAplicada:calc.promocionAplicada,
        precioPromocional:num(plan.precioPromocional),
        promocionHasta:clean(plan.promocionHasta),
        precioAplicado:calc.precioAplicado,
        matricula:num(plan.matricula),
        totalInicial:calc.totalInicial,
        totalInicialCentimos:Math.round(calc.totalInicial * 100),
        moneda:'PEN',
        detallePagosPosteriores:official.detallePagosPosteriores,
        esquemaPrecios:official.program.esquemaPrecios,
        consultadoAtCliente:now
      },
      userAgent:navigator.userAgent || '',
      pageUrl:location.href
    };
  }
  function voucherButtonHtml(data){
    var text = [
      'Hola Nostradamus, soy ' + data.nombre + '.',
      'Mi código de preinscripción es: ' + data.codigoSolicitud + '.',
      'Programa: ' + data.ciclo + '.',
      'Plan: ' + data.planNombre + '.',
      'Pago inicial registrado: ' + money(data.totalInicial) + '.',
      'DNI: ' + data.dni + '.',
      'Adjunto mi voucher para validación.'
    ].join('\n');
    var url = 'https://wa.me/' + WHATSAPP_ASESOR + '?text=' + encodeURIComponent(text);
    return '<br><br><a href="' + url + '" target="_blank" rel="noopener noreferrer" class="npc-pay-button" style="background:linear-gradient(135deg,#25d366,#078c95)">📲 Enviar voucher por WhatsApp</a><br><small>Adjunta la imagen del voucher en ese mismo chat.</small>';
  }
  function loadScript(src,readyTest){
    if(readyTest && readyTest()) return Promise.resolve();
    if(scriptPromises[src]) return scriptPromises[src];
    scriptPromises[src] = new Promise(function(resolve,reject){
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function(){ resolve(); };
      script.onerror = function(){ reject(new Error('No se pudo cargar un componente seguro de Culqi.')); };
      document.head.appendChild(script);
    });
    return scriptPromises[src];
  }
  function ensureCulqi(){
    return loadScript(PUBLIC_CONFIG_URL,function(){ return typeof window.NOSTRA_CULQI_PUBLIC_KEY === 'string'; })
      .then(function(){
        var key = clean(window.NOSTRA_CULQI_PUBLIC_KEY);
        if(!/^pk_test_[A-Za-z0-9]+$/.test(key)){
          throw new Error('El pago en línea todavía no tiene configurada la llave pública de prueba de Culqi.');
        }
        return loadScript(CULQI_CHECKOUT_URL,function(){ return typeof window.CulqiCheckout === 'function'; }).then(function(){ return key; });
      });
  }
  function postJson(url,payload){
    return fetch(url,{
      method:'POST',
      mode:'cors',
      credentials:'omit',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    }).then(function(response){
      return response.json().catch(function(){ return {}; }).then(function(body){
        if(!response.ok){
          var error = new Error(clean(body.message) || 'No se pudo completar la operación.');
          error.code = clean(body.error);
          error.status = response.status;
          error.details = body.details || null;
          throw error;
        }
        body.httpStatus = response.status;
        return body;
      });
    });
  }
  function resultUrl(page,context){
    var params = new URLSearchParams({
      pre:context.preinscripcionId,
      codigo:context.codigoSolicitud
    });
    return page + '?' + params.toString();
  }
  function resetCheckout(){
    if(culqiCheckout && typeof culqiCheckout.close === 'function'){
      try{ culqiCheckout.close(); }catch(_){ }
    }
    culqiCheckout = null;
  }
  function openCheckout(context,publicKey){
    resetCheckout();
    var payment = context.prepared;
    var paymentMethods = {
      tarjeta:true,
      yape:false,
      billetera:false,
      bancaMovil:false,
      agente:false,
      cuotealo:false
    };
    var config = {
      settings:{
        title:'Grupo Nostradamus',
        currency:'PEN',
        amount:Number(payment.montoCentimos) || 0
      },
      client:{email:clean(payment.correo || context.data.correo)},
      options:{
        lang:'es',
        installments:false,
        modal:true,
        paymentMethods:paymentMethods,
        paymentMethodsSort:['tarjeta']
      },
      appearance:{
        theme:'default',
        hiddenCulqiLogo:false,
        hiddenBannerContent:false,
        hiddenBanner:false,
        hiddenToolBarAmount:false,
        hiddenEmail:false,
        menuType:'sidebar',
        buttonCardPayText:'Pagar ahora',
        logo:'https://gruponostradamus.edu.pe/assets/img/logo.png',
        defaultStyle:{
          bannerColor:'#061426',
          buttonBackground:'#078c95',
          menuColor:'#078c95',
          linksColor:'#078c95',
          buttonTextColor:'#ffffff',
          priceColor:'#061426'
        }
      }
    };
    culqiCheckout = new window.CulqiCheckout(publicKey,config);
    culqiCheckout.culqi = function(){
      if(culqiCheckout.token && culqiCheckout.token.id){
        var tokenId = culqiCheckout.token.id;
        try{ culqiCheckout.close(); }catch(_){ }
        processCharge(context,tokenId);
        return;
      }
      var culqiError = culqiCheckout.error || {};
      var text = clean(culqiError.user_message || culqiError.merchant_message || culqiError.message);
      message('error',esc(text || 'Culqi no pudo generar el token de pago. Revisa los datos de la tarjeta.'));
    };
    culqiCheckout.open();
  }
  function continueButton(context,publicKey,label){
    window.nostraContinuarPagoCulqi = function(){ openCheckout(context,publicKey); };
    return '<button type="button" class="npc-pay-button" onclick="window.nostraContinuarPagoCulqi()">' + esc(label || 'Abrir pago seguro') + '</button>' +
      '<span class="npc-secure">🔒 La información de la tarjeta se ingresa directamente en <b>Culqi</b> y no pasa por los servidores de Grupo Nostradamus.</span>';
  }
  function processCharge(context,tokenId){
    message('info','Procesando el pago de forma segura. No cierres esta ventana...');
    postJson(CHARGE_URL,{
      preinscripcionId:context.preinscripcionId,
      intentoPagoId:context.prepared.intentoPagoId,
      codigoSolicitud:context.codigoSolicitud,
      tokenId:tokenId
    }).then(function(response){
      var payment = response.payment || {};
      if(payment.estado === 'aprobado'){
        try{ sessionStorage.removeItem('nostra_culqi_pago_activo'); }catch(_){ }
        location.assign(resultUrl('pago-exitoso.html',context));
        return;
      }
      location.assign(resultUrl('pago-pendiente.html',context));
    }).catch(function(error){
      console.error('Cargo Culqi rechazado:',error);
      if(error.code === '3DS_REQUERIDO'){
        location.assign(resultUrl('pago-pendiente.html',context));
        return;
      }
      if(error.code === 'PAGO_RECHAZADO' || error.status === 402){
        location.assign(resultUrl('pago-rechazado.html',context));
        return;
      }
      message('error','No se pudo completar el cargo: ' + esc(error.message || 'error técnico') + '<br>' + continueButton(context,activePayment.publicKey,'Reintentar pago'));
    });
  }
  function prepareOnlinePayment(context,publicKey){
    message('info','Validando nuevamente el precio oficial en el servidor...');
    return postJson(PREPARE_URL,{
      preinscripcionId:context.preinscripcionId,
      codigoSolicitud:context.codigoSolicitud
    }).then(function(response){
      context.prepared = response.payment;
      context.publicKey = publicKey;
      activePayment = context;
      try{
        sessionStorage.setItem('nostra_culqi_pago_activo',JSON.stringify({
          preinscripcionId:context.preinscripcionId,
          codigoSolicitud:context.codigoSolicitud,
          prepared:context.prepared,
          data:{correo:context.data.correo}
        }));
      }catch(_){ }
      message('ok','✅ Preinscripción registrada.<br><small>Código: ' + esc(context.codigoSolicitud) + '</small><br><b>Monto validado por el servidor: ' + money((Number(context.prepared.montoCentimos) || 0) / 100) + '</b><br>' + continueButton(context,publicKey,'Pagar con tarjeta de prueba'));
      openCheckout(context,publicKey);
    });
  }
  function submit(form){
    var error = validateBasic(form);
    if(error){ message('error',error); return; }
    var button = form.querySelector('button[type="submit"]');
    var method = selectedPaymentMethod(form);
    var culqiReady = method === 'pago_online' ? ensureCulqi() : Promise.resolve('');
    if(button){ button.disabled = true; button.textContent = method === 'pago_online' ? 'Preparando pago seguro...' : 'Verificando tarifario oficial...'; }
    message('info',method === 'pago_online' ? 'Comprobando la conexión segura con Culqi...' : 'Verificando el plan y el monto oficial...');

    culqiReady.then(function(publicKey){
      return officialSelection(form).then(function(official){ return {official:official,publicKey:publicKey}; });
    }).then(function(step){
      var ctx = step.official.ctx;
      var ref = ctx.fs.doc(ctx.fs.collection(ctx.db,'preinscripciones'));
      var data = buildData(form,step.official,ref.id);
      data.createdAt = ctx.fs.serverTimestamp();
      data.updatedAt = ctx.fs.serverTimestamp();
      return ctx.fs.setDoc(ref,data).then(function(){
        return {ref:ref,data:data,publicKey:step.publicKey};
      });
    }).then(function(result){
      var data = result.data;
      if(data.metodoPagoPreferido === 'voucher_whatsapp'){
        message('ok','✅ Preinscripción registrada correctamente.<br><small>Código: ' + esc(data.codigoSolicitud) + '</small><br><b>Pago inicial registrado: ' + money(data.totalInicial) + '</b><br>Forma elegida: voucher por WhatsApp.' + voucherButtonHtml(data));
        form.reset();
        currentOfficial = null;
        renderEmpty();
        if(form.elements.ciclo) form.elements.ciclo.dispatchEvent(new Event('change',{bubbles:true}));
        return;
      }
      var context = {
        preinscripcionId:result.ref.id,
        codigoSolicitud:data.codigoSolicitud,
        data:data,
        prepared:null,
        publicKey:result.publicKey
      };
      return prepareOnlinePayment(context,result.publicKey);
    }).then(function(){
      if(typeof window.gtag === 'function' && activePayment){
        window.gtag('event','culqi_checkout_preparado',{
          event_category:'payment',
          event_label:activePayment.data.ciclo + ' - ' + activePayment.data.planNombre,
          value:activePayment.data.totalInicial,
          currency:'PEN'
        });
      }
    }).catch(function(saveError){
      console.error('No se pudo registrar o preparar la preinscripción:',saveError);
      message('error',saveError && saveError.code === 'permission-denied'
        ? 'Firebase no permitió registrar la solicitud. Deben revisarse las reglas de preinscripciones.'
        : esc(saveError && saveError.message ? saveError.message : 'No se pudo verificar el tarifario o preparar el pago.'));
    }).finally(function(){
      if(button){ button.disabled = false; button.textContent = 'Enviar preinscripción'; }
    });
  }

  document.addEventListener('submit',function(event){
    var form = event.target;
    if(!form || form.id !== 'preinscripcion-form') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    submit(form);
  },true);

  function start(){
    var form = document.getElementById('preinscripcion-form');
    if(!form) return;
    ensureUi(form);
    var attach = function(){
      ensureUi(form);
      if(form.elements.ciclo && form.elements.ciclo.dataset.culqiListener !== '1'){
        form.elements.ciclo.addEventListener('change',function(){
          currentOfficial = null;
          window.setTimeout(function(){ refreshSummary(form); },120);
        });
        form.elements.ciclo.dataset.culqiListener = '1';
      }
      if(form.elements.plan && form.elements.plan.dataset.culqiListener !== '1'){
        form.elements.plan.addEventListener('change',function(){ refreshSummary(form); });
        form.elements.plan.dataset.culqiListener = '1';
      }
      refreshSummary(form);
    };
    attach();
    var attempts = 0;
    var timer = window.setInterval(function(){
      attempts += 1;
      attach();
      if(form.elements.plan || attempts >= 20) window.clearInterval(timer);
    },100);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
