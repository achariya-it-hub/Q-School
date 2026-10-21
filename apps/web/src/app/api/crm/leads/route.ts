import { NextResponse } from "next/server";
import type { Stage } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { bulkIngestLeads, ingestLead, listLeads, updateLead, type IncomingLead } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "Unauthorised — sign in to the Console" }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return deny();
  return NextResponse.json({ leads: await listLeads() });
}

/** Manual lead (walk-in, phone call) or Bulk Lead Upload. */
export async function POST(req: Request) {
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));

  // Bulk Import
  if (Array.isArray(b.rows) || Array.isArray(b.leads)) {
    const rawRows = (b.rows || b.leads) as any[];
    if (!rawRows.length) {
      return NextResponse.json({ error: "No leads data provided" }, { status: 400 });
    }
    const inputs: (IncomingLead & { owner?: string; value?: number; stage?: Stage })[] = rawRows
      .filter((r) => r && (r.name?.trim() || r.phone?.trim()))
      .map((r) => ({
        sourceKey: r.sourceKey || "webhook",
        source: String(r.source || "Bulk Upload"),
        name: r.name ? String(r.name).trim() : undefined,
        phone: r.phone ? String(r.phone).trim() : undefined,
        email: r.email ? String(r.email).trim() : undefined,
        interest: r.interest ? String(r.interest).trim() : undefined,
        campaign: r.campaign ? String(r.campaign).trim() : undefined,
        owner: r.owner ? String(r.owner).trim() : undefined,
        value: typeof r.value === "number" ? r.value : Number(r.value) || 0,
        stage: r.stage as Stage | undefined,
      }));

    if (!inputs.length) {
      return NextResponse.json(
        { error: "No valid lead rows found (each row needs at least a name or phone number)" },
        { status: 400 }
      );
    }

    const res = await bulkIngestLeads(inputs);
    return NextResponse.json({ ok: true, ...res });
  }

  // Single Lead Create
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
