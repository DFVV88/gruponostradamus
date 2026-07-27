from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"No se encontró el bloque esperado: {label}")
    return text.replace(old, new, 1)


def replace_between(text, start, end, replacement, label):
    start_index = text.find(start)
    if start_index < 0:
        raise SystemExit(f"No se encontró el inicio: {label}")
    end_index = text.find(end, start_index)
    if end_index < 0:
        raise SystemExit(f"No se encontró el final: {label}")
    return text[:start_index] + replacement + text[end_index:]


backend_path = Path('functions/backend.js')
backend = backend_path.read_text(encoding='utf-8')

backend = replace_once(
    backend,
    "} = require('./lib/common');\n",
    "} = require('./lib/common');\nconst {\n  normalizeDeviceFingerprint,\n  normalizeAuthentication3DS,\n  paymentContextHash\n} = require('./lib/culqi3ds');\n",
    'importación Culqi 3DS'
)

backend = replace_once(
    backend,
    'async function reserveCharge(preId, attemptId, code) {',
    'async function reserveCharge(preId, attemptId, code, flow) {',
    'firma reserveCharge'
)

old_reserve_validation = """    if (attempt.estado === 'aprobado' && clean(attempt.culqiChargeId)) {
      return {
        alreadyApproved: true,
        chargeId: clean(attempt.culqiChargeId),
        amount: Number(attempt.totalInicialCentimos) || 0
      };
    }

    assertPayable(pre);
"""
new_reserve_validation = """    if (attempt.estado === 'aprobado' && clean(attempt.culqiChargeId)) {
      return {
        alreadyApproved: true,
        chargeId: clean(attempt.culqiChargeId),
        amount: Number(attempt.totalInicialCentimos) || 0
      };
    }

    const waitingFor3DS = attempt.estado === 'requiere_3ds';
    if (waitingFor3DS) {
      if (!flow.authentication3DS) {
        throw new PublicError(409, '3DS_PENDIENTE', 'Este intento está esperando la autenticación 3DS.');
      }
      if (!clean(attempt.culqi3DSContextHash) || attempt.culqi3DSContextHash !== flow.contextHash) {
        throw new PublicError(409, '3DS_CONTEXTO_INVALIDO', 'La autenticación 3DS no corresponde al intento de pago.');
      }
    } else if (flow.authentication3DS) {
      throw new PublicError(409, '3DS_NO_SOLICITADO', 'Culqi no solicitó autenticación 3DS para este intento.');
    }

    assertPayable(pre);
"""
backend = replace_once(backend, old_reserve_validation, new_reserve_validation, 'validación de segunda pasada 3DS')

backend = replace_once(
    backend,
    """    tx.update(attemptRef, {
      estado: 'procesando',
      processingAt: now,
      numeroIntentosCargo: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });
""",
    """    tx.update(attemptRef, {
      estado: 'procesando',
      processingAt: now,
      culqi3DSSecondPass: waitingFor3DS,
      numeroIntentosCargo: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });
""",
    'marca de segunda pasada 3DS'
)

backend = replace_once(
    backend,
    '    return { alreadyApproved: false, pre, attempt, selection, preRef, attemptRef };',
    '    return { alreadyApproved: false, pre, attempt, selection, preRef, attemptRef, waitingFor3DS };',
    'retorno reserveCharge'
)

backend = replace_once(
    backend,
    """function antifraudDetails(pre) {
  const names = splitName(pre.nombre);
  const phone = peruPhone(pre.celular);
  const details = {
    first_name: names.firstName,
    last_name: names.lastName,
    country_code: 'PE'
  };
  if (phone) details.phone_number = phone;
  return details;
}
""",
    """function antifraudDetails(pre, deviceFingerprintId) {
  const names = splitName(pre.nombre);
  const phone = peruPhone(pre.celular);
  const details = {
    first_name: names.firstName,
    last_name: names.lastName,
    country_code: 'PE',
    device_finger_print_id: deviceFingerprintId
  };
  if (phone) details.phone_number = phone;
  return details;
}
""",
    'huella antifraude'
)

