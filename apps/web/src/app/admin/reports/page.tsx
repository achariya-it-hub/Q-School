"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSE_STATS, STAGES, inr } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Figure, PageHeader, Segmented, StatusBadge, Td, Th } from "@/components/admin/ui";
import { AreaTrend, HBars, ViewToggle } from "@/components/admin/charts";
import { useFinance } from "@/components/admin/finance";
import { downloadCsv, useConsole } from "@/components/admin/store";
import type { CrmLead } from "@/components/admin/crm";
import { lessonCount, totalMinutes, type Course } from "@/lib/courses/types";
import { KIND_LABEL, phase, type LiveSession } from "@/lib/live/types";

type Tab = "overview" | "admissions" | "finance" | "courses" | "live";
type Period = "7" | "30" | "90" | "365" | "all";
const PERIOD_LABEL: Record<Period, string> = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days", "365": "Last 12 months", all: "All time" };

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const group = <T,>(list: T[], key: (x: T) => string) => {
  const m = new Map<string, T[]>();
  for (const x of list) {
    const k = key(x) || "Unknown";
    m.set(k, [...(m.get(k) ?? []), x]);
  }
  return Array.from(m, ([k, v]) => ({ k, v })).sort((a, b) => b.v.length - a.v.length);
};
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (k: string) => new Date(`${k}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [period, setPeriod] = useState<Period>("30");
  const [table, setTable] = useState(false);
  const [leads, setLeads] = useState<CrmLead[] | null>(null);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [live, setLive] = useState<LiveSession[] | null>(null);
  const fin = useFinance();
  const expenses = useConsole((s) => s.expenses);

  useEffect(() => {
    const get = (u: string) => fetch(u, { cache: "no-store" }).then((r) => r.json());
    get("/api/crm/leads").then((d) => setLeads(d.leads ?? [])).catch(() => setLeads([]));
    get("/api/admin/courses").then((d) => setCourses(d.courses ?? [])).catch(() => setCourses([]));
    get("/api/admin/live").then((d) => setLive(d.sessions ?? [])).catch(() => setLive([]));
  }, []);

  const since = period === "all" ? 0 : Date.now() - Number(period) * 86400000;
  const inRange = (iso?: string | null) => !!iso && Date.parse(iso) >= since && Date.parse(iso) <= Date.now() + 86400000;

  const L = useMemo(() => (leads ?? []).filter((l) => inRange(l.createdAt)), [leads, since]); // eslint-disable-line react-hooks/exhaustive-deps
  const P = useMemo(() => fin.payments.filter((p) => p.status === "Success" && inRange(p.date)), [fin.payments, since]); // eslint-disable-line react-hooks/exhaustive-deps
  const E = useMemo(() => expenses.filter((e) => inRange(e.date)), [expenses, since]); // eslint-disable-line react-hooks/exhaustive-deps
  // sessions that started in the period, plus everything still upcoming
  const S = useMemo(() => (live ?? []).filter((s) => Date.parse(s.startsAt) >= since), [live, since]);

  const admitted = L.filter((l) => l.stage === "Admitted").length;
  const collected = P.reduce((a, p) => a + p.amount, 0);
  const spent = E.reduce((a, e) => a + e.amount, 0);
  const regs = S.reduce((a, s) => a + s.registrations.length, 0);
  const joined = S.reduce((a, s) => a + s.registrations.filter((r) => r.joinedAt).length, 0);

  // collections by month (last 12 months, independent of period)
  const trend = useMemo(() => {
    const m = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) m.set(new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7), 0);
    for (const p of fin.payments) if (p.status === "Success" && m.has(monthKey(p.date))) m.set(monthKey(p.date), (m.get(monthKey(p.date)) ?? 0) + p.amount);
    return Array.from(m, ([k, v]) => ({ month: monthLabel(k), value: v }));
  }, [fin.payments]);

  const loading = !leads || !courses || !live;

  const exportCurrent = () => {
    const tag = `${tab}-${period === "all" ? "all-time" : `last-${period}-days`}.csv`;
    if (tab === "admissions" || tab === "overview")
      downloadCsv(`leads-${tag}`, ["Created", "Name", "Phone", "Source", "Interest", "Stage", "Owner", "Value"], L.map((l) => [l.createdAt.slice(0, 10), l.name, l.phone, l.source, l.interest, l.stage, l.owner, l.value]));
    else if (tab === "finance") downloadCsv(`payments-${tag}`, ["Date", "Receipt", "Student", "Item", "Method", "Amount"], P.map((p) => [p.date, p.receiptNo ?? "", p.student, p.item, p.method, p.amount]));
    else if (tab === "courses")
      downloadCsv(
        `courses.csv`,
        ["Course", "Status", "Category", "Sections", "Lessons", "Content (h)", "Learners", "Price", "Revenue"],
        (courses ?? []).map((c) => [c.title, c.status, c.category, c.curriculum.length, lessonCount(c) || c.lessons, Math.round(totalMinutes(c) / 6) / 10 || c.durationHours, c.learners, c.price, COURSE_STATS[c.title]?.revenue ?? 0]),
      );
    else
      downloadCsv(
        `live-sessions-${tag}`,
        ["Date", "Type", "Title", "Host", "Status", "Registered", "Joined", "Show-up %", "Peak in room"],
        S.map((s) => [s.startsAt.slice(0, 10), KIND_LABEL[s.kind], s.title, s.host, phase(s), s.registrations.length, s.registrations.filter((r) => r.joinedAt).length, pct(s.registrations.filter((r) => r.joinedAt).length, s.registrations.length), s.peakAttendance]),
      );
  };

  return (
    <AdminShell>
      <PageHeader title="Reports" sub={`Admissions, finance, courses and live sessions · ${PERIOD_LABEL[period]}`}>
        <Segmented
          label="Period"
          value={period}
          onChange={setPeriod}
          options={(["7", "30", "90", "365", "all"] as Period[]).map((p) => ({ value: p, label: p === "all" ? "All" : p === "365" ? "12M" : `${p}D` }))}
        />
        <Btn variant="ghost" icon="download" onClick={exportCurrent} disabled={loading}>
          Export CSV
        </Btn>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Report"
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "admissions", label: "Admissions" },
            { value: "finance", label: "Finance" },
            { value: "courses", label: "Courses" },
            { value: "live", label: "Live sessions" },
          ]}
        />
        <ViewToggle table={table} onChange={setTable} />
      </div>

      {loading ? (
        <p className="p-4 text-sm text-[#6b807b]">Loading reports…</p>
      ) : tab === "overview" ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Figure label="New leads" value={L.length.toLocaleString("en-IN")} sub={`${admitted} admitted · ${pct(admitted, L.length)}% conversion`} icon="kanban" />
            <Figure label="Fees collected" value={inr(collected, true)} sub={`${P.length} payments`} icon="rupee" />
            <Figure label="Outstanding now" value={inr(fin.outstanding, true)} sub={`${inr(fin.overdue, true)} overdue`} meter={pct(fin.collected, fin.billed)} icon="clock" />
            <Figure label="Live registrations" value={regs.toLocaleString("en-IN")} sub={`${pct(joined, regs)}% showed up · ${S.length} sessions`} icon="webinar" />
          </section>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card title="Fees collected · last 12 months">
              <AreaTrend data={trend} table={table} valueLabel="Collected" />
            </Card>
            <Card title="Where leads come from">
              <HBars table={table} valueCol="Leads" data={group(L, (l) => l.source).map((g) => ({ label: g.k, value: g.v.length }))} />
              {!L.length && <Empty />}
            </Card>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card title="Net cash in period">
              <p className={`text-[28px] font-semibold ${collected - spent >= 0 ? "text-brand-ink" : "text-[#B42E2E]"}`}>{collected - spent < 0 ? "−" : ""}{inr(Math.abs(collected - spent), true)}</p>
              <p className="mt-1 text-[12.5px] text-[#6b807b]">
                {inr(collected, true)} collected − {inr(spent, true)} expenses
              </p>
            </Card>
            <Card title="Courses">
              <p className="text-[28px] font-semibold text-brand-ink">{(courses ?? []).filter((c) => c.status === "published").length}</p>
              <p className="mt-1 text-[12.5px] text-[#6b807b]">
                published · {(courses ?? []).filter((c) => c.status !== "published").length} drafts · {(courses ?? []).reduce((a, c) => a + (lessonCount(c) || 0), 0)} lessons built
              </p>
            </Card>
            <Card title="Pipeline value">
              <p className="text-[28px] font-semibold text-brand-ink">{inr(L.filter((l) => l.stage !== "Dropped" && l.stage !== "Admitted").reduce((a, l) => a + (l.value || 0), 0), true)}</p>
              <p className="mt-1 text-[12.5px] text-[#6b807b]">expected fees from open leads in this period</p>
            </Card>
          </div>
        </>
      ) : tab === "admissions" ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Figure label="New leads" value={String(L.length)} icon="kanban" />
            <Figure label="Admitted" value={String(admitted)} sub={`${pct(admitted, L.length)}% of leads`} icon="check" />
            <Figure label="Demo stage or later" value={String(L.filter((l) => ["Demo", "Negotiation", "Admitted"].includes(l.stage)).length)} icon="calendar" />
            <Figure label="Dropped" value={String(L.filter((l) => l.stage === "Dropped").length)} icon="x" />
          </section>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card title="Pipeline by stage">
              {(() => {
                const data = STAGES.map((st) => ({ label: st, value: L.filter((l) => l.stage === st).length }));
                return <HBars table={table} valueCol="Leads" data={data} note={(i) => (i === 0 || !L.length ? null : `${pct(data[i].value, L.length)}%`)} />;
              })()}
            </Card>
            <Card title="Leads by owner">
              <HBars table={table} valueCol="Leads" data={group(L, (l) => l.owner).map((g) => ({ label: g.k, value: g.v.length }))} note={(i) => {
                const g = group(L, (l) => l.owner)[i];
                return g ? `${g.v.filter((l) => l.stage === "Admitted").length} admitted` : null;
              }} />
              {!L.length && <Empty />}
            </Card>
          </div>
          <Card title="Source performance" className="mt-4">
            <DataGrid minWidth={640}>
              <thead>
                <tr className="border-b border-[#EEF3F1]">
                  <Th>Source</Th>
                  <Th right>Leads</Th>
                  <Th right>Admitted</Th>
                  <Th right>Conversion</Th>
                  <Th right>Open pipeline</Th>
                </tr>
              </thead>
              <tbody>
                {group(L, (l) => l.source).map(({ k, v }) => (
                  <tr key={k} className="border-b border-[#F4F7F6]">
                    <Td className="font-semibold text-brand-ink">{k}</Td>
                    <Td right>{v.length}</Td>
                    <Td right>{v.filter((l) => l.stage === "Admitted").length}</Td>
                    <Td right>{pct(v.filter((l) => l.stage === "Admitted").length, v.length)}%</Td>
                    <Td right>{inr(v.filter((l) => l.stage !== "Dropped" && l.stage !== "Admitted").reduce((a, l) => a + (l.value || 0), 0), true)}</Td>
                  </tr>
                ))}
              </tbody>
            </DataGrid>
            {!L.length && <Empty />}
          </Card>
        </>
      ) : tab === "finance" ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Figure label="Collected" value={inr(collected, true)} sub={`${P.length} payments in period`} icon="rupee" />
            <Figure label="Expenses" value={inr(spent, true)} sub={`${E.length} bills in period`} icon="download" />
            <Figure label="Outstanding now" value={inr(fin.outstanding, true)} sub={`${pct(fin.collected, fin.billed)}% of billed fees collected`} meter={pct(fin.collected, fin.billed)} icon="clock" />
            <Figure label="Overdue now" value={inr(fin.overdue, true)} sub={`${fin.totals.filter((t) => t.t.overdue > 0).length} students`} icon="alert" />
          </section>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card title="Collected by method">
              <HBars table={table} valueCol="Amount" format={(v) => inr(v, true)} data={group(P, (p) => p.method).map((g) => ({ label: g.k, value: g.v.reduce((a, p) => a + p.amount, 0) })).sort((a, b) => b.value - a.value)} />
              {!P.length && <Empty />}
            </Card>
            <Card title="Collected by course">
              <HBars table={table} valueCol="Amount" format={(v) => inr(v, true)} data={group(P, (p) => p.item).map((g) => ({ label: g.k, value: g.v.reduce((a, p) => a + p.amount, 0) })).sort((a, b) => b.value - a.value).slice(0, 8)} />
              {!P.length && <Empty />}
            </Card>
            <Card title="Expenses by category">
              <HBars table={table} valueCol="Amount" format={(v) => inr(v, true)} data={group(E, (e) => e.category).map((g) => ({ label: g.k, value: g.v.reduce((a, e) => a + e.amount, 0) })).sort((a, b) => b.value - a.value)} />
              {!E.length && <Empty />}
            </Card>
          </div>
          <Card title="Largest overdue balances" className="mt-4">
            <DataGrid minWidth={620}>
              <thead>
                <tr className="border-b border-[#EEF3F1]">
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Centre</Th>
                  <Th right>Overdue</Th>
                  <Th right>Days late</Th>
                </tr>
              </thead>
              <tbody>
                {fin.totals
                  .filter((x) => x.t.overdue > 0)
                  .sort((a, b) => b.t.overdue - a.t.overdue)
                  .slice(0, 10)
                  .map(({ a, t }) => (
                    <tr key={a.id} className="border-b border-[#F4F7F6]">
                      <Td className="font-semibold text-brand-ink">{a.student}</Td>
                      <Td>{a.course}</Td>
                      <Td>{a.centre}</Td>
                      <Td right className="font-semibold text-[#B42E2E]">{inr(t.overdue)}</Td>
                      <Td right>{t.maxDaysLate}</Td>
                    </tr>
                  ))}
              </tbody>
            </DataGrid>
          </Card>
        </>
      ) : tab === "courses" ? (
        <Card title="Course catalogue">
          <DataGrid minWidth={860}>
            <thead>
              <tr className="border-b border-[#EEF3F1]">
                <Th>Course</Th>
                <Th>Status</Th>
                <Th right>Sections</Th>
                <Th right>Lessons</Th>
                <Th right>Content</Th>
                <Th right>Free previews</Th>
                <Th right>Learners</Th>
                <Th right>Revenue</Th>
              </tr>
            </thead>
            <tbody>
              {(courses ?? []).map((c) => {
                const mins = totalMinutes(c);
                return (
                  <tr key={c.id} className="border-b border-[#F4F7F6]">
                    <Td>
                      <p className="font-semibold text-brand-ink">{c.title}</p>
                      <p className="text-[11.5px] text-[#6b807b]">{c.category}</p>
                    </Td>
                    <Td>
                      <StatusBadge tone={c.status === "published" ? "good" : "neutral"}>{c.status === "published" ? "Published" : "Draft"}</StatusBadge>
                    </Td>
                    <Td right>{c.curriculum.length || "—"}</Td>
                    <Td right>{lessonCount(c) || c.lessons}</Td>
                    <Td right>{mins ? `${(mins / 60).toFixed(1)} h` : c.durationHours ? `${c.durationHours} h` : "—"}</Td>
                    <Td right>{c.curriculum.flatMap((s) => s.lessons).filter((l) => l.preview).length}</Td>
                    <Td right>{c.learners.toLocaleString("en-IN")}</Td>
                    <Td right className="font-semibold text-brand-ink">{COURSE_STATS[c.title]?.revenue ? inr(COURSE_STATS[c.title].revenue, true) : "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </DataGrid>
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Figure label="Sessions" value={String(S.length)} sub={`${S.filter((s) => phase(s) === "ended").length} held · ${S.filter((s) => phase(s) === "upcoming").length} upcoming`} icon="webinar" />
            <Figure label="Registrations" value={regs.toLocaleString("en-IN")} icon="users" />
            <Figure label="Show-up rate" value={regs ? `${pct(joined, regs)}%` : "—"} meter={pct(joined, regs)} sub={`${joined} joined the room`} icon="check" />
            <Figure label="Best attendance" value={String(Math.max(0, ...S.map((s) => s.peakAttendance)))} sub="peak people in one room" icon="live" />
          </section>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.6fr]">
            <Card title="Registrations by type">
              <HBars table={table} valueCol="Registrations" data={(["webinar", "workshop", "class"] as const).map((k) => ({ label: KIND_LABEL[k], value: S.filter((s) => s.kind === k).reduce((a, s) => a + s.registrations.length, 0) }))} />
            </Card>
            <Card title="Sessions">
              <DataGrid minWidth={620}>
                <thead>
                  <tr className="border-b border-[#EEF3F1]">
                    <Th>Session</Th>
                    <Th right>Registered</Th>
                    <Th right>Joined</Th>
                    <Th right>Show-up</Th>
                    <Th right>Peak</Th>
                  </tr>
                </thead>
                <tbody>
                  {S.map((s) => {
                    const j = s.registrations.filter((r) => r.joinedAt).length;
                    return (
                      <tr key={s.id} className="border-b border-[#F4F7F6]">
                        <Td>
                          <p className="font-semibold text-brand-ink">{s.title}</p>
                          <p className="text-[11.5px] text-[#6b807b]">
                            {KIND_LABEL[s.kind]} · {new Date(s.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </Td>
                        <Td right>{s.registrations.length}</Td>
                        <Td right>{j}</Td>
                        <Td right>{s.registrations.length ? `${pct(j, s.registrations.length)}%` : "—"}</Td>
                        <Td right>{s.peakAttendance || "—"}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </DataGrid>
              {!S.length && <Empty text="No live sessions in this period." />}
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Empty({ text = "No data in this period." }: { text?: string }) {
  return <p className="py-4 text-center text-[12.5px] text-[#8aa39c]">{text}</p>;
}
