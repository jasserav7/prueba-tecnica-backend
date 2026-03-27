"""
Pruebas unitarias – Cart Service
Ejecutar: cd backend/cart-service && pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)
AUTH_HEADER = {"Authorization": "Bearer fake_token"}
FAKE_PAYLOAD = {"sub": "1", "role": "CLIENT"}

class FakeCart:
    id = 1; user_id = 1; created_at = None; items = []

@patch("routers.cart.get_current_user", return_value=FAKE_PAYLOAD)
@patch("routers.cart.get_db")
def test_get_cart_creates_if_missing(mock_db, mock_auth):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    cart = FakeCart()
    db.refresh.side_effect = lambda obj: None
    mock_db.return_value = iter([db])
    resp = client.get("/cart", headers=AUTH_HEADER)
    assert resp.status_code == 200

@patch("routers.cart.get_current_user", return_value=FAKE_PAYLOAD)
@patch("routers.cart.get_db")
def test_add_item(mock_db, mock_auth):
    db = MagicMock()
    cart = FakeCart()
    db.query.return_value.filter.return_value.first.side_effect = [cart, None]
    db.refresh.side_effect = lambda obj: None
    mock_db.return_value = iter([db])
    resp = client.post("/cart/items", json={"product_id": 1, "quantity": 2}, headers=AUTH_HEADER)
    assert resp.status_code == 201

@patch("routers.cart.get_current_user", return_value=FAKE_PAYLOAD)
@patch("routers.cart.get_db")
def test_remove_item_not_in_cart(mock_db, mock_auth):
    db = MagicMock()
    cart = FakeCart()
    db.query.return_value.filter.return_value.first.side_effect = [cart, None]
    db.refresh.side_effect = lambda obj: None
    mock_db.return_value = iter([db])
    resp = client.delete("/cart/items/999", headers=AUTH_HEADER)
    assert resp.status_code == 200

def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "cart"}
