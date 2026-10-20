"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, Figure, Modal, PageHeader, Segmented, StatusBadge, Toast, useToast, type Tone } from "@/components/admin/ui";
import { NumberField, TextField, Toggle, fieldInput } from "@/components/admin/site-fields";
import { downloadCsv } from "@/components/admin/store";
import { Icon } from "@/components/icons";
import { KIND_LABEL, PLATFORMS, fmtWhen, phase, type LiveKind, type LiveSession, type Platform } from "@/lib/live/types";

type Phase = ReturnType<typeof phase>;
const PHASE: Record<Phase, { tone: Tone; label: string }> = {
  live: { tone: "info", label: "Live" },
  upcoming: { tone: "warning", label: "Scheduled" },
  ended: { tone: "good", label: "Ended" },
  past: { tone: "neutral", label: "Not held" },
  cancelled: { tone: "critical", label: "Cancelled" },
};
const KIND_COLOR: Record<LiveKind, string> = { webinar: "#5B6CF0", workshop: "#F29A2E", class: "#0E937E" };

/** datetime-local value in IST for an ISO string */
const toLocal = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 330 * 60000);
  return d.toISOString().slice(0, 16);
};
const fromLocal = (v: string) => new Date(`${v}:00+05:30`).toISOString();

const blank = (platform: Platform = "bbb") => {
  const d = new Date(Date.now() + 86400000);
  d.setUTCMinutes(30, 0, 0);
  return {
    kind: "webinar" as LiveKind,
    title: "",
    description: "",
    host: "",
    startsAt: d.toISOString(),
    durationMin: 60,
    capacity: 100,
    price: 0,
    record: true,
    published: true,
    platform,
    joinUrl: "",
    hostUrl: "",
    passcode: "",
  };
};
interface PlatformCfg {
  enabled: Record<Platform, boolean>;
  defaultPlatform: Platform;
  jitsiDomain: string;
}
type Form = ReturnType<typeof blank> & { id?: string };

