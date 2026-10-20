/**
 * Payroll for the Console (admin only).
 *   GET  ?month=YYYY-MM -> { month, setup, settings, holidays, attendance, run, today, recent, unmatched }
 *   POST { action, ... } -> attendance | markAllPresent | setup | settings | addHoliday | removeHoliday
 *                           | generate | adjust | lock | reopen | markPaid | importPunches | newPunchKey
 *                           | addStaff | updateStaff | syncLeave
 */
import { NextResponse } from "next/server";
import { isMonth, isWeeklyOff, todayIST, type AttStatus } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import * as P from "@/lib/payroll/store";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "Unauthorised" }, { status: 401 });
const BY = "HR / Admin";

export async function GET(req: Request) {
  if (!isAdmin()) return deny();
  const now = new Date();
  const month = new URL(req.url).searchParams.get("month") || todayIST(now).slice(0, 7);
  if (!isMonth(month)) return NextResponse.json({ error: "Bad month" }, { status: 400 });
  const d = await P.load();
  const { punches, unmatched } = await P.recentPunches();
  return NextResponse.json({ ok: true, month, today: todayIST(now), staff: d.staff, setup: d.setup, settings: d.settings, holidays: d.holidays, attendance: d.attendance[month] ?? {}, run: d.runs[month] ?? null, recent: punches, unmatched });
}

export async function POST(req: Request) {
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  const month = String(b.month ?? "");
  try {
    switch (b.action) {
      case "attendance":
        await P.markAttendance(Array.isArray(b.entries) ? b.entries.slice(0, 2000) : [], BY);
        break;
      case "markAllPresent": {
        const date = String(b.date ?? "");
        const d = await P.load();
        const hol = new Set(d.holidays.map((h) => h.date));
        if (isWeeklyOff(date) || hol.has(date)) throw new Error("That day is a weekly off / holiday");
        const marked = d.attendance[date.slice(0, 7)] ?? {};
        const entries = d.staff.filter((s) => s.active !== false && s.joined <= date && !marked[s.id]?.[date]).map((s) => ({ staffId: s.id, date, status: "P" as AttStatus }));
        await P.markAttendance(entries, BY);
        return NextResponse.json({ ok: true, marked: entries.length });
      }
      case "setup":
        await P.setSetup(String(b.staffId ?? ""), b.patch ?? {});
        break;
      case "addStaff": {
        const s = await P.addStaff(b.staff ?? {});
        return NextResponse.json({ ok: true, staff: s });
      }
      case "updateStaff":
        await P.updateStaff(String(b.staffId ?? ""), b.patch ?? {});
        break;
      case "syncLeave": {
        const r = await P.syncLeave(String(b.leaveId ?? ""), String(b.name ?? ""), String(b.from ?? ""), String(b.to ?? ""), !!b.approved);
        return NextResponse.json({ ok: true, ...r });
      }
      case "settings":
        await P.setSettings(b.patch ?? {});
        break;
      case "importPunches": {
        const rows: { userId: string; at: string }[] = Array.isArray(b.rows) ? b.rows.slice(0, 5000) : [];
        const res = await P.recordPunches(rows.map((r) => ({ userId: String(r.userId ?? ""), at: String(r.at ?? ""), source: "csv" as const, device: "CSV import" })));
        return NextResponse.json({ ok: true, ...res });
      }
      case "newPunchKey":
        await P.regeneratePunchKey();
        break;
      case "addHoliday":
        await P.addHoliday(String(b.date ?? ""), String(b.name ?? ""));
        break;
      case "removeHoliday":
        await P.removeHoliday(String(b.date ?? ""));
        break;
      case "generate":
        await P.generate(month);
        break;
      case "adjust":
        await P.setAdjust(month, String(b.staffId ?? ""), b.patch ?? {});
        break;
      case "lock":
        await P.lockRun(month, BY);
        break;
      case "reopen":
        await P.reopenRun(month);
        break;
      case "markPaid":
        await P.markPaid(month, String(b.paidOn ?? ""));
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
