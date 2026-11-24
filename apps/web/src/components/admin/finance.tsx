"use client";

import { useEffect, useMemo, useState } from "react";
import {
  accountTotals,
  centreName,
  derivePayments,
  deriveInvoices,
  fmtDate,
  inr,
  studentFeeSummary,
  TODAY_ISO,
  type FeeAccount,
  type PayMethod,
  type StudentRecord,
} from "@qschool/shared";
import { Btn, Field, Modal, inputCls, type Tone } from "./ui";
import { recordPayment, useConsole } from "./store";
import { useStudents } from "./students-view";
import {
  buildDocsForAccountPayment,
  buildDocsForStudentPayment,
  type GeneratedFeeDocs,
} from "./fee-documents";

export {
  InvoiceView,
  ReceiptView,
  PrintBar,
  PaymentPrintPromptModal,
  OnlinePaymentDocsSection,
  buildDocsForStudentPayment,
  buildDocsForAccountPayment,
  type GeneratedFeeDocs,
} from "./fee-documents";

export const INVOICE_TONE: Record<string, Tone> = { Paid: "good", "Partly Paid": "warning", Pending: "warning", Overdue: "critical", Refunded: "neutral" };
export const TXN_TONE: Record<string, Tone> = { Success: "good", "Partly Paid": "warning", Failed: "critical", Refunded: "neutral" };
export const ACCOUNT_TONE: Record<string, Tone> = { Paid: "good", "Partly Paid": "warning", Due: "warning", Overdue: "critical", Refunded: "neutral" };

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

const METHODS: PayMethod[] = ["UPI", "Card", "Net Banking", "Cash", "Cheque", "EMI"];

/** Record a full or part fee payment against an account's unpaid installment → issues Receipt + GST Tax Invoice and prompts to print. */
export function CollectModal({
  account,
  onClose,
  onDone,
}: {
  account: FeeAccount | null;
  onClose: () => void;
  onDone: (msg: string, docs?: GeneratedFeeDocs) => void;
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
            let docs: GeneratedFeeDocs | undefined;
            if (account.id.startsWith("STU-")) {
              setBusy(true);
              const modeForApi = method === "Net Banking" ? "Bank transfer" : method === "EMI" ? "Card" : method;
              const res = await fetch("/api/students", {
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
              const j = await res.json().catch(() => ({}));
              setBusy(false);
              docs =
                (j.student ? buildDocsForStudentPayment(j.student) : null) ??
                buildDocsForAccountPayment(account, numericPay, method, receiptRef, chosen.no);
            } else {
              docs = buildDocsForAccountPayment(account, numericPay, method, receiptRef, chosen.no);
              recordPayment(account.id, chosen.no, method, receiptRef, numericPay);
            }
            onDone(
              remainingAfter > 0
                ? `Part payment of ${inr(numericPay)} recorded — Receipt & Tax Invoice generated`
                : `Payment of ${inr(numericPay)} recorded — Receipt & Tax Invoice generated`,
              docs,
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