backend = replace_once(
    backend,
    """      const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);
      const tokenId = requireText(body.tokenId, 'tokenId', TOKEN_RE, 120);
      const secret = clean(CULQI_SECRET_KEY.value());
""",
    """      const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);
      const tokenId = requireText(body.tokenId, 'tokenId', TOKEN_RE, 120);
      const deviceFingerprintId = normalizeDeviceFingerprint(body.deviceFingerprintId);
      if (!deviceFingerprintId) {
        throw new PublicError(400, 'DEVICE_3DS_INVALIDO', 'No se pudo validar el dispositivo para el pago seguro.');
      }
      const authentication3DS = body.authentication3DS == null
        ? null
        : normalizeAuthentication3DS(body.authentication3DS);
      if (body.authentication3DS != null && !authentication3DS) {
        throw new PublicError(400, 'PARAMETROS_3DS_INVALIDOS', 'Los parámetros de autenticación 3DS son inválidos.');
      }
      const contextHash = paymentContextHash(tokenId, deviceFingerprintId);
      const secret = clean(CULQI_SECRET_KEY.value());
""",
    'lectura parámetros 3DS'
)

backend = replace_once(
    backend,
    '      reserved = await reserveCharge(preId, attemptId, code);',
    '      reserved = await reserveCharge(preId, attemptId, code, { authentication3DS, contextHash });',
    'reserva con contexto 3DS'
)

backend = replace_once(
    backend,
    """        antifraud_details: antifraudDetails(reserved.pre)
      };
""",
    """        antifraud_details: antifraudDetails(reserved.pre, deviceFingerprintId)
      };
      if (authentication3DS) payload.authentication_3DS = authentication3DS;
""",
    'payload Culqi con 3DS'
)

failure_start = '      if (!response.ok || !clean(data.id)) {'
failure_end = '\n\n      const summary = chargeSummary(data);'
new_failure = """      if (!response.ok || !clean(data.id)) {
        const requested3DS = clean(data.action_code) === 'REVIEW';
        const requires3DS = requested3DS && !authentication3DS;
        const repeated3DS = requested3DS && Boolean(authentication3DS);
        const message = safeMessage(data, requires3DS
          ? 'La tarjeta requiere autenticación 3DS.'
          : repeated3DS
            ? 'La autenticación 3DS no pudo completar el cargo.'
            : 'Culqi rechazó el cargo.');
        const attemptPatch = {
          estado: requires3DS ? 'requiere_3ds' : 'rechazado',
          culqiHttpStatus: response.status,
          culqiActionCode: clean(data.action_code),
          culqiErrorType: clean(data.type),
          culqiErrorCode: clean(data.code),
          culqiMensaje: message,
          tokenNoAlmacenado: true,
          updatedAt: FieldValue.serverTimestamp()
        };
        if (requires3DS) {
          attemptPatch.culqi3DSContextHash = contextHash;
          attemptPatch.culqi3DSRequestedAt = FieldValue.serverTimestamp();
        }
        if (authentication3DS) {
          attemptPatch.culqi3DSCompletedAt = FieldValue.serverTimestamp();
          attemptPatch.culqi3DSProtocolVersion = authentication3DS.protocolVersion;
        }
        const batch = db.batch();
        batch.update(reserved.attemptRef, attemptPatch);
        batch.update(reserved.preRef, {
          estadoPago: requires3DS ? 'requiere_3ds' : 'pago_rechazado',
          pagoValidado: false,
          matriculaAprobada: false,
          autenticacion3DS: Boolean(authentication3DS),
          pagoObservacion: message,
          updatedAt: FieldValue.serverTimestamp()
        });
        await batch.commit();
        throw new PublicError(
          requires3DS ? 409 : 402,
          requires3DS ? '3DS_REQUERIDO' : 'PAGO_RECHAZADO',
          message,
          requires3DS ? { actionCode: 'REVIEW', retryable: true } : null
        );
      }"""
