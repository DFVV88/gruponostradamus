'use strict';

const crypto = require('node:crypto');

const DEVICE_RE = /^[A-Za-z0-9_-]{16,128}$/;
const ECI_RE = /^\d{2}$/;
const PROTOCOL_RE = /^\d+(?:\.\d+){1,2}$/;
const SAFE_VALUE_RE = /^[A-Za-z0-9+/=_-]{2,512}$/;
const TRANSACTION_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

function clean(value) {
  return String(value == null ? '' : value).trim();
}

function normalizeDeviceFingerprint(value) {
  const normalized = clean(value);
  return DEVICE_RE.test(normalized) ? normalized : '';
}

function normalizeAuthentication3DS(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;

  const eci = clean(input.eci);
  const xid = clean(input.xid);
  const cavv = clean(input.cavv);
  const protocolVersion = clean(input.protocolVersion);
  const directoryServerTransactionId = clean(input.directoryServerTransactionId);

  if (!ECI_RE.test(eci)) return null;
  if (!SAFE_VALUE_RE.test(xid) || !SAFE_VALUE_RE.test(cavv)) return null;
  if (!PROTOCOL_RE.test(protocolVersion)) return null;
  if (protocolVersion.startsWith('2.') && !TRANSACTION_ID_RE.test(directoryServerTransactionId)) return null;
  if (directoryServerTransactionId && !TRANSACTION_ID_RE.test(directoryServerTransactionId)) return null;

  const result = { eci, xid, cavv, protocolVersion };
  if (directoryServerTransactionId) {
    result.directoryServerTransactionId = directoryServerTransactionId;
  }
  return result;
}

function paymentContextHash(tokenId, deviceFingerprintId) {
  const token = clean(tokenId);
  const device = normalizeDeviceFingerprint(deviceFingerprintId);
  if (!token || !device) return '';
  return crypto.createHash('sha256').update(`${token}\n${device}`, 'utf8').digest('hex');
}

module.exports = {
  normalizeDeviceFingerprint,
  normalizeAuthentication3DS,
  paymentContextHash
};
