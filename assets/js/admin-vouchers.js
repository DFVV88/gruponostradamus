/* ==================================================
   Grupo Nostradamus - Vouchers de pagos de alumnos
   Adjunta evidencias a pagos iniciales y abonos de cuotas.
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
const EVIDENCE_COLLECTION = 'comprobantes_pago';
const PRE_COLLECTION = 'preinscripciones';
const STUDENT_COLLECTION = 'registros_alumnos';
const PAYMENT_COLLECTION = 'alumno_abonos';
const FINANCE_COLLECTION = 'finanzas_movimientos';
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg','image/png','application/pdf']);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;
let currentRecordId = '';
let currentInstallmentId = '';
let initialBusy = false;
let installmentBusy = false;
let observer = null;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function isAdmin(){
  return currentUser && clean(currentUser.email).toLowerCase() === ADMIN_EMAIL;
}

function uid(){
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileExtension(file){
  if(file.type === 'application/pdf') return 'pdf';
  if(file.type === 'image/png') return 'png';
  return 'jpg';
}

function needsVoucher(account){
  return clean(account) !== 'caja_efectivo';
}

function formatSize(bytes){
  if(bytes < 1024) return `${bytes} B`;
  if(bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validateFile(file){
  if(!file) return 'Selecciona un voucher o constancia.';
  if(!ALLOWED_TYPES.has(file.type)) return 'El voucher debe ser JPG, PNG o PDF.';
  if(file.size <= 0 || file.size > MAX_FILE_SIZE) return 'El archivo debe pesar como máximo 8 MB.';
  return '';
}

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('nostra-voucher-styles')) return;
  const style = document.createElement('style');
  style.id = 'nostra-voucher-styles';
  style.textContent = `
    .nostra-voucher-field{grid-column:1/-1;padding:12px;border:1px dashed rgba(7,140,149,.38);border-radius:15px;background:#f7fcfd}
    .nostra-voucher-field>span{display:block;margin-bottom:6px;color:#061426;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}
    .nostra-voucher-field input{width:100%;border:1px solid #dce9ed;border-radius:11px;padding:9px;background:#fff;font:inherit;font-size:12px}
    .nostra-voucher-help{display:block;margin-top:6px;color:#647482;font-size:10px;line-height:1.4}
    .nostra-voucher-preview{grid-column:1/-1;display:none;align-items:center;gap:11px;padding:10px 12px;border:1px solid #dce9ed;border-radius:14px;background:#fff;color:#526170;font-size:11px}
    .nostra-voucher-preview.show{display:flex}.nostra-voucher-preview img{width:70px;height:54px;object-fit:cover;border-radius:9px;border:1px solid #dce9ed}.nostra-voucher-preview strong{display:block;color:#061426}.nostra-voucher-preview a{color:#075b65;font-weight:950;text-decoration:none}
    .nostra-voucher-pdf{width:52px;height:52px;display:grid;place-items:center;border-radius:10px;background:#fff0ef;color:#b42318;font-weight:950}
    .nostra-voucher-existing{display:none}.nostra-voucher-existing.show{display:inline-flex}
    @media(max-width:700px){.nostra-voucher-preview{align-items:flex-start}.nostra-voucher-existing.show{width:100%}}
  `;
  document.head.appendChild(style);
}

function clearPreview(inputId,previewId){
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if(input) input.value = '';
  if(preview){
    const objectUrl = preview.dataset.objectUrl;
    if(objectUrl) URL.revokeObjectURL(objectUrl);
    preview.dataset.objectUrl = '';
    preview.classList.remove('show');
    preview.innerHTML = '';
  }
}

function renderSelectedFile(inputId,previewId){
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if(!input || !preview) return;
  const file = input.files?.[0];
  const error = file ? validateFile(file) : '';
  const oldUrl = preview.dataset.objectUrl;
  if(oldUrl) URL.revokeObjectURL(oldUrl);
  preview.dataset.objectUrl = '';
  if(!file){
    preview.classList.remove('show');
    preview.innerHTML = '';
    return;
  }
  if(error){
    input.value = '';
    preview.classList.add('show');
    preview.innerHTML = `<div class="nostra-voucher-pdf">!</div><div><strong>Archivo no admitido</strong>${esc(error)}</div>`;
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  preview.dataset.objectUrl = objectUrl;
  const visual = file.type.startsWith('image/')
    ? `<img src="${esc(objectUrl)}" alt="Vista previa del voucher">`
    : '<div class="nostra-voucher-pdf">PDF</div>';
  preview.classList.add('show');
  preview.innerHTML = `${visual}<div><strong>${esc(file.name)}</strong>${esc(formatSize(file.size))}<br><a href="${esc(objectUrl)}" target="_blank" rel="noopener">Revisar archivo</a></div>`;
}

function renderExistingVoucher(previewId,data){
  const preview = document.getElementById(previewId);
  if(!preview) return;
  const oldUrl = preview.dataset.objectUrl;
  if(oldUrl) URL.revokeObjectURL(oldUrl);
  preview.dataset.objectUrl = '';
  const visual = clean(data.contentType).startsWith('image/')
    ? `<img src="${esc(data.downloadUrl)}" alt="Voucher registrado">`
    : '<div class="nostra-voucher-pdf">PDF</div>';
  preview.classList.add('show');
  preview.innerHTML = `${visual}<div><strong>Voucher registrado</strong>${esc(data.nombreOriginal || 'Comprobante de pago')} · ${esc(formatSize(Number(data.sizeBytes || 0)))}<br><a href="${esc(data.downloadUrl)}" target="_blank" rel="noopener">Ver voucher</a></div>`;
}

function syncRequirement(accountId,inputId,helpId){
  const account = document.getElementById(accountId);
  const input = document.getElementById(inputId);
  const help = document.getElementById(helpId);
  if(!account || !input || !help) return;
  const required = needsVoucher(account.value);
  input.required = required;
  help.textContent = required
    ? 'Obligatorio para Yape, Plin, BCP, Culqi y otras transferencias. Formatos JPG, PNG o PDF; máximo 8 MB.'
    : 'Opcional para pagos en efectivo. Puedes adjuntar una foto del recibo de caja.';
}

function ensureInitialUi(){
  const grid = document.querySelector('#npm-payment-form .npm-grid');
  if(!grid || document.getElementById('npm-payment-voucher')) return;
  const field = document.createElement('label');
  field.className = 'nostra-voucher-field';
  field.innerHTML = `
    <span>Voucher o constancia de pago</span>
    <input id="npm-payment-voucher" type="file" accept="image/jpeg,image/png,application/pdf">
    <small class="nostra-voucher-help" id="npm-payment-voucher-help"></small>`;
  grid.appendChild(field);
  const preview = document.createElement('div');
  preview.id = 'npm-payment-voucher-preview';
  preview.className = 'nostra-voucher-preview';
  grid.appendChild(preview);

  const actions = document.querySelector('#npm-payment-form .npm-actions');
  if(actions){
    const attach = document.createElement('button');
    attach.type = 'button';
    attach.id = 'npm-voucher-attach-existing';
    attach.className = 'btn btn-light nostra-voucher-existing';
    attach.textContent = 'Adjuntar voucher al pago registrado';
    actions.insertBefore(attach,actions.firstChild);
    attach.addEventListener('click',attachVoucherToExistingPayment);
  }
  document.getElementById('npm-payment-voucher').addEventListener('change',() => renderSelectedFile('npm-payment-voucher','npm-payment-voucher-preview'));
  document.getElementById('npm-payment-account')?.addEventListener('change',() => syncRequirement('npm-payment-account','npm-payment-voucher','npm-payment-voucher-help'));
  syncRequirement('npm-payment-account','npm-payment-voucher','npm-payment-voucher-help');
}

function ensureInstallmentUi(){
  const grid = document.querySelector('#student-installment-payment-form .student-payment-modal-grid');
  if(!grid || document.getElementById('student-installment-payment-voucher')) return;
  const field = document.createElement('label');
  field.className = 'nostra-voucher-field';
  field.innerHTML = `
    <span>Voucher o constancia de pago</span>
    <input id="student-installment-payment-voucher" type="file" accept="image/jpeg,image/png,application/pdf">
    <small class="nostra-voucher-help" id="student-installment-payment-voucher-help"></small>`;
  grid.appendChild(field);
  const preview = document.createElement('div');
  preview.id = 'student-installment-payment-voucher-preview';
  preview.className = 'nostra-voucher-preview';
  grid.appendChild(preview);
  document.getElementById('student-installment-payment-voucher').addEventListener('change',() => renderSelectedFile('student-installment-payment-voucher','student-installment-payment-voucher-preview'));
  document.getElementById('student-installment-payment-account')?.addEventListener('change',() => syncRequirement('student-installment-payment-account','student-installment-payment-voucher','student-installment-payment-voucher-help'));
  syncRequirement('student-installment-payment-account','student-installment-payment-voucher','student-installment-payment-voucher-help');
}

function ensureUi(){
  injectStyles();
  ensureInitialUi();
  ensureInstallmentUi();
}

async function uploadVoucher(file,recordId,kind,key){
  const extension = fileExtension(file);
  const storagePath = `comprobantes-pago/${recordId}/${kind}/${key}-${Date.now()}.${extension}`;
  const storageRef = ref(storage,storagePath);
  await uploadBytes(storageRef,file,{
    contentType:file.type,
    cacheControl:'private,max-age=0,no-store',
    customMetadata:{
      preinscripcionId:recordId,
      tipoPago:kind,
      referencia:key,
      subidoPor:clean(currentUser?.email || ADMIN_EMAIL)
    }
  });
  const downloadUrl = await getDownloadURL(storageRef);
  return {
    storagePath,
    downloadUrl,
    nombreOriginal:file.name.slice(0,180),
    contentType:file.type,
    sizeBytes:file.size
  };
}

async function removeUpload(upload){
  if(!upload?.storagePath) return;
  try{ await deleteObject(ref(storage,upload.storagePath)); }
  catch(error){ console.warn('No se pudo limpiar un voucher sin vincular.',error); }
}

async function waitForDocument(reference,attempts=30){
  for(let index=0;index<attempts;index+=1){
    const snapshot = await getDoc(reference);
    if(snapshot.exists()) return snapshot;
    await new Promise(resolve => setTimeout(resolve,450));
  }
  return null;
}

async function installmentPaymentIds(installmentId){
  const snapshot = await getDocs(query(
    collection(db,PAYMENT_COLLECTION),
    where('cuotaId','==',installmentId),
    limit(100)
  ));
  return new Map(snapshot.docs.map(item => [item.id,{id:item.id,...item.data()}]));
}

async function waitForNewInstallmentPayment(installmentId,beforeIds,attempts=30){
  for(let index=0;index<attempts;index+=1){
    const current = await installmentPaymentIds(installmentId);
    const found = [...current.values()].find(item => !beforeIds.has(item.id));
    if(found) return found;
    await new Promise(resolve => setTimeout(resolve,450));
  }
  return null;
}

async function saveEvidence({movementId,recordId,type,upload,installmentId='',paymentId=''}){
  const evidenceRef = doc(db,EVIDENCE_COLLECTION,movementId);
  const existing = await getDoc(evidenceRef);
  if(existing.exists()) throw Object.assign(new Error('El movimiento ya tiene voucher.'),{code:'already-exists'});
  const movementSnapshot = await getDoc(doc(db,FINANCE_COLLECTION,movementId));
  if(!movementSnapshot.exists()) throw new Error('El movimiento financiero todavía no existe.');
  const movement = movementSnapshot.data();
  if(clean(movement.preinscripcionId) !== recordId) throw new Error('El movimiento no pertenece al alumno seleccionado.');
  const email = clean(currentUser?.email || ADMIN_EMAIL);
  await setDoc(evidenceRef,{
    comprobanteId:movementId,
    preinscripcionId:recordId,
    movimientoFinancieroId:movementId,
    cuotaId:clean(installmentId),
    abonoId:clean(paymentId),
    tipoPago:type,
    storagePath:upload.storagePath,
    downloadUrl:upload.downloadUrl,
    nombreOriginal:upload.nombreOriginal,
    contentType:upload.contentType,
    sizeBytes:upload.sizeBytes,
    estado:'activo',
    origen:'voucher_admin',
    subidoPor:email,
    createdAt:serverTimestamp()
  });

  const summary = type === 'pago_inicial'
    ? {
        comprobantePagoId:movementId,
        comprobantePagoUrl:upload.downloadUrl,
        comprobantePagoStoragePath:upload.storagePath,
        comprobantePagoNombre:upload.nombreOriginal,
        comprobantePagoContentType:upload.contentType,
        comprobantePagoSizeBytes:upload.sizeBytes,
        comprobantePagoSubidoPor:email,
        comprobantePagoAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      }
    : {
        ultimoComprobantePagoId:movementId,
        ultimoComprobantePagoUrl:upload.downloadUrl,
        ultimoComprobantePagoStoragePath:upload.storagePath,
        ultimoComprobantePagoNombre:upload.nombreOriginal,
        ultimoComprobantePagoAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      };
  await updateDoc(doc(db,PRE_COLLECTION,recordId),summary);
  try{ await updateDoc(doc(db,STUDENT_COLLECTION,recordId),summary); }
  catch(error){ console.warn('El voucher quedó guardado, pero el resumen académico aún no existe.',error); }
}

async function refreshInitialVoucherState(){
  ensureUi();
  const attach = document.getElementById('npm-voucher-attach-existing');
  const input = document.getElementById('npm-payment-voucher');
  if(!attach || !input || !currentRecordId || !isAdmin()) return;
  try{
    const preSnapshot = await getDoc(doc(db,PRE_COLLECTION,currentRecordId));
    if(!preSnapshot.exists()) return;
    const record = preSnapshot.data();
    const movementId = clean(record.ingresoFinancieroId);
    attach.classList.remove('show');
    input.disabled = false;
    if(!movementId){
      clearPreview('npm-payment-voucher','npm-payment-voucher-preview');
      syncRequirement('npm-payment-account','npm-payment-voucher','npm-payment-voucher-help');
      return;
    }
    const evidence = await getDoc(doc(db,EVIDENCE_COLLECTION,movementId));
    if(evidence.exists()){
      input.disabled = true;
      renderExistingVoucher('npm-payment-voucher-preview',evidence.data());
      return;
    }
    attach.classList.add('show');
    syncRequirement('npm-payment-account','npm-payment-voucher','npm-payment-voucher-help');
  }catch(error){
    console.warn('No se pudo consultar el voucher del pago.',error);
  }
}

async function attachVoucherToExistingPayment(){
  if(initialBusy || !isAdmin() || !currentRecordId) return;
  const input = document.getElementById('npm-payment-voucher');
  const file = input?.files?.[0];
  const error = validateFile(file);
  if(error) return setMessage('npm-payment-message','err',error);
  let upload = null;
  try{
    initialBusy = true;
    const preSnapshot = await getDoc(doc(db,PRE_COLLECTION,currentRecordId));
    if(!preSnapshot.exists()) throw new Error('No se encontró al alumno.');
    const movementId = clean(preSnapshot.data().ingresoFinancieroId);
    if(!movementId) throw new Error('Primero debe existir el ingreso financiero.');
    setMessage('npm-payment-message','info','Subiendo voucher y vinculándolo al ingreso existente...');
    upload = await uploadVoucher(file,currentRecordId,'pago-inicial',movementId);
    await saveEvidence({movementId,recordId:currentRecordId,type:'pago_inicial',upload});
    setMessage('npm-payment-message','ok','Voucher guardado y vinculado al ingreso financiero.');
    await refreshInitialVoucherState();
  }catch(error){
    console.error(error);
    if(upload) await removeUpload(upload);
    setMessage('npm-payment-message','err',error?.code === 'already-exists'
      ? 'Este pago ya cuenta con un voucher registrado.'
      : 'No se pudo adjuntar el voucher. Revisa los permisos de Firebase Storage.');
  }finally{
    initialBusy = false;
  }
}

async function interceptInitialPayment(event){
  const form = event.target;
  if(!form.matches('#npm-payment-form') || !isAdmin()) return;
  if(form.dataset.nostraVoucherBypass === '1'){
    delete form.dataset.nostraVoucherBypass;
    return;
  }
  ensureUi();
  const account = clean(document.getElementById('npm-payment-account')?.value);
  const input = document.getElementById('npm-payment-voucher');
  const file = input?.files?.[0];
  if(needsVoucher(account) && !file){
    event.preventDefault();
    event.stopImmediatePropagation();
    return setMessage('npm-payment-message','err','Adjunta el voucher antes de confirmar este pago o transferencia.');
  }
  if(!file) return;
  const fileError = validateFile(file);
  if(fileError){
    event.preventDefault();
    event.stopImmediatePropagation();
    return setMessage('npm-payment-message','err',fileError);
  }
  if(initialBusy){
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  if(!currentRecordId) return setMessage('npm-payment-message','err','No se pudo identificar al alumno. Cierra y vuelve a abrir la ficha.');

  let upload = null;
  const movementId = `pago_${currentRecordId}_inicial`;
  try{
    initialBusy = true;
    const save = document.getElementById('npm-payment-save');
    if(save){ save.disabled = true; save.textContent = 'Subiendo voucher...'; }
    setMessage('npm-payment-message','info','Subiendo voucher antes de registrar el pago...');
    upload = await uploadVoucher(file,currentRecordId,'pago-inicial',movementId);
    form.dataset.nostraVoucherBypass = '1';
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const movement = await waitForDocument(doc(db,FINANCE_COLLECTION,movementId));
    if(!movement) throw new Error('El ingreso financiero no llegó a crearse.');
    await saveEvidence({movementId,recordId:currentRecordId,type:'pago_inicial',upload});
    setMessage('npm-payment-message','ok','Pago, ingreso financiero y voucher registrados correctamente.');
    clearPreview('npm-payment-voucher','npm-payment-voucher-preview');
  }catch(error){
    console.error(error);
    if(upload) await removeUpload(upload);
    setMessage('npm-payment-message','err','El voucher no pudo vincularse. El pago puede regularizarse nuevamente desde esta ficha.');
  }finally{
    initialBusy = false;
    const save = document.getElementById('npm-payment-save');
    if(save && !save.disabled){ save.textContent = 'Confirmar pago e ingreso'; }
  }
}

async function interceptInstallmentPayment(event){
  const form = event.target;
  if(!form.matches('#student-installment-payment-form') || !isAdmin()) return;
  if(form.dataset.nostraVoucherBypass === '1'){
    delete form.dataset.nostraVoucherBypass;
    return;
  }
  ensureUi();
  const account = clean(document.getElementById('student-installment-payment-account')?.value);
  const input = document.getElementById('student-installment-payment-voucher');
  const file = input?.files?.[0];
  if(needsVoucher(account) && !file){
    event.preventDefault();
    event.stopImmediatePropagation();
    return setMessage('student-installment-payment-message','err','Adjunta el voucher antes de confirmar este abono.');
  }
  if(!file) return;
  const fileError = validateFile(file);
  if(fileError){
    event.preventDefault();
    event.stopImmediatePropagation();
    return setMessage('student-installment-payment-message','err',fileError);
  }
  if(installmentBusy){
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  if(!currentRecordId || !currentInstallmentId){
    return setMessage('student-installment-payment-message','err','No se pudo identificar al alumno o la cuota. Cierra y vuelve a abrir la ficha.');
  }

  let upload = null;
  try{
    installmentBusy = true;
    const before = await installmentPaymentIds(currentInstallmentId);
    const provisionalKey = `cuota-${currentInstallmentId}-${uid()}`;
    const save = document.getElementById('student-installment-payment-save');
    if(save){ save.disabled = true; save.textContent = 'Subiendo voucher...'; }
    setMessage('student-installment-payment-message','info','Subiendo voucher antes de registrar el abono...');
    upload = await uploadVoucher(file,currentRecordId,'abonos-cuotas',provisionalKey);
    form.dataset.nostraVoucherBypass = '1';
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const payment = await waitForNewInstallmentPayment(currentInstallmentId,before);
    if(!payment) throw new Error('El abono no llegó a crearse.');
    const movementId = clean(payment.movimientoFinancieroId) || `abono_${payment.id}`;
    await saveEvidence({
      movementId,
      recordId:currentRecordId,
      type:'abono_cuota',
      upload,
      installmentId:currentInstallmentId,
      paymentId:payment.id
    });
    setMessage('student-installment-payment-message','ok','Abono, ingreso financiero y voucher registrados correctamente.');
    clearPreview('student-installment-payment-voucher','student-installment-payment-voucher-preview');
  }catch(error){
    console.error(error);
    if(upload) await removeUpload(upload);
    setMessage('student-installment-payment-message','err','El voucher no pudo vincularse. Revisa el pago antes de volver a intentarlo.');
  }finally{
    installmentBusy = false;
    const save = document.getElementById('student-installment-payment-save');
    if(save && !save.disabled){ save.textContent = 'Confirmar abono e ingreso'; }
  }
}

function captureClicks(event){
  const recordButton = event.target.closest('[data-open],[data-pay],[data-npm-open],[data-npm-payment]');
  if(recordButton){
    currentRecordId = clean(
      recordButton.dataset.open ||
      recordButton.dataset.pay ||
      recordButton.dataset.npmOpen ||
      recordButton.dataset.npmPayment
    );
  }
  const installment = event.target.closest('[data-installment-pay]');
  if(installment){
    currentInstallmentId = clean(installment.dataset.installmentPay);
    window.setTimeout(() => {
      ensureUi();
      clearPreview('student-installment-payment-voucher','student-installment-payment-voucher-preview');
      syncRequirement('student-installment-payment-account','student-installment-payment-voucher','student-installment-payment-voucher-help');
    },80);
  }
  if(event.target.closest('[data-pay],[data-npm-payment]')){
    window.setTimeout(() => {
      ensureUi();
      clearPreview('npm-payment-voucher','npm-payment-voucher-preview');
      refreshInitialVoucherState();
    },180);
  }
  if(event.target.closest('#npm-payment-close')) clearPreview('npm-payment-voucher','npm-payment-voucher-preview');
  if(event.target.closest('#student-installment-payment-close')) clearPreview('student-installment-payment-voucher','student-installment-payment-voucher-preview');
}

function startObserver(){
  if(observer) return;
  observer = new MutationObserver(() => ensureUi());
  observer.observe(document.body,{childList:true,subtree:true});
}

function initialize(){
  ensureUi();
  startObserver();
  document.addEventListener('click',captureClicks,true);
  document.addEventListener('submit',interceptInitialPayment,true);
  document.addEventListener('submit',interceptInstallmentPayment,true);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) initialize();
});
