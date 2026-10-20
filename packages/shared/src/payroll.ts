/**
 * Payroll & attendance (shared by the Console, the staff portal and the API).
 * Pure functions only: the same maths drives the on-screen review, the payslip and the bank file.
 */
import type { Staff } from "./finance";

export type AttStatus = "P" | "WFH" | "HD" | "PL" | "A";
export const ATT_STATUSES: AttStatus[] = ["P", "WFH", "HD", "PL", "A"];
export const ATT_LABEL: Record<AttStatus, string> = { P: "Present", WFH: "Work from home", HD: "Half day", PL: "Paid leave", A: "Absent" };

/** One staff member's attendance for one date. `in`/`out` are ISO timestamps from self check-in. */
export interface AttRecord {
  status: AttStatus;
  in?: string;
  out?: string;
  /** "punch:matrix" | "punch:app" | "punch:web" | "punch:csv" for device-derived days, anything else = marked by HR. */
  by: string;
  /** Punched in but no punch-out yet / found (counted as present, flagged for HR). */
  open?: boolean;
}

export interface SalarySetup {
  /** Overrides the monthly gross from the staff directory. */
  ctc?: number;
  /** Deduct employee PF (12% of basic, wage ceiling applies). */
  pf: boolean;
  /** Monthly income-tax (TDS) to deduct, entered by finance. */
  tds: number;
  /** User ID enrolled on the Matrix biometric device (defaults to the employee number, e.g. 4 for EMP-004). */
  biometricId?: string;
  bank?: string;
  account?: string;
  ifsc?: string;
}

export interface PayAdjust {
  bonus: number;
  deduction: number;
  note: string;
}

export interface PayrollSettings {
  /** Flat monthly professional tax, applied when earned gross is above PT_THRESHOLD. */
  ptAmount: number;
  /** Hours between first and last punch for a full day (Present). */
  fullDayHours: number;
  /** Hours for a half day; less than this with a punch-out is Absent. */
  halfDayHours: number;
  /** Secret for the punch receiver (/api/punch) used by the biometric device. Generated on the server. */
  punchKey: string;
}

/** Punches closer together than this (minutes) are one swipe / a double tap. */
export const PUNCH_MIN_GAP_MIN = 60;

export const PAYROLL_RULES = {
  basicPct: 0.5, // basic = 50% of monthly gross
  hraPctOfBasic: 0.4, // HRA = 40% of basic; the rest is special allowance
  pfRate: 0.12,
  pfCeiling: 15000, // PF is calculated on basic up to ₹15,000
  esiRate: 0.0075, // employee ESI, only when full monthly gross ≤ ESI_LIMIT
  esiLimit: 21000,
  ptThreshold: 21000,
  weeklyOffDay: 0, // Sunday
};

export const DEFAULT_SETTINGS: PayrollSettings = { ptAmount: 200, fullDayHours: 6, halfDayHours: 3, punchKey: "" };
export const DEFAULT_SETUP: SalarySetup = { pf: true, tds: 0 };

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface PayLine {
  staffId: string;
  name: string;
  role: string;
  dept: string;
  centre: string;
  ctc: number; // monthly gross used for this run
  // attendance summary
  daysInMonth: number;
  workingDays: number;
  weeklyOffs: number;
  holidays: number;
  present: number;
  wfh: number;
  halfDays: number;
  paidLeave: number;
  absent: number;
  unmarked: number;
  notJoined: number;
  lopDays: number;
  payableDays: number;
  // earnings (pro-rated for payable days)
  basic: number;
  hra: number;
  special: number;
  bonus: number;
  gross: number;
  // deductions
  pf: number;
  esi: number;
  pt: number;
  tds: number;
  otherDeduction: number;
  totalDeductions: number;
  net: number;
  employerPf: number;
  note: string;
  bank?: string;
  account?: string;
  ifsc?: string;
}

export type RunStatus = "Draft" | "Locked" | "Paid";

export interface PayRun {
  month: string; // YYYY-MM
  status: RunStatus;
  lines: PayLine[];
  adjust: Record<string, PayAdjust>;
  generatedAt: string;
  lockedAt?: string;
  lockedBy?: string;
  paidAt?: string;
  paidOn?: string; // date the salaries were transferred
}

/* ───────────── dates ───────────── */

export const isMonth = (m: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m);

/** All dates (YYYY-MM-DD) of a month. */
export function monthDates(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

export const dayOfWeek = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
export const isWeeklyOff = (iso: string) => dayOfWeek(iso) === PAYROLL_RULES.weeklyOffDay;

/** Today's date in India (the server may run in another zone). */
export const todayIST = (now = new Date()) => now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
};

