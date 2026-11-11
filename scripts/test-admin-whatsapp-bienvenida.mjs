import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  normalizeStudentPhone,
  welcomeApproved,
  suggestInstitutionalEmail,
  validInstitutionalEmail,
  buildWelcomeWhatsApp
} from '../assets/js/admin-whatsapp-bienvenida.mjs';

const record = {
  id:'sample', nombre:'DANIEL CHI', celular:'+51 993 750 351',
  origen:'web_preinscripcion', estado:'matriculado',
  estadoPago:'pago_validado', pagoValidado:true
};

test('telephone normalization is strictly Peruvian WhatsApp E.164 without plus', () => {
  assert.equal(normalizeStudentPhone('993750351'),'51993750351');
  assert.equal(normalizeStudentPhone('+51 993 750 351'),'51993750351');
  assert.equal(normalizeStudentPhone('0051 993750351'),'51993750351');
  assert.equal(normalizeStudentPhone('51993750351'),'51993750351');
  for(const invalid of ['', '123456', '+57 993750351', '91993750351', '0012345678']) {
    assert.equal(normalizeStudentPhone(invalid),null);
  }
});

test('welcome action requires approved enrollment and validated payment', () => {
  assert.equal(welcomeApproved(record),true);
  assert.equal(welcomeApproved({...record,estado:'nuevo',matriculaAprobada:false}),false);
  assert.equal(welcomeApproved({...record,pagoValidado:false}),false);
  assert.equal(welcomeApproved({...record,estadoPago:'pendiente_envio_voucher'}),false);
  assert.equal(welcomeApproved({...record,estado:'rechazado'}),false);
  assert.equal(welcomeApproved({...record,estado:'listo_para_matricula',matriculaAprobada:true}),true);
});

test('suggested UPN follows NostraM365 naming; ambiguous name remains blank', () => {
  assert.equal(suggestInstitutionalEmail(record),'daniel.chi@gruponostradamus.edu.pe');
  assert.equal(suggestInstitutionalEmail({...record,nombre:'María Condor Huaman'}),'');
  assert.equal(suggestInstitutionalEmail({...record,nombre:'Axel Johao QUEZADA Saldaña'}),'axel.quezada@gruponostradamus.edu.pe');
  assert.equal(suggestInstitutionalEmail({...record,correoInstitucional:'REAL@gruponostradamus.edu.pe'}),'real@gruponostradamus.edu.pe');
  assert.equal(validInstitutionalEmail('daniel.chi@gruponostradamus.edu.pe'),true);
  assert.equal(validInstitutionalEmail('daniel@gmail.com'),false);
});

test('manual message mirrors approved email structure and uses only supplied password', () => {
  const password='TEST_DEMO_NOT_A_REAL_PASSWORD_!2026';
  const text=buildWelcomeWhatsApp(record,'daniel.chi@gruponostradamus.edu.pe',password);
  for (const part of [
    '¡Bienvenido, Daniel', 'Tu matrícula ha sido aprobada',
    'daniel.chi@gruponostradamus.edu.pe', password,
    'INGRESO A MICROSOFT TEAMS', 'NostraPASOS', 'NostraCUENTA',
    'NostraCHAT', 'DAMUS Académico', 'Grupo Nostradamus'
  ]) assert.ok(text.includes(part), 'missing '+part);
  assert.equal(text.split(password).length-1,1);
  assert.equal(text.includes('nostraM365Activar#'),false);
});

test('message rejects incomplete credential fields and multiline passwords', () => {
  assert.throws(()=>buildWelcomeWhatsApp(record,'x@gmail.com','1234567890'),/CORREO_INSTITUCIONAL_INVALIDO/);
  assert.throws(()=>buildWelcomeWhatsApp(record,'daniel.chi@gruponostradamus.edu.pe','12345'),/CONTRASENA_INVALIDA/);
  assert.throws(()=>buildWelcomeWhatsApp(record,'daniel.chi@gruponostradamus.edu.pe','ABCDEFGH\n123'),/CONTRASENA_INVALIDA/);
});

test('administrative UI has the table and record-level button; WhatsApp URL never contains credentials', () => {
  const admin = fs.readFileSync(new URL('../assets/js/admin-preinscripciones.js',import.meta.url),'utf8');
  const html = fs.readFileSync(new URL('../admin-preinscripciones.html',import.meta.url),'utf8');
  const whatsapp = fs.readFileSync(new URL('../assets/js/admin-whatsapp-bienvenida.mjs',import.meta.url),'utf8');
  assert.match(admin,/openWhatsAppWelcome/);
  assert.match(admin,/data-welcome-wa/);
  assert.match(admin,/whatsapp-welcome-btn/);
  assert.match(html,/id="whatsapp-welcome-btn"/);
  assert.match(html,/2026-11-11-whatsapp-1/);
  assert.match(whatsapp,/https:\/\/wa\.me\/' \+ phone/);
  assert.doesNotMatch(whatsapp,/wa\.me\/' \+ phone \+.*(?:password|encodeURIComponent)/);
  assert.doesNotMatch(whatsapp,/localStorage|sessionStorage|sendBeacon|updateDoc\(/);
});
