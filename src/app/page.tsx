"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/lib/types";
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

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    // Optimista
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (e) {
      console.error("Error actualizando tarea:", e);
      loadTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, { method: "DELETE" });
    } catch (e) {
      console.error("Error eliminando tarea:", e);
      loadTasks();
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => [created, ...prev]);
      }
    } catch (e) {
      console.error("Error creando tarea:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAgentOpen={isAgentOpen}
        setIsAgentOpen={setIsAgentOpen}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
      />

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

      <AgentChat
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onRefreshData={loadTasks}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
