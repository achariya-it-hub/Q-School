import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { listLogins, saveLogin } from "@/lib/staff-auth";
import { ADMISSION_CENTRES } from "@qschool/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ ok: true, logins: await listLogins() });
}

/** Create or reset a staff member's login. */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { name = "", email = "", password = "", centre = "" } = await req.json().catch(() => ({}));
  if (!String(name).trim() || !/^\S+@\S+\.\S+$/.test(String(email))) return NextResponse.json({ error: "Valid name and email required" }, { status: 400 });
  if (String(password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  if (centre && !ADMISSION_CENTRES.some((c) => c.id === centre)) return NextResponse.json({ error: "Unknown centre" }, { status: 400 });
  await saveLogin(String(name).trim(), String(email), String(password), centre ? String(centre) : undefined);
  return NextResponse.json({ ok: true });
}
