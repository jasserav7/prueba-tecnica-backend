"""
seed.py - Poblar la base de datos con datos iniciales
Ejecutar desde la raiz del proyecto:
  python database/seed.py
"""
import os, sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTH_SERVICE  = os.path.join(PROJECT_ROOT, "backend", "auth-service")
ENV_FILE      = os.path.join(AUTH_SERVICE, ".env")
sys.path.insert(0, AUTH_SERVICE)

from dotenv import load_dotenv
load_dotenv(ENV_FILE)

from sqlalchemy import create_engine, text
import bcrypt

DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "stryde_db")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
print(f"Conectando a {DB_HOST}:{DB_PORT}/{DB_NAME} como '{DB_USER}'...")

try:
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 5})
    ADMIN_HASH = bcrypt.hashpw(b"admin123", bcrypt.gensalt(12)).decode()

    with engine.connect() as conn:
        conn.execute(
            text("UPDATE users SET password = :pw WHERE username = 'admin'"),
            {"pw": ADMIN_HASH},
        )
        conn.commit()
    print("Contrasena del administrador configurada correctamente.")
    print("   usuario:    admin")
    print("   contrasena: admin123")
except Exception as e:
    print(f"Error: {e}")
    print("   MySQL corriendo? Contrasena correcta en backend/auth-service/.env?")
