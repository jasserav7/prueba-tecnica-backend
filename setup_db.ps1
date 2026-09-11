# ============================================================
#  setup_db.ps1  -  Prepara la base de datos para STRYDE
#  Uso:
#    powershell -ExecutionPolicy Bypass -File setup_db.ps1
#  Te pedira la contrasena actual de root de MySQL.
#  Crea la BD stryde_db y un usuario dedicado:
#      usuario:    stryde
#      contrasena: stryde123
#  (ese usuario es el que le pasaras a Claude)
# ============================================================

$ErrorActionPreference = "Stop"
$sqlFile = Join-Path $PSScriptRoot "database\stryde_db.sql"

$mysqlCmd = Get-Command mysql.exe -ErrorAction SilentlyContinue
if ($mysqlCmd) {
    $mysql = $mysqlCmd.Source
} else {
    $candidates = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\xampp\mysql\bin\mysql.exe",
        "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
    )
    $mysql = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $mysql)               { throw "No se encontro mysql.exe. Agrega la carpeta 'bin' de tu instalacion de MySQL/MariaDB al PATH." }
if (-not (Test-Path $sqlFile)) { throw "No se encontro $sqlFile" }

$rootPass = Read-Host "Contrasena actual de root de MySQL (Enter si esta vacia)" -AsSecureString
$rootPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPass))

# argumento de password: vacio => sin -p
$pwArg = @()
if ($rootPlain -ne "") { $pwArg = @("-p$rootPlain") }

Write-Host "`n[1/2] Importando database\stryde_db.sql ..." -ForegroundColor Cyan
Get-Content $sqlFile -Raw | & $mysql -u root @pwArg
if ($LASTEXITCODE -ne 0) { throw "Fallo el import del SQL (contrasena de root incorrecta?)" }

Write-Host "[2/2] Creando usuario 'stryde' ..." -ForegroundColor Cyan
$grant = @"
CREATE USER IF NOT EXISTS 'stryde'@'%' IDENTIFIED BY 'stryde123';
CREATE USER IF NOT EXISTS 'stryde'@'localhost' IDENTIFIED BY 'stryde123';
ALTER USER 'stryde'@'%' IDENTIFIED BY 'stryde123';
ALTER USER 'stryde'@'localhost' IDENTIFIED BY 'stryde123';
GRANT ALL PRIVILEGES ON stryde_db.* TO 'stryde'@'%';
GRANT ALL PRIVILEGES ON stryde_db.* TO 'stryde'@'localhost';
FLUSH PRIVILEGES;
"@
$grant | & $mysql -u root @pwArg
if ($LASTEXITCODE -ne 0) { throw "Fallo la creacion del usuario" }

Write-Host "`nListo. Pasale estos datos a Claude:" -ForegroundColor Green
Write-Host "  DB_USER=stryde"
Write-Host "  DB_PASSWORD=stryde123"
Write-Host "  DB_NAME=stryde_db  DB_HOST=127.0.0.1  DB_PORT=3306"
