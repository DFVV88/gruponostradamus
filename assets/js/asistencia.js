const ENDPOINT = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/asistenciaRegistrar';
const STORAGE_KEY = 'nostra_asistencia_device_v1';
const DEVICE_TOKEN_RE = /^[a-f0-9]{64}$/i;

const $ = id => document.getElementById(id);
const form = $('attendance-form');
const dniInput = $('dni');
const submit = $('submit-btn');
const result = $('result');
const noToken = $('no-token');
const token = new URLSearchParams(location.search).get('token') || '';
const intro = document.querySelector('.card > p');
let busy = false;

if(intro){
  intro.textContent = 'Escanea el QR del local. Si este celular ya está vinculado, tu asistencia se registra automáticamente. Si es la primera vez, te pediremos tu DNI una sola vez.';
}
form.style.display = 'none';

function updateClock(){
  const now = new Date();
  $('clock').textContent = now.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  $('today-label').textContent = now.toLocaleDateString('es-PE',{weekday:'short',day:'2-digit',month:'short'});
}
updateClock();
setInterval(updateClock,1000);

function show(type,title,text,small=''){
  result.className = `result show ${type}`;
  result.innerHTML = `<strong>${title}</strong>${text}${small ? `<small>${small}</small>` : ''}`;
}

function clearResult(){
  result.className = 'result';
  result.innerHTML = '';
}

function movementTitle(attendance){
  if(attendance.movimiento === 'salida') return 'Salida registrada';
  if(attendance.movimiento === 'duplicado') return 'Ya registraste tu asistencia';
  return 'Asistencia registrada';
}

function detailText(attendance){
  const person = attendance.person;
  if(person && person.nombre){
    const role = person.tipo ? person.tipo.charAt(0).toUpperCase() + person.tipo.slice(1) : '';
    const extra = [role,person.ciclo || person.detalle].filter(Boolean).join(' · ');
    return `${person.nombre}${extra ? `<br><small>${extra}</small>` : ''}`;
  }
  return 'Registro guardado correctamente. Tu información se vinculará con la base institucional.';
}

function statusText(attendance){
  if(attendance.estado === 'tardanza') return `Tardanza: ${attendance.minutosTardanza || 0} min`;
  if(attendance.estado === 'puntual') return 'Registro puntual';
  return 'Registro guardado';
}

function renderAttendance(attendance, automatic=false, linkedNow=false, storageSaved=true){
  const status = statusText(attendance);
  let extra = automatic ? 'Identificación automática' : '';
  if(linkedNow) extra = storageSaved ? 'Celular vinculado · desde la próxima asistencia será automático' : 'No pudimos guardar la vinculación en este navegador';
  const footer = [attendance.hora || '', status, extra].filter(Boolean).join(' · ');
  show(attendance.estado === 'tardanza' ? 'warn' : 'ok',movementTitle(attendance),detailText(attendance),footer);
}

function readDeviceToken(){
  try{
    const value = (localStorage.getItem(STORAGE_KEY) || '').trim().toLowerCase();
    if(DEVICE_TOKEN_RE.test(value)) return value;
    if(value) localStorage.removeItem(STORAGE_KEY);
  }catch(_){
    return '';
  }
  return '';
}

function saveDeviceToken(value){
  if(!DEVICE_TOKEN_RE.test(value || '')) return false;
  try{
    localStorage.setItem(STORAGE_KEY,value.toLowerCase());
    return localStorage.getItem(STORAGE_KEY) === value.toLowerCase();
  }catch(_){
    return false;
  }
}

function clearDeviceToken(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(_){ /* sin almacenamiento */ }
}

function revealFirstTimeForm(message='Ingresa tu DNI solo esta primera vez. Este celular quedará vinculado para tus siguientes asistencias.'){
  busy = false;
  form.style.display = '';
  submit.disabled = false;
  submit.textContent = 'Vincular celular y registrar';
  const help = $('dni-help');
  if(help) help.textContent = message;
  window.setTimeout(() => dniInput.focus(),150);
}

function hideForm(){
  form.style.display = 'none';
}

function removeQrFromAddressBar(){
  try{ history.replaceState(null,'',location.pathname); }catch(_){ /* navegación sin soporte */ }
}

