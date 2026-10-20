import { NextResponse } from "next/server";
import { STAFF_COOKIE, checkStaff, currentStaff, signStaff } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const l = await checkStaff(String(email), String(password));
  if (!l) return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  const res = NextResponse.json({ ok: true, name: l.name });
  res.cookies.set(STAFF_COOKIE, signStaff(l.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function GET() {
  const me = await currentStaff();
  return me ? NextResponse.json({ ok: true, name: me.name, centre: me.centre ?? null }) : NextResponse.json({ ok: false }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
