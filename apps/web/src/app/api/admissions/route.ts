/**
 * Public admission form endpoint (hosted on any domain — CORS is open, set ADMISSIONS_ALLOW_ORIGIN to lock it).
 * Creates the student as "Pending"; the respective centre activates them after confirming payment.
 */
import { NextResponse } from "next/server";
import { ADMISSION_CENTRES } from "@qschool/shared";
import { addStudent } from "@/lib/students/store";

export const dynamic = "force-dynamic";

const cors = () => ({
  "Access-Control-Allow-Origin": process.env.ADMISSIONS_ALLOW_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: cors() });

// Tiny per-IP throttle (resets on restart) so one device can't flood the list.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 12;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return json({ ok: false, error: "Too many submissions. Please wait a minute." }, 429);
  if (Number(req.headers.get("content-length") ?? 0) > 5_000_000) return json({ ok: false, error: "Photo is too large" }, 413);

  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text()); // the form sends text/plain to avoid a CORS preflight
  } catch {
    return json({ ok: false, error: "Bad request" }, 400);
  }
  if (b.website) return json({ ok: true }); // honeypot: bots fill hidden fields, humans don't

  const s = (k: string, max = 200) => String(b[k] ?? "").trim().slice(0, max);
  const fatherName = s("fatherName", 120);
  const motherName = s("motherName", 120);
  const parentName = s("parentName", 120) || fatherName || motherName || "Parent";

  const rec = {
    studentName: s("studentName", 120),
    dob: s("dob", 10),
    age: s("age", 10),
    gender: s("gender", 20),
    grade: s("grade", 40),
    school: s("school", 160),
    parentName,
    fatherName,
    fatherProfession: s("fatherProfession", 120),
    motherName,
    motherProfession: s("motherProfession", 120),
    phone: s("phone", 20),
    email: s("email", 160).toLowerCase(),
    address: s("address", 400),
    aadhaar: s("aadhaar", 20).replace(/\D/g, ""),
    emergencyContactName: s("emergencyContactName", 120),
    emergencyContactRelation: s("emergencyContactRelation", 80),
    emergencyContactPhone: s("emergencyContactPhone", 20),
    siblingName: s("siblingName", 120),
    siblingAge: s("siblingAge", 10),
    acceptedByName: s("acceptedByName", 120),
    acceptedTerms: b.acceptedTerms === true || b.acceptedTerms === "true" || b.acceptedTerms === "on" || b.acceptedTerms === 1,
    centreId: s("centre", 10) || s("centreId", 10) || "mk",
    ref: s("ref", 60),
  };

  const missing: string[] = [];
  if (!rec.studentName) missing.push("Student Name");
  if (!rec.dob) missing.push("Date of Birth");
  if (!rec.fatherName && !rec.motherName && !rec.parentName) missing.push("Parent Name");
  if (!rec.phone) missing.push("Phone");
  if (!rec.address) missing.push("Address");
  if (!rec.centreId) missing.push("Branch / Centre");

  if (missing.length) return json({ ok: false, error: `Missing required fields: ${missing.join(", ")}` }, 400);
  if (!ADMISSION_CENTRES.some((c) => c.id === rec.centreId)) return json({ ok: false, error: "Please choose a valid centre" }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.dob) || Number.isNaN(Date.parse(rec.dob)) || rec.dob > new Date().toISOString().slice(0, 10))
    return json({ ok: false, error: "Enter a valid date of birth" }, 400);
  if (rec.phone.replace(/\D/g, "").length < 10) return json({ ok: false, error: "Enter a valid phone number" }, 400);
  if (rec.email && !/^\S+@\S+\.\S+$/.test(rec.email)) return json({ ok: false, error: "Enter a valid email" }, 400);
  if (rec.aadhaar && rec.aadhaar.length !== 12) return json({ ok: false, error: "Aadhaar number must be 12 digits" }, 400);
  if (typeof b.photo !== "string" || !b.photo) return json({ ok: false, error: "Student photo is required" }, 400);

  try {
    const { student, duplicate } = await addStudent(rec, b.photo);
    return json({ ok: true, status: "ok", studentId: student.id, duplicate });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Could not save" }, 400);
  }
}
