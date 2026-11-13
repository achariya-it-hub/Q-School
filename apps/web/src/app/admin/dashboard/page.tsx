"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fmtDate, inr, type Kpi } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Card, PageHeader, StatusBadge, type Tone } from "@/components/admin/ui";
import { TXN_TONE, useFinance } from "@/components/admin/finance";
import { useCrmLeads } from "@/components/admin/crm";
import { AreaTrend, HBars, StatTile, ViewToggle } from "@/components/admin/charts";
import { Icon } from "@/components/icons";
import { PendingStudentsCard, useStudents } from "@/components/admin/students-view";
import {
  AcademicsDashboard,
  CrmDashboard,
  DASH_MODULES,
  FinanceDashboard,
  HrDashboard,
  PurchaseDashboard,
  type DashModule,
} from "@/components/admin/module-dashboards";
import { KIND_LABEL, phase, type LiveSession } from "@/lib/live/types";

const SESSION_TONE: Record<string, Tone> = { Live: "info", Upcoming: "warning", Done: "good" };

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-[12.5px] font-semibold text-brand-teal hover:underline">
      {children} <Icon name="arrowRight" size={14} />
    </Link>
  );
}

const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (k: string) =>
  new Date(`${k}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" });

export default function AdminHome() {
  const [revTable, setRevTable] = useState(false);
  const [funnelTable, setFunnelTable] = useState(false);
  const [srcTable, setSrcTable] = useState(false);
  const [mod, setMod] = useState<DashModule>("overview");
  const [userName, setUserName] = useState("Admin");
  const [greeting, setGreeting] = useState("Good afternoon");
  const [dateStr, setDateStr] = useState("");
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening");
    try {
      setDateStr(
        new Intl.DateTimeFormat("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())
      );
    } catch {}

    try {
      const raw = localStorage.getItem("qschool_admin_session");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.name) setUserName(u.name);
      }
    } catch {}

    fetch("/api/admin/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.name) setUserName(j.name);
      })
      .catch(() => {});

    fetch("/api/admin/live", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.sessions)) setLiveSessions(d.sessions);
      })
      .catch(() => {});
  }, []);

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
  const { students } = useStudents();

  const revenueMonthly = useMemo(() => {
    const m = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const k = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
      m.set(k, 0);
    }
    for (const p of fin.payments) {
      if (p.status === "Success" && m.has(monthKey(p.date))) {
        m.set(monthKey(p.date), (m.get(monthKey(p.date)) ?? 0) + p.amount);
      }
    }
    return Array.from(m, ([k, v]) => ({ month: monthLabel(k), value: v }));
  }, [fin.payments]);

  const funnel = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter((l) => ["Contacted", "BMIT", "Negotiation", "Admitted"].includes(l.stage)).length;
    const bmit = leads.filter((l) => ["BMIT", "Negotiation", "Admitted"].includes(l.stage)).length;
    const negotiation = leads.filter((l) => ["Negotiation", "Admitted"].includes(l.stage)).length;
    const admitted = leads.filter((l) => l.stage === "Admitted").length;
    return [
      { stage: "Enquiries", value: total },
      { stage: "Contacted", value: contacted },
      { stage: "BMIT", value: bmit },
      { stage: "Negotiation", value: negotiation },
      { stage: "Admitted", value: admitted },
    ];
  }, [leads]);

  const leadSources = useMemo(() => {
    const counts = new Map<string, number>([
      ["Meta Ads", 0],
      ["Website", 0],
      ["WhatsApp", 0],
      ["Referral", 0],
      ["Google Ads", 0],
      ["Walk-in", 0],
    ]);
    for (const l of leads) {
      const src = l.source || "Website";
      counts.set(src, (counts.get(src) ?? 0) + 1);
    }
    return Array.from(counts, ([source, value]) => ({ source, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  const activeStudents = students.filter((s) => s.status === "Active").length;
  const openLeads = leads.filter((l) => l.stage !== "Admitted" && l.stage !== "Dropped").length;
  const totalRegs = liveSessions.reduce((a, s) => a + s.registrations.length, 0);
  const totalJoined = liveSessions.reduce((a, s) => a + s.registrations.filter((r) => r.joinedAt).length, 0);
  const attendancePct = totalRegs > 0 ? Math.round((totalJoined / totalRegs) * 100) : 0;

  const kpis: Kpi[] = useMemo(() => {
    const revTrend = revenueMonthly.map((r) => r.value);
    const zeroTrend = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return [
      {
        key: "revenue",
        label: "Revenue collected",
        value: fin.collected,
        format: "inr",
        delta: 0,
        upIsGood: true,
        trend: revTrend.length === 12 ? revTrend : zeroTrend,
      },
      {
        key: "admissions",
        label: "Total admissions",
        value: students.length,
        format: "int",
        delta: 0,
        upIsGood: true,
        trend: [...zeroTrend.slice(0, 11), students.length],
      },
      {
        key: "students",
        label: "Active students",
        value: activeStudents,
        format: "int",
        delta: 0,
        upIsGood: true,
        trend: [...zeroTrend.slice(0, 11), activeStudents],
      },
      {
        key: "leads",
        label: "Open leads",
        value: openLeads,
        format: "int",
        delta: 0,
        upIsGood: true,
        trend: [...zeroTrend.slice(0, 11), openLeads],
      },
      {
        key: "attendance",
        label: "Live attendance",
        value: attendancePct,
        format: "pct",
        delta: 0,
        upIsGood: true,
        trend: [...zeroTrend.slice(0, 11), attendancePct],
      },
      {
        key: "dues",
        label: "Overdue fees",
        value: fin.overdue,
        format: "inr",
        delta: 0,
        upIsGood: false,
        trend: [...zeroTrend.slice(0, 11), fin.overdue],
      },
    ];
  }, [fin.collected, fin.overdue, revenueMonthly, students.length, activeStudents, openLeads, attendancePct]);

  const breached = leads.filter((l) => l.slaBreached);
  const overdue = fin.invoices.filter((i) => i.status === "Overdue");
  const yearTotal = revenueMonthly.reduce((a, r) => a + r.value, 0);
  const overallConversion = funnel[0].value > 0 ? ((funnel[4].value / funnel[0].value) * 100).toFixed(1) : "0.0";

  const upcomingSessions = useMemo(
    () =>
      liveSessions
        .filter((s) => ["live", "upcoming"].includes(phase(s)))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .slice(0, 5),
    [liveSessions]
  );

  return (
    <AdminShell>
      <PageHeader title={`${greeting}, ${userName}`} sub={`Here's how Q-School is doing${dateStr ? ` · ${dateStr}` : ""}`}>
        <select
          aria-label="Dashboard module"
          value={mod}
          onChange={(e) => pick(e.target.value as DashModule)}
          className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[13px] font-semibold text-brand-ink"
        >
          {DASH_MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <Link
          href="/admin/leads"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-[#0B6E5F] to-[#054038] px-4 text-[13px] font-semibold text-white hover:from-[#0E937E]"
        >
          <Icon name="plus" size={16} /> New lead
        </Link>
      </PageHeader>

      {mod === "crm" ? (
        <CrmDashboard />
      ) : mod === "finance" ? (
        <FinanceDashboard />
      ) : mod === "academics" ? (
        <AcademicsDashboard />
      ) : mod === "hr" ? (
        <HrDashboard />
      ) : mod === "purchase" ? (
        <PurchaseDashboard />
      ) : (
        <>
          {/* KPI tiles */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {kpis.map((k) => (
              <StatTile key={k.key} k={k} />
            ))}
          </section>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title="Revenue" action={<ViewToggle table={revTable} onChange={setRevTable} />}>
              <p className="-mt-3 mb-3 text-[12.5px] text-[#5C716C]">
                Last 12 months · <span className="font-semibold text-brand-ink">{inr(yearTotal, true)}</span> total collected
              </p>
              <AreaTrend data={revenueMonthly} table={revTable} />
            </Card>

            <Card title="Admissions funnel" action={<ViewToggle table={funnelTable} onChange={setFunnelTable} />}>
              <p className="-mt-3 mb-4 text-[12.5px] text-[#5C716C]">Pipeline progression · conversion from previous stage</p>
              <HBars
                data={funnel.map((f) => ({ label: f.stage, value: f.value }))}
                table={funnelTable}
                valueCol="People"
                note={(i) =>
                  i === 0 || !funnel[i - 1]?.value
                    ? null
                    : `${Math.round((funnel[i].value / funnel[i - 1].value) * 100)}%`
                }
              />
              <p className="mt-4 rounded-xl bg-[#F3F8F6] px-3 py-2 text-[12.5px] text-[#41564f]">
                Overall conversion <span className="font-semibold text-brand-ink">{overallConversion}%</span> from enquiry to admission
              </p>
            </Card>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            <Card title="Leads by source" action={<ViewToggle table={srcTable} onChange={setSrcTable} />}>
              <p className="-mt-3 mb-4 text-[12.5px] text-[#5C716C]">
                Active pipeline · {leads.length.toLocaleString("en-IN")} lead{leads.length === 1 ? "" : "s"}
              </p>
              <HBars data={leadSources.map((s) => ({ label: s.source, value: s.value }))} table={srcTable} valueCol="Leads" />
            </Card>

            <PendingStudentsCard />

            <Card title="Upcoming live sessions" action={<CardLink href="/admin/schedule">Schedule</CardLink>}>
              {upcomingSessions.length === 0 ? (
                <p className="py-4 text-[13px] text-[#6b807b]">No live sessions scheduled right now.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingSessions.map((s) => {
                    const p = phase(s);
                    const statusLabel = p === "live" ? "Live" : p === "upcoming" ? "Upcoming" : "Done";
                    const timeStr = new Date(s.startsAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <li key={s.id} className="flex items-center gap-3 rounded-xl border border-[#EEF3F1] p-3">
                        <div className="w-[74px] shrink-0 text-[12px] font-semibold tabular-nums text-brand-ink">{timeStr}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-brand-ink">{s.title}</p>
                          <p className="text-[11.5px] text-[#6b807b]">
                            {KIND_LABEL[s.kind]} · {s.host || "Faculty"} · {s.registrations.length}/{s.capacity || "∞"}
                          </p>
                        </div>
                        <StatusBadge tone={SESSION_TONE[statusLabel]}>{statusLabel}</StatusBadge>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                {breached.length === 0 && overdue.length === 0 && (
                  <li className="py-4 text-[13px] text-[#6b807b]">Everything is on track — no SLA breaches or overdue invoices.</li>
                )}
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
                  {fin.payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[13px] text-[#7B8E89]">
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AdminShell>
  );
}
