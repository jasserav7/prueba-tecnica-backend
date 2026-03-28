"""
Pruebas unitarias – Auth Service
Ejecutar desde raiz: pytest backend/auth-service/tests/ -v
"""
import pytest
import sys, os

_SERVICE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_SHARED = {"models", "schemas", "main", "database", "auth", "routers"}
for _k in list(sys.modules.keys()):
    if _k.split(".")[0] in _SHARED:
        del sys.modules[_k]
sys.path[:] = [p for p in sys.path if not p.endswith("-service")]
sys.path.insert(0, _SERVICE_ROOT)

from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from main import app
from models import RoleEnum
from database import get_db
from auth import hash_password, verify_password, create_access_token, decode_token

client = TestClient(app)


class FakeUser:
    id         = 1
    username   = "admin"
    name       = "Administrador"
    password   = hash_password("admin123")
    role       = RoleEnum.ADMIN
    created_at = None


def _db_override(fake_first=None):
    """Devuelve una funcion que inyecta un db mock con .first() configurado."""
    def override():
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = fake_first
        yield db
    return override


# ── Unit tests: JWT y bcrypt ──────────────────────────────────
def test_hash_and_verify_password():
    hashed = hash_password("mi_clave_123")
    assert verify_password("mi_clave_123", hashed)
    assert not verify_password("clave_incorrecta", hashed)


def test_create_and_decode_token():
    token   = create_access_token({"sub": "1", "role": "ADMIN"})
    payload = decode_token(token)
    assert payload["sub"]  == "1"
    assert payload["role"] == "ADMIN"


def test_decode_invalid_token():
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        decode_token("token.invalido.xxx")
    assert exc.value.status_code == 401


# ── Integration tests: endpoints ──────────────────────────────
def test_login_success():
    app.dependency_overrides[get_db] = _db_override(FakeUser())
    try:
        resp = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"


def test_login_wrong_password():
    app.dependency_overrides[get_db] = _db_override(FakeUser())
    try:
        resp = client.post("/auth/login", json={"username": "admin", "password": "wrong"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 401


def test_login_user_not_found():
    app.dependency_overrides[get_db] = _db_override(None)
    try:
        resp = client.post("/auth/login", json={"username": "nobody", "password": "x"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 401


def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "auth"}
