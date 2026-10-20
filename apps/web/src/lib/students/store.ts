/**
 * Server-only: student admissions store (students.json + student-photos/).
 * Public form -> addStudent() creates a "Pending" student; the centre later calls activateStudent().
 */
import { promises as fs } from "fs";
import path from "path";
import { ADMISSION_CENTRES, PAYMENT_MODES, type AdmissionPayment, type PayLink, type PaymentMode, type StudentRecord } from "@qschool/shared";
import { DATA_DIR, dataFile } from "@/lib/data-dir";

const FILE = dataFile("students.json");
const PHOTO_DIR = path.join(DATA_DIR, "student-photos");
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

// One write at a time so two parents submitting together can't overwrite each other.
let chain: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
}

async function read(): Promise<StudentRecord[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}
const write = (all: StudentRecord[]) => fs.writeFile(FILE, JSON.stringify(all, null, 2));

export async function listStudents(centreId?: string): Promise<StudentRecord[]> {
  const all = await read();
  return (centreId ? all.filter((s) => s.centreId === centreId) : all).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getStudent(id: string) {
  return (await read()).find((s) => s.id === id) ?? null;
}

export async function findByPhoto(file: string) {
  return (await read()).find((s) => s.photo === file) ?? null;
}

export interface NewStudent {
  studentName: string;
  dob: string;
  grade: string;
  school: string;
  parentName: string;
  phone: string;
  email: string;
  address: string;
  aadhaar?: string;
  centreId: string;
  ref: string;
}

const digits = (s: string) => s.replace(/\D/g, "");

function decodePhoto(dataUrl: string): { buf: Buffer; ext: string } {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!m) throw new Error("Photo must be a JPG, PNG or WebP image");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length === 0 || buf.length > MAX_PHOTO_BYTES) throw new Error("Photo is too large (max 3 MB)");
  const ext = m[1] === "image/png" ? "png" : m[1] === "image/webp" ? "webp" : "jpg";
  return { buf, ext };
}

const isDup = (all: StudentRecord[], i: NewStudent) => all.find((s) => s.studentName.toLowerCase() === i.studentName.toLowerCase() && digits(s.phone) === digits(i.phone));
const nextNum = (all: StudentRecord[]) => all.reduce((m, s) => Math.max(m, Number(s.id.replace(/\D/g, "")) || 0), 0) + 1;
const stuId = (n: number) => `STU-${String(n).padStart(4, "0")}`;

/** Creates a Pending student. A repeat submit of the same child + phone returns the existing record. Photo is optional (manual / CSV entries). */
export function addStudent(input: NewStudent, photoDataUrl: string | null): Promise<{ student: StudentRecord; duplicate: boolean }> {
  return locked(async () => {
    const all = await read();
    const dup = isDup(all, input);
    if (dup) return { student: dup, duplicate: true };

    const id = stuId(nextNum(all));
    let photo = "";
    if (photoDataUrl) {
      const { buf, ext } = decodePhoto(photoDataUrl);
      await fs.mkdir(PHOTO_DIR, { recursive: true });
      photo = `${id}.${ext}`;
      await fs.writeFile(path.join(PHOTO_DIR, photo), buf);
    }

    const student: StudentRecord = { id, ...input, photo, status: "Pending", createdAt: new Date().toISOString() };
    await write([student, ...all]);
    return { student, duplicate: false };
  });
}

/** Bulk CSV import: every new row becomes a Pending student; rows matching an existing child + phone are skipped. */
export function addStudentsBulk(rows: NewStudent[]): Promise<{ added: number; duplicates: number }> {
  return locked(async () => {
    const all = await read();
    let n = nextNum(all);
    let duplicates = 0;
    const created: StudentRecord[] = [];
    const now = new Date().toISOString();
    for (const r of rows) {
      if (isDup([...created, ...all], r)) {
        duplicates++;
        continue;
      }
      created.unshift({ id: stuId(n++), ...r, photo: "", status: "Pending", createdAt: now });
    }
    if (created.length) await write([...created, ...all]);
    return { added: created.length, duplicates };
  });
}

