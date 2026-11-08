"use client";

import React from "react";
import { Task } from "@/lib/api";
import { Clock, Paperclip, CheckCircle2, MoreVertical, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: number, newStatus: "todo" | "in_progress" | "done") => void;
  onDeleteTask: (taskId: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateStatus,
  onDeleteTask,
}) => {
  const columns: { id: "todo" | "in_progress" | "done"; title: string; color: string; bg: string }[] = [
    { id: "todo", title: "Por Hacer", color: "text-slate-700", bg: "bg-slate-100" },
    { id: "in_progress", title: "En Progreso", color: "text-blue-700", bg: "bg-blue-50" },
    { id: "done", title: "Completado", color: "text-emerald-700", bg: "bg-emerald-50" },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Urgente</span>;
      case "high":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Alta</span>;
      case "medium":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Media</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Baja</span>;
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return d.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="flex flex-col bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
            {/* Cabecera de la Columna */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${col.bg.replace("50", "500").replace("100", "500")}`}></span>
                <h3 className={`font-bold text-sm ${col.color}`}>{col.title}</h3>
                <span className="text-xs bg-white border border-slate-200 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Lista de Tarjetas */}
            <div className="flex-1 space-y-3 min-h-[300px]">
              {colTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Sin tareas en esta etapa
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-all group"
                  >
                    {/* Proyecto & Prioridad */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {task.project || "General"}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {/* Título y Descripción */}
                    <h4 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                    )}

                    {/* Documentos vinculados */}
                    {task.documents && task.documents.length > 0 && (
                      <div className="mb-3 flex items-center gap-1.5 flex-wrap">
                        {task.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                            title={doc.filename}
                          >
                            <Paperclip className="w-3 h-3 text-blue-500" />
                            <span className="max-w-[120px] truncate">{doc.filename}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pie de la tarjeta */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Controles de cambio de etapa */}
                      <div className="flex items-center gap-1">
                        {col.id !== "todo" && (
                          <button
                            onClick={() =>
                              onUpdateStatus(task.id, col.id === "done" ? "in_progress" : "todo")
                            }
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            title="Mover a etapa anterior"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id !== "done" && (
                          <button
                            onClick={() =>
                              onUpdateStatus(task.id, col.id === "todo" ? "in_progress" : "done")
                            }
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            title="Avanzar etapa"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
