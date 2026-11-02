"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

export interface NotificationItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  time: string;
  category: "lead" | "fee" | "academic" | "system" | "partner";
  icon: IconName;
  color: string;
  unread: boolean;
  important?: boolean;
  link?: string;
  linkLabel?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Admission Lead in Pondicherry",
    summary: "Parent Priya R. submitted an inquiry for student Aarav (Age 7, Divya Yoga).",
    body: "Parent Priya R. submitted an enrollment inquiry for student Aarav (Age 7, Divya Yoga) at the Moolakulam centre. Contact: +91 98401 23456. Lead source: In-person walk-in & QR referral. Follow-up is recommended within 2 hours.",
    time: "12 mins ago",
    category: "lead",
    icon: "kanban",
    color: "#0B6E5F",
    unread: true,
    important: true,
    link: "/admin/leads",
    linkLabel: "View in Leads Pipeline",
  },
  {
    id: "notif-2",
    title: "Fee Receipt Generated (REC-00000007)",
    summary: "Payment of ₹63,000 received for Divya Yoga (Annual Plan).",
    body: "Full annual tuition of ₹63,000 was collected for Divya Yoga via Online Payment (UPI). Invoice Cum Receipt #REC-00000007 generated and automated confirmation dispatched to parent WhatsApp.",
    time: "45 mins ago",
    category: "fee",
    icon: "rupee",
    color: "#2563EB",
    unread: true,
    link: "/admin/fees",
    linkLabel: "View Fee Ledger",
  },
  {
    id: "notif-3",
    title: "Partner Referral Awaiting Review",
    summary: "Achariya School (ACH-PUDU) referred a student for Divya Mantra.",
    body: "Partner code ACH-PUDU logged an admission for student Karthik R. into Divya Mantra (Age 9-10). Referral bonus credit of ₹2,000 is queued for administrator sign-off.",
    time: "2 hours ago",
    category: "partner",
    icon: "community",
    color: "#D97706",
    unread: true,
    link: "/admin/partners",
    linkLabel: "Review Referral",
  },
  {
    id: "notif-4",
    title: "Hybrid Class Session Starting",
    summary: "Divya Yoga Section A live session starts in 30 minutes.",
    body: "Interactive batch session for Divya Yoga (Section A, Puducherry & Chennai Hybrid) will go live at 04:00 PM. 18 students have confirmed attendance.",
    time: "3 hours ago",
    category: "academic",
    icon: "webinar",
    color: "#7C3AED",
    unread: false,
    link: "/admin/live",
    linkLabel: "Open Live Class Console",
  },
  {
    id: "notif-5",
    title: "Demo Credentials Cleared",
    summary: "All demo credentials have been successfully removed from public web & mobile portals.",
    body: "System security scan complete: All hardcoded credentials, quick login buttons, and dummy prefilled fields were securely eradicated across all applications.",
    time: "Yesterday",
    category: "system",
    icon: "shield",
    color: "#059669",
    unread: false,
  },
];

export function NotificationsMenu({
  variant = "admin",
  className = "",
}: {
  variant?: "admin" | "student";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [expandedId, setExpandedId] = useState<string | null>("notif-1");
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all");
  const boxRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = items.filter((i) => i.unread).length;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Mark as read on expand
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, unread: false } : i))
    );
  };

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
  };

  const filteredItems = items.filter((i) => {
    if (filter === "unread") return i.unread;
    if (filter === "important") return i.important;
    return true;
  });

  return (
    <div className={`relative ${className}`} ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative rounded-full p-2 text-brand-deep transition hover:bg-[#EEF6F3]"
      >
        <Icon name="bell" size={22} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-semibold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications Panel"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] rounded-2xl border border-[#D8EAE4] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8F2EF] bg-gradient-to-r from-[#F7FCFA] to-[#EEF8F5] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-deep text-white">
                <Icon name="bell" size={14} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-brand-ink leading-none">Notifications</h3>
                <span className="text-[11px] text-[#5C716C]">
                  {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11.5px] font-semibold text-brand-teal hover:text-brand-deep transition hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E8F2EF] bg-white px-3 py-1.5 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                filter === "all" ? "bg-brand-deep text-white" : "text-[#5C716C] hover:bg-[#F0F7F4]"
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                filter === "unread" ? "bg-brand-deep text-white" : "text-[#5C716C] hover:bg-[#F0F7F4]"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("important")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                filter === "important" ? "bg-brand-deep text-white" : "text-[#5C716C] hover:bg-[#F0F7F4]"
              }`}
            >
              Important
            </button>
          </div>

          {/* List */}
          <div className="max-h-[440px] overflow-y-auto divide-y divide-[#EBF3F0]">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#7B8E89]">
                <Icon name="bell" size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-brand-ink">No notifications in this tab</p>
                <p className="text-xs text-[#7B8E89] mt-0.5">You are all caught up!</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleExpand(item.id)}
                    className={`cursor-pointer transition-colors p-3.5 ${
                      isExpanded
                        ? "bg-[#F3FAF7]"
                        : item.unread
                        ? "bg-white hover:bg-[#F9FCFB]"
                        : "bg-white/80 hover:bg-[#F9FCFB] opacity-90"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        <Icon name={item.icon} size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4
                            className={`text-[13px] leading-tight truncate ${
                              item.unread ? "font-bold text-brand-ink" : "font-semibold text-[#304741]"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="shrink-0 text-[11px] text-[#7B8E89] font-medium">
                            {item.time}
                          </span>
                        </div>

                        {/* Summary when collapsed, full body when expanded */}
                        {!isExpanded ? (
                          <p className="mt-1 line-clamp-1 text-[12px] text-[#5C716C]">
                            {item.summary}
                          </p>
                        ) : (
                          <div className="mt-2 text-[12.5px] leading-relaxed text-[#2C403B] bg-white rounded-xl p-3 border border-[#D5E7E1] shadow-sm">
                            <p>{item.body}</p>

                            {item.link && (
                              <div className="mt-3 flex items-center justify-between border-t border-[#EEF5F2] pt-2">
                                <Link
                                  href={item.link}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-deep hover:text-brand-teal hover:underline"
                                >
                                  {item.linkLabel || "View Details"} →
                                </Link>
                                <span className="text-[10.5px] font-semibold text-[#7B8E89] uppercase tracking-wider">
                                  {item.category}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 font-medium text-brand-teal">
                            <span>{isExpanded ? "Click to collapse" : "Click to read message"}</span>
                            <Icon name={isExpanded ? "chevUp" : "chevDown"} size={12} />
                          </span>

                          {item.unread && (
                            <span className="inline-block h-2 w-2 rounded-full bg-brand-teal" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E8F2EF] bg-[#F7FAF9] px-4 py-2.5 text-center">
            <span className="text-[11.5px] text-[#7B8E89]">
              Connected to Q-School Notification System
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
