/* ==================================================
   NostraCHAT - Acceso institucional v2
   Microsoft 365 verifica el correo institucional.
   Luego el usuario crea username corto + contraseña.
================================================== */
(function(){
  var firebaseConfig = window.NOSTRACHAT_FIREBASE_CONFIG;
  var DOMAIN = '@gruponostradamus.edu.pe';
  var INTERNAL_DOMAIN = '@nostrachat.gruponostradamus.edu.pe';
  var TENANT_ID = window.NOSTRA_MICROSOFT_TENANT_ID || '23b6326f-b776-4ffd-8b1d-cd9d10e38d84';
  var reserved = ['admin','administrador','docente','alumno','nostradamus','damus','soporte','root','moderador'];
  var app, db, auth, fs, authMod;
  var verified = { email:'', name:'' };
  var activeProfile = null;

  function clean(v){ return String(v || '').replace(/\s+/g,' ').trim(); }
  function lower(v){ return clean(v).toLowerCase(); }
  function html(v){ return String(v || '').replace(/[&<>'"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]; }); }
  function internalEmail(username){ return lower(username) + INTERNAL_DOMAIN; }
  function validUsername(username){ return /^[a-z0-9._]{5,20}$/.test(username) && reserved.indexOf(username) === -1; }
  function validPass(pass){ return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass || ''); }
  function validInstitutionalEmail(email){ return lower(email).endsWith(DOMAIN); }
  function alumnoZone(){ var b = document.querySelector('.nchat-zone.active'); return !b || b.getAttribute('data-zone') === 'alumnos'; }

  function msg(type, text){
    var box = document.getElementById('nchat-auth-message');
    if(!box) return;
    box.className = 'nchat-auth-message ' + (type || 'info');
    box.innerHTML = text;
  }

  function errorText(err){
    var code = err && err.code ? err.code : '';
    var m = err && err.message ? err.message : '';
    if(code === 'auth/unauthorized-domain') return 'Dominio no autorizado en Firebase Authentication. Revisa Authentication → Configuración → Dominios autorizados.';
    if(code === 'auth/operation-not-allowed') return 'El proveedor Microsoft no está habilitado en Firebase Authentication.';
    if(code === 'auth/popup-closed-by-user') return 'Cerraste la ventana de Microsoft antes de terminar.';
    if(code === 'auth/cancelled-popup-request') return 'Se canceló una ventana anterior de Microsoft. Intenta nuevamente.';
    if(code === 'auth/account-exists-with-different-credential') return 'Ese correo ya existe con otro método de acceso. Prueba con otra ventana o revisa usuarios de Firebase Authentication.';
    return 'No se pudo verificar con Microsoft. Código: ' + html(code || 'sin código') + '<br><small>' + html(m).slice(0,220) + '</small>';
  }

  function injectStyles(){
    if(document.getElementById('nchat-auth-users-style')) return;
    var st = document.createElement('style');
    st.id = 'nchat-auth-users-style';
    st.textContent = '.nchat-auth-card{border:1px solid rgba(7,140,149,.16);background:linear-gradient(180deg,#fff,#f7fdff);border-radius:20px;padding:16px;margin:16px 0;box-shadow:0 12px 32px rgba(6,20,38,.06)}.nchat-auth-card h4{margin:0 0 6px;color:#061426;font-size:20px;font-weight:950}.nchat-auth-card p{margin:0 0 12px;color:#5f6b7a;line-height:1.45;font-size:14px}.nchat-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}.nchat-auth-tab{border:1px solid rgba(7,140,149,.18);border-radius:999px;background:#fff;color:#061426;font-weight:950;padding:10px;cursor:pointer}.nchat-auth-tab.active{background:linear-gradient(135deg,#078c95,#061426);color:#fff;border-color:transparent}.nchat-auth-view{display:none}.nchat-auth-view.show{display:block}.nchat-auth-field{display:block;margin:10px 0}.nchat-auth-field span{display:block;font-weight:900;color:#061426;margin-bottom:5px;font-size:13px}.nchat-auth-field input,.nchat-auth-field select{width:100%;border:1px solid rgba(7,140,149,.22);border-radius:13px;padding:11px 12px;font:inherit;outline:none;background:#fff}.nchat-auth-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nchat-auth-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;border:0;border-radius:999px;padding:12px 14px;background:linear-gradient(135deg,#ff941e,#078c95,#061426);color:#fff;font-weight:950;cursor:pointer;text-transform:uppercase;margin-top:8px}.nchat-auth-btn.secondary{background:#fff;color:#061426;border:1px solid rgba(7,140,149,.20);text-transform:none}.nchat-auth-btn:disabled{opacity:.58;cursor:not-allowed}.nchat-auth-message{display:none;margin-top:10px;border-radius:14px;padding:10px 11px;font-size:13px;font-weight:850;line-height:1.4}.nchat-auth-message.info{display:block;background:#eef8fa;color:#075b65;border:1px solid rgba(7,140,149,.20)}.nchat-auth-message.ok{display:block;background:#edfbea;color:#17672a;border:1px solid #c9f0c4}.nchat-auth-message.warn{display:block;background:#fff7e6;color:#925800;border:1px solid #ffe0ad}.nchat-auth-message.error{display:block;background:#fff2f2;color:#941b1b;border:1px solid #ffd3d3}.nchat-auth-profile{display:none;border:1px solid rgba(7,140,149,.16);background:#f7fdff;border-radius:16px;padding:12px;margin-top:10px}.nchat-auth-profile.show{display:block}.nchat-auth-profile strong{display:block;color:#061426}.nchat-auth-profile small{display:block;color:#5f6b7a;font-weight:800;margin-top:2px}.nchat-auth-link{border:0;background:transparent;color:#078c95;font-weight:950;text-decoration:underline;cursor:pointer;padding:0;margin-top:8px}@media(max-width:700px){.nchat-auth-row{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }

  function buildPanel(){
    if(document.getElementById('nchat-auth-panel')) return true;
    var form = document.getElementById('nchat-form');
    if(!form || !form.parentNode) return false;
    var panel = document.createElement('div');
    panel.id = 'nchat-auth-panel';
    panel.className = 'nchat-auth-card';
    panel.innerHTML = '<h4>🔐 Acceso alumnos y docentes</h4><p>Primero verifica tu correo Microsoft 365 institucional. Luego crea tu usuario corto y contraseña para ingresar a NostraCHAT.</p><div class="nchat-auth-tabs"><button type="button" class="nchat-auth-tab active" data-auth-tab="login">Ingresar</button><button type="button" class="nchat-auth-tab" data-auth-tab="register">Registrarme</button></div><div class="nchat-auth-view show" id="nchat-auth-login-view"><label class="nchat-auth-field"><span>Usuario corto</span><input id="nchat-login-username" maxlength="20" placeholder="Ej. juanperez" autocomplete="username"></label><label class="nchat-auth-field"><span>Contraseña</span><input id="nchat-login-password" type="password" placeholder="Tu contraseña" autocomplete="current-password"></label><button type="button" class="nchat-auth-btn" id="nchat-login-btn">Ingresar</button></div><div class="nchat-auth-view" id="nchat-auth-register-view"><button type="button" class="nchat-auth-btn secondary" id="nchat-ms-verify-btn">✅ Paso 1: verificar con Microsoft 365</button><div class="nchat-auth-profile" id="nchat-ms-profile"></div><div id="nchat-register-fields" style="display:none"><div class="nchat-auth-row"><label class="nchat-auth-field"><span>Usuario corto</span><input id="nchat-reg-username" maxlength="20" placeholder="Ej. juanperez"></label><label class="nchat-auth-field"><span>Rol</span><select id="nchat-reg-role"><option value="student">Alumno</option><option value="teacher">Docente</option></select></label></div><label class="nchat-auth-field"><span>Nombre completo</span><input id="nchat-reg-name" maxlength="80" placeholder="Nombre y apellido"></label><label class="nchat-auth-field"><span>Ciclo, código WTC o curso principal</span><input id="nchat-reg-detail" maxlength="80" placeholder="Ej. Semianual UNI / WTC-001 / Física"></label><div class="nchat-auth-row"><label class="nchat-auth-field"><span>Contraseña</span><input id="nchat-reg-password" type="password" autocomplete="new-password" placeholder="Mín. 8, mayúscula y número"></label><label class="nchat-auth-field"><span>Confirmar contraseña</span><input id="nchat-reg-password2" type="password" autocomplete="new-password" placeholder="Repite la contraseña"></label></div><button type="button" class="nchat-auth-btn" id="nchat-create-account-btn">Crear cuenta NostraCHAT</button></div></div><div class="nchat-auth-message" id="nchat-auth-message"></div><div class="nchat-auth-profile" id="nchat-active-profile"></div>';
    form.parentNode.insertBefore(panel, form);
    return true;
  }

  function setTab(tab){
    document.querySelectorAll('[data-auth-tab]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-auth-tab') === tab); });
    var login = document.getElementById('nchat-auth-login-view');
    var reg = document.getElementById('nchat-auth-register-view');
    if(login) login.classList.toggle('show', tab === 'login');
    if(reg) reg.classList.toggle('show', tab === 'register');
    msg('info', tab === 'login' ? 'Ingresa con tu usuario corto y contraseña.' : 'Verifica primero tu correo institucional Microsoft 365.');
  }

  function updateMode(){
    var form = document.getElementById('nchat-form');
    var panel = document.getElementById('nchat-auth-panel');
    if(!form || !panel) return;
    if(alumnoZone()){
      panel.style.display = 'block';
      form.style.display = 'none';
      if(!activeProfile){
        var ta = document.getElementById('nchat-message'), send = document.getElementById('nchat-send'), status = document.getElementById('nchat-status'), sub = document.getElementById('nchat-room-subtitle');
        if(ta) ta.disabled = true;
        if(send) send.disabled = true;
        if(status) status.textContent = 'Requiere login';
        if(sub) sub.textContent = 'Ingresa con usuario y contraseña para participar';
      }
    } else {
      panel.style.display = 'none';
      form.style.display = 'block';
    }
  }

  function unlockChat(profile){
    activeProfile = profile;
    window.NOSTRACHAT_AUTH_PROFILE = profile;
    var localUser = { name: profile.name || profile.username, extra: profile.roleLabel + ' · ' + profile.username + ' · ' + profile.institutionalEmail, zone:'alumnos', uid:profile.uid, role:profile.role, username:profile.username, institutionalEmail:profile.institutionalEmail };
    localStorage.setItem('nostrachat_user', JSON.stringify(localUser));
    var name = document.getElementById('nchat-name'), extra = document.getElementById('nchat-extra'), rules = document.getElementById('nchat-rules'), form = document.getElementById('nchat-form');
    if(name) name.value = localUser.name;
    if(extra) extra.value = localUser.extra;
    if(rules) rules.checked = true;
    if(form) form.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
    var box = document.getElementById('nchat-active-profile');
    if(box){
      box.classList.add('show');
      box.innerHTML = '<strong>✅ Sesión activa: '+html(localUser.name)+'</strong><small>Usuario: '+html(profile.username)+' · '+html(profile.roleLabel)+'</small><button type="button" class="nchat-auth-link" id="nchat-logout-btn">Cerrar sesión</button>';
      var out = document.getElementById('nchat-logout-btn');
      if(out) out.onclick = logout;
    }
    msg('ok','Acceso correcto. Ya puedes participar en las salas autorizadas.');
    updateMode();
  }

  function logout(){
    activeProfile = null;
    window.NOSTRACHAT_AUTH_PROFILE = null;
    localStorage.removeItem('nostrachat_user');
    if(authMod && auth) authMod.signOut(auth).finally(function(){ location.reload(); });
    else location.reload();
  }

  function verifyMicrosoft(){
    if(!authMod || !auth) return msg('error','Firebase Auth aún no está listo.');
    msg('info','Abriendo Microsoft 365...');
    var provider = new authMod.OAuthProvider('microsoft.com');
    provider.setCustomParameters({ tenant: TENANT_ID, prompt:'select_account' });
    authMod.signInWithPopup(auth, provider).then(function(result){
      var user = result.user || {};
      var email = lower(user.email || '');
      var name = clean(user.displayName || '');
      if(!validInstitutionalEmail(email)){
        verified = { email:'', name:'' };
        authMod.signOut(auth);
        return msg('error','Ese correo no pertenece al dominio institucional ' + DOMAIN + '. Usa tu cuenta Microsoft 365 del Grupo Nostradamus.');
      }
      verified = { email: email, name: name };
      var prof = document.getElementById('nchat-ms-profile');
      if(prof){ prof.classList.add('show'); prof.innerHTML = '<strong>Correo verificado</strong><small>'+html(email)+'</small>'; }
      var fields = document.getElementById('nchat-register-fields');
      if(fields) fields.style.display = 'block';
      var nameInput = document.getElementById('nchat-reg-name');
      if(nameInput && !nameInput.value) nameInput.value = name;
      msg('ok','Correo institucional verificado. Ahora crea tu usuario corto y contraseña.');
    }).catch(function(err){
      console.error('NostraCHAT Microsoft auth error:', err);
      msg('error', errorText(err));
    });
  }

  function createAccount(){
    var username = lower(document.getElementById('nchat-reg-username') && document.getElementById('nchat-reg-username').value);
    var role = clean(document.getElementById('nchat-reg-role') && document.getElementById('nchat-reg-role').value) || 'student';
    var name = clean(document.getElementById('nchat-reg-name') && document.getElementById('nchat-reg-name').value);
    var detail = clean(document.getElementById('nchat-reg-detail') && document.getElementById('nchat-reg-detail').value);
    var pass = document.getElementById('nchat-reg-password') && document.getElementById('nchat-reg-password').value;
    var pass2 = document.getElementById('nchat-reg-password2') && document.getElementById('nchat-reg-password2').value;
    if(!verified.email) return msg('warn','Primero verifica tu correo Microsoft 365 institucional.');
    if(!validUsername(username)) return msg('error','El usuario debe tener 5 a 20 caracteres: letras, números, punto o guion bajo. No uses palabras reservadas.');
    if(name.length < 5) return msg('error','Escribe tu nombre completo.');
    if(detail.length < 3) return msg('error','Escribe tu ciclo, código WTC o curso principal.');
    if(!validPass(pass)) return msg('error','La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.');
    if(pass !== pass2) return msg('error','Las contraseñas no coinciden.');
    msg('info','Creando cuenta...');
    var unameRef = fs.doc(db, 'usernames/' + username);
    fs.getDoc(unameRef).then(function(snap){
      if(snap.exists()) throw new Error('USERNAME_EXISTS');
      return authMod.createUserWithEmailAndPassword(auth, internalEmail(username), pass);
    }).then(function(cred){
      var uid = cred.user.uid;
      var profile = { uid:uid, username:username, usernameLower:username, authEmail:internalEmail(username), institutionalEmail:verified.email, microsoftVerified:true, name:name, role:role, roleLabel:role === 'teacher' ? 'Docente' : 'Alumno', detail:detail, status:'pending', blocked:false, createdAt:fs.serverTimestamp() };
      return fs.setDoc(fs.doc(db, 'users/' + uid), profile).then(function(){ return fs.setDoc(unameRef, { uid:uid, institutionalEmail:verified.email, createdAt:fs.serverTimestamp() }); });
    }).then(function(){
      msg('ok','Cuenta creada correctamente. Queda pendiente de aprobación administrativa antes de ingresar al chat.');
      setTab('login');
    }).catch(function(err){
      console.error('NostraCHAT create account error:', err);
      if(String(err.message) === 'USERNAME_EXISTS') return msg('error','Ese usuario ya existe. Elige otro.');
      if(err.code === 'auth/email-already-in-use') return msg('error','Ese usuario ya fue registrado. Prueba iniciar sesión.');
      msg('error','No se pudo crear la cuenta. Código: '+html(err.code || err.message || 'sin código'));
    });
  }

  function login(){
    var username = lower(document.getElementById('nchat-login-username') && document.getElementById('nchat-login-username').value);
    var pass = document.getElementById('nchat-login-password') && document.getElementById('nchat-login-password').value;
    if(!validUsername(username)) return msg('error','Escribe un usuario válido.');
    if(!pass) return msg('error','Escribe tu contraseña.');
    msg('info','Validando acceso...');
    authMod.signInWithEmailAndPassword(auth, internalEmail(username), pass).then(function(cred){
      return fs.getDoc(fs.doc(db, 'users/' + cred.user.uid));
    }).then(function(snap){
      if(!snap.exists()) throw new Error('NO_PROFILE');
      var p = snap.data();
      if(p.blocked || p.status === 'blocked') throw new Error('BLOCKED');
      if(p.status !== 'active') throw new Error('PENDING');
      p.uid = p.uid || snap.id;
      p.roleLabel = p.role === 'teacher' ? 'Docente' : 'Alumno';
      unlockChat(p);
    }).catch(function(err){
      console.error('NostraCHAT login error:', err);
      if(String(err.message) === 'PENDING') return msg('warn','Tu cuenta existe, pero aún está pendiente de aprobación administrativa.');
      if(String(err.message) === 'BLOCKED') return msg('error','Tu cuenta está bloqueada. Comunícate con Coordinación Académica.');
      msg('error','Usuario o contraseña incorrectos, o perfil no encontrado.');
    });
  }

  function bindEvents(){
    document.querySelectorAll('[data-auth-tab]').forEach(function(btn){ btn.addEventListener('click', function(){ setTab(btn.getAttribute('data-auth-tab')); }); });
    var ms = document.getElementById('nchat-ms-verify-btn'), create = document.getElementById('nchat-create-account-btn'), loginBtn = document.getElementById('nchat-login-btn');
    if(ms) ms.addEventListener('click', verifyMicrosoft);
    if(create) create.addEventListener('click', createAccount);
    if(loginBtn) loginBtn.addEventListener('click', login);
    document.addEventListener('click', function(e){ if(e.target && e.target.closest && e.target.closest('.nchat-zone')) setTimeout(updateMode, 80); }, true);
  }

  function clearLegacy(){
    try{
      var saved = JSON.parse(localStorage.getItem('nostrachat_user') || 'null');
      if(saved && saved.zone === 'alumnos' && !saved.uid && !sessionStorage.getItem('nchat_legacy_cleared')){
        localStorage.removeItem('nostrachat_user');
        sessionStorage.setItem('nchat_legacy_cleared','1');
        location.reload();
      }
    }catch(e){}
  }

  function initFirebase(){
    return Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js')
    ]).then(function(mods){
      var appMod = mods[0]; fs = mods[1]; authMod = mods[2];
      app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      db = fs.getFirestore(app);
      auth = authMod.getAuth(app);
    });
  }

  function run(){
    if(!firebaseConfig) return;
    clearLegacy();
    injectStyles();
    var tries = 0;
    var timer = setInterval(function(){
      tries++;
      if(buildPanel()){
        clearInterval(timer);
        initFirebase().then(function(){ bindEvents(); setTab('login'); updateMode(); }).catch(function(err){ console.error(err); msg('error','No se pudo cargar Firebase Auth.'); });
      }
      if(tries > 60) clearInterval(timer);
    }, 250);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
