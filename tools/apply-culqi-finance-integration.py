#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text(encoding='utf-8')
    if new in text:
        return
    if old not in text:
        raise SystemExit(f'No se encontró {label} en {path}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')


def write_finance_helper() -> None:
    path = ROOT / 'functions/lib/culqi-finance.js'
    path.write_text(r'''\'use strict\';

function clean(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slug(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 55);
}

function peruDate(value) {
  let date;
  if (value instanceof Date) date = value;
  else if (Number.isFinite(Number(value)) && Number(value) > 0) date = new Date(Number(value) * 1000);
  else date = new Date();
  if (Number.isNaN(date.getTime())) date = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function groupFor(pre) {
  const parts = [
    pre && (pre.programaId || pre.ciclo) || 'programa',
    pre && pre.modalidad || 'presencial',
    pre && (pre.turno || pre.planNombre) || 'general',
    pre && (pre.planId || pre.planNombre) || 'plan'
  ];
  const id = parts.map(slug).filter(Boolean).join('__').slice(0, 190)
    || `grupo-${slug(pre && pre.ciclo || 'general')}`;
  const program = clean(pre && pre.ciclo || 'Programa');
  const turn = clean(pre && pre.turno || 'Turno por confirmar');
  const plan = clean(pre && pre.planNombre || 'Plan general');
  return {
    id,
    nombre: `${program} · ${plan} · ${turn}`,
    salonNombre: `${program} · ${turn}`
  };
}

function categoryFor(concept) {
  const text = normalize(concept);
  if (text.includes('matricula')) return 'matricula';
  if (text.includes('pension') || text.includes('cuota')) return 'pension';
  return 'otros_ingresos';
}

function buildCulqiFinanceIntegration({ preId, pre, amountCentimos, chargeId, concept, creationDate }) {
  const id = clean(preId);
  const charge = clean(chargeId);
  const cents = Math.max(0, Math.round(Number(amountCentimos) || 0));
  if (!id) throw new Error('PREINSCRIPCION_FINANZAS_INVALIDA');
  if (!/^chr_(?:test|live)_[A-Za-z0-9]+$/.test(charge)) throw new Error('CARGO_CULQI_FINANZAS_INVALIDO');
  if (cents <= 0) throw new Error('MONTO_CULQI_FINANZAS_INVALIDO');

  const amount = Math.round(cents) / 100;
  const baseConcept = clean(concept || pre && pre.conceptoPagoInicial || `Pago inicial de ${clean(pre && pre.ciclo)}`)
    .slice(0, 150) || 'Pago inicial Culqi';
  const group = groupFor(pre || {});
  const movementId = clean(pre && pre.ingresoFinancieroId) || `pago_${id}_inicial`;
  const date = peruDate(creationDate);
  const name = clean(pre && pre.nombre) || 'Alumno Grupo Nostradamus';
  const dni = clean(pre && pre.dni) || 'Sin DNI';
  const observation = [
    'Pago aprobado automáticamente por Culqi',
    `Alumno: ${name}`,
    `DNI: ${dni}`,
    `Preinscripción: ${id}`,
    `Cargo Culqi: ${charge}`
  ].join(' · ').slice(0, 1000);

  return {
    movementId,
    date,
    amount,
    group,
    movement: {
      tipo: 'ingreso',
      fechaOperacion: date,
      categoria: categoryFor(baseConcept),
      concepto: `${baseConcept} · ${name}`.slice(0, 160),
      monto: amount,
      metodoPago: 'culqi',
      cuenta: 'culqi',
      numeroOperacion: charge.slice(0, 100),
      observacion: observation,
      estado: 'activo',
      origen: 'pago_alumno_admin',
      creadoPor: 'sistema_culqi',
      pagoId: movementId,
      preinscripcionId: id,
      registroAlumnoId: id,
      matriculaId: id,
      grupoId: group.id,
      alumnoNombre: name.slice(0, 160),
      alumnoDni: dni.slice(0, 20),
      conceptoPago: baseConcept
    },
    prePatch: {
      montoPagoValidado: amount,
      fechaPagoValidado: date,
      cuentaPagoValidado: 'culqi',
      metodoPagoValidado: 'culqi',
      numeroOperacionPago: charge,
      ingresoFinancieroId: movementId,
      ingresoFinancieroGenerado: true,
      registroAlumnoId: id,
      matriculaId: id,
      grupoId: group.id,
      grupoNombre: group.nombre,
      salonNombre: group.salonNombre
    }
  };
}

module.exports = {
  buildCulqiFinanceIntegration,
  peruDate,
  groupFor
};
'''.replace("\\'use strict\\';", "'use strict';"), encoding='utf-8')


