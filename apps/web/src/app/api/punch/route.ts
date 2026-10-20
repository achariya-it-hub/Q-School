/**
 * Punch receiver for the Matrix COSEC biometric device (and any other device / script).
 *
 *   Device push (GET or POST):
 *     /api/punch?key=<PUNCH KEY>&serial-no=<device>&user-id=<id>&date=2026-10-18&time=09:03:11
 *   JSON (POST, one object or an array):
 *     { "userId": "4", "date": "2026-10-18", "time": "09:03:11", "deviceId": "ARGO-1" }
 *     { "userId": "4", "at": "2026-10-18T09:03:11+05:30" }
 *
 * The key (Console -> Payroll -> Punches & devices) can be sent as ?key= (devices can't set headers) or x-punch-key.
 * Date/time from a device are India local time. Direction is not needed: first punch of the day = in, last = out.
 */
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { load, parseLocalIST, recordPunches, type RawPunch } from "@/lib/payroll/store";

export const dynamic = "force-dynamic";

const ok = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// light per-IP throttle against key guessing
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  return ++h.n > 120;
}

function first(o: Record<string, unknown>, names: string[]) {
  for (const n of names) {
    const v = o[n];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function toPunch(o: Record<string, unknown>, deviceFallback: string): RawPunch | null {
  const userId = first(o, ["userId", "user-id", "userid", "user_id", "empId", "employeeId", "emp-id", "id"]);
  const device = first(o, ["deviceId", "serial-no", "serialNo", "serial", "device"]) || deviceFallback;
  let at = "";
  const stamp = first(o, ["at", "timestamp", "datetime", "dateTime"]);
  if (stamp) {
    // "2026-10-18 09:03:11" has no zone -> India local; anything with a zone is taken as-is
    const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(stamp);
    const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2}(?::\d{2})?)$/.exec(stamp);
    at = !hasZone && m ? parseLocalIST(m[1], m[2]) ?? "" : new Date(stamp).toISOString();
  } else {
    at = parseLocalIST(first(o, ["date"]), first(o, ["time"])) ?? "";
  }
  if (!userId || !at || at === "Invalid Date") return null;
  return { userId, at, source: "matrix", device };
}

async function handle(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || req.headers.get("x-punch-key") || "";
  const { settings } = await load();
  if (!key || !ok(key, settings.punchKey)) return NextResponse.json({ ok: false, error: "Invalid key" }, { status: 401 });

  const q = Object.fromEntries(url.searchParams.entries());
  const items: Record<string, unknown>[] = [];
  if (req.method === "POST") {
    const text = await req.text();
    try {
      const j = JSON.parse(text);
      (Array.isArray(j) ? j : j?.events && Array.isArray(j.events) ? j.events : [j]).forEach((x: Record<string, unknown>) => items.push({ ...q, ...x }));
    } catch {
      items.push({ ...q, ...Object.fromEntries(new URLSearchParams(text).entries()) }); // form-encoded body
    }
  } else {
    items.push(q);
  }

  const punches = items.map((o) => toPunch(o, "matrix")).filter((p): p is RawPunch => !!p);
  if (!punches.length) return NextResponse.json({ ok: false, error: "No valid punch (need user-id plus date & time)" }, { status: 400 });
  const res = await recordPunches(punches);
  return NextResponse.json({ ok: true, ...res });
}

export const GET = handle;
export const POST = handle;
