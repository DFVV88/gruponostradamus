/* Grupo Nostradamus - indice unico de DNI para preinscripciones existentes */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, getDocs, query, limit, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const PRE_COLLECTION = 'preinscripciones';
const REGISTRY_COLLECTION = 'alumnos_registro_dni';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const clean = value => String(value == null ? '' : value).trim();
const dniDigits = value => clean(value).replace(/\D/g,'').slice(0,12);

async function sha256(value){
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2,'0')).join('');
}

function score(record){
  let value = 0;
  if(record?.matriculaAprobada === true || record?.estado === 'matriculado') value += 100;
  if(record?.pagoValidado === true || record?.estadoPago === 'pago_validado') value += 50;
  if(record?.origen === 'registro_manual_admin') value += 10;
  return value;
}

async function syncRegistry(user){
  try{
    const snapshot = await getDocs(query(collection(db,PRE_COLLECTION),limit(1000)));
    const canonical = new Map();
    for(const item of snapshot.docs){
      const record = {id:item.id,...item.data()};
      const dni = dniDigits(record.dni);
      if(dni.length < 8) continue;
      const hash = await sha256(dni);
      const previous = canonical.get(hash);
      if(!previous || score(record) > score(previous)) canonical.set(hash,record);
    }

    let created = 0;
    for(const [hash,record] of canonical){
      const registryRef = doc(db,REGISTRY_COLLECTION,hash);
      const existing = await getDoc(registryRef);
      if(existing.exists()) continue;
      await setDoc(registryRef,{
        dniHash:hash,
        registroId:record.id,
        tipo:record.origen === 'registro_manual_admin' ? 'registro_manual_admin' : 'preinscripcion_web',
        activo:true,
        creadoPor:clean(user.email || ADMIN_EMAIL),
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      created += 1;
    }
    if(created) console.info(`[DNI único] ${created} DNI existentes incorporados al índice anti-duplicados.`);
  }catch(error){
    console.warn('[DNI único] El índice aún no pudo sincronizarse. Verifica que las reglas Firestore actualizadas estén publicadas.',error);
  }
}

onAuthStateChanged(auth,user => {
  if(user && clean(user.email).toLowerCase() === ADMIN_EMAIL) syncRegistry(user);
});
