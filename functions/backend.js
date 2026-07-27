'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { getApps, getApp, initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const {
  calculateOfficialPlan,
  findActivePlan,
  laterPayments
} = require('./lib/pricing');
const {
  PublicError,
  clean,
  bodyOf,
  requirePost,
  requireText,
  send,
  safeMessage,
  splitName,
  peruPhone
} = require('./lib/common');

const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const CULQI_SECRET_KEY = defineSecret('CULQI_SECRET_KEY');

const ALLOWED_ORIGINS = [
  'https://gruponostradamus.edu.pe',
  'https://www.gruponostradamus.edu.pe',
  'https://dfvv88.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];
const OPTIONS = {
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
const ATTEMPT_TTL_MS = 20 * 60 * 1000;
const PROCESSING_LOCK_MS = 2 * 60 * 1000;

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

function assertPayable(pre) {
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

function officialSelection(pre, program, now) {
  if (!program || program.publicado === false) {
    throw new PublicError(409, 'PROGRAMA_NO_DISPONIBLE', 'El programa ya no está disponible.');
  }
  let plan;
  let pricing;
  try {
    plan = findActivePlan(program, pre.planId);
    pricing = calculateOfficialPlan(plan, now);
  } catch (_) {
    throw new PublicError(409, 'TARIFARIO_INVALIDO', 'El plan ya no está disponible o no tiene un importe válido.');
  }
  return {
    program,
    plan,
    pricing,
    paymentsAfter: laterPayments(plan, pricing)
  };
}

function timestampMillis(value) {
  return value && typeof value.toMillis === 'function' ? value.toMillis() : 0;
}

function publicPreparation(id, pre, selection, expiresAt) {
  return {
    intentoPagoId: id,
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

exports.culqiPreparePayment = onRequest(OPTIONS, async (req, res) => {
  try {
    requirePost(req);
    const body = bodyOf(req);
    const preId = requireText(body.preinscripcionId, 'preinscripcionId', PRE_ID_RE, 80);
    const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);
    const preRef = db.collection('preinscripciones').doc(preId);
    const newAttemptRef = db.collection('intentos_pago').doc();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + ATTEMPT_TTL_MS);

    const prepared = await db.runTransaction(async (tx) => {
      const preSnap = await tx.get(preRef);
      if (!preSnap.exists) {
        throw new PublicError(404, 'PREINSCRIPCION_NO_ENCONTRADA', 'No se encontró la preinscripción.');
      }
      const pre = preSnap.data();
      if (clean(pre.codigoSolicitud) !== code) {
        throw new PublicError(403, 'CODIGO_NO_COINCIDE', 'El código de solicitud no coincide.');
      }
      assertPayable(pre);

      const programId = requireText(pre.programaId, 'programaId', null, 80);
      const programRef = db.collection('programas_publicos').doc(programId);
      const programSnap = await tx.get(programRef);
      if (!programSnap.exists) {
        throw new PublicError(409, 'PROGRAMA_NO_ENCONTRADO', 'El tarifario oficial no está disponible.');
      }
      const selection = officialSelection(pre, programSnap.data(), now.toDate());

      const activeId = clean(pre.intentoPagoActivoId);
      let activeSnap = null;
      if (activeId && ATTEMPT_ID_RE.test(activeId)) {
        activeSnap = await tx.get(db.collection('intentos_pago').doc(activeId));
      }

      if (activeSnap && activeSnap.exists) {
        const active = activeSnap.data();
        const reusable = active.estado === 'preparado'
          && active.totalInicialCentimos === selection.pricing.totalInicialCentimos
          && timestampMillis(active.expiresAt) > now.toMillis();
        if (reusable) {
          return publicPreparation(activeId, pre, selection, active.expiresAt);
        }
      }

      tx.set(newAttemptRef, {
        preinscripcionId: preId,
        codigoSolicitud: code,
        programaId,
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
        expiresAt,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      tx.update(preRef, {
        precioValidadoServidor: true,
        estadoPrecio: 'validado_servidor',
        totalInicialServidor: selection.pricing.totalInicial,
        montoPagoInicialCentimosServidor: selection.pricing.totalInicialCentimos,
        intentoPagoCreado: true,
        intentoPagoActivoId: newAttemptRef.id,
        estadoPago: 'pendiente_pago_online',
        updatedAt: FieldValue.serverTimestamp()
      });
      return publicPreparation(newAttemptRef.id, pre, selection, expiresAt);
    });

    return send(res, 200, { payment: prepared });
  } catch (error) {
    return handleError(res, error, 'Error preparando pago Culqi');
  }
});

function keyEnvironment(secret) {
  if (secret.startsWith('sk_test_')) return 'test';
  if (secret.startsWith('sk_live_')) return 'live';
  return '';
}

function tokenEnvironment(token) {
  const match = TOKEN_RE.exec(token);
  return match ? match[2] : '';
}

async function reserveCharge(preId, attemptId, code) {
  const preRef = db.collection('preinscripciones').doc(preId);
  const attemptRef = db.collection('intentos_pago').doc(attemptId);
  const now = Timestamp.now();

  return db.runTransaction(async (tx) => {
    const preSnap = await tx.get(preRef);
    const attemptSnap = await tx.get(attemptRef);
    if (!preSnap.exists || !attemptSnap.exists) {
      throw new PublicError(404, 'INTENTO_NO_ENCONTRADO', 'No se encontró el intento de pago.');
    }

    const pre = preSnap.data();
    const attempt = attemptSnap.data();
    if (attempt.preinscripcionId !== preId) {
      throw new PublicError(403, 'INTENTO_NO_PERTENECE', 'El intento no pertenece a esta solicitud.');
    }
    if (clean(pre.codigoSolicitud) !== code || clean(attempt.codigoSolicitud) !== code) {
      throw new PublicError(403, 'CODIGO_NO_COINCIDE', 'El código de solicitud no coincide.');
    }
    if (attempt.estado === 'aprobado' && clean(attempt.culqiChargeId)) {
      return {
        alreadyApproved: true,
        chargeId: clean(attempt.culqiChargeId),
        amount: Number(attempt.totalInicialCentimos) || 0
      };
    }

    assertPayable(pre);
    if (timestampMillis(attempt.expiresAt) <= now.toMillis()) {
      throw new PublicError(409, 'INTENTO_EXPIRADO', 'El intento venció. Actualiza el resumen y vuelve a intentarlo.');
    }
    if (attempt.estado === 'procesando') {
      const elapsed = now.toMillis() - timestampMillis(attempt.processingAt);
      if (elapsed >= 0 && elapsed < PROCESSING_LOCK_MS) {
        throw new PublicError(409, 'PAGO_EN_PROCESO', 'El pago ya se está procesando. Espera antes de volver a intentarlo.');
      }
    }

    const programRef = db.collection('programas_publicos').doc(pre.programaId);
    const programSnap = await tx.get(programRef);
    if (!programSnap.exists) {
      throw new PublicError(409, 'PROGRAMA_NO_ENCONTRADO', 'El tarifario oficial no está disponible.');
    }
    const selection = officialSelection(pre, programSnap.data(), now.toDate());
    if (selection.pricing.totalInicialCentimos !== attempt.totalInicialCentimos) {
      throw new PublicError(409, 'PRECIO_CAMBIO', 'El precio cambió. Revisa el nuevo resumen antes de pagar.');
    }

    tx.update(attemptRef, {
      estado: 'procesando',
      processingAt: now,
      numeroIntentosCargo: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });
    tx.update(preRef, {
      estadoPago: 'procesando_pago_online',
      updatedAt: FieldValue.serverTimestamp()
    });
    return { alreadyApproved: false, pre, attempt, selection, preRef, attemptRef };
  });
}

function chargeSummary(payload) {
  return {
    id: clean(payload && payload.id),
    object: clean(payload && payload.object),
    amount: Number(payload && payload.amount) || 0,
    currentAmount: Number(payload && payload.current_amount) || 0,
    currencyCode: clean(payload && (payload.currency_code || payload.currency)),
    captured: payload && payload.captured === true,
    duplicated: payload && payload.duplicated === true,
    installments: Number(payload && payload.installments) || 0,
    creationDate: Number(payload && payload.creation_date) || 0,
    outcomeType: clean(payload && payload.outcome && payload.outcome.type),
    outcomeCode: clean(payload && payload.outcome && payload.outcome.code),
    merchantMessage: clean(payload && payload.outcome && payload.outcome.merchant_message).slice(0, 280),
    userMessage: clean(payload && payload.outcome && payload.outcome.user_message).slice(0, 280)
  };
}

function antifraudDetails(pre) {
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

exports.culqiCreateCharge = onRequest(
  { ...OPTIONS, secrets: [CULQI_SECRET_KEY] },
  async (req, res) => {
    let reserved = null;
    try {
      requirePost(req);
      const body = bodyOf(req);
      const preId = requireText(body.preinscripcionId, 'preinscripcionId', PRE_ID_RE, 80);
      const attemptId = requireText(body.intentoPagoId, 'intentoPagoId', ATTEMPT_ID_RE, 80);
      const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);
      const tokenId = requireText(body.tokenId, 'tokenId', TOKEN_RE, 120);
      const secret = clean(CULQI_SECRET_KEY.value());
      const environment = keyEnvironment(secret);

      if (!environment) {
        throw new PublicError(503, 'CULQI_NO_CONFIGURADO', 'La llave privada de Culqi no está configurada correctamente.');
      }
      if (tokenEnvironment(tokenId) !== environment) {
        throw new PublicError(400, 'ENTORNO_INCOMPATIBLE', 'El token y la llave de Culqi pertenecen a entornos diferentes.');
      }

      reserved = await reserveCharge(preId, attemptId, code);
      if (reserved.alreadyApproved) {
        return send(res, 200, {
          payment: {
            estado: 'aprobado',
            cargoId: reserved.chargeId,
            montoCentimos: reserved.amount,
            moneda: 'PEN',
            duplicado: true
          }
        });
      }

      const amount = reserved.selection.pricing.totalInicialCentimos;
      const payload = {
        amount,
        currency_code: 'PEN',
        email: clean(reserved.pre.correo).toLowerCase().slice(0, 50),
        source_id: tokenId,
        capture: true,
        description: `Matrícula ${code}`.slice(0, 80),
        installments: 0,
        metadata: {
          preinscripcion_id: preId,
          intento_pago_id: attemptId,
          codigo_solicitud: code,
          programa_id: clean(reserved.pre.programaId),
          plan_id: clean(reserved.pre.planId),
          dni: clean(reserved.pre.dni)
        },
        antifraud_details: antifraudDetails(reserved.pre)
      };

      const response = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
          'X-Charge-Channel': 'web'
        },
        body: JSON.stringify(payload)
      });
      let data = {};
      try { data = await response.json(); } catch (_) { data = {}; }

      if (!response.ok || !clean(data.id)) {
        const requires3DS = clean(data.action_code) === 'REVIEW';
        const message = safeMessage(data, requires3DS
          ? 'La tarjeta requiere autenticación 3DS.'
          : 'Culqi rechazó el cargo.');
        const batch = db.batch();
        batch.update(reserved.attemptRef, {
          estado: requires3DS ? 'requiere_3ds' : 'rechazado',
          culqiHttpStatus: response.status,
          culqiActionCode: clean(data.action_code),
          culqiErrorType: clean(data.type),
          culqiErrorCode: clean(data.code),
          culqiMensaje: message,
          tokenNoAlmacenado: true,
          updatedAt: FieldValue.serverTimestamp()
        });
        batch.update(reserved.preRef, {
          estadoPago: requires3DS ? 'requiere_3ds' : 'pago_rechazado',
          pagoValidado: false,
          matriculaAprobada: false,
          pagoObservacion: message,
          updatedAt: FieldValue.serverTimestamp()
        });
        await batch.commit();
        throw new PublicError(
          requires3DS ? 409 : 402,
          requires3DS ? '3DS_REQUERIDO' : 'PAGO_RECHAZADO',
          message,
          requires3DS ? { actionCode: 'REVIEW' } : null
        );
      }

      const summary = chargeSummary(data);
      const batch = db.batch();
      batch.update(reserved.attemptRef, {
        estado: 'aprobado',
        entorno: environment,
        culqiChargeId: summary.id,
        culqiResumen: summary,
        tokenNoAlmacenado: true,
        approvedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      batch.update(reserved.preRef, {
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

      try {
        await batch.commit();
      } catch (storageError) {
        logger.error('CRÍTICO: Culqi aprobó el cargo pero Firestore no confirmó el registro', {
          chargeId: summary.id,
          preinscripcionId: preId,
          intentoPagoId: attemptId,
          error: storageError
        });
        return send(res, 202, {
          payment: {
            estado: 'aprobado',
            cargoId: summary.id,
            montoCentimos: summary.amount || amount,
            moneda: 'PEN',
            registroPendiente: true
          },
          message: 'El pago fue aprobado. El registro administrativo requiere conciliación.'
        });
      }

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
          const recovery = db.batch();
          recovery.update(reserved.attemptRef, {
            estado: 'error_tecnico',
            culqiMensaje: 'No se pudo completar la comunicación con Culqi.',
            updatedAt: FieldValue.serverTimestamp()
          });
          recovery.update(reserved.preRef, {
            estadoPago: 'pendiente_pago_online',
            pagoValidado: false,
            matriculaAprobada: false,
            pagoObservacion: 'El intento no se completó. Puede volver a intentarse.',
            updatedAt: FieldValue.serverTimestamp()
          });
          await recovery.commit();
        } catch (recoveryError) {
          logger.error('No se pudo registrar el error técnico de Culqi', recoveryError);
        }
      }
      return handleError(res, error, 'Error creando cargo Culqi');
    }
  }
);

exports.culqiPaymentStatus = onRequest(OPTIONS, async (req, res) => {
  try {
    requirePost(req);
    const body = bodyOf(req);
    const preId = requireText(body.preinscripcionId, 'preinscripcionId', PRE_ID_RE, 80);
    const code = requireText(body.codigoSolicitud, 'codigoSolicitud', CODE_RE, 30);
    const snap = await db.collection('preinscripciones').doc(preId).get();
    if (!snap.exists) {
      throw new PublicError(404, 'PREINSCRIPCION_NO_ENCONTRADA', 'No se encontró la preinscripción.');
    }
    const pre = snap.data();
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
          pre.montoPagadoCentimos
          || pre.montoPagoInicialCentimosServidor
          || pre.montoPagoInicialCentimos
          || 0
        ),
        moneda: clean(pre.monedaPago || pre.moneda || 'PEN'),
        cargoId: clean(pre.culqiChargeId)
      }
    });
  } catch (error) {
    return handleError(res, error, 'Error consultando estado de pago');
  }
});

exports.culqiBackendHealth = onRequest(
  { ...OPTIONS, cors: true },
  (req, res) => send(res, 200, {
    service: 'nostra-culqi-backend',
    environment: 'configured-at-runtime',
    timestamp: new Date().toISOString()
  })
);
