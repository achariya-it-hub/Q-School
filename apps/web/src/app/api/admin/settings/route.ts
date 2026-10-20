import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { getSettings, publicSettings, saveSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json(publicSettings(await getSettings()));
}

/** Partial updates: { general?: {...}, bbb?: {...} }. An empty bbb.secret keeps the stored secret. */
export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as { bbb?: { url?: string } };
  if (b?.bbb?.url && !/^https:\/\//i.test(b.bbb.url.trim()) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(b.bbb.url.trim()))
    return NextResponse.json({ error: "Use an https:// address for the BigBlueButton server" }, { status: 400 });
  return NextResponse.json(publicSettings(await saveSettings(body)));
}
