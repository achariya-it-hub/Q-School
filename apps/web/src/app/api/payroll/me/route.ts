/**
 * Staff self-service (staff login; the login name must match a name in the staff directory).
 *   GET  -> { staff, today, punches today, month attendance, holidays, payslips[] }
 *   POST { action: "punch", lat?, lng? }   one tap; first punch of the day = in, last = out
 */
import { NextResponse } from "next/server";
import { todayIST } from "@qschool/shared";
import { currentStaff } from "@/lib/staff-auth";
import * as P from "@/lib/payroll/store";

export const dynamic = "force-dynamic";

async function me() {
  const s = await currentStaff();
  return s ? (await P.load()).staff.find((x) => x.name === s.name) ?? null : null;
}

export async function GET() {
  const who = await currentStaff();
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const d = await P.load();
  const staff = d.staff.find((x) => x.name === who.name);
  if (!staff) return NextResponse.json({ ok: true, linked: false, name: who.name });
  const now = new Date();
  const today = todayIST(now);
  const month = today.slice(0, 7);
  const mine = d.attendance[month]?.[staff.id] ?? {};
  const payslips = Object.values(d.runs)
    .filter((r) => r.status !== "Draft")
    .map((r) => ({ month: r.month, status: r.status, net: r.lines.find((l) => l.staffId === staff.id)?.net ?? 0 }))
    .sort((a, b) => b.month.localeCompare(a.month));
  return NextResponse.json({
    ok: true,
    linked: true,
    staff: { id: staff.id, name: staff.name, role: staff.role, centre: staff.centre },
    today,
    month,
    punches: await P.todaysPunches(staff.id, now),
    record: mine[today] ?? null,
    attendance: mine,
    holidays: d.holidays,
    payslips,
  });
}

export async function POST(req: Request) {
  const staff = await me();
  if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (b.action !== "punch") return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  const lat = Number(b.lat);
  const lng = Number(b.lng);
  const r = await P.recordPunches([{ staffId: staff.id, at: new Date().toISOString(), source: "app", ...(Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : {}) }]);
  if (r.duplicates) return NextResponse.json({ error: "Already punched a moment ago" }, { status: 400 });
  if (r.frozen) return NextResponse.json({ error: "This month's payroll is locked. Ask HR to correct your attendance" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
