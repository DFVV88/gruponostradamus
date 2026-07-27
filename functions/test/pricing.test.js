'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateOfficialPlan } = require('../lib/pricing');

const NOW = new Date('2026-07-27T12:00:00-05:00');

test('calcula matrícula más primera pensión', () => {
  const result = calculateOfficialPlan({
    tipoCobro: 'mensual',
    precio: 400,
    matricula: 50,
    cobroInicial: 'matricula_y_primera_cuota',
    promocionActiva: false
  }, NOW);

  assert.equal(result.precioAplicadoCentimos, 40000);
  assert.equal(result.matriculaCentimos, 5000);
  assert.equal(result.totalInicialCentimos, 45000);
  assert.equal(result.conceptoInicial, 'Matrícula + primera pensión');
});

test('aplica promoción vigente usando la fecha de Perú', () => {
  const result = calculateOfficialPlan({
    tipoCobro: 'mensual',
    precio: 500,
    matricula: 50,
    cobroInicial: 'matricula_y_primera_cuota',
    promocionActiva: true,
    precioPromocional: 420,
    promocionHasta: '2026-07-27'
  }, NOW);

  assert.equal(result.promocionAplicada, true);
  assert.equal(result.precioAplicadoCentimos, 42000);
  assert.equal(result.totalInicialCentimos, 47000);
});

test('ignora una promoción vencida', () => {
  const result = calculateOfficialPlan({
    tipoCobro: 'mensual',
    precio: 500,
    matricula: 50,
    cobroInicial: 'matricula_y_primera_cuota',
    promocionActiva: true,
    precioPromocional: 420,
    promocionHasta: '2026-07-26'
  }, NOW);

  assert.equal(result.promocionAplicada, false);
  assert.equal(result.totalInicialCentimos, 55000);
});

test('permite cobrar solo matrícula', () => {
  const result = calculateOfficialPlan({
    tipoCobro: 'mensual',
    precio: 400,
    matricula: 50,
    cobroInicial: 'solo_matricula'
  }, NOW);

  assert.equal(result.totalInicialCentimos, 5000);
  assert.equal(result.conceptoInicial, 'Solo matrícula');
});

test('calcula pago único con matrícula', () => {
  const result = calculateOfficialPlan({
    tipoCobro: 'unico',
    precio: 600,
    matricula: 50,
    cobroInicial: 'pago_total'
  }, NOW);

  assert.equal(result.totalInicialCentimos, 65000);
  assert.equal(result.conceptoInicial, 'Pago completo del programa');
});

test('rechaza importes fuera del rango permitido por Culqi', () => {
  assert.throws(() => calculateOfficialPlan({
    tipoCobro: 'unico',
    precio: 10000,
    matricula: 0,
    cobroInicial: 'pago_total'
  }, NOW), /MONTO_INVALIDO/);
});
