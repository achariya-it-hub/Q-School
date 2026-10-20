/**
 * Website lead form (landing page, course pages, webinar sign-ups).
 * POST is public; every submission goes straight into the CRM pipeline.
 * GET (CRM feed) requires a Console session.
 */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { ingestLead, listLeads } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 20);
  if (!name || !phone) return NextResponse.json({ error: "name and phone are required" }, { status: 400 });

  const r = await ingestLead({
    sourceKey: "website",
    source: "Website",
    name,
    phone,
    email: String(body.email ?? "").slice(0, 160),
    interest: String(body.interest ?? "").slice(0, 120),
    formName: String(body.source ?? "website").slice(0, 60),
  });
  return NextResponse.json({ ok: true, leadId: r.lead.id });
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const leads = await listLeads();
  return NextResponse.json({ count: leads.length, leads });
}
