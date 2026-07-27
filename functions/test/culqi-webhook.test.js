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
  chargeMetadata,
  metadataValue,
  verifiedChargeSummary
} = require('../lib/culqi-webhook');

const payload = {
  id: 'evt_test_ABC123',
  type: 'charge.creation.succeeded',
  data: {
    object: {
      id: 'chr_test_7VUwCneoG1XtLeS7'
    }
  }
};

test('extrae tipo, evento y cargo de un webhook anidado', () => {
  assert.equal(webhookEventType(payload), 'charge.creation.succeeded');
  assert.equal(webhookEventId(payload), 'evt_test_ABC123');
  assert.equal(webhookChargeId(payload), 'chr_test_7VUwCneoG1XtLeS7');
  assert.equal(chargeEnvironment(webhookChargeId(payload)), 'test');
});

test('acepta las variantes comunes del identificador de cargo', () => {
  assert.equal(
    webhookChargeId({ event: 'charge.failed', data: { charge_id: 'chr_live_ABC123456789' } }),
    'chr_live_ABC123456789'
  );
  assert.equal(
    webhookChargeId({ event_type: 'charge.failed', charge: { id: 'chr_test_ABC123456789' } }),
    'chr_test_ABC123456789'
  );
});

test('clasifica solo eventos de cargo conocidos', () => {
  assert.equal(classifyChargeEvent('charge.creation.succeeded'), 'success');
  assert.equal(classifyChargeEvent('charge.failed'), 'failed');
  assert.equal(classifyChargeEvent('charge.refunded'), 'ignored_charge');
  assert.equal(classifyChargeEvent('order.status.changed'), 'ignored');
});

test('genera una clave idempotente estable por entrega', () => {
  const first = webhookDocumentId(payload);
  const second = webhookDocumentId(JSON.parse(JSON.stringify(payload)));
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);
  assert.notEqual(first, webhookDocumentId({ ...payload, id: 'evt_test_OTRO123' }));
});

test('extrae metadata propia sin depender del payload del webhook', () => {
  const metadata = chargeMetadata({
    metadata: {
      preinscripcion_id: 'PREID_1234567890',
      intento_pago_id: 'ATTEMPT_1234567890',
      codigo_solicitud: 'PRE-2026-ABCDEFGH'
    }
  });
  assert.equal(metadataValue(metadata, 'preinscripcion_id'), 'PREID_1234567890');
  assert.equal(metadataValue(metadata, 'intento_pago_id'), 'ATTEMPT_1234567890');
  assert.equal(metadataValue(metadata, 'codigo_solicitud'), 'PRE-2026-ABCDEFGH');
});

test('resume un cargo verificado sin conservar datos sensibles', () => {
  const summary = verifiedChargeSummary({
    id: 'chr_test_7VUwCneoG1XtLeS7',
    object: 'charge',
    amount: 45000,
    current_amount: 45000,
    currency: 'PEN',
    captured: true,
    duplicated: false,
    creation_date: 1700000000,
    source: {
      last_four: '1111',
      iin: { card_brand: 'Visa' },
      card_number: '411111******1111'
    },
    outcome: {
      type: 'venta_exitosa',
      code: 'AUT0000',
      merchant_message: 'Venta exitosa',
      user_message: 'Su compra fue exitosa'
    }
  });

  assert.deepEqual(summary, {
    id: 'chr_test_7VUwCneoG1XtLeS7',
    object: 'charge',
    amount: 45000,
    currentAmount: 45000,
    currency: 'PEN',
    captured: true,
    duplicated: false,
    creationDate: 1700000000,
    outcomeType: 'venta_exitosa',
    outcomeCode: 'AUT0000',
    merchantMessage: 'Venta exitosa',
    userMessage: 'Su compra fue exitosa',
    cardBrand: 'Visa',
    lastFour: '1111'
  });
  assert.equal(Object.prototype.hasOwnProperty.call(summary, 'card_number'), false);
});
