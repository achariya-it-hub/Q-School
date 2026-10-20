"use client";

import { useMemo, useState } from "react";
import { fmtDate, inr, type PayMethod } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Figure, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th } from "@/components/admin/ui";
import { HBars, ViewToggle } from "@/components/admin/charts";
import { TXN_TONE, useFinance } from "@/components/admin/finance";
import { downloadCsv } from "@/components/admin/store";

type F = "All" | "Success" | "Failed" | "Refunded";

export default function PaymentsPage() {
  const f = useFinance();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<F>("All");
  const [mixTable, setMixTable] = useState(false);

  const list = useMemo(
    () =>
      f.payments
        .filter((p) => status === "All" || p.status === status)
        .filter((p) => `${p.id} ${p.student} ${p.ref} ${p.receiptNo ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [f.payments, status, q],
  );

  const ok = f.payments.filter((p) => p.status === "Success");
  const sept = ok.filter((p) => p.date.startsWith("2026-09")).reduce((a, p) => a + p.amount, 0);
  const oct = ok.filter((p) => p.date.startsWith("2026-10")).reduce((a, p) => a + p.amount, 0);
  const failed = f.payments.filter((p) => p.status === "Failed");
  const refunds = f.payments.filter((p) => p.status === "Refunded").reduce((a, p) => a + p.amount, 0);

  const methods: PayMethod[] = ["UPI", "Card", "Net Banking", "EMI", "Cash", "Cheque"];
  const mix = methods
    .map((m) => ({ label: m, value: ok.filter((p) => p.method === m).reduce((a, p) => a + p.amount, 0) }))
    .filter((m) => m.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <AdminShell>
      <PageHeader title="Payments" sub="Every transaction from Razorpay, UPI, counters and EMI partners">
        <Btn
          variant="ghost"
          icon="download"
          onClick={() =>
            downloadCsv(
              "qschool-payments.csv",
              ["Txn", "Date", "Student", "Item", "Method", "Reference", "Amount", "Status", "Receipt"],
              f.payments.map((p) => [p.id, p.date, p.student, p.item, p.method, p.ref, p.amount, p.status, p.receiptNo ?? ""]),
            )
          }
        >
          Export CSV
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Collected · October" value={inr(oct)} sub="Month to date" icon="rupee" />
        <Figure label="Collected · September" value={inr(sept)} sub={`${ok.filter((p) => p.date.startsWith("2026-09")).length} payments`} icon="checkCircle" />
        <Figure label="Failed attempts" value={String(failed.length)} sub="Retry link sent automatically" icon="xCircle" />
        <Figure label="Refunds" value={inr(refunds)} sub="Processed this quarter" icon="undo" />
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search txn, student, UTR, receipt…" />
            <Segmented<F>
              label="Status"
              value={status}
              onChange={setStatus}
              options={(["All", "Success", "Failed", "Refunded"] as F[]).map((v) => ({ value: v, label: v }))}
            />
          </div>
          <DataGrid minWidth={860}>
            <thead>
              <tr className="border-b border-[#EEF3F1]">
                <Th>Transaction</Th>
                <Th>Date</Th>
                <Th>Student</Th>
                <Th>Method · reference</Th>
                <Th right>Amount</Th>
                <Th>Status</Th>
                <Th>Receipt</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td className="font-mono text-[12px] text-[#41564f]">{p.id}</Td>
                  <Td className="whitespace-nowrap text-[#41564f]">{fmtDate(p.date)}</Td>
                  <Td>
                    <span className="block font-medium text-brand-ink">{p.student}</span>
                    <span className="block max-w-[200px] truncate text-[11.5px] text-[#6b807b]">{p.item}</span>
                  </Td>
                  <Td>
                    <span className="block text-brand-ink">{p.method}</span>
                    <span className="block max-w-[200px] truncate font-mono text-[11px] text-[#7B8E89]">{p.ref}</span>
                  </Td>
                  <Td right className="font-semibold text-brand-ink">{inr(p.amount)}</Td>
                  <Td>
                    <StatusBadge tone={TXN_TONE[p.status]}>{p.status}</StatusBadge>
                  </Td>
                  <Td className="font-mono text-[12px] text-[#41564f]">{p.receiptNo ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </DataGrid>
        </Card>

        <Card title="Collections by method" action={<ViewToggle table={mixTable} onChange={setMixTable} />}>
          <HBars data={mix} table={mixTable} valueCol="Collected" format={(v) => inr(v)} valueWidth={78} />
          <p className="mt-4 text-[12px] text-[#6b807b]">Successful payments, all time, excluding refunds.</p>
        </Card>
      </div>
    </AdminShell>
  );
}
