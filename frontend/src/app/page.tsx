"use client";

import React, { useState, useEffect } from "react";
import { api, Task } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CalendarView } from "@/components/CalendarView";
import { DocumentExplorer } from "@/components/DocumentExplorer";
import { AgentChat } from "@/components/AgentChat";
import { NewTaskModal } from "@/components/NewTaskModal";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<"kanban" | "calendar" | "documents">("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Cargar estado inicial y comprobar conectividad con el motor local
  const loadData = async () => {
    setLoading(true);
    const online = await api.checkHealth();
    setBackendOnline(online);

    const loadedTasks = await api.getTasks();
    setTasks(loadedTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Verificar salud cada 10 segundos
    const interval = setInterval(async () => {
      const online = await api.checkHealth();
      setBackendOnline(online);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: "todo" | "in_progress" | "done") => {
    // Actualización optimista en la UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await api.updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await api.deleteTask(taskId);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    const created = await api.createTask(taskData);
    setTasks((prev) => [created, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra de Navegación Principal */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAgentOpen={isAgentOpen}
        setIsAgentOpen={setIsAgentOpen}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-slate-400">
            Cargando entorno de trabajo...
          </div>
        ) : (
          <>
            {currentTab === "kanban" && (
              <KanbanBoard
                tasks={tasks}
                onUpdateStatus={handleUpdateStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {currentTab === "calendar" && <CalendarView tasks={tasks} />}

            {currentTab === "documents" && <DocumentExplorer />}
          </>
        )}
      </main>

      {/* Asistente Inteligente Lateral (Chat) */}
      <AgentChat
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onRefreshData={loadData}
      />

      {/* Modal para Crear Tarea */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