export function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/* ───────────── the payroll calculation ───────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
const r0 = (n: number) => Math.round(n);

export interface PayInput {
  staff: Staff;
  month: string;
  /** date → record for this staff member in this month */
  attendance: Record<string, AttRecord>;
  holidays: Holiday[];
  setup?: SalarySetup;
  adjust?: PayAdjust;
  settings?: PayrollSettings;
  /** today's date; days after it are not counted as absent yet */
  today: string;
}

/**
 * Pay for one person for one month.
 *  - Sundays and listed holidays are paid.
 *  - Absent and *unmarked past working days* are loss of pay; a half day loses 0.5.
 *  - Days before the joining date are not paid.
 *  - Earnings are pro-rated by payable days / calendar days.
 */
export function computePayLine(i: PayInput): PayLine {
  const setup = { ...DEFAULT_SETUP, ...i.setup };
  const settings = { ...DEFAULT_SETTINGS, ...i.settings };
  const adj = i.adjust ?? { bonus: 0, deduction: 0, note: "" };
  const hol = new Set(i.holidays.map((h) => h.date));
  const dates = monthDates(i.month);

  let weeklyOffs = 0, holidays = 0, workingDays = 0, present = 0, wfh = 0, halfDays = 0, paidLeave = 0, absent = 0, unmarked = 0, notJoined = 0;

  for (const d of dates) {
    if (d < i.staff.joined) {
      notJoined++;
      continue;
    }
    if (isWeeklyOff(d)) {
      weeklyOffs++;
      continue;
    }
    if (hol.has(d)) {
      holidays++;
      continue;
    }
    workingDays++;
    const rec = i.attendance[d];
    if (!rec) {
      if (d <= i.today) unmarked++; // not marked and already past -> counts as absent
      continue;
    }
    if (rec.status === "P") present++;
    else if (rec.status === "WFH") wfh++;
    else if (rec.status === "HD") halfDays++;
    else if (rec.status === "PL") paidLeave++;
    else absent++;
  }

  const lopDays = notJoined + absent + unmarked + halfDays * 0.5;
  const payableDays = dates.length - lopDays;
  const ratio = payableDays / dates.length;

  const ctc = setup.ctc && setup.ctc > 0 ? setup.ctc : i.staff.salary;
  const basic = r0(ctc * PAYROLL_RULES.basicPct * ratio);
  const hra = r0(ctc * PAYROLL_RULES.basicPct * PAYROLL_RULES.hraPctOfBasic * ratio);
  const special = r0(ctc * ratio) - basic - hra;
  const bonus = r2(Math.max(0, adj.bonus || 0));
  const gross = r2(basic + hra + special + bonus);
  const earnedBeforeBonus = basic + hra + special;

  const pf = setup.pf ? r0(Math.min(basic, PAYROLL_RULES.pfCeiling) * PAYROLL_RULES.pfRate) : 0;
  const esi = ctc <= PAYROLL_RULES.esiLimit ? r0(earnedBeforeBonus * PAYROLL_RULES.esiRate) : 0;
  const pt = earnedBeforeBonus > PAYROLL_RULES.ptThreshold ? r0(settings.ptAmount) : 0;
  const tds = r0(Math.max(0, setup.tds || 0));
  const otherDeduction = r2(Math.max(0, adj.deduction || 0));
  const totalDeductions = r2(pf + esi + pt + tds + otherDeduction);

  return {
    staffId: i.staff.id,
    name: i.staff.name,
    role: i.staff.role,
    dept: i.staff.dept,
    centre: i.staff.centre,
    ctc,
    daysInMonth: dates.length,
    workingDays,
    weeklyOffs,
    holidays,
    present,
    wfh,
    halfDays,
    paidLeave,
    absent,
    unmarked,
    notJoined,
    lopDays,
    payableDays,
    basic,
    hra,
    special,
    bonus,
    gross,
    pf,
    esi,
    pt,
    tds,
    otherDeduction,
    totalDeductions,
    net: Math.max(0, r2(gross - totalDeductions)),
    employerPf: pf,
    note: adj.note,
    bank: setup.bank,
    account: setup.account,
    ifsc: setup.ifsc,
  };
}

export function runTotals(lines: PayLine[]) {
  const sum = (f: (l: PayLine) => number) => r2(lines.reduce((a, l) => a + f(l), 0));
  return { people: lines.length, gross: sum((l) => l.gross), deductions: sum((l) => l.totalDeductions), net: sum((l) => l.net), pf: sum((l) => l.pf), employerPf: sum((l) => l.employerPf) };
}
