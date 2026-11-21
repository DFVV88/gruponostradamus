import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matriculaOriginal, matriculaAcordada, tieneMatriculaPersonalizada, puedeAjustarMatricula, leerMatriculaAcordada} from '../assets/js/admin-matricula-acordada.mjs';

test('conserva el tarifario original y permite matrícula personalizada cero', () => {
  const original={matriculaReferencia:400,tarifarioSnapshot:{matricula:400},precioReferencia:400};
  assert.equal(matriculaOriginal(original),400);
  assert.equal(matriculaAcordada(original),400);
  assert.equal(tieneMatriculaPersonalizada(original),false);
  const ajustada={...original,matriculaAcordada:0};
  assert.equal(matriculaOriginal(ajustada),400);
  assert.equal(matriculaAcordada(ajustada),0);
  assert.equal(tieneMatriculaPersonalizada(ajustada),true);
  assert.equal(ajustada.precioReferencia,400);
});

test('validación exacta de importes', () => {
  assert.equal(leerMatriculaAcordada('200.00'),200);
  assert.equal(leerMatriculaAcordada('0'),0);
  assert.equal(leerMatriculaAcordada('1,25'),1.25);
  for (const amount of ['-1','100000.01','1.234','','texto','1e3']) {
    assert.throws(()=>leerMatriculaAcordada(amount));
  }
});

test('no permite ajustar matrícula desde la interfaz con cobro confirmado o flujo online',()=>{
  const cases=[
    {pagoValidado:true},{estadoPago:'pago_validado'},{metodoPagoPreferido:'pago_online'},
    {estadoPago:'pendiente_pago_online'},{intentoPagoCreado:true},{montoPagoValidado:200},
    {montoPagadoCentimos:10000},{culqiChargeId:'chr_live_x'},{ingresoFinancieroId:'ingreso_1'}
  ];
  assert.equal(puedeAjustarMatricula({estadoPago:'pendiente_envio_voucher'}),true);
  assert.equal(puedeAjustarMatricula({origen:'registro_manual_admin',estadoPago:'sin_pago_registrado'}),true);
  for(const record of cases) assert.equal(puedeAjustarMatricula(record),false,JSON.stringify(record));
});

test('la integración no sustituye montos históricos por el acuerdo',()=>{
  const editor=fs.readFileSync(new URL('../assets/js/admin-alumnos-manuales-editor.js',import.meta.url),'utf8');
  const economy=fs.readFileSync(new URL('../assets/js/admin-alumno-pagos.js',import.meta.url),'utf8');
  const display=fs.readFileSync(new URL('../assets/js/admin-plan-display.js',import.meta.url),'utf8');
  assert.match(editor,/matriculaAcordada/);
  assert.match(editor,/ajustesPagoHistorial/);
  assert.match(economy,/matriculaAcordada/);
  assert.match(economy,/ajustesPagoHistorial/);
  assert.match(display,/matriculaAcordada/);
  assert.doesNotMatch(editor,/precioReferencia\s*:/);
  assert.doesNotMatch(editor,/matriculaReferencia\s*:/);
  assert.doesNotMatch(economy,/matriculaReferencia\s*:/);
});
