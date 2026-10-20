/**
 * Server-only: payroll.json = attendance, salary setup, holidays and monthly pay runs;
 * punches.json = raw punches from the Matrix biometric device, the staff app and CSV imports.
 * Every write goes through one lock so two punches at the same moment never overwrite each other.
 */
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import {
  ATT_STATUSES,
  DEFAULT_SETTINGS,
  PUNCH_MIN_GAP_MIN,
  STAFF,
  computePayLine,
  isMonth,
  isWeeklyOff,
  monthDates,
  todayIST,
  type AttRecord,
  type AttStatus,
  type Holiday,
  type PayAdjust,
  type PayRun,
  type PayrollSettings,
  type SalarySetup,
  type Staff,
} from "@qschool/shared";
import { dataFile } from "@/lib/data-dir";

const FILE = dataFile("payroll.json");
const PUNCH_FILE = dataFile("punches.json");

export interface PayrollData {
  settings: PayrollSettings;
  /** Staff master (seeded from the demo directory the first time, then edited from the Console). */
  staff: Staff[];
  setup: Record<string, SalarySetup>;
  holidays: Holiday[];
  /** month -> staffId -> date -> record */
  attendance: Record<string, Record<string, Record<string, AttRecord>>>;
  runs: Record<string, PayRun>;
}

export type PunchSource = "matrix" | "app" | "web" | "csv";
export interface Punch {
  staffId: string;
  at: string; // ISO
  source: PunchSource;
  device?: string;
  lat?: number;
  lng?: number;
}
export interface Unmatched {
  userId: string;
  at: string;
  device?: string;
}
interface PunchFile {
  punches: Punch[];
  unmatched: Unmatched[];
}

let chain: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
}

