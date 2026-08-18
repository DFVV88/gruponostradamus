'use strict';

const crypto = require('crypto');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const { getApps, getApp, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { PublicError, clean, bodyOf, requirePost, send } = require('./lib/common');

const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const adminAuth = getAuth(app);

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const LIMA_TZ = 'America/Lima';
const DNI_RE = /^\d{8,12}$/;
const TOKEN_RE = /^[a-f0-9]{48}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const ALLOWED_TYPES = new Set(['alumno', 'docente', 'administrativo']);
const ALLOWED_ORIGINS = [
  'https://gruponostradamus.edu.pe',
  'https://www.gruponostradamus.edu.pe',
  'https://dfvv88.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];
const OPTIONS = {
  region: 'us-central1',
  cors: ALLOWED_ORIGINS,
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 20
};

function fail(res, error, context) {
  if (error instanceof PublicError) {
    return send(res, error.status, { error: error.code, message: error.message });
  }
  logger.error(context, error);
  return send(res, 500, { error: 'ERROR_INTERNO', message: 'No se pudo completar la operación.' });
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

function safeText(value, max = 120) {
  return clean(value).slice(0, max);
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function limaClock(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: LIMA_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  const weekdayName = new Intl.DateTimeFormat('en-US', { timeZone: LIMA_TZ, weekday: 'short' }).format(date);
  const weekday = ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 })[weekdayName];
  return {
    fecha: `${parts.year}-${parts.month}-${parts.day}`,
    hora: `${parts.hour}:${parts.minute}`,
    horaCompleta: `${parts.hour}:${parts.minute}:${parts.second}`,
    minutos: Number(parts.hour) * 60 + Number(parts.minute),
    weekday
  };
}

function minutesOf(time) {
  if (!TIME_RE.test(time || '')) return null;
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function timestampIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function serialize(value) {
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value.toDate === 'function') return timestampIso(value);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
  }
  return value;
}

async function requireAdmin(req) {
  const header = clean(req.headers.authorization);
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) throw new PublicError(401, 'LOGIN_REQUERIDO', 'Debes iniciar sesión como administrador.');
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(match[1]);
  } catch (_) {
    throw new PublicError(401, 'SESION_INVALIDA', 'La sesión administrativa ya no es válida.');
  }
  const email = clean(decoded.email).toLowerCase();
  if (!decoded.email_verified || email !== ADMIN_EMAIL) {
    throw new PublicError(403, 'NO_AUTORIZADO', 'Esta cuenta no tiene acceso al control de asistencia.');
  }
  return { uid: decoded.uid, email };
}

async function getGeneralConfig() {
  const snap = await db.collection('asistencia_config').doc('general').get();
  const data = snap.exists ? snap.data() : {};
  return {
    activo: data.activo !== false,
    sede: safeText(data.sede || 'Sede principal', 100),
    publicBaseUrl: 'https://gruponostradamus.edu.pe/asistencia',
    horaGeneral: TIME_RE.test(data.horaGeneral || '') ? data.horaGeneral : '08:00',
    toleranciaGeneral: clamp(data.toleranciaGeneral, 0, 120, 10),
    qrRotacionSegundos: clamp(data.qrRotacionSegundos, 30, 300, 60),
    qrVigenciaSegundos: clamp(data.qrVigenciaSegundos, 45, 600, 120),
    duplicateWindowMinutes: clamp(data.duplicateWindowMinutes, 1, 60, 5),
    modoRegistro: data.modoRegistro === 'entrada_salida' ? 'entrada_salida' : 'entrada',
    minSalidaMinutos: clamp(data.minSalidaMinutos, 15, 720, 45)
  };
}

function normalizeRule(type, data = {}) {
  return {
    id: type,
    tipoPersona: type,
    activo: data.activo !== false,
    horaIngreso: TIME_RE.test(data.horaIngreso || '') ? data.horaIngreso : '08:00',
    toleranciaMinutos: clamp(data.toleranciaMinutos, 0, 120, type === 'docente' ? 5 : 10),
    modoRegistro: data.modoRegistro === 'entrada_salida' ? 'entrada_salida' : '',
    updatedAt: data.updatedAt || null
  };
}

