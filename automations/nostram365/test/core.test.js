'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const c = require('../lib/core');
test('requires both explicit approvals', () => {
  const row = {nombre:'Sebastián Ramos', correo:'personal@example.com',
    pagoValidado:true, matriculaAprobada:true};
  assert.equal(c.eligible(row), true);
  assert.equal(c.eligible({...row, pagoValidado:false}), false);
  assert.equal(c.eligible({...row, matriculaAprobada:false}), false);
  assert.equal(c.eligible({...row, pagoValidado:'true'}), false);
});
test('conservative UPN; ambiguous names require manual review', () => {
  assert.equal(c.proposedUpn('Axel Johao QUEZADA Saldaña'),'axel.quezada@gruponostradamus.edu.pe');
  assert.equal(c.proposedUpn('Sebastián Ramos'),'sebastian.ramos@gruponostradamus.edu.pe');
  assert.equal(c.proposedUpn('María Condor Huaman'),null);
  assert.equal(c.proposedUpn('María del Carmen López'),null);
});
test('personal email and fixed sender', () => {
  assert.equal(c.personalEmail('ALUMNO@gmail.com'),'alumno@gmail.com');
  assert.equal(c.personalEmail('alumno@gruponostradamus.edu.pe'),null);
  assert.equal(c.SENDER,'informes@gruponostradamus.edu.pe');
  assert.equal(c.STUDENT_SKU,'STANDARDWOFFPACK_STUDENT');
});
test('password complexity and authenticated AES encryption round-trip', () => {
  const key = crypto.randomBytes(32).toString('base64');
  const password = c.randomPassword();
  assert.ok(password.length >= 20);
  assert.match(password,/[A-Z]/); assert.match(password,/[a-z]/);
  assert.match(password,/[0-9]/); assert.match(password,/[!@$%]/);
  const sealed = c.seal(password,key);
  assert.equal(c.unseal(sealed,key),password);
  assert.equal(JSON.stringify(sealed).includes(password),false);
  assert.throws(()=>c.unseal({...sealed, data:'garbage'},key));
});
test('welcome does not contain temporary password', () => {
  const body = c.welcomeText('Sebastián', 'sebastian.ramos@gruponostradamus.edu.pe',
    'https://example.com/activate#secret=example');
  assert.match(body,/NostraCUENTA/);
  assert.match(body,/NostraPASOS/);
  assert.match(body,/Clases en vivo/);
  assert.match(body,/Grupo Nostradamus/);
});
