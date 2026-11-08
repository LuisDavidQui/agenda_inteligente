"""
Modelos ORM para Tareas, Documentos y Vínculos.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Tabla intermedia para vincular Tareas y Documentos
task_documents = Table(
    "task_documents",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("document_id", Integer, ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True),
)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo", index=True) # todo, in_progress, done
    priority = Column(String(50), default="medium") # low, medium, high, urgent
    due_date = Column(DateTime, nullable=True)
    project = Column(String(100), default="General", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Documentos vinculados a esta tarea
    documents = relationship("DocumentRecord", secondary=task_documents, back_populates="tasks")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "project": self.project,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "documents": [d.to_dict_summary() for d in self.documents] if self.documents else []
        }

class DocumentRecord(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    relative_path = Column(String(500), nullable=False, unique=True, index=True)
    extension = Column(String(20), nullable=True)
    file_size_bytes = Column(Integer, default=0)
    category = Column(String(100), default="General")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Tareas que usan este documento
    tasks = relationship("Task", secondary=task_documents, back_populates="documents")

    def to_dict_summary(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "relative_path": self.relative_path,
            "extension": self.extension,
            "category": self.category
        }

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "relative_path": self.relative_path,
            "extension": self.extension,
            "file_size_bytes": self.file_size_bytes,
            "category": self.category,
            "summary": self.summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tasks": [{"id": t.id, "title": t.title} for t in self.tasks] if self.tasks else []
        }
