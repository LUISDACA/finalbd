from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.models import Categoria
from app.database import SessionLocal
from pydantic import BaseModel

router = APIRouter()

class CategoriaIn(BaseModel):
    nombre: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/categorias")
def crear_categoria(cat: CategoriaIn, db: Session = Depends(get_db)):
    nueva = Categoria(nombre=cat.nombre)
    db.add(nueva)
    db.commit()
    return {"mensaje": "Categoría guardada"}

@router.get("/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()