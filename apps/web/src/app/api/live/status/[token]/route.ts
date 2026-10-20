import { NextResponse } from "next/server";
import { roomOpen } from "@/lib/live/access";
import { findByToken } from "@/lib/live/store";
import { phase } from "@/lib/live/types";

export const dynamic = "force-dynamic";

/** Public (token-scoped): is the room open yet? Polled by the waiting room. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const f = await findByToken(params.token);
  if (!f) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  const open = await roomOpen(f.session);
  // the passcode is only handed out to registered students once the room is open
  return NextResponse.json({ open, phase: phase(f.session), passcode: open ? f.session.passcode : "" });
}
