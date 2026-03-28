"""
Pruebas unitarias – Catalog Service
Ejecutar desde raiz: pytest backend/catalog-service/tests/ -v
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
from decimal import Decimal

from main import app
from database import get_db
from auth import require_admin

client = TestClient(app)

ADMIN_PAYLOAD = {"sub": "1", "role": "ADMIN"}


class FakeCat:
    id          = 1
    name        = "Deportivo"
    description = "Calzado deportivo"
    created_at  = None


class FakeProd:
    id          = 1
    name        = "Air Runner Pro"
    description = "Test"
    image_url   = None
    size        = "38-46"
    weight      = "280g"
    price       = Decimal("320000")
    iva         = Decimal("19")
    category_id = 1
    created_at  = None


# ── Categories ────────────────────────────────────────────────
def test_list_categories():
    def override():
        db = MagicMock()
        db.query.return_value.all.return_value = [FakeCat()]
        yield db
    app.dependency_overrides[get_db] = override
    try:
        resp = client.get("/categories")
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_create_category():
    def override():
        db = MagicMock()
        db.refresh.side_effect = lambda obj: (
            setattr(obj, "id", 1) or setattr(obj, "created_at", None)
        )
        yield db
    app.dependency_overrides[get_db]        = override
    app.dependency_overrides[require_admin] = lambda: ADMIN_PAYLOAD
    try:
        resp = client.post(
            "/categories",
            json={"name": "Nueva Cat", "description": "Desc"},
            headers={"Authorization": "Bearer fake_token"},
        )
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 201


# ── Products ──────────────────────────────────────────────────
def test_list_products():
    def override():
        db = MagicMock()
        db.query.return_value.all.return_value = [FakeProd()]
        yield db
    app.dependency_overrides[get_db] = override
    try:
        resp = client.get("/products")
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_get_product_not_found():
    def override():
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        yield db
    app.dependency_overrides[get_db] = override
    try:
        resp = client.get("/products/999")
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 404


def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "catalog"}
