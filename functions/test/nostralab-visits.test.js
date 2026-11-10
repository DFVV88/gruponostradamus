'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseVisitRequest, hashSession, validatePreviousTotal, ALLOWED_LABS } = require('../lib/nostralab-visit-utils');
const LAB = 'ondas-armonicas-transversales-longitudinales-v8';
const SESSION = '550e8400-e29b-41d4-a716-446655440000';
test('los laboratorios publicados están en whitelist', () => {
  assert.equal(ALLOWED_LABS.size, 4);
  assert.ok(ALLOWED_LABS.has('circunferencia-trigonometrica-v31'));
  assert.ok(ALLOWED_LABS.has(LAB));
});
test('la solicitud válida conserva slug y sesión', () => {
  assert.deepEqual(parseVisitRequest({ labId: LAB, sessionId: SESSION }), { labId: LAB, sessionId: SESSION });
});
test('rechaza laboratorios ajenos aun con slug correcto', () => {
  assert.throws(() => parseVisitRequest({ labId: 'inventado-v99', sessionId: SESSION }), /no publicado/);
});
test('rechaza intentos de path traversal', () => {
  assert.throws(() => parseVisitRequest({ labId: '../secreto', sessionId: SESSION }), /inválido/);
});
test('rechaza tokens predecibles o malformados', () => {
  assert.throws(() => parseVisitRequest({ labId: LAB, sessionId: 'visitante-1' }), /inválido/);
  assert.throws(() => parseVisitRequest({ labId: LAB, sessionId: SESSION.replace('-41d4-', '-11d4-') }), /inválido/);
});
test('la sesión se identifica con hash persistente y aislado por proyecto', () => {
  assert.equal(hashSession(LAB, SESSION), hashSession(LAB, SESSION));
  assert.notEqual(hashSession(LAB, SESSION), hashSession('pulsos-transversales-longitudinales-no-armonicos-v15', SESSION));
  assert.match(hashSession(LAB, SESSION), /^[0-9a-f]{64}$/);
});
test('el total nunca se inicializa a valores ficticios ni acepta datos corruptos', () => {
  assert.equal(validatePreviousTotal(undefined), 0);
  assert.equal(validatePreviousTotal(127), 127);
  for (const n of [-1, 0.5, NaN, '20', Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => validatePreviousTotal(n));
  }
});
