"""
Pruebas unitarias – Catalog Service
Ejecutar: cd backend/catalog-service && pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from decimal import Decimal
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)

# ── Fake data ─────────────────────────────────────────────────
class FakeCat:
    id = 1; name = "Deportivo"; description = "Calzado deportivo"; created_at = None

class FakeProd:
    id = 1; name = "Air Runner Pro"; description = "Test"; image_url = None
    size = "38-46"; weight = "280g"; price = Decimal("320000"); iva = Decimal("19")
    category_id = 1; created_at = None

# ── Categories ────────────────────────────────────────────────
@patch("routers.categories.get_db")
def test_list_categories(mock_db):
    db = MagicMock()
    db.query.return_value.all.return_value = [FakeCat()]
    mock_db.return_value = iter([db])
    resp = client.get("/categories")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

@patch("routers.categories.get_db")
@patch("routers.categories.require_admin", return_value={"sub": "1", "role": "ADMIN"})
def test_create_category(mock_admin, mock_db):
    db = MagicMock()
    db.refresh.side_effect = lambda obj: setattr(obj, "id", 1) or setattr(obj, "created_at", None)
    mock_db.return_value = iter([db])
    resp = client.post(
        "/categories",
        json={"name": "Nueva Cat", "description": "Desc"},
        headers={"Authorization": "Bearer fake_token"},
    )
    assert resp.status_code == 201

# ── Products ──────────────────────────────────────────────────
@patch("routers.products.get_db")
def test_list_products(mock_db):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [FakeProd()]
    db.query.return_value.all.return_value = [FakeProd()]
    mock_db.return_value = iter([db])
    resp = client.get("/products")
    assert resp.status_code == 200

@patch("routers.products.get_db")
def test_get_product_not_found(mock_db):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    mock_db.return_value = iter([db])
    resp = client.get("/products/999")
    assert resp.status_code == 404

def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "catalog"}
