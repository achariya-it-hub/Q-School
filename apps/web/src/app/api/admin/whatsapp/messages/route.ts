import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { queueLength } from "@/lib/whatsapp/client";
import { getState, listMessages, messageStats, windowOpen } from "@/lib/whatsapp/store";
import { waPhone } from "@/lib/whatsapp/types";
import { getSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

/** GET ?phone=…  → one conversation (+ whether free text is allowed and opt-out state); otherwise the log. */
export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const u = new URL(req.url).searchParams;
  const st = await getSettings();
  const state = await getState();
  const raw = u.get("phone");
  if (raw) {
    const phone = waPhone(raw, st.whatsapp.country);
    const messages = (await listMessages({ phone, limit: 200 })).reverse();
    return NextResponse.json({ phone, messages, windowOpen: windowOpen(state, phone), optedOut: state.optOut.includes(phone), lastInbound: state.lastInbound[phone] ?? null });
  }
  const dir = u.get("dir");
  const messages = await listMessages({ q: u.get("q") ?? undefined, dir: dir === "in" || dir === "out" ? dir : undefined, limit: Math.min(1000, Number(u.get("limit")) || 300) });
  return NextResponse.json({ messages, stats: await messageStats(), optOut: state.optOut.length, queued: queueLength() });
}