export async function load(): Promise<PayrollData> {
  let d: Partial<PayrollData> = {};
  try {
    d = JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {}
  const data: PayrollData = { staff: d.staff ?? structuredClone(STAFF), settings: { ...DEFAULT_SETTINGS, ...d.settings }, setup: d.setup ?? {}, holidays: d.holidays ?? [], attendance: d.attendance ?? {}, runs: d.runs ?? {} };
  if (!data.settings.punchKey) {
    data.settings.punchKey = randomBytes(18).toString("hex"); // created once; the device is configured with it
    await fs.writeFile(FILE, JSON.stringify(data, null, 2));
  }
  return data;
}
const save = (d: PayrollData) => fs.writeFile(FILE, JSON.stringify(d, null, 2));

async function loadPunches(): Promise<PunchFile> {
  try {
    const d = JSON.parse(await fs.readFile(PUNCH_FILE, "utf8"));
    return { punches: d.punches ?? [], unmatched: d.unmatched ?? [] };
  } catch {
    return { punches: [], unmatched: [] };
  }
}
const savePunches = (p: PunchFile) => fs.writeFile(PUNCH_FILE, JSON.stringify(p));

const staffById = (data: PayrollData, id: string) => data.staff.find((s) => s.id === id);
const dateOk = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
const monthOf = (d: string) => d.slice(0, 7);

function assertOpen(data: PayrollData, month: string) {
  const run = data.runs[month];
  if (run && run.status !== "Draft") throw new Error(`${month} payroll is ${run.status.toLowerCase()}. Re-open it before changing attendance.`);
}

/** HR marks or clears attendance for one or many staff/dates. status null clears the mark. */
export function markAttendance(entries: { staffId: string; date: string; status: AttStatus | null }[], by: string) {
  return locked(async () => {
    const data = await load();
    for (const e of entries) {
      if (!staffById(data, e.staffId)) throw new Error(`Unknown staff ${e.staffId}`);
      if (!dateOk(e.date)) throw new Error("Bad date");
      if (e.status !== null && !ATT_STATUSES.includes(e.status)) throw new Error("Bad status");
      const m = monthOf(e.date);
      assertOpen(data, m);
      const days = ((data.attendance[m] ??= {})[e.staffId] ??= {});
      if (e.status === null) delete days[e.date];
      else days[e.date] = { ...days[e.date], status: e.status, by, open: undefined };
    }
    await save(data);
  });
}

/* ───────────── punches (biometric / app / csv) ───────────── */

/** Which staff member does a device User ID belong to? biometricId, then employee id, then the number in it (4 -> EMP-004). */
export function resolveStaff(data: PayrollData, userId: string): string | null {
  const u = userId.trim();
  if (!u) return null;
  for (const [sid, s] of Object.entries(data.setup)) if (s.biometricId && s.biometricId.trim().toLowerCase() === u.toLowerCase()) return sid;
  const direct = data.staff.find((s) => s.id.toLowerCase() === u.toLowerCase());
  if (direct) return direct.id;
  if (/^\d+$/.test(u)) return data.staff.find((s) => Number(s.id.replace(/\D/g, "")) === Number(u))?.id ?? null;
  return null;
}

/** Date + time exactly as the device prints them are India local time. */
export function parseLocalIST(date: string, time: string): string | null {
  const d = date.trim().replace(/\//g, "-");
  let iso = d;
  if (/^\d{2}-\d{2}-\d{4}$/.test(d)) iso = `${d.slice(6)}-${d.slice(3, 5)}-${d.slice(0, 2)}`; // DD-MM-YYYY
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const t = time.trim();
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t);
  if (!m) return null;
  const when = new Date(`${iso}T${m[1].padStart(2, "0")}:${m[2]}:${m[3] ?? "00"}+05:30`);
  return Number.isNaN(when.getTime()) ? null : when.toISOString();
}

/** Rebuilds one person's attendance for one date from all their punches that day. HR-marked days keep their status. */
function recompute(data: PayrollData, punches: Punch[], staffId: string, date: string) {
  const day = punches.filter((p) => p.staffId === staffId && todayIST(new Date(p.at)) === date).map((p) => Date.parse(p.at)).sort((a, b) => a - b);
  if (!day.length) return;
  const first = day[0];
  const outAt = [...day].reverse().find((t) => t - first >= PUNCH_MIN_GAP_MIN * 60000);
  const hours = outAt ? (outAt - first) / 3600000 : 0;
  const { fullDayHours, halfDayHours } = data.settings;
  const days = ((data.attendance[monthOf(date)] ??= {})[staffId] ??= {});
  const cur = days[date];
  const manual = !!cur && !cur.by.startsWith("punch");
  const status: AttStatus = manual ? cur.status : !outAt ? "P" : hours >= fullDayHours ? "P" : hours >= halfDayHours ? "HD" : "A";
  days[date] = { status, in: new Date(first).toISOString(), out: outAt ? new Date(outAt).toISOString() : undefined, by: manual ? cur.by : "punch", open: outAt ? undefined : true };
}

export interface RawPunch {
  userId?: string; // device user id (resolved to staff)
  staffId?: string; // already known (staff app)
  at: string; // ISO
  source: PunchSource;
  device?: string;
  lat?: number;
  lng?: number;
}

/**
 * Stores punches and updates the daily attendance. Duplicates (same person within one minute) are ignored.
 * Punches into a locked month are still logged but do not change attendance.
 */
export function recordPunches(items: RawPunch[]) {
  return locked(async () => {
    const data = await load();
    const pf = await loadPunches();
    let added = 0, duplicates = 0, frozen = 0;
    const unmatched: Unmatched[] = [];
    const touched = new Set<string>();
    for (const it of items.slice(0, 5000)) {
      const t = Date.parse(it.at);
      if (Number.isNaN(t) || t > Date.now() + 5 * 60000) {
        unmatched.push({ userId: it.userId ?? it.staffId ?? "?", at: it.at, device: "bad time" });
        continue;
      }
      const staffId = it.staffId && staffById(data, it.staffId) ? it.staffId : resolveStaff(data, it.userId ?? "");
      if (!staffId) {
        unmatched.push({ userId: it.userId ?? "?", at: new Date(t).toISOString(), device: it.device });
        continue;
      }
      if (pf.punches.some((p) => p.staffId === staffId && Math.abs(Date.parse(p.at) - t) < 60000)) {
        duplicates++;
        continue;
      }
      pf.punches.push({ staffId, at: new Date(t).toISOString(), source: it.source, device: it.device, lat: it.lat, lng: it.lng });
      added++;
      touched.add(`${staffId}|${todayIST(new Date(t))}`);
    }
    for (const k of touched) {
      const [sid, date] = k.split("|");
      const run = data.runs[monthOf(date)];
      if (run && run.status !== "Draft") {
        frozen++;
        continue;
      }
      recompute(data, pf.punches, sid, date);
      const rec = data.attendance[monthOf(date)]?.[sid]?.[date];
      if (rec && rec.by.startsWith("punch")) rec.by = `punch:${pf.punches.filter((p) => p.staffId === sid && todayIST(new Date(p.at)) === date).slice(-1)[0]?.source ?? "web"}`;
    }
    pf.unmatched = [...unmatched, ...pf.unmatched].slice(0, 200);
    pf.punches = pf.punches.slice(-60000);
    await savePunches(pf);
    await save(data);
    return { added, duplicates, frozen, unmatched: unmatched.length };
  });
}

/** Recent punches (newest first) and the User IDs that matched nobody, for the HR review screen. */
export async function recentPunches(limit = 60) {
  const pf = await loadPunches();
  return { punches: [...pf.punches].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit), unmatched: pf.unmatched.slice(0, 30) };
}

