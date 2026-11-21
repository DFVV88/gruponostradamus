import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,collection,getDoc,getDocs,setDoc,Timestamp,serverTimestamp} from 'firebase/firestore';

const env=await initializeTestEnvironment({
  projectId:'demo-nostraencuestas',
  firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('firestore.rules','utf8')}
});
const admin=env.authenticatedContext('admin',{email:'fernandodaniel8888@gmail.com'}).firestore();
const guest=env.unauthenticatedContext().firestore();
const token='a'.repeat(32);
const other='b'.repeat(32);
const expired='c'.repeat(32);
const good={atencion:5,personal:4,claridad:'si',comentario:'Buena atención',whatsapp:'',autorizaContacto:false,createdAt:serverTimestamp()};
const consented={...good,whatsapp:'987654321',autorizaContacto:true};

try{
  await assertSucceeds(setDoc(doc(admin,'encuestas_matricula_tokens',token),{
    createdAt:serverTimestamp(),expiresAt:Timestamp.fromDate(new Date(Date.now()+3600000))
  }));
  await assertSucceeds(setDoc(doc(admin,'encuestas_matricula_tokens',other),{
    createdAt:serverTimestamp(),expiresAt:Timestamp.fromDate(new Date(Date.now()+3600000))
  }));
  await assertSucceeds(setDoc(doc(admin,'encuestas_matricula_tokens',expired),{
    createdAt:serverTimestamp(),expiresAt:Timestamp.fromDate(new Date(Date.now()-60000))
  }));
  // La URL permite leer solo un token conocido; los listados no son públicos.
  await assertSucceeds(getDoc(doc(guest,'encuestas_matricula_tokens',token)));
  await assertFails(getDocs(collection(guest,'encuestas_matricula_tokens')));
  // Guardado público una vez, sin WhatsApp, dentro del vencimiento.
  await assertSucceeds(setDoc(doc(guest,'encuestas_matricula_respuestas',token),good));
  // El mismo enlace no permite segunda escritura, y las respuestas son privadas.
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas',token),good));
  await assertFails(getDoc(doc(guest,'encuestas_matricula_respuestas',token)));
  await assertSucceeds(getDoc(doc(admin,'encuestas_matricula_respuestas',token)));
  // Rechazar calificaciones falsas, consentimiento ausente y token vencido.
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas',other),{...good,atencion:6}));
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas',other),{...good,whatsapp:'987654321'}));
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas',expired),consented));
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas','d'.repeat(32)),good));
  // Se acepta un WhatsApp con consentimiento en un token vigente.
  await assertSucceeds(setDoc(doc(guest,'encuestas_matricula_respuestas',other),consented));
  // Nunca se muestran datos administrativos a anónimos.
  await assertFails(getDocs(collection(guest,'encuestas_matricula_envios')));
  await assertFails(setDoc(doc(guest,'encuestas_matricula_envios','fake'),{estado:'preparado'}));
  console.log('NostraENCUESTAS: reglas de seguridad verificadas.');
}finally{
  await env.cleanup();
}
