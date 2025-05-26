from sqlalchemy.orm import Session
from app.models.models import Producto, Categoria, Proveedor

def get_all_products(db: Session):
    result = db.query(Producto, Categoria.nombre, Proveedor.nombre) \
        .join(Categoria, Producto.categoria_id == Categoria.id) \
        .join(Proveedor, Producto.proveedor_id == Proveedor.id) \
        .all()

    return [{
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "precio": float(p.precio),
        "stock": p.stock,
        "categoria": cat,
        "proveedor": prov
    } for p, cat, prov in result]
