"use client";

import { useCallback, useEffect, useState } from "react";
import { TODAY_ISO, applyTaskAction, daysBetween, fmtDate, type StaffTask, type TaskAction, type TaskStatus } from "@qschool/shared";
import { Btn, Card, Field, StatusBadge, inputCls, type Tone } from "@/components/admin/ui";

const TONE: Record<TaskStatus, Tone> = { Upcoming: "neutral", "In progress": "info", Blocked: "critical", Done: "good" };
const STATUSES: TaskStatus[] = ["Upcoming", "In progress", "Blocked", "Done"];
const uid = () => Math.random().toString(36).slice(2, 8);

export default function StaffTasksPortal() {
  const [me, setMe] = useState<string | null | undefined>(undefined); // undefined = checking
  const [tasks, setTasks] = useState<StaffTask[]>([]);

  const load = useCallback(async () => {
    const r = await fetch("/api/staff/tasks", { cache: "no-store" });
    if (r.status === 401) return setMe(null);
    const j = await r.json();
    setMe(j.name);
    setTasks(j.tasks);
  }, []);

  useEffect(() => {
    load().catch(() => setMe(null));
    const t = window.setInterval(() => load().catch(() => {}), 20000);
    return () => window.clearInterval(t);
  }, [load]);

  const send = async (action: TaskAction) => {
    setTasks((ts) => applyTaskAction(ts, action, me ?? "", new Date().toISOString().slice(0, 10)));
    const r = await fetch("/api/staff/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) });
    if (r.ok) setTasks((await r.json()).tasks);
    else load();
  };

  const logout = async () => {
    await fetch("/api/staff/session", { method: "DELETE" });
    setMe(null);
    setTasks([]);
  };

  if (me === undefined) return <main className="min-h-screen bg-[#F3F8F6]" />;
  if (me === null) return <Login onDone={load} />;

  return (
    <main className="min-h-screen bg-[#F3F8F6] p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold text-brand-ink">My tasks</h1>
            <p className="text-sm text-[#6b807b]">Hi {me} — keep milestones and hurdles up to date so management can see where work is stuck.</p>
          </div>
          <Btn variant="ghost" onClick={logout}>Sign out</Btn>
        </div>
        <div className="space-y-4">
          {tasks.map((t) => (
            <TaskCard key={t.id} t={t} send={send} />
          ))}
          {tasks.length === 0 && <Card><p className="text-sm text-[#6b807b]">No tasks assigned to you yet.</p></Card>}
        </div>
      </div>
    </main>
  );
}

function TaskCard({ t, send }: { t: StaffTask; send: (a: TaskAction) => void }) {
  const [note, setNote] = useState("");
  const [by, setBy] = useState("");
  const [upd, setUpd] = useState("");
  const late = t.status !== "Done" && t.due < TODAY_ISO;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-[#6b807b]">{t.id} · {t.priority} priority</p>
          <h2 className="text-[16px] font-semibold text-brand-ink">{t.title}</h2>
          <p className="mt-0.5 text-[13px] text-[#41564f]">{t.description}</p>
          <p className={`mt-1 text-[12px] ${late ? "font-semibold text-[#B42E2E]" : "text-[#6b807b]"}`}>Due {fmtDate(t.due)}{late ? " — overdue" : ""}</p>
        </div>
        <StatusBadge tone={TONE[t.status]}>{t.status}</StatusBadge>
      </div>

      <select aria-label="Status" value={t.status} onChange={(e) => send({ type: "status", id: t.id, status: e.target.value as TaskStatus })} className={`${inputCls} mt-3 max-w-[200px]`}>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>

      <h3 className="mb-1 mt-4 text-[13px] font-semibold text-brand-ink">Milestones</h3>
      {t.milestones.map((m) => (
        <label key={m.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-[#F7FAF9]">
          <input type="checkbox" className="h-4 w-4 accent-[#0E937E]" checked={m.done} onChange={() => send({ type: "milestone", id: t.id, mid: m.id })} />
          <span className={m.done ? "text-[#93a5a0] line-through" : "text-brand-ink"}>{m.title}</span>
        </label>
      ))}

      <h3 className="mb-1 mt-4 text-[13px] font-semibold text-brand-ink">Hurdles</h3>
      {t.blockers.map((b) => (
        <div key={b.id} className={`mb-2 rounded-xl border p-3 text-[12.5px] ${b.resolvedOn ? "border-[#E2ECE9] bg-[#F7FAF9]" : "border-[#F3C9CA] bg-[#FDF7F7]"}`}>
          <p className="font-semibold text-brand-ink">{b.note}</p>
          <p className="text-[#6b807b]">
            Waiting on {b.blockedBy} · {b.resolvedOn ? `resolved ${fmtDate(b.resolvedOn)}` : `${daysBetween(b.raisedOn, TODAY_ISO)} days`}
          </p>
          {!b.resolvedOn && (
            <button onClick={() => send({ type: "resolve", id: t.id, bid: b.id })} className="mt-2 rounded-lg bg-brand-deep px-3 py-1 text-[12px] font-semibold text-white">
              Mark resolved
            </button>
          )}
        </div>
      ))}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim() || !by.trim()) return;
          send({ type: "blocker", id: t.id, bid: uid(), note: note.trim(), blockedBy: by.trim() });
          setNote("");
          setBy("");
        }}
      >
        <input className={inputCls} placeholder="What is stopping the work?" value={note} onChange={(e) => setNote(e.target.value)} />
        <input className={inputCls} placeholder="Waiting on (person / team / vendor)" value={by} onChange={(e) => setBy(e.target.value)} />
        <Btn type="submit" variant="danger" icon="alert">Raise hurdle</Btn>
      </form>

      <h3 className="mb-1 mt-4 text-[13px] font-semibold text-brand-ink">Updates</h3>
      <ul className="space-y-1.5 border-l-2 border-[#E2ECE9] pl-3">
        {[...t.updates].reverse().slice(0, 5).map((u, i) => (
          <li key={i} className="text-[12.5px] text-brand-ink">{u.what} <span className="text-[11.5px] text-[#6b807b]">· {u.by}, {fmtDate(u.when)}</span></li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!upd.trim()) return;
          send({ type: "update", id: t.id, what: upd.trim() });
          setUpd("");
        }}
      >
        <input className={inputCls} placeholder="Add a progress update…" value={upd} onChange={(e) => setUpd(e.target.value)} />
        <Btn type="submit">Post</Btn>
      </form>
    </Card>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F8F6] p-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-[20px] border border-[#E2ECE9] bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const r = await fetch("/api/staff/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
          setBusy(false);
          if (r.ok) onDone();
          else setErr((await r.json().catch(() => ({}))).error ?? "Sign-in failed");
        }}
      >
        <h1 className="text-xl font-bold text-brand-ink">Staff sign in</h1>
        <p className="text-[13px] text-[#6b807b]">Use the login your manager created for you.</p>
        <Field label="Email"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></Field>
        <Field label="Password"><input type="password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <Btn type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Btn>
      </form>
    </main>
  );
}
