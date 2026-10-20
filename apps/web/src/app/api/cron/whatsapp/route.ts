import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/crm/auth";
import { reminderTick } from "@/lib/whatsapp/automations";

export const dynamic = "force-dynamic";

/**
 * Backup trigger for live-session reminders. The server already checks every minute on its own;
 * if your host ever pauses the app, add a cron job that opens
 *   https://<your-domain>/api/cron/whatsapp?key=<CRON_SECRET>
 * every 5–10 minutes. Safe to call often: each reminder is only sent once.
 */
export async function GET(req: Request) {
  const key = process.env.CRON_SECRET;
  const got = new URL(req.url).searchParams.get("key") ?? "";
  if (!key || !safeEqual(got, key)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ ok: true, queued: await reminderTick() });
}
