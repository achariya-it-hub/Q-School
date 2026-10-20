"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Card, StatusBadge } from "@/components/admin/ui";
import { useSettings } from "@/components/admin/use-settings";
import { Icon, type IconName } from "@/components/icons";

interface Source {
  key: string;
  name: string;
  sub: string;
  connected: boolean;
  leads?: number;
}

const ICON: Record<string, IconName> = { meta: "globe", google: "search", whatsapp: "message", website: "home", webhook: "external" };

export default function IntegrationsPage() {
  const { data } = useSettings();
  const [sources, setSources] = useState<Source[] | null>(null);
  useEffect(() => {
    fetch("/api/crm/sources", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSources(d.sources ?? []))
      .catch(() => setSources([]));
  }, []);

  const bbbOn = !!data?.bbb.configured && !!data?.bbb.enabled;
  const telOn = !!data?.telephony.configured && !!data?.telephony.enabled;

  return (
    <AdminShell>
      <SettingsNav />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Telephony & IVR" action={<Link href="/admin/settings/telephony" className="text-[12.5px] font-semibold text-brand-teal">Configure SIP →</Link>}>
          <Row
            icon="phone"
            name="Cloud SIP Trunk / Asterisk"
            sub="1-click counselor calls, virtual caller ID, automated IVR and call recordings"
            ok={telOn}
            status={telOn ? `Connected · ${data?.telephony.virtualNumber}` : data?.telephony.configured ? "Switched off" : "Not connected"}
            href="/admin/settings/telephony"
            action="Configure"
          />
        </Card>

        <Card title="Live classroom">
          <Row
            icon="live"
            name="BigBlueButton"
            sub="Webinars, workshops and live classes with recordings"
            ok={bbbOn}
            status={bbbOn ? "Connected" : data?.bbb.configured ? "Switched off" : "Not connected"}
            href="/admin/settings/live"
            action="Configure"
          />
        </Card>

        <Card title="Lead sources" action={<Link href="/admin/lead-sources" className="text-[12.5px] font-semibold text-brand-teal">Open Lead Sources →</Link>}>
          {!sources ? (
            <p className="text-[13px] text-[#6b807b]">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {sources.map((s) => (
                <li key={s.key}>
                  <Row
                    icon={ICON[s.key] ?? "globe"}
                    name={s.name}
                    sub={s.sub}
                    ok={s.connected}
                    status={s.connected ? `Connected${typeof s.leads === "number" ? ` · ${s.leads} leads` : ""}` : "Not connected"}
                    href="/admin/lead-sources"
                    action="Set up"
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Coming next" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {(
              [
                ["card", "Online payments", "Razorpay / Cashfree checkout for fees and paid webinars"],
                ["message", "Email delivery", "SMTP or SES for invoices, receipts and reminders"],
                ["bell", "WhatsApp reminders", "Template messages before every live session"],
              ] as [IconName, string, string][]
            ).map(([i, n, s]) => (
              <div key={n} className="flex items-start gap-3 rounded-xl border border-dashed border-[#D6E5E1] p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F4] text-[#6b807b]">
                  <Icon name={i} size={17} />
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold text-brand-ink">{n}</span>
                  <span className="block text-[12px] text-[#6b807b]">{s}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Row({ icon, name, sub, ok, status, href, action }: { icon: IconName; name: string; sub: string; ok: boolean; status: string; href: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#EEF3F1] p-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ok ? "bg-brand-deep text-[#2BD6B4]" : "bg-[#F1F5F4] text-[#6b807b]"}`}>
        <Icon name={icon} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-brand-ink">{name}</span>
        <span className="block text-[12px] text-[#6b807b]">{sub}</span>
      </span>
      <StatusBadge tone={ok ? "good" : "neutral"}>{status}</StatusBadge>
      <Link href={href} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-semibold text-[#41564f] hover:border-brand-teal">
        {action}
      </Link>
    </div>
  );
}
