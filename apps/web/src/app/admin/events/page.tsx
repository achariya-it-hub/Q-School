"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Drawer, Field, Figure, Modal, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { CrmEvent, EventAttendee, EventType, EventWithStats, NewAttendeeInput, NewEventInput } from "@/lib/crm/events-store";

const TYPE_LABEL: Record<EventType, { label: string; cls: string }> = {
  bmit: { label: "BMIT Assessment", cls: "bg-[#E3F4F0] text-brand-deep" },
  workshop: { label: "Workshop", cls: "bg-[#EEF1FB] text-[#3B4CA8]" },
  seminar: { label: "Seminar", cls: "bg-[#F3E8FF] text-[#6B21A8]" },
  webinar: { label: "Webinar", cls: "bg-[#E0F2FE] text-[#0369A1]" },
  open_day: { label: "Open Day", cls: "bg-[#FEF3C7] text-[#92400E]" },
  competition: { label: "Competition", cls: "bg-[#FCE7F3] text-[#9D174D]" },
  other: { label: "Event", cls: "bg-[#F1F5F4] text-[#41564F]" },
};

const STATUS_TONE = {
  ongoing: "good",
  upcoming: "neutral",
  completed: "info",
  cancelled: "critical",
} as const;

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [attendeeModalOpen, setAttendeeModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "attended" | "pending">("all");
  const [toast, show] = useToast();

  const loadEvents = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load events");
      const d = await res.json();
      const list: EventWithStats[] = d.events ?? [];
      setEvents(list);
      setSelectedId((prev) => (prev && list.some((e) => e.id === prev) ? prev : (list[0]?.id ?? null)));
    } catch {
      show("Could not load events");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [show]);

  const loadAttendees = useCallback(async (evId: string) => {
    if (!evId) {
      setAttendees([]);
      return;
    }
    setLoadingAttendees(true);
    try {
      const res = await fetch(`/api/admin/events/${evId}/attendees`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load attendees");
      const d = await res.json();
      setAttendees(d.attendees ?? []);
    } catch {
      show("Could not load attendees");
    } finally {
      setLoadingAttendees(false);
    }
  }, [show]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (selectedId) {
      loadAttendees(selectedId);
    } else {
      setAttendees([]);
    }
  }, [selectedId, loadAttendees]);

  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedId) ?? events[0] ?? null;
  }, [events, selectedId]);

  // Overall totals across all events
  const overall = useMemo(() => {
    const totalRegs = events.reduce((acc, e) => acc + (e.stats?.totalRegistrations || 0), 0);
    const totalAttended = events.reduce((acc, e) => acc + (e.stats?.totalAttended || 0), 0);
    const overallTurnout = totalRegs ? Math.round((totalAttended / totalRegs) * 100) : 0;
    const bmitRegs = events.reduce((acc, e) => acc + (e.stats?.bmitCount || 0), 0);
    return { totalRegs, totalAttended, overallTurnout, bmitRegs };
  }, [events]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      if (attendanceFilter === "attended" && !a.attended) return false;
      if (attendanceFilter === "pending" && a.attended) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const str = `${a.parentName} ${a.phone} ${a.email ?? ""} ${a.childName ?? ""} ${a.school ?? ""} ${a.city ?? ""}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [attendees, search, attendanceFilter]);

  const handleToggleAttendance = async (attendee: EventAttendee) => {
    const nextState = !attendee.attended;
    try {
      const res = await fetch(`/api/admin/events/${currentEvent?.id}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId: attendee.id, attended: nextState }),
      });
      if (!res.ok) throw new Error();
      show(nextState ? `Marked ${attendee.parentName} as attended (Footfall +1)` : `Attendance unmarked`);
      // Update local state
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendee.id ? { ...a, attended: nextState, status: nextState ? "attended" : "registered" } : a))
      );
      // Reload event stats without full page spinner
      loadEvents(false);
    } catch {
      show("Could not update attendance status");
    }
  };

  const handleDeleteAttendee = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this event's attendee list?`)) return;
    try {
      const res = await fetch(`/api/admin/events/${currentEvent?.id}/attendees?attendeeId=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      show(`Removed ${name}`);
      setAttendees((prev) => prev.filter((a) => a.id !== id));
      loadEvents(false);
    } catch {
      show("Could not remove attendee");
    }
  };

  const handleExportCsv = () => {
    if (!currentEvent || !attendees.length) {
      show("No attendees to export");
      return;
    }
    const headers = [
      "Parent Name",
      "Phone",
      "Email",
      "City",
      "Profession",
      "Child Name",
      "Age",
      "Grade",
      "School",
      "Attended (Footfall)",
      "Attended Time",
      "BMIT Interest",
      "Workshop Interest",
      "Source",
      "Sales Ref",
      "Registered At",
    ];
    const rows = attendees.map((a) => [
      `"${a.parentName.replace(/"/g, '""')}"`,
      `"'${a.phone}"`,
      `"${(a.email || "").replace(/"/g, '""')}"`,
      `"${(a.city || "").replace(/"/g, '""')}"`,
      `"${(a.profession || "").replace(/"/g, '""')}"`,
      `"${(a.childName || "").replace(/"/g, '""')}"`,
      `"${a.childAge || ""}"`,
      `"${(a.grade || "").replace(/"/g, '""')}"`,
      `"${(a.school || "").replace(/"/g, '""')}"`,
      a.attended ? "Yes" : "No",
      a.attendedAt ? `"${new Date(a.attendedAt).toLocaleString("en-IN")}"` : '""',
      a.bmitInterest ? "Yes" : "No",
      a.workshopInterest ? "Yes" : "No",
      `"${(a.source || "").replace(/"/g, '""')}"`,
      `"${(a.salesPerson || "").replace(/"/g, '""')}"`,
      `"${new Date(a.createdAt).toLocaleString("en-IN")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${currentEvent.code}-footfall-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("CSV report downloaded");
  };

  const copyRegistrationLink = () => {
    if (!currentEvent) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/events/register?event=${currentEvent.code}`;
    navigator.clipboard.writeText(url);
    show(`Registration link copied: ${url}`);
  };

  return (
    <AdminShell>
      <PageHeader
        title="Events"
        sub="Track BMIT assessments, parenting workshops, campus expos, and attendee footfall"
      >
        <Btn variant="primary" icon="plus" onClick={() => setEventModalOpen(true)}>
          Create Event
        </Btn>
        <Btn variant="ghost" onClick={loadEvents} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Btn>
      </PageHeader>

      {/* Top figures */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure label="Total Events" value={events.length.toString()} icon="calendar" />
        <Figure label="Total Registrations" value={overall.totalRegs.toLocaleString("en-IN")} icon="users" />
        <Figure label="Actual Footfall" value={overall.totalAttended.toLocaleString("en-IN")} icon="checkCircle" />
        <Figure
          label="Overall Turnout Rate"
          value={overall.totalRegs ? `${overall.overallTurnout}%` : "—"}
          icon="chart"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[330px_1fr]">
        {/* Left Column: Events Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#7B8E89]">
              Events List ({events.length})
            </span>
            <button
              onClick={() => setEventModalOpen(true)}
              className="text-[12px] font-semibold text-brand-teal hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2.5">
            {events.map((ev) => {
              const isSelected = ev.id === currentEvent?.id;
              const typeMeta = TYPE_LABEL[ev.type] || TYPE_LABEL.other;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedId(ev.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-brand-teal bg-white shadow-md ring-2 ring-brand-teal/20"
                      : "border-[#E2ECE9] bg-white hover:border-[#CADBD5]"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${typeMeta.cls}`}>
                      {typeMeta.label}
                    </span>
                    <StatusBadge tone={STATUS_TONE[ev.status] ?? "neutral"}>
                      {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                    </StatusBadge>
                  </div>

                  <h3 className="line-clamp-2 text-[14px] font-bold text-brand-ink leading-snug">
                    {ev.name}
                  </h3>

                  <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-[#6b807b]">
                    <Icon name="calendar" size={13} className="shrink-0 text-brand-teal" />
                    <span>{ev.startDate}</span>
                    {ev.time && <span>· {ev.time}</span>}
                  </div>

                  {ev.venue && (
                    <div className="mt-1 flex items-center gap-1.5 truncate text-[11.5px] text-[#6b807b]">
                      <Icon name="building" size={13} className="shrink-0 text-brand-teal" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  )}

                  {/* Footfall Progress */}
                  <div className="mt-3 border-t border-[#F1F5F4] pt-2.5">
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="font-semibold text-brand-ink">
                        Footfall: <b className="text-brand-deep">{ev.stats?.totalAttended || 0}</b> / {ev.stats?.totalRegistrations || 0}
                      </span>
                      <span className="font-semibold text-brand-teal">
                        {ev.stats?.turnoutPct || 0}% turnout
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E5EFEA]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-teal to-[#14a68f]"
                        style={{ width: `${Math.min(100, ev.stats?.turnoutPct || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Event Detail & Footfall Roster */}
        {currentEvent ? (
          <div className="space-y-4">
            {/* Event Header Banner */}
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_LABEL[currentEvent.type]?.cls || ""}`}>
                      {TYPE_LABEL[currentEvent.type]?.label}
                    </span>
                    <span className="rounded-md bg-[#F1F5F4] px-2 py-0.5 font-mono text-[11px] font-medium text-[#41564F]">
                      code: {currentEvent.code}
                    </span>
                    <StatusBadge tone={STATUS_TONE[currentEvent.status] ?? "neutral"}>
                      {currentEvent.status}
                    </StatusBadge>
                  </div>

                  <h2 className="mt-2 text-[20px] font-bold text-brand-ink">
                    {currentEvent.name}
                  </h2>

                  {currentEvent.description && (
                    <p className="mt-1 text-[13px] text-[#55736C]">
                      {currentEvent.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-[#41564f]">
                    <span className="flex items-center gap-1.5">
                      <Icon name="calendar" size={14} className="text-brand-teal" />
                      <b>Date:</b> {currentEvent.startDate} {currentEvent.time ? `(${currentEvent.time})` : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="building" size={14} className="text-brand-teal" />
                      <b>Mode:</b> {currentEvent.mode} · {currentEvent.venue || "Campus / Online"}
                    </span>
                    {currentEvent.targetAudience && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="users" size={14} className="text-brand-teal" />
                        <b>Audience:</b> {currentEvent.targetAudience}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Btn variant="ghost" icon="download" onClick={handleExportCsv}>
                    Export CSV
                  </Btn>
                  <Btn variant="primary" icon="plus" onClick={() => setAttendeeModalOpen(true)}>
                    Add Attendee / Walk-in
                  </Btn>
                </div>
              </div>

              {/* Event Specific Footfall KPI Cards */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#D7EAE4] bg-[#F4FAF8] p-3 text-center">
                  <p className="text-[11.5px] font-medium text-[#55736C]">Total Registrations</p>
                  <p className="mt-0.5 text-[22px] font-bold text-brand-ink">
                    {currentEvent.stats?.totalRegistrations || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-[#C5E9DE] bg-[#EAF7EA] p-3 text-center">
                  <p className="text-[11.5px] font-medium text-[#0A7F0A]">Actual Footfall (Attended)</p>
                  <p className="mt-0.5 text-[22px] font-bold text-[#0A7F0A]">
                    {currentEvent.stats?.totalAttended || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-[#D7EAE4] bg-[#F4FAF8] p-3 text-center">
                  <p className="text-[11.5px] font-medium text-[#55736C]">Turnout Rate</p>
                  <p className="mt-0.5 text-[22px] font-bold text-brand-teal">
                    {currentEvent.stats?.turnoutPct || 0}%
                  </p>
                </div>
                <div className="rounded-xl border border-[#D7EAE4] bg-[#F4FAF8] p-3 text-center">
                  <p className="text-[11.5px] font-medium text-[#55736C]">Expected / Pending</p>
                  <p className="mt-0.5 text-[22px] font-bold text-[#8A5A00]">
                    {(currentEvent.stats?.totalRegistrations || 0) - (currentEvent.stats?.totalAttended || 0)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Footfall Attendees List Card */}
            <Card
              title={`Attendee Roster & Footfall (${filteredAttendees.length})`}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search parent, child, school…" />
                  <div className="flex items-center gap-1 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-1 text-[12px]">
                    {(["all", "attended", "pending"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAttendanceFilter(mode)}
                        className={`rounded-lg px-2.5 py-1 font-medium transition ${
                          attendanceFilter === mode
                            ? "bg-white text-brand-deep shadow-xs font-semibold"
                            : "text-[#7B8E89] hover:text-brand-ink"
                        }`}
                      >
                        {mode === "all" ? "All" : mode === "attended" ? "Attended (Footfall)" : "Pending"}
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              {loadingAttendees ? (
                <div className="py-12 text-center text-sm text-[#7B8E89]">Loading attendees…</div>
              ) : filteredAttendees.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CFDFDA] p-8 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F4F0] text-brand-teal">
                    <Icon name="users" size={20} />
                  </div>
                  <h4 className="text-[14px] font-semibold text-brand-ink">No attendees found</h4>
                  <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-[#6b807b]">
                    {search ? "No attendees match your search." : "No one has registered for this event yet."}
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Btn variant="primary" icon="plus" onClick={() => setAttendeeModalOpen(true)}>
                      Add First Attendee / Walk-in
                    </Btn>
                  </div>
                </div>
              ) : (
                <DataGrid>
                  <thead>
                    <tr>
                      <Th>Footfall Check-in</Th>
                      <Th>Parent & Contact</Th>
                      <Th>Child Details</Th>
                      <Th>Interests</Th>
                      <Th>Source / Date</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((a) => (
                      <tr key={a.id} className="transition hover:bg-[#F9FCFA]">
                        <Td>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(a)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${
                              a.attended
                                ? "bg-[#EAF7EA] text-[#0A7F0A] ring-1 ring-[#A2DCA2] hover:bg-[#DCF3DC]"
                                : "border border-[#D7EAE4] bg-white text-[#55736C] hover:border-brand-teal hover:text-brand-deep"
                            }`}
                          >
                            <Icon name={a.attended ? "checkCircle" : "check"} size={14} />
                            <span>{a.attended ? "Attended ✓" : "Check-in"}</span>
                          </button>
                          {a.attendedAt && (
                            <span className="block mt-0.5 text-[10.5px] text-[#7B8E89]">
                              {new Date(a.attendedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          )}
                        </Td>

                        <Td>
                          <p className="font-semibold text-brand-ink">{a.parentName}</p>
                          <div className="flex items-center gap-1.5 text-[12px] text-[#6b807b]">
                            <a
                              href={`https://wa.me/91${a.phone.replace(/\D/g, "").slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-brand-teal hover:underline"
                            >
                              {a.phone}
                            </a>
                            {a.city && <span>· {a.city}</span>}
                          </div>
                          {a.profession && <p className="text-[11.5px] text-[#7B8E89]">{a.profession}</p>}
                        </Td>

                        <Td>
                          {a.childName ? (
                            <>
                              <p className="font-medium text-brand-ink">
                                {a.childName} {a.childAge ? `(${a.childAge} yrs)` : ""}
                              </p>
                              <p className="text-[12px] text-[#6b807b]">
                                {a.grade ? `Grade: ${a.grade}` : ""} {a.school ? `· ${a.school}` : ""}
                              </p>
                            </>
                          ) : (
                            <span className="text-[#9CA3AF]">—</span>
                          )}
                        </Td>

                        <Td>
                          <div className="flex flex-wrap gap-1">
                            {a.bmitInterest && (
                              <span className="rounded bg-[#E3F4F0] px-1.5 py-0.5 text-[11px] font-medium text-brand-deep">
                                BMIT
                              </span>
                            )}
                            {a.workshopInterest && (
                              <span className="rounded bg-[#EEF1FB] px-1.5 py-0.5 text-[11px] font-medium text-[#3B4CA8]">
                                Workshop
                              </span>
                            )}
                          </div>
                        </Td>

                        <Td>
                          <p className="text-[12px] text-brand-ink">{a.source || "Web Form"}</p>
                          <p className="text-[11px] text-[#7B8E89]">
                            {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                          {a.salesPerson && (
                            <span className="rounded bg-[#FFF6E0] px-1.5 py-0.2 text-[10.5px] font-semibold text-[#8A5A00]">
                              Ref: {a.salesPerson}
                            </span>
                          )}
                        </Td>

                        <Td>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttendee(a.id, a.parentName)}
                            className="rounded p-1 text-[#9CA3AF] transition hover:bg-[#FDEFE8] hover:text-[#B42E2E]"
                            title="Delete attendee"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataGrid>
              )}
            </Card>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#CFDFDA] p-12 text-center bg-white">
            <h3 className="text-base font-semibold text-brand-ink">No Event Selected</h3>
            <p className="mt-1 text-sm text-[#7B8E89]">Create an event or pick one from the left to view footfall.</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onCreated={(newEvent) => {
          loadEvents();
          setSelectedId(newEvent.id);
          show(`Event "${newEvent.name}" created!`);
        }}
      />

      {/* Add Attendee Modal */}
      {currentEvent && (
        <AddAttendeeModal
          open={attendeeModalOpen}
          event={currentEvent}
          onClose={() => setAttendeeModalOpen(false)}
          onAdded={() => {
            loadAttendees(currentEvent.id);
            loadEvents();
            show("Attendee added successfully!");
          }}
        />
      )}

      <Toast msg={toast} />
    </AdminShell>
  );
}

/* ───────── Create Event Modal ───────── */

function CreateEventModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (e: CrmEvent) => void;
}) {
  const [f, setF] = useState<NewEventInput>({
    name: "",
    code: "",
    type: "bmit",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    time: "",
    mode: "hybrid",
    venue: "",
    targetAudience: "",
    capacity: 100,
    status: "upcoming",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Event name is required");
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not create event");
      onCreated(d.event);
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Event" ratio169>
      <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
        {err && <div className="mb-3 rounded-xl bg-[#FCEDED] p-2.5 text-[13px] text-[#B42E2E]">{err}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
          {/* Left Column: Event Core Info & Timing */}
          <div className="space-y-3">
            <Field label="Event Name *">
              <input
                className={inputCls}
                placeholder="e.g. Brain Mapping Intelligence Test Camp"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Event Type">
                <select
                  className={inputCls}
                  value={f.type}
                  onChange={(e) => setF({ ...f, type: e.target.value as EventType })}
                >
                  <option value="bmit">BMIT Assessment</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="open_day">Open Day</option>
                  <option value="competition">Competition</option>
                  <option value="other">Other Event</option>
                </select>
              </Field>

              <Field label="Code / Slug">
                <input
                  className={inputCls}
                  placeholder="e.g. bmit-oct26"
                  value={f.code}
                  onChange={(e) => setF({ ...f, code: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input
                  type="date"
                  className={inputCls}
                  value={f.startDate}
                  onChange={(e) => setF({ ...f, startDate: e.target.value })}
                  required
                />
              </Field>

              <Field label="Time">
                <input
                  className={inputCls}
                  placeholder="e.g. 10:00 AM - 1:00 PM"
                  value={f.time}
                  onChange={(e) => setF({ ...f, time: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Mode">
                <select
                  className={inputCls}
                  value={f.mode}
                  onChange={(e) => setF({ ...f, mode: e.target.value as any })}
                >
                  <option value="offline">In-Person Centre</option>
                  <option value="online">Online / Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>

              <Field label="Target Capacity">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="e.g. 150"
                  value={f.capacity ?? ""}
                  onChange={(e) => setF({ ...f, capacity: Number(e.target.value) || undefined })}
                />
              </Field>
            </div>
          </div>

          {/* Right Column: Logistics, Audience & Description */}
          <div className="space-y-3">
            <Field label="Venue / Platform">
              <input
                className={inputCls}
                placeholder="e.g. Puducherry Learning Centre / Zoom"
                value={f.venue}
                onChange={(e) => setF({ ...f, venue: e.target.value })}
              />
            </Field>

            <Field label="Target Audience">
              <input
                className={inputCls}
                placeholder="e.g. Parents of Grades 1-10 students"
                value={f.targetAudience}
                onChange={(e) => setF({ ...f, targetAudience: e.target.value })}
              />
            </Field>

            <Field label="Description">
              <textarea
                className="w-full rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-2.5 text-sm outline-none focus:border-brand-teal resize-none"
                rows={3}
                placeholder="Brief description of the event…"
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
              />
            </Field>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between border-t border-[#EEF3F1] pt-3 mt-4">
          <span className="text-[12px] text-[#7B8E89] truncate max-w-[50%]">
            {f.name ? `Creating "${f.name}"` : "Enter details to create event and generate registration links"}
          </span>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Btn>
            <Btn variant="primary" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create Event"}
            </Btn>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* ───────── Add Attendee / Walk-in Modal ───────── */

function AddAttendeeModal({
  open,
  event,
  onClose,
  onAdded,
}: {
  open: boolean;
  event: CrmEvent;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [f, setF] = useState<NewAttendeeInput>({
    parentName: "",
    phone: "",
    email: "",
    city: "",
    profession: "",
    childName: "",
    childAge: "",
    grade: "",
    school: "",
    attended: false,
    bmitInterest: event.type === "bmit",
    workshopInterest: event.type === "workshop",
    source: "Walk-in Registration",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.parentName.trim() || !f.phone.trim()) {
      return setErr("Parent name and phone number are required");
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/events/${event.id}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not add attendee");
      onAdded();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Register Attendee · ${event.name}`} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <div className="rounded-xl bg-[#FCEDED] p-3 text-[13px] text-[#B42E2E]">{err}</div>}

        <div className="rounded-xl border border-[#C5E9DE] bg-[#EAF7EA] p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={f.attended}
              onChange={(e) => setF({ ...f, attended: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-teal"
            />
            <span className="text-[13px] font-bold text-[#0A7F0A]">
              Mark as Attended (Walk-in / Immediate Footfall Check-in)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Parent Name *">
            <input
              className={inputCls}
              placeholder="e.g. Ramesh Kumar"
              value={f.parentName}
              onChange={(e) => setF({ ...f, parentName: e.target.value })}
              required
            />
          </Field>

          <Field label="Phone Number *">
            <input
              type="tel"
              className={inputCls}
              placeholder="e.g. 9876543210"
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Email ID">
            <input
              type="email"
              className={inputCls}
              placeholder="parent@example.com"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>

          <Field label="City">
            <input
              className={inputCls}
              placeholder="e.g. Puducherry"
              value={f.city}
              onChange={(e) => setF({ ...f, city: e.target.value })}
            />
          </Field>

          <Field label="Profession">
            <input
              className={inputCls}
              placeholder="e.g. Software Engineer"
              value={f.profession}
              onChange={(e) => setF({ ...f, profession: e.target.value })}
            />
          </Field>
        </div>

        <div className="border-t border-[#EEF3F1] pt-3">
          <p className="mb-2 text-[12px] font-semibold text-[#7B8E89]">Child Details</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Child Name">
              <input
                className={inputCls}
                placeholder="e.g. Aarav"
                value={f.childName}
                onChange={(e) => setF({ ...f, childName: e.target.value })}
              />
            </Field>

            <Field label="Grade">
              <input
                className={inputCls}
                placeholder="e.g. Grade 5"
                value={f.grade}
                onChange={(e) => setF({ ...f, grade: e.target.value })}
              />
            </Field>

            <Field label="School">
              <input
                className={inputCls}
                placeholder="e.g. St. Joseph's"
                value={f.school}
                onChange={(e) => setF({ ...f, school: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-[#EEF3F1] pt-3 text-[13px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={f.bmitInterest}
              onChange={(e) => setF({ ...f, bmitInterest: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-teal"
            />
            <span>Interested in Free BMIT Assessment</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={f.workshopInterest}
              onChange={(e) => setF({ ...f, workshopInterest: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-teal"
            />
            <span>Interested in 2-Hr Q-Parenting Workshop</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Btn variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant="primary" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save Attendee"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
