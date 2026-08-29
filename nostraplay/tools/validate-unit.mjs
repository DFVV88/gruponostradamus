#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const source = process.argv[2];
if (!source) {
  console.error('Uso: node nostraplay/tools/validate-unit.mjs ruta/al/nostraplay.ts');
  process.exit(1);
}

const abs = path.resolve(source);
const text = fs.readFileSync(abs, 'utf8');
const transformed = text.replace(/^\s*export\s+default\s+/m, 'unit = ');
const sandbox = { unit: null };

try {
  vm.runInNewContext(transformed, sandbox, { timeout: 1000 });
} catch (error) {
  console.error('Sintaxis inválida:', error.message);
  process.exit(1);
}

const unit = sandbox.unit;
const allowedCourses = new Set([
  'aritmetica',
  'algebra',
  'geometria',
  'trigonometria',
  'fisica',
  'quimica',
  'razonamiento-matematico',
  'razonamiento-verbal'
]);
const allowedLevels = new Set(['basico', 'intermedio', 'avanzado']);
const errors = [];

for (const key of ['id', 'course', 'topic', 'subtopic', 'title', 'description', 'version', 'concepts', 'examples', 'questions', 'masteryRules']) {
  if (unit?.[key] === undefined || unit?.[key] === null) errors.push(`Falta campo obligatorio: ${key}`);
}

if (!allowedCourses.has(unit?.course)) errors.push(`Curso no permitido: ${unit?.course}`);
if (unit?.version !== 1) errors.push('version debe ser 1');
if (!Array.isArray(unit?.questions)) errors.push('questions debe ser un arreglo');

const ids = new Set();
for (const [index, question] of (unit?.questions || []).entries()) {
  if (!question.id) errors.push(`Pregunta ${index + 1}: falta id`);
  if (ids.has(question.id)) errors.push(`ID duplicado: ${question.id}`);
  else ids.add(question.id);
  if (!allowedLevels.has(question.level)) errors.push(`Pregunta ${question.id || index + 1}: nivel inválido`);
  if (!Array.isArray(question.choices) || question.choices.length !== 5) errors.push(`Pregunta ${question.id || index + 1}: debe tener 5 alternativas`);
  if (!['A', 'B', 'C', 'D', 'E'].includes(question.correctAnswer)) errors.push(`Pregunta ${question.id || index + 1}: clave inválida`);
  if (!question.solution) errors.push(`Pregunta ${question.id || index + 1}: falta solución`);
}

if (errors.length) {
  console.error('Validación NostraPLAY fallida:\n- ' + errors.join('\n- '));
  process.exit(1);
}

console.log(`OK · ${unit.title} · ${unit.questions.length} preguntas`);
