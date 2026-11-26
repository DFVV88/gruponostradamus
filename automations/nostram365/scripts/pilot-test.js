'use strict';
// Explicit, one-time production-tenant PILOT. Does not change payments, enrollment
// data, the website, or the existing Firebase functions. Never automatically retry.
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const crypto = require('node:crypto');
const {Graph} = require('../lib/graph');
const {scopeAllows, proposedUpnCandidates, randomPassword, seal, tokenHash,
  pilotActivationConfigured, alreadyAssigned} = require('../lib/core');

const PROJECT = 'nostrachat-grupo-nostradamus';
const BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT +
  '/databases/(default)/documents/';
const ENDPOINT = 'https://us-central1-' + PROJECT +
  '.cloudfunctions.net/nostraM365Activar';

function loadEnv() {
  const out = {};
  for (const line of fs.readFileSync('.env','utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    out[line.slice(0,i)] = line.slice(i+1);
  }
  return out;
}
function secret(name) {
  return execFileSync('gcloud', ['secrets','versions','access','latest',
    '--secret=' + name,'--project=' + PROJECT], {encoding:'utf8'}).trim();
}
function scalar(v) {
  if (typeof v === 'boolean') return {booleanValue:v};
  if (Number.isSafeInteger(v)) return {integerValue:String(v)};
  if (typeof v === 'string') return {stringValue:v};
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return {mapValue:{fields:toFields(v)}};
  }
  throw Error('FIELD_TYPE_INVALID');
}
function toFields(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,scalar(v)]));
}
function readField(doc, name) {
  const v = (doc && doc.fields && doc.fields[name]) || {};
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  return null;
}
function failureCode(err) {
  const msg = String(err && err.message || '');
  return /^(GRAPH_HTTP_[0-9]{3}|ENTRA_TOKEN_[0-9]{3}|STUDENT_A1_[A-Z_]+|FIRESTORE_[A-Z_0-9]+|PILOT_[A-Z_]+|ACTIVATION_[A-Z_]+|CREATE_NO_USER_ID)$/.test(msg)
    ? msg : 'REQUIERE_REVISION_TECNICA';
}
async function run() {
  const env = loadEnv();
  if (!pilotActivationConfigured(env) ||
      env.NOSTRA_M365_ENABLED !== 'false' ||
      env.NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED !== 'false') {
    throw Error('PILOT_SWITCH_NOT_SAFE');
  }
  const id = env.NOSTRA_M365_PILOT_PREID;
  const email = env.NOSTRA_M365_PILOT_EMAIL;
  if (!/^[a-f0-9]{64}$/.test(id || '') || !email) throw Error('PILOT_ID_INVALID');
  const access = execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim();
  const headers = {Authorization:'Bearer ' + access,'Content-Type':'application/json'};
  async function firestore(path, method='GET', fields) {
    const response = await fetch(BASE + path, {method, headers,
      body:fields ? JSON.stringify({fields:toFields(fields)}) : undefined,
      signal:AbortSignal.timeout(20000)});
    if (response.status === 404 && method === 'GET') return null;
    if (!response.ok) throw Error('FIRESTORE_HTTP_' + response.status);
    return response.json();
  }
  async function fetchStudent() {
    const d = await firestore('preinscripciones/' + encodeURIComponent(id));
    if (!d) throw Error('PILOT_SOURCE_NOT_FOUND');
    return {
      nombre:readField(d,'nombre'),correo:readField(d,'correo'),
      origen:readField(d,'origen'),estado:readField(d,'estado'),
      estadoPago:readField(d,'estadoPago'),
      pagoValidado:readField(d,'pagoValidado'),
      matriculaAprobada:readField(d,'matriculaAprobada'),
      correoInstitucionalAsignado:readField(d,'correoInstitucionalAsignado'),
      correoInstitucional:readField(d,'correoInstitucional')
    };
  }
  function assertPilotStudent(s) {
    if (!scopeAllows(id,s,env) || s.origen !== 'web_preinscripcion' ||
        s.pagoValidado !== false || s.matriculaAprobada !== false ||
        s.estadoPago !== 'pendiente_envio_voucher' ||
        s.estado !== 'nuevo' || alreadyAssigned(s)) {
      throw Error('PILOT_SOURCE_CHANGED');
    }
  }
  const student = await fetchStudent();
  assertPilotStudent(student);
  const name = student.nombre;
  const candidates = proposedUpnCandidates(name);
  if (!candidates.length) throw Error('PILOT_NAME_AMBIGUOUS');
  const existingJob = await firestore('nostram365_private/' + encodeURIComponent(id));
  if (existingJob) throw Error('PILOT_JOB_ALREADY_EXISTS');

  // This endpoint must already be deployed with pilot-only activation enabled.
  const activate = await fetch(ENDPOINT,{method:'GET',signal:AbortSignal.timeout(20000)});
  if (activate.status !== 200) throw Error('PILOT_ACTIVATION_NOT_READY');

  const graph = new Graph(env,secret('NOSTRA_M365_CLIENT_SECRET'));
  const selection = await graph.selectAvailableUpn(name,candidates);
  if (selection.state !== 'available') throw Error('PILOT_ACCOUNT_CONFLICT');
  const upn = selection.upn;
  const skuId = await graph.studentSku();
  console.log('Piloto autorizado, solo una preinscripción.');
  console.log('Correo institucional seleccionado:',upn);
  console.log('Licencia A1:',skuId);
  console.log('Pago y matrícula reales: SIN CAMBIOS.');
  if (!process.argv.includes('--execute')) {
    console.log('Solo preflight. No se creó ninguna cuenta.');
    return;
  }
  // Verify again immediately before reserving the one-time job.
  const latest = await fetchStudent();
  assertPilotStudent(latest);
  if (latest.nombre !== name || latest.correo !== student.correo) {
    throw Error('PILOT_SOURCE_CHANGED');
  }
  const privatePath='nostram365_private/' + encodeURIComponent(id);
  const createdAt = new Date().toISOString();
  const job = {
    preinscripcionId:id, estado:'reservada_piloto',
    origen:'piloto_independiente_sin_cobro',
    correoDestino:email, nombreAlumno:name, correoPropuesto:upn,
    createdAt, updatedAt:createdAt
  };
  // The createDocument operation is atomic and fails if an earlier attempt exists.
  await firestore('nostram365_private?documentId=' + encodeURIComponent(id),'POST',job);
  let userId = null;
  async function save(status, extra={}) {
    Object.assign(job,extra,{estado:status,updatedAt:new Date().toISOString()});
    await firestore(privatePath + '?currentDocument.exists=true','PATCH',job);
  }
  try {
    const temporaryPassword=randomPassword();
    const token=crypto.randomBytes(32).toString('base64url');
    const expires=Date.now()+48*60*60*1000;
    await save('preparada_para_crear',{
      activacionHash:tokenHash(token), activacionExpiraMs:expires,
      credencialCifrada:seal(temporaryPassword,secret('NOSTRA_M365_ACTIVATION_KEY'))
    });
    const check=await fetchStudent();
    assertPilotStudent(check);
    if (check.nombre!==name || check.correo!==student.correo) {
      throw Error('PILOT_SOURCE_CHANGED');
    }
    const user=await graph.createStudent(upn,name,temporaryPassword);
    if (!user || !user.id) throw Error('CREATE_NO_USER_ID');
    userId=user.id;
    await save('creada_sin_licencia',{microsoftUserId:userId,correoInstitucional:upn});
    await graph.licenseStudent(userId,skuId);
    await save('creada_licenciada',{licenciaSku:'STANDARDWOFFPACK_STUDENT',licenciaSkuId:skuId});
    const link=ENDPOINT+'#id='+encodeURIComponent(id)+'&token='+encodeURIComponent(token);
    const message='Hola:\n\n' +
      'Esta es una prueba autorizada de NostraM365. No representa una matrícula ni un pago real.\n\n' +
      'Tu cuenta institucional DE ENSAYO es: '+upn+'\n\n' +
      'Activa tu acceso y consulta una sola vez tu contraseña temporal:\n'+link+'\n\n' +
      'El enlace caduca en 48 horas. Microsoft solicitará cambiar la contraseña en el primer inicio.\n' +
      'No compartas tu clave. Si no solicitaste esta prueba, contacta a Informes.\n\n' +
      'Grupo Nostradamus';
    await save('enviando_bienvenida',{remitente:'informes@gruponostradamus.edu.pe'});
    await graph.mailStudent(email,'NostraM365 | Acceso institucional de ensayo',message);
    await save('bienvenida_aceptada',{bienvenidaEstado:'aceptada_por_exchange'});
    console.log('CUENTA CREADA:',upn);
    console.log('LICENCIA A1 ASIGNADA.');
    console.log('CORREO DE ENSAYO ACEPTADO POR MICROSOFT.');
    console.log('Revisa la bandeja personal y abre el enlace de activación.');
    console.log('No se modificó la preinscripción ni se activaron las matrículas generales.');
  } catch(err) {
    try {
      await save('requiere_revision',{motivo:failureCode(err),
        cuentaCreada:Boolean(userId),microsoftUserId:userId || ''});
    } catch {}
    console.error('ENSAYO INCOMPLETO: '+failureCode(err));
    console.error('Puede existir una cuenta parcialmente creada. NO repitas --execute.');
    process.exitCode=1;
  }
}
run().catch(err=>{
  console.error('PILOTO DETENIDO: '+failureCode(err));
  console.error('No repitas --execute sin revisar el estado.');
  process.exitCode=1;
});
