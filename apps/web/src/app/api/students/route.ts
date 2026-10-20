/**
 * Students API for the Console and for centre staff.
 *   GET   -> admin: all students; centre login: only that centre's students
 *   PATCH -> { id, action: "activate", amount, mode, receiptNo, note }   (admin, or the student's own centre)
 *            { id, action: "setCentre", centreId }                         (admin only)
 *            { id, action: "payLink", provider, amount, description, url?, ref? }  razorpay: created via API; grayquest: paste the link made in GrayQuest
 *            { id, action: "checkLink", linkId }                           asks Razorpay if the link was paid (activates the student if so)
 *   POST  -> { student: {...}, photo? }  add one student manually (Pending)
 *            { rows: [{...}] }           bulk CSV import (Pending). A centre login always adds to its own centre.
 */
import { NextResponse } from "next/server";
import { ADMISSION_CENTRES, type PayLink } from "@qschool/shared";
import { caller } from "@/lib/students/access";
import { activateStudent, addPayLink, addStudent, addStudentsBulk, getStudent, listStudents, setCentre, setPayLinkStatus, settlePayLink, type NewStudent } from "@/lib/students/store";
import { createPayLink, fetchPayLink, modeFor, razorpayConfigured } from "@/lib/payments/razorpay";

const digits = (s: string) => s.replace(/\D/g, "");
const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Validates one record; returns the clean student or an error message. */
function clean(r: Record<string, unknown>, forceCentre?: string): NewStudent | string {
  const centreRaw = str(r.centreId ?? r.centre, 40).toLowerCase();
  const centre = ADMISSION_CENTRES.find((c) => c.id === centreRaw || c.name.toLowerCase() === centreRaw || c.full.toLowerCase() === centreRaw);
  const centreId = forceCentre ?? centre?.id;
  if (!centreId) return "Centre must be one of: " + ADMISSION_CENTRES.map((c) => c.name).join(", ");
  const s: NewStudent = {
    studentName: str(r.studentName, 120),
    dob: str(r.dob, 10),
    grade: str(r.grade, 40),
    school: str(r.school, 160),
    parentName: str(r.parentName, 120),
    phone: str(r.phone, 20),
    email: str(r.email, 160),
    address: str(r.address, 500),
    aadhaar: str(r.aadhaar, 20).replace(/\D/g, ""),
    centreId,
    ref: str(r.ref, 60),
  };
  if (!s.studentName) return "Student name is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.dob) || isNaN(Date.parse(s.dob))) return "Date of birth must be YYYY-MM-DD";
  if (!s.grade) return "Grade is required";
  if (!s.parentName) return "Parent name is required";
  if (digits(s.phone).length < 10) return "Phone must have at least 10 digits";
  if (s.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email)) return "Email is not valid";
  if (s.aadhaar && s.aadhaar.length !== 12) return "Aadhaar number must be 12 digits";
  return s;
}

export async function POST(req: Request) {
  const who = await caller();
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const force = who.kind === "centre" ? who.centreId : undefined;
  const b = await req.json().catch(() => ({}));
  try {
    if (Array.isArray(b.rows)) {
      if (b.rows.length > 2000) return NextResponse.json({ error: "Max 2000 rows per upload" }, { status: 400 });
      const good: NewStudent[] = [];
      const errors: { row: number; error: string }[] = [];
      b.rows.forEach((r: Record<string, unknown>, i: number) => {
        const c = clean(r ?? {}, force);
        if (typeof c === "string") errors.push({ row: i + 2, error: c });
        else good.push({ ...c, ref: c.ref || "CSV import" });
      });
      const res = await addStudentsBulk(good);
      return NextResponse.json({ ok: true, ...res, errors });
    }
    const c = clean(b.student ?? {}, force);
    if (typeof c === "string") return NextResponse.json({ error: c }, { status: 400 });
    const photo = typeof b.photo === "string" && b.photo ? b.photo : null;
    const res = await addStudent({ ...c, ref: c.ref || "Manual" }, photo);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const who = await caller();
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const students = await listStudents(who.kind === "centre" ? who.centreId : undefined);
  return NextResponse.json({ ok: true, scope: who.kind === "centre" ? who.centreId : "all", name: who.name, razorpay: razorpayConfigured(), students });
}

export async function PATCH(req: Request) {
  const who = await caller();
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = String(b.id ?? "");
  const s = await getStudent(id);
  if (!s) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  if (who.kind === "centre" && s.centreId !== who.centreId) return NextResponse.json({ error: "This student belongs to another centre" }, { status: 403 });

  try {
    if (b.action === "activate") {
      const student = await activateStudent(id, { amount: Number(b.amount), mode: String(b.mode ?? ""), receiptNo: String(b.receiptNo ?? ""), note: b.note ? String(b.note) : undefined }, who.name);
      return NextResponse.json({ ok: true, student });
    }
    if (b.action === "setCentre") {
      if (who.kind !== "admin") return NextResponse.json({ error: "Only admins can move a student between centres" }, { status: 403 });
      return NextResponse.json({ ok: true, student: await setCentre(id, String(b.centreId ?? "")) });
    }
    if (b.action === "payLink") {
      if (s.status === "Active" && s.payment) return NextResponse.json({ error: "Fee is already confirmed for this student" }, { status: 400 });
      const amount = Math.round(Number(b.amount) * 100) / 100;
      if (!(amount >= 1)) return NextResponse.json({ error: "Enter the amount to collect" }, { status: 400 });
      const description = String(b.description ?? "").trim().slice(0, 200) || `Admission fee - ${s.studentName}`;
      let link: PayLink;
      if (b.provider === "grayquest") {
        const url = String(b.url ?? "").trim();
        if (!/^https:\/\//i.test(url)) return NextResponse.json({ error: "Paste the GrayQuest payment link (https://...)" }, { status: 400 });
        link = { provider: "grayquest", id: String(b.ref ?? "").trim().slice(0, 60) || `GQ-${Date.now()}`, url, amount, description, createdBy: who.name, createdAt: new Date().toISOString(), status: "Created" };
      } else {
        const r = await createPayLink({ amount, description, reference: `${s.id}-${Date.now().toString(36)}`, name: s.parentName, phone: s.phone, email: s.email || undefined, notes: { studentId: s.id, centreId: s.centreId, student: s.studentName }, expireDays: 14 });
        link = { provider: "razorpay", id: r.id, url: r.url, amount, description, createdBy: who.name, createdAt: new Date().toISOString(), status: "Created" };
      }
      return NextResponse.json({ ok: true, link, student: await addPayLink(id, link) });
    }
    if (b.action === "checkLink") {
      const linkId = String(b.linkId ?? "");
      const link = s.payLinks?.find((l) => l.id === linkId);
      if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
      if (link.provider !== "razorpay") return NextResponse.json({ error: "GrayQuest links are confirmed by hand: use Confirm payment once the money arrives" }, { status: 400 });
      const st = await fetchPayLink(linkId);
      if (st.status === "paid") await settlePayLink(linkId, { paymentId: st.paymentId, method: st.method, amount: st.amountPaid || link.amount }, modeFor(st.method));
      else if (st.status === "expired") await setPayLinkStatus(linkId, "Expired");
      else if (st.status === "cancelled") await setPayLinkStatus(linkId, "Cancelled");
      return NextResponse.json({ ok: true, status: st.status, student: await getStudent(id) });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
