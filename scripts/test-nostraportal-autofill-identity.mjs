import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {identityFromSelectedRecords} from '../assets/js/nostraportal-link-identity.mjs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('autocompleta el DNI oficial y el correo al seleccionar ambas fichas',()=>{
  const x=identityFromSelectedRecords(
    {id:'student-uid',institutionalEmail:' Brianna.Becerra@gruponostradamus.edu.pe '},
    {id:'official-enrollment',dni:' 12345678 ',matriculaAprobada:true}
  );
  assert.deepEqual(x,{
    dni:'12345678',
    email:'brianna.becerra@gruponostradamus.edu.pe',
    dniFromRecord:true,
    emailFromAccount:true
  });
});

test('sin ficha o con DNI inválido no inventa identidad',()=>{
  assert.deepEqual(identityFromSelectedRecords(null,null),{
    dni:'',email:'',dniFromRecord:false,emailFromAccount:false
  });
  const missing=identityFromSelectedRecords({institutionalEmail:'otro@correo.com'},{dni:'-'});
  assert.equal(missing.dni,'');
  assert.equal(missing.email,'');
  assert.equal(missing.dniFromRecord,true);
});

test('el DNI sólo se extrae de la ficha seleccionada, nunca del nombre ni de otra cuenta',()=>{
  const u={name:'Ejemplo de Alumna',institutionalEmail:'estudiante@gruponostradamus.edu.pe',dni:'87654321'};
  const r={nombre:'Ejemplo de Alumna',dni:'12345678'};
  const x=identityFromSelectedRecords(u,r);
  assert.equal(x.dni,'12345678');
  assert.notEqual(x.dni,u.dni);
});

test('el formulario recalcula campos y exige confirmación independiente antes de vincular',()=>{
  const js=read('assets/js/admin-nostraportal.js');
  const html=read('admin-nostraportal.html');
  assert.match(js,/identityFromSelectedRecords\(u,r\)/);
  assert.match(js,/dniInput\.value=identity\.dni/);
  assert.match(js,/dniInput\.readOnly=true/);
  assert.match(js,/emailInput\.value=identity\.email/);
  assert.match(js,/emailInput\.readOnly=true/);
  assert.match(js,/\$\('accept'\)\.checked=false/);
  assert.match(js,/window\.confirm\(/);
  assert.match(js,/action:'admin_link'/);
  assert.match(html,/DNI de la matrícula oficial/);
  assert.match(html,/Se completa automáticamente desde Firebase/);
  assert.match(html,/id="accept" type="checkbox" required/);
});

test('no altera seguridad backend ni registros económicos',()=>{
  const js=read('assets/js/admin-nostraportal.js');
  assert.doesNotMatch(js,/(writeBatch|updateDoc|deleteDoc|addDoc|setDoc)\(/);
  const backend=read('functions/nostraportal.js');
  assert.match(backend,/canLink\(user\.data\(\),record\.data\(\),body\.confirmedDni,body\.confirmedEmail\)/);
  assert.match(backend,/db\.runTransaction/);
});
