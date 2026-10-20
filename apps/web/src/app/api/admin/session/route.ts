import { NextResponse } from "next/server";
import { COOKIE, checkCredentials, isAdmin, productionLoginProblem, sign } from "@/lib/crm/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const problem = productionLoginProblem();
  if (problem) return NextResponse.json({ error: problem }, { status: 503 });
  if (!checkCredentials(String(email), String(password))) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sign(String(email).toLowerCase()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true" || (process.env.NODE_ENV === "production" && (process.env.PUBLIC_BASE_URL?.startsWith("https://") ?? false)),
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

/** Used by the Console shell to check the session on load. */
export async function GET() {
  return isAdmin() ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false }, { status: 401 });
}
