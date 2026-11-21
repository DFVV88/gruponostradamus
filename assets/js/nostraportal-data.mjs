/* NostraPORTAL fase 2: la sesión consulta únicamente la API por UID verificado.
   Prohibido leer colecciones administrativas desde el navegador. */
const API='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostraportalApi';
const REPORT_API='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostrareportesApi';
let generation=0;
const $=id=>document.getElementById(id);
const el=(tag,className,value)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(value!==undefined&&value!==null)node.textContent=String(value);
  return node;
};
const soles=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?'S/ '+Number(value).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
const solesCentimos=value=>Number.isInteger(value)&&value>=0?soles(value/100):'—';
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
function updateLinkedCard(id,anchor,label){
  const card=$(id);
  const foot=card?.querySelector('.np-tool-pending');
  if(!foot)return;
  if(anchor){
    const a=el('a','np-tool-cta',label||'Ver detalles ↓');
    a.href=anchor;
    foot.replaceWith(a);
  }else foot.textContent=label||'Información sincronizada con NostraADMIN';
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
async function downloadPrivateReport(user,item,button){
  if(!user||!item?.id||button.disabled)return;
  const requestGeneration=generation;
  button.disabled=true;
  const previous=button.textContent;
  button.textContent='Verificando descarga...';
  try{
    const token=await user.getIdToken();
    if(!token)throw Error('Sesión no disponible.');
    const response=await fetch(REPORT_API,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({action:'student_report_download',reportId:item.id})
    });
    if(!response.ok){
      const error=await response.json().catch(()=>null);
      throw Error(error?.message||'No se pudo descargar el informe.');
    }
    if(!(response.headers.get('Content-Type')||'').includes('application/pdf'))
      throw Error('El servidor no devolvió un PDF.');
    const file=await response.blob();
    if(!file.size||file.size>8*1024*1024)throw Error('El archivo no supera la verificación de tamaño.');
    if(generation!==requestGeneration)
      throw Error('La sesión cambió durante la descarga.');
    const url=URL.createObjectURL(file);
    try{
      const anchor=document.createElement('a');
      anchor.href=url;
      anchor.download='NostraREPORTES-'+item.id+'.pdf';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    }finally{
      setTimeout(()=>URL.revokeObjectURL(url),120000);
    }
  }catch(error){
    button.textContent=error.message||'Error de descarga';
    setTimeout(()=>{if(button.isConnected)button.textContent=previous},5000);
  }finally{
    button.disabled=false;
    if(button.textContent==='Verificando descarga...')button.textContent=previous;
  }
}
function renderLinked(data,user){
  const m=data.matricula||{};
  setStatus('mi-matricula','Datos verificados','Ficha académica vinculada a tu NostraCUENTA.');
  updateLinkedCard('mi-matricula',null,'Datos sincronizados con NostraADMIN');
  infoRows($('mi-matricula'),[['Programa',m.ciclo],['Plan',m.plan],['Turno',m.turno],['Grupo',m.grupo],['Matrícula acordada',soles(m.matriculaAcordada)],['Pensión acordada',soles(m.pensionAcordada)]]);
  const personalSummary=document.querySelector('#nostraportal-body .np-summary-card:last-child');
  if(personalSummary){
    const value=personalSummary.querySelector('.np-summary-value');
    const subtitle=personalSummary.querySelector('.np-summary-foot');
    if(value)value.textContent='Vinculados';
    if(subtitle)subtitle.textContent='Ficha académica verificada';
  }
  const sectionNote=document.querySelector('#np-accesos .np-section-title p');
  if(sectionNote)sectionNote.textContent='Los datos de tu matrícula y los servicios integrados se consultan de forma privada.';
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
  setStatus('mis-asistencias',attendance.length?'Historial disponible':'Sin marcaciones',attendance.length?attendance.length+' registros consultados · '+late+' tardanzas. Solo se muestran tus propias marcaciones.':'Aún no se registran marcaciones para tu ficha oficial.');
  updateLinkedCard('mis-asistencias','#np-asistencias-detalle','Ver historial ↓');
  const attendanceCard=$('mis-asistencias');
  if(attendance.length)infoRows(attendanceCard,[['Último registro',attendance[0].fecha],['Última entrada',attendance[0].entrada||'—'],['Estado',statusLabel(attendance[0].estado)]]);
  const dues=Array.isArray(data.cuotas)?data.cuotas:[];
  const validBalances=dues.filter(x=>Number.isInteger(x.saldoCentimos)&&x.saldoCentimos>=0);
  const pending=validBalances.reduce((sum,x)=>sum+x.saldoCentimos,0)/100;
  setStatus('mis-pagos',dues.length?'Cuotas consultadas':'Sin cuotas programadas',!dues.length
    ?'No hay cuotas programadas en esta ficha. Esto no equivale a un estado de cuenta ni confirma ausencia de deudas.'
    :dues.length+' cuotas registradas · '+(validBalances.length===dues.length?soles(pending)+' saldo de cuotas programadas':'Algunos saldos aún no están disponibles')+'. No incluye otros conceptos financieros.');
  updateLinkedCard('mis-pagos','#np-cuotas-detalle','Ver cuotas ↓');
  const grades=Array.isArray(data.reportes)?data.reportes:[];
  setStatus('mis-notas',grades.length?'Reportes disponibles':'Sin reportes publicados',
    grades.length?grades.length+' informes académicos asociados con tu cuenta.':'Coordinación aún no ha publicado informes individuales.');
  updateLinkedCard('mis-notas','#np-notas-detalle','Ver reportes ↓');
  const privacy=document.querySelector('#nostraportal-body .np-privacy p');
  if(privacy)privacy.textContent='Tu matrícula, asistencias y cuotas se consultan mediante una sesión verificada. Sólo puedes ver datos asociados a tu ficha oficial.';
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
    table(['Concepto','Vencimiento','Programado','Pagado','Saldo','Estado'],dues.slice(0,35).map(x=>[x.concepto,x.fechaVencimiento,solesCentimos(x.programadoCentimos),solesCentimos(x.pagadoCentimos),solesCentimos(x.saldoCentimos),statusLabel(x.estado)])):
    el('p','np-empty','Coordinación aún no ha creado cuotas para esta ficha.'));
  details.append(pay);
  const reports=lineSection('Mis notas y reportes','Informes individuales publicados por Coordinación tras las verificaciones académicas.');
  reports.id='np-notas-detalle';
  if(grades.length){
    const list=el('div','np-report-list');
    grades.forEach(item=>{
      const card=el('article','np-report-item');
      card.append(el('strong','',item.titulo||item.evaluacion),el('span','',item.fecha||'Fecha no indicada'));
      const button=el('button','np-report-download','Descargar PDF');
      button.type='button';
      button.addEventListener('click',()=>downloadPrivateReport(user,item,button));
      card.append(button);list.append(card);
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
    renderLinked(data,user);
  }catch(error){
    if(current!==generation)return;
    ['mis-asistencias','mis-notas','mis-pagos','mi-matricula'].forEach(id=>setStatus(id,'Conexión pendiente','El servicio de datos personales todavía no está disponible. Tus datos administrativos permanecen protegidos.'));
    console.warn('NostraPORTAL: datos individuales pendientes de habilitación.',error);
  }
}
