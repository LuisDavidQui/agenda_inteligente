"""
Router de la API para Gestión de Documentos Locales (Sandbox Seguro).
"""
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DocumentRecord
from app.config import settings
from app.services.file_manager import file_manager, SecurityException
from app.services.doc_parser import extract_text_from_file
from app.schemas import FileMoveRequest, FileCreateRequest

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/browse")
def browse_files(subpath: str = Query("", description="Ruta relativa dentro de la carpeta segura")):
    """Lista los archivos y carpetas reales en el sistema de archivos (Sandbox)."""
    try:
        items = file_manager.list_files(subpath)
        return {"subpath": subpath, "items": items, "root": str(settings.managed_docs_dir)}
    except SecurityException as se:
        raise HTTPException(status_code=403, detail=str(se))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def sync_documents_with_db(db: Session = Depends(get_db)):
    """
    Escanea la carpeta segura e indexa automáticamente nuevos archivos en la base de datos.
    """
    indexed = []
    for root, _, files in os.walk(settings.managed_docs_dir):
        for f in files:
            full_path = Path(root) / f
            rel_path = full_path.relative_to(settings.managed_docs_dir).as_posix()
            
            # Comprobar si ya existe en la BD
            doc = db.query(DocumentRecord).filter(DocumentRecord.relative_path == rel_path).first()
            if not doc:
                stat = full_path.stat()
                doc = DocumentRecord(
                    filename=f,
                    relative_path=rel_path,
                    extension=full_path.suffix.lower(),
                    file_size_bytes=stat.st_size,
                    category="General"
                )
                db.add(doc)
                indexed.append(rel_path)
    
    db.commit()
    return {"message": f"Indexados {len(indexed)} nuevos archivos", "indexed": indexed}

import os

@router.get("", response_model=List[dict])
def list_indexed_documents(db: Session = Depends(get_db)):
    """Obtiene los documentos indexados en la base de datos con sus tareas vinculadas."""
    docs = db.query(DocumentRecord).all()
    return [d.to_dict() for d in docs]

@router.post("/directory")
def create_directory(path: str = Query(..., description="Ruta de la nueva carpeta")):
    """Crea una nueva carpeta dentro del sandbox."""
    try:
        created = file_manager.create_directory(path)
        return {"message": f"Directorio creado: {created}"}
    except SecurityException as se:
        raise HTTPException(status_code=403, detail=str(se))

@router.post("/move-rename")
def move_or_rename_file(payload: FileMoveRequest, db: Session = Depends(get_db)):
    """Mueve o renombra un archivo o carpeta dentro del sandbox."""
    try:
        new_path = file_manager.rename_or_move(payload.source_path, payload.dest_path)
        
        # Actualizar en la base de datos si estaba indexado
        doc = db.query(DocumentRecord).filter(DocumentRecord.relative_path == payload.source_path).first()
        if doc:
            doc.relative_path = new_path
            doc.filename = Path(new_path).name
            doc.extension = Path(new_path).suffix.lower()
            db.commit()

        return {"message": "Movido con éxito", "new_path": new_path}
    except SecurityException as se:
        raise HTTPException(status_code=403, detail=str(se))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/content")
def get_file_content(path: str = Query(..., description="Ruta relativa del archivo")):
    """Extrae y devuelve el contenido de texto de un documento (PDF, Word, TXT, etc.)."""
    try:
        safe_path = file_manager._resolve_safe_path(path)
        if not safe_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        content = extract_text_from_file(safe_path)
        return {"relative_path": path, "content": content}
    except SecurityException as se:
        raise HTTPException(status_code=403, detail=str(se))
