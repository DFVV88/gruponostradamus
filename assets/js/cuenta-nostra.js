/* NostraCUENTA - Microsoft 365 + usuario corto */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, OAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain: 'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId: 'nostrachat-grupo-nostradamus',
  storageBucket: 'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId: '869749182265',
  appId: '1:869749182265:web:5f5c9174680585f142e2e8'
};

const DOMAIN = '@gruponostradamus.edu.pe';
const INTERNAL_DOMAIN = '@nostrachat.gruponostradamus.edu.pe';
const TENANT_ID = window.NOSTRA_MICROSOFT_TENANT_ID || '23b6326f-b776-4ffd-8b1d-cd9d10e38d84';
const RESERVED = ['admin','administrador','docente','alumno','nostradamus','damus','soporte','root','moderador'];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let verified = { email:'', name:'' };
let activationInProgress = false;

const $ = id => document.getElementById(id);
const authBox = $('auth-box');
const studentPanel = $('student-panel');
const activateForm = $('activate-form');
const loginForm = $('login-form');
const activateMsg = $('activate-msg');
const loginMsg = $('login-msg');
const studentName = $('student-name');
const logoutBtn = $('logout-btn');

function clean(v){ return String(v || '').replace(/\s+/g,' ').trim(); }
function lower(v){ return clean(v).toLowerCase(); }
function html(v){ return String(v || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function internalEmail(username){ return lower(username) + INTERNAL_DOMAIN; }
function validUsername(u){ return /^[a-z0-9._]{5,20}$/.test(u) && !RESERVED.includes(u); }
function validPass(p){ return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p || ''); }
function validInstitutionalEmail(e){ return lower(e).endsWith(DOMAIN); }
function msg(el,type,text){ if(el){ el.className = 'msg ' + type; el.innerHTML = text; } }
function value(form,name){ return clean(form.elements[name] && form.elements[name].value); }

function applyCuentaNav(){
  const menu = document.querySelector('header.nav .menu');
  if(!menu) return;
  menu.innerHTML = `
    <a href="index.html">Inicio</a>
    <a href="ciclos.html">Ciclos</a>
    <a href="cachimbos.html">Cachimbos</a>
    <a href="blog.html">Noticias</a>
    <a href="clases-en-vivo.html">Clases en vivo</a>`;
}

function injectCuentaStyles(){
  if(document.getElementById('cuenta-nostra-dynamic-style')) return;
  const style = document.createElement('style');
  style.id = 'cuenta-nostra-dynamic-style';
  style.textContent = `
    .login-benefits-preview{display:none;margin-top:22px;border-top:1px solid rgba(7,140,149,.16);padding-top:22px;}
    .login-benefits-preview.show{display:block;}
    .login-benefits-preview h3{font-family:'Baloo 2';font-size:32px;line-height:1;color:#061426;margin:0 0 8px;}
    .login-benefits-preview .preview-lead{margin:0 0 16px;color:#4b5d70;font-size:16px;line-height:1.55;}
    .login-benefits-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
    .login-benefit-card{border:1px solid rgba(7,140,149,.16);background:linear-gradient(180deg,#fff,#f8fdff);border-radius:20px;padding:16px;box-shadow:0 10px 26px rgba(6,20,38,.05);}
    .login-benefit-card strong{display:block;color:#061426;font-size:18px;margin-bottom:6px;}
    .login-benefit-card p{margin:0;color:#5f6b7a;line-height:1.45;font-size:14px;}
    .login-benefit-card.active-benefit{border-color:rgba(11,99,255,.22);}
    @media(max-width:900px){.login-benefits-grid{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);
}

function ensureLoginBenefitsPreview(){
  if(!loginForm || $('login-benefits-preview')) return;
  const preview = document.createElement('section');
  preview.id = 'login-benefits-preview';
  preview.className = 'login-benefits-preview';
  preview.innerHTML = `
    <h3>Mis beneficios</h3>
    <p class="preview-lead">Al ingresar con tu NostraCUENTA activa verás tus accesos académicos en un solo panel.</p>
    <div class="login-benefits-grid">
      <article class="login-benefit-card active-benefit"><strong>💬 NostraCHAT</strong><p>Comunidad académica y acompañamiento.</p></article>
      <article class="login-benefit-card active-benefit"><strong>🔴 Clases en vivo</strong><p>Acceso a sesiones virtuales según ciclo.</p></article>
      <article class="login-benefit-card"><strong>📢 Comunicados</strong><p>Avisos oficiales y novedades institucionales.</p></article>
      <article class="login-benefit-card"><strong>📚 Materiales</strong><p>Recursos académicos por ciclo.</p></article>
      <article class="login-benefit-card"><strong>💳 Mis pagos</strong><p>Cuotas, deudas y pagos próximamente.</p></article>
      <article class="login-benefit-card"><strong>🛟 Soporte</strong><p>Ayuda por WhatsApp y coordinación.</p></article>
    </div>`;
  loginForm.insertAdjacentElement('afterend', preview);
}

function updateHeroForTab(tab){
  const title = document.querySelector('.hero h1');
  const lead = document.querySelector('.hero .lead');
  const cardTitle = document.querySelector('.hero .card h2');
  const cardText = document.querySelector('.hero .card p');
  const cardNote = document.querySelector('.hero .card .note');
  const preview = $('login-benefits-preview');

  if(tab === 'ingresar'){
    if(title) title.textContent = 'Ingresa a tus beneficios';
    if(lead) lead.textContent = 'Accede con tu usuario corto y contraseña para entrar a NostraCHAT, clases en vivo, comunicados y demás beneficios académicos.';
    if(cardTitle) cardTitle.textContent = 'Tus accesos';
    if(cardText) cardText.textContent = 'Esta sección es para alumnos con NostraCUENTA activa por Coordinación.';
    if(cardNote) cardNote.textContent = 'Si tu cuenta aún está pendiente, primero solicita la activación administrativa.';
    if(preview) preview.classList.add('show');
  }else{
    if(title) title.textContent = 'Activa tu Cuenta Nostra';
    if(lead) lead.textContent = 'Usa el correo institucional que te envió Coordinación para crear tu usuario corto. Luego podrás ingresar a tus beneficios académicos desde este panel.';
    if(cardTitle) cardTitle.textContent = 'Importante';
    if(cardText) cardText.textContent = 'Este acceso es solo para alumnos con matrícula aprobada y correo institucional asignado.';
    if(cardNote) cardNote.textContent = 'NostraCHAT será uno de tus beneficios, no la puerta principal de registro.';
    if(preview) preview.classList.remove('show');
  }
}

function patchUI(){
  applyCuentaNav();
  injectCuentaStyles();
  ensureLoginBenefitsPreview();

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
      activateForm.classList.toggle('hidden', tab !== 'activar');
      loginForm.classList.toggle('hidden', tab !== 'ingresar');
      updateHeroForTab(tab);
    });
  });

  if(loginForm){
    const loginInput = loginForm.elements.email;
    if(loginInput){
      loginInput.type = 'text';
      loginInput.placeholder = 'Ej. juanperez';
      loginInput.setAttribute('autocomplete','username');
      loginInput.removeAttribute('inputmode');
      const label = loginInput.closest('label');
      const span = label && label.querySelector('span');
      if(span) span.textContent = 'Usuario corto *';
    }
    const passInput = loginForm.elements.password;
    if(passInput){
      const label = passInput.closest('label');
      const span = label && label.querySelector('span');
      if(span) span.textContent = 'Contraseña NostraCUENTA *';
    }
    const submit = loginForm.querySelector('button[type="submit"]');
    if(submit) submit.textContent = 'Ingresar a NostraCUENTA';
  }

  if(activateForm && !$('ms-verify-btn')){
    const email = activateForm.elements.institutionalEmail;
    if(email){ email.readOnly = true; email.placeholder = 'Primero valida con Microsoft 365'; }
    const pass = activateForm.elements.password;
    if(pass){ pass.placeholder = 'Contraseña para NostraCUENTA, no clave Microsoft'; }

    const username = activateForm.elements.username;
    if(username){
      username.setAttribute('autocomplete','username');
      username.addEventListener('input', () => {
        const fixed = lower(username.value);
        if(username.value !== fixed) username.value = fixed;
      });
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ms-verify-btn';
    btn.className = 'btn btn-light';
    btn.style.width = '100%';
    btn.style.marginBottom = '18px';
    btn.textContent = '✅ Paso 1: Validar con Microsoft 365';
    activateForm.insertBefore(btn, activateForm.firstElementChild);
    btn.addEventListener('click', verifyMicrosoft);
    msg(activateMsg,'info','Primero valida tu correo institucional con Microsoft 365. No escribas tu clave institucional en esta página.');
  }

  const activeTab = document.querySelector('[data-tab].active');
  updateHeroForTab(activeTab ? activeTab.getAttribute('data-tab') : 'activar');
}

function authError(err){
  const code = err && err.code ? err.code : '';
  if(code === 'auth/unauthorized-domain') return 'Dominio no autorizado en Firebase Authentication.';
  if(code === 'auth/operation-not-allowed') return 'El proveedor Microsoft no está habilitado en Firebase Authentication.';
  if(code === 'auth/popup-closed-by-user') return 'Cerraste la ventana de Microsoft antes de terminar.';
  if(code === 'auth/email-already-in-use') return 'Ese usuario corto ya fue registrado. Ingresa con tu usuario y contraseña.';
  if(code === 'permission-denied' || code === 'firestore/permission-denied') return 'La cuenta se creó en Authentication, pero Firestore rechazó guardar el perfil. Revisa reglas/campos permitidos.';
  return 'No se pudo completar. Código: ' + html(code || err.message || 'sin código');
}

async function verifyMicrosoft(){
  try{
    msg(activateMsg,'info','Abriendo Microsoft 365...');
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ tenant: TENANT_ID, prompt:'select_account' });
    const result = await signInWithPopup(auth, provider);
    const email = lower(result.user.email || '');
    const name = clean(result.user.displayName || '');
    if(!validInstitutionalEmail(email)){
      await signOut(auth);
      verified = { email:'', name:'' };
      return msg(activateMsg,'err','Ese correo no pertenece al dominio institucional ' + DOMAIN + '. Usa el correo que Coordinación te envió.');
    }

    verified = { email, name };
    activateForm.elements.institutionalEmail.value = email;
    if(activateForm.elements.name && !activateForm.elements.name.value) activateForm.elements.name.value = name;

    await signOut(auth);

    msg(activateMsg,'ok','Correo institucional verificado: <b>' + html(email) + '</b>. Ahora crea tu usuario corto.');
  }catch(err){
    console.error(err);
    msg(activateMsg,'err',authError(err));
  }
}

async function activate(e){
  e.preventDefault();

  if(activationInProgress) return;
  activationInProgress = true;

  const submitBtn = activateForm.querySelector('button[type="submit"]');
  if(submitBtn) submitBtn.disabled = true;

  const username = lower(value(activateForm,'username'));
  const name = clean(value(activateForm,'name'));
  const pass = activateForm.elements.password && activateForm.elements.password.value;

  if(activateForm.elements.username) activateForm.elements.username.value = username;

  try{
    if(!verified.email) throw new Error('Primero valida tu correo con Microsoft 365.');
    if(!validUsername(username)) throw new Error('Usuario corto inválido. Usa 5 a 20 caracteres: letras minúsculas, números, punto o guion bajo.');
    if(name.length < 5) throw new Error('Escribe nombres y apellidos completos.');
    if(!validPass(pass)) throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.');

    msg(activateMsg,'info','Verificando usuario corto...');
    const unameRef = doc(db,'usernames',username);
    if((await getDoc(unameRef)).exists()) throw new Error('Ese usuario corto ya existe. Elige otro.');

    msg(activateMsg,'info','Creando acceso interno...');
    const authEmail = internalEmail(username);
    const cred = await createUserWithEmailAndPassword(auth, authEmail, pass);

    msg(activateMsg,'info','Guardando perfil de NostraCUENTA...');
    const profile = {
      uid: cred.user.uid,
      username: username,
      usernameLower: username,
      authEmail: authEmail,
      institutionalEmail: verified.email,
      microsoftVerified: true,
      name: name,
      role: 'student',
      roleLabel: 'Alumno',
      detail: 'NostraCUENTA',
      status: 'pending',
      blocked: false,
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db,'users',cred.user.uid), profile);

    msg(activateMsg,'info','Reservando usuario corto...');
    await setDoc(unameRef, {
      uid: cred.user.uid,
      institutionalEmail: verified.email,
      createdAt: serverTimestamp()
    });

    msg(activateMsg,'ok','✅ NostraCUENTA creada correctamente. Coordinación debe activar tu acceso para usar todos los beneficios.');

    if(loginForm && loginForm.elements.email) loginForm.elements.email.value = username;
    activateForm.reset();
    verified = { email:'', name:'' };

    setTimeout(() => {
      const loginTab = document.querySelector('[data-tab="ingresar"]');
      if(loginTab) loginTab.click();
      msg(loginMsg,'info','Tu cuenta ya fue creada. Ingresa cuando Coordinación active tu acceso.');
    }, 1200);
  }catch(err){
    console.error('Error creando NostraCUENTA:', err);
    msg(activateMsg,'err','❌ ' + authError(err));
  }finally{
    activationInProgress = false;
    if(submitBtn) submitBtn.disabled = false;
  }
}

async function login(e){
  e.preventDefault();
  const emailOrUser = lower(value(loginForm,'email'));
  const pass = loginForm.elements.password && loginForm.elements.password.value;
  const username = emailOrUser.includes('@') ? emailOrUser.split('@')[0] : emailOrUser;
  if(!validUsername(username)) return msg(loginMsg,'err','Ingresa tu usuario corto válido.');
  if(!pass) return msg(loginMsg,'err','Ingresa tu contraseña.');
  try{
    msg(loginMsg,'info','Validando acceso...');
    const cred = await signInWithEmailAndPassword(auth, internalEmail(username), pass);
    const snap = await getDoc(doc(db,'users',cred.user.uid));
    if(!snap.exists()) throw new Error('NO_PROFILE');
    const p = snap.data();
    if(p.blocked || p.status === 'blocked') return msg(loginMsg,'err','Tu cuenta está bloqueada. Comunícate con Coordinación.');
    if(p.status !== 'active') return msg(loginMsg,'err','Tu NostraCUENTA existe, pero aún está pendiente de activación administrativa.');
    showStudent(p);
  }catch(err){
    console.error(err);
    msg(loginMsg,'err','Usuario o contraseña incorrectos, o acceso aún no activado.');
  }
}

function showStudent(profile){
  authBox.classList.add('hidden');
  studentPanel.classList.remove('hidden');
  if(studentName) studentName.textContent = (profile.name || profile.username) + ' · ' + profile.institutionalEmail;
}

activateForm && activateForm.addEventListener('submit', activate);
loginForm && loginForm.addEventListener('submit', login);
logoutBtn && logoutBtn.addEventListener('click', () => signOut(auth).then(() => location.reload()));
patchUI();

onAuthStateChanged(auth, async user => {
  if(!user || activationInProgress) return;
  try{
    const snap = await getDoc(doc(db,'users',user.uid));
    if(snap.exists() && snap.data().status === 'active') showStudent(snap.data());
  }catch(e){}
});
