"use client";

import React from "react";
import { Task } from "@/lib/api";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const today = new Date();
  
  // Agrupar tareas por fechas
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cronograma de Entregas</h2>
            <p className="text-xs text-slate-500">
              Visualización cronológica de compromisos y tareas con fecha límite.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No hay tareas programadas</div>
        ) : (
          sortedTasks.map((task) => {
            const dueDate = task.due_date ? new Date(task.due_date) : null;
            const isOverdue = dueDate && dueDate < today && task.status !== "done";

            return (
              <div
                key={task.id}
                className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                  task.status === "done"
                    ? "bg-slate-50/50 border-slate-200 opacity-60"
                    : isOverdue
                    ? "bg-red-50/40 border-red-200"
                    : "bg-white border-slate-200 hover:border-indigo-200 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 p-2 rounded-lg text-xs font-bold text-center min-w-[54px] ${
                      isOverdue
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div>{dueDate ? dueDate.toLocaleDateString("es-ES", { month: "short" }) : "Sin"}</div>
                    <div className="text-base font-extrabold">{dueDate ? dueDate.getDate() : "--"}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {task.project || "General"}
                      </span>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Vencida
                        </span>
                      )}
                    </div>
                    <h4
                      className={`font-semibold text-sm ${
                        task.status === "done" ? "line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      task.status === "done"
                        ? "bg-emerald-100 text-emerald-800"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {task.status === "done"
                      ? "Completada"
                      : task.status === "in_progress"
                      ? "En curso"
                      : "Pendiente"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
