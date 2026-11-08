"""
Pruebas de Verificación Automatizadas:
- F1: Gestión de Tareas
- Seguridad del Sandbox de Archivos
- Comandos del Agente Inteligente
"""
import os
import shutil
import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.models import Task, DocumentRecord
from app.services.file_manager import SafeFileManager, SecurityException
from app.services.agent_service import IntelligentAgent
from app.schemas import TaskCreate

# Directorio temporal de pruebas para el sandbox
TEST_SANDBOX_DIR = Path(__file__).resolve().parent / "test_sandbox"

@pytest.fixture(scope="module")
def setup_test_env():
    # Crear carpeta temporal de pruebas
    TEST_SANDBOX_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Limpiar al finalizar
    if TEST_SANDBOX_DIR.exists():
        shutil.rmtree(TEST_SANDBOX_DIR)

@pytest.fixture
def db_session():
    # Base de datos en memoria para pruebas
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

# 1. Pruebas de F1 (Gestión de Tareas)
def test_task_creation_and_retrieval(db_session):
    task = Task(title="Completar entrega de hidrología", priority="high", project="Hidro2026")
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    assert task.id is not None
    assert task.title == "Completar entrega de hidrología"
    assert task.status == "todo"
    assert task.priority == "high"

    # Verificar que se puede consultar
    retrieved = db_session.query(Task).filter(Task.id == task.id).first()
    assert retrieved is not None
    assert retrieved.title == task.title

def test_task_status_update(db_session):
    task = Task(title="Revisar planos", status="todo")
    db_session.add(task)
    db_session.commit()

    task.status = "done"
    db_session.commit()
    db_session.refresh(task)

    assert task.status == "done"

# 2. Pruebas de Seguridad del Sandbox
def test_sandbox_allows_valid_operations(setup_test_env):
    fm = SafeFileManager(root_dir=TEST_SANDBOX_DIR)
    
    # Crear carpeta dentro del sandbox
    folder = fm.create_directory("Proyectos/Hidraulica")
    assert folder == "Proyectos/Hidraulica"

    # Escribir archivo dentro del sandbox
    file_path = fm.write_text_file("Proyectos/Hidraulica/notas.txt", "Contenido seguro")
    assert file_path == "Proyectos/Hidraulica/notas.txt"

    # Leer archivo
    content = fm.read_text_file("Proyectos/Hidraulica/notas.txt")
    assert content == "Contenido seguro"

def test_sandbox_blocks_path_traversal(setup_test_env):
    fm = SafeFileManager(root_dir=TEST_SANDBOX_DIR)
    
    # Intentar escapar hacia afuera con ../
    with pytest.raises(SecurityException):
        fm.create_directory("../carpeta_maliciosa")

    with pytest.raises(SecurityException):
        fm.write_text_file("../../archivo_externo.txt", "Peligro")

# 3. Pruebas del Agente Inteligente
def test_agent_creates_task_from_natural_language(db_session):
    agent = IntelligentAgent()
    command = "Crear tarea: Revisar informe de vertedero prioridad alta para mañana"
    response = agent.process_command(command, db_session)

    assert response["type"] == "task_created"
    assert "informe de vertedero" in response["data"]["title"]
    assert response["data"]["priority"] == "high"

    # Confirmar en la base de datos
    saved_task = db_session.query(Task).first()
    assert saved_task is not None
    assert "informe de vertedero" in saved_task.title
