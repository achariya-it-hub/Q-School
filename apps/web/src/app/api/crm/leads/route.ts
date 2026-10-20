import { NextResponse } from "next/server";
import type { Stage } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { ingestLead, listLeads, updateLead } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "Unauthorised — sign in to the Console" }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return deny();
  return NextResponse.json({ leads: await listLeads() });
}

/** Manual lead (walk-in, phone call). */
export async function POST(req: Request) {
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.phone) return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  const r = await ingestLead({ sourceKey: "webhook", source: String(b.source || "Walk-in"), name: b.name, phone: b.phone, email: b.email, interest: b.interest });
  if (r.result === "created" && (b.owner || b.value)) await updateLead(r.lead.id, { owner: b.owner, value: Number(b.value) || 0 });
  return NextResponse.json({ ok: true, ...r });
}

/** Stage move, reassignment, expected fee, or activity note. */
export async function PATCH(req: Request) {
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const lead = await updateLead(String(b.id), { stage: b.stage as Stage | undefined, owner: b.owner, value: b.value, activity: b.activity });
  return lead ? NextResponse.json({ ok: true, lead }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
