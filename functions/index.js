'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { initializeApp } = require('firebase-admin/app');
const {
  getFirestore,
  FieldValue,
  Timestamp
} = require('firebase-admin/firestore');
const {
  clean,
  calculateOfficialPlan,
  findActivePlan,
  laterPayments
} = require('./lib/pricing');

initializeApp();
const db = getFirestore();
const CULQI_SECRET_KEY = defineSecret('CULQI_SECRET_KEY');

const ALLOWED_ORIGINS = [
  'https://gruponostradamus.edu.pe',
  'https://www.gruponostradamus.edu.pe',
  'https://dfvv88.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const BASE_OPTIONS = {
  region: 'us-central1',
  cors: ALLOWED_ORIGINS,
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 10
};

const PRE_ID_RE = /^[A-Za-z0-9_-]{10,80}$/;
const ATTEMPT_ID_RE = /^[A-Za-z0-9_-]{10,80}$/;
const CODE_RE = /^PRE-[0-9]{4}-[A-Z0-9]{8}$/;
const TOKEN_RE = /^(tkn|ype|crd)_(test|live)_[A-Za-z0-9]+$/;
const ATTEMPT_TTL_MINUTES = 20;

class PublicError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function requestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      throw new PublicError(400, 'JSON_INVALIDO', 'La solicitud no contiene un JSON válido.');
    }
  }
  return {};
}

function requirePost(req) {
  if (req.method !== 'POST') {
    throw new PublicError(405, 'METODO_NO_PERMITIDO', 'Esta operación requiere una solicitud POST.');
  }
}

function requireText(value, name, regex, maxLength = 120) {
  const result = clean(value);
  if (!result || result.length > maxLength || (regex && !regex.test(result))) {
    throw new PublicError(400, 'DATO_INVALIDO', `El campo ${name} no es válido.`);
  }
  return result;
}

function send(res, status, payload) {
  res.status(status).json({
    ok: status >= 200 && status < 300,
    ...payload
  });
}

function handleError(res, error, context) {
  if (error instanceof PublicError) {
    return send(res, error.status, {
      error: error.code,
      message: error.message,
      details: error.details || undefined
    });
  }

  logger.error(context, error);
  return send(res, 500, {
    error: 'ERROR_INTERNO',
    message: 'No se pudo completar la operación. Intenta nuevamente.'
  });
}

function assertPreinscriptionCanPay(pre) {
  if (!pre || typeof pre !== 'object') {
    throw new PublicError(404, 'PREINSCRIPCION_NO_ENCONTRADA', 'No se encontró la preinscripción.');
  }
  if (pre.metodoPagoPreferido !== 'pago_online') {
    throw new PublicError(409, 'METODO_PAGO_INVALIDO', 'La solicitud no fue creada para pago en línea.');
  }
  if (pre.pagoValidado === true || pre.estadoPago === 'pago_validado') {
    throw new PublicError(409, 'PAGO_YA_VALIDADO', 'Esta solicitud ya tiene un pago validado.');
  }
  if (pre.matriculaAprobada === true) {
    throw new PublicError(409, 'MATRICULA_YA_APROBADA', 'Esta matrícula ya fue aprobada.');
  }
}

function officialSelection(pre, program, now = new Date()) {
  if (!program || program.publicado === false) {
    throw new PublicError(409, 'PROGRAMA_NO_DISPONIBLE', 'El programa ya no está disponible.');
  }

  let plan;
  try {
    plan = findActivePlan(program, pre.planId);
  } catch (_) {
    throw new PublicError(409, 'PLAN_NO_DISPONIBLE', 'El plan elegido ya no está disponible.');
  }

  let pricing;
  try {
    pricing = calculateOfficialPlan(plan, now);
  } catch (_) {
    throw new PublicError(409, 'TARIFARIO_INVALIDO', 'El plan no tiene un importe válido para cobrar.');
  }

  return {
    program,
    plan,
    pricing,
    paymentsAfter: laterPayments(plan, pricing)
  };
}

function activeAttemptIsReusable(attempt, pricing, nowMs) {
  if (!attempt || attempt.estado !== 'preparado') return false;
  if (attempt.totalInicialCentimos !== pricing.totalInicialCentimos) return false;
  const expiresAt = attempt.expiresAt && typeof attempt.expiresAt.toMillis === 'function'
    ? attempt.expiresAt.toMillis()
    : 0;
  return expiresAt > nowMs;
}

