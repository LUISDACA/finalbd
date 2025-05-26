from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.schemas import ProductoOut, ProductoBase
from app.repositories.product_repository import get_all_products
from app.models.models import Producto
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/productos", response_model=list[ProductoOut])
def listar_productos(db: Session = Depends(get_db)):
    return get_all_products(db)

@router.get("/productos/raw")
def listar_productos_raw(db: Session = Depends(get_db)):
    return db.query(Producto).all()

@router.post("/productos")
def crear_producto(producto: ProductoBase, db: Session = Depends(get_db)):
    nuevo = Producto(**producto.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"mensaje": "Producto creado"}