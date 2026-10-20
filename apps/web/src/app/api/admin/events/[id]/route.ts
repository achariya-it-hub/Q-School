import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { deleteEvent, getEvent, listAttendees, updateEvent } from "@/lib/crm/events-store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const event = await getEvent(params.id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const attendees = await listAttendees(event.id);
    return NextResponse.json({ event, attendees });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const patch = await req.json();
    const event = await updateEvent(params.id, patch);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const ok = await deleteEvent(params.id);
    if (!ok) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
