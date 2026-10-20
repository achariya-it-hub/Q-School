"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StaffLogins } from "@/components/admin/staff-logins";
import { TODAY_ISO, daysBetween, fmtDate, type StaffTask, type TaskPriority, type TaskStatus } from "@qschool/shared";
import { useStaffMaster } from "@/components/admin/use-staff";
import { AdminShell } from "@/components/admin/shell";
import { Avatar } from "@/components/dashboard/art";
import {
  Btn, Card, Drawer, Field, Figure, Modal, PageHeader, SearchInput, Segmented, StatusBadge, Toast, inputCls, useToast, type Tone,
} from "@/components/admin/ui";
import { addBlocker, addTask, addTaskUpdate, resolveBlocker, setTaskStatus, syncTasks, toggleMilestone, useConsole } from "@/components/admin/store";

const STATUS_TONE: Record<TaskStatus, Tone> = { Upcoming: "neutral", "In progress": "info", Blocked: "critical", Done: "good" };
const PRIO_TONE: Record<TaskPriority, Tone> = { High: "serious", Medium: "warning", Low: "neutral" };
type Filter = "All" | TaskStatus;
const STATUSES: TaskStatus[] = ["Upcoming", "In progress", "Blocked", "Done"];

const progress = (t: StaffTask) => (t.milestones.length ? Math.round((t.milestones.filter((m) => m.done).length / t.milestones.length) * 100) : t.status === "Done" ? 100 : 0);
const overdue = (t: StaffTask) => t.status !== "Done" && t.due < TODAY_ISO;
const openBlockers = (t: StaffTask) => t.blockers.filter((b) => !b.resolvedOn);

