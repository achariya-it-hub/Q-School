"use client";

/** WhatsApp pieces shared by the lead drawer, the WhatsApp page and the finance screens. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { countParams, renderTemplate, type WaMessage, type WaStatus, type WaTemplate } from "@/lib/whatsapp/types";
import { Btn, inputCls } from "./ui";

export const WA_GREEN = "#1C7A3E";

const STATUS_LABEL: Record<WaStatus, { label: string; cls: string }> = {
  sending: { label: "Sending", cls: "bg-[#F1F5F4] text-[#41564F]" },
  sent: { label: "Sent", cls: "bg-[#F1F5F4] text-[#41564F]" },
  delivered: { label: "Delivered", cls: "bg-[#E3F4F0] text-[#0B6E5F]" },
  read: { label: "Read", cls: "bg-[#E7F7EC] text-[#1C7A3E]" },
  failed: { label: "Failed", cls: "bg-[#FCEDED] text-[#B42E2E]" },
  received: { label: "Received", cls: "bg-[#EEF1FB] text-[#3B4CA8]" },
};

export function WaStatusPill({ status }: { status: WaStatus }) {
  const s = STATUS_LABEL[status];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
}

/** ✓ sent, ✓✓ delivered, blue ✓✓ read, as in WhatsApp. */
export function Ticks({ status }: { status: WaStatus }) {
  if (status === "failed") return <span className="text-[11px] font-semibold text-[#B42E2E]">Failed</span>;
  if (status === "sending") return <Icon name="clock" size={12} className="text-[#8aa39c]" />;
  const two = status === "delivered" || status === "read";
  return (
    <span className={`text-[11px] font-bold tracking-[-0.2em] ${status === "read" ? "text-[#2D9CDB]" : "text-[#8aa39c]"}`} aria-label={STATUS_LABEL[status].label}>
      ✓{two ? "✓" : ""}
    </span>
  );
}

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

/* ───────── templates ───────── */

