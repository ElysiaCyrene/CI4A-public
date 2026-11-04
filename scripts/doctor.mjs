import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';
const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: resolve(root, '.env'), quiet: true });
let failures = 0;
function check(label, ok, hint = '') { console.log(`${ok ? 'OK' : 'MISSING'} ${label}${ok ? '' : ': ' + hint}`); if (!ok) failures++; }
const [major,minor]=process.versions.node.split('.').map(Number);
check('Node >=22.12', major>22 || (major===22 && minor>=12), 'Install Node 22.12+');
for (const path of ['node_modules/vite/bin/vite.js', 'runtime-packages/antdx/es/_util/AgentApiRegistry.js', 'runtime-packages/mui-material/src/AgentApiRegistry/AgentApiRegistry.js', 'runtime-packages/elementx/es/utils/AgentApiRegistry.mjs', 'tasks/webarena/0.json']) {
  check(path, existsSync(resolve(root, path)), 'Run setup and check README.md');
}
const python = resolve(root, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
const py = spawnSync(python, ['-c', 'import openai,playwright,loguru,numpy,PIL; print("Python dependencies import successfully")'], { encoding: 'utf8', windowsHide: true });
check('Python dependencies', py.status === 0, 'Run python -m venv .venv, then pip install -r requirements.txt');
console.log(`Model credentials: ${process.env.EOUS_API_KEY || process.env.OPENAI_API_KEY ? 'configured (not tested)' : 'not configured; component demos and --probe still work'}`);
try {
  const response = await fetch(`http://127.0.0.1:${process.env.API_PORT || 5000}/api/health`, { signal: AbortSignal.timeout(5000) });
  const data = await response.json();
  check('WebArena database readiness', response.ok && data.database === 'ready', data.message || 'Configure your authorized private Magento/WebArena database');
} catch { check('WebArena API', false, 'Run pnpm dev:webarena; database configuration is in .env'); }
process.exitCode = failures ? 1 : 0;
