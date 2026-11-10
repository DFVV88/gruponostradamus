'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const c = require('../lib/core');
test('requires both explicit approvals', () => {
  const row = {nombre:'Sebastián Ramos', correo:'personal@example.com', origen:'web_preinscripcion',
    estado:'matriculado', estadoPago:'pago_validado', pagoValidado:true, matriculaAprobada:true};
  assert.equal(c.eligible(row), true);
  assert.equal(c.eligible({...row, pagoValidado:false}), false);
  assert.equal(c.eligible({...row, matriculaAprobada:false}), false);
  assert.equal(c.eligible({...row, pagoValidado:'true'}), false);
  assert.equal(c.eligible({...row, origen:'registro_manual_admin'}), false);
  assert.equal(c.eligible({...row, correoInstitucionalAsignado:true}), false);
  assert.equal(c.eligible({...row, correoInstitucional:'cuenta@gruponostradamus.edu.pe'}), false);
  assert.equal(c.eligible({...row, estadoPago:'pendiente_pago_online'}), false);
  assert.equal(c.eligible({...row, estado:'rechazado'}), false);
  assert.equal(c.shouldHandleTransition({...row, matriculaAprobada:false},row), true);
  assert.equal(c.shouldHandleTransition(row,{...row, celular:'999999999'}), false);
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

test('scope defaults locked and pilot requires exact ID plus personal recipient', () => {
  const id = 'pre1234567890123456';
  const row = {correo:'personal@example.com'};
  const config = {NOSTRA_M365_SCOPE_MODE:'pilot', NOSTRA_M365_PILOT_PREID:id,
    NOSTRA_M365_PILOT_EMAIL:'personal@example.com'};
  assert.equal(c.scopeAllows(id,row,{}),false);
  assert.equal(c.scopeAllows(id,row,{NOSTRA_M365_SCOPE_MODE:'other'}),false);
  assert.equal(c.scopeAllows(id,row,config),true);
  assert.equal(c.scopeAllows('pre9999999999999999',row,config),false);
  assert.equal(c.scopeAllows(id,{correo:'someone@example.com'},config),false);
  assert.equal(c.scopeAllows(id,row,{...config,NOSTRA_M365_PILOT_EMAIL:''}),false);
  assert.equal(c.scopeAllows(id,row,{...config,NOSTRA_M365_PILOT_PREID:''}),false);
  assert.equal(c.scopeAllows(id,row,{...config,NOSTRA_M365_PILOT_EMAIL:'x@gruponostradamus.edu.pe'}),false);
  assert.equal(c.scopeAllows(id,row,{NOSTRA_M365_SCOPE_MODE:'production'}),true);
});
