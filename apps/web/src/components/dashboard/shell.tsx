"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { STUDENT } from "@qschool/shared";
import { Icon, type IconName } from "@/components/icons";
import { Avatar } from "./art";

const STUDENT_NAV: { label: string; icon: IconName; href: string; chevron?: boolean }[] = [
  { label: "Dashboard", icon: "home", href: "/dashboard" },
  { label: "My Learning", icon: "book", href: "/dashboard#continue" },
  { label: "Explore", icon: "search", href: "/courses", chevron: true },
  { label: "Live Classes", icon: "live", href: "/live" },
  { label: "Workshops", icon: "tools", href: "/dashboard#recommended" },
  { label: "Webinars", icon: "webinar", href: "/live" },
  { label: "Offline Classes", icon: "building", href: "/dashboard#hub" },
  { label: "Certifications", icon: "award", href: "/dashboard#hub" },
  { label: "Assessments & Quiz", icon: "clipboard", href: "/dashboard#hub" },
  { label: "Community", icon: "users", href: "/dashboard#hub" },
  { label: "Messages", icon: "message", href: "/dashboard" },
  { label: "Calendar", icon: "calendar", href: "/dashboard#schedule" },
  { label: "Downloads", icon: "download", href: "/dashboard" },
  { label: "Payments & Orders", icon: "card", href: "/dashboard" },
];

const INSTRUCTOR_NAV: { label: string; icon: IconName; href: string; chevron?: boolean }[] = [
  { label: "Teacher Dashboard", icon: "home", href: "/instructor" },
  { label: "My Courses & BATCHES", icon: "book", href: "/courses" },
  { label: "Live Studio & Webinars", icon: "live", href: "/live" },
  { label: "Assignments & Grading", icon: "clipboard", href: "/instructor" },
  { label: "Student Roster", icon: "users", href: "/instructor" },
  { label: "Payouts & Earnings", icon: "card", href: "/instructor" },
  { label: "Teaching Calendar", icon: "calendar", href: "/instructor" },
  { label: "Q-Master AI Tutor", icon: "sparkle", href: "/q-master" },
];

function SidebarBody({ isInstructor, onNavigate }: { isInstructor?: boolean; onNavigate?: () => void }) {
  const navList = isInstructor ? INSTRUCTOR_NAV : STUDENT_NAV;
  const quickLinks: { label: string; icon: IconName; href: string }[] = [
    { label: "Help & Support", icon: "help", href: "/dashboard" },
    { label: "Settings", icon: "settings", href: "/dashboard" },
    isInstructor
      ? { label: "Switch to Student Mode 🎓", icon: "switch", href: "/dashboard" }
      : { label: "Switch to Instructor 👨‍🏫", icon: "switch", href: "/instructor" },
    { label: "Admin Panel", icon: "shield", href: "/admin/login" },
  ];

  return (
    <div className="flex h-full flex-col px-3 pb-5 pt-4">
      <nav className="space-y-0.5">
        {navList.map((n, i) => {
          const active = i === 0;
          return (
            <Link
              key={n.label}
              href={n.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-[9px] text-[13.5px] transition ${
                active
                  ? "bg-gradient-to-r from-[#0E937E] to-[#13a88f] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(43,179,156,.8)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={n.icon} size={19} className="shrink-0" />
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{n.label}</span>
              {n.chevron && <Icon name="chevRight" size={15} className="opacity-70 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      <p className="mb-1 mt-5 px-3 text-xs font-medium text-white/50 whitespace-nowrap">Quick Links</p>
      <nav className="space-y-0.5">
        {quickLinks.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name={n.icon} size={17} className="shrink-0" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function DashboardShell({ children, isInstructor }: { children: React.ReactNode; isInstructor?: boolean }) {
  const [open, setOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(265);
  const [isResizing, setIsResizing] = useState(false);

  const userName = isInstructor ? "Prof. Alex Johnson" : STUDENT.name;
  const userRole = isInstructor ? "Instructor / Faculty 👨‍🏫" : STUDENT.role;

  // Handle Drag to Resize Sidebar
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(450, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className={`min-h-screen bg-[#F3F8F6] ${isResizing ? "select-none" : ""}`}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b border-[#E2ECE9] bg-white/95 px-4 backdrop-blur lg:px-6">
        <button
          className="rounded-lg p-2 text-brand-deep lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Icon name="menu" size={22} />
        </button>
        <Link href="/" className="flex w-[196px] shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-11 w-auto" />
        </Link>

        <label className="ml-6 hidden h-11 max-w-[440px] flex-1 items-center gap-3 rounded-full border border-[#E2ECE9] bg-[#F7FAF9] px-4 text-[#7b908b] transition focus-within:border-brand-teal focus-within:bg-white md:flex">
          <Icon name="search" size={18} />
          <input
            className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-[#93a5a0]"
            placeholder="Search for courses, workshops, webinars, instructors..."
          />
        </label>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button className="relative rounded-full p-2 text-brand-deep transition hover:bg-[#EEF6F3]" aria-label="Notifications">
            <Icon name="bell" size={22} />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-semibold text-white">
              {STUDENT.notifications}
            </span>
          </button>
          <button className="hidden rounded-full p-2 text-brand-deep transition hover:bg-[#EEF6F3] sm:block" aria-label="Messages">
            <Icon name="message" size={22} />
          </button>

          {/* Quick Role Switcher Button in Header */}
          <Link
            href={isInstructor ? "/dashboard" : "/instructor"}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#0E937E]/10 border border-[#0E937E]/30 px-3 py-1.5 text-xs font-extrabold text-[#0E937E] transition hover:bg-[#0E937E] hover:text-white"
          >
            <Icon name="switch" size={14} />
            {isInstructor ? "Student Mode 🎓" : "Instructor Mode 👨‍🏫"}
          </Link>

          <button className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#EEF6F3]">
            <Avatar name={userName} size={42} />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[15px] font-semibold text-brand-ink">{userName}</span>
              <span className="block text-xs text-[#6b807b]">{userRole}</span>
            </span>
            <Icon name="chevDown" size={16} className="hidden text-brand-deep sm:block" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="sticky top-[72px] hidden h-[calc(100vh-72px)] shrink-0 overflow-y-auto bg-gradient-to-b from-[#06463D] to-[#043530] lg:block [scrollbar-width:thin] relative group"
        >
          <SidebarBody isInstructor={isInstructor} />

          {/* Draggable handle line on right edge */}
          <div
            onMouseDown={startResizing}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#2BD6B4]/60 transition-colors z-20 flex items-center justify-center group/handle"
            title="Click and drag to resize sidebar"
          >
            <div className="h-10 w-1 rounded-full bg-white/20 group-hover/handle:bg-[#2BD6B4] transition-colors" />
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] overflow-y-auto bg-gradient-to-b from-[#06463D] to-[#043530] shadow-2xl">
              <div className="flex items-center justify-between px-4 pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-light.png" alt="Q-School" className="h-9 w-auto" />
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white" aria-label="Close menu">
                  <Icon name="x" size={20} />
                </button>
              </div>
              <SidebarBody isInstructor={isInstructor} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-5 xl:p-6">{children}</main>
      </div>
    </div>
  );
}
