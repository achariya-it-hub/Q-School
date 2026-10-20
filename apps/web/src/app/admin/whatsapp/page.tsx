"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STAGES } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Drawer, Figure, Modal, PageHeader, SearchInput, Segmented, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { TemplateFields, WaChat, WaStatusPill, fmtTime, useTemplates } from "@/components/admin/whatsapp";
import { CreateTemplateModal } from "@/components/admin/whatsapp-template-modal";
import { Icon } from "@/components/icons";
import { WA_EVENTS, prettyWa, type WaEvent, type WaMessage } from "@/lib/whatsapp/types";

type Tab = "messages" | "broadcast" | "templates";

interface Stats {
  sent30: number;
  delivered30: number;
  read30: number;
  failed30: number;
  received30: number;
}

const EVENT_LABEL = (e?: WaMessage["event"]) =>
  !e ? "" : e === "broadcast" ? "Broadcast" : e === "manual" ? "Console" : e === "auto_reply" ? "Auto-reply" : (WA_EVENTS[e as WaEvent]?.label ?? e);

export default function WhatsAppPage() {
  const [tab, setTab] = useState<Tab>("messages");
  const [selectedTpl, setSelectedTpl] = useState<{ name: string; language: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [toast, show] = useToast();

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setConnected(!!(d.whatsapp?.configured && d.whatsapp?.enabled)))
      .catch(() => setConnected(false));
  }, []);

  return (
    <AdminShell>
      <PageHeader title="WhatsApp" sub="Every message sent and received, broadcasts to leads and students, and your approved templates">
        <Link href="/admin/settings/whatsapp" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D9E6E2] bg-white px-4 text-[13px] font-semibold text-brand-deep hover:border-brand-teal">
          <Icon name="settings" size={16} /> WhatsApp settings
        </Link>
      </PageHeader>

      {connected === false && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#F5D58A] bg-[#FFF8E6] px-4 py-3 text-[13px] text-[#6B4A00]">
          <Icon name="alert" size={18} />
          <span className="flex-1">WhatsApp isn't connected or is switched off, so nothing is being sent yet.</span>
          <Link href="/admin/settings/whatsapp" className="font-semibold text-brand-teal">
            Set it up →
          </Link>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Figure label="Sent (30 days)" value={stats ? stats.sent30.toLocaleString("en-IN") : "—"} icon="arrowUp" />
        <Figure label="Delivered" value={stats ? pct(stats.delivered30, stats.sent30) : "—"} icon="check" />
        <Figure label="Read" value={stats ? pct(stats.read30, stats.sent30) : "—"} icon="eye" />
        <Figure label="Failed" value={stats ? stats.failed30.toLocaleString("en-IN") : "—"} icon="alert" />
        <Figure label="Replies received" value={stats ? stats.received30.toLocaleString("en-IN") : "—"} icon="message" />
      </div>

      <div className="mb-4">
        <Segmented
          label="WhatsApp section"
          value={tab}
          onChange={setTab}
          options={[
            { value: "messages", label: "Messages" },
            { value: "broadcast", label: "Broadcast" },
            { value: "templates", label: "Templates" },
          ]}
        />
      </div>

      {tab === "messages" && <Messages onStats={setStats} show={show} />}
      {tab === "broadcast" && <Broadcast show={show} onDone={() => setTab("messages")} initialTemplate={selectedTpl} />}
      {tab === "templates" && (
        <Templates
          show={show}
          onUseInBroadcast={(t) => {
            setSelectedTpl(t);
            setTab("broadcast");
          }}
        />
      )}
      <Toast msg={toast} />
    </AdminShell>
  );
}

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

/* ───────── messages ───────── */

