import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('si la lectura de vínculo falla no se ofrece vincular ficha',()=>{
  const module=read('assets/js/admin-nostracuentas-portal.mjs');
  assert.match(module,/state\.estado==='pendiente'/);
  assert.doesNotMatch(module,/state\.estado!=='vinculado'/);
  assert.match(module,/if\(!response\.ok\|\|!body\.ok\)/);
  assert.match(module,/HTTP /);
  assert.match(module,/let failed=0/);
});
test('el diagnóstico se presenta sin mostrar token ni información de identidad',()=>{
  const module=read('assets/js/admin-nostracuentas-portal.mjs');
  const admin=read('assets/js/admin-preinscripciones.js');
  assert.match(module,/reason=String\(error\.message/);
  assert.match(admin,/portalResult\.reason/);
  assert.match(admin,/No se ha asociado ninguna ficha/);
  assert.doesNotMatch(admin,/console\.log\(token/);
});
