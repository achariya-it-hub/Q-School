import { createPartner, listPartners, type PartnerCategory } from "@/lib/partners/store";
import { jsonWithCors, handleCorsOptions } from "@/lib/cors";
import { ingestLead } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return jsonWithCors({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const organization = String(body.organization || "").trim();
    const category: PartnerCategory = body.category || "Education Consultant";
    const centreId = String(body.centreId || "all").trim();
    const upiId = String(body.upiId || "").trim();
    const requestedCode = String(body.code || "").trim().toUpperCase();

    if (!name) {
      return jsonWithCors({ error: "Full Name is required" }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return jsonWithCors({ error: "A valid 10-digit mobile number is required" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return jsonWithCors({ error: "A valid email address is required" }, { status: 400 });
    }

    // Check if phone or email is already registered
    const existing = await listPartners();
    const cleanDigits = phone.replace(/\D/g, "").slice(-10);
    const dup = existing.find(
      (p) =>
        p.email.toLowerCase() === email ||
        p.phone.replace(/\D/g, "").slice(-10) === cleanDigits ||
        (requestedCode && p.code.toUpperCase() === requestedCode)
    );

    if (dup) {
      return jsonWithCors(
        {
          error: `An account already exists with this phone/email or code. Your referral code is: ${dup.code}`,
          partner: dup,
        },
        { status: 409 }
      );
    }

    // Standard initial commission: 10% percentage or 2000 flat
    const newPartner = await createPartner({
      name,
      phone,
      email,
      organization: organization || undefined,
      category,
      centreId,
      commissionType: category === "Trainer / HOC" ? "flat" : "percentage",
      commissionValue: category === "Trainer / HOC" ? 2000 : 10,
      code: requestedCode || undefined,
      bankDetails: upiId ? { upiId, accountName: name } : undefined,
      notes: "Enrolled via self-service partner signup portal.",
    });

    // Also ingest lead for counsellor tracking
    await ingestLead({
      sourceKey: "website",
      name,
      phone,
      email,
      source: "Partner Self-Enrollment",
      interest: `Partner (${category})`,
      message: `New Partner Enrolled: ${category} (${organization || "Independent"}). Referral Code: ${newPartner.code}`,
    }).catch(() => {});

    return jsonWithCors({
      ok: true,
      partner: newPartner,
      message: "Partner account created successfully! You can now start referring students.",
    });
  } catch (err: any) {
    return jsonWithCors({ error: err.message || "Failed to register partner" }, { status: 500 });
  }
}
