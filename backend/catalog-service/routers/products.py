from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import ProductCreate, ProductOut
from auth import require_admin
from typing import List, Optional

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Product)
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    return q.all()


@router.get("/{prod_id}", response_model=ProductOut)
def get_product(prod_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    p = Product(**body.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{prod_id}", response_model=ProductOut)
def update_product(
    prod_id: int,
    body: ProductCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    p = db.query(Product).filter(Product.id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{prod_id}", status_code=204)
def delete_product(
    prod_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    p = db.query(Product).filter(Product.id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
