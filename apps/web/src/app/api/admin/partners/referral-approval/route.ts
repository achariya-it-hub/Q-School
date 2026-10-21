import { NextResponse } from "next/server";
import { isAdmin, getCurrentUserEmail } from "@/lib/crm/auth";
import { updateReferralApproval } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { admissionId, status, notes } = (await req.json()) as {
      admissionId: string;
      status: "Approved" | "Rejected";
      notes?: string;
    };

    if (!admissionId || !status) {
      return NextResponse.json({ error: "admissionId and status ('Approved' | 'Rejected') are required" }, { status: 400 });
    }

    if (status !== "Approved" && status !== "Rejected") {
      return NextResponse.json({ error: "Status must be 'Approved' or 'Rejected'" }, { status: 400 });
    }

    const adminEmail = getCurrentUserEmail() || "Admin";
    const updated = await updateReferralApproval(admissionId, status, adminEmail, notes);

    return NextResponse.json({
      ok: true,
      message: `Referral admission successfully ${status.toLowerCase()} by ${adminEmail}`,
      admission: updated,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