function publicPreparation(attemptId, pre, selection, expiresAt) {
  return {
    intentoPagoId: attemptId,
    codigoSolicitud: clean(pre.codigoSolicitud),
    programa: clean(selection.program.nombre || pre.ciclo),
    plan: clean(selection.plan.nombre || pre.planNombre),
    modalidad: clean(selection.plan.modalidad || pre.modalidad),
    turno: clean(selection.plan.turno || pre.turno),
    conceptoPago: selection.pricing.conceptoInicial,
    montoCentimos: selection.pricing.totalInicialCentimos,
    monto: selection.pricing.totalInicial,
    moneda: 'PEN',
    correo: clean(pre.correo).toLowerCase(),
    pagosPosteriores: selection.paymentsAfter,
    expiraEn: expiresAt.toDate().toISOString()
  };
}

exports.culqiPreparePayment = onRequest(BASE_OPTIONS, async (req, res) => {
  try {
    requirePost(req);
    const body = requestBody(req);
    const preId = requireText(body.preinscripcionId, 'preinscripcionId', PRE_ID_RE, 80);
    const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);

    const preRef = db.collection('preinscripciones').doc(preId);
    const attemptRef = db.collection('intentos_pago').doc();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + ATTEMPT_TTL_MINUTES * 60 * 1000
    );

    const prepared = await db.runTransaction(async (transaction) => {
      const preSnap = await transaction.get(preRef);
      if (!preSnap.exists) {
        throw new PublicError(404, 'PREINSCRIPCION_NO_ENCONTRADA', 'No se encontró la preinscripción.');
      }

      const pre = preSnap.data();
      assertPreinscriptionCanPay(pre);
      if (clean(pre.codigoSolicitud) !== code) {
        throw new PublicError(403, 'CODIGO_NO_COINCIDE', 'El código de solicitud no coincide.');
      }

      const programId = requireText(pre.programaId, 'programaId', null, 80);
      const programRef = db.collection('programas_publicos').doc(programId);
      const programSnap = await transaction.get(programRef);
      if (!programSnap.exists) {
        throw new PublicError(409, 'PROGRAMA_NO_ENCONTRADO', 'El tarifario oficial no está disponible.');
      }

      const selection = officialSelection(pre, programSnap.data(), now.toDate());
      const currentAttemptId = clean(pre.intentoPagoActivoId);
      let reusable = null;

      if (currentAttemptId && ATTEMPT_ID_RE.test(currentAttemptId)) {
        const currentAttemptRef = db.collection('intentos_pago').doc(currentAttemptId);
        const currentAttemptSnap = await transaction.get(currentAttemptRef);
        if (
          currentAttemptSnap.exists &&
          activeAttemptIsReusable(
            currentAttemptSnap.data(),
            selection.pricing,
            now.toMillis()
          )
        ) {
          reusable = {
            id: currentAttemptId,
            data: currentAttemptSnap.data()
          };
        }
      }

      if (reusable) {
        return publicPreparation(
          reusable.id,
          pre,
          selection,
          reusable.data.expiresAt
        );
      }

      const attemptData = {
        preinscripcionId: preId,
        codigoSolicitud: code,
        programaId: programId,
        programaNombre: clean(selection.program.nombre || pre.ciclo),
        planId: clean(selection.plan.id),
        planNombre: clean(selection.plan.nombre || pre.planNombre),
        modalidad: clean(selection.plan.modalidad || pre.modalidad),
        turno: clean(selection.plan.turno || pre.turno),
        conceptoPago: selection.pricing.conceptoInicial,
        detallePagosPosteriores: selection.paymentsAfter,
        precioAplicadoCentimos: selection.pricing.precioAplicadoCentimos,
        matriculaCentimos: selection.pricing.matriculaCentimos,
        totalInicialCentimos: selection.pricing.totalInicialCentimos,
        moneda: 'PEN',
        correo: clean(pre.correo).toLowerCase(),
        estado: 'preparado',
        entorno: 'pendiente_llave_culqi',
        numeroIntentosCargo: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        expiresAt
      };

      transaction.set(attemptRef, attemptData);
      transaction.update(preRef, {
        precioValidadoServidor: true,
        estadoPrecio: 'validado_servidor',
        totalInicialServidor: selection.pricing.totalInicial,
        montoPagoInicialCentimosServidor: selection.pricing.totalInicialCentimos,
        intentoPagoCreado: true,
        intentoPagoActivoId: attemptRef.id,
        estadoPago: 'pendiente_pago_online',
        updatedAt: FieldValue.serverTimestamp()
      });

      return publicPreparation(attemptRef.id, pre, selection, expiresAt);
    });

    return send(res, 200, { payment: prepared });
  } catch (error) {
    return handleError(res, error, 'Error preparando pago Culqi');
  }
});

