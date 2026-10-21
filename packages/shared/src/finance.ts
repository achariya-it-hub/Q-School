/**
 * Q-School finance ledger (demo). One source of truth: student fee accounts with installments.
 * Invoices, payments, receipts and receivables are all DERIVED from it, so every screen agrees.
 * Amounts are GST-inclusive INR; education/coaching services are taxed at 18% (CGST 9% + SGST 9%).
 */

export const TODAY_ISO = "2026-10-01";
export const GST_RATE = 0.18;

export type PayMethod = "UPI" | "Card" | "Net Banking" | "Cash" | "EMI" | "Cheque";

export interface Installment {
  no: number;
  due: string; // ISO date
  amount: number;
  paidOn?: string; // ISO date
  method?: PayMethod;
  ref?: string; // gateway / UTR / cheque no.
  refunded?: boolean;
}

export interface FeeAccount {
  id: string;
  student: string;
  phone: string;
  email: string;
  course: string;
  batch: string;
  centre: string;
  installments: Installment[];
}

const A = (
  id: string,
  student: string,
  phone: string,
  course: string,
  batch: string,
  centre: string,
  installments: Installment[],
): FeeAccount => ({
  id,
  student,
  phone,
  email: `${student.split(" ")[0].toLowerCase()}@example.com`,
  course,
  batch,
  centre,
  installments,
});

export const FEE_ACCOUNTS: FeeAccount[] = [];

/* ───────────── helpers ───────────── */

const MS_DAY = 86400000;
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / MS_DAY);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function gstSplit(amount: number) {
  const taxable = Math.round((amount / (1 + GST_RATE)) * 100) / 100;
  const tax = Math.round((amount - taxable) * 100) / 100;
  const cgst = Math.round((tax / 2) * 100) / 100;
  return { taxable, cgst, sgst: Math.round((tax - cgst) * 100) / 100, tax };
}

export function accountTotals(a: FeeAccount, today = TODAY_ISO) {
  const total = a.installments.reduce((s, i) => s + i.amount, 0);
  const paid = a.installments.filter((i) => i.paidOn && !i.refunded).reduce((s, i) => s + i.amount, 0);
  const refunded = a.installments.filter((i) => i.refunded).reduce((s, i) => s + i.amount, 0);
  const overdueInst = a.installments.filter((i) => !i.paidOn && i.due < today);
  const overdue = overdueInst.reduce((s, i) => s + i.amount, 0);
  const next = a.installments.find((i) => !i.paidOn);
  const outstanding = refunded ? 0 : total - paid;
  const maxDaysLate = overdueInst.reduce((m, i) => Math.max(m, daysBetween(i.due, today)), 0);
  const status: "Paid" | "Overdue" | "Due" | "Refunded" = refunded
    ? "Refunded"
    : outstanding === 0
      ? "Paid"
      : overdue > 0
        ? "Overdue"
        : "Due";
  return { total, paid, outstanding, overdue, next, status, maxDaysLate };
}

/** Receivables aging of overdue amounts. */
export function aging(accounts: FeeAccount[], today = TODAY_ISO) {
  const b = { "0–30 days": 0, "31–60 days": 0, "61–90 days": 0, "90+ days": 0 };
  for (const a of accounts)
    for (const i of a.installments)
      if (!i.paidOn && i.due < today) {
        const d = daysBetween(i.due, today);
        if (d <= 30) b["0–30 days"] += i.amount;
        else if (d <= 60) b["31–60 days"] += i.amount;
        else if (d <= 90) b["61–90 days"] += i.amount;
        else b["90+ days"] += i.amount;
      }
  return Object.entries(b).map(([label, value]) => ({ label, value }));
}

/* ───────────── derived documents ───────────── */

export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Refunded";

export interface InvoiceDoc {
  id: string;
  accountId: string;
  instNo: number;
  student: string;
  email: string;
  phone: string;
  item: string;
  batch: string;
  amount: number;
  gst: number;
  date: string; // issue date (ISO)
  due: string;
  method?: PayMethod;
  status: InvoiceStatus;
}

/** An invoice is issued for every installment that is paid or falls due within 15 days. */
export function deriveInvoices(accounts: FeeAccount[], today = TODAY_ISO): InvoiceDoc[] {
  const rows: Omit<InvoiceDoc, "id">[] = [];
  for (const a of accounts)
    for (const i of a.installments) {
      const issue = i.paidOn && i.paidOn < i.due ? i.paidOn : i.due;
      if (!i.paidOn && daysBetween(today, i.due) > 15) continue;
      rows.push({
        accountId: a.id,
        instNo: i.no,
        student: a.student,
        email: a.email,
        phone: a.phone,
        item: a.installments.length > 1 ? `${a.course} — installment ${i.no} of ${a.installments.length}` : a.course,
        batch: a.batch,
        amount: i.amount,
        gst: gstSplit(i.amount).tax,
        date: issue,
        due: i.due,
        method: i.method,
        status: i.refunded ? "Refunded" : i.paidOn ? "Paid" : i.due < today ? "Overdue" : "Pending",
      });
    }
  rows.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : x.accountId < y.accountId ? -1 : 1));
  return rows.map((r, k) => ({ ...r, id: `INV-2026-${String(812 + k).padStart(4, "0")}` })).reverse();
}

export interface PaymentTxn {
  id: string;
  accountId: string;
  instNo: number;
  student: string;
  item: string;
  amount: number;
  method: PayMethod;
  ref: string;
  date: string;
  status: "Success" | "Failed" | "Refunded";
  receiptNo?: string;
}

