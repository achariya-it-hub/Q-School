import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { meetingInfo } from "@/lib/bbb/client";
import { getSession, patchSession } from "@/lib/live/store";

export const dynamic = "force-dynamic";

/** Live room status from BBB (polled by the Console while a session is live). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const s = await getSession(params.id);
  if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (s.platform !== "bbb") return NextResponse.json({ info: null, session: s });
  try {
    const info = await meetingInfo(s.meetingId);
    let session = s;
    if (info.participants > s.peakAttendance) session = await patchSession(s.id, () => ({ peakAttendance: info.participants }));
    // the room was closed from inside BBB: mark it ended
    if (!info.running && s.status === "live" && s.startedAt && Date.now() - Date.parse(s.startedAt) > 2 * 60_000)
      session = await patchSession(s.id, () => ({ status: "ended", endedAt: new Date().toISOString() }));
    return NextResponse.json({ info, session });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
