"""
Punto de Entrada Principal del Backend de la Agenda Inteligente.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import tasks, documents, agent

# Crear tablas en SQLite automáticamente si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Backend local y agente para gestión de agenda y organizador seguro de archivos."
)

# Configurar CORS para permitir comunicación local y remota (Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se puede restringir al dominio de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(agent.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs",
        "managed_docs_folder": str(settings.managed_docs_dir)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.debug)
