import { NextResponse } from "next/server";
import type { Stage } from "@qschool/shared";
import { centreName } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { getLeadScope, inScope } from "@/lib/crm/scope";
import {
  bulkIngestLeads,
  clearAllLeads,
  deleteLead,
  ingestLead,
  listLeads,
  removeTestLeads,
  updateLead,
  type IncomingLead,
} from "@/lib/crm/store";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "Unauthorised — sign in to the Console" }, { status: 401 });
const forbid = (msg = "This lead belongs to another centre") => NextResponse.json({ error: msg }, { status: 403 });

/** Signed-in Console user + the centre they're limited to (if any). Students never get CRM access. */
async function who() {
  if (!isAdmin()) return null;
  const scope = await getLeadScope();
  if (scope.role === "Student") return null;
  return scope;
}

export async function GET() {
  const scope = await who();
  if (!scope) return deny();
  const leads = (await listLeads()).filter((l) => inScope(scope, l));
  return NextResponse.json({ leads, scope: scope.centreId ?? "all" });
}

/** Manual lead (walk-in, phone call) or Bulk Lead Upload. */
export async function POST(req: Request) {
  const scope = await who();
  if (!scope) return deny();
  const b = await req.json().catch(() => ({}));
  // A centre-bound user can only create leads for their own centre.
  const forced = scope.centreId ? { centreId: scope.centreId, location: centreName(scope.centreId) } : null;

  // Bulk Import
  if (Array.isArray(b.rows) || Array.isArray(b.leads)) {
    const rawRows = (b.rows || b.leads) as any[];
    if (!rawRows.length) {
      return NextResponse.json({ error: "No leads data provided" }, { status: 400 });
    }
    const inputs: (IncomingLead & { owner?: string; value?: number; stage?: Stage })[] = rawRows
      .filter((r) => r && (String(r.name ?? "").trim() || String(r.phone ?? "").trim()))
      .map((r) => ({
        sourceKey: r.sourceKey || "webhook",
        source: String(r.source || "Bulk Upload"),
        name: r.name ? String(r.name).trim() : undefined,
        phone: r.phone ? String(r.phone).trim() : undefined,
        email: r.email ? String(r.email).trim() : undefined,
        interest: r.interest ? String(r.interest).trim() : undefined,
        campaign: r.campaign ? String(r.campaign).trim() : undefined,
        owner: r.owner ? String(r.owner).trim() : undefined,
        location: r.location ? String(r.location).trim() : undefined,
        centreId: r.centreId ? String(r.centreId).trim() : undefined,
        value: typeof r.value === "number" ? r.value : Number(r.value) || 0,
        stage: r.stage as Stage | undefined,
        ...(forced ?? {}),
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
  const r = await ingestLead({
    sourceKey: "webhook",
    source: String(b.source || "Walk-in"),
    name: b.name,
    phone: b.phone,
    email: b.email,
    interest: b.interest,
    location: b.location,
    centreId: b.centreId,
    owner: b.owner || undefined,
    value: Number(b.value) || 0,
    ...(forced ?? {}),
  });
  // Existing lead from another centre: tell the user instead of silently "adding" it to a list they can't see.
  if (r.result === "duplicate" && !inScope(scope, r.lead)) {
    return NextResponse.json({ ok: true, result: r.result, hidden: true, lead: { id: r.lead.id, name: r.lead.name, location: r.lead.location } });
  }
  return NextResponse.json({ ok: true, result: r.result, lead: r.lead });
}

/** Stage move, reassignment, expected fee, or activity note. */
export async function PATCH(req: Request) {
  const scope = await who();
  if (!scope) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (scope.centreId) {
    const cur = (await listLeads()).find((l) => l.id === String(b.id));
    if (cur && !inScope(scope, cur)) return forbid();
  }
  const lead = await updateLead(String(b.id), {
    stage: b.stage as Stage | undefined,
    owner: b.owner,
    value: b.value,
    activity: b.activity,
    extra: b.extra,
  });
  return lead ? NextResponse.json({ ok: true, lead }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

/** Delete a single lead by ?id=..., remove all test leads (?mode=test), or clear all leads (?mode=all). */
export async function DELETE(req: Request) {
  const scope = await who();
  if (!scope) return deny();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");

  if ((mode === "all" || mode === "test") && scope.centreId) return forbid("Only an admin can bulk-delete leads");

  if (mode === "all") {
    const res = await clearAllLeads();
    return NextResponse.json({ ok: true, ...res, leads: [] });
  }

  if (mode === "test") {
    const res = await removeTestLeads();
    return NextResponse.json({ ok: true, ...res, leads: await listLeads() });
  }

  if (!id) {
    return NextResponse.json({ error: "id or mode required" }, { status: 400 });
  }

  if (scope.centreId) {
    const cur = (await listLeads()).find((l) => l.id === id);
    if (cur && !inScope(scope, cur)) return forbid();
  }
  await deleteLead(id);
  return NextResponse.json({ ok: true, id });
}
