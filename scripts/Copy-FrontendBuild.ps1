# Copies dist/ into Portfolio.Api/wwwroot of the backend repository, only for the integrated local preview.
# wwwroot is a generated folder ignored by Git in the backend; this script never touches anything else there.
param([string]$BackendPath = (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) 'Mi Web Back'))
$ErrorActionPreference = 'Stop'
$frontendPath = Split-Path -Parent $PSScriptRoot
$sourcePath = [System.IO.Path]::GetFullPath((Join-Path $frontendPath 'dist'))
if (-not (Test-Path -LiteralPath (Join-Path $sourcePath 'index.html'))) {
    throw 'No existe dist/index.html. Compila con npm run build antes de preparar la vista local.'
}
if (-not (Test-Path -LiteralPath (Join-Path $BackendPath 'Portfolio.Api/Portfolio.Api.csproj'))) {
    throw "No se encuentra el backend en $BackendPath. Indica su carpeta con -BackendPath."
}

$backendRoot = (Resolve-Path -LiteralPath $BackendPath).Path
$apiPath = (Resolve-Path -LiteralPath (Join-Path $backendRoot 'Portfolio.Api')).Path
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path $apiPath 'wwwroot'))

# Verify the exact target before replacing it, and reject filesystem redirects.
$backendPrefix = [System.IO.Path]::GetFullPath($backendRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$isInsideBackend = $destinationPath.StartsWith($backendPrefix, [System.StringComparison]::OrdinalIgnoreCase)
$isExpectedDestination = $destinationPath -eq (Join-Path $apiPath 'wwwroot')
if (-not $isInsideBackend -or -not $isExpectedDestination) {
    throw 'La carpeta de destino de la vista local no es válida.'
}
if (Test-Path -LiteralPath $destinationPath) {
    $destination = Get-Item -LiteralPath $destinationPath
    if ($destination.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        throw 'No se permite reemplazar una carpeta wwwroot redirigida.'
    }
    Remove-Item -LiteralPath $destinationPath -Recurse -Force
}
New-Item -ItemType Directory -Path $destinationPath | Out-Null
foreach ($asset in (Get-ChildItem -LiteralPath $sourcePath -Force)) {
    Copy-Item -LiteralPath $asset.FullName -Destination $destinationPath -Recurse -Force
}