async function getRules() {
  const types = ['alumno', 'docente', 'administrativo'];
  const snapshots = await Promise.all(types.map(type => db.collection('asistencia_reglas').doc(type).get()));
  return Object.fromEntries(types.map((type, index) => [type, normalizeRule(type, snapshots[index].exists ? snapshots[index].data() : {})]));
}

async function resolvePerson(dni) {
  const directorySnap = await db.collection('asistencia_personas').where('dni', '==', dni).limit(1).get();
  if (!directorySnap.empty) {
    const doc = directorySnap.docs[0];
    const data = doc.data();
    if (data.activo !== false) {
      return {
        id: doc.id,
        nombre: safeText(data.nombre || 'Persona registrada', 140),
        tipo: ALLOWED_TYPES.has(data.tipo) ? data.tipo : 'administrativo',
        origen: 'asistencia_personas',
        detalle: safeText(data.detalle || data.cargo || data.grupo || '', 140),
        ciclo: safeText(data.ciclo || '', 120)
      };
    }
  }

  const teacherSnap = await db.collection('finanzas_docentes').where('numeroDocumento', '==', dni).limit(1).get();
  if (!teacherSnap.empty) {
    const doc = teacherSnap.docs[0];
    const data = doc.data();
    if (data.estado !== 'inactivo') {
      return {
        id: doc.id,
        nombre: safeText(data.nombre || 'Docente', 140),
        tipo: 'docente',
        origen: 'finanzas_docentes',
        detalle: safeText(data.cursoPrincipal || '', 140),
        ciclo: ''
      };
    }
  }

  const studentSnap = await db.collection('preinscripciones').where('dni', '==', dni).limit(1).get();
  if (!studentSnap.empty) {
    const doc = studentSnap.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      nombre: safeText(data.nombre || 'Alumno', 140),
      tipo: 'alumno',
      origen: 'preinscripciones',
      detalle: safeText(data.grupoId || data.turno || '', 140),
      ciclo: safeText(data.ciclo || data.programaNombre || '', 120)
    };
  }
  return null;
}

