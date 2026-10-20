import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { deleteSession, getSession, updateSession } from "@/lib/live/store";
import { liveNotice } from "@/lib/whatsapp/automations";

export const dynamic = "force-dynamic";
type P = { params: { id: string } };

export async function GET(_req: Request, { params }: P) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const s = await getSession(params.id);
  return s ? NextResponse.json({ session: s }) : NextResponse.json({ error: "Session not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: P) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const before = await getSession(params.id);
    const body = (await req.json()) as Record<string, unknown>;
    const session = await updateSession(params.id, body);
    // WhatsApp: tell registered people about a cancellation or a new date/time (unless the admin unticked it)
    if (before && body.notify !== false && session.registrations.length) {
      if (session.status === "cancelled" && before.status !== "cancelled") await liveNotice(session.id, "live_cancelled", req, { once: false }).catch(() => undefined);
      else if (session.status === "scheduled" && before.startsAt !== session.startsAt && Date.parse(session.startsAt) > Date.now())
        await liveNotice(session.id, "live_changed", req).catch(() => undefined);
    }
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: P) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    await deleteSession(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
