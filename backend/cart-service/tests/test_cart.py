"""
Pruebas unitarias – Cart Service
Ejecutar desde raiz: pytest backend/cart-service/tests/ -v
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
from database import get_db
from auth import get_current_user

client = TestClient(app)
FAKE_PAYLOAD = {"sub": "1", "role": "CLIENT"}


class FakeCart:
    id         = 1
    user_id    = 1
    created_at = None
    items      = []


def _refresh_with_id(obj):
    if not getattr(obj, "id", None):
        obj.id = 1
    if not hasattr(obj, "items"):
        obj.items = []


# ── Tests ─────────────────────────────────────────────────────
def test_get_cart_creates_if_missing():
    def override():
        db = MagicMock()
        # first() devuelve None -> el router crea un nuevo Cart
        db.query.return_value.filter.return_value.first.return_value = None
        db.refresh.side_effect = _refresh_with_id
        yield db
    app.dependency_overrides[get_db]          = override
    app.dependency_overrides[get_current_user] = lambda: FAKE_PAYLOAD
    try:
        resp = client.get("/cart", headers={"Authorization": "Bearer fake_token"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 200


def test_add_item():
    def override():
        db = MagicMock()
        cart = FakeCart()
        # primer first() -> cart existente; segundo -> CartItem aun no existe
        db.query.return_value.filter.return_value.first.side_effect = [cart, None]
        db.refresh.side_effect = _refresh_with_id
        yield db
    app.dependency_overrides[get_db]          = override
    app.dependency_overrides[get_current_user] = lambda: FAKE_PAYLOAD
    try:
        resp = client.post(
            "/cart/items",
            json={"product_id": 1, "quantity": 2},
            headers={"Authorization": "Bearer fake_token"},
        )
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 201


def test_remove_item_not_in_cart():
    def override():
        db = MagicMock()
        cart = FakeCart()
        # primer first() -> cart; segundo -> item no existe (nada que borrar)
        db.query.return_value.filter.return_value.first.side_effect = [cart, None]
        db.refresh.side_effect = _refresh_with_id
        yield db
    app.dependency_overrides[get_db]          = override
    app.dependency_overrides[get_current_user] = lambda: FAKE_PAYLOAD
    try:
        resp = client.delete("/cart/items/999", headers={"Authorization": "Bearer fake_token"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 200


def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "cart"}
