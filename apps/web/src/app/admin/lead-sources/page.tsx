"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, PageHeader, StatusBadge, Toast, useToast } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/icons";

interface Source {
  key: "meta" | "google" | "whatsapp" | "website" | "webhook";
  name: string;
  sub: string;
  url: string;
  env: { name: string; set: boolean; optional?: boolean }[];
  connected: boolean;
  canSync?: boolean;
  note?: string;
  leads: number;
  received: number;
  lastAt: string | null;
  lastError: { at: string; detail?: string } | null;
}

interface LogEv {
  at: string;
  source: string;
  result: "created" | "duplicate" | "error";
  name?: string;
  detail?: string;
}

const ICON: Record<Source["key"], { icon: IconName; bg: string; fg: string }> = {
  meta: { icon: "users", bg: "#EEF2FF", fg: "#3B4CB8" },
  google: { icon: "search", bg: "#FEF3E2", fg: "#9A5B00" },
  whatsapp: { icon: "message", bg: "#E7F7EC", fg: "#1C7A3E" },
  website: { icon: "globe", bg: "#E3F4F0", fg: "#054038" },
  webhook: { icon: "external", bg: "#F1F5F4", fg: "#41564f" },
};

const STEPS: Record<Source["key"], string[]> = {
  meta: [
    "In Meta for Developers, create a Business app and add the Webhooks product.",
    "Subscribe the Page object to the leadgen field. Use the callback URL below and your META_VERIFY_TOKEN.",
    "Connect your Facebook Page to the app, then generate a long-lived Page access token with leads_retrieval, pages_show_list, pages_read_engagement and ads_management.",
    "In Meta Business Suite → Integrations → Leads access, give the app access to the Page's leads.",
    "Put META_APP_SECRET, META_VERIFY_TOKEN and META_PAGE_ACCESS_TOKEN in .env. Optionally list form IDs in META_FORM_IDS to enable Sync now.",
    "Submit a lead with Meta's Lead Ads Testing Tool. It should appear in the pipeline within seconds. Instagram lead forms arrive through the same Page subscription.",
  ],
  google: [
    "In Google Ads, open Assets → Lead forms → your form → Lead delivery options.",
    "Set Webhook URL to the URL below and Key to your GOOGLE_ADS_WEBHOOK_KEY.",
    "Click “Send test data”. The test lead shows up here, tagged Test.",
    "Leads from Search, YouTube, Discovery and Performance Max forms then arrive in real time.",
  ],
  whatsapp: [
    "In your Meta app, add the WhatsApp product and connect your business phone number (Cloud API).",
    "Under WhatsApp → Configuration, set the callback URL below and your WHATSAPP_VERIFY_TOKEN, then subscribe to messages.",
    "Set WHATSAPP_APP_SECRET (or reuse META_APP_SECRET). Every new sender becomes a lead, including Click-to-WhatsApp ad clicks with the ad headline attached.",
    "Optional: set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_AUTO_REPLY to send an instant welcome reply. {name} is replaced with the sender's first name.",
  ],
  website: ["Already live. Every form on the landing and course pages posts to /api/leads and lands in Enquiry."],
  webhook: [
    "Set LEADS_WEBHOOK_KEY in .env.",
    "In JustDial, Sulekha, IndiaMART or Shiksha (or through Zapier/Make for Typeform, Google Sheets and similar), POST leads to /api/integrations/webhook/<source>?key=<LEADS_WEBHOOK_KEY>.",
    "Accepted fields: name, phone or mobile, email, course or category, message or requirement, and id. JSON and form-encoded bodies both work.",
  ],
};

