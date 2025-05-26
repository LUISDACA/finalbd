from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import (
    product_router,
    categoria_router,
    proveedor_router,
    compra_router,
    analytics_router,
    venta_router,
)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router.router)
app.include_router(categoria_router.router)
app.include_router(proveedor_router.router)
app.include_router(compra_router.router)
app.include_router(venta_router.router)
app.include_router(analytics_router.router)
