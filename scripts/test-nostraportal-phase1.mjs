import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isActiveStudent, safeLab, publicLabs, portalSections} from '../assets/js/nostraportal-model.mjs';

const root=new URL('../',import.meta.url);
const source=path=>fs.readFileSync(new URL(path,root),'utf8');

test('el portal del alumno exige rol, activación y ausencia de bloqueo',()=>{
  assert.equal(isActiveStudent({role:'student',status:'active',blocked:false}),true);
  assert.equal(isActiveStudent({role:'student',status:'active'}),true);
  assert.equal(isActiveStudent({role:'teacher',status:'active',blocked:false}),false);
  assert.equal(isActiveStudent({role:'student',status:'pending',blocked:false}),false);
  assert.equal(isActiveStudent({role:'student',status:'blocked',blocked:false}),false);
  assert.equal(isActiveStudent({role:'student',status:'active',blocked:true}),false);
  assert.equal(isActiveStudent(null),false);
});

test('NostraLAB usa solo experiencias publicadas del catálogo oficial',()=>{
  const catalog=JSON.parse(source('nostralab/catalogo.json'));
  const labs=publicLabs(catalog);
  assert.ok(labs.length>=1);
  assert.equal(labs.length,catalog.experiencias.filter(x=>x.publicado===true).length);
  assert.ok(labs.every(x=>x.url.startsWith('nostralab/laboratorio.html?id=')));
  assert.ok(labs.every(x=>x.thumbnail==='' || x.thumbnail.startsWith('nostralab/miniaturas/')));
  assert.equal(new Set(labs.map(x=>x.id)).size,labs.length);
});

test('rechaza rutas inyectadas y laboratorios no aprobados',()=>{
  assert.equal(safeLab({id:'../asistencia',titulo:'Malicioso',publicado:true}),null);
  assert.equal(safeLab({id:'intro',titulo:'Invisible',publicado:false}),null);
  assert.equal(safeLab({id:'lab-1',titulo:'',publicado:true}),null);
  const lab=safeLab({id:'laboratorio-123',titulo:'Experiencia',publicado:true,miniatura:'../../storage/secreto.pdf'});
  assert.equal(lab.thumbnail,'');
  assert.equal(lab.url,'nostralab/laboratorio.html?id=laboratorio-123');
  assert.equal(publicLabs({experiencias:[{id:'x',titulo:'Uno',publicado:true},{id:'x',titulo:'Dos',publicado:true}]}).length,1);
});

test('hay navegación real para herramientas activas, sin botones ficticios para secciones pendientes',()=>{
  const ids=new Set(portalSections.map(x=>x.id));
  assert.equal(ids.size,portalSections.length);
  for(const id of ['mis-clases','mis-asistencias','mis-notas','mis-pagos','mi-matricula','mis-materiales','mi-progreso','mis-comunicados','nostrachat','soporte']){
    assert.ok(ids.has(id),id);
  }
  for(const active of portalSections.filter(x=>x.status==='Disponible')) assert.ok(active.href);
  for(const pending of portalSections.filter(x=>x.status!=='Disponible')) assert.equal(pending.href,'');
  assert.ok(portalSections.some(x=>x.id==='soporte' && x.href.startsWith('https://wa.me/')));
});

test('el panel no lee directamente asistencias, pagos, notas ni documentos administrativos',()=>{
  const dashboard=source('assets/js/nostraportal-dashboard.mjs');
  assert.match(dashboard,/nostralab\/catalogo\.json/);
  assert.match(dashboard,/publicLabs/);
  assert.doesNotMatch(dashboard,/(getDocs|collection\(|preinscripciones\/|finanzas_movimientos|alumno_abonos|asistencia_registros|alumno_cuotas|admin-asistencia\.html)/);
  const html=source('cuenta-nostra.html');
  assert.match(html,/id="nostraportal-body"/);
  assert.match(html,/id="student-panel"/);
  assert.match(html,/id="student-name"/);
  assert.match(html,/id="logout-btn"/);
  assert.match(html,/assets\/css\/nostraportal\.css/);
  const css=source('assets/css/nostraportal.css');
  assert.match(css,/@media\(max-width:600px\)/);
});

test('sesión autenticada respeta bloqueo y rol, y descarta datos al cerrar sesión',()=>{
  const js=source('assets/js/cuenta-nostra.js');
  assert.match(js,/if\(!isActiveStudent\(p\)\)/);
  assert.match(js,/if\(snap\.exists\(\) && isActiveStudent\(snap\.data\(\)\)\)/);
  assert.match(js,/clearNostraPortal\(\)/);
  assert.match(js,/resetStudentPortal\(\)/);
  assert.match(js,/renderNostraPortal\(profile\)/);
});
