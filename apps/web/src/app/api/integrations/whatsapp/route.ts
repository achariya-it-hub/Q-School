/**
 * WhatsApp Cloud API webhook.
 *  - every new sender becomes a CRM lead (incl. Click-to-WhatsApp ad referrals) and gets the auto-reply
 *  - replies are kept in the WhatsApp log (Console › WhatsApp, and the lead's chat)
 *  - delivery receipts (sent / delivered / read / failed) update the log
 *  - STOP / START opt people out of, or back into, automatic messages
 * Setup: Meta App › WhatsApp › Configuration › Callback URL = https://<your-domain>/api/integrations/whatsapp,
 *        Verify token = the one in Settings › WhatsApp, subscribe to the `messages` field.
 */
import { NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/crm/auth";
import { mapWhatsApp } from "@/lib/crm/connectors";
import { ingestLead, logError } from "@/lib/crm/store";
import { getSettings } from "@/lib/settings/store";
import { autoReply, handleWebhook } from "@/lib/whatsapp/automations";
import { botIsOn, runBot } from "@/lib/whatsapp/bot";
import { waPhone } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const token = (await getSettings()).whatsapp.verifyToken;
  const ok = u.searchParams.get("hub.mode") === "subscribe" && !!token && u.searchParams.get("hub.verify_token") === token;
  return ok ? new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200 }) : new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const st = await getSettings();
  const sig = verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), st.whatsapp.appSecret || undefined);
  if (!sig.ok) {
    await logError("whatsapp", "Rejected webhook: bad X-Hub-Signature-256");
    return new Response("Invalid signature", { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const wa = await handleWebhook(body).catch(async (e) => {
    await logError("whatsapp", (e as Error).message);
    return { statuses: 0, inbound: 0, newSenders: [] as string[], msgs: [] as import("@/lib/whatsapp/automations").BotInbound[] };
  });
  const bot = await botIsOn().catch(() => false);

  const incoming = mapWhatsApp(body); // status-only payloads map to []
  for (const l of incoming) {
    try {
      const r = await ingestLead(l);
      const phone = waPhone(l.phone ?? "");
      // first message from this number (and not just "STOP")
      if (!bot && wa.newSenders.includes(phone)) await autoReply(phone, l.name);
    } catch (e) {
      await logError("whatsapp", (e as Error).message);
    }
  }
  // the chatbot answers after the lead exists, so the enquiry flow can enrich it
  if (bot) await runBot(wa.msgs, req).catch(async (e) => logError("whatsapp", `bot: ${(e as Error).message}`));
  return NextResponse.json({ ok: true, received: incoming.length, statuses: wa.statuses });
}