def write_test() -> None:
    path = ROOT / 'functions/test/culqi-finance.test.js'
    path.write_text(r'''\'use strict\';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCulqiFinanceIntegration, peruDate } = require('../lib/culqi-finance');

test('construye un ingreso Culqi idempotente y correctamente clasificado', () => {
  const result = buildCulqiFinanceIntegration({
    preId: 'PRE1234567890',
    pre: {
      nombre: 'Alumno Prueba Nostradamus',
      dni: '75040373',
      ciclo: 'NostraWEEKEND',
      programaId: 'nostra-weekend-uni',
      planId: 'dominical-virtual',
      planNombre: 'Dominical VIRTUAL',
      modalidad: 'Virtual',
      turno: 'Dominical'
    },
    amountCentimos: 20000,
    chargeId: 'chr_live_ABC123',
    concept: 'Matrícula + primera pensión',
    creationDate: new Date('2026-08-21T12:00:00Z')
  });

  assert.equal(result.movementId, 'pago_PRE1234567890_inicial');
  assert.equal(result.amount, 200);
  assert.equal(result.date, '2026-08-21');
  assert.equal(result.movement.metodoPago, 'culqi');
  assert.equal(result.movement.cuenta, 'culqi');
  assert.equal(result.movement.numeroOperacion, 'chr_live_ABC123');
  assert.equal(result.movement.categoria, 'matricula');
  assert.equal(result.prePatch.ingresoFinancieroId, result.movementId);
  assert.equal(result.prePatch.cuentaPagoValidado, 'culqi');
});

test('convierte la fecha del cargo a fecha Perú', () => {
  assert.equal(peruDate(new Date('2026-08-21T02:00:00Z')), '2026-08-20');
});
'''.replace("\\'use strict\\';", "'use strict';"), encoding='utf-8')


def patch_backend() -> None:
    path = ROOT / 'functions/backend.js'
    replace_once(
        path,
        """const {\n  normalizeDeviceFingerprint,\n  normalizeAuthentication3DS,\n  paymentContextHash\n} = require('./lib/culqi3ds');""",
        """const {\n  normalizeDeviceFingerprint,\n  normalizeAuthentication3DS,\n  paymentContextHash\n} = require('./lib/culqi3ds');\nconst { buildCulqiFinanceIntegration } = require('./lib/culqi-finance');""",
        'import de integración financiera Culqi'
    )
    replace_once(
        path,
        """      const summary = chargeSummary(data);\n      const batch = db.batch();""",
        """      const summary = chargeSummary(data);\n      const finance = buildCulqiFinanceIntegration({\n        preId,\n        pre: reserved.pre,\n        amountCentimos: summary.amount || amount,\n        chargeId: summary.id,\n        concept: reserved.selection.pricing.conceptoInicial,\n        creationDate: summary.creationDate\n      });\n      const batch = db.batch();""",
        'construcción del ingreso financiero Culqi'
    )
    replace_once(
        path,
        """        approvedAt: FieldValue.serverTimestamp(),\n        updatedAt: FieldValue.serverTimestamp()\n      });\n      batch.update(reserved.preRef, {""",
        """        approvedAt: FieldValue.serverTimestamp(),\n        updatedAt: FieldValue.serverTimestamp()\n      });\n      batch.set(db.collection('finanzas_movimientos').doc(finance.movementId), {\n        ...finance.movement,\n        createdAt: FieldValue.serverTimestamp(),\n        updatedAt: FieldValue.serverTimestamp()\n      }, { merge: true });\n      batch.update(reserved.preRef, {""",
        'alta automática del movimiento financiero'
    )
    replace_once(
        path,
        """        montoPagadoCentimos: summary.amount || amount,\n        monedaPago: 'PEN',\n        pagoValidadoAt: FieldValue.serverTimestamp(),""",
        """        montoPagadoCentimos: summary.amount || amount,\n        monedaPago: 'PEN',\n        ...finance.prePatch,\n        pagoValidadoAt: FieldValue.serverTimestamp(),""",
        'vinculación financiera en preinscripción'
    )


