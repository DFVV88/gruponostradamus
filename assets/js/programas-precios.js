/* ==================================================
   Grupo Nostradamus - Catálogo público de programas y precios
   Lee exclusivamente la colección pública programas_publicos.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain: 'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId: 'nostrachat-grupo-nostradamus',
  storageBucket: 'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId: '869749182265',
  appId: '1:869749182265:web:5f5c9174680585f142e2e8'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const grid = document.getElementById('programas-grid');
const message = document.getElementById('catalog-message');

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function money(value) {
  return 'S/ ' + number(value).toFixed(2);
}

function promoActive(item) {
  if (!item.promocionActiva || number(item.precioPromocional) <= 0) return false;
  if (!item.promocionHasta) return true;
  const end = new Date(item.promocionHasta + 'T23:59:59');
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}

function dateLabel(value) {
  if (!value) return '';
  const date = new Date(value + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function priceRows(item) {
  const rows = [];
  const promo = promoActive(item);
  const concept = item.promocionConcepto || 'matricula';
  const add = (key, label, value) => {
    const regular = number(value);
    if (regular <= 0) return;
    if (promo && concept === key) {
      rows.push(`<div class="price-row promo"><span>${esc(label)}</span><div><del>${money(regular)}</del><strong>${money(item.precioPromocional)}</strong></div></div>`);
    } else {
      rows.push(`<div class="price-row"><span>${esc(label)}</span><strong>${money(regular)}</strong></div>`);
    }
  };
  add('matricula', 'Matrícula', item.matricula);
  add('pension', 'Pensión mensual', item.pension);
  add('pago_unico', 'Pago único', item.pagoUnico);
  return rows.join('');
}

function card(item) {
  const start = dateLabel(item.fechaInicio);
  const promo = promoActive(item);
  const query = encodeURIComponent(item.nombre || item.id);
  return `
    <article class="program-card">
      <a class="program-image" href="${esc(item.ruta || '#')}">
        <img src="${esc(item.imagen || 'assets/img/logo.png')}" alt="${esc(item.nombre)}" loading="lazy" onerror="this.onerror=null;this.src='assets/img/logo.png';">
        ${promo ? '<span class="promo-badge">Promoción vigente</span>' : ''}
      </a>
      <div class="program-content">
        <span class="program-line">Programa académico</span>
        <h2>${esc(item.nombre)}</h2>
        <p>${esc(item.descripcion || '')}</p>
        <div class="program-meta">
          <span>🎓 ${esc(item.modalidad || 'Modalidad por confirmar')}</span>
          ${start ? `<span>📅 Inicio: ${esc(start)}</span>` : ''}
          ${item.duracion ? `<span>⏱️ ${esc(item.duracion)}</span>` : ''}
          ${number(item.cupos) > 0 ? `<span>👥 ${esc(item.cupos)} cupos</span>` : ''}
        </div>
        <div class="price-box">${priceRows(item)}</div>
        ${promo && item.promocionHasta ? `<div class="promo-until">Precio promocional válido hasta el ${esc(dateLabel(item.promocionHasta))}.</div>` : ''}
        <div class="program-actions">
          <a class="btn btn-primary" href="preinscripcion.html?programa=${query}">Preinscribirme</a>
          <a class="btn btn-light" href="${esc(item.ruta || '#')}">Ver programa</a>
        </div>
      </div>
    </article>`;
}

async function loadCatalog() {
  if (!grid || !message) return;
  message.className = 'catalog-message info';
  message.textContent = 'Cargando programas y precios vigentes...';
  try {
    const snap = await getDocs(collection(db, 'programas_publicos'));
    const programs = snap.docs
      .map(docItem => ({ id: docItem.id, ...docItem.data() }))
      .filter(item => item.publicado === true)
      .filter(item => number(item.matricula) > 0 || number(item.pension) > 0 || number(item.pagoUnico) > 0)
      .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999));

    if (!programs.length) {
      grid.innerHTML = '';
      message.className = 'catalog-message warning';
      message.innerHTML = 'El tarifario se encuentra en actualización. Para conocer los precios vigentes, comunícate con nuestro equipo por WhatsApp.';
      return;
    }

    grid.innerHTML = programs.map(card).join('');
    message.className = 'catalog-message ok';
    message.textContent = 'Precios vigentes publicados por Grupo Nostradamus.';
  } catch (error) {
    console.error('No se pudo cargar el catálogo público:', error);
    grid.innerHTML = '';
    message.className = 'catalog-message warning';
    message.innerHTML = 'No pudimos cargar los precios en este momento. Escríbenos por WhatsApp para recibir atención inmediata.';
  }
}

loadCatalog();
