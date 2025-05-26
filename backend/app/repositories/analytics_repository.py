from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Producto, Categoria, Compra, Proveedor

def productos_mas_vendidos_por_categoria(db: Session):
    return db.query(
        Categoria.nombre.label("categoria"),
        Producto.nombre.label("producto"),
        func.sum(Compra.cantidad).label("total_vendido")
    ).join(Producto, Compra.producto_id == Producto.id) \
    .join(Categoria, Producto.categoria_id == Categoria.id) \
    .group_by(Categoria.nombre, Producto.nombre) \
    .order_by(Categoria.nombre, func.sum(Compra.cantidad).desc()).all()

def stock_por_proveedor_categoria(db: Session):
    return db.query(
        Proveedor.nombre.label("proveedor"),
        Categoria.nombre.label("categoria"),
        func.sum(Producto.stock).label("stock_total")
    ).join(Categoria, Producto.categoria_id == Categoria.id) \
    .join(Proveedor, Producto.proveedor_id == Proveedor.id) \
    .group_by(Proveedor.nombre, Categoria.nombre).all()

def productos_con_stock_bajo(db: Session):
    return db.query(Producto.nombre, Producto.stock).filter(Producto.stock < 5).all()

def ventas_mensuales_por_cliente(db: Session, mes: str = None):
    query = db.query(
        Compra.cliente,
        func.date_format(Compra.fecha, "%Y-%m").label("mes"),
        func.sum(Compra.cantidad).label("total_comprado")
    ).group_by(Compra.cliente, func.date_format(Compra.fecha, "%Y-%m")) \
    .order_by("mes", "cliente")

    if mes:
        query = query.filter(func.date_format(Compra.fecha, "%Y-%m") == mes)

    return query.all()
