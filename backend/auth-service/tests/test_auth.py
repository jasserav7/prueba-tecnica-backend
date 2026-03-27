"""
Pruebas unitarias – Auth Service
Ejecutar: cd backend/auth-service && pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from auth import hash_password, verify_password, create_access_token, decode_token

client = TestClient(app)

# ── Helpers ──────────────────────────────────────────────────
class FakeUser:
    id = 1; username = "admin"; name = "Administrador"
    password = hash_password("admin123")
    role = type("R", (), {"value": "ADMIN"})()
    created_at = None

# ── Unit tests: utilidades JWT y bcrypt ───────────────────────
def test_hash_and_verify_password():
    hashed = hash_password("mi_clave_123")
    assert verify_password("mi_clave_123", hashed)
    assert not verify_password("clave_incorrecta", hashed)

def test_create_and_decode_token():
    token = create_access_token({"sub": "1", "role": "ADMIN"})
    payload = decode_token(token)
    assert payload["sub"] == "1"
    assert payload["role"] == "ADMIN"

def test_decode_invalid_token():
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        decode_token("token.invalido.xxx")
    assert exc.value.status_code == 401

# ── Integration tests: endpoints ─────────────────────────────
@patch("routers.auth.get_db")
def test_login_success(mock_get_db):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = FakeUser()
    mock_get_db.return_value = iter([db])

    resp = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"

@patch("routers.auth.get_db")
def test_login_wrong_password(mock_get_db):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = FakeUser()
    mock_get_db.return_value = iter([db])

    resp = client.post("/auth/login", json={"username": "admin", "password": "wrong"})
    assert resp.status_code == 401

@patch("routers.auth.get_db")
def test_login_user_not_found(mock_get_db):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    mock_get_db.return_value = iter([db])

    resp = client.post("/auth/login", json={"username": "nobody", "password": "x"})
    assert resp.status_code == 401

def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "auth"}
