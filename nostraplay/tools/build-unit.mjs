#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2];
if (!source) {
  console.error('Uso: node nostraplay/tools/build-unit.mjs ruta/al/nostraplay.ts');
  process.exit(1);
}

const abs = path.resolve(source);
const text = fs.readFileSync(abs, 'utf8');
if (!/^\s*export\s+default\s+\{/m.test(text)) {
  console.error('nostraplay.ts debe exportar un objeto con `export default { ... }`.');
  process.exit(1);
}

const runtime = text.replace(/^\s*export\s+default\s+/m, 'window.__NOSTRAPLAY_UNIT__ = ');
const out = path.join(path.dirname(abs), 'nostraplay.js');
fs.writeFileSync(out, runtime, 'utf8');
console.log(`Generado: ${out}`);