export interface PaymentInput {
  amount: number;
  mode: string;
  receiptNo: string;
  note?: string;
}

/** Pending -> Active, recording how the fee was paid and who confirmed it. */
export function activateStudent(id: string, p: PaymentInput, by: string): Promise<StudentRecord> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.id === id);
    if (i < 0) throw new Error("Student not found");
    if (all[i].status === "Active") throw new Error("Student is already active");
    if (!(p.amount > 0)) throw new Error("Enter the amount paid");
    if (!PAYMENT_MODES.includes(p.mode as PaymentMode)) throw new Error("Choose a payment mode");
    if (!p.receiptNo.trim()) throw new Error("Enter the receipt number");
    const payment: AdmissionPayment = {
      amount: Math.round(p.amount * 100) / 100,
      mode: p.mode as PaymentMode,
      receiptNo: p.receiptNo.trim().slice(0, 40),
      note: p.note?.trim().slice(0, 200) || undefined,
      confirmedBy: by,
      confirmedAt: new Date().toISOString(),
    };
    all[i] = { ...all[i], status: "Active", payment };
    await write(all);
    return all[i];
  });
}

export function setCentre(id: string, centreId: string): Promise<StudentRecord> {
  return locked(async () => {
    if (!ADMISSION_CENTRES.some((c) => c.id === centreId)) throw new Error("Unknown centre");
    const all = await read();
    const i = all.findIndex((s) => s.id === id);
    if (i < 0) throw new Error("Student not found");
    all[i] = { ...all[i], centreId };
    await write(all);
    return all[i];
  });
}

/* ───────────── payment links ───────────── */

export function addPayLink(studentId: string, link: PayLink): Promise<StudentRecord> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.id === studentId);
    if (i < 0) throw new Error("Student not found");
    all[i] = { ...all[i], payLinks: [link, ...(all[i].payLinks ?? [])].slice(0, 20) };
    await write(all);
    return all[i];
  });
}

/**
 * A link was paid: mark it Paid and, if the admission is still Pending, confirm it (Active) with the gateway's payment id as the receipt.
 * Safe to call twice (webhook + manual check).
 */
export function settlePayLink(linkId: string, paid: { paymentId?: string; method?: string; amount: number }, mode: string): Promise<StudentRecord | null> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.payLinks?.some((l) => l.id === linkId));
    if (i < 0) return null;
    const s = all[i];
    const links = (s.payLinks ?? []).map((l) => (l.id === linkId && l.status !== "Paid" ? { ...l, status: "Paid" as const, paidAt: new Date().toISOString(), method: paid.method, paymentId: paid.paymentId } : l));
    let next: StudentRecord = { ...s, payLinks: links };
    if (s.status === "Pending" && !s.payment) {
      const payment: AdmissionPayment = {
        amount: paid.amount,
        mode: PAYMENT_MODES.includes(mode as PaymentMode) ? (mode as PaymentMode) : "UPI",
        receiptNo: paid.paymentId || linkId,
        note: "Paid through payment link",
        confirmedBy: "Payment link",
        confirmedAt: new Date().toISOString(),
      };
      next = { ...next, status: "Active", payment };
    }
    all[i] = next;
    await write(all);
    return next;
  });
}

export function setPayLinkStatus(linkId: string, status: PayLink["status"]): Promise<void> {
  return locked(async () => {
    const all = await read();
    let changed = false;
    for (const s of all) for (const l of s.payLinks ?? []) if (l.id === linkId && l.status === "Created" && status !== "Created") (l.status = status), (changed = true);
    if (changed) await write(all);
  });
}

export async function readPhoto(file: string): Promise<{ buf: Buffer; type: string } | null> {
  if (!/^STU-\d+\.(jpg|png|webp)$/.test(file)) return null;
  try {
    const buf = await fs.readFile(path.join(PHOTO_DIR, file));
    return { buf, type: file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg" };
  } catch {
    return null;
  }
}
