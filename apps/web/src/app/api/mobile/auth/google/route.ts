import { existsSync, readFileSync } from "fs";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";
import { dataFile } from "@/lib/data-dir";
import { findDbStaffLogin, findDbUserByEmail } from "@/lib/db";
import { DEFAULT_STAFF } from "@/lib/default-staff";
import { DEFAULT_USERS } from "@/lib/default-users";
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

    // Block partners from logging into Student, Teacher, or Admin modes
    const existingPartner = await getPartnerByEmail(verified.email);
    if (existingPartner) {
      return jsonWithCors(
        {
          ok: false,
          error:
            "Partner accounts cannot switch to Student, Teacher, or Admin mode. Please sign in using the Partner tab.",
        },
        { status: 403 },
      );
    }

    // Lookup user in DB / users.json / DEFAULT_USERS
    let matchedUser = await findDbUserByEmail(verified.email);
    if (!matchedUser) {
      try {
        const file = dataFile("users.json");
        if (existsSync(file)) {
          const parsed = JSON.parse(readFileSync(file, "utf8"));
          if (Array.isArray(parsed)) {
            matchedUser =
              parsed.find((u: any) => u.email?.trim().toLowerCase() === verified.email) || null;
          }
        }
      } catch {}
    }
    if (!matchedUser) {
      const def = DEFAULT_USERS.find((u) => u.email.toLowerCase() === verified.email);
      if (def) {
        matchedUser = { ...def, phone: def.phone || "" };
      }
    }

    if (matchedUser && matchedUser.status === "Suspended") {
      return jsonWithCors(
        { ok: false, error: "Your account has been suspended. Please contact Q-School Admin." },
        { status: 403 },
      );
    }

    if (role === "admin") {
      const isAdminEmail =
        (matchedUser && matchedUser.role === "Admin") ||
        verified.email === (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      if (!isAdminEmail) {
        return jsonWithCors(
          {
            ok: false,
            error: "Access denied: This account is not an approved Q-School Admin.",
          },
          { status: 403 },
        );
      }
      return jsonWithCors({
        ok: true,
        user: {
          id: matchedUser?.id || verified.sub,
          name: matchedUser?.name || displayName,
          email: verified.email,
          photoUrl,
          role: "admin",
        },
      });
    }

    if (role === "teacher") {
      const isApprovedTeacher =
        (matchedUser &&
          ["Faculty", "Instructor", "Teacher", "CentreManager", "Admin"].includes(
            matchedUser.role,
          )) ||
        Boolean(await findDbStaffLogin(verified.email)) ||
        DEFAULT_STAFF.some((s) => s.email.toLowerCase() === verified.email);

      if (!isApprovedTeacher) {
        return jsonWithCors(
          {
            ok: false,
            pendingApproval: true,
            error:
              "Teacher accounts require Q-School Admin approval. Only Partners can self-register in the mobile app.",
          },
          { status: 403 },
        );
      }

      return jsonWithCors({
        ok: true,
        user: {
          id: matchedUser?.id || verified.sub,
          name: matchedUser?.name || displayName,
          email: verified.email,
          photoUrl,
          role: "teacher",
        },
      });
    }

    // Student role: must be an Admin-approved ("Active") student or Admin-approved Student user
    const allStudents = await listStudents();
    const matchedStudent =
      allStudents.find(
        (s) =>
          s.email?.trim().toLowerCase() === verified.email &&
          s.status === "Active",
      ) || null;

    const isApprovedStudentUser =
      Boolean(matchedStudent) ||
      Boolean(matchedUser && matchedUser.role === "Student" && matchedUser.status === "Active");

    if (!isApprovedStudentUser) {
      return jsonWithCors(
        {
          ok: false,
          pendingApproval: true,
          error:
            "Student accounts must be enrolled and approved by Q-School Admin. Only Partners can self-register in the mobile app.",
        },
        { status: 403 },
      );
    }

    return jsonWithCors({
      ok: true,
      user: {
        id: matchedStudent?.id || matchedUser?.id || verified.sub,
        name: matchedStudent?.studentName || matchedUser?.name || displayName,
        email: verified.email,
        photoUrl,
        role: "student",
      },
      student: matchedStudent,
    });
  } catch (err) {
    return jsonWithCors({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
