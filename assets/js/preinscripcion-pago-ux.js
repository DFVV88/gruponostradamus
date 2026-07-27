/* ==================================================
   Grupo Nostradamus - Experiencia de pago Culqi
   - Muestra una pantalla visible mientras se procesa el pago.
   - Evita cierres o recargas accidentales durante la confirmación.
   - Explica el ocultamiento seguro de los datos de tarjeta.
   - Ofrece una guía en español durante el desafío 3DS del banco.
================================================== */
(function(){
  'use strict';

  var state = {
    busy:false,
    seconds:0,
    timer:null,
    tipTimer:null,
    observer:null
  };

  function clean(value){
    return String(value == null ? '' : value).replace(/\s+/g,' ').trim();
  }

  function normalized(value){
    return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function addStyles(){
    if(document.getElementById('nostra-payment-ux-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-payment-ux-style';
    style.textContent = '\
      body.nostra-payment-busy{overflow:hidden!important}\
      .npu-overlay{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(2,7,13,.91);backdrop-filter:blur(8px)}\
      .npu-overlay.is-visible{display:flex}.npu-card{width:min(520px,100%);border:1px solid rgba(98,229,235,.28);border-radius:30px;padding:34px 28px;text-align:center;background:linear-gradient(160deg,#ffffff,#f0fbfc);box-shadow:0 32px 90px rgba(0,0,0,.45)}\
      .npu-logo{width:94px;max-height:58px;object-fit:contain;margin:0 auto 14px}.npu-spinner{width:62px;height:62px;margin:0 auto 21px;border:7px solid #d8f1f3;border-top-color:#078c95;border-right-color:#ff941e;border-radius:50%;animation:npu-spin .85s linear infinite}\
      .npu-eyebrow{display:block;margin-bottom:8px;color:#078c95;font:900 12px Jost,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase}.npu-title{margin:0;color:#061426;font:900 clamp(28px,6vw,40px)/1.05 "Baloo 2",Jost,Arial,sans-serif}.npu-detail{margin:14px auto 0;max-width:420px;color:#4b5d70;font:750 16px/1.55 Jost,Arial,sans-serif}\
      .npu-warning{margin:18px 0 0;padding:13px 15px;border-radius:16px;background:#fff4df;color:#7a4900;font:850 13px/1.45 Jost,Arial,sans-serif}.npu-time{display:block;margin-top:13px;color:#667788;font:750 12px Jost,Arial,sans-serif}\
      .npu-toast{position:fixed;z-index:2147483646;left:18px;bottom:18px;display:none;width:min(390px,calc(100vw - 36px));padding:15px 17px;border-radius:18px;background:#061426;color:#fff;box-shadow:0 20px 55px rgba(0,0,0,.38);font:750 13px/1.48 Jost,Arial,sans-serif;pointer-events:none}.npu-toast.is-visible{display:block}.npu-toast strong{display:block;margin-bottom:4px;color:#73edf2;font-size:14px}\
      .npu-3ds-guide{position:fixed;z-index:2147483647;top:16px;right:16px;display:none;width:min(330px,calc(100vw - 32px));padding:14px 16px;border:2px solid #00a9b5;border-radius:18px;background:#061426;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5);font:750 13px/1.45 Jost,Arial,sans-serif}.npu-3ds-guide.is-visible{display:block}.npu-3ds-guide strong{display:block;margin-bottom:7px;color:#79f0f4;font-size:15px}.npu-3ds-guide span{display:block;margin-top:4px}.npu-3ds-guide b{color:#ffd091}\
      .npu-checkout-note{display:block;margin-top:10px;padding:10px 12px;border-radius:13px;background:#eef8fa;color:#075b65;font-size:12px;font-weight:800;line-height:1.45}\
      @keyframes npu-spin{to{transform:rotate(360deg)}}\
      @media(max-width:620px){.npu-card{padding:28px 20px;border-radius:24px}.npu-toast{left:10px;right:10px;bottom:10px;width:auto}.npu-3ds-guide{top:8px;left:8px;right:8px;width:auto;padding:11px 13px;font-size:12px}}\
      @media(prefers-reduced-motion:reduce){.npu-spinner{animation-duration:1.8s}}';
    document.head.appendChild(style);
  }

  function buildUi(){
    addStyles();
    if(!document.getElementById('nostra-payment-overlay')){
      var overlay = document.createElement('div');
      overlay.id = 'nostra-payment-overlay';
      overlay.className = 'npu-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-live','assertive');
      overlay.setAttribute('aria-hidden','true');
      overlay.innerHTML = '<div class="npu-card"><img class="npu-logo" src="assets/img/logo.png" alt="Grupo Nostradamus"><div class="npu-spinner" aria-hidden="true"></div><span class="npu-eyebrow">Pago seguro con Culqi</span><h2 class="npu-title" id="nostra-payment-title">Procesando tu pago</h2><p class="npu-detail" id="nostra-payment-detail">Estamos confirmando la operación de forma segura.</p><div class="npu-warning">No cierres esta ventana, no actualices la página y no pulses atrás. Evita intentar pagar nuevamente.</div><span class="npu-time" id="nostra-payment-time">Conectando de forma segura…</span></div>';
      document.body.appendChild(overlay);
    }
    if(!document.getElementById('nostra-card-security-tip')){
      var tip = document.createElement('div');
      tip.id = 'nostra-card-security-tip';
      tip.className = 'npu-toast';
      tip.setAttribute('role','status');
      tip.innerHTML = '<strong>Datos protegidos por Culqi</strong>El número, vencimiento y CVV se ocultan por seguridad. Usa el ícono del ojo solo para revisarlos. Grupo Nostradamus no recibe ni almacena esos datos.';
      document.body.appendChild(tip);
    }
    if(!document.getElementById('nostra-3ds-guide')){
      var guide = document.createElement('div');
      guide.id = 'nostra-3ds-guide';
      guide.className = 'npu-3ds-guide';
      guide.setAttribute('role','status');
      guide.innerHTML = '<strong>Verificación bancaria 3DS</strong><span>Ingresa el código que muestra o envía el banco.</span><span><b>SUBMIT</b> = Enviar código</span><span><b>RESEND CODE</b> = Reenviar código</span><span><b>CANCEL</b> = Cancelar</span>';
      document.body.appendChild(guide);
    }
    enhancePaymentCopy();
  }

  function enhancePaymentCopy(){
    var input = document.querySelector('input[name="metodoPagoPreferido"][value="pago_online"]');
    var option = input && input.closest('.pay-option');
    if(!option || option.querySelector('.npu-checkout-note')) return;
    var note = document.createElement('span');
    note.className = 'npu-checkout-note';
    note.textContent = 'Por seguridad, Culqi oculta los datos mientras los escribes. Puedes revisarlos con el ícono del ojo antes de pagar.';
    var content = input.nextElementSibling || option;
    content.appendChild(note);
  }

  function stopTimer(){
    if(state.timer){
      window.clearInterval(state.timer);
      state.timer = null;
    }
  }

  function startTimer(){
    stopTimer();
    state.seconds = 0;
    var time = document.getElementById('nostra-payment-time');
    if(time) time.textContent = 'Conectando de forma segura…';
    state.timer = window.setInterval(function(){
      state.seconds += 1;
      if(!time) return;
      if(state.seconds < 8) time.textContent = 'Conectando de forma segura…';
      else if(state.seconds < 30) time.textContent = 'Seguimos confirmando la operación… ' + state.seconds + ' s';
      else time.textContent = 'La confirmación está tardando un poco. No repitas el pago… ' + state.seconds + ' s';
    },1000);
  }

  function showBusy(title,detail){
    buildUi();
    hide3DSGuide();
    var overlay = document.getElementById('nostra-payment-overlay');
    var titleNode = document.getElementById('nostra-payment-title');
    var detailNode = document.getElementById('nostra-payment-detail');
    if(titleNode) titleNode.textContent = title || 'Procesando tu pago';
    if(detailNode) detailNode.textContent = detail || 'Estamos confirmando la operación de forma segura.';
    if(overlay){
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden','false');
    }
    document.body.classList.add('nostra-payment-busy');
    state.busy = true;
    startTimer();
  }

  function hideBusy(){
    var overlay = document.getElementById('nostra-payment-overlay');
    if(overlay){
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden','true');
    }
    document.body.classList.remove('nostra-payment-busy');
    state.busy = false;
    stopTimer();
  }

  function showCardTip(){
    buildUi();
    var tip = document.getElementById('nostra-card-security-tip');
    if(!tip) return;
    tip.classList.add('is-visible');
    if(state.tipTimer) window.clearTimeout(state.tipTimer);
    state.tipTimer = window.setTimeout(function(){ tip.classList.remove('is-visible'); },11000);
  }

  function hideCardTip(){
    var tip = document.getElementById('nostra-card-security-tip');
    if(tip) tip.classList.remove('is-visible');
    if(state.tipTimer){
      window.clearTimeout(state.tipTimer);
      state.tipTimer = null;
    }
  }

  function show3DSGuide(){
    buildUi();
    hideBusy();
    hideCardTip();
    var guide = document.getElementById('nostra-3ds-guide');
    if(guide) guide.classList.add('is-visible');
  }

  function hide3DSGuide(){
    var guide = document.getElementById('nostra-3ds-guide');
    if(guide) guide.classList.remove('is-visible');
  }

  function syncFromMessage(){
    var box = document.getElementById('preinscripcion-message');
    if(!box) return;
    var text = normalized(box.textContent);
    var isError = box.classList.contains('error');
    var isOk = box.classList.contains('ok');

    if(isError || text.indexOf('no se pudo') !== -1 || text.indexOf('pago rechazado') !== -1){
      hideBusy();
      hide3DSGuide();
      return;
    }

    if(text.indexOf('tu banco solicita autenticacion 3ds') !== -1 || text.indexOf('verificando tu identidad con el banco') !== -1){
      show3DSGuide();
      return;
    }

    if(text.indexOf('autenticacion 3ds completada') !== -1 || text.indexOf('confirmando el pago autenticado') !== -1){
      showBusy('Confirmando tu pago','La autenticación bancaria fue aceptada. Estamos registrando la confirmación final.');
      return;
    }

    if(text.indexOf('preparando la verificacion de seguridad') !== -1){
      showBusy('Verificando la seguridad','Estamos protegiendo y validando el dispositivo antes de enviar el cargo.');
      return;
    }

    if(text.indexOf('procesando el pago') !== -1){
      showBusy('Procesando tu pago','Culqi está confirmando la operación con la tarjeta y el banco emisor.');
      return;
    }

    if(text.indexOf('validando nuevamente el precio') !== -1 || text.indexOf('comprobando la conexion segura') !== -1){
      showBusy('Preparando el pago seguro','Estamos verificando el precio oficial y conectando con Culqi.');
      return;
    }

    if(isOk && text.indexOf('preinscripcion registrada') !== -1){
      hideBusy();
      hide3DSGuide();
      showCardTip();
      return;
    }

    if(isOk){
      hideBusy();
      hide3DSGuide();
    }
  }

  function observeMessage(){
    var box = document.getElementById('preinscripcion-message');
    if(!box || state.observer) return;
    state.observer = new MutationObserver(syncFromMessage);
    state.observer.observe(box,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    syncFromMessage();
  }

  function start(){
    document.documentElement.lang = 'es';
    buildUi();
    observeMessage();
    var attempts = 0;
    var timer = window.setInterval(function(){
      attempts += 1;
      buildUi();
      observeMessage();
      if(state.observer || attempts >= 30) window.clearInterval(timer);
    },150);

    document.addEventListener('submit',function(event){
      var form = event.target;
      if(!form || form.id !== 'preinscripcion-form') return;
      var online = form.querySelector('input[name="metodoPagoPreferido"][value="pago_online"]:checked');
      if(online) showBusy('Preparando el pago seguro','Estamos registrando la solicitud y verificando el tarifario oficial.');
    },true);

    document.addEventListener('click',function(event){
      var button = event.target && event.target.closest ? event.target.closest('.npc-pay-button') : null;
      if(!button) return;
      var text = normalized(button.textContent);
      if(text.indexOf('tarjeta') !== -1 || text.indexOf('pago seguro') !== -1 || text.indexOf('reintentar pago') !== -1){
        showCardTip();
      }
    },true);
  }

  window.addEventListener('beforeunload',function(event){
    if(!state.busy) return;
    event.preventDefault();
    event.returnValue = '';
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
