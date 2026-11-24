"use client";

import { useEffect, useState } from "react";
import {
  accountTotals,
  centreName,
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
import { Btn, Modal } from "./ui";

const ORG = {
  name: "Q SCHOOL",
  unit: "(A UNIT OF DIVINE GRACE FOUNDATION)",
  addr: "2nd Floor, 14 Anna Nagar East, Chennai 600102, Tamil Nadu",
  gstin: "33AABCQ1234F1Z5",
  sac: "999293",
  email: "accounts@theqschool.com",
};

export interface GeneratedFeeDocs {
  receipt: PaymentTxn;
  invoice: InvoiceDoc;
  account: FeeAccount;
  partNumber: number;
  isPartPayment: boolean;
  totalFee: number;
  paidTillDate: number;
  balanceRemaining: number;
}

function toPayMethod(mode?: string): PayMethod {
  const m = String(mode || "");
  if (m === "Bank transfer" || /net\s*banking/i.test(m)) return "Net Banking";
  if (/card|emi/i.test(m)) return "Card";
  if (/cash/i.test(m)) return "Cash";
  if (/cheque/i.test(m)) return "Cheque";
  return "UPI";
}

/** Build official Receipt + Tax Invoice documents for a specific full or part payment on a StudentRecord. */
export function buildDocsForStudentPayment(student: StudentRecord, paymentIndex?: number): GeneratedFeeDocs | null {
  const fee = studentFeeSummary(student);
  if (!fee.payments.length) return null;
  const idx =
    typeof paymentIndex === "number" && paymentIndex >= 0 && paymentIndex < fee.payments.length
      ? paymentIndex
      : fee.payments.length - 1;
  const target = fee.payments[idx];
  const partNumber = idx + 1;
  const paidUpToThis = Math.round(fee.payments.slice(0, idx + 1).reduce((s, x) => s + (Number(x.amount) || 0), 0) * 100) / 100;
  const balanceAfterThis = Math.max(0, Math.round((fee.totalFee - paidUpToThis) * 100) / 100);
  const isPartPayment = target.amount < fee.totalFee || fee.payments.length > 1;

  const dateIso =
    target.confirmedAt && !Number.isNaN(Date.parse(target.confirmedAt))
      ? target.confirmedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  const method = toPayMethod(target.mode);
  const courseName = student.grade || "Divya Yoga";
  const itemLabel = isPartPayment
    ? `${courseName} — Part Payment #${partNumber}${balanceAfterThis === 0 ? " (Final Settlement)" : ""}`
    : courseName;
  const receiptNo = target.receiptNo?.startsWith("REC-")
    ? target.receiptNo
    : `REC-${student.id.replace(/\D/g, "").padStart(4, "0")}-${String(partNumber).padStart(2, "0")}`;
  const invoiceNo = `INV-2026-${student.id.replace(/\D/g, "").padStart(4, "0")}-${String(partNumber).padStart(2, "0")}`;

  const installments: FeeAccount["installments"] = fee.payments.slice(0, idx + 1).map((p, k) => ({
    no: k + 1,
    due: p.confirmedAt ? p.confirmedAt.slice(0, 10) : dateIso,
    amount: p.amount,
    paidOn: p.confirmedAt ? p.confirmedAt.slice(0, 10) : dateIso,
    method: toPayMethod(p.mode),
    ref: p.receiptNo,
  }));
  if (balanceAfterThis > 0) {
    installments.push({
      no: installments.length + 1,
      due: dateIso,
      amount: balanceAfterThis,
    });
  }

  const account: FeeAccount = {
    id: student.id,
    student: student.studentName,
    fatherName: student.fatherName || student.parentName,
    admissionNo: student.id,
    phone: student.phone,
    email: student.email || "",
    course: courseName,
    batch: "Section A",
    centre: centreName(student.centreId),
    installments,
  };

  const receipt: PaymentTxn = {
    id: `TXN-${student.id.replace(/\D/g, "")}-${partNumber}`,
    accountId: student.id,
    instNo: partNumber,
    student: student.studentName,
    item: itemLabel,
    amount: target.amount,
    method,
    ref: target.receiptNo || "—",
    date: dateIso,
    status: "Success",
    receiptNo,
  };

  const invoice: InvoiceDoc = {
    id: invoiceNo,
    accountId: student.id,
    instNo: partNumber,
    student: student.studentName,
    email: student.email || "",
    phone: student.phone,
    item: itemLabel,
    batch: "Section A",
    amount: target.amount,
    gst: gstSplit(target.amount).tax,
    date: dateIso,
    due: dateIso,
    method,
    status: "Paid",
  };

  return {
    receipt,
    invoice,
    account,
    partNumber,
    isPartPayment,
    totalFee: fee.totalFee,
    paidTillDate: paidUpToThis,
    balanceRemaining: balanceAfterThis,
  };
}

/** Build official Receipt + Tax Invoice documents right after collecting on a FeeAccount installment. */
export function buildDocsForAccountPayment(
  account: FeeAccount,
  paidAmount: number,
  method: PayMethod,
  ref: string,
  instNo: number,
): GeneratedFeeDocs {
  const prevPaid = account.installments
    .filter((i) => i.paidOn && !i.refunded && i.no !== instNo)
    .reduce((s, i) => s + i.amount, 0);
  const totalFee = account.installments.reduce((s, i) => s + i.amount, 0);
  const paidTillDate = Math.round((prevPaid + paidAmount) * 100) / 100;
  const balanceRemaining = Math.max(0, Math.round((totalFee - paidTillDate) * 100) / 100);
  const paidCountBefore = account.installments.filter((i) => i.paidOn && !i.refunded && i.no !== instNo).length;
  const partNumber = paidCountBefore + 1;
  const isPartPayment = paidAmount < totalFee || paidCountBefore > 0;
  const todayIso = new Date().toISOString().slice(0, 10);
  const itemLabel = isPartPayment
    ? `${account.course} — Part Payment #${partNumber}${balanceRemaining === 0 ? " (Final Settlement)" : ""}`
    : account.course;
  const cleanId = account.id.replace(/[^A-Za-z0-9]/g, "");
  const receiptNo = ref.startsWith("REC-") ? ref : `REC-${cleanId}-${String(partNumber).padStart(2, "0")}`;
  const invoiceNo = `INV-2026-${cleanId}-${String(partNumber).padStart(2, "0")}`;

  // Synthesize post-payment account snapshot so totals/dues reflect the payment just collected.
  const synthInstallments: FeeAccount["installments"] = [
    ...account.installments.filter((i) => i.paidOn && !i.refunded && i.no !== instNo),
    { no: partNumber, due: todayIso, amount: paidAmount, paidOn: todayIso, method, ref },
    ...(balanceRemaining > 0 ? [{ no: partNumber + 1, due: todayIso, amount: balanceRemaining }] : []),
  ];
  const updatedAccount: FeeAccount = { ...account, installments: synthInstallments };

  const receipt: PaymentTxn = {
    id: `TXN-${cleanId}-${partNumber}`,
    accountId: account.id,
    instNo: partNumber,
    student: account.student,
    item: itemLabel,
    amount: paidAmount,
    method,
    ref: ref || "—",
    date: todayIso,
    status: "Success",
    receiptNo,
  };

  const invoice: InvoiceDoc = {
    id: invoiceNo,
    accountId: account.id,
    instNo: partNumber,
    student: account.student,
    email: account.email,
    phone: account.phone,
    item: itemLabel,
    batch: account.batch || "Section A",
    amount: paidAmount,
    gst: gstSplit(paidAmount).tax,
    date: todayIso,
    due: todayIso,
    method,
    status: "Paid",
  };

  return {
    receipt,
    invoice,
    account: updatedAccount,
    partNumber,
    isPartPayment,
    totalFee,
    paidTillDate,
    balanceRemaining,
  };
}

export function InvoiceView({ inv, account, embedded = false }: { inv: InvoiceDoc; account?: FeeAccount; embedded?: boolean }) {
  const g = gstSplit(inv.amount);
  const isPaid = inv.status === "Paid";
  const t = account ? accountTotals(account) : null;
  const totalCourseFee = t ? t.total : inv.amount;
  const paidThisInvoice = isPaid ? inv.amount : 0;
  const totalPaidToDate = t ? t.paid : paidThisInvoice;
  const balanceDues = t ? Math.max(0, t.outstanding) : isPaid ? 0 : inv.amount;
  const isPart = totalCourseFee > inv.amount;
  const dateFormatted = fmtDateIN(inv.date || TODAY_ISO);
  const fatherName = account?.fatherName || "PARENT";
  const admissionNo = account?.admissionNo || inv.accountId.replace("FA-", "00000");
  const payMode = inv.method
    ? inv.method === "UPI" || inv.method === "Card" || inv.method === "Net Banking"
      ? `Online Payment (${inv.method})`
      : inv.method
    : "Online Payment / Pending";

  return (
    <div className={`${embedded ? "" : "print-area"} rounded-xl border border-black/80 bg-white p-6 text-[12.5px] text-black shadow-sm`}>
      {/* Official Header */}
      <div className="relative pb-3 text-center">
        <div className="absolute right-0 top-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-[26px] font-black uppercase tracking-wider text-[#054038]">{ORG.name}</h1>
        <p className="mt-0.5 text-[12px] font-bold uppercase tracking-wider text-[#1F3D36]">{ORG.unit}</p>
        <p className="mt-0.5 text-[11px] text-gray-700">
          {ORG.addr} · GSTIN: <b>{ORG.gstin}</b>
        </p>
        <div className="mt-1.5">
          <span className="inline-block border-b-2 border-black pb-0.5 text-[13px] font-extrabold uppercase tracking-wider text-black">
            TAX INVOICE {isPart ? "(PART PAYMENT / INSTALLMENT)" : ""}
          </span>
        </div>
      </div>

      {/* Two-column Metadata */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border-t border-black/30 py-3 text-[12.5px]">
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Student Name</span>
          <span className="font-bold uppercase text-black">: {inv.student}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Invoice No.</span>
          <span className="font-mono font-bold text-black">: {inv.id}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Parent Name</span>
          <span className="font-semibold uppercase text-black">: {fatherName}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Invoice Date</span>
          <span className="font-semibold text-black">: {dateFormatted}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Admission No.</span>
          <span className="font-mono font-semibold text-black">: {admissionNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Centre / Section</span>
          <span className="font-semibold text-black">: {account?.centre || (inv.batch?.replace(/.*Batch\s*/i, "") || "Section A")}</span>
        </div>
        <div className="col-span-2 flex">
          <span className="w-32 font-semibold text-gray-800">Program</span>
          <span className="font-bold text-[#054038]">: {inv.item}</span>
        </div>
      </div>

      {/* GST Tax Breakdown Table */}
      <table className="mt-2 w-full border-collapse border border-black text-[12.5px]">
        <thead>
          <tr className="border-b border-black bg-[#F0F5F3] font-bold text-center">
            <th className="w-10 border-r border-black px-2 py-1.5">Sl</th>
            <th className="border-r border-black px-3 py-1.5 text-left">Description &amp; SAC</th>
            <th className="w-28 border-r border-black px-2.5 py-1.5 text-right">Taxable</th>
            <th className="w-28 border-r border-black px-2.5 py-1.5 text-right">GST (18%)</th>
            <th className="w-32 px-3 py-1.5 text-right">Invoice Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black px-2 py-2 text-center">1</td>
            <td className="border-r border-black px-3 py-2 font-semibold text-black">
              {inv.item}
              <div className="text-[11px] font-normal text-gray-600">
                SAC: {ORG.sac} · CGST 9% (₹ {g.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}) + SGST 9% (₹ {g.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
              </div>
            </td>
            <td className="border-r border-black px-2.5 py-2 text-right tabular-nums">
              ₹ {g.taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="border-r border-black px-2.5 py-2 text-right tabular-nums">
              ₹ {g.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-bold">
              ₹ {inv.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black bg-[#F8FAF9] font-bold">
            <td colSpan={4} className="border-r border-black px-3 py-1.5 text-left">
              THIS INVOICE PAID AMOUNT
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-[#054038]">
              ₹ {paidThisInvoice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          {t && (
            <tr className="border-b border-black text-[12px]">
              <td colSpan={4} className="border-r border-black px-3 py-1.5 text-left font-semibold text-gray-800">
                Overall Course Fee: ₹ {totalCourseFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })} · Total Paid Till Date: ₹ {totalPaidToDate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className={`px-3 py-1.5 text-right tabular-nums font-bold ${balanceDues > 0 ? "text-red-700" : "text-[#054038]"}`}>
                Bal: ₹ {balanceDues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-1 border-b border-black py-2 text-[12px] font-bold text-black">
        Invoice Amount In Words :- Rupees {numberToWords(inv.amount).toUpperCase()} Only
      </div>

      <div className="mt-2 border border-black p-2.5 text-[12px] leading-relaxed">
        <div className="font-semibold text-black">Remarks:-</div>
        <div className="mt-0.5 font-semibold text-[#054038]">
          Pay Mode : {payMode} · Invoice Status: {inv.status}
          {isPart ? ` · Remaining Course Balance: ₹ ${balanceDues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : ""}
        </div>
      </div>

      <div className="mt-4 text-center text-[10.5px] font-medium tracking-wide text-gray-700">
        **This is a computer generated GST tax invoice, hence, no signature is required**
      </div>
    </div>
  );
}

export function ReceiptView({ p, account, embedded = false }: { p: PaymentTxn; account?: FeeAccount; embedded?: boolean }) {
  const t = account ? accountTotals(account) : null;
  const totalCourseFee = t ? t.total : p.amount;
  const paidNow = p.amount;
  const totalPaidTillDate = t ? t.paid : paidNow;
  const previouslyPaid = Math.max(0, Math.round((totalPaidTillDate - paidNow) * 100) / 100);
  const dues = t ? Math.max(0, t.outstanding) : 0;
  const isPart = totalCourseFee > paidNow;
  const dateFormatted = fmtDateIN(p.date || TODAY_ISO);
  const fatherName = account?.fatherName || "PARENT";
  const admissionNo = account?.admissionNo || (account?.id ? account.id.replace("FA-", "00000") : "000001");
  const section = account?.centre || account?.section || (account?.batch?.replace(/.*Batch\s*/i, "") || "Section A");
  const courseName = p.item || account?.course || "Q-School Program";
  const receiptNo = p.receiptNo || "REC-00000001";
  const payMode = p.method === "UPI" || p.method === "Net Banking" || p.method === "Card" ? `Online / ${p.method}` : p.method;

  return (
    <div className={`${embedded ? "" : "print-area"} rounded-xl border border-black/80 bg-white p-6 text-[12.5px] text-black shadow-sm`}>
      {/* Official Header */}
      <div className="relative pb-3 text-center">
        <div className="absolute right-0 top-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-[26px] font-black uppercase tracking-wider text-[#054038]">{ORG.name}</h1>
        <p className="mt-0.5 text-[12px] font-bold uppercase tracking-wider text-[#1F3D36]">{ORG.unit}</p>
        <div className="mt-1.5">
          <span className="inline-block border-b-2 border-black pb-0.5 text-[13px] font-extrabold uppercase tracking-wider text-black">
            OFFICIAL FEE RECEIPT {isPart ? "(PART PAYMENT)" : "(FULL PAYMENT)"}
          </span>
        </div>
      </div>

      {/* Two-column Metadata */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border-t border-black/30 py-3 text-[12.5px]">
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Student Name</span>
          <span className="font-bold uppercase text-black">: {p.student}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Receipt No.</span>
          <span className="font-mono font-bold text-black">: {receiptNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Parent Name</span>
          <span className="font-semibold uppercase text-black">: {fatherName}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Receipt Date</span>
          <span className="font-semibold text-black">: {dateFormatted}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Admission No.</span>
          <span className="font-mono font-semibold text-black">: {admissionNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold text-gray-800">Centre</span>
          <span className="font-semibold text-black">: {section}</span>
        </div>
        <div className="col-span-2 flex">
          <span className="w-32 font-semibold text-gray-800">Particulars</span>
          <span className="font-bold text-[#054038]">: {courseName}</span>
        </div>
      </div>

      {/* Table */}
      <table className="mt-2 w-full border-collapse border border-black text-[12.5px]">
        <thead>
          <tr className="border-b border-black bg-[#F0F5F3] font-bold text-center">
            <th className="w-12 border-r border-black px-3 py-1.5">Sl</th>
            <th className="border-r border-black px-3 py-1.5 text-left">Fee Particulars</th>
            <th className="w-36 border-r border-black px-3 py-1.5 text-right">Total Course Fee</th>
            <th className="w-36 px-3 py-1.5 text-right">Received Now</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black px-3 py-2 text-center">1</td>
            <td className="border-r border-black px-3 py-2 font-semibold text-black">
              {courseName}
              {previouslyPaid > 0 && (
                <div className="text-[11px] font-normal text-gray-600">
                  Previously Paid: ₹ {previouslyPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })} · Total Paid Till Date: ₹ {totalPaidTillDate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              )}
            </td>
            <td className="border-r border-black px-3 py-2 text-right tabular-nums">
              ₹ {totalCourseFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-bold text-[#054038]">
              ₹ {paidNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black bg-[#F8FAF9] font-bold">
            <td colSpan={3} className="border-r border-black px-3 py-1.5 text-left">
              AMOUNT RECEIVED IN THIS RECEIPT
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums">
              ₹ {paidNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black font-bold">
            <td colSpan={3} className="border-r border-black px-3 py-1.5 text-left">
              Balance Dues Remaining
            </td>
            <td className={`px-3 py-1.5 text-right tabular-nums ${dues > 0 ? "text-red-700" : "text-[#054038]"}`}>
              ₹ {dues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-1 border-b border-black py-2 text-[12px] font-bold text-black">
        Received Amount In Words :- Rupees {numberToWords(paidNow).toUpperCase()} Only
      </div>

      <div className="mt-2 border border-black p-2.5 text-[12px] leading-relaxed">
        <div className="font-semibold text-black">Remarks:-</div>
        <div className="mt-0.5 font-semibold text-[#054038]">
          Pay Mode : {payMode} {p.ref && p.ref !== "—" ? `(Ref: ${p.ref})` : ""} · {dues > 0 ? `Part Payment Received (Balance Due: ₹ ${dues.toLocaleString("en-IN", { minimumFractionDigits: 2 })})` : "Full Course Fee Settled"}
        </div>
      </div>

      <div className="mt-4 text-center text-[10.5px] font-medium tracking-wide text-gray-700">
        **This is a computer generated receipt, hence, no signature is required**
      </div>
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

/**
 * Automatic Post-Payment Print Prompt Modal:
 * Opens immediately whenever a full or part fee payment is collected, generating BOTH the
 * Official Fee Receipt AND GST Tax Invoice and asking the user to print them right away.
 */
export function PaymentPrintPromptModal({
  docs,
  onClose,
}: {
  docs: GeneratedFeeDocs | null;
  onClose: () => void;
}) {
  const [view, setView] = useState<"both" | "receipt" | "invoice">("both");

  useEffect(() => {
    if (docs) setView("both");
  }, [docs]);

  const triggerPrint = (target: "both" | "receipt" | "invoice") => {
    setView(target);
    setTimeout(() => window.print(), 120);
  };

  const waShareHref = () => {
    if (!docs) return "#";
    const d = (docs.account.phone || "").replace(/\D/g, "");
    const to = d.length === 10 ? `91${d}` : d;
    const partNote = docs.isPartPayment
      ? ` (Part Payment #${docs.partNumber} · Balance Remaining: ${inr(docs.balanceRemaining)})`
      : " (Full Fee Paid)";
    const msg = `Dear ${docs.account.fatherName || "Parent"}, thank you! We have received ${inr(docs.receipt.amount)}${partNote} towards ${docs.account.course} for ${docs.receipt.student}.\nReceipt No: ${docs.receipt.receiptNo}\nTax Invoice No: ${docs.invoice.id}`;
    return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Modal
      open={!!docs}
      title={docs ? `Receipt & Tax Invoice Ready — Print Now?` : ""}
      onClose={onClose}
      wide
    >
      {docs && (
        <div className="space-y-4">
          {/* Print Prompt Callout */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-extrabold text-emerald-950">
                  ✓ {docs.isPartPayment ? `Part Payment #${docs.partNumber}` : "Fee Payment"} of {inr(docs.receipt.amount)} Recorded!
                </p>
                <p className="mt-0.5 text-[12px] text-emerald-800">
                  Receipt <b>{docs.receipt.receiptNo}</b> &amp; Tax Invoice <b>{docs.invoice.id}</b> generated
                  {docs.balanceRemaining > 0 ? ` · Remaining Balance: ${inr(docs.balanceRemaining)}` : " · Full Fee Settled"}. Would you like to print them now?
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn icon="download" onClick={() => triggerPrint("both")}>
                  Print Receipt &amp; Invoice
                </Btn>
                <a
                  href={waShareHref()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-300 bg-white px-3.5 text-[12.5px] font-bold text-emerald-900 hover:bg-emerald-100"
                >
                  WhatsApp Summary
                </a>
              </div>
            </div>
          </div>

          {/* Document View Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#DCE8E4] bg-[#F4F8F7] p-1 text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setView("both")}
                className={`rounded-lg px-3 py-1.5 transition ${view === "both" ? "bg-brand-deep text-white shadow-sm" : "text-[#41564f]"}`}
              >
                Both (Receipt + Invoice)
              </button>
              <button
                type="button"
                onClick={() => setView("receipt")}
                className={`rounded-lg px-3 py-1.5 transition ${view === "receipt" ? "bg-brand-deep text-white shadow-sm" : "text-[#41564f]"}`}
              >
                Fee Receipt Only
              </button>
              <button
                type="button"
                onClick={() => setView("invoice")}
                className={`rounded-lg px-3 py-1.5 transition ${view === "invoice" ? "bg-brand-deep text-white shadow-sm" : "text-[#41564f]"}`}
              >
                Tax Invoice Only
              </button>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-[12.5px] font-bold text-brand-teal hover:underline"
            >
              🖨️ Print current view
            </button>
          </div>

          {/* Printable Area (single .print-area wrapper so multi-page printing never overlaps) */}
          <div className="print-area space-y-6">
            {(view === "both" || view === "receipt") && (
              <div className={view === "both" ? "print-page-break" : ""}>
                <ReceiptView p={docs.receipt} account={docs.account} embedded />
              </div>
            )}
            {(view === "both" || view === "invoice") && (
              <div>
                <InvoiceView inv={docs.invoice} account={docs.account} embedded />
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E6EEEB] pt-3 print:hidden">
            <Btn variant="ghost" onClick={onClose}>
              Skip / Close
            </Btn>
            <button
              type="button"
              onClick={() => triggerPrint("receipt")}
              className="rounded-xl border border-[#CFE3DD] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-brand-deep hover:border-brand-teal"
            >
              Print Receipt Only
            </button>
            <button
              type="button"
              onClick={() => triggerPrint("invoice")}
              className="rounded-xl border border-[#CFE3DD] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-brand-deep hover:border-brand-teal"
            >
              Print Invoice Only
            </button>
            <Btn icon="download" onClick={() => triggerPrint("both")}>
              Print Both / Save PDF
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Shown on the public /pay/[linkId] page when an online Easebuzz full or part payment succeeds. */
export function OnlinePaymentDocsSection({
  docs,
  autoPromptPrint = false,
}: {
  docs: GeneratedFeeDocs;
  autoPromptPrint?: boolean;
}) {
  const [view, setView] = useState<"both" | "receipt" | "invoice">("both");
  const [showDocs, setShowDocs] = useState(true);

  useEffect(() => {
    if (autoPromptPrint) {
      const t = setTimeout(() => {
        if (window.confirm("Payment successful! Receipt & GST Tax Invoice have been generated. Would you like to print / save PDF now?")) {
          window.print();
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [autoPromptPrint]);

  return (
    <div className="mt-6 space-y-4 border-t border-[#E2ECE9] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <p className="text-[13px] font-extrabold text-brand-deep">Receipt &amp; GST Tax Invoice Generated</p>
          <p className="text-[11.5px] text-[#6b807b]">
            Receipt {docs.receipt.receiptNo} · Invoice {docs.invoice.id}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowDocs((v) => !v)}
            className="rounded-xl border border-[#D9E6E2] bg-white px-3 py-2 text-[12px] font-semibold text-brand-deep"
          >
            {showDocs ? "Hide Preview" : "View Receipt & Invoice"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowDocs(true);
              setTimeout(() => window.print(), 100);
            }}
            className="btn-3d btn-3d-teal rounded-xl px-4 py-2 text-[12.5px] font-extrabold"
          >
            🖨️ Print Receipt &amp; Invoice
          </button>
        </div>
      </div>

      {showDocs && (
        <>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#DCE8E4] bg-[#F4F8F7] p-1 text-[11.5px] font-semibold print:hidden">
            <button
              type="button"
              onClick={() => setView("both")}
              className={`rounded-lg py-1.5 transition ${view === "both" ? "bg-brand-deep text-white" : "text-[#41564f]"}`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setView("receipt")}
              className={`rounded-lg py-1.5 transition ${view === "receipt" ? "bg-brand-deep text-white" : "text-[#41564f]"}`}
            >
              Receipt
            </button>
            <button
              type="button"
              onClick={() => setView("invoice")}
              className={`rounded-lg py-1.5 transition ${view === "invoice" ? "bg-brand-deep text-white" : "text-[#41564f]"}`}
            >
              Tax Invoice
            </button>
          </div>

          <div className="print-area space-y-5">
            {(view === "both" || view === "receipt") && (
              <div className={view === "both" ? "print-page-break" : ""}>
                <ReceiptView p={docs.receipt} account={docs.account} embedded />
              </div>
            )}
            {(view === "both" || view === "invoice") && (
              <div>
                <InvoiceView inv={docs.invoice} account={docs.account} embedded />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
