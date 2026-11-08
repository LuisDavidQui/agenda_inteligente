import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Inteligente & Organizador Seguro de Archivos",
  description: "Gestión interactiva de tareas, calendario y organización de documentos con asistente IA local.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
