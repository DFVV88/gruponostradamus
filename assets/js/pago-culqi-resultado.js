/* Grupo Nostradamus - Verificación pública del resultado de pago Culqi */
(function(){
  'use strict';

  var STATUS_URL = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiPaymentStatus';
  var WHATSAPP = '51993750351';

  function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }
  function money(cents,currency){
    var amount = Math.max(0,Number(cents) || 0) / 100;
    return (clean(currency) === 'PEN' ? 'S/ ' : clean(currency) + ' ') + amount.toFixed(2);
  }
  function setText(id,value){
    var el = document.getElementById(id);
    if(el) el.textContent = value;
  }
  function setHtml(id,value){
    var el = document.getElementById(id);
    if(el) el.innerHTML = value;
  }
  function stateOf(payment){
    if(payment && payment.pagoValidado === true) return 'success';
    if(payment && payment.estadoPago === 'pago_rechazado') return 'rejected';
    return 'pending';
  }
  function render(payment){
    var state = stateOf(payment);
    document.body.setAttribute('data-verified-state',state);

    if(state === 'success'){
      setText('payment-kicker','Pago confirmado por Culqi');
      setText('payment-title','¡Pago aprobado!');
      setText('payment-description','Tu pago fue validado automáticamente. La solicitud quedó lista para continuar con la matrícula.');
    }else if(state === 'rejected'){
      setText('payment-kicker','Pago no aprobado');
      setText('payment-title','El pago fue rechazado');
      setText('payment-description','No se realizó la matrícula. Revisa los datos de la tarjeta o comunícate con Coordinación antes de volver a intentar.');
    }else{
      setText('payment-kicker','Pago pendiente de confirmación');
      setText('payment-title','Estamos verificando el pago');
      setText('payment-description',payment && payment.estadoPago === 'requiere_3ds'
        ? 'La tarjeta requiere autenticación 3DS. La matrícula todavía no está aprobada.'
        : 'El pago aún no figura como validado. No realices un segundo pago hasta confirmar el estado con Coordinación.');
    }

    var details = [
      '<div><span>Código de solicitud</span><b>' + esc(payment.codigoSolicitud || '') + '</b></div>',
      '<div><span>Programa</span><b>' + esc(payment.programa || 'Por confirmar') + '</b></div>',
      '<div><span>Plan</span><b>' + esc(payment.plan || 'Por confirmar') + '</b></div>',
      '<div><span>Monto</span><b>' + esc(money(payment.montoCentimos,payment.moneda)) + '</b></div>'
    ];
    if(payment.cargoId){
      details.push('<div><span>ID de cargo Culqi</span><b>' + esc(payment.cargoId) + '</b></div>');
    }
    setHtml('payment-details',details.join(''));

    var message = 'Hola Nostradamus, deseo consultar el pago de mi solicitud ' + clean(payment.codigoSolicitud) + '.';
    var wa = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message);
    setHtml('payment-actions',
      '<a class="result-btn primary" href="index.html">Volver al inicio</a>' +
      '<a class="result-btn whatsapp" href="' + wa + '" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>'
    );
  }
  function renderError(text){
    document.body.setAttribute('data-verified-state','error');
    setText('payment-kicker','No se pudo verificar');
    setText('payment-title','Revisa tu solicitud');
    setText('payment-description',text || 'No fue posible consultar el estado del pago.');
    setHtml('payment-details','');
    setHtml('payment-actions','<a class="result-btn primary" href="preinscripcion.html">Volver a preinscripción</a>');
  }
  function postStatus(pre,codigo){
    return fetch(STATUS_URL,{
      method:'POST',
      mode:'cors',
      credentials:'omit',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({preinscripcionId:pre,codigoSolicitud:codigo})
    }).then(function(response){
      return response.json().catch(function(){ return {}; }).then(function(body){
        if(!response.ok) throw new Error(clean(body.message) || 'No se pudo consultar el estado del pago.');
        return body.payment || {};
      });
    });
  }
  function start(){
    var params = new URLSearchParams(location.search);
    var pre = clean(params.get('pre'));
    var codigo = clean(params.get('codigo'));
    if(!/^[A-Za-z0-9_-]{10,80}$/.test(pre) || !/^PRE-[0-9]{4}-[A-Z0-9]{8}$/.test(codigo)){
      renderError('El enlace no contiene una solicitud válida.');
      return;
    }
    setText('payment-description','Consultando el estado real del pago en Firebase...');
    postStatus(pre,codigo).then(render).catch(function(error){
      console.error('No se pudo verificar el pago:',error);
      renderError(error.message);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
