from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from enum import Enum

class StatusEnum(str, Enum):
    PENDING   = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class OrderItemIn(BaseModel):
    product_id:   int
    product_name: str
    unit_price:   Decimal
    iva_pct:      Decimal
    quantity:     int

class OrderIn(BaseModel):
    items:     List[OrderItemIn]
    subtotal:  Decimal
    total_iva: Decimal
    total:     Decimal

class OrderItemOut(BaseModel):
    id:           int
    product_id:   Optional[int] = None
    product_name: str
    unit_price:   Decimal
    iva_pct:      Decimal
    quantity:     int
    model_config = {"from_attributes": True}

class OrderOut(BaseModel):
    id:         int
    user_id:    int
    subtotal:   Decimal
    total_iva:  Decimal
    total:      Decimal
    status:     StatusEnum
    created_at: Optional[datetime] = None
    items:      List[OrderItemOut] = []
    model_config = {"from_attributes": True}
