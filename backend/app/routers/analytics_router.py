from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.repositories.analytics_repository import (
    productos_mas_vendidos_por_categoria,
    stock_por_proveedor_categoria,
    productos_con_stock_bajo,
    ventas_mensuales_por_cliente
)
from app.schemas.schemas import (
    ProductoVendidosOut,
    StockPorProveedorOut,
    ProductoStockBajoOut,
    VentasMensualesOut
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/analytics/mas-vendidos", response_model=list[ProductoVendidosOut])
def mas_vendidos(db: Session = Depends(get_db)):
    return productos_mas_vendidos_por_categoria(db)

@router.get("/analytics/stock-por-proveedor", response_model=list[StockPorProveedorOut])
def stock_proveedor_categoria(db: Session = Depends(get_db)):
    return stock_por_proveedor_categoria(db)

@router.get("/analytics/stock-bajo", response_model=list[ProductoStockBajoOut])
def stock_bajo(db: Session = Depends(get_db)):
    return productos_con_stock_bajo(db)

@router.get("/analytics/ventas-mensuales", response_model=list[VentasMensualesOut])
def ventas_mensuales(mes: str = Query(None), db: Session = Depends(get_db)):
    return ventas_mensuales_por_cliente(db, mes)
