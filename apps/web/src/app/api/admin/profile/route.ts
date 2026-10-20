/**
 * Console admin profile.
 *   GET   -> { name, email, role, hasPhoto }
 *   PATCH -> { name?, photo? (data URL), removePhoto? }
 *   POST  -> { currentPassword, newPassword }   change password
 */
import { NextResponse } from "next/server";
import { ADMIN_USER } from "@qschool/shared";
import { checkCredentials, isAdmin } from "@/lib/crm/auth";
import { readProfile, removePhoto, setName, setPassword, setPhoto } from "@/lib/admin-profile";

export const dynamic = "force-dynamic";

const email = () => process.env.ADMIN_EMAIL || "admin@qschool.com";
const view = () => {
  const p = readProfile();
  return { name: p.name || ADMIN_USER.name, email: email(), role: ADMIN_USER.role, hasPhoto: !!p.hasPhoto };
};
const deny = () => NextResponse.json({ error: "Unauthorised" }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return deny();
  return NextResponse.json({ ok: true, ...view() });
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