export default function StaffTasksPage() {
  const router = useRouter();
  const tasks = useConsole((s) => s.tasks);
  const { active: STAFF } = useStaffMaster();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [person, setPerson] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [logins, setLogins] = useState(false);
  const [toast, show] = useToast();

  // Tasks are stored on the server and staff edit them too — load now and refresh every 15s.
  useEffect(() => {
    syncTasks();
    const t = window.setInterval(syncTasks, 15000);
    return () => window.clearInterval(t);
  }, []);

  const list = tasks
    .filter((t) => filter === "All" || t.status === filter)
    .filter((t) => person === "All" || t.assignee === person)
    .filter((t) => `${t.title} ${t.assignee} ${t.id}`.toLowerCase().includes(q.toLowerCase()));
  const blocked = tasks.filter((t) => t.status === "Blocked");
  const open = tasks.find((t) => t.id === openId) ?? null;

  return (
    <AdminShell>
      <PageHeader title="Staff Tasks" sub="Milestones, upcoming work and hurdles — see what is stuck and who it is waiting on">
        <Btn variant="ghost" icon="briefcase" onClick={() => router.push("/admin/staff")}>HR &amp; Staff</Btn>
        <Btn variant="ghost" icon="users" onClick={() => setLogins(true)}>Staff logins</Btn>
        <Btn icon="plus" onClick={() => setCreating(true)}>New task</Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Open tasks" value={String(tasks.filter((t) => t.status !== "Done").length)} sub={`${tasks.filter((t) => t.status === "Upcoming").length} upcoming`} icon="lessons" />
        <Figure label="In progress" value={String(tasks.filter((t) => t.status === "In progress").length)} icon="live" />
        <Figure label="Blocked" value={String(blocked.length)} sub="Needs management attention" icon="alert" />
        <Figure label="Overdue" value={String(tasks.filter(overdue).length)} sub="Past due date" icon="clock" />
      </section>

      {blocked.length > 0 && (
        <div className="mt-5">
          <Card title="Stuck work — who is holding it up">
            <ul className="space-y-2.5">
              {blocked.map((t) =>
                openBlockers(t).map((b) => (
                  <li key={t.id + b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F3C9CA] bg-[#FDF7F7] p-3">
                    <button onClick={() => setOpenId(t.id)} className="min-w-0 text-left">
                      <p className="text-[13.5px] font-semibold text-brand-ink">{t.title}</p>
                      <p className="text-[12px] text-[#41564f]">
                        {t.assignee} is waiting on <b>{b.blockedBy}</b> — {b.note}
                      </p>
                    </button>
                    <span className="whitespace-nowrap text-[12px] font-semibold text-[#B42E2E]">Stuck {daysBetween(b.raisedOn, TODAY_ISO)} days</span>
                  </li>
                )),
              )}
            </ul>
          </Card>
        </div>
      )}

      <div className="mt-5">
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search tasks…" />
            <Segmented<Filter> label="Status" value={filter} onChange={setFilter} options={(["All", ...STATUSES] as Filter[]).map((v) => ({ value: v, label: v }))} />
            <select value={person} onChange={(e) => setPerson(e.target.value)} className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[13px]" aria-label="Assignee">
              <option>All</option>
              {STAFF.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {list.map((t) => (
              <li key={t.id}>
                <button onClick={() => setOpenId(t.id)} className="w-full rounded-2xl border border-[#E2ECE9] p-4 text-left transition hover:border-brand-teal hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#6b807b]">{t.id}</p>
                      <p className="text-[14.5px] font-semibold text-brand-ink">{t.title}</p>
                    </div>
                    <StatusBadge tone={STATUS_TONE[t.status]}>{t.status}</StatusBadge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Avatar name={t.assignee} size={26} />
                    <span className="text-[12.5px] text-[#41564f]">{t.assignee}</span>
                    <span className={`ml-auto text-[12px] ${overdue(t) ? "font-semibold text-[#B42E2E]" : "text-[#6b807b]"}`}>
                      Due {fmtDate(t.due)}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#D7F0EB]">
                    <div className="h-full rounded-full bg-[#0E937E]" style={{ width: `${progress(t)}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-[#6b807b]">
                    <span>{t.milestones.filter((m) => m.done).length}/{t.milestones.length} milestones</span>
                    <span className="flex items-center gap-2">
                      {openBlockers(t).length > 0 && <span className="font-semibold text-[#B42E2E]">{openBlockers(t).length} blocker</span>}
                      <StatusBadge tone={PRIO_TONE[t.priority]}>{t.priority}</StatusBadge>
                    </span>
                  </div>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="py-8 text-center text-sm text-[#6b807b]">No tasks match.</li>}
          </ul>
        </Card>
      </div>

      <TaskDrawer task={open} onClose={() => setOpenId(null)} show={show} />
      <NewTask open={creating} onClose={() => setCreating(false)} onCreate={() => show("Task created")} />
      <StaffLogins open={logins} onClose={() => setLogins(false)} show={show} />
      <Toast msg={toast} />
    </AdminShell>
  );
}

function TaskDrawer({ task, onClose, show }: { task: StaffTask | null; onClose: () => void; show: (m: string) => void }) {
  const [note, setNote] = useState("");
  const [by, setBy] = useState("");
  const [update, setUpdate] = useState("");
  if (!task) return <Drawer open={false} title="" onClose={onClose}>{null}</Drawer>;

  return (
    <Drawer open title={`${task.id} · ${task.title}`} onClose={onClose}>
      <p className="text-[13px] text-[#41564f]">{task.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-[#41564f]">
        <Avatar name={task.assignee} size={26} /> {task.assignee} · Due {fmtDate(task.due)}
        <StatusBadge tone={PRIO_TONE[task.priority]}>{task.priority}</StatusBadge>
      </div>

      <Field label="Status">
        <select value={task.status} onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)} className={`${inputCls} mt-3`}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>

      <h4 className="mb-2 mt-5 text-[13px] font-semibold text-brand-ink">Milestones ({progress(task)}%)</h4>
      <ul className="space-y-1.5">
        {task.milestones.map((m) => (
          <li key={m.id}>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-[#F7FAF9]">
              <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(task.id, m.id)} className="h-4 w-4 accent-[#0E937E]" />
              <span className={m.done ? "text-[#93a5a0] line-through" : "text-brand-ink"}>{m.title}</span>
            </label>
          </li>
        ))}
      </ul>

      <h4 className="mb-2 mt-5 text-[13px] font-semibold text-brand-ink">Hurdles / blockers</h4>
      <ul className="space-y-2">
        {task.blockers.map((b) => (
          <li key={b.id} className={`rounded-xl border p-3 text-[12.5px] ${b.resolvedOn ? "border-[#E2ECE9] bg-[#F7FAF9]" : "border-[#F3C9CA] bg-[#FDF7F7]"}`}>
            <p className="font-semibold text-brand-ink">{b.note}</p>
            <p className="text-[#6b807b]">
              Waiting on {b.blockedBy} · raised {fmtDate(b.raisedOn)}
              {b.resolvedOn ? ` · resolved ${fmtDate(b.resolvedOn)}` : ` · ${daysBetween(b.raisedOn, TODAY_ISO)} days`}
            </p>
            {!b.resolvedOn && (
              <button onClick={() => (resolveBlocker(task.id, b.id), show("Blocker resolved"))} className="mt-2 rounded-lg bg-brand-deep px-3 py-1 text-[12px] font-semibold text-white">
                Mark resolved
              </button>
            )}
          </li>
        ))}
        {task.blockers.length === 0 && <li className="text-[12.5px] text-[#6b807b]">No hurdles raised.</li>}
      </ul>
      <form
        className="mt-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim() || !by.trim()) return;
          addBlocker(task.id, note.trim(), by.trim());
          setNote(""); setBy(""); show("Blocker raised");
        }}
      >
        <input className={inputCls} placeholder="What is stopping the work?" value={note} onChange={(e) => setNote(e.target.value)} />
        <input className={inputCls} placeholder="Waiting on (person / team / vendor)" value={by} onChange={(e) => setBy(e.target.value)} />
        <Btn type="submit" variant="danger" icon="alert">Raise blocker</Btn>
      </form>

      <h4 className="mb-2 mt-5 text-[13px] font-semibold text-brand-ink">Updates</h4>
      <ul className="space-y-2 border-l-2 border-[#E2ECE9] pl-3">
        {[...task.updates].reverse().map((u, i) => (
          <li key={i} className="text-[12.5px]">
            <p className="text-brand-ink">{u.what}</p>
            <p className="text-[11.5px] text-[#6b807b]">{u.by} · {fmtDate(u.when)}</p>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!update.trim()) return;
          addTaskUpdate(task.id, task.assignee, update.trim());
          setUpdate("");
        }}
      >
        <input className={inputCls} placeholder="Add a progress update…" value={update} onChange={(e) => setUpdate(e.target.value)} />
        <Btn type="submit">Post</Btn>
      </form>
    </Drawer>
  );
}

function NewTask({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { active: STAFF } = useStaffMaster();
  const [assignee, setAssignee] = useState(STAFF[0]?.name ?? "");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [due, setDue] = useState(TODAY_ISO);
  const [ms, setMs] = useState("");

  return (
    <Modal open={open} title="New task" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addTask({ title: title.trim(), description, assignee, priority, due, milestones: ms.split("\n").map((m) => m.trim()).filter(Boolean) });
          setTitle(""); setDescription(""); setMs("");
          onCreate(); onClose();
        }}
      >
        <Field label="Title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
        <Field label="Description"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Assignee">
            <select className={inputCls} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              {STAFF.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Due date"><input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <Field label="Milestones (one per line)">
          <textarea className={`${inputCls} h-24 py-2`} value={ms} onChange={(e) => setMs(e.target.value)} />
        </Field>
        <Btn type="submit">Create task</Btn>
      </form>
    </Modal>
  );
}
