/* NostraPORTAL fase 2: la sesión consulta únicamente la API por UID verificado.
   Prohibido leer colecciones administrativas desde el navegador. */
const API='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostraportalApi';
let generation=0;
const $=id=>document.getElementById(id);
const el=(tag,className,value)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(value!==undefined&&value!==null)node.textContent=String(value);
  return node;
};
const soles=value=>Number.isFinite(Number(value))?'S/ '+Number(value).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
const cap=value=>String(value??'').trim()||'No registrado';
const statusLabel=value=>({puntual:'Puntual',tardanza:'Tardanza',pendiente:'Pendiente',parcial:'Parcial',pagada:'Pagada',anulada:'Anulada'})[value]||cap(value);

function setStatus(id,label,sub){
  const card=$(id);
  if(!card)return;
  const status=card.querySelector('.np-tool-status');
  if(status)status.textContent=label;
  if(sub){
    const description=card.querySelector('.np-tool-description');
    if(description)description.textContent=sub;
  }
}
function infoRows(card,rows){
  if(!card)return;
  const container=el('dl','np-portal-fields');
  rows.forEach(([key,value])=>{
    const cell=el('div','np-portal-field');
    cell.append(el('dt','',key),el('dd','',cap(value)));
    container.append(cell);
  });
  card.append(container);
}
function lineSection(title,subtitle){
  const s=el('section','np-section np-private-section');
  const head=el('div','np-section-title');
  const h=el('div');
  h.append(el('span','','MI HISTORIAL'),el('h2','',title));
  head.append(h,el('p','',subtitle));
  s.append(head);
  return s;
}
function table(headers,rows){
  const box=el('div','np-data-wrap');
  const tbl=el('table','np-data-table');
  const thead=el('thead'),r=el('tr');
  headers.forEach(h=>r.append(el('th','',h)));
  thead.append(r);tbl.append(thead);
  const tbody=el('tbody');
  rows.forEach(values=>{
    const tr=el('tr');
    values.forEach(v=>tr.append(el('td','',cap(v))));
    tbody.append(tr);
  });
  tbl.append(tbody);box.append(tbl);
  return box;
}
function renderLinked(data){
  const m=data.matricula||{};
  setStatus('mi-matricula','Datos verificados','Ficha académica vinculada a tu NostraCUENTA.');
  infoRows($('mi-matricula'),[['Programa',m.ciclo],['Plan',m.plan],['Turno',m.turno],['Grupo',m.grupo],['Matrícula acordada',soles(m.matriculaAcordada)],['Pensión acordada',soles(m.pensionAcordada)]]);
  const summary=$('np-inicio');
  if(summary){
    const card=$('np-linked-information');
    if(!card){
      const p=el('p','np-linked-banner','Matrícula oficial vinculada · '+cap(m.ciclo)+' · '+cap(m.turno));
      p.id='np-linked-information';summary.querySelector('.np-intro-copy')?.append(p);
    }
  }
  const attendance=Array.isArray(data.asistencias)?data.asistencias:[];
  const late=attendance.filter(x=>x.estado==='tardanza').length;
  setStatus('mis-asistencias','Historial disponible',attendance.length+' registros consultados · '+late+' tardanzas. Solo se muestran tus propias marcaciones.');
  const attendanceCard=$('mis-asistencias');
  if(attendance.length)infoRows(attendanceCard,[['Último registro',attendance[0].fecha],['Última entrada',attendance[0].entrada||'—'],['Estado',statusLabel(attendance[0].estado)]]);
  const dues=Array.isArray(data.cuotas)?data.cuotas:[];
  const pending=dues.reduce((sum,x)=>sum+(Number(x.saldoCentimos)||0),0)/100;
  setStatus('mis-pagos','Cuotas disponibles',dues.length+' cuotas programadas · '+soles(pending)+' pendiente (excluye conceptos no programados).');
  const grades=Array.isArray(data.reportes)?data.reportes:[];
  setStatus('mis-notas',grades.length?'Reportes disponibles':'Sin reportes publicados',
    grades.length?grades.length+' informes académicos asociados con tu cuenta.':'Coordinación aún no ha publicado informes individuales.');
  const root=$('nostraportal-body'),lab=$('nostralab');
  if(!root||!lab)return;
  const details=el('div','np-personal-sections');
  const at=lineSection('Mis asistencias','Registros existentes de entrada, salida y tardanza. No se calculan faltas sin un cronograma de clases validado.');
  at.id='np-asistencias-detalle';
  at.append(attendance.length?
    table(['Fecha','Entrada','Salida','Estado','Tardanza'],attendance.slice(0,25).map(x=>[x.fecha,x.entrada||'—',x.salida||'—',statusLabel(x.estado),x.estado==='tardanza'?(x.minutosTardanza||0)+' min':'—'])):
    el('p','np-empty','Todavía no encontramos registros de asistencia para tu ficha.'));
  details.append(at);
  const pay=lineSection('Mis cuotas','Los saldos se leen del cronograma oficial. La matrícula y los abonos anteriores no se recalculan.');
  pay.id='np-cuotas-detalle';
  pay.append(dues.length?
    table(['Concepto','Vencimiento','Programado','Pagado','Saldo','Estado'],dues.slice(0,35).map(x=>[x.concepto,x.fechaVencimiento,soles(x.programadoCentimos/100),soles(x.pagadoCentimos/100),soles(x.saldoCentimos/100),statusLabel(x.estado)])):
    el('p','np-empty','Coordinación aún no ha creado cuotas para esta ficha.'));
  details.append(pay);
  const reports=lineSection('Mis notas y reportes','Informes individuales publicados por Coordinación tras las verificaciones académicas.');
  reports.id='np-notas-detalle';
  if(grades.length){
    const list=el('div','np-report-list');
    grades.forEach(item=>{
      const card=el('article','np-report-item');
      card.append(el('strong','',item.titulo||item.evaluacion),el('span','',item.fecha||'Fecha no indicada'));
      const note=el('small','','Documento registrado. Consulta con Coordinación para obtener una copia mientras se habilita la descarga privada.');
      card.append(note);list.append(card);
    });
    reports.append(list);
  }else reports.append(el('p','np-empty','Todavía no se han publicado reportes de notas en tu cuenta.'));
  details.append(reports);
  root.insertBefore(details,lab);
}
export function clearStudentPrivateData(){generation+=1;}
export async function loadStudentPrivateData(user){
  const current=++generation;
  try{
    if(!user)return;
    const token=await user.getIdToken();
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'student_state'})});
    let body;
    try{body=await response.json()}catch(_){throw Error('Servicio de datos personales no disponible')}
    if(!response.ok||!body.ok)throw Error(body.message||'Acceso temporalmente no disponible');
    if(current!==generation)return;
    const data=body.data;
    if(!data?.vinculado){
      ['mis-asistencias','mis-notas','mis-pagos','mi-matricula'].forEach(id=>setStatus(id,'Vinculación pendiente','Coordinación debe asociar tu cuenta a una matrícula oficial antes de mostrar datos personales.'));
      return;
    }
    renderLinked(data);
  }catch(error){
    if(current!==generation)return;
    ['mis-asistencias','mis-notas','mis-pagos','mi-matricula'].forEach(id=>setStatus(id,'Conexión pendiente','El servicio de datos personales todavía no está disponible. Tus datos administrativos permanecen protegidos.'));
    console.warn('NostraPORTAL: datos individuales pendientes de habilitación.',error);
  }
}
