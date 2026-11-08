/**
 * Cliente de API para conectar el Frontend con el Agente y Backend Local.
 */

export interface DocumentSummary {
  id: number;
  filename: string;
  relative_path: string;
  extension: string | null;
  category?: string;
}

export interface Task {
  id: number;
  title: str;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  project?: string;
  documents?: DocumentSummary[];
}

export interface FileItem {
  name: string;
  relative_path: string;
  is_dir: boolean;
  size_bytes: number;
  modified_at: string;
  extension?: string | null;
}

export interface AgentResponse {
  type: string;
  message: string;
  data?: any;
  action_taken?: string | null;
}

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string = DEFAULT_API_URL;

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  // Comprobar salud del backend local
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/`, { method: "GET", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Tareas
  async getTasks(): Promise<Task[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tasks`, { cache: "no-store" });
      if (!res.ok) throw new Error("Error obteniendo tareas");
      return await res.json();
    } catch (e) {
      console.warn("Backend no disponible, usando fallback local", e);
      return this.getLocalTasksFallback();
    }
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("Error creando tarea");
      return await res.json();
    } catch {
      const fallback = this.getLocalTasksFallback();
      const newTask: Task = {
        id: Date.now(),
        title: task.title || "Nueva Tarea",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        due_date: task.due_date || null,
        project: task.project || "General",
        documents: [],
      };
      fallback.unshift(newTask);
      localStorage.setItem("agenda_tasks_backup", JSON.stringify(fallback));
      return newTask;
    }
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Error actualizando tarea");
      return await res.json();
    } catch {
      const fallback = this.getLocalTasksFallback();
      const idx = fallback.findIndex((t) => t.id === id);
      if (idx !== -1) {
        fallback[idx] = { ...fallback[idx], ...updates };
        localStorage.setItem("agenda_tasks_backup", JSON.stringify(fallback));
        return fallback[idx];
      }
      throw new Error("Tarea no encontrada");
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/tasks/${id}`, { method: "DELETE" });
    } catch {
      const fallback = this.getLocalTasksFallback().filter((t) => t.id !== id);
      localStorage.setItem("agenda_tasks_backup", JSON.stringify(fallback));
    }
  }

  // Documentos
  async browseFiles(subpath: string = ""): Promise<{ items: FileItem[]; root: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/documents/browse?subpath=${encodeURIComponent(subpath)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Error explorando archivos");
      return await res.json();
    } catch {
      return {
        root: "managed_documents",
        items: [
          {
            name: "README.md",
            relative_path: "README.md",
            is_dir: false,
            size_bytes: 420,
            modified_at: new Date().toISOString(),
            extension: ".md",
          },
          {
            name: "Proyectos_2026",
            relative_path: "Proyectos_2026",
            is_dir: true,
            size_bytes: 0,
            modified_at: new Date().toISOString(),
          },
        ],
      };
    }
  }

  async getFileContent(relativePath: string): Promise<string> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/documents/content?path=${encodeURIComponent(relativePath)}`
      );
      if (!res.ok) throw new Error("Error leyendo archivo");
      const data = await res.json();
      return data.content;
    } catch {
      return "Vista previa no disponible en modo desconectado.";
    }
  }

  // Agente Inteligente (Chat)
  async sendAgentCommand(query: string): Promise<AgentResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("Error en el agente");
      return await res.json();
    } catch {
      return {
        type: "conversation",
        message: `🤖 (Modo Local Offline): Recibí tu orden: "${query}". Cuando el servidor backend local esté activo, coordinaré tus archivos de forma nativa.`,
      };
    }
  }

  private getLocalTasksFallback(): Task[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("agenda_tasks_backup");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const initial: Task[] = [
      {
        id: 1,
        title: "Revisar simulación y vertedero de Río Molino",
        description: "Analizar resultados del modelo numérico y cotejar con la cota de inundación.",
        status: "in_progress",
        priority: "urgent",
        project: "Río Molino",
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        documents: [{ id: 101, filename: "Simulación Río Molino.docx", relative_path: "Simulación Río Molino.docx", extension: ".docx" }],
      },
      {
        id: 2,
        title: "Preparar clase de Inteligencia Artificial en Hidráulica",
        description: "Revisar diapositivas y taller práctico para los estudiantes de Unicauca.",
        status: "todo",
        priority: "high",
        project: "Docencia",
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        documents: [],
      },
      {
        id: 3,
        title: "Estructurar propuesta de investigación depto. Hidráulica",
        description: "Borrador de proyecto 2-2026 y presupuesto de instrumentación.",
        status: "todo",
        priority: "medium",
        project: "Propuestas",
        due_date: new Date(Date.now() + 86400000 * 8).toISOString(),
        documents: [],
      },
      {
        id: 4,
        title: "Configurar repositorio GitHub y despliegue Vercel",
        description: "Integración continua y verificación del sandbox de archivos.",
        status: "done",
        priority: "high",
        project: "Infraestructura",
        due_date: new Date().toISOString(),
        documents: [],
      },
    ];
    localStorage.setItem("agenda_tasks_backup", JSON.stringify(initial));
    return initial;
  }
}

export const api = new ApiClient();