export async function todaysPunches(staffId: string, now = new Date()) {
  const today = todayIST(now);
  return (await loadPunches()).punches.filter((p) => p.staffId === staffId && todayIST(new Date(p.at)) === today).map((p) => p.at).sort();
}

export function regeneratePunchKey() {
  return locked(async () => {
    const data = await load();
    data.settings.punchKey = randomBytes(18).toString("hex");
    await save(data);
    return data.settings.punchKey;
  });
}

/* ───────────── setup, settings, holidays ───────────── */

export function setSetup(staffId: string, patch: Partial<SalarySetup>) {
  return locked(async () => {
    const data = await load();
    if (!staffById(data, staffId)) throw new Error("Unknown staff");
    const cur = data.setup[staffId] ?? { pf: true, tds: 0 };
    const next: SalarySetup = { ...cur };
    if (patch.ctc !== undefined) next.ctc = patch.ctc > 0 ? Math.round(patch.ctc) : undefined;
    if (patch.pf !== undefined) next.pf = !!patch.pf;
    if (patch.tds !== undefined) next.tds = Math.max(0, Math.round(Number(patch.tds) || 0));
    for (const k of ["bank", "account", "ifsc", "biometricId"] as const) if (patch[k] !== undefined) next[k] = String(patch[k]).trim().slice(0, 60) || undefined;
    if (next.ifsc) next.ifsc = next.ifsc.toUpperCase();
    if (next.biometricId) {
      const clash = Object.entries(data.setup).find(([sid, s]) => sid !== staffId && s.biometricId?.toLowerCase() === next.biometricId!.toLowerCase());
      if (clash) throw new Error(`Biometric ID ${next.biometricId} is already used by ${staffById(data, clash[0])?.name ?? clash[0]}`);
    }
    data.setup[staffId] = next;
    await save(data);
    return next;
  });
}

export function setSettings(patch: Partial<PayrollSettings>) {
  return locked(async () => {
    const data = await load();
    if (patch.ptAmount !== undefined) data.settings.ptAmount = Math.max(0, Math.round(Number(patch.ptAmount) || 0));
    if (patch.fullDayHours !== undefined) data.settings.fullDayHours = Math.min(24, Math.max(1, Number(patch.fullDayHours) || 6));
    if (patch.halfDayHours !== undefined) data.settings.halfDayHours = Math.min(data.settings.fullDayHours, Math.max(0.5, Number(patch.halfDayHours) || 3));
    await save(data);
    return data.settings;
  });
}

