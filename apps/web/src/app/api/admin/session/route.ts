import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { COOKIE, checkCredentials, isAdmin, productionLoginProblem, sign } from "@/lib/crm/auth";
import { dataFile } from "@/lib/data-dir";
import { DEFAULT_USERS } from "@/lib/default-users";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const problem = productionLoginProblem();
  if (problem) return NextResponse.json({ error: problem }, { status: 503 });
  if (!checkCredentials(String(email), String(password))) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  let user = { email: cleanEmail, name: "Admin", role: "Super Admin" };

  const def = DEFAULT_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  if (def) {
    user = { email: def.email, name: def.name, role: def.role };
  } else {
    try {
      const file = dataFile("users.json");
      let list: any[] = [];
      if (existsSync(file)) {
        try { list = JSON.parse(readFileSync(file, "utf8")); } catch {}
      }
      const u = list.find((x: any) => x.email?.toLowerCase() === cleanEmail);
      if (u) {
        user = { email: u.email, name: u.name || "User", role: u.role || "Faculty" };
      }
    } catch {}
  }

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(COOKIE, sign(cleanEmail), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true",
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