backend = replace_between(backend, failure_start, failure_end, new_failure, 'manejo respuesta Culqi 3DS')

backend = replace_once(
    backend,
    """        culqiChargeId: summary.id,
        culqiResumen: summary,
        tokenNoAlmacenado: true,
""",
    """        culqiChargeId: summary.id,
        culqiResumen: summary,
        culqi3DSAplicado: Boolean(authentication3DS),
        culqi3DSProtocolVersion: authentication3DS ? authentication3DS.protocolVersion : '',
        culqi3DSContextHash: FieldValue.delete(),
        tokenNoAlmacenado: true,
""",
    'registro de aprobación 3DS'
)

backend = replace_once(
    backend,
    """        pagoObservacion: 'Pago aprobado automáticamente por Culqi.',
        precioValidadoServidor: true,
""",
    """        pagoObservacion: authentication3DS
          ? 'Pago aprobado por Culqi después de autenticación 3DS.'
          : 'Pago aprobado automáticamente por Culqi.',
        autenticacion3DS: Boolean(authentication3DS),
        precioValidadoServidor: true,
""",
    'observación aprobación 3DS'
)

backend = replace_once(
    backend,
    """          moneda: 'PEN',
          duplicado: summary.duplicated
""",
    """          moneda: 'PEN',
          duplicado: summary.duplicated,
          autenticacion3DS: Boolean(authentication3DS)
""",
    'respuesta pública 3DS'
)

backend_path.write_text(backend, encoding='utf-8')


frontend_path = Path('assets/js/preinscripcion-culqi-preparacion.js')
frontend = frontend_path.read_text(encoding='utf-8')

frontend = replace_once(
    frontend,
    '   - Envía únicamente el token al backend seguro.\n',
    '   - Envía únicamente el token al backend seguro.\n   - Completa autenticación Culqi 3DS cuando el banco la solicita.\n',
    'comentario frontend 3DS'
)
frontend = replace_once(
    frontend,
    "  var CULQI_CHECKOUT_URL = 'https://js.culqi.com/checkout-js';\n",
    "  var CULQI_CHECKOUT_URL = 'https://js.culqi.com/checkout-js';\n  var CULQI_3DS_URL = 'https://3ds.culqi.com';\n",
    'URL Culqi 3DS'
)
frontend = replace_once(
    frontend,
    """  var activePayment = null;
  var culqiCheckout = null;
  var scriptPromises = {};
""",
    """  var activePayment = null;
  var culqiCheckout = null;
  var active3DS = null;
  var threeDSListenerInstalled = false;
  var scriptPromises = {};
""",
    'estado frontend 3DS'
)

ensure_start = '  function ensureCulqi(){'
ensure_end = '  function postJson(url,payload){'
new_ensure = """  function ensureCulqi(){
    return loadScript(PUBLIC_CONFIG_URL,function(){ return typeof window.NOSTRA_CULQI_PUBLIC_KEY === 'string'; })
      .then(function(){
        var key = clean(window.NOSTRA_CULQI_PUBLIC_KEY);
        if(!/^pk_test_[A-Za-z0-9]+$/.test(key)){
          throw new Error('El pago en línea todavía no tiene configurada la llave pública de prueba de Culqi.');
        }
        return Promise.all([
          loadScript(CULQI_CHECKOUT_URL,function(){ return typeof window.CulqiCheckout === 'function'; }),
          loadScript(CULQI_3DS_URL,function(){ return Boolean(window.Culqi3DS); })
        ]).then(function(){
          window.Culqi3DS.publicKey = key;
          install3DSListener();
          return key;
        });
      });
  }
"""
frontend = replace_between(frontend, ensure_start, ensure_end, new_ensure, 'carga Culqi y Culqi3DS')

