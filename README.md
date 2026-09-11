# STRYDE Footwear – Backend

Arquitectura de microservicios con **FastAPI + MySQL**.

## Estructura

```
backend/
├── auth-service/     → Puerto 8000  (login, JWT)
├── catalog-service/  → Puerto 8001  (categorías, productos)
├── cart-service/     → Puerto 8002  (carrito)
└── orders-service/   → Puerto 8003  (pedidos)
```

## Requisitos previos

- Python 3.11+
- MySQL 8.0+ con la base de datos `stryde_db` creada

## Instalación rápida

```bash
# 1. Importar la base de datos
mysql -u root -p < database/stryde_db.sql

# 2. Configurar variables de entorno en cada servicio
#    Copiar .env.example a .env y poner tu contraseña MySQL
#    (JWT_SECRET_KEY debe ser el mismo valor en los 4 servicios)

# 3. Instalar dependencias (repetir para cada servicio)
cd backend/auth-service
pip install -r requirements.txt

cd ../catalog-service
pip install -r requirements.txt

cd ../cart-service
pip install -r requirements.txt

cd ../orders-service
pip install -r requirements.txt

# 4. Generar hash de contraseña del admin
cd backend/auth-service
python ../../database/seed.py
```

## Iniciar los servicios

Abrir **4 terminales**, una por servicio:

```bash
# Terminal 1 – Auth
cd backend/auth-service && python -m uvicorn main:app --port 8000 --reload

# Terminal 2 – Catalog
cd backend/catalog-service && python -m uvicorn main:app --port 8001 --reload

# Terminal 3 – Cart
cd backend/cart-service && python -m uvicorn main:app --port 8002 --reload

# Terminal 4 – Orders
cd backend/orders-service && python -m uvicorn main:app --port 8003 --reload

# PRUEBAS UNITARIAS
```

## Frontend

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Requiere Node.js 20+.

## Windows: levantar todo con un script

`start_all.ps1` espera un entorno virtual en `.venv` (en la raíz del proyecto) con las dependencias de los 4 servicios ya instaladas:

```powershell
python -m venv .venv
.venv\Scripts\pip install -r backend\auth-service\requirements.txt -r backend\catalog-service\requirements.txt -r backend\cart-service\requirements.txt -r backend\orders-service\requirements.txt

powershell -ExecutionPolicy Bypass -File setup_db.ps1   # importa la BD (opcional si ya la importaste a mano)
powershell -ExecutionPolicy Bypass -File start_all.ps1  # levanta los 4 servicios + frontend
```

## Documentación automática (Swagger)

| Servicio | URL                        |
| -------- | -------------------------- |
| Auth     | http://localhost:8000/docs |
| Catalog  | http://localhost:8001/docs |
| Cart     | http://localhost:8002/docs |
| Orders   | http://localhost:8003/docs |

## Ejecutar pruebas

```bash
python -m pytest backend/auth-service/tests/ backend/catalog-service/tests/ backend/cart-service/tests/ backend/orders-service/tests/ -v
```
