'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeDeviceFingerprint,
  normalizeAuthentication3DS,
  paymentContextHash
} = require('../lib/culqi3ds');

test('acepta una huella de dispositivo UUID', () => {
  const value = '8019959c-fab1-49eb-bbbe-b846d308d8df';
  assert.equal(normalizeDeviceFingerprint(value), value);
});

test('normaliza parámetros Culqi 3DS versión 2', () => {
  const result = normalizeAuthentication3DS({
    eci: '05',
    xid: '02010000755f8c81a4db4c848b8c23f6b0196cfd',
    cavv: '63617264696e616c636f6d6d6572636561757468',
    protocolVersion: '2.1.0',
    directoryServerTransactionId: '755f8c81-a4db-4c84-8b8c-23f6b0196cfd'
  });

  assert.deepEqual(result, {
    eci: '05',
    xid: '02010000755f8c81a4db4c848b8c23f6b0196cfd',
    cavv: '63617264696e616c636f6d6d6572636561757468',
    protocolVersion: '2.1.0',
    directoryServerTransactionId: '755f8c81-a4db-4c84-8b8c-23f6b0196cfd'
  });
});

test('rechaza versión 2 sin identificador del servidor de directorio', () => {
  assert.equal(normalizeAuthentication3DS({
    eci: '05',
    xid: '02010000755f8c81a4db4c848b8c23f6b0196cfd',
    cavv: '63617264696e616c636f6d6d6572636561757468',
    protocolVersion: '2.1.0'
  }), null);
});

test('acepta versión 1 sin directoryServerTransactionId', () => {
  const result = normalizeAuthentication3DS({
    eci: '05',
    xid: '02010000755f8c81a4db4c848b8c23f6b0196cfd',
    cavv: '63617264696e616c636f6d6d6572636561757468',
    protocolVersion: '1.0.2'
  });
  assert.equal(result.protocolVersion, '1.0.2');
  assert.equal('directoryServerTransactionId' in result, false);
});

test('genera un hash estable sin almacenar el token', () => {
  const token = 'tkn_test_701ug3CDNJOAt5Q6';
  const device = '8019959c-fab1-49eb-bbbe-b846d308d8df';
  const first = paymentContextHash(token, device);
  const second = paymentContextHash(token, device);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);
  assert.notEqual(first, paymentContextHash(token, '9019959c-fab1-49eb-bbbe-b846d308d8df'));
});
