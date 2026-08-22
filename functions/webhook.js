'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { getApps, getApp, initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const {
  requestPayload,
  webhookEventType,
  webhookEventId,
  webhookChargeId,
  chargeEnvironment,
  classifyChargeEvent,
  webhookDocumentId,
  chargeMetadata,
  metadataValue,
  verifiedChargeSummary
} = require('./lib/culqi-webhook');
const { buildCulqiFinanceIntegration } = require('./lib/culqi-finance');

const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const CULQI_SECRET_KEY = defineSecret('CULQI_SECRET_KEY');

const PRE_ID_RE = /^[A-Za-z0-9_-]{10,80}$/;
const ATTEMPT_ID_RE = /^[A-Za-z0-9_-]{10,80}$/;
const CODE_RE = /^PRE-[0-9]{4}-[A-Z0-9]{8}$/;
const MAX_BODY_BYTES = 128 * 1024;
const OPTIONS = {
  region: 'us-central1',
  cors: false,
  timeoutSeconds: 45,
  memory: '256MiB',
  maxInstances: 3,
  secrets: [CULQI_SECRET_KEY]
};

function clean(value) {
  return String(value == null ? '' : value).trim();
}

function keyEnvironment(secret) {
  if (secret.startsWith('sk_test_')) return 'test';
  if (secret.startsWith('sk_live_')) return 'live';
  return '';
}

function send(res, status, payload) {
  return res.status(status).set({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }).send(JSON.stringify(payload));
}

function requestBody(req) {
  const rawLength = Buffer.isBuffer(req.rawBody)
    ? req.rawBody.length
    : Buffer.byteLength(
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
      'utf8'
    );

  if (rawLength > MAX_BODY_BYTES) {
    const error = new Error('WEBHOOK_DEMASIADO_GRANDE');
    error.status = 413;
    throw error;
  }

  const payload = requestPayload(req.rawBody, req.body);
  if (!payload || Object.keys(payload).length === 0) {
    const error = new Error('WEBHOOK_JSON_INVALIDO');
    error.status = 400;
    throw error;
  }

  return payload;
}

function safeRequestDiagnostics(req, payload) {
  return {
    contentType: clean(req.get && req.get('content-type')).slice(0, 120),
    rawBodyBytes: Buffer.isBuffer(req.rawBody) ? req.rawBody.length : 0,
    parsedBodyType: Buffer.isBuffer(req.body)
      ? 'buffer'
      : Array.isArray(req.body)
        ? 'array'
        : typeof req.body,
    payloadKeys: payload && typeof payload === 'object'
      ? Object.keys(payload).slice(0, 20)
      : []
  };
}

