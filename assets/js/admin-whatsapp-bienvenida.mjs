/* NostraM365 · editor manual WhatsApp (sin API, sin contraseñas persistidas).
   Copia en el portapapeles y abre wa.me SOLO con el número: nunca coloca
   credenciales en URLs, Firestore, almacenamiento local, logs ni analítica. */
const DOMAIN = 'gruponostradamus.edu.pe';

export function normalizeStudentPhone(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (/^00519\d{8}$/.test(digits)) digits = digits.slice(2);
  if (/^9\d{8}$/.test(digits)) digits = '51' + digits;
  return /^519\d{8}$/.test(digits) ? digits : null;
}

export function welcomeApproved(record) {
  return Boolean(record &&
    (record.matriculaAprobada === true || record.estado === 'matriculado') &&
    record.pagoValidado === true && record.estadoPago === 'pago_validado' &&
    record.estado !== 'rechazado');
}

export function suggestInstitutionalEmail(record) {
  const existing = String(record?.correoInstitucional || record?.institutionalEmail || '').trim();
  if (existing.toLowerCase().endsWith('@' + DOMAIN)) return existing.toLowerCase();
  const words = String(record?.nombre || '').trim().split(/\s+/).filter(Boolean);
  if (words.length !== 2 && words.length < 4) return '';
  const slug = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  if (words.some(v => /^(de|del|la|las|los|y)$/i.test(v))) return '';
  const first = slug(words[0]);
  const last = slug(words.length === 2 ? words[1] : words[words.length - 2]);
  if (!/^[a-z0-9]{2,30}$/.test(first) || !/^[a-z0-9]{2,30}$/.test(last)) return '';
  return first + '.' + last + '@' + DOMAIN;
}

export function validInstitutionalEmail(value) {
  return /^[a-z0-9][a-z0-9._-]{2,63}@gruponostradamus\.edu\.pe$/.test(
    String(value ?? '').trim().toLowerCase());
}

export function buildWelcomeWhatsApp(record, institutionalEmail, password) {
  const first = String(record?.nombre || '').trim().split(/\s+/)[0] || 'alumno';
  const name = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  const mail = String(institutionalEmail || '').trim().toLowerCase();
  const pass = String(password ?? '');
  if (!validInstitutionalEmail(mail)) throw new Error('CORREO_INSTITUCIONAL_INVALIDO');
  if (pass.length < 8 || /[\r\n]/.test(pass)) throw new Error('CONTRASENA_INVALIDA');
  return [
    '🎉 *¡Bienvenido, ' + name + ', al Grupo Nostradamus!* 📚🚀',
    '',
    'Tu matrícula ha sido aprobada y tu cuenta institucional está lista.',
    '',
    '🎓 *TUS ACCESOS INSTITUCIONALES*',
    '👤 *Usuario institucional:* ' + mail,
    '🔑 *Contraseña institucional:* ' + pass,
    '',
    'Puedes iniciar sesión directamente con esta contraseña. No necesitas cambiarla en el primer ingreso. Consérvala de forma segura y no la compartas.',
    '',
    '📲 *INGRESO A MICROSOFT TEAMS*',
    '1️⃣ Ingresa a https://gruponostradamus.edu.pe/',
    '2️⃣ Selecciona "Clases en vivo" → "Entrar a Microsoft Teams".',
    '3️⃣ Inicia sesión con tus credenciales institucionales.',
    '📌 Pasos detallados: https://tinyurl.com/NostraPASOS',
    '',
    '🔐 *ACTIVA TU NostraCUENTA*',
    'Después de comprobar tu acceso a Teams, visita https://gruponostradamus.edu.pe/cuenta-nostra.html',
    '👉 Selecciona "Alumno aprobado".',
    '👉 Haz clic en "Activar NostraCUENTA".',
    '👉 Crea tu USUARIO CORTO.',
    '',
    '🚀 Accede a NostraCHAT, DAMUS Académico y los recursos habilitados del Portal del Alumno.',
    '💬 Si tienes inconvenientes, responde a este WhatsApp.',
    '🔐 Tus credenciales son personales; no las compartas.',
    '',
    '💪🎯 *¡Vamos con todo por ese ingreso a la UNI!*',
    '💙💛 *Grupo Nostradamus*',
    '📚 La ruta que transforma alumnos en cachimbos.'
  ].join('\n');
}

