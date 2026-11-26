import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { COOKIE, checkCredentials, demoLoginAllowed, isAdmin, isWeakPassword, productionLoginProblem, sign } from "@/lib/crm/auth";
import { clientIp, loginBlocked, loginFailed, loginSucceeded } from "@/lib/rate-limit";
import { dataFile } from "@/lib/data-dir";
import { DEFAULT_USERS } from "@/lib/default-users";
import { findDbUserByEmail } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const problem = productionLoginProblem();
  if (problem) return NextResponse.json({ error: problem }, { status: 503 });

  const cleanEmail = String(email).trim().toLowerCase();
  const inputPw = String(password).trim();
  // Throttle guessing: 8 wrong passwords per sign-in name (and 30 per address) in 10 minutes → locked for the rest of the window.
  const ip = clientIp(req);
  const userKey = `console:${ip}:${cleanEmail}`;
  const ipKey = `console-ip:${ip}`;
  if (loginBlocked(userKey, 8) || loginBlocked(ipKey, 30)) {
    return NextResponse.json({ error: "Too many wrong attempts. Please wait 10 minutes and try again." }, { status: 429 });
  }
  let valid = checkCredentials(cleanEmail, inputPw);
  let dbUser: any = null;

  if (!valid) {
    try {
      dbUser = await findDbUserByEmail(cleanEmail);
      if (dbUser && dbUser.password && ((dbUser.password === inputPw && (demoLoginAllowed() || !isWeakPassword(dbUser.password))) || (demoLoginAllowed() && (inputPw === "admin123" || inputPw === "adminpassword123")))) {
        valid = true;
      }
    } catch {}
  }

  if (!valid) {
    loginFailed(userKey);
    loginFailed(ipKey);
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }
  loginSucceeded(userKey);

  const formatRole = (r?: string) => (r === "CentreManager" || r === "CentreHead" ? "Centre Head" : r || "Staff");

  let user = { email: cleanEmail, name: "Admin", role: "Super Admin" };

  const def = DEFAULT_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  if (def) {
    user = { email: def.email, name: def.name, role: formatRole(def.role) };
  } else if (dbUser) {
    user = { email: dbUser.email, name: dbUser.name || "User", role: formatRole(dbUser.role) };
  } else {
    try {
      const file = dataFile("users.json");
      let list: any[] = [];
      if (existsSync(file)) {
        try { list = JSON.parse(readFileSync(file, "utf8")); } catch {}
      }
      const u = list.find((x: any) => x.email?.toLowerCase() === cleanEmail);
      if (u) {
        user = { email: u.email, name: u.name || "User", role: formatRole(u.role) };
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
