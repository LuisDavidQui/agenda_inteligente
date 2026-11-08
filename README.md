# 📅 Agenda Inteligente & Asistente Local de Archivos

Sistema integrado de productividad personal y gestión de agenda con asistente en lenguaje natural y organizador seguro de documentos locales.

---

## 🏛️ Arquitectura del Sistema

```
                      +------------------------------------------+
                      |           INTERFAZ VISUAL                |
                      |  Next.js + React + Tailwind CSS          |
                      |  (Vistas: Calendario, Kanban, Docs, Chat)|
                      +--------------------+---------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
        [ MODO ESCRITORIO / TAURI ]                     [ MODO WEB / VERCEL ]
           Acceso local directo                           Conexión API segura
                   |                                               |
                   +-----------------------+-----------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |         MOTOR Y AGENTE LOCAL             |
                      |           Python / FastAPI               |
                      +------------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
      🛡️ [ SANDBOX SEGURO ]                           💾 [ PERSISTENCIA ]
       managed_documents/                              SQLite (agenda.db)
       - Indexación PDF, DOCX, TXT                     - Tareas y Estados
       - Renombrado y clasificación                    - Prioridades y Fechas
       - Aislamiento estricto                          - Vínculos Tarea-Archivo
```

---

## 🚀 Estructura del Monorepo

```
Agenda/
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Reglas de exclusión para Git
├── README.md                 # Documentación general
├── PLAN.md                   # Bitácora de fases y estado del desarrollo
├── managed_documents/        # 🛡️ Directorio seguro delimitado para documentos
│   └── README.md
├── backend/                  # ⚙️ Motor local en Python (FastAPI + Agente)
│   ├── main.py               # Punto de entrada de la API
│   ├── requirements.txt      # Dependencias del backend
│   ├── verify_pure.py        # Pruebas de verificación de seguridad y parsing
│   ├── app/
│   │   ├── config.py         # Configuración del entorno y rutas
│   │   ├── database.py       # Conexión SQLAlchemy a SQLite
│   │   ├── models.py         # Modelos de Tareas, Documentos y Vínculos
│   │   ├── schemas.py        # Esquemas de validación Pydantic
│   │   ├── services/
│   │   │   ├── file_manager.py  # Gestor seguro con protección de Sandbox
│   │   │   ├── doc_parser.py    # Extractor de texto (PDF, Word, TXT)
│   │   │   └── agent_service.py # Comprensión de comandos en lenguaje natural
│   │   └── routers/
│   │       ├── tasks.py         # Endpoints CRUD de Tareas
│   │       ├── documents.py     # Endpoints de Archivos y Sandbox
│   │       └── agent.py         # Endpoint del Asistente en Chat
└── frontend/                 # 💻 Aplicación de interfaz de usuario (Next.js)
```

---

## 🔒 Mecanismo de Seguridad: Sandbox Delimitado

Para proteger tu sistema operativo y código fuente, el motor del agente implementa un control de acceso estricto:
- **Directorio Raíz Permitido**: `managed_documents/` (configurable en `.env`).
- **Bloqueo de Path Traversal**: Cualquier intento de acceder o modificar rutas relativas como `../../` es interceptado y denegado inmediatamente (`SecurityException`).
- Las pruebas automatizadas en `backend/verify_pure.py` validan este comportamiento.

---

## 🧪 Verificación Rápida

Para verificar el motor y las reglas de seguridad sin instalar paquetes adicionales:

```powershell
python backend/verify_pure.py
```
Resultado:
```
Ran 3 tests in 0.032s - OK
```
