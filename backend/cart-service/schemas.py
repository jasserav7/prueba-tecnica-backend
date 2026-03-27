from pydantic import BaseModel
from typing import List

class CartItemIn(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemOut(BaseModel):
    product_id: int
    quantity: int
    model_config = {"from_attributes": True}

class CartOut(BaseModel):
    id: int
    user_id: int
    items: List[CartItemOut] = []
    model_config = {"from_attributes": True}
