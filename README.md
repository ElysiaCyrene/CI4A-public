# CI4A: Eous and three component-based WebArena environments

This repository contains Eous, the AntDX / MaterialX / ElementX component libraries, and a WebArena frontend for each library. It also includes three small component playgrounds and exactly **five WebArena example tasks**.

[中文说明](README-zh_CN.md) · [Release audit](docs/RELEASE_AUDIT.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)

## Contents

| Path | Purpose |
|---|---|
| `Eous/` | Agent, Citlali runtime, perception, action execution, and unified CLI |
| `AntDX/`, `MaterialX/`, `ElementX/` | Library source trees, tests, build tooling, and upstream documentation |
| `runtime-packages/` | Local distributable packages used by the runnable workspace |
| `WebArenaX/` | AntDX frontend and shared MySQL-backed API |
| `WebArenaX-MaterialX/`, `WebArenaX-ElementX/` | MaterialX and ElementX frontends |
| `examples/components/` | Three standalone component playgrounds |
| `tasks/webarena/` | Example tasks 0, 1, 11, 107, 108 only |

No private database, login state, model key, execution trace, original Git history, baseline, admin application, or Traccar application is included. Upstream dependency lockfiles and license notices are retained. Generated site exports, old package archives, local deployment configuration and redundant task copies are excluded.

## Install

Requirements: Node.js 22.12+, pnpm 10.28.0, and Python 3.11+. The current validation uses Windows, Node 24 and Python 3.13; other platforms have not been independently validated.

```powershell
# From the repository root, Windows:
powershell -NoProfile -File scripts/setup.ps1
pnpm dev:components
```

On Linux/macOS, use `bash scripts/setup.sh` (not independently tested). The setup installs dependencies, builds the MaterialX runtime, installs Chromium, and copies `.env.example` to `.env` if necessary. No model is called during setup.

Component playgrounds: http://127.0.0.1:5283/ (AntDX), http://127.0.0.1:5284/ (MaterialX), http://127.0.0.1:5285/ (ElementX).

## Run WebArena

The frontends require the shared API and a compatible Magento/WebArena database. **No database snapshot is published:** recovered databases may contain personal data, credentials or experimental state. Bring a database you are authorized to use and configure `DB_*` in your ignored `.env`.

For a new isolated Docker database, place your own uncompressed SQL dump at `data/private/bootstrap.sql`, set non-empty `DB_PASSWORD` and `MYSQL_ROOT_PASSWORD`, then run `docker compose up -d mysql`. The dump is imported only when the Docker data volume is first initialized. Docker is an optional path and has not been tested in the current Windows environment. Do not point this at a production database.

```powershell
pnpm dev:webarena
# Or start all six frontends plus the API:
pnpm dev
```

WebArena: http://127.0.0.1:5273/ (AntDX), http://127.0.0.1:5274/ (MaterialX), http://127.0.0.1:5275/ (ElementX). API health: http://127.0.0.1:5000/api/health. The API reports unavailable when the database is missing; it does not substitute fabricated results. All default app listeners bind to loopback. These are research environments, not hardened public hosting services.

## Run Eous

Set `EOUS_API_KEY`, `EOUS_API_BASE`, and `EOUS_MODEL` in `.env` for actual model calls. Runs send page observations to the configured model provider and can incur provider charges. Keep generated logs and screenshots private.

```powershell
# No model call: check perception on a component playground.
.\.venv\Scripts\python.exe Eous/run.py --library materialx --probe --headless

# Run one of the five WebArena examples; requires a working database.
.\.venv\Scripts\python.exe Eous/run.py --library antdx --target webarena --task-id 0 --headless

# Select another library / use structure mode.
.\.venv\Scripts\python.exe Eous/run.py --library elementx --target webarena --task-id 11 --mode structure --headless
```

On Linux/macOS, use `.venv/bin/python`. Outputs go to ignored `runs/`. Actual agent logs are in `log/eous_sys_log.log` within each run. `--probe` never calls a model. Runtime completion is **not** benchmark evaluation: `benchmark_evaluated` stays false.

The five examples preserve the original query intents and reference answers. Only their start URL and login-state metadata were adapted to these reconstructed applications. Answers depend on the supplied dataset. A previous local dataset produced an answer different from task 0's reference; do not treat these examples as guaranteed passing benchmarks or use them to claim the paper's scores.

## Checks

```powershell
pnpm build
pnpm smoke
.\.venv\Scripts\python.exe -m unittest discover -s tests
python scripts/release_audit.py
```

Smoke requires the corresponding local environments to be running. Stop dev services before `node scripts/dev.mjs --preview`; it serves the production builds. Full upstream component test suites and the full original task set are outside this release validation.

## Licensing and publication

See `THIRD_PARTY_NOTICES.md`. Existing third-party license texts remain authoritative. This repository does not invent a new blanket license for the CI4A/Eous additions; publishing source does not by itself grant a new open-source license. An explicit project license can be added by the rights holder separately.

Before publishing, run the release audit and a secret scanner on the exact staged files. Never force-add `.env`, `data/private`, `.local`, `runs`, dependency directories, or local audit reports. This release uses fresh Git history without private development commits. The public repository is https://github.com/ElysiaCyrene/CI4A-public. Setup commands do not upload files.
