# Plan de Desarrollo y Bitácora de Progreso

## Estado General del Proyecto

| Fase | Descripción | Estado | Verificación |
|---|---|---|---|
| **Fase 0** | Estructura del repositorio, configuración del entorno, git y carpeta segura | ✅ Completada | Estructura creada, `.gitignore`, `.env`, git init |
| **Fase 1** | Motor de Archivos seguro (Sandbox) y Extractor de Contenido | ✅ Completada | `verify_pure.py` ejecutado y aprobado (OK) |
| **Fase 2** | Modelado de Tareas, Base de Datos SQLite y API REST (F1) | ✅ Completada | Modelos, Schemas y Routers FastAPI creados |
| **Fase 3** | Interfaz Visual Interactiva (Next.js, Tailwind, Kanban & Calendario) | ✅ Completada | UI completa con Kanban, Calendario, Explorador y Chat |
| **Fase 4** | Integración del Asistente en Lenguaje Natural y Automatizaciones | ✅ Completada | Chat interactivo con chips rápidos y parsing |
| **Fase 5** | Despliegue en Vercel, Conexión Remota y GitHub | 🔄 Lista para conectar | `vercel.json` configurado, listo para git push |

---

## Componentes Construidos en el Frontend:

- **Navbar**: Selector de vistas (Kanban / Calendario / Sandbox Archivos), indicador en tiempo real de salud del agente local, botón de Nueva Tarea y toggle del Asistente.
- **Kanban Board**: Columnas reactivas "Por Hacer", "En Progreso" y "Completado", con badges de prioridad, proyectos, fechas y documentos adjuntos.
- **Calendario**: Vista cronológica con alertas de tareas vencidas y agrupación por fecha límite.
- **Explorador del Sandbox (`managed_documents/`)**: Navegación por carpetas, creación de subdirectorios, visualización de metadatos de archivos y previsualización de texto extraído.
- **Asistente IA (Chat lateral)**: Panel conversacional para dictar órdenes en lenguaje natural con sugerencias rápidas.
- **Modal de Creación**: Formulario rápido con validación de prioridades y fechas.
- **Configuración Vercel**: Archivo `vercel.json` listo para despliegue automático desde GitHub.
