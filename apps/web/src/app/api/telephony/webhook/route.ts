import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/crm/auth";
import { listLeads, updateLead } from "@/lib/crm/store";
import { getSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Q-School Cloud SIP & IVR Webhook",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  // Call events must carry the shared key (…/api/telephony/webhook?key=KEY, or an x-api-key header). Without it
  // anyone could add notes and links to any lead, or push leads to "Contacted", just by knowing a phone number.
  const expected = process.env.TELEPHONY_WEBHOOK_KEY || process.env.LEADS_WEBHOOK_KEY;
  if (!expected) return NextResponse.json({ error: "Set TELEPHONY_WEBHOOK_KEY (or LEADS_WEBHOOK_KEY) on the server first" }, { status: 503 });
  const given = new URL(req.url).searchParams.get("key") || req.headers.get("x-api-key") || "";
  if (!given || !safeEqual(given, expected)) return NextResponse.json({ error: "Invalid key" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const {
    leadId,
    phone,
    caller,
    destination,
    event,
    status,
    duration,
    recordingUrl,
    ivrKey,
  } = body;

  const targetPhone = phone || destination || caller || "";
  const targetLeadId = leadId;

  const leads = await listLeads();
  const matchedLead = targetLeadId
    ? leads.find((l) => l.id === targetLeadId)
    : targetPhone
    ? leads.find((l) => l.phone.replace(/\D/g, "").slice(-10) === targetPhone.replace(/\D/g, "").slice(-10))
    : null;

  if (matchedLead) {
    const settings = await getSettings();
    const tel = settings.telephony;
    const durSec = Number(duration) || 0;
    const durStr = durSec > 0 ? `${Math.floor(durSec / 60)}m ${durSec % 60}s` : "0s";

    let activityText = `📞 Call event: ${event || status || "completed"} (Duration: ${durStr})`;
    if (recordingUrl) {
      activityText += ` · 🎧 [Recording](${recordingUrl})`;
    }
    if (ivrKey) {
      activityText += ` · IVR pressed [${ivrKey}]`;
    }

    const updates: Parameters<typeof updateLead>[1] = {
      activity: activityText,
    };

    // Auto-advance to "Contacted" stage if enabled and currently in "Enquiry"
    if (tel.autoMoveContacted && matchedLead.stage === "Enquiry" && (durSec > 10 || event === "call.completed")) {
      updates.stage = "Contacted";
    }

    await updateLead(matchedLead.id, updates);
  }

  return NextResponse.json({ ok: true, matched: !!matchedLead });
}