const STYLE = [
  '.nostra-wa-shade{position:fixed;inset:0;z-index:12000;display:flex;justify-content:center;align-items:center;',
  'background:rgba(2,7,13,.72);padding:18px;}',
  '.nostra-wa-card{width:min(710px,100%);max-height:94vh;overflow:auto;background:#fff;color:#173039;',
  'border:1px solid #b8dce0;box-shadow:0 25px 80px rgba(0,0,0,.30);border-radius:22px;',
  'font-family:Jost,Arial,sans-serif;}',
  '.nostra-wa-head{padding:23px 25px 19px;background:linear-gradient(120deg,#075861,#0C7D8C);',
  'color:#fff;display:flex;justify-content:space-between;gap:14px;align-items:flex-start;}',
  '.nostra-wa-head h2{margin:0!important;color:#fff!important;font-size:28px!important;line-height:1.12!important;}',
  '.nostra-wa-head p{font-size:14px;margin:8px 0 0;opacity:.92;}',
  '.nostra-wa-close{border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);',
  'color:white;border-radius:10px;cursor:pointer;padding:8px 12px;font:inherit;font-weight:700;}',
  '.nostra-wa-main{padding:21px 25px 25px;}',
  '.nostra-wa-context{font-size:13px;background:#edf7f8;color:#075861;border-radius:12px;',
  'padding:12px 14px;margin-bottom:17px;line-height:1.5;}',
  '.nostra-wa-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}',
  '.nostra-wa-field{display:block;color:#163c44;font-size:13px;font-weight:800;}',
  '.nostra-wa-field input{display:block;width:100%;font:inherit;color:#172033;border:1px solid #bcd7dc;',
  'margin-top:7px;padding:11px;border-radius:11px;outline-color:#0C7D8C;}',
  '.nostra-wa-hint{display:block;margin-top:5px;font-size:12px;font-weight:450;color:#566e75;}',
  '.nostra-wa-pw-wrap{display:flex;align-items:stretch;gap:7px;margin-top:7px;}',
  '.nostra-wa-pw-wrap input{margin:0;min-width:0;flex:1;}',
  '.nostra-wa-toggle{border:1px solid #bcd7dc;border-radius:10px;background:#f4fafb;color:#075861;',
  'cursor:pointer;padding:0 10px;font:inherit;font-size:12px;font-weight:700;}',
  '.nostra-wa-confirm{display:flex;gap:10px;align-items:flex-start;margin:18px 0;',
  'font-size:13px;line-height:1.5;color:#24464d;}',
  '.nostra-wa-confirm input{width:18px;height:18px;accent-color:#0C7D8C;flex:none;margin-top:1px;}',
  '.nostra-wa-preview-title{font-size:13px;font-weight:800;margin-bottom:7px;color:#075861;}',
  '.nostra-wa-preview{font:14px/1.6 Segoe UI,Arial,sans-serif;resize:vertical;display:block;width:100%;',
  'min-height:190px;max-height:300px;border:1px solid #bcd7dc;border-radius:12px;padding:13px;',
  'white-space:pre-wrap;background:#fbfeff;color:#183b43;}',
  '.nostra-wa-actions{display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;}',
  '.nostra-wa-actions button{flex:1 1 210px;font-family:inherit;border:0;border-radius:12px;',
  'padding:12px 14px;cursor:pointer;font-weight:850;font-size:14px;}',
  '.nostra-wa-copy{background:#0C7D8C;color:white;}',
  '.nostra-wa-open{background:#25D366;color:#073b23;}',
  '.nostra-wa-actions button:disabled{opacity:.45;cursor:not-allowed;}',
  '.nostra-wa-status{font-size:13px;line-height:1.5;margin-top:10px;min-height:21px;color:#075861;}',
  '.nostra-wa-note{font-size:12px;line-height:1.6;color:#526d74;margin-top:14px;}',
  '@media(max-width:640px){.nostra-wa-grid{grid-template-columns:1fr;}',
  '.nostra-wa-main{padding:16px;}.nostra-wa-head{padding:18px;}',
  '.nostra-wa-actions button{flex-basis:100%;}}'
].join('');

function ensureStyles() {
  if (document.getElementById('nostra-wa-welcome-style')) return;
  const style = document.createElement('style');
  style.id = 'nostra-wa-welcome-style';
  style.textContent = STYLE;
  document.head.appendChild(style);
}

