'use strict';
const {onDocumentUpdated} = require('firebase-functions/v2/firestore');
const {onRequest} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const {getApps, getApp, initializeApp} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const logger = require('firebase-functions/logger');
const crypto = require('node:crypto');
const {Graph} = require('./lib/graph');
const {eligible, shouldHandleTransition, clean, personalEmail, proposedUpnCandidates, randomPassword,
  seal, unseal, tokenHash, safeHtml, welcomeText, STUDENT_SKU, SENDER, scopeAllows,
  pilotActivationConfigured, pilotActivationAllowed} = require('./lib/core');

// Dedicated Firebase codebase. No imports or writes into the existing Culqi, attendance or web modules.
// Off by default; the live switch is deliberately not exposed to browser clients.
const MS_CLIENT_SECRET = defineSecret('NOSTRA_M365_CLIENT_SECRET');
const ACTIVATION_KEY = defineSecret('NOSTRA_M365_ACTIVATION_KEY');
const REGION = 'us-central1';
// Separate service identities: the enrollment worker can read both secrets,
// while the public activation endpoint can access only the activation key.
// Never use the project's shared Compute Engine default service account.
const ALTA_SERVICE_ACCOUNT = 'nostram365-alta@nostrachat-grupo-nostradamus.iam.gserviceaccount.com';
const ACTIVAR_SERVICE_ACCOUNT = 'nostram365-activar@nostrachat-grupo-nostradamus.iam.gserviceaccount.com';
const BASE = {region:REGION, memory:'256MiB', timeoutSeconds:90, maxInstances:2,
  serviceAccount:ALTA_SERVICE_ACCOUNT,
  secrets:[MS_CLIENT_SECRET, ACTIVATION_KEY]};
