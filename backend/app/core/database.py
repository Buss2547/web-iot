import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Ensure sqlite directory exists if relative path like ./data/vigil.db
if settings.DATABASE_URL.startswith("sqlite"):
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if db_path.startswith("./") or not os.path.isabs(db_path):
        dir_name = os.path.dirname(db_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)

# For SQLite, check_same_thread=False is required for multi-threaded FastAPI requests
connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db() -> None:
    """Initialize database tables."""
    # Import models so Base metadata is populated
    import app.models.user  # noqa: F401

    Base.metadata.create_all(bind=engine)
