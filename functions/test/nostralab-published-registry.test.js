'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const registry = require('../lib/nostralab-approved.json');
const catalog = require('../../nostralab/catalogo.json');
const repoRoot = path.join(__dirname, '../..');
test('la whitelist coincide con el catálogo publicado', () => {
  const expected = catalog.experiencias.filter(x => x.publicado === true).map(x => x.id).sort();
  assert.deepEqual([...registry].sort(), expected);
  assert.equal(new Set(registry).size, registry.length);
});
test('el visor presenta distintivo fuera del iframe del laboratorio', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'nostralab/laboratorio.html'), 'utf8');
  assert.match(html, /id="nostralab-visitas"/);
  assert.match(html, /id="nostralab-visitas-total"/);
  assert.match(html, /src="\.\.\/assets\/js\/nostralab-visitas\.js"/);
  assert.match(html, /nostralab:ready/);
  assert.match(html, /sandbox="allow-scripts allow-downloads"/);
});
test('el navegador utiliza sesión aleatoria y cifra de servidor', () => {
  const js = fs.readFileSync(path.join(repoRoot, 'assets/js/nostralab-visitas.js'), 'utf8');
  assert.match(js, /sessionStorage/);
  assert.match(js, /crypto\.randomUUID/);
  assert.match(js, /data\.total/);
  assert.doesNotMatch(js, /Math\.random/);
  assert.doesNotMatch(js, /localStorage/);
});
