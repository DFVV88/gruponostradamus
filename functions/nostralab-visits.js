'use strict';
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const { getApps, getApp, initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { parseVisitRequest, hashSession, validatePreviousTotal } = require('./lib/nostralab-visit-utils');

// Público para que lo use GitHub Pages. CORS no sustituye la autenticación
// ni protege por sí solo de bots; una sesión es una visita aproximada.
const ORIGINS = [
  'https://gruponostradamus.edu.pe',
  'https://www.gruponostradamus.edu.pe',
  'https://dfvv88.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];
const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const DAY_MS = 24 * 60 * 60 * 1000;

exports.nostraLabVisits = onRequest({
  region: 'us-central1',
  invoker: 'public',
  cors: ORIGINS,
  timeoutSeconds: 15,
  memory: '256MiB',
  minInstances: 0,
  maxInstances: 5
}, async (req, res) => {
  res.set('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'METODO_INVALIDO' });

  // Sin datos personales: no se guardan IP, UA, nombres ni correos.
  const origin = String(req.get('origin') || '');
  if (!ORIGINS.includes(origin)) return res.status(403).json({ ok: false, error: 'ORIGEN_NO_PERMITIDO' });
  if (req.rawBody && req.rawBody.length > 512) {
    return res.status(413).json({ ok: false, error: 'SOLICITUD_DEMASIADO_GRANDE' });
  }

  let input;
  try {
    input = parseVisitRequest(req.body);
  } catch (err) {
    return res.status(err.status || 400).json({ ok: false, error: 'DATOS_INVALIDOS' });
  }

  try {
    const counterRef = db.collection('nostralab_visitas').doc(input.labId);
    const sessionRef = db.collection('nostralab_sesiones').doc(hashSession(input.labId, input.sessionId));

    const result = await db.runTransaction(async (tx) => {
      // Todas las lecturas preceden a las escrituras: garantiza idempotencia
      // ante peticiones concurrentes con el mismo token de sesión.
      const [counter, session] = await Promise.all([tx.get(counterRef), tx.get(sessionRef)]);
      const previous = validatePreviousTotal(counter.exists ? counter.data().total : 0);
      if (session.exists) return { total: previous, counted: false };
      const total = previous + 1;
      const now = Date.now();
      tx.set(counterRef, {
        total: total,
        labId: input.labId,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      tx.create(sessionRef, {
        labId: input.labId,
        createdAt: FieldValue.serverTimestamp(),
        expireAt: Timestamp.fromMillis(now + DAY_MS)
      });
      return { total, counted: true };
    });
    return res.status(200).json({ ok: true, labId: input.labId, ...result });
  } catch (err) {
    logger.error('NostraLAB: error al registrar visita', { labId: input.labId, code: err.code || 'INTERNAL' });
    return res.status(503).json({ ok: false, error: 'REGISTRO_NO_DISPONIBLE' });
  }
});
