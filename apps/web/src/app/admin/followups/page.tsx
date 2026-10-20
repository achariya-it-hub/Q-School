"use client";

import { useMemo, useState } from "react";
import { accountTotals, fmtDate, inr } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, Figure, PageHeader, Segmented, StatusBadge, Toast, useToast, type Tone } from "@/components/admin/ui";
import { useConsole } from "@/components/admin/store";
import { useCrmLeads } from "@/components/admin/crm";
import { CollectModal } from "@/components/admin/finance";
import { Icon } from "@/components/icons";

type Kind = "All" | "Sales" | "Fees";

interface Task {
  id: string;
  kind: "Sales" | "Fees";
  who: string;
  phone: string;
  what: string;
  due: string;
  tone: Tone;
  badge: string;
  leadId?: string;
  accountId?: string;
}

/** Follow-up queue generated from the pipeline (sales) and the fee ledger (collections). */
export default function FollowupsPage() {
  const { leads, patch } = useCrmLeads(60000);
  const accounts = useConsole((s) => s.accounts);
  const [kind, setKind] = useState<Kind>("All");
  const [done, setDone] = useState<string[]>([]);
  const [collect, setCollect] = useState<string | null>(null);
  const [toast, show] = useToast();

  const tasks = useMemo<Task[]>(() => {
    const sales: Task[] = leads
      .filter((l) => !["Admitted", "Dropped"].includes(l.stage))
      .map((l) => ({
        id: `S-${l.id}`,
        kind: "Sales",
        who: l.name,
        phone: l.phone,
        what:
          l.stage === "Enquiry"
            ? `First call — ${l.interest}`
            : l.stage === "Contacted"
              ? "Book a demo class"
              : l.stage === "Demo"
                ? "Post-demo call, share fee options"
                : "Close: confirm batch and send payment link",
        due: l.slaBreached ? "Overdue" : l.stage === "Enquiry" ? "Today" : "Tomorrow",
        tone: l.slaBreached ? "critical" : "warning",
        badge: l.slaBreached ? "Overdue" : l.stage,
        leadId: l.id,
      }));
    const fees: Task[] = accounts
      .map((a) => ({ a, t: accountTotals(a) }))
      .filter(({ t }) => t.status === "Overdue" || (t.status === "Due" && t.next && t.next.due <= "2026-10-10"))
      .map(({ a, t }) => ({
        id: `F-${a.id}`,
        kind: "Fees",
        who: a.student,
        phone: a.phone,
        what: t.status === "Overdue" ? `Collect ${inr(t.overdue)} overdue (${t.maxDaysLate} days)` : `Reminder: ${inr(t.next!.amount)} due ${fmtDate(t.next!.due)}`,
        due: t.status === "Overdue" ? "Overdue" : "This week",
        tone: t.status === "Overdue" ? "critical" : "warning",
        badge: t.status === "Overdue" ? "Overdue" : "Due soon",
        accountId: a.id,
      }));
    return [...sales, ...fees].sort((x, y) => (x.due === "Overdue" ? -1 : 0) - (y.due === "Overdue" ? -1 : 0));
  }, [leads, accounts]);

  const open = tasks.filter((t) => !done.includes(t.id));
  const list = open.filter((t) => kind === "All" || t.kind === kind);
  const complete = (t: Task, msg: string) => {
    if (t.leadId) patch(t.leadId, { activity: msg });
    setDone((d) => [...d, t.id]);
    show(msg);
  };
  const acc = accounts.find((a) => a.id === collect) ?? null;

  return (
    <AdminShell>
      <PageHeader title="Follow-ups" sub="Today's call list — sales leads and fee collections in one queue" />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Open tasks" value={String(open.length)} sub={`${done.length} completed today`} icon="checkCircle" />
        <Figure label="Overdue" value={String(open.filter((t) => t.due === "Overdue").length)} sub="Past SLA or due date" icon="alert" />
        <Figure label="Fee collections" value={String(open.filter((t) => t.kind === "Fees").length)} sub="Students to remind" icon="rupee" />
      </section>

      <Card className="mt-5">
        <div className="mb-4">
          <Segmented<Kind>
            label="Type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "All", label: `All (${open.length})` },
              { value: "Sales", label: "Sales" },
              { value: "Fees", label: "Fees" },
            ]}
          />
        </div>
        <ul className="divide-y divide-[#F0F4F3]">
          {list.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.kind === "Fees" ? "bg-[#FFF6E0] text-[#8A5A00]" : "bg-[#E3F4F0] text-brand-deep"}`}>
                <Icon name={t.kind === "Fees" ? "rupee" : "phone"} size={17} />
              </span>
              <div className="min-w-[200px] flex-1">
                <p className="text-[13.5px] font-semibold text-brand-ink">{t.who}</p>
                <p className="text-[12px] text-[#5C716C]">
                  {t.what} · {t.phone}
                </p>
              </div>
              <StatusBadge tone={t.tone}>{t.badge}</StatusBadge>
              <div className="flex gap-1.5">
                <button
                  onClick={() => complete(t, `Call logged with ${t.who}`)}
                  className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal"
                >
                  Log call
                </button>
                <button
                  onClick={() => complete(t, `WhatsApp ${t.kind === "Fees" ? "payment link" : "follow-up"} sent to ${t.who}`)}
                  className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal"
                >
                  WhatsApp
                </button>
                {t.accountId && (
                  <button
                    onClick={() => setCollect(t.accountId!)}
                    className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                  >
                    Collect
                  </button>
                )}
              </div>
            </li>
          ))}
          {!list.length && <li className="py-10 text-center text-[#7B8E89]">All caught up 🎉</li>}
        </ul>
        {done.length > 0 && (
          <div className="mt-3 text-right">
            <Btn variant="ghost" icon="undo" onClick={() => setDone([])}>
              Reset completed
            </Btn>
          </div>
        )}
      </Card>

      <CollectModal
        account={acc}
        onClose={() => setCollect(null)}
        onDone={(m) => {
          setDone((d) => [...d, `F-${collect}`]);
          setCollect(null);
          show(m);
        }}
      />
      <Toast msg={toast} />
    </AdminShell>
  );
}
