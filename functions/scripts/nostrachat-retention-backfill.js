'use strict';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'nostrachat-grupo-nostradamus' });
}

const db = admin.firestore();
const APPLY = process.argv.includes('--apply');
const NOW = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

const ROOM_IDS = [
  'alumnos-general',
  'alumnos-matematica',
  'alumnos-fisica',
  'alumnos-quimica',
  'alumnos-aptitud-academica',
  'alumnos-humanidades',
  'externos-general',
  'externos-informes',
  'externos-orientacion-uni',
];

function timestampMillis(value) {
  return value && typeof value.toMillis === 'function' ? value.toMillis() : NOW;
}

function retentionDaysForMessage(data) {
  if (data && data.hasImage) return 10;
  return 30;
}

async function commitOperations(operations) {
  if (!APPLY || !operations.length) return;
  for (let index = 0; index < operations.length; index += 400) {
    const batch = db.batch();
    operations.slice(index, index + 400).forEach((operation) => {
      if (operation.type === 'delete') batch.delete(operation.ref);
      else batch.update(operation.ref, operation.data);
    });
    await batch.commit();
  }
}

async function planCollection(roomId, collectionName, retentionResolver) {
  const snapshot = await db.collection(`rooms/${roomId}/${collectionName}`).get();
  const operations = [];
  const stats = { scanned: 0, delete: 0, update: 0, pinned: 0 };

  snapshot.forEach((doc) => {
    stats.scanned += 1;
    const data = doc.data() || {};
    if (data.pinned === true) {
      stats.pinned += 1;
      return;
    }

    const retentionMs = retentionResolver(data) * DAY_MS;
    const expireAtMillis = timestampMillis(data.createdAt) + retentionMs;

    if (expireAtMillis <= NOW) {
      stats.delete += 1;
      operations.push({ type: 'delete', ref: doc.ref });
      return;
    }

    const currentExpireAt = data.expiresAt && typeof data.expiresAt.toMillis === 'function'
      ? data.expiresAt.toMillis()
      : 0;

    if (Math.abs(currentExpireAt - expireAtMillis) > 60 * 1000) {
      stats.update += 1;
      operations.push({
        type: 'update',
        ref: doc.ref,
        data: { expiresAt: admin.firestore.Timestamp.fromMillis(expireAtMillis) },
      });
    }
  });

  await commitOperations(operations);
  return stats;
}

async function planPresence(roomId) {
  const snapshot = await db.collection(`rooms/${roomId}/presence`).get();
  const operations = [];
  const stats = { scanned: 0, delete: 0, update: 0 };

  snapshot.forEach((doc) => {
    stats.scanned += 1;
    const data = doc.data() || {};
    const baseMillis = timestampMillis(data.lastSeen);
    const expireAtMillis = baseMillis + 5 * 60 * 1000;

    if (expireAtMillis <= NOW) {
      stats.delete += 1;
      operations.push({ type: 'delete', ref: doc.ref });
      return;
    }

    stats.update += 1;
    operations.push({
      type: 'update',
      ref: doc.ref,
      data: { expiresAt: admin.firestore.Timestamp.fromMillis(expireAtMillis) },
    });
  });

  await commitOperations(operations);
  return stats;
}

async function main() {
  console.log(`NostraCHAT retention backfill (${APPLY ? 'APPLY' : 'DRY RUN'})`);
  const totals = {
    messages: { scanned: 0, delete: 0, update: 0, pinned: 0 },
    reports: { scanned: 0, delete: 0, update: 0, pinned: 0 },
    presence: { scanned: 0, delete: 0, update: 0 },
  };

  for (const roomId of ROOM_IDS) {
    const messages = await planCollection(roomId, 'messages', retentionDaysForMessage);
    const reports = await planCollection(roomId, 'reports', () => 90);
    const presence = await planPresence(roomId);

    Object.keys(messages).forEach((key) => { totals.messages[key] += messages[key]; });
    Object.keys(reports).forEach((key) => { totals.reports[key] += reports[key]; });
    Object.keys(presence).forEach((key) => { totals.presence[key] += presence[key]; });

    console.log(roomId, { messages, reports, presence });
  }

  console.log('TOTALS', totals);
  if (!APPLY) {
    console.log('No se modificó Firestore. Ejecuta nuevamente con --apply después de revisar los totales.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
