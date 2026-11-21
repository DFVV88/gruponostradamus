import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matriculaOriginal, matriculaAcordada, tieneMatriculaPersonalizada, puedeAjustarMatricula, leerMatriculaAcordada, pagoInicialAcordado} from '../assets/js/admin-matricula-acordada.mjs';

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

test('no sugiere un nuevo cobro manual cuando ya hay un pago confirmado o flujo Culqi',()=>{
  const cases=[
    {pagoValidado:true},{estadoPago:'pago_validado'},{metodoPagoPreferido:'pago_online'},
    {estadoPago:'pendiente_pago_online'},{intentoPagoCreado:true},{montoPagoValidado:200},
    {montoPagadoCentimos:10000},{culqiChargeId:'chr_live_x'},{ingresoFinancieroId:'ingreso_1'}
  ];
  assert.equal(puedeAjustarMatricula({estadoPago:'pendiente_envio_voucher'}),true);
  assert.equal(puedeAjustarMatricula({origen:'registro_manual_admin',estadoPago:'sin_pago_registrado'}),true);
  assert.equal(puedeAjustarMatricula({metodoPagoPreferido:'voucher_whatsapp',estadoPago:'pendiente_pago_online'}),true);
  assert.equal(puedeAjustarMatricula({metodoPagoLabel:'Voucher por WhatsApp',estadoPago:'pendiente_pago_online'}),true);
  for(const record of cases) assert.equal(puedeAjustarMatricula(record),false,JSON.stringify(record));
});

test('la integración no sustituye montos históricos por el acuerdo',()=>{
  const editor=fs.readFileSync(new URL('../assets/js/admin-alumnos-manuales-editor.js',import.meta.url),'utf8');
  const economy=fs.readFileSync(new URL('../assets/js/admin-alumno-pagos.js',import.meta.url),'utf8');
  const display=fs.readFileSync(new URL('../assets/js/admin-plan-display.js',import.meta.url),'utf8');
  const payment=fs.readFileSync(new URL('../assets/js/admin-pagos-matriculas.js',import.meta.url),'utf8');
  assert.match(editor,/matriculaAcordada/);
  assert.match(editor,/ajustesPagoHistorial/);
  assert.match(economy,/matriculaAcordada/);
  assert.match(economy,/ajustesPagoHistorial/);
  assert.match(display,/matriculaAcordada/);
  assert.match(payment,/pagoInicialAcordado/);
  assert.doesNotMatch(editor,/precioReferencia\s*:/);
  assert.doesNotMatch(editor,/matriculaReferencia\s*:/);
  assert.doesNotMatch(economy,/matriculaReferencia\s*:/);
});

test('el pago manual sugerido respeta el concepto sin alterar el inicial histórico', () => {
  const base={matriculaReferencia:400,matriculaAcordada:200,estadoPago:'pendiente_envio_voucher'};
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'matricula_y_primera_cuota'},800),600);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'solo_matricula'},400),200);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'primera_cuota'},400),400);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'pago_total'},800),600);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'solo_matricula',matriculaAcordada:0},400),0);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'solo_matricula',metodoPagoPreferido:'pago_online'},400),400);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'solo_matricula',pagoValidado:true},400),400);
  assert.equal(pagoInicialAcordado({...base,cobroInicial:'solo_matricula',metodoPagoPreferido:'voucher_whatsapp',estadoPago:'pendiente_pago_online'},400),200);
});

test('regularización 400 a 200 queda como campo administrativo, conservando histórico 400',()=>{
  const antes={matriculaReferencia:400,totalInicial:400,tarifarioSnapshot:{matricula:400,cobroInicial:'solo_matricula'},pagoValidado:true,montoPagoValidado:200};
  const despues={...antes,matriculaAcordada:200};
  assert.equal(matriculaOriginal(despues),400);
  assert.equal(matriculaAcordada(despues),200);
  assert.equal(despues.totalInicial,400);
  assert.equal(despues.montoPagoValidado,200);
  assert.equal(pagoInicialAcordado(despues,400),400); // Nunca recalcula cobros ya pagados
});

test('los editores permiten corregir el acuerdo sin tocar pagos ni cuotas, y la ficha consulta Firestore al abrir',()=>{
  const editor=fs.readFileSync(new URL('../assets/js/admin-alumnos-manuales-editor.js',import.meta.url),'utf8');
  const economy=fs.readFileSync(new URL('../assets/js/admin-alumno-pagos.js',import.meta.url),'utf8');
  const display=fs.readFileSync(new URL('../assets/js/admin-plan-display.js',import.meta.url),'utf8');
  assert.match(editor,/matriculaAcordada:nuevoImporteMatricula/);
  assert.match(editor,/ajustesPagoHistorial:arrayUnion/);
  assert.match(editor,/Otro administrador modificó la matrícula/);
  assert.doesNotMatch(editor,/matriculaLedgerBlocked/);
  assert.doesNotMatch(economy,/matriculaLedgerBlocked/);
  assert.doesNotMatch(economy,/Existe un pago registrado\. No se modificó la matrícula/);
  assert.match(economy,/await updateDoc\(recordRef,patch\)/);
  assert.match(display,/const snapDoc = await getDoc\(doc\(db,'preinscripciones',id\)\)/);
  assert.doesNotMatch(display,/if\(records\.has\(id\)\) return records\.get\(id\)/);
});
