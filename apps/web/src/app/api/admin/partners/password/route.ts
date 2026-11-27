import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { isAdmin } from "@/lib/crm/auth";
import { getPartnerById, updatePartner } from "@/lib/partners/store";
import { hashPassword } from "@/lib/partners/session";
import { recordAuditLog } from "@/lib/audit/store";

export const dynamic = "force-dynamic";

/** Admin issues a one-time temporary password (shown once). The partner must choose their own at next sign-in. */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { partnerId } = (await req.json()) as { partnerId?: string };
    const partner = partnerId ? await getPartnerById(partnerId) : null;
    if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    let temp = "";
    for (let i = 0; i < 8; i++) temp += alphabet[randomInt(alphabet.length)];
    temp += String(randomInt(10, 99));

    await updatePartner(partner.id, { passwordHash: hashPassword(temp), mustChangePassword: true });
    await recordAuditLog({
      action: "UPDATE",
      module: "Partners & Referrals",
      entityId: partner.id,
      entityName: partner.name,
      summary: `Admin issued a temporary sign-in password to partner ${partner.name} (${partner.code})`,
    }).catch(() => {});
    return NextResponse.json({ ok: true, tempPassword: temp, login: partner.email || partner.phone });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
