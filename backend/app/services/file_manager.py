"""
Gestor de Archivos con Sandbox Estricto.
Garantiza que ninguna operación de lectura o escritura ocurra fuera del directorio asignado.
"""
import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.config import settings

class SecurityException(Exception):
    """Excepción lanzada cuando una operación intenta escapar del sandbox."""
    pass

class SafeFileManager:
    def __init__(self, root_dir: Optional[Path] = None):
        self.root_dir = (root_dir or settings.managed_docs_dir).resolve()
        self.root_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_safe_path(self, relative_or_abs_path: str) -> Path:
        """
        Resuelve una ruta y verifica estrictamente que resida dentro de self.root_dir.
        """
        # Normalizar barras
        clean_path = str(relative_or_abs_path).replace("\\", "/")
        if clean_path.startswith("/"):
            clean_path = clean_path.lstrip("/")

        target = (self.root_dir / clean_path).resolve()

        # Comprobar pertenencia al sandbox
        try:
            target.relative_to(self.root_dir)
        except ValueError:
            raise SecurityException(
                f"Acceso denegado: El destino '{relative_or_abs_path}' está fuera de la carpeta segura '{self.root_dir}'."
            )
        return target

    def list_files(self, subpath: str = "") -> List[Dict[str, Any]]:
        """
        Lista los archivos y directorios dentro de la carpeta segura (o subdirectorio).
        """
        target_dir = self._resolve_safe_path(subpath)
        if not target_dir.exists() or not target_dir.is_dir():
            return []

        results = []
        for entry in os.scandir(target_dir):
            entry_path = Path(entry.path)
            stat = entry.stat()
            rel_path = entry_path.relative_to(self.root_dir).as_posix()
            
            results.append({
                "name": entry.name,
                "relative_path": rel_path,
                "is_dir": entry.is_dir(),
                "size_bytes": stat.st_size if entry.is_file() else 0,
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "extension": entry_path.suffix.lower() if entry.is_file() else None
            })
        
        # Ordenar carpetas primero, luego archivos alfabéticamente
        return sorted(results, key=lambda x: (not x["is_dir"], x["name"].lower()))

    def create_directory(self, relative_dir_path: str) -> str:
        """Crea un subdirectorio dentro del sandbox."""
        target = self._resolve_safe_path(relative_dir_path)
        target.mkdir(parents=True, exist_ok=True)
        return target.relative_to(self.root_dir).as_posix()

    def rename_or_move(self, source_relative: str, dest_relative: str) -> str:
        """Mueve o renombra un archivo o carpeta dentro del sandbox."""
        src = self._resolve_safe_path(source_relative)
        dst = self._resolve_safe_path(dest_relative)

        if not src.exists():
            raise FileNotFoundError(f"El archivo origen '{source_relative}' no existe.")

        # Asegurar que el directorio padre de destino exista
        dst.parent.mkdir(parents=True, exist_ok=True)

        shutil.move(str(src), str(dst))
        return dst.relative_to(self.root_dir).as_posix()

    def write_text_file(self, relative_path: str, content: str) -> str:
        """Crea o sobreescribe un archivo de texto en el sandbox."""
        target = self._resolve_safe_path(relative_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return target.relative_to(self.root_dir).as_posix()

    def read_text_file(self, relative_path: str, max_chars: int = 10000) -> str:
        """Lee el contenido de texto de un archivo dentro del sandbox."""
        target = self._resolve_safe_path(relative_path)
        if not target.is_file():
            raise FileNotFoundError(f"Archivo no encontrado: {relative_path}")
        
        with open(target, "r", encoding="utf-8", errors="replace") as f:
            return f.read(max_chars)

    def delete_item(self, relative_path: str) -> bool:
        """Elimina un archivo o directorio dentro del sandbox."""
        target = self._resolve_safe_path(relative_path)
        if not target.exists():
            return False
        
        if target.is_file():
            target.unlink()
        elif target.is_dir():
            shutil.rmtree(target)
        return True

file_manager = SafeFileManager()
