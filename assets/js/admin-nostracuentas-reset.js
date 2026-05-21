/* ==================================================
   NostraCUENTAS - Restablecimiento de contraseña desde panel admin
   Complemento seguro: no cambia contraseñas directamente, envía enlace Firebase.
================================================== */
import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const auth = getAuth(getApp());

function clean(value){ return String(value || '').trim(); }
function esc(value){
  return clean(value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[c]));
}
function msg(type, text){
  const el = document.getElementById('accounts-message');
  if(!el) return;
  el.className = 'msg ' + type;
  el.innerHTML = text;
}
function getAuthEmailFromRow(row){
  const small = row.querySelector('td:nth-child(2) small');
  return clean(small && small.textContent);
}
function getAccountNameFromRow(row){
  const name = row.querySelector('td:first-child b');
  const user = row.querySelector('td:nth-child(2) b');
  return clean((name && name.textContent) || (user && user.textContent) || 'esta cuenta');
}
function enhanceRows(){
  document.querySelectorAll('#account-rows tr').forEach(row => {
    if(row.dataset.resetEnhanced === '1') return;
    const actionCell = row.querySelector('td:last-child');
    const authEmail = getAuthEmailFromRow(row);
    if(!actionCell || !authEmail || !authEmail.includes('@')) return;

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'mini';
    resetBtn.dataset.resetPasswordEmail = authEmail;
    resetBtn.textContent = 'Restablecer clave';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'mini';
    copyBtn.dataset.copyAuthEmail = authEmail;
    copyBtn.textContent = 'Copiar correo Auth';

    actionCell.prepend(copyBtn);
    actionCell.prepend(resetBtn);
    row.dataset.resetEnhanced = '1';
  });
}

async function resetPassword(email, row){
  const name = getAccountNameFromRow(row);
  if(!confirm('¿Enviar enlace para restablecer contraseña de ' + name + '?')) return;
  try{
    msg('info', 'Enviando enlace de restablecimiento...');
    await sendPasswordResetEmail(auth, email);
    msg('ok', 'Enlace de restablecimiento enviado a <b>' + esc(email) + '</b>. Si ese correo interno no tiene buzón, copia el correo Auth y cambia la contraseña desde Firebase Authentication.');
  }catch(error){
    console.error(error);
    const code = error && error.code ? error.code : 'sin código';
    msg('err', 'No se pudo enviar el restablecimiento. Código: <b>' + esc(code) + '</b>. Copia el correo Auth y cambia la contraseña manualmente en Firebase Authentication.');
  }
}

async function copyAuthEmail(email){
  try{
    await navigator.clipboard.writeText(email);
    msg('ok', 'Correo de Firebase Authentication copiado: <b>' + esc(email) + '</b>.');
  }catch(error){
    msg('info', 'Correo de Firebase Authentication: <b>' + esc(email) + '</b>.');
  }
}

document.addEventListener('click', event => {
  const resetBtn = event.target.closest('[data-reset-password-email]');
  const copyBtn = event.target.closest('[data-copy-auth-email]');
  if(resetBtn){
    resetPassword(resetBtn.dataset.resetPasswordEmail, resetBtn.closest('tr'));
  }
  if(copyBtn){
    copyAuthEmail(copyBtn.dataset.copyAuthEmail);
  }
});

const observer = new MutationObserver(enhanceRows);
observer.observe(document.body, { childList: true, subtree: true });
enhanceRows();
