"use client";

import { useState } from "react";
import { SESSIONS, type Session } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Card, Figure, PageHeader, Segmented, StatusBadge, Toast, useToast, type Tone } from "@/components/admin/ui";

const TONE: Record<Session["status"], Tone> = { Live: "info", Upcoming: "warning", Done: "good" };
type K = "All" | Session["kind"];

export default function SchedulePage() {
  const [kind, setKind] = useState<K>("All");
  const [toast, show] = useToast();
  const list = SESSIONS.filter((s) => kind === "All" || s.kind === kind);
  const days = Array.from(new Set(list.map((s) => s.day)));
  const seats = SESSIONS.reduce((a, s) => a + s.capacity, 0);
  const booked = SESSIONS.reduce((a, s) => a + s.enrolled, 0);

  return (
    <AdminShell>
      <PageHeader title="Schedule" sub="Live classes, webinars, workshops and offline sessions · this week" />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Sessions this week" value={String(SESSIONS.length)} sub={`${SESSIONS.filter((s) => s.status === "Live").length} live right now`} icon="calendar" />
        <Figure label="Seats booked" value={booked.toLocaleString("en-IN")} meter={(booked / seats) * 100} sub={`${Math.round((booked / seats) * 100)}% of ${seats.toLocaleString("en-IN")} seats`} icon="users" />
        <Figure label="Hosts" value={String(new Set(SESSIONS.map((s) => s.host)).size)} sub="Faculty scheduled" icon="lessons" />
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
        <div className="space-y-6">
          {days.map((d) => (
            <div key={d}>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#5C716C]">{d}</p>
              <ul className="space-y-2">
                {list
                  .filter((s) => s.day === d)
                  .map((s) => {
                    const fill = Math.round((s.enrolled / s.capacity) * 100);
                    return (
                      <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[#EEF3F1] p-3 hover:bg-[#FAFCFB]">
                        <span className="w-[104px] shrink-0 text-[13px] font-semibold tabular-nums text-brand-ink">{s.time}</span>
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
      </Card>
      <Toast msg={toast} />
    </AdminShell>
  );
}
