'use strict';
const {createHash}=require('node:crypto');
const {MAX_PDF,validUid,pdfValid}=require('./nostrareportes-policy');
const MAX_ROWS=8;
const MAX_BATCH_BYTES=16*1024*1024;
const PRE_ID=/^[A-Za-z0-9_-]{8,180}$/;
const BATCH_ID=/^[a-zA-Z0-9_-]{8,100}$/;
const EVAL_ID=/^[a-zA-Z0-9_-]{8,100}$/;
const FILE_HASH=/^[a-f0-9]{64}$/;
function txt(x,max){return String(x??'').replace(/\s+/g,' ').trim().slice(0,max)}
function normalizedName(name){return txt(name,180).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z ]/g,' ').replace(/\s+/g,' ').trim()}
function derivedReportId(uid,evaluacionId){
  const b=createHash('sha256').update('NostraPUBLICADOR-v1:'+uid+':'+evaluacionId).digest();
  b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  const h=b.subarray(0,16).toString('hex');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
function validBatch(b){
  if(b?.schema_version!=='NOSTRA_PUBLICACION_MANIFEST_V1'
    || b?.qa_status!=='PASS'
    || typeof b?.lote_id!=='string'||!BATCH_ID.test(b.lote_id)
    || typeof b?.evaluacion_id!=='string'||!EVAL_ID.test(b.evaluacion_id)
    || !FILE_HASH.test(b?.qa_manifest_sha256||'')
    || txt(b?.evaluacion_titulo,110).length<5
    || !/^\d{4}-\d{2}-\d{2}$/.test(b?.evaluacion_fecha||'')
    || !Array.isArray(b?.rows)||b.rows.length<1||b.rows.length>MAX_ROWS)return false;
  const ids=new Set(),uids=new Set();
  for(const row of b.rows){
    if(!row||typeof row!=='object')return false;
    const ficha=txt(row.ficha_id,100);
    if(!ficha||ids.has(ficha))return false;
    ids.add(ficha);
    // Repetir un UID en el mismo examen implica un probable duplicado de identificación.
    if(typeof row.firebase_uid==='string'&&row.firebase_uid){
      if(uids.has(row.firebase_uid))return false;
      uids.add(row.firebase_uid);
    }
  }
  return true;
}
function validatedRow(row){
  if(!validUid(row?.firebase_uid)||!PRE_ID.test(row?.preinscripcion_id||'')
    ||row?.identidad_estado!=='CONFIRMADA'||row?.documento_confirmado!==true
    ||!['manual_verificada','documento_verificado'].includes(row?.coincidencia_fuente)
    ||row?.pdf_qa_status!=='PASS'
    ||!FILE_HASH.test(row?.pdf_sha256||'')
    ||typeof row?.pdf_base64!=='string'
    ||row.pdf_base64.length>Math.ceil(MAX_PDF/3)*4+4
    ||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(row.pdf_base64)
    ||normalizedName(row?.nombre_validado).length<6
    ||!Number.isInteger(row?.pdf_size_bytes)||row.pdf_size_bytes<100
    ||row.pdf_size_bytes>MAX_PDF
    ||row?.pdf_paginas!==1)return null;
  const bytes=Buffer.from(row.pdf_base64,'base64');
  if(bytes.length!==row.pdf_size_bytes||bytes.toString('base64')!==row.pdf_base64
    ||!pdfValid(bytes,{contentType:'application/pdf'})
    ||createHash('sha256').update(bytes).digest('hex')!==row.pdf_sha256)return null;
  return {bytes,uid:row.firebase_uid,preinscripcionId:row.preinscripcion_id,name:normalizedName(row.nombre_validado)};
}
module.exports={MAX_ROWS,MAX_BATCH_BYTES,validBatch,validatedRow,normalizedName,derivedReportId};
