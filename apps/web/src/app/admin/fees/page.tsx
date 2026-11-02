"use client";

import { useMemo, useState } from "react";
import { ADMISSION_CENTRES, accountTotals, aging, fmtDate, inr, TODAY_ISO, type FeeAccount } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import {
  Btn,
  Card,
  DataGrid,
  Drawer,
  Field,
  Figure,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  StatusBadge,
  Td,
  Th,
  Toast,
  inputCls,
  useToast,
} from "@/components/admin/ui";
import { HBars, ViewToggle } from "@/components/admin/charts";
import { ACCOUNT_TONE, CollectModal, useFinance } from "@/components/admin/finance";
import { addFeeAccount, downloadCsv } from "@/components/admin/store";
import { Icon } from "@/components/icons";
import { waNotify } from "@/components/admin/whatsapp";

type Filter = "All" | "Overdue" | "Due" | "Paid";

export default function FeesPage() {
  const f = useFinance();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [collect, setCollect] = useState<FeeAccount | null>(null);
  const [ledger, setLedger] = useState<string | null>(null);
  const [plan, setPlan] = useState(false);
  const [agingTable, setAgingTable] = useState(false);
  const [toast, show] = useToast();

  const rows = useMemo(
    () =>
      f.totals
        .filter(({ a, t }) => (filter === "All" ? true : t.status === filter))
        .filter(({ a }) => `${a.student} ${a.course} ${a.batch} ${a.id}`.toLowerCase().includes(q.toLowerCase()))
        .sort((x, y) => y.t.maxDaysLate - x.t.maxDaysLate || y.t.outstanding - x.t.outstanding),
    [f.totals, filter, q],
  );
  const buckets = aging(f.accounts);
  const rate = f.billed ? (f.collected / f.billed) * 100 : 0;
  const ledgerAcc = f.accounts.find((a) => a.id === ledger) ?? null;
  const overdueCount = f.totals.filter((x) => x.t.status === "Overdue").length;

  return (
    <AdminShell>
      <PageHeader title="Fees & Receivables" sub={`Student fee ledger · ${f.accounts.length} accounts · as of ${fmtDate(TODAY_ISO)}`}>
        <Btn
          variant="ghost"
          icon="download"
          onClick={() =>
            downloadCsv(
              "qschool-receivables.csv",
              ["Account", "Student", "Course", "Batch", "Total", "Paid", "Outstanding", "Overdue", "Next due", "Status"],
              f.totals.map(({ a, t }) => [a.id, a.student, a.course, a.batch, t.total, t.paid, t.outstanding, t.overdue, t.next ? t.next.due : "", t.status]),
            )
          }
        >
          Export CSV
        </Btn>
        <Btn icon="plus" onClick={() => setPlan(true)}>
          New fee plan
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Total billed" value={inr(f.billed)} sub="All fee plans incl. GST" icon="lessons" />
        <Figure label="Collected" value={inr(f.collected)} meter={rate} sub={`${rate.toFixed(1)}% collection rate`} icon="checkCircle" />
        <Figure label="Outstanding" value={inr(f.outstanding)} sub="Due now + future installments" icon="clock" />
        <Figure
          label="Overdue"
          value={inr(f.overdue)}
          sub={
            <span className="inline-flex items-center gap-1 font-semibold text-[#B42E2E]">
              <Icon name="alert" size={13} /> {overdueCount} accounts past due
            </span>
          }
          icon="alert"
        />
      </section>

      {/* Official Q-School Course Fee Structure */}
      <Card className="mt-5 border border-[#C5DDD7] bg-gradient-to-r from-[#F7FCFA] to-[#EDF7F4]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8EAE4] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#054038] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                Q-School
              </span>
              <h3 className="text-[15px] font-bold text-brand-ink">Official Program Fee Structure</h3>
            </div>
            <p className="mt-0.5 text-[12px] text-[#5C716C]">
              Includes: Q School + Q Learning + annual kit &amp; study material fee
            </p>
          </div>
          <Btn icon="plus" onClick={() => setPlan(true)}>
            Enroll Student / Create Plan
          </Btn>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-[#D8EAE4] text-[11px] font-bold uppercase tracking-wider text-[#5C716C]">
                <th className="py-2 pr-4">Course Name</th>
                <th className="py-2 pr-4">Age Group</th>
                <th className="py-2 pr-4">Fee Basis</th>
                <th className="py-2 pr-4 text-right">Monthly Fee</th>
                <th className="py-2 pr-4 text-right">Annual / Course Fee</th>
                <th className="py-2 pl-4">What the Fee Includes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EFEA]">
              {[
                { course: "Divya Yoga", age: "Age 6 – 8", basis: "Monthly / Annual", monthly: 5250, annual: 63000 },
                { course: "Divya Mantra", age: "Age 9 – 10", basis: "Monthly / Annual", monthly: 5833, annual: 70000 },
                { course: "Divya Mudra", age: "Age 11 – 12", basis: "Monthly / Annual", monthly: 6167, annual: 74000 },
                { course: "Divya Tratak", age: "Age 13 – 14", basis: "Monthly / Annual", monthly: 6500, annual: 78000 },
              ].map((p) => (
                <tr key={p.course} className="hover:bg-white/60">
                  <td className="py-2.5 pr-4 font-bold text-brand-deep">{p.course}</td>
                  <td className="py-2.5 pr-4">
                    <span className="rounded bg-[#E3F4F0] px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                      {p.age}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-[#41564f]">{p.basis}</td>
                  <td className="py-2.5 pr-4 text-right font-mono font-semibold text-[#0B6E5F]">
                    ₹ {p.monthly.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono font-bold text-brand-ink">
                    ₹ {p.annual.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 pl-4 text-[12px] text-[#5C716C]">
                    Q School + Q Learning + annual kit/material fee
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search student, course, batch…" />
            <Segmented<Filter>
              label="Status"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "All", label: "All" },
                { value: "Overdue", label: "Overdue" },
                { value: "Due", label: "Due" },
                { value: "Paid", label: "Paid" },
              ]}
            />
          </div>
          <DataGrid minWidth={980}>
            <thead>
              <tr className="border-b border-[#EEF3F1]">
                <Th>Student</Th>
                <Th>Course · batch</Th>
                <Th right>Total</Th>
                <Th right>Paid</Th>
                <Th right>Outstanding</Th>
                <Th>Next due</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, t }) => (
                <tr key={a.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td>
                    <button onClick={() => setLedger(a.id)} className="text-left">
                      <span className="block whitespace-nowrap font-semibold text-brand-ink hover:text-brand-teal">{a.student}</span>
                      <span className="block font-mono text-[11px] text-[#7B8E89]">{a.id}</span>
                    </button>
                  </Td>
                  <Td>
                    <span className="block max-w-[220px] truncate text-brand-ink">{a.course}</span>
                    <span className="block text-[11.5px] text-[#6b807b]">
                      {a.batch} · {a.centre}
                    </span>
                  </Td>
                  <Td right>{inr(t.total)}</Td>
                  <Td right>{inr(t.paid)}</Td>
                  <Td right className="font-semibold text-brand-ink">{inr(t.outstanding)}</Td>
                  <Td>
                    {t.next ? (
                      <>
                        <span className="block whitespace-nowrap text-brand-ink">{fmtDate(t.next.due)}</span>
                        {t.maxDaysLate > 0 && <span className="block whitespace-nowrap text-[11.5px] font-semibold text-[#B42E2E]">{t.maxDaysLate} days late</span>}
                      </>
                    ) : (
                      <span className="text-[#7B8E89]">—</span>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge tone={ACCOUNT_TONE[t.status]}>{t.status}</StatusBadge>
                  </Td>
                  <Td right>
                    <div className="flex justify-end gap-1.5">
                      {t.next && t.status !== "Refunded" && (
                        <>
                          <button
                            onClick={async () => {
                              const n = t.next!;
                              const r = await waNotify({
                                event: "fee_reminder",
                                to: a.phone,
                                name: a.student,
                                amount: n.amount,
                                item: a.installments.length > 1 ? `${a.course} (instalment ${n.no})` : a.course,
                                due: n.due,
                                ref: `${a.id}-${n.no}`,
                              });
                              show(r.ok ? `WhatsApp reminder sent to ${a.student} (${a.phone})` : r.msg);
                            }}
                            className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal"
                          >
                            Remind
                          </button>
                          <button
                            onClick={() => setCollect(a)}
                            className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                          >
                            Collect
                          </button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#7B8E89]">
                    No accounts match.
                  </td>
                </tr>
              )}
            </tbody>
          </DataGrid>
        </Card>

        <div className="space-y-5">
          <Card title="Overdue by age" action={<ViewToggle table={agingTable} onChange={setAgingTable} />}>
            <HBars
              data={buckets}
              table={agingTable}
              valueCol="Overdue"
              format={(v) => inr(v)}
              valueWidth={78}
            />
            <p className="mt-4 text-[12px] text-[#6b807b]">
              Unpaid installments past their due date, grouped by days late.
            </p>
          </Card>
          <Card title="Collection playbook">
            <ol className="space-y-2.5 text-[12.5px] text-[#41564f]">
              {[
                ["Day 0", "Auto WhatsApp + email with UPI pay link"],
                ["Day 3", "Counsellor call, log on lead timeline"],
                ["Day 15", "Second reminder, offer EMI conversion"],
                ["Day 30", "Escalate to centre manager; pause LMS access"],
              ].map(([d, t]) => (
                <li key={d} className="flex gap-3">
                  <span className="w-12 shrink-0 font-semibold text-brand-deep">{d}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <CollectModal
        account={collect}
        onClose={() => setCollect(null)}
        onDone={(m) => {
          setCollect(null);
          show(m);
        }}
      />

      <Drawer open={!!ledgerAcc} title={ledgerAcc ? `${ledgerAcc.student} · ledger` : ""} onClose={() => setLedger(null)}>
        {ledgerAcc && <Ledger a={ledgerAcc} onCollect={() => setCollect(ledgerAcc)} />}
      </Drawer>

      <NewPlanModal open={plan} onClose={() => setPlan(false)} onDone={(m) => (setPlan(false), show(m))} />
      <Toast msg={toast} />
    </AdminShell>
  );
}

function Ledger({ a, onCollect }: { a: FeeAccount; onCollect: () => void }) {
  const t = accountTotals(a);
  return (
    <div className="space-y-4 text-[13px]">
      <div className="rounded-xl bg-[#F3F8F6] p-3">
        <p className="font-semibold text-brand-ink">{a.course}</p>
        <p className="text-[#5C716C]">
          {a.batch} · {a.centre} · {a.phone}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Total", t.total],
            ["Paid", t.paid],
            ["Balance", t.outstanding],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg bg-white py-2">
              <p className="text-[11px] text-[#7B8E89]">{k}</p>
              <p className="font-semibold text-brand-ink">{inr(v as number)}</p>
            </div>
          ))}
        </div>
      </div>
      <ol className="space-y-2">
        {a.installments.map((i) => {
          const late = !i.paidOn && i.due < TODAY_ISO;
          return (
            <li key={i.no} className="flex items-center gap-3 rounded-xl border border-[#EEF3F1] p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E3F4F0] text-[12px] font-bold text-brand-deep">
                {i.no}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-ink">{inr(i.amount)}</p>
                <p className="text-[11.5px] text-[#6b807b]">
                  Due {fmtDate(i.due)}
                  {i.paidOn ? ` · paid ${fmtDate(i.paidOn)} by ${i.method}` : ""}
                </p>
              </div>
              <StatusBadge tone={i.refunded ? "neutral" : i.paidOn ? "good" : late ? "critical" : "warning"}>
                {i.refunded ? "Refunded" : i.paidOn ? "Paid" : late ? "Overdue" : "Due"}
              </StatusBadge>
            </li>
          );
        })}
      </ol>
      {t.next && t.status !== "Refunded" && (
        <Btn icon="rupee" onClick={onCollect}>
          Collect next installment
        </Btn>
      )}
    </div>
  );
}

const COURSE_FEES: Record<string, { annual: number; monthly: number; label: string }> = {
  "Divya Yoga": { annual: 63000, monthly: 5250, label: "Divya Yoga (Age 6 – 8)" },
  "Divya Mantra": { annual: 70000, monthly: 5833, label: "Divya Mantra (Age 9 – 10)" },
  "Divya Mudra": { annual: 74000, monthly: 6167, label: "Divya Mudra (Age 11 – 12)" },
  "Divya Tratak": { annual: 78000, monthly: 6500, label: "Divya Tratak (Age 13 – 14)" },
};

function NewPlanModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (m: string) => void }) {
  const [form, setForm] = useState({
    student: "",
    phone: "",
    course: "Divya Yoga",
    batch: "Section A",
    centre: "Moolakulam, Puducherry",
    total: 63000,
    parts: 1,
    firstDue: TODAY_ISO,
  });

  const onCourseChange = (c: string) => {
    const feeInfo = COURSE_FEES[c] || COURSE_FEES["Divya Yoga"];
    setForm((f) => ({
      ...f,
      course: c,
      total: feeInfo.annual,
    }));
  };

  const up = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: k === "total" || k === "parts" ? Number(e.target.value) : e.target.value }));

  return (
    <Modal open={open} title="New fee plan" onClose={onClose}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.student.trim()) return;
          addFeeAccount(form);
          onDone(`Fee plan created for ${form.student} — ${form.course} (${form.parts} installment${form.parts > 1 ? "s" : ""})`);
          setForm((f) => ({ ...f, student: "", phone: "" }));
        }}
      >
        <div className="col-span-2">
          <Field label="Student name">
            <input required className={inputCls} value={form.student} onChange={up("student")} placeholder="Full student name" />
          </Field>
        </div>
        <Field label="Phone">
          <input className={inputCls} value={form.phone} onChange={up("phone")} placeholder="+91" />
        </Field>
        <Field label="Centre">
          <select className={inputCls} value={form.centre} onChange={up("centre")}>
            {ADMISSION_CENTRES.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
            <option value="Online">Online</option>
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Class / Course Program">
            <select className={inputCls} value={form.course} onChange={(e) => onCourseChange(e.target.value)}>
              <option value="Divya Yoga">Divya Yoga (Age 6 – 8) — ₹63,000 / ₹5,250 mo</option>
              <option value="Divya Mantra">Divya Mantra (Age 9 – 10) — ₹70,000 / ₹5,833 mo</option>
              <option value="Divya Mudra">Divya Mudra (Age 11 – 12) — ₹74,000 / ₹6,167 mo</option>
              <option value="Divya Tratak">Divya Tratak (Age 13 – 14) — ₹78,000 / ₹6,500 mo</option>
            </select>
          </Field>
        </div>
        <Field label="Section / Batch">
          <input className={inputCls} value={form.batch} onChange={up("batch")} placeholder="e.g. Section A" />
        </Field>
        <Field label="Fee Basis / Installments">
          <select className={inputCls} value={form.parts} onChange={up("parts")}>
            <option value={1}>Annual Plan (One-time ₹{(COURSE_FEES[form.course]?.annual ?? 63000).toLocaleString("en-IN")})</option>
            <option value={12}>Monthly Plan (12 × ₹{(COURSE_FEES[form.course]?.monthly ?? 5250).toLocaleString("en-IN")}/mo)</option>
            <option value={2}>Half-Yearly (2 × ₹{Math.round((COURSE_FEES[form.course]?.annual ?? 63000) / 2).toLocaleString("en-IN")})</option>
            <option value={4}>Quarterly (4 × ₹{Math.round((COURSE_FEES[form.course]?.annual ?? 63000) / 4).toLocaleString("en-IN")})</option>
          </select>
        </Field>
        <Field label="Total fee (₹, incl. GST & kit)">
          <input type="number" min={1} className={inputCls} value={form.total} onChange={up("total")} />
        </Field>
        <Field label="First due date">
          <input type="date" className={inputCls} value={form.firstDue} onChange={up("firstDue")} />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" icon="check">
            Create plan
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
