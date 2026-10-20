/** Lead Sources screen: connector configuration status, webhook URLs, counters and the ingest log. */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { GRAPH_VERSION } from "@/lib/crm/connectors";
import { listLeads, readLog, readState, type SourceKey } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

const has = (...k: string[]) => k.every((x) => !!process.env[x]);

export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const base = process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
  const [state, log, leads] = await Promise.all([readState(), readLog(), listLeads()]);
  const count = (k: SourceKey) => leads.filter((l) => l.sourceKey === k).length;

  const sources = [
    {
      key: "meta",
      name: "Meta Lead Ads",
      sub: "Facebook & Instagram instant forms",
      url: `${base}/api/integrations/meta`,
      env: [
        { name: "META_VERIFY_TOKEN", set: has("META_VERIFY_TOKEN") },
        { name: "META_APP_SECRET", set: has("META_APP_SECRET") },
        { name: "META_PAGE_ACCESS_TOKEN", set: has("META_PAGE_ACCESS_TOKEN") },
        { name: "META_FORM_IDS", set: has("META_FORM_IDS"), optional: true },
      ],
      connected: has("META_VERIFY_TOKEN", "META_APP_SECRET", "META_PAGE_ACCESS_TOKEN"),
      canSync: has("META_PAGE_ACCESS_TOKEN", "META_FORM_IDS"),
      note: `Graph API ${GRAPH_VERSION} · permission leads_retrieval`,
    },
    {
      key: "google",
      name: "Google Ads",
      sub: "Lead form assets (Search, YouTube, Discovery, PMax)",
      url: `${base}/api/integrations/google-ads`,
      env: [{ name: "GOOGLE_ADS_WEBHOOK_KEY", set: has("GOOGLE_ADS_WEBHOOK_KEY") }],
      connected: has("GOOGLE_ADS_WEBHOOK_KEY"),
    },
    {
      key: "whatsapp",
      name: "WhatsApp Business",
      sub: "Cloud API inbox + Click-to-WhatsApp ads",
      url: `${base}/api/integrations/whatsapp`,
      env: [
        { name: "WHATSAPP_VERIFY_TOKEN", set: has("WHATSAPP_VERIFY_TOKEN") },
        { name: "WHATSAPP_APP_SECRET", set: has("WHATSAPP_APP_SECRET") || has("META_APP_SECRET") },
        { name: "WHATSAPP_TOKEN", set: has("WHATSAPP_TOKEN"), optional: true },
        { name: "WHATSAPP_PHONE_NUMBER_ID", set: has("WHATSAPP_PHONE_NUMBER_ID"), optional: true },
        { name: "WHATSAPP_AUTO_REPLY", set: has("WHATSAPP_AUTO_REPLY"), optional: true },
      ],
      connected: has("WHATSAPP_VERIFY_TOKEN") && (has("WHATSAPP_APP_SECRET") || has("META_APP_SECRET")),
    },
    {
      key: "website",
      name: "Website forms",
      sub: "Landing page, course & webinar sign-ups",
      url: `${base}/api/leads`,
      env: [],
      connected: true,
    },
    {
      key: "webhook",
      name: "Other sources",
      sub: "JustDial, Sulekha, IndiaMART, Zapier / Make, Typeform…",
      url: `${base}/api/integrations/webhook/justdial?key=${process.env.LEADS_WEBHOOK_KEY ? "••••••" : "<LEADS_WEBHOOK_KEY>"}`,
      env: [{ name: "LEADS_WEBHOOK_KEY", set: has("LEADS_WEBHOOK_KEY") }],
      connected: has("LEADS_WEBHOOK_KEY"),
    },
  ].map((s) => ({
    ...s,
    leads: count(s.key as SourceKey),
    received: state.counts[s.key as SourceKey] ?? 0,
    lastAt: state.last[s.key as SourceKey] ?? null,
    lastError: log.find((e) => e.sourceKey === s.key && e.result === "error") ?? null,
  }));

  return NextResponse.json({ sources, log: log.slice(0, 40), publicUrl: !!process.env.PUBLIC_BASE_URL, metaSyncedUntil: state.metaSyncedUntil ?? null });
}