export function addHoliday(date: string, name: string) {
  return locked(async () => {
    if (!dateOk(date)) throw new Error("Pick a valid date");
    if (!name.trim()) throw new Error("Enter a holiday name");
    const data = await load();
    assertOpen(data, monthOf(date));
    data.holidays = [...data.holidays.filter((h) => h.date !== date), { date, name: name.trim().slice(0, 60) }].sort((a, b) => a.date.localeCompare(b.date));
    await save(data);
  });
}

export function removeHoliday(date: string) {
  return locked(async () => {
    const data = await load();
    assertOpen(data, monthOf(date));
    data.holidays = data.holidays.filter((h) => h.date !== date);
    await save(data);
  });
}

/* ───────────── pay runs ───────────── */

function build(data: PayrollData, month: string, adjust: Record<string, PayAdjust>, today: string) {
  return data.staff.filter((s) => s.active !== false).map((s) =>
    computePayLine({ staff: s, month, attendance: data.attendance[month]?.[s.id] ?? {}, holidays: data.holidays, setup: data.setup[s.id], adjust: adjust[s.id], settings: data.settings, today }),
  );
}

/** (Re)calculates a Draft run from the current attendance. Bonuses/deductions already entered are kept. */
export function generate(month: string, now = new Date()) {
  return locked(async () => {
    if (!isMonth(month)) throw new Error("Bad month");
    const data = await load();
    const old = data.runs[month];
    if (old && old.status !== "Draft") throw new Error(`${month} payroll is already ${old.status.toLowerCase()}`);
    const today = todayIST(now);
    if (monthDates(month)[0] > today) throw new Error("This month has not started yet");
    const adjust = old?.adjust ?? {};
    data.runs[month] = { month, status: "Draft", adjust, lines: build(data, month, adjust, today), generatedAt: now.toISOString() };
    await save(data);
    return data.runs[month];
  });
}

export function setAdjust(month: string, staffId: string, a: Partial<PayAdjust>, now = new Date()) {
  return locked(async () => {
    const data = await load();
    const run = data.runs[month];
    if (!run) throw new Error("Generate the payroll first");
    if (run.status !== "Draft") throw new Error("Payroll is locked. Re-open it to change amounts");
    if (!staffById(data, staffId)) throw new Error("Unknown staff");
    const cur = run.adjust[staffId] ?? { bonus: 0, deduction: 0, note: "" };
    run.adjust[staffId] = {
      bonus: a.bonus !== undefined ? Math.max(0, Number(a.bonus) || 0) : cur.bonus,
      deduction: a.deduction !== undefined ? Math.max(0, Number(a.deduction) || 0) : cur.deduction,
      note: a.note !== undefined ? String(a.note).trim().slice(0, 120) : cur.note,
    };
    run.lines = build(data, month, run.adjust, todayIST(now));
    await save(data);
    return run;
  });
}

export function lockRun(month: string, by: string, now = new Date()) {
  return locked(async () => {
    const data = await load();
    const run = data.runs[month];
    if (!run) throw new Error("Generate the payroll first");
    if (run.status !== "Draft") throw new Error(`Payroll is already ${run.status.toLowerCase()}`);
    // final recalculation so the locked numbers match the latest attendance
    run.lines = build(data, month, run.adjust, todayIST(now));
    run.status = "Locked";
    run.lockedAt = now.toISOString();
    run.lockedBy = by;
    await save(data);
    return run;
  });
}

export function reopenRun(month: string) {
  return locked(async () => {
    const data = await load();
    const run = data.runs[month];
    if (!run) throw new Error("No payroll for this month");
    if (run.status === "Paid") throw new Error("Paid payroll cannot be re-opened");
    run.status = "Draft";
    delete run.lockedAt;
    delete run.lockedBy;
    await save(data);
    return run;
  });
}

export function markPaid(month: string, paidOn: string, now = new Date()) {
  return locked(async () => {
    const data = await load();
    const run = data.runs[month];
    if (!run) throw new Error("No payroll for this month");
    if (run.status !== "Locked") throw new Error("Lock the payroll before marking it paid");
    if (!dateOk(paidOn)) throw new Error("Enter the payment date");
    run.status = "Paid";
    run.paidOn = paidOn;
    run.paidAt = now.toISOString();
    await save(data);
    return run;
  });
}

