'use strict';

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
