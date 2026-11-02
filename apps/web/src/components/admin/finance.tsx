"use client";

import { useMemo, useState } from "react";
import {
  accountTotals,
  derivePayments,
  deriveInvoices,
  fmtDate,
  fmtDateIN,
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
  name: "Q SCHOOL",
  unit: "(A UNIT OF DIVINE GRACE FOUNDATION)",
  header: "INVOICE CUM RECEIPT",
  subHeader: "FEES RECEIPT, INVOICE",
  addr: "2nd Floor, 14 Anna Nagar East, Chennai 600102, Tamil Nadu",
  gstin: "33AABCQ1234F1Z5",
  sac: "999293",
  email: "accounts@theqschool.com",
};

export function InvoiceView({ inv }: { inv: InvoiceDoc }) {
  const g = gstSplit(inv.amount);
  const isPaid = inv.status === "Paid";
  const payable = inv.amount;
  const paid = isPaid ? inv.amount : 0;
  const dues = isPaid ? 0 : inv.amount;
  const dateFormatted = fmtDateIN(inv.date);
  const payMode = inv.method ? (inv.method === "UPI" || inv.method === "Card" || inv.method === "Net Banking" ? `Online Payment (${inv.method})` : inv.method) : "Online Payment / Pending";

  return (
    <div className="print-area rounded-xl border border-black/80 bg-white p-6 text-[12.5px] text-black shadow-sm">
      {/* Official Header */}
      <div className="relative pb-3 text-center">
        <div className="absolute right-0 top-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-[26px] font-black uppercase tracking-wider text-[#054038]">{ORG.name}</h1>
        <p className="mt-0.5 text-[12px] font-bold uppercase tracking-wider text-[#1F3D36]">{ORG.unit}</p>
        <div className="mt-1">
          <span className="inline-block border-b border-black pb-0.5 text-[13px] font-bold uppercase tracking-wider text-black">
            {ORG.header}
          </span>
        </div>
      </div>

      {/* Two-column Metadata */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border-t border-black/30 py-3 text-[12.5px]">
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Name</span>
          <span className="font-bold uppercase text-black">: {inv.student}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Receipt No.</span>
          <span className="font-mono font-bold text-black">: {inv.id}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Father&apos;s Name</span>
          <span className="font-semibold uppercase text-black">: PARENT</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Date</span>
          <span className="font-semibold text-black">: {dateFormatted}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Admission No.</span>
          <span className="font-mono font-semibold text-black">: {inv.accountId.replace("FA-", "00000")}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Roll No</span>
          <span className="font-semibold text-black">: 0</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Class</span>
          <span className="font-bold text-[#054038]">: {inv.item}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Section</span>
          <span className="font-semibold text-black">: {inv.batch?.replace(/.*Batch\s*/i, "") || "A"}</span>
        </div>
      </div>

      {/* Table */}
      <table className="mt-2 w-full border-collapse border border-black text-[12.5px]">
        <thead>
          <tr className="border-b border-black bg-[#F0F5F3] font-bold text-center">
            <th className="w-12 border-r border-black px-3 py-1.5">Sl</th>
            <th className="border-r border-black px-3 py-1.5 text-left">Particulars</th>
            <th className="w-36 border-r border-black px-3 py-1.5 text-right">Payable</th>
            <th className="w-36 px-3 py-1.5 text-right">Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black px-3 py-2 text-center">1</td>
            <td className="border-r border-black px-3 py-2 font-semibold text-black">
              {inv.item}
              <div className="text-[11px] font-normal text-gray-600">
                SAC: {ORG.sac} · Taxable: ₹ {g.taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (CGST 9% + SGST 9%)
              </div>
            </td>
            <td className="border-r border-black px-3 py-2 text-right tabular-nums">
              ₹ {payable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-bold">
              ₹ {paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black bg-[#F8FAF9] font-bold">
            <td colSpan={2} className="border-r border-black px-3 py-1.5 text-left">
              TOTAL
            </td>
            <td className="border-r border-black px-3 py-1.5 text-right tabular-nums">
              ₹ {payable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums">
              ₹ {paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black font-bold">
            <td colSpan={3} className="border-r border-black px-3 py-1.5 text-left">
              Dues
            </td>
            <td className={`px-3 py-1.5 text-right tabular-nums ${dues > 0 ? "text-red-700 font-bold" : ""}`}>
              ₹ {dues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <div className="mt-1 border-b border-black py-2 text-[12px] font-bold text-black">
        Received Amount In Words :- Rupees {numberToWords(paid).toUpperCase()} Only
      </div>

      {/* Remarks box */}
      <div className="mt-2 border border-black p-2.5 text-[12px] leading-relaxed">
        <div className="font-semibold text-black">Remarks:-</div>
        <div className="mt-0.5 font-semibold text-[#054038]">
          Pay Mode : {payMode} · Status: {inv.status}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-[10.5px] font-medium tracking-wide text-gray-700">
        **This is a computer generated receipt, hence, no signature is required**
      </div>
    </div>
  );
}

export function ReceiptView({ p, account }: { p: PaymentTxn; account?: FeeAccount }) {
  const t = account ? accountTotals(account) : null;
  const payable = t ? t.total : p.amount;
  const paid = p.amount;
  const dues = t ? Math.max(0, t.outstanding) : 0;
  const dateFormatted = fmtDateIN(p.date);
  const fatherName = account?.fatherName || "PARENT";
  const admissionNo = account?.admissionNo || (account?.id ? account.id.replace("FA-", "00000") : "000001");
  const rollNo = account?.rollNo ?? 0;
  const section = account?.section || (account?.batch?.replace(/.*Batch\s*/i, "") || "A");
  const courseName = account?.course || p.item;
  const receiptNo = p.receiptNo || "REC-00000007";
  const payMode = p.method === "UPI" || p.method === "Net Banking" || p.method === "Card" ? "Online Payment" : p.method;

  return (
    <div className="print-area rounded-xl border border-black/80 bg-white p-6 text-[12.5px] text-black shadow-sm">
      {/* Official Header */}
      <div className="relative pb-3 text-center">
        <div className="absolute right-0 top-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-[26px] font-black uppercase tracking-wider text-[#054038]">{ORG.name}</h1>
        <p className="mt-0.5 text-[12px] font-bold uppercase tracking-wider text-[#1F3D36]">{ORG.unit}</p>
        <div className="mt-1">
          <span className="inline-block border-b border-black pb-0.5 text-[13px] font-bold uppercase tracking-wider text-black">
            {ORG.header}
          </span>
        </div>
      </div>

      {/* Two-column Metadata */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border-t border-black/30 py-3 text-[12.5px]">
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Name</span>
          <span className="font-bold uppercase text-black">: {p.student}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Receipt No.</span>
          <span className="font-mono font-bold text-black">: {receiptNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Father&apos;s Name</span>
          <span className="font-semibold uppercase text-black">: {fatherName}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Date</span>
          <span className="font-semibold text-black">: {dateFormatted}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Admission No.</span>
          <span className="font-mono font-semibold text-black">: {admissionNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Roll No</span>
          <span className="font-semibold text-black">: {rollNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Class</span>
          <span className="font-bold text-[#054038]">: {courseName}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Section</span>
          <span className="font-semibold text-black">: {section}</span>
        </div>
      </div>

      {/* Table */}
      <table className="mt-2 w-full border-collapse border border-black text-[12.5px]">
        <thead>
          <tr className="border-b border-black bg-[#F0F5F3] font-bold text-center">
            <th className="w-12 border-r border-black px-3 py-1.5">Sl</th>
            <th className="border-r border-black px-3 py-1.5 text-left">Particulars</th>
            <th className="w-36 border-r border-black px-3 py-1.5 text-right">Payable</th>
            <th className="w-36 px-3 py-1.5 text-right">Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black px-3 py-2 text-center">1</td>
            <td className="border-r border-black px-3 py-2 font-semibold text-black">
              {courseName}
            </td>
            <td className="border-r border-black px-3 py-2 text-right tabular-nums">
              ₹ {payable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-bold">
              ₹ {paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black bg-[#F8FAF9] font-bold">
            <td colSpan={2} className="border-r border-black px-3 py-1.5 text-left">
              TOTAL
            </td>
            <td className="border-r border-black px-3 py-1.5 text-right tabular-nums">
              ₹ {payable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums">
              ₹ {paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black font-bold">
            <td colSpan={3} className="border-r border-black px-3 py-1.5 text-left">
              Dues
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums">
              ₹ {dues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <div className="mt-1 border-b border-black py-2 text-[12px] font-bold text-black">
        Received Amount In Words :- Rupees {numberToWords(paid).toUpperCase()} Only
      </div>

      {/* Remarks box */}
      <div className="mt-2 border border-black p-2.5 text-[12px] leading-relaxed">
        <div className="font-semibold text-black">Remarks:-</div>
        <div className="mt-0.5 font-semibold text-[#054038]">
          Pay Mode : {payMode} {p.ref && p.ref !== "—" ? `(Ref: ${p.ref})` : ""}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-[10.5px] font-medium tracking-wide text-gray-700">
        **This is a computer generated receipt, hence, no signature is required**
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
