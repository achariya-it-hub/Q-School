/**
 * Google Ads lead form webhook.
 * Setup: Google Ads → Assets → Lead form → "Lead delivery" → Webhook URL = https://<your-domain>/api/integrations/google-ads,
 *        Key = the value of GOOGLE_ADS_WEBHOOK_KEY. Use "Send test data" in Google Ads to try it.
 * Google expects HTTP 200 with `{}`; 4xx is not retried, 5xx is retried. Dedupe is by lead_id.
 */
import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/crm/auth";
import { mapGoogleLead, type GoogleLeadPayload } from "@/lib/crm/connectors";
import { ingestLead, logError } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const key = process.env.GOOGLE_ADS_WEBHOOK_KEY;
  let p: GoogleLeadPayload;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ message: "Bad JSON" }, { status: 400 });
  }
  if (!key) {
    await logError("google", "Lead received but GOOGLE_ADS_WEBHOOK_KEY is not set");
    return NextResponse.json({ message: "Webhook key not configured" }, { status: 503 });
  }
  if (!p.google_key || !safeEqual(p.google_key, key)) {
    await logError("google", "Rejected lead: google_key mismatch");
    return NextResponse.json({ message: "Invalid google_key" }, { status: 403 });
  }
  try {
    await ingestLead(mapGoogleLead(p));
    return NextResponse.json({});
  } catch (e) {
    await logError("google", (e as Error).message);
    return NextResponse.json({ message: "Temporary error" }, { status: 500 });
  }
}
