"use client";

import { useMemo, useState } from "react";
import {
  accountTotals,
  derivePayments,
  deriveInvoices,
  fmtDate,
  gstSplit,
  inr,
  numberToWords,
  type FeeAccount,
  type InvoiceDoc,
  type PayMethod,
  type PaymentTxn,
} from "@qschool/shared";
import { Btn, Field, Modal, inputCls, type Tone } from "./ui";
import { recordPayment, useConsole } from "./store";

export const INVOICE_TONE: Record<string, Tone> = { Paid: "good", Pending: "warning", Overdue: "critical", Refunded: "neutral" };
export const TXN_TONE: Record<string, Tone> = { Success: "good", Failed: "critical", Refunded: "neutral" };
export const ACCOUNT_TONE: Record<string, Tone> = { Paid: "good", Due: "warning", Overdue: "critical", Refunded: "neutral" };

/** All finance views derive from the same ledger. */
export function useFinance() {
  const accounts = useConsole((s) => s.accounts);
  return useMemo(() => {
    const invoices = deriveInvoices(accounts);
    const payments = derivePayments(accounts);
    const totals = accounts.map((a) => ({ a, t: accountTotals(a) }));
    const sum = (f: (t: ReturnType<typeof accountTotals>) => number) => totals.reduce((s, x) => s + f(x.t), 0);
    return {
      accounts,
      invoices,
      payments,
      receipts: payments.filter((p) => p.receiptNo),
      totals,
      billed: sum((t) => t.total),
      collected: sum((t) => t.paid),
      outstanding: sum((t) => t.outstanding),
      overdue: sum((t) => t.overdue),
    };
  }, [accounts]);
}

const ORG = {
  name: "Q-School Learning Pvt. Ltd.",
  addr: "2nd Floor, 14 Anna Nagar East, Chennai 600102, Tamil Nadu",
  gstin: "33AABCQ1234F1Z5",
  sac: "999293",
  email: "accounts@qschool.com",
};

function DocHeader({ title, no, date }: { title: string; no: string; date: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E2ECE9] pb-4">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Q-School" className="h-10 w-auto" />
        <p className="mt-2 text-[12px] font-semibold text-brand-ink">{ORG.name}</p>
        <p className="max-w-[260px] text-[11px] text-[#5C716C]">{ORG.addr}</p>
        <p className="text-[11px] text-[#5C716C]">GSTIN {ORG.gstin}</p>
      </div>
      <div className="text-right">
        <p className="text-[18px] font-bold uppercase tracking-wide text-brand-deep">{title}</p>
        <p className="mt-1 font-mono text-[12px] text-brand-ink">{no}</p>
        <p className="text-[12px] text-[#5C716C]">{date}</p>
      </div>
    </div>
  );
}

