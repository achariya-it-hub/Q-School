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

export const FEE_ACCOUNTS: FeeAccount[] = [
  A("FA-1001", "Aarav Patel", "+91 91234 56789", "JEE Mathematics Complete", "JEE-27 Morning", "Online", [
    { no: 1, due: "2026-07-05", amount: 3250, paidOn: "2026-07-04", method: "UPI", ref: "UPI/4512998812" },
    { no: 2, due: "2026-08-05", amount: 3250, paidOn: "2026-08-05", method: "UPI", ref: "UPI/4598120034" },
    { no: 3, due: "2026-09-05", amount: 3250, paidOn: "2026-09-06", method: "UPI", ref: "UPI/4677310921" },
    { no: 4, due: "2026-10-05", amount: 3249 },
  ]),
  A("FA-1002", "Ananya Sharma", "+91 98989 89898", "Q-School Plus — annual", "Plus 2026", "Online", [
    { no: 1, due: "2026-09-29", amount: 11999, paidOn: "2026-09-29", method: "Card", ref: "pay_Ok81HcVb2" },
  ]),
  A("FA-1003", "Aditya Kulkarni", "+91 98220 33445", "Design Thinking for Young Minds", "DT-Oct", "Online", [
    { no: 1, due: "2026-10-01", amount: 4999, paidOn: "2026-10-01", method: "UPI", ref: "UPI/4781220019" },
  ]),
  A("FA-1004", "Pooja Reddy", "+91 90000 44556", "Coding for Beginners", "CB-Batch B", "Online", [
    { no: 1, due: "2026-10-01", amount: 3999, paidOn: "2026-10-01", method: "UPI", ref: "UPI/4781559023" },
  ]),
  A("FA-1005", "Vikram Singh", "+91 99860 11220", "Coding + Robotics bundle", "CB-Batch B", "Whitefield, Bengaluru", [
    { no: 1, due: "2026-09-30", amount: 2500, paidOn: "2026-09-30", method: "UPI", ref: "UPI/4779010288" },
    { no: 2, due: "2026-10-30", amount: 2500 },
    { no: 3, due: "2026-11-30", amount: 2499 },
  ]),
  A("FA-1006", "Neha Gupta", "+91 98111 22990", "Spoken English Mastery", "SE-Evening", "Online", [
    { no: 1, due: "2026-08-22", amount: 1250, paidOn: "2026-08-22", method: "UPI", ref: "UPI/4590023311" },
    { no: 2, due: "2026-09-22", amount: 1249 },
  ]),
  A("FA-1007", "Karan Mehta", "+91 98450 12121", "Leadership Skills for Students", "LS-Weekend", "Adyar, Chennai", [
    { no: 1, due: "2026-09-20", amount: 4499, paidOn: "2026-09-20", method: "Net Banking", ref: "NB/HDFC/77812" },
  ]),
  A("FA-1008", "Sara Thomas", "+91 94470 33344", "Robotics Workshop", "RW-Nov", "Whitefield, Bengaluru", [
    { no: 1, due: "2026-09-18", amount: 2499, paidOn: "2026-09-18", method: "Cash", ref: "Counter-BLR-0412" },
  ]),
  A("FA-1009", "Arnav Joshi", "+91 98201 77665", "Python for Kids", "PY-Weekday", "Online", [
    { no: 1, due: "2026-08-14", amount: 2000, paidOn: "2026-08-14", method: "EMI", ref: "EMI/Bajaj/88120" },
    { no: 2, due: "2026-09-14", amount: 1999 },
  ]),
  A("FA-1010", "Ishita Bose", "+91 98300 45454", "Design Thinking for Young Minds", "DT-Sep", "Online", [
    { no: 1, due: "2026-09-12", amount: 4999, paidOn: "2026-09-12", method: "Card", ref: "pay_Ns71KqLm9" },
  ]),
  A("FA-1011", "Rohan Das", "+91 98310 22110", "Creative Writing Workshop", "CW-Oct", "Online", [
    { no: 1, due: "2026-09-26", amount: 2499, paidOn: "2026-09-26", method: "Net Banking", ref: "NB/ICICI/55120", refunded: true },
  ]),
  A("FA-1012", "Meera Iyer", "+91 99400 66778", "NEET Biology Crash Course", "NEET-27 A", "Adyar, Chennai", [
    { no: 1, due: "2026-08-25", amount: 2999 },
  ]),
  A("FA-1013", "Kabir Malhotra", "+91 98100 99887", "Class 10 Science (CBSE)", "C10-Board", "Banjara Hills, Hyderabad", [
    { no: 1, due: "2026-06-01", amount: 2000, paidOn: "2026-06-01", method: "Cheque", ref: "CHQ 004512" },
    { no: 2, due: "2026-07-01", amount: 1999 },
  ]),
  A("FA-1014", "Tanya Kapoor", "+91 98700 12345", "Quantum Physics Foundations", "QP-Hybrid", "Online", [
    { no: 1, due: "2026-08-10", amount: 1667, paidOn: "2026-08-10", method: "UPI", ref: "UPI/4581220091" },
    { no: 2, due: "2026-09-10", amount: 1666 },
    { no: 3, due: "2026-10-10", amount: 1666 },
  ]),
  A("FA-1015", "Dev Nair", "+91 97400 55443", "Coding for Beginners", "CB-Batch C", "Online", [
    { no: 1, due: "2026-10-15", amount: 3999 },
  ]),
];

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

