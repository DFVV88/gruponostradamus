'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizePayload,
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

const directCulqiV2Payload = {
  object: 'charge',
  id: 'chr_test_bh7cLg3qLnRx2hQO',
  creationDate: 1785167768537,
  amount: 35000,
  currentAmount: 35000,
  currencyCode: 'PEN',
  capture: true,
  duplicated: false,
  source: {
    lastFour: '1111',
    iin: { cardBrand: 'Visa' }
  },
  outcome: {
    type: 'venta_exitosa',
    code: 'AUT0000',
    merchantMessage: 'La operación de venta ha sido autorizada exitosamente',
    userMessage: 'Su compra ha sido exitosa'
  },
  metadata: {
    preinscripcion_id: 'sZulfiFiJiGdrcILTv0Y',
    intento_pago_id: '4BOWckxuaP6xXiGIsC7r',
    codigo_solicitud: 'PRE-2026-SZULFIFI'
  }
};

test('extrae tipo, evento y cargo de un webhook anidado', () => {
  assert.equal(webhookEventType(payload), 'charge.creation.succeeded');
  assert.equal(webhookEventId(payload), 'evt_test_ABC123');
  assert.equal(webhookChargeId(payload), 'chr_test_7VUwCneoG1XtLeS7');
  assert.equal(chargeEnvironment(webhookChargeId(payload)), 'test');
});

test('acepta el objeto charge directo que entrega Culqi Webhooks 2.0', () => {
  assert.equal(webhookEventType(directCulqiV2Payload), 'charge.creation.succeeded');
  assert.equal(webhookEventId(directCulqiV2Payload), '');
  assert.equal(webhookChargeId(directCulqiV2Payload), 'chr_test_bh7cLg3qLnRx2hQO');
  assert.equal(classifyChargeEvent(webhookEventType(directCulqiV2Payload)), 'success');
});

test('acepta el body binario que Cloud Functions recibe de Culqi', () => {
  const body = Buffer.from(JSON.stringify(directCulqiV2Payload), 'utf8');
  assert.deepEqual(normalizePayload(body), directCulqiV2Payload);
  assert.equal(webhookEventType(body), 'charge.creation.succeeded');
  assert.equal(webhookChargeId(body), 'chr_test_bh7cLg3qLnRx2hQO');
  assert.equal(webhookDocumentId(body), webhookDocumentId(directCulqiV2Payload));
});

test('infiere un charge directo fallido por el resultado de Culqi', () => {
  const failed = {
    object: 'charge',
    id: 'chr_test_FAILED123456',
    capture: false,
    outcome: {
      type: 'venta_rechazada',
      code: 'CULQI_CARD_DECLINED',
      merchantMessage: 'La tarjeta fue rechazada'
    }
  };
  assert.equal(webhookEventType(failed), 'charge.creation.failed');
  assert.equal(classifyChargeEvent(webhookEventType(failed)), 'failed');
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

  const directFirst = webhookDocumentId(directCulqiV2Payload);
  const directSecond = webhookDocumentId(JSON.parse(JSON.stringify(directCulqiV2Payload)));
  assert.equal(directFirst, directSecond);
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

test('resume un cargo snake_case verificado sin conservar datos sensibles', () => {
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

test('resume el cargo camelCase real de Culqi 2.0', () => {
  assert.deepEqual(verifiedChargeSummary(directCulqiV2Payload), {
    id: 'chr_test_bh7cLg3qLnRx2hQO',
    object: 'charge',
    amount: 35000,
    currentAmount: 35000,
    currency: 'PEN',
    captured: true,
    duplicated: false,
    creationDate: 1785167768537,
    outcomeType: 'venta_exitosa',
    outcomeCode: 'AUT0000',
    merchantMessage: 'La operación de venta ha sido autorizada exitosamente',
    userMessage: 'Su compra ha sido exitosa',
    cardBrand: 'Visa',
    lastFour: '1111'
  });
});