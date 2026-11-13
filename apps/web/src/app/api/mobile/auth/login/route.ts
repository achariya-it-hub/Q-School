import { existsSync, readFileSync } from "fs";
import { checkCredentials } from "@/lib/crm/auth";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";
import { dataFile } from "@/lib/data-dir";
import { findDbStaffLogin, findDbUserByEmail } from "@/lib/db";
import { DEFAULT_STAFF } from "@/lib/default-staff";
import { DEFAULT_USERS } from "@/lib/default-users";
import { listPartners } from "@/lib/partners/store";
import { listStudents } from "@/lib/students/store";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      identifier?: string;
      password?: string;
      role?: string;
    };

    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "").trim();
    const role = String(body.role || "student").trim().toLowerCase();

    if (!identifier || !password) {
      return jsonWithCors(
        { ok: false, error: "Please enter both email/mobile and password." },
        { status: 400 },
      );
    }

    const lowerId = identifier.toLowerCase();
    const phoneDigits = identifier.replace(/\D/g, "").slice(-10);

    // Prevent Partners from switching into Student, Teacher, or Admin mode
    const partners = await listPartners();
    const isPartnerAccount = partners.some(
      (p) =>
        p.code.toLowerCase() === lowerId ||
        (p.email && p.email.trim().toLowerCase() === lowerId) ||
        (phoneDigits.length === 10 && p.phone.replace(/\D/g, "").slice(-10) === phoneDigits),
    );
    if (isPartnerAccount && role !== "partner") {
      return jsonWithCors(
        {
          ok: false,
          error:
            "Partner accounts cannot switch to Student, Teacher, or Admin mode. Please sign in under the Partner tab.",
        },
        { status: 403 },
      );
    }

    // Lookup user in DB / users.json / DEFAULT_USERS
    let matchedUser = await findDbUserByEmail(lowerId);
    if (!matchedUser) {
      try {
        const file = dataFile("users.json");
        if (existsSync(file)) {
          const parsed = JSON.parse(readFileSync(file, "utf8"));
          if (Array.isArray(parsed)) {
            matchedUser =
              parsed.find(
                (u: any) =>
                  u.email?.trim().toLowerCase() === lowerId ||
                  (phoneDigits.length === 10 &&
                    String(u.phone || "").replace(/\D/g, "").slice(-10) === phoneDigits),
              ) || null;
          }
        }
      } catch {}
    }
    if (!matchedUser) {
      const def = DEFAULT_USERS.find((u) => u.email.toLowerCase() === lowerId);
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
      const isValidAdmin =
        checkCredentials(lowerId, password) ||
        Boolean(
          matchedUser &&
            matchedUser.role === "Admin" &&
            matchedUser.password &&
            matchedUser.password === password,
        );

      if (!isValidAdmin) {
        return jsonWithCors(
          { ok: false, error: "Invalid Admin email or password." },
          { status: 401 },
        );
      }

      return jsonWithCors({
        ok: true,
        user: {
          id: matchedUser?.id || `admin_${lowerId}`,
          name: matchedUser?.name || "Q-School Admin",
          email: matchedUser?.email || lowerId,
          role: "admin",
        },
      });
    }

    if (role === "teacher") {
      const isTeacherRole =
        matchedUser &&
        ["Faculty", "Instructor", "Teacher", "CentreManager", "Admin"].includes(matchedUser.role);

      if (isTeacherRole) {
        const pwOk =
          (matchedUser?.password && matchedUser.password === password) ||
          checkCredentials(lowerId, password);
        if (!pwOk) {
          return jsonWithCors(
            { ok: false, error: "Incorrect password for Teacher account." },
            { status: 401 },
          );
        }
        return jsonWithCors({
          ok: true,
          user: {
            id: matchedUser!.id,
            name: matchedUser!.name,
            email: matchedUser!.email,
            role: "teacher",
          },
        });
      }

      const staffLogin =
        (await findDbStaffLogin(lowerId)) ||
        DEFAULT_STAFF.find((s) => s.email.toLowerCase() === lowerId);

      if (staffLogin && checkCredentials(lowerId, password)) {
        return jsonWithCors({
          ok: true,
          user: {
            id: `staff_${staffLogin.email}`,
            name: staffLogin.name,
            email: staffLogin.email,
            role: "teacher",
          },
        });
      }

      return jsonWithCors(
        {
          ok: false,
          pendingApproval: true,
          error:
            "Teacher account not found or not yet approved by Q-School Admin. Only Partners can self-register.",
        },
        { status: 403 },
      );
    }

    // Student role: must be an Admin-approved Student in users.json/DB or enrolled in students.json/DB
    if (matchedUser && matchedUser.role === "Student") {
      if (matchedUser.password && matchedUser.password !== password) {
        return jsonWithCors(
          { ok: false, error: "Incorrect password for Student account." },
          { status: 401 },
        );
      }
      return jsonWithCors({
        ok: true,
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: "student",
        },
      });
    }

    const students = await listStudents();
    const matchedStudent = students.find(
      (s) =>
        s.status === "Active" &&
        ((s.email && s.email.trim().toLowerCase() === lowerId) ||
          s.id.toLowerCase() === lowerId ||
          (phoneDigits.length === 10 &&
            s.phone.replace(/\D/g, "").slice(-10) === phoneDigits)),
    );

    if (matchedStudent) {
      // Allow login if password matches Student ID (e.g. STU-0001) or registered phone/last 4 digits
      const stuPhoneLast4 = matchedStudent.phone.replace(/\D/g, "").slice(-4);
      const pwValid =
        password.toUpperCase() === matchedStudent.id.toUpperCase() ||
        password === matchedStudent.phone.replace(/\D/g, "").slice(-10) ||
        (stuPhoneLast4.length === 4 && password === stuPhoneLast4);

      if (!pwValid) {
        return jsonWithCors(
          {
            ok: false,
            error:
              "Incorrect password. Use your Student ID (e.g. STU-0001) or registered mobile number provided by Q-School Admin.",
          },
          { status: 401 },
        );
      }

      return jsonWithCors({
        ok: true,
        user: {
          id: matchedStudent.id,
          name: matchedStudent.studentName,
          email: matchedStudent.email || `${matchedStudent.id.toLowerCase()}@theqschool.com`,
          role: "student",
        },
        student: matchedStudent,
      });
    }

    return jsonWithCors(
      {
        ok: false,
        pendingApproval: true,
        error:
          "Student account not found or pending Admin approval. Students and Teachers must be approved by Q-School Admin; only Partners can self-register.",
      },
      { status: 403 },
    );
  } catch (err) {
    return jsonWithCors({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
