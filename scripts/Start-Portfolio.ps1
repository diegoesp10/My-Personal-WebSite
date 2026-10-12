# Integrated local preview: builds this frontend, copies it to the backend wwwroot and starts the API in
# Development on http://127.0.0.1:5080 (web and editor in a single process).
#   -SkipBuild     reuse dist/
#   -BackendPath   folder of the backend repository (default: ..\Mi Web Back)
param([switch]$SkipBuild, [string]$BackendPath = (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) 'Mi Web Back'))
$ErrorActionPreference = 'Stop'
$frontendPath = Split-Path -Parent $PSScriptRoot

if (-not $SkipBuild) {
    Push-Location -LiteralPath $frontendPath
    try {
        if (-not (Test-Path -LiteralPath 'node_modules')) {
            npm ci --no-fund
            if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias.' }
        }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'No se pudo compilar el frontal.' }
    } finally { Pop-Location }
}
& (Join-Path $PSScriptRoot 'Copy-FrontendBuild.ps1') -BackendPath $BackendPath

Write-Host 'Web: http://127.0.0.1:5080 | Editor: http://127.0.0.1:5080/editor' -ForegroundColor Green
& (Join-Path $BackendPath 'Start-Api.ps1')
