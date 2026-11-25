/**
 * Server-only: student admissions store (students.json + student-photos/).
 * Public form -> addStudent() creates a "Pending" student; the centre later calls activateStudent().
 */
import { promises as fs } from "fs";
import path from "path";
import {
  ADMISSION_CENTRES,
  PAYMENT_MODES,
  centreName,
  inferStudentCourseFee,
  invoiceNoFor,
  leadCentreId,
  receiptNoFor,
  studentFeeSummary,
  studentPayments,
  type AdmissionPayment,
  type PayLink,
  type PaymentMode,
  type StudentRecord,
} from "@qschool/shared";
import { DATA_DIR, dataFile } from "@/lib/data-dir";
import { isDbConfigured, getDbStudents, insertDbUser, saveDbStudentsBulk } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit/store";

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
  if (isDbConfigured()) {
    try {
      const dbStudents = await getDbStudents();
      if (Array.isArray(dbStudents) && dbStudents.length > 0) {
        return dbStudents;
      }
    } catch (e) {
      console.warn("[students-store] DB read failed, falling back to disk:", e);
    }
  }

  try {
    const fromDisk = JSON.parse(await fs.readFile(FILE, "utf8"));
    if (Array.isArray(fromDisk)) {
      if (isDbConfigured() && fromDisk.length > 0) {
        void saveDbStudentsBulk(fromDisk);
      }
      return fromDisk;
    }
  } catch {}
  return [];
}
const syncStudentToUsersDb = async (s: StudentRecord) => {
  if (!isDbConfigured()) return;
  const email = (s.email && s.email.trim().toLowerCase()) || `${s.id.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.theqschool.com`;
  await insertDbUser({
    id: `usr_${s.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    name: s.studentName,
    email,
    role: "Student",
    location: centreName(s.centreId),
    centreId: s.centreId,
    status: "Active",
    joined: (s.createdAt || new Date().toISOString()).slice(0, 10),
    phone: s.phone || "",
  }).catch(() => {});
};

const write = async (all: StudentRecord[]) => {
  await fs.writeFile(FILE, JSON.stringify(all, null, 2)).catch(() => {});
  // Awaited: a payment confirmation or admission must not be lost if serverless pauses right after responding.
  if (isDbConfigured() && all.length > 0) {
    await saveDbStudentsBulk(all);
    await Promise.all(all.map(syncStudentToUsersDb));
  }
};

export async function listStudents(centreId?: string): Promise<StudentRecord[]> {
  const all = await read();
  return (centreId ? all.filter((s) => s.centreId === centreId) : all)
    .map(({ photoData: _omit, ...rest }) => rest)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  age?: string | number;
  gender?: string;
  grade?: string;
  school?: string;
  parentName: string;
  fatherName?: string;
  fatherProfession?: string;
  motherName?: string;
  motherProfession?: string;
  phone: string;
  email?: string;
  address: string;
  aadhaar?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  siblingName?: string;
  siblingAge?: string | number;
  acceptedByName?: string;
  acceptedTerms?: boolean;
  referralType?: string;
  referredBy?: string;
  centreId: string;
  ref: string;
  leadId?: string;
  totalFee?: number;
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

    const inferred = inferStudentCourseFee(input.grade, input.age, input.totalFee);
    const student: StudentRecord = {
      id,
      ...input,
      totalFee: input.totalFee && input.totalFee > 0 ? input.totalFee : inferred.totalFee,
      photo,
      ...(photoDataUrl ? { photoData: photoDataUrl } : {}),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
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

export interface LeadEnrollmentSource {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  source?: string;
  owner?: string;
  value?: number;
  location?: string;
  centreId?: string;
  createdAt?: string;
  extra?: Record<string, string>;
}

const phone10 = (p?: string) => (p ? p.replace(/\D/g, "").slice(-10) : "");

function buildStudentFromLead(lead: LeadEnrollmentSource, id: string): StudentRecord {
  const rawStudentName =
    lead.extra?.["Student Name"]?.trim() ||
    lead.name.replace(/\s*\(Parent:.*\)$/i, "").trim() ||
    "Student";
  const parentName =
    lead.extra?.["Parent Name"]?.trim() ||
    (/\((?:Parent:\s*)?([^)]+)\)/i.exec(lead.name)?.[1]?.trim()) ||
    rawStudentName;
  const age = lead.extra?.["Age"] || lead.extra?.childAgeOrGrade || "";
  const courseInfo = inferStudentCourseFee(lead.interest, age, lead.value && lead.value > 0 ? lead.value : undefined);
  const centreId = leadCentreId(lead) || "mk";

  return {
    id,
    leadId: lead.id,
    studentName: rawStudentName,
    dob: lead.extra?.["DOB"] || "",
    age: age || undefined,
    gender: lead.extra?.["Gender"] || undefined,
    grade: courseInfo.course,
    school: lead.extra?.["School"] || "",
    photo: "",
    parentName,
    phone: lead.phone || "",
    email: lead.email || "",
    address: lead.extra?.["Address"] || lead.location || "",
    referralType: lead.extra?.["Referral Type"] || lead.source || undefined,
    referredBy: lead.extra?.["Referred By"] || lead.owner || undefined,
    centreId,
    ref: lead.owner || lead.source || "CRM Pipeline",
    status: "Pending",
    totalFee: courseInfo.totalFee,
    createdAt: lead.createdAt || new Date().toISOString(),
  };
}

function findMatchingStudent(all: StudentRecord[], lead: LeadEnrollmentSource): number {
  const appId = lead.extra?.["Application ID"] || lead.extra?.["Student ID"];
  const cleanName = (lead.extra?.["Student Name"] || lead.name.replace(/\s*\(Parent:.*\)$/i, "")).trim().toLowerCase();
  const p10 = phone10(lead.phone);
  return all.findIndex(
    (s) =>
      (s.leadId && s.leadId === lead.id) ||
      (appId && s.id === appId) ||
      (cleanName && s.studentName.trim().toLowerCase() === cleanName && p10 && phone10(s.phone) === p10),
  );
}

/**
 * Automatically create (or link) a StudentRecord when a CRM lead reaches "Admitted".
 * Idempotent: moving or syncing the same lead twice never duplicates the student.
 */
export async function enrollLeadAsStudent(lead: LeadEnrollmentSource): Promise<{ student: StudentRecord; created: boolean }> {
  const res = await enrollLeadAsStudentLocked(lead);
  if (res.created) {
    await recordAuditLog({
      action: "CREATE",
      module: "Students",
      entityId: res.student.id,
      entityName: res.student.studentName,
      summary: `Admitted lead ${lead.name} (${lead.id}) enrolled as student ${res.student.id} · ${res.student.grade || "program"} · fee ₹${(res.student.totalFee ?? 0).toLocaleString("en-IN")} · ${centreName(res.student.centreId)}`,
      performedBy: lead.owner || "CRM",
      newData: { studentId: res.student.id, leadId: lead.id, totalFee: res.student.totalFee, centre: res.student.centreId },
    }).catch(() => {});
  }
  return res;
}

function enrollLeadAsStudentLocked(lead: LeadEnrollmentSource): Promise<{ student: StudentRecord; created: boolean }> {
  return locked(async () => {
    const all = await read();
    const idx = findMatchingStudent(all, lead);
    if (idx >= 0) {
      const cur = all[idx];
      const inferred = inferStudentCourseFee(cur.grade || lead.interest, cur.age, lead.value && lead.value > 0 ? lead.value : undefined);
      const patched: StudentRecord = {
        ...cur,
        leadId: cur.leadId || lead.id,
        totalFee: cur.totalFee && cur.totalFee > 0 ? cur.totalFee : inferred.totalFee,
      };
      if (patched.leadId !== cur.leadId || patched.totalFee !== cur.totalFee) {
        all[idx] = patched;
        await write(all);
      }
      return { student: patched, created: false };
    }

    const id = stuId(nextNum(all));
    const student = buildStudentFromLead(lead, id);
    await write([student, ...all]);
    return { student, created: true };
  });
}

/** Sync any CRM leads already in "Admitted" stage so existing admitted leads appear in the Students list. */
export function syncAdmittedLeads(admittedLeads: LeadEnrollmentSource[]): Promise<number> {
  if (!admittedLeads.length) return Promise.resolve(0);
  return locked(async () => {
    const all = await read();
    let n = nextNum(all);
    const created: StudentRecord[] = [];
    let updatedExisting = false;

    for (const lead of admittedLeads) {
      const idx = findMatchingStudent([...created, ...all], lead);
      if (idx >= 0) {
        const realIdx = idx - created.length;
        if (realIdx >= 0 && !all[realIdx].leadId) {
          all[realIdx] = { ...all[realIdx], leadId: lead.id };
          updatedExisting = true;
        }
        continue;
      }
      created.push(buildStudentFromLead(lead, stuId(n++)));
    }

    if (created.length || updatedExisting) {
      await write([...created, ...all]);
    }
    return created.length;
  });
}

export interface PaymentInput {
  amount: number;
  mode: string;
  receiptNo: string;
  note?: string;
  totalFee?: number;
}

/**
 * Everything that must follow a recorded payment (kept outside the students lock because it touches the CRM store):
 * an audit-trail entry and a timeline note + fee status on the originating lead, so Reports and the lead card agree.
 */
async function afterPayment(student: StudentRecord, payment: AdmissionPayment | undefined, by: string) {
  if (!payment) return;
  try {
    const fee = studentFeeSummary(student);
    const part = fee.payments.length;
    const status = fee.balance > 0 ? "Partly Paid" : "Paid";
    const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;
    const rec = receiptNoFor(student.id, part, payment.receiptNo);
    const inv = invoiceNoFor(student.id, part);
    await recordAuditLog({
      action: "CREATE",
      module: "Fees & Payments",
      entityId: student.id,
      entityName: student.studentName,
      summary: `${money(payment.amount)} received from ${student.studentName} (${student.id}) via ${payment.mode} · ${status}${fee.balance > 0 ? ` · balance ${money(fee.balance)}` : ""} · Receipt ${rec} · Invoice ${inv}`,
      performedBy: by,
      newData: { studentId: student.id, part, amount: payment.amount, mode: payment.mode, receiptNo: rec, invoiceNo: inv, paid: fee.paid, balance: fee.balance, status },
    });
    // The fee is paid (in full or part), so the lead is now Admitted.
    const { updateLead, updateLeadByPhone } = await import("@/lib/crm/store");
    const leadPatch = {
      stage: "Admitted" as const,
      activity: `Fee ${part > 1 ? `part payment #${part}` : "payment"} ${money(payment.amount)} received (${payment.mode}) · ${status}${fee.balance > 0 ? ` · balance ${money(fee.balance)}` : ""} · Receipt ${rec}`,
      extra: { "Fee Status": status, "Fee Paid": String(fee.paid), "Fee Balance": String(fee.balance), "Student ID": student.id },
    };
    const lead = student.leadId ? await updateLead(student.leadId, leadPatch, { paid: true }) : null;
    if (!lead && student.phone) {
      const byPhone = await updateLeadByPhone(student.phone, leadPatch, { paid: true });
      if (byPhone) await linkLead(student.id, byPhone.id);
    }
  } catch (e) {
    console.warn("[students] post-payment hooks failed:", e);
  }
}

/** Remember which CRM lead a student came from (set when a payment finds the lead by phone). */
function linkLead(studentId: string, leadId: string): Promise<void> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.id === studentId);
    if (i < 0 || all[i].leadId) return;
    all[i] = { ...all[i], leadId };
    await write(all);
  });
}

/**
 * A payment was recorded on a fee plan (FA-…) for this child: the admission is confirmed.
 * Marks the matching student Active (status only: the money stays on the fee plan, so it is not counted twice).
 * Match: the given student id, else child name + phone. Returns the student, or null if none matches.
 */
export function confirmAdmissionFromFeePlan(m: { studentId?: string; name: string; phone: string }): Promise<StudentRecord | null> {
  return locked(async () => {
    const all = await read();
    const p10 = phone10(m.phone);
    const name = m.name.trim().toLowerCase();
    const i = all.findIndex(
      (s) => (m.studentId && s.id === m.studentId) || (name && p10 && s.studentName.trim().toLowerCase() === name && phone10(s.phone) === p10),
    );
    if (i < 0) return null;
    if (all[i].status !== "Active") {
      all[i] = { ...all[i], status: "Active" };
      await write(all);
    }
    return all[i];
  });
}

/**
 * Record a full or part payment against a student.
 * Activates Pending students on their first payment and appends subsequent part payments until balance reaches 0.
 */
export async function activateStudent(id: string, p: PaymentInput, by: string): Promise<StudentRecord> {
  const student = await activateStudentLocked(id, p, by);
  const pays = studentPayments(student);
  await afterPayment(student, pays[pays.length - 1], by);
  return student;
}

function activateStudentLocked(id: string, p: PaymentInput, by: string): Promise<StudentRecord> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.id === id);
    if (i < 0) throw new Error("Student not found");
    if (!(p.amount > 0)) throw new Error("Enter the amount paid");
    if (!PAYMENT_MODES.includes(p.mode as PaymentMode)) throw new Error("Choose a payment mode");

    const cur = all[i];
    const existingPayments = studentPayments(cur);
    const inferred = inferStudentCourseFee(cur.grade, cur.age);
    const nextTotalFee =
      p.totalFee && p.totalFee > 0
        ? Math.round(p.totalFee * 100) / 100
        : cur.totalFee && cur.totalFee > 0
        ? cur.totalFee
        : inferred.totalFee;

    const autoReceipt = `REC-${cur.id.replace("STU-", "")}-P${existingPayments.length + 1}-${Date.now().toString().slice(-4)}`;
    const cleanReceipt = p.receiptNo?.trim() ? p.receiptNo.trim().slice(0, 40) : autoReceipt;

    const payment: AdmissionPayment = {
      amount: Math.round(p.amount * 100) / 100,
      mode: p.mode as PaymentMode,
      receiptNo: cleanReceipt,
      note: p.note?.trim().slice(0, 200) || undefined,
      confirmedBy: by,
      confirmedAt: new Date().toISOString(),
    };
    const payments = [...existingPayments, payment];
    all[i] = { ...cur, status: "Active", totalFee: nextTotalFee, payment, payments };
    await write(all);
    return all[i];
  });
}

export function setStudentTotalFee(id: string, totalFee: number): Promise<StudentRecord> {
  return locked(async () => {
    if (!(totalFee > 0)) throw new Error("Enter a valid total course fee");
    const all = await read();
    const i = all.findIndex((s) => s.id === id);
    if (i < 0) throw new Error("Student not found");
    all[i] = { ...all[i], totalFee: Math.round(totalFee * 100) / 100 };
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

export function addPayLink(studentId: string, link: PayLink, totalFee?: number): Promise<StudentRecord> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.id === studentId);
    if (i < 0) throw new Error("Student not found");
    const cur = all[i];
    const nextTotal =
      totalFee && totalFee > 0
        ? Math.round(totalFee * 100) / 100
        : cur.totalFee && cur.totalFee > 0
        ? cur.totalFee
        : inferStudentCourseFee(cur.grade, cur.age).totalFee;
    all[i] = { ...cur, totalFee: nextTotal, payLinks: [link, ...(cur.payLinks ?? [])].slice(0, 20) };
    await write(all);
    return all[i];
  });
}

/**
 * A link was paid (full or part payment): mark the link Paid, append the payment to `payments`,
 * and ensure the admission is Active. Safe to call twice (webhook + return / manual check).
 */
export async function settlePayLink(linkId: string, paid: { paymentId?: string; method?: string; amount: number }, mode: string): Promise<StudentRecord | null> {
  const rec: { p: AdmissionPayment | null } = { p: null };
  const next = await settlePayLinkLocked(linkId, paid, mode, rec);
  if (next && rec.p) await afterPayment(next, rec.p, "Payment link");
  return next;
}

function settlePayLinkLocked(
  linkId: string,
  paid: { paymentId?: string; method?: string; amount: number },
  mode: string,
  rec: { p: AdmissionPayment | null },
): Promise<StudentRecord | null> {
  return locked(async () => {
    const all = await read();
    const i = all.findIndex((s) => s.payLinks?.some((l) => l.id === linkId));
    if (i < 0) return null;
    const s = all[i];
    const targetLink = (s.payLinks ?? []).find((l) => l.id === linkId);
    const links = (s.payLinks ?? []).map((l) =>
      l.id === linkId && l.status !== "Paid"
        ? { ...l, status: "Paid" as const, paidAt: new Date().toISOString(), method: paid.method, paymentId: paid.paymentId }
        : l,
    );
    const existingPayments = studentPayments(s);
    const receiptNo = paid.paymentId || linkId;
    const alreadyRecorded = existingPayments.some((p) => p.receiptNo === receiptNo) || targetLink?.status === "Paid";

    let next: StudentRecord = {
      ...s,
      payLinks: links,
      totalFee: s.totalFee && s.totalFee > 0 ? s.totalFee : inferStudentCourseFee(s.grade, s.age).totalFee,
    };

    if (!alreadyRecorded) {
      const payment: AdmissionPayment = {
        amount: Math.round((paid.amount || targetLink?.amount || 0) * 100) / 100,
        mode: PAYMENT_MODES.includes(mode as PaymentMode) ? (mode as PaymentMode) : "UPI",
        receiptNo,
        note: targetLink?.description ? `Paid online: ${targetLink.description}` : "Paid through payment link",
        confirmedBy: "Payment link",
        confirmedAt: new Date().toISOString(),
      };
      const payments = [...existingPayments, payment];
      next = { ...next, status: "Active", payment, payments };
      rec.p = payment;
    } else if (next.status === "Pending") {
      next = { ...next, status: "Active" };
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

/** Find a payment link and its student (public pay page / gateway callbacks). */
export async function findPayLink(linkId: string): Promise<{ student: StudentRecord; link: PayLink } | null> {
  const all = await read();
  for (const s of all) {
    const l = s.payLinks?.find((x) => x.id === linkId);
    if (l) return { student: s, link: l };
  }
  return null;
}

/** Record a new checkout attempt (Easebuzz txnid) on a link. */
export function addPayLinkAttempt(linkId: string, txnid: string): Promise<void> {
  return locked(async () => {
    const all = await read();
    for (const s of all)
      for (const l of s.payLinks ?? [])
        if (l.id === linkId) {
          l.attempts = [...(l.attempts ?? []), txnid].slice(-20);
          await write(all);
          return;
        }
  });
}

export async function readPhoto(file: string): Promise<{ buf: Buffer; type: string } | null> {
  if (!/^STU-\d+\.(jpg|png|webp)$/.test(file)) return null;
  const mime = file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg";
  try {
    const buf = await fs.readFile(path.join(PHOTO_DIR, file));
    return { buf, type: mime };
  } catch {
    // Fallback on serverless cold start: decode photoData stored in Postgres qs_students
    const all = await read();
    const s = all.find((x) => x.photo === file && x.photoData);
    if (s?.photoData) {
      try {
        const { buf } = decodePhoto(s.photoData);
        return { buf, type: mime };
      } catch {}
    }
    return null;
  }
}
