'use strict';

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
