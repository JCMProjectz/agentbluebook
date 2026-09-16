// Inlines the woff2 font subsets (base64) into the artboard sources.
// Usage: node build.mjs  — reads src/*.dc.html, writes ./*.dc.html
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const f = (p) => readFileSync(join(root, 'fonts', p)).toString('base64');

const tokens = {
  __CG500__: f('cormorant-garamond-latin-500-normal.woff2'),
  __CG600__: f('cormorant-garamond-latin-600-normal.woff2'),
  __CG500I__: f('cormorant-garamond-latin-500-italic.woff2'),
  __K400__: f('karla-latin-400-normal.woff2'),
  __K700__: f('karla-latin-700-normal.woff2'),
};

for (const name of readdirSync(join(root, 'src'))) {
  if (!name.endsWith('.dc.html')) continue;
  let html = readFileSync(join(root, 'src', name), 'utf8');
  for (const [tok, b64] of Object.entries(tokens)) html = html.replaceAll(tok, b64);
  if (/__[A-Z0-9]+__/.test(html)) throw new Error(`unresolved token in ${name}`);
  writeFileSync(join(root, name), html);
  console.log(`${name}: ${(html.length / 1024).toFixed(0)} KB`);
}
