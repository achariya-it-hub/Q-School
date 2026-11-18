"use client";

import { useEffect, useMemo, useState } from "react";
import {
  accountTotals,
  centreName,
  derivePayments,
  deriveInvoices,
  fmtDate,
  fmtDateIN,
  gstSplit,
  inr,
  numberToWords,
  studentFeeSummary,
  TODAY_ISO,
  type FeeAccount,
  type InvoiceDoc,
  type PayMethod,
  type PaymentTxn,
  type StudentRecord,
} from "@qschool/shared";
import { Btn, Field, Modal, inputCls, type Tone } from "./ui";
import { recordPayment, useConsole } from "./store";
import { useStudents } from "./students-view";

export const INVOICE_TONE: Record<string, Tone> = { Paid: "good", Pending: "warning", Overdue: "critical", Refunded: "neutral" };
export const TXN_TONE: Record<string, Tone> = { Success: "good", Failed: "critical", Refunded: "neutral" };
export const ACCOUNT_TONE: Record<string, Tone> = { Paid: "good", Due: "warning", Overdue: "critical", Refunded: "neutral" };

function mapModeToPayMethod(mode?: string): PayMethod {
  if (mode === "Bank transfer") return "Net Banking";
  if (mode === "Cash" || mode === "UPI" || mode === "Card" || mode === "Cheque" || mode === "EMI" || mode === "Net Banking") return mode;
  return "UPI";
}

function studentToFeeAccount(s: StudentRecord): FeeAccount {
  const fee = studentFeeSummary(s);
  const createdIso = s.createdAt && !Number.isNaN(Date.parse(s.createdAt)) ? s.createdAt.slice(0, 10) : TODAY_ISO;
  const paidInstallments: FeeAccount["installments"] = fee.payments.map((p, idx) => ({
    no: idx + 1,
    due: p.confirmedAt ? p.confirmedAt.slice(0, 10) : createdIso,
    amount: p.amount,
    paidOn: p.confirmedAt ? p.confirmedAt.slice(0, 10) : createdIso,
    method: mapModeToPayMethod(p.mode),
    ref: p.receiptNo,
  }));
  const nextDueIso = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  })();
  const installments: FeeAccount["installments"] =
    fee.balance > 0
      ? [...paidInstallments, { no: paidInstallments.length + 1, due: paidInstallments.length > 0 ? nextDueIso : createdIso, amount: fee.balance }]
      : paidInstallments.length > 0
      ? paidInstallments
      : [{ no: 1, due: createdIso, amount: fee.totalFee }];

  return {
    id: s.id,
    student: s.studentName,
    fatherName: s.fatherName || s.parentName,
    admissionNo: s.id,
    phone: s.phone,
    email: s.email || "",
    course: s.grade || "Divya Yoga",
    batch: "Section A",
    centre: centreName(s.centreId),
    installments,
  };
}

/** All finance views derive from the same ledger (local fee plans + enrolled students). */
export function useFinance() {
  const localAccounts = useConsole((s) => s.accounts);
  const { students, reload: reloadStudents } = useStudents();
  return useMemo(() => {
    const existingNames = new Set(localAccounts.map((a) => a.student.trim().toLowerCase()));
    const enrolledAccounts = students
      .filter((s) => !existingNames.has(s.studentName.trim().toLowerCase()))
      .map(studentToFeeAccount);
    const accounts = [...enrolledAccounts, ...localAccounts];
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
      reloadStudents,
    };
  }, [localAccounts, students, reloadStudents]);
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