/** Failed gateway attempts (not on the ledger, but shown in the payments log). */
export const FAILED_ATTEMPTS: Omit<PaymentTxn, "id">[] = [
  { accountId: "FA-1006", instNo: 2, student: "Neha Gupta", item: "Spoken English Mastery", amount: 1249, method: "UPI", ref: "UPI/4671100090 — bank declined", date: "2026-09-22", status: "Failed" },
  { accountId: "FA-1009", instNo: 2, student: "Arnav Joshi", item: "Python for Kids", amount: 1999, method: "Card", ref: "pay_Mx22 — insufficient funds", date: "2026-09-15", status: "Failed" },
];

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

export const EXPENSES: Expense[] = [
  { id: "EXP-0311", date: "2026-10-01", category: "Marketing", vendor: "Meta Platforms", note: "Lead ads — Oct week 1", amount: 45000, centre: "HQ", status: "Paid" },
  { id: "EXP-0310", date: "2026-09-30", category: "Salaries", vendor: "Payroll (Frappe HR)", note: "September payroll — 18 staff", amount: 642000, centre: "HQ", status: "Paid" },
  { id: "EXP-0309", date: "2026-09-30", category: "Rent", vendor: "Anna Nagar Properties", note: "Chennai centre — October", amount: 85000, centre: "Adyar, Chennai", status: "Paid" },
  { id: "EXP-0308", date: "2026-09-29", category: "Software", vendor: "Hetzner Online", note: "BBB + app servers", amount: 18400, centre: "HQ", status: "Paid" },
  { id: "EXP-0307", date: "2026-09-27", category: "Study material", vendor: "Robo Kits India", note: "24 robotics kits", amount: 96000, centre: "Whitefield, Bengaluru", status: "Approved" },
  { id: "EXP-0306", date: "2026-09-25", category: "Marketing", vendor: "Google Ads", note: "Search campaign — Sep", amount: 32000, centre: "HQ", status: "Paid" },
  { id: "EXP-0305", date: "2026-09-24", category: "Utilities", vendor: "TNEB", note: "Electricity — Chennai", amount: 12600, centre: "Adyar, Chennai", status: "Paid" },
  { id: "EXP-0304", date: "2026-09-22", category: "Travel", vendor: "IndiGo", note: "Faculty travel — Hyderabad workshop", amount: 14200, centre: "Banjara Hills, Hyderabad", status: "Pending approval" },
  { id: "EXP-0303", date: "2026-09-20", category: "Rent", vendor: "Indiranagar Spaces", note: "Bangalore centre — October", amount: 92000, centre: "Whitefield, Bengaluru", status: "Paid" },
];

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