const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
function enabled() {
  return process.env.NOSTRA_M365_ENABLED === 'true' &&
    process.env.NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED === 'true' &&
    Boolean(process.env.NOSTRA_M365_NOT_BEFORE) &&
    Number.isFinite(Date.parse(process.env.NOSTRA_M365_NOT_BEFORE));
}
function errorCode(err) {
  const message = String(err && err.message || '');
  const known = /^(GRAPH_HTTP_[0-9]{3}|ENTRA_TOKEN_[0-9]{3}|STUDENT_A1_[A-Z_]+|ENTRA_CONFIG_MISSING|ACTIVATION_KEY_INVALID)$/;
  return known.test(message) ? message : 'REQUIERE_REVISION_TECNICA';
}
async function mark(ref, status, other = {}) {
  await ref.set({estado:status, updatedAt:FieldValue.serverTimestamp(), ...other},{merge:true});
}
function eventAfterCutoff(event) {
  const time = new Date(event.time || '').getTime();
  return Number.isFinite(time) && time >= Date.parse(process.env.NOSTRA_M365_NOT_BEFORE);
}
exports.nostraM365Alta = onDocumentUpdated({
  ...BASE, document:'preinscripciones/{preId}', retry:false
}, async event => {
  if (!enabled() || !event.data || !eventAfterCutoff(event)) return;
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  const preId = event.params.preId;
  // Pilot: only one explicitly selected document AND recipient; no global processing by default.
  if (!scopeAllows(preId, after, process.env)) return;
  // Only a transition into approval is eligible; no legacy backfill on deployment.
  if (!shouldHandleTransition(before, after)) return;
  const ref = db.collection('nostram365_private').doc(preId);
  const created = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (snap.exists) return false;
    tx.create(ref,{
      preinscripcionId:preId, estado:'en_revision',
      origen:'aprobacion_firebase', createdAt:FieldValue.serverTimestamp(),
      updatedAt:FieldValue.serverTimestamp()
    });
    return true;
  });
  if (!created) return; // At most one automatic attempt; ambiguous failures require manual review.

  let graphUserId = null;
  try {
    // Re-read current source: never act on an event that was subsequently revoked.
    const currentSnapshot = await db.collection('preinscripciones').doc(preId).get();
    const student = currentSnapshot.data() || {};
    if (!eligible(student) || !scopeAllows(preId, student, process.env)) {
      await mark(ref,'cancelada_antes_de_crear'); return;
    }
    const email = personalEmail(student.correo);
    const name = clean(student.nombre);
    const candidates = proposedUpnCandidates(name);
    if (!email || !candidates.length) {
      await mark(ref,'requiere_revision', {motivo:'DATOS_AMBIGUOS_O_CORREO_INVALIDO'});
      return;
    }
    const graph = new Graph(process.env, MS_CLIENT_SECRET.value());
    const choice = await graph.selectAvailableUpn(name, candidates);
    if (choice.state !== 'available') {
      // Existing full name or both addresses used: do not auto-attach or overwrite.
      await mark(ref,'requiere_vinculacion_manual', {
        motivo: choice.state === 'existing_name'
          ? 'CUENTA_EXISTENTE_EN_MICROSOFT' : 'CORREOS_PROPUESTOS_OCUPADOS',
        correoPropuesto:candidates[0]
      });
      return;
    }
    const upn = choice.upn;
    const skuId = await graph.studentSku();
    const temporaryPassword = randomPassword();
    const token = crypto.randomBytes(32).toString('base64url');
    const expires = Date.now() + 48*60*60*1000;
    await mark(ref,'preparada_para_crear', {
      correoPropuesto:upn, correoDestino:email, nombreAlumno:name,
      activacionHash:tokenHash(token),
      activacionExpiraMs:expires,
      credencialCifrada:seal(temporaryPassword, ACTIVATION_KEY.value())
    });
    // Check again immediately before the external side effect: approvals can be revoked.
    const lastSnapshot = await db.collection('preinscripciones').doc(preId).get();
    const lastStudent = lastSnapshot.data() || {};
    if (!eligible(lastStudent) || !scopeAllows(preId, lastStudent, process.env) ||
        clean(lastStudent.nombre) !== name ||
        personalEmail(lastStudent.correo) !== email) {
      await mark(ref,'cancelada_antes_de_crear', {motivo:'MATRICULA_O_CONTACTO_CAMBIO'});
      return;
    }
    // Creating a user is an external side effect. If a crash occurs after it,
    // a repeated trigger is intentionally blocked by the persistent job record.
    const createdUser = await graph.createStudent(upn, name, temporaryPassword);
    if (!createdUser || !createdUser.id) throw new Error('CREATE_NO_USER_ID');
    graphUserId = createdUser.id;
    await mark(ref,'creada_sin_licencia', {microsoftUserId:graphUserId,
      correoInstitucional:upn});
    await graph.licenseStudent(graphUserId, skuId);
    await mark(ref,'creada_licenciada', {licenciaSku:STUDENT_SKU,
      licenciaSkuId:skuId, licenciaAsignadaAt:FieldValue.serverTimestamp()});

    // URL fragment not sent to HTTP server during GET; token submitted only upon user action.
    const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!project || !/^[a-z0-9-]+$/.test(project)) throw new Error('PROJECT_ID_INVALID');
    const link = 'https://' + REGION + '-' + project +
      '.cloudfunctions.net/nostraM365Activar#id=' + encodeURIComponent(preId) +
      '&token=' + encodeURIComponent(token);
    // A revoked enrollment or corrected email must not receive credentials automatically.
    const contactSnapshot = await db.collection('preinscripciones').doc(preId).get();
    const verifiedContact = contactSnapshot.data() || {};
    if (!eligible(verifiedContact) || !scopeAllows(preId, verifiedContact, process.env) ||
        personalEmail(verifiedContact.correo) !== email ||
        clean(verifiedContact.nombre) !== name) {
      await mark(ref,'creada_licenciada_pendiente_contacto',
        {motivo:'MATRICULA_O_CONTACTO_CAMBIO', correoInstitucional:upn});
      return;
    }
    // Mark before sending. In an ambiguous Graph 202/timeout, human review prevents double mail.
    await mark(ref,'enviando_bienvenida', {remitente:SENDER, fechaEnvioIntentada:FieldValue.serverTimestamp()});
    await graph.mailStudent(email,'🎉 ¡Bienvenido a Grupo Nostradamus! | Tus accesos institucionales',
      welcomeText(name.split(' ')[0],upn,link));
    await mark(ref,'bienvenida_aceptada', {
      bienvenidaEstado:'aceptada_por_exchange', bienvenidaAceptadaAt:FieldValue.serverTimestamp()
    });
    logger.info('NostraM365: account, A1 license and welcome accepted', {preId});
  } catch (err) {
    await mark(ref,'requiere_revision', {motivo:errorCode(err),
      cuentaCreada: Boolean(graphUserId), microsoftUserId: graphUserId || null});
    logger.error('NostraM365: requires manual review', {preId, errorCode:errorCode(err)});
  }
});

