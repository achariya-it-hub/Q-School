/**
 * Website lead form (landing page, course pages, webinar sign-ups, the /admissions landing page).
 * POST is public; every submission goes straight into the CRM pipeline (stage "Enquiry").
 * GET (CRM feed) requires a Console session.
 */
import { NextResponse } from "next/server";
import { ADMISSION_CENTRES, centreName } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { ingestLead, listLeads } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

// Tiny per-IP throttle (resets on restart) so one device can't flood the pipeline.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  // Honeypot: bots fill the hidden field, people don't. Pretend success.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many submissions. Please wait a minute and try again." }, { status: 429 });

  const parentName = text(body.name, 120);
  const phone = text(body.phone, 20);
  if (!parentName || !phone) return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
  const email = text(body.email, 160).toLowerCase();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  const childName = text(body.childName, 120);
  const childAge = text(body.childAge, 60);
  const city = text(body.city, 100);
  const centreId = ADMISSION_CENTRES.some((c) => c.id === body.centreId) ? String(body.centreId) : undefined;
  const preferredTime = text(body.preferredTime, 40);
  const message = text(body.message, 500);
  const landing = body.landing === "admission";

  const utm = {
    "UTM Source": text(body.utm_source, 80),
    "UTM Medium": text(body.utm_medium, 80),
    "UTM Campaign": text(body.utm_campaign, 120),
    "Referred By": text(body.ref, 80),
  };

  // With a child's name the lead is named like admission-form leads ("CHILD (Parent: NAME)"), so the pipeline card,
  // and the student record created later, carry both names.
  const leadName = childName ? `${childName} (Parent: ${parentName})` : parentName;
  const r = await ingestLead({
    sourceKey: "website",
    source: landing ? "Admission Landing Page" : "Website",
    name: leadName,
    phone,
    email: email || undefined,
    interest: text(body.interest, 120),
    campaign: utm["UTM Campaign"] || undefined,
    location: centreId ? centreName(centreId) : city || undefined,
    centreId,
    message: message || undefined,
    formName: landing ? "Q-School Admission Landing Page" : text(body.source ?? "website", 60),
    extra: {
      ...(childName ? { "Student Name": childName, "Parent Name": parentName } : {}),
      ...(childAge ? { childAgeOrGrade: childAge, ...(childName ? { Age: childAge } : {}) } : {}),
      ...(city ? { preferredCentre: city } : {}),
      ...(preferredTime ? { "Preferred call time": preferredTime } : {}),
      ...Object.fromEntries(Object.entries(utm).filter(([, v]) => v)),
    },
  });
  return NextResponse.json({ ok: true, leadId: r.lead.id, duplicate: r.result === "duplicate" });
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const leads = await listLeads();
  return NextResponse.json({ count: leads.length, leads });
}
