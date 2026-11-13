import {
  getPartnerByCode,
  getPartnerByEmail,
  listPartnerAdmissions,
  recordPartnerClick,
} from "@/lib/partners/store";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

const ALLOWED_GOOGLE_CLIENT_IDS = new Set(
  [
    "784665159823-4aloigc4h10psf282ni1oveboubbilin.apps.googleusercontent.com",
    "784665159823-nk3j6o9mbts1i1q2g77i15hnnk4i8nan.apps.googleusercontent.com",
    process.env.GOOGLE_CLIENT_ID || "",
  ].filter(Boolean),
);

async function verifyGoogleEmail(idToken?: string, accessToken?: string): Promise<string | null> {
  if (idToken) {
    const r = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { cache: "no-store" },
    );
    if (!r.ok) return null;
    const data = (await r.json()) as {
      aud?: string;
      azp?: string;
      email?: string;
      email_verified?: string | boolean;
    };
    const audOk =
      !data.aud ||
      ALLOWED_GOOGLE_CLIENT_IDS.has(data.aud) ||
      (!!data.azp && ALLOWED_GOOGLE_CLIENT_IDS.has(data.azp));
    if (audOk && data.email && (data.email_verified === true || data.email_verified === "true")) {
      return data.email.trim().toLowerCase();
    }
    return null;
  }

  if (accessToken) {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { email?: string; email_verified?: boolean };
    if (data.email && data.email_verified !== false) {
      return data.email.trim().toLowerCase();
    }
  }

  return null;
}

const PLAY_STORE_DEMO_PARTNER = {
  id: "prt_playstore_demo",
  code: "QSP-DEMO",
  name: "Q-School Demo Partner",
  organization: "Divine Grace Foundation",
  category: "Education Consultant",
  phone: "9876543212",
  email: "partner@theqschool.com",
  centreId: "mk",
  commissionPct: 15,
  commissionPerAdmission: 1500,
  status: "active" as const,
  clicks: 12,
  leadsCount: 0,
  admissionsCount: 0,
  totalEarned: 0,
  paidAmount: 0,
  createdAt: "2026-11-01T00:00:00.000Z",
};

function isDemoPartnerCode(code: string): boolean {
  const clean = code.trim().toUpperCase();
  return clean === "QSP-DEMO" || clean === "QSP-PLAY" || clean === "PARTNER@THEQSCHOOL.COM";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return jsonWithCors({ error: "Partner code is required" }, { status: 400 });
  }

  if (isDemoPartnerCode(code)) {
    return jsonWithCors({
      ok: true,
      partner: PLAY_STORE_DEMO_PARTNER,
      admissions: [],
    });
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
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    // Google OAuth login lookup by verified Gmail
    const idToken = typeof body?.idToken === "string" ? body.idToken : undefined;
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken : undefined;
    if (idToken || accessToken) {
      const verifiedEmail = await verifyGoogleEmail(idToken, accessToken);
      if (!verifiedEmail) {
        return jsonWithCors(
          { error: "Invalid or expired Google sign-in token." },
          { status: 401 },
        );
      }

      const partner = await getPartnerByEmail(verifiedEmail);
      if (!partner) {
        return jsonWithCors(
          {
            ok: false,
            notRegistered: true,
            email: verifiedEmail,
            error: `No partner account found for ${verifiedEmail}. Complete quick partner registration to get your referral code.`,
          },
          { status: 404 },
        );
      }

      if (partner.status !== "active") {
        return jsonWithCors(
          { error: "This partner account is inactive. Please contact management." },
          { status: 403 },
        );
      }

      const admissions = await listPartnerAdmissions(partner.id);
      return jsonWithCors({ ok: true, partner, admissions });
    }

    const code = body?.code;
    if (!code || typeof code !== "string") {
      return jsonWithCors({ error: "Partner code is required" }, { status: 400 });
    }

    if (isDemoPartnerCode(code)) {
      return jsonWithCors({
        ok: true,
        partner: PLAY_STORE_DEMO_PARTNER,
        admissions: [],
      });
    }

    const partner = await getPartnerByCode(code);
    if (!partner) {
      return jsonWithCors(
        { error: "Invalid partner code. Check your code or contact admin." },
        { status: 404 },
      );
    }

    if (partner.status !== "active") {
      return jsonWithCors(
        { error: "This partner code is inactive. Please contact management." },
        { status: 403 },
      );
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
