'use strict';

const DNI=/^\d{8,12}$/;
const RECORD=/^[A-Za-z0-9_-]{8,180}$/;
const UID=/^[A-Za-z0-9_-]{12,150}$/;

function text(value,max=130){return String(value??'').replace(/\s+/g,' ').trim().slice(0,max);}
function isStudent(profile){
  return Boolean(profile && profile.role==='student' && profile.status==='active' && profile.blocked!==true);
}
function isEnrolled(record){
  return Boolean(record && (record.matriculaAprobada===true || record.estado==='matriculado'));
}
function isValidLinkRequest({uid,preinscripcionId,confirmedDni,confirmedEmail}={}){
  return UID.test(text(uid,160))&&RECORD.test(text(preinscripcionId,190))
    &&DNI.test(String(confirmedDni||'').trim())
    &&/^[^\s@]+@gruponostradamus\.edu\.pe$/i.test(text(confirmedEmail,120));
}
function canLink(account,record,confirmedDni,confirmedEmail){
  return isStudent(account)&&isEnrolled(record)
    &&text(record.dni,20)===String(confirmedDni).trim()
    &&text(account.institutionalEmail,120).toLowerCase()===text(confirmedEmail,120).toLowerCase();
}
function amount(value){
  const n=Number(value);
  return Number.isFinite(n)&&n>=0&&n<=100000000?Math.round(n*100)/100:null;
}
function safeEnrollment(record){
  if(!record)return null;
  const personal=amount(record.matriculaAcordada);
  const original=amount(record.matriculaReferencia??record.tarifarioSnapshot?.matricula??record.matricula);
  return {
    nombre:text(record.nombre,140),
    ciclo:text(record.ciclo||record.programaNombre||record.programaId,110),
    plan:text(record.planAsignado||record.planNombre,130),
    turno:text(record.turno,80),
    grupo:text(record.grupoId||record.salon,130),
    modalidad:text(record.modalidad,70),
    matriculaAcordada:personal===null?original:personal,
    pensionAcordada:amount(record.pensionAcordada),
    pagoInicialValidado:record.pagoValidado===true||record.estadoPago==='pago_validado',
    matriculaOficial:isEnrolled(record)
  };
}
function safeAttendance(d){
  return {fecha:text(d.fecha,10),entrada:text(d.entradaHora||d.hora,12),
    salida:text(d.salidaHora,12),estado:text(d.estado,32),
    minutosTardanza:Math.max(0,Math.min(999,Math.round(Number(d.minutosTardanza)||0))),
    sede:text(d.sede,65)};
}
function safeQuota(d){
  const cent=Number(d.montoProgramadoCentimos);
  const paid=Number(d.montoPagadoCentimos);
  const pending=Number(d.saldoPendienteCentimos);
  return {concepto:text(d.concepto,90),fechaVencimiento:text(d.fechaVencimiento,10),
    estado:text(d.estado,24),
    programadoCentimos:Number.isInteger(cent)&&cent>=0?cent:null,
    pagadoCentimos:Number.isInteger(paid)&&paid>=0?paid:null,
    saldoCentimos:Number.isInteger(pending)&&pending>=0?pending:null};
}
function safePublishedReport(d,id){
  if(d?.estado!=='publicado'||!RECORD.test(String(id||'')))return null;
  return {id,titulo:text(d.titulo,120),evaluacion:text(d.evaluacion,100),
    fecha:text(d.fecha,10),publicadoAt:d.publicadoAt?.toDate?.().toISOString?.()||null};
}
module.exports={DNI,RECORD,UID,text,isStudent,isEnrolled,isValidLinkRequest,canLink,safeEnrollment,safeAttendance,safeQuota,safePublishedReport};
