"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { ProfileMenu } from "@/components/admin/profile-menu";
import { NotificationsMenu } from "@/components/notifications-menu";
import {
  RESTRICTED_CENTRE_HEAD_HREFS,
  isCentreHeadRole,
  isRestrictedForCentreHead,
  useAdminRole,
} from "@/lib/centre-head";

const GROUPS: { title: string; items: { label: string; icon: IconName; href: string }[] }[] = [
  { title: "Overview", items: [{ label: "Dashboard", icon: "grid", href: "/admin/dashboard" }] },
  {
    title: "CRM",
    items: [
      { label: "Leads & Pipeline", icon: "kanban", href: "/admin/leads" },
      { label: "Campaign Calendar", icon: "calendar", href: "/admin/campaigns" },
      { label: "Events", icon: "calendar", href: "/admin/events" },
      { label: "Partners & Referrals", icon: "community", href: "/admin/partners" },
      { label: "Follow-ups", icon: "phone", href: "/admin/followups" },
      { label: "Lead Sources", icon: "globe", href: "/admin/lead-sources" },
      { label: "WhatsApp", icon: "message", href: "/admin/whatsapp" },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Students", icon: "community", href: "/admin/enrolments" },
      { label: "Users", icon: "users", href: "/admin/students" },
      { label: "Courses", icon: "book", href: "/admin/courses" },
      { label: "Live sessions", icon: "webinar", href: "/admin/live" },
      { label: "Schedule", icon: "calendar", href: "/admin/schedule" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Fees & Receivables", icon: "rupee", href: "/admin/fees" },
      { label: "Invoices", icon: "lessons", href: "/admin/invoices" },
      { label: "Payments", icon: "card", href: "/admin/payments" },
      { label: "Receipts", icon: "checkCircle", href: "/admin/receipts" },
      { label: "Expenses", icon: "download", href: "/admin/expenses" },
    ],
  },
  {
    title: "ERP",
    items: [
      { label: "HR & Staff", icon: "briefcase", href: "/admin/staff" },
      { label: "Staff Tasks", icon: "checkCircle", href: "/admin/staff/tasks" },
      { label: "Payroll", icon: "rupee", href: "/admin/payroll" },
      { label: "Inventory", icon: "box", href: "/admin/inventory" },
    ],
  },
  {
    title: "Insights & setup",
    items: [
      { label: "Reports", icon: "chart", href: "/admin/reports" },
      { label: "Audit Trail", icon: "shield", href: "/admin/audit" },
      { label: "Settings", icon: "settings", href: "/admin/settings" },
    ],
  },
];

function Sidebar({
  userRole,
  onRoleChange,
  onNavigate,
}: {
  userRole?: string;
  onRoleChange?: (r: string) => void;
  onNavigate?: () => void;
}) {
  const path = usePathname();
  const router = useRouter();
  const isHead = isCentreHeadRole(userRole);

  const logout = () => {
    try {
      localStorage.removeItem("qschool_admin_session");
      localStorage.removeItem("qs_active_role");
    } catch {}
    fetch("/api/admin/session", { method: "DELETE" }).finally(() => router.push("/admin/login"));
  };

  const visibleGroups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => !isHead || !RESTRICTED_CENTRE_HEAD_HREFS.has(item.href)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full flex-col px-3 pb-5 pt-3">
      {/* Active Role Selector in Sidebar */}
      <div className="mx-1 mb-3 rounded-xl bg-black/35 border border-white/10 p-2 text-white">
        <div className="flex items-center justify-between text-[11px] font-semibold text-white/70 mb-1.5">
          <span>Console View:</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded text-[10.5px] ${
              isHead ? "bg-amber-400 text-amber-950" : "bg-[#2BD6B4] text-[#054038]"
            }`}
          >
            {isHead ? "Centre Head" : "Super Admin"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/40 p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => onRoleChange?.("Super Admin")}
            className={`rounded-md py-1 transition text-center ${
              !isHead
                ? "bg-gradient-to-r from-[#0E937E] to-[#13a88f] text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => onRoleChange?.("Centre Head")}
            className={`rounded-md py-1 transition text-center ${
              isHead ? "bg-amber-600 text-white shadow" : "text-white/60 hover:text-white"
            }`}
          >
            Centre Head
          </button>
        </div>
        {isHead && (
          <div className="mt-2 text-[10.5px] text-amber-200 bg-amber-950/60 border border-amber-500/40 rounded-lg px-2 py-1 leading-snug">
            🔒 <b>Centre Head Mode:</b> 7 restricted modules hidden (Campaigns, Lead Sources, WhatsApp, Staff Tasks, Payroll, Audit &amp; Settings).
          </div>
        )}
      </div>

      {visibleGroups.map((g, gi) => (
        <div key={g.title} className={gi ? "mt-3" : ""}>
          <p className="mb-1 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-white/45">{g.title}</p>
          <nav className="space-y-0.5">
            {g.items.map((n) => {
              const active = path === n.href || (n.href !== "/admin/dashboard" && path.startsWith(`${n.href}/`));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition ${
                    active
                      ? "bg-gradient-to-r from-[#0E937E] to-[#13a88f] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(43,179,156,.8)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={n.icon} size={18} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="mt-auto space-y-2 pt-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-[13px] text-white/80 transition hover:bg-white/10"
        >
          <Icon name="external" size={17} /> Student view
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/80 transition hover:bg-white/10"
        >
          <Icon name="logout" size={17} /> Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { role: userRole, setRole: setUserRole, isHead } = useAdminRole();
  const [sbw, setSbw] = useState(220); // desktop sidebar width, drag the right edge to resize
  const [drag, setDrag] = useState(false);

  // Redirect centre heads away from restricted administration paths
  useEffect(() => {
    if (isHead && isRestrictedForCentreHead(path)) {
      router.replace("/admin/dashboard");
    }
  }, [isHead, path, router]);

  useEffect(() => {
    const v = Number(localStorage.getItem("qs-sidebar-w"));
    if (v >= 180 && v <= 420) setSbw(v);
  }, []);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    setDrag(true);
    let last = sbw;
    const move = (ev: PointerEvent) => {
      last = Math.min(420, Math.max(180, ev.clientX));
      setSbw(last);
    };
    const up = () => {
      setDrag(false);
      localStorage.setItem("qs-sidebar-w", String(last));
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Server session check (httpOnly cookie set by /api/admin/session) — Better Auth replaces this later.
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => (r.ok ? setReady(true) : router.replace("/admin/login")))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F3F8F6]">
      <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b border-[#E2ECE9] bg-white/95 px-4 backdrop-blur lg:px-6">
        <button className="rounded-lg p-2 text-brand-deep lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={22} />
        </button>
        <Link href="/admin/dashboard" className="flex w-[196px] shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-10 w-auto" />
          <span className="hidden rounded-md bg-brand-teal100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep sm:inline">
            Console
          </span>
        </Link>

        <label className="ml-6 hidden h-11 max-w-[440px] flex-1 items-center gap-3 rounded-full border border-[#E2ECE9] bg-[#F7FAF9] px-4 text-[#7b908b] focus-within:border-brand-teal focus-within:bg-white md:flex">
          <Icon name="search" size={18} />
          <input
            className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-[#93a5a0]"
            placeholder="Search leads, students, invoices..."
          />
          <kbd className="rounded border border-[#E2ECE9] bg-white px-1.5 text-[10px] text-[#7b908b]">⌘K</kbd>
        </label>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {/* Quick Role Switcher Pill in Top Bar */}
          <button
            type="button"
            onClick={() => setUserRole(isHead ? "Super Admin" : "Centre Head")}
            className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
              isHead
                ? "border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 ring-2 ring-amber-300/40"
                : "border-[#B5D8CE] bg-[#EEF8F5] text-brand-deep hover:bg-[#E2F2ED]"
            }`}
            title="Click to toggle between Super Admin and Centre Head views"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${isHead ? "bg-amber-500 animate-pulse" : "bg-brand-teal"}`} />
            <span>{isHead ? "🏫 Centre Head View (7 Hidden)" : "👑 Super Admin View (All)"}</span>
            <span className="text-[10px] uppercase tracking-wide font-extrabold text-brand-teal bg-white px-1.5 py-0.5 rounded-full border border-black/5 shadow-2xs">
              Toggle ⇄
            </span>
          </button>

          <NotificationsMenu variant="admin" />
          <ProfileMenu />
        </div>
      </header>

      <div className="flex">
        <div className="relative hidden shrink-0 lg:block" style={{ width: sbw }}>
          <aside className="sticky top-[72px] h-[calc(100vh-72px)] w-full overflow-y-auto bg-gradient-to-b from-[#06463D] to-[#043530]">
            <Sidebar userRole={userRole} onRoleChange={setUserRole} />
          </aside>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar (double-click to reset)"
            title="Drag to resize · double-click to reset"
            onPointerDown={startDrag}
            onDoubleClick={() => {
              setSbw(220);
              localStorage.setItem("qs-sidebar-w", "220");
            }}
            className={`absolute inset-y-0 -right-1 z-30 w-2 cursor-col-resize transition-colors hover:bg-brand-teal/50 ${drag ? "bg-brand-teal/60" : ""}`}
          />
        </div>
        {drag && <div className="fixed inset-0 z-[60] cursor-col-resize select-none" />}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[260px] overflow-y-auto bg-gradient-to-b from-[#06463D] to-[#043530] shadow-2xl">
              <div className="flex items-center justify-between px-4 pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-light.png" alt="Q-School" className="h-9 w-auto" />
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white" aria-label="Close menu">
                  <Icon name="x" size={20} />
                </button>
              </div>
              <Sidebar userRole={userRole} onRoleChange={setUserRole} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-5 xl:p-6">{ready ? children : null}</main>
      </div>
    </div>
  );
}
