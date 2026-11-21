import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,collection,getDoc,getDocs,setDoc,Timestamp,serverTimestamp,updateDoc,deleteDoc,writeBatch} from 'firebase/firestore';

const env=await initializeTestEnvironment({
  projectId:'demo-nostraencuestas',
  firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('firestore.rules','utf8')}
});
const admin=env.authenticatedContext('admin',{email:'fernandodaniel8888@gmail.com'}).firestore();
const guest=env.unauthenticatedContext().firestore();
const member=env.authenticatedContext('member',{email:'prueba@example.invalid'}).firestore();
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
  // Un usuario autenticado cualquiera tampoco obtiene permisos administrativos.
  for(const client of [guest,member]){
    await assertFails(getDocs(collection(client,'encuestas_matricula_respuestas')));
    await assertFails(getDoc(doc(client,'encuestas_matricula_envios','fake')));
    await assertFails(setDoc(doc(client,'encuestas_matricula_tokens','z'.repeat(32)),{createdAt:serverTimestamp(),expiresAt:Timestamp.now()}));
    await assertFails(updateDoc(doc(client,'encuestas_matricula_respuestas',token),{atencion:1}));
    await assertFails(deleteDoc(doc(client,'encuestas_matricula_respuestas',token)));
    await assertFails(deleteDoc(doc(client,'encuestas_matricula_tokens',token)));
    for(const name of ['preinscripciones','matriculas','finanzas_movimientos','alumno_cuotas','nostram365_private']){
      await assertFails(getDocs(collection(client,name)));
      await assertFails(setDoc(doc(client,name,'encuestas_security_probe'),{isTest:true}));
    }
  }
  const fresh='e'.repeat(32);
  await assertSucceeds(setDoc(doc(admin,'encuestas_matricula_tokens',fresh),{createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+3600000)}));
  // Incluso el administrador no puede guardar PII en tokens públicos.
  await assertFails(updateDoc(doc(admin,'encuestas_matricula_tokens',fresh),{nombre:'PRUEBA'}));
  for(const change of [
    {atencion:0},{atencion:1.5},{personal:6},{personal:'5'},
    {claridad:'otra'},{comentario:'x'.repeat(1001)},{comentario:42},
    {whatsapp:'123456789',autorizaContacto:true},{whatsapp:'',autorizaContacto:true},
    {autorizaContacto:'true'},{createdAt:Timestamp.fromMillis(0)},{extra:'campo no permitido'}
  ]) await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas',fresh),{...good,...change}));
  const missing={...good};delete missing.claridad;
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas',fresh),missing));
  await assertFails(setDoc(doc(guest,'encuestas_matricula_respuestas','invalido'),good));
  // Los dos clientes compiten por el mismo token: solo una creación puede ganar.
  const concurrent=await Promise.allSettled([
    setDoc(doc(guest,'encuestas_matricula_respuestas',fresh),good),
    setDoc(doc(member,'encuestas_matricula_respuestas',fresh),good)
  ]);
  if(concurrent.filter(x=>x.status==='fulfilled').length!==1)throw new Error('Duplicado concurrente permitido');
  // La prueba interna utiliza únicamente colecciones de encuestas.
  const batch=writeBatch(admin),testToken='f'.repeat(32);
  batch.set(doc(admin,'encuestas_matricula_tokens',testToken),{createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+3600000)});
  batch.set(doc(admin,'encuestas_matricula_envios','prueba_'+testToken),{token:testToken,isTest:true,telefonoDestino:''});
  await assertSucceeds(batch.commit());
  await assertSucceeds(setDoc(doc(guest,'encuestas_matricula_respuestas',testToken),{...good,atencion:1}));
  await assertSucceeds(getDocs(collection(admin,'encuestas_matricula_envios')));
  await assertSucceeds(getDocs(collection(admin,'encuestas_matricula_respuestas')));
  console.log('NostraENCUESTAS: privacidad, validación, concurrencia, prueba interna y aislamiento verificados.');
}finally{
  await env.cleanup();
}
