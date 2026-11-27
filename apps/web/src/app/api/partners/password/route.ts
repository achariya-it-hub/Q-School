import { getPartnerById, updatePartner } from "@/lib/partners/store";
import { hashPassword, partnerIdFromRequest, passwordProblem, signPartnerToken, verifyPassword, withoutSecrets } from "@/lib/partners/session";
import { recordAuditLog } from "@/lib/audit/store";
import { clientIp, loginBlocked, loginFailed, loginSucceeded, rateLimited } from "@/lib/rate-limit";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

/** Set or change the partner's password. Needs the partner's token; changing an existing password also needs the current one. */
export async function POST(req: Request) {
  try {
    let body: { newPassword?: string; currentPassword?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const t = partnerIdFromRequest(req);
    if (!t) return jsonWithCors({ error: "Please sign in again." }, { status: 401 });
    const partner = await getPartnerById(t.id);
    if (!partner) return jsonWithCors({ error: "Please sign in again." }, { status: 401 });

    const key = `partner-pw:${clientIp(req)}:${partner.id}`;
    if (loginBlocked(key, 6) || rateLimited(`partner-pw-ip:${clientIp(req)}`, 20, 10 * 60_000)) {
      return jsonWithCors({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }

    if (partner.passwordHash) {
      if (!verifyPassword(String(body.currentPassword || ""), partner.passwordHash)) {
        loginFailed(key);
        return jsonWithCors({ error: "Current password is wrong." }, { status: 403 });
      }
    }
    const problem = passwordProblem(String(body.newPassword || ""));
    if (problem) return jsonWithCors({ error: problem }, { status: 400 });

    const updated = await updatePartner(partner.id, { passwordHash: hashPassword(String(body.newPassword)), mustChangePassword: false });
    loginSucceeded(key);
    await recordAuditLog({
      action: "UPDATE",
      module: "Partners & Referrals",
      entityId: partner.id,
      entityName: partner.name,
      summary: `Partner ${partner.name} (${partner.code}) ${partner.passwordHash ? "changed" : "set"} their sign-in password`,
      performedBy: partner.name,
    }).catch(() => {});

    // Old tokens stop working after a password change, so hand back a fresh one.
    return jsonWithCors({ ok: true, token: signPartnerToken(updated!), partner: withoutSecrets(updated!) });
  } catch (err) {
    return jsonWithCors({ error: (err as Error).message }, { status: 400 });
  }
}
