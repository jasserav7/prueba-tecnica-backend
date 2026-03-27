from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import Optional

class RoleEnum(str, Enum):
    ADMIN  = "ADMIN"
    CLIENT = "CLIENT"

# ── Request schemas ──────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

# ── Response schemas ─────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    username: str
    name: str
    role: RoleEnum
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
