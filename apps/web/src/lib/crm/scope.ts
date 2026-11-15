/**
 * Which leads the signed-in Console user may see (server-only).
 * Admins see every lead. A user bound to a branch (Centre Head / Faculty / Counsellor with a centreId)
 * sees only leads whose centre — explicit centreId, or resolved from the free-text location — is theirs.
 */
import { existsSync, readFileSync } from "fs";
import { leadCentreId, resolveCentreId } from "@qschool/shared";
import { getCurrentUserEmail } from "@/lib/crm/auth";
import { dataFile } from "@/lib/data-dir";
import { DEFAULT_USERS } from "@/lib/default-users";
import { findDbUserByEmail } from "@/lib/db";

export interface LeadScope {
  email: string;
  role: string;
  /** undefined = all centres */
  centreId?: string;
}

const ADMIN_EMAILS = () =>
  new Set([(process.env.ADMIN_EMAIL || "admin@qschool.com").toLowerCase(), "admin@qschool.com", "admin@theqschool.com", "admin"]);

export async function getLeadScope(): Promise<LeadScope> {
  const email = (getCurrentUserEmail() || "").toLowerCase();
  if (!email || ADMIN_EMAILS().has(email)) return { email, role: "Admin" };

  type U = { role?: string; centreId?: string; location?: string };
  let u: U | undefined = DEFAULT_USERS.find((x) => x.email.toLowerCase() === email);
  if (!u) {
    try {
      u = (await findDbUserByEmail(email)) ?? undefined;
    } catch {}
  }
  if (!u) {
    try {
      const f = dataFile("users.json");
      if (existsSync(f)) u = (JSON.parse(readFileSync(f, "utf8")) as any[]).find((x) => x?.email?.toLowerCase() === email);
    } catch {}
  }
  const role = u?.role || "Staff";
  if (!u || role === "Admin") return { email, role };
  const centreId = (u.centreId && resolveCentreId(u.centreId)) || resolveCentreId(u.location);
  return { email, role, centreId };
}

export function inScope(scope: LeadScope, lead: { centreId?: string; location?: string }) {
  return !scope.centreId || leadCentreId(lead) === scope.centreId;
}