result_marker = '  function resultUrl(page,context){'
three_ds_helpers = """  function reset3DSLibrary(){
    active3DS = null;
    if(window.Culqi3DS && typeof window.Culqi3DS.reset === 'function'){
      try{ window.Culqi3DS.reset(); }catch(_){ }
    }
  }
  function configure3DS(context,publicKey){
    if(!window.Culqi3DS) throw new Error('No se pudo iniciar la seguridad 3DS de Culqi.');
    var payment = context.prepared || {};
    window.Culqi3DS.publicKey = publicKey;
    window.Culqi3DS.settings = {
      charge:{
        totalAmount:Number(payment.montoCentimos) || 0,
        returnUrl:location.origin + location.pathname,
        currency:'PEN'
      },
      card:{email:clean(payment.correo || context.data.correo)}
    };
    window.Culqi3DS.options = {
      showModal:true,
      showLoading:true,
      showIcon:true,
      closeModalAction:function(){},
      style:{btnColor:'#078c95',btnTextColor:'#ffffff'}
    };
  }
  function install3DSListener(){
    if(threeDSListenerInstalled) return;
    threeDSListenerInstalled = true;
    window.addEventListener('message',function(event){
      if(event.origin !== window.location.origin || !active3DS || !active3DS.waiting) return;
      var response = event.data && typeof event.data === 'object' ? event.data : {};
      if(response.loading === true){
        message('info','Verificando tu identidad con el banco. No cierres esta ventana...');
        return;
      }
      if(response.parameters3DS){
        var current = active3DS;
        current.waiting = false;
        message('info','Autenticación 3DS completada. Confirmando el pago...');
        processCharge(current.context,current.tokenId,{
          deviceFingerprintId:current.deviceFingerprintId,
          authentication3DS:response.parameters3DS
        });
        return;
      }
      if(response.error){
        var failed = active3DS;
        reset3DSLibrary();
        message('error','No se completó la autenticación 3DS: ' + esc(response.error) + '<br>' + restartButton(failed.context,failed.publicKey));
      }
    },false);
  }
  function generateDeviceFingerprint(context,publicKey){
    configure3DS(context,publicKey);
    return Promise.resolve(window.Culqi3DS.generateDevice()).then(function(deviceId){
      var normalizedId = clean(deviceId);
      if(!normalizedId) throw new Error('Culqi no pudo identificar de forma segura este dispositivo.');
      return normalizedId;
    });
  }
  function start3DSAuthentication(context,tokenId,deviceFingerprintId){
    var publicKey = context.publicKey || (activePayment && activePayment.publicKey) || '';
    configure3DS(context,publicKey);
    active3DS = {
      context:context,
      tokenId:tokenId,
      deviceFingerprintId:deviceFingerprintId,
      publicKey:publicKey,
      waiting:true
    };
    message('info','Tu banco solicita autenticación 3DS. Completa la verificación para continuar.');
    try{
      window.Culqi3DS.initAuthentication(tokenId);
    }catch(error){
      var failed = active3DS;
      reset3DSLibrary();
      message('error','No se pudo abrir la autenticación 3DS: ' + esc(error && error.message ? error.message : 'error técnico') + '<br>' + restartButton(failed.context,failed.publicKey));
    }
  }
  function restartButton(context,publicKey){
    window.nostraReiniciarPagoCulqi = function(){
      resetCheckout();
      reset3DSLibrary();
      prepareOnlinePayment(context,publicKey).catch(function(error){
        message('error','No se pudo generar un nuevo intento de pago: ' + esc(error && error.message ? error.message : 'error técnico'));
      });
    };
    return '<button type="button" class="npc-pay-button" onclick="window.nostraReiniciarPagoCulqi()">Generar un nuevo intento de pago</button>';
  }

"""
frontend = replace_once(frontend, result_marker, three_ds_helpers + result_marker, 'funciones frontend Culqi 3DS')

