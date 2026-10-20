import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { addAttendee, deleteAttendee, getEvent, listAttendees, toggleAttendance, type NewAttendeeInput } from "@/lib/crm/events-store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const event = await getEvent(params.id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const attendees = await listAttendees(event.id);
    return NextResponse.json({ attendees });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const event = await getEvent(params.id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const body = (await req.json()) as NewAttendeeInput;
    if (!body.parentName || !body.phone) {
      return NextResponse.json({ error: "Parent name and phone number are required" }, { status: 400 });
    }

    const res = await addAttendee({
      ...body,
      eventId: event.id,
      eventCode: event.code,
    });

    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { attendeeId, attended } = (await req.json()) as { attendeeId: string; attended?: boolean };
    if (!attendeeId) return NextResponse.json({ error: "attendeeId is required" }, { status: 400 });

    const updated = await toggleAttendance(attendeeId, attended);
    if (!updated) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    return NextResponse.json({ attendee: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const url = new URL(req.url);
  const attendeeId = url.searchParams.get("attendeeId");
  if (!attendeeId) return NextResponse.json({ error: "attendeeId is required" }, { status: 400 });

  try {
    const ok = await deleteAttendee(attendeeId);
    return NextResponse.json({ ok });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
