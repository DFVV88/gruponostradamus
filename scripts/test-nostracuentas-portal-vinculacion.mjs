import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {canLink,isEnrolled,isStudent}=require('../functions/lib/nostraportal-policy.js');
const source=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('la cuenta activa ya dispone del portal aunque no esté vinculada a una matrícula',()=>{
 const auth=source('assets/js/cuenta-nostra.js');
 const dashboard=source('assets/js/nostraportal-dashboard.mjs');
 assert.match(auth,/if\(snap\.exists\(\) && isActiveStudent\(snap\.data\(\)\)\)/);
 assert.match(auth,/renderNostraPortal\(profile\)/);
 assert.match(dashboard,/renderNostraPortal\(profile\)/);
});

test('el enlace administrativo informa el estado sin asociar cuentas por coincidencia de nombre',()=>{
 const bridge=source('assets/js/admin-nostracuentas-portal.mjs');
 assert.match(bridge,/admin_link_status/);
 assert.match(bridge,/Sin verificar/);
 assert.match(bridge,/Por vincular/);
 assert.match(bridge,/admin-nostraportal\.html\?uid=/);
 assert.doesNotMatch(bridge,/admin_link['"]/);
 assert.doesNotMatch(bridge,/name\s*===/);
 const admin=source('assets/js/admin-preinscripciones.js');
 assert.match(admin,/portalLinkCell\(a\)/);
 assert.match(admin,/refreshPortalLinkStates\(auth\.currentUser,accounts,renderAccountsTable\)/);
 assert.match(admin,/Datos académicos/);
});

test('la propuesta administrativa preselecciona la cuenta pero nunca la matrícula ni confirma por el alumno',()=>{
 const s=source('assets/js/admin-nostraportal.js');
 assert.match(s,/new URLSearchParams\(location\.search\)\.get\('uid'\)/);
 assert.match(s,/if\(account\)/);
 assert.match(s,/\$\('uid'\)\.value=requestedUid/);
 assert.match(s,/\$\('accept'\)\.checked/);
 assert.match(s,/window\.confirm/);
 assert.doesNotMatch(s,/confirmedDni\s*=\s*.*URLSearchParams/);
});

test('la API sólo da estados a administración autenticada y verifica vínculo bidireccional y matrícula',()=>{
 const api=source('functions/nostraportal.js');
 assert.match(api,/async function adminLinkStatuses\(body,caller\)/);
 assert.match(api,/caller\.token\.email_verified/);
 assert.match(api,/ADMIN_EMAIL/);
 assert.match(api,/body\.uids/);
 assert.match(api,/ids\.length>100/);
 assert.match(api,/nostraportal_vinculos_inversos/);
 assert.match(api,/isEnrolled\(record\.data\(\)\)/);
 assert.match(api,/action==='admin_link_status'/);
 assert.match(api,/action==='student_state'/);
 assert.doesNotMatch(api,/where\('nombre'/);
});

test('identidad activa, matrícula aprobada y DNI exacto son necesarios para asociar datos',()=>{
 const user={role:'student',status:'active',blocked:false,institutionalEmail:'estudiante@gruponostradamus.edu.pe'};
 const record={dni:'78990001',nombre:'Persona Prueba',estado:'matriculado'};
 assert.equal(isStudent(user),true);
 assert.equal(isEnrolled(record),true);
 assert.equal(canLink(user,record,record.dni,user.institutionalEmail),true);
 assert.equal(canLink(user,record,'78990002',user.institutionalEmail),false);
 assert.equal(canLink({...user,blocked:true},record,record.dni,user.institutionalEmail),false);
 assert.equal(canLink(user,{...record,estado:'pendiente'},record.dni,user.institutionalEmail),false);
});
