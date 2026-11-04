$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $repoRoot
try {
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw 'JavaScript dependency installation failed' }
    pnpm build:materialx
    if ($LASTEXITCODE -ne 0) { throw 'MaterialX build failed' }
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'Python environment creation failed' }
    & .\.venv\Scripts\python.exe -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw 'Python dependency installation failed' }
    & .\.venv\Scripts\python.exe -m playwright install chromium
    if ($LASTEXITCODE -ne 0) { throw 'Chromium installation failed' }
    if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
    Write-Host 'Ready. Run pnpm dev:components. Configure .env for WebArena/MySQL and model calls.'
} finally { Pop-Location }
