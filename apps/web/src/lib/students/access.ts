/** Server-only: who is calling the Students API — a Console admin, or a centre's staff login. */
import { isAdmin } from "@/lib/crm/auth";
import { currentStaff } from "@/lib/staff-auth";

export type Caller = { kind: "admin"; name: string } | { kind: "centre"; name: string; centreId: string };

export async function caller(): Promise<Caller | null> {
  if (isAdmin()) return { kind: "admin", name: "Admin" };
  const s = await currentStaff();
  if (s?.centre) return { kind: "centre", name: s.name, centreId: s.centre };
  return null;
}
