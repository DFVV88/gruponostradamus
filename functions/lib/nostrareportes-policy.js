'use strict';
/* NostraREPORTES: invariantes de privacidad. No contiene operaciones de I/O. */
const UID=/^[A-Za-z0-9_-]{12,150}$/;
const REPORT_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PDF=8*1024*1024;
function text(value,max){return String(value??'').replace(/\s+/g,' ').trim().slice(0,max)}
function validUid(uid){return typeof uid==='string'&&UID.test(uid)}
function validReportId(id){return typeof id==='string'&&REPORT_ID.test(id)}
function stagePath(uid,id){
  if(!validUid(uid)||!validReportId(id))return null;
  return 'nostrareportes-staging/'+uid+'/'+id+'.pdf';
}
function privatePath(uid,id){
  if(!validUid(uid)||!validReportId(id))return null;
  return 'nostrareportes-private/'+uid+'/'+id+'.pdf';
}
function reportMeta(body){
  const titulo=text(body?.titulo,110),evaluacion=text(body?.evaluacion,100);
  const fecha=text(body?.fecha,10),fuente=text(body?.fuente,40);
  if(titulo.length<5||evaluacion.length<3||!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||fuente!=='NostraREPORTES'||body?.qaRevisado!==true)return null;
  const [y,m,d]=fecha.split('-').map(Number),asDate=new Date(Date.UTC(y,m-1,d));
  if(asDate.getUTCFullYear()!==y||asDate.getUTCMonth()!==m-1||asDate.getUTCDate()!==d)return null;
  return {titulo,evaluacion,fecha,fuente};
}
function pdfValid(bytes,metadata){
  if(!Buffer.isBuffer(bytes)||bytes.length<100||bytes.length>MAX_PDF)return false;
  if(!bytes.subarray(0,8).toString('latin1').startsWith('%PDF-'))return false;
  if(!bytes.subarray(Math.max(0,bytes.length-1024)).toString('latin1').includes('%%EOF'))return false;
  if(metadata&&metadata.contentType!=='application/pdf')return false;
  return true;
}
function authorizedDoc(doc,uid,preinscripcionId,reportId){
  return Boolean(doc&&doc.estado==='publicado'&&doc.uid===uid&&doc.preinscripcionId===preinscripcionId
    &&doc.reportId===reportId&&doc.path===privatePath(uid,reportId)
    &&typeof doc.sha256==='string'&&/^[a-f0-9]{64}$/.test(doc.sha256));
}
function safeListing(doc,id){
  if(!validReportId(id))return null;
  const estado=doc?.estado==='publicado'?'publicado':doc?.estado==='revocado'?'revocado':null;
  if(!estado)return null;
  return {id,titulo:text(doc.titulo,110),evaluacion:text(doc.evaluacion,100),
    fecha:text(doc.fecha,10),estado};
}
module.exports={MAX_PDF,validUid,validReportId,stagePath,privatePath,reportMeta,pdfValid,authorizedDoc,safeListing};
