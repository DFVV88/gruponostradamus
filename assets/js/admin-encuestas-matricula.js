/* NostraENCUESTAS · administración y envío asistido desde NostraADMIN.
   WhatsApp se abre con mensaje preparado; la plataforma no confirma entregas. */
import {initializeApp,getApp,getApps} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getFirestore,collection,doc,getDocs,query,orderBy,limit,runTransaction,writeBatch,updateDoc,serverTimestamp,Timestamp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const config={apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',projectId:'nostrachat-grupo-nostradamus',storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',messagingSenderId:'869749182265',appId:'1:869749182265:web:5f5c9174680585f142e2e8'};
const app=getApps().length?getApp():initializeApp(config);
const db=getFirestore(app);
const auth=getAuth(app);
const ADMIN='fernandodaniel8888@gmail.com';
const $=id=>document.getElementById(id);
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=value=>String(value==null?'':value).trim();
let students=[],invites=[],responses=[],invitesById=new Map(),responsesByToken=new Map();
let activeStudent=null,lastInvitation=null,loading=false;
let authGeneration=0,initTimer=null;

function matriculado(record){return record.matriculaAprobada===true||record.estado==='matriculado'}
function phone(value){
  let digits=text(value).replace(/\D/g,'');
  if(digits.length===11&&digits.startsWith('51'))digits=digits.slice(2);
  return /^9[0-9]{8}$/.test(digits)?digits:'';
}
function randomToken(){
  const bytes=new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode.apply(null,bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function surveyUrl(token){const url=new URL('encuesta-matricula.html',location.href);url.searchParams.set('t',token);return url.href}
function clientDate(value){return value&&typeof value.toMillis==='function'?value.toMillis():0}
function validInvite(inv){return inv&&/^[A-Za-z0-9_-]{32}$/.test(inv.token||'')&&clientDate(inv.expiresAt)>Date.now()}
function byToken(token){return responsesByToken.get(token)||null}
function surveyStatus(record){
  const invite=invitesById.get(record.id);
  if(invite&&byToken(invite.token))return 'respondida';
  if(invite&&validInvite(invite))return invite.estado==='chat_abierto'?'chat_abierto':'preparada';
  return 'pendiente';
}
function badge(s){
  const value=s==='alerta'?'Atención requerida':s==='respondida'?'Respondida':s==='chat_abierto'?'Chat abierto':s==='preparada'?'Enlace preparado':'Pendiente';
  return '<span class="ne-status '+(s==='alerta'?'red':s==='respondida'?'green':s==='chat_abierto'?'amber':'')+'">'+value+'</span>';
}
function avg(records,field){
  if(!records.length)return '—';
  return (records.reduce((sum,r)=>sum+Number(r[field]||0),0)/records.length).toFixed(1).replace('.',',')+'/5';
}
function getFullResponses(){
  return responses.map(function(resp){
    const invite=invites.find(e=>e.token===resp.id);
    const record=invite?students.find(s=>s.id===invite.id):null;
    return {resp:resp,invite:invite,record:record};
  }).filter(x=>x.invite&&!x.invite.isTest);
}
function createUI(){
  const panel=$('admin-view-encuestas');
  if(!panel||panel.querySelector('#ne-root'))return false;
  panel.innerHTML='<div class="ne-panel" id="ne-root">'+
    '<div class="ne-head"><div><h2 style="margin:0;color:#102c3b">Satisfacción de las familias</h2><p>Encuestas de matrícula con envío asistido por WhatsApp.</p></div><button id="ne-refresh" class="ne-button light" type="button">Actualizar resultados</button></div>'+
    '<div id="ne-message" role="status" aria-live="polite"></div>'+
    '<div class="ne-stats" id="ne-stats"></div>'+
    '<section class="ne-card"><h3 class="ne-strong">Gestionar encuestas</h3><p class="ne-note">Solo se habilita el envío para matrículas aprobadas. “Chat abierto” no significa mensaje entregado.</p>'+
      '<div class="ne-filters"><input id="ne-search" placeholder="Buscar alumno o contacto" aria-label="Buscar matrícula"><select id="ne-cycle" aria-label="Filtrar ciclo"><option value="">Todos los ciclos</option></select><select id="ne-advisor" aria-label="Filtrar trabajador"><option value="">Todos los trabajadores</option></select><select id="ne-state" aria-label="Filtrar estado"><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="preparada">Enlace preparado</option><option value="chat_abierto">Chat abierto</option><option value="respondida">Respondida</option></select></div>'+
      '<div class="ne-table-wrap"><table class="ne-table"><thead><tr><th>Alumno</th><th>Ciclo</th><th>Trabajador evaluado</th><th>WhatsApp apoderado</th><th>Estado</th><th>Valoración</th><th>Acción</th></tr></thead><tbody id="ne-rows"><tr><td colspan="7">Cargando…</td></tr></tbody></table></div>'+
    '</section>'+
    '<div class="ne-columns"><section class="ne-card"><h3 class="ne-strong">Valoración por trabajador</h3><div id="ne-advisors"></div></section><section class="ne-card" id="ne-comentarios"><h3 class="ne-strong">Comentarios y alertas</h3><div id="ne-comments" class="ne-comments"></div></section></div>'+
    '<section class="ne-card"><h3 class="ne-strong">Pruebas internas</h3><p class="ne-note">Sin matrículas ni mensajes a familias. Los resultados de prueba no cuentan en las estadísticas. Enlaces válidos por una hora.</p><button id="ne-test-create" class="ne-button light" type="button">Crear prueba interna</button><div id="ne-tests" class="ne-comments"></div></section>'+
    '</div>'+
    '<div id="ne-back" class="ne-modal-back" hidden><div class="ne-modal" role="dialog" aria-modal="true" aria-labelledby="ne-modal-title">'+
      '<h3 id="ne-modal-title">Preparar encuesta</h3><p id="ne-modal-subtitle"></p>'+
      '<div id="ne-sender">'+
        '<label for="ne-phone">WhatsApp del padre, madre o apoderado</label><input id="ne-phone" type="tel" inputmode="numeric" maxlength="14" placeholder="9 dígitos, sin +51">'+
        '<label for="ne-responsable">Trabajador que atendió la matrícula</label><input id="ne-responsable" type="text" maxlength="90" placeholder="Nombre del trabajador">'+
        '<p class="ne-note">Confirma el número del apoderado; no se utiliza automáticamente el celular del alumno.</p>'+
        '<div class="ne-actions"><button type="button" class="ne-button" id="ne-generate">Preparar enlace</button><button type="button" class="ne-button light" data-ne-close>Cerrar</button></div>'+
        '<div id="ne-send-result" class="ne-alert" hidden></div>'+
        '<div class="ne-actions" id="ne-share-actions" hidden><a id="ne-wa-link" class="ne-button whatsapp ne-wa" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a><button type="button" class="ne-button light" id="ne-copy">Copiar enlace</button></div>'+
      '</div><div id="ne-detail" hidden></div>'+
    '</div></div>';

  $('ne-refresh').addEventListener('click',loadData);
  $('ne-test-create').addEventListener('click',createInternalTest);
  ['ne-search','ne-cycle','ne-advisor','ne-state'].forEach(function(id){
    $(id).addEventListener(id==='ne-search'?'input':'change',renderTable);
  });
  $('ne-rows').addEventListener('click',function(event){
    const send=event.target.closest('[data-ne-send]');
    const reply=event.target.closest('[data-ne-reply]');
    if(send)openSender(send.dataset.neSend);
    if(reply)openDetail(reply.dataset.neReply);
  });
  $('ne-back').addEventListener('click',function(event){
    if(event.target===$('ne-back')||event.target.closest('[data-ne-close]'))closeModal();
  });
  $('ne-generate').addEventListener('click',prepareInvite);
  $('ne-copy').addEventListener('click',async function(){
    if(!lastInvitation)return;
    try{await navigator.clipboard.writeText(surveyUrl(lastInvitation.token));setSendMessage('Enlace copiado.','')}
    catch(_){setSendMessage('No se pudo copiar. Puedes abrir WhatsApp directamente.','error')}
  });
  $('ne-wa-link').addEventListener('click',function(){
    if(!activeStudent||!lastInvitation)return;
    const id=activeStudent.id;
    const current=invitesById.get(id);
    if(current){current.estado='chat_abierto';renderTable();}
    updateDoc(doc(db,'encuestas_matricula_envios',id),{estado:'chat_abierto',updatedAt:serverTimestamp()}).catch(err=>console.error('No se pudo guardar chat abierto',err));
  });
  return true;
}
function message(textValue,error){
  const node=$('ne-message');if(!node)return;
  node.className=error?'ne-error':'ne-note';node.textContent=textValue;
}
async function loadData(){
  if(loading)return;
  if(!auth.currentUser||text(auth.currentUser.email).toLowerCase()!==ADMIN)return;
  const generation=authGeneration;
  loading=true;
  message('Actualizando datos de encuestas…');
  try{
    const results=await Promise.all([
      getDocs(query(collection(db,'preinscripciones'),orderBy('createdAt','desc'),limit(500))),
      getDocs(query(collection(db,'encuestas_matricula_envios'),limit(1000))),
      getDocs(query(collection(db,'encuestas_matricula_respuestas'),limit(1000)))
    ]);
    if(generation!==authGeneration)return;
    students=results[0].docs.map(s=>({id:s.id,...s.data()})).filter(matriculado);
    invites=results[1].docs.map(s=>({id:s.id,...s.data()}));
    responses=results[2].docs.map(s=>({id:s.id,...s.data()}));
    invitesById=new Map(invites.map(i=>[i.id,i]));
    responsesByToken=new Map(responses.map(r=>[r.id,r]));
    populateFilters();renderStats();renderTable();renderAdvisors();renderComments();renderTests();
    message('Datos actualizados. '+students.length+' matrículas aprobadas en los últimos 500 registros.');
  }catch(err){
    console.error('NostraENCUESTAS carga',err);
    message('No fue posible consultar las encuestas. Verifica los permisos y despliegue de reglas Firestore.',true);
  }finally{loading=false}
}
function populateFilters(){
  function fill(id,values,label){
    const el=$(id),selected=el.value;
    el.innerHTML='<option value="">'+label+'</option>'+Array.from(new Set(values.map(text).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'es')).map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
    if(Array.from(el.options).some(o=>o.value===selected))el.value=selected;
  }
  fill('ne-cycle',students.map(s=>s.ciclo),'Todos los ciclos');
  fill('ne-advisor',students.map(s=>(invitesById.get(s.id)||{}).asesor||s.asesorAsignado),'Todos los trabajadores');
}
function renderStats(){
  const all=getFullResponses().map(x=>x.resp);
  const high=all.filter(r=>r.atencion>=4).length;
  $('ne-stats').innerHTML=[
    [students.length,'Matrículas visibles'],[invites.filter(i=>!i.isTest).length,'Encuestas preparadas'],
    [all.length,'Respuestas recibidas'],[all.length?Math.round(100*high/all.length)+'%':'—','Atención buena o excelente']
  ].map(x=>'<div class="ne-stat"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('');
}
function renderTable(){
  const tbody=$('ne-rows');if(!tbody)return;
  const term=text($('ne-search').value).toLowerCase(),cycle=$('ne-cycle').value,advisor=$('ne-advisor').value,state=$('ne-state').value;
  const filtered=students.filter(function(s){
    const inv=invitesById.get(s.id)||{};
    const assigned=inv.asesor||s.asesorAsignado||'';
    const hay=[s.nombre,s.apoderado,s.ciclo,s.celularApoderado,s.celular,assigned].join(' ').toLowerCase();
    return (!term||hay.includes(term))&&(!cycle||s.ciclo===cycle)&&(!advisor||assigned===advisor)&&(!state||surveyStatus(s)===state);
  });
  tbody.innerHTML=filtered.length?filtered.map(function(s){
    const inv=invitesById.get(s.id),answer=inv?byToken(inv.token):null,st=surveyStatus(s);
    return '<tr><td><b>'+esc(s.nombre||'Sin nombre')+'</b><small>'+esc(s.apoderado||'')+'</small></td>'+
      '<td>'+esc(s.ciclo||'—')+'</td><td>'+esc((inv&&inv.asesor)||s.asesorAsignado||'Sin asignar')+'</td>'+
      '<td>'+esc((inv&&inv.telefonoDestino)||phone(s.celularApoderado)||'Por confirmar')+'</td>'+
      '<td>'+badge(st)+'</td><td>'+(answer?'Atención: '+answer.atencion+'/5<br>Personal: '+answer.personal+'/5':'—')+'</td>'+
      '<td>'+(answer?'<button class="ne-button small light" data-ne-reply="'+esc(inv.token)+'">Ver respuesta</button>':'<button class="ne-button small whatsapp" data-ne-send="'+esc(s.id)+'">Enviar encuesta</button>')+'</td></tr>';
  }).join(''):'<tr><td colspan="7" class="ne-empty">No hay matrículas para estos filtros.</td></tr>';
}
function renderAdvisors(){
  const groups=new Map();
  getFullResponses().forEach(function(x){
    const worker=text(x.invite.asesor)||'Sin asignar';
    if(!groups.has(worker))groups.set(worker,[]);
    groups.get(worker).push(x.resp);
  });
  $('ne-advisors').innerHTML=groups.size?'<div class="ne-table-wrap"><table class="ne-table" style="min-width:370px"><thead><tr><th>Trabajador</th><th>Respuestas</th><th>Promedio</th></tr></thead><tbody>'+
    Array.from(groups.entries()).sort((a,b)=>b[1].length-a[1].length).map(x=>'<tr><td><b>'+esc(x[0])+'</b></td><td>'+x[1].length+'</td><td>'+avg(x[1],'personal')+'</td></tr>').join('')+'</tbody></table></div>':
    '<p class="ne-empty">Aún no hay valoraciones del personal.</p>';
}
function renderComments(){
  const selected=getFullResponses().filter(x=>text(x.resp.comentario)||x.resp.atencion<=2||x.resp.personal<=2);
  selected.sort((a,b)=>Math.min(a.resp.atencion,a.resp.personal)-Math.min(b.resp.atencion,b.resp.personal));
  $('ne-comments').innerHTML=selected.length?selected.slice(0,25).map(function(x){
    const alert=x.resp.atencion<=2||x.resp.personal<=2;
    return '<div class="ne-comment"><div>'+badge(alert?'alerta':'respondida')+' <b>'+esc(x.invite.asesor||'Sin asignar')+'</b></div>'+
      '<small>'+esc((x.record&&x.record.nombre)||'Matrícula')+' · '+x.resp.atencion+'/5 atención · '+x.resp.personal+'/5 personal</small>'+
      (x.resp.comentario?'<p>'+esc(x.resp.comentario)+'</p>':'<p>Calificación baja sin comentario.</p>')+
      (x.resp.autorizaContacto&&phone(x.resp.whatsapp)?'<a href="https://wa.me/51'+phone(x.resp.whatsapp)+'" target="_blank" rel="noopener noreferrer">Contactar por WhatsApp</a>':'')+
      '</div>';
  }).join(''):'<p class="ne-empty">Sin comentarios ni alertas por ahora.</p>';
}
function setSendMessage(value,error){
  const box=$('ne-send-result');box.hidden=false;box.textContent=value;box.className='ne-alert'+(error?' error':'');
}
function openSender(id){
  const student=students.find(s=>s.id===id);if(!student||!matriculado(student))return;
  const inv=invitesById.get(id);
  if(inv&&byToken(inv.token)){openDetail(inv.token);return}
  activeStudent=student;lastInvitation=null;
  $('ne-back').hidden=false;
  $('ne-sender').hidden=false;$('ne-detail').hidden=true;
  $('ne-modal-title').textContent='Encuesta por WhatsApp';
  $('ne-modal-subtitle').textContent=student.nombre+' · '+(student.ciclo||'Matrícula');
  $('ne-phone').value=(inv&&phone(inv.telefonoDestino))||phone(student.celularApoderado)||'';
  $('ne-responsable').value=(inv&&inv.asesor)||text(student.asesorAsignado);
  $('ne-send-result').hidden=true;$('ne-share-actions').hidden=true;
  $('ne-generate').disabled=false;
  $('ne-phone').focus();
}
function closeModal(){
  $('ne-back').hidden=true;activeStudent=null;lastInvitation=null;
}
function openDetail(token){
  const inv=invites.find(i=>i.token===token),answer=byToken(token);
  if(!inv||!answer)return;
  const student=students.find(s=>s.id===inv.id);
  activeStudent=null;lastInvitation=null;
  $('ne-back').hidden=false;$('ne-sender').hidden=true;$('ne-detail').hidden=false;
  $('ne-modal-title').textContent='Respuesta recibida';
  $('ne-modal-subtitle').textContent=(student&&student.nombre)||'Matrícula';
  $('ne-detail').innerHTML='<p><b>Trabajador:</b> '+esc(inv.asesor||'Sin asignar')+'</p>'+
    '<p><b>Atención:</b> '+answer.atencion+'/5 · <b>Personal:</b> '+answer.personal+'/5</p>'+
    '<p><b>Información clara:</b> '+esc(answer.claridad==='si'?'Sí, completamente':answer.claridad==='no'?'No fue clara':'Parcialmente')+'</p>'+
    '<p><b>Comentario:</b> '+esc(answer.comentario||'Sin comentario')+'</p>'+
    '<p><b>WhatsApp autorizado:</b> '+(answer.autorizaContacto?esc(answer.whatsapp):'No autorizado')+'</p>'+
    '<button class="ne-button light" data-ne-close type="button">Cerrar</button>';
}
async function prepareInvite(){
  if(!activeStudent)return;
  const number=phone($('ne-phone').value),worker=text($('ne-responsable').value);
  if(!number){setSendMessage('Confirma un WhatsApp peruano válido del padre, madre o apoderado.','error');return}
  if(worker.length<2||worker.length>90){setSendMessage('Indica el nombre del trabajador que realizó la matrícula.','error');return}
  const button=$('ne-generate');button.disabled=true;button.textContent='Preparando…';
  try{
    const student=activeStudent;
    const inviteRef=doc(db,'encuestas_matricula_envios',student.id);
    const data=await runTransaction(db,async function(tx){
      const preSnap=await tx.get(doc(db,'preinscripciones',student.id));
      const prior=await tx.get(inviteRef);
      const existing=prior.exists()?prior.data():null;
      if(!preSnap.exists()||!matriculado(preSnap.data()))throw new Error('MATRICULA_NO_APROBADA');
      if(existing&&existing.token){
        const answerSnap=await tx.get(doc(db,'encuestas_matricula_respuestas',existing.token));
        if(answerSnap.exists())throw new Error('ENCUESTA_YA_RESPONDIDA');
      }
      if(existing&&validInvite(existing)){
        const changed={asesor:worker,telefonoDestino:number,ciclo:text(student.ciclo),updatedAt:serverTimestamp()};
        tx.update(inviteRef,changed);
        return {token:existing.token,expiresAt:existing.expiresAt,asesor:worker,telefonoDestino:number,estado:existing.estado||'preparado',ciclo:text(student.ciclo)};
      }
      const token=randomToken();
      const expiry=Timestamp.fromDate(new Date(Date.now()+30*86400000));
      tx.set(doc(db,'encuestas_matricula_tokens',token),{
        createdAt:serverTimestamp(),expiresAt:expiry
      });
      tx.set(inviteRef,{
        token:token,nombreAlumno:text(student.nombre),ciclo:text(student.ciclo),
        asesor:worker,telefonoDestino:number,estado:'preparado',
        createdAt:serverTimestamp(),updatedAt:serverTimestamp(),expiresAt:expiry
      });
      return {token:token,expiresAt:expiry,asesor:worker,telefonoDestino:number,estado:'preparado',ciclo:text(student.ciclo)};
    });
    lastInvitation=data;
    invitesById.set(student.id,{id:student.id,...data});
    const idx=invites.findIndex(i=>i.id===student.id);
    if(idx>=0)invites[idx]={id:student.id,...data};
    else invites.push({id:student.id,...data});
    const messageText='Estimada familia de '+text(student.nombre)+':\n\n¡Gracias por confiar en Grupo Nostradamus! 🎓\n\nNos gustaría conocer cómo fue la atención recibida durante la matrícula.\n\n📝 Responde aquí nuestra breve encuesta (1 minuto):\n'+surveyUrl(data.token)+'\n\nTu opinión nos ayuda a mejorar.\n\nGrupo Nostradamus';
    $('ne-wa-link').href='https://wa.me/51'+number+'?text='+encodeURIComponent(messageText);
    $('ne-share-actions').hidden=false;
    setSendMessage('Enlace listo. Abre WhatsApp y presiona Enviar en la conversación. El panel solo registrará que se abrió el chat.','');
    populateFilters();renderStats();renderTable();renderAdvisors();
  }catch(err){
    console.error('No se pudo preparar encuesta',err);
    setSendMessage(err.message==='ENCUESTA_YA_RESPONDIDA'?'La familia ya respondió esta encuesta. Actualiza los resultados.':err.message==='MATRICULA_NO_APROBADA'?'La matrícula ya no está aprobada. Actualiza el panel.':'No se pudo preparar el enlace. Verifica las reglas Firestore y vuelve a intentar.','error');
  }finally{button.disabled=false;button.textContent='Preparar enlace'}
}

function renderTests(){
  const tests=invites.filter(i=>i.isTest).sort((a,b)=>clientDate(b.createdAt)-clientDate(a.createdAt));
  $('ne-tests').innerHTML=tests.map(function(inv){
    const answer=byToken(inv.token);
    return '<div class="ne-comment"><b>PRUEBA INTERNA</b> · '+esc(inv.id)+'<br>'+
      (answer?'<span>Respuesta recibida: atención '+answer.atencion+'/5 · personal '+answer.personal+'/5 · '+esc(answer.claridad)+'</span><p>'+esc(answer.comentario)+'</p><small>WhatsApp autorizado: '+(answer.autorizaContacto?esc(answer.whatsapp):'No')+'</small>'+(answer.atencion<=2||answer.personal<=2?badge('alerta'):''):
        '<a href="'+esc(surveyUrl(inv.token))+'" target="_blank" rel="noopener noreferrer">Abrir formulario de prueba</a>')+'</div>';
  }).join('')||'<p class="ne-note">No hay pruebas internas.</p>';
}
async function createInternalTest(){
  const button=$('ne-test-create');button.disabled=true;
  try{
    const token=randomToken(),id='prueba_'+token;
    const expiresAt=Timestamp.fromDate(new Date(Date.now()+3600000));
    const batch=writeBatch(db);
    batch.set(doc(db,'encuestas_matricula_tokens',token),{createdAt:serverTimestamp(),expiresAt:expiresAt});
    batch.set(doc(db,'encuestas_matricula_envios',id),{
      token:token,isTest:true,nombreAlumno:'PRUEBA INTERNA',ciclo:'PRUEBA',asesor:'PRUEBA INTERNA',
      telefonoDestino:'',estado:'preparado',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),expiresAt:expiresAt
    });
    await batch.commit();await loadData();
    message('Prueba creada. Abre el formulario en Pruebas internas; no se enviará ningún mensaje.');
  }catch(err){console.error('NostraENCUESTAS prueba',err);message('No se pudo crear la prueba interna.',true)}
  finally{button.disabled=false}
}

onAuthStateChanged(auth,function(user){
  authGeneration++;
  clearInterval(initTimer);
  if(!user||text(user.email).toLowerCase()!==ADMIN){
    students=[];invites=[];responses=[];invitesById.clear();responsesByToken.clear();
    activeStudent=null;lastInvitation=null;loading=false;
    const panel=$('admin-view-encuestas');if(panel)panel.innerHTML='';
    return;
  }
  let attempts=0;
  initTimer=setInterval(function(){
    attempts++;
    if(createUI()||$('ne-root')){
      clearInterval(initTimer);loadData();
    }else if(attempts>=60){clearInterval(initTimer);console.error('NostraENCUESTAS: no se encontró vista de administración')}
  },250);
});