async function postAttendance(body){
  const response = await fetch(ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  return {response,payload};
}

async function registerKnownDevice(deviceToken){
  try{
    busy = true;
    hideForm();
    clearResult();
    if(intro) intro.textContent = 'Reconociendo este celular y registrando tu asistencia...';
    const {response,payload} = await postAttendance({token,deviceToken});

    if(!response.ok || !payload.ok){
      if(payload.error === 'DISPOSITIVO_NO_VINCULADO'){
        clearDeviceToken();
        if(intro) intro.textContent = 'Es la primera vez que usas este celular para asistencia. Ingresa tu DNI una sola vez para vincularlo.';
        revealFirstTimeForm();
        return;
      }
      const expired = payload.error === 'QR_EXPIRADO' || payload.error === 'QR_INVALIDO';
      if(intro) intro.textContent = expired ? 'El QR que escaneaste ya cambió. Escanea nuevamente el código que aparece en la pantalla del local.' : 'No pudimos completar el registro automático.';
      show(expired ? 'warn' : 'err',expired ? 'QR vencido' : 'No se pudo registrar',payload.message || 'Intenta nuevamente.');
      return;
    }

    const attendance = payload.asistencia || {};
    if(intro) intro.textContent = 'Tu celular fue reconocido automáticamente.';
    renderAttendance(attendance,true,false,true);
    removeQrFromAddressBar();
  }catch(error){
    console.error(error);
    if(intro) intro.textContent = 'No pudimos contactar al sistema.';
    show('err','Sin conexión','No se pudo contactar al sistema. Verifica tu conexión y vuelve a escanear el QR.');
  }finally{
    busy = false;
  }
}

async function bootstrap(){
  if(!/^[a-f0-9]{48}$/i.test(token)){
    hideForm();
    noToken.classList.add('show');
    if(intro) intro.textContent = 'Para registrar tu asistencia debes escanear el QR vigente que se muestra en el local.';
    return;
  }

  const deviceToken = readDeviceToken();
  if(deviceToken){
    await registerKnownDevice(deviceToken);
    return;
  }

  if(intro) intro.textContent = 'Es la primera vez que usas este celular para asistencia. Ingresa tu DNI una sola vez para vincularlo.';
  revealFirstTimeForm();
}

dniInput.addEventListener('input',() => {
  dniInput.value = dniInput.value.replace(/\D/g,'').slice(0,12);
});

form.addEventListener('submit',async event => {
  event.preventDefault();
  if(busy) return;
  const dni = dniInput.value.replace(/\D/g,'');
  if(!/^\d{8,12}$/.test(dni)){
    show('err','Revisa tu DNI','Debe contener entre 8 y 12 dígitos.');
    dniInput.focus();
    return;
  }

  try{
    busy = true;
    submit.disabled = true;
    submit.textContent = 'Vinculando...';
    clearResult();
    const {response,payload} = await postAttendance({dni,token,vincularDispositivo:true});

    if(!response.ok || !payload.ok){
      const expired = payload.error === 'QR_EXPIRADO' || payload.error === 'QR_INVALIDO';
      show(expired ? 'warn' : 'err',expired ? 'QR vencido' : 'No se pudo registrar',payload.message || 'Intenta nuevamente.');
      if(expired){
        hideForm();
        if(intro) intro.textContent = 'El QR que escaneaste ya cambió. Escanea nuevamente el código actual de la pantalla.';
      }
      return;
    }

    const attendance = payload.asistencia || {};
    const newDeviceToken = payload.dispositivo && payload.dispositivo.token ? payload.dispositivo.token : '';
    const storageSaved = newDeviceToken ? saveDeviceToken(newDeviceToken) : false;
    if(intro) intro.textContent = storageSaved
      ? 'Listo. Este celular quedó vinculado y en tus próximas asistencias solo tendrás que escanear el QR.'
      : 'Tu asistencia fue registrada. Este navegador no permitió guardar la vinculación del celular.';
    renderAttendance(attendance,false,Boolean(newDeviceToken),storageSaved);
    hideForm();
    dniInput.value = '';
    removeQrFromAddressBar();
  }catch(error){
    console.error(error);
    show('err','Sin conexión','No se pudo contactar al sistema. Verifica tu conexión e intenta nuevamente.');
  }finally{
    busy = false;
    if(form.style.display !== 'none'){
      submit.disabled = false;
      submit.textContent = 'Vincular celular y registrar';
    }
  }
});

bootstrap();