export function useTemplates() {
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    const d = await fetch(`/api/admin/whatsapp/templates${refresh ? "?refresh=1" : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ error: "Couldn't load templates" }));
    setTemplates(d.templates ?? []);
    setSyncedAt(d.syncedAt ?? null);
    setError(d.error ?? "");
    setLoading(false);
    return d;
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { templates, syncedAt, error, loading, reload: load, setTemplates, setSyncedAt };
}

export function TemplateFields({
  templates,
  value,
  onChange,
  firstName,
  allowNameToken,
}: {
  templates: WaTemplate[];
  value: { name: string; language: string; params: string[] };
  onChange: (v: { name: string; language: string; params: string[] }) => void;
  firstName?: string;
  allowNameToken?: boolean;
}) {
  const approved = templates.filter((t) => t.status === "APPROVED");
  const t = approved.find((x) => x.name === value.name && x.language === value.language);
  const n = t ? countParams(t.body) : 0;
  return (
    <div className="space-y-2">
      <select
        className={inputCls}
        value={t ? `${t.name}|${t.language}` : ""}
        onChange={(e) => {
          const [name, language] = e.target.value.split("|");
          const nt = approved.find((x) => x.name === name && x.language === language);
          const k = nt ? countParams(nt.body) : 0;
          onChange({ name, language, params: Array.from({ length: k }, (_, i) => (i === 0 ? (allowNameToken ? "{name}" : firstName ?? "") : "")) });
        }}
      >
        <option value="">{approved.length ? "Choose an approved template…" : "No approved templates yet"}</option>
        {approved.map((x) => (
          <option key={`${x.name}|${x.language}`} value={`${x.name}|${x.language}`}>
            {x.name} · {x.language} · {x.category.toLowerCase()}
          </option>
        ))}
      </select>
      {t && n > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: n }, (_, i) => (
            <input
              key={i}
              className={inputCls}
              value={value.params[i] ?? ""}
              onChange={(e) => {
                const p = [...value.params];
                p[i] = e.target.value;
                onChange({ ...value, params: p });
              }}
              placeholder={`{{${i + 1}}}${i === 0 && allowNameToken ? " — {name} = first name" : ""}`}
              aria-label={`Value ${i + 1}`}
            />
          ))}
        </div>
      )}
      {t && (
        <p className="whitespace-pre-wrap rounded-xl bg-[#E7F7EC] px-3 py-2 text-[12.5px] text-[#173B2A]">
          {renderTemplate(t.body, value.params.map((p, i) => p || `{{${i + 1}}}`))}
        </p>
      )}
    </div>
  );
}

/* ───────── conversation (lead drawer) ───────── */

interface Convo {
  messages: WaMessage[];
  windowOpen: boolean;
  optedOut: boolean;
}

export function WaChat({ phone, name, leadId, onSent }: { phone: string; name: string; leadId?: string; onSent?: (m: string) => void }) {
  const [c, setC] = useState<Convo | null>(null);
  const [text, setText] = useState("");
  const [tpl, setTpl] = useState({ name: "", language: "", params: [] as string[] });
  const [mode, setMode] = useState<"text" | "template">("text");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { templates } = useTemplates();
  const end = useRef<HTMLDivElement>(null);
  const first = name.split(/\s+/)[0] ?? "";

  const load = useCallback(async () => {
    const d = await fetch(`/api/admin/whatsapp/messages?phone=${encodeURIComponent(phone)}`, { cache: "no-store" }).then((r) => r.json());
    if (d.messages) setC(d);
  }, [phone]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 10000);
    return () => window.clearInterval(t);
  }, [load]);
  useEffect(() => {
    if (c && !c.windowOpen) setMode("template");
  }, [c?.windowOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => end.current?.scrollIntoView({ block: "nearest" }), [c?.messages.length]);

  const sendIt = async () => {
    setErr("");
    setBusy(true);
    const body = mode === "text" ? { to: phone, name, leadId, text } : { to: phone, name, leadId, template: tpl.name, language: tpl.language, params: tpl.params };
    const r = await fetch("/api/admin/whatsapp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setErr(d.error || d.message?.error || "Couldn't send");
      load();
      return;
    }
    setText("");
    onSent?.(`WhatsApp sent to ${name}`);
    load();
  };

  return (
    <div className="rounded-2xl border border-[#E2ECE9]">
      <div className="flex items-center justify-between gap-2 border-b border-[#EEF3F1] px-3.5 py-2.5">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-brand-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: WA_GREEN }}>
            <Icon name="message" size={13} />
          </span>
          WhatsApp
        </p>
        {c?.optedOut ? (
          <span className="rounded-full bg-[#FCEDED] px-2 py-0.5 text-[11px] font-semibold text-[#B42E2E]">Replied STOP</span>
        ) : c ? (
          <span className={`text-[11px] font-medium ${c.windowOpen ? "text-[#1C7A3E]" : "text-[#7B8E89]"}`}>{c.windowOpen ? "Chat open (24 h)" : "Templates only"}</span>
        ) : null}
      </div>
      <div className="max-h-[260px] space-y-2 overflow-y-auto bg-[#F4F1EA] px-3 py-3">
        {!c && <p className="text-center text-[12px] text-[#7B8E89]">Loading…</p>}
        {c && !c.messages.length && <p className="py-4 text-center text-[12px] text-[#7B8E89]">No WhatsApp messages yet.</p>}
        {c?.messages.map((m) => (
          <div key={m.id} className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[12.5px] shadow-sm ${m.dir === "out" ? "rounded-tr-sm bg-[#D9FDD3]" : "rounded-tl-sm bg-white"}`}>
              {m.template && <p className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#1C7A3E]">{m.template}</p>}
              <p className="whitespace-pre-wrap break-words text-[#111B21]">{m.text}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[10.5px] text-[#667781]">
                {fmtTime(m.at)} {m.dir === "out" && <Ticks status={m.status} />}
              </p>
              {m.status === "failed" && m.error && <p className="mt-1 text-[11px] text-[#B42E2E]">{m.error}</p>}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="space-y-2 border-t border-[#EEF3F1] p-3">
        <div className="flex gap-1 text-[12px]">
          {(["text", "template"] as const).map((k) => (
            <button
              key={k}
              type="button"
              disabled={k === "text" && !c?.windowOpen}
              onClick={() => setMode(k)}
              className={`rounded-lg px-2.5 py-1 font-semibold disabled:opacity-40 ${mode === k ? "bg-brand-deep text-white" : "text-[#41564f] hover:bg-[#F1F7F5]"}`}
              title={k === "text" && !c?.windowOpen ? "Free text is only allowed within 24 hours of their last message" : undefined}
            >
              {k === "text" ? "Message" : "Template"}
            </button>
          ))}
        </div>
        {mode === "text" ? (
          <textarea className={`${inputCls} min-h-[64px] py-2`} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${first}…`} maxLength={4096} />
        ) : (
          <TemplateFields templates={templates} value={tpl} onChange={setTpl} firstName={first} />
        )}
        {err && <p className="text-[12px] text-[#B42E2E]">{err}</p>}
        <div className="flex justify-end">
          <Btn icon="arrowRight" onClick={sendIt} disabled={busy || (mode === "text" ? !text.trim() : !tpl.name)}>
            {busy ? "Sending…" : "Send"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ───────── bills & payments ───────── */

/** Send an invoice / receipt / fee reminder; returns a message for the toast. */
export async function waNotify(body: Record<string, unknown>): Promise<{ ok: boolean; msg: string; link?: string }> {
  const r = await fetch("/api/admin/whatsapp/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, msg: d.error || "Couldn't send on WhatsApp", link: d.link };
  return { ok: true, msg: `Sent on WhatsApp to ${body.name ?? body.to}`, link: d.link };
}
