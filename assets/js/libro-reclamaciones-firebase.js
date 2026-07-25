import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const form = document.getElementById('libro-form');
const messageBox = document.getElementById('form-message');
const submitButton = document.getElementById('submit-btn');
const minorToggle = document.getElementById('menor-edad');
const minorBox = document.getElementById('minor-box');
const receipt = document.getElementById('receipt');
const receiptCode = document.getElementById('receipt-code');
const receiptGrid = document.getElementById('receipt-grid');
const receiptDetail = document.getElementById('receipt-detail');
const startedAt = Date.now();
let lastCode = '';

const clean = value => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
const field = name => clean(form.elements[name]?.value);
const escapeHtml = value => clean(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const decimal = value => {
  const n = Number(String(value || '').replace(',','.'));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
};
const formatMoney = value => value > 0 ? `S/ ${value.toFixed(2)}` : 'No consignado';
const formatDate = date => new Intl.DateTimeFormat('es-PE',{dateStyle:'long',timeStyle:'short'}).format(date);

function showMessage(type,text){
  messageBox.className = `message ${type}`;
  messageBox.textContent = text;
}

function syncMinorFields(){
  const isMinor = minorToggle.checked;
  minorBox.classList.toggle('show',isMinor);
  ['apoderadoNombre','apoderadoDocumento','apoderadoCorreo','apoderadoCelular'].forEach(name => {
    const input = form.elements[name];
    if(input) input.required = isMinor;
  });
}

function selectedType(){
  return form.querySelector('input[name="tipo"]:checked')?.value || '';
}

function validate(data){
  if(field('website')) return 'No se pudo procesar el registro.';
  if(Date.now() - startedAt < 1800) return 'Espera unos segundos y vuelve a enviar el formulario.';
  if(data.consumidor.nombres.length < 5) return 'Escribe los nombres y apellidos completos.';
  if(!data.consumidor.tipoDocumento) return 'Selecciona el tipo de documento.';
  if(data.consumidor.numeroDocumento.length < 6) return 'Escribe un número de documento válido.';
  if(!/^\S+@\S+\.\S+$/.test(data.consumidor.correo)) return 'Escribe un correo electrónico válido.';
  if(data.consumidor.celular.replace(/\D/g,'').length < 9) return 'Escribe un celular válido.';
  if(data.consumidor.direccion.length < 5) return 'Escribe la dirección del consumidor.';
  if(data.consumidor.menorEdad){
    if(data.apoderado.nombres.length < 5) return 'Escribe el nombre completo del apoderado.';
    if(data.apoderado.numeroDocumento.length < 6) return 'Escribe el documento del apoderado.';
    if(!/^\S+@\S+\.\S+$/.test(data.apoderado.correo)) return 'Escribe un correo válido para el apoderado.';
    if(data.apoderado.celular.replace(/\D/g,'').length < 9) return 'Escribe un celular válido para el apoderado.';
  }
  if(data.servicio.nombre.length < 3) return 'Indica el programa, ciclo o servicio contratado.';
  if(!data.tipo) return 'Selecciona si deseas registrar un reclamo o una queja.';
  if(data.detalle.length < 20) return 'Describe los hechos con al menos 20 caracteres.';
  if(data.pedido.length < 10) return 'Indica tu pedido concreto con al menos 10 caracteres.';
  if(!form.elements.declaracion.checked) return 'Debes aceptar la declaración para registrar la hoja.';
  return '';
}

function collect(){
  const isMinor = minorToggle.checked;
  return {
    tipo:selectedType(),
    consumidor:{
      nombres:field('nombres'),
      tipoDocumento:field('tipoDocumento'),
      numeroDocumento:field('numeroDocumento'),
      correo:field('correo').toLowerCase(),
      celular:field('celular'),
      direccion:field('direccion'),
      distrito:field('distrito'),
      ubicacion:field('ubicacion'),
      menorEdad:isMinor
    },
    apoderado:{
      nombres:isMinor ? field('apoderadoNombre') : '',
      numeroDocumento:isMinor ? field('apoderadoDocumento') : '',
      correo:isMinor ? field('apoderadoCorreo').toLowerCase() : '',
      celular:isMinor ? field('apoderadoCelular') : ''
    },
    servicio:{
      tipo:'servicio educativo',
      nombre:field('servicio'),
      fecha:field('fechaServicio'),
      monto:decimal(field('monto')),
      comprobante:field('comprobante')
    },
    detalle:clean(form.elements.detalle?.value),
    pedido:clean(form.elements.pedido?.value),
    declaracionAceptada:form.elements.declaracion.checked,
    estado:'recibido',
    estadoAtencion:'pendiente',
    respuestaAdministrativa:'',
    responsable:'',
    notificacionPendiente:true,
    plazoMaximoDiasHabiles:15,
    origen:'libro_reclamaciones_web',
    versionFormato:'2026-01',
    pageUrl:location.href,
    userAgent:navigator.userAgent || ''
  };
}

function codeFor(id){
  const now = new Date();
  const year = now.getFullYear();
  return `LR-${year}-${id.slice(0,8).toUpperCase()}`;
}

function renderReceipt(data,code,registeredAt){
  lastCode = code;
  receiptCode.textContent = code;
  receiptGrid.innerHTML = [
    ['Fecha y hora',formatDate(registeredAt)],
    ['Tipo',data.tipo === 'reclamo' ? 'Reclamo' : 'Queja'],
    ['Consumidor',data.consumidor.nombres],
    ['Documento',`${data.consumidor.tipoDocumento} ${data.consumidor.numeroDocumento}`],
    ['Servicio',data.servicio.nombre],
    ['Monto reclamado',formatMoney(data.servicio.monto)],
    ['Estado','Recibido'],
    ['Plazo de respuesta','Máximo 15 días hábiles']
  ].map(([label,value]) => `<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('');
  receiptDetail.textContent = `DETALLE:\n${data.detalle}\n\nPEDIDO:\n${data.pedido}`;
  receipt.classList.add('show');
  receipt.scrollIntoView({behavior:'smooth',block:'start'});
}

async function submitForm(event){
  event.preventDefault();
  const data = collect();
  const error = validate(data);
  if(error){ showMessage('error',error); return; }

  const previous = Number(localStorage.getItem('nostra_last_claim_at') || 0);
  if(previous && Date.now() - previous < 60000){
    showMessage('error','Ya se registró una solicitud recientemente desde este navegador. Espera un minuto antes de enviar otra.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Registrando...';
  showMessage('info','Registrando la hoja de reclamación y generando la constancia...');

  try{
    const reference = doc(collection(db,'libro_reclamaciones'));
    const code = codeFor(reference.id);
    const registeredAt = new Date();
    await setDoc(reference,{
      ...data,
      codigo:code,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    localStorage.setItem('nostra_last_claim_at',String(Date.now()));
    showMessage('ok',`Hoja registrada correctamente. Código: ${code}`);
    renderReceipt(data,code,registeredAt);
    form.reset();
    syncMinorFields();
    if(typeof window.gtag === 'function'){
      window.gtag('event','libro_reclamaciones_registrado',{event_category:'consumer_service',event_label:data.tipo});
    }
  }catch(error){
    console.error('Error al registrar hoja de reclamación:',error);
    showMessage('error','No se pudo registrar la hoja. Verifica las reglas de Firestore o vuelve a intentarlo en unos minutos.');
  }finally{
    submitButton.disabled = false;
    submitButton.textContent = 'Registrar hoja de reclamación';
  }
}

minorToggle.addEventListener('change',syncMinorFields);
form.addEventListener('submit',submitForm);
document.getElementById('print-receipt').addEventListener('click',() => window.print());
document.getElementById('copy-code').addEventListener('click',async () => {
  if(!lastCode) return;
  try{
    await navigator.clipboard.writeText(lastCode);
    showMessage('ok',`Código copiado: ${lastCode}`);
  }catch{
    showMessage('info',`Código de registro: ${lastCode}`);
  }
});
syncMinorFields();
