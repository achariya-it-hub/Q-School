import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { updateAdmissionPayout, type PayoutStatus } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { admissionId, status, reference } = (await req.json()) as {
      admissionId: string;
      status: PayoutStatus;
      reference?: string;
    };

    if (!admissionId || !status) {
      return NextResponse.json({ error: "admissionId and status are required" }, { status: 400 });
    }

    const updated = await updateAdmissionPayout(admissionId, status, reference);
    return NextResponse.json({ ok: true, admission: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
