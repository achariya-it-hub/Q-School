"use client";

import { useEffect, useState } from "react";
import {
  accountTotals,
  centreName,
  fmtDateIN,
  gstSplit,
  inr,
  invoiceNoFor,
  numberToWords,
  receiptNoFor,
  studentFeeSummary,
  TODAY_ISO,
  type FeeAccount,
  type InvoiceDoc,
  type PayMethod,
  type PaymentTxn,
  type GeneratedFeeDocs,
} from "@qschool/shared";
import { Btn, Modal } from "./ui";

const ORG = {
  name: "Q SCHOOL",
  unit: "(A UNIT OF DIVINE GRACE FOUNDATION)",
  sac: "999293",
};

export { buildDocsForStudentPayment, buildDocsForAccountPayment, type GeneratedFeeDocs } from "@qschool/shared";

export function InvoiceView({ inv, account, embedded = false }: { inv: InvoiceDoc; account?: FeeAccount; embedded?: boolean }) {
  const isPaid = inv.status === "Paid" || inv.status === "Partly Paid";
  const t = account ? accountTotals(account) : null;
  const totalCourseFee = t ? t.total : inv.amount;
  const paidThisInvoice = isPaid ? inv.amount : 0;
  const totalPaidToDate = t ? t.paid : paidThisInvoice;
  const previouslyPaid = Math.max(0, Math.round((totalPaidToDate - paidThisInvoice) * 100) / 100);
  const payableNow = t ? Math.max(inv.amount, Math.round((totalCourseFee - previouslyPaid) * 100) / 100) : inv.amount;
  const balanceDues = t ? Math.max(0, t.outstanding) : isPaid ? 0 : inv.amount;
  const dateFormatted = fmtDateIN(inv.date || TODAY_ISO);
  const fatherName = account?.fatherName || "PARENT";
  const admissionNo = account?.admissionNo || inv.accountId.replace("FA-", "00000");
  const rollNo = account?.rollNo ?? 0;
  const section = account?.section || (inv.batch?.replace(/.*(?:Batch|Section)\s*/i, "") || "A");
  const payMode = inv.method
    ? inv.method === "UPI" || inv.method === "Card" || inv.method === "Net Banking"
      ? "Online Payment"
      : inv.method
    : isPaid
    ? "Online Payment"
    : "Pending";

  return (
    <div className={`${embedded ? "" : "print-area"} rounded-xl border border-black/80 bg-white p-6 text-[12.5px] text-black shadow-sm`}>
      {/* Official Header — only Q SCHOOL + (A UNIT OF DIVINE GRACE FOUNDATION), no address */}
      <div className="relative pb-3 text-center">
        <div className="absolute right-0 top-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-14 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-[30px] font-black uppercase tracking-wider text-[#184B42] leading-tight">{ORG.name}</h1>
        <p className="mt-0.5 text-[13px] font-extrabold uppercase tracking-wide text-[#184B42]">{ORG.unit}</p>
        <div className="mt-1">
          <span className="inline-block border-b border-black pb-0.5 font-serif text-[13.5px] font-bold uppercase tracking-wide text-black">
            INVOICE
          </span>
        </div>
      </div>

      {/* Two-column Metadata matching official Q-School layout */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 py-3 text-[12.5px]">
        <div className="flex">
          <span className="w-36 font-serif text-black">Name</span>
          <span className="font-serif font-bold uppercase text-black">{inv.student}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Invoice No.</span>
          <span className="font-serif font-bold text-black">{inv.id}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-serif text-black">Father&apos;s Name</span>
          <span className="font-serif font-bold uppercase text-black">{fatherName}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Date</span>
          <span className="font-serif font-bold text-black">{dateFormatted}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-serif text-black">Admission No.</span>
          <span className="font-serif font-bold text-black">{admissionNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Roll No</span>
          <span className="font-serif font-bold text-black">{rollNo}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-serif text-black">Class</span>
          <span className="font-serif font-bold text-black">{account?.course || inv.item}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Section</span>
          <span className="font-serif font-bold text-black">{section}</span>
        </div>
      </div>

      {/* Table matching official Q-School layout */}
      <table className="mt-1 w-full border-collapse border border-black font-serif text-[12.5px]">
        <thead>
          <tr className="border-b border-black bg-[#EFEFEF] font-bold text-center">
            <th className="w-14 border-r border-black px-3 py-1.5">Sl</th>
            <th className="border-r border-black px-3 py-1.5 text-center">Particulars</th>
            <th className="w-40 border-r border-black px-3 py-1.5 text-center">Payable</th>
            <th className="w-40 px-3 py-1.5 text-center">Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black px-3 py-2 text-center font-bold">1</td>
            <td className="border-r border-black px-3 py-2 font-bold text-black">
              {inv.item}
              {previouslyPaid > 0 && (
                <div className="text-[11px] font-normal text-gray-700">
                  Course Fee: ₹ {totalCourseFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })} · Previously Paid: ₹ {previouslyPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              )}
            </td>
            <td className="border-r border-black px-3 py-2 text-center font-bold tabular-nums">
              ₹ {payableNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-2 text-center font-bold tabular-nums">
              ₹ {paidThisInvoice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black font-bold">
            <td colSpan={2} className="border-r border-black px-3 py-1.5 text-left">
              TOTAL
            </td>
            <td className="border-r border-black px-3 py-1.5 text-center tabular-nums">
              ₹ {payableNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-1.5 text-center tabular-nums">
              ₹ {paidThisInvoice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black font-bold">
            <td colSpan={3} className="border-r border-black px-3 py-1.5 text-left">
              Dues
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums">
              ₹ {balanceDues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2 font-serif text-[12.5px] font-bold text-black">
        Received Amount In Words :-Rupees {numberToWords(paidThisInvoice).toUpperCase()} Only
      </div>

      {/* Two-row bordered Remarks box matching official Q-School layout */}
      <div className="mt-2 border border-black font-serif text-[12.5px]">
        <div className="border-b border-black px-2.5 py-1.5 font-bold text-black">Remarks:-</div>
        <div className="px-2.5 py-1.5 font-bold text-black">
          Pay Mode : {payMode} · Status : {isPaid ? (balanceDues > 0 ? "Partly Paid" : "Paid") : inv.status}
        </div>
      </div>

      <div className="mt-6 text-center font-serif text-[10.5px] font-bold tracking-wide text-black">
        **This is a computer generated invoice, hence, no signature is required**
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
  const payableNow = t ? Math.max(paidNow, Math.round((totalCourseFee - previouslyPaid) * 100) / 100) : paidNow;
  const dues = t ? Math.max(0, t.outstanding) : 0;
  const dateFormatted = fmtDateIN(p.date || TODAY_ISO);
  const fatherName = account?.fatherName || "PARENT";
  const admissionNo = account?.admissionNo || (account?.id ? account.id.replace("FA-", "00000") : "000001");
  const rollNo = account?.rollNo ?? 0;
  const section = account?.section || (account?.batch?.replace(/.*(?:Batch|Section)\s*/i, "") || "A");
  const className = account?.course || p.item || "Divya Yoga";
  const particulars = p.item || className;
  const receiptNo = p.receiptNo || "REC-00000001";
  const payMode = p.method === "UPI" || p.method === "Net Banking" || p.method === "Card" ? "Online Payment" : p.method;

  return (
    <div className={`${embedded ? "" : "print-area"} rounded-xl border border-black/80 bg-white p-6 text-[12.5px] text-black shadow-sm`}>
      {/* Official Header — only Q SCHOOL + (A UNIT OF DIVINE GRACE FOUNDATION), no address */}
      <div className="relative pb-3 text-center">
        <div className="absolute right-0 top-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="h-14 w-auto object-contain" />
        </div>
        <h1 className="font-serif text-[30px] font-black uppercase tracking-wider text-[#184B42] leading-tight">{ORG.name}</h1>
        <p className="mt-0.5 text-[13px] font-extrabold uppercase tracking-wide text-[#184B42]">{ORG.unit}</p>
        <div className="mt-1">
          <span className="inline-block border-b border-black pb-0.5 font-serif text-[13.5px] font-bold uppercase tracking-wide text-black">
            INVOICE CUM RECEIPT
          </span>
        </div>
      </div>

      {/* Two-column Metadata matching official Q-School layout */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 py-3 text-[12.5px]">
        <div className="flex">
          <span className="w-36 font-serif text-black">Name</span>
          <span className="font-serif font-bold uppercase text-black">{p.student}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Receipt No.</span>
          <span className="font-serif font-bold text-black">{receiptNo}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-serif text-black">Father&apos;s Name</span>
          <span className="font-serif font-bold uppercase text-black">{fatherName}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Date</span>
          <span className="font-serif font-bold text-black">{dateFormatted}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-serif text-black">Admission No.</span>
          <span className="font-serif font-bold text-black">{admissionNo}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Roll No</span>
          <span className="font-serif font-bold text-black">{rollNo}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-serif text-black">Class</span>
          <span className="font-serif font-bold text-black">{className}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-serif text-black">Section</span>
          <span className="font-serif font-bold text-black">{section}</span>
        </div>
      </div>

      {/* Table matching official Q-School layout */}
      <table className="mt-1 w-full border-collapse border border-black font-serif text-[12.5px]">
        <thead>
          <tr className="border-b border-black bg-[#EFEFEF] font-bold text-center">
            <th className="w-14 border-r border-black px-3 py-1.5">Sl</th>
            <th className="border-r border-black px-3 py-1.5 text-center">Particulars</th>
            <th className="w-40 border-r border-black px-3 py-1.5 text-center">Payable</th>
            <th className="w-40 px-3 py-1.5 text-center">Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black px-3 py-2 text-center font-bold">1</td>
            <td className="border-r border-black px-3 py-2 font-bold text-black">
              {particulars}
              {previouslyPaid > 0 && (
                <div className="text-[11px] font-normal text-gray-700">
                  Course Fee: ₹ {totalCourseFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })} · Previously Paid: ₹ {previouslyPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              )}
            </td>
            <td className="border-r border-black px-3 py-2 text-center font-bold tabular-nums">
              ₹ {payableNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-2 text-center font-bold tabular-nums">
              ₹ {paidNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black font-bold">
            <td colSpan={2} className="border-r border-black px-3 py-1.5 text-left">
              TOTAL
            </td>
            <td className="border-r border-black px-3 py-1.5 text-center tabular-nums">
              ₹ {payableNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-3 py-1.5 text-center tabular-nums">
              ₹ {paidNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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

      <div className="mt-2 font-serif text-[12.5px] font-bold text-black">
        Received Amount In Words :-Rupees {numberToWords(paidNow).toUpperCase()} Only
      </div>

      {/* Two-row bordered Remarks box matching official Q-School layout */}
      <div className="mt-2 border border-black font-serif text-[12.5px]">
        <div className="border-b border-black px-2.5 py-1.5 font-bold text-black">Remarks:-</div>
        <div className="px-2.5 py-1.5 font-bold text-black">
          Pay Mode : {payMode} · Status : {dues > 0 ? "Partly Paid" : "Paid"}
        </div>
      </div>

      <div className="mt-6 text-center font-serif text-[10.5px] font-bold tracking-wide text-black">
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
    const msg = `Dear ${docs.account.fatherName || "Parent"}, thank you! We have received ${inr(docs.receipt.amount)}${partNote} towards ${docs.account.course} for ${docs.receipt.student}.\nReceipt No: ${docs.receipt.receiptNo}\nInvoice No: ${docs.invoice.id}`;
    return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Modal
      open={!!docs}
      title={docs ? `Receipt & Invoice Ready — Print Now?` : ""}
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
                  Receipt <b>{docs.receipt.receiptNo}</b> &amp; Invoice <b>{docs.invoice.id}</b> generated
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
                Invoice Only
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
        if (window.confirm("Payment successful! Receipt & Invoice have been generated. Would you like to print / save PDF now?")) {
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
          <p className="text-[13px] font-extrabold text-brand-deep">Receipt &amp; Invoice Generated</p>
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
              Invoice
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
