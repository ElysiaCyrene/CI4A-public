// Derive runtime JS from the selected MaterialX source; do not use stale Autocomplete tarballs.
import { transformSync } from '@babel/core';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const packages = ['mui-material', 'mui-system', 'mui-utils', 'mui-private-theming', 'mui-styled-engine'];
let count = 0;
function walk(src, dest) {
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (['node_modules', '__tests__', 'test', 'build'].includes(entry.name)) continue;
    const from = join(src, entry.name), to = join(dest, entry.name);
    if (entry.isDirectory()) { walk(from, to); continue; }
    if (/\.(test|spec)\./.test(entry.name)) continue;
    mkdirSync(dirname(to), { recursive: true });
    if (entry.name.endsWith('.js')) {
      const result = transformSync(readFileSync(from, 'utf8'), { filename: from, configFile: false, babelrc: false, presets: [['@babel/preset-react', { runtime: 'automatic' }]] });
      writeFileSync(to, result.code + '\n');
      count++;
    } else copyFileSync(from, to);
  }
}
for (const pkg of packages) walk(join(root, 'MaterialX/packages', pkg, 'src'), join(root, 'runtime-packages', pkg, 'src'));
console.log(`Built ${count} MaterialX JavaScript modules from source.`);
