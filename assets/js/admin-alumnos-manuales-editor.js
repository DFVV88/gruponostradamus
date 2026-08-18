/* ==================================================
   Grupo Nostradamus - Editor de alumnos manuales
   Permite corregir datos de la ficha administrativa sin tocar cuotas ni pagos.
   El DNI se corrige mediante una operación atómica que actualiza el índice anti-duplicados.
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
  writeBatch,
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
const DNI_REGISTRY_COLLECTION = 'alumnos_registro_dni';
const PROGRAMS = [
  ['nostra-360-uni','Nostra 360 UNI'],
  ['nostra-power-uni','Nostra Power UNI'],
  ['nostra-elite-uni','Nostra Élite UNI'],
  ['nostra-prime-uni','Nostra Prime UNI'],
  ['nostra-talentum-uni','Nostra Talentum UNI'],
  ['ciclo-ien','IEN UNI'],
  ['proyecto-escolar','Proyecto Escolar'],
  ['paralelo-cepre-uni','Paralelo CEPRE UNI'],
  ['ciclo-verano-uni','Ciclo Verano UNI'],
  ['nostra-weekend-uni','NostraWEEKEND']
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentRecordId = '';
let currentRecord = null;
let busy = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const dniDigits = value => clean(value).replace(/\D/g,'').slice(0,12);
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
};

function programName(id){
  return PROGRAMS.find(item => item[0] === id)?.[1] || id;
}

async function sha256(value){
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2,'0')).join('');
}

function isManualRecord(data){
  return data && (data.origen === 'registro_manual_admin' || data.origenRegistro === 'registro_manual_admin' || data.tipo === 'alumno_manual_admin');
}

function injectStyles(){
  if(document.getElementById('manual-student-editor-styles')) return;
  const style = document.createElement('style');
  style.id = 'manual-student-editor-styles';
  style.textContent = `
    .manual-edit-entry{display:none;align-items:center;justify-content:space-between;gap:14px;margin:14px 0;padding:13px 14px;border:1px solid rgba(7,140,149,.18);border-radius:17px;background:#f5fbfc}
    .manual-edit-entry.show{display:flex}.manual-edit-entry strong{display:block;color:#061426;font-size:13px}.manual-edit-entry small{display:block;margin-top:3px;color:#647482;font-size:10px;line-height:1.4}.manual-edit-entry .btn{margin:0;white-space:nowrap}
    .manual-editor-back{position:fixed;inset:0;z-index:12000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,7,13,.72)}.manual-editor-back.show{display:flex}
    .manual-editor-modal{width:min(920px,97vw);max-height:94vh;overflow:auto;background:#fff;border-radius:26px;padding:24px;box-shadow:0 30px 90px rgba(2,7,13,.38)}
    .manual-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.manual-editor-head h2{margin:0;color:#061426;font-family:'Baloo 2';font-size:36px;line-height:1}.manual-editor-head p{margin:6px 0 0;color:#647482;font-size:12px;line-height:1.45}
    .manual-editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:16px}.manual-editor-grid .wide{grid-column:1/-1}.manual-editor-grid label span{display:block;margin-bottom:5px;color:#061426;font-size:10px;font-weight:950;text-transform:uppercase}.manual-editor-grid input,.manual-editor-grid select,.manual-editor-grid textarea{width:100%;border:1px solid #dce9ed;border-radius:13px;padding:11px 12px;background:#fbfdfe;font:inherit}.manual-editor-grid textarea{min-height:78px;resize:vertical}
    .manual-editor-dni{grid-column:1/-1;padding:13px;border:1px solid rgba(255,148,30,.28);border-radius:16px;background:#fff8e8}.manual-editor-dni-line{display:flex;align-items:center;justify-content:space-between;gap:12px}.manual-editor-dni-line strong{color:#061426}.manual-editor-dni-line small{display:block;color:#7b5a1b;margin-top:3px}.manual-editor-dni-correction{display:none;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.manual-editor-dni-correction.show{display:grid}.manual-editor-dni-correction .wide{grid-column:1/-1}
    .manual-editor-note{margin-top:13px;padding:12px 13px;border:1px solid rgba(7,140,149,.18);border-radius:15px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:800;line-height:1.5}.manual-editor-warning{margin-top:10px;padding:12px 13px;border:1px solid rgba(255,148,30,.28);border-radius:15px;background:#fff8e8;color:#6a4700;font-size:11px;font-weight:800;line-height:1.5}
    .manual-editor-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.manual-editor-actions .btn{min-width:180px}.manual-editor-msg{display:none;margin-top:12px;border-radius:14px;padding:11px 12px;font-size:11px;font-weight:850}.manual-editor-msg.info{display:block;background:#eef8fa;color:#075b65}.manual-editor-msg.ok{display:block;background:#edfbea;color:#17672a}.manual-editor-msg.err{display:block;background:#fff2f2;color:#b42318}
    @media(max-width:720px){.manual-edit-entry,.manual-editor-head,.manual-editor-dni-line{display:block}.manual-edit-entry.show{display:block}.manual-edit-entry .btn{width:100%;margin-top:10px}.manual-editor-grid,.manual-editor-dni-correction{grid-template-columns:1fr}.manual-editor-grid .wide,.manual-editor-dni-correction .wide{grid-column:auto}.manual-editor-actions{display:grid;grid-template-columns:1fr}.manual-editor-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);
}

function ensureUi(){
  injectStyles();
  const detailGrid = document.getElementById('detail-grid');
  if(detailGrid && !document.getElementById('manual-edit-entry')){
    const entry = document.createElement('div');
    entry.id = 'manual-edit-entry';
    entry.className = 'manual-edit-entry';
    entry.innerHTML = '<div><strong>Ficha del alumno editable</strong><small>Corrige datos del formulario y referencias académicas sin modificar pagos, cuotas ni movimientos financieros.</small></div><button type="button" class="btn btn-blue" id="manual-edit-open">Editar datos del alumno</button>';
    detailGrid.insertAdjacentElement('afterend',entry);
  }

  if(!document.getElementById('manual-editor-back')){
    const back = document.createElement('div');
    back.id = 'manual-editor-back';
    back.className = 'manual-editor-back';
    back.innerHTML = `
      <section class="manual-editor-modal" role="dialog" aria-modal="true" aria-labelledby="manual-editor-title">
        <div class="manual-editor-head">
          <div><h2 id="manual-editor-title">Editar datos del alumno</h2><p>Estos cambios actualizan la ficha maestra del alumno. Los pagos, abonos y cuotas existentes no se reescriben.</p></div>
          <button type="button" class="btn btn-light" id="manual-editor-close">Cerrar</button>
        </div>
        <form id="manual-editor-form">
          <div class="manual-editor-grid">
            <label><span>Nombres y apellidos</span><input id="manual-edit-name" minlength="5" maxlength="100" required></label>
            <label><span>Celular del alumno</span><input id="manual-edit-phone" inputmode="tel" maxlength="20" placeholder="Opcional"></label>
            <label><span>Correo personal</span><input id="manual-edit-email" type="email" maxlength="100" placeholder="Opcional"></label>
            <label><span>Nombre del apoderado</span><input id="manual-edit-guardian" maxlength="100" placeholder="Opcional"></label>
            <label><span>Celular del apoderado</span><input id="manual-edit-guardian-phone" inputmode="tel" maxlength="20" placeholder="Opcional"></label>
            <label><span>Colegio</span><input id="manual-edit-school" maxlength="150" placeholder="Opcional"></label>
            <label><span>Situación académica</span><input id="manual-edit-situation" maxlength="80" placeholder="Opcional"></label>
            <label><span>Programa</span><select id="manual-edit-program">${PROGRAMS.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select></label>
            <label><span>Turno</span><select id="manual-edit-turn"><option value="Por confirmar">Por confirmar</option><option>Mañana</option><option>Tarde</option><option>Noche</option><option>FULL</option><option>Sabatino</option><option>Dominical</option></select></label>
            <label><span>Plan asignado</span><input id="manual-edit-plan" maxlength="100" placeholder="Ej. Presencial FULL"></label>
            <label><span>Salón / grupo</span><input id="manual-edit-group" maxlength="100" placeholder="Ej. POWER-A"></label>
            <label><span>Pensión mensual acordada (S/)</span><input id="manual-edit-price" type="number" min="0" max="1000000" step="0.01"></label>
            <label><span>Asesor / responsable</span><input id="manual-edit-advisor" maxlength="100" placeholder="Opcional"></label>
            <label class="wide"><span>Observación administrativa</span><textarea id="manual-edit-note" maxlength="1000"></textarea></label>
            <div class="manual-editor-dni">
              <div class="manual-editor-dni-line"><div><strong>DNI actual: <span id="manual-edit-dni-current">-</span></strong><small>El DNI identifica la ficha y controla duplicados.</small></div><button type="button" class="btn btn-light" id="manual-edit-dni-toggle">Corregir DNI</button></div>
              <div class="manual-editor-dni-correction" id="manual-edit-dni-correction">
                <label><span>Nuevo DNI</span><input id="manual-edit-dni-new" inputmode="numeric" minlength="8" maxlength="12"></label>
                <label><span>Confirmar nuevo DNI</span><input id="manual-edit-dni-confirm" inputmode="numeric" minlength="8" maxlength="12"></label>
                <label class="wide"><span>Motivo de la corrección</span><input id="manual-edit-dni-reason" maxlength="300" placeholder="Ej. error de digitación al registrar"></label>
              </div>
            </div>
          </div>
          <div class="manual-editor-note">Editar nombre, teléfonos, correo, programa, turno, plan o salón no crea otra preinscripción. La ficha conserva el mismo ID interno.</div>
          <div class="manual-editor-warning">Cambiar la pensión acordada solo modifica la referencia general de la ficha. No recalcula ni modifica cuotas ya creadas, pagos confirmados o movimientos financieros históricos.</div>
          <div class="manual-editor-actions"><button type="button" class="btn btn-light" id="manual-editor-cancel">Cancelar</button><button type="submit" class="btn btn-green" id="manual-editor-save">Guardar cambios</button></div>
          <div class="manual-editor-msg" id="manual-editor-message"></div>
        </form>
      </section>`;
    document.body.appendChild(back);
  }
  bindUiEvents();
}

function setMessage(type,text){
  const box = document.getElementById('manual-editor-message');
  if(!box) return;
  box.className = `manual-editor-msg ${type}`;
  box.innerHTML = text;
}

function setCorrectionVisible(visible){
  const panel = document.getElementById('manual-edit-dni-correction');
  if(panel) panel.classList.toggle('show',visible);
  const toggle = document.getElementById('manual-edit-dni-toggle');
  if(toggle) toggle.textContent = visible ? 'Cancelar corrección de DNI' : 'Corregir DNI';
  if(!visible){
    ['manual-edit-dni-new','manual-edit-dni-confirm','manual-edit-dni-reason'].forEach(id => {
      const input = document.getElementById(id);
      if(input) input.value = '';
    });
  }
}

function fillEditor(data){
  const set = (id,value) => { const input = document.getElementById(id); if(input) input.value = value == null ? '' : value; };
  set('manual-edit-name',data.nombre);
  set('manual-edit-phone',data.celular);
  set('manual-edit-email',data.correo);
  set('manual-edit-guardian',data.apoderado);
  set('manual-edit-guardian-phone',data.celularApoderado);
  set('manual-edit-school',data.colegio);
  set('manual-edit-situation',data.situacion);
  set('manual-edit-program',PROGRAMS.some(item => item[0] === data.programaId) ? data.programaId : PROGRAMS[0][0]);
  set('manual-edit-turn',data.turno || 'Por confirmar');
  set('manual-edit-plan',data.planAsignado || data.planNombre || '');
  set('manual-edit-group',data.grupoId);
  set('manual-edit-price',Number.isFinite(Number(data.pensionAcordada)) ? Number(data.pensionAcordada) : 0);
  set('manual-edit-advisor',data.asesorAsignado);
  set('manual-edit-note',data.comentario || data.ajustePagoMotivo || '');
  const dniText = document.getElementById('manual-edit-dni-current');
  if(dniText) dniText.textContent = clean(data.dni) || '-';
  setCorrectionVisible(false);
  setMessage('info','Revisa los datos y guarda únicamente los cambios necesarios.');
}

async function loadManualRecord(id){
  ensureUi();
  currentRecordId = '';
  currentRecord = null;
  const entry = document.getElementById('manual-edit-entry');
  if(entry) entry.classList.remove('show');
  if(!id || !currentUser) return;
  try{
    const snapshot = await getDoc(doc(db,PRE_COLLECTION,id));
    if(!snapshot.exists()) return;
    const data = snapshot.data() || {};
    currentRecordId = id;
    currentRecord = {id,...data};
    if(entry) entry.classList.add('show');
  }catch(error){
    console.warn('No se pudo comprobar si la ficha es manual:',error);
  }
}

function openEditor(){
  if(!currentRecord || !currentUser || busy) return;
  fillEditor(currentRecord);
  document.getElementById('manual-editor-back')?.classList.add('show');
}

function closeEditor(){
  if(busy) return;
  document.getElementById('manual-editor-back')?.classList.remove('show');
  setCorrectionVisible(false);
}

async function duplicateForDni(dni,recordId){
  const snapshot = await getDocs(query(collection(db,PRE_COLLECTION),where('dni','==',dni),limit(3)));
  return snapshot.docs.find(item => item.id !== recordId) || null;
}

function readEditor(){
  const value = id => clean(document.getElementById(id)?.value);
  const nombre = value('manual-edit-name');
  const celular = value('manual-edit-phone');
  const correo = value('manual-edit-email').toLowerCase();
  const apoderado = value('manual-edit-guardian');
  const celularApoderado = value('manual-edit-guardian-phone');
  const colegio = value('manual-edit-school');
  const situacion = value('manual-edit-situation');
  const programaId = value('manual-edit-program');
  const turno = value('manual-edit-turn') || 'Por confirmar';
  const plan = value('manual-edit-plan');
  const grupoId = value('manual-edit-group');
  const pensionAcordada = num(value('manual-edit-price'));
  const asesorAsignado = value('manual-edit-advisor');
  const comentario = value('manual-edit-note');

  if(nombre.length < 5 || nombre.length > 100) throw new Error('Escribe los nombres y apellidos completos.');
  if(celular && (celular.length < 9 || celular.length > 20)) throw new Error('El celular del alumno debe tener al menos 9 caracteres o quedar vacío.');
  if(celularApoderado && (celularApoderado.length < 9 || celularApoderado.length > 20)) throw new Error('El celular del apoderado debe tener al menos 9 caracteres o quedar vacío.');
  if(correo && (!correo.includes('@') || correo.length > 100)) throw new Error('Revisa el correo personal.');
  if(apoderado.length > 100) throw new Error('El nombre del apoderado es demasiado extenso.');
  if(colegio.length > 150) throw new Error('El nombre del colegio es demasiado extenso.');
  if(situacion.length > 80) throw new Error('La situación académica es demasiado extensa.');
  if(!PROGRAMS.some(item => item[0] === programaId)) throw new Error('Selecciona un programa válido.');
  if(plan.length > 100 || grupoId.length > 100 || asesorAsignado.length > 100) throw new Error('Revisa plan, salón o asesor: uno de los textos es demasiado extenso.');
  if(comentario.length > 1000) throw new Error('La observación es demasiado extensa.');

  return {
    nombre,celular,correo,apoderado,celularApoderado,colegio,situacion,
    programaId,ciclo:programName(programaId),turno,
    planNombre:plan,planAsignado:plan,grupoId,pensionAcordada,
    asesorAsignado,comentario,ajustePagoMotivo:comentario
  };
}

async function saveEditor(event){
  event.preventDefault();
  if(busy || !currentUser || !currentRecord || !currentRecordId) return;

  const save = document.getElementById('manual-editor-save');
  try{
    const patch = readEditor();
    const oldDni = dniDigits(currentRecord.dni);
    const correctionVisible = document.getElementById('manual-edit-dni-correction')?.classList.contains('show');
    const newDni = correctionVisible ? dniDigits(document.getElementById('manual-edit-dni-new')?.value) : oldDni;
    const confirmDni = correctionVisible ? dniDigits(document.getElementById('manual-edit-dni-confirm')?.value) : oldDni;
    const correctionReason = correctionVisible ? clean(document.getElementById('manual-edit-dni-reason')?.value) : '';
    const dniChanged = newDni !== oldDni;

    if(correctionVisible){
      if(newDni.length < 8 || newDni.length > 12) throw new Error('Escribe un nuevo DNI válido.');
      if(newDni !== confirmDni) throw new Error('La confirmación del nuevo DNI no coincide.');
      if(!dniChanged) throw new Error('El nuevo DNI es igual al DNI actual. Cancela la corrección si no necesitas cambiarlo.');
      if(correctionReason.length < 5) throw new Error('Indica brevemente el motivo de la corrección del DNI.');
    }

    busy = true;
    if(save){ save.disabled = true; save.textContent = 'Guardando...'; }
    setMessage('info',dniChanged ? 'Verificando el nuevo DNI y actualizando el índice anti-duplicados...' : 'Guardando cambios en la ficha maestra...');

    const batch = writeBatch(db);
    const recordRef = doc(db,PRE_COLLECTION,currentRecordId);

    if(dniChanged){
      const duplicate = await duplicateForDni(newDni,currentRecordId);
      if(duplicate) throw new Error('El nuevo DNI ya pertenece a otro alumno. No se realizó ningún cambio.');

      const oldHash = await sha256(oldDni);
      const newHash = await sha256(newDni);
      const newRegistryRef = doc(db,DNI_REGISTRY_COLLECTION,newHash);
      const newRegistrySnapshot = await getDoc(newRegistryRef);
      if(newRegistrySnapshot.exists() && clean(newRegistrySnapshot.data()?.registroId) !== currentRecordId){
        throw new Error('El nuevo DNI ya está reservado por otra ficha. No se realizó ningún cambio.');
      }

      Object.assign(patch,{
        dni:newDni,
        dniAnterior:oldDni,
        dniCorregidoAt:serverTimestamp(),
        dniCorregidoPor:clean(currentUser.email || ADMIN_EMAIL),
        dniCorreccionMotivo:correctionReason
      });

      if(isManualRecord(currentRecord)){
        batch.delete(doc(db,DNI_REGISTRY_COLLECTION,oldHash));
        batch.set(newRegistryRef,{
          dniHash:newHash,
          registroId:currentRecordId,
          tipo:'registro_manual_admin',
          activo:true,
          creadoPor:clean(currentUser.email || ADMIN_EMAIL),
          createdAt:serverTimestamp(),
          updatedAt:serverTimestamp()
        });
      }
    }

    patch.actualizadoManualmenteAt = serverTimestamp();
    patch.actualizadoManualmentePor = clean(currentUser.email || ADMIN_EMAIL);
    patch.updatedAt = serverTimestamp();
    batch.update(recordRef,patch);
    await batch.commit();

    setMessage('ok',dniChanged
      ? (isManualRecord(currentRecord)
          ? 'Datos guardados y DNI corregido correctamente. El índice anti-duplicados también fue actualizado.'
          : 'Datos guardados y DNI corregido correctamente. La ficha conserva el mismo ID y el historial financiero no fue modificado.')
      : 'Datos del alumno actualizados correctamente. Cuotas y pagos existentes permanecen sin cambios.');

    currentRecord = {...currentRecord,...patch,dni:dniChanged ? newDni : currentRecord.dni};
    document.getElementById('refresh-btn')?.click();
    window.setTimeout(() => {
      closeEditor();
      document.getElementById('close-modal')?.click();
    },900);
  }catch(error){
    console.error('No se pudo editar la ficha del alumno:',error);
    setMessage('err',esc(error?.message || 'No se pudieron guardar los cambios.'));
  }finally{
    busy = false;
    if(save){ save.disabled = false; save.textContent = 'Guardar cambios'; }
  }
}

let eventsBound = false;
function bindUiEvents(){
  if(eventsBound) return;
  eventsBound = true;
  document.addEventListener('click',event => {
    if(event.target.closest('#manual-edit-open')) openEditor();
    if(event.target.closest('#manual-editor-close,#manual-editor-cancel')) closeEditor();
    if(event.target.closest('#manual-edit-dni-toggle')){
      const visible = document.getElementById('manual-edit-dni-correction')?.classList.contains('show');
      setCorrectionVisible(!visible);
    }
    const open = event.target.closest('[data-open],[data-pay]');
    if(open){
      const id = open.dataset.open || open.dataset.pay;
      window.setTimeout(() => loadManualRecord(id),80);
    }
  });
  document.addEventListener('input',event => {
    if(event.target.matches('#manual-edit-dni-new,#manual-edit-dni-confirm')) event.target.value = dniDigits(event.target.value);
  });
  document.getElementById('manual-editor-back')?.addEventListener('click',event => {
    if(event.target.id === 'manual-editor-back') closeEditor();
  });
  document.getElementById('manual-editor-form')?.addEventListener('submit',saveEditor);
}

function start(){
  ensureUi();
  const observer = new MutationObserver(() => ensureUi());
  observer.observe(document.getElementById('admin-panel') || document.body,{childList:true,subtree:true});
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(!currentUser){
    currentRecordId = '';
    currentRecord = null;
    document.getElementById('manual-edit-entry')?.classList.remove('show');
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
else start();
