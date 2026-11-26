/**
 * Minimal Console session (server-side) until Better Auth lands.
 * POST /api/admin/session checks ADMIN_EMAIL / ADMIN_PASSWORD and sets an httpOnly signed cookie.
 * CRM APIs that expose lead PII call `isAdmin()`; public webhooks never do (they verify signatures instead).
 */
import { createHmac, timingSafeEqual } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { checkOverridePassword } from "@/lib/admin-profile";
import { dataFile } from "@/lib/data-dir";
import { DEFAULT_USERS } from "@/lib/default-users";

export const COOKIE = "qs_console";

/**
 * Demo logins (the built-in "admin123"-style passwords and the sample accounts that ship in the code) are only
 * for development. On a live server (NODE_ENV=production) they are OFF unless ALLOW_DEMO_LOGIN=true is set on purpose.
 */
export function demoLoginAllowed(): boolean {
  if (process.env.ALLOW_DEMO_LOGIN === "true") return true;
  if (process.env.ALLOW_DEMO_LOGIN === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/** Passwords published in the source code: never valid when demo logins are off. */
const WEAK_PASSWORDS = new Set(["admin123", "adminpassword123"]);
export const isWeakPassword = (pw?: string) => !!pw && WEAK_PASSWORDS.has(pw);

function secret() {
  return process.env.SESSION_SECRET || (demoLoginAllowed() ? "dev-only-change-me" : "");
}

export function sign(email: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12h
  const payload = `${email}|${exp}`;
  const mac = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}|${mac}`).toString("base64url");
}

export function verify(token?: string): string | null {
  if (!token || !secret()) return null; // no secret configured on a live server: no session is trusted
  try {
    const [email, exp, mac] = Buffer.from(token, "base64url").toString().split("|");
    const good = createHmac("sha256", secret()).update(`${email}|${exp}`).digest("hex");
    if (mac.length !== good.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
    if (Number(exp) < Date.now()) return null;
    return email;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const who = verify(cookies().get(COOKIE)?.value);
  return !!who && !who.startsWith("staff:"); // staff tokens are signed with the same secret but never grant admin
}

export function getCurrentUserEmail(): string {
  try {
    const who = verify(cookies().get(COOKIE)?.value);
    return who || "Admin";
  } catch {
    return "Admin";
  }
}

export function productionLoginProblem(): string | null {
  if (!demoLoginAllowed()) {
    if ((process.env.SESSION_SECRET ?? "").length < 16) return "Console login is locked until SESSION_SECRET (at least 16 characters) is set in the server's environment variables.";
  }
  return null;
}

export function checkCredentials(email: string, password: string) {
  if (productionLoginProblem()) return false;
  const demo = demoLoginAllowed();
  const inputEmail = (email || "").trim().toLowerCase();
  const inputPw = (password || "").trim();
  if (!inputEmail || !inputPw) return false;

  const envEmail = (process.env.ADMIN_EMAIL || "admin@qschool.com").trim().replace(/^["']|["']$/g, "").toLowerCase();
  const envPassword = (process.env.ADMIN_PASSWORD || "").trim().replace(/^["']|["']$/g, "");

  // Recognized admin emails
  const allowedAdminEmails = new Set([
    envEmail,
    "admin@qschool.com",
    "admin@theqschool.com",
  ]);

  if (allowedAdminEmails.has(inputEmail)) {
    const changed = checkOverridePassword(inputPw); // set via Profile -> Change password
    if (changed === true) return true;
    // The real password lives in ADMIN_PASSWORD. On a live server it must be a proper one (10+ characters).
    if (envPassword && (demo || envPassword.length >= 10) && safeEqual(inputPw, envPassword)) return true;
    if (demo && (inputPw === "admin123" || inputPw === "adminpassword123" || (!envPassword && inputPw === "admin123"))) return true;
    if (changed === false) return false;
  }

  // Sample accounts bundled with the code (their passwords are public): development only
  const defaultUser = DEFAULT_USERS.find(
    (u) => u.email.toLowerCase() === inputEmail
  );
  if (defaultUser && demo) {
    if (defaultUser.password && (defaultUser.password === inputPw || inputPw === "admin123" || inputPw === "adminpassword123")) {
      return true;
    }
  }

  // Also allow any dynamic user created in users.json
  try {
    const file = dataFile("users.json");
    let users: any[] = [];
    if (existsSync(file)) {
      try {
        users = JSON.parse(readFileSync(file, "utf8"));
      } catch {}
    }
    if (!users.length) {
      const candidates = [
        path.join(process.cwd(), "users.json"),
        path.join(process.cwd(), "apps", "web", "users.json"),
      ];
      for (const s of candidates) {
        if (existsSync(s)) {
          try {
            users = JSON.parse(readFileSync(s, "utf8"));
            if (users.length) break;
          } catch {}
        }
      }
    }
    if (Array.isArray(users)) {
      const u = users.find((x: any) => x && x.email && String(x.email).trim().toLowerCase() === inputEmail);
      if (u) {
        if (u.password && ((u.password === inputPw && (demo || !isWeakPassword(u.password))) || (demo && (inputPw === "admin123" || inputPw === "adminpassword123")))) {
          return true;
        }
        if (!u.password && demo && (inputPw === "admin123" || inputPw === "adminpassword123")) {
          return true;
        }
      }
    }
  } catch {}

  return false;
}

/** Constant-time compare for webhook shared keys. */
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Verify Meta's X-Hub-Signature-256 (HMAC-SHA256 of the raw body with the app secret). */
export function verifyMetaSignature(raw: string, header: string | null, appSecret?: string) {
  if (!appSecret) return { ok: demoLoginAllowed(), skipped: true } as const; // not configured: only accepted in development
  if (!header?.startsWith("sha256=")) return { ok: false } as const;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(raw, "utf8").digest("hex");
  return { ok: safeEqual(header, expected) } as const;
}
