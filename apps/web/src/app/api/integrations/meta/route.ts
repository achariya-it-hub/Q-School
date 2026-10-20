/**
 * Meta Lead Ads webhook (Facebook + Instagram lead forms).
 * Setup: Meta App → Webhooks → Page → subscribe to `leadgen`; callback = https://<your-domain>/api/integrations/meta
 * Env: META_VERIFY_TOKEN, META_APP_SECRET, META_PAGE_ACCESS_TOKEN (leads_retrieval), optional META_GRAPH_VERSION.
 */
import { NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/crm/auth";
import { fetchMetaLead, mapMetaLead, parseMetaWebhook } from "@/lib/crm/connectors";
import { ingestLead, logError } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

/** Subscription handshake: echo hub.challenge when the verify token matches. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const ok = u.searchParams.get("hub.mode") === "subscribe" && !!process.env.META_VERIFY_TOKEN && u.searchParams.get("hub.verify_token") === process.env.META_VERIFY_TOKEN;
  return ok ? new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200 }) : new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), process.env.META_APP_SECRET);
  if (!sig.ok) {
    await logError("meta", "Rejected webhook: bad X-Hub-Signature-256");
    return new Response("Invalid signature", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const changes = parseMetaWebhook(body);
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  for (const c of changes) {
    try {
      if (!token) {
        await logError("meta", `Lead ${c.leadgen_id} received but META_PAGE_ACCESS_TOKEN is not set — cannot fetch answers`);
        continue;
      }
      const lead = await fetchMetaLead(c.leadgen_id, token);
      await ingestLead(mapMetaLead({ ...lead, form_id: lead.form_id ?? c.form_id, ad_id: lead.ad_id ?? c.ad_id }));
    } catch (e) {
      await logError("meta", `Lead ${c.leadgen_id}: ${(e as Error).message}`);
    }
  }
  // Always 200 for a correctly signed request so Meta doesn't retry; failures are in the ingest log.
  return NextResponse.json({ ok: true, received: changes.length });
}
