import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('la API valida ID token y obtiene DNI sólo desde matrícula autorizada',()=>{
  const s=source('functions/nostraportal.js');
  assert.match(s,/verifyIdToken\(match\[1\],true\)/);
  assert.match(s,/isStudent\(caller\.profile\)/);
  assert.match(s,/nostraportal_vinculos_inversos/);
  assert.match(s,/record\.dni/);
  assert.match(s,/db\.runTransaction/);
  assert.doesNotMatch(s,/request\.body\.dni/);
  assert.match(s,/\.where\('dni','==',dni\)/);
  assert.match(s,/\.where\('preinscripcionId','==',linked\.id\)/);
});
test('el frontend no lee colecciones administrativas y limpia al cerrar sesión',()=>{
  const js=source('assets/js/nostraportal-data.mjs');
  assert.match(js,/user\.getIdToken\(\)/);
  assert.match(js,/clearStudentPrivateData/);
  assert.doesNotMatch(js,/getDocs|collection\(|preinscripciones\/|asistencia_registros|finanzas_movimientos/);
  const login=source('assets/js/cuenta-nostra.js');
  assert.match(login,/loadStudentPrivateData\(auth\.currentUser\)/);
  assert.match(login,/clearStudentPrivateData\(\)/);
});
test('NostraADMIN tiene acceso a vinculación oficial y no altera pagos',()=>{
  const html=source('admin-nostraportal.html');
  assert.match(html,/id="confirmed-dni"/);
  assert.match(html,/id="confirmed-email"/);
  assert.match(html,/id="accept"/);
  const js=source('assets/js/admin-nostraportal.js');
  assert.match(js,/getIdToken\(\)/);
  assert.match(js,/action:'admin_link'/);
  const admin=source('assets/js/admin-preinscripciones.js');
  const bridge=source('assets/js/admin-nostracuentas-portal.mjs');
  assert.match(admin,/portalLinkCell\(a\)/);
  assert.match(bridge,/admin-nostraportal\.html\?uid=/);
});
