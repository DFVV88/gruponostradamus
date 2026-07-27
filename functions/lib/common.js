'use strict';

class PublicError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function clean(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function bodyOf(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      throw new PublicError(400, 'JSON_INVALIDO', 'La solicitud no contiene un JSON válido.');
    }
  }
  return {};
}

function requirePost(req) {
  if (req.method !== 'POST') {
    throw new PublicError(405, 'METODO_NO_PERMITIDO', 'Esta operación requiere una solicitud POST.');
  }
}

function requireText(value, name, regex, maxLength = 120) {
  const result = clean(value);
  if (!result || result.length > maxLength || (regex && !regex.test(result))) {
    throw new PublicError(400, 'DATO_INVALIDO', `El campo ${name} no es válido.`);
  }
  return result;
}

function send(res, status, payload) {
  res.status(status).json({
    ok: status >= 200 && status < 300,
    ...payload
  });
}

function safeMessage(payload, fallback) {
  const candidates = [
    payload && payload.user_message,
    payload && payload.merchant_message,
    payload && payload.message,
    payload && payload.type,
    fallback
  ];
  return (candidates.map(clean).find(Boolean) || 'No se pudo procesar el pago.').slice(0, 280);
}

function splitName(fullName) {
  const parts = clean(fullName).split(' ').filter(Boolean);
  const firstName = parts.shift() || '';
  return {
    firstName: firstName.slice(0, 50),
    lastName: parts.join(' ').slice(0, 50)
  };
}

function peruPhone(value) {
  const digits = clean(value).replace(/\D/g, '');
  const local = digits.length >= 9 ? digits.slice(-9) : '';
  return /^9\d{8}$/.test(local) ? Number(local) : null;
}

module.exports = {
  PublicError,
  clean,
  bodyOf,
  requirePost,
  requireText,
  send,
  safeMessage,
  splitName,
  peruPhone
};
