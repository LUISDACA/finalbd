from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.models.models import Venta, Producto
from app.database import SessionLocal
from pydantic import BaseModel
from sqlalchemy import func

router = APIRouter()

class VentaIn(BaseModel):
    producto_id: int
    cantidad: int
    cliente: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/ventas")
def registrar_venta(venta: VentaIn, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == venta.producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.stock < venta.cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Solo hay {producto.stock} unidades disponibles."
        )

    nueva_venta = Venta(
        producto_id=venta.producto_id,
        cantidad=venta.cantidad,
        cliente=venta.cliente
    )
    producto.stock -= venta.cantidad

    db.add(nueva_venta)
    db.commit()
    return {"mensaje": "Venta registrada correctamente"}

@router.get("/ventas")
def obtener_ventas(mes: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(Venta).options(joinedload(Venta.producto))

    if mes:
        query = query.filter(func.date_format(Venta.fecha, "%Y-%m") == mes)

    ventas = query.all()

    return [
        {
            "producto": v.producto.nombre,
            "cantidad": v.cantidad,
            "cliente": v.cliente,
            "fecha": v.fecha.strftime("%Y-%m-%d %H:%M")
        }
        for v in ventas
    ]
