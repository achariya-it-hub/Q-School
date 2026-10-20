import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { endMeeting } from "@/lib/bbb/client";
import { getSession, patchSession } from "@/lib/live/store";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const s = await getSession(params.id);
  if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  try {
    if (s.platform === "bbb") await endMeeting(s.meetingId);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  return NextResponse.json({ session: await patchSession(s.id, () => ({ status: "ended", endedAt: new Date().toISOString() })) });
}
