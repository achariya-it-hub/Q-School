"use client";

import { useMemo, useState } from "react";
import { accountTotals, fmtDate, gstSplit, inr, type FeeAccount, type PayMethod, type PaymentTxn } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Field, Figure, Modal, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { HBars, ViewToggle } from "@/components/admin/charts";
import { CollectModal, PaymentPrintPromptModal, TXN_TONE, useFinance, type GeneratedFeeDocs } from "@/components/admin/finance";
import { downloadCsv } from "@/components/admin/store";

type F = "All" | "Success" | "Partly Paid" | "Failed" | "Refunded";

export default function PaymentsPage() {
  const f = useFinance();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<F>("All");
  const [mixTable, setMixTable] = useState(false);
  const [printDocs, setPrintDocs] = useState<GeneratedFeeDocs | null>(null);
  const [pickOpen, setPickOpen] = useState(false);
  const [collectAcc, setCollectAcc] = useState<FeeAccount | null>(null);
  const [toast, show] = useToast();
  const unpaidAccounts = useMemo(
    () => f.accounts.filter((a) => accountTotals(a).outstanding > 0),
    [f.accounts],
  );

  const list = useMemo(
    () =>
      f.payments
        .filter((p) => status === "All" || p.status === status)
        .filter((p) => `${p.id} ${p.student} ${p.ref} ${p.receiptNo ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [f.payments, status, q],
  );

  const ok = f.payments.filter((p) => p.status === "Success" || p.status === "Partly Paid");
  const now = new Date();
  const curYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYm = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const curLabel = now.toLocaleString("en-IN", { month: "long" });
  const prevLabel = prevDate.toLocaleString("en-IN", { month: "long" });
  const curSum = ok.filter((p) => p.date.startsWith(curYm)).reduce((a, p) => a + p.amount, 0);
  const prevSum = ok.filter((p) => p.date.startsWith(prevYm)).reduce((a, p) => a + p.amount, 0);
  const failed = f.payments.filter((p) => p.status === "Failed");
  const refunds = f.payments.filter((p) => p.status === "Refunded").reduce((a, p) => a + p.amount, 0);

  const openDocsForPayment = (p: PaymentTxn) => {
    const acc = f.accounts.find((a) => a.id === p.accountId);
    if (!acc) return;
    const totalFee = acc.installments.reduce((s, i) => s + i.amount, 0);
    const paidTillDate = acc.installments
      .filter((i) => i.paidOn && !i.refunded && i.no <= p.instNo)
      .reduce((s, i) => s + i.amount, 0);
    const balanceRemaining = Math.max(0, Math.round((totalFee - paidTillDate) * 100) / 100);
    const inv =
      f.invoices.find((x) => x.accountId === p.accountId && x.instNo === p.instNo) ?? {
        id: `INV-2026-${p.accountId.replace(/[^A-Za-z0-9]/g, "")}-${String(p.instNo).padStart(2, "0")}`,
        accountId: p.accountId,
        instNo: p.instNo,
        student: p.student,
        email: acc.email,
        phone: acc.phone,
        item: p.item,
        batch: acc.batch || "Section A",
        amount: p.amount,
        gst: gstSplit(p.amount).tax,
        date: p.date,
        due: p.date,
        method: p.method,
        status: "Paid" as const,
      };
    setPrintDocs({
      receipt: p,
      invoice: inv,
      account: acc,
      partNumber: p.instNo,
      isPartPayment: p.amount < totalFee,
      totalFee,
      paidTillDate,
      balanceRemaining,
    });
  };

  const methods: PayMethod[] = ["UPI", "Card", "Net Banking", "EMI", "Cash", "Cheque"];
  const mix = methods
    .map((m) => ({ label: m, value: ok.filter((p) => p.method === m).reduce((a, p) => a + p.amount, 0) }))
    .filter((m) => m.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <AdminShell>
      <PageHeader title="Payments" sub="Every transaction from Easebuzz, Razorpay, UPI, counters and EMI partners">
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
        {unpaidAccounts.length > 0 && (
          <Btn
            icon="plus"
            onClick={() => {
              if (unpaidAccounts.length === 1) setCollectAcc(unpaidAccounts[0]);
              else setPickOpen(true);
            }}
          >
            Record payment
          </Btn>
        )}
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label={`Collected · ${curLabel}`} value={inr(curSum)} sub="Month to date" icon="rupee" />
        <Figure label={`Collected · ${prevLabel}`} value={inr(prevSum)} sub={`${ok.filter((p) => p.date.startsWith(prevYm)).length} payments`} icon="checkCircle" />
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
              options={(["All", "Success", "Partly Paid", "Failed", "Refunded"] as F[]).map((v) => ({ value: v, label: v }))}
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
                  <Td>
                    {p.receiptNo ? (
                      <button
                        type="button"
                        onClick={() => openDocsForPayment(p)}
                        className="font-mono text-[12px] font-semibold text-brand-teal hover:underline"
                      >
                        {p.receiptNo}
                      </button>
                    ) : (
                      <span className="text-[#41564f]">—</span>
                    )}
                  </Td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13px] text-[#7B8E89]">
                    {f.payments.length === 0 ? "No payment transactions recorded yet." : "No payments match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </DataGrid>
        </Card>

        <Card title="Collections by method" action={<ViewToggle table={mixTable} onChange={setMixTable} />}>
          <HBars data={mix} table={mixTable} valueCol="Collected" format={(v) => inr(v)} valueWidth={78} />
          <p className="mt-4 text-[12px] text-[#6b807b]">Successful payments, all time, excluding refunds.</p>
        </Card>
      </div>
      <Modal open={pickOpen} title="Select student to collect fee" onClose={() => setPickOpen(false)}>
        <div className="space-y-3 text-[13px]">
          <Field label="Student / Fee Account">
            <select
              className={inputCls}
              defaultValue=""
              onChange={(e) => {
                const chosen = unpaidAccounts.find((a) => a.id === e.target.value);
                if (chosen) {
                  setPickOpen(false);
                  setCollectAcc(chosen);
                }
              }}
            >
              <option value="" disabled>
                Choose a student with pending balance…
              </option>
              {unpaidAccounts.map((a) => {
                const t = accountTotals(a);
                return (
                  <option key={a.id} value={a.id}>
                    {a.student} ({a.id}) — {a.course} · Bal {inr(t.outstanding)}
                  </option>
                );
              })}
            </select>
          </Field>
        </div>
      </Modal>
      <CollectModal
        account={collectAcc}
        onClose={() => setCollectAcc(null)}
        onDone={(m, docs) => {
          setCollectAcc(null);
          show(m);
          if (docs) setPrintDocs(docs);
          f.reloadStudents?.();
        }}
      />
      <PaymentPrintPromptModal docs={printDocs} onClose={() => setPrintDocs(null)} />
      <Toast msg={toast} />
    </AdminShell>
  );
}
