'use strict';
const { createHash } = require('node:crypto');
const approved = require('./nostralab-approved.json');
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_LABS = new Set(approved);
function parseVisitRequest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    const e = new Error('Solicitud incorrecta'); e.status = 400; throw e;
  }
  const labId = payload.labId;
  const sessionId = payload.sessionId;
  if (typeof labId !== 'string' || labId.length > 100 || !VALID_SLUG.test(labId)) {
    const e = new Error('Identificador de laboratorio inválido'); e.status = 400; throw e;
  }
  if (!ALLOWED_LABS.has(labId)) {
    const e = new Error('Laboratorio no publicado'); e.status = 404; throw e;
  }
  if (typeof sessionId !== 'string' || !VALID_UUID.test(sessionId)) {
    const e = new Error('Identificador de sesión inválido'); e.status = 400; throw e;
  }
  return { labId, sessionId };
}
function hashSession(labId, sessionId) {
  return createHash('sha256').update(labId + ':' + sessionId).digest('hex');
}
function validatePreviousTotal(value) {
  if (value === undefined || value === null) return 0;
  if (!Number.isSafeInteger(value) || value < 0 || value >= Number.MAX_SAFE_INTEGER) {
    throw new Error('El contador almacenado no es válido');
  }
  return value;
}
module.exports = { parseVisitRequest, hashSession, validatePreviousTotal, ALLOWED_LABS };
