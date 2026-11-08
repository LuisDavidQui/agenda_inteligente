import { NextRequest, NextResponse } from "next/server";
import { sandbox } from "@/lib/file_sandbox";

export const dynamic = "force-dynamic";

// GET /api/documents?subpath=...&read=true|false
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subpath = searchParams.get("subpath") || "";
    const isRead = searchParams.get("read") === "true";

    if (isRead) {
      const content = sandbox.readFile(subpath);
      return NextResponse.json({ content, relative_path: subpath });
    }

    const items = sandbox.listFiles(subpath);
    return NextResponse.json({
      items,
      subpath,
      rootDir: sandbox.getRootDir(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST /api/documents (crear carpeta)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const folderPath = body.path;
    if (!folderPath) {
      return NextResponse.json({ error: "Ruta de carpeta requerida" }, { status: 400 });
    }

    const created = sandbox.createDirectory(folderPath);
    return NextResponse.json({ success: true, path: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