function Messages({ onStats, show }: { onStats: (s: Stats) => void; show: (m: string) => void }) {
  const [list, setList] = useState<WaMessage[] | null>(null);
  const [q, setQ] = useState("");
  const [dir, setDir] = useState<"all" | "in" | "out">("all");
  const [open, setOpen] = useState<WaMessage | null>(null);
  const [queued, setQueued] = useState(0);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ limit: "400" });
    if (q) p.set("q", q);
    if (dir !== "all") p.set("dir", dir);
    const d = await fetch(`/api/admin/whatsapp/messages?${p}`, { cache: "no-store" }).then((r) => r.json());
    setList(d.messages ?? []);
    if (d.stats) onStats(d.stats);
    setQueued(d.queued ?? 0);
  }, [q, dir, onStats]);

  useEffect(() => {
    const t = window.setTimeout(load, q ? 250 : 0);
    const i = window.setInterval(load, 15000);
    return () => (window.clearTimeout(t), window.clearInterval(i));
  }, [load, q]);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] flex-1">
          <SearchInput value={q} onChange={setQ} placeholder="Search name, number, message, invoice no…" />
        </div>
        <Segmented
          label="Direction"
          value={dir}
          onChange={setDir}
          options={[
            { value: "all", label: "All" },
            { value: "out", label: "Sent" },
            { value: "in", label: "Received" },
          ]}
        />
        {queued > 0 && <span className="rounded-full bg-[#E3F4F0] px-3 py-1 text-[12px] font-semibold text-[#0B6E5F]">{queued} still sending…</span>}
      </div>
      {list && !list.length ? (
        <p className="py-10 text-center text-[13px] text-[#6b807b]">No messages yet. They'll appear here as soon as anything is sent or received.</p>
      ) : (
        <DataGrid minWidth={860}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>When</Th>
              <Th>Contact</Th>
              <Th>Message</Th>
              <Th>Type</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {(list ?? []).map((m) => (
              <tr key={m.id} onClick={() => setOpen(m)} className="cursor-pointer border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                <Td className="whitespace-nowrap text-[12px] text-[#41564f]">
                  <span className={`mr-1.5 inline-block ${m.dir === "in" ? "text-[#3B4CA8]" : "text-[#1C7A3E]"}`}>{m.dir === "in" ? "↙" : "↗"}</span>
                  {fmtTime(m.at)}
                </Td>
                <Td>
                  <span className="block font-medium text-brand-ink">{m.name || prettyWa(m.phone)}</span>
                  {m.name && <span className="block text-[11.5px] text-[#7B8E89]">{prettyWa(m.phone)}</span>}
                </Td>
                <Td>
                  <span className="line-clamp-2 max-w-[420px] text-[12.5px] text-[#41564f]">{m.text}</span>
                  {m.error && <span className="mt-0.5 block max-w-[420px] truncate text-[11.5px] text-[#B42E2E]">{m.error}</span>}
                </Td>
                <Td className="text-[12px] text-[#41564f]">
                  {EVENT_LABEL(m.event) || (m.dir === "in" ? "Reply" : "")}
                  {m.template && <span className="block font-mono text-[11px] text-[#7B8E89]">{m.template}</span>}
                </Td>
                <Td>
                  <WaStatusPill status={m.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </DataGrid>
      )}
      <Drawer open={!!open} title={open ? open.name || prettyWa(open.phone) : ""} onClose={() => setOpen(null)}>
        {open && (
          <div className="space-y-3">
            <p className="text-[12.5px] text-[#6b807b]">{prettyWa(open.phone)}</p>
            <WaChat phone={open.phone} name={open.name || ""} onSent={(m) => (show(m), load())} />
            <OptOutButton phone={open.phone} show={show} />
          </div>
        )}
      </Drawer>
    </Card>
  );
}

function OptOutButton({ phone, show }: { phone: string; show: (m: string) => void }) {
  const [out, setOut] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(`/api/admin/whatsapp/messages?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((d) => setOut(!!d.optedOut));
  }, [phone]);
  if (out === null) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        const d = await fetch("/api/admin/whatsapp/optout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, out: !out }) }).then((r) => r.json());
        setOut(d.optedOut);
        show(d.optedOut ? "Stopped automatic messages for this number" : "Automatic messages turned back on");
      }}
      className="text-[12.5px] font-semibold text-[#6b807b] hover:text-brand-teal"
    >
      {out ? "Resume automatic messages for this number" : "Stop automatic messages for this number"}
    </button>
  );
}

/* ───────── broadcast ───────── */

const SOURCES = [
  { k: "meta", label: "Meta ads" },
  { k: "google", label: "Google Ads" },
  { k: "whatsapp", label: "WhatsApp" },
  { k: "website", label: "Website" },
  { k: "webhook", label: "Other / manual" },
];

interface SessionLite {
  id: string;
  title: string;
  startsAt: string;
  registrations: unknown[];
}

function Broadcast({
  show,
  onDone,
  initialTemplate,
}: {
  show: (m: string) => void;
  onDone: () => void;
  initialTemplate?: { name: string; language: string } | null;
}) {
  const { templates } = useTemplates();
  const [aud, setAud] = useState<"leads" | "session" | "numbers">("leads");
  const [stages, setStages] = useState<string[]>(["Enquiry", "Contacted"]);
  const [sources, setSources] = useState<string[]>([]);
  const [sessions, setSessions] = useState<SessionLite[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [only, setOnly] = useState<"all" | "joined" | "absent">("all");
  const [numbers, setNumbers] = useState("");
  const [tpl, setTpl] = useState({ name: initialTemplate?.name || "", language: initialTemplate?.language || "", params: [] as string[] });
  const [preview, setPreview] = useState<{ count: number; invalid: number; optedOut: number; sample: string[] } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialTemplate?.name) {
      const match = templates.find((t) => t.name === initialTemplate.name && t.language === initialTemplate.language);
      const k = match ? match.params : 0;
      setTpl({
        name: initialTemplate.name,
        language: initialTemplate.language,
        params: Array.from({ length: k }, () => ""),
      });
    }
  }, [initialTemplate, templates]);

  useEffect(() => {
    fetch("/api/admin/live", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list: SessionLite[] = (d.sessions ?? []).filter((s: SessionLite) => s.registrations.length);
        setSessions(list);
        if (list[0]) setSessionId(list[list.length - 1].id);
      });
  }, []);

  const audience = useMemo(
    () =>
      aud === "leads"
        ? { type: "leads", stages, sources }
        : aud === "session"
          ? { type: "session", sessionId, only }
          : { type: "numbers", list: numbers },
    [aud, stages, sources, sessionId, only, numbers],
  );

  useEffect(() => {
    if (aud === "session" && !sessionId) return setPreview(null);
    const t = window.setTimeout(async () => {
      const d = await fetch("/api/admin/whatsapp/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience, dryRun: true }) }).then((r) => r.json());
      setPreview(d.count !== undefined ? d : null);
    }, 300);
    return () => window.clearTimeout(t);
  }, [audience, aud, sessionId]);

  const toggle = (arr: string[], set: (v: string[]) => void, k: string) => set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);
  const tplObj = templates.find((t) => t.name === tpl.name && t.language === tpl.language);
  const missing = tpl.params.some((p) => !p.trim());

  const sendNow = async () => {
    setBusy(true);
    const r = await fetch("/api/admin/whatsapp/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, template: tpl.name, language: tpl.language, params: tpl.params }),
    });
    const d = await r.json();
    setBusy(false);
    setConfirm(false);
    if (!r.ok) return show(d.error ?? "Couldn't start the broadcast");
    show(`Sending to ${d.queued} ${d.queued === 1 ? "person" : "people"}${d.optedOut ? ` (${d.optedOut} opted out, skipped)` : ""}`);
    onDone();
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card title="1. Who should get it?">
          <Segmented
            label="Audience"
            value={aud}
            onChange={setAud}
            options={[
              { value: "leads", label: "CRM leads" },
              { value: "session", label: "Live session registrants" },
              { value: "numbers", label: "Paste numbers" },
            ]}
          />
          <div className="mt-4">
            {aud === "leads" && (
              <div className="space-y-3">
                <ChipGroup label="Stage" items={STAGES.map((s) => ({ k: s, label: s }))} selected={stages} onToggle={(k) => toggle(stages, setStages, k)} hint="none selected = all stages" />
                <ChipGroup label="Source" items={SOURCES} selected={sources} onToggle={(k) => toggle(sources, setSources, k)} hint="none selected = all sources" />
              </div>
            )}
            {aud === "session" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
                <select className={inputCls} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                  {!sessions.length && <option value="">No sessions with registrations yet</option>}
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} · {new Date(s.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {s.registrations.length} registered
                    </option>
                  ))}
                </select>
                <select className={inputCls} value={only} onChange={(e) => setOnly(e.target.value as typeof only)}>
                  <option value="all">Everyone registered</option>
                  <option value="joined">Only those who joined</option>
                  <option value="absent">Only those who missed it</option>
                </select>
              </div>
            )}
            {aud === "numbers" && (
              <textarea
                className={`${inputCls} min-h-[120px] py-2 font-mono text-[12.5px]`}
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                placeholder={"One per line, optionally with a name:\nAnanya R, 98450 11122\n9000000001"}
              />
            )}
          </div>
        </Card>

        <Card title="2. Which message?">
          <TemplateFields templates={templates} value={tpl} onChange={setTpl} allowNameToken />
          <p className="mt-2 text-[12px] text-[#6b807b]">
            Use <code className="font-mono">{"{name}"}</code> in a value to put each person's first name. Only Meta-approved templates can be broadcast.{" "}
            <Link href="/admin/settings/whatsapp" className="font-semibold text-brand-teal">
              Manage templates
            </Link>
          </p>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card title="Summary">
          <p className="text-[32px] font-bold leading-none text-brand-ink">{preview ? preview.count.toLocaleString("en-IN") : "—"}</p>
          <p className="mt-1 text-[13px] text-[#6b807b]">people will get this message</p>
          {preview && (preview.optedOut > 0 || preview.invalid > 0) && (
            <p className="mt-2 text-[12.5px] text-[#8A5A00]">
              {preview.optedOut > 0 && `${preview.optedOut} skipped (replied STOP). `}
              {preview.invalid > 0 && `${preview.invalid} invalid numbers skipped.`}
            </p>
          )}
          {preview && preview.sample.length > 0 && <p className="mt-2 text-[12px] text-[#7B8E89]">Including {preview.sample.join(", ")}{preview.count > preview.sample.length ? "…" : ""}</p>}
          <div className="mt-4">
            <Btn icon="arrowRight" onClick={() => setConfirm(true)} disabled={!preview?.count || !tplObj || missing}>
              Review & send
            </Btn>
          </div>
          {tplObj?.category === "MARKETING" && <p className="mt-3 text-[12px] text-[#6b807b]">Marketing templates cost more per message than utility ones, and Meta may limit how many each person receives.</p>}
        </Card>
        <Card title="Before you send">
          <ul className="space-y-2 text-[13px] text-[#41564f]">
            <li>• Only message people who gave you their number for updates.</li>
            <li>• Messages go out in the background, about 15 a second. Follow the ticks in Messages.</li>
            <li>• Anyone who replies STOP is skipped automatically next time.</li>
          </ul>
        </Card>
      </aside>

      <Modal open={confirm} title="Send this broadcast?" onClose={() => setConfirm(false)}>
        <p className="text-[13.5px] text-[#41564f]">
          <b>{tpl.name}</b> will go to <b>{preview?.count.toLocaleString("en-IN")}</b> {preview?.count === 1 ? "person" : "people"} on WhatsApp. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setConfirm(false)}>
            Cancel
          </Btn>
          <Btn icon="arrowRight" onClick={sendNow} disabled={busy}>
            {busy ? "Starting…" : `Send to ${preview?.count.toLocaleString("en-IN")}`}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

function ChipGroup({ label, items, selected, onToggle, hint }: { label: string; items: { k: string; label: string }[]; selected: string[]; onToggle: (k: string) => void; hint?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-semibold text-[#41564f]">
        {label} {hint && <span className="font-normal text-[#8aa39c]">{hint}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => {
          const on = selected.includes(i.k);
          return (
            <button
              key={i.k}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(i.k)}
              className={`rounded-xl border px-3 py-1.5 text-[12.5px] font-semibold transition ${on ? "border-brand-teal bg-brand-teal100/60 text-brand-deep" : "border-[#E2ECE9] bg-white text-[#41564f] hover:border-brand-teal"}`}
            >
              {on ? "✓ " : ""}
              {i.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── templates ───────── */

const TONE: Record<string, string> = {
  APPROVED: "bg-[#EAF7EA] text-[#0A7F0A]",
  PENDING: "bg-[#FFF6E0] text-[#8A5A00]",
  REJECTED: "bg-[#FCEDED] text-[#B42E2E]",
  PAUSED: "bg-[#FDEFE8] text-[#A9471F]",
};

function Templates({
  show,
  onUseInBroadcast,
}: {
  show: (m: string) => void;
  onUseInBroadcast: (t: { name: string; language: string }) => void;
}) {
  const { templates, syncedAt, error, loading, reload } = useTemplates();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesBody = t.body.toLowerCase().includes(q);
        const matchesHeader = t.header?.toLowerCase().includes(q);
        if (!matchesName && !matchesBody && !matchesHeader) return false;
      }
      return true;
    });
  }, [templates, search, statusFilter, categoryFilter]);

  const handleDelete = async (t: { name: string }) => {
    if (!window.confirm(`Are you sure you want to delete template "${t.name}" from Meta? This cannot be undone.`)) {
      return;
    }
    setDeleting(t.name);
    try {
      const res = await fetch(`/api/admin/whatsapp/templates?name=${encodeURIComponent(t.name)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete template");
      show(`Template "${t.name}" deleted from Meta`);
      reload(true);
    } catch (err) {
      show((err as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  const approvedCount = templates.filter((t) => t.status === "APPROVED").length;
  const pendingCount = templates.filter((t) => t.status === "PENDING").length;
  const rejectedCount = templates.filter((t) => t.status === "REJECTED").length;

  return (
    <>
      <Card
        title="Templates"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>
              Create Template
            </Btn>
            <Btn variant="ghost" onClick={() => reload(true)} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh from Meta"}
            </Btn>
          </div>
        }
      >
        <p className="-mt-2 mb-4 text-[12.5px] text-[#6b807b]">
          {syncedAt ? `Last checked ${fmtTime(syncedAt)}.` : "Not loaded from Meta yet."} Create custom message templates directly here with live preview, or manage the app's default set in{" "}
          <Link href="/admin/settings/whatsapp" className="font-semibold text-brand-teal">
            Settings › WhatsApp
          </Link>
          .{error && <span className="mt-1 block text-[#B42E2E]">{error}</span>}
        </p>

        {/* Filter & search bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search templates…" />

            <div className="flex items-center gap-1 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-1 text-[12px]">
              {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    statusFilter === s ? "bg-white text-brand-deep shadow-xs font-semibold" : "text-[#7B8E89] hover:text-brand-ink"
                  }`}
                >
                  {s === "ALL" ? `All (${templates.length})` : s === "APPROVED" ? `Approved (${approvedCount})` : s === "PENDING" ? `Pending (${pendingCount})` : `Rejected (${rejectedCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#7B8E89]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border border-[#D9E6E2] bg-white px-2 text-[12px] font-medium text-brand-ink"
            >
              <option value="ALL">All Categories</option>
              <option value="UTILITY">Utility</option>
              <option value="MARKETING">Marketing</option>
            </select>
          </div>
        </div>

        {!templates.length ? (
          <div className="rounded-2xl border border-dashed border-[#CFDFDA] p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3F4F0] text-brand-teal">
              <Icon name="message" size={24} />
            </div>
            <h3 className="text-[15px] font-semibold text-brand-ink">No WhatsApp templates found</h3>
            <p className="mx-auto mt-1 max-w-md text-[13px] text-[#6b807b]">
              Templates allow you to initiate conversations and broadcasts to parents, leads, and students outside the 24-hour window.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Btn variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>
                Create First Template
              </Btn>
              <Btn variant="ghost" onClick={() => reload(true)} disabled={loading}>
                Refresh from Meta
              </Btn>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] text-[#6b807b]">No templates match your search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
              }}
              className="mt-2 text-[12.5px] font-semibold text-brand-teal hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.map((t) => (
              <div
                key={`${t.name}|${t.language}`}
                className="flex flex-col justify-between rounded-2xl border border-[#E2ECE9] bg-white p-4 transition hover:border-[#CADBD5]"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[13px] font-semibold text-brand-ink">{t.name}</p>
                    <span className="rounded-md bg-[#F1F5F4] px-2 py-0.5 text-[11px] font-medium text-[#41564F]">
                      {t.language}
                    </span>
                    <span className="rounded-md bg-[#E3F4F0] px-2 py-0.5 text-[11px] font-medium text-brand-deep">
                      {t.category.toLowerCase()}
                    </span>
                    <span
                      className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        TONE[t.status] ?? "bg-[#F1F5F4] text-[#41564F]"
                      }`}
                    >
                      {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {t.header && (
                    <p className="mb-1 text-[12px] font-bold text-brand-ink">{t.header}</p>
                  )}

                  <p className="whitespace-pre-wrap rounded-xl bg-[#E7F7EC] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#173B2A]">
                    {t.body || "(no text body)"}
                  </p>

                  {t.footer && (
                    <p className="mt-1.5 text-[11.5px] italic text-[#6b807b]">{t.footer}</p>
                  )}

                  {t.buttons && t.buttons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.buttons.map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#CCE3DC] bg-[#F4FAF8] px-2 py-1 text-[11px] font-medium text-[#0A6B5B]"
                        >
                          <Icon name="message" size={12} /> {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F4] pt-2.5 text-[11.5px] text-[#7B8E89]">
                  <span>
                    {t.params > 0 ? `${t.params} variable${t.params > 1 ? "s" : ""}` : "No variables"}
                  </span>
                  <div className="flex items-center gap-2">
                    {t.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => onUseInBroadcast({ name: t.name, language: t.language })}
                        className="inline-flex items-center gap-1 font-semibold text-brand-teal hover:underline"
                      >
                        <Icon name="arrowRight" size={13} /> Broadcast
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={deleting === t.name}
                      onClick={() => handleDelete(t)}
                      className="rounded p-1 text-[#9CA3AF] transition hover:bg-[#FDEFE8] hover:text-[#B42E2E] disabled:opacity-40"
                      title="Delete template from Meta"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <CreateTemplateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => reload(true)}
        showToast={show}
      />
    </>
  );
}
