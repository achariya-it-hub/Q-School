/** Staff master list for admin screens (names in dropdowns, directory, etc.). */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { load } from "@/lib/payroll/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ ok: true, staff: (await load()).staff });
}
