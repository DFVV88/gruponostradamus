'use strict';

const crypto = require('node:crypto');

const CHARGE_ID_RE = /^chr_(test|live)_[A-Za-z0-9]+$/;
const EVENT_ID_RE = /^evt_(test|live)_[A-Za-z0-9]+$/;
const EVENT_TYPE_RE = /^[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+$/i;

function clean(value) {
  return String(value == null ? '' : value).trim();
}

function firstValid(values, pattern) {
  for (const value of values) {
    const normalized = clean(value);
    if (pattern.test(normalized)) return normalized;
  }
  return '';
}

function explicitWebhookEventType(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';
  const values = [
    payload.type,
    payload.event_type,
    payload.eventType,
    payload.event,
    payload.name
  ];
  for (const value of values) {
    const normalized = clean(value).toLowerCase();
    if (EVENT_TYPE_RE.test(normalized)) return normalized;
  }
  return '';
}

function directChargeEventType(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';
  if (clean(payload.object).toLowerCase() !== 'charge') return '';

  const chargeId = firstValid([payload.id, payload.chargeId, payload.charge_id], CHARGE_ID_RE);
  if (!chargeId) return '';

  const outcome = payload.outcome && typeof payload.outcome === 'object' && !Array.isArray(payload.outcome)
    ? payload.outcome
    : {};
  const outcomeType = clean(outcome.type || outcome.outcomeType).toLowerCase();
  const outcomeCode = clean(outcome.code || outcome.outcomeCode).toUpperCase();
  const captured = payload.capture === true || payload.captured === true;

  const successTypes = new Set([
    'venta_exitosa',
    'successful_sale',
    'success',
    'succeeded',
    'approved',
    'aprobado'
  ]);
  if (outcomeCode === 'AUT0000' || successTypes.has(outcomeType) || captured) {
    return 'charge.creation.succeeded';
  }

  const failureText = `${outcomeType} ${outcomeCode} ${clean(outcome.merchantMessage || outcome.merchant_message)} ${clean(outcome.userMessage || outcome.user_message)}`.toLowerCase();
  if (
    outcomeCode
    || /rechaz|fall|fail|error|deneg|declin|cancel|fraud|invalid|insuficien/.test(failureText)
  ) {
    return 'charge.creation.failed';
  }

  return '';
}

function webhookEventType(payload) {
  return explicitWebhookEventType(payload) || directChargeEventType(payload);
}

function webhookEventId(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';
  return firstValid([
    payload.event_id,
    payload.eventId,
    payload.id,
    payload.data && payload.data.event_id,
    payload.data && payload.data.eventId
  ], EVENT_ID_RE);
}

function webhookChargeId(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
  const dataObject = data.object && typeof data.object === 'object' ? data.object : {};
  const dataCharge = data.charge && typeof data.charge === 'object' ? data.charge : {};
  const object = payload.object && typeof payload.object === 'object' ? payload.object : {};
  const charge = payload.charge && typeof payload.charge === 'object' ? payload.charge : {};

  return firstValid([
    data.id,
    data.charge_id,
    data.chargeId,
    dataObject.id,
    dataObject.charge_id,
    dataObject.chargeId,
    dataCharge.id,
    object.id,
    charge.id,
    payload.charge_id,
    payload.chargeId,
    payload.id
  ], CHARGE_ID_RE);
}

function chargeEnvironment(chargeId) {
  const match = CHARGE_ID_RE.exec(clean(chargeId));
  return match ? match[1] : '';
}

function classifyChargeEvent(type) {
  const normalized = clean(type).toLowerCase();
  const successful = new Set([
    'charge.creation.succeeded',
    'charge.succeeded',
    'charge.captured'
  ]);
  const failed = new Set([
    'charge.creation.failed',
    'charge.failed'
  ]);
  if (successful.has(normalized)) return 'success';
  if (failed.has(normalized)) return 'failed';
  return normalized.startsWith('charge.') ? 'ignored_charge' : 'ignored';
}

function webhookDocumentId(payload) {
  const eventId = webhookEventId(payload);
  const type = webhookEventType(payload);
  const chargeId = webhookChargeId(payload);
  return crypto
    .createHash('sha256')
    .update(`${eventId}\n${type}\n${chargeId}`, 'utf8')
    .digest('hex');
}

function chargeMetadata(charge) {
  if (!charge || typeof charge !== 'object' || Array.isArray(charge)) return {};
  return charge.metadata && typeof charge.metadata === 'object' && !Array.isArray(charge.metadata)
    ? charge.metadata
    : {};
}

function metadataValue(metadata, ...keys) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return '';
  for (const key of keys) {
    const value = clean(metadata[key]);
    if (value) return value;
  }
  return '';
}

function verifiedChargeSummary(charge) {
  const source = charge && charge.source && typeof charge.source === 'object' ? charge.source : {};
  const iin = source.iin && typeof source.iin === 'object' ? source.iin : {};
  const outcome = charge && charge.outcome && typeof charge.outcome === 'object' ? charge.outcome : {};
  return {
    id: clean(charge && charge.id),
    object: clean(charge && charge.object),
    amount: Number(charge && charge.amount) || 0,
    currentAmount: Number(charge && (charge.currentAmount ?? charge.current_amount)) || 0,
    currency: clean(charge && (charge.currencyCode || charge.currency_code || charge.currency)),
    captured: Boolean(charge && (charge.capture === true || charge.captured === true)),
    duplicated: Boolean(charge && charge.duplicated === true),
    creationDate: Number(charge && (charge.creationDate ?? charge.creation_date)) || 0,
    outcomeType: clean(outcome.type || outcome.outcomeType),
    outcomeCode: clean(outcome.code || outcome.outcomeCode),
    merchantMessage: clean(outcome.merchantMessage || outcome.merchant_message).slice(0, 280),
    userMessage: clean(outcome.userMessage || outcome.user_message).slice(0, 280),
    cardBrand: clean(iin.cardBrand || iin.card_brand),
    lastFour: clean(source.lastFour || source.last_four)
  };
}

module.exports = {
  CHARGE_ID_RE,
  webhookEventType,
  webhookEventId,
  webhookChargeId,
  chargeEnvironment,
  classifyChargeEvent,
  webhookDocumentId,
  chargeMetadata,
  metadataValue,
  verifiedChargeSummary
};