def patch_webhook() -> None:
    path = ROOT / 'functions/webhook.js'
    replace_once(
        path,
        """  verifiedChargeSummary\n} = require('./lib/culqi-webhook');""",
        """  verifiedChargeSummary\n} = require('./lib/culqi-webhook');\nconst { buildCulqiFinanceIntegration } = require('./lib/culqi-finance');""",
        'import financiero en webhook'
    )
    replace_once(
        path,
        """    if (eventClass === 'success') {\n      tx.update(attemptRef, {""",
        """    if (eventClass === 'success') {\n      const finance = buildCulqiFinanceIntegration({\n        preId: refs.preId,\n        pre,\n        amountCentimos: summary.amount,\n        chargeId: summary.id,\n        concept: clean(attempt.conceptoPago || pre.conceptoPagoInicial || `Pago inicial de ${clean(pre.ciclo)}`),\n        creationDate: summary.creationDate\n      });\n      tx.set(db.collection('finanzas_movimientos').doc(finance.movementId), {\n        ...finance.movement,\n        createdAt: FieldValue.serverTimestamp(),\n        updatedAt: FieldValue.serverTimestamp()\n      }, { merge: true });\n      tx.update(attemptRef, {""",
        'conciliación financiera en webhook'
    )
    replace_once(
        path,
        """        montoPagadoCentimos: summary.amount,\n        monedaPago: 'PEN',\n        confirmadoPorWebhook: true,""",
        """        montoPagadoCentimos: summary.amount,\n        monedaPago: 'PEN',\n        ...finance.prePatch,\n        confirmadoPorWebhook: true,""",
        'vinculación financiera del webhook'
    )