export default function LiveSessionsPage() {
  const [list, setList] = useState<LiveSession[]>([]);
  const [bbb, setBbb] = useState<{ enabled: boolean; configured: boolean } | null>(null);
  const [pcfg, setPcfg] = useState<PlatformCfg | null>(null);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [kind, setKind] = useState<"all" | LiveKind>("all");
  const [edit, setEdit] = useState<Form | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [toast, show] = useToast();

  const load = useCallback(
    () =>
      fetch("/api/admin/live", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setList(d.sessions ?? []);
          setBbb(d.bbb);
          setPcfg(d.platforms ?? null);
        }),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      list
        .map((s) => ({ s, p: phase(s) }))
        .filter(({ s, p }) => (kind === "all" || s.kind === kind) && (filter === "all" || (filter === "upcoming" ? p === "upcoming" || p === "live" : p === "ended" || p === "past" || p === "cancelled")))
        .sort((a, b) => (filter === "upcoming" ? a.s.startsAt.localeCompare(b.s.startsAt) : b.s.startsAt.localeCompare(a.s.startsAt))),
    [list, filter, kind],
  );
  const regs = list.reduce((a, s) => a + s.registrations.length, 0);
  const joined = list.reduce((a, s) => a + s.registrations.filter((r) => r.joinedAt).length, 0);
  const liveNow = list.filter((s) => phase(s) === "live").length;
  const next = list.filter((s) => phase(s) === "upcoming").sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  const save = async () => {
    if (!edit) return;
    const r = await fetch(edit.id ? `/api/admin/live/${edit.id}` : "/api/admin/live", {
      method: edit.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    const d = await r.json();
    if (!r.ok) return show(d.error ?? "Could not save");
    show(edit.id ? "Session updated" : "Session scheduled");
    setEdit(null);
    load();
  };

  const selected = list.find((s) => s.id === open) ?? null;
  const bbbReady = !!bbb?.enabled && !!bbb?.configured;
  const newSession = () => setEdit(blank(pcfg?.defaultPlatform ?? "bbb"));
  const bbbNeeded = !bbbReady && (pcfg?.defaultPlatform === "bbb" || list.some((x) => x.platform === "bbb" && ["upcoming", "live"].includes(phase(x))));

  return (
    <AdminShell>
      <PageHeader title="Live sessions" sub="Webinars, workshops and live classes on BigBlueButton, Teams, Zoom, Jitsi or JupiterMeet">
        <Btn icon="plus" onClick={newSession}>
          Schedule session
        </Btn>
      </PageHeader>

      {bbb && bbbNeeded && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#F5D9A8] bg-[#FFF8EA] px-4 py-3 text-[13px] text-[#6B4A00]">
          <Icon name="alert" size={18} />
          <span className="flex-1">
            {bbb.configured ? "BigBlueButton is set up but switched off." : "BigBlueButton isn't connected yet, so BigBlueButton sessions can't start."} Sessions on Teams, Zoom, Jitsi or JupiterMeet work without it.
          </span>
          <Link href="/admin/settings/live" className="rounded-lg bg-[#6B4A00] px-3 py-1.5 text-[12.5px] font-semibold text-white">
            Open live class settings
          </Link>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Live right now" value={String(liveNow)} sub={liveNow ? "Open the session to monitor it" : "No rooms open"} icon="live" />
        <Figure label="Next session" value={next ? new Date(next.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "—"} sub={next ? next.title : "Nothing scheduled"} icon="calendar" />
        <Figure label="Registrations" value={regs.toLocaleString("en-IN")} sub={`Across ${list.length} sessions`} icon="users" />
        <Figure label="Show-up rate" value={regs ? `${Math.round((joined / regs) * 100)}%` : "—"} meter={regs ? (joined / regs) * 100 : 0} sub={`${joined} joined the room`} icon="check" />
      </section>

      <Card className="mt-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Segmented
            label="When"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "upcoming", label: "Upcoming & live" },
              { value: "past", label: "Past" },
              { value: "all", label: "All" },
            ]}
          />
          <Segmented
            label="Type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All types" },
              { value: "webinar", label: "Webinars" },
              { value: "workshop", label: "Workshops" },
              { value: "class", label: "Live classes" },
            ]}
          />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal100 text-brand-deep">
              <Icon name="webinar" size={26} />
            </span>
            <p className="mt-3 text-[15px] font-semibold text-brand-ink">{list.length ? "Nothing here" : "No sessions yet"}</p>
            <p className="mt-1 max-w-sm text-[13px] text-[#6b807b]">Schedule a webinar or workshop. It appears on the website&apos;s Live page, where students register and get a personal join link.</p>
            <div className="mt-4">
              <Btn icon="plus" onClick={newSession}>
                Schedule session
              </Btn>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map(({ s, p }) => {
              const joinedN = s.registrations.filter((r) => r.joinedAt).length;
              return (
                <li key={s.id} className={`flex flex-wrap items-center gap-4 rounded-xl border p-3 transition hover:bg-[#FAFCFB] ${p === "live" ? "border-[#0E937E]/40 bg-[#F3FBF8]" : "border-[#EEF3F1]"}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: KIND_COLOR[s.kind] }}>
                    <Icon name={s.kind === "workshop" ? "tools" : s.kind === "class" ? "live" : "webinar"} size={20} />
                  </span>
                  <button onClick={() => setOpen(s.id)} className="min-w-[220px] flex-1 text-left">
                    <p className="text-[13.5px] font-semibold text-brand-ink hover:text-brand-teal">{s.title}</p>
                    <p className="text-[12px] text-[#6b807b]">
                      <span className="mr-1.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold text-white" style={{ background: PLATFORMS[s.platform].color }}>
                        {PLATFORMS[s.platform].short}
                      </span>
                      {KIND_LABEL[s.kind]} · {fmtWhen(s.startsAt)} · {s.durationMin} min{s.host ? ` · ${s.host}` : ""}
                      {!s.published && " · Hidden from website"}
                    </p>
                  </button>
                  <div className="w-[130px] text-[12px] text-[#5C716C]">
                    <span className="font-semibold tabular-nums text-brand-ink">{s.registrations.length}</span>
                    {s.capacity ? ` / ${s.capacity}` : ""} registered
                    {(p === "ended" || p === "live") && <span className="block">{joinedN} joined · peak {s.peakAttendance}</span>}
                  </div>
                  <StatusBadge tone={PHASE[p].tone}>{PHASE[p].label}</StatusBadge>
                  <div className="flex gap-1.5">
                    {(p === "upcoming" || p === "live") && <StartButton s={s} disabled={s.platform === "bbb" && !bbbReady} onDone={load} show={show} />}
                    <button onClick={() => setOpen(s.id)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                      Manage
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* create / edit */}
      <Modal open={!!edit} title={edit?.id ? "Edit session" : "Schedule a live session"} onClose={() => setEdit(null)} wide>
        {edit && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {(["webinar", "workshop", "class"] as LiveKind[]).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setEdit({ ...edit, kind: k })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-semibold ${edit.kind === k ? "border-brand-teal bg-brand-teal100/60 text-brand-deep" : "border-[#E2ECE9] text-[#41564f]"}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} /> {KIND_LABEL[k]}
                </button>
              ))}
            </div>
            <PlatformPicker
              value={edit.platform}
              enabled={pcfg?.enabled}
              bbbReady={bbbReady}
              onChange={(platform) => setEdit({ ...edit, platform })}
            />
            {edit.platform !== "bbb" && (
              <div className="space-y-3 rounded-2xl border border-[#E2ECE9] bg-[#FAFCFB] p-4">
                <TextField
                  label={`${PLATFORMS[edit.platform].label} meeting link`}
                  hint={edit.platform === "jitsi" ? `blank = new room on ${pcfg?.jitsiDomain ?? "meet.jit.si"}` : "students are sent here"}
                  value={edit.joinUrl}
                  onChange={(joinUrl) => setEdit({ ...edit, joinUrl })}
                  max={1000}
                  placeholder={PLATFORMS[edit.platform].linkHint}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {edit.platform === "zoom" && (
                    <TextField label="Host start link" hint="optional" value={edit.hostUrl} onChange={(hostUrl) => setEdit({ ...edit, hostUrl })} max={1000} placeholder="https://…zoom.us/s/…" />
                  )}
                  <TextField label="Passcode" hint="optional, shown only to registered students" value={edit.passcode} onChange={(passcode) => setEdit({ ...edit, passcode })} max={60} />
                </div>
                <p className="text-[12px] text-[#6b807b]">
                  The link stays private: only registered students receive it, through their personal join page, when the session opens.
                </p>
                {PLATFORMS[edit.platform].note && (
                  <p className="flex gap-2 rounded-xl bg-[#FFF8EA] px-3 py-2 text-[12.5px] text-[#6B4A00]">
                    <Icon name="alert" size={15} className="mt-0.5 shrink-0" /> {PLATFORMS[edit.platform].note}
                  </p>
                )}
              </div>
            )}
            <TextField label="Title" value={edit.title} onChange={(title) => setEdit({ ...edit, title })} max={160} placeholder="e.g. Future of AI in Education" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Host / presenter" value={edit.host} onChange={(host) => setEdit({ ...edit, host })} max={80} />
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Date & time (IST)</span>
                <input type="datetime-local" required value={toLocal(edit.startsAt)} onChange={(e) => e.target.value && setEdit({ ...edit, startsAt: fromLocal(e.target.value) })} className={fieldInput} />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <NumberField label="Duration (minutes)" min={15} max={600} value={edit.durationMin} onChange={(durationMin) => setEdit({ ...edit, durationMin })} />
              <NumberField label="Seats" hint="0 = unlimited" max={5000} value={edit.capacity} onChange={(capacity) => setEdit({ ...edit, capacity })} />
              <NumberField label="Price (₹)" hint="0 = free" max={1000000} value={edit.price} onChange={(price) => setEdit({ ...edit, price })} />
            </div>
            <TextField label="Description" value={edit.description} onChange={(description) => setEdit({ ...edit, description })} max={4000} multiline rows={3} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {edit.platform === "bbb" ? (
                <Toggle label="Record the session" hint="recording appears here afterwards" checked={edit.record} onChange={(record) => setEdit({ ...edit, record })} />
              ) : (
                <p className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3.5 py-2.5 text-[12.5px] text-[#41564f]">
                  Record inside {PLATFORMS[edit.platform].label}. Afterwards, paste the recording link in the session&apos;s Recordings tab to share a replay.
                </p>
              )}
              <Toggle label="Show on the website" hint="listed on the Live page for registration" checked={edit.published} onChange={(published) => setEdit({ ...edit, published })} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEdit(null)}>
                Cancel
              </Btn>
              <Btn type="submit" icon="check">
                {edit.id ? "Save changes" : "Schedule"}
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {selected && (
        <SessionDrawer
          s={selected}
          bbbReady={bbbReady}
          onClose={() => setOpen(null)}
          onEdit={() => {
            setEdit({ ...selected });
            setOpen(null);
          }}
          reload={load}
          show={show}
        />
      )}
      <Toast msg={toast} />
    </AdminShell>
  );
}

function PlatformPicker({ value, enabled, bbbReady, onChange }: { value: Platform; enabled?: Record<Platform, boolean>; bbbReady: boolean; onChange: (p: Platform) => void }) {
  const list = (Object.keys(PLATFORMS) as Platform[]).filter((p) => !enabled || enabled[p] || p === value);
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Platform</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => onChange(p)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition ${
              value === p ? "border-brand-teal bg-brand-teal100/60 text-brand-deep" : "border-[#E2ECE9] text-[#41564f] hover:border-brand-teal/50"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ background: PLATFORMS[p].color }}>
              {PLATFORMS[p].short.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate">{PLATFORMS[p].label}</span>
            {p === "bbb" && !bbbReady && <span className="text-[10px] font-semibold text-[#8A5A00]">setup</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function LinkRow({ label, url, show }: { label: string; url: string; show: (m: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[84px] shrink-0 text-[12px] font-semibold text-[#6b807b]">{label}</span>
      <code className="min-w-0 flex-1 truncate rounded-lg bg-[#F1F5F4] px-2 py-1 text-[11.5px] text-brand-ink">{url}</code>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url).then(() => show("Link copied"))}
        className="rounded-lg border border-[#E2ECE9] px-2 py-1 text-[11.5px] font-semibold text-[#41564f] hover:border-brand-teal"
      >
        Copy
      </button>
    </div>
  );
}

function StartButton({ s, disabled, onDone, show, big }: { s: LiveSession; disabled: boolean; onDone: () => void; show: (m: string) => void; big?: boolean }) {
  const [busy, setBusy] = useState(false);
  const live = s.status === "live";
  return (
    <button
      disabled={disabled || busy}
      title={disabled ? "Connect BigBlueButton in Settings first" : s.platform !== "bbb" ? `Opens ${PLATFORMS[s.platform].label} and lets registered students in` : undefined}
      onClick={async () => {
        // open the tab first (synchronously) so pop-up blockers allow it
        const tab = window.open("about:blank", "_blank");
        setBusy(true);
        const r = await fetch(`/api/admin/live/${s.id}/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        const d = await r.json();
        setBusy(false);
        if (!r.ok) {
          tab?.close();
          return show(d.error ?? "Could not start the room");
        }
        if (tab) tab.location.href = d.url;
        else window.location.href = d.url;
        show(live ? "Opening the room…" : "Session started. Registered students can join now.");
        onDone();
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
        big ? "h-10 px-4 text-[13px]" : "px-3 py-1.5 text-[12px]"
      } ${live ? "bg-[#E2445C] hover:bg-[#c93a50]" : "bg-brand-deep hover:bg-brand-teal"}`}
    >
      <Icon name="play" size={big ? 14 : 12} fill="currentColor" />
      {busy ? "Opening…" : live ? (s.platform === "bbb" ? "Rejoin as host" : `Open ${PLATFORMS[s.platform].short}`) : s.platform === "bbb" ? "Start & join as host" : `Start on ${PLATFORMS[s.platform].short}`}
    </button>
  );
}

interface Rec {
  recordID: string;
  name: string;
  published: boolean;
  state: string;
  startTime: number;
  playbackUrl: string;
  lengthMin: number;
  participants: number;
}

function SessionDrawer({
  s,
  bbbReady,
  onClose,
  onEdit,
  reload,
  show,
}: {
  s: LiveSession;
  bbbReady: boolean;
  onClose: () => void;
  onEdit: () => void;
  reload: () => void;
  show: (m: string) => void;
}) {
  const p = phase(s);
  const isBbb = s.platform === "bbb";
  const [replay, setReplay] = useState(s.recordingUrl);
  const [info, setInfo] = useState<{ running: boolean; participants: number; moderators: number; recording: boolean } | null>(null);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [recErr, setRecErr] = useState("");
  const [tab, setTab] = useState<"overview" | "people" | "recordings">(p === "ended" ? "recordings" : "overview");

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // poll room status while live
  useEffect(() => {
    if (p !== "live" || !bbbReady || !isBbb) return;
    let stop = false;
    const poll = () =>
      fetch(`/api/admin/live/${s.id}/status`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (stop) return;
          if (d.info) setInfo(d.info);
          if (d.session && (d.session.status !== s.status || d.session.peakAttendance !== s.peakAttendance)) reload();
        })
        .catch(() => undefined);
    poll();
    const t = window.setInterval(poll, 10000);
    return () => {
      stop = true;
      window.clearInterval(t);
    };
  }, [p, s.id, s.status, bbbReady, isBbb, reload]);

  useEffect(() => {
    if (tab !== "recordings" || recs || !bbbReady || !isBbb) return;
    fetch(`/api/admin/live/${s.id}/recordings`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.error ? setRecErr(d.error) : setRecs(d.recordings)))
      .catch(() => setRecErr("Couldn't load recordings"));
  }, [tab, recs, s.id, bbbReady, isBbb]);

  const post = async (path: string, body: object = {}) => {
    const r = await fetch(`/api/admin/live/${s.id}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? "Failed");
    return d;
  };

  const joined = s.registrations.filter((r) => r.joinedAt).length;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-[#021c18]/40" onClick={onClose} />
      <aside role="dialog" aria-label={s.title} className="absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-white shadow-2xl animate-[slideIn_.2s_ease]">
        <div className="border-b border-[#EEF3F1] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: KIND_COLOR[s.kind] }}>
                {KIND_LABEL[s.kind]}
              </p>
              <h3 className="text-[17px] font-semibold text-brand-ink">{s.title}</h3>
              <p className="text-[12.5px] text-[#6b807b]">
                {fmtWhen(s.startsAt)} · {s.durationMin} min{s.host ? ` · ${s.host}` : ""}
              </p>
            </div>
            <StatusBadge tone={PHASE[p].tone}>{PHASE[p].label}</StatusBadge>
            <button onClick={onClose} className="rounded-lg p-1.5 text-[#6b807b] hover:bg-[#F1F5F4]" aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(p === "upcoming" || p === "live") && <StartButton s={s} big disabled={isBbb && !bbbReady} onDone={reload} show={show} />}
            {p === "live" && (
              <Btn
                variant="danger"
                onClick={async () => {
                  if (!window.confirm("End the session for everyone?")) return;
                  try {
                    await post("/end");
                    show("Session ended");
                    reload();
                  } catch (e) {
                    show((e as Error).message);
                  }
                }}
              >
                End for everyone
              </Btn>
            )}
            <Btn variant="ghost" icon="edit" onClick={onEdit}>
              Edit
            </Btn>
            {p === "upcoming" && (
              <Btn
                variant="ghost"
                onClick={async () => {
                  if (!window.confirm("Cancel this session? Registered students will see it as cancelled.")) return;
                  await fetch(`/api/admin/live/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "cancelled" }) });
                  show("Session cancelled");
                  reload();
                }}
              >
                Cancel session
              </Btn>
            )}
            {(p === "cancelled" || p === "past" || (p === "upcoming" && !s.registrations.length)) && (
              <Btn
                variant="danger"
                icon="trash"
                onClick={async () => {
                  if (!window.confirm("Delete this session and its registrations?")) return;
                  await fetch(`/api/admin/live/${s.id}`, { method: "DELETE" });
                  show("Session deleted");
                  onClose();
                  reload();
                }}
              >
                Delete
              </Btn>
            )}
          </div>
        </div>

        <div className="border-b border-[#EEF3F1] px-5 py-2.5">
          <Segmented
            label="Session detail"
            value={tab}
            onChange={setTab}
            options={[
              { value: "overview", label: "Overview" },
              { value: "people", label: `Registrations (${s.registrations.length})` },
              { value: "recordings", label: "Recordings" },
            ]}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="space-y-4">
              {p === "live" && (
                <div className="rounded-2xl border border-[#0E937E]/30 bg-[#F3FBF8] p-4">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-deep">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#E2445C]" /> Room is open
                    {info?.recording && <span className="rounded-full bg-[#E2445C] px-2 py-0.5 text-[10.5px] font-bold text-white">REC</span>}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    {[
                      ["In the room", info ? info.participants : "…"],
                      ["Hosts", info ? info.moderators : "…"],
                      ["Peak", Math.max(s.peakAttendance, info?.participants ?? 0)],
                    ].map(([l, v]) => (
                      <div key={l as string} className="rounded-xl bg-white p-3">
                        <p className="text-[20px] font-semibold tabular-nums text-brand-ink">{v}</p>
                        <p className="text-[11.5px] text-[#6b807b]">{l}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11.5px] text-[#6b807b]">Updates every 10 seconds.</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Registered", `${s.registrations.length}${s.capacity ? ` / ${s.capacity}` : ""}`],
                  ["Joined", String(joined)],
                  ["Price", s.price ? `₹${s.price.toLocaleString("en-IN")}` : "Free"],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl border border-[#E2ECE9] p-3">
                    <p className="text-[11.5px] text-[#6b807b]">{l}</p>
                    <p className="text-[16px] font-semibold text-brand-ink">{v}</p>
                  </div>
                ))}
              </div>
              {s.description && <p className="whitespace-pre-line text-[13.5px] text-[#41564f]">{s.description}</p>}
              <ul className="space-y-1.5 text-[12.5px] text-[#41564f]">
                <li>• {s.published ? "Listed on the website's Live page" : "Hidden from the website (share links manually)"}</li>
                <li>• Runs on <b>{PLATFORMS[s.platform].label}</b>{isBbb ? (s.record ? ", will be recorded" : ", not recorded") : ""}</li>
                <li>
                  • Students join with their personal link from registration.{" "}
                  {isBbb ? "The room opens when you click Start." : "The link opens when you click Start, or 15 minutes before the start time."}
                </li>
              </ul>
              {!isBbb && (
                <div className="space-y-2 rounded-xl border border-[#E2ECE9] p-3.5">
                  <LinkRow label="Student link" url={s.joinUrl} show={show} />
                  {s.hostUrl && <LinkRow label="Host link" url={s.hostUrl} show={show} />}
                  {s.passcode && (
                    <p className="text-[12.5px] text-[#41564f]">
                      Passcode: <b className="font-mono">{s.passcode}</b>
                    </p>
                  )}
                  <p className="text-[11.5px] text-[#8aa39c]">Keep the student link private. Registered students get it automatically.</p>
                </div>
              )}
              {s.published && (
                <a href="/live" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-teal">
                  <Icon name="external" size={14} /> View on the Live page
                </a>
              )}
            </div>
          )}

          {tab === "people" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] text-[#6b807b]">
                  {s.registrations.length} registered · {joined} joined
                </p>
                {s.registrations.length > 0 && (
                  <Btn
                    variant="ghost"
                    icon="download"
                    onClick={() =>
                      downloadCsv(
                        `${s.title.replace(/[^\w]+/g, "-").toLowerCase()}-registrations.csv`,
                        ["Name", "Phone", "Email", "Registered", "Joined"],
                        s.registrations.map((r) => [r.name, r.phone, r.email, new Date(r.at).toLocaleString("en-IN"), r.joinedAt ? new Date(r.joinedAt).toLocaleString("en-IN") : ""]),
                      )
                    }
                  >
                    Export CSV
                  </Btn>
                )}
              </div>
              {s.registrations.length ? (
                <ul className="divide-y divide-[#F1F5F4] rounded-xl border border-[#E2ECE9]">
                  {s.registrations.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-brand-ink">{r.name}</span>
                        <span className="block text-[12px] text-[#6b807b]">
                          {r.phone}
                          {r.email && ` · ${r.email}`}
                        </span>
                      </span>
                      {r.joinedAt ? <StatusBadge tone="good">Joined</StatusBadge> : <span className="text-[12px] text-[#8aa39c]">{new Date(r.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-[#F7FAF9] p-4 text-[13px] text-[#6b807b]">No registrations yet. Students register on the website&apos;s Live page; each one also lands in CRM › Leads.</p>
              )}
            </div>
          )}

          {tab === "recordings" && !isBbb && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#41564f]">
                Recordings stay in {PLATFORMS[s.platform].label}. To share a replay on your website, paste its share link here (for example a Zoom cloud recording, a Teams/Stream link or an unlisted YouTube video).
              </p>
              <TextField label="Replay link" value={replay} onChange={setReplay} max={1000} placeholder="https://…" />
              <div className="flex flex-wrap gap-2">
                <Btn
                  icon="check"
                  onClick={async () => {
                    if (replay && !/^https?:\/\//.test(replay)) return show("Paste a full https:// link");
                    try {
                      await post("/recordings", { replayUrl: replay });
                      show(replay ? "Replay now shown on the Live page" : "Replay removed from the website");
                      reload();
                    } catch (e) {
                      show((e as Error).message);
                    }
                  }}
                >
                  {replay ? "Show replay on website" : "Remove replay"}
                </Btn>
                {s.replayPublic && s.recordingUrl && <StatusBadge tone="good">Shown on website</StatusBadge>}
              </div>
            </div>
          )}

          {tab === "recordings" && isBbb && (
            <div className="space-y-3">
              {!bbbReady ? (
                <p className="text-[13px] text-[#6b807b]">Connect BigBlueButton to see recordings.</p>
              ) : recErr ? (
                <p className="text-[13px] text-[#C22F33]">{recErr}</p>
              ) : !recs ? (
                <p className="text-[13px] text-[#6b807b]">Loading recordings…</p>
              ) : recs.length === 0 ? (
                <p className="rounded-xl bg-[#F7FAF9] p-4 text-[13px] text-[#6b807b]">
                  {s.record ? "No recordings yet. BigBlueButton processes recordings for a few minutes after the session ends." : "This session isn't set to record."}
                </p>
              ) : (
                recs.map((r) => {
                  const shown = s.recordingUrl === r.playbackUrl && s.replayPublic;
                  return (
                    <div key={r.recordID} className="rounded-xl border border-[#E2ECE9] p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-brand-ink">
                          {new Date(r.startTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                          <span className="ml-2 font-normal text-[#6b807b]">
                            {r.lengthMin} min · {r.participants} attended
                          </span>
                        </span>
                        <StatusBadge tone={r.published ? "good" : "neutral"}>{r.published ? "Published" : r.state || "Unpublished"}</StatusBadge>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {r.playbackUrl && (
                          <a href={r.playbackUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D9E6E2] px-3 text-[12.5px] font-semibold text-brand-deep">
                            <Icon name="play" size={13} /> Watch
                          </a>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              await post("/recordings", { recordID: r.recordID, publish: !r.published });
                              setRecs(recs.map((x) => (x.recordID === r.recordID ? { ...x, published: !r.published } : x)));
                            } catch (e) {
                              show((e as Error).message);
                            }
                          }}
                          className="h-9 rounded-lg border border-[#D9E6E2] px-3 text-[12.5px] font-semibold text-brand-deep"
                        >
                          {r.published ? "Unpublish" : "Publish"}
                        </button>
                        {r.playbackUrl && r.published && (
                          <button
                            onClick={async () => {
                              try {
                                await post("/recordings", { replayUrl: shown ? "" : r.playbackUrl });
                                show(shown ? "Removed from the website" : "Replay now shown on the Live page");
                                reload();
                              } catch (e) {
                                show((e as Error).message);
                              }
                            }}
                            className={`h-9 rounded-lg px-3 text-[12.5px] font-semibold ${shown ? "bg-brand-teal100 text-brand-deep" : "bg-brand-deep text-white"}`}
                          >
                            {shown ? "✓ Shown on website" : "Show replay on website"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
