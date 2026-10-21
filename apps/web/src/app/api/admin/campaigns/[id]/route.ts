import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { deleteCampaign, updateCampaign } from "@/lib/crm/campaigns-store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();
    const updated = await updateCampaign(params.id, body);
    return NextResponse.json({ ok: true, campaign: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const deleted = await deleteCampaign(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
