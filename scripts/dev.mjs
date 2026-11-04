import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createServer } from 'node:net';
import dotenv from 'dotenv';

const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: resolve(root, '.env'), quiet: true });
const mode = process.argv.slice(2).find(arg => !arg.startsWith('--')) || 'all';
const preview = process.argv.includes('--preview');
if (!['all', 'components', 'webarena'].includes(mode)) throw new Error('Use all, components, or webarena');
const webPort = Number(process.env.WEBARENA_PORT || 5273);
const componentPort = Number(process.env.COMPONENT_PORT || 5283);
const apps = [];
if (mode !== 'components') {
  apps.push(['API', null, Number(process.env.API_PORT || 5000)]);
  apps.push(['AntDX WebArena', 'WebArenaX', webPort], ['MaterialX WebArena', 'WebArenaX-MaterialX', webPort+1], ['ElementX WebArena', 'WebArenaX-ElementX', webPort+2]);
}
if (mode !== 'webarena') {
  apps.push(['AntDX components', 'examples/components/antdx', componentPort], ['MaterialX components', 'examples/components/materialx', componentPort+1], ['ElementX components', 'examples/components/elementx', componentPort+2]);
}
// Check every port before launching any service: don't silently switch to a different URL.
for (const [name, , port] of apps) {
  await new Promise((yes, no) => {
    const probe = createServer();
    probe.once('error', () => no(new Error(`${name}: port ${port} is occupied. Stop the existing server first.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(yes));
  });
}
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const [name, folder, port] of apps) {
  const args = folder
    ? [resolve(root, 'node_modules/vite/bin/vite.js'), ...(preview ? ['preview'] : []), '--host', '127.0.0.1', '--port', String(port), '--strictPort']
    : [resolve(root, 'WebArenaX/server/index.js')];
  const child = spawn(process.execPath, args, { cwd: folder ? resolve(root, folder) : root, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', (error) => { console.error(error.message); stop(1); });
  child.on('exit', (code) => { if (!stopping) { console.error(`${name} exited (${code}). Stopping the other services.`); stop(code || 1); } });
  console.log(`${name}: http://127.0.0.1:${port}`);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
