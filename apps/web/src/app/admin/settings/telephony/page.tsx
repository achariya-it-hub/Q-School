"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Btn, Card, Toast, useToast } from "@/components/admin/ui";
import { Row, TextField, Toggle, fieldInput } from "@/components/admin/site-fields";
import { useSettings } from "@/components/admin/use-settings";
import { Icon } from "@/components/icons";
import type { TelephonySettings } from "@/lib/settings/store";

type Form = TelephonySettings;

const PROVIDERS = [
  { key: "tatatele", name: "Tata Tele Smartflo (Recommended for India)" },
  { key: "zadarma", name: "Zadarma (Instant Self-Serve SIP)" },
  { key: "telnyx", name: "Telnyx Elastic SIP Trunk" },
  { key: "asterisk", name: "Local Asterisk / FreePBX Server" },
  { key: "exotel", name: "Exotel Cloud Telephony" },
  { key: "other", name: "Other Custom Cloud SIP Trunk" },
];

export default function TelephonySettingsPage() {
  const { data, save } = useSettings();
  const [f, setF] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testChannel, setTestChannel] = useState<"sip" | "android_gateway" | "usb_dongle">("sip");
  const [testNumber, setTestNumber] = useState("+91 98765 43210");
  const [origin, setOrigin] = useState("");
  const [toast, show] = useToast();

  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    if (!data) return;
    const { hasApiKey: _a, apiKeyHint: _b, configured: _c, hasAndroidApiKey: _d, ...rest } = data.telephony;
    setF({ ...rest, apiKey: "", androidGatewayApiKey: "" });
  }, [data]);

  const saved = useMemo(() => {
    if (!data) return null;
    const { hasApiKey: _a, apiKeyHint: _b, configured: _c, hasAndroidApiKey: _d, ...rest } = data.telephony;
    return { ...rest, apiKey: "", androidGatewayApiKey: "" };
  }, [data]);

  if (!f || !data || !saved) {
    return (
      <AdminShell>
        <SettingsNav />
        <p className="p-4 text-sm text-[#6b807b]">Loading telephony settings…</p>
      </AdminShell>
    );
  }

  const tel = data.telephony;
  const u = <K extends keyof Form>(k: K) => (v: Form[K]) => setF({ ...f, [k]: v });
  const dirty = JSON.stringify(saved) !== JSON.stringify(f);
  const webhookUrl = `${origin}/api/telephony/webhook`;

  const runTestCall = async (channelOverride?: "sip" | "android_gateway" | "usb_dongle") => {
    const ch = channelOverride || testChannel;
    setTesting(true);
    setTest(null);
    try {
      const res = await fetch("/api/telephony/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: "TEST-LEAD",
          leadName: "Test Lead",
          leadPhone: testNumber,
          counselorPhone: f.counselorNumber,
          channel: ch,
          isTest: true,
        }),
      });
      const d = await res.json();
      setTesting(false);
      if (res.ok) {
        setTest({
          ok: true,
          text: `[${d.channelLabel}] Call bridge initiated successfully (ID: ${d.callId || "TEST-9921"}). Routing via ${d.routeDetail}.`,
        });
        show(`Test call placed via ${d.channelLabel}!`);
      } else {
        setTest({ ok: false, text: d.error || "Failed to originate test call" });
      }
    } catch {
      setTesting(false);
      setTest({ ok: false, text: "Server connection failed" });
    }
  };

  return (
    <AdminShell>
      <SettingsNav />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (f.enabled && (!f.sipServer || !f.virtualNumber)) {
            return show("Add the SIP Server Host and Virtual Caller ID number before enabling Telephony");
          }
          setBusy(true);
          try {
            await save({ telephony: f });
            show("Telephony, Cloud SIP & Backup Routes saved successfully");
          } catch (err) {
            show((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]"
      >
        <div className="space-y-4">
          {/* Header Card with Multi-Channel Status */}
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#054038] to-[#0E937E] text-[#2BD6B4] shadow-sm">
                <Icon name="phone" size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-bold text-brand-ink">Cloud SIP Trunk & Multi-Route Telephony</p>
                  <span className="rounded-full bg-[#0E937E]/15 px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E937E]">
                    Failover Active
                  </span>
                </div>
                <p className="text-[12.5px] text-[#6b807b]">
                  Primary Cloud SIP trunk with automated failover to <b>Option 2 (Android Gateway)</b> and <b>Option 4 (4G USB Dongle)</b>.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                  tel.configured && tel.enabled
                    ? "bg-[#EAF7EA] text-[#0A7F0A]"
                    : tel.configured
                    ? "bg-[#F1F5F4] text-[#41564F]"
                    : "bg-[#FFF6E0] text-[#8A5A00]"
                }`}
              >
                {tel.configured && tel.enabled ? "● All Channels Live" : tel.configured ? "Configured (Disabled)" : "Not configured"}
              </span>
            </div>

            {/* Visual 3-Channel Architecture Badges */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#EEF3F1]">
              <div className="rounded-xl border border-[#2BD6B4]/40 bg-[#E9F6F2] p-2.5 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0E937E] text-white text-xs font-black">
                  1
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-[#054038]">Primary: Cloud SIP</p>
                  <p className="text-[10px] text-[#5C716C] truncate">{f.virtualNumber || "Caller ID DID"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-2.5 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white text-xs font-black">
                  2
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-amber-900">Backup A: Android Wi-Fi</p>
                  <p className="text-[10px] text-amber-700 truncate">{f.androidGatewayUrl || "Wi-Fi Gateway"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-purple-300 bg-purple-50/70 p-2.5 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-black">
                  4
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-purple-900">Backup B: 4G USB Stick</p>
                  <p className="text-[10px] text-purple-700 truncate">{f.usbDonglePort || "/dev/ttyUSB1"}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#EEF3F1]">
              <Toggle
                label="Enable 1-Click Calling & Multi-Route Telephony"
                hint="Allows admissions counselors to place outbound calls directly from the CRM with automatic failover"
                checked={f.enabled}
                onChange={u("enabled")}
              />
            </div>
          </Card>

          {/* 1. Primary Option 1: Cloud SIP Trunk Settings */}
          <Card title="Option 1: Primary Cloud SIP Trunk Settings">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">SIP Trunk Provider</label>
                <select
                  value={f.provider}
                  onChange={(e) => u("provider")(e.target.value as any)}
                  className={`${fieldInput} cursor-pointer`}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <Row>
                <TextField
                  label="SIP Registrar / Server Host"
                  hint="IP or domain of your SIP trunk (e.g. sip.smartflo.tatatele.com)"
                  value={f.sipServer}
                  onChange={u("sipServer")}
                  max={150}
                  placeholder="e.g. sip.smartflo.tatatele.com or 192.168.1.100:5060"
                />
                <TextField
                  label="Virtual Number (Caller ID / DID)"
                  hint="The 10-digit number parents see on caller ID"
                  value={f.virtualNumber}
                  onChange={u("virtualNumber")}
                  max={30}
                  placeholder="e.g. +91 80 6900 1200"
                />
              </Row>

              <Row>
                <TextField
                  label="Counselor Mobile / Extension"
                  hint="Counselor phone that rings first when 1-click calling"
                  value={f.counselorNumber}
                  onChange={u("counselorNumber")}
                  max={30}
                  placeholder="e.g. +91 98765 43210"
                />
                <label className="block">
                  <span className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[#41564f]">
                      SIP Auth Secret / Password
                      <span className="ml-1.5 font-normal text-[#8aa39c]">Trunk password</span>
                    </span>
                    {tel.apiKeyHint && <span className="font-mono text-[11.5px] text-[#6b807b]">saved: {tel.apiKeyHint}</span>}
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={f.apiKey}
                    onChange={(e) => u("apiKey")(e.target.value)}
                    placeholder={tel.hasApiKey ? "Leave blank to keep current secret" : "SIP trunk password or API token"}
                    className={`${fieldInput} font-mono`}
                  />
                </label>
              </Row>
            </div>
          </Card>

          {/* 2. Failover Strategy & Backup Routes */}
          <Card title="Failover & Backup Routing Strategy">
            <div className="space-y-4">
              <Toggle
                label="Enable Automatic Backup Failover"
                hint="If the Cloud SIP trunk is unreachable, automatically route outbound calls through Option 2 (Android Gateway) or Option 4 (4G USB Dongle)"
                checked={f.fallbackEnabled}
                onChange={u("fallbackEnabled")}
              />

              <div className="pt-2 border-t border-[#EEF3F1]">
                <label className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Preferred Routing Mode</label>
                <select
                  value={f.backupRoute}
                  onChange={(e) => u("backupRoute")(e.target.value as any)}
                  className={`${fieldInput} cursor-pointer`}
                >
                  <option value="auto">⚡ Auto Failover (Option 1 Cloud SIP ➔ Option 2 Android ➔ Option 4 Dongle)</option>
                  <option value="android_gateway">📱 Force Option 2: Spare Android Phone Gateway (Unlimited SIM)</option>
                  <option value="usb_dongle">📶 Force Option 4: 4G USB Dongle Modem Stick</option>
                  <option value="none">🔒 Cloud SIP Only (No Backup)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 3. Option 2: Spare Android Phone Gateway Settings */}
          <Card title="Option 2: Spare Android Phone Gateway (Wi-Fi SIM Backup)">
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <b>💡 How Option 2 works:</b> Take any spare Android phone with an unlimited Jio/Airtel SIM card. Install an Android SMS & Call Gateway app on the phone connected to your office Wi-Fi. Enter its local IP URL below to place calls over unlimited SIM minutes with zero hardware cost!
              </div>

              <Row>
                <TextField
                  label="Android Gateway Endpoint URL"
                  hint="Local Wi-Fi IP address or Cloudflare tunnel of Android app"
                  value={f.androidGatewayUrl}
                  onChange={u("androidGatewayUrl")}
                  max={200}
                  placeholder="e.g. http://192.168.1.50:8080 or https://gateway.qschool.in"
                />
                <TextField
                  label="SIM Slot Selection"
                  hint="Slot 1 or Slot 2 on the Android phone"
                  value={String(f.androidSimSlot || 1)}
                  onChange={(v) => u("androidSimSlot")(Number(v) || 1)}
                  max={2}
                  placeholder="1"
                />
              </Row>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">
                  Android Gateway Auth Token (Optional)
                  <span className="ml-1.5 font-normal text-[#8aa39c]">API key configured in Android Gateway app</span>
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={f.androidGatewayApiKey}
                  onChange={(e) => u("androidGatewayApiKey")(e.target.value)}
                  placeholder="Bearer token or leave blank if local Wi-Fi without auth"
                  className={`${fieldInput} font-mono`}
                />
              </label>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => runTestCall("android_gateway")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-500 bg-amber-50 px-3.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                >
                  <Icon name="phone" size={14} /> Test Android Gateway Call 📱
                </button>
              </div>
            </div>
          </Card>

          {/* 4. Option 4: 4G USB Cellular Dongle Settings */}
          <Card title="Option 4: 4G USB Cellular Dongle Modem (chan_dongle Backup)">
            <div className="space-y-4">
              <div className="rounded-xl bg-purple-50/80 p-3 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                <b>💡 How Option 4 works:</b> Plug an unlocked ₹1,200 Huawei/ZTE 4G USB modem stick with a SIM card into the USB port of your local Asterisk server. Asterisk uses the <code>chan_dongle</code> driver to dial out directly through cellular networks.
              </div>

              <Row>
                <TextField
                  label="Dongle Identifier ID"
                  hint="Defined in /etc/asterisk/dongle.conf"
                  value={f.usbDongleId}
                  onChange={u("usbDongleId")}
                  max={50}
                  placeholder="e.g. dongle0"
                />
                <TextField
                  label="Device Serial / USB Port"
                  hint="Linux ttyUSB port or Windows COM port"
                  value={f.usbDonglePort}
                  onChange={u("usbDonglePort")}
                  max={50}
                  placeholder="e.g. /dev/ttyUSB1 or COM3"
                />
              </Row>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => runTestCall("usb_dongle")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-purple-500 bg-purple-50 px-3.5 text-xs font-bold text-purple-900 hover:bg-purple-100 transition"
                >
                  <Icon name="phone" size={14} /> Test 4G USB Dongle Call 📶
                </button>
              </div>
            </div>
          </Card>

          {/* Universal Test Outbound Call Card */}
          <Card title="Interactive Multi-Channel Call Tester">
            <div className="space-y-4">
              <p className="text-[12.5px] text-[#6b807b]">
                Select the channel you want to test and enter a destination phone number.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Test Route Channel</label>
                  <select
                    value={testChannel}
                    onChange={(e) => setTestChannel(e.target.value as any)}
                    className={`${fieldInput} cursor-pointer`}
                  >
                    <option value="sip">Option 1: Cloud SIP Trunk (Primary)</option>
                    <option value="android_gateway">Option 2: Android Phone Wi-Fi Gateway (Backup A)</option>
                    <option value="usb_dongle">Option 4: 4G USB Dongle Modem (Backup B)</option>
                  </select>
                </div>

                <TextField
                  label="Destination Phone Number"
                  hint="Number to receive the test call"
                  value={testNumber}
                  onChange={setTestNumber}
                  max={30}
                  placeholder="+91 98765 00000"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => runTestCall()}
                  disabled={testing || !f.counselorNumber}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#054038] to-[#0E937E] px-6 text-[13px] font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                >
                  <Icon name="phone" size={16} /> {testing ? "Dialing…" : `Place Test Call via ${testChannel === "sip" ? "Cloud SIP" : testChannel === "android_gateway" ? "Android Phone" : "USB Dongle"} 📞`}
                </button>
              </div>

              {test && (
                <p
                  className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[13px] ${
                    test.ok ? "bg-[#EAF7EA] text-[#0A6B0A]" : "bg-[#FDF2F2] text-[#B42E2E]"
                  }`}
                >
                  <Icon name={test.ok ? "check" : "alert"} size={16} className="mt-0.5 shrink-0" />
                  {test.text}
                </p>
              )}
            </div>
          </Card>

          {/* Webhook & Callbacks */}
          <Card title="Telephony Webhook & Call Events">
            <div className="space-y-3">
              <p className="text-[12.5px] text-[#6b807b]">
                Paste this Webhook URL into your Cloud SIP provider, Android Gateway app, or Asterisk dialplan to catch call completion, duration, and recording URLs.
              </p>
              <CopyRow label="Call Events Webhook URL" value={webhookUrl} onCopy={() => show("Webhook URL copied")} />
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            {dirty && <span className="mr-auto self-center text-[12.5px] font-bold text-[#8A5A00]">Unsaved changes</span>}
            <Btn type="submit" icon="check" disabled={!dirty || busy}>
              {busy ? "Saving…" : "Save All Telephony Settings"}
            </Btn>
          </div>
        </div>

        {/* Sidebar Guidance */}
        <aside className="space-y-4">
          <Card title="Multi-Route Failover Architecture">
            <div className="space-y-3 text-[13px] text-[#41564f]">
              <div className="rounded-xl border border-gray-100 bg-[#F7FAF9] p-3 space-y-1">
                <p className="font-bold text-brand-ink">1. Primary: Cloud SIP Trunk</p>
                <p className="text-xs text-[#6b807b]">Digital broadband voice with multi-line capacity & crystal clear audio.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-1">
                <p className="font-bold text-amber-900">2. Backup A: Android Phone Gateway</p>
                <p className="text-xs text-amber-800">Zero hardware cost. Uses local Wi-Fi to trigger calls via an old phone's unlimited SIM.</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 space-y-1">
                <p className="font-bold text-purple-900">3. Backup B: 4G USB Dongle</p>
                <p className="text-xs text-purple-800">Direct cellular stick in Asterisk with automatic carrier trunk fallback.</p>
              </div>
            </div>
          </Card>

          <Card title="Sample Asterisk chan_dongle Config">
            <div className="space-y-2 text-[12px] text-[#41564f]">
              <p className="text-[11.5px] text-[#6b807b]">
                In <code>/etc/asterisk/dongle.conf</code>:
              </p>
              <pre className="overflow-x-auto rounded-xl bg-[#F7FAF9] p-3 text-[11px] font-mono text-[#054038] border border-[#E2ECE9]">
{`[${f.usbDongleId || "dongle0"}]
audio=${f.usbDonglePort || "/dev/ttyUSB1"}
data=/dev/ttyUSB2
context=from-dongle
group=1`}
              </pre>
            </div>
          </Card>

          <Card title="Lead Nurturing Pro Tip">
            <p className="text-[12.5px] text-[#41564f]">
              Having dual SIM backups guarantees that even if your office broadband SIP drops, counselors can still reach leads immediately with <b>zero downtime</b>.
            </p>
          </Card>
        </aside>
      </form>
      <Toast msg={toast} />
    </AdminShell>
  );
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">{label}</span>
      <div className="flex gap-2">
        <code className="flex h-11 min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 font-mono text-[12px] text-brand-ink">
          {value}
        </code>
        <Btn variant="ghost" icon="clipboard" onClick={() => (navigator.clipboard.writeText(value), onCopy())}>
          Copy
        </Btn>
      </div>
    </div>
  );
}
