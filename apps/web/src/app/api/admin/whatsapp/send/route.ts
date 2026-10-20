import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { send } from "@/lib/whatsapp/client";
import { getState, windowOpen } from "@/lib/whatsapp/store";
import { waPhone } from "@/lib/whatsapp/types";
import { getSettings } from "@/lib/settings/store";
import { updateLead } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

/**
 * One message from the Console (lead chat).
 * { to, name?, text }                          free text, only inside the 24-hour window
 * { to, name?, template, language?, params }   an approved template, any time
 * { leadId? } adds a line to the lead's activity.
 */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { to?: string; name?: string; text?: string; template?: string; language?: string; params?: unknown[]; leadId?: string };
  const st = await getSettings();
  const to = waPhone(String(b.to ?? ""), st.whatsapp.country);
  if (to.length < 10) return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  const template = typeof b.template === "string" && /^[a-z0-9_]{1,512}$/.test(b.template) ? b.template : undefined;
  const text = typeof b.text === "string" ? b.text.slice(0, 4096) : "";
  if (!template) {
    if (!text.trim()) return NextResponse.json({ error: "Type a message first" }, { status: 400 });
    if (!windowOpen(await getState(), to))
      return NextResponse.json({ error: "It's been more than 24 hours since they last messaged you, so WhatsApp only allows an approved template. Pick one below." }, { status: 400 });
  }
  try {
    const msg = await send({
      to,
      name: b.name?.slice(0, 120),
      text: template ? undefined : text,
      template,
      language: typeof b.language === "string" ? b.language : undefined,
      params: Array.isArray(b.params) ? b.params.slice(0, 20).map((p) => String(p ?? "")) : [],
      event: "manual",
      ref: b.leadId,
    });
    if (b.leadId && msg.status !== "failed") await updateLead(b.leadId, { activity: `WhatsApp sent: “${msg.text.slice(0, 120)}”` }).catch(() => undefined);
    return NextResponse.json({ message: msg }, { status: msg.status === "failed" ? 502 : 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