export function openWhatsAppWelcome(record) {
  if (!welcomeApproved(record)) {
    window.alert('La matrícula y el pago deben estar aprobados antes de preparar la bienvenida.');
    return;
  }
  const phone = normalizeStudentPhone(record.celular);
  if (!phone) {
    window.alert('El celular registrado no tiene un formato peruano válido. Corrige la ficha antes de enviar.');
    return;
  }
  ensureStyles();
  document.getElementById('nostra-wa-welcome')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'nostra-wa-shade';
  overlay.id = 'nostra-wa-welcome';
  overlay.setAttribute('role', 'presentation');
  overlay.innerHTML = [
    '<section class="nostra-wa-card" role="dialog" aria-modal="true" aria-labelledby="nostra-wa-title">',
    '<div class="nostra-wa-head"><div><h2 id="nostra-wa-title">Bienvenida por WhatsApp</h2>',
    '<p>Grupo Nostradamus · Preparar, revisar y enviar manualmente</p></div>',
    '<button type="button" class="nostra-wa-close" data-wa-close aria-label="Cerrar">Cerrar ×</button></div>',
    '<div class="nostra-wa-main"><div class="nostra-wa-context" data-wa-context></div>',
    '<div class="nostra-wa-grid">',
    '<label class="nostra-wa-field">Correo institucional',
    '<input data-wa-email type="email" spellcheck="false" autocomplete="off" ',
    'placeholder="nombre.apellido@gruponostradamus.edu.pe">',
    '<span class="nostra-wa-hint">Revisa el correo real de Microsoft 365. El sugerido puede diferir.</span></label>',
    '<label class="nostra-wa-field">Contraseña institucional (editable)',
    '<div class="nostra-wa-pw-wrap">',
    '<input data-wa-password type="password" autocomplete="off" spellcheck="false" ',
    'placeholder="Escribe la contraseña real del alumno">',
    '<button type="button" class="nostra-wa-toggle" data-wa-toggle>Mostrar</button></div>',
    '<span class="nostra-wa-hint">Se utiliza solo para este mensaje. No se guarda en el panel.</span></label>',
    '</div><label class="nostra-wa-confirm">',
    '<input data-wa-confirm type="checkbox"><span>Verifiqué el correo, la contraseña y el destinatario.',
    ' El alumno autorizó recibir comunicaciones por WhatsApp.</span></label>',
    '<div class="nostra-wa-preview-title">Vista previa del mensaje (formato WhatsApp)</div>',
    '<textarea class="nostra-wa-preview" data-wa-preview readonly aria-label="Vista previa"></textarea>',
    '<div class="nostra-wa-actions">',
    '<button type="button" class="nostra-wa-copy" data-wa-copy disabled>1. Copiar bienvenida</button>',
    '<button type="button" class="nostra-wa-open" data-wa-open disabled>2. Abrir chat de WhatsApp</button>',
    '</div><div class="nostra-wa-status" data-wa-status aria-live="polite"></div>',
    '<div class="nostra-wa-note"><b>Envío manual:</b> copia el texto, abre el chat, pega',
    ' el mensaje (Ctrl+V) y pulsa Enviar. No se incluyen contraseñas en enlaces web ni Firebase.',
    ' Comprueba el destinatario antes de enviarlo. El texto copiado queda en el portapapeles.</div>',
    '</div></section>'
  ].join('');
  document.body.appendChild(overlay);

  const $ = selector => overlay.querySelector(selector);
  const email = $('[data-wa-email]');
  const password = $('[data-wa-password]');
  const confirm = $('[data-wa-confirm]');
  const preview = $('[data-wa-preview]');
  const copy = $('[data-wa-copy]');
  const open = $('[data-wa-open]');
  const status = $('[data-wa-status]');
  email.value = suggestInstitutionalEmail(record);
  $('[data-wa-context]').textContent =
    'Alumno: ' + String(record.nombre || '-') + ' · WhatsApp registrado: +' + phone;
  let lastCopied = null;
  const previousFocused = document.activeElement;

  function update() {
    lastCopied = null;
    open.disabled = true;
    const valid = validInstitutionalEmail(email.value) &&
      password.value.length >= 8 && !/[\r\n]/.test(password.value);
    try {
      preview.value = buildWelcomeWhatsApp(record, email.value,
        valid ? password.value : '[CONTRASEÑA PENDIENTE]');
    } catch (_err) {
      preview.value = 'Completa un correo institucional y una contraseña válida.';
    }
    copy.disabled = !valid || !confirm.checked;
    status.textContent = valid
      ? (confirm.checked ? 'Revisa la vista previa y copia el mensaje.' :
        'Confirma los datos del alumno antes de copiar.')
      : 'Completa el correo institucional y la contraseña (mínimo 8 caracteres).';
  }

  function close() {
    password.value = '';
    preview.value = '';
    lastCopied = null;
    overlay.remove();
    if (previousFocused?.isConnected) previousFocused.focus();
  }

  email.addEventListener('input', update);
  password.addEventListener('input', update);
  confirm.addEventListener('change', update);
  $('[data-wa-toggle]').addEventListener('click', event => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    event.currentTarget.textContent = show ? 'Ocultar' : 'Mostrar';
  });
  $('[data-wa-close]').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
  });
  copy.addEventListener('click', async () => {
    if (copy.disabled) return;
    const body = buildWelcomeWhatsApp(record, email.value, password.value);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('CLIPBOARD_NOT_AVAILABLE');
      await navigator.clipboard.writeText(body);
      lastCopied = body;
      open.disabled = false;
      status.textContent = 'Mensaje copiado. Abre WhatsApp, pega (Ctrl+V) y envía.';
    } catch (_err) {
      lastCopied = null;
      open.disabled = true;
      preview.value = body;
      preview.focus();
      preview.select();
      status.textContent = 'Copia bloqueada. La vista previa está seleccionada: usa Ctrl+C y abre el chat manualmente.';
    }
  });
  open.addEventListener('click', () => {
    if (!lastCopied || lastCopied !== buildWelcomeWhatsApp(record, email.value, password.value)) {
      open.disabled = true;
      status.textContent = 'Copia primero la versión actual del mensaje.';
      return;
    }
    // Nunca pasar texto ni credenciales como query string.
    const url = 'https://wa.me/' + phone;
    window.open(url, '_blank', 'noopener,noreferrer');
    status.textContent = 'WhatsApp abierto. Pega (Ctrl+V) y pulsa Enviar; el panel no envía automáticamente.';
  });

  update();
  email.focus();
}
