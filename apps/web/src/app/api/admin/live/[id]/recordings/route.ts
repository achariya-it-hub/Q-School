import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { getRecordings, publishRecording } from "@/lib/bbb/client";
import { getSession, patchSession } from "@/lib/live/store";
import { liveNotice } from "@/lib/whatsapp/automations";

export const dynamic = "force-dynamic";
type P = { params: { id: string } };

export async function GET(_req: Request, { params }: P) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const s = await getSession(params.id);
  if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (s.platform !== "bbb") return NextResponse.json({ recordings: [], external: true });
  try {
    return NextResponse.json({ recordings: await getRecordings(s.meetingId) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

/**
 * { recordID, publish }        publish / unpublish the recording on BBB
 * { replayUrl }                show this recording on the public /live page ("" to hide)
 */
export async function POST(req: Request, { params }: P) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const s = await getSession(params.id);
  if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as { recordID?: string; publish?: boolean; replayUrl?: string };
  try {
    if (b.recordID) await publishRecording(b.recordID, b.publish !== false);
    if (typeof b.replayUrl === "string") {
      const url = b.replayUrl && /^https?:\/\//.test(b.replayUrl) ? b.replayUrl.slice(0, 1000) : "";
      const session = await patchSession(s.id, () => ({ recordingUrl: url, replayPublic: !!url }));
      if (url) await liveNotice(s.id, "live_replay", req).catch(() => undefined);
      return NextResponse.json({ session });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
