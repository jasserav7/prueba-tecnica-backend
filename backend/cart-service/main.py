import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers.cart import router as cart_router

load_dotenv()

app = FastAPI(
    title="STRYDE – Cart Service",
    description="Microservicio de carrito de compras",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cart_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "cart"}
