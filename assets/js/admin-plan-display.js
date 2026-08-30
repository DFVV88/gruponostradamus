/* Grupo Nostradamus - Visibilidad de programa, plan y pago inicial en administración */
import './admin-reclamos-panel.js?v=2026-01';
import './admin-pagos-matriculas.js?v=2026-08-21-culqi-finance-1';
import './admin-preinscripciones-acordeon.js?v=2026-08-02-1';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};
const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let records = new Map();
let observer = null;
let observedBody = null;
let decorateQueued = false;
let loadingRecords = false;

function clean(value){ return String(value == null ? '' : value).trim(); }
function esc(value){
  return String(value == null ? '' : value).replace(/[&<>'\"]/g,c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'
  }[c]));
}
function timestampDate(value){
  if(!value) return null;
  if(typeof value.toDate === 'function') return value.toDate();
  if(Number.isFinite(Number(value.seconds))) return new Date(Number(value.seconds) * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatTableDate(value){
  const date = timestampDate(value);
  if(!date) return '-';
  return new Intl.DateTimeFormat('es-PE',{
    timeZone:'America/Lima', year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hour12:true
  }).format(date).replace(',', ' ·');
}
function splitPersonName(value){
  const parts = clean(value).split(/\s+/).filter(Boolean);
  if(parts.length <= 1) return {names:parts.join(' '), surnames:''};
  if(parts.length === 2) return {names:parts[0], surnames:parts[1]};
  if(parts.length === 3) return {names:parts[0], surnames:parts.slice(1).join(' ')};
  return {names:parts.slice(0,2).join(' '), surnames:parts.slice(2).join(' ')};
}
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 0;
}
function money(value){ return 'S/ ' + num(value).toFixed(2); }
function snapshot(record){
  return record && typeof record.tarifarioSnapshot === 'object' && record.tarifarioSnapshot
    ? record.tarifarioSnapshot
    : {};
}
function totalInitial(record){
  const snap = snapshot(record);
  return num(record.totalInicial) || num(record.montoPagoInicial) || num(snap.totalInicial);
}
function appliedPrice(record){
  const snap = snapshot(record);
  return num(record.precioReferencia) || num(snap.precioAplicado);
}
function planName(record){
  const snap = snapshot(record);
  return clean(record.planAsignado || record.planNombre || snap.planNombre);
}
function purchaseConcept(record){
  const snap = snapshot(record);
  return clean(record.conceptoPagoInicial || snap.conceptoInicial);
}

function ensureTablePresentationStyles(){
  if(document.getElementById('nostra-preinscripciones-readable-layout')) return;
  const style = document.createElement('style');
  style.id = 'nostra-preinscripciones-readable-layout';
  style.textContent = `
    .preinscripciones-table th:nth-child(1){width:20%!important}
    .preinscripciones-table th:nth-child(2){width:15%!important}
    .preinscripciones-table th:nth-child(3){width:16%!important}
    .preinscripciones-table th:nth-child(4){width:18%!important}
    .preinscripciones-table th:nth-child(5){width:15%!important}
    .preinscripciones-table th:nth-child(6){width:7%!important}
    .preinscripciones-table th:nth-child(7),
    .preinscripciones-table td.col-asesor{display:none!important}
    .preinscripciones-table th:nth-child(8){width:9%!important}
    .preinscripciones-table .nostra-admin-price,
    .preinscripciones-table .nostra-admin-initial-total{display:none!important}
    .preinscripciones-table .row-given-names{
      display:block;color:#061426;font-weight:900;font-size:14px;line-height:1.12;margin:0 0 2px;
    }
    .preinscripciones-table .row-surnames{
      display:block;color:#061426;font-weight:800;font-size:13px;line-height:1.12;margin:0 0 5px;
    }
    .preinscripciones-table .row-dni{margin-top:0!important}
    .preinscripciones-table .cell-date-created,
    .preinscripciones-table .cell-date-updated{
      display:block;white-space:nowrap;font-variant-numeric:tabular-nums;letter-spacing:-.01em;
    }
    .preinscripciones-table .cell-date-created{
      color:#061426;font-size:11px;font-weight:900;line-height:1.25;
    }
    .preinscripciones-table .cell-date-updated{
      color:#526170;font-size:10.5px;font-weight:600;line-height:1.25;margin-top:5px;
    }
  `;
  document.head.appendChild(style);
}

function syncLine(cell,className,css,text){
  if(!cell) return;
  let line = cell.querySelector('.' + className);
  if(!text){
    if(line) line.remove();
    return;
  }
  if(!line){
    line = document.createElement('small');
    line.className = className;
    line.style.cssText = css;
    cell.appendChild(line);
  }
  if(line.textContent !== text) line.textContent = text;
}

function decorateRows(){
  const body = document.getElementById('rows');
  if(!body) return;
  ensureTablePresentationStyles();

  body.querySelectorAll('tr').forEach(row => {
    const button = row.querySelector('[data-open],[data-pay]');
    const id = button?.dataset.open || button?.dataset.pay;
    const record = records.get(id);
    if(!record) return;

    const cells = row.querySelectorAll('td');
    if(cells.length < 5) return;
    const studentCell = row.querySelector('.col-alumno') || cells[0];
    const cycleCell = row.querySelector('.col-ciclo') || cells[1];
    const registrationCell = row.querySelector('.col-registro') || cells[3];
    const paymentCell = row.querySelector('.col-pago') || cells[4];

    const person = splitPersonName(record.nombre);
    studentCell.innerHTML = `
      <b class="row-given-names">${esc(person.names || record.nombre)}</b>
      ${person.surnames ? `<span class="row-surnames">${esc(person.surnames)}</span>` : ''}
      <small class="row-dni">DNI: ${esc(record.dni)}</small>`;

    const registered = formatTableDate(record.createdAt);
    const updated = formatTableDate(record.updatedAt);
    registrationCell.innerHTML = `
      <span class="cell-date-created">${esc(registered)}</span>
      ${record.updatedAt ? `<small class="cell-date-updated">Act. ${esc(updated)}</small>` : ''}`;

    const plan = planName(record);
    syncLine(
      cycleCell,
      'nostra-admin-plan',
      'display:block;margin-top:4px;color:#075b65;font-weight:900;',
      plan ? 'Plan: ' + plan : ''
    );

    const assigned = num(record.pensionAcordada);
    const reference = appliedPrice(record);
    const priceText = assigned
      ? 'Pensión acordada: ' + money(assigned)
      : reference
        ? 'Precio del plan: ' + money(reference)
        : '';
    syncLine(
      paymentCell,
      'nostra-admin-price',
      'display:block;margin-top:5px;color:#4b5d70;font-weight:850;',
      priceText
    );

    const initial = totalInitial(record);
    syncLine(
      paymentCell,
      'nostra-admin-initial-total',
      'display:block;margin-top:4px;color:#075b65;font-weight:950;',
      initial ? 'Pago inicial: ' + money(initial) : ''
    );
  });
}

function scheduleDecorate(){
  if(decorateQueued) return;
  decorateQueued = true;
  window.requestAnimationFrame(() => {
    decorateQueued = false;
    decorateRows();
  });
}

async function loadRecords(){
  if(loadingRecords) return;
  loadingRecords = true;
  try{
    const snap = await getDocs(query(collection(db,'preinscripciones'),orderBy('createdAt','desc'),limit(200)));
    records = new Map(snap.docs.map(item => [item.id,{id:item.id,...item.data()}]));
    scheduleDecorate();
  }catch(error){
    console.warn('No se pudo complementar la tabla con planes y montos:',error);
  }finally{
    loadingRecords = false;
  }
}

function ensureObserver(){
  const body = document.getElementById('rows');
  if(!body) return;
  if(observer && observedBody === body) return;

  if(observer) observer.disconnect();
  observedBody = body;
  observer = new MutationObserver(() => scheduleDecorate());

  /*
   * Solo se observan filas añadidas o retiradas directamente del tbody.
   * Los textos decorativos se insertan dentro de las celdas y, por tanto,
   * no vuelven a activar este observador ni generan un ciclo infinito.
   */
  observer.observe(body,{childList:true,subtree:false});
}

function detail(label,value){
  const div = document.createElement('div');
  div.className = 'detail nostra-plan-extra';
  div.innerHTML = '<b>' + esc(label) + '</b><span>' + esc(value || '-') + '</span>';
  return div;
}
function yesNo(value){ return value === true ? 'Sí' : 'No'; }

async function getRecord(id){
  if(records.has(id)) return records.get(id);
  const snapDoc = await getDoc(doc(db,'preinscripciones',id));
  if(!snapDoc.exists()) return null;
  const record = {id:snapDoc.id,...snapDoc.data()};
  records.set(id,record);
  return record;
}

async function decorateModal(id){
  try{
    const record = await getRecord(id);
    if(!record) return;

    const pricing = snapshot(record);
    const grid = document.getElementById('detail-grid');
    if(!grid) return;
    grid.querySelectorAll('.nostra-plan-extra').forEach(el => el.remove());

    grid.appendChild(detail('Código de solicitud',record.codigoSolicitud || record.id));
    grid.appendChild(detail('Plan elegido',planName(record)));
    grid.appendChild(detail('Modalidad',record.modalidad || pricing.modalidad));
    grid.appendChild(detail('Turno',record.turno || pricing.turno));
    grid.appendChild(detail('Concepto del pago inicial',purchaseConcept(record)));
    if(appliedPrice(record)) grid.appendChild(detail('Precio aplicado del plan',money(appliedPrice(record))));
    const enrollment = num(record.matriculaReferencia) || num(pricing.matricula);
    grid.appendChild(detail('Matrícula',enrollment ? money(enrollment) : 'No aplica'));
    if(totalInitial(record)) grid.appendChild(detail('Total inicial registrado',money(totalInitial(record))));
    grid.appendChild(detail('Pagos posteriores',record.detallePagosPosteriores || pricing.detallePagosPosteriores));
    grid.appendChild(detail('Precio validado por servidor',yesNo(record.precioValidadoServidor)));
    grid.appendChild(detail(
      'Aceptación legal',
      record.aceptaTerminos && record.aceptaCambiosDevoluciones && record.aceptaPrivacidad
        ? 'Sí · versión ' + clean(record.aceptacionLegalVersion || record.aceptacionLegal?.version)
        : 'No registrada'
    ));

    if(num(record.pensionAcordada)) grid.appendChild(detail('Pensión acordada',money(record.pensionAcordada)));
    if(num(record.proximaCuotaMonto)) grid.appendChild(detail('Próxima cuota especial',money(record.proximaCuotaMonto)));
  }catch(error){
    console.warn('No se pudo mostrar el resumen de compra en la ficha:',error);
  }
}

document.addEventListener('click',event => {
  const open = event.target.closest('[data-open],[data-pay]');
  if(open){
    const id = open.dataset.open || open.dataset.pay;
    window.setTimeout(() => decorateModal(id),60);
  }
  if(event.target.closest('#refresh-btn')) window.setTimeout(loadRecords,250);
});

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  if(!user || email !== ADMIN_EMAIL){
    if(observer) observer.disconnect();
    observer = null;
    observedBody = null;
    records = new Map();
    return;
  }
  ensureTablePresentationStyles();
  ensureObserver();
  loadRecords();
});