function keyEnvironment(secretKey) {
  if (secretKey.startsWith('sk_test_')) return 'test';
  if (secretKey.startsWith('sk_live_')) return 'live';
  return '';
}

function tokenEnvironment(tokenId) {
  const match = TOKEN_RE.exec(tokenId);
  return match ? match[2] : '';
}

function safeCulqiMessage(payload, fallback) {
  const candidates = [
    payload && payload.user_message,
    payload && payload.merchant_message,
    payload && payload.message,
    payload && payload.type,
    fallback
  ];
  const message = candidates.map(clean).find(Boolean) || 'Culqi rechazó la operación.';
  return message.slice(0, 280);
}

function safeChargeSummary(payload) {
  return {
    id: clean(payload && payload.id),
    object: clean(payload && payload.object),
    amount: Number(payload && payload.amount) || 0,
    currentAmount: Number(payload && payload.current_amount) || 0,
    currencyCode: clean(
      payload && (payload.currency_code || payload.currency)
    ),
    captured: payload && payload.captured === true,
    duplicated: payload && payload.duplicated === true,
    installments: Number(payload && payload.installments) || 0,
    creationDate: Number(payload && payload.creation_date) || 0,
    outcomeType: clean(payload && payload.outcome && payload.outcome.type),
    outcomeCode: clean(payload && payload.outcome && payload.outcome.code),
    merchantMessage: clean(
      payload && payload.outcome && payload.outcome.merchant_message
    ).slice(0, 280),
    userMessage: clean(
      payload && payload.outcome && payload.outcome.user_message
    ).slice(0, 280)
  };
}

function namesForAntifraud(fullName) {
  const parts = clean(fullName).split(' ').filter(Boolean);
  return {
    firstName: parts.shift() || '',
    lastName: parts.join(' ').slice(0, 50)
  };
}

async function reserveCharge(preId, attemptId) {
  const preRef = db.collection('preinscripciones').doc(preId);
  const attemptRef = db.collection('intentos_pago').doc(attemptId);
  const now = Timestamp.now();

  return db.runTransaction(async (transaction) => {
    const preSnap = await transaction.get(preRef);
    const attemptSnap = await transaction.get(attemptRef);

    if (!preSnap.exists || !attemptSnap.exists) {
      throw new PublicError(404, 'INTENTO_NO_ENCONTRADO', 'No se encontró el intento de pago.');
    }

    const pre = preSnap.data();
    const attempt = attemptSnap.data();
    assertPreinscriptionCanPay(pre);

    if (attempt.preinscripcionId !== preId) {
      throw new PublicError(403, 'INTENTO_NO_PERTENECE', 'El intento no pertenece a esta solicitud.');
    }

    if (attempt.estado === 'aprobado' && clean(attempt.culqiChargeId)) {
      return {
        alreadyApproved: true,
        chargeId: clean(attempt.culqiChargeId),
        amount: Number(attempt.totalInicialCentimos) || 0
      };
    }

    const expiresAtMs = attempt.expiresAt && typeof attempt.expiresAt.toMillis === 'function'
      ? attempt.expiresAt.toMillis()
      : 0;
    if (expiresAtMs <= now.toMillis()) {
      throw new PublicError(409, 'INTENTO_EXPIRADO', 'El intento de pago venció. Actualiza el monto y vuelve a intentarlo.');
    }

    if (attempt.estado === 'procesando') {
      const processingAtMs = attempt.processingAt && typeof attempt.processingAt.toMillis === 'function'
        ? attempt.processingAt.toMillis()
        : now.toMillis();
      if (now.toMillis() - processingAtMs < 120000) {
        throw new PublicError(409, 'PAGO_EN_PROCESO', 'El pago ya se está procesando. Espera antes de volver a intentarlo.');
      }
    }

    const programRef = db.collection('programas_publicos').doc(pre.programaId);
    const programSnap = await transaction.get(programRef);
    if (!programSnap.exists) {
      throw new PublicError(409, 'PROGRAMA_NO_ENCONTRADO', 'El tarifario oficial no está disponible.');
    }

    const selection = officialSelection(pre, programSnap.data(), now.toDate());
    if (selection.pricing.totalInicialCentimos !== attempt.totalInicialCentimos) {
      transaction.update(attemptRef, {
        estado: 'precio_desactualizado',
        updatedAt: FieldValue.serverTimestamp()
      });
      transaction.update(preRef, {
        precioValidadoServidor: false,
        estadoPrecio: 'precio_desactualizado',
        intentoPagoCreado: false,
        estadoPago: 'pendiente_pago_online',
        updatedAt: FieldValue.serverTimestamp()
      });
      throw new PublicError(409, 'PRECIO_CAMBIO', 'El precio cambió. Revisa el nuevo resumen antes de pagar.');
    }

    transaction.update(attemptRef, {
      estado: 'procesando',
      processingAt: now,
      numeroIntentosCargo: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });
    transaction.update(preRef, {
      estadoPago: 'procesando_pago_online',
      updatedAt: FieldValue.serverTimestamp()
    });

    return {
      alreadyApproved: false,
      pre,
      attempt,
      selection,
      preRef,
      attemptRef
    };
  });
}

