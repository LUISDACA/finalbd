from pydantic import BaseModel
from typing import Optional

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    categoria_id: int
    proveedor_id: int

class ProductoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    categoria: str
    proveedor: str
    class Config:
        from_attributes = True

class ProductoVendidosOut(BaseModel):
    categoria: str
    producto: str
    total_vendido: int

class StockPorProveedorOut(BaseModel):
    proveedor: str
    categoria: str
    stock_total: int

class ProductoStockBajoOut(BaseModel):
    nombre: str
    stock: int

class VentasMensualesOut(BaseModel):
    cliente: str
    mes: str
    total_comprado: int
