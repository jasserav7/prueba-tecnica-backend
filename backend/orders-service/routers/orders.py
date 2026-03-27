from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem
from schemas import OrderIn, OrderOut
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    body: OrderIn,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = Order(
        user_id=int(payload["sub"]),
        subtotal=body.subtotal,
        total_iva=body.total_iva,
        total=body.total,
    )
    db.add(order)
    db.flush()  # get order.id before adding items

    for it in body.items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=it.product_id,
            product_name=it.product_name,
            unit_price=it.unit_price,
            iva_pct=it.iva_pct,
            quantity=it.quantity,
        ))

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderOut])
def list_orders(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .filter(Order.user_id == int(payload["sub"]))
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == int(payload["sub"]),
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