exports.culqiCreateCharge = onRequest(
  { ...BASE_OPTIONS, secrets: [CULQI_SECRET_KEY] },
  async (req, res) => {
    let reserved = null;
    try {
      requirePost(req);
      const body = requestBody(req);
      const preId = requireText(body.preinscripcionId, 'preinscripcionId', PRE_ID_RE, 80);
      const attemptId = requireText(body.intentoPagoId, 'intentoPagoId', ATTEMPT_ID_RE, 80);
      const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);
      const tokenId = requireText(body.tokenId, 'tokenId', TOKEN_RE, 120);

      const secretKey = clean(CULQI_SECRET_KEY.value());
      const environment = keyEnvironment(secretKey);
      if (!environment) {
        throw new PublicError(503, 'CULQI_NO_CONFIGURADO', 'La llave privada de Culqi no está configurada correctamente.');
      }
      if (tokenEnvironment(tokenId) !== environment) {
        throw new PublicError(400, 'ENTORNO_INCOMPATIBLE', 'El token y la llave de Culqi pertenecen a entornos diferentes.');
      }

      reserved = await reserveCharge(preId, attemptId);
      if (reserved.alreadyApproved) {
        return send(res, 200, {
          payment: {
            estado: 'aprobado',
            cargoId: reserved.chargeId,
            montoCentimos: reserved.amount,
            duplicado: true
          }
        });
      }

      if (clean(reserved.pre.codigoSolicitud) !== code) {
        throw new PublicError(403, 'CODIGO_NO_COINCIDE', 'El código de solicitud no coincide.');
      }

      const names = namesForAntifraud(reserved.pre.nombre);
      const amount = reserved.selection.pricing.totalInicialCentimos;
      const chargePayload = {
        amount,
        currency_code: 'PEN',
        email: clean(reserved.pre.correo).toLowerCase().slice(0, 50),
        source_id: tokenId,
        capture: true,
        description: `Matrícula ${clean(reserved.pre.codigoSolicitud)}`.slice(0, 80),
        installments: 0,
        metadata: {
          preinscripcion_id: preId,
          intento_pago_id: attemptId,
          codigo_solicitud: code,
          programa_id: clean(reserved.pre.programaId),
          plan_id: clean(reserved.pre.planId),
          dni: clean(reserved.pre.dni)
        },
        antifraud_details: {
          first_name: names.firstName,
          last_name: names.lastName,
          phone_number: clean(reserved.pre.celular)
        }
      };

      const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          'X-Charge-Channel': 'web'
        },
        body: JSON.stringify(chargePayload)
      });

      let culqiData = {};
      try {
        culqiData = await culqiResponse.json();
      } catch (_) {
        culqiData = {};
      }

      if (!culqiResponse.ok || !clean(culqiData.id)) {
        const actionCode = clean(culqiData.action_code);
        const requires3DS = actionCode === 'REVIEW';
        const message = safeCulqiMessage(
          culqiData,
          requires3DS
            ? 'La tarjeta requiere autenticación 3DS.'
            : 'Culqi rechazó el cargo.'
        );

        await db.runTransaction(async (transaction) => {
          transaction.update(reserved.attemptRef, {
            estado: requires3DS ? 'requiere_3ds' : 'rechazado',
            culqiHttpStatus: culqiResponse.status,
            culqiActionCode: actionCode,
            culqiErrorType: clean(culqiData.type),
            culqiErrorCode: clean(culqiData.code),
            culqiMensaje: message,
            tokenNoAlmacenado: true,
            updatedAt: FieldValue.serverTimestamp()
          });
          transaction.update(reserved.preRef, {
            estadoPago: requires3DS ? 'requiere_3ds' : 'pago_rechazado',
            pagoValidado: false,
            matriculaAprobada: false,
            pagoObservacion: message,
            updatedAt: FieldValue.serverTimestamp()
          });
        });

        throw new PublicError(
          requires3DS ? 409 : 402,
          requires3DS ? '3DS_REQUERIDO' : 'PAGO_RECHAZADO',
          message,
          requires3DS ? { actionCode } : null
        );
      }

      const summary = safeChargeSummary(culqiData);
      await db.runTransaction(async (transaction) => {
        transaction.update(reserved.attemptRef, {
          estado: 'aprobado',
          entorno: environment,
          culqiChargeId: summary.id,
          culqiResumen: summary,
          tokenNoAlmacenado: true,
          approvedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
        transaction.update(reserved.preRef, {
          estadoPago: 'pago_validado',
          pagoValidado: true,
          pagoObservacion: 'Pago aprobado automáticamente por Culqi.',
          precioValidadoServidor: true,
          estadoPrecio: 'validado_y_cobrado',
          matriculaAprobada: true,
          estado: 'listo_para_matricula',
          culqiChargeId: summary.id,
          culqiEntorno: environment,
          montoPagadoCentimos: summary.amount || amount,
          monedaPago: 'PEN',
          pagoValidadoAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      return send(res, 200, {
        payment: {
          estado: 'aprobado',
          cargoId: summary.id,
          montoCentimos: summary.amount || amount,
          moneda: 'PEN',
          duplicado: summary.duplicated
        }
      });
    } catch (error) {
      if (reserved && !reserved.alreadyApproved && !(error instanceof PublicError)) {
        try {
          await Promise.all([
            reserved.attemptRef.update({
              estado: 'error_tecnico',
              culqiMensaje: 'No se pudo completar la comunicación con Culqi.',
              updatedAt: FieldValue.serverTimestamp()
            }),
            reserved.preRef.update({
              estadoPago: 'pendiente_pago_online',
              pagoValidado: false,
              matriculaAprobada: false,
              pagoObservacion: 'El intento no se completó. Puede volver a intentarse.',
              updatedAt: FieldValue.serverTimestamp()
            })
          ]);
        } catch (updateError) {
          logger.error('No se pudo registrar el error técnico de Culqi', updateError);
        }
      }
      return handleError(res, error, 'Error creando cargo Culqi');
    }
  }
);

exports.culqiPaymentStatus = onRequest(BASE_OPTIONS, async (req, res) => {
  try {
    requirePost(req);
    const body = requestBody(req);
    const preId = requireText(body.preinscripcionId, 'preinscripcionId', PRE_ID_RE, 80);
    const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);

    const preSnap = await db.collection('preinscripciones').doc(preId).get();
    if (!preSnap.exists) {
      throw new PublicError(404, 'PREINSCRIPCION_NO_ENCONTRADA', 'No se encontró la preinscripción.');
    }

    const pre = preSnap.data();
    if (clean(pre.codigoSolicitud) !== code) {
      throw new PublicError(403, 'CODIGO_NO_COINCIDE', 'El código de solicitud no coincide.');
    }

    return send(res, 200, {
      payment: {
        codigoSolicitud: code,
        programa: clean(pre.ciclo),
        plan: clean(pre.planNombre),
        estadoPago: clean(pre.estadoPago),
        pagoValidado: pre.pagoValidado === true,
        matriculaAprobada: pre.matriculaAprobada === true,
        montoCentimos: Number(
          pre.montoPagadoCentimos ||
          pre.montoPagoInicialCentimosServidor ||
          pre.montoPagoInicialCentimos ||
          0
        ),
        moneda: clean(pre.monedaPago || pre.moneda || 'PEN'),
        cargoId: clean(pre.culqiChargeId)
      }
    });
  } catch (error) {
    return handleError(res, error, 'Error consultando estado de pago');
  }
});
