/**
 * Builds the official Receipt + GST Tax Invoice for a full or part payment.
 * Pure (no React / no browser APIs) so it runs on the server too: the public /pay/[linkId] page,
 * webhooks and the print prompt in the Console all generate identical documents.
 */
import { centreName, studentFeeSummary, type StudentRecord } from "./admission";
import { gstSplit, type FeeAccount, type InvoiceDoc, type PayMethod, type PaymentTxn } from "./finance";
import { invoiceNoFor, receiptNoFor } from "./reports";

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
  const receiptNo = receiptNoFor(student.id, partNumber, target.receiptNo);
  const invoiceNo = invoiceNoFor(student.id, partNumber);

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
    status: balanceAfterThis > 0 ? "Partly Paid" : "Success",
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
    status: balanceAfterThis > 0 ? "Partly Paid" : "Paid",
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
    status: balanceRemaining > 0 ? "Partly Paid" : "Success",
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
    status: balanceRemaining > 0 ? "Partly Paid" : "Paid",
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
