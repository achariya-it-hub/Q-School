/**
 * Console admin profile.
 *   GET   -> { name, email, role, hasPhoto }
 *   PATCH -> { name?, photo? (data URL), removePhoto? }
 *   POST  -> { currentPassword, newPassword }   change password
 */
import { NextResponse } from "next/server";
import { ADMIN_USER } from "@qschool/shared";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { checkCredentials, getCurrentUserEmail, isAdmin } from "@/lib/crm/auth";
import { readProfile, removePhoto, setName, setPassword, setPhoto } from "@/lib/admin-profile";
import { dataFile } from "@/lib/data-dir";
import { DEFAULT_USERS } from "@/lib/default-users";
import { findDbUserByEmail } from "@/lib/db";

export const dynamic = "force-dynamic";

const email = () => process.env.ADMIN_EMAIL || "admin@qschool.com";
const view = async () => {
  const currentEmail = getCurrentUserEmail()?.toLowerCase();
  const defaultEmail = email().toLowerCase();

  if (!currentEmail || currentEmail === "admin" || currentEmail === defaultEmail || currentEmail === "admin@theqschool.com") {
    const p = readProfile();
    return { name: p.name || ADMIN_USER.name, email: defaultEmail, role: ADMIN_USER.role, hasPhoto: !!p.hasPhoto };
  }

  // Check bundled default users
  const def = DEFAULT_USERS.find((u) => u.email.toLowerCase() === currentEmail);
  if (def) {
    const roleLabel = def.role === "CentreManager" ? "Centre Manager" : def.role || "Staff";
    return { name: def.name, email: def.email, role: roleLabel, hasPhoto: false };
  }

  // Check database
  try {
    const dbUser = await findDbUserByEmail(currentEmail);
    if (dbUser) {
      const roleLabel = dbUser.role === "CentreManager" ? "Centre Manager" : dbUser.role || "Staff";
      return { name: dbUser.name, email: dbUser.email, role: roleLabel, hasPhoto: false };
    }
  } catch {}

  try {
    const file = dataFile("users.json");
    let list: any[] = [];
    if (existsSync(file)) {
      try { list = JSON.parse(readFileSync(file, "utf8")); } catch {}
    }
    const u = list.find((x: any) => x.email?.toLowerCase() === currentEmail);
    if (u) {
      const roleLabel = u.role === "CentreManager" ? "Centre Manager" : u.role || "Staff";
      return { name: u.name, email: u.email, role: roleLabel, hasPhoto: false };
    }
  } catch {}

  return { name: currentEmail.split("@")[0], email: currentEmail, role: "Staff", hasPhoto: false };
};

const deny = () => NextResponse.json({ error: "Unauthorised" }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return deny();
  return NextResponse.json({ ok: true, ...(await view()) });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  try {
    if (typeof b.name === "string") {
      const n = b.name.trim().slice(0, 60);
      if (!n) throw new Error("Name cannot be empty");
      await setName(n);
    }
    if (b.removePhoto) await removePhoto();
    else if (typeof b.photo === "string" && b.photo) await setPhoto(b.photo);
    return NextResponse.json({ ok: true, ...view() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return deny();
  const { currentPassword = "", newPassword = "" } = await req.json().catch(() => ({}));
  if (!checkCredentials(email(), String(currentPassword))) return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
  const next = String(newPassword);
  if (next.length < 10) return NextResponse.json({ error: "New password must be at least 10 characters" }, { status: 400 });
  if (next === String(currentPassword)) return NextResponse.json({ error: "New password must be different" }, { status: 400 });
  await setPassword(next);
  return NextResponse.json({ ok: true });
}
