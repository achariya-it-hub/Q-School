import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { createSession, listSessions } from "@/lib/live/store";
import { getSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const [sessions, st] = await Promise.all([listSessions(), getSettings()]);
  return NextResponse.json({ sessions, bbb: { enabled: st.bbb.enabled, configured: !!(st.bbb.url && st.bbb.secret) }, platforms: st.platforms });
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    return NextResponse.json({ session: await createSession(await req.json()) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
