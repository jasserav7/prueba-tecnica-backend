"""
Pruebas unitarias – Orders Service
Ejecutar: cd backend/orders-service && pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from decimal import Decimal
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)
AUTH_HEADER = {"Authorization": "Bearer fake_token"}
FAKE_PAYLOAD = {"sub": "1", "role": "ADMIN"}

class FakeItem:
    id = 1; order_id = 1; product_id = 1
    product_name = "Air Runner Pro"; unit_price = Decimal("320000")
    iva_pct = Decimal("19"); quantity = 1

class FakeOrder:
    id = 1; user_id = 1
    subtotal = Decimal("320000"); total_iva = Decimal("60800"); total = Decimal("380800")
    status = type("S", (), {"value": "COMPLETED"})()
    created_at = None; items = [FakeItem()]

ORDER_PAYLOAD = {
    "items": [{"product_id": 1, "product_name": "Air Runner Pro",
               "unit_price": "320000", "iva_pct": "19", "quantity": 1}],
    "subtotal": "320000", "total_iva": "60800", "total": "380800",
}

@patch("routers.orders.get_current_user", return_value=FAKE_PAYLOAD)
@patch("routers.orders.get_db")
def test_create_order(mock_db, mock_auth):
    db = MagicMock()
    order = FakeOrder()
    db.refresh.side_effect = lambda obj: None
    mock_db.return_value = iter([db])
    resp = client.post("/orders", json=ORDER_PAYLOAD, headers=AUTH_HEADER)
    assert resp.status_code == 201

@patch("routers.orders.get_current_user", return_value=FAKE_PAYLOAD)
@patch("routers.orders.get_db")
def test_list_orders(mock_db, mock_auth):
    db = MagicMock()
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [FakeOrder()]
    mock_db.return_value = iter([db])
    resp = client.get("/orders", headers=AUTH_HEADER)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

@patch("routers.orders.get_current_user", return_value=FAKE_PAYLOAD)
@patch("routers.orders.get_db")
def test_get_order_not_found(mock_db, mock_auth):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    mock_db.return_value = iter([db])
    resp = client.get("/orders/999", headers=AUTH_HEADER)
    assert resp.status_code == 404

def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "orders"}
