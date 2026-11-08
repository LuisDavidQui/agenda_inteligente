"use client";

import React from "react";
import { LayoutDashboard, Calendar, FolderLock, Sparkles, Plus } from "lucide-react";

interface NavbarProps {
  currentTab: "kanban" | "calendar" | "documents";
  setCurrentTab: (tab: "kanban" | "calendar" | "documents") => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
  onOpenNewTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAgentOpen,
  setIsAgentOpen,
  onOpenNewTask,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Marca */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            AG
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Agenda Inteligente</h1>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 font-medium">Asistente & Sandbox Conectados</span>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setCurrentTab("kanban")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === "kanban"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            Tablero Kanban
          </button>

          <button
            onClick={() => setCurrentTab("calendar")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === "calendar"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            Calendario
          </button>

          <button
            onClick={() => setCurrentTab("documents")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === "documents"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderLock className="w-4 h-4 text-emerald-600" />
            Sandbox Archivos
          </button>
        </nav>

        {/* Acciones */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>

          <button
            onClick={() => setIsAgentOpen(!isAgentOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isAgentOpen
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md"
                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Asistente IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
