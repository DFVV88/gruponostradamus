import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const report=require('../functions/lib/nostrareportes-policy.js');
const pub=require('../functions/lib/nostrapublicador-policy.js');
const source=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const uid='f16dce21B8C11727xq297';
const otherUid='f16dce21B8C11727xq298';
const enrollment='record_2026_1234';
const id='a9d01d11-0123-4aaa-9b00-191293420001';
function pdf(){
  return Buffer.from('%PDF-1.4\n'+('0'.repeat(132))+'\n%%EOF\n','utf8');
}
function sampleBundle(){
 const bytes=pdf();
 return {
  schema_version:'NOSTRA_PUBLICACION_MANIFEST_V1',
  lote_id:'simulacro202711',evaluacion_id:'ien202711',
  evaluacion_titulo:'Simulacro de admisión IEN',evaluacion_fecha:'2026-11-21',
  qa_status:'PASS',qa_manifest_sha256:'a'.repeat(64),rows:[{
    ficha_id:'sheet-001',firebase_uid:uid,preinscripcion_id:enrollment,
    nombre_validado:'María del Carmen Muñoz',identidad_estado:'CONFIRMADA',
    documento_confirmado:true,coincidencia_fuente:'manual_verificada',
    pdf_qa_status:'PASS',pdf_sha256:createHash('sha256').update(bytes).digest('hex'),
    pdf_size_bytes:bytes.length,pdf_paginas:1,pdf_base64:bytes.toString('base64')
  }]
 };
}
test('identificadores de UID y PDF sólo admiten formato validado',()=>{
 assert.ok(report.validUid(uid));
 assert.ok(report.validReportId(id));
 assert.equal(report.validUid('../other'),false);
 assert.equal(report.validReportId('otro.pdf'),false);
 assert.equal(report.stagePath(uid,id),'nostrareportes-staging/'+uid+'/'+id+'.pdf');
 assert.equal(report.privatePath(uid,id),'nostrareportes-private/'+uid+'/'+id+'.pdf');
});
test('PDF mínimo debe tener marcador, final y tamaño válidos',()=>{
 assert.ok(report.pdfValid(pdf(),{contentType:'application/pdf'}));
 assert.equal(report.pdfValid(Buffer.from('falso'),{contentType:'application/pdf'}),false);
 assert.equal(report.pdfValid(pdf(),{contentType:'text/plain'}),false);
});
test('identidad de documentos requiere UID matrícula estado y huella de archivo',()=>{
 const doc={uid,preinscripcionId:enrollment,reportId:id,estado:'publicado',
   path:report.privatePath(uid,id),sha256:'a'.repeat(64)};
 assert.ok(report.authorizedDoc(doc,uid,enrollment,id));
 assert.equal(report.authorizedDoc(doc,otherUid,enrollment,id),false);
 assert.equal(report.authorizedDoc(doc,uid,'record_other',id),false);
 assert.equal(report.authorizedDoc({...doc,estado:'revocado'},uid,enrollment,id),false);
});
test('validación de lote confirma PDF, identidad y huella SHA-256',()=>{
 const b=sampleBundle();assert.ok(pub.validBatch(b));
 const good=pub.validatedRow(b.rows[0]);
 assert.ok(good);assert.equal(good.uid,uid);
 const broken=structuredClone(b.rows[0]);
 broken.pdf_sha256='0'.repeat(64);
 assert.equal(pub.validatedRow(broken),null);
 const noDni=structuredClone(b.rows[0]);
 noDni.documento_confirmado=false;
 assert.equal(pub.validatedRow(noDni),null);
 const lowConfidence=structuredClone(b.rows[0]);
 lowConfidence.coincidencia_fuente='candidato_nombre';
 assert.equal(pub.validatedRow(lowConfidence),null);
});
test('no se puede repetir destinatario en un mismo examen',()=>{
 const b=sampleBundle();
 b.rows.push({...b.rows[0],ficha_id:'sheet-002'});
 assert.equal(pub.validBatch(b),false);
});
test('ID de informe por evaluación es estable y diferente por alumno',()=>{
 const a=pub.derivedReportId(uid,'ien202711');
 assert.equal(a,pub.derivedReportId(uid,'ien202711'));
 assert.notEqual(a,pub.derivedReportId(otherUid,'ien202711'));
 assert.ok(report.validReportId(a));
});
test('publicación manual y por lote requieren allowlist explícita de cuentas piloto',()=>{
 const api=source('functions/nostrareportes.js');
 assert.match(api,/function requirePilotUid/);
 assert.match(api,/requirePilotUid\(uid,await allowedPilotUids\(\)\)/);
 assert.match(api,/if\(!allow\.has\(ready\.uid\)\)/);
 assert.match(api,/const allow=doPublish\?await allowedPilotUids\(\):new Set\(\)/);
 assert.match(api,/if\(!caller\.token\.email_verified/);
 assert.match(api,/verifyIdToken\(m\[1\],true\)/);
 assert.match(api,/action==='admin_manual_preview'/);
 assert.match(api,/action==='admin_batch_preview'/);
 assert.match(api,/action==='admin_batch_publish'/);
 assert.match(api,/action==='admin_report_revoke'/);
 assert.match(api,/action==='student_report_download'/);
});
test('storage permite staging sólo admin y nunca lectura directa de PDFs privados',()=>{
 const rules=source('storage.rules');
 assert.match(rules,/match \/nostrareportes-staging\/\{uid\}\/\{fileName\}/);
 assert.match(rules,/allow create: if isAdmin\(\)/);
 assert.match(rules,/request\.resource\.contentType == 'application\/pdf'/);
 assert.match(rules,/request\.resource\.metadata\.uid == uid/);
 assert.match(rules,/match \/\{allPaths=\*\*\} \{\s*allow read, write: if false;/);
 assert.doesNotMatch(rules,/match \/nostrareportes-private/);
});
test('panel contiene las dos vías y validación manual con matriz alumno-matrícula',()=>{
 const js=source('assets/js/admin-nostrapublicador.js'),html=source('admin-nostrapublicador.html');
 assert.match(html,/Publicación automática por lote/);
 assert.match(html,/Subida manual de PDF/);
 assert.match(html,/id="manual-pdf"/);
 assert.match(js,/admin_manual_preview/);
 assert.match(js,/admin_report_publish/);
 assert.match(js,/uploadBytes\(stageRef,meta\.file/);
 assert.match(js,/customMetadata:\{uid:meta\.uid,reportId:meta\.reportId,subidoPor:user\.email\}/);
 assert.match(js,/admin_report_revoke/);
});
test('alumno sólo puede solicitar PDF mediante token; los informes no son públicos',()=>{
 const js=source('assets/js/nostraportal-data.mjs');
 const api=source('functions/nostraportal.js');
 assert.match(js,/action:'student_report_download'/);
 assert.match(js,/user\.getIdToken/);
 assert.match(js,/reportId:item\.id/);
 assert.match(js,/generation!==requestGeneration/);
 assert.match(api,/authorizedDoc\(x\.data\(\),caller\.uid,linked\.id,x\.id\)/);
});
