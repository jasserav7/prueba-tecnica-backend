# Levanta STRYDE completo en localhost.
# Requisitos: XAMPP MySQL corriendo en 3306; .venv ya creado con deps instaladas.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$py = Join-Path $root ".venv\Scripts\python.exe"
$log = Join-Path $env:TEMP "stryde-logs"
New-Item -ItemType Directory -Force $log | Out-Null

$svcs = @{ "auth-service"=8000; "catalog-service"=8001; "cart-service"=8002; "orders-service"=8003 }
foreach ($s in $svcs.Keys) {
    $port = $svcs[$s]
    Start-Process -FilePath $py `
        -ArgumentList "-m","uvicorn","main:app","--port",$port `
        -WorkingDirectory (Join-Path $root "backend\$s") `
        -RedirectStandardOutput (Join-Path $log "$s.log") `
        -RedirectStandardError  (Join-Path $log "$s.err.log") `
        -WindowStyle Hidden
    Write-Host "  $s -> http://localhost:$port"
}

Start-Process -FilePath (Join-Path $root "node_modules\.bin\vite.cmd") `
    -ArgumentList "--port","5173" -WorkingDirectory $root `
    -RedirectStandardOutput (Join-Path $log "vite.log") `
    -RedirectStandardError  (Join-Path $log "vite.err.log") `
    -WindowStyle Hidden
Write-Host "  frontend -> http://localhost:5173"
Write-Host "`nLogs en $log"
