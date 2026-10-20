import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { setOptOut } from "@/lib/whatsapp/store";
import { waPhone } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

/** { phone, out } — stop or resume automatic messages and broadcasts for one number. */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { phone?: string; out?: boolean };
  const phone = waPhone(String(b.phone ?? ""));
  if (phone.length < 10) return NextResponse.json({ error: "Invalid number" }, { status: 400 });
  return NextResponse.json({ phone, optedOut: await setOptOut(phone, b.out !== false) });
}