export const FAILED_ATTEMPTS: Omit<PaymentTxn, "id">[] = [];

export function derivePayments(accounts: FeeAccount[]): PaymentTxn[] {
  const ok: Omit<PaymentTxn, "id">[] = [];
  for (const a of accounts)
    for (const i of a.installments)
      if (i.paidOn)
        ok.push({
          accountId: a.id,
          instNo: i.no,
          student: a.student,
          item: a.course,
          amount: i.amount,
          method: i.method ?? "UPI",
          ref: i.ref ?? "—",
          date: i.paidOn,
          status: i.refunded ? "Refunded" : "Success",
        });
  // receipts are numbered in payment order
  ok.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : x.accountId < y.accountId ? -1 : 1));
  const withReceipts = ok.map((p, k) => ({ ...p, receiptNo: `RCT-2026-${String(401 + k).padStart(4, "0")}` }));
  const all = [...withReceipts, ...FAILED_ATTEMPTS];
  all.sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0));
  return all.map((p, k) => ({ ...p, id: `TXN-${String(90500 - k)}` }));
}

export function numberToWords(n: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number) => (x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? " " + a[x % 10] : ""}`);
  const three = (x: number) => (x >= 100 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? " " + two(x % 100) : ""}` : two(x));
  n = Math.round(n);
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  if (crore) parts.push(`${two(crore)} Crore`);
  if (lakh) parts.push(`${two(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (rest) parts.push(three(rest));
  return parts.join(" ");
}

/* ───────────── Expenses ───────────── */

export interface Expense {
  id: string;
  date: string;
  category: "Salaries" | "Rent" | "Marketing" | "Software" | "Study material" | "Utilities" | "Travel";
  vendor: string;
  note: string;
  amount: number;
  centre: string;
  status: "Paid" | "Approved" | "Pending approval";
}

export const EXPENSES: Expense[] = [];

/* ───────────── HR & Staff ───────────── */

export interface Staff {
  id: string;
  name: string;
  role: string;
  dept: "Academics" | "Sales" | "Operations" | "Tech" | "Finance";
  centre: string;
  joined: string;
  salary: number; // monthly CTC
  today: "Present" | "On leave" | "Absent" | "WFH";
  /** false = left the organisation (kept for history, excluded from new payroll runs). */
  active?: boolean;
}

export const STAFF: Staff[] = [];

export interface LeaveRequest {
  id: string;
  staff: string;
  type: "Casual" | "Sick" | "Earned";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const LEAVES: LeaveRequest[] = [];

/* ───────────── Staff tasks, milestones & blockers ───────────── */

export type TaskStatus = "Upcoming" | "In progress" | "Blocked" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Blocker {
  id: string;
  note: string;
  /** Who/what is holding the work up (person, team or vendor). */
  blockedBy: string;
  raisedOn: string;
  resolvedOn?: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  assignee: string; // Staff.name
  priority: TaskPriority;
  status: TaskStatus;
  due: string;
  milestones: Milestone[];
  blockers: Blocker[];
  updates: { when: string; by: string; what: string }[];
}

export const STAFF_TASKS: StaffTask[] = [];

/** Every change to a task is one of these actions — applied identically in the browser (optimistic) and on the server (saved). */
export type TaskAction =
  | { type: "create"; task: StaffTask }
  | { type: "status"; id: string; status: TaskStatus }
  | { type: "milestone"; id: string; mid: string }
  | { type: "blocker"; id: string; bid: string; note: string; blockedBy: string }
  | { type: "resolve"; id: string; bid: string }
  | { type: "update"; id: string; what: string };

export function applyTaskAction(tasks: StaffTask[], a: TaskAction, by: string, today: string): StaffTask[] {
  if (a.type === "create") return tasks.some((t) => t.id === a.task.id) ? tasks : [a.task, ...tasks];
  return tasks.map((t) => {
    if (t.id !== a.id) return t;
    const log = (what: string) => [...t.updates, { when: today, by, what }];
    switch (a.type) {
      case "status":
        return { ...t, status: a.status, updates: log(`Status → ${a.status}`) };
      case "milestone": {
        const milestones = t.milestones.map((m) => (m.id === a.mid ? { ...m, done: !m.done } : m));
        const allDone = milestones.length > 0 && milestones.every((m) => m.done);
        const status: TaskStatus = allDone ? "Done" : t.status === "Done" || t.status === "Upcoming" ? "In progress" : t.status;
        return { ...t, milestones, status };
      }
      case "blocker":
        return {
          ...t,
          status: "Blocked",
          blockers: [...t.blockers, { id: a.bid, note: a.note, blockedBy: a.blockedBy, raisedOn: today }],
          updates: log(`Blocked by ${a.blockedBy}: ${a.note}`),
        };
      case "resolve": {
        const blockers = t.blockers.map((b) => (b.id === a.bid ? { ...b, resolvedOn: today } : b));
        const stillBlocked = blockers.some((b) => !b.resolvedOn);
        return { ...t, blockers, status: !stillBlocked && t.status === "Blocked" ? "In progress" : t.status, updates: log("Blocker resolved") };
      }
      case "update":
        return { ...t, updates: log(a.what) };
    }
  });
}

/* ───────────── Inventory ───────────── */

export interface StockItem {
  sku: string;
  name: string;
  centre: string;
  onHand: number;
  reorderAt: number;
  unitCost: number;
  vendor: string;
}

export const INVENTORY: StockItem[] = [];
