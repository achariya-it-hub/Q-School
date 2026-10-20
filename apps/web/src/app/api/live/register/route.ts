import { NextResponse } from "next/server";
import { ingestLead } from "@/lib/crm/store";
import { register } from "@/lib/live/store";
import { KIND_LABEL } from "@/lib/live/types";
import { liveRegistered } from "@/lib/whatsapp/automations";

export const dynamic = "force-dynamic";

/**
 * Public: register for a webinar / workshop. Returns a private join link and also
 * drops the person into the CRM pipeline (source "Website", interest = session title).
 */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(b.name ?? "").trim().slice(0, 80);
  const phone = String(b.phone ?? "").trim().slice(0, 20);
  const email = String(b.email ?? "").trim().slice(0, 160);
  const sessionId = String(b.sessionId ?? "").slice(0, 60);
  if (!name || phone.replace(/\D/g, "").length < 10) return NextResponse.json({ error: "Please enter your name and a 10-digit mobile number" }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
  try {
    const { session, reg, again } = await register(sessionId, { name, phone, email });
    if (!again) {
      await ingestLead({
        sourceKey: "website",
        source: "Website",
        name,
        phone,
        email,
        interest: `${KIND_LABEL[session.kind]}: ${session.title}`.slice(0, 120),
        formName: "live_registration",
      }).catch(() => undefined);
      await liveRegistered(session, reg, req).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, again, joinPath: `/live/join/${reg.token}` });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
