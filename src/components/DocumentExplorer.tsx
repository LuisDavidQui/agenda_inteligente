"use client";

import React, { useState, useEffect } from "react";
import { FileItem } from "@/lib/types";
import { Folder, FileText, FileCode, FolderPlus, ShieldCheck, RefreshCw, Eye, X } from "lucide-react";

export const DocumentExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);

  const loadFiles = async (subpath: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?subpath=${encodeURIComponent(subpath)}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.items || []);
        setCurrentPath(subpath);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles("");
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const target = currentPath ? `${currentPath}/${newFolderName.trim()}` : newFolderName.trim();
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: target }),
      });
      if (res.ok) {
        setNewFolderName("");
        setIsCreatingFolder(false);
        loadFiles(currentPath);
      } else {
        const err = await res.json();
        alert(err.error || "Error al crear carpeta");
      }
    } catch (err: any) {
      alert("Error de conexión: " + err.message);
    }
  };

  const handleOpenFile = async (file: FileItem) => {
    if (file.is_dir) {
      loadFiles(file.relative_path);
    } else {
      setPreviewFileName(file.name);
      setPreviewContent("Cargando contenido...");
      try {
        const res = await fetch(`/api/documents?subpath=${encodeURIComponent(file.relative_path)}&read=true`);
        if (res.ok) {
          const data = await res.json();
          setPreviewContent(data.content);
        } else {
          setPreviewContent("No se pudo leer el archivo (formato binario o no soportado).");
        }
      } catch {
        setPreviewContent("Error de lectura.");
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "--";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">Centro de Documentos</h2>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Sandbox Seguro Activo
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Carpeta segura delimitada: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">managed_documents/</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadFiles(currentPath)}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refrescar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Nueva Carpeta
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
        <button
          onClick={() => loadFiles("")}
          className="hover:text-blue-600 font-semibold"
        >
          Raíz
        </button>
        {currentPath && (
          <>
            <span>/</span>
            <span className="text-slate-800 font-medium">{currentPath}</span>
          </>
        )}
      </div>

      {isCreatingFolder && (
        <form onSubmit={handleCreateFolder} className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre de la subcarpeta (ej. Proyectos/2026)"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Crear
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFolder(false)}
            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando directorio seguro...</div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Esta carpeta está vacía. Añade archivos a <code className="font-semibold">managed_documents</code> para visualizarlos aquí.
          </div>
        ) : (
          files.map((file, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenFile(file)}
              className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                {file.is_dir ? (
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Folder className="w-4 h-4 fill-amber-500/20" />
                  </div>
                ) : file.extension === ".pdf" ? (
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileCode className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {file.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Modificado: {new Date(file.modified_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{file.is_dir ? "Carpeta" : formatSize(file.size_bytes)}</span>
                {!file.is_dir && (
                  <button className="p-1 hover:bg-slate-200 rounded text-slate-500">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {previewFileName && (
        <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Contenido: <span className="text-blue-600">{previewFileName}</span>
            </span>
            <button
              onClick={() => {
                setPreviewFileName(null);
                setPreviewContent(null);
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
            {previewContent}
          </pre>
        </div>
      )}
    </div>
  );
};
