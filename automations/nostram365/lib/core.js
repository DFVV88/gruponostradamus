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


const ACTIVATION_PROMPT = '🔒 Activa tu acceso y consulta tu contraseña temporal de un solo uso aquí:';
const ACTIVATION_NOTICE = 'La clave debe cambiarse en tu primer inicio de sesión. El enlace expira en 48 horas y solo puede usarse una vez.';
function welcomeTextDirect(name, upn, password) {
  // Keep the approved copy and replace only obsolete activation instructions.
  if (typeof password !== 'string' || password.length < 20) throw new Error('PASSWORD_TOO_SHORT');
  const placeholder = 'NOSTRAM365_ACTIVATION_LINK_PLACEHOLDER';
  return welcomeText(name, upn, placeholder)
    .replace(ACTIVATION_PROMPT + '\n' + placeholder,
      '🔑 Contraseña institucional: ' + password)
    .replace(ACTIVATION_NOTICE,
      'Puedes iniciar sesión directamente con esta contraseña. No necesitas cambiarla en el primer ingreso. Consérvala de forma segura y no la compartas.');
}

const WELCOME_LOGO_CID = 'nostradamus-logo-oficial';
function welcomeHtmlFromCopy(copy) {
  // The same premium HTML and official logo render both old and new greetings.
  // Email-safe tables, inline styles and system fonts work across Gmail/Outlook.
  const paragraphs = copy.split('\n\n');
  const format = raw => safeHtml(raw).replace(/https:\/\/[^\s<]+/g, url =>
    '<a href="' + url + '" style="color:#087d8b;text-decoration:underline;word-break:break-all;">' +
      url + '</a>').replace(/\n/g,'<br>');
  const row = content => '<tr><td style="padding:0 28px 18px;">' + content + '</td></tr>';
  const panel = content =>
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="background-color:#eef7f8;border:1px solid #cfe5e8;border-radius:12px;">' +
    '<tr><td style="padding:17px 19px;">' + content + '</td></tr></table>';
  const font = 'font-family:Segoe UI,Arial,Helvetica,sans-serif;';
  const bodyStyle = 'font-size:15px;line-height:1.65;color:#23464d;margin:0;' + font;
  const body = paragraphs.map((p,i) => {
    const content = format(p);
    if (i===0) return row('<h1 style="font-size:26px;line-height:1.35;font-weight:700;' +
      'color:#075861;margin:0;' + font + '">' + content + '</h1>');
    if (i===8) return '<tr><td bgcolor="#075861" style="padding:25px 28px;text-align:center;">' +
      '<p style="color:#ffffff;font-size:14px;line-height:1.65;margin:0;' + font +
      '">' + content + '</p></td></tr>';
    const extra = i===2 || i===3 || i===5 || i===6 ? 'font-weight:600;color:#075861;' : '';
    const pHtml = '<p style="' + bodyStyle + extra + '">' + content + '</p>';
    return row((i===2 || i===3 || i===6) ? panel(pHtml) : pHtml);
  }).join('');
  return '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#eff6f7;' + font + '">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'bgcolor="#eff6f7" style="border-collapse:collapse;"><tr><td align="center" style="padding:26px 10px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" ' +
    'style="width:100%;max-width:600px;border-collapse:separate;border-radius:15px;' +
    'overflow:hidden;background-color:#ffffff;border:1px solid #d9e8ea;">' +
    '<tr><td height="6" bgcolor="#0C7D8C" style="height:6px;font-size:0;line-height:6px;">&nbsp;</td></tr>' +
    '<tr><td align="center" style="padding:27px 28px 22px;background-color:#ffffff;">' +
    '<a href="https://gruponostradamus.edu.pe/" style="text-decoration:none;">' +
    '<img src="cid:' + WELCOME_LOGO_CID + '" alt="Grupo Nostradamus" width="194" ' +
    'style="display:block;width:194px;max-width:100%;height:auto;border:0;"></a></td></tr>' +
    '<tr><td height="3" bgcolor="#d5b261" style="font-size:0;line-height:3px;">&nbsp;</td></tr>' +
    '<tr><td height="26" style="font-size:0;line-height:26px;">&nbsp;</td></tr>' +
    body + '</table></td></tr></table></body></html>';
}

function welcomeHtml(name, upn, activationUrl) {
  return welcomeHtmlFromCopy(welcomeText(name, upn, activationUrl));
}
function welcomeHtmlDirect(name, upn, password) {
  return welcomeHtmlFromCopy(welcomeTextDirect(name, upn, password));
}
module.exports = {STUDENT_SKU, STUDENT_SKU_ID, SENDER, DOMAIN, clean, eligible, shouldHandleTransition, alreadyAssigned, personalEmail, scopeAllows, pilotActivationConfigured, pilotActivationAllowed,
  proposedUpn, proposedUpnCandidates, randomPassword, seal, unseal, tokenHash, safeHtml,
  welcomeText, welcomeHtml, welcomeTextDirect, welcomeHtmlDirect, WELCOME_LOGO_CID};