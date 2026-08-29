import { NOSTRAPLAY_COURSES } from './config/courses.js';
import { NOSTRAPLAY_UNITS } from './content/registry.js';
import { hydrateMath } from './core/nostra-math.js';

const courseGrid = document.getElementById('courseGrid');
const unitsGrid = document.getElementById('unitsGrid');
const emptyState = document.getElementById('emptyState');
const unitsTitle = document.getElementById('unitsTitle');
const unitCount = document.getElementById('unitCount');
let selectedCourse = null;

function pluralizeUnits(count) {
  return `${count} ${count === 1 ? 'unidad' : 'unidades'}`;
}

function unitsFor(courseId) {
  return NOSTRAPLAY_UNITS.filter((unit) => !courseId || unit.course === courseId);
}

function renderCourses() {
  courseGrid.innerHTML = '';
  NOSTRAPLAY_COURSES.forEach((course) => {
    const count = unitsFor(course.id).length;
    const card = document.createElement('article');
    card.className = 'course-card';
    card.tabIndex = 0;
    card.dataset.course = course.id;
    card.innerHTML = `
      <span class="course-meta">${count}</span>
      <div class="course-icon">${course.short}</div>
      <h3>${course.name}</h3>
      <p>${course.description}</p>`;

    const activate = () => selectCourse(course.id, course.name, card);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
    courseGrid.appendChild(card);
  });
}

function selectCourse(courseId, courseName, card) {
  selectedCourse = selectedCourse === courseId ? null : courseId;
  document.querySelectorAll('.course-card').forEach((node) => {
    node.classList.toggle('active', node.dataset.course === selectedCourse);
  });
  unitsTitle.textContent = selectedCourse ? courseName : 'Banco inicial';
  renderUnits();
  if (card) document.querySelector('.units-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderUnits() {
  const units = unitsFor(selectedCourse);
  unitCount.textContent = pluralizeUnits(units.length);
  unitsGrid.innerHTML = '';
  emptyState.hidden = units.length > 0;
  if (!units.length) return;

  units.forEach((unit) => {
    const course = NOSTRAPLAY_COURSES.find((item) => item.id === unit.course);
    const article = document.createElement('article');
    article.className = 'unit-card';
    article.innerHTML = `
      <span class="unit-course">${course?.name || unit.course}</span>
      <h3>${unit.title}</h3>
      <p>${unit.description || 'Unidad NostraPLAY estructurada y validada.'}</p>
      <a href="${unit.href}">ABRIR UNIDAD →</a>`;
    unitsGrid.appendChild(article);
  });
}

window.addEventListener('load', () => hydrateMath(document));
renderCourses();
renderUnits();
