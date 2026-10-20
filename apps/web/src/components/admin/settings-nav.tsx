"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const TABS: { href: string; label: string; icon: IconName; sub: string }[] = [
  { href: "/admin/settings", label: "General", icon: "settings", sub: "Organisation, contact and tax details" },
  { href: "/admin/settings/privileges", label: "User Privileges", icon: "shield", sub: "User access control, module-wise permissions, and role rights" },
  { href: "/admin/settings/website", label: "Website", icon: "home", sub: "Home page sections, images and text" },
  { href: "/admin/settings/live", label: "Live classes", icon: "live", sub: "BigBlueButton, Teams, Zoom, Jitsi and JupiterMeet" },
  { href: "/admin/settings/whatsapp", label: "WhatsApp", icon: "message", sub: "Business number, automatic messages, templates and reminders" },
  { href: "/admin/settings/chatbot", label: "Chatbot", icon: "message", sub: "WhatsApp menu bot: enquiries, FAQs, branch details and counsellor handoff" },
  { href: "/admin/settings/telephony", label: "Telephony & IVR", icon: "phone", sub: "Cloud SIP trunk, local Asterisk, caller ID, click-to-call and recordings" },
  { href: "/admin/settings/integrations", label: "Integrations", icon: "globe", sub: "Lead sources and connected services" },
];

export function SettingsNav() {
  const path = usePathname();
  const current = TABS.find((t) => t.href === path) ?? TABS[0];
  return (
    <div className="mb-5">
      <h1 className="text-[26px] font-bold leading-tight text-brand-ink">Settings</h1>
      <p className="mt-0.5 text-sm text-[#6b807b]">{current.sub}</p>
      <nav aria-label="Settings sections" className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-[#E2ECE9] bg-white p-1">
        {TABS.map((t) => {
          const on = t.href === current.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition ${on ? "bg-brand-deep text-white" : "text-[#41564f] hover:bg-[#F1F7F5]"}`}
            >
              <Icon name={t.icon} size={16} /> {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
