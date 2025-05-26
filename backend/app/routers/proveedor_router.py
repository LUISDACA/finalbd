from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.models import Proveedor
from app.database import SessionLocal
from pydantic import BaseModel

router = APIRouter()

class ProveedorIn(BaseModel):
    nombre: str
    telefono: str | None = None
    email: str | None = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/proveedores")
def crear_proveedor(prov: ProveedorIn, db: Session = Depends(get_db)):
    nuevo = Proveedor(**prov.model_dump())
    db.add(nuevo)
    db.commit()
    return {"mensaje": "Proveedor guardado"}

@router.get("/proveedores")
def listar_proveedores(db: Session = Depends(get_db)):
    return db.query(Proveedor).all()
