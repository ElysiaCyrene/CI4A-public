#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm install --frozen-lockfile
pnpm build:materialx
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install --with-deps chromium
if [ ! -f .env ]; then cp .env.example .env; fi
echo 'Ready. Run pnpm dev:components. Configure .env for WebArena/MySQL and model calls.'
