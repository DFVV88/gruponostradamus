/* NostraCUENTAS: consulta del estado de vinculación en NostraPORTAL.
   No crea vínculos ni asocia identidades por nombre. */
const API='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostraportalApi';
const states=new Map();
export function portalLinkInfo(uid){return states.get(uid)||{estado:'consultando'}}
const statesNames={vinculado:'Vinculada',pendiente:'Por vincular',revisar:'Revisar vínculo',error:'Sin verificar',consultando:'Consultando'};
function safeId(s){return /^[A-Za-z0-9_-]{12,150}$/.test(s||'')?s:''}
export async function refreshPortalLinkStates(user,accounts,render){
  if(!user){states.clear();render();return}
  const ids=accounts.filter(a=>a.role==='student').map(a=>safeId(a.id)).filter(Boolean);
  states.clear();ids.forEach(uid=>states.set(uid,{estado:'consultando'}));render();
  let failed=0;
  for(let i=0;i<ids.length;i+=100){
    const uids=ids.slice(i,i+100);
    try{
      const token=await user.getIdToken();
      const response=await fetch(API,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action:'admin_link_status',uids})});
      const body=await response.json();
      if(!response.ok||!body.ok)throw Error(body.message||'Servicio no disponible');
      for(const uid of uids)states.set(uid,body.data.estados?.[uid]||{estado:'revisar'});
    }catch(error){
      console.warn('No se pudieron consultar estados NostraPORTAL:',error.message);
      failed+=uids.length;
      for(const uid of uids)states.set(uid,{estado:'error'});
    }
    render();
  }
  return {total:ids.length,failed};
}
export function portalLinkCell(account){
  if(account.role!=='student')return '<span style="font-size:11px;color:#6b7d85">No corresponde</span>';
  const state=portalLinkInfo(account.id);
  const cell=document.createElement('td');
  const mark=document.createElement('span');
  mark.textContent=statesNames[state.estado]||'Sin verificar';
  mark.style.cssText='font-size:11px;font-weight:850;color:'+(state.estado==='vinculado'?'#167653':state.estado==='revisar'?'#9b2929':'#506d79');
  cell.append(mark);
  if(account.role==='student'&&state.estado!=='vinculado'){
    const link=document.createElement('a');
    const uid=safeId(account.id);
    if(uid){
      link.href='admin-nostraportal.html?uid='+encodeURIComponent(uid);
      link.textContent='Vincular ficha';
      link.style.cssText='display:block;font-size:11px;font-weight:900;margin-top:5px;color:#087f95';
      cell.append(link);
    }
  }
  return cell.innerHTML;
}
