/**
 * Partner sign-in: mobile/email + password. Passwords are scrypt-hashed; the app then holds a signed,
 * expiring token (sent as `Authorization: Bearer …`). A token stops working as soon as the password changes.
 * Server-only.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { Partner } from "./types";

const TTL_MS = 30 * 24 * 3600_000;

function secret(): string {
  const s = process.env.SESSION_SECRET || "";
  if (s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-partner-session-secret";
  throw new Error("Partner sign-in is not configured (SESSION_SECRET missing)");
}

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Min 8 chars with at least one letter and one number. Returns an error message or null. */
export function passwordProblem(pw: string): string | null {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters";
  if (pw.length > 100) return "Password is too long";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password needs at least one letter and one number";
  return null;
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}

export function verifyPassword(pw: string, stored?: string): boolean {
  // Always do the same work, so a missing account can't be told apart by timing.
  const [salt, hash] = (stored || "00:00").split(":");
  const calc = scryptSync(String(pw || ""), salt || "00", 32).toString("hex");
  return !!stored && safeEq(calc, hash || "");
}

const version = (p: Partner) => (p.passwordHash || "none").slice(-8);

export function signPartnerToken(p: Partner): string {
  const payload = `${p.id}.${Date.now() + TTL_MS}.${version(p)}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

/** Partner id inside a valid, unexpired token (checked against the partner's current password version). */
export function partnerIdFromRequest(req: Request): { id: string; ver: string } | null {
  const h = req.headers.get("authorization") || "";
  const raw = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
  if (!raw) return null;
  try {
    const [id, exp, ver, sig] = Buffer.from(raw, "base64url").toString().split(".");
    if (!id || !exp || !ver || !sig) return null;
    const want = createHmac("sha256", secret()).update(`${id}.${exp}.${ver}`).digest("hex");
    if (!safeEq(sig, want) || Number(exp) < Date.now()) return null;
    return { id, ver };
  } catch {
    return null;
  }
}

/**
 * May this request act as `partner`? Partners with a password need a valid token. Partners who haven't set a
 * password yet (legacy, code-only accounts) are still allowed by code until they migrate.
 */
export function partnerAuthorised(req: Request, partner: Partner): boolean {
  if (!partner.passwordHash) return true;
  const t = partnerIdFromRequest(req);
  return !!t && t.id === partner.id && t.ver === version(partner);
}

/** Never send hashes to a browser/app. */
export function withoutSecrets<T extends Partner>(p: T): T {
  const { passwordHash: _h, ...rest } = p as T & { passwordHash?: string };
  return rest as T;
}
