"""
Router de la API para Gestión de Tareas (F1).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task, DocumentRecord
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = Query(None, description="Filtrar por estado (todo, in_progress, done)"),
    project: Optional[str] = Query(None, description="Filtrar por proyecto"),
    priority: Optional[str] = Query(None, description="Filtrar por prioridad"),
    db: Session = Depends(get_db)
):
    """Obtiene la lista de tareas con filtros opcionales."""
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    if project:
        query = query.filter(Task.project == project)
    if priority:
        query = query.filter(Task.priority == priority)
    return query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    """Crea una nueva tarea y asocia documentos opcionales."""
    task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status or "todo",
        priority=task_in.priority or "medium",
        due_date=task_in.due_date,
        project=task_in.project or "General"
    )
    
    if task_in.linked_document_ids:
        docs = db.query(DocumentRecord).filter(DocumentRecord.id.in_(task_in.linked_document_ids)).all()
        task.documents = docs

    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de una tarea por su ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return task

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    """Actualiza una tarea existente."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    update_data = task_in.model_dump(exclude_unset=True)
    
    if "linked_document_ids" in update_data:
        doc_ids = update_data.pop("linked_document_ids")
        if doc_ids is not None:
            docs = db.query(DocumentRecord).filter(DocumentRecord.id.in_(doc_ids)).all()
            task.documents = docs

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Elimina una tarea."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    db.delete(task)
    db.commit()
    return None

@router.post("/{task_id}/link-document/{document_id}", response_model=TaskResponse)
def link_document_to_task(task_id: int, document_id: int, db: Session = Depends(get_db)):
    """Vincula un documento existente a una tarea."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    doc = db.query(DocumentRecord).filter(DocumentRecord.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    if doc not in task.documents:
        task.documents.append(doc)
        db.commit()
        db.refresh(task)
    return task
