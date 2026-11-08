import fs from "fs";
import path from "path";
import { FileItem } from "./types";

export class FileSandbox {
  private rootDir: string;

  constructor(customPath?: string) {
    const target = customPath || process.env.MANAGED_DOCS_PATH || "managed_documents";
    this.rootDir = path.resolve(process.cwd(), target);
    try {
      if (!fs.existsSync(this.rootDir)) {
        fs.mkdirSync(this.rootDir, { recursive: true });
      }
    } catch (e) {
      console.warn("No se pudo crear rootDir en inicio:", e);
    }
  }

  public getRootDir(): string {
    return this.rootDir;
  }

  public resolveSafePath(subpath: string = ""): string {
    const cleanSub = subpath.replace(/\\/g, "/").replace(/^\/+/, "");
    const resolved = path.resolve(this.rootDir, cleanSub);

    // Validación estricta contra Path Traversal
    const relative = path.relative(this.rootDir, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Acceso denegado: El destino '${subpath}' intenta escapar de la carpeta segura.`);
    }

    return resolved;
  }

  public listFiles(subpath: string = ""): FileItem[] {
    const safePath = this.resolveSafePath(subpath);
    if (!fs.existsSync(safePath) || !fs.statSync(safePath).isDirectory()) {
      return [];
    }

    const entries = fs.readdirSync(safePath, { withFileTypes: true });
    const items: FileItem[] = [];

    for (const entry of entries) {
      const fullPath = path.join(safePath, entry.name);
      const isDir = entry.isDirectory();
      let sizeBytes = 0;
      let modifiedAt = new Date().toISOString();

      try {
        const stat = fs.statSync(fullPath);
        sizeBytes = isDir ? 0 : stat.size;
        modifiedAt = stat.mtime.toISOString();
      } catch {}

      const relativePath = path.relative(this.rootDir, fullPath).replace(/\\/g, "/");

      items.push({
        name: entry.name,
        relative_path: relativePath,
        is_dir: isDir,
        size_bytes: sizeBytes,
        modified_at: modifiedAt,
        extension: isDir ? null : path.extname(entry.name).toLowerCase(),
      });
    }

    // Carpetas primero, luego archivos alfabéticamente
    return items.sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1;
      if (!a.is_dir && b.is_dir) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  public createDirectory(subpath: string): string {
    const safePath = this.resolveSafePath(subpath);
    if (!fs.existsSync(safePath)) {
      fs.mkdirSync(safePath, { recursive: true });
    }
    return path.relative(this.rootDir, safePath).replace(/\\/g, "/");
  }

  public readFile(subpath: string, maxChars: number = 5000): string {
    const safePath = this.resolveSafePath(subpath);
    if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
      throw new Error("Archivo no encontrado.");
    }
    const content = fs.readFileSync(safePath, { encoding: "utf-8" });
    return content.slice(0, maxChars);
  }
}

export const sandbox = new FileSandbox();
