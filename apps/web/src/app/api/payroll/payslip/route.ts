/**
 * One payslip (JSON) for printing.
 *   GET ?month=YYYY-MM&id=EMP-004 -> { line, status, paidOn }
 * Admin can open any slip (even a draft). A staff member can open only their own, once the run is locked.
 */
import { NextResponse } from "next/server";
import { isMonth } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { currentStaff } from "@/lib/staff-auth";
import { load } from "@/lib/payroll/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const month = u.get("month") ?? "";
  const id = u.get("id") ?? "";
  if (!isMonth(month)) return NextResponse.json({ error: "Bad month" }, { status: 400 });

  const data = await load();
  const admin = isAdmin();
  if (!admin) {
    const s = await currentStaff();
    const mine = s ? data.staff.find((x) => x.name === s.name) : null;
    if (!mine) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (mine.id !== id) return NextResponse.json({ error: "Not your payslip" }, { status: 403 });
  }
  const run = data.runs[month];
  const line = run?.lines.find((l) => l.staffId === id);
  if (!run || !line) return NextResponse.json({ error: "No payslip for this month" }, { status: 404 });
  if (!admin && run.status === "Draft") return NextResponse.json({ error: "Payslip is not published yet" }, { status: 404 });
  return NextResponse.json({ ok: true, line, status: run.status, paidOn: run.paidOn ?? null });
}
