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
