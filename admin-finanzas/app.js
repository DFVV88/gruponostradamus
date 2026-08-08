const STORAGE_KEY='nostra_finance_movements_v1';
const incomeCategories=['Matrícula','Pensión','Material académico','Simulacro','Otro ingreso'];
const expenseCategories=['Pago a docente','Alquiler','Servicios','Publicidad','Impresiones y materiales','Personal administrativo','Deudas','Otro egreso'];

const state={movements:loadMovements(),period:'month',referenceDate:todayISO(),search:'',type:'all'};
const $=id=>document.getElementById(id);

function todayISO(){return new Date().toISOString().slice(0,10)}
function loadMovements(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return []}}
function saveMovements(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.movements))}
function money(value){return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(value)}
function safe(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function samePeriod(date,period,reference){
  if(period==='all')return true;
  if(period==='day')return date===reference;
  if(period==='month')return date.slice(0,7)===reference.slice(0,7);
  return date.slice(0,4)===reference.slice(0,4);
}
function periodMovements(){return state.movements.filter(item=>samePeriod(item.date,state.period,state.referenceDate))}
function totals(items){return items.reduce((acc,item)=>{acc[item.type]+=Number(item.amount);return acc},{income:0,expense:0})}
function updateCategories(){
  const categories=$('movementType').value==='income'?incomeCategories:expenseCategories;
  $('movementCategory').innerHTML=categories.map(c=>`<option>${safe(c)}</option>`).join('');
}
function movementRow(item,withDelete=false){
  const isIncome=item.type==='income';
  return `<tr><td>${safe(item.date)}</td><td>${safe(item.description)}</td><td>${safe(item.category)}</td><td>${safe(item.method)}</td><td><span class="type-pill ${item.type}">${isIncome?'Ingreso':'Egreso'}</span></td><td class="${isIncome?'amount-income':'amount-expense'}">${isIncome?'+':'-'} ${money(item.amount)}</td>${withDelete?`<td><button class="delete-btn" data-delete="${item.id}" title="Anular registro">Anular</button></td>`:''}</tr>`;
}
function renderSummary(){
  const items=periodMovements().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  const total=totals(items);const balance=total.income-total.expense;
  $('incomeTotal').textContent=money(total.income);$('expenseTotal').textContent=money(total.expense);$('balanceTotal').textContent=money(balance);$('movementCount').textContent=items.length;
  $('balanceTotal').className=balance<0?'amount-expense':'amount-income';
  const recent=items.slice(0,6);$('recentRows').innerHTML=recent.map(i=>movementRow(i)).join('');$('recentEmpty').hidden=recent.length>0;
  const combined=total.income+total.expense;const incomePct=combined?Math.round(total.income/combined*100):0;const expensePct=combined?100-incomePct:0;
  $('incomeBar').style.width=`${incomePct}%`;$('expenseBar').style.width=`${expensePct}%`;$('incomePercent').textContent=`${incomePct}%`;$('expensePercent').textContent=`${expensePct}%`;
  $('reportIncome').textContent=money(total.income);$('reportExpense').textContent=money(total.expense);$('reportBalance').textContent=money(balance);
}
function renderMovements(){
  const query=state.search.toLowerCase();
  const items=state.movements.filter(item=>(state.type==='all'||item.type===state.type)&&[item.description,item.category,item.method,item.operation].join(' ').toLowerCase().includes(query)).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  $('movementRows').innerHTML=items.map(i=>movementRow(i,true)).join('');$('movementEmpty').hidden=items.length>0;
}
function render(){renderSummary();renderMovements()}
function openDialog(){
  $('movementForm').reset();$('movementDate').value=todayISO();$('movementType').value='income';updateCategories();$('movementDialog').showModal();
}
function closeDialog(){$('movementDialog').close()}
function showSection(id){document.querySelectorAll('.panel-section').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('.nav-item[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===id))}
function exportCSV(){
  if(!state.movements.length)return alert('No hay movimientos para exportar.');
  const header=['Fecha','Tipo','Concepto','Categoría','Método','Monto','Operación','Observación'];
  const quote=v=>`"${String(v??'').replaceAll('"','""')}"`;
  const rows=state.movements.map(i=>[i.date,i.type==='income'?'Ingreso':'Egreso',i.description,i.category,i.method,i.amount,i.operation,i.notes].map(quote).join(','));
  const blob=new Blob(['\ufeff'+[header.join(','),...rows].join('\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`movimientos-nostradamus-${todayISO()}.csv`;a.click();URL.revokeObjectURL(url);
}

$('referenceDate').value=state.referenceDate;
$('periodFilter').value=state.period;
$('newMovementBtn').addEventListener('click',openDialog);
$('closeDialog').addEventListener('click',closeDialog);
$('cancelDialog').addEventListener('click',closeDialog);
$('movementType').addEventListener('change',updateCategories);
$('periodFilter').addEventListener('change',e=>{state.period=e.target.value;renderSummary()});
$('referenceDate').addEventListener('change',e=>{state.referenceDate=e.target.value||todayISO();renderSummary()});
$('searchInput').addEventListener('input',e=>{state.search=e.target.value;renderMovements()});
$('typeFilter').addEventListener('change',e=>{state.type=e.target.value;renderMovements()});
$('exportBtn').addEventListener('click',exportCSV);
document.querySelectorAll('.nav-item[data-section]').forEach(btn=>btn.addEventListener('click',()=>showSection(btn.dataset.section)));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>showSection(btn.dataset.go)));
$('movementForm').addEventListener('submit',event=>{
  event.preventDefault();
  const amount=Number($('movementAmount').value);if(!Number.isFinite(amount)||amount<=0)return;
  state.movements.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),type:$('movementType').value,date:$('movementDate').value,description:$('movementDescription').value.trim(),category:$('movementCategory').value,method:$('paymentMethod').value,amount,operation:$('operationNumber').value.trim(),notes:$('movementNotes').value.trim(),createdAt:new Date().toISOString()});
  saveMovements();closeDialog();render();
});
$('movementRows').addEventListener('click',event=>{
  const id=event.target.dataset.delete;if(!id)return;
  if(!confirm('¿Deseas anular este movimiento? El registro se retirará de esta versión inicial.'))return;
  state.movements=state.movements.filter(item=>item.id!==id);saveMovements();render();
});
render();