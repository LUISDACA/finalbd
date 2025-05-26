from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Categoria(Base):
    __tablename__ = "Categoria"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), unique=True, nullable=False)

class Proveedor(Base):
    __tablename__ = "Proveedor"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))

class Producto(Base):
    __tablename__ = "Producto"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    precio = Column(DECIMAL(10, 2), nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    categoria_id = Column(Integer, ForeignKey("Categoria.id"))
    proveedor_id = Column(Integer, ForeignKey("Proveedor.id"))

class Compra(Base):
    __tablename__ = "Compra"
    id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("Producto.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    cliente = Column(String(100), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

class Venta(Base):
    __tablename__ = "Venta"
    id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("Producto.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    cliente = Column(String(100), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    producto = relationship("Producto")
