"use client";

import Link from "next/link";
import { useState } from "react";
import { COURSES, FUNNEL, INVENTORY, LEAD_SOURCES, REVENUE_MONTHLY, SESSIONS, inr } from "@qschool/shared";
import { Card, Figure, StatusBadge } from "@/components/admin/ui";
import { useFinance, TXN_TONE } from "@/components/admin/finance";
import { useCrmLeads } from "@/components/admin/crm";
import { useConsole } from "@/components/admin/store";
import { useStaffMaster } from "@/components/admin/use-staff";
import { AreaTrend, HBars, ViewToggle } from "@/components/admin/charts";
import { PendingStudentsCard } from "@/components/admin/students-view";
import { Icon } from "@/components/icons";

export type DashModule = "overview" | "crm" | "finance" | "academics" | "hr" | "purchase";
export const DASH_MODULES: { value: DashModule; label: string }[] = [
  { value: "overview", label: "Overview (all modules)" },
  { value: "crm", label: "CRM & Sales" },
  { value: "finance", label: "Finance" },
  { value: "academics", label: "Academics" },
  { value: "hr", label: "HR & Payroll" },
  { value: "purchase", label: "Purchase & Inventory" },
];

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-[12.5px] font-semibold text-brand-teal hover:underline">
      {children} <Icon name="arrowRight" size={14} />
    </Link>
  );
}

const grid4 = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4";
const row2 = "mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2";

export function CrmDashboard() {
  const { leads } = useCrmLeads(60000);
  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(false);
  const breached = leads.filter((l) => l.slaBreached);
  return (
    <>
      <section className={grid4}>
        <Figure label="Open leads" value={String(leads.length)} sub="In the pipeline now" icon="kanban" />
        <Figure label="SLA breached" value={String(breached.length)} sub="No follow-up in time" icon="alert" />
        <Figure label="Enquiries (Oct)" value={String(FUNNEL[0].value)} sub="Top of the funnel" icon="users" />
        <Figure label="Enquiry → admission" value={`${((FUNNEL[4].value / FUNNEL[0].value) * 100).toFixed(1)}%`} sub={`${FUNNEL[4].value} admissions`} icon="checkCircle" />
      </section>
      <div className={row2}>
        <Card title="Admissions funnel" action={<ViewToggle table={t1} onChange={setT1} />}>
          <HBars data={FUNNEL.map((f) => ({ label: f.stage, value: f.value }))} table={t1} valueCol="People" note={(i) => (i === 0 ? null : `${Math.round((FUNNEL[i].value / FUNNEL[i - 1].value) * 100)}%`)} />
        </Card>
        <Card title="Leads by source" action={<ViewToggle table={t2} onChange={setT2} />}>
          <HBars data={LEAD_SOURCES.map((s) => ({ label: s.source, value: s.value }))} table={t2} valueCol="Leads" />
        </Card>
      </div>
      <Card title="Needs follow-up" action={<More href="/admin/leads">Leads &amp; pipeline</More>} className="mt-5">
        <ul className="divide-y divide-[#F0F4F3]">
          {breached.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-2.5">
              <StatusBadge tone="serious">SLA</StatusBadge>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-brand-ink">{l.name}</span>
              <span className="text-[11.5px] text-[#6b807b]">{l.stage} · {l.owner}</span>
            </li>
          ))}
          {breached.length === 0 && <li className="py-3 text-[13px] text-[#6b807b]">All leads are within SLA.</li>}
        </ul>
      </Card>
    </>
  );
}

