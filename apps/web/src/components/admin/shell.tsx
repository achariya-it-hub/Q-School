"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { ProfileMenu } from "@/components/admin/profile-menu";

const GROUPS: { title: string; items: { label: string; icon: IconName; href: string }[] }[] = [
  { title: "Overview", items: [{ label: "Dashboard", icon: "grid", href: "/admin/dashboard" }] },
  {
    title: "CRM",
    items: [
      { label: "Leads & Pipeline", icon: "kanban", href: "/admin/leads" },
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

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const router = useRouter();

  const logout = () => {
    try {
      localStorage.removeItem("qschool_admin_session");
    } catch {}
    fetch("/api/admin/session", { method: "DELETE" }).finally(() => router.push("/admin/login"));
  };

  return (
    <div className="flex h-full flex-col px-3 pb-5 pt-4">
      {GROUPS.map((g, gi) => (
        <div key={g.title} className={gi ? "mt-4" : ""}>
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
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [sbw, setSbw] = useState(220); // desktop sidebar width, drag the right edge to resize
  const [drag, setDrag] = useState(false);

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
          <button className="relative rounded-full p-2 text-brand-deep hover:bg-[#EEF6F3]" aria-label="Notifications">
            <Icon name="bell" size={22} />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-semibold text-white">
              5
            </span>
          </button>
          <ProfileMenu />
        </div>
      </header>

      <div className="flex">
        <div className="relative hidden shrink-0 lg:block" style={{ width: sbw }}>
          <aside className="sticky top-[72px] h-[calc(100vh-72px)] w-full overflow-y-auto bg-gradient-to-b from-[#06463D] to-[#043530]">
            <Sidebar />
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
              <Sidebar onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-5 xl:p-6">{ready ? children : null}</main>
      </div>
    </div>
  );
}
