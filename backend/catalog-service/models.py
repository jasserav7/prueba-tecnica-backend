from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    description = Column(Text)
    created_at  = Column(DateTime, server_default=func.now())

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(150), nullable=False)
    description = Column(Text)
    image_url   = Column(String(500))
    size        = Column(String(30))
    weight      = Column(String(20))
    price       = Column(Numeric(12, 2), nullable=False)
    iva         = Column(Numeric(5, 2), nullable=False, default=19.00)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    created_at  = Column(DateTime, server_default=func.now())

    category = relationship("Category", back_populates="products")
