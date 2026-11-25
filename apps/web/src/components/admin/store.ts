"use client";

/**
 * Console store — shared across admin pages with local persistence (survives page refresh).
 */
import { useEffect, useSyncExternalStore } from "react";
import {
  EXPENSES,
  FEE_ACCOUNTS,
  INVENTORY,
  LEAVES,
  PIPELINE,
  applyTaskAction,
  type TaskAction,
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
const LEAVES_CACHE_KEY = "qs_hr_leaves_cache";
const STOCK_CACHE_KEY = "qs_inventory_stock_cache";

function readCachedArray<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return fallback;
}

function getInitialAccounts(): FeeAccount[] {
  return readCachedArray<FeeAccount>(ACCOUNTS_CACHE_KEY, []);
}

function getInitialExpenses(): Expense[] {
  return readCachedArray<Expense>(EXPENSES_CACHE_KEY, []);
}

function getInitialLeaves(): LeaveRequest[] {
  return readCachedArray<LeaveRequest>(LEAVES_CACHE_KEY, [...LEAVES]);
}

function getInitialStock(): StockItem[] {
  return readCachedArray<StockItem>(STOCK_CACHE_KEY, [...INVENTORY]);
}

function persistState(s: State) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(s.accounts));
    localStorage.setItem(EXPENSES_CACHE_KEY, JSON.stringify(s.expenses));
    localStorage.setItem(LEAVES_CACHE_KEY, JSON.stringify(s.leaves));
    localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify(s.stock));
  } catch {}
}

let state: State = {
  accounts: getInitialAccounts(),
  leads: [],
  expenses: getInitialExpenses(),
  leaves: getInitialLeaves(),
  stock: getInitialStock(),
  tasks: [], // loaded from the server by syncTasks()
};

// Re-sync from localStorage when running in client window
if (typeof window !== "undefined") {
  state = {
    ...state,
    accounts: getInitialAccounts(),
    expenses: getInitialExpenses(),
    leaves: getInitialLeaves(),
    stock: getInitialStock(),
  };
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
type SyncKey = "accounts" | "expenses" | "leaves" | "stock";
const SYNC_KEYS: SyncKey[] = ["accounts", "expenses", "leaves", "stock"];
const idOf: Record<SyncKey, (x: any) => string> = {
  accounts: (x) => x.id,
  expenses: (x) => x.id,
  leaves: (x) => x.id,
  stock: (x) => x.sku,
};
/** Lists whose last upload failed (offline): the next sync uploads this browser's copy instead of replacing it. */
const dirty = new Set<SyncKey>();
let applyingRemote = false;

function pushKey(k: SyncKey) {
  if (typeof window === "undefined") return;
  fetch("/api/admin/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: k, items: state[k] }),
  })
    .then(async (r) => {
      if (!r.ok) return void dirty.add(k);
      dirty.delete(k);
      // The server kept payments newer than this browser's copy (another device): reload the list.
      const j = await r.json().catch(() => ({}));
      if (j.kept) void syncConsoleData();
    })
    .catch(() => dirty.add(k));
}

const set = (fn: (s: State) => State) => {
  const prev = state;
  state = fn(state);
  persistState(state);
  emit();
  // Every change is saved to the database straight away so other devices see it.
  if (!applyingRemote) for (const k of SYNC_KEYS) if (prev[k] !== state[k]) pushKey(k);
};

const paidScore = (a: FeeAccount) => a.installments.filter((i) => i.paidOn && !i.refunded).reduce((sum, i) => sum + i.amount, 0);

let syncInFlight = false;
/**
 * Keep fee plans, expenses, leave requests and inventory identical on every device (database is the source of truth).
 * First run on a browser: merge what it already holds into the database so nothing entered earlier is lost.
 */
