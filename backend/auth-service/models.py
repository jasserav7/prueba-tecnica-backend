from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    ADMIN  = "ADMIN"
    CLIENT = "CLIENT"

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(60), unique=True, nullable=False, index=True)
    name       = Column(String(120), nullable=False)
    password   = Column(String(255), nullable=False)
    role       = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.CLIENT)
    created_at = Column(DateTime, server_default=func.now())
