"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SESSIONS, type Session } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Card, Figure, PageHeader, Segmented, StatusBadge, Toast, useToast, type Tone } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { PLATFORMS, phase, type LiveSession } from "@/lib/live/types";

const TONE: Record<Session["status"], Tone> = { Live: "info", Upcoming: "warning", Done: "good" };
type K = "All" | Session["kind"];

function toScheduledSession(s: LiveSession): Session {
  const p = phase(s);
  const start = new Date(s.startsAt);
  const end = new Date(start.getTime() + (s.durationMin || 60) * 60000);
  const day = start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeFmt = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const kind: Session["kind"] =
    s.kind === "class" ? "Live Class" : s.kind === "workshop" ? "Workshop" : "Webinar";
  const status: Session["status"] = p === "live" ? "Live" : p === "upcoming" ? "Upcoming" : "Done";
  return {
    id: s.id,
    day,
    time: `${timeFmt(start)} – ${timeFmt(end)}`,
    title: s.title,
    kind,
    host: s.host || "Q-School Faculty",
    enrolled: s.registrations.length,
    capacity: s.capacity || 100,
    status,
    room: PLATFORMS[s.platform]?.label || s.platform.toUpperCase(),
  };
}

export default function SchedulePage() {
  const [kind, setKind] = useState<K>("All");
  const [liveList, setLiveList] = useState<LiveSession[]>([]);
  const [toast, show] = useToast();

  useEffect(() => {
    fetch("/api/admin/live", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.sessions)) setLiveList(d.sessions);
      })
      .catch(() => {});
  }, []);

  const allSessions = useMemo(() => {
    const mapped = liveList.map(toScheduledSession);
    return [...mapped, ...SESSIONS];
  }, [liveList]);

  const list = allSessions.filter((s) => kind === "All" || s.kind === kind);
  const days = Array.from(new Set(list.map((s) => s.day)));
  const seats = allSessions.reduce((a, s) => a + s.capacity, 0);
  const booked = allSessions.reduce((a, s) => a + s.enrolled, 0);
  const seatPct = seats > 0 ? Math.round((booked / seats) * 100) : 0;

  return (
    <AdminShell>
      <PageHeader title="Schedule" sub="Live classes, webinars, workshops and offline sessions · this week">
        <Link
          href="/admin/live"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-[#0B6E5F] to-[#054038] px-4 text-[13px] font-semibold text-white hover:from-[#0E937E]"
        >
          <Icon name="plus" size={16} /> Schedule session
        </Link>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure
          label="Sessions scheduled"
          value={String(allSessions.length)}
          sub={`${allSessions.filter((s) => s.status === "Live").length} live right now`}
          icon="calendar"
        />
        <Figure
          label="Seats booked"
          value={booked.toLocaleString("en-IN")}
          meter={seatPct}
          sub={`${seatPct}% of ${seats.toLocaleString("en-IN")} seats`}
          icon="users"
        />
        <Figure
          label="Hosts"
          value={String(new Set(allSessions.map((s) => s.host)).size)}
          sub="Faculty scheduled"
          icon="lessons"
        />
      </section>

      <Card className="mt-5">
        <div className="mb-4">
          <Segmented<K>
            label="Session type"
            value={kind}
            onChange={setKind}
            options={(["All", "Live Class", "Webinar", "Workshop", "Offline"] as K[]).map((v) => ({ value: v, label: v }))}
          />
        </div>
        {list.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal100 text-brand-deep">
              <Icon name="calendar" size={26} />
            </span>
            <p className="mt-3 text-[15px] font-semibold text-brand-ink">No sessions on the schedule yet</p>
            <p className="mt-1 max-w-sm text-[13px] text-[#6b807b]">
              Schedule a live class, workshop, or webinar in Live Sessions to see it appear on your weekly timetable.
            </p>
            <Link
              href="/admin/live"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-deep px-4 text-[13px] font-semibold text-white hover:bg-brand-teal"
            >
              <Icon name="plus" size={16} /> Schedule in Live Sessions
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {days.map((d) => (
              <div key={d}>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#5C716C]">{d}</p>
                <ul className="space-y-2">
                  {list
                    .filter((s) => s.day === d)
                    .map((s) => {
                      const fill = s.capacity > 0 ? Math.min(100, Math.round((s.enrolled / s.capacity) * 100)) : 0;
                      return (
                        <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[#EEF3F1] p-3 hover:bg-[#FAFCFB]">
                          <span className="w-[120px] shrink-0 text-[13px] font-semibold tabular-nums text-brand-ink">{s.time}</span>
                          <div className="min-w-[200px] flex-1">
                            <p className="text-[13.5px] font-semibold text-brand-ink">{s.title}</p>
                            <p className="text-[12px] text-[#6b807b]">
                              {s.kind} · {s.host} · {s.room}
                            </p>
                          </div>
                          <div className="w-[150px]">
                            <div className="flex justify-between text-[11.5px] text-[#5C716C]">
                              <span>Seats</span>
                              <span className="tabular-nums text-brand-ink">
                                {s.enrolled}/{s.capacity}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#D7F0EB]">
                              <div className="h-full rounded-full bg-[#0E937E]" style={{ width: `${fill}%` }} />
                            </div>
                          </div>
                          <StatusBadge tone={TONE[s.status]}>{s.status}</StatusBadge>
                          {s.status !== "Done" && (
                            <button
                              onClick={() => show(s.status === "Live" ? `Joining ${s.room} as moderator…` : `Reminder sent to ${s.enrolled} attendees`)}
                              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${
                                s.status === "Live" ? "bg-brand-deep text-white hover:bg-brand-teal" : "border border-[#E2ECE9] text-[#41564f] hover:border-brand-teal"
                              }`}
                            >
                              {s.status === "Live" ? "Join" : "Remind"}
                            </button>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast msg={toast} />
    </AdminShell>
  );
}