async function upsertProvisional(dni) {
  const ref = db.collection('asistencia_personas_provisionales').doc(hash(dni));
  const snap = await ref.get();
  if (snap.exists) {
    await ref.update({ lastSeenAt: FieldValue.serverTimestamp(), registros: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
  } else {
    await ref.set({
      dni,
      estado: 'pendiente',
      nombre: '',
      tipo: '',
      origenVinculado: '',
      personaId: '',
      registros: 1,
      firstSeenAt: FieldValue.serverTimestamp(),
      lastSeenAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  return ref.id;
}

function attendanceStatus(clock, rule, config) {
  const expected = minutesOf(rule && rule.activo ? rule.horaIngreso : config.horaGeneral);
  const tolerance = rule && rule.activo ? rule.toleranciaMinutos : config.toleranciaGeneral;
  const rawLate = expected == null ? 0 : Math.max(0, clock.minutos - expected);
  return {
    horaProgramada: expected == null ? '' : `${String(Math.floor(expected / 60)).padStart(2, '0')}:${String(expected % 60).padStart(2, '0')}`,
    toleranciaMinutos: tolerance,
    minutosRetrasoReal: rawLate,
    minutosTardanza: rawLate > tolerance ? rawLate : 0,
    estado: expected == null ? 'sin_horario' : (rawLate > tolerance ? 'tardanza' : 'puntual')
  };
}

async function validateToken(token) {
  if (!TOKEN_RE.test(token)) throw new PublicError(400, 'QR_INVALIDO', 'El código QR no es válido. Escanea el código actual.');
  const ref = db.collection('asistencia_tokens').doc(token);
  const snap = await ref.get();
  if (!snap.exists) throw new PublicError(410, 'QR_EXPIRADO', 'Este QR ya no está vigente. Escanea el código actual.');
  const data = snap.data();
  const expiresMs = data.expiresAt && typeof data.expiresAt.toMillis === 'function' ? data.expiresAt.toMillis() : 0;
  if (data.activo === false || expiresMs <= Date.now()) {
    throw new PublicError(410, 'QR_EXPIRADO', 'Este QR ya venció. Escanea el código actual.');
  }
  return { ref, data };
}

async function registerAttendance(dni, token) {
  const tokenInfo = await validateToken(token);
  const config = await getGeneralConfig();
  if (!config.activo) throw new PublicError(503, 'ASISTENCIA_PAUSADA', 'El registro de asistencia está temporalmente pausado.');

  const [person, rules] = await Promise.all([resolvePerson(dni), getRules()]);
  const provisionalId = person ? '' : await upsertProvisional(dni);
  const type = person ? person.tipo : '';
  const rule = type && rules[type] ? rules[type] : null;
  const clock = limaClock();
  const timing = attendanceStatus(clock, rule, config);
  const recordId = hash(`${clock.fecha}|${dni}`);
  const ref = db.collection('asistencia_registros').doc(recordId);
  const now = Timestamp.now();
  const mode = (rule && rule.modoRegistro) || config.modoRegistro;

  const result = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      const data = {
        registroId: recordId,
        fecha: clock.fecha,
        dni,
        personaId: person ? person.id : '',
        nombre: person ? person.nombre : '',
        tipo: type,
        origenPersona: person ? person.origen : 'provisional',
        provisionalId,
        estadoVinculacion: person ? 'vinculado' : 'pendiente',
        ciclo: person ? person.ciclo : '',
        detalle: person ? person.detalle : '',
        sede: safeText(tokenInfo.data.sede || config.sede, 100),
        fuenteRegistro: 'qr_dni',
        entradaAt: now,
        entradaHora: clock.horaCompleta,
        salidaAt: null,
        salidaHora: '',
        horaProgramada: timing.horaProgramada,
        toleranciaMinutos: timing.toleranciaMinutos,
        minutosRetrasoReal: timing.minutosRetrasoReal,
        minutosTardanza: timing.minutosTardanza,
        estado: timing.estado,
        modoRegistro: mode,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      tx.set(ref, data);
      tx.update(tokenInfo.ref, { usos: FieldValue.increment(1), lastUsedAt: FieldValue.serverTimestamp() });
      return { movimiento: 'entrada', duplicate: false, data };
    }

    const current = snap.data();
    const entryMs = current.entradaAt && typeof current.entradaAt.toMillis === 'function' ? current.entradaAt.toMillis() : now.toMillis();
    const elapsedMinutes = Math.max(0, Math.floor((now.toMillis() - entryMs) / 60000));
    if (elapsedMinutes < config.duplicateWindowMinutes) {
      return { movimiento: 'duplicado', duplicate: true, data: current };
    }
    if (mode === 'entrada_salida' && !current.salidaAt && elapsedMinutes >= config.minSalidaMinutos) {
      tx.update(ref, {
        salidaAt: now,
        salidaHora: clock.horaCompleta,
        updatedAt: FieldValue.serverTimestamp()
      });
      tx.update(tokenInfo.ref, { usos: FieldValue.increment(1), lastUsedAt: FieldValue.serverTimestamp() });
      return { movimiento: 'salida', duplicate: false, data: { ...current, salidaHora: clock.horaCompleta } };
    }
    return { movimiento: 'duplicado', duplicate: true, data: current };
  });

  return {
    movimiento: result.movimiento,
    duplicado: result.duplicate,
    fecha: clock.fecha,
    hora: result.movimiento === 'salida' ? (result.data.salidaHora || clock.horaCompleta) : (result.data.entradaHora || clock.horaCompleta),
    estado: result.data.estado || timing.estado,
    minutosTardanza: Number(result.data.minutosTardanza || 0),
    persona: person ? { nombre: person.nombre, tipo: person.tipo, ciclo: person.ciclo, detalle: person.detalle } : null,
    pendienteVinculacion: !person
  };
}

exports.asistenciaRegistrar = onRequest(OPTIONS, async (req, res) => {
  try {
    requirePost(req);
    const body = bodyOf(req);
    const dni = clean(body.dni).replace(/\D/g, '');
    const token = clean(body.token).toLowerCase();
    if (!DNI_RE.test(dni)) throw new PublicError(400, 'DNI_INVALIDO', 'Ingresa un DNI válido.');
    const result = await registerAttendance(dni, token);
    return send(res, 200, { asistencia: result });
  } catch (error) {
    return fail(res, error, 'Error registrando asistencia');
  }
});

async function adminState(dateKey) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateKey || '') ? dateKey : limaClock().fecha;
  const [config, rules, recordsSnap, pendingSnap, peopleSnap] = await Promise.all([
    getGeneralConfig(),
    getRules(),
    db.collection('asistencia_registros').where('fecha', '==', date).limit(1500).get(),
    db.collection('asistencia_personas_provisionales').where('estado', '==', 'pendiente').limit(250).get(),
    db.collection('asistencia_personas').limit(500).get()
  ]);
  const records = recordsSnap.docs.map(doc => ({ id: doc.id, ...serialize(doc.data()) }))
    .sort((a, b) => String(b.entradaHora || '').localeCompare(String(a.entradaHora || '')));
  const pending = pendingSnap.docs.map(doc => ({ id: doc.id, ...serialize(doc.data()) }))
    .sort((a, b) => String(b.lastSeenAt || '').localeCompare(String(a.lastSeenAt || '')));
  const people = peopleSnap.docs.map(doc => ({ id: doc.id, ...serialize(doc.data()) }))
    .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es'));
  return { date, config, rules, records, pending, people };
}

async function saveConfig(body, admin) {
  const configInput = body.config || {};
  const publicBaseUrl = 'https://gruponostradamus.edu.pe/asistencia';
  const config = {
    activo: configInput.activo !== false,
    sede: safeText(configInput.sede || 'Sede principal', 100),
    publicBaseUrl,
    horaGeneral: TIME_RE.test(configInput.horaGeneral || '') ? configInput.horaGeneral : '08:00',
    toleranciaGeneral: clamp(configInput.toleranciaGeneral, 0, 120, 10),
    qrRotacionSegundos: clamp(configInput.qrRotacionSegundos, 30, 300, 60),
    qrVigenciaSegundos: clamp(configInput.qrVigenciaSegundos, 45, 600, 120),
    duplicateWindowMinutes: clamp(configInput.duplicateWindowMinutes, 1, 60, 5),
    modoRegistro: configInput.modoRegistro === 'entrada_salida' ? 'entrada_salida' : 'entrada',
    minSalidaMinutos: clamp(configInput.minSalidaMinutos, 15, 720, 45),
    actualizadoPor: admin.email,
    updatedAt: FieldValue.serverTimestamp()
  };
  await db.collection('asistencia_config').doc('general').set(config, { merge: true });

  const batch = db.batch();
  for (const type of ['alumno', 'docente', 'administrativo']) {
    const input = (body.rules && body.rules[type]) || {};
    const rule = {
      tipoPersona: type,
      activo: input.activo !== false,
      horaIngreso: TIME_RE.test(input.horaIngreso || '') ? input.horaIngreso : '08:00',
      toleranciaMinutos: clamp(input.toleranciaMinutos, 0, 120, type === 'docente' ? 5 : 10),
      modoRegistro: input.modoRegistro === 'entrada_salida' ? 'entrada_salida' : '',
      actualizadoPor: admin.email,
      updatedAt: FieldValue.serverTimestamp()
    };
    batch.set(db.collection('asistencia_reglas').doc(type), rule, { merge: true });
  }
  await batch.commit();
  return { config: await getGeneralConfig(), rules: await getRules() };
}

async function createToken(admin) {
  const config = await getGeneralConfig();
  if (!config.activo) throw new PublicError(409, 'ASISTENCIA_PAUSADA', 'Activa el registro de asistencia antes de abrir el terminal.');
  const token = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + config.qrVigenciaSegundos * 1000);
  await db.collection('asistencia_tokens').doc(token).set({
    token,
    sede: config.sede,
    activo: true,
    usos: 0,
    expiresAt,
    creadoPor: admin.email,
    createdAt: FieldValue.serverTimestamp(),
    lastUsedAt: null
  });
  const separator = config.publicBaseUrl.includes('?') ? '&' : '?';
  return {
    token,
    url: `${config.publicBaseUrl}${separator}token=${token}`,
    expiresAt: expiresAt.toDate().toISOString(),
    rotateAfterSeconds: config.qrRotacionSegundos
  };
}

