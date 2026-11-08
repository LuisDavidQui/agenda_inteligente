"""
Configuración central de la aplicación y del entorno.
"""
import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Ruta segura asignada para los documentos
MANAGED_DOCS_PATH_STR = os.getenv("MANAGED_DOCS_PATH", "./managed_documents")
MANAGED_DOCS_DIR = (BASE_DIR / MANAGED_DOCS_PATH_STR).resolve() if not os.path.isabs(MANAGED_DOCS_PATH_STR) else Path(MANAGED_DOCS_PATH_STR).resolve()

# Asegurar que el directorio gestionado existe
MANAGED_DOCS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agenda.db")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")

class Settings(BaseModel):
    app_name: str = "Agenda Inteligente & Asistente Local"
    version: str = "1.0.0"
    managed_docs_dir: Path = MANAGED_DOCS_DIR
    database_url: str = DATABASE_URL
    port: int = PORT
    host: str = HOST
    debug: bool = DEBUG

settings = Settings()
