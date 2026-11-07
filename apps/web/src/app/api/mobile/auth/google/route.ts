import { jsonWithCors, handleCorsOptions } from "@/lib/cors";
import { getPartnerByEmail, listPartnerAdmissions } from "@/lib/partners/store";
import { listStudents } from "@/lib/students/store";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

const ALLOWED_GOOGLE_CLIENT_IDS = new Set(
  [
    "784665159823-4aloigc4h10psf282ni1oveboubbilin.apps.googleusercontent.com",
    "784665159823-nk3j6o9mbts1i1q2g77i15hnnk4i8nan.apps.googleusercontent.com",
    process.env.GOOGLE_CLIENT_ID || "",
  ].filter(Boolean),
);

async function verifyGoogleTokens(
  idToken?: string,
  accessToken?: string,
): Promise<GoogleProfile | null> {
  if (idToken) {
    const r = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { cache: "no-store" },
    );
    if (r.ok) {
      const data = (await r.json()) as {
        aud?: string;
        azp?: string;
        sub?: string;
        email?: string;
        email_verified?: string | boolean;
        name?: string;
        picture?: string;
      };
      const audOk =
        !data.aud ||
        ALLOWED_GOOGLE_CLIENT_IDS.has(data.aud) ||
        (!!data.azp && ALLOWED_GOOGLE_CLIENT_IDS.has(data.azp));
      if (
        audOk &&
        data.email &&
        (data.email_verified === true || data.email_verified === "true")
      ) {
        return {
          sub: data.sub || data.email,
          email: data.email.trim().toLowerCase(),
          name: data.name || data.email.split("@")[0],
          picture: data.picture,
        };
      }
    }
  }

  if (accessToken) {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (r.ok) {
      const data = (await r.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };
      if (data.email && data.email_verified !== false) {
        return {
          sub: data.sub || data.email,
          email: data.email.trim().toLowerCase(),
          name: data.name || data.email.split("@")[0],
          picture: data.picture,
        };
      }
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      idToken?: string;
      accessToken?: string;
      role?: string;
      displayName?: string;
      photoUrl?: string;
    };

    const verified = await verifyGoogleTokens(body.idToken, body.accessToken);
    if (!verified) {
      return jsonWithCors(
        { ok: false, error: "Could not verify Google OAuth token." },
        { status: 401 },
      );
    }

    const role = (body.role || "student").toLowerCase();
    const displayName = body.displayName?.trim() || verified.name;
    const photoUrl = body.photoUrl || verified.picture || null;

    if (role === "partner") {
      const partner = await getPartnerByEmail(verified.email);
      if (!partner) {
        return jsonWithCors(
          {
            ok: true,
            partnerFound: false,
            user: {
              id: verified.sub,
              name: displayName,
              email: verified.email,
              photoUrl,
              role: "partner",
            },
          },
          { status: 200 },
        );
      }

      if (partner.status !== "active") {
        return jsonWithCors(
          { ok: false, error: "This partner account is inactive. Please contact management." },
          { status: 403 },
        );
      }

      const admissions = await listPartnerAdmissions(partner.id);
      return jsonWithCors({
        ok: true,
        partnerFound: true,
        user: {
          id: verified.sub,
          name: partner.name || displayName,
          email: verified.email,
          photoUrl,
          role: "partner",
        },
        partner,
        admissions,
      });
    }

    // Match enrolled student record if any
    const allStudents = await listStudents();
    const matchedStudent =
      allStudents.find((s) => s.email?.trim().toLowerCase() === verified.email) || null;

    return jsonWithCors({
      ok: true,
      user: {
        id: matchedStudent?.id || verified.sub,
        name: matchedStudent?.studentName || displayName,
        email: verified.email,
        photoUrl,
        role,
      },
      student: matchedStudent,
    });
  } catch (err) {
    return jsonWithCors({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
