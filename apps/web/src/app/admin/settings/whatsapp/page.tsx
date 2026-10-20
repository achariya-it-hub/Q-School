"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Btn, Card, Toast, useToast } from "@/components/admin/ui";
import { Row, TextField, Toggle, fieldInput } from "@/components/admin/site-fields";
import { useSettings } from "@/components/admin/use-settings";
import { WA_GREEN, useTemplates } from "@/components/admin/whatsapp";
import { Icon } from "@/components/icons";
import type { WhatsAppSettings } from "@/lib/settings/store";
import { WA_EVENTS, WA_EVENT_KEYS, type WaEvent } from "@/lib/whatsapp/types";

type Form = WhatsAppSettings;

const REMINDER_CHOICES = [
  { m: 2880, label: "2 days" },
  { m: 1440, label: "1 day" },
  { m: 180, label: "3 hours" },
  { m: 60, label: "1 hour" },
  { m: 15, label: "15 min" },
];

const TPL_TONE: Record<string, string> = {
  APPROVED: "bg-[#EAF7EA] text-[#0A7F0A]",
  PENDING: "bg-[#FFF6E0] text-[#8A5A00]",
  IN_APPEAL: "bg-[#FFF6E0] text-[#8A5A00]",
  REJECTED: "bg-[#FCEDED] text-[#B42E2E]",
  PAUSED: "bg-[#FDEFE8] text-[#A9471F]",
  DISABLED: "bg-[#FCEDED] text-[#B42E2E]",
};

const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");

