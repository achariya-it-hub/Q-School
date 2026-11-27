import {
  getPartnerByCode,
  getPartnerByEmail,
  listPartnerAdmissions,
  recordPartnerClick,
} from "@/lib/partners/store";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";
import { maskPartner } from "@/lib/partners/mask";
import { clientIp, loginBlocked, loginFailed, loginSucceeded, rateLimited } from "@/lib/rate-limit";
import { listPartners } from "@/lib/partners/store";
import { partnerAuthorised, signPartnerToken, verifyPassword, withoutSecrets } from "@/lib/partners/session";

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
  if (rateLimited(`partner-code:${clientIp(req)}`, 40, 10 * 60_000)) {
    return jsonWithCors({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
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

  const admissions = partnerAuthorised(req, partner) ? await listPartnerAdmissions(partner.id) : [];

  return jsonWithCors({
    ok: true,
    partner: maskPartner(partner), // codes are shared in links: keep payout details hidden
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
      return jsonWithCors({ ok: true, partner: withoutSecrets(partner), admissions, token: signPartnerToken(partner) });
    }

    // Mobile number / email + password
    const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : "";
    if (identifier) {
      const password = typeof body?.password === "string" ? body.password : "";
      const failKey = `partner-login:${clientIp(req)}:${identifier.toLowerCase()}`;
      if (loginBlocked(failKey) || rateLimited(`partner-login-ip:${clientIp(req)}`, 30, 10 * 60_000)) {
        return jsonWithCors({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
      }
      const email = identifier.toLowerCase();
      const digits = identifier.replace(/\D/g, "").slice(-10);
      const found = (await listPartners()).find(
        (p) => p.email.toLowerCase() === email || (digits.length === 10 && p.phone.replace(/\D/g, "").slice(-10) === digits),
      );
      const good = verifyPassword(password, found?.passwordHash);
      if (!found || !good) {
        loginFailed(failKey);
        return jsonWithCors({ error: "Wrong mobile/email or password." }, { status: 401 });
      }
      if (found.status !== "active") {
        return jsonWithCors({ error: "This partner account is inactive. Please contact management." }, { status: 403 });
      }
      loginSucceeded(failKey);
      return jsonWithCors({
        ok: true,
        partner: withoutSecrets(found),
        admissions: await listPartnerAdmissions(found.id),
        token: signPartnerToken(found),
        needsPassword: !!found.mustChangePassword,
      });
    }

    const code = body?.code;
    if (!code || typeof code !== "string") {
      return jsonWithCors({ error: "Partner code is required" }, { status: 400 });
    }
    if (rateLimited(`partner-code:${clientIp(req)}`, 40, 10 * 60_000)) {
      return jsonWithCors({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
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

    if (partner.passwordHash) {
      return jsonWithCors(
        { error: "This account now uses a password. Sign in with your mobile number or email and password.", passwordRequired: true },
        { status: 403 },
      );
    }

    const admissions = await listPartnerAdmissions(partner.id);

    // Legacy code-only account: let them in this one time, and tell the app to make them set a password.
    return jsonWithCors({
      ok: true,
      partner: maskPartner(partner),
      admissions,
      token: signPartnerToken(partner),
      needsPassword: true,
    });
  } catch (err) {
    return jsonWithCors({ error: (err as Error).message }, { status: 500 });
  }
}
