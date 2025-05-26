from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.models import Compra, Producto
from app.database import SessionLocal
from pydantic import BaseModel

router = APIRouter()

class CompraIn(BaseModel):
    producto_id: int
    cantidad: int
    cliente: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/compras")
def registrar_compra(compra: CompraIn, db: Session = Depends(get_db)):
    nueva = Compra(**compra.model_dump())
    db.add(nueva)
    producto = db.query(Producto).filter(Producto.id == compra.producto_id).first()
    if producto:
        producto.stock += compra.cantidad
    db.commit()
    return {"mensaje": "Compra registrada"}
