"""Audit Git-visible release files without printing credential values.

Run from any directory. This is a structural/privacy guard, not a substitute
for a full secret scanner or a review of newly introduced data and media.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_TASKS = {f'tasks/webarena/{n}.json' for n in (0, 1, 11, 107, 108)}
PRIVATE_PARTS = {'.git', '.local', '.auth', '.venv', 'node_modules', '__pycache__',
                 'runs', 'artifacts', 'task_config', 'admin_task', 'traccar_tasks'}
PRIVATE_SUFFIXES = {'.sql', '.gz', '.zip', '.tgz', '.db', '.sqlite', '.sqlite3',
                    '.pem', '.key', '.p12', '.pfx', '.har', '.log', '.pyc', '.bak'}
PATTERNS = {
    'private-key': re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
    'provider-key': re.compile(rb'(?<![\w-])(?:sk-(?:proj-)?[A-Za-z0-9_-]{32,}|gh[pousr]_[A-Za-z0-9]{30,})(?![\w-])'),
    'local-user-path': re.compile(rb'(?:[A-Z]:[\\/](?:Users|Documents and Settings)[\\/][^\s\"\x27<>]+|(?<![.\w])/' + b'Users' + rb'/[^/\s]+/)', re.I),
}


def candidate_paths():
    result = subprocess.run(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
                            cwd=ROOT, check=True, stdout=subprocess.PIPE)
    return sorted({p.decode('utf-8') for p in result.stdout.split(b'\0') if p})


def main():
    paths = candidate_paths()
    failures = []
    total = 0
    actual_tasks = {p for p in paths if p.startswith('tasks/') and p.endswith('.json')}
    if actual_tasks != EXPECTED_TASKS:
        failures.append(('tasks', 'Expected exactly WebArena examples 0,1,11,107,108'))
    for name in paths:
        rel = Path(name)
        p = ROOT / rel
        if p.is_symlink():
            failures.append((name, 'symlink is not an audited release input'))
            continue
        if not p.is_file():
            failures.append((name, 'missing or non-file Git input'))
            continue
        if set(rel.parts) & PRIVATE_PARTS or p.suffix.lower() in PRIVATE_SUFFIXES:
            failures.append((name, 'private/generated file'))
        if p.name.startswith('.env') and p.name != '.env.example':
            failures.append((name, 'non-template environment file'))
        if name.startswith(('baselines/', 'evaluation/', 'examples/antdv-admin', 'examples/traccar')):
            failures.append((name, 'out-of-scope application or experiment'))
        if name.startswith('data/private/') and p.name != '.gitkeep':
            failures.append((name, 'private database input'))
        data = p.read_bytes()
        total += len(data)
        if len(data) >= 50 * 1024 * 1024:
            failures.append((name, 'file exceeds release size policy (50 MiB)'))
        for label, pattern in PATTERNS.items():
            if pattern.search(data):
                failures.append((name, label))
        if p.suffix == '.json':
            try:
                obj = json.loads(data)
            except (ValueError, UnicodeError):
                continue  # Upstream JSONC fixtures are permitted.
            if isinstance(obj, dict) and 'task_id' in obj and 'intent' in obj:
                if name not in EXPECTED_TASKS:
                    failures.append((name, 'unexpected embedded task'))
                elif obj.get('storage_state') is not None:
                    failures.append((name, 'example references private login state'))
    for required in ['AntDX/LICENSE', 'MaterialX/LICENSE', 'ElementX/LICENSE', 'README.md',
                     'Eous/run.py', '.env.example', 'pnpm-lock.yaml']:
        if required not in paths:
            failures.append((required, 'required release file absent or ignored'))
    print(json.dumps({'candidate_files': len(paths), 'candidate_bytes': total,
                      'example_tasks': sorted(actual_tasks), 'findings': failures}, indent=2))
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
