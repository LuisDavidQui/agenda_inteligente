"""
Script de Verificación Autónoma (sin dependencias externas).
Ejecuta las pruebas clave de F1, Sandbox y Agente usando unittest estándar.
"""
import sys
import shutil
import unittest
from pathlib import Path

# Agregar directorio backend al path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Task, DocumentRecord
from app.services.file_manager import SafeFileManager, SecurityException
from app.services.agent_service import IntelligentAgent

TEST_DIR = BACKEND_DIR / "temp_verify_sandbox"

class TestAgendaCore(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        TEST_DIR.mkdir(parents=True, exist_ok=True)
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        if TEST_DIR.exists():
            shutil.rmtree(TEST_DIR)

    def setUp(self):
        self.session = self.Session()

    def tearDown(self):
        self.session.close()

    def test_01_task_creation(self):
        task = Task(title="Completar entrega de hidrología", priority="high", project="Hidro2026")
        self.session.add(task)
        self.session.commit()
        self.assertIsNotNone(task.id)
        self.assertEqual(task.status, "todo")

    def test_02_sandbox_security(self):
        fm = SafeFileManager(root_dir=TEST_DIR)
        # Operación válida
        folder = fm.create_directory("Proyectos/Hidraulica")
        self.assertEqual(folder, "Proyectos/Hidraulica")

        # Operación maliciosa (Path Traversal fuera del sandbox)
        with self.assertRaises(SecurityException):
            fm.create_directory("../../escape_attempt")

    def test_03_agent_command(self):
        agent = IntelligentAgent()
        res = agent.process_command("Crear tarea: Calibrar simulación de Río Molino prioridad alta", self.session)
        self.assertEqual(res["type"], "task_created")
        self.assertIn("Río Molino", res["data"]["title"])
        self.assertEqual(res["data"]["priority"], "high")

if __name__ == "__main__":
    unittest.main()