async function createPerson(body, admin) {
  const dni = clean(body.dni).replace(/\D/g, '');
  const nombre = safeText(body.nombre, 140);
  const tipo = clean(body.tipo).toLowerCase();
  if (!DNI_RE.test(dni)) throw new PublicError(400, 'DNI_INVALIDO', 'Ingresa un DNI válido.');
  if (nombre.length < 3) throw new PublicError(400, 'NOMBRE_INVALIDO', 'Ingresa el nombre completo.');
  if (!ALLOWED_TYPES.has(tipo)) throw new PublicError(400, 'TIPO_INVALIDO', 'Selecciona alumno, docente o administrativo.');
  const ref = db.collection('asistencia_personas').doc(hash(dni));
  await ref.set({
    dni,
    nombre,
    tipo,
    detalle: safeText(body.detalle, 140),
    ciclo: safeText(body.ciclo, 120),
    activo: true,
    origen: 'directorio_asistencia_admin',
    creadoPor: admin.email,
    actualizadoPor: admin.email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  return { id: ref.id, dni, nombre, tipo };
}

async function crossPending(admin) {
  const pendingSnap = await db.collection('asistencia_personas_provisionales').where('estado', '==', 'pendiente').limit(40).get();
  let linked = 0;
  let stillPending = 0;
  for (const provisionalDoc of pendingSnap.docs) {
    const provisional = provisionalDoc.data();
    const dni = clean(provisional.dni);
    const person = DNI_RE.test(dni) ? await resolvePerson(dni) : null;
    if (!person) {
      stillPending += 1;
      continue;
    }
    await provisionalDoc.ref.update({
      estado: 'vinculado',
      personaId: person.id,
      nombre: person.nombre,
      tipo: person.tipo,
      origenVinculado: person.origen,
      vinculadoPor: admin.email,
      linkedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    const recordsSnap = await db.collection('asistencia_registros').where('dni', '==', dni).limit(300).get();
    const batch = db.batch();
    recordsSnap.docs.forEach(record => batch.update(record.ref, {
      personaId: person.id,
      nombre: person.nombre,
      tipo: person.tipo,
      origenPersona: person.origen,
      estadoVinculacion: 'vinculado',
      ciclo: person.ciclo || '',
      detalle: person.detalle || '',
      vinculadoPor: admin.email,
      updatedAt: FieldValue.serverTimestamp()
    }));
    if (!recordsSnap.empty) await batch.commit();
    linked += 1;
  }
  return { revisados: pendingSnap.size, vinculados: linked, pendientes: stillPending };
}

exports.asistenciaAdmin = onRequest(OPTIONS, async (req, res) => {
  try {
    requirePost(req);
    const admin = await requireAdmin(req);
    const body = bodyOf(req);
    const action = clean(body.action);
    if (action === 'state') return send(res, 200, { data: await adminState(clean(body.date)) });
    if (action === 'save_config') return send(res, 200, { data: await saveConfig(body, admin) });
    if (action === 'create_token') return send(res, 200, { data: await createToken(admin) });
    if (action === 'create_person') return send(res, 200, { data: await createPerson(body, admin) });
    if (action === 'cross_pending') return send(res, 200, { data: await crossPending(admin) });
    throw new PublicError(400, 'ACCION_INVALIDA', 'La acción administrativa no es válida.');
  } catch (error) {
    return fail(res, error, 'Error en administración de asistencia');
  }
});
