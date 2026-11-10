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

test('toda experiencia pública tiene su página de compartir sin cambiar el simulador', () => {
  for (const exp of catalog.experiencias.filter(x => x.publicado === true)) {
    const share = 'experiencias/' + exp.id + '/compartir.html';
    assert.equal(exp.compartir, share, 'campo compartir: ' + exp.id);
    const file = path.join(repoRoot, 'nostralab', share);
    assert.ok(fs.existsSync(file), 'falta compartir.html: ' + exp.id);
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:card"/);
    assert.match(html, /location\.replace/);
  }
});

test('las versiones públicas pueden avanzar sin cambiar el ID ni reiniciar las visitas', () => {
  const viewer = fs.readFileSync(path.join(repoRoot, 'nostralab/laboratorio.html'), 'utf8');
  assert.match(viewer, /function rutaPublicadaValida/);
  for (const lab of catalog.experiencias.filter(x => x.publicado === true)) {
    const normal = 'experiencias/' + lab.id + '/index.html';
    const route = lab.ruta;
    assert.match(route, /^experiencias\/[a-z0-9-]+\/index\.html$/);
    if (route !== normal) {
      const baseId = lab.id.replace(/-v[0-9]+$/, '');
      const routeId = route.split('/')[1].replace(/-v[0-9]+$/, '');
      assert.notEqual(baseId, lab.id, 'requiere identificador histórico versionado');
      assert.equal(routeId, baseId, 'la ruta nueva debe ser del mismo proyecto');
      assert.ok(lab.version_anterior && lab.version_anterior.sha256, 'conservar trazabilidad');
      assert.ok(fs.existsSync(path.join(repoRoot, 'nostralab', lab.version_anterior.ruta)), 'mantener HTML anterior');
    }
    assert.ok(fs.existsSync(path.join(repoRoot, 'nostralab', route)), 'falta HTML publicado: ' + lab.id);
    assert.match(lab.sha256, /^[0-9a-f]{64}$/);
  }
});

test('el catálogo incluye todas las experiencias publicadas aunque cambie la versión', () => {
  const vm = require('node:vm');
  const html = fs.readFileSync(path.join(repoRoot, 'nostralab/index.html'), 'utf8');
  const match = html.match(/function safe\(entry\)\{[\s\S]*?\n\}/);
  assert.ok(match, 'el catálogo debe conservar un filtro safe auditable');
  const safe = vm.runInNewContext('(' + match[0] + ')', {
    allowed: new Set(['Física', 'Química', 'Biología', 'Matemática'])
  });
  const published = catalog.experiencias.filter(x => x.publicado === true);
  assert.ok(published.length >= 4, 'se deben conservar como mínimo los cuatro proyectos ya publicados');
  for (const entry of published) {
    assert.equal(safe(entry), true, 'laboratorio público oculto: ' + entry.id);
  }
  const revised = published.find(x => x.id === 'circunferencia-trigonometrica-v31');
  assert.equal(revised.version, 'v32', 'versión científica publicada');
  assert.equal(safe({ ...revised, publicado: false }), false);
  assert.equal(safe({ ...revised, ruta: 'experiencias/otro-proyecto-v32/index.html' }), false);
  assert.equal(safe({ ...revised, ruta: 'experiencias/../secreto/index.html' }), false);
  assert.equal(safe({ ...revised, version_anterior: undefined }), false);
});
