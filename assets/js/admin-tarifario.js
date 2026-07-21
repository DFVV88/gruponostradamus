/* ==================================================
   Grupo Nostradamus - Tarifario central y promociones
   Etapa 1 del sistema de matrícula digital Culqi.
   Se administra desde admin-preinscripciones.html.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain: 'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId: 'nostrachat-grupo-nostradamus',
  storageBucket: 'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId: '869749182265',
  appId: '1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const COLLECTION = 'programas_publicos';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DEFAULTS = [
  {
    id: 'nostra-360-uni', nombre: 'Nostra 360 UNI', ruta: 'ciclo-anual-uni.html',
    imagen: 'assets/img/ciclos/ciclo-anual.jpg', orden: 1,
    descripcion: 'Preparación integral desde las bases hasta el nivel de admisión UNI. Formación completa, práctica constante y acompañamiento académico.'
  },
  {
    id: 'nostra-power-uni', nombre: 'Nostra Power UNI', ruta: 'ciclo-semianual-uni.html',
    imagen: 'assets/img/ciclos/ciclo-semianual.jpg', orden: 2,
    descripcion: 'Programa para estudiantes con preparación previa que necesitan corregir debilidades, elevar su rendimiento y volver más fuertes.'
  },
  {
    id: 'nostra-elite-uni', nombre: 'Nostra Élite UNI', ruta: 'ciclo-semestral-uni.html',
    imagen: 'assets/img/ciclos/ciclo-semestral.jpg', orden: 3,
    descripcion: 'Perfeccionamiento estratégico para postulantes competitivos que estuvieron cerca de ingresar y necesitan velocidad, precisión y reducción de errores.'
  },
  {
    id: 'nostra-prime-uni', nombre: 'Nostra Prime UNI', ruta: 'ciclo-repaso-uni.html',
    imagen: 'assets/img/ciclos/ciclo-repaso.jpg', orden: 4,
    descripcion: 'Preparación decisiva para la etapa final: simulacros, temas de mayor impacto, estrategia de examen y rendimiento real.'
  },
  {
    id: 'nostra-talentum-uni', nombre: 'Nostra Talentum UNI', ruta: 'ciclo-elite-uni.html',
    imagen: 'assets/img/ciclos/ciclo-elite.jpg', orden: 5,
    descripcion: 'Programa especial de alto rendimiento para alumnos con talento académico, máxima exigencia y objetivos competitivos.'
  },
  {
    id: 'ciclo-ien', nombre: 'Ciclo IEN', ruta: 'ciclo-ien.html',
    imagen: 'assets/img/ciclos/ciclo-ien.jpg', orden: 6,
    descripcion: 'Preparación académica enfocada, práctica y progresiva para fortalecer las competencias necesarias del estudiante.'
  },
  {
    id: 'proyecto-escolar', nombre: 'Proyecto Escolar', ruta: 'ciclo-proyecto-escolar.html',
    imagen: 'assets/img/ciclos/ciclo-proyecto-escolar.jpg', orden: 7,
    descripcion: 'Refuerzo, nivelación y formación escolar en Matemática, Ciencias y Aptitud Académica con acompañamiento continuo.'
  },
  {
    id: 'paralelo-cepre-uni', nombre: 'Paralelo CEPRE UNI', ruta: 'ciclo-paralelo-cepre-uni.html',
    imagen: 'assets/img/ciclos/ciclo-paralelo-cepre-uni.jpg', orden: 8,
    descripcion: 'Acompañamiento estratégico para estudiantes de CEPRE UNI con práctica, refuerzo y seguimiento académico.'
  },
  {
    id: 'ciclo-verano-uni', nombre: 'Ciclo Verano UNI', ruta: 'ciclo-verano-uni.html',
    imagen: 'assets/img/ciclos/ciclo-verano.jpg', orden: 9,
    descripcion: 'Programa intensivo de vacaciones para avanzar, reforzar bases y desarrollar un método de estudio competitivo.'
  }
];

let catalog = [];
let currentUser = null;
let busy = false;

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

function num(value) {
  const parsed = Number(String(value == null ? '' : value).replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}

function money(value) {
  const amount = num(value);
  return amount > 0 ? 'S/ ' + amount.toFixed(2) : 'No definido';
}

function isPromoActive(item) {
  if (!item.promocionActiva || num(item.precioPromocional) <= 0) return false;
  if (!item.promocionHasta) return true;
  const end = new Date(item.promocionHasta + 'T23:59:59');
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}

function addStyles() {
  if (document.getElementById('nostra-admin-pricing-style')) return;
  const style = document.createElement('style');
  style.id = 'nostra-admin-pricing-style';
  style.textContent = `
    #nostra-pricing-admin-panel{margin:0 0 22px;background:linear-gradient(180deg,#fff,#f6fcfd);}
    .nostra-price-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:18px;}
    .nostra-price-head h2{font-family:'Baloo 2';font-size:40px;line-height:1;color:#061426;margin:0 0 7px;}
    .nostra-price-head p{margin:0;color:#4b5d70;font-size:16px;line-height:1.55;max-width:760px;}
    .nostra-price-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end;}
    .nostra-compliance{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0 20px;}
    .nostra-compliance div{background:#f4fbfd;border:1px solid rgba(7,140,149,.14);border-radius:16px;padding:12px;font-size:13px;font-weight:850;color:#34495e;}
    .nostra-compliance b{display:block;color:#061426;margin-bottom:4px;}
    .nostra-program-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}
    .nostra-program-card{border:1px solid rgba(7,140,149,.18);border-radius:22px;padding:18px;background:#fff;box-shadow:0 12px 30px rgba(6,20,38,.06);}
    .nostra-program-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
    .nostra-program-title h3{font-family:'Baloo 2';font-size:28px;line-height:1;color:#061426;margin:0 0 4px;}
    .nostra-program-title small{color:#607080;font-weight:750;}
    .nostra-publish{display:flex;align-items:center;gap:7px;font-weight:900;color:#075b65;white-space:nowrap;}
    .nostra-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .nostra-form-grid .wide{grid-column:1/-1;}
    .nostra-program-card label span{display:block;font-size:12px;font-weight:950;color:#061426;margin:0 0 5px;text-transform:uppercase;letter-spacing:.25px;}
    .nostra-program-card input,.nostra-program-card select,.nostra-program-card textarea{width:100%;border:1px solid #d7e7eb;border-radius:12px;padding:10px 11px;font:inherit;color:#172033;background:#fff;}
    .nostra-program-card textarea{min-height:74px;resize:vertical;}
    .nostra-promo-box{grid-column:1/-1;border-radius:16px;padding:12px;background:#fff8e8;border:1px solid rgba(255,148,30,.28);}
    .nostra-promo-check{display:flex!important;align-items:center;gap:8px;font-size:14px!important;text-transform:none!important;}
    .nostra-promo-check input{width:auto!important;}
    .nostra-price-preview{grid-column:1/-1;border-radius:14px;padding:11px 12px;background:#eef8fa;color:#075b65;font-weight:850;line-height:1.45;}
    .nostra-card-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px;}
    .nostra-card-status{font-size:12px;color:#657584;font-weight:800;}
    .nostra-empty-note{padding:18px;border-radius:18px;background:#fff8e8;border:1px solid rgba(255,148,30,.3);color:#6a4700;font-weight:800;line-height:1.55;margin-bottom:16px;}
    @media(max-width:1000px){.nostra-program-grid{grid-template-columns:1fr}.nostra-compliance{grid-template-columns:1fr 1fr}.nostra-price-head{display:block}.nostra-price-actions{justify-content:flex-start;margin-top:12px}}
    @media(max-width:650px){.nostra-form-grid,.nostra-compliance{grid-template-columns:1fr}.nostra-form-grid .wide,.nostra-promo-box,.nostra-price-preview{grid-column:auto}.nostra-card-footer{display:block}.nostra-card-footer .btn{margin-top:8px}}
  `;
  document.head.appendChild(style);
}

function setMessage(type, text) {
  const el = document.getElementById('nostra-pricing-message');
  if (!el) return;
  el.className = 'msg ' + type;
  el.innerHTML = text;
}

function ensurePanel() {
  if (document.getElementById('nostra-pricing-admin-panel')) return;
  addStyles();
  const admin = document.getElementById('admin-panel');
  if (!admin) return;

  const panel = document.createElement('section');
  panel.id = 'nostra-pricing-admin-panel';
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="nostra-price-head">
      <div>
        <h2>Programas, precios y promociones</h2>
        <p>Este es el tarifario central. Cambia los montos aquí y luego la web pública mostrará la misma información. No se enviará ningún monto a Culqi hasta implementar la etapa segura de pagos.</p>
      </div>
      <div class="nostra-price-actions">
        <a class="btn btn-light" href="programas-precios.html" target="_blank" rel="noopener">Ver precios públicos</a>
        <button class="btn btn-blue" id="nostra-pricing-reload">Actualizar</button>
        <button class="btn btn-green" id="nostra-pricing-save-all">Guardar todo</button>
      </div>
    </div>
    <div class="nostra-compliance">
      <div><b>1. Catálogo y precios</b>En implementación</div>
      <div><b>2. Páginas legales</b>Pendiente</div>
      <div><b>3. Libro de Reclamaciones</b>Pendiente</div>
      <div><b>4. Culqi en pruebas</b>Pendiente</div>
    </div>
    <div class="nostra-empty-note">Publica un programa solamente cuando hayas colocado su precio real, modalidad y condiciones básicas. Los descuentos vencen automáticamente según la fecha indicada.</div>
    <div class="msg" id="nostra-pricing-message"></div>
    <div class="nostra-program-grid" id="nostra-program-grid"><div>Cargando tarifario...</div></div>`;

  const hero = admin.querySelector('.hero');
  if (hero) hero.insertAdjacentElement('afterend', panel);
  else admin.insertBefore(panel, admin.firstChild);

  document.getElementById('nostra-pricing-reload').addEventListener('click', loadCatalog);
  document.getElementById('nostra-pricing-save-all').addEventListener('click', saveAll);
  document.getElementById('nostra-program-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-save-program]');
    if (button) saveOne(button.dataset.saveProgram);
  });
  document.getElementById('nostra-program-grid').addEventListener('input', event => {
    const card = event.target.closest('[data-program-card]');
    if (card) updatePreview(card);
  });
  document.getElementById('nostra-program-grid').addEventListener('change', event => {
    const card = event.target.closest('[data-program-card]');
    if (card) updatePreview(card);
  });
}

function mergeCatalog(remoteDocs) {
  const map = new Map(remoteDocs.map(item => [item.id, item]));
  return DEFAULTS.map(base => ({
    matricula: 0,
    pension: 0,
    pagoUnico: 0,
    modalidad: 'Presencial y virtual',
    fechaInicio: '',
    duracion: '',
    cupos: 0,
    publicado: false,
    promocionActiva: false,
    promocionConcepto: 'matricula',
    precioPromocional: 0,
    promocionHasta: '',
    ...base,
    ...(map.get(base.id) || {}),
    id: base.id,
    nombre: base.nombre,
    ruta: base.ruta,
    imagen: (map.get(base.id) || {}).imagen || base.imagen,
    orden: base.orden
  }));
}

async function loadCatalog() {
  if (!currentUser) return;
  const grid = document.getElementById('nostra-program-grid');
  if (!grid) return;
  grid.innerHTML = '<div>Cargando tarifario...</div>';
  setMessage('info', 'Consultando precios guardados en Firebase...');
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const docs = snap.docs.map(item => ({ id: item.id, ...item.data() }));
    catalog = mergeCatalog(docs);
    renderCatalog();
    setMessage('ok', docs.length ? 'Tarifario actualizado.' : 'Catálogo preparado. Completa los precios y pulsa “Guardar todo”.');
  } catch (error) {
    console.error('No se pudo cargar el tarifario:', error);
    catalog = mergeCatalog([]);
    renderCatalog();
    setMessage('err', 'No se pudo leer la colección de precios. El formulario se muestra, pero será necesario autorizar la colección “programas_publicos” en las reglas de Firestore.');
  }
}

function renderCatalog() {
  const grid = document.getElementById('nostra-program-grid');
  if (!grid) return;
  grid.innerHTML = catalog.map(item => `
    <article class="nostra-program-card" data-program-card="${esc(item.id)}">
      <div class="nostra-program-title">
        <div><h3>${esc(item.nombre)}</h3><small>${esc(item.ruta)}</small></div>
        <label class="nostra-publish"><input type="checkbox" data-field="publicado" ${item.publicado ? 'checked' : ''}> Publicado</label>
      </div>
      <div class="nostra-form-grid">
        <label><span>Matrícula (S/)</span><input type="number" min="0" step="0.01" data-field="matricula" value="${esc(item.matricula || '')}" placeholder="0.00"></label>
        <label><span>Pensión mensual (S/)</span><input type="number" min="0" step="0.01" data-field="pension" value="${esc(item.pension || '')}" placeholder="0.00"></label>
        <label><span>Pago único (S/)</span><input type="number" min="0" step="0.01" data-field="pagoUnico" value="${esc(item.pagoUnico || '')}" placeholder="Solo si aplica"></label>
        <label><span>Cupos</span><input type="number" min="0" step="1" data-field="cupos" value="${esc(item.cupos || '')}" placeholder="0 = sin límite publicado"></label>
        <label><span>Modalidad</span><select data-field="modalidad">
          ${['Presencial y virtual','Presencial','Virtual'].map(option => `<option ${item.modalidad === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select></label>
        <label><span>Fecha de inicio</span><input type="date" data-field="fechaInicio" value="${esc(item.fechaInicio || '')}"></label>
        <label class="wide"><span>Duración / frecuencia</span><input data-field="duracion" value="${esc(item.duracion || '')}" placeholder="Ej. 5 meses · lunes a sábado"></label>
        <label class="wide"><span>Descripción pública</span><textarea data-field="descripcion">${esc(item.descripcion || '')}</textarea></label>
        <div class="nostra-promo-box">
          <label class="nostra-promo-check"><input type="checkbox" data-field="promocionActiva" ${item.promocionActiva ? 'checked' : ''}> Activar promoción temporal</label>
          <div class="nostra-form-grid" style="margin-top:10px">
            <label><span>Aplicar a</span><select data-field="promocionConcepto">
              <option value="matricula" ${item.promocionConcepto === 'matricula' ? 'selected' : ''}>Matrícula</option>
              <option value="pension" ${item.promocionConcepto === 'pension' ? 'selected' : ''}>Primera pensión</option>
              <option value="pago_unico" ${item.promocionConcepto === 'pago_unico' ? 'selected' : ''}>Pago único</option>
            </select></label>
            <label><span>Precio promocional (S/)</span><input type="number" min="0" step="0.01" data-field="precioPromocional" value="${esc(item.precioPromocional || '')}" placeholder="0.00"></label>
            <label class="wide"><span>Válida hasta</span><input type="date" data-field="promocionHasta" value="${esc(item.promocionHasta || '')}"></label>
          </div>
        </div>
        <div class="nostra-price-preview" data-price-preview></div>
      </div>
      <div class="nostra-card-footer">
        <span class="nostra-card-status">Última edición: ${esc(formatDate(item.updatedAt))}</span>
        <button class="btn btn-primary" data-save-program="${esc(item.id)}">Guardar ${esc(item.nombre)}</button>
      </div>
    </article>`).join('');

  grid.querySelectorAll('[data-program-card]').forEach(updatePreview);
}

function formatDate(value) {
  if (!value) return 'sin guardar';
  try {
    const date = value.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 'sin fecha' : date.toLocaleString('es-PE');
  } catch (_) {
    return 'sin fecha';
  }
}

function readCard(card) {
  const base = catalog.find(item => item.id === card.dataset.programCard) || {};
  const get = field => card.querySelector(`[data-field="${field}"]`);
  return {
    ...base,
    publicado: !!get('publicado')?.checked,
    matricula: num(get('matricula')?.value),
    pension: num(get('pension')?.value),
    pagoUnico: num(get('pagoUnico')?.value),
    cupos: Math.max(0, Math.floor(num(get('cupos')?.value))),
    modalidad: String(get('modalidad')?.value || 'Presencial y virtual'),
    fechaInicio: String(get('fechaInicio')?.value || ''),
    duracion: String(get('duracion')?.value || '').trim(),
    descripcion: String(get('descripcion')?.value || '').trim(),
    promocionActiva: !!get('promocionActiva')?.checked,
    promocionConcepto: String(get('promocionConcepto')?.value || 'matricula'),
    precioPromocional: num(get('precioPromocional')?.value),
    promocionHasta: String(get('promocionHasta')?.value || '')
  };
}

function updatePreview(card) {
  const preview = card.querySelector('[data-price-preview]');
  if (!preview) return;
  const item = readCard(card);
  const parts = [];
  if (item.matricula > 0) parts.push('Matrícula: ' + money(item.matricula));
  if (item.pension > 0) parts.push('Pensión: ' + money(item.pension));
  if (item.pagoUnico > 0) parts.push('Pago único: ' + money(item.pagoUnico));
  if (!parts.length) parts.push('Todavía no hay un precio definido.');
  if (isPromoActive(item)) {
    const label = item.promocionConcepto === 'pension' ? 'primera pensión' : item.promocionConcepto === 'pago_unico' ? 'pago único' : 'matrícula';
    parts.push(`Promoción en ${label}: ${money(item.precioPromocional)}${item.promocionHasta ? ' hasta ' + item.promocionHasta : ''}.`);
  }
  preview.textContent = parts.join(' · ');
}

function validate(item) {
  if (item.publicado && item.matricula <= 0 && item.pension <= 0 && item.pagoUnico <= 0) {
    return 'No puedes publicar ' + item.nombre + ' sin definir al menos un precio.';
  }
  if (item.promocionActiva && item.precioPromocional <= 0) {
    return 'La promoción de ' + item.nombre + ' necesita un precio promocional mayor que cero.';
  }
  if (item.publicado && !item.descripcion) {
    return 'Agrega una descripción pública para ' + item.nombre + '.';
  }
  return '';
}

function payload(item, isNew) {
  const result = {
    nombre: item.nombre,
    ruta: item.ruta,
    imagen: item.imagen,
    orden: item.orden,
    descripcion: item.descripcion,
    modalidad: item.modalidad,
    fechaInicio: item.fechaInicio,
    duracion: item.duracion,
    cupos: item.cupos,
    matricula: item.matricula,
    pension: item.pension,
    pagoUnico: item.pagoUnico,
    publicado: item.publicado,
    promocionActiva: item.promocionActiva,
    promocionConcepto: item.promocionConcepto,
    precioPromocional: item.precioPromocional,
    promocionHasta: item.promocionHasta,
    moneda: 'PEN',
    precioVersion: 1,
    actualizadoPor: currentUser?.email || ADMIN_EMAIL,
    updatedAt: serverTimestamp()
  };
  if (isNew) result.createdAt = serverTimestamp();
  return result;
}

async function saveOne(id) {
  if (busy || !currentUser) return;
  const card = document.querySelector(`[data-program-card="${CSS.escape(id)}"]`);
  if (!card) return;
  const item = readCard(card);
  const error = validate(item);
  if (error) return setMessage('err', error);
  try {
    busy = true;
    setMessage('info', 'Guardando ' + item.nombre + '...');
    const existing = catalog.find(program => program.id === id);
    await setDoc(doc(db, COLLECTION, id), payload(item, !existing?.updatedAt), { merge: true });
    setMessage('ok', item.nombre + ' fue guardado correctamente.');
    await loadCatalog();
  } catch (errorSave) {
    console.error('Error guardando programa:', errorSave);
    setMessage('err', 'No se pudo guardar. Revisa las reglas de Firestore para permitir escritura administrativa en “programas_publicos”.');
  } finally {
    busy = false;
  }
}

async function saveAll() {
  if (busy || !currentUser) return;
  const cards = Array.from(document.querySelectorAll('[data-program-card]'));
  const items = cards.map(readCard);
  const error = items.map(validate).find(Boolean);
  if (error) return setMessage('err', error);
  if (!confirm('¿Guardar todos los precios y promociones mostrados?')) return;

  try {
    busy = true;
    setMessage('info', 'Guardando el tarifario completo...');
    const batch = writeBatch(db);
    items.forEach(item => {
      const existing = catalog.find(program => program.id === item.id);
      batch.set(doc(db, COLLECTION, item.id), payload(item, !existing?.updatedAt), { merge: true });
    });
    await batch.commit();
    setMessage('ok', 'Tarifario completo guardado correctamente.');
    await loadCatalog();
  } catch (errorSave) {
    console.error('Error guardando tarifario:', errorSave);
    setMessage('err', 'No se pudo guardar el tarifario. Revisa las reglas de Firestore para la colección “programas_publicos”.');
  } finally {
    busy = false;
  }
}

onAuthStateChanged(auth, user => {
  const email = String(user?.email || '').toLowerCase();
  if (!user || email !== ADMIN_EMAIL) {
    currentUser = null;
    return;
  }
  currentUser = user;
  ensurePanel();
  loadCatalog();
});
