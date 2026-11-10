'use strict';
const crypto = require('node:crypto');

const STUDENT_SKU = 'STANDARDWOFFPACK_STUDENT';
const STUDENT_SKU_ID = '314c4481-f395-4525-be8b-2ec4bb1e9d91';
const SENDER = 'informes@gruponostradamus.edu.pe';
const DOMAIN = 'gruponostradamus.edu.pe';

function clean(v) { return String(v == null ? '' : v).trim().replace(/\s+/g, ' '); }
function alreadyAssigned(r) {
  return Boolean(r && (r.correoInstitucionalAsignado === true ||
    clean(r.correoInstitucional) || clean(r.institutionalEmail)));
}
function eligible(r) {
  // Admin "Guardar cambios" saves estado=matriculado without setting matriculaAprobada.
  // The dedicated Approve action and the Culqi webhook set matriculaAprobada=true.
  // Both paths MUST also have the two explicit, consistent payment approval fields.
  return Boolean(r && r.origen === 'web_preinscripcion' &&
    (r.matriculaAprobada === true || r.estado === 'matriculado') &&
    r.pagoValidado === true &&
    r.estadoPago === 'pago_validado' && r.estado !== 'rechazado' &&
    !alreadyAssigned(r) && clean(r.correo) && clean(r.nombre));
}
function shouldHandleTransition(before, after) {
  return !eligible(before) && eligible(after);
}
function personalEmail(value) {
  const s = clean(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && !s.endsWith('@' + DOMAIN) ? s : null;
}
// A pilot must match BOTH the exact pre-enrollment ID and its personal email.
// No scope configured => fail closed, even if the two master switches are true.
function scopeAllows(preId, student, env) {
  const mode = clean(env && env.NOSTRA_M365_SCOPE_MODE);
  if (mode === 'production') return true;
  if (mode !== 'pilot') return false;
  const id = clean(env.NOSTRA_M365_PILOT_PREID);
  const email = personalEmail(env.NOSTRA_M365_PILOT_EMAIL);
  return /^[A-Za-z0-9_-]{16,100}$/.test(id) && preId === id &&
    Boolean(email) && personalEmail(student && student.correo) === email;
}
// During pilot the password endpoint is allowed only for an explicitly scoped
// test record. Both global account-creation switches remain disabled.
function pilotActivationConfigured(env) {
  return Boolean(env && env.NOSTRA_M365_SCOPE_MODE === 'pilot' &&
    env.NOSTRA_M365_PILOT_ACTIVATION_ENABLED === 'true' &&
    env.NOSTRA_M365_ENABLED === 'false' &&
    env.NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED === 'false' &&
    env.NOSTRA_M365_NOT_BEFORE === '2099-01-01T00:00:00Z');
}
function pilotActivationAllowed(env, preId, job) {
  return pilotActivationConfigured(env) && Boolean(job) &&
    job.origen === 'piloto_independiente_sin_cobro' &&
    job.preinscripcionId === preId &&
    scopeAllows(preId, {correo:job.correoDestino}, env);
}
function slug(s) {
  return clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}
function proposedUpnCandidates(fullName) {
  const words = clean(fullName).split(' ').filter(Boolean);
  // Only unambiguous two-token or >=4-token names. Three tokens may mean
  // two given names or two surnames; an administrator must resolve them.
  if (words.length !== 2 && words.length < 4) return [];
  if (words.some(x => !slug(x) || /^(de|del|la|las|los|y)$/i.test(x))) return [];
  const given = slug(words[0]);
  const surname = slug(words.length === 2 ? words[1] : words[words.length - 2]);
  if (!/^[a-z0-9]{2,30}$/.test(given) || !/^[a-z0-9]{2,30}$/.test(surname)) return [];
  const primary = given + '.' + surname;
  const result = [primary + '@' + DOMAIN];
  if (words.length >= 4) {
    const secondSurnameInitial = slug(words[words.length - 1]).slice(0,1);
    if (secondSurnameInitial && primary.length + 1 <= 64) {
      result.push(primary + secondSurnameInitial + '@' + DOMAIN);
    }
  }
  return result;
}
function proposedUpn(fullName) {
  return proposedUpnCandidates(fullName)[0] || null;
}
function randomPassword() {
  const parts = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@$%'];
  const result = parts.map(s => s[crypto.randomInt(s.length)]);
  const alphabet = parts.join('');
  for (let i = result.length; i < 24; i++) result.push(alphabet[crypto.randomInt(alphabet.length)]);
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [result[j], result[i]] = [result[i], result[j]];
  }
  return result.join('');
}
function keyFromBase64(value) {
  const s = clean(value);
  if (!/^[A-Za-z0-9+/]{43}=$/.test(s)) throw new Error('ACTIVATION_KEY_INVALID');
  const key = Buffer.from(s, 'base64');
  if (key.length !== 32) throw new Error('ACTIVATION_KEY_INVALID');
  return key;
}
function seal(value, base64Key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFromBase64(base64Key), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return {iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64')};
}
function unseal(payload, base64Key) {
  if (!payload || !payload.iv || !payload.tag || !payload.data) throw new Error('ACTIVATION_DATA_INVALID');
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyFromBase64(base64Key), Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString('utf8');
}
function tokenHash(token) { return crypto.createHash('sha256').update(String(token)).digest('hex'); }
function safeHtml(s) { return String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])); }
function welcomeText(name, upn, activationUrl) {
  return '🎉 ¡Bienvenido, ' + name + ', al Grupo Nostradamus! 📚🚀\n\n' +
    'Tu matrícula ha sido aprobada y tu cuenta institucional está lista.\n\n' +
    '👤 Usuario institucional: ' + upn + '\n\n' +
    '🔒 Activa tu acceso y consulta tu contraseña temporal de un solo uso aquí:\n' +
    activationUrl + '\n\n' +
    'La clave debe cambiarse en tu primer inicio de sesión. El enlace expira en 48 horas y solo puede usarse una vez.\n\n' +
    '📲 INGRESO A MICROSOFT TEAMS\n' +
    '1️⃣ Ingresa a https://gruponostradamus.edu.pe/\n' +
    '2️⃣ Selecciona "Clases en vivo" → "Entrar a Microsoft Teams".\n' +
    '3️⃣ Inicia sesión con tus credenciales institucionales.\n' +
    '📌 Pasos detallados: https://tinyurl.com/NostraPASOS\n\n' +
    '🔐 ACTIVA TU NostraCUENTA\n' +
    'Después de comprobar tu acceso a Teams, visita https://gruponostradamus.edu.pe/cuenta-nostra.html\n' +
    '👉 Selecciona "Alumno aprobado".\n' +
    '👉 Haz clic en "Activar NostraCUENTA".\n' +
    '👉 Crea tu USUARIO CORTO.\n\n' +
    '🚀 Accede a NostraCHAT, DAMUS Académico y los recursos habilitados del Portal del Alumno.\n' +
    '💬 Si tienes inconvenientes, responde a este correo.\n' +
    '🔐 Tus credenciales son personales; no las compartas.\n\n' +
    '💪🎯 ¡Vamos con todo por ese ingreso a la UNI!\n' +
    '💙💛 Grupo Nostradamus\n📚 La ruta que transforma alumnos en cachimbos.';
}
module.exports = {STUDENT_SKU, STUDENT_SKU_ID, SENDER, DOMAIN, clean, eligible, shouldHandleTransition, alreadyAssigned, personalEmail, scopeAllows, pilotActivationConfigured, pilotActivationAllowed,
  proposedUpn, proposedUpnCandidates, randomPassword, seal, unseal, tokenHash, safeHtml, welcomeText};