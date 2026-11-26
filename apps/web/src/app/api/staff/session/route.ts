import { NextResponse } from "next/server";
import { STAFF_COOKIE, checkStaff, currentStaff, signStaff } from "@/lib/staff-auth";
import { clientIp, loginBlocked, loginFailed, loginSucceeded } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const userKey = `staff:${clientIp(req)}:${String(email).trim().toLowerCase()}`;
  if (loginBlocked(userKey, 8)) return NextResponse.json({ error: "Too many wrong attempts. Please wait 10 minutes and try again." }, { status: 429 });
  const l = await checkStaff(String(email), String(password));
  if (!l) {
    loginFailed(userKey);
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }
  loginSucceeded(userKey);
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
