from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

# ── Categories ────────────────────────────────────────────────
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# ── Products ──────────────────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    size: Optional[str] = None
    weight: Optional[str] = None
    price: Decimal
    iva: Decimal = Decimal("19.00")
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
