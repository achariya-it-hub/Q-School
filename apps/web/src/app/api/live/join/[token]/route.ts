import { NextResponse } from "next/server";
import { joinUrl } from "@/lib/bbb/client";
import { roomOpen } from "@/lib/live/access";
import { findByToken, markJoined } from "@/lib/live/store";

export const dynamic = "force-dynamic";

/**
 * Public (token-scoped): send a registered student into the room once it's open.
 * BigBlueButton gets a freshly signed viewer link; other platforms get their meeting link.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const back = new URL(`/live/join/${params.token}`, req.url);
  const f = await findByToken(params.token);
  if (!f || f.session.status === "cancelled") return NextResponse.redirect(back, 303);
  if (!(await roomOpen(f.session))) {
    back.searchParams.set("wait", "1");
    return NextResponse.redirect(back, 303);
  }
  await markJoined(f.session.id, f.reg.id);
  const target =
    f.session.platform === "bbb"
      ? await joinUrl({ meetingID: f.session.meetingId, fullName: f.reg.name, role: "VIEWER", userID: f.reg.id })
      : f.session.joinUrl;
  return NextResponse.redirect(target, 303);
}