function ago(iso: string | null) {
  if (!iso) return "never";
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export default function LeadSourcesPage() {
  const [data, setData] = useState<{ sources: Source[]; log: LogEv[]; publicUrl: boolean } | null>(null);
  const [openSteps, setOpenSteps] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, show] = useToast();

  const load = useCallback(async () => {
    const r = await fetch("/api/crm/sources", { cache: "no-store" });
    if (r.status === 401) return void (window.location.href = "/admin/login");
    setData(await r.json());
  }, []);
  useEffect(() => {
    load();
    const t = window.setInterval(load, 15000);
    return () => window.clearInterval(t);
  }, [load]);

  const test = async (key: string) => {
    setBusy(key);
    const r = await fetch("/api/crm/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: key }) });
    const d = await r.json();
    setBusy(null);
    const x = d.results?.[0];
    show(x ? `Test lead “${x.name}” ${x.result === "created" ? `created → assigned to ${x.owner}` : "merged as duplicate"}` : d.error || "Failed");
    load();
  };

  const sync = async () => {
    setBusy("sync");
    const r = await fetch("/api/integrations/meta/sync", { method: "POST" });
    const d = await r.json();
    setBusy(null);
    show(r.ok ? `Meta sync: ${d.created} new, ${d.duplicate} already in CRM` : d.error || d.errors?.join("; ") || "Sync failed");
    load();
  };

  const copy = (u: string) => {
    navigator.clipboard?.writeText(u).then(
      () => show("Webhook URL copied"),
      () => show(u),
    );
  };

  return (
    <AdminShell>
      <PageHeader title="Lead Sources" sub="Leads flow in automatically from ads, WhatsApp and your website — de-duplicated and auto-assigned round-robin" />

      {data && !data.publicUrl && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-[#F6E6C2] bg-[#FFF8EA] p-4 text-[13px] text-[#6B4A00]">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          <p>
            Meta, Google and WhatsApp can only reach a <b>public HTTPS URL</b>. Deploy the web app (or use a tunnel such as Cloudflare Tunnel / ngrok while testing) and set{" "}
            <code className="rounded bg-white/70 px-1">PUBLIC_BASE_URL</code> so the URLs below are correct.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {(data?.sources ?? []).map((s) => {
          const ic = ICON[s.key];
          const missing = s.env.filter((e) => !e.set && !e.optional);
          return (
            <Card key={s.key}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: ic.bg, color: ic.fg }}>
                  <Icon name={ic.icon} size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-brand-ink">{s.name}</p>
                  <p className="text-[12px] text-[#6b807b]">{s.sub}</p>
                </div>
                <StatusBadge tone={s.connected ? "good" : "warning"}>{s.connected ? "Connected" : "Setup needed"}</StatusBadge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-[#F6FAF9] py-2.5">
                  <p className="text-[18px] font-semibold text-brand-ink">{s.leads}</p>
                  <p className="text-[11px] text-[#6b807b]">leads in CRM</p>
                </div>
                <div className="rounded-xl bg-[#F6FAF9] py-2.5">
                  <p className="text-[14px] font-semibold text-brand-ink">{ago(s.lastAt)}</p>
                  <p className="text-[11px] text-[#6b807b]">last lead received</p>
                </div>
              </div>

              <p className="mb-1 mt-4 text-[11.5px] font-semibold text-[#41564f]">{s.key === "website" ? "Form endpoint" : "Webhook URL"}</p>
              <div className="flex items-center gap-2 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 py-2">
                <code className="min-w-0 flex-1 truncate text-[11.5px] text-brand-ink">{s.url}</code>
                <button onClick={() => copy(s.url)} className="shrink-0 text-[12px] font-semibold text-brand-teal hover:underline">
                  Copy
                </button>
              </div>

              {s.env.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.env.map((e) => (
                    <span
                      key={e.name}
                      title={e.set ? "Configured" : e.optional ? "Optional" : "Required — not set"}
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10.5px] ${
                        e.set ? "bg-[#EAF7EA] text-[#0A7F0A]" : e.optional ? "bg-[#F1F5F4] text-[#7B8E89]" : "bg-[#FCEDED] text-[#B42E2E]"
                      }`}
                    >
                      <Icon name={e.set ? "check" : e.optional ? "plus" : "x"} size={11} strokeWidth={2.4} />
                      {e.name}
                    </span>
                  ))}
                </div>
              )}
              {s.note && <p className="mt-2 text-[11.5px] text-[#7B8E89]">{s.note}</p>}
              {s.lastError && (
                <p className="mt-2 rounded-lg bg-[#FCEDED] px-2.5 py-1.5 text-[11.5px] text-[#B42E2E]">
                  Last error {ago(s.lastError.at)}: {s.lastError.detail}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Btn variant="ghost" icon="sparkle" onClick={() => test(s.key)} disabled={busy === s.key}>
                  {busy === s.key ? "Sending…" : "Send test lead"}
                </Btn>
                {s.key === "meta" && (
                  <Btn variant="ghost" icon="undo" onClick={sync} disabled={!s.canSync || busy === "sync"}>
                    {busy === "sync" ? "Syncing…" : "Sync now"}
                  </Btn>
                )}
                <button onClick={() => setOpenSteps(openSteps === s.key ? null : s.key)} className="ml-auto text-[12.5px] font-semibold text-brand-teal hover:underline">
                  {openSteps === s.key ? "Hide setup" : missing.length ? "How to connect" : "Setup steps"}
                </button>
              </div>
              {openSteps === s.key && (
                <ol className="mt-3 list-decimal space-y-1.5 border-t border-[#EEF3F1] pl-5 pt-3 text-[12.5px] text-[#41564f]">
                  {STEPS[s.key].map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              )}
            </Card>
          );
        })}
      </div>

      <Card title="Recent activity" className="mt-5" action={<span className="text-[12px] text-[#6b807b]">Auto-refreshes</span>}>
        <ul className="divide-y divide-[#F0F4F3]">
          {(data?.log ?? []).map((e, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3 py-2.5 text-[13px]">
              <span className="w-[120px] shrink-0 text-[12px] tabular-nums text-[#6b807b]">{new Date(e.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              <StatusBadge tone={e.result === "created" ? "good" : e.result === "duplicate" ? "neutral" : "critical"}>
                {e.result === "created" ? "New lead" : e.result === "duplicate" ? "Duplicate" : "Error"}
              </StatusBadge>
              <span className="font-medium text-brand-ink">{e.source}</span>
              <span className="min-w-0 flex-1 truncate text-[#41564f]">{e.name ?? e.detail}</span>
            </li>
          ))}
          {data && !data.log.length && <li className="py-8 text-center text-[#7B8E89]">No leads received yet. Send a test lead to try it.</li>}
        </ul>
      </Card>
      <Toast msg={toast} />
    </AdminShell>
  );
}
