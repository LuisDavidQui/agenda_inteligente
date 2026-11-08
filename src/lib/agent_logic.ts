import { Task, AgentResponse } from "./types";
import { getTasks, saveTasks } from "./storage";
import { sandbox } from "./file_sandbox";

export function processAgentCommand(query: string): AgentResponse {
  const q = query.trim();
  const lower = q.toLowerCase();

  // 1. Crear Tarea
  // Ej: "Crear tarea: Revisar informe de vertedero prioridad alta para mañana"
  if (/^(crear tarea|nueva tarea|agregar tarea|añadir tarea|recuérdame)/i.test(lower)) {
    const rawTitle = q.replace(/^(crear tarea|nueva tarea|agregar tarea|añadir tarea|recuérdame)\s*[:|-]?\s*/i, "").trim();

    let priority: "low" | "medium" | "high" | "urgent" = "medium";
    if (lower.includes("urgente")) priority = "urgent";
    else if (lower.includes("alta")) priority = "high";
    else if (lower.includes("baja")) priority = "low";

    let dueDate: string | null = null;
    const now = new Date();
    if (lower.includes("para hoy") || lower.includes("hoy")) {
      dueDate = new Date(now.getTime() + 6 * 3600000).toISOString();
    } else if (lower.includes("para mañana") || lower.includes("mañana")) {
      dueDate = new Date(now.getTime() + 24 * 3600000).toISOString();
    } else if (lower.includes("la próxima semana") || lower.includes("en una semana")) {
      dueDate = new Date(now.getTime() + 7 * 24 * 3600000).toISOString();
    }

    // Limpiar texto para título
    const cleanTitle = rawTitle
      .replace(/\b(prioridad (alta|media|baja|urgente)|para mañana|para hoy)\b/gi, "")
      .trim() || rawTitle;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: cleanTitle,
      status: "todo",
      priority,
      due_date: dueDate,
      project: "General",
      documents: [],
      created_at: new Date().toISOString(),
    };

    const currentTasks = getTasks();
    saveTasks([newTask, ...currentTasks]);

    return {
      type: "task_created",
      message: `✅ He creado la tarea: **"${newTask.title}"** con prioridad **${newTask.priority.toUpperCase()}**.`,
      data: newTask,
      action_taken: "create_task",
    };
  }

  // 2. Listar Tareas
  if (lower.includes("mis tareas") || lower.includes("listar tareas") || lower.includes("qué tengo pendiente") || lower.includes("ver tareas")) {
    const currentTasks = getTasks().filter((t) => t.status !== "done");
    if (currentTasks.length === 0) {
      return {
        type: "task_list",
        message: "🎉 ¡No tienes tareas pendientes por hacer!",
        data: [],
      };
    }
    const lines = currentTasks.map((t) => `- **${t.title}** (Prioridad: ${t.priority.toUpperCase()})`);
    return {
      type: "task_list",
      message: `📋 **Tienes ${currentTasks.length} tareas pendientes:**\n` + lines.join("\n"),
      data: currentTasks,
    };
  }

  // 3. Crear Carpeta en Sandbox
  if (lower.includes("crear carpeta") || lower.includes("nueva carpeta") || lower.includes("crear directorio")) {
    const match = q.match(/(?:crear carpeta|nueva carpeta|crear directorio)\s*[:]?\s*(.+)$/i);
    if (match && match[1]) {
      const folderName = match[1].trim();
      try {
        const created = sandbox.createDirectory(folderName);
        return {
          type: "folder_created",
          message: `📁 Carpeta creada correctamente en tu directorio seguro: \`${created}\``,
          data: { path: created },
          action_taken: "create_directory",
        };
      } catch (err: any) {
        return {
          type: "error",
          message: `Error al crear carpeta: ${err.message}`,
        };
      }
    }
  }

  // 4. Listar Archivos en Sandbox
  if (lower.includes("listar archivos") || lower.includes("ver documentos") || lower.includes("explorar archivos") || lower.includes("qué documentos hay")) {
    try {
      const files = sandbox.listFiles("");
      if (files.length === 0) {
        return {
          type: "file_list",
          message: "Tu carpeta segura `managed_documents` está vacía en este momento.",
          data: [],
        };
      }
      const summary = files.map((f) => `- ${f.is_dir ? "📁" : "📄"} \`${f.name}\``).join("\n");
      return {
        type: "file_list",
        message: `📂 **Archivos en tu directorio seguro (${files.length} elementos):**\n${summary}`,
        data: files,
      };
    } catch (e: any) {
      return {
        type: "error",
        message: `Error explorando archivos: ${e.message}`,
      };
    }
  }

  // Respuesta conversacional / Ayuda
  return {
    type: "conversation",
    message:
      `He recibido tu consulta: "${q}".\n\n` +
      `💡 **Instrucciones que puedo ejecutar de inmediato:**\n` +
      `- *"Crear tarea [nombre] prioridad [alta/media/baja] para [hoy/mañana]"*\n` +
      `- *"Listar mis tareas pendientes"*\n` +
      `- *"Crear carpeta Proyectos/2026"*\n` +
      `- *"Listar archivos de mi carpeta segura"*`,
    action_taken: null,
  };
}
