/* Grupo Nostradamus - Visibilidad de programa, plan y precio en administración */
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

function clean(value){ return String(value == null ? '' : value).trim(); }
function esc(value){
  return String(value == null ? '' : value).replace(/[&<>'"]/g,c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
function money(value){ return 'S/ ' + num(value).toFixed(2); }

function decorateRows(){
  const body = document.getElementById('rows');
  if(!body) return;
  body.querySelectorAll('tr').forEach(row => {
    const button = row.querySelector('[data-open],[data-pay]');
    const id = button?.dataset.open || button?.dataset.pay;
    const record = records.get(id);
    if(!record) return;
    const cells = row.querySelectorAll('td');
    if(cells.length < 4) return;

    cells[1].querySelectorAll('.nostra-admin-plan').forEach(el => el.remove());
    const plan = clean(record.planAsignado || record.planNombre);
    if(plan){
      const line = document.createElement('small');
      line.className = 'nostra-admin-plan';
      line.style.cssText = 'display:block;margin-top:4px;color:#075b65;font-weight:900;';
      line.textContent = 'Plan: ' + plan;
      cells[1].appendChild(line);
    }

    cells[3].querySelectorAll('.nostra-admin-price').forEach(el => el.remove());
    const assigned = num(record.pensionAcordada);
    const reference = num(record.precioReferencia);
    if(assigned || reference){
      const line = document.createElement('small');
      line.className = 'nostra-admin-price';
      line.style.cssText = 'display:block;margin-top:5px;color:#4b5d70;font-weight:850;';
      line.textContent = assigned ? 'Pensión acordada: ' + money(assigned) : 'Precio referencial: ' + money(reference);
      cells[3].appendChild(line);
    }
  });
}
async function loadRecords(){
  try{
    const snap = await getDocs(query(collection(db,'preinscripciones'),orderBy('createdAt','desc'),limit(200)));
    records = new Map(snap.docs.map(item => [item.id,{id:item.id,...item.data()}]));
    decorateRows();
  }catch(error){
    console.warn('No se pudo complementar la tabla con planes:',error);
  }
}
function ensureObserver(){
  const body = document.getElementById('rows');
  if(!body || observer) return;
  observer = new MutationObserver(decorateRows);
  observer.observe(body,{childList:true,subtree:true});
}
function detail(label,value){
  const div = document.createElement('div');
  div.className = 'detail nostra-plan-extra';
  div.innerHTML = '<b>' + esc(label) + '</b><span>' + esc(value || '-') + '</span>';
  return div;
}
async function decorateModal(id){
  try{
    const snap = await getDoc(doc(db,'preinscripciones',id));
    if(!snap.exists()) return;
    const record = {id:snap.id,...snap.data()};
    records.set(id,record);
    const grid = document.getElementById('detail-grid');
    if(!grid) return;
    grid.querySelectorAll('.nostra-plan-extra').forEach(el => el.remove());
    grid.appendChild(detail('Plan elegido',record.planAsignado || record.planNombre));
    if(num(record.precioReferencia)) grid.appendChild(detail('Precio referencial al registrarse',money(record.precioReferencia)));
    if(num(record.pensionAcordada)) grid.appendChild(detail('Pensión acordada',money(record.pensionAcordada)));
    if(num(record.proximaCuotaMonto)) grid.appendChild(detail('Próxima cuota especial',money(record.proximaCuotaMonto)));
  }catch(error){
    console.warn('No se pudo mostrar el plan en la ficha:',error);
  }
}

document.addEventListener('click',event => {
  const open = event.target.closest('[data-open],[data-pay]');
  if(open){
    const id = open.dataset.open || open.dataset.pay;
    setTimeout(() => decorateModal(id),60);
  }
  if(event.target.closest('#refresh-btn')) setTimeout(loadRecords,250);
});

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  if(!user || email !== ADMIN_EMAIL) return;
  ensureObserver();
  loadRecords();
});

import('./admin-nostra360-stage2.js?v=2026-03').catch(error => {
  console.warn('No se pudo cargar el editor de Nostra 360:',error);
});
