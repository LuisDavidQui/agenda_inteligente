import { NextRequest, NextResponse } from "next/server";
import { getTasks, saveTasks } from "@/lib/storage";
import { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/tasks
export async function GET(req: NextRequest) {
  try {
    const tasks = getTasks();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const project = searchParams.get("project");

    let filtered = tasks;
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (project) {
      filtered = filtered.filter((t) => t.project === project);
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      due_date: body.due_date || null,
      project: body.project || "General",
      documents: body.documents || [],
      created_at: new Date().toISOString(),
    };

    const currentTasks = getTasks();
    saveTasks([newTask, ...currentTasks]);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/tasks (actualizar tarea)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID de la tarea" }, { status: 400 });
    }

    const currentTasks = getTasks();
    const index = currentTasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    currentTasks[index] = {
      ...currentTasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    saveTasks(currentTasks);
    return NextResponse.json(currentTasks[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/tasks?id=xyz
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID" }, { status: 400 });
    }

    const currentTasks = getTasks();
    const filtered = currentTasks.filter((t) => t.id !== id);
    saveTasks(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