/** Record a full or part fee payment against an account's unpaid installment → issues a receipt and keeps remaining balance. */
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
  const [payAmount, setPayAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const unpaid = account?.installments.filter((i) => !i.paidOn) ?? [];
  const [instNo, setInstNo] = useState<number | null>(null);
  const chosen = unpaid.find((i) => i.no === (instNo ?? unpaid[0]?.no));

  useEffect(() => {
    if (chosen) {
      setPayAmount(String(chosen.amount));
    }
  }, [account?.id, chosen?.no, chosen?.amount]);

  const numericPay = Number(payAmount) > 0 ? Math.min(Number(payAmount), chosen?.amount ?? 0) : chosen?.amount ?? 0;
  const remainingAfter = chosen ? Math.max(0, Math.round((chosen.amount - numericPay) * 100) / 100) : 0;

  return (
    <Modal open={!!account} title="Collect fee (Full or Part Payment)" onClose={onClose}>
      {account && chosen && (
        <form
          className="space-y-3.5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!(numericPay >= 1)) return;
            const receiptRef = ref.trim() || `${method}/${Date.now().toString().slice(-8)}`;
            if (account.id.startsWith("STU-")) {
              setBusy(true);
              const modeForApi = method === "Net Banking" ? "Bank transfer" : method === "EMI" ? "Card" : method;
              await fetch("/api/students", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: account.id,
                  action: "activate",
                  amount: numericPay,
                  mode: modeForApi,
                  receiptNo: receiptRef,
                  note: remainingAfter > 0 ? `Part payment (Balance ${inr(remainingAfter)})` : "Full balance paid",
                }),
              });
              setBusy(false);
            } else {
              recordPayment(account.id, chosen.no, method, receiptRef, numericPay);
            }
            onDone(
              remainingAfter > 0
                ? `Part payment of ${inr(numericPay)} recorded — remaining balance ${inr(remainingAfter)}`
                : `Payment of ${inr(numericPay)} recorded — receipt issued to ${account.student}`,
            );
            setRef("");
            setInstNo(null);
          }}
        >
          <div className="rounded-xl bg-[#F3F8F6] p-3 text-[13px]">
            <p className="font-semibold text-brand-ink">{account.student}</p>
            <p className="text-[#5C716C]">
              {account.course} · {account.batch} · {account.centre}
            </p>
          </div>
          <Field label="Installment / Due Balance">
            <select className={inputCls} value={chosen.no} onChange={(e) => setInstNo(Number(e.target.value))}>
              {unpaid.map((i) => (
                <option key={i.no} value={i.no}>
                  #{i.no} · due {fmtDate(i.due)} · {inr(i.amount)}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5C716C]">
              Part-Payment Options
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Full Due", val: chosen.amount },
                { label: "50% Part", val: Math.round(chosen.amount / 2) },
                { label: "25% Part", val: Math.round(chosen.amount / 4) },
                { label: "₹10,000", val: 10000 },
                { label: "₹5,000", val: 5000 },
              ]
                .filter((p, idx) => idx === 0 || (p.val > 0 && p.val < chosen.amount))
                .map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPayAmount(String(p.val))}
                    className={`rounded-lg border px-2.5 py-1 text-[11.5px] font-semibold transition ${
                      Math.round(numericPay) === p.val
                        ? "border-brand-deep bg-brand-deep text-white"
                        : "border-[#CFE3DD] bg-[#F7FAF9] text-brand-deep hover:border-brand-teal"
                    }`}
                  >
                    {p.label} ({inr(p.val)})
                  </button>
                ))}
            </div>
          </div>

          <Field label="Amount collecting now (₹)">
            <input
              required
              type="number"
              min="1"
              max={chosen.amount}
              step="0.01"
              className={inputCls}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </Field>

          {remainingAfter > 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] text-amber-900">
              <b>Part payment:</b> Collecting <b>{inr(numericPay)}</b> today · Remaining <b>{inr(remainingAfter)}</b> stays due as the next installment.
            </p>
          )}

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
              Collecting <span className="text-[18px] font-bold text-brand-ink">{inr(numericPay)}</span>
            </p>
            <Btn type="submit" icon="check" disabled={busy}>
              {busy ? "Recording…" : remainingAfter > 0 ? "Record part payment" : "Record payment"}
            </Btn>
          </div>
        </form>
      )}
    </Modal>
  );
}
