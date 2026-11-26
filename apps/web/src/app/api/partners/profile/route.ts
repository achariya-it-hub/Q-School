import { getPartnerByCode, updatePartner } from "@/lib/partners/store";
import { maskPartner, mergeBankDetails } from "@/lib/partners/mask";
import { recordAuditLog } from "@/lib/audit/store";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function PATCH(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { code, bankDetails, phone, email } = body;
    if (!code) {
      return jsonWithCors({ error: "Partner code is required" }, { status: 400 });
    }
    if (rateLimited(`partner-profile:${clientIp(req)}`, 20, 10 * 60_000)) {
      return jsonWithCors({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }

    const partner = await getPartnerByCode(code);
    if (!partner) {
      return jsonWithCors({ error: "Partner not found" }, { status: 404 });
    }

    const updated = await updatePartner(partner.id, {
      ...(phone ? { phone: phone.trim() } : {}),
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      ...(bankDetails ? { bankDetails: mergeBankDetails(partner.bankDetails, bankDetails) } : {}),
    });
    await recordAuditLog({
      action: "UPDATE",
      module: "Partners & Referrals",
      entityId: partner.id,
      entityName: partner.name,
      summary: `Partner ${partner.name} (${partner.code}) updated ${[phone && "phone", email && "email", bankDetails && "payout details"].filter(Boolean).join(", ") || "profile"} from the partner app`,
    }).catch(() => {});

    return jsonWithCors({ ok: true, partner: updated ? maskPartner(updated) : updated });
  } catch (err) {
    return jsonWithCors({ error: (err as Error).message }, { status: 400 });
  }
}
