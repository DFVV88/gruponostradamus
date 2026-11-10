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
  assert.equal(c.eligible({...row, matriculaAprobada:false}), true); // Admin two-select save
  assert.equal(c.eligible({...row, pagoValidado:'true'}), false);
  assert.equal(c.eligible({...row, origen:'registro_manual_admin'}), false);
  assert.equal(c.eligible({...row, correoInstitucionalAsignado:true}), false);
  assert.equal(c.eligible({...row, correoInstitucional:'cuenta@gruponostradamus.edu.pe'}), false);
  assert.equal(c.eligible({...row, estadoPago:'pendiente_pago_online'}), false);
  assert.equal(c.eligible({...row, estado:'rechazado'}), false);
  assert.equal(c.shouldHandleTransition({...row, matriculaAprobada:false, estado:'nuevo'},row), true);
  assert.equal(c.shouldHandleTransition({...row, estado:'listo_para_matricula'},row), false); // Culqi before admin finalization
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

test('both admin two-selector save and Culqi webhook cause a single eligible transition', () => {
  const initial = {nombre:'Alumno Ejemplo',correo:'personal@example.com',origen:'web_preinscripcion',
    estado:'nuevo',estadoPago:'pendiente_envio_voucher',pagoValidado:false,
    matriculaAprobada:false,correoInstitucionalAsignado:false};
  const admin = {...initial,estado:'matriculado',estadoPago:'pago_validado',pagoValidado:true};
  const culqi = {...initial,estado:'listo_para_matricula',matriculaAprobada:true,
    estadoPago:'pago_validado',pagoValidado:true};
  assert.equal(c.shouldHandleTransition(initial,admin),true);
  assert.equal(c.shouldHandleTransition(initial,culqi),true);
  assert.equal(c.shouldHandleTransition(admin,{...admin,matriculaAprobada:true}),false);
  assert.equal(c.shouldHandleTransition(culqi,{...culqi,estado:'matriculado'}),false);
  assert.equal(c.eligible({...initial,estado:'matriculado',pagoValidado:false,estadoPago:'pago_validado'}),false);
  assert.equal(c.eligible({...initial,estado:'matriculado',pagoValidado:true,estadoPago:'pendiente_envio_voucher'}),false);
  assert.equal(c.eligible({...initial,pagoValidado:true,estadoPago:'pago_validado'}),false);
  assert.equal(c.eligible({...admin,origen:'registro_manual_admin'}),false);
  assert.equal(c.eligible({...admin,estado:'rechazado',matriculaAprobada:true}),false);
});

test('official UPN: first name dot first surname, fallback with next surname initial', () => {
  assert.deepEqual(c.proposedUpnCandidates('Luis Alberto Pérez García'), [
    'luis.perez@gruponostradamus.edu.pe',
    'luis.perezg@gruponostradamus.edu.pe'
  ]);
  assert.deepEqual(c.proposedUpnCandidates('Axel Johao QUEZADA Saldaña'), [
    'axel.quezada@gruponostradamus.edu.pe',
    'axel.quezadas@gruponostradamus.edu.pe'
  ]);
  assert.deepEqual(c.proposedUpnCandidates('Sebastián Ramos'), [
    'sebastian.ramos@gruponostradamus.edu.pe'
  ]);
  assert.deepEqual(c.proposedUpnCandidates('María Condor Huaman'), []);
  assert.deepEqual(c.proposedUpnCandidates('María del Carmen López'), []);
});

test('pilot activation only permits exact test job while the normal worker stays off', () => {
  const env = {NOSTRA_M365_SCOPE_MODE:'pilot',NOSTRA_M365_ENABLED:'false',
    NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED:'false',
    NOSTRA_M365_NOT_BEFORE:'2099-01-01T00:00:00Z',
    NOSTRA_M365_PILOT_ACTIVATION_ENABLED:'true',
    NOSTRA_M365_PILOT_PREID:'pre1234567890123456',
    NOSTRA_M365_PILOT_EMAIL:'test@example.com'};
  const job={preinscripcionId:'pre1234567890123456',
    origen:'piloto_independiente_sin_cobro',correoDestino:'test@example.com'};
  assert.equal(c.pilotActivationConfigured(env),true);
  assert.equal(c.pilotActivationAllowed(env,job.preinscripcionId,job),true);
  assert.equal(c.pilotActivationAllowed(env,'pre0000000000000000',job),false);
  assert.equal(c.pilotActivationAllowed(env,job.preinscripcionId,
    {...job,correoDestino:'another@example.com'}),false);
  assert.equal(c.pilotActivationAllowed(env,job.preinscripcionId,
    {...job,origen:'aprobacion_firebase'}),false);
  assert.equal(c.pilotActivationConfigured({...env,NOSTRA_M365_ENABLED:'true'}),false);
  assert.equal(c.pilotActivationConfigured({...env,NOSTRA_M365_PILOT_ACTIVATION_ENABLED:'false'}),false);
});