function securityHeaders(res) {
  res.set('Cache-Control','no-store, no-cache, must-revalidate');
  res.set('Referrer-Policy','no-referrer');
  res.set('X-Content-Type-Options','nosniff');
  res.set('X-Frame-Options','DENY');
  res.set('Content-Security-Policy',"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
}
function page(title, contents) {
  return '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    safeHtml(title) + '</title><style>body{font:17px system-ui;max-width:640px;margin:8vh auto;padding:22px;color:#123032}' +
    'h1{color:#075861}button{background:#0C7D8C;color:white;border:0;border-radius:9px;padding:14px 20px;cursor:pointer}' +
    'pre{white-space:pre-wrap;word-break:break-all;padding:16px;background:#e8f5f6;border-radius:9px;font-size:20px}</style></head>' +
    '<body><h1>' + safeHtml(title) + '</h1>' + contents + '</body></html>';
}
exports.nostraM365Activar = onRequest({
  region:REGION, memory:'256MiB', timeoutSeconds:30, maxInstances:5,
  serviceAccount:ACTIVAR_SERVICE_ACCOUNT,
  secrets:[ACTIVATION_KEY]
}, async (req,res) => {
  securityHeaders(res);
  const generalEnabled = enabled();
  if (!generalEnabled && !pilotActivationConfigured(process.env)) {
    res.status(503).send(page('Servicio no habilitado','<p>Contacta a Coordinación Académica.</p>'));return;
  }
  if (req.method === 'GET') {
    res.status(200).send(page('Activación de acceso institucional',
      '<p>Consulta tu contraseña temporal una sola vez. Dispones de 48 horas desde el envío.</p>' +
      '<form method="POST"><input type="hidden" name="id" id="id"><input type="hidden" name="token" id="token">' +
      '<button type="submit" id="show" disabled>Mostrar mi contraseña temporal</button></form>' +
      '<p>Después de verla, ingresa a Microsoft 365 y cámbiala al iniciar sesión.</p>' +
      '<script>(function(){const p=new URLSearchParams(location.hash.slice(1));' +
      'const id=p.get("id"), token=p.get("token");' +
      'if(id&&token){document.getElementById("id").value=id;' +
      'document.getElementById("token").value=token;' +
      'document.getElementById("show").disabled=false;history.replaceState(null,"",location.pathname);}})();</script>'));
    return;
  }
  if (req.method !== 'POST') {res.status(405).end();return;}
  const id = clean(req.body && req.body.id);
  const token = clean(req.body && req.body.token);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(id) || !/^[A-Za-z0-9_-]{40,100}$/.test(token)) {
    res.status(400).send(page('Enlace inválido','<p>Solicita ayuda a Informes.</p>'));return;
  }
  const ref = db.collection('nostram365_private').doc(id);
  try {
    const password = await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const d = snap.data() || {};
      const supplied = Buffer.from(tokenHash(token),'hex');
      const stored = /^[a-f0-9]{64}$/i.test(d.activacionHash || '')
        ? Buffer.from(d.activacionHash,'hex') : Buffer.alloc(32);
      if ((!generalEnabled && !pilotActivationAllowed(process.env,id,d)) ||
          !crypto.timingSafeEqual(supplied,stored) ||
          d.estado !== 'bienvenida_aceptada' || d.activacionUsadaAt ||
          !Number.isFinite(d.activacionExpiraMs) || Date.now() > d.activacionExpiraMs ||
          !d.credencialCifrada) return null;
      const plain = unseal(d.credencialCifrada,ACTIVATION_KEY.value());
      tx.update(ref,{activacionUsadaAt:FieldValue.serverTimestamp(),
        credencialCifrada:FieldValue.delete(), activacionHash:FieldValue.delete(),
        updatedAt:FieldValue.serverTimestamp()});
      return plain;
    });
    if (!password) {res.status(410).send(page('Enlace agotado o vencido',
      '<p>Este enlace ya se utilizó o ha caducado. Contacta a Informes para restablecer el acceso.</p>'));return;}
    res.status(200).send(page('Tu contraseña temporal',
      '<p>Copia esta clave y úsala para iniciar sesión. Microsoft solicitará cambiarla:</p><pre>' +
      safeHtml(password) + '</pre><p>Esta clave no volverá a mostrarse aquí. No la compartas.</p>' +
      '<p><a href="https://www.office.com/">Ir a Microsoft 365</a></p>'));
  } catch(err) {
    logger.error('NostraM365: activation failed', {errorCode:'ACTIVATION_ERROR'});
    res.status(500).send(page('No se pudo completar',
      '<p>Contacta a Informes para recibir ayuda.</p>'));
  }
});
