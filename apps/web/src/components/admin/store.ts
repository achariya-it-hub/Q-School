"use client";

/**
 * Console store — shared across admin pages with local persistence (survives page refresh).
 */
import { useSyncExternalStore } from "react";
import {
  EXPENSES,
  FEE_ACCOUNTS,
  INVENTORY,
  LEAVES,
  PIPELINE,
  applyTaskAction,
  type TaskAction,
  TODAY_ISO,
  type Expense,
  type StaffTask,
  type TaskStatus,
  type FeeAccount,
  type LeaveRequest,
  type PayMethod,
  type PipelineLead,
  type Stage,
  type StockItem,
} from "@qschool/shared";

interface State {
  accounts: FeeAccount[];
  leads: PipelineLead[];
  expenses: Expense[];
  leaves: LeaveRequest[];
  stock: StockItem[];
  tasks: StaffTask[];
}

const ACCOUNTS_CACHE_KEY = "qs_finance_accounts_cache";
const EXPENSES_CACHE_KEY = "qs_finance_expenses_cache";

function getInitialAccounts(): FeeAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function getInitialExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPENSES_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function persistState(s: State) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(s.accounts));
    localStorage.setItem(EXPENSES_CACHE_KEY, JSON.stringify(s.expenses));
  } catch {}
}

let state: State = {
  accounts: getInitialAccounts(),
  leads: [],
  expenses: getInitialExpenses(),
  leaves: [],
  stock: [],
  tasks: [], // loaded from the server by syncTasks()
};

// Re-sync from localStorage when running in client window
if (typeof window !== "undefined") {
  const savedAcc = getInitialAccounts();
  const savedExp = getInitialExpenses();
  state = {
    ...state,
    accounts: savedAcc,
    expenses: savedExp,
  };
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (fn: (s: State) => State) => {
  state = fn(state);
  persistState(state);
  emit();
};

export function clearFeeAccounts() {
  set((s) => ({ ...s, accounts: [] }));
}

export function restoreDefaultFeeAccounts() {
  set((s) => ({ ...s, accounts: [...FEE_ACCOUNTS] }));
}

export function useConsole<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
    () => select(state),
  );
}

/* ───────── Finance ───────── */

export function recordPayment(accountId: string, instNo: number, method: PayMethod, ref: string) {
  set((s) => ({
    ...s,
    accounts: s.accounts.map((a) =>
      a.id !== accountId
        ? a
        : {
            ...a,
            installments: a.installments.map((i) =>
              i.no === instNo ? { ...i, paidOn: TODAY_ISO, method, ref: ref || `${method}/${Date.now().toString().slice(-8)}` } : i,
            ),
          },
    ),
  }));
}

export function addFeeAccount(input: { student: string; phone: string; course: string; batch: string; centre: string; total: number; parts: number; firstDue: string }) {
  const per = Math.floor(input.total / input.parts);
  const start = new Date(input.firstDue + "T00:00:00Z");
  const installments = Array.from({ length: input.parts }, (_, k) => {
    const d = new Date(start);
    d.setUTCMonth(d.getUTCMonth() + k);
    return { no: k + 1, due: d.toISOString().slice(0, 10), amount: k === input.parts - 1 ? input.total - per * (input.parts - 1) : per };
  });
  set((s) => ({
    ...s,
    accounts: [
      {
        id: `FA-${1001 + s.accounts.length}`,
        student: input.student,
        phone: input.phone,
        email: `${input.student.split(" ")[0].toLowerCase()}@example.com`,
        course: input.course,
        batch: input.batch,
        centre: input.centre,
        installments,
      },
      ...s.accounts,
    ],
  }));
}

export function addExpense(e: Omit<Expense, "id">) {
  set((s) => ({ ...s, expenses: [{ ...e, id: `EXP-0${312 + s.expenses.length - EXPENSES.length}` }, ...s.expenses] }));
}

export function setExpenseStatus(id: string, status: Expense["status"]) {
  set((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? { ...e, status } : e)) }));
}

/* ───────── CRM ───────── */

export function moveLead(id: string, stage: Stage) {
  set((s) => ({
    ...s,
    leads: s.leads.map((l) =>
      l.id === id && l.stage !== stage
        ? { ...l, stage, slaBreached: false, lastActivity: "Just now", timeline: [...l.timeline, { when: "Just now", what: `Moved to ${stage}` }] }
        : l,
    ),
  }));
}

export function logActivity(id: string, what: string) {
  set((s) => ({
    ...s,
    leads: s.leads.map((l) =>
      l.id === id ? { ...l, slaBreached: false, lastActivity: "Just now", timeline: [...l.timeline, { when: "Just now", what }] } : l,
    ),
  }));
}

export function addLead(l: Pick<PipelineLead, "name" | "phone" | "interest" | "source" | "owner" | "value">) {
  set((s) => ({
    ...s,
    leads: [
      {
        ...l,
        id: `L-${1043 + s.leads.length - PIPELINE.length}`,
        stage: "Enquiry",
        createdAt: new Date().toISOString(),
        lastActivity: "Just now",
        timeline: [{ when: "Just now", what: `Lead created (${l.source})` }],
      },
      ...s.leads,
    ],
  }));
}

/* ───────── HR & Inventory ───────── */

export function setLeave(id: string, status: LeaveRequest["status"]) {
  set((s) => ({ ...s, leaves: s.leaves.map((l) => (l.id === id ? { ...l, status } : l)) }));
}

/* Staff tasks — saved on the server (/api/admin/tasks); the UI updates instantly, then adopts the server's list. */

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 8);

export async function syncTasks() {
  try {
    const r = await fetch("/api/admin/tasks", { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      set((s) => ({ ...s, tasks: j.tasks }));
    }
  } catch {}
}

async function dispatch(action: TaskAction) {
  set((s) => ({ ...s, tasks: applyTaskAction(s.tasks, action, "Admin", today()) }));
  try {
    const r = await fetch("/api/admin/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) });
    if (r.ok) {
      const j = await r.json();
      set((s) => ({ ...s, tasks: j.tasks }));
    }
  } catch {}
}

export function addTask(input: { title: string; description: string; assignee: string; priority: StaffTask["priority"]; due: string; milestones: string[] }) {
  dispatch({
    type: "create",
    task: {
      id: `TSK-${Date.now().toString(36).toUpperCase()}`,
      title: input.title,
      description: input.description,
      assignee: input.assignee,
      priority: input.priority,
      status: "Upcoming",
      due: input.due,
      milestones: input.milestones.map((m) => ({ id: uid(), title: m, done: false })),
      blockers: [],
      updates: [{ when: today(), by: "Admin", what: "Task created" }],
    },
  });
}

export const setTaskStatus = (id: string, status: TaskStatus) => dispatch({ type: "status", id, status });
export const toggleMilestone = (id: string, mid: string) => dispatch({ type: "milestone", id, mid });
export const addBlocker = (id: string, note: string, blockedBy: string) => dispatch({ type: "blocker", id, bid: uid(), note, blockedBy });
export const resolveBlocker = (id: string, bid: string) => dispatch({ type: "resolve", id, bid });
export const addTaskUpdate = (id: string, _by: string, what: string) => dispatch({ type: "update", id, what });

export function restock(sku: string, qty: number) {
  set((s) => ({ ...s, stock: s.stock.map((i) => (i.sku === sku ? { ...i, onHand: i.onHand + qty } : i)) }));
}

/* ───────── utils ───────── */

export function downloadCsv(name: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const t = String(v);
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
