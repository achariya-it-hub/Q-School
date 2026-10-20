import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { createPartner, listPartnerAdmissions, listPartners, type NewPartnerInput } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const [partners, admissions] = await Promise.all([
      listPartners(),
      listPartnerAdmissions(),
    ]);

    const totalAdmissions = admissions.length;
    const totalRevenue = admissions.reduce((acc, a) => acc + (a.feeAmount || 0), 0);
    const totalCommission = admissions.reduce((acc, a) => acc + (a.commissionAmount || 0), 0);
    const paidCommission = admissions
      .filter((a) => a.payoutStatus === "Paid")
      .reduce((acc, a) => acc + (a.commissionAmount || 0), 0);
    const pendingCommission = totalCommission - paidCommission;

    return NextResponse.json({
      ok: true,
      partners,
      admissions,
      stats: {
        totalPartners: partners.length,
        activePartners: partners.filter((p) => p.status === "active").length,
        totalAdmissions,
        totalRevenue,
        totalCommission,
        paidCommission,
        pendingCommission,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = (await req.json()) as NewPartnerInput;

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Partner name is required" }, { status: 400 });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: "Contact phone number is required" }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Contact email is required" }, { status: 400 });
    }

    const partner = await createPartner(body);
    return NextResponse.json({ ok: true, partner });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
