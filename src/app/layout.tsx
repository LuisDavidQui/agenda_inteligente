import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Inteligente & Organizador Seguro",
  description: "Gestión interactiva de agenda, calendario, documentos seguros y asistente en lenguaje natural.",
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
