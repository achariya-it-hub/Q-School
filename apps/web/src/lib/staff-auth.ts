/** Server-only: staff accounts (staff-logins.json, scrypt-hashed passwords) and the staff session cookie. */
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { existsSync, promises as fs } from "fs";
import { cookies } from "next/headers";
import { dataFile } from "@/lib/data-dir";
import { sign, verify } from "@/lib/crm/auth";
import { DEFAULT_STAFF, type StaffLogin } from "@/lib/default-staff";
import { findDbStaffLogin, getDbStaffLogins, saveDbStaffLogin } from "@/lib/db";

export const STAFF_COOKIE = "qs_staff";
const FILE = dataFile("staff-logins.json");

interface Login {
  name: string; // must match Staff.name / task assignee
  email: string;
  salt: string;
  hash: string;
  /** Centre id (e.g. "ch") when this login belongs to a learning centre; it then only sees that centre's students. */
  centre?: string;
}

async function read(): Promise<Login[]> {
  try {
    const dbStaff = await getDbStaffLogins();
    if (dbStaff && dbStaff.length > 0) return dbStaff;
  } catch {}

  try {
    if (!existsSync(FILE)) {
      await fs.writeFile(FILE, JSON.stringify(DEFAULT_STAFF, null, 2));
      return DEFAULT_STAFF;
    }
    const data = await fs.readFile(FILE, "utf8");
    const list = JSON.parse(data);
    if (!Array.isArray(list) || !list.length) {
      await fs.writeFile(FILE, JSON.stringify(DEFAULT_STAFF, null, 2));
      return DEFAULT_STAFF;
    }
    // Merge any missing default staff logins
    const missing = DEFAULT_STAFF.filter((d) => !list.some((l) => l.email.toLowerCase() === d.email.toLowerCase()));
    if (missing.length) {
      const merged = [...list, ...missing];
      await fs.writeFile(FILE, JSON.stringify(merged, null, 2));
      return merged;
    }
    return list;
  } catch {
    return DEFAULT_STAFF;
  }
}

const hashPw = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString("hex");

export async function listLogins() {
  return (await read()).map(({ name, email, centre }) => ({ name, email, centre }));
}

export async function saveLogin(name: string, email: string, password: string, centre?: string) {
  const all = await read();
  const salt = randomBytes(16).toString("hex");
  const rec: Login = { name, email: email.trim().toLowerCase(), salt, hash: hashPw(password, salt), ...(centre ? { centre } : {}) };
  await Promise.all([
    fs.writeFile(FILE, JSON.stringify([...all.filter((l) => l.name !== name && l.email !== rec.email), rec], null, 2)),
    saveDbStaffLogin(rec),
  ]);
}

export async function checkStaff(email: string, password: string): Promise<Login | null> {
  const cleanEmail = email.trim().toLowerCase();
  let l: Login | null = null;
  try {
    l = await findDbStaffLogin(cleanEmail);
  } catch {}
  if (!l) {
    l = (await read()).find((x) => x.email === cleanEmail) || null;
  }
  if (!l) return null;
  const a = Buffer.from(l.hash, "hex");
  const b = Buffer.from(hashPw(password, l.salt), "hex");
  return a.length === b.length && timingSafeEqual(a, b) ? l : null;
}

export const signStaff = (email: string) => sign(`staff:${email}`);

/** The logged-in staff member (by cookie), or null. */
export async function currentStaff(): Promise<{ name: string; email: string; centre?: string } | null> {
  const who = verify(cookies().get(STAFF_COOKIE)?.value);
  if (!who?.startsWith("staff:")) return null;
  const email = who.slice(6);
  const l = (await read()).find((x) => x.email === email);
  return l ? { name: l.name, email: l.email, centre: l.centre } : null;
}
