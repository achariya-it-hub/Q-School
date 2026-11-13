"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COURSES } from "@qschool/shared";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icon } from "@/components/icons";
import { KIND_LABEL, fmtWhen, phase, type LiveSession } from "@/lib/live/types";

export default function InstructorDashboardPage() {
  const [courseCount, setCourseCount] = useState(COURSES.length);
  const [studentCount, setStudentCount] = useState(0);
  const [sessions, setSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    fetch("/api/admin/courses", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.courses)) setCourseCount(d.courses.length);
      })
      .catch(() => {});
    fetch("/api/students", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.students)) setStudentCount(d.students.length);
      })
      .catch(() => {});
    fetch("/api/admin/live", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.sessions)) setSessions(d.sessions);
      })
      .catch(() => {});
  }, []);

  const upcomingSessions = sessions.filter((s) => ["live", "upcoming"].includes(phase(s)));

  return (
    <DashboardShell isInstructor={true}>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="rounded-3xl border border-[#2BD6B4]/30 bg-gradient-to-r from-[#054038] via-[#0E937E] to-[#054038] p-6 text-white shadow-[0_12px_32px_-12px_rgba(5,64,56,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-[#2BD6B4] px-3 py-0.5 text-[11px] font-black uppercase text-[#054038]">
                Instructor Portal 👨‍🏫
              </span>
              <span className="text-xs text-white/70">Verified Faculty</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome, Faculty Mentor 🎓</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium">
              Manage your active courses, schedule live classes, review student progress &amp; track sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/live"
              className="flex items-center gap-2 rounded-2xl bg-[#E5484D] px-5 py-3 text-xs font-black text-white shadow-lg transition hover:bg-[#C93B40] hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span className="h-2 w-2 animate-ping rounded-full bg-white" />
              🔴 Go Live Now
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-3 text-xs font-bold text-white hover:bg-white/25 transition whitespace-nowrap"
            >
              <Icon name="switch" size={16} /> Student Mode
            </Link>
          </div>
        </div>

        {/* 4 Instructor Key Metric Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Active Courses", val: String(courseCount), icon: "book", color: "#0E937E", sub: "Official Q-School Catalogue" },
            { label: "Enrolled Students", val: String(studentCount), icon: "users", color: "#2563EB", sub: "Across learning centres" },
            { label: "Live Sessions", val: String(upcomingSessions.length), icon: "live", color: "#D97706", sub: "Upcoming & active rooms" },
            { label: "Pending Submissions", val: "0", icon: "clipboard", color: "#16A34A", sub: "All submissions reviewed" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-[#E2ECE9] bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6b807b]">{c.label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.color}15`, color: c.color }}>
                  <Icon name={c.icon as any} size={18} />
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-brand-ink">{c.val}</p>
                <p className="text-[11px] font-semibold text-[#6b807b] mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Teaching Sessions Queue */}
        <div className="rounded-3xl border border-[#E2ECE9] bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-brand-ink flex items-center gap-2">
                <Icon name="live" size={20} className="text-[#0E937E]" />
                Upcoming Live Teaching Sessions
              </h2>
              <p className="text-xs text-[#6b807b]">Scheduled classes and interactive workshops for your batches.</p>
            </div>
            <Link href="/live" className="text-xs font-bold text-[#0E937E] hover:underline flex items-center gap-1">
              View Calendar <Icon name="arrowRight" size={14} />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="rounded-2xl border border-[#EEF3F1] bg-[#F7FAF9] p-6 text-center">
              <p className="text-sm font-semibold text-brand-ink">No live teaching sessions scheduled yet</p>
              <p className="mt-1 text-xs text-[#6b807b]">
                Schedule a live class or workshop in the Admin Console under Academics → Live sessions.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {upcomingSessions.map((s) => (
                <div key={s.id} className="rounded-2xl border border-[#EEF3F1] bg-[#F7FAF9] p-4 flex flex-col justify-between space-y-3 hover:border-[#D7F0EB] transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-lg bg-[#0E937E]/15 px-2.5 py-1 text-[10.5px] font-black uppercase text-[#0E937E]">
                        {KIND_LABEL[s.kind]} • {fmtWhen(s.startsAt)}
                      </span>
                      <span className="text-xs font-bold text-[#6b807b]">{s.registrations.length} Registered</span>
                    </div>
                    <h3 className="text-sm font-bold text-brand-ink">{s.title}</h3>
                    {s.description && <p className="text-xs text-[#6b807b] mt-1 line-clamp-2">{s.description}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2ECE9]">
                    <Link
                      href="/live"
                      className="rounded-xl bg-[#054038] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E937E] transition flex items-center gap-1.5"
                    >
                      <Icon name="play" size={14} /> Open Session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Assignments & Submissions to Review */}
        <div className="rounded-3xl border border-[#E2ECE9] bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-brand-ink flex items-center gap-2">
                <Icon name="clipboard" size={20} className="text-[#0E937E]" />
                Student Assignments Needing Review
              </h2>
              <p className="text-xs text-[#6b807b]">Grade student submissions and provide feedback.</p>
            </div>
            <span className="rounded-full bg-[#0E937E]/15 px-3 py-1 text-xs font-bold text-[#0E937E]">
              0 Pending
            </span>
          </div>

          <div className="rounded-2xl border border-[#EEF3F1] bg-[#F7FAF9] p-6 text-center">
            <p className="text-sm font-semibold text-brand-ink">No pending student submissions</p>
            <p className="mt-1 text-xs text-[#6b807b]">
              New student project submissions and habit reflection logs will appear here for grading.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
