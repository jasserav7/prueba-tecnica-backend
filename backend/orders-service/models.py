from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class StatusEnum(str, enum.Enum):
    PENDING   = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=False)
    subtotal   = Column(Numeric(14, 2), nullable=False)
    total_iva  = Column(Numeric(14, 2), nullable=False)
    total      = Column(Numeric(14, 2), nullable=False)
    status     = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.COMPLETED)
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id           = Column(Integer, primary_key=True, index=True)
    order_id     = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id   = Column(Integer, nullable=True)
    product_name = Column(String(150), nullable=False)
    unit_price   = Column(Numeric(12, 2), nullable=False)
    iva_pct      = Column(Numeric(5, 2), nullable=False)
    quantity     = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
