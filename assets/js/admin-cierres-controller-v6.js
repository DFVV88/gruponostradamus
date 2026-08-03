/* ==================================================
   Grupo Nostradamus - Controlador único de cierre diario V6
   Valida con movimientos frescos, consulta si el cierre existe y
   crea el documento directamente, sin transacciones.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const MOVEMENTS_COLLECTION = 'finanzas_movimientos';
const CLOSURES_COLLECTION = 'finanzas_cierres';
const CONTROL_START_DATE = '2026-08-01';
const TRANSFER_CATEGORY = 'transferencia_interna';
const MAX_CENTS = 100000000000;
const ACCOUNTS = [
  ['caja_efectivo','Caja en efectivo'],
  ['yape','Yape'],
  ['plin','Plin'],
  ['bcp','Cuenta BCP'],
  ['culqi','Pasarela Culqi'],
  ['otra','Otra cuenta']
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let busy = false;
let observer = null;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const money = cents => new Intl.NumberFormat('es-PE',{
  style:'currency',currency:'PEN'
}).format((Number(cents) || 0) / 100);

function todayIso(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function isAdmin(){
  return Boolean(currentUser)
    && clean(currentUser.email).toLowerCase() === ADMIN_EMAIL;
}

function errorCode(error){
  return clean(error?.code || 'error-desconocido').replace(/^firestore\//,'');
}

function setMessage(type,text){
  const element = document.getElementById('finance-close-form-message');
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function setBusy(value){
  busy = value;
  const save = document.getElementById('finance-close-save');
  const validate = document.getElementById('finance-close-validate');
  if(save){
    save.disabled = value;
    save.textContent = value ? 'Procesando cierre...' : 'Guardar cierre definitivo';
  }
  if(validate) validate.disabled = value;
}

function toCents(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function validateInteger(label,value,{min=-MAX_CENTS,max=MAX_CENTS}={}){
  if(!Number.isSafeInteger(value)){
    throw Object.assign(new Error(`${label} no llegó como entero en céntimos.`),{code:'valor-no-entero'});
  }
  if(value < min || value > max){
    throw Object.assign(new Error(`${label} está fuera del rango permitido.`),{code:'valor-fuera-rango'});
  }
}

function readActualCents(accountId,label){
  const input = document.querySelector(`[data-close-actual="${accountId}"]`);
  if(!input){
    throw Object.assign(new Error(`No se encontró el saldo real de ${label}.`),{code:'campo-ausente'});
  }
  const raw = clean(input.value).replace(',','.');
  if(raw === ''){
    throw Object.assign(new Error(`Completa el saldo real de ${label}.`),{code:'saldo-vacio'});
  }
  const parsed = Number(raw);
  if(!Number.isFinite(parsed)){
    throw Object.assign(new Error(`El saldo real de ${label} no es válido.`),{code:'saldo-invalido'});
  }
  const cents = Math.round(parsed * 100);
  validateInteger(`${label}: saldo real`,cents);
  return cents;
}

function operationCount(items){
  const regular = items.filter(item => clean(item.categoria) !== TRANSFER_CATEGORY).length;
  const transfers = new Set(
    items
      .filter(item => clean(item.categoria) === TRANSFER_CATEGORY)
      .map(item => clean(item.numeroOperacion) || `${item.fechaOperacion}-${item.monto}`)
  );
  return regular + transfers.size;
}

async function loadFreshMovements(){
  const snapshot = await getDocs(query(
    collection(db,MOVEMENTS_COLLECTION),
    limit(5000)
  ));
  return snapshot.docs.map(item => ({id:item.id,...item.data()}));
}

function computeSnapshot(date,movements){
  const active = movements.filter(item =>
    clean(item.estado || 'activo') === 'activo'
    && clean(item.fechaOperacion) >= CONTROL_START_DATE
    && clean(item.fechaOperacion) <= date
    && ['ingreso','egreso'].includes(clean(item.tipo))
  );
  const previous = active.filter(item => clean(item.fechaOperacion) < date);
  const current = active.filter(item => clean(item.fechaOperacion) === date);
  const accounts = {};

  ACCOUNTS.forEach(([id,label]) => {
    const before = previous.filter(item => clean(item.cuenta) === id);
    const day = current.filter(item => clean(item.cuenta) === id);
    const opening = before.reduce((sum,item) => {
      const amount = toCents(item.monto);
      return sum + (clean(item.tipo) === 'ingreso' ? amount : -amount);
    },0);
    const entries = day
      .filter(item => clean(item.tipo) === 'ingreso')
      .reduce((sum,item) => sum + toCents(item.monto),0);
    const exits = day
      .filter(item => clean(item.tipo) === 'egreso')
      .reduce((sum,item) => sum + toCents(item.monto),0);
    accounts[id] = {id,label,opening,entries,exits,expected:opening + entries - exits};
  });

  const operational = current.filter(item => clean(item.categoria) !== TRANSFER_CATEGORY);
  return {
    accounts,
    dailyIncome:operational
      .filter(item => clean(item.tipo) === 'ingreso')
      .reduce((sum,item) => sum + toCents(item.monto),0),
    dailyExpense:operational
      .filter(item => clean(item.tipo) === 'egreso')
      .reduce((sum,item) => sum + toCents(item.monto),0),
    operations:operationCount(current)
  };
}

async function preparePayload(){
  if(!isAdmin()){
    throw Object.assign(new Error('La sesión administrativa no es válida.'),{code:'sesion-invalida'});
  }

  const date = clean(document.getElementById('finance-close-date')?.value);
  const observation = clean(document.getElementById('finance-close-observation')?.value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < CONTROL_START_DATE || date > todayIso()){
    throw Object.assign(new Error('Selecciona una fecha válida desde el 1 de agosto de 2026 hasta hoy.'),{code:'fecha-invalida'});
  }

  const snapshot = computeSnapshot(date,await loadFreshMovements());
  const accountPayload = {};

  ACCOUNTS.forEach(([id,label]) => {
    const account = snapshot.accounts[id];
    const actual = readActualCents(id,label);
    const expected = account.opening + account.entries - account.exits;
    const difference = actual - expected;

    validateInteger(`${label}: saldo inicial`,account.opening);
    validateInteger(`${label}: entradas`,account.entries,{min:0});
    validateInteger(`${label}: salidas`,account.exits,{min:0});
    validateInteger(`${label}: saldo esperado`,expected);
    validateInteger(`${label}: diferencia`,difference);

    accountPayload[id] = {
      saldoInicialCentimos:account.opening,
      entradasCentimos:account.entries,
      salidasCentimos:account.exits,
      saldoEsperadoCentimos:expected,
      saldoRealCentimos:actual,
      diferenciaCentimos:difference
    };
  });

  const expectedTotal = Object.values(accountPayload)
    .reduce((sum,item) => sum + item.saldoEsperadoCentimos,0);
  const realTotal = Object.values(accountPayload)
    .reduce((sum,item) => sum + item.saldoRealCentimos,0);
  const differenceTotal = realTotal - expectedTotal;

  validateInteger('Ingresos del día',snapshot.dailyIncome,{min:0});
  validateInteger('Egresos del día',snapshot.dailyExpense,{min:0});
  validateInteger('Número de operaciones',snapshot.operations,{min:0,max:100000});
  validateInteger('Saldo esperado total',expectedTotal);
  validateInteger('Saldo real total',realTotal);
  validateInteger('Diferencia total',differenceTotal);

  if(differenceTotal !== 0 && observation.length < 5){
    throw Object.assign(new Error('Escribe una observación de al menos 5 caracteres para explicar la diferencia.'),{code:'observacion-requerida'});
  }

  return {
    fechaCierre:date,
    estado:'cerrado',
    cuentas:accountPayload,
    totalIngresosDiaCentimos:snapshot.dailyIncome,
    totalEgresosDiaCentimos:snapshot.dailyExpense,
    operacionesDia:snapshot.operations,
    saldoEsperadoTotalCentimos:expectedTotal,
    saldoRealTotalCentimos:realTotal,
    diferenciaTotalCentimos:differenceTotal,
    tieneDiferencia:differenceTotal !== 0,
    observacion:observation,
    cerradoPor:clean(currentUser.email || ADMIN_EMAIL),
    origen:'cierre_diario_admin',
    version:'2026-08',
    closedAt:serverTimestamp(),
    createdAt:serverTimestamp()
  };
}

function finishSuccess(message){
  setMessage('ok',message);
  const save = document.getElementById('finance-close-save');
  if(save) save.disabled = true;
  document.getElementById('finance-refresh')?.click();
  window.setTimeout(() => {
    document.getElementById('finance-close-back')?.classList.remove('show');
    document.getElementById('finance-refresh')?.click();
  },900);
}

async function validateOnly(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  if(busy || !isAdmin()) return;
  try{
    setBusy(true);
    setMessage('info','Recalculando movimientos y verificando las seis cuentas...');
    const payload = await preparePayload();
    setMessage('ok',`Cierre verificado. Saldo esperado ${money(payload.saldoEsperadoTotalCentimos)}, saldo real ${money(payload.saldoRealTotalCentimos)} y diferencia ${money(payload.diferenciaTotalCentimos)}.`);
  }catch(error){
    console.error('Validación V6 del cierre:',error);
    setMessage('err',clean(error?.message) || 'No se pudo validar el cierre.');
  }finally{
    setBusy(false);
  }
}

async function saveClosure(event){
  const form = event.target;
  if(!form.matches('#finance-close-form')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(busy || !isAdmin()) return;

  try{
    setBusy(true);
    setMessage('info','Validando el cierre antes de consultar Firebase...');
    const payload = await preparePayload();
    const closureRef = doc(db,CLOSURES_COLLECTION,payload.fechaCierre);

    const confirmed = window.confirm(
      `¿Guardar el cierre definitivo del ${payload.fechaCierre}?\n\n`
      + `Saldo esperado: ${money(payload.saldoEsperadoTotalCentimos)}\n`
      + `Saldo real: ${money(payload.saldoRealTotalCentimos)}\n`
      + `Diferencia: ${money(payload.diferenciaTotalCentimos)}\n\n`
      + 'Después no podrá editarse ni eliminarse.'
    );
    if(!confirmed){
      setMessage('info','Cierre verificado, pero todavía no fue guardado.');
      return;
    }

    setMessage('info','Comprobando si la fecha ya tiene un cierre...');
    let existing;
    try{
      existing = await getDoc(closureRef);
    }catch(readError){
      const code = errorCode(readError);
      console.error('Lectura previa del cierre:',readError);
      throw Object.assign(
        new Error(`Firebase rechazó la lectura previa del cierre. Código: ${code}.`),
        {code:`lectura-${code}`}
      );
    }

    if(existing.exists()){
      finishSuccess('Esta fecha ya tiene un cierre registrado y protegido.');
      return;
    }

    setMessage('info','Creando el cierre definitivo en Firebase...');
    try{
      await setDoc(closureRef,payload);
    }catch(writeError){
      const code = errorCode(writeError);
      console.error('Creación directa del cierre:',writeError);
      let saved = false;
      try{
        saved = (await getDoc(closureRef)).exists();
      }catch(verifyError){
        console.warn('No se pudo verificar el cierre después del error.',verifyError);
      }
      if(saved){
        finishSuccess('El cierre quedó registrado y protegido correctamente.');
        return;
      }
      throw Object.assign(
        new Error(`Firebase rechazó la escritura directa del cierre. Código: ${code}. Usuario: ${clean(currentUser?.email || '-')}.`),
        {code:`escritura-${code}`}
      );
    }

    const verification = await getDoc(closureRef);
    if(!verification.exists()){
      throw Object.assign(new Error('Firebase no confirmó el documento después de guardarlo.'),{code:'verificacion-fallida'});
    }
    finishSuccess('Cierre diario registrado y protegido correctamente.');
  }catch(error){
    console.error('Controlador V6 del cierre:',error);
    setMessage('err',clean(error?.message) || `No se pudo guardar el cierre. Código: ${errorCode(error)}.`);
  }finally{
    setBusy(false);
  }
}

function ensureValidateButton(){
  const actions = document.querySelector('#finance-close-form .nf-form-actions');
  const save = document.getElementById('finance-close-save');
  if(!actions || !save) return;
  let validate = document.getElementById('finance-close-validate');
  if(!validate){
    validate = document.createElement('button');
    validate.type = 'button';
    validate.id = 'finance-close-validate';
    validate.className = 'btn btn-light';
    validate.textContent = 'Validar cierre';
    actions.insertBefore(validate,save);
  }
  actions.style.gap = '10px';
  actions.style.flexWrap = 'wrap';
}

function initialize(){
  if(window.__NOSTRA_CIERRE_V6__) return;
  window.__NOSTRA_CIERRE_V6__ = true;

  document.addEventListener('submit',saveClosure,true);
  document.addEventListener('click',event => {
    if(event.target.closest('#finance-close-validate')) validateOnly(event);
  },true);
  document.addEventListener('input',event => {
    if(event.target.closest('#finance-close-form') && !busy){
      const message = document.getElementById('finance-close-form-message');
      if(message?.classList.contains('ok')){
        setMessage('info','Los datos cambiaron. Valida nuevamente antes de guardar.');
      }
    }
  },true);

  ensureValidateButton();
  observer = new MutationObserver(ensureValidateButton);
  observer.observe(document.body,{childList:true,subtree:true});
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) initialize();
});
