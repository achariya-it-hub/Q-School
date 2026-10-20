"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { Icon } from "@/components/icons";

export default function InstructorDashboardPage() {
  const [gradedCount, setGradedCount] = useState(0);

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
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome Back, Prof. Alex Johnson 🎓</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium">
              Manage your active courses, schedule live classes, review student submissions & track monthly earnings.
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
            { label: "Active Courses", val: "4", icon: "book", color: "#0E937E", sub: "12 Modules Active" },
            { label: "Enrolled Students", val: "280", icon: "users", color: "#2563EB", sub: "+24 this week" },
            { label: "Instructor Rating", val: "4.9 ⭐", icon: "sparkle", color: "#D97706", sub: "Based on 340 reviews" },
            { label: "Monthly Earnings", val: "₹42,500", icon: "card", color: "#16A34A", sub: "Paid on 1st of month" },
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

          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                title: "Mind & Memory Mastery (Batch A)",
                topic: "Scientific Memory Techniques & Practical Memory Palace Drills",
                time: "TODAY • 4:00 PM",
                enrolled: "48 Students",
                urgent: true,
              },
              {
                title: "Advanced Creative Thinking Workshop",
                topic: "Ideation Frameworks & Design Thinking Group Activity",
                time: "TOMORROW • 10:00 AM",
                enrolled: "35 Students",
                urgent: false,
              },
            ].map((s, idx) => (
              <div key={idx} className="rounded-2xl border border-[#EEF3F1] bg-[#F7FAF9] p-4 flex flex-col justify-between space-y-3 hover:border-[#D7F0EB] transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-lg px-2.5 py-1 text-[10.5px] font-black uppercase ${s.urgent ? "bg-[#E5484D]/15 text-[#E5484D]" : "bg-[#0E937E]/15 text-[#0E937E]"}`}>
                      {s.time}
                    </span>
                    <span className="text-xs font-bold text-[#6b807b]">{s.enrolled}</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-ink">{s.title}</h3>
                  <p className="text-xs text-[#6b807b] mt-1">{s.topic}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2ECE9]">
                  <Link
                    href="/live"
                    className="rounded-xl bg-[#054038] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E937E] transition flex items-center gap-1.5"
                  >
                    <Icon name="play" size={14} /> Start Class
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
              {2 - gradedCount} Pending
            </span>
          </div>

          <div className="space-y-3">
            {[
              { id: 1, title: "Design Thinking Prototype Submission", student: "Aarav Sharma", course: "Design Thinking", date: "Submitted 2 hours ago" },
              { id: 2, title: "Mindfulness Reflection Journal & Goals", student: "Meera Nair", course: "Mind & Memory", date: "Submitted yesterday" },
            ].map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-[#EEF3F1] bg-[#F7FAF9] p-4 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E937E]/15 text-[#0E937E]">
                    <Icon name="clipboard" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-ink">{a.title}</h4>
                    <p className="text-xs text-[#6b807b]">By {a.student} • {a.course} • {a.date}</p>
                  </div>
                </div>

                <button
                  onClick={() => setGradedCount((c) => Math.min(2, c + 1))}
                  className="rounded-xl bg-[#054038] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E937E] transition"
                >
                  Grade Submission ➔
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
