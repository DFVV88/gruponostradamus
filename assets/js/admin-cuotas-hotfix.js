/* ==================================================
   Grupo Nostradamus - Hotfix de creación de cuotas
   Corrige la referencia groupId/grupoId sin alterar pagos existentes.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  setDoc,
  updateDoc,
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
const PRE_COLLECTION = 'preinscripciones';
const ENROLLMENT_COLLECTION = 'matriculas';
const INSTALLMENT_COLLECTION = 'alumno_cuotas';
const MIN_DATE = '2026-01-01';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentRecordId = '';
let busy = false;
let initialized = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const cents = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};
const dateLabel = value => {
  const date = value ? new Date(`${value}T12:00:00`) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('es-PE') : value || '-';
};

function setMessage(type,text){
  const element = document.getElementById('student-price-message');
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function readableError(error){
  const code = clean(error?.code || 'error-desconocido').replace(/^firestore\//,'');
  const detail = clean(error?.message || '');
  console.error('No se pudo crear la cuota.',error);
  if(code.includes('permission-denied')) return 'Firebase rechazó el permiso para crear la cuota.';
  if(code.includes('unavailable') || code.includes('network')) return 'Se perdió la conexión con Firebase. Inténtalo nuevamente.';
  return `No se pudo crear la cuota. Código: ${code}${detail ? ` · ${detail.slice(0,180)}` : ''}`;
}

function captureRecord(event){
  const button = event.target.closest('[data-open],[data-pay],[data-npm-open],[data-npm-payment]');
  if(!button) return;
  currentRecordId = clean(
    button.dataset.open ||
    button.dataset.pay ||
    button.dataset.npmOpen ||
    button.dataset.npmPayment
  );
}

function refreshSchedule(){
  if(!currentRecordId) return;
  const temporary = document.createElement('button');
  temporary.type = 'button';
  temporary.hidden = true;
  temporary.dataset.open = currentRecordId;
  document.body.appendChild(temporary);
  temporary.click();
  temporary.remove();
}

async function createInstallment(event){
  const form = event.target;
  if(!form.matches('#student-installment-form') || !currentUser) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  if(busy) return;

  const concept = clean(document.getElementById('student-installment-concept')?.value);
  const amount = cents(document.getElementById('student-installment-amount')?.value);
  const dueDate = clean(document.getElementById('student-installment-date')?.value);

  if(!currentRecordId) return setMessage('err','No se pudo identificar al alumno. Cierra y vuelve a abrir su ficha.');
  if(concept.length < 3) return setMessage('err','Escribe el concepto de la cuota.');
  if(amount <= 0 || amount > 100000000) return setMessage('err','Ingresa un monto válido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || dueDate < MIN_DATE){
    return setMessage('err','Selecciona una fecha de vencimiento válida.');
  }

  const submit = form.querySelector('button[type="submit"]');
  try{
    busy = true;
    if(submit){ submit.disabled = true; submit.textContent = 'Agregando...'; }
    setMessage('info','Verificando la matrícula oficial y creando la cuota...');

    const [preSnapshot,enrollmentSnapshot,installmentsSnapshot] = await Promise.all([
      getDoc(doc(db,PRE_COLLECTION,currentRecordId)),
      getDoc(doc(db,ENROLLMENT_COLLECTION,currentRecordId)),
      getDocs(query(
        collection(db,INSTALLMENT_COLLECTION),
        where('preinscripcionId','==',currentRecordId),
        limit(100)
      ))
    ]);

    if(!preSnapshot.exists()) throw Object.assign(new Error('No existe la preinscripción.'),{code:'not-found'});
    const record = {id:preSnapshot.id,...preSnapshot.data()};
    const enrollment = enrollmentSnapshot.exists() ? enrollmentSnapshot.data() : null;
    const enrolled = Boolean(enrollment) || record.matriculaAprobada === true || record.estado === 'matriculado';
    if(!enrolled) throw Object.assign(new Error('La matrícula oficial no está aprobada.'),{code:'matricula-requerida'});

    const studentName = clean(record.nombre || enrollment?.alumnoNombre);
    const studentDni = clean(record.dni || enrollment?.dni);
    const groupId = clean(record.grupoId || enrollment?.grupoId) || 'grupo-por-confirmar';
    if(studentName.length < 5 || studentDni.length < 6){
      throw Object.assign(new Error('La ficha no contiene nombre o DNI válidos.'),{code:'datos-incompletos'});
    }

    const nextNumber = installmentsSnapshot.docs.reduce((maximum,item) => {
      return Math.max(maximum,Number(item.data().numeroCuota || 0));
    },0) + 1;
    const installmentRef = doc(collection(db,INSTALLMENT_COLLECTION));
    const email = clean(currentUser.email || ADMIN_EMAIL);

    await setDoc(installmentRef,{
      cuotaId:installmentRef.id,
      preinscripcionId:currentRecordId,
      registroAlumnoId:currentRecordId,
      matriculaId:currentRecordId,
      alumnoNombre:studentName,
      alumnoDni:studentDni,
      grupoId:groupId,
      concepto:concept,
      numeroCuota:nextNumber,
      montoProgramadoCentimos:amount,
      montoPagadoCentimos:0,
      saldoPendienteCentimos:amount,
      fechaVencimiento:dueDate,
      estado:'pendiente',
      origen:'cronograma_manual_admin',
      creadoPor:email,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    try{
      await updateDoc(doc(db,PRE_COLLECTION,currentRecordId),{
        cronogramaCuotasActivo:true,
        cronogramaActualizadoPor:email,
        cronogramaUpdatedAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    }catch(summaryError){
      console.warn('La cuota fue creada, pero no se actualizó el resumen de la ficha.',summaryError);
    }

    form.reset();
    setMessage('ok',`Cuota “${concept}” creada con vencimiento ${dateLabel(dueDate)}.`);
    refreshSchedule();
  }catch(error){
    if(error?.code === 'matricula-requerida') setMessage('err','No se pudo crear la cuota porque la matrícula oficial no está aprobada.');
    else if(error?.code === 'datos-incompletos') setMessage('err','No se pudo crear la cuota. Revisa el nombre y DNI del alumno.');
    else setMessage('err',readableError(error));
  }finally{
    busy = false;
    if(submit){ submit.disabled = false; submit.textContent = 'Agregar cuota'; }
  }
}

function initialize(){
  if(initialized) return;
  initialized = true;
  document.addEventListener('click',captureRecord,true);
  document.addEventListener('submit',createInstallment,true);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) initialize();
});

/*
 * Carga las correcciones visuales y de vouchers después de registrar
 * primero este interceptador, para que el hotfix tenga prioridad.
 */
import('./admin-correcciones-pagos-cuotas.js?v=2026-08-02-3').catch(error => {
  console.error('No se pudieron cargar las correcciones de pagos y cuotas.',error);
});

import('./admin-cierres-hotfix.js?v=2026-08-03-2').catch(error => {
  console.error('No se pudo cargar la validación V2 del cierre diario.',error);
});
