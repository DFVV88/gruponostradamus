'use strict';

const INITIAL_TYPES = new Set([
  'matricula_y_primera_cuota',
  'solo_matricula',
  'primera_cuota',
  'pago_total'
]);

function clean(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function toCents(value) {
  const parsed = Number(String(value == null ? '' : value).replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function fromCents(value) {
  const cents = Number(value);
  return Number.isInteger(cents) && cents >= 0 ? cents / 100 : 0;
}

function promotionIsActive(plan, now = new Date()) {
  if (!plan || plan.promocionActiva !== true || toCents(plan.precioPromocional) <= 0) {
    return false;
  }

  const endText = clean(plan.promocionHasta);
  if (!endText) return true;

  // El negocio opera en Perú (UTC-05:00). La promoción vence al terminar el día local.
  const end = new Date(`${endText}T23:59:59-05:00`);
  return !Number.isNaN(end.getTime()) && end.getTime() >= now.getTime();
}

function defaultInitialType(type, enrollmentCents) {
  if (type === 'unico') return 'pago_total';
  return enrollmentCents > 0 ? 'matricula_y_primera_cuota' : 'primera_cuota';
}

function normalizeInitialType(value, type, enrollmentCents) {
  return INITIAL_TYPES.has(value)
    ? value
    : defaultInitialType(type, enrollmentCents);
}

function conceptLabel(value, type) {
  const labels = {
    matricula_y_primera_cuota: 'Matrícula + primera pensión',
    solo_matricula: 'Solo matrícula',
    primera_cuota: type === 'unico' ? 'Pago único del programa' : 'Primera pensión',
    pago_total: 'Pago completo del programa'
  };
  return labels[value] || labels[defaultInitialType(type, 0)];
}

function calculateOfficialPlan(plan, now = new Date()) {
  if (!plan || typeof plan !== 'object') {
    throw new Error('PLAN_INVALIDO');
  }

  const type = plan.tipoCobro === 'unico' ? 'unico' : 'mensual';
  const regularCents = toCents(plan.precio);
  const enrollmentCents = toCents(plan.matricula);
  const promoActive = promotionIsActive(plan, now);
  const promotionalCents = toCents(plan.precioPromocional);
  const appliedPriceCents = promoActive ? promotionalCents : regularCents;
  const initialType = normalizeInitialType(
    clean(plan.cobroInicial),
    type,
    enrollmentCents
  );

  let totalCents = appliedPriceCents;
  if (initialType === 'solo_matricula') totalCents = enrollmentCents;
  if (initialType === 'matricula_y_primera_cuota' || initialType === 'pago_total') {
    totalCents = enrollmentCents + appliedPriceCents;
  }

  if (regularCents <= 0 || appliedPriceCents <= 0 || totalCents <= 0) {
    throw new Error('MONTO_INVALIDO');
  }

  return {
    tipoCobro: type,
    cobroInicial: initialType,
    conceptoInicial: conceptLabel(initialType, type),
    promocionAplicada: promoActive,
    precioRegularCentimos: regularCents,
    precioPromocionalCentimos: promotionalCents,
    precioAplicadoCentimos: appliedPriceCents,
    matriculaCentimos: enrollmentCents,
    totalInicialCentimos: totalCents,
    precioRegular: fromCents(regularCents),
    precioPromocional: fromCents(promotionalCents),
    precioAplicado: fromCents(appliedPriceCents),
    matricula: fromCents(enrollmentCents),
    totalInicial: fromCents(totalCents),
    moneda: 'PEN'
  };
}

function findActivePlan(program, planId) {
  const plans = Array.isArray(program && program.planes) ? program.planes : [];
  const normalizedId = clean(planId);
  const plan = plans.find((item) => item && clean(item.id) === normalizedId);

  if (!plan || plan.activo === false) {
    throw new Error('PLAN_NO_DISPONIBLE');
  }

  return plan;
}

function laterPayments(plan, pricing) {
  const saved = clean(plan && plan.detallePagosPosteriores);
  if (saved) return saved;

  if (pricing.tipoCobro === 'unico') {
    if (pricing.cobroInicial === 'solo_matricula') {
      return 'Queda pendiente el pago único del programa.';
    }
    return 'No registra pagos posteriores por este plan.';
  }

  if (pricing.cobroInicial === 'solo_matricula') {
    return 'Primera pensión y pensiones mensuales según el cronograma académico.';
  }

  return 'Pensiones mensuales posteriores según el cronograma académico.';
}

module.exports = {
  clean,
  toCents,
  fromCents,
  calculateOfficialPlan,
  findActivePlan,
  laterPayments
};