def patch_admin_payments() -> None:
    path = ROOT / 'assets/js/admin-pagos-matriculas.js'
    replace_once(
        path,
        """function paymentAmount(record){\n  return num(record?.montoPagoValidado || record?.montoPagoInicial || record?.totalInicial || record?.precioReferencia || 0);\n}""",
        """function paymentAmount(record){\n  const culqiCentimos = Number(record?.montoPagadoCentimos || 0);\n  return num(record?.montoPagoValidado || (culqiCentimos > 0 ? culqiCentimos / 100 : 0) || record?.montoPagoInicial || record?.totalInicial || record?.precioReferencia || 0);\n}\n\nfunction isValidatedCulqi(record){\n  const paid = record?.pagoValidado === true || record?.estadoPago === 'pago_validado';\n  return paid && /^chr_(?:test|live)_[A-Za-z0-9]+$/.test(clean(record?.culqiChargeId));\n}\n\nfunction peruDateFrom(value){\n  let date = null;\n  if(value && typeof value.toDate === 'function') date = value.toDate();\n  else if(value instanceof Date) date = value;\n  else if(Number.isFinite(Number(value)) && Number(value) > 0) date = new Date(Number(value) * 1000);\n  if(!date || Number.isNaN(date.getTime())) return '';\n  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);\n  const map = Object.fromEntries(parts.map(part => [part.type,part.value]));\n  return `${map.year}-${map.month}-${map.day}`;\n}\n\nfunction paymentDate(record){\n  const explicit = clean(record?.fechaPagoValidado);\n  if(/^\\d{4}-\\d{2}-\\d{2}$/.test(explicit)) return explicit;\n  return peruDateFrom(record?.pagoValidadoAt)\n    || peruDateFrom(record?.culqiResumen?.creationDate || record?.culqiResumen?.creation_date)\n    || todayIso();\n}""",
        'lectura correcta de monto y fecha Culqi'
    )

    marker = """async function loadAll(){\n  if(!currentUser || !setup() || syncing) return;"""
    insertion = """async function reconcileExistingCulqiFinance(){\n  if(!currentUser) return 0;\n  const candidates = preinscriptions.filter(record => isValidatedCulqi(record) && !clean(record.ingresoFinancieroId));\n  let reconciled = 0;\n\n  for(const record of candidates){\n    try{\n      const amount = paymentAmount(record);\n      const chargeId = clean(record.culqiChargeId);\n      if(amount <= 0 || !chargeId) continue;\n      const movementId = `pago_${record.id}_inicial`;\n      const movementRef = doc(db,FINANCE_COLLECTION,movementId);\n      const existingMovement = await getDoc(movementRef);\n      const group = groupFor(record);\n      const date = paymentDate(record);\n      const conceptBase = (clean(record.conceptoPagoInicial) || `Pago inicial de ${clean(record.ciclo)}`).slice(0,150);\n      const email = currentUser.email || ADMIN_EMAIL;\n      const patch = {\n        montoPagoValidado:amount,\n        fechaPagoValidado:date,\n        cuentaPagoValidado:'culqi',\n        metodoPagoValidado:'culqi',\n        numeroOperacionPago:chargeId,\n        ingresoFinancieroId:movementId,\n        ingresoFinancieroGenerado:true,\n        registroAlumnoId:record.id,\n        matriculaId:record.id,\n        grupoId:group.id,\n        grupoNombre:group.nombre,\n        salonNombre:group.salonNombre,\n        updatedAt:serverTimestamp()\n      };\n      const batch = writeBatch(db);\n\n      if(!existingMovement.exists()){\n        batch.set(movementRef,{\n          tipo:'ingreso',\n          fechaOperacion:date,\n          categoria:categoryFor(record,''),\n          concepto:`${conceptBase} · ${clean(record.nombre)}`.slice(0,160),\n          monto:amount,\n          metodoPago:'culqi',\n          cuenta:'culqi',\n          numeroOperacion:chargeId,\n          observacion:[\n            'Conciliación automática de pago Culqi',\n            `Alumno: ${clean(record.nombre)}`,\n            `DNI: ${clean(record.dni)}`,\n            `Preinscripción: ${record.id}`,\n            `Cargo Culqi: ${chargeId}`\n          ].join(' · ').slice(0,1000),\n          estado:'activo',\n          origen:'pago_alumno_admin',\n          creadoPor:email,\n          pagoId:movementId,\n          preinscripcionId:record.id,\n          registroAlumnoId:record.id,\n          matriculaId:record.id,\n          grupoId:group.id,\n          alumnoNombre:clean(record.nombre).slice(0,160),\n          alumnoDni:clean(record.dni).slice(0,20),\n          conceptoPago:conceptBase,\n          createdAt:serverTimestamp(),\n          updatedAt:serverTimestamp()\n        });\n      }\n\n      batch.update(doc(db,PRE_COLLECTION,record.id),patch);\n      batch.set(doc(db,GROUP_COLLECTION,group.id),{\n        ...group,\n        actualizadoPor:email,\n        updatedAt:serverTimestamp()\n      },{merge:true});\n      await batch.commit();\n      Object.assign(record,patch);\n      reconciled += 1;\n    }catch(error){\n      console.warn('No se pudo conciliar automáticamente un pago Culqi existente:',record.id,error);\n    }\n  }\n  return reconciled;\n}\n\nasync function loadAll(){\n  if(!currentUser || !setup() || syncing) return;"""
    replace_once(path, marker, insertion, 'conciliación de pagos Culqi existentes')

    replace_once(
        path,
        """    studentRecords = studentSnapshot.docs.map(item => ({id:item.id,...item.data()}));\n    await syncAcademicRecords();\n    renderPanel();\n    const missing = preinscriptions.filter(item => studentStatus(item) === 'pago_validado' && !clean(item.ingresoFinancieroId)).length;\n    setMessage('npm-message',missing ? 'info' : 'ok',missing\n      ? `${missing} pago${missing === 1 ? '' : 's'} validado${missing === 1 ? '' : 's'} requiere${missing === 1 ? '' : 'n'} regularización financiera.`\n      : 'Alumnos, matrículas y grupos actualizados.');""",
        """    studentRecords = studentSnapshot.docs.map(item => ({id:item.id,...item.data()}));\n    const culqiReconciled = await reconcileExistingCulqiFinance();\n    await syncAcademicRecords();\n    renderPanel();\n    const missing = preinscriptions.filter(item => studentStatus(item) === 'pago_validado' && !clean(item.ingresoFinancieroId)).length;\n    setMessage('npm-message',missing ? 'info' : 'ok',missing\n      ? `${missing} pago${missing === 1 ? '' : 's'} validado${missing === 1 ? '' : 's'} requiere${missing === 1 ? '' : 'n'} regularización financiera.`\n      : (culqiReconciled\n        ? `${culqiReconciled} pago${culqiReconciled === 1 ? '' : 's'} Culqi conciliado${culqiReconciled === 1 ? '' : 's'} automáticamente con Finanzas.`\n        : 'Alumnos, matrículas y grupos actualizados.'));""",
        'ejecución automática de conciliación Culqi'
    )

    replace_once(
        path,
        """    document.getElementById('npm-payment-date').value = clean(paymentRecord.fechaPagoValidado) || todayIso();\n    document.getElementById('npm-payment-category').value = categoryFor(paymentRecord,'');\n    document.getElementById('npm-payment-account').value = clean(paymentRecord.cuentaPagoValidado) || 'yape';\n    document.getElementById('npm-payment-concept').value = clean(paymentRecord.conceptoPagoInicial) || `Pago inicial de ${clean(paymentRecord.ciclo)}`;\n    document.getElementById('npm-payment-operation').value = clean(paymentRecord.numeroOperacionPago);""",
        """    document.getElementById('npm-payment-date').value = paymentDate(paymentRecord);\n    document.getElementById('npm-payment-category').value = categoryFor(paymentRecord,'');\n    document.getElementById('npm-payment-account').value = clean(paymentRecord.cuentaPagoValidado) || (isValidatedCulqi(paymentRecord) ? 'culqi' : 'yape');\n    document.getElementById('npm-payment-concept').value = clean(paymentRecord.conceptoPagoInicial) || `Pago inicial de ${clean(paymentRecord.ciclo)}`;\n    document.getElementById('npm-payment-operation').value = clean(paymentRecord.numeroOperacionPago) || (isValidatedCulqi(paymentRecord) ? clean(paymentRecord.culqiChargeId) : '');""",
        'valores correctos del modal de regularización'
    )


