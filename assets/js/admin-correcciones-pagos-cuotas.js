/* ==================================================
   Grupo Nostradamus - Correcciones de pagos y cuotas
   - Verifica la matrícula oficial antes de crear cuotas.
   - Permite adjuntar vouchers pendientes a ingresos existentes.
   - Acepta JPG, PNG, WEBP y PDF.
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

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
const STUDENT_COLLECTION = 'registros_alumnos';
const INSTALLMENT_COLLECTION = 'alumno_cuotas';
const FINANCE_COLLECTION = 'finanzas_movimientos';
const EVIDENCE_COLLECTION = 'comprobantes_pago';
const MIN_DATE = '2026-01-01';
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;
let currentRecordId = '';
let currentRecord = null;
let currentEnrollment = null;
let voucherBusy = false;
let installmentBusy = false;
let observer = null;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
})[char]);
const cents = value => {
  const number = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
};
const dateLabel = value => {
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
};

function isAdmin(){
  return currentUser && clean(currentUser.email).toLowerCase() === ADMIN_EMAIL;
}

function errorText(error,prefix){
  const code = clean(error?.code || 'error-desconocido').replace(/^firestore\//,'').replace(/^storage\//,'');
  const message = clean(error?.message || '');
  console.error(prefix,error);
  if(code.includes('permission-denied') || code.includes('unauthorized')){
    return `${prefix} Firebase rechazó el permiso (${code}).`;
  }
  if(code.includes('network') || code.includes('unavailable') || code.includes('retry-limit')){
    return `${prefix} Revisa la conexión e inténtalo otra vez (${code}).`;
  }
  if(code.includes('already-exists')) return `${prefix} El registro ya existe.`;
  return `${prefix} Código: ${code}${message ? ` · ${message.slice(0,180)}` : ''}`;
}

function setScheduleMessage(type,text){
  const element = document.getElementById('student-price-message');
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('nostra-fix-payment-styles')) return;
  const style = document.createElement('style');
  style.id = 'nostra-fix-payment-styles';
  style.textContent = `
    .nfix-voucher{margin:14px 0;padding:14px;border:1px solid rgba(7,140,149,.25);border-radius:17px;background:#f8fdff}
    .nfix-voucher h4{margin:0;color:#061426;font-family:'Baloo 2';font-size:22px;line-height:1}
    .nfix-voucher>p{margin:5px 0 11px;color:#647482;font-size:11px;line-height:1.45}
    .nfix-voucher-grid{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;align-items:end}
    .nfix-voucher-grid label span{display:block;margin-bottom:5px;color:#061426;font-size:9px;font-weight:950;text-transform:uppercase}
    .nfix-voucher-grid input{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px;background:#fff;font:inherit;font-size:12px}
    .nfix-voucher-grid .btn{white-space:nowrap}
    .nfix-voucher-status{margin-top:10px;padding:10px 12px;border-radius:13px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:800;line-height:1.45}
    .nfix-voucher-status.ok{background:#edfbea;color:#17672a}.nfix-voucher-status.err{background:#fff2f2;color:#b42318}
    .nfix-voucher-status img{width:72px;height:54px;object-fit:cover;border-radius:9px;margin-right:10px;vertical-align:middle;border:1px solid #dce9ed}
    .nfix-voucher-status a{color:inherit;font-weight:950}
    @media(max-width:700px){.nfix-voucher-grid{grid-template-columns:1fr}.nfix-voucher-grid .btn{width:100%}}
  `;
  document.head.appendChild(style);
}

function ensureVoucherPanel(){
  const pricePanel = document.getElementById('student-price-panel');
  if(!pricePanel || document.getElementById('nfix-existing-voucher')) return;
  injectStyles();
  const panel = document.createElement('section');
  panel.id = 'nfix-existing-voucher';
  panel.className = 'nfix-voucher';
  panel.innerHTML = `
    <h4>Voucher del pago inicial</h4>
    <p>Adjunta la evidencia al ingreso financiero ya registrado. Esta acción no crea un segundo ingreso.</p>
    <div class="nfix-voucher-grid">
      <label><span>Archivo JPG, PNG, WEBP o PDF</span><input id="nfix-voucher-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"></label>
      <button type="button" class="btn btn-blue" id="nfix-voucher-save">Adjuntar voucher</button>
    </div>
    <div class="nfix-voucher-status" id="nfix-voucher-status">Abre la ficha de un alumno para consultar su comprobante.</div>`;
  const warning = pricePanel.querySelector('.student-price-warning');
  if(warning) warning.insertAdjacentElement('beforebegin',panel);
  else pricePanel.appendChild(panel);
  document.getElementById('nfix-voucher-save')?.addEventListener('click',attachExistingVoucher);
}

function setVoucherStatus(type,html){
  const element = document.getElementById('nfix-voucher-status');
  if(!element) return;
  element.className = `nfix-voucher-status ${type || ''}`;
  element.innerHTML = html;
}

function extensionFor(file){
  if(file.type === 'application/pdf') return 'pdf';
  if(file.type === 'image/png') return 'png';
  if(file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function validateVoucher(file){
  if(!file) return 'Selecciona un archivo.';
  if(!ALLOWED_TYPES.has(file.type)) return 'Formato no admitido. Usa JPG, PNG, WEBP o PDF.';
  if(file.size <= 0 || file.size > MAX_FILE_SIZE) return 'El archivo debe pesar como máximo 8 MB.';
  return '';
}

function voucherPreview(data){
  const visual = clean(data.contentType).startsWith('image/')
    ? `<img src="${esc(data.downloadUrl)}" alt="Voucher registrado">`
    : '<strong>PDF</strong> · ';
  return `${visual}<strong>Voucher registrado:</strong> ${esc(data.nombreOriginal || 'comprobante')} · <a href="${esc(data.downloadUrl)}" target="_blank" rel="noopener">Ver archivo</a>`;
}

async function loadContext(id){
  if(!isAdmin() || !id) return;
  ensureVoucherPanel();
  currentRecordId = id;
  currentRecord = null;
  currentEnrollment = null;
  try{
    const [preSnapshot,enrollmentSnapshot] = await Promise.all([
      getDoc(doc(db,PRE_COLLECTION,id)),
      getDoc(doc(db,ENROLLMENT_COLLECTION,id))
    ]);
    if(!preSnapshot.exists()) throw new Error('No se encontró la preinscripción.');
    currentRecord = {id:preSnapshot.id,...preSnapshot.data()};
    currentEnrollment = enrollmentSnapshot.exists()
      ? {id:enrollmentSnapshot.id,...enrollmentSnapshot.data()}
      : null;

    const enrolled = Boolean(currentEnrollment) || currentRecord.matriculaAprobada === true || currentRecord.estado === 'matriculado';
    [
      'student-plan-name','student-monthly-price','student-price-reason','student-price-save',
      'student-installment-concept','student-installment-amount','student-installment-date'
    ].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if(field) field.disabled = !enrolled;
    });
    const installmentSubmit = document.querySelector('#student-installment-form button[type="submit"]');
    if(installmentSubmit) installmentSubmit.disabled = !enrolled;

    if(enrolled){
      setScheduleMessage('ok','Matrícula oficial verificada. Puedes crear cuotas y registrar pagos.');
    }

    const movementId = clean(currentRecord.ingresoFinancieroId || currentEnrollment?.ingresoFinancieroId);
    const fileInput = document.getElementById('nfix-voucher-file');
    const saveButton = document.getElementById('nfix-voucher-save');
    if(fileInput) fileInput.value = '';
    if(!movementId){
      if(fileInput) fileInput.disabled = true;
      if(saveButton) saveButton.disabled = true;
      setVoucherStatus('','El alumno todavía no tiene un ingreso financiero vinculado.');
      return;
    }

    const evidenceSnapshot = await getDoc(doc(db,EVIDENCE_COLLECTION,movementId));
    if(evidenceSnapshot.exists()){
      if(fileInput) fileInput.disabled = true;
      if(saveButton) saveButton.disabled = true;
      setVoucherStatus('ok',voucherPreview(evidenceSnapshot.data()));
      return;
    }

    if(fileInput) fileInput.disabled = false;
    if(saveButton) saveButton.disabled = false;
    setVoucherStatus('','Ingreso financiero localizado. Falta adjuntar el voucher; no se generará un nuevo ingreso.');
  }catch(error){
    setVoucherStatus('err',esc(errorText(error,'No se pudo cargar la evidencia.')));
  }
}

async function attachExistingVoucher(){
  if(voucherBusy || !isAdmin() || !currentRecordId || !currentRecord) return;
  const input = document.getElementById('nfix-voucher-file');
  const button = document.getElementById('nfix-voucher-save');
  const file = input?.files?.[0];
  const validation = validateVoucher(file);
  if(validation) return setVoucherStatus('err',esc(validation));

  const movementId = clean(currentRecord.ingresoFinancieroId || currentEnrollment?.ingresoFinancieroId);
  if(!movementId) return setVoucherStatus('err','No existe un movimiento financiero para vincular el voucher.');

  let storagePath = '';
  let evidenceSaved = false;
  try{
    voucherBusy = true;
    if(button){ button.disabled = true; button.textContent = 'Subiendo...'; }
    setVoucherStatus('','Subiendo y vinculando el voucher al ingreso existente...');

    const [movementSnapshot,evidenceSnapshot] = await Promise.all([
      getDoc(doc(db,FINANCE_COLLECTION,movementId)),
      getDoc(doc(db,EVIDENCE_COLLECTION,movementId))
    ]);
    if(!movementSnapshot.exists()) throw Object.assign(new Error('El ingreso financiero no existe.'),{code:'not-found'});
    if(evidenceSnapshot.exists()) throw Object.assign(new Error('El ingreso ya cuenta con voucher.'),{code:'already-exists'});
    if(clean(movementSnapshot.data().preinscripcionId) !== currentRecordId){
      throw Object.assign(new Error('El ingreso no pertenece al alumno seleccionado.'),{code:'failed-precondition'});
    }

    const extension = extensionFor(file);
    storagePath = `comprobantes-pago/${currentRecordId}/pago-inicial/${movementId}-${Date.now()}.${extension}`;
    const storageRef = ref(storage,storagePath);
    await uploadBytes(storageRef,file,{
      contentType:file.type,
      cacheControl:'private,max-age=0,no-store',
      customMetadata:{
        preinscripcionId:currentRecordId,
        tipoPago:'pago-inicial',
        referencia:movementId,
        subidoPor:clean(currentUser.email || ADMIN_EMAIL)
      }
    });
    const downloadUrl = await getDownloadURL(storageRef);
    const email = clean(currentUser.email || ADMIN_EMAIL);
    await setDoc(doc(db,EVIDENCE_COLLECTION,movementId),{
      comprobanteId:movementId,
      preinscripcionId:currentRecordId,
      movimientoFinancieroId:movementId,
      cuotaId:'',
      abonoId:'',
      tipoPago:'pago_inicial',
      storagePath,
      downloadUrl,
      nombreOriginal:file.name.slice(0,180),
      contentType:file.type,
      sizeBytes:file.size,
      estado:'activo',
      origen:'voucher_admin',
      subidoPor:email,
      createdAt:serverTimestamp()
    });
    evidenceSaved = true;

    const summary = {
      comprobantePagoId:movementId,
      comprobantePagoUrl:downloadUrl,
      comprobantePagoStoragePath:storagePath,
      comprobantePagoNombre:file.name.slice(0,180),
      comprobantePagoContentType:file.type,
      comprobantePagoSizeBytes:file.size,
      comprobantePagoSubidoPor:email,
      comprobantePagoAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    };
    try{ await updateDoc(doc(db,PRE_COLLECTION,currentRecordId),summary); }
    catch(error){ console.warn('El voucher quedó vinculado; no se pudo actualizar el resumen de preinscripción.',error); }
    try{ await updateDoc(doc(db,STUDENT_COLLECTION,currentRecordId),summary); }
    catch(error){ console.warn('El voucher quedó vinculado; no se pudo actualizar el resumen académico.',error); }

    setVoucherStatus('ok',voucherPreview({
      downloadUrl,
      nombreOriginal:file.name,
      contentType:file.type
    }));
    if(input){ input.value = ''; input.disabled = true; }
  }catch(error){
    if(storagePath && !evidenceSaved){
      try{ await deleteObject(ref(storage,storagePath)); }
      catch(cleanupError){ console.warn('No se pudo limpiar el archivo no vinculado.',cleanupError); }
    }
    setVoucherStatus('err',esc(errorText(error,'No se pudo adjuntar el voucher.')));
  }finally{
    voucherBusy = false;
    if(button){
      button.textContent = 'Adjuntar voucher';
      button.disabled = evidenceSaved;
    }
  }
}

function refreshOriginalSchedule(){
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
  if(!form.matches('#student-installment-form') || !isAdmin()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(installmentBusy) return;

  const concept = clean(document.getElementById('student-installment-concept')?.value);
  const amount = cents(document.getElementById('student-installment-amount')?.value);
  const dueDate = clean(document.getElementById('student-installment-date')?.value);
  if(!currentRecordId) return setScheduleMessage('err','No se pudo identificar al alumno. Cierra y vuelve a abrir su ficha.');
  if(concept.length < 3) return setScheduleMessage('err','Escribe el concepto de la cuota.');
  if(amount <= 0 || amount > 100000000) return setScheduleMessage('err','Ingresa un monto válido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || dueDate < MIN_DATE){
    return setScheduleMessage('err','Selecciona una fecha de vencimiento válida.');
  }

  try{
    installmentBusy = true;
    const submit = form.querySelector('button[type="submit"]');
    if(submit){ submit.disabled = true; submit.textContent = 'Agregando...'; }
    setScheduleMessage('info','Verificando la matrícula oficial y creando la cuota...');

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
    const fresh = {id:preSnapshot.id,...preSnapshot.data()};
    const enrollment = enrollmentSnapshot.exists() ? enrollmentSnapshot.data() : null;
    const enrolled = Boolean(enrollment) || fresh.matriculaAprobada === true || fresh.estado === 'matriculado';
    if(!enrolled){
      throw Object.assign(new Error('Primero debes aprobar la matrícula oficial.'),{code:'matricula-requerida'});
    }

    const nextNumber = installmentsSnapshot.docs.reduce((maximum,item) => {
      return Math.max(maximum,Number(item.data().numeroCuota || 0));
    },0) + 1;
    const installmentRef = doc(collection(db,INSTALLMENT_COLLECTION));
    const email = clean(currentUser.email || ADMIN_EMAIL);
    const studentName = clean(fresh.nombre || enrollment?.alumnoNombre);
    const studentDni = clean(fresh.dni || enrollment?.dni);
    const groupId = clean(fresh.grupoId || enrollment?.grupoId) || 'grupo-por-confirmar';
    if(studentName.length < 5 || studentDni.length < 6){
      throw Object.assign(new Error('La ficha no contiene nombre o DNI válidos.'),{code:'datos-incompletos'});
    }

    await setDoc(installmentRef,{
      cuotaId:installmentRef.id,
      preinscripcionId:currentRecordId,
      registroAlumnoId:currentRecordId,
      matriculaId:currentRecordId,
      alumnoNombre:studentName,
      alumnoDni:studentDni,
      grupoId,
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
      console.warn('La cuota fue creada, pero no se pudo actualizar el resumen de la ficha.',summaryError);
    }

    form.reset();
    setScheduleMessage('ok',`Cuota “${concept}” creada con vencimiento ${dateLabel(dueDate)}.`);
    refreshOriginalSchedule();
  }catch(error){
    const prefix = error?.code === 'matricula-requerida'
      ? 'No se pudo crear la cuota. La matrícula oficial no está aprobada.'
      : error?.code === 'datos-incompletos'
        ? 'No se pudo crear la cuota. Revisa el nombre y DNI del alumno.'
        : 'No se pudo crear la cuota.';
    setScheduleMessage('err',errorText(error,prefix));
  }finally{
    installmentBusy = false;
    const submit = form.querySelector('button[type="submit"]');
    if(submit){ submit.disabled = false; submit.textContent = 'Agregar cuota'; }
  }
}

function captureClicks(event){
  const button = event.target.closest('[data-open],[data-pay],[data-npm-open],[data-npm-payment]');
  if(!button) return;
  const id = clean(
    button.dataset.open ||
    button.dataset.pay ||
    button.dataset.npmOpen ||
    button.dataset.npmPayment
  );
  if(!id) return;
  currentRecordId = id;
  window.setTimeout(() => loadContext(id),180);
}

function startObserver(){
  if(observer) return;
  observer = new MutationObserver(() => ensureVoucherPanel());
  observer.observe(document.body,{childList:true,subtree:true});
}

function initialize(){
  ensureVoucherPanel();
  startObserver();
  document.addEventListener('click',captureClicks,true);
  document.addEventListener('submit',createInstallment,true);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) initialize();
});
