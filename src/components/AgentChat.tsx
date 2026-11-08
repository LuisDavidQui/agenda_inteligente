"use client";

import React, { useState } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";

interface Message {
  sender: "user" | "agent";
  text: string;
}

interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "👋 ¡Hola! Soy tu asistente de agenda y organizador seguro de archivos. Puedo crear tareas, organizar carpetas o responder dudas en lenguaje natural. ¿En qué te ayudo hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Crear tarea: Revisar informe de vertedero prioridad alta para mañana",
    "Listar mis tareas pendientes",
    "Crear carpeta Proyectos/2026/Hidraulica",
    "Listar documentos en mi carpeta segura",
  ];

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const agentMsg: Message = { sender: "agent", text: data.message || "Listo." };
      setMessages((prev) => [...prev, agentMsg]);

      if (data.action_taken) {
        onRefreshData();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "Error comunicándome con el motor del asistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-indigo-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Asistente Inteligente</h3>
            <p className="text-[11px] text-slate-500">Coordinación de Agenda & Archivos</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-100 text-slate-800 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Procesando...</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Comandos Rápidos
        </p>
        <div className="flex flex-col gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-left text-xs bg-white border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 p-2 rounded-lg transition-colors truncate"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe una instrucción..."
            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 border border-transparent focus:border-purple-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
