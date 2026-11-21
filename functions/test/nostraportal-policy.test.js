'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {
  isStudent,isEnrolled,isValidLinkRequest,canLink,safeEnrollment,safeAttendance,safeQuota
}=require('../lib/nostraportal-policy');

test('sin perfil de alumno activo y no bloqueado no se autoriza acceso',()=>{
  assert.equal(isStudent({role:'student',status:'active'}),true);
  assert.equal(isStudent({role:'student',status:'active',blocked:true}),false);
  assert.equal(isStudent({role:'teacher',status:'active',blocked:false}),false);
  assert.equal(isStudent({role:'student',status:'pending'}),false);
  assert.equal(isStudent(null),false);
});

test('vínculos requieren DNI exacto, email institucional y matrícula aprobada',()=>{
  const account={role:'student',status:'active',institutionalEmail:'estudiante@gruponostradamus.edu.pe'};
  const matricula={nombre:'Estudiante A',dni:'78990001',estado:'matriculado'};
  assert.equal(isValidLinkRequest({uid:'AbCde12345abcDEF123456',preinscripcionId:'665cfb670f310634c24426895f7a1204914f2ae242601a87b57ae76350a730d7',confirmedDni:'78990001',confirmedEmail:account.institutionalEmail}),true);
  assert.equal(canLink(account,matricula,'78990001',account.institutionalEmail),true);
  assert.equal(canLink(account,matricula,'78990002',account.institutionalEmail),false);
  assert.equal(canLink(account,matricula,'78990001','otro@gruponostradamus.edu.pe'),false);
  assert.equal(canLink(account,{...matricula,estado:'pendiente'},'78990001',account.institutionalEmail),false);
  assert.equal(canLink({...account,blocked:true},matricula,'78990001',account.institutionalEmail),false);
  assert.equal(isValidLinkRequest({uid:'../../root',preinscripcionId:'a123456789',confirmedDni:'78990001',confirmedEmail:account.institutionalEmail}),false);
});

test('importe acordado conserva el original y no inventa pagos',()=>{
  const record={nombre:'Estudiante A',dni:'78990001',ciclo:'Proyecto Escolar',
    matriculaReferencia:400,matriculaAcordada:200,pensionAcordada:380,pagoValidado:false,estado:'matriculado'};
  const item=safeEnrollment(record);
  assert.equal(item.matriculaAcordada,200);
  assert.equal(item.pensionAcordada,380);
  assert.equal(item.pagoInicialValidado,false);
  assert.equal(item.dni,undefined);
});

test('la asistencia expone solo la marcación sin DNI ni metadatos privados',()=>{
  const d=safeAttendance({dni:'78990001',nombre:'Prueba',fecha:'2026-11-20',entradaHora:'08:05:00',salidaHora:'12:02:00',estado:'tardanza',minutosTardanza:5,sede:'Ingeniería',fuenteRegistro:'qr'});
  assert.equal(d.fecha,'2026-11-20');
  assert.equal(d.minutosTardanza,5);
  assert.equal(d.dni,undefined);
  assert.equal(d.fuenteRegistro,undefined);
});

test('cuotas exponen sólo conceptos e importes existentes',()=>{
  const d=safeQuota({concepto:'Pensión',fechaVencimiento:'2026-12-01',montoProgramadoCentimos:38000,montoPagadoCentimos:15000,saldoPendienteCentimos:23000,estado:'parcial',preinscripcionId:'private'});
  assert.equal(d.saldoCentimos,23000);
  assert.equal(d.pagadoCentimos,15000);
  assert.equal(d.preinscripcionId,undefined);
});
