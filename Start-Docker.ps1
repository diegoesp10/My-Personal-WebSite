# Builds and starts the web container (diego-portfolio-web). If the API container is not running and the
# backend repository is next to this one, it is started first with its own script.
#   -SkipBuild     reuse the existing images
#   -BackendPath   folder of the backend repository (default: ..\Mi Web Back)
param([switch]$SkipBuild, [string]$BackendPath = (Join-Path (Split-Path $PSScriptRoot -Parent) 'Mi Web Back'))
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$dockerOs = docker info --format '{{.OSType}}'
if ($LASTEXITCODE -ne 0 -or $dockerOs -ne 'linux') { throw 'Docker Desktop debe estar iniciado con contenedores Linux.' }

$apiRunning = [bool](docker ps --filter 'name=^diego-portfolio-api$' --filter 'status=running' --format '{{.Names}}')
if (-not $apiRunning) {
    $backendScript = Join-Path $BackendPath 'Start-Docker.ps1'
    if (Test-Path -LiteralPath $backendScript) {
        Write-Host "Arrancando la API desde $BackendPath" -ForegroundColor Cyan
        & $backendScript -SkipBuild:$SkipBuild
    } else {
        Write-Warning "La API no está en marcha y no se encuentra $backendScript. La web arrancará, pero /api responderá con error hasta que la API esté disponible."
    }
}

$network = docker network ls --filter 'name=^diego-portfolio-net$' --format '{{.Name}}'
if (-not $network) {
    docker network create diego-portfolio-net | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la red diego-portfolio-net.' }
}

if (-not $SkipBuild) {
    docker compose build
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo construir la imagen de la web.' }
}
docker compose up -d --wait --wait-timeout 120
if ($LASTEXITCODE -ne 0) { throw 'La web no alcanzó un estado saludable. Consulta docker compose logs.' }
$port = if ($env:PORTFOLIO_PORT) { $env:PORTFOLIO_PORT } else { '8080' }
Write-Host "Web Docker lista: http://127.0.0.1:$port" -ForegroundColor Green
docker compose ps
