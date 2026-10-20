import { getPartnerByCode, listPartnerAdmissions, recordPartnerClick } from "@/lib/partners/store";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return jsonWithCors({ error: "Partner code is required" }, { status: 400 });
  }

  const partner = await getPartnerByCode(code);
  if (!partner) {
    return jsonWithCors({ error: "Partner referral code not found" }, { status: 404 });
  }

  if (searchParams.get("trackClick") === "1") {
    await recordPartnerClick(code);
  }

  const admissions = await listPartnerAdmissions(partner.id);

  return jsonWithCors({
    ok: true,
    partner,
    admissions,
  });
}

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const code = body?.code;
    if (!code || typeof code !== "string") {
      return jsonWithCors({ error: "Partner code is required" }, { status: 400 });
    }

    const partner = await getPartnerByCode(code);
    if (!partner) {
      return jsonWithCors({ error: "Invalid partner code. Check your code or contact admin." }, { status: 404 });
    }

    if (partner.status !== "active") {
      return jsonWithCors({ error: "This partner code is inactive. Please contact management." }, { status: 403 });
    }

    const admissions = await listPartnerAdmissions(partner.id);

    return jsonWithCors({
      ok: true,
      partner,
      admissions,
    });
  } catch (err) {
    return jsonWithCors({ error: (err as Error).message }, { status: 500 });
  }
}
