import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { isTaskAction, performTaskAction, readTasks } from "@/lib/tasks-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ ok: true, tasks: await readTasks() });
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!isTaskAction(body)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  return NextResponse.json({ ok: true, tasks: await performTaskAction(body, "Admin") });
}
