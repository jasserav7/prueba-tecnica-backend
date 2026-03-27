import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers.orders import router as orders_router

load_dotenv()

app = FastAPI(
    title="STRYDE – Orders Service",
    description="Microservicio de pedidos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "orders"}
