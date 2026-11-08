"""
Esquemas Pydantic para validación y serialización de datos de la API.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Título de la tarea")
    description: Optional[str] = Field(None, description="Detalles adicionales")
    status: Optional[str] = Field("todo", description="todo, in_progress, done")
    priority: Optional[str] = Field("medium", description="low, medium, high, urgent")
    due_date: Optional[datetime] = Field(None, description="Fecha y hora de vencimiento")
    project: Optional[str] = Field("General", description="Nombre del proyecto o categoría")

class TaskCreate(TaskBase):
    linked_document_ids: Optional[List[int]] = Field(default=[], description="IDs de documentos asociados")

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project: Optional[str] = None
    linked_document_ids: Optional[List[int]] = None

class DocumentSummary(BaseModel):
    id: int
    filename: str
    relative_path: str
    extension: Optional[str]
    category: Optional[str]

class TaskResponse(TaskBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    documents: List[DocumentSummary] = []

    class Config:
        from_attributes = True

class FileMoveRequest(BaseModel):
    source_path: str
    dest_path: str

class FileCreateRequest(BaseModel):
    relative_path: str
    content: str

class AgentCommandRequest(BaseModel):
    query: str
    context: Optional[dict] = None
