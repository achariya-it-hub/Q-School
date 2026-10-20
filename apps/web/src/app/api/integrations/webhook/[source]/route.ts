/**
 * Generic lead webhook for any other source: JustDial, Sulekha, IndiaMART, Shiksha, Zapier/Make, Typeform, Google Sheets…
 *   POST https://<your-domain>/api/integrations/webhook/justdial?key=<LEADS_WEBHOOK_KEY>
 *   (or header `x-api-key: <LEADS_WEBHOOK_KEY>`), JSON or form-encoded body.
 * Recognised fields: name/full_name, phone/mobile, email, interest/course/category, message/requirement, id/lead_id.
 */
import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/crm/auth";
import { mapGeneric } from "@/lib/crm/connectors";
import { ingestLead, logError } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { source: string } }) {
  const source = (params.source || "webhook").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30) || "webhook";
  const expected = process.env.LEADS_WEBHOOK_KEY;
  const given = new URL(req.url).searchParams.get("key") || req.headers.get("x-api-key") || "";
  if (!expected) return NextResponse.json({ error: "LEADS_WEBHOOK_KEY not configured" }, { status: 503 });
  if (!given || !safeEqual(given, expected)) {
    await logError("webhook", `Rejected ${source} lead: bad key`);
    return NextResponse.json({ error: "Invalid key" }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) body = await req.json();
    else body = Object.fromEntries((await req.formData()).entries()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Unreadable body" }, { status: 400 });
  }

  const lead = mapGeneric(source, body);
  if (!lead.phone && !lead.email) return NextResponse.json({ error: "phone or email required" }, { status: 400 });
  const r = await ingestLead(lead);
  return NextResponse.json({ ok: true, result: r.result, leadId: r.lead.id });
}
