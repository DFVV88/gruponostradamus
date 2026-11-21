import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('tarjetas no anuncian vinculación pendiente cuando el dato está conectado',()=>{
  const dashboard=read('assets/js/nostraportal-dashboard.mjs');
  const data=read('assets/js/nostraportal-data.mjs');
  assert.doesNotMatch(dashboard,/Disponible cuando se vincule la ficha oficial/);
  for(const id of ['mi-matricula','mis-asistencias','mis-pagos','mis-notas']){
    assert.match(data,new RegExp("updateLinkedCard\\('"+id+"'"));
  }
  assert.match(data,/Vinculados/);
  assert.match(data,/Ficha académica verificada/);
});

test('cero cuotas no se presenta como certificado de saldo cero',()=>{
  const s=read('assets/js/nostraportal-data.mjs');
  assert.match(s,/Sin cuotas programadas/);
  assert.match(s,/no equivale a un estado de cuenta/);
  assert.match(s,/validBalances\.length===dues\.length/);
  assert.match(s,/Number\.isInteger\(x\.saldoCentimos\)/);
});

test('importes nulos no se convierten en importes cero y siguen existiendo guardas de privacidad',()=>{
  const s=read('assets/js/nostraportal-data.mjs');
  assert.match(s,/value!==null&&value!==undefined&&value!==''/);
  assert.match(s,/solesCentimos\(x\.saldoCentimos\)/);
  assert.match(s,/getIdToken\(\)/);
  assert.doesNotMatch(s,/getDocs|collection\(|asistencia_registros|finanzas_movimientos/);
  assert.match(s,/current!==generation/);
});

test('scripts contienen una versión nueva para invalidar caché del navegador',()=>{
  const html=read('cuenta-nostra.html');
  const auth=read('assets/js/cuenta-nostra.js');
  assert.match(html,/cuenta-nostra\.js\?v=2026-11-21-np3/);
  assert.match(auth,/nostraportal-data\.mjs\?v=2026-11-21-3/);
  assert.match(auth,/nostraportal-dashboard\.mjs\?v=2026-11-21-3/);
  assert.match(auth,/clearStudentPrivateData\(\)/);
});
