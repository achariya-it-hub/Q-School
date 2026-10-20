import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { testConnection } from "@/lib/whatsapp/client";

export const dynamic = "force-dynamic";

/** Check the number + token (optionally with values typed in the form but not saved yet). */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { token?: string; phoneNumberId?: string; wabaId?: string };
  try {
    return NextResponse.json({ ok: true, ...(await testConnection({ token: b.token?.trim(), phoneNumberId: b.phoneNumberId?.replace(/\D/g, ""), wabaId: b.wabaId?.replace(/\D/g, "") })) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