export async function syncConsoleData(): Promise<void> {
  if (typeof window === "undefined" || syncInFlight) return;
  syncInFlight = true;
  try {
    const r = await fetch("/api/admin/sync", { cache: "no-store" });
    if (!r.ok) return;
    const j = await r.json().catch(() => ({}));
    for (const k of SYNC_KEYS) {
      const remote: any[] | null = Array.isArray(j[k]) ? j[k] : null;
      const local: any[] = state[k] as any[];
      if (remote === null) {
        if (local.length) pushKey(k); // nothing saved on the server yet: upload this browser's copy
        continue;
      }
      if (dirty.has(k)) {
        pushKey(k);
        continue;
      }
      let next: any[] = remote;
      let upload = false;
      try {
        const flag = `qs_sync_v2_${k}`;
        if (!localStorage.getItem(flag)) {
          // one-time merge of anything this browser entered before syncing existed
          const byId = new Map<string, any>(remote.map((x) => [idOf[k](x), x]));
          for (const x of local) {
            const id = idOf[k](x);
            const ex = byId.get(id);
            if (!ex) {
              byId.set(id, x);
              upload = true;
            } else if (k === "accounts" && paidScore(x) > paidScore(ex)) {
              byId.set(id, x);
              upload = true;
            }
          }
          next = Array.from(byId.values());
          localStorage.setItem(flag, "1");
        }
      } catch {}
      if (JSON.stringify(next) !== JSON.stringify(local)) {
        applyingRemote = true;
        try {
          set((s) => ({ ...s, [k]: next }) as State);
        } finally {
          applyingRemote = false;
        }
      }
      if (upload) pushKey(k);
    }
  } catch {
  } finally {
    syncInFlight = false;
  }
}
/** Kept for existing callers. */
export const syncFinanceAccounts = syncConsoleData;

let syncLoop = false;
function ensureSyncLoop() {
  if (typeof window === "undefined" || syncLoop) return;
  syncLoop = true;
  void syncConsoleData();
  window.setInterval(() => void syncConsoleData(), 30000);
  window.addEventListener("focus", () => void syncConsoleData());
}

export function clearFeeAccounts() {
  set((s) => ({ ...s, accounts: [] }));
}

export function restoreDefaultFeeAccounts() {
  set((s) => ({ ...s, accounts: [...FEE_ACCOUNTS] }));
}

export function resetAllConsoleData() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ACCOUNTS_CACHE_KEY);
      localStorage.removeItem(EXPENSES_CACHE_KEY);
      localStorage.removeItem(LEAVES_CACHE_KEY);
      localStorage.removeItem(STOCK_CACHE_KEY);
      localStorage.removeItem("qs_crm_leads_cache");
      localStorage.removeItem("qs_progress_tracker_cache");
      localStorage.removeItem("qs_partner_code");
    } catch {}
  }
  set(() => ({
    accounts: [],
    leads: [],
    expenses: [],
    leaves: [],
    stock: [],
    tasks: [],
  }));
}

export function useConsole<T>(select: (s: State) => T): T {
  useEffect(() => {
    ensureSyncLoop();
  }, []);
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

/**
 * Record a fee-plan (FA-…) payment on the server: every device sees it, and the server moves the matching lead to
 * Admitted and the matching student to Active. Throws when the server could not save it (nothing is recorded then).
 */
export async function recordPayment(accountId: string, instNo: number, method: PayMethod, ref: string, paidAmount?: number): Promise<FeeAccount> {
  const local = state.accounts.find((a) => a.id === accountId);
  const r = await fetch("/api/admin/fee-plans/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId, instNo, method, ref, amount: paidAmount ?? local?.installments.find((i) => i.no === instNo)?.amount, account: local }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.account) throw new Error(j.error || "Could not save the payment. Check the connection and try again.");
  const saved = j.account as FeeAccount;
  // Already saved on the server: update this browser's copy without uploading it again.
  applyingRemote = true;
  try {
    set((s) => ({ ...s, accounts: s.accounts.some((a) => a.id === saved.id) ? s.accounts.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...s.accounts] }));
  } finally {
    applyingRemote = false;
  }
  return saved;
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

export function addLeaveRequest(input: Omit<LeaveRequest, "id" | "status">) {
  set((s) => ({
    ...s,
    leaves: [
      {
        ...input,
        id: `LV-${101 + s.leaves.length}`,
        status: "Pending",
      },
      ...s.leaves,
    ],
  }));
}

export function addStockItem(item: StockItem) {
  set((s) => ({
    ...s,
    stock: [item, ...s.stock.filter((x) => x.sku !== item.sku)],
  }));
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
