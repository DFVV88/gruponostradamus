'use strict';
// Preview ONLY. Never create accounts, assign licenses, edit enrollment or emit a real token.
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const {Graph} = require('../lib/graph');
const {welcomeHtml, personalEmail} = require('../lib/core');

const raw = fs.readFileSync('.env','utf8').split(/\r?\n/)
  .filter(x=>x.includes('=')&&!x.startsWith('#'));
const env = Object.fromEntries(raw.map(x=>[x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)]));
if (env.NOSTRA_M365_ENABLED !== 'true' ||
    env.NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED !== 'true' ||
    env.NOSTRA_M365_SCOPE_MODE !== 'production') {
  throw new Error('La configuracion de NostraM365 no es la esperada; no enviar.');
}
const recipient = personalEmail(env.NOSTRA_M365_PILOT_EMAIL);
if (recipient !== 'sonap17381@jysnk.com') {
  throw new Error('El correo de prueba no coincide; no enviar.');
}

(async ()=>{
  const secret=execFileSync('gcloud',[
    'secrets','versions','access','latest',
    '--secret=NOSTRA_M365_CLIENT_SECRET',
    '--project=nostrachat-grupo-nostradamus'
  ],{encoding:'utf8'}).trim();
  const graph=new Graph(env,secret);
  const example='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/' +
    'nostraM365Activar#id=VISTA_PREVIA&token=NO_VALIDO';
  const html=welcomeHtml('Daniel',
    'daniel.chi@gruponostradamus.edu.pe',example);
  await graph.mailStudent(recipient,
    'VISTA PREVIA | Bienvenida Grupo Nostradamus - Logo oficial HD',
    html,'HTML');
  console.log('VISTA PREVIA ACEPTADA: mensaje HTML con logo oficial HD integrado.');
  console.log('Destinatario de ensayo:',recipient);
  console.log('No se ha creado cuenta ni validado pago.');
  console.log('El enlace de esta vista previa es deliberadamente ficticio.');
})().catch(err=>{
  console.error('No se pudo enviar vista previa:',err.message);
  process.exitCode=1;
});