export function InvoiceView({ inv }: { inv: InvoiceDoc }) {
  const g = gstSplit(inv.amount);
  return (
    <div className="print-area rounded-xl border border-[#E2ECE9] bg-white p-5 text-[12.5px]">
      <DocHeader title="Tax Invoice" no={inv.id} date={fmtDate(inv.date)} />
      <div className="grid grid-cols-2 gap-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#7B8E89]">Billed to</p>
          <p className="font-semibold text-brand-ink">{inv.student}</p>
          <p className="text-[#5C716C]">{inv.phone}</p>
          <p className="text-[#5C716C]">{inv.email}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase text-[#7B8E89]">Due date</p>
          <p className="font-semibold text-brand-ink">{fmtDate(inv.due)}</p>
          <p className="text-[#5C716C]">Batch {inv.batch}</p>
          <p className="text-[#5C716C]">Place of supply: Tamil Nadu (33)</p>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-y border-[#E2ECE9] text-[11px] uppercase text-[#7B8E89]">
            <th className="py-2 font-semibold">Description</th>
            <th className="py-2 font-semibold">SAC</th>
            <th className="py-2 text-right font-semibold">Taxable value</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          <tr className="border-b border-[#F0F4F3]">
            <td className="py-2.5 text-brand-ink">{inv.item}</td>
            <td className="py-2.5 text-[#5C716C]">{ORG.sac}</td>
            <td className="py-2.5 text-right text-brand-ink">{inr(g.taxable)}</td>
          </tr>
        </tbody>
      </table>
      <div className="ml-auto mt-3 w-full max-w-[260px] space-y-1 tabular-nums">
        <Row k="Taxable value" v={inr(g.taxable)} />
        <Row k="CGST @ 9%" v={inr(g.cgst)} />
        <Row k="SGST @ 9%" v={inr(g.sgst)} />
        <div className="flex justify-between border-t border-[#E2ECE9] pt-2 text-[14px] font-bold text-brand-ink">
          <span>Total</span>
          <span>{inr(inv.amount)}</span>
        </div>
      </div>
      <p className="mt-3 text-[11.5px] text-[#5C716C]">Amount in words: Rupees {numberToWords(inv.amount)} only</p>
      <p className="mt-1 text-[11.5px] text-[#5C716C]">
        Status: <span className="font-semibold text-brand-ink">{inv.status}</span>
        {inv.method ? ` · paid by ${inv.method}` : " · pay via UPI, card or net banking at qschool.com/pay"}
      </p>
      <p className="mt-4 border-t border-dashed border-[#E2ECE9] pt-3 text-center text-[10.5px] text-[#7B8E89]">
        This is a computer-generated invoice. Queries: {ORG.email}
      </p>
    </div>
  );
}

export function ReceiptView({ p, account }: { p: PaymentTxn; account?: FeeAccount }) {
  const t = account ? accountTotals(account) : null;
  return (
    <div className="print-area rounded-xl border border-[#E2ECE9] bg-white p-5 text-[12.5px]">
      <DocHeader title="Fee Receipt" no={p.receiptNo ?? ""} date={fmtDate(p.date)} />
      <div className="mt-4 rounded-xl bg-[#F3F8F6] p-4 text-center">
        <p className="text-[11px] font-semibold uppercase text-[#5C716C]">Amount received</p>
        <p className="mt-1 text-[28px] font-bold text-brand-ink">{inr(p.amount)}</p>
        <p className="text-[11.5px] text-[#5C716C]">Rupees {numberToWords(p.amount)} only</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <Def k="Received from" v={p.student} />
        <Def k="Towards" v={`${p.item}${account && account.installments.length > 1 ? ` — inst. ${p.instNo}` : ""}`} />
        <Def k="Payment mode" v={p.method} />
        <Def k="Reference" v={p.ref} mono />
        <Def k="Transaction" v={p.id} mono />
        {t && <Def k="Balance due" v={t.status === "Refunded" ? "Refunded" : inr(t.outstanding)} />}
      </dl>
      {p.status === "Refunded" && (
        <p className="mt-3 rounded-lg bg-[#F1F5F4] px-3 py-2 text-[11.5px] font-semibold text-[#41564F]">This payment was refunded.</p>
      )}
      <div className="mt-6 flex items-end justify-between">
        <p className="text-[10.5px] text-[#7B8E89]">Computer-generated receipt — no signature required.</p>
        <p className="text-right text-[11px] text-[#5C716C]">
          For {ORG.name}
          <br />
          <span className="font-semibold text-brand-ink">Accounts Department</span>
        </p>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-[#41564f]">
      <span>{k}</span>
      <span className="text-brand-ink">{v}</span>
    </div>
  );
}

function Def({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] text-[#7B8E89]">{k}</dt>
      <dd className={`font-medium text-brand-ink ${mono ? "font-mono text-[11.5px]" : ""}`}>{v}</dd>
    </div>
  );
}

export function PrintBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-4 flex justify-end gap-2 print:hidden">
      <Btn variant="ghost" onClick={onClose}>
        Close
      </Btn>
      <Btn icon="download" onClick={() => window.print()}>
        Print / Save PDF
      </Btn>
    </div>
  );
}

const METHODS: PayMethod[] = ["UPI", "Card", "Net Banking", "Cash", "Cheque", "EMI"];

/** Record a fee payment against an account's next unpaid installment → issues a receipt. */
export function CollectModal({
  account,
  onClose,
  onDone,
}: {
  account: FeeAccount | null;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [method, setMethod] = useState<PayMethod>("UPI");
  const [ref, setRef] = useState("");
  const unpaid = account?.installments.filter((i) => !i.paidOn) ?? [];
  const [instNo, setInstNo] = useState<number | null>(null);
  const chosen = unpaid.find((i) => i.no === (instNo ?? unpaid[0]?.no));

  return (
    <Modal open={!!account} title="Collect fee payment" onClose={onClose}>
      {account && chosen && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            recordPayment(account.id, chosen.no, method, ref.trim());
            onDone(`Payment of ${inr(chosen.amount)} recorded — receipt issued to ${account.student}`);
            setRef("");
            setInstNo(null);
          }}
        >
          <div className="rounded-xl bg-[#F3F8F6] p-3 text-[13px]">
            <p className="font-semibold text-brand-ink">{account.student}</p>
            <p className="text-[#5C716C]">
              {account.course} · {account.batch}
            </p>
          </div>
          <Field label="Installment">
            <select className={inputCls} value={chosen.no} onChange={(e) => setInstNo(Number(e.target.value))}>
              {unpaid.map((i) => (
                <option key={i.no} value={i.no}>
                  #{i.no} · due {fmtDate(i.due)} · {inr(i.amount)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payment mode">
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-medium ${
                    m === method ? "border-brand-deep bg-brand-deep text-white" : "border-[#E2ECE9] text-[#41564f]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Reference (UTR / txn id / cheque no.)">
            <input className={inputCls} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Optional" />
          </Field>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[13px] text-[#5C716C]">
              Amount <span className="text-[18px] font-bold text-brand-ink">{inr(chosen.amount)}</span>
            </p>
            <Btn type="submit" icon="check">
              Record payment
            </Btn>
          </div>
        </form>
      )}
    </Modal>
  );
}
