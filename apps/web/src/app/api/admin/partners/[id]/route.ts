import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { updatePartner } from "@/lib/partners/store";
import { withoutSecrets } from "@/lib/partners/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { passwordHash: _ph, mustChangePassword: _mc, ...body } = await req.json();
    const updated = await updatePartner(params.id, body);
    return NextResponse.json({ ok: true, partner: withoutSecrets(updated) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
