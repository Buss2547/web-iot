import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed initial data
    init_db()
    yield
    # Shutdown: clean up if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for Vigil AI Smart Security & IoT Face Recognition System",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
origins = settings.BACKEND_CORS_ORIGINS
cors_origins = origins if isinstance(origins, list) else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount snapshots & datasets directories for static image serving
data_base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
snapshots_dir = os.path.join(data_base_dir, "snapshots")
datasets_dir = os.path.join(data_base_dir, "datasets")
os.makedirs(snapshots_dir, exist_ok=True)
os.makedirs(datasets_dir, exist_ok=True)
app.mount("/data/snapshots", StaticFiles(directory=snapshots_dir), name="snapshots")
app.mount("/data/datasets", StaticFiles(directory=datasets_dir), name="datasets")


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


app.include_router(api_router, prefix=settings.API_V1_STR)