export function FinanceDashboard() {
  const fin = useFinance();
  const expenses = useConsole((s) => s.expenses);
  const [t, setT] = useState(false);
  const spend = expenses.reduce((a, e) => a + e.amount, 0);
  const pending = expenses.filter((e) => e.status === "Pending approval");
  const rate = fin.billed ? (fin.collected / fin.billed) * 100 : 0;
  return (
    <>
      <section className={grid4}>
        <Figure label="Billed" value={inr(fin.billed, true)} sub="All fee plans incl. GST" icon="lessons" />
        <Figure label="Collected" value={inr(fin.collected, true)} meter={rate} sub={`${rate.toFixed(1)}% collection rate`} icon="checkCircle" />
        <Figure label="Overdue" value={inr(fin.overdue, true)} sub="Past-due instalments" icon="alert" />
        <Figure label="Expenses" value={inr(spend, true)} sub={`${pending.length} awaiting approval`} icon="card" />
      </section>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Revenue" action={<ViewToggle table={t} onChange={setT} />}>
          <AreaTrend data={REVENUE_MONTHLY} table={t} />
        </Card>
        <Card title="Recent payments" action={<More href="/admin/payments">All payments</More>}>
          <ul className="divide-y divide-[#F0F4F3]">
            {fin.payments.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-2.5 text-[13px]">
                <span className="min-w-0 flex-1 truncate font-medium text-brand-ink">{p.student}</span>
                <span className="font-semibold tabular-nums">{inr(p.amount)}</span>
                <StatusBadge tone={TXN_TONE[p.status]}>{p.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <More href="/admin/fees">Fees &amp; receivables</More>
        <More href="/admin/invoices">Invoices</More>
        <More href="/admin/expenses">Expenses</More>
      </div>
    </>
  );
}

export function AcademicsDashboard() {
  const live = SESSIONS.filter((s) => s.status === "Live").length;
  const upcoming = SESSIONS.filter((s) => s.status === "Upcoming").length;
  const seats = SESSIONS.reduce((a, s) => a + s.enrolled, 0);
  const cap = SESSIONS.reduce((a, s) => a + s.capacity, 0);
  return (
    <>
      <section className={grid4}>
        <Figure label="Courses" value={String(COURSES.length)} sub="In the catalogue" icon="book" />
        <Figure label="Live now" value={String(live)} sub={`${upcoming} upcoming sessions`} icon="live" />
        <Figure label="Seats filled" value={`${seats}/${cap}`} meter={cap ? (seats / cap) * 100 : 0} sub="Across scheduled sessions" icon="users" />
        <Figure label="Sessions scheduled" value={String(SESSIONS.length)} icon="calendar" />
      </section>
      <div className={row2}>
        <PendingStudentsCard />
        <Card title="Sessions" action={<More href="/admin/schedule">Schedule</More>}>
          <ul className="space-y-2.5">
            {SESSIONS.slice(0, 7).map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-[#EEF3F1] p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-brand-ink">{s.title}</p>
                  <p className="text-[11.5px] text-[#6b807b]">{s.day} · {s.kind} · {s.host} · {s.enrolled}/{s.capacity}</p>
                </div>
                <StatusBadge tone={s.status === "Live" ? "info" : s.status === "Upcoming" ? "warning" : "good"}>{s.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <More href="/admin/enrolments">Students</More>
        <More href="/admin/courses">Courses</More>
        <More href="/admin/live">Live sessions</More>
      </div>
    </>
  );
}

export function HrDashboard() {
  const { active } = useStaffMaster();
  const leaves = useConsole((s) => s.leaves);
  const [t, setT] = useState(false);
  const depts = ["Academics", "Sales", "Operations", "Tech", "Finance"] as const;
  const head = depts.map((d) => ({ label: d, value: active.filter((s) => s.dept === d).length })).sort((a, b) => b.value - a.value);
  const gross = active.reduce((a, s) => a + s.salary, 0);
  const pending = leaves.filter((l) => l.status === "Pending");
  return (
    <>
      <section className={grid4}>
        <Figure label="Headcount" value={String(active.length)} sub={`${active.filter((s) => s.dept === "Academics").length} faculty`} icon="users" />
        <Figure label="Monthly payroll (gross)" value={inr(gross, true)} sub="Before deductions" icon="rupee" />
        <Figure label="Leave requests" value={String(pending.length)} sub="Awaiting approval" icon="calendar" />
        <Figure label="Branches staffed" value={String(new Set(active.map((s) => s.centre)).size)} icon="building" />
      </section>
      <div className={row2}>
        <Card title="Headcount by department" action={<ViewToggle table={t} onChange={setT} />}>
          <HBars data={head} table={t} valueCol="People" valueWidth={40} />
        </Card>
        <Card title="Pending leave" action={<More href="/admin/staff">HR &amp; Staff</More>}>
          <ul className="divide-y divide-[#F0F4F3]">
            {pending.map((l) => (
              <li key={l.id} className="py-2.5 text-[13px]">
                <b className="text-brand-ink">{l.staff}</b> <span className="text-[#6b807b]">· {l.type} · {l.days} day{l.days > 1 ? "s" : ""} from {l.from}</span>
              </li>
            ))}
            {pending.length === 0 && <li className="py-3 text-[13px] text-[#6b807b]">No pending requests.</li>}
          </ul>
        </Card>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <More href="/admin/payroll">Payroll &amp; attendance</More>
        <More href="/admin/staff/tasks">Staff tasks</More>
      </div>
    </>
  );
}

export function PurchaseDashboard() {
  const expenses = useConsole((s) => s.expenses);
  const [t, setT] = useState(false);
  const low = INVENTORY.filter((i) => i.onHand <= i.reorderAt);
  const value = INVENTORY.reduce((a, i) => a + i.onHand * i.unitCost, 0);
  const reorderCost = low.reduce((a, i) => a + Math.max(0, i.reorderAt * 2 - i.onHand) * i.unitCost, 0);
  const pend = expenses.filter((e) => e.status === "Pending approval");
  const byVendor = Object.entries(expenses.reduce<Record<string, number>>((m, e) => ((m[e.vendor] = (m[e.vendor] ?? 0) + e.amount), m), {}))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return (
    <>
      <section className={grid4}>
        <Figure label="Stock value" value={inr(value, true)} sub={`${INVENTORY.length} items`} icon="box" />
        <Figure label="Low stock" value={String(low.length)} sub="At or below reorder level" icon="alert" />
        <Figure label="Est. reorder cost" value={inr(reorderCost, true)} sub="Top up to 2x reorder level" icon="rupee" />
        <Figure label="Bills to approve" value={String(pend.length)} sub={inr(pend.reduce((a, e) => a + e.amount, 0))} icon="clock" />
      </section>
      <div className={row2}>
        <Card title="Items to reorder" action={<More href="/admin/inventory">Inventory</More>}>
          <ul className="divide-y divide-[#F0F4F3]">
            {low.map((i) => (
              <li key={i.sku + i.centre} className="flex items-center gap-3 py-2.5 text-[13px]">
                <span className="min-w-0 flex-1"><b className="block truncate text-brand-ink">{i.name}</b><span className="text-[11.5px] text-[#6b807b]">{i.centre} · {i.vendor}</span></span>
                <StatusBadge tone="critical">{i.onHand} left</StatusBadge>
              </li>
            ))}
            {low.length === 0 && <li className="py-3 text-[13px] text-[#6b807b]">Everything is above its reorder level.</li>}
          </ul>
        </Card>
        <Card title="Spend by vendor" action={<ViewToggle table={t} onChange={setT} />}>
          <HBars data={byVendor} table={t} valueCol="Spend" format={(v) => inr(v, true)} valueWidth={64} />
        </Card>
      </div>
      <div className="mt-4"><More href="/admin/expenses">Expenses &amp; approvals</More></div>
    </>
  );
}
