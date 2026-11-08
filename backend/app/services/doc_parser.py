"""
Extractor y analizador de contenidos para documentos (PDF, DOCX, TXT, MD).
"""
from pathlib import Path
from typing import Optional

def extract_text_from_file(file_path: Path, max_length: int = 4000) -> str:
    """
    Extrae texto del archivo según su extensión de forma segura.
    """
    ext = file_path.suffix.lower()
    
    if ext in [".txt", ".md", ".json", ".csv", ".log", ".py", ".html"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read(max_length)
        except Exception as e:
            return f"[Error leyendo archivo de texto: {e}]"

    elif ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(str(file_path))
            text_parts = []
            for page in reader.pages[:10]: # Primeras 10 páginas para resumen
                text_parts.append(page.extract_text() or "")
                if sum(len(p) for p in text_parts) > max_length:
                    break
            extracted = "\n".join(text_parts).strip()
            return extracted[:max_length] if extracted else "[PDF sin texto extraíble o escaneado]"
        except ImportError:
            return "[Extractor PDF no disponible: instale pypdf]"
        except Exception as e:
            return f"[Error procesando PDF: {e}]"

    elif ext in [".docx", ".doc"]:
        try:
            import docx
            doc = docx.Document(str(file_path))
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            extracted = "\n".join(paragraphs).strip()
            return extracted[:max_length] if extracted else "[Documento Word vacío]"
        except ImportError:
            return "[Extractor Word no disponible: instale python-docx]"
        except Exception as e:
            return f"[Error procesando Word: {e}]"

    return f"[Formato binario o no soportado para lectura directa: {ext}]"
