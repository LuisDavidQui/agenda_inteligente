# 📅 Agenda Inteligente & Asistente Local de Archivos

Aplicación full-stack de productividad personal para organizar tu agenda, compromisos y documentos locales con un asistente en lenguaje natural.

---

## 🌟 Características Principales

1. **Tablero Kanban Interactivo (Estilo Trello / Notion):**
   - Columnas *Por Hacer*, *En Progreso* y *Completado*.
   - Clasificación por prioridad (*Urgente*, *Alta*, *Media*, *Baja*), proyecto y fecha de entrega.
   - Vínculo directo a documentos adjuntos.

2. **Cronograma y Calendario:**
   - Vista cronológica ordenada por fecha límite.
   - Detección automática de tareas vencidas.

3. **🛡️ Sandbox Seguro de Archivos (`managed_documents/`):**
   - Directorio seguro delimitado para tus documentos de trabajo (PDFs, Word, notas).
   - Protección estricta contra escapes o accesos fuera del sandbox.
   - Explorador visual, creación de subcarpetas y previsualización de contenidos.

4. **💬 Asistente IA en Lenguaje Natural (Chat):**
   - Dicta instrucciones directamente: *"Crear tarea: Revisar informe de vertedero prioridad alta para mañana"*, *"Listar tareas pendientes"*, *"Crear carpeta Proyectos/2026"*.
   - El asistente coordina tu agenda y crea carpetas automáticamente.

---

## 🚀 Despliegue en Vercel (1 Clic)

Este proyecto está construido en la raíz del repositorio siguiendo los estándares nativos de **Next.js** y **Vercel**:

1. En tu cuenta de **[Vercel](https://vercel.com)**, haz clic en **"Add New Project"**.
2. Selecciona tu repositorio de GitHub `agenda_inteligente`.
3. Haz clic en **"Deploy"** (sin necesidad de tocar configuraciones ni root directories).

---

## 💻 Ejecución Local

Para correr la aplicación en tu computador:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
