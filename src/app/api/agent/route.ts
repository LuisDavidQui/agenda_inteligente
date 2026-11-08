import { NextRequest, NextResponse } from "next/server";
import { processAgentCommand } from "@/lib/agent_logic";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query;
    if (!query) {
      return NextResponse.json({ error: "Query requerida" }, { status: 400 });
    }

    const response = processAgentCommand(query);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
