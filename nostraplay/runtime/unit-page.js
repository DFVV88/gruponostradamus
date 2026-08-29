import { hydrateMath } from '../core/nostra-math.js';
import { renderAcademicGraphic } from '../core/nostra-graph.js';

const unit = window.__NOSTRAPLAY_UNIT__;
if (!unit) throw new Error('NostraPLAY: no se encontró window.__NOSTRAPLAY_UNIT__');

document.title = `${unit.title} · NostraPLAY`;
const title = document.getElementById('unitTitle');
const description = document.getElementById('unitDescription');
const course = document.getElementById('unitCourse');
const conceptList = document.getElementById('conceptList');
const questionSummary = document.getElementById('questionSummary');

if (title) title.textContent = unit.title;
if (description) description.textContent = unit.description || '';
if (course) course.textContent = String(unit.course || '').replaceAll('-', ' ').toUpperCase();

(unit.concepts || []).forEach((concept) => {
  const card = document.createElement('article');
  card.className = 'concept-card';
  card.innerHTML = `<span class="eyebrow">APRENDE</span><h2>${concept.title}</h2><div class="concept-body">${concept.body}</div><div class="concept-formulas"></div><div class="concept-graphic"></div>`;

  const formulas = card.querySelector('.concept-formulas');
  (concept.formulas || []).forEach((latex) => {
    const node = document.createElement('div');
    node.dataset.latexDisplay = latex;
    formulas.appendChild(node);
  });

  if (concept.graphic) renderAcademicGraphic(card.querySelector('.concept-graphic'), concept.graphic);
  conceptList?.appendChild(card);
});

const byLevel = { basico: 0, intermedio: 0, avanzado: 0 };
(unit.questions || []).forEach((question) => {
  if (byLevel[question.level] !== undefined) byLevel[question.level] += 1;
});

if (questionSummary) {
  questionSummary.textContent = `${byLevel.basico} básicas · ${byLevel.intermedio} intermedias · ${byLevel.avanzado} avanzadas`;
}

window.addEventListener('load', () => hydrateMath(document));