def patch_cache_versions() -> None:
    plan = ROOT / 'assets/js/admin-plan-display.js'
    text = plan.read_text(encoding='utf-8')
    text = text.replace("import './admin-pagos-matriculas.js?v=2026-08-02-1';", "import './admin-pagos-matriculas.js?v=2026-08-21-culqi-finance-1';")
    plan.write_text(text, encoding='utf-8')

    html = ROOT / 'admin-preinscripciones.html'
    text = html.read_text(encoding='utf-8')
    text = text.replace('admin-plan-display.js?v=2026-07', 'admin-plan-display.js?v=2026-08-21-culqi-finance-1')
    html.write_text(text, encoding='utf-8')


def patch_package_check() -> None:
    path = ROOT / 'functions/package.json'
    text = path.read_text(encoding='utf-8')
    old = 'node --check lib/culqi-webhook.js && node --check scripts/nostrachat-retention-backfill.js'
    new = 'node --check lib/culqi-webhook.js && node --check lib/culqi-finance.js && node --check scripts/nostrachat-retention-backfill.js'
    if new not in text:
        if old not in text:
            raise SystemExit('No se encontró scripts.check en functions/package.json')
        text = text.replace(old,new,1)
    path.write_text(text, encoding='utf-8')


def main() -> None:
    write_finance_helper()
    write_test()
    patch_backend()
    patch_webhook()
    patch_admin_payments()
    patch_cache_versions()
    patch_package_check()
    print('Integración Culqi → Finanzas aplicada.')


if __name__ == '__main__':
    main()
