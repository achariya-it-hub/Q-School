import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/staff-auth";
import { isTaskAction, performTaskAction, readTasks } from "@/lib/tasks-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentStaff();
  if (!me) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ ok: true, name: me.name, tasks: (await readTasks()).filter((t) => t.assignee === me.name) });
}

/** Staff may update only their own tasks, and cannot create tasks. */
export async function POST(req: Request) {
  const me = await currentStaff();
  if (!me) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!isTaskAction(body) || body.type === "create") return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const own = (await readTasks()).find((t) => t.id === body.id && t.assignee === me.name);
  if (!own) return NextResponse.json({ error: "Not your task" }, { status: 403 });
  const all = await performTaskAction(body, me.name);
  return NextResponse.json({ ok: true, tasks: all.filter((t) => t.assignee === me.name) });
}
