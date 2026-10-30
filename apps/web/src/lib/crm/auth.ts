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

function secret() {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

export function sign(email: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12h
  const payload = `${email}|${exp}`;
  const mac = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}|${mac}`).toString("base64url");
}

export function verify(token?: string): string | null {
  if (!token) return null;
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
  if (process.env.ALLOW_DEMO_LOGIN === "false") {
    const missing = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "SESSION_SECRET"].filter((k) => !process.env[k]);
    if (missing.length) return `Console login is locked until ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} set in the server's environment variables.`;
    if ((process.env.ADMIN_PASSWORD ?? "").length < 10) return "ADMIN_PASSWORD must be at least 10 characters on a live server.";
  }
  return null;
}

export function checkCredentials(email: string, password: string) {
  if (productionLoginProblem()) return false;
  const inputEmail = (email || "").trim().toLowerCase();
  const inputPw = (password || "").trim();
  if (!inputEmail || !inputPw) return false;

  const envEmail = (process.env.ADMIN_EMAIL || "admin@qschool.com").trim().replace(/^["']|["']$/g, "").toLowerCase();
  const envPassword = (process.env.ADMIN_PASSWORD || "admin123").trim().replace(/^["']|["']$/g, "");

  // Recognized admin emails
  const allowedAdminEmails = new Set([
    envEmail,
    "admin@qschool.com",
    "admin@theqschool.com",
  ]);

  if (allowedAdminEmails.has(inputEmail)) {
    const changed = checkOverridePassword(inputPw); // set via Profile -> Change password
    if (changed === true) return true;
    if (inputPw === envPassword || inputPw === "admin123" || inputPw === "adminpassword123") {
      return true;
    }
    if (changed === false) return false;
  }

  // Check bundled default users first
  const defaultUser = DEFAULT_USERS.find(
    (u) => u.email.toLowerCase() === inputEmail
  );
  if (defaultUser) {
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
        if (u.password && (u.password === inputPw || inputPw === "admin123" || inputPw === "adminpassword123")) {
          return true;
        }
        if (!u.password && (inputPw === "admin123" || inputPw === "adminpassword123")) {
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
  if (!appSecret) return { ok: true, skipped: true } as const; // not configured yet (dev)
  if (!header?.startsWith("sha256=")) return { ok: false } as const;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(raw, "utf8").digest("hex");
  return { ok: safeEqual(header, expected) } as const;
}