checkout_start = '  function resetCheckout(){'
checkout_end = '  function continueButton(context,publicKey,label){'
new_checkout = """  function resetCheckout(){
    if(culqiCheckout && typeof culqiCheckout.close === 'function'){
      try{ culqiCheckout.close(); }catch(_){ }
    }
    culqiCheckout = null;
  }
  function openCheckout(context,publicKey){
    resetCheckout();
    reset3DSLibrary();
    configure3DS(context,publicKey);
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
        message('info','Preparando la verificación de seguridad del pago...');
        generateDeviceFingerprint(context,publicKey).then(function(deviceFingerprintId){
          processCharge(context,tokenId,{deviceFingerprintId:deviceFingerprintId});
        }).catch(function(error){
          console.error('No se pudo generar la huella 3DS:',error);
          message('error','No se pudo iniciar la seguridad 3DS: ' + esc(error && error.message ? error.message : 'error técnico') + '<br>' + restartButton(context,publicKey));
        });
        return;
      }
      var culqiError = culqiCheckout.error || {};
      var text = clean(culqiError.user_message || culqiError.merchant_message || culqiError.message);
      message('error',esc(text || 'Culqi no pudo generar el token de pago. Revisa los datos de la tarjeta.'));
    };
    culqiCheckout.open();
  }
"""
frontend = replace_between(frontend, checkout_start, checkout_end, new_checkout, 'checkout con huella 3DS')

charge_start = '  function processCharge(context,tokenId){'
charge_end = '  function prepareOnlinePayment(context,publicKey){'
new_charge = """  function processCharge(context,tokenId,security){
    security = security || {};
    message('info',security.authentication3DS
      ? 'Confirmando el pago autenticado. No cierres esta ventana...'
      : 'Procesando el pago de forma segura. No cierres esta ventana...');
    var payload = {
      preinscripcionId:context.preinscripcionId,
      intentoPagoId:context.prepared.intentoPagoId,
      codigoSolicitud:context.codigoSolicitud,
      tokenId:tokenId,
      deviceFingerprintId:security.deviceFingerprintId
    };
    if(security.authentication3DS) payload.authentication3DS = security.authentication3DS;
    postJson(CHARGE_URL,payload).then(function(response){
      var payment = response.payment || {};
      if(payment.estado === 'aprobado'){
        reset3DSLibrary();
        try{ sessionStorage.removeItem('nostra_culqi_pago_activo'); }catch(_){ }
        location.assign(resultUrl('pago-exitoso.html',context));
        return;
      }
      location.assign(resultUrl('pago-pendiente.html',context));
    }).catch(function(error){
      console.error('Cargo Culqi rechazado:',error);
      if(error.code === '3DS_REQUERIDO'){
        start3DSAuthentication(context,tokenId,security.deviceFingerprintId);
        return;
      }
      if(error.code === '3DS_PENDIENTE' || error.code === '3DS_CONTEXTO_INVALIDO' || error.code === '3DS_NO_SOLICITADO'){
        reset3DSLibrary();
        message('error',esc(error.message || 'El intento 3DS ya no puede continuar.') + '<br>' + restartButton(context,context.publicKey));
        return;
      }
      if(error.code === 'PAGO_RECHAZADO' || error.status === 402){
        reset3DSLibrary();
        location.assign(resultUrl('pago-rechazado.html',context));
        return;
      }
      message('error','No se pudo completar el cargo: ' + esc(error.message || 'error técnico') + '<br>' + continueButton(context,context.publicKey || activePayment.publicKey,'Reintentar pago'));
    });
  }
"""
frontend = replace_between(frontend, charge_start, charge_end, new_charge, 'procesamiento frontend 3DS')

frontend_path.write_text(frontend, encoding='utf-8')


html_path = Path('preinscripcion.html')
html = html_path.read_text(encoding='utf-8')
html = replace_once(
    html,
    'assets/js/preinscripcion-culqi-preparacion.js?v=2026-03',
    'assets/js/preinscripcion-culqi-preparacion.js?v=2026-04',
    'versión caché preinscripción'
)
html_path.write_text(html, encoding='utf-8')
