const ENDPOINT = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/asistenciaRegistrar';

const $ = id => document.getElementById(id);
const form = $('attendance-form');
const dniInput = $('dni');
const submit = $('submit-btn');
const result = $('result');
const noToken = $('no-token');
const token = new URLSearchParams(location.search).get('token') || '';
let busy = false;

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
  return 'DNI guardado correctamente. Tu información se vinculará con la base institucional.';
}

if(!/^[a-f0-9]{48}$/i.test(token)){
  form.style.display = 'none';
  noToken.classList.add('show');
}else{
  setTimeout(() => dniInput.focus(),200);
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
    submit.textContent = 'Registrando...';
    result.className = 'result';
    const response = await fetch(ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({dni,token})
    });
    const payload = await response.json().catch(() => ({}));
    if(!response.ok || !payload.ok){
      const expired = payload.error === 'QR_EXPIRADO' || payload.error === 'QR_INVALIDO';
      show(expired ? 'warn' : 'err',expired ? 'QR vencido' : 'No se pudo registrar',payload.message || 'Intenta nuevamente.');
      if(expired){
        submit.disabled = true;
        submit.textContent = 'Escanea el QR actual';
      }
      return;
    }
    const attendance = payload.asistencia || {};
    const status = attendance.estado === 'tardanza'
      ? `Tardanza: ${attendance.minutosTardanza || 0} min`
      : attendance.estado === 'puntual' ? 'Registro puntual' : 'Registro guardado';
    show(attendance.estado === 'tardanza' ? 'warn' : 'ok',movementTitle(attendance),detailText(attendance),`${attendance.hora || ''} · ${status}`);
    dniInput.value = '';
    window.setTimeout(() => { if(!busy) dniInput.focus(); },500);
  }catch(error){
    console.error(error);
    show('err','Sin conexión','No se pudo contactar al sistema. Verifica tu conexión e intenta nuevamente.');
  }finally{
    busy = false;
    if(submit.textContent !== 'Escanea el QR actual'){
      submit.disabled = false;
      submit.textContent = 'Registrar asistencia';
    }
  }
});