export const STAFF: Staff[] = [
  { id: "EMP-001", name: "Dr. Sarah Jenkins", role: "Director", dept: "Operations", centre: "HQ", joined: "2025-01-15", salary: 180000, today: "Present" },
  { id: "EMP-004", name: "Meera Nair", role: "Lead Instructor", dept: "Academics", centre: "Online", joined: "2025-02-01", salary: 95000, today: "Present" },
  { id: "EMP-005", name: "Rahul Verma", role: "Instructor — Coding", dept: "Academics", centre: "Online", joined: "2025-03-10", salary: 72000, today: "WFH" },
  { id: "EMP-006", name: "Kavya Iyer", role: "Instructor — Arts", dept: "Academics", centre: "Adyar, Chennai", joined: "2025-04-02", salary: 64000, today: "Present" },
  { id: "EMP-007", name: "Sanjay Menon", role: "Instructor — Robotics", dept: "Academics", centre: "Whitefield, Bengaluru", joined: "2025-04-20", salary: 78000, today: "On leave" },
  { id: "EMP-011", name: "Priya K.", role: "Admissions Counsellor", dept: "Sales", centre: "HQ", joined: "2025-06-01", salary: 38000, today: "Present" },
  { id: "EMP-012", name: "Rohit M.", role: "Admissions Counsellor", dept: "Sales", centre: "HQ", joined: "2025-06-15", salary: 38000, today: "Present" },
  { id: "EMP-013", name: "Sneha D.", role: "Admissions Counsellor", dept: "Sales", centre: "Banjara Hills, Hyderabad", joined: "2025-08-01", salary: 36000, today: "Absent" },
  { id: "EMP-014", name: "Arjun V.", role: "Sales Lead", dept: "Sales", centre: "Whitefield, Bengaluru", joined: "2025-05-11", salary: 55000, today: "Present" },
  { id: "EMP-016", name: "Lakshmi P.", role: "Accounts Executive", dept: "Finance", centre: "HQ", joined: "2025-07-01", salary: 42000, today: "Present" },
  { id: "EMP-018", name: "Naveen R.", role: "Platform Engineer", dept: "Tech", centre: "Online", joined: "2025-09-01", salary: 110000, today: "WFH" },
  { id: "EMP-020", name: "Fathima S.", role: "Centre Manager", dept: "Operations", centre: "Adyar, Chennai", joined: "2025-10-12", salary: 52000, today: "Present" },
];

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

export const LEAVES: LeaveRequest[] = [
  { id: "LV-221", staff: "Sneha D.", type: "Sick", from: "2026-10-01", to: "2026-10-02", days: 2, reason: "Fever", status: "Pending" },
  { id: "LV-220", staff: "Rahul Verma", type: "Casual", from: "2026-10-09", to: "2026-10-09", days: 1, reason: "Family function", status: "Pending" },
  { id: "LV-219", staff: "Sanjay Menon", type: "Earned", from: "2026-09-28", to: "2026-10-03", days: 5, reason: "Vacation", status: "Approved" },
];

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

