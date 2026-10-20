"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FUNNEL, KPIS, LEAD_SOURCES, REVENUE_MONTHLY, SESSIONS, fmtDate, inr } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Card, PageHeader, StatusBadge, type Tone } from "@/components/admin/ui";
import { TXN_TONE, useFinance } from "@/components/admin/finance";
import { useCrmLeads } from "@/components/admin/crm";
import { AreaTrend, HBars, StatTile, ViewToggle } from "@/components/admin/charts";
import { Icon } from "@/components/icons";
import { PendingStudentsCard } from "@/components/admin/students-view";
import { AcademicsDashboard, CrmDashboard, DASH_MODULES, FinanceDashboard, HrDashboard, PurchaseDashboard, type DashModule } from "@/components/admin/module-dashboards";

const SESSION_TONE: Record<string, Tone> = { Live: "info", Upcoming: "warning", Done: "good" };

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-[12.5px] font-semibold text-brand-teal hover:underline">
      {children} <Icon name="arrowRight" size={14} />
    </Link>
  );
}

export default function AdminHome() {
  const [revTable, setRevTable] = useState(false);
  const [funnelTable, setFunnelTable] = useState(false);
  const [srcTable, setSrcTable] = useState(false);
  const [mod, setMod] = useState<DashModule>("overview");
  useEffect(() => {
    const m = localStorage.getItem("qs-dash-module") as DashModule | null;
    if (m && DASH_MODULES.some((x) => x.value === m)) setMod(m);
  }, []);
  const pick = (m: DashModule) => {
    setMod(m);
    localStorage.setItem("qs-dash-module", m);
  };

  const fin = useFinance();
  const { leads } = useCrmLeads(60000);
  const today = SESSIONS.filter((s) => s.day === "Thu 1 Oct");
  const breached = leads.filter((l) => l.slaBreached);
  const overdue = fin.invoices.filter((i) => i.status === "Overdue");
  const kpis = KPIS.map((k) => (k.key === "dues" ? { ...k, label: "Overdue fees", value: fin.overdue } : k));
  const yearTotal = REVENUE_MONTHLY.reduce((a, r) => a + r.value, 0);

  return (
    <AdminShell>
      <PageHeader title="Good afternoon, Bala" sub="Here's how Q-School is doing · Thursday, 1 October 2026">
        <select
          aria-label="Dashboard module"
          value={mod}
          onChange={(e) => pick(e.target.value as DashModule)}
          className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[13px] font-semibold text-brand-ink"
        >
          {DASH_MODULES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <Link
          href="/admin/leads"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-[#0B6E5F] to-[#054038] px-4 text-[13px] font-semibold text-white hover:from-[#0E937E]"
        >
          <Icon name="plus" size={16} /> New lead
        </Link>
      </PageHeader>

      {mod === "crm" ? <CrmDashboard /> : mod === "finance" ? <FinanceDashboard /> : mod === "academics" ? <AcademicsDashboard /> : mod === "hr" ? <HrDashboard /> : mod === "purchase" ? <PurchaseDashboard /> : (
      <>
      {/* KPI tiles */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((k) => (
          <StatTile key={k.key} k={k} />
        ))}
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Revenue"
          action={<ViewToggle table={revTable} onChange={setRevTable} />}
        >
          <p className="-mt-3 mb-3 text-[12.5px] text-[#5C716C]">
            Last 12 months · <span className="font-semibold text-brand-ink">{inr(yearTotal, true)}</span> total · October is month-to-date
          </p>
          <AreaTrend data={REVENUE_MONTHLY} table={revTable} />
        </Card>

        <Card title="Admissions funnel" action={<ViewToggle table={funnelTable} onChange={setFunnelTable} />}>
          <p className="-mt-3 mb-4 text-[12.5px] text-[#5C716C]">October · conversion from the previous stage</p>
          <HBars
            data={FUNNEL.map((f) => ({ label: f.stage, value: f.value }))}
            table={funnelTable}
            valueCol="People"
            note={(i) => (i === 0 ? null : `${Math.round((FUNNEL[i].value / FUNNEL[i - 1].value) * 100)}%`)}
          />
          <p className="mt-4 rounded-xl bg-[#F3F8F6] px-3 py-2 text-[12.5px] text-[#41564f]">
            Overall conversion <span className="font-semibold text-brand-ink">{((FUNNEL[4].value / FUNNEL[0].value) * 100).toFixed(1)}%</span> from enquiry to admission
          </p>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        <Card title="Leads by source" action={<ViewToggle table={srcTable} onChange={setSrcTable} />}>
          <p className="-mt-3 mb-4 text-[12.5px] text-[#5C716C]">Last 30 days · 2,140 leads</p>
          <HBars data={LEAD_SOURCES.map((s) => ({ label: s.source, value: s.value }))} table={srcTable} valueCol="Leads" />
        </Card>

        <PendingStudentsCard />

        <Card title="Today's sessions" action={<CardLink href="/admin/schedule">Schedule</CardLink>}>
          <ul className="space-y-3">
            {today.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-[#EEF3F1] p-3">
                <div className="w-[74px] shrink-0 text-[12px] font-semibold tabular-nums text-brand-ink">{s.time.split(" – ")[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-brand-ink">{s.title}</p>
                  <p className="text-[11.5px] text-[#6b807b]">
                    {s.kind} · {s.host} · {s.enrolled}/{s.capacity}
                  </p>
                </div>
                <StatusBadge tone={SESSION_TONE[s.status]}>{s.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Needs attention" className="lg:col-span-2 2xl:col-span-1">
          <ul className="divide-y divide-[#F0F4F3]">
            {breached.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <StatusBadge tone="serious">SLA</StatusBadge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-brand-ink">{l.name}</p>
                  <p className="text-[11.5px] text-[#6b807b]">
                    {l.stage} · no follow-up · {l.owner}
                  </p>
                </div>
                <CardLink href="/admin/leads">Open</CardLink>
              </li>
            ))}
            {overdue.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <StatusBadge tone="critical">Overdue</StatusBadge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-brand-ink">
                    {i.student} · {inr(i.amount)}
                  </p>
                  <p className="text-[11.5px] text-[#6b807b]">
                    {i.id} · due since {fmtDate(i.due)}
                  </p>
                </div>
                <CardLink href="/admin/fees">Collect</CardLink>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recent payments" action={<CardLink href="/admin/payments">All payments</CardLink>} className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#EEF3F1] text-[12px] text-[#5C716C]">
                <th className="py-2 font-medium">Receipt / txn</th>
                <th className="py-2 font-medium">Student</th>
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium">Method</th>
                <th className="py-2 text-right font-medium">Amount</th>
                <th className="py-2 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fin.payments.slice(0, 6).map((p) => (
                <tr key={p.id} className="border-b border-[#F4F7F6] last:border-0">
                  <td className="py-2.5 font-mono text-[12px] text-[#41564f]">{p.receiptNo ?? p.id}</td>
                  <td className="py-2.5 font-medium text-brand-ink">{p.student}</td>
                  <td className="py-2.5 text-[#41564f]">{p.item}</td>
                  <td className="py-2.5 text-[#41564f]">{p.method}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums text-brand-ink">{inr(p.amount)}</td>
                  <td className="py-2.5 pl-4">
                    <StatusBadge tone={TXN_TONE[p.status]}>{p.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </>
      )}
    </AdminShell>
  );
}
