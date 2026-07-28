'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  webhookEventType,
  webhookEventId,
  webhookChargeId,
  chargeEnvironment,
  classifyChargeEvent,
  webhookDocumentId,
  verifiedChargeSummary
} = require('../lib/culqi-webhook');

const rejectedCharge = {
  object: 'charge',
  id: 'chr_test_REJECTED123456',
  creationDate: 1785184000000,
  amount: 55000,
  currentAmount: 55000,
  currencyCode: 'PEN',
  capture: false,
  duplicated: false,
  outcome: {
    type: 'venta_rechazada',
    code: 'CULQI_CARD_DECLINED',
    merchantMessage: 'La tarjeta fue rechazada por el banco emisor.',
    userMessage: 'No se pudo completar el pago con esta tarjeta.'
  },
  metadata: {
    preinscripcion_id: 'PREID_REJECTED123',
    intento_pago_id: 'ATTEMPT_REJECTED123',
    codigo_solicitud: 'PRE-2026-REJECT01',
    programa_id: 'nostra-elite-uni',
    plan_id: 'presencial-full',
    dni: '00000008'
  }
};

const wrappedRejectedEvent = {
  id: 'evt_test_REJECTED123456',
  type: 'charge.creation.failed',
  creation_date: 1785184000000,
  data: rejectedCharge
};

const wrappedRejectedEventWithStringData = {
  ...wrappedRejectedEvent,
  id: 'evt_test_REJECTED654321',
  data: JSON.stringify(rejectedCharge)
};

test('procesa el webhook fallido de Culqi con data como objeto', () => {
  assert.equal(webhookEventType(wrappedRejectedEvent), 'charge.creation.failed');
  assert.equal(webhookEventId(wrappedRejectedEvent), 'evt_test_REJECTED123456');
  assert.equal(webhookChargeId(wrappedRejectedEvent), 'chr_test_REJECTED123456');
  assert.equal(chargeEnvironment(webhookChargeId(wrappedRejectedEvent)), 'test');
  assert.equal(classifyChargeEvent(webhookEventType(wrappedRejectedEvent)), 'failed');
});

test('procesa el webhook fallido de Culqi con data serializada', () => {
  assert.equal(webhookEventType(wrappedRejectedEventWithStringData), 'charge.creation.failed');
  assert.equal(webhookEventId(wrappedRejectedEventWithStringData), 'evt_test_REJECTED654321');
  assert.equal(webhookChargeId(wrappedRejectedEventWithStringData), 'chr_test_REJECTED123456');
  assert.equal(classifyChargeEvent(webhookEventType(wrappedRejectedEventWithStringData)), 'failed');
});

test('resume un cargo rechazado sin marcarlo como capturado', () => {
  assert.deepEqual(verifiedChargeSummary(rejectedCharge), {
    id: 'chr_test_REJECTED123456',
    object: 'charge',
    amount: 55000,
    currentAmount: 55000,
    currency: 'PEN',
    captured: false,
    duplicated: false,
    creationDate: 1785184000000,
    outcomeType: 'venta_rechazada',
    outcomeCode: 'CULQI_CARD_DECLINED',
    merchantMessage: 'La tarjeta fue rechazada por el banco emisor.',
    userMessage: 'No se pudo completar el pago con esta tarjeta.',
    cardBrand: '',
    lastFour: ''
  });
});

test('mantiene una clave idempotente estable para el mismo evento rechazado', () => {
  const first = webhookDocumentId(wrappedRejectedEvent);
  const second = webhookDocumentId(JSON.parse(JSON.stringify(wrappedRejectedEvent)));
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);
});
