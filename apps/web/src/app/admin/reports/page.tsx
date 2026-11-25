"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSE_STATS, STAGES, accountLedger, admissionFunnel, centreSummary, gstSplit, inr, paymentRegister, sourceSummary, studentLedger } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Figure, PageHeader, Segmented, StatusBadge, Td, Th } from "@/components/admin/ui";
import { AreaTrend, HBars, ViewToggle } from "@/components/admin/charts";
import { useFinance } from "@/components/admin/finance";
import { downloadCsv, useConsole } from "@/components/admin/store";
import type { CrmLead } from "@/components/admin/crm";
import { lessonCount, totalMinutes, type Course } from "@/lib/courses/types";
import { KIND_LABEL, phase, type LiveSession } from "@/lib/live/types";

type Tab = "overview" | "admissions" | "students" | "finance" | "courses" | "live";
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
  const isReceived = (status: string) => status === "Success" || status === "Partly Paid";
  const P = useMemo(() => fin.payments.filter((p) => isReceived(p.status) && inRange(p.date)), [fin.payments, since]); // eslint-disable-line react-hooks/exhaustive-deps
  // students admitted in the period (each one is also a lead that reached Admitted)
  const S2 = useMemo(() => fin.students.filter((s) => inRange(s.createdAt)), [fin.students, since]); // eslint-disable-line react-hooks/exhaustive-deps
  const plans = useMemo(() => fin.accounts.filter((a) => a.id.startsWith("FA-") && inRange(a.installments[0]?.due)), [fin.accounts, since]); // eslint-disable-line react-hooks/exhaustive-deps
  const ledger = useMemo(() => [...studentLedger(S2, leads ?? []), ...accountLedger(plans)], [S2, plans, leads]);
  const register = useMemo(() => paymentRegister(fin.students, leads ?? []).filter((r) => inRange(r.date)), [fin.students, leads, since]); // eslint-disable-line react-hooks/exhaustive-deps
  const funnel = useMemo(() => admissionFunnel(L, S2), [L, S2]);
  const sources = useMemo(() => sourceSummary(L, S2, plans), [L, S2, plans]);
  const centres = useMemo(() => centreSummary(L, S2, plans), [L, S2, plans]);
  const courseOf = useMemo(() => new Map(fin.accounts.map((a) => [a.id, a.course])), [fin.accounts]);
  const invOf = useMemo(() => new Map(fin.invoices.map((i) => [`${i.accountId}#${i.instNo}`, i.id])), [fin.invoices]);
  const gst = useMemo(
    () =>
      P.reduce(
        (a, p) => {
          const g = gstSplit(p.amount);
          return { taxable: a.taxable + g.taxable, cgst: a.cgst + g.cgst, sgst: a.sgst + g.sgst, tax: a.tax + g.tax };
        },
        { taxable: 0, cgst: 0, sgst: 0, tax: 0 },
      ),
    [P],
  );
  const tone = (s: string) => (s === "Paid" || s === "Active" || s === "Success" ? "good" : s === "Partly Paid" || s === "Pending" ? "warning" : "neutral") as "good" | "warning" | "neutral";
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
    for (const p of fin.payments) if (isReceived(p.status) && m.has(monthKey(p.date))) m.set(monthKey(p.date), (m.get(monthKey(p.date)) ?? 0) + p.amount);
    return Array.from(m, ([k, v]) => ({ month: monthLabel(k), value: v }));
  }, [fin.payments]);

  const loading = !leads || !courses || !live;

  const exportCurrent = () => {
    const tag = `${tab}-${period === "all" ? "all-time" : `last-${period}-days`}.csv`;
    if (tab === "admissions" || tab === "overview")
      downloadCsv(
        `leads-${tag}`,
        ["Created", "Lead ID", "Name", "Phone", "Source", "Interest", "Centre", "Stage", "Owner", "Expected fee"],
        L.map((l) => [l.createdAt.slice(0, 10), l.id, l.name, l.phone, l.source, l.interest, l.location ?? "", l.stage, l.owner, l.value]),
      );
    else if (tab === "students")
      downloadCsv(
        `students-fee-ledger-${tag}`,
        ["Student ID", "Student", "Parent", "Phone", "Lead ID", "Source", "Owner", "Centre", "Course", "Admitted on", "Status", "Total fee", "Paid", "Balance", "Fee status", "Payments", "Last payment", "Receipts", "Invoices"],
        ledger.map((r) => [r.studentId, r.studentName, r.parentName, r.phone, r.leadId, r.source, r.owner, r.centre, r.course, r.admittedOn, r.status, r.totalFee, r.paid, r.balance, r.feeStatus, r.parts, r.lastPaymentOn, r.receipts, r.invoices]),
      );
    else if (tab === "finance")
      downloadCsv(
        `payments-register-${tag}`,
        ["Date", "Receipt", "Invoice", "Student", "Course", "Mode", "Reference", "Taxable", "CGST 9%", "SGST 9%", "Amount", "Status"],
        P.map((p) => {
          const g = gstSplit(p.amount);
          return [p.date, p.receiptNo ?? "", invOf.get(`${p.accountId}#${p.instNo}`) ?? "", p.student, courseOf.get(p.accountId) ?? p.item, p.method, p.ref, g.taxable, g.cgst, g.sgst, p.amount, p.status];
        }),
      );
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
      <PageHeader title="Reports" sub={`Enquiry → BMIT → admission → fees, receipts & invoices, courses and live sessions · ${PERIOD_LABEL[period]}`}>
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
            { value: "students", label: "Students & fees" },
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
            <Figure label="Admitted (fee paid)" value={String(admitted)} sub={`${pct(admitted, L.length)}% of leads`} icon="check" />
            <Figure label="BMIT stage or later" value={String(L.filter((l) => ["BMIT", "Negotiation", "Application", "Admitted"].includes(l.stage)).length)} sub="booked or attended BMIT" icon="calendar" />
            <Figure label="Dropped" value={String(L.filter((l) => l.stage === "Dropped").length)} icon="x" />
          </section>
          <Card title="Admissions funnel · enquiry → BMIT → admission → fee" className="mt-4">
            <HBars table={table} valueCol="Count" data={funnel.map((f) => ({ label: f.label, value: f.count }))} note={(i) => (i === 0 || !funnel[0].count ? null : `${pct(funnel[i].count, funnel[0].count)}%`)} />
            {!L.length && <Empty />}
          </Card>
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
                  <Th right>Students</Th>
                  <Th right>Fees collected</Th>
                  <Th right>Balance due</Th>
                </tr>
              </thead>
              <tbody>
                {sources.map((r) => (
                  <tr key={r.source} className="border-b border-[#F4F7F6]">
                    <Td className="font-semibold text-brand-ink">{r.source}</Td>
                    <Td right>{r.leads}</Td>
                    <Td right>{r.admitted}</Td>
                    <Td right>{pct(r.admitted, r.leads)}%</Td>
                    <Td right>{inr(r.openValue, true)}</Td>
                    <Td right>{r.students}</Td>
                    <Td right className="font-semibold text-brand-ink">{inr(r.collected, true)}</Td>
                    <Td right className={r.balance > 0 ? "text-[#B42E2E]" : ""}>{inr(r.balance, true)}</Td>
                  </tr>
                ))}
              </tbody>
            </DataGrid>
            {!L.length && <Empty />}
          </Card>
          <Card title="Centre-wise admissions & fees" className="mt-4">
            <DataGrid minWidth={720}>
              <thead>
                <tr className="border-b border-[#EEF3F1]">
                  <Th>Centre</Th>
                  <Th right>Leads</Th>
                  <Th right>Admitted</Th>
                  <Th right>Students</Th>
                  <Th right>Billed</Th>
                  <Th right>Collected</Th>
                  <Th right>Balance due</Th>
                </tr>
              </thead>
              <tbody>
                {centres.map((c) => (
                  <tr key={c.centre} className="border-b border-[#F4F7F6]">
                    <Td className="font-semibold text-brand-ink">{c.centre}</Td>
                    <Td right>{c.leads}</Td>
                    <Td right>{c.admitted}</Td>
                    <Td right>{c.students}</Td>
                    <Td right>{inr(c.billed, true)}</Td>
                    <Td right className="font-semibold text-brand-ink">{inr(c.collected, true)}</Td>
                    <Td right className={c.balance > 0 ? "text-[#B42E2E]" : ""}>{inr(c.balance, true)}</Td>
                  </tr>
                ))}
              </tbody>
            </DataGrid>
            {!centres.length && <Empty />}
          </Card>
        </>
      ) : tab === "students" ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Figure label="Students admitted" value={String(ledger.length)} sub={`${ledger.filter((r) => r.status === "Pending").length} pending first payment`} icon="users" />
            <Figure label="Partly paid" value={String(ledger.filter((r) => r.feeStatus === "Partly Paid").length)} sub={`${inr(ledger.filter((r) => r.feeStatus === "Partly Paid").reduce((a, r) => a + r.balance, 0), true)} balance due`} icon="clock" />
            <Figure label="Fully paid" value={String(ledger.filter((r) => r.feeStatus === "Paid").length)} sub={`${pct(ledger.filter((r) => r.feeStatus === "Paid").length, ledger.length)}% of admissions`} icon="checkCircle" />
            <Figure label="Fees collected" value={inr(ledger.reduce((a, r) => a + r.paid, 0), true)} sub={`of ${inr(ledger.reduce((a, r) => a + r.totalFee, 0), true)} billed`} meter={pct(ledger.reduce((a, r) => a + r.paid, 0), ledger.reduce((a, r) => a + r.totalFee, 0))} icon="rupee" />
          </section>
          <Card title="Student fee ledger · lead → admission → payments → receipts & invoices" className="mt-4">
            <DataGrid minWidth={1100}>
              <thead>
                <tr className="border-b border-[#EEF3F1]">
                  <Th>Student</Th>
                  <Th>Lead source</Th>
                  <Th>Centre</Th>
                  <Th>Course</Th>
                  <Th>Admitted</Th>
                  <Th right>Total fee</Th>
                  <Th right>Paid</Th>
                  <Th right>Balance</Th>
                  <Th>Status</Th>
                  <Th>Receipts · invoices</Th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r) => (
                  <tr key={r.studentId} className="border-b border-[#F4F7F6]">
                    <Td>
                      <span className="block font-semibold text-brand-ink">{r.studentName}</span>
                      <span className="block font-mono text-[11px] text-[#7B8E89]">{r.studentId}{r.leadId ? ` · ${r.leadId}` : ""}</span>
                    </Td>
                    <Td>
                      <span className="block text-[#41564f]">{r.source}</span>
                      <span className="block text-[11px] text-[#7B8E89]">{r.owner}</span>
                    </Td>
                    <Td className="text-[#41564f]">{r.centre}</Td>
                    <Td className="text-[#41564f]">{r.course}</Td>
                    <Td className="whitespace-nowrap text-[#41564f]">{r.admittedOn}</Td>
                    <Td right>{inr(r.totalFee)}</Td>
                    <Td right className="font-semibold text-brand-ink">{inr(r.paid)}</Td>
                    <Td right className={r.balance > 0 ? "font-semibold text-[#B42E2E]" : ""}>{inr(r.balance)}</Td>
                    <Td>
                      <StatusBadge tone={tone(r.feeStatus === "Unpaid" ? r.status : r.feeStatus)}>{r.feeStatus === "Unpaid" ? r.status : r.feeStatus}</StatusBadge>
                    </Td>
                    <Td className="text-[11px] text-[#41564f]">
                      {r.parts ? `${r.parts} payment${r.parts > 1 ? "s" : ""} · ${r.receipts}` : "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </DataGrid>
            {!ledger.length && <Empty text="No students admitted in this period." />}
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
          <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Figure label="Taxable value" value={inr(gst.taxable, true)} sub="fees collected excl. GST" icon="lessons" />
            <Figure label="CGST 9%" value={inr(gst.cgst, true)} sub="on fees collected" icon="check" />
            <Figure label="SGST 9%" value={inr(gst.sgst, true)} sub="on fees collected" icon="check" />
            <Figure label="Total GST (18%)" value={inr(gst.tax, true)} sub={`${P.filter((p) => p.status === "Partly Paid").length} part payments · ${P.filter((p) => p.status === "Success").length} full`} icon="rupee" />
          </section>
          <Card title="Payments, receipts & invoices register" className="mt-4">
            <DataGrid minWidth={1000}>
              <thead>
                <tr className="border-b border-[#EEF3F1]">
                  <Th>Date</Th>
                  <Th>Receipt</Th>
                  <Th>Invoice</Th>
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Mode</Th>
                  <Th right>GST</Th>
                  <Th right>Amount</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {P.slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((p) => (
                    <tr key={p.id} className="border-b border-[#F4F7F6]">
                      <Td className="whitespace-nowrap text-[#41564f]">{p.date}</Td>
                      <Td className="font-mono text-[11.5px] text-[#41564f]">{p.receiptNo ?? "—"}</Td>
                      <Td className="font-mono text-[11.5px] text-[#41564f]">{invOf.get(`${p.accountId}#${p.instNo}`) ?? "—"}</Td>
                      <Td className="font-semibold text-brand-ink">{p.student}</Td>
                      <Td className="text-[#41564f]">{courseOf.get(p.accountId) ?? p.item}</Td>
                      <Td className="text-[#41564f]">{p.method}</Td>
                      <Td right>{inr(gstSplit(p.amount).tax)}</Td>
                      <Td right className="font-semibold text-brand-ink">{inr(p.amount)}</Td>
                      <Td><StatusBadge tone={tone(p.status)}>{p.status === "Success" ? "Paid in full" : p.status}</StatusBadge></Td>
                    </tr>
                  ))}
              </tbody>
            </DataGrid>
            {!P.length && <Empty text="No payments recorded in this period." />}
          </Card>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card title="Collected by method">
              <HBars table={table} valueCol="Amount" format={(v) => inr(v, true)} data={group(P, (p) => p.method).map((g) => ({ label: g.k, value: g.v.reduce((a, p) => a + p.amount, 0) })).sort((a, b) => b.value - a.value)} />
              {!P.length && <Empty />}
            </Card>
            <Card title="Collected by course">
              <HBars table={table} valueCol="Amount" format={(v) => inr(v, true)} data={group(P, (p) => courseOf.get(p.accountId) ?? p.item).map((g) => ({ label: g.k, value: g.v.reduce((a, p) => a + p.amount, 0) })).sort((a, b) => b.value - a.value).slice(0, 8)} />
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
