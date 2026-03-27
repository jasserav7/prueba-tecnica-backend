@echo off
echo Arrancando microservicios Stryde...

start "Auth"    cmd /k "cd /d %~dp0backend\auth-service    && uvicorn main:app --port 8000 --reload"
start "Catalog" cmd /k "cd /d %~dp0backend\catalog-service && uvicorn main:app --port 8001 --reload"
start "Cart"    cmd /k "cd /d %~dp0backend\cart-service    && uvicorn main:app --port 8002 --reload"
start "Orders"  cmd /k "cd /d %~dp0backend\orders-service  && uvicorn main:app --port 8003 --reload"

echo.
echo   Auth:    http://localhost:8000
echo   Catalog: http://localhost:8001
echo   Cart:    http://localhost:8002
echo   Orders:  http://localhost:8003
echo.
echo Cierra cada ventana para detener los servicios.