export default function WhatsAppSettingsPage() {
  const { data, save } = useSettings();
  const [f, setF] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [origin, setOrigin] = useState("");
  const [toast, show] = useToast();
  const tpl = useTemplates();

  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    if (!data) return;
    const { hasToken: _a, tokenHint: _b, hasAppSecret: _c, fromEnv: _d, configured: _e, ...rest } = data.whatsapp;
    setF({ ...rest, token: "", appSecret: "" });
  }, [data]);

  const saved = useMemo(() => {
    if (!data) return null;
    const { hasToken: _a, tokenHint: _b, hasAppSecret: _c, fromEnv: _d, configured: _e, ...rest } = data.whatsapp;
    return { ...rest, token: "", appSecret: "" };
  }, [data]);

  if (!f || !data || !saved) {
    return (
      <AdminShell>
        <SettingsNav />
        <p className="p-4 text-sm text-[#6b807b]">Loading…</p>
      </AdminShell>
    );
  }
  const w = data.whatsapp;
  const u = <K extends keyof Form>(k: K) => (v: Form[K]) => setF({ ...f, [k]: v });
  const ev = (k: WaEvent, p: Partial<Form["events"][WaEvent]>) => setF({ ...f, events: { ...f.events, [k]: { ...f.events[k], ...p } } });
  const dirty = JSON.stringify(saved) !== JSON.stringify(f);
  const webhook = `${f.siteUrl || origin}/api/integrations/whatsapp`;
  const status = (k: WaEvent) => tpl.templates.find((t) => t.name === f.events[k].template && t.language === f.events[k].language)?.status;

  const runTest = async () => {
    setTesting(true);
    setTest(null);
    const r = await fetch("/api/admin/whatsapp/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: f.token, phoneNumberId: f.phoneNumberId, wabaId: f.wabaId }),
    });
    const d = await r.json();
    setTesting(false);
    setTest(
      d.ok
        ? {
            ok: true,
            text: `Connected to ${d.name || "your business"} (${d.number}).${d.quality ? ` Quality: ${String(d.quality).toLowerCase()}.` : ""}${d.templates !== null ? ` ${d.templates} template${d.templates === 1 ? "" : "s"} found.` : ""}`,
          }
        : { ok: false, text: d.error ?? "Connection failed" },
    );
  };

  const createTemplates = async () => {
    setCreating(true);
    const r = await fetch("/api/admin/whatsapp/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const d = await r.json();
    setCreating(false);
    if (!r.ok) return show(d.error ?? "Couldn't create templates");
    tpl.setTemplates(d.templates ?? []);
    tpl.setSyncedAt(d.syncedAt ?? null);
    const made = (d.results ?? []).filter((x: { result: string }) => x.result === "created").length;
    const failed = (d.results ?? []).filter((x: { result: string }) => x.result === "error");
    show(failed.length ? `${made} submitted, ${failed.length} failed: ${failed[0].detail}` : made ? `${made} templates submitted to Meta for approval` : "All templates already exist");
  };

  const groups = Array.from(new Set(WA_EVENT_KEYS.map((k) => WA_EVENTS[k].group)));

  return (
    <AdminShell>
      <SettingsNav />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (f.enabled && (!f.phoneNumberId || (!f.token && !w.hasToken))) return show("Add the Phone number ID and access token before switching WhatsApp on");
          setBusy(true);
          try {
            await save({ whatsapp: f });
            show("WhatsApp settings saved");
          } catch (err) {
            show((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]"
      >
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: WA_GREEN }}>
                <Icon name="message" size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-brand-ink">WhatsApp Business (Cloud API)</p>
                <p className="text-[12.5px] text-[#6b807b]">Class updates, reminders, bills and receipts, and two-way chat with leads, from your official business number.</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                  w.configured && w.enabled ? "bg-[#EAF7EA] text-[#0A7F0A]" : w.configured ? "bg-[#F1F5F4] text-[#41564F]" : "bg-[#FFF6E0] text-[#8A5A00]"
                }`}
              >
                {w.configured && w.enabled ? "● Connected & on" : w.configured ? "Set up, switched off" : "Not connected"}
              </span>
            </div>
            <div className="mt-4">
              <Toggle label="Send WhatsApp messages" hint="Master switch for automatic messages, broadcasts and Console sends" checked={f.enabled} onChange={u("enabled")} />
            </div>
          </Card>

          <Card title="Connection">
            <div className="space-y-4">
              <Row>
                <TextField label="Phone number ID" hint={w.fromEnv.phoneNumberId ? "set on the server" : "WhatsApp › API Setup"} value={f.phoneNumberId} onChange={u("phoneNumberId")} max={40} placeholder="e.g. 109876543210987" />
                <TextField label="WhatsApp Business Account ID" hint={w.fromEnv.wabaId ? "set on the server" : "needed for templates"} value={f.wabaId} onChange={u("wabaId")} max={40} placeholder="e.g. 102345678901234" />
              </Row>
              <label className="block">
                <span className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[#41564f]">
                    Permanent access token
                    <span className="ml-1.5 font-normal text-[#8aa39c]">{w.fromEnv.token ? "set by WHATSAPP_TOKEN on the server" : "System User token, stored on the server only"}</span>
                  </span>
                  {w.tokenHint && <span className="font-mono text-[11.5px] text-[#6b807b]">current: {w.tokenHint}</span>}
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={f.token}
                  onChange={(e) => u("token")(e.target.value)}
                  placeholder={w.hasToken ? "Leave blank to keep the current token" : "Paste the token (starts with EAA…)"}
                  className={`${fieldInput} font-mono`}
                />
              </label>
              <Row>
                <TextField
                  label="Your website address"
                  hint="used in links inside messages"
                  value={f.siteUrl}
                  onChange={u("siteUrl")}
                  max={200}
                  placeholder={origin || "https://qschool.in"}
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={testing || !f.phoneNumberId || (!f.token && !w.hasToken)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-teal bg-white text-[13px] font-semibold text-brand-teal transition hover:bg-brand-teal100/50 disabled:opacity-40"
                  >
                    <Icon name="message" size={16} /> {testing ? "Testing…" : "Test connection"}
                  </button>
                </div>
              </Row>
              {test && (
                <p className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[13px] ${test.ok ? "bg-[#EAF7EA] text-[#0A6B0A]" : "bg-[#FDF2F2] text-[#B42E2E]"}`}>
                  <Icon name={test.ok ? "check" : "alert"} size={16} className="mt-0.5 shrink-0" /> {test.text}
                </p>
              )}
            </div>
          </Card>

          <Card title="Webhook (replies & delivery ticks)">
            <div className="space-y-4">
              <p className="text-[12.5px] text-[#6b807b]">
                In your Meta app go to WhatsApp › Configuration, paste these two values, click Verify and save, then subscribe to <b>messages</b>.
              </p>
              <CopyRow label="Callback URL" value={webhook} onCopy={() => show("Callback URL copied")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <TextField label="Verify token" hint={w.fromEnv.verifyToken ? "set on the server" : "any secret word you choose"} value={f.verifyToken} onChange={u("verifyToken")} max={100} />
                <div className="flex items-end gap-2">
                  <Btn variant="ghost" onClick={() => u("verifyToken")(randomToken())}>
                    Generate
                  </Btn>
                  <Btn variant="ghost" icon="clipboard" onClick={() => (navigator.clipboard.writeText(f.verifyToken), show("Verify token copied"))} disabled={!f.verifyToken}>
                    Copy
                  </Btn>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">
                  App secret
                  <span className="ml-1.5 font-normal text-[#8aa39c]">
                    {w.fromEnv.appSecret ? "set on the server" : w.hasAppSecret ? "saved, leave blank to keep" : "Meta app › Settings › Basic; proves webhooks really come from Meta"}
                  </span>
                </span>
                <input type="password" autoComplete="new-password" value={f.appSecret} onChange={(e) => u("appSecret")(e.target.value)} className={`${fieldInput} font-mono`} placeholder={w.hasAppSecret ? "••••••••" : ""} />
              </label>
            </div>
          </Card>

          <Card
            title="Automatic messages"
            action={
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => tpl.reload(true)} disabled={tpl.loading || !w.configured}>
                  {tpl.loading ? "Checking…" : "Check status"}
                </Btn>
                <Btn icon="plus" onClick={createTemplates} disabled={creating || !w.configured || !saved.wabaId}>
                  {creating ? "Submitting…" : "Create templates in Meta"}
                </Btn>
              </div>
            }
          >
            <p className="-mt-1 mb-3 text-[12.5px] text-[#6b807b]">
              WhatsApp only lets businesses start a conversation with a <b>template</b> that Meta has approved. Click <b>Create templates in Meta</b> once to submit the
              wording below (approval usually takes minutes to a few hours), then save. To build custom broadcast templates, visit{" "}
              <Link href="/admin/whatsapp" className="font-semibold text-brand-teal hover:underline">
                WhatsApp › Templates
              </Link>
              .
              {tpl.error && <span className="mt-1 block text-[#B42E2E]">{tpl.error}</span>}
            </p>
            <div className="space-y-5">
              {groups.map((g) => (
                <div key={g}>
                  <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-[#7B8E89]">{g}</p>
                  <div className="space-y-2">
                    {WA_EVENT_KEYS.filter((k) => WA_EVENTS[k].group === g).map((k) => {
                      const d = WA_EVENTS[k];
                      const s = status(k);
                      return (
                        <details key={k} className="group rounded-xl border border-[#E2ECE9] bg-[#F7FAF9]">
                          <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-2.5">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={f.events[k].enabled}
                              aria-label={d.label}
                              onClick={(e) => (e.preventDefault(), ev(k, { enabled: !f.events[k].enabled }))}
                              className={`relative h-6 w-11 shrink-0 rounded-full transition ${f.events[k].enabled ? "bg-brand-teal" : "bg-[#C9D8D4]"}`}
                            >
                              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${f.events[k].enabled ? "left-[22px]" : "left-0.5"}`} />
                            </button>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-semibold text-brand-ink">{d.label}</span>
                              <span className="block text-[12px] text-[#6b807b]">{d.when}</span>
                            </span>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s ? (TPL_TONE[s] ?? "bg-[#F1F5F4] text-[#41564F]") : "bg-[#F1F5F4] text-[#7B8E89]"}`}>
                              {s ? s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ") : tpl.syncedAt ? "Not created" : "—"}
                            </span>
                            <Icon name="chevDown" size={16} className="shrink-0 text-[#7B8E89] transition group-open:rotate-180" />
                          </summary>
                          <div className="space-y-3 border-t border-[#E2ECE9] px-3.5 py-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                              <TextField label="Template name" value={f.events[k].template} onChange={(v) => ev(k, { template: v.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} max={120} />
                              <TextField label="Language" value={f.events[k].language} onChange={(v) => ev(k, { language: v })} max={10} />
                            </div>
                            <p className="whitespace-pre-wrap rounded-xl bg-[#E7F7EC] px-3 py-2 text-[12.5px] text-[#173B2A]">{d.body}</p>
                            <p className="text-[12px] text-[#6b807b]">
                              {d.vars.map((v, i) => (
                                <span key={i} className="mr-3 inline-block">
                                  <code className="font-mono text-[11.5px]">{`{{${i + 1}}}`}</code> {v}
                                </span>
                              ))}
                            </p>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Live session reminders">
            <p className="-mt-1 mb-3 text-[12.5px] text-[#6b807b]">Registered students get a reminder at each time you pick. The server checks every minute.</p>
            <div className="flex flex-wrap gap-2">
              {REMINDER_CHOICES.map((r) => {
                const on = f.reminders.includes(r.m);
                return (
                  <button
                    key={r.m}
                    type="button"
                    aria-pressed={on}
                    onClick={() => u("reminders")(on ? f.reminders.filter((x) => x !== r.m) : [...f.reminders, r.m].sort((a, b) => b - a))}
                    className={`rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${on ? "border-brand-teal bg-brand-teal100/60 text-brand-deep" : "border-[#E2ECE9] bg-white text-[#41564f] hover:border-brand-teal"}`}
                  >
                    {on ? "✓ " : ""}
                    {r.label} before
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Auto-reply to new chats">
            <div className="space-y-3">
              <Toggle label="Reply automatically" hint="Sent once, when someone messages your number for the first time. {name} = their first name." checked={f.autoReply} onChange={u("autoReply")} />
              <TextField label="Reply" value={f.autoReplyText} onChange={u("autoReplyText")} max={1000} multiline rows={2} />
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            {dirty && <span className="mr-auto self-center text-[12.5px] font-medium text-[#8A5A00]">Unsaved changes</span>}
            <Btn type="submit" icon="check" disabled={!dirty || busy}>
              {busy ? "Saving…" : "Save settings"}
            </Btn>
          </div>
        </div>

        <aside className="space-y-4">
          <Card title="Set up in 15 minutes">
            <ol className="list-decimal space-y-2 pl-5 text-[13px] text-[#41564f]">
              <li>
                Create a Meta app (type <b>Business</b>) at developers.facebook.com and add the <b>WhatsApp</b> product.
              </li>
              <li>Add and verify your school's phone number. It can't be in use on the WhatsApp app at the same time.</li>
              <li>
                Copy the <b>Phone number ID</b> and <b>WhatsApp Business Account ID</b> from WhatsApp › API Setup.
              </li>
              <li>
                In Business Settings › System users, create an admin user, assign the app and your WhatsApp account, and generate a token with{" "}
                <code className="text-[11.5px]">whatsapp_business_messaging</code> and <code className="text-[11.5px]">whatsapp_business_management</code>. Choose “Never” for expiry.
              </li>
              <li>Paste everything here, Test connection, set up the webhook, then Create templates in Meta.</li>
              <li>Add a payment method in WhatsApp Manager so messages keep flowing after the free test allowance.</li>
            </ol>
          </Card>
          <Card title="Good to know">
            <ul className="space-y-2 text-[13px] text-[#41564f]">
              <li>• Templates are needed to start a chat. Replies within 24 hours of a student's message can be free text, and those are free.</li>
              <li>• Meta charges per template message: utility messages (reminders, receipts) cost far less than marketing broadcasts. See Meta's rate card for India.</li>
              <li>
                • Anyone who replies <b>STOP</b> gets no more automatic messages or broadcasts. <b>START</b> turns them back on.
              </li>
              <li>
                • Every message and its delivery ticks are in{" "}
                <Link href="/admin/whatsapp" className="font-semibold text-brand-teal">
                  WhatsApp
                </Link>
                .
              </li>
            </ul>
          </Card>
        </aside>
      </form>
      <Toast msg={toast} />
    </AdminShell>
  );
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">{label}</span>
      <div className="flex gap-2">
        <code className="flex h-11 min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 font-mono text-[12px] text-brand-ink">{value}</code>
        <Btn variant="ghost" icon="clipboard" onClick={() => (navigator.clipboard.writeText(value), onCopy())}>
          Copy
        </Btn>
      </div>
    </div>
  );
}