export const STAFF_TASKS: StaffTask[] = [
  {
    id: "TSK-101", title: "Robotics kit restock for Bangalore", description: "Raise PO and receive 24 kits before the November batch.",
    assignee: "Sanjay Menon", priority: "High", status: "Blocked", due: "2026-10-12",
    milestones: [
      { id: "m1", title: "Get vendor quotes", done: true },
      { id: "m2", title: "PO approved by Finance", done: false },
      { id: "m3", title: "Kits received & counted", done: false },
    ],
    blockers: [{ id: "b1", note: "PO waiting for expense approval (EXP-0307)", blockedBy: "Lakshmi P. (Finance)", raisedOn: "2026-09-29" }],
    updates: [{ when: "2026-09-29", by: "Sanjay Menon", what: "Quotes shared; PO submitted for approval." }],
  },
  {
    id: "TSK-102", title: "JEE-27 course content update", description: "Revise chapters 4–7 with new problem sets.",
    assignee: "Meera Nair", priority: "Medium", status: "In progress", due: "2026-10-20",
    milestones: [
      { id: "m1", title: "Chapter 4 & 5 revised", done: true },
      { id: "m2", title: "Chapter 6 & 7 revised", done: false },
      { id: "m3", title: "Review by Director", done: false },
    ],
    blockers: [],
    updates: [{ when: "2026-10-01", by: "Meera Nair", what: "Chapters 4 and 5 completed." }],
  },
  {
    id: "TSK-103", title: "Fix live-class recording upload", description: "Recordings from BBB are not reaching the LMS after sessions end.",
    assignee: "Naveen R.", priority: "High", status: "Blocked", due: "2026-10-08",
    milestones: [
      { id: "m1", title: "Reproduce the failure", done: true },
      { id: "m2", title: "Patch recording webhook", done: false },
      { id: "m3", title: "Verify on 3 live sessions", done: false },
    ],
    blockers: [{ id: "b1", note: "Need server access / disk quota raised on Hetzner box", blockedBy: "Hetzner support", raisedOn: "2026-10-02" }],
    updates: [{ when: "2026-10-02", by: "Naveen R.", what: "Root cause: disk full on recording server." }],
  },
  {
    id: "TSK-104", title: "October admissions follow-up drive", description: "Call all Enquiry-stage leads older than 3 days.",
    assignee: "Priya K.", priority: "Medium", status: "Upcoming", due: "2026-10-18",
    milestones: [
      { id: "m1", title: "Export lead list", done: false },
      { id: "m2", title: "Complete calls", done: false },
    ],
    blockers: [], updates: [],
  },
  {
    id: "TSK-105", title: "Chennai centre fee reconciliation", description: "Reconcile cash and cheque collections for September.",
    assignee: "Lakshmi P.", priority: "Low", status: "Done", due: "2026-10-03",
    milestones: [
      { id: "m1", title: "Collect counter slips", done: true },
      { id: "m2", title: "Match to ledger", done: true },
    ],
    blockers: [], updates: [{ when: "2026-10-03", by: "Lakshmi P.", what: "Reconciled; no variances." }],
  },
];

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

export const INVENTORY: StockItem[] = [
  { sku: "KIT-ROBO-01", name: "Robotics starter kit", centre: "Whitefield, Bengaluru", onHand: 6, reorderAt: 10, unitCost: 4000, vendor: "Robo Kits India" },
  { sku: "KIT-ART-02", name: "Art & craft kit", centre: "Adyar, Chennai", onHand: 42, reorderAt: 20, unitCost: 650, vendor: "Camlin Wholesale" },
  { sku: "BK-JEE-M1", name: "JEE Maths workbook vol. 1", centre: "HQ", onHand: 180, reorderAt: 60, unitCost: 220, vendor: "Q-School Press" },
  { sku: "BK-NEET-B1", name: "NEET Biology notes", centre: "HQ", onHand: 34, reorderAt: 50, unitCost: 260, vendor: "Q-School Press" },
  { sku: "BK-C10-SCI", name: "Class 10 Science sample papers", centre: "Banjara Hills, Hyderabad", onHand: 75, reorderAt: 40, unitCost: 120, vendor: "Q-School Press" },
  { sku: "MER-TSHIRT", name: "Q-School T-shirt (kids)", centre: "HQ", onHand: 0, reorderAt: 30, unitCost: 280, vendor: "Tirupur Textiles" },
  { sku: "KIT-SCI-03", name: "Science experiment box", centre: "Online", onHand: 18, reorderAt: 15, unitCost: 900, vendor: "STEM Box Co." },
];
