import { getPartnerByCode, updatePartner } from "@/lib/partners/store";
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

    const partner = await getPartnerByCode(code);
    if (!partner) {
      return jsonWithCors({ error: "Partner not found" }, { status: 404 });
    }

    const updated = await updatePartner(partner.id, {
      ...(phone ? { phone: phone.trim() } : {}),
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      ...(bankDetails ? { bankDetails } : {}),
    });

    return jsonWithCors({ ok: true, partner: updated });
  } catch (err) {
    return jsonWithCors({ error: (err as Error).message }, { status: 400 });
  }
}
