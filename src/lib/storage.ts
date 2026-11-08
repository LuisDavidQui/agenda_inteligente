import fs from "fs";
import path from "path";
import { Task } from "./types";

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Revisar simulación y vertedero de Río Molino",
    description: "Analizar resultados del modelo numérico de DualSPHysics y cotas de inundación.",
    status: "in_progress",
    priority: "urgent",
    project: "Río Molino",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    documents: [
      {
        id: "doc-1",
        filename: "Simulación Río Molino.docx",
        relative_path: "Simulación Río Molino.docx",
        extension: ".docx",
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Preparar clase de Inteligencia Artificial en Hidráulica",
    description: "Revisar diapositivas, códigos de ejemplo y taller práctico para los estudiantes de Unicauca.",
    status: "todo",
    priority: "high",
    project: "Docencia",
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    documents: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Estructurar propuesta de investigación depto. Hidráulica",
    description: "Borrador de proyecto 2-2026 y presupuesto de instrumentación de campo.",
    status: "todo",
    priority: "medium",
    project: "Propuestas",
    due_date: new Date(Date.now() + 86400000 * 8).toISOString(),
    documents: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Vincular repositorio a GitHub y desplegar en Vercel",
    description: "Verificar sincronización continua y disponibilidad web en la nube.",
    status: "done",
    priority: "high",
    project: "Infraestructura",
    due_date: new Date().toISOString(),
    documents: [],
    created_at: new Date().toISOString(),
  },
];

// En Vercel usamos /tmp/tasks.json si no se puede escribir en el directorio del proyecto
function getStoragePath(): string {
  try {
    const localDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, "tasks.json");
  } catch {
    const tmpDir = path.join("/tmp", "agenda_data");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return path.join(tmpDir, "tasks.json");
  }
}

// Memoria en caché de respaldo
let memoryTasks: Task[] = [...INITIAL_TASKS];

export function getTasks(): Task[] {
  try {
    const filePath = getStoragePath();
    if (!fs.existsSync(filePath)) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(data);
    memoryTasks = parsed;
    return parsed;
  } catch (error) {
    console.warn("Usando tareas en memoria:", error);
    return memoryTasks;
  }
}

export function saveTasks(tasks: Task[]): void {
  memoryTasks = tasks;
  try {
    const filePath = getStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf-8");
  } catch (error) {
    console.warn("No se pudo escribir en disco, guardado en memoria:", error);
  }
}
