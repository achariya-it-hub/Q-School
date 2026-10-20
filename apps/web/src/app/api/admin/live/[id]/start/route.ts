import { NextResponse } from "next/server";
import { COOKIE, isAdmin, verify } from "@/lib/crm/auth";
import { cookies } from "next/headers";
import { BbbError, createMeeting, joinUrl } from "@/lib/bbb/client";
import { getSession, patchSession } from "@/lib/live/store";
import { KIND_LABEL } from "@/lib/live/types";
import { getSettings } from "@/lib/settings/store";
import { liveNotice } from "@/lib/whatsapp/automations";

export const dynamic = "force-dynamic";

/** Create (or re-open) the BBB room and return a moderator join link for the host. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const s = await getSession(params.id);
  if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (s.status === "cancelled") return NextResponse.json({ error: "This session is cancelled" }, { status: 400 });
  // Teams / Zoom / Jitsi / JupiterMeet / other: mark live (students waiting are let through) and open the host link
  if (s.platform !== "bbb") {
    await patchSession(s.id, (x) => ({ status: "live", startedAt: x.startedAt ?? new Date().toISOString(), endedAt: null }));
    await liveNotice(s.id, "live_starting", req).catch(() => undefined);
    return NextResponse.json({ url: s.hostUrl || s.joinUrl, external: true });
  }
  const st = await getSettings();
  if (!st.bbb.enabled) return NextResponse.json({ error: "Live classes are switched off. Turn on BigBlueButton in Settings › Live classes." }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const host = (body.name || s.host || verify(cookies().get(COOKIE)?.value) || "Host").slice(0, 80);
  try {
    const origin = new URL(req.url).origin;
    await createMeeting({
      meetingID: s.meetingId,
      name: `${s.title}`,
      record: s.record,
      durationMin: s.durationMin,
      maxParticipants: s.capacity ? s.capacity + 5 : undefined,
      logoutURL: st.bbb.logoutUrl || `${origin}/live`,
      meta: { kind: KIND_LABEL[s.kind], qschoolSessionId: s.id, bbbOrigin: st.general.orgName },
    });
    await patchSession(s.id, (x) => ({ status: "live", startedAt: x.startedAt ?? new Date().toISOString(), endedAt: null }));
    await liveNotice(s.id, "live_starting", req).catch(() => undefined);
    return NextResponse.json({ url: await joinUrl({ meetingID: s.meetingId, fullName: host, role: "MODERATOR", userID: `host-${s.id}` }) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, key: e instanceof BbbError ? e.key : "error" }, { status: 502 });
  }
}
