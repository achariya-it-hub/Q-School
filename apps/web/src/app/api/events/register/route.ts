import { NextResponse } from "next/server";
import { addAttendee } from "@/lib/crm/events-store";

export const dynamic = "force-dynamic";

const cors = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: cors() });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return json({ ok: false, error: "Invalid JSON format" }, 400);
  }

  // Honeypot check for bots
  if (b.website) return json({ ok: true });

  const parentName = String(b.parentName || b.name || "").trim();
  const phone = String(b.parentPhone || b.phone || "").trim();

  if (!parentName || !phone) {
    return json({ ok: false, error: "Parent name and phone number are required" }, 400);
  }

  const eventCode = String(b.eventCode || b.event || "bmit").trim().toLowerCase();
  const email = String(b.parentEmail || b.email || "").trim().toLowerCase();
  const city = String(b.city || "").trim();
  const profession = String(b.profession || "").trim();
  const childName = String(b.childName || "").trim();
  const childAge = String(b.childAge || b.age || "").trim();
  const grade = String(b.grade || "").trim();
  const school = String(b.school || "").trim();
  const salesPerson = String(b.sp || b.salesPerson || b.ref || "").trim();
  const bmitInterest = b.bmit === "Yes" || b.bmit === true || b.bmitInterest === true;
  const workshopInterest = b.workshop === "Yes" || b.workshop === true || b.workshopInterest === true;

  try {
    const res = await addAttendee({
      eventCode,
      parentName,
      phone,
      email: email || undefined,
      city: city || undefined,
      profession: profession || undefined,
      childName: childName || undefined,
      childAge: childAge || undefined,
      grade: grade || undefined,
      school: school || undefined,
      salesPerson: salesPerson || undefined,
      source: b.source ? String(b.source) : "BMIT Registration Form",
      bmitInterest,
      workshopInterest,
      syncToCrmLead: true,
    });

    return json({
      ok: true,
      status: "ok",
      attendeeId: res.attendee.id,
      event: {
        id: res.event.id,
        name: res.event.name,
        code: res.event.code,
      },
      duplicate: res.isDuplicate,
    });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
}
