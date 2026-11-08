# Plan de Desarrollo y Bitácora de Progreso

## Estado General del Proyecto

| Fase | Descripción | Estado | Verificación |
|---|---|---|---|
| **Fase 0** | Estructura del repositorio, configuración del entorno, git y carpeta segura | ✅ Completada | Estructura creada, `.gitignore`, `.env`, git init |
| **Fase 1** | Motor de Archivos seguro (Sandbox) y Extractor de Contenido | ✅ Completada | `verify_pure.py` ejecutado y aprobado (OK) |
| **Fase 2** | Modelado de Tareas, Base de Datos SQLite y API REST (F1) | ✅ Código listo | Modelos, Schemas y Routers FastAPI creados |
| **Fase 3** | Interfaz Visual Interactiva (Next.js, Tailwind, Kanban & Calendario) | ⏳ En preparación | Pendiente configuración y vistas UI |
| **Fase 4** | Integración del Asistente en Lenguaje Natural y Automatizaciones | ⏳ En preparación | Endpoint del agente listo para consumir |
| **Fase 5** | Despliegue en Vercel, Conexión Remota y Empaquetado Desktop | ⏳ Pendiente | Preparación de `vercel.json` y Tauri |

---

## Detalle de Fases y Verificaciones

### Fase 0: Inicialización y Repositorio
- [x] Repositorio Git inicializado localmente.
- [x] Reglas de exclusión en `.gitignore` para entornos virtuales, dependencias y bases de datos locales.
- [x] Carpeta segura delimitada `managed_documents/` configurada como el sandbox oficial.

### Fase 1: Motor Seguro de Archivos
- [x] Clase `SafeFileManager` con resolución canónica de rutas.
- [x] Bloqueo activo de intentos de escape (`SecurityException` ante `../`).
- [x] Operaciones de listar, crear directorios, mover/renombrar y leer/escribir archivos.
- [x] Parser de contenidos para `.pdf`, `.docx` y formatos de texto.

### Fase 2: Gestión de Agenda y Persistencia
- [x] Modelos ORM: `Task`, `DocumentRecord` y tabla de asociación `task_documents`.
- [x] CRUD completo de tareas con filtros por estado (`todo`, `in_progress`, `done`), prioridad y proyecto.
- [x] Capacidad de asociar uno o más documentos a una tarea de la agenda.
- [x] Base de datos local SQLite (`agenda.db`).