async function retrieveCharge(chargeId, secret) {
  let response;
  try {
    response = await fetch(`https://api.culqi.com/v2/charges/${encodeURIComponent(chargeId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: 'application/json'
      }
    });
  } catch (error) {
    logger.error('No se pudo consultar el cargo en Culqi durante el webhook', {
      chargeId,
      error: error && error.message
    });
    const unavailable = new Error('CULQI_NO_DISPONIBLE');
    unavailable.status = 503;
    throw unavailable;
  }

  let body = {};
  try { body = await response.json(); } catch (_) { body = {}; }
  if (!response.ok || clean(body.id) !== chargeId || clean(body.object) !== 'charge') {
    logger.warn('Culqi no confirmó el cargo recibido por webhook', {
      chargeId,
      status: response.status,
      culqiType: clean(body.type),
      culqiCode: clean(body.code)
    });
    const invalid = new Error('CARGO_NO_VERIFICADO');
    invalid.status = response.status >= 500 ? 503 : 401;
    throw invalid;
  }
  return body;
}

function validatedReferences(charge) {
  const metadata = chargeMetadata(charge);
  const preId = metadataValue(metadata, 'preinscripcion_id', 'preinscripcionId');
  const attemptId = metadataValue(metadata, 'intento_pago_id', 'intentoPagoId');
  const code = metadataValue(metadata, 'codigo_solicitud', 'codigoSolicitud');
  if (!PRE_ID_RE.test(preId) || !ATTEMPT_ID_RE.test(attemptId) || !CODE_RE.test(code)) {
    const error = new Error('METADATA_CULQI_INVALIDA');
    error.status = 422;
    throw error;
  }
  return { preId, attemptId, code };
}

function eventBase(payload, eventClass, summary, refs, environment) {
  return {
    eventId: webhookEventId(payload),
    eventType: webhookEventType(payload),
    eventClass,
    chargeId: summary.id,
    environment,
    preinscripcionId: refs.preId,
    intentoPagoId: refs.attemptId,
    codigoSolicitud: refs.code,
    amount: summary.amount,
    currency: summary.currency,
    captured: summary.captured,
    verifiedByCulqiApi: true,
    verifiedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
}

async function reconcileWebhook(payload, charge, environment) {
  const eventType = webhookEventType(payload);
  const eventClass = classifyChargeEvent(eventType);
  const eventRef = db.collection('culqi_webhook_eventos').doc(webhookDocumentId(payload));
  const refs = validatedReferences(charge);
  const summary = verifiedChargeSummary(charge);
  const preRef = db.collection('preinscripciones').doc(refs.preId);
  const attemptRef = db.collection('intentos_pago').doc(refs.attemptId);

  return db.runTransaction(async (tx) => {
    const [eventSnap, preSnap, attemptSnap] = await Promise.all([
      tx.get(eventRef),
      tx.get(preRef),
      tx.get(attemptRef)
    ]);

    if (eventSnap.exists && clean(eventSnap.data().estado) === 'procesado') {
      return { status: 'duplicate', eventType, chargeId: summary.id };
    }

    const base = eventBase(payload, eventClass, summary, refs, environment);
    if (!preSnap.exists || !attemptSnap.exists) {
      tx.set(eventRef, {
        ...base,
        estado: 'ignorado',
        motivo: 'solicitud_o_intento_no_encontrado',
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return { status: 'ignored_missing_reference', eventType, chargeId: summary.id };
    }

    const pre = preSnap.data();
    const attempt = attemptSnap.data();
    const expectedAmount = Number(attempt.totalInicialCentimos) || 0;
    const referencesMatch = clean(pre.codigoSolicitud) === refs.code
      && clean(attempt.codigoSolicitud) === refs.code
      && clean(attempt.preinscripcionId) === refs.preId;
    const amountMatches = expectedAmount > 0 && expectedAmount === summary.amount;
    const currencyMatches = summary.currency === 'PEN';
    const existingCharge = clean(pre.culqiChargeId || attempt.culqiChargeId);
    const chargeMatches = !existingCharge || existingCharge === summary.id;

    if (!referencesMatch || !amountMatches || !currencyMatches || !chargeMatches) {
      tx.set(eventRef, {
        ...base,
        estado: 'conflicto',
        motivo: !referencesMatch
          ? 'referencias_no_coinciden'
          : !amountMatches
            ? 'monto_no_coincide'
            : !currencyMatches
              ? 'moneda_no_coincide'
              : 'cargo_no_coincide',
        expectedAmount,
        existingChargeId: existingCharge,
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return { status: 'conflict', eventType, chargeId: summary.id };
    }

    if (eventClass === 'success' && !summary.captured) {
      tx.set(eventRef, {
        ...base,
        estado: 'ignorado',
        motivo: 'cargo_no_capturado',
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return { status: 'ignored_not_captured', eventType, chargeId: summary.id };
    }

    if (eventClass === 'success') {
      const finance = buildCulqiFinanceIntegration({
        preId: refs.preId,
        pre,
        amountCentimos: summary.amount,
        chargeId: summary.id,
        concept: clean(attempt.conceptoPago || pre.conceptoPagoInicial || `Pago inicial de ${clean(pre.ciclo)}`),
        creationDate: summary.creationDate
      });
      tx.set(db.collection('finanzas_movimientos').doc(finance.movementId), {
        ...finance.movement,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      tx.update(attemptRef, {
        estado: 'aprobado',
        entorno: environment,
        culqiChargeId: summary.id,
        culqiResumen: summary,
        confirmadoPorWebhook: true,
        webhookEventType: eventType,
        webhookConfirmedAt: FieldValue.serverTimestamp(),
        approvedAt: attempt.approvedAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      tx.update(preRef, {
        estadoPago: 'pago_validado',
        pagoValidado: true,
        pagoObservacion: pre.pagoValidado === true
          ? clean(pre.pagoObservacion) || 'Pago confirmado por Culqi.'
          : 'Pago confirmado y conciliado automáticamente mediante webhook de Culqi.',
        precioValidadoServidor: true,
        estadoPrecio: 'validado_y_cobrado',
        matriculaAprobada: true,
        estado: 'listo_para_matricula',
        culqiChargeId: summary.id,
        culqiEntorno: environment,
        montoPagadoCentimos: summary.amount,
        monedaPago: 'PEN',
        ...finance.prePatch,
        confirmadoPorWebhook: true,
        webhookEventType: eventType,
        webhookConfirmedAt: FieldValue.serverTimestamp(),
        pagoValidadoAt: pre.pagoValidadoAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      tx.set(eventRef, {
        ...base,
        estado: 'procesado',
        resultado: pre.pagoValidado === true ? 'confirmacion_idempotente' : 'pago_aprobado',
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return { status: pre.pagoValidado === true ? 'confirmed' : 'approved', eventType, chargeId: summary.id };
    }

    if (eventClass === 'failed') {
      if (pre.pagoValidado === true || attempt.estado === 'aprobado') {
        tx.set(eventRef, {
          ...base,
          estado: 'procesado',
          resultado: 'fallo_ignorado_pago_ya_aprobado',
          createdAt: FieldValue.serverTimestamp()
        }, { merge: true });
        return { status: 'ignored_no_downgrade', eventType, chargeId: summary.id };
      }
      const rejectionMessage = summary.userMessage
        || summary.merchantMessage
        || 'Culqi notificó que el cargo fue rechazado.';
      tx.update(attemptRef, {
        estado: 'rechazado',
        entorno: environment,
        culqiChargeId: summary.id,
        culqiResumen: summary,
        confirmadoPorWebhook: true,
        webhookEventType: eventType,
        webhookConfirmedAt: FieldValue.serverTimestamp(),
        culqiMensaje: rejectionMessage,
        updatedAt: FieldValue.serverTimestamp()
      });
      tx.update(preRef, {
        estadoPago: 'pago_rechazado',
        pagoValidado: false,
        matriculaAprobada: false,
        pagoObservacion: rejectionMessage,
        culqiChargeId: summary.id,
        culqiEntorno: environment,
        confirmadoPorWebhook: true,
        webhookEventType: eventType,
        webhookConfirmedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      tx.set(eventRef, {
        ...base,
        estado: 'procesado',
        resultado: 'pago_rechazado',
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return { status: 'rejected', eventType, chargeId: summary.id };
    }

    tx.set(eventRef, {
      ...base,
      estado: 'procesado',
      resultado: 'evento_de_cargo_sin_accion',
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return { status: 'ignored_event', eventType, chargeId: summary.id };
  });
}

exports.culqiWebhook = onRequest(OPTIONS, async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST');
    return send(res, 405, { received: false, error: 'METODO_NO_PERMITIDO' });
  }

  let payload = {};
  try {
    payload = requestBody(req);
    const eventType = webhookEventType(payload);
    const chargeId = webhookChargeId(payload);
    if (!eventType || !chargeId) {
      logger.warn('Webhook Culqi con estructura no reconocida', safeRequestDiagnostics(req, payload));
      return send(res, 400, { received: false, error: 'EVENTO_CULQI_INVALIDO' });
    }

    const secret = clean(CULQI_SECRET_KEY.value());
    const environment = keyEnvironment(secret);
    if (!environment || chargeEnvironment(chargeId) !== environment) {
      return send(res, 401, { received: false, error: 'ENTORNO_CULQI_INVALIDO' });
    }

    // El payload del webhook nunca se usa como fuente de verdad: el cargo se
    // consulta nuevamente en la API oficial con la llave privada del comercio.
    const verifiedCharge = await retrieveCharge(chargeId, secret);
    const result = await reconcileWebhook(payload, verifiedCharge, environment);

    if (result.status === 'conflict') {
      logger.error('Webhook Culqi verificado con conflicto de conciliación', result);
    } else {
      logger.info('Webhook Culqi procesado', result);
    }
    return send(res, 200, { received: true, ...result });
  } catch (error) {
    const status = Number(error && error.status) || 500;
    const code = clean(error && error.message) || 'ERROR_INTERNO_WEBHOOK';
    const diagnostics = safeRequestDiagnostics(req, payload);
    if (status >= 500) logger.error('Error procesando webhook Culqi', { code, ...diagnostics });
    else logger.warn('Webhook Culqi rechazado', { status, code, ...diagnostics });
    return send(res, status, { received: false, error: code });
  }
});