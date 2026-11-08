"""
Servicio del Agente Inteligente.
Interpreta comandos en lenguaje natural y coordina acciones entre la Agenda y los Documentos.
"""
import re
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Task, DocumentRecord
from app.services.file_manager import file_manager

class IntelligentAgent:
    def process_command(self, query: str, db: Session) -> Dict[str, Any]:
        """
        Analiza el texto del usuario e interpreta la intención para ejecutar la acción correspondiente.
        """
        q = query.strip()
        lower_q = q.lower()

        # 1. Crear Tarea
        # Ej: "Crear tarea: Revisar informe de hidrologia", "Añadir tarea preparar clase prioridad alta"
        if any(keyword in lower_q for keyword in ["crear tarea", "nueva tarea", "agregar tarea", "añadir tarea", "recuérdame"]):
            return self._handle_create_task(q, db)

        # 2. Listar Tareas
        if any(keyword in lower_q for keyword in ["mis tareas", "listar tareas", "qué tengo pendiente", "ver tareas"]):
            return self._handle_list_tasks(db)

        # 3. Crear Carpeta
        if any(keyword in lower_q for keyword in ["crear carpeta", "nueva carpeta", "crear directorio"]):
            return self._handle_create_folder(q)

        # 4. Organizar o Listar Documentos
        if any(keyword in lower_q for keyword in ["listar archivos", "ver documentos", "qué documentos hay", "explorar archivos"]):
            return self._handle_list_files()

        # 5. Respuesta conversacional estándar / ayuda
        return {
            "type": "conversation",
            "message": (
                f"He recibido tu mensaje: '{q}'.\n\n"
                "💡 **Comandos que puedo ejecutar ahora mismo:**\n"
                "- *'Crear tarea [título] prioridad [alta/media/baja] para [fecha]'*\n"
                "- *'Listar mis tareas pendientes'*\n"
                "- *'Crear carpeta Proyectos/2026'*\n"
                "- *'Listar documentos en mi carpeta segura'*\n"
                "- *'Organizar archivos'* (detecta y clasifica por extensión/año)"
            ),
            "action_taken": None
        }

    def _handle_create_task(self, query: str, db: Session) -> Dict[str, Any]:
        # Extraer título
        clean_title = re.sub(r"^(crear tarea|nueva tarea|agregar tarea|añadir tarea|recuérdame)\s*(:|-)?\s*", "", query, flags=re.IGNORECASE).strip()
        
        # Detectar prioridad
        priority = "medium"
        if "urgente" in clean_title.lower() or "alta" in clean_title.lower():
            priority = "high"
        elif "baja" in clean_title.lower():
            priority = "low"

        # Detectar fecha de vencimiento básica
        due_date = None
        lower_title = clean_title.lower()
        if "para hoy" in lower_title or "hoy" in lower_title:
            due_date = datetime.now() + timedelta(hours=6)
        elif "para mañana" in lower_title or "mañana" in lower_title:
            due_date = datetime.now() + timedelta(days=1)
        elif "en una semana" in lower_title or "la próxima semana" in lower_title:
            due_date = datetime.now() + timedelta(days=7)

        # Limpiar palabras clave de prioridad/fecha del título para que quede prolijo
        display_title = re.sub(r"\b(prioridad (alta|media|baja|urgente)|para mañana|para hoy)\b", "", clean_title, flags=re.IGNORECASE).strip()
        if not display_title:
            display_title = clean_title

        task = Task(
            title=display_title,
            priority=priority,
            status="todo",
            due_date=due_date,
            project="General"
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        return {
            "type": "task_created",
            "message": f"✅ He creado la tarea: **'{task.title}'** con prioridad **{task.priority.upper()}**.",
            "data": task.to_dict(),
            "action_taken": "create_task"
        }

    def _handle_list_tasks(self, db: Session) -> Dict[str, Any]:
        tasks = db.query(Task).filter(Task.status != "done").order_by(Task.due_date.asc().nullslast()).all()
        if not tasks:
            return {
                "type": "task_list",
                "message": "🎉 ¡No tienes tareas pendientes por hacer!",
                "data": []
            }
        
        lines = [f"- **{t.title}** (Prioridad: {t.priority}, Estado: {t.status})" for t in tasks]
        return {
            "type": "task_list",
            "message": f"📋 **Tienes {len(tasks)} tareas pendientes:**\n" + "\n".join(lines),
            "data": [t.to_dict() for t in tasks]
        }

    def _handle_create_folder(self, query: str) -> Dict[str, Any]:
        match = re.search(r"(?:crear carpeta|nueva carpeta|crear directorio)\s*[:]?\s*(.+)$", query, re.IGNORECASE)
        if match:
            folder_name = match.group(1).strip()
            path = file_manager.create_directory(folder_name)
            return {
                "type": "folder_created",
                "message": f"📁 Carpeta creada correctamente en el sandbox seguro: `{path}`",
                "data": {"path": path},
                "action_taken": "create_directory"
            }
        return {
            "type": "error",
            "message": "Por favor especifica el nombre de la carpeta a crear.",
            "action_taken": None
        }

    def _handle_list_files(self) -> Dict[str, Any]:
        files = file_manager.list_files("")
        if not files:
            return {
                "type": "file_list",
                "message": "La carpeta segura está actualmente vacía.",
                "data": []
            }
        
        file_summary = [f"- {'📁' if f['is_dir'] else '📄'} `{f['name']}`" for f in files[:15]]
        return {
            "type": "file_list",
            "message": f"📂 **Archivos en tu carpeta segura ({len(files)} elementos):**\n" + "\n".join(file_summary),
            "data": files
        }

agent_service = IntelligentAgent()
