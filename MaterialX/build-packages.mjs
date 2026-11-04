// Compile MUI CI4A source packages from within the monorepo (where babel deps are available)
import { transformSync } from '@babel/core';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'fs';
import { join, relative, dirname, extname } from 'path';
import { fileURLToPath } from 'node:url';

const packages = [
  'mui-material',
  'mui-system',
  'mui-utils',
  'mui-private-theming',
  'mui-styled-engine',
];

const baseDir = fileURLToPath(new URL('./packages/', import.meta.url));

function walkDir(dir, files = []) {
  if (!existsSync(dir)) return files;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'build' && entry.name !== 'node_modules' && entry.name !== '__tests__' && entry.name !== 'test') {
      walkDir(fullPath, files);
    } else if (entry.isFile() && /\.js$/.test(entry.name) && !/\.test\.js$/.test(entry.name) && !/\.spec\.js$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

let totalCompiled = 0;
let totalCopied = 0;

for (const pkg of packages) {
  const srcDir = join(baseDir, pkg, 'src');
  const outDir = join(baseDir, pkg, 'build');

  if (!existsSync(srcDir)) {
    console.log(`SKIP ${pkg}: no src dir`);
    continue;
  }

  console.log(`\nBuilding ${pkg}...`);
  const files = walkDir(srcDir);
  let pkgCompiled = 0;

  for (const file of files) {
    const relativePath = relative(srcDir, file);
    let outFile = join(outDir, relativePath);

    try {
      const code = readFileSync(file, 'utf8');
      const result = transformSync(code, {
        filename: file,
        configFile: false,
        sourceType: 'module',
        plugins: [],
        presets: [
          ['@babel/preset-react', { runtime: 'automatic', development: false }],
        ],
      });

      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, result.code);
      pkgCompiled++;
      totalCompiled++;

      if (totalCompiled % 200 === 0) console.log(`  ${totalCompiled} files compiled...`);
    } catch (e) {
      console.error(`  ERROR [${pkg}] ${relativePath}: ${e.message.slice(0, 150)}`);
    }
  }

  // Copy .ts/.tsx files as-is (they don't need Flow stripping)
  const tsFiles = [];
  function findTsFiles(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'build' && entry.name !== 'node_modules' && entry.name !== '__tests__') {
        findTsFiles(p);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name) && !/\.spec\./.test(entry.name)) {
        const rel = relative(srcDir, p);
        const dest = join(outDir, rel);
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(p, dest);
        totalCopied++;
      }
    }
  }
  findTsFiles(srcDir);

  console.log(`  ${pkg}: ${pkgCompiled} JS compiled, ${totalCopied} TS copied`);
}

console.log(`\n=== Done: ${totalCompiled} JS files compiled ===`);