/* ───────────── staff master ───────────── */

export type StaffInput = Pick<Staff, "name" | "role" | "dept" | "centre" | "joined" | "salary">;

function cleanStaff(i: Partial<StaffInput>): Partial<StaffInput> {
  const o: Partial<StaffInput> = {};
  if (i.name !== undefined) o.name = String(i.name).trim().slice(0, 60);
  if (i.role !== undefined) o.role = String(i.role).trim().slice(0, 60);
  if (i.dept !== undefined) {
    if (!["Academics", "Sales", "Operations", "Tech", "Finance"].includes(i.dept)) throw new Error("Pick a department");
    o.dept = i.dept;
  }
  if (i.centre !== undefined) o.centre = String(i.centre).trim().slice(0, 60);
  if (i.joined !== undefined) {
    if (!dateOk(i.joined)) throw new Error("Enter a valid joining date");
    o.joined = i.joined;
  }
  if (i.salary !== undefined) {
    const n = Math.round(Number(i.salary));
    if (!(n > 0)) throw new Error("Enter the monthly salary");
    o.salary = n;
  }
  return o;
}

export function addStaff(input: StaffInput) {
  return locked(async () => {
    const data = await load();
    const o = cleanStaff(input);
    if (!o.name || !o.role || !o.dept || !o.joined || !o.salary) throw new Error("Name, role, department, joining date and salary are required");
    const next = Math.max(0, ...data.staff.map((s) => Number(s.id.replace(/\D/g, "")) || 0)) + 1;
    const s: Staff = { id: `EMP-${String(next).padStart(3, "0")}`, name: o.name, role: o.role, dept: o.dept, centre: o.centre || "HQ", joined: o.joined, salary: o.salary, today: "Present", active: true };
    data.staff.push(s);
    await save(data);
    return s;
  });
}

export function updateStaff(id: string, patch: Partial<StaffInput> & { active?: boolean }) {
  return locked(async () => {
    const data = await load();
    const s = staffById(data, id);
    if (!s) throw new Error("Unknown staff");
    Object.assign(s, cleanStaff(patch));
    if (!s.name || !s.role) throw new Error("Name and role cannot be empty");
    if (patch.active !== undefined) s.active = !!patch.active;
    await save(data);
    return s;
  });
}

/**
 * Approved leave becomes Paid leave (PL) on the attendance sheet; rejecting / cancelling removes it again.
 * Sundays, holidays, locked months and days HR or a punch already marked are left alone. Returns days marked / skipped.
 */
export function syncLeave(leaveId: string, staffName: string, from: string, to: string, approved: boolean) {
  return locked(async () => {
    const data = await load();
    const s = data.staff.find((x) => x.name === staffName);
    if (!s) throw new Error(`No staff named ${staffName}`);
    if (!dateOk(from) || !dateOk(to) || to < from) throw new Error("Bad leave dates");
    const tag = `leave:${leaveId}`;
    const hol = new Set(data.holidays.map((h) => h.date));
    let marked = 0, skipped = 0;
    for (let t = Date.parse(from); t <= Date.parse(to) && marked + skipped < 400; t += 86400000) {
      const date = new Date(t).toISOString().slice(0, 10);
      const m = monthOf(date);
      const days = ((data.attendance[m] ??= {})[s.id] ??= {});
      const cur = days[date];
      if (!approved) {
        if (cur?.by === tag && !(data.runs[m] && data.runs[m].status !== "Draft")) delete days[date];
        continue;
      }
      if (isWeeklyOff(date) || hol.has(date)) continue;
      if ((data.runs[m] && data.runs[m].status !== "Draft") || (cur && cur.by !== tag)) {
        skipped++;
        continue;
      }
      days[date] = { status: "PL", by: tag };
      marked++;
    }
    await save(data);
    return { marked, skipped };
  });
}
