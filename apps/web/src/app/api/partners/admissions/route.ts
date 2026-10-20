import { createPartnerAdmission, getPartnerByCode, listPartnerAdmissions, type NewPartnerAdmissionInput } from "@/lib/partners/store";
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
    return jsonWithCors({ error: "Invalid partner code" }, { status: 404 });
  }

  const admissions = await listPartnerAdmissions(partner.id);
  return jsonWithCors({ ok: true, admissions });
}

export async function POST(req: Request) {
  try {
    let body: NewPartnerAdmissionInput;
    try {
      body = (await req.json()) as NewPartnerAdmissionInput;
    } catch {
      return jsonWithCors({ error: "Invalid request payload" }, { status: 400 });
    }

    if (!body?.partnerCode?.trim()) {
      return jsonWithCors({ error: "Partner referral code is required" }, { status: 400 });
    }
    if (!body?.studentName?.trim()) {
      return jsonWithCors({ error: "Student name is required" }, { status: 400 });
    }
    if (!body?.parentName?.trim()) {
      return jsonWithCors({ error: "Parent name is required" }, { status: 400 });
    }
    if (!body?.phone?.trim() || body.phone.replace(/\D/g, "").length < 10) {
      return jsonWithCors({ error: "Valid 10-digit mobile number is required" }, { status: 400 });
    }
    if (!body?.grade?.trim()) {
      return jsonWithCors({ error: "Grade/Class is required" }, { status: 400 });
    }

    const result = await createPartnerAdmission(body);

    return jsonWithCors({
      ok: true,
      message: `Admission successfully registered for ${body.studentName} in ERP!`,
      studentId: result.studentId,
      admission: result.admission,
      isDuplicateStudent: result.isDuplicateStudent,
    });
  } catch (err) {
    return jsonWithCors({ error: (err as Error).message }, { status: 400 });
  }
}
