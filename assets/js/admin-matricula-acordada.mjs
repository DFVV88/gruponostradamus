/* Ajustes administrativos individuales. Los importes del tarifario y los cobros son inmutables. */
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
const numberOrZero = value => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.round(num * 100) / 100 : 0;
};

export function matriculaOriginal(record = {}) {
  if (hasOwn(record, 'matriculaReferencia')) return numberOrZero(record.matriculaReferencia);
  return numberOrZero(record.tarifarioSnapshot?.matricula);
}

export function matriculaAcordada(record = {}) {
  if (hasOwn(record, 'matriculaAcordada')) return numberOrZero(record.matriculaAcordada);
  return matriculaOriginal(record);
}

export function tieneMatriculaPersonalizada(record = {}) {
  return hasOwn(record, 'matriculaAcordada');
}

export function puedeAjustarMatricula(record = {}) {
  // Culqi determina el cargo en backend a partir del tarifario original.
  // Nunca mostrar un descuento administrativo como si modificase un cargo online.
  if (record.metodoPagoPreferido === 'pago_online' || record.estadoPago === 'pendiente_pago_online') return false;
  if (record.intentoPagoCreado === true || record.pagoValidado === true || record.estadoPago === 'pago_validado') return false;
  if (numberOrZero(record.montoPagoValidado) > 0 || numberOrZero(record.montoPagadoCentimos) > 0) return false;
  if (record.culqiChargeId || record.ingresoFinancieroId) return false;
  return true;
}

export function pagoInicialAcordado(record = {}, totalInicial = 0) {
  const original = numberOrZero(totalInicial);
  // Solo se propone el nuevo monto en validaciones MANUALES pendientes.
  // No tocar montos del backend, cargos existentes ni pagos confirmados.
  if (!tieneMatriculaPersonalizada(record) || !puedeAjustarMatricula(record)) return original;
  const mode = record.cobroInicial || record.tarifarioSnapshot?.cobroInicial;
  if (!['solo_matricula','matricula_y_primera_cuota','pago_total'].includes(mode)) return original;
  return Math.max(0,Math.round((original + matriculaAcordada(record) - matriculaOriginal(record)) * 100) / 100);
}

export function leerMatriculaAcordada(value) {
  const raw = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new Error('La matrícula debe ser un importe válido con máximo dos decimales.');
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) {
    throw new Error('La matrícula acordada debe estar entre S/ 0.00 y S/ 100,000.00.');
  }
  return Math.round(parsed * 100) / 100;
}
