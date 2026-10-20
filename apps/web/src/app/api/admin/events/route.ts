import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { createEvent, listEvents, type NewEventInput } from "@/lib/crm/events-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const events = await listEvents();
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = (await req.json()) as NewEventInput;
    if (!body.name || !body.type) {
      return NextResponse.json({ error: "Event name and type are required" }, { status: 400 });
    }
    const event = await createEvent(body);
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
