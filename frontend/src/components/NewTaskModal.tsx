"use client";

import React, { useState } from "react";
import { Task } from "@/lib/api";
import { X, Calendar, Flag, Folder, Check } from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: Partial<Task>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("General");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      project: project.trim() || "General",
      priority,
      status: "todo",
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });

    setTitle("");
    setDescription("");
    setProject("General");
    setPriority("medium");
    setDueDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Crear Nueva Tarea</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Revisar cotas de inundación Río Molino"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción o Notas
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre lo que se debe hacer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proyecto / Categoría
              </label>
              <input
                type="text"
                placeholder="Ej. Hidrología"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Guardar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
