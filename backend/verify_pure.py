"""
Pruebas de Verificación con Biblioteca Estándar de Python (Pure Python, sin dependencias externas).
Valida:
1. Seguridad del Sandbox y prevención de Path Traversal.
2. Creación, lectura y estructuración de archivos y carpetas.
3. Reglas de parsing y extracción de intenciones en lenguaje natural.
"""
import os
import shutil
import unittest
import re
from pathlib import Path
from datetime import datetime, timedelta

# Simulación de FileManager usando solo stdlib
class PureSafeFileManager:
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir.resolve()
        self.root_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_safe_path(self, relative_or_abs_path: str) -> Path:
        clean_path = str(relative_or_abs_path).replace("\\", "/")
        if clean_path.startswith("/"):
            clean_path = clean_path.lstrip("/")
        target = (self.root_dir / clean_path).resolve()
        try:
            target.relative_to(self.root_dir)
        except ValueError:
            raise PermissionError(f"Intento de escape del sandbox: {relative_or_abs_path}")
        return target

    def create_directory(self, relative_dir_path: str) -> str:
        target = self._resolve_safe_path(relative_dir_path)
        target.mkdir(parents=True, exist_ok=True)
        return target.relative_to(self.root_dir).as_posix()

    def write_text(self, relative_path: str, content: str) -> str:
        target = self._resolve_safe_path(relative_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return target.relative_to(self.root_dir).as_posix()

    def read_text(self, relative_path: str) -> str:
        target = self._resolve_safe_path(relative_path)
        return target.read_text(encoding="utf-8")

def parse_natural_command(query: str):
    clean = re.sub(r"^(crear tarea|nueva tarea|agregar tarea)\s*[:]?\s*", "", query, flags=re.IGNORECASE).strip()
    priority = "high" if "alta" in clean.lower() or "urgente" in clean.lower() else "medium"
    return {"title": clean, "priority": priority}

class TestPureSandbox(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(__file__).resolve().parent / "pure_test_sandbox"
        self.fm = PureSafeFileManager(self.test_dir)

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_safe_creation_and_reading(self):
        created_dir = self.fm.create_directory("Proyectos/Hidrologia_2026")
        self.assertEqual(created_dir, "Proyectos/Hidrologia_2026")
        
        file_path = self.fm.write_text("Proyectos/Hidrologia_2026/resumen.txt", "Simulacion Rio Molino")
        self.assertEqual(file_path, "Proyectos/Hidrologia_2026/resumen.txt")

        read_back = self.fm.read_text("Proyectos/Hidrologia_2026/resumen.txt")
        self.assertEqual(read_back, "Simulacion Rio Molino")

    def test_sandbox_security_traversal_blocked(self):
        with self.assertRaises(PermissionError):
            self.fm._resolve_safe_path("../../windows/system32")

        with self.assertRaises(PermissionError):
            self.fm.create_directory("../directorio_prohibido")

    def test_command_parser(self):
        parsed = parse_natural_command("Crear tarea: Entregar informe de vertedero prioridad alta")
        self.assertIn("informe de vertedero", parsed["title"])
        self.assertEqual(parsed["priority"], "high")

if __name__ == "__main__":
    unittest.main()
