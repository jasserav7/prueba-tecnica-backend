from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Cart, CartItem
from schemas import CartItemIn, CartOut
from auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


def _get_or_create_cart(user_id: int, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=CartOut)
def get_cart(payload: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = _get_or_create_cart(int(payload["sub"]), db)
    return cart


@router.post("/items", response_model=CartOut, status_code=201)
def add_item(
    body: CartItemIn,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_or_create_cart(int(payload["sub"]), db)
    item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == body.product_id,
    ).first()
    if item:
        item.quantity += body.quantity
    else:
        item = CartItem(cart_id=cart.id, product_id=body.product_id, quantity=body.quantity)
        db.add(item)
    db.commit()
    db.refresh(cart)
    return cart


@router.put("/items/{product_id}", response_model=CartOut)
def update_item(
    product_id: int,
    body: CartItemIn,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_or_create_cart(int(payload["sub"]), db)
    item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product not in cart")
    if body.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = body.quantity
    db.commit()
    db.refresh(cart)
    return cart


@router.delete("/items/{product_id}", response_model=CartOut)
def remove_item(
    product_id: int,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_or_create_cart(int(payload["sub"]), db)
    item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product_id,
    ).first()
    if item:
        db.delete(item)
        db.commit()
    db.refresh(cart)
    return cart


@router.delete("", status_code=204)
def clear_cart(payload: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == int(payload["sub"])).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
