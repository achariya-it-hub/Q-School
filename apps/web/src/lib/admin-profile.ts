/**
 * Server-only: the Console admin's editable profile (display name, photo, changed password).
 * The login e-mail still comes from ADMIN_EMAIL; a password changed here overrides ADMIN_PASSWORD
 * (stored scrypt-hashed in admin-profile.json under DATA_DIR) so it survives restarts.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { existsSync, readFileSync } from "fs";
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR, dataFile } from "@/lib/data-dir";

const FILE = dataFile("admin-profile.json");
const PHOTO = path.join(DATA_DIR, "admin-photo.jpg");

interface Profile {
  name?: string;
  salt?: string;
  hash?: string;
  hasPhoto?: boolean;
}

export function readProfile(): Profile {
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

const hashPw = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString("hex");

/** true/false when a changed password exists; null when the env password is still in force. */
export function checkOverridePassword(password: string): boolean | null {
  const p = readProfile();
  if (!p.hash || !p.salt) return null;
  const a = Buffer.from(p.hash, "hex");
  const b = Buffer.from(hashPw(password, p.salt), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

async function write(p: Profile) {
  await fs.writeFile(FILE, JSON.stringify(p, null, 2));
}

export async function setName(name: string) {
  await write({ ...readProfile(), name });
}

export async function setPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  await write({ ...readProfile(), salt, hash: hashPw(password, salt) });
}

export async function setPhoto(dataUrl: string) {
  const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!m) throw new Error("Photo must be a JPG, PNG or WebP image");
  const buf = Buffer.from(m[1], "base64");
  if (!buf.length || buf.length > 2 * 1024 * 1024) throw new Error("Photo is too large (max 2 MB)");
  await fs.writeFile(PHOTO, buf);
  await write({ ...readProfile(), hasPhoto: true });
}

export async function removePhoto() {
  await fs.rm(PHOTO, { force: true });
  await write({ ...readProfile(), hasPhoto: false });
}

export function readPhoto(): Buffer | null {
  return existsSync(PHOTO) ? readFileSync(PHOTO) : null;
}
