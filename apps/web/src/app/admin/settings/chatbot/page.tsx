"use client";

import { useEffect, useState } from "react";
import { ADMISSION_CENTRES } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Btn, Card, Toast, useToast } from "@/components/admin/ui";
import { Row, TextField, Toggle } from "@/components/admin/site-fields";
import type { BotConfig } from "@/lib/whatsapp/bot";

export default function ChatbotSettingsPage() {
  const [f, setF] = useState<BotConfig | null>(null);
  const [saved, setSaved] = useState("");
  const [handoffs, setHandoffs] = useState<{ phone: string; since: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, show] = useToast();

  const load = async () => {
    const d = await (await fetch("/api/whatsapp/bot", { cache: "no-store" })).json();
    if (d.config) {
      setF(d.config);
      setSaved(JSON.stringify(d.config));
      setHandoffs(d.handoffs ?? []);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  if (!f)
    return (
      <AdminShell>
        <SettingsNav />
        <p className="p-4 text-sm text-[#6b807b]">Loading…</p>
      </AdminShell>
    );

  const set = <K extends keyof BotConfig>(k: K, v: BotConfig[K]) => setF({ ...f, [k]: v });
  const dirty = JSON.stringify(f) !== saved;
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const save = async () => {
    setBusy(true);
    const r = await fetch("/api/whatsapp/bot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config: f }) });
    setBusy(false);
    if (!r.ok) return show("Couldn't save");
    const d = await r.json();
    setF(d.config);
    setSaved(JSON.stringify(d.config));
    show("Chatbot saved");
  };
  const resume = async (phone: string) => {
    const r = await fetch("/api/whatsapp/bot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: phone }) });
    const d = await r.json();
    setHandoffs(d.handoffs ?? []);
    show("Bot resumed for this chat");
  };

  return (
    <AdminShell>
      <SettingsNav />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <Toggle label="Chatbot on" hint="Replies to every WhatsApp message with a menu. Needs WhatsApp connected in Settings › WhatsApp." checked={f.enabled} onChange={(v) => set("enabled", v)} />
          </Card>

          <Card title="Messages">
            <div className="space-y-4">
              <TextField label="Greeting" hint="{name} = the parent's WhatsApp name" value={f.greeting} onChange={(v) => set("greeting", v)} max={500} multiline rows={2} />
              <TextField label="Courses offered in the enquiry" hint="one per line, up to 9" value={f.courses.join("\n")} onChange={(v) => set("courses", v.split("\n"))} max={400} multiline rows={5} />
              <TextField label="Fees answer" value={f.faqFees} onChange={(v) => set("faqFees", v)} max={1000} multiline rows={3} />
              <Row>
                <TextField label="Batches answer" value={f.faqBatches} onChange={(v) => set("faqBatches", v)} max={1000} multiline rows={3} />
                <TextField label="Class timings answer" value={f.faqTimings} onChange={(v) => set("faqTimings", v)} max={1000} multiline rows={3} />
              </Row>
              <TextField label="Counsellor alert number" hint="optional, with country code, e.g. 919876543210" value={f.notifyNumber} onChange={(v) => set("notifyNumber", v)} max={20} />
            </div>
          </Card>

          <Card title="Branch details">
            <p className="-mt-1 mb-3 text-[12.5px] text-[#6b807b]">Shown when a parent taps “Our branches”.</p>
            <div className="space-y-4">
              {ADMISSION_CENTRES.map((c) => {
                const b = f.branches[c.id];
                const up = (k: keyof typeof b, v: string) => set("branches", { ...f.branches, [c.id]: { ...b, [k]: v } });
                return (
                  <div key={c.id} className="rounded-xl border border-[#E2ECE9] p-3">
                    <p className="mb-2 text-[13px] font-semibold text-brand-ink">{c.name}</p>
                    <div className="space-y-3">
                      <TextField label="Address" value={b.address} onChange={(v) => up("address", v)} max={300} />
                      <Row>
                        <TextField label="Phone" value={b.phone} onChange={(v) => up("phone", v)} max={30} />
                        <TextField label="Timings" value={b.hours} onChange={(v) => up("hours", v)} max={120} />
                      </Row>
                      <TextField label="Google Maps link" value={b.map} onChange={(v) => up("map", v)} max={300} placeholder="https://maps.app.goo.gl/…" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            {dirty && <span className="mr-auto self-center text-[12.5px] font-medium text-[#8A5A00]">Unsaved changes</span>}
            <Btn type="button" icon="check" disabled={!dirty || busy} onClick={save}>
              {busy ? "Saving…" : "Save chatbot"}
            </Btn>
          </div>
        </div>

        <aside className="space-y-4">
          <Card title="Waiting for a counsellor">
            {handoffs.length ? (
              <ul className="space-y-2 text-[13px]">
                {handoffs.map((h) => (
                  <li key={h.phone} className="flex items-center justify-between gap-2 rounded-xl bg-[#F6FAF9] px-3 py-2">
                    <span>+{h.phone}</span>
                    <button type="button" onClick={() => resume(h.phone)} className="text-[12px] font-semibold text-brand-teal">
                      Hand back to bot
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-[#6b807b]">No chats waiting. When a parent asks for a counsellor, the bot stops replying and the chat appears in Admin › WhatsApp.</p>
            )}
          </Card>
          <Card title="Connect to Meta">
            <ol className="list-decimal space-y-2 pl-5 text-[13px] text-[#41564f]">
              <li>Fill in the token, phone number ID and verify token in Settings › WhatsApp, and switch it on.</li>
              <li>
                In your Meta app › WhatsApp › Configuration, set Callback URL to <code className="break-all font-mono text-[12px]">{origin}/api/integrations/whatsapp</code> and subscribe to <b>messages</b>.
              </li>
              <li>Message your business number from any phone and say “Hi”.</li>
            </ol>
          </Card>
          <Card title="Good to know">
            <ul className="space-y-2 text-[13px] text-[#41564f]">
              <li>• It is a fixed menu, no AI. Typing “menu” always returns to the start.</li>
              <li>• Enquiries become CRM leads with the child, grade, branch and course, and are assigned to a counsellor.</li>
              <li>• “My child” matches the parent&apos;s number against admissions and shows status, receipts and open payment links.</li>
            </ul>
          </Card>
        </aside>
      </div>
      <Toast msg={toast} />
    </AdminShell>
  );
}
