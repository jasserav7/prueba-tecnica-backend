#!/usr/bin/env bash
# Arranca los 4 microservicios Stryde en background.
# Ctrl+C los detiene a todos.

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
trap "echo ''; echo 'Deteniendo servicios...'; kill 0" SIGINT SIGTERM EXIT

echo "Arrancando microservicios Stryde..."

(cd "$ROOT/backend/auth-service"    && uvicorn main:app --port 8000 --reload) &
(cd "$ROOT/backend/catalog-service" && uvicorn main:app --port 8001 --reload) &
(cd "$ROOT/backend/cart-service"    && uvicorn main:app --port 8002 --reload) &
(cd "$ROOT/backend/orders-service"  && uvicorn main:app --port 8003 --reload) &

echo ""
echo "  Auth:    http://localhost:8000"
echo "  Catalog: http://localhost:8001"
echo "  Cart:    http://localhost:8002"
echo "  Orders:  http://localhost:8003"
echo ""
echo "Ctrl+C para detener todo."
echo ""

wait
