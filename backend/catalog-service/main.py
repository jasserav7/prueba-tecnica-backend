import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers.categories import router as cat_router
from routers.products   import router as prod_router

load_dotenv()

app = FastAPI(
    title="STRYDE – Catalog Service",
    description="Microservicio de categorías y productos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cat_router)
app.include_router(prod_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "catalog"}
