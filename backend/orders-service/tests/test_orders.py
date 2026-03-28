"""
Pruebas unitarias – Orders Service
Ejecutar desde raiz: pytest backend/orders-service/tests/ -v
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
from models import StatusEnum
from database import get_db
from auth import get_current_user

client = TestClient(app)
FAKE_PAYLOAD = {"sub": "1", "role": "CLIENT"}


class FakeItem:
    id           = 1
    order_id     = 1
    product_id   = 1
    product_name = "Air Runner Pro"
    unit_price   = Decimal("320000")
    iva_pct      = Decimal("19")
    quantity     = 1


class FakeOrder:
    id         = 1
    user_id    = 1
    subtotal   = Decimal("320000")
    total_iva  = Decimal("60800")
    total      = Decimal("380800")
    status     = StatusEnum.COMPLETED
    created_at = None
    items      = [FakeItem()]


ORDER_PAYLOAD = {
    "items": [{"product_id": 1, "product_name": "Air Runner Pro",
               "unit_price": "320000", "iva_pct": "19", "quantity": 1}],
    "subtotal": "320000", "total_iva": "60800", "total": "380800",
}


def _refresh_order(obj):
    """Simula lo que SQLAlchemy hace al hacer flush+commit: rellena id y status."""
    obj.id         = 1
    obj.status     = StatusEnum.COMPLETED
    obj.created_at = None
    obj.items      = []


# ── Tests ─────────────────────────────────────────────────────
def test_create_order():
    def override():
        db = MagicMock()
        db.refresh.side_effect = _refresh_order
        yield db
    app.dependency_overrides[get_db]          = override
    app.dependency_overrides[get_current_user] = lambda: FAKE_PAYLOAD
    try:
        resp = client.post("/orders", json=ORDER_PAYLOAD,
                           headers={"Authorization": "Bearer fake_token"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 201


def test_list_orders():
    def override():
        db = MagicMock()
        db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [FakeOrder()]
        yield db
    app.dependency_overrides[get_db]          = override
    app.dependency_overrides[get_current_user] = lambda: FAKE_PAYLOAD
    try:
        resp = client.get("/orders", headers={"Authorization": "Bearer fake_token"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_order_not_found():
    def override():
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        yield db
    app.dependency_overrides[get_db]          = override
    app.dependency_overrides[get_current_user] = lambda: FAKE_PAYLOAD
    try:
        resp = client.get("/orders/999", headers={"Authorization": "Bearer fake_token"})
    finally:
        app.dependency_overrides.clear()
    assert resp.status_code == 404


def test_health():
    assert client.get("/health").json() == {"status": "ok", "service": "orders"}
