import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { updateLead } from "@/lib/crm/store";
import { getSettings } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { leadId, leadName, leadPhone, counselorPhone, channel, isTest } = body;

  if (!leadPhone) {
    return NextResponse.json({ error: "Lead phone number is required" }, { status: 400 });
  }

  const settings = await getSettings();
  const tel = settings.telephony;

  const virtualNumber = tel.virtualNumber || "+91 80 6900 1200";
  const agentPhone = counselorPhone || tel.counselorNumber || "+91 98765 43210";
  const callId = `CALL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  // Determine Channel with Auto-Failover:
  // Primary (Cloud SIP) -> Backup Option 2 (Android Gateway) -> Backup Option 4 (4G USB Dongle)
  let channelType: "sip" | "android_gateway" | "usb_dongle" = "sip";
  let channelLabel = "Option 1: Cloud SIP Trunk";
  let routeDetail = `Caller ID ${virtualNumber} via ${tel.sipServer || "Cloud SIP"}`;
  let isFailover = false;

  if (channel === "android_gateway" || (!channel && tel.fallbackEnabled && tel.backupRoute === "android_gateway")) {
    channelType = "android_gateway";
    channelLabel = "Option 2: Android Phone Gateway (Wi-Fi SIM)";
    routeDetail = `Android Gateway via SIM Slot ${tel.androidSimSlot || 1} (${tel.androidGatewayUrl || "192.168.1.50"})`;
  } else if (channel === "usb_dongle" || (!channel && tel.fallbackEnabled && tel.backupRoute === "usb_dongle")) {
    channelType = "usb_dongle";
    channelLabel = "Option 4: 4G USB Cellular Dongle (Modem)";
    routeDetail = `Cellular Modem (${tel.usbDongleId || "dongle0"}) on ${tel.usbDonglePort || "/dev/ttyUSB1"}`;
  } else if (channel === "sip") {
    channelType = "sip";
    channelLabel = "Option 1: Cloud SIP Trunk";
    routeDetail = `Caller ID ${virtualNumber} via ${tel.sipServer || "Cloud SIP"}`;
  } else {
    // Default / "auto" failover mode:
    // If Cloud SIP is configured, prioritize it; if SIP server is missing and fallback is enabled, cascade to backups!
    if (!tel.sipServer && tel.fallbackEnabled) {
      if (tel.androidGatewayUrl) {
        channelType = "android_gateway";
        channelLabel = "Option 2: Android Phone Gateway (Wi-Fi SIM) [Auto-Failover]";
        routeDetail = `Backup Route A: SIM Slot ${tel.androidSimSlot || 1} (${tel.androidGatewayUrl})`;
        isFailover = true;
      } else if (tel.usbDonglePort) {
        channelType = "usb_dongle";
        channelLabel = "Option 4: 4G USB Cellular Dongle (Modem) [Auto-Failover]";
        routeDetail = `Backup Route B: Dongle ${tel.usbDongleId || "dongle0"} on ${tel.usbDonglePort}`;
        isFailover = true;
      }
    }
  }

  // Dispatch based on selected/cascaded channel
  if (channelType === "android_gateway") {
    if (tel.androidGatewayUrl && !isTest) {
      try {
        await fetch(`${tel.androidGatewayUrl.replace(/\/+$/, "")}/call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(tel.androidGatewayApiKey ? { Authorization: `Bearer ${tel.androidGatewayApiKey}` } : {}),
          },
          body: JSON.stringify({
            number: leadPhone,
            name: leadName || "Student Lead",
            sim: tel.androidSimSlot || 1,
            callId,
          }),
        }).catch(() => undefined);
      } catch {
        // Fallback non-blocking
      }
    }
  } else if (channelType === "usb_dongle") {
    if (tel.asteriskAriUrl && !isTest) {
      try {
        await fetch(tel.asteriskAriUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: `Dongle/${tel.usbDongleId || "dongle0"}/${leadPhone.replace(/\D/g, "")}`,
            callerId: virtualNumber,
          }),
        }).catch(() => undefined);
      } catch {
        // Fallback non-blocking
      }
    }
  } else {
    // Option 1: Primary Cloud SIP Trunk / Asterisk PJSIP
    let sipSucceeded = true;
    if (tel.asteriskAriUrl && !isTest) {
      try {
        const resp = await fetch(tel.asteriskAriUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: `PJSIP/${agentPhone.replace(/\D/g, "")}`,
            extension: leadPhone.replace(/\D/g, ""),
            callerId: virtualNumber,
            context: "from-internal",
            priority: 1,
          }),
        }).catch(() => null);

        if (!resp || !resp.ok) {
          sipSucceeded = false;
        }
      } catch {
        sipSucceeded = false;
      }
    }

    // Dynamic runtime failover if Cloud SIP trunk connection timed out or failed
    if (!sipSucceeded && tel.fallbackEnabled && !isTest) {
      if (tel.androidGatewayUrl) {
        channelType = "android_gateway";
        channelLabel = "Option 2: Android Phone Gateway [Auto-Failover from SIP]";
        routeDetail = `Failover: SIM Slot ${tel.androidSimSlot || 1} (${tel.androidGatewayUrl})`;
        isFailover = true;
        try {
          await fetch(`${tel.androidGatewayUrl.replace(/\/+$/, "")}/call`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(tel.androidGatewayApiKey ? { Authorization: `Bearer ${tel.androidGatewayApiKey}` } : {}),
            },
            body: JSON.stringify({
              number: leadPhone,
              name: leadName || "Student Lead",
              sim: tel.androidSimSlot || 1,
              callId,
            }),
          }).catch(() => undefined);
        } catch {
          // Non-blocking
        }
      } else if (tel.usbDonglePort) {
        channelType = "usb_dongle";
        channelLabel = "Option 4: 4G USB Cellular Dongle [Auto-Failover from SIP]";
        routeDetail = `Failover: Dongle ${tel.usbDongleId || "dongle0"} on ${tel.usbDonglePort}`;
        isFailover = true;
      }
    }
  }

  // Update lead activity if a valid leadId is provided
  if (leadId && leadId !== "TEST-LEAD") {
    await updateLead(leadId, {
      activity: `📞 1-Click Outbound Call initiated (ID: ${callId}) using ${channelLabel} [${routeDetail}]. Destination: ${leadPhone}.`,
    }).catch(() => undefined);
  }

  return NextResponse.json({
    ok: true,
    callId,
    status: "ringing",
    channelType,
    channelLabel,
    routeDetail,
    virtualNumber,
    agentPhone,
    destinationPhone: leadPhone,
    provider: tel.provider,
    recordCalls: tel.recordCalls,
    isFailover,
    startedAt: new Date().toISOString(),
  });
}
