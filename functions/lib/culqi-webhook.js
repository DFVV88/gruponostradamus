'use strict';

const crypto = require('node:crypto');

const CHARGE_ID_RE = /^chr_(test|live)_[A-Za-z0-9]+$/;
const EVENT_ID_RE = /^evt_(test|live)_[A-Za-z0-9]+$/;

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

function webhookEventType(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';
  return clean(
    payload.type
    || payload.event_type
    || payload.eventType
    || payload.event
    || payload.name
  ).toLowerCase();
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
  const outcome = charge && charge.outcome && typeof charge.outcome === 'object' ? charge.outcome : {};
  return {
    id: clean(charge && charge.id),
    object: clean(charge && charge.object),
    amount: Number(charge && charge.amount) || 0,
    currentAmount: Number(charge && charge.current_amount) || 0,
    currency: clean(charge && (charge.currency_code || charge.currency)),
    captured: Boolean(charge && charge.captured === true),
    duplicated: Boolean(charge && charge.duplicated === true),
    creationDate: Number(charge && charge.creation_date) || 0,
    outcomeType: clean(outcome.type),
    outcomeCode: clean(outcome.code),
    merchantMessage: clean(outcome.merchant_message).slice(0, 280),
    userMessage: clean(outcome.user_message).slice(0, 280),
    cardBrand: clean(source.iin && source.iin.card_brand),
    lastFour: clean(source.last_four)
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
