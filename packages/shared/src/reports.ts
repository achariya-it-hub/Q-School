/**
 * Report aggregation for the whole ERP chain:
 *   Lead (Enquiry → Contacted → BMIT → Negotiation → Admitted) → Student → Fee payments → Receipts & GST invoices.
 * Pure functions so the Reports screen, CSV exports and automated checks all agree on the same numbers.
 */
import { STAGES } from "./admin";
import { centreName, leadCentreId, studentFeeSummary, studentPayments, type StudentRecord } from "./admission";
import { accountTotals, gstSplit, type FeeAccount } from "./finance";

export interface LeadLike {
  id: string;
  name?: string;
  stage: string;
  source?: string;
  owner?: string;
  createdAt: string;
  centreId?: string;
  location?: string;
  value?: number;
  isTest?: boolean;
}

export type FeeStatus = "Unpaid" | "Partly Paid" | "Paid";

const r2 = (n: number) => Math.round(n * 100) / 100;
const idDigits = (id: string) => id.replace(/\D/g, "").padStart(4, "0");
const nn = (n: number) => String(n).padStart(2, "0");

/** Receipt number printed for part #n of a student's fee (kept in sync with the Receipts / Payments screens). */
export const receiptNoFor = (studentId: string, partNumber: number, stored?: string) =>
  stored && stored.startsWith("REC-") ? stored : `REC-${idDigits(studentId)}-${nn(partNumber)}`;

/** GST tax invoice number for part #n of a student's fee. */
export const invoiceNoFor = (studentId: string, partNumber: number) => `INV-2026-${idDigits(studentId)}-${nn(partNumber)}`;

const feeStatusOf = (state: "Unpaid" | "Partial" | "Paid"): FeeStatus => (state === "Partial" ? "Partly Paid" : state);

const leadMap = (leads: LeadLike[]) => new Map(leads.map((l) => [l.id, l]));

const centreOfLead = (l?: LeadLike) => {
  const id = l ? leadCentreId(l) : undefined;
  return id ? centreName(id) : l?.location || "Unassigned";
};

export interface StudentLedgerRow {
  studentId: string;
  studentName: string;
  parentName: string;
  phone: string;
  leadId: string;
  source: string;
  owner: string;
  centre: string;
  course: string;
  admittedOn: string;
  status: "Pending" | "Partly Paid" | "Active";
  totalFee: number;
  paid: number;
  balance: number;
  feeStatus: FeeStatus;
  parts: number;
  lastPaymentOn: string;
  receipts: string;
  invoices: string;
}

/** One row per student: where the lead came from, what it cost, what was paid and which receipts/invoices exist. */
export function studentLedger(students: StudentRecord[], leads: LeadLike[]): StudentLedgerRow[] {
  const byLead = leadMap(leads);
  return students.map((s) => {
    const lead = s.leadId ? byLead.get(s.leadId) : undefined;
    const fee = studentFeeSummary(s);
    const pays = fee.payments;
    const feeStatus = feeStatusOf(fee.feeState);
    return {
      studentId: s.id,
      studentName: s.studentName,
      parentName: s.parentName,
      phone: s.phone,
      leadId: s.leadId ?? "",
      source: lead?.source || s.referralType || "Direct / Manual",
      owner: lead?.owner || s.ref || "",
      centre: centreName(s.centreId),
      course: s.grade || "",
      admittedOn: (s.createdAt || "").slice(0, 10),
      status: s.status === "Pending" ? "Pending" : feeStatus === "Partly Paid" ? "Partly Paid" : "Active",
      totalFee: fee.totalFee,
      paid: fee.paid,
      balance: fee.balance,
      feeStatus,
      parts: pays.length,
      lastPaymentOn: pays.length ? (pays[pays.length - 1].confirmedAt || "").slice(0, 10) : "",
      receipts: pays.map((p, i) => receiptNoFor(s.id, i + 1, p.receiptNo)).join(" · "),
      invoices: pays.map((_, i) => invoiceNoFor(s.id, i + 1)).join(" · "),
    };
  });
}

export interface PaymentRegisterRow {
  date: string;
  studentId: string;
  studentName: string;
  centre: string;
  course: string;
  source: string;
  partNumber: number;
  amount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  mode: string;
  reference: string;
  receiptNo: string;
  invoiceNo: string;
  balanceAfter: number;
  statusAfter: FeeStatus;
  receivedBy: string;
}

/** One row per fee payment (full or part) with its receipt, GST invoice and the balance left after it. */
export function paymentRegister(students: StudentRecord[], leads: LeadLike[]): PaymentRegisterRow[] {
  const byLead = leadMap(leads);
  const rows: PaymentRegisterRow[] = [];
  for (const s of students) {
    const fee = studentFeeSummary(s);
    const lead = s.leadId ? byLead.get(s.leadId) : undefined;
    let running = 0;
    studentPayments(s).forEach((p, i) => {
      const amount = r2(Number(p.amount) || 0);
      running = r2(running + amount);
      const balanceAfter = Math.max(0, r2(fee.totalFee - running));
      const g = gstSplit(amount);
      rows.push({
        date: (p.confirmedAt || "").slice(0, 10),
        studentId: s.id,
        studentName: s.studentName,
        centre: centreName(s.centreId),
        course: s.grade || "",
        source: lead?.source || s.referralType || "Direct / Manual",
        partNumber: i + 1,
        amount,
        taxable: g.taxable,
        cgst: g.cgst,
        sgst: g.sgst,
        mode: p.mode,
        reference: p.receiptNo,
        receiptNo: receiptNoFor(s.id, i + 1, p.receiptNo),
        invoiceNo: invoiceNoFor(s.id, i + 1),
        balanceAfter,
        statusAfter: balanceAfter > 0 ? "Partly Paid" : "Paid",
        receivedBy: p.confirmedBy,
      });
    });
  }
  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.studentId < b.studentId ? -1 : 1));
}

export interface FunnelStep {
  label: string;
  count: number;
}

const PLAN_SOURCE = "Fee plan (manual)";
const planKey = (id: string) => id.replace(/[^A-Za-z0-9]/g, "");
const paidParts = (a: FeeAccount) => a.installments.filter((i) => i.paidOn && !i.refunded);

/** Ledger rows for manual fee plans (FA-…) so they appear in Reports next to admitted students. */
export function accountLedger(accounts: FeeAccount[]): StudentLedgerRow[] {
  return accounts.map((a) => {
    const t = accountTotals(a);
    const pays = paidParts(a);
    const feeStatus: FeeStatus = t.paid <= 0 ? "Unpaid" : t.outstanding > 0 ? "Partly Paid" : "Paid";
    return {
      studentId: a.id,
      studentName: a.student,
      parentName: a.fatherName || "",
      phone: a.phone,
      leadId: "",
      source: PLAN_SOURCE,
      owner: "",
      centre: a.centre,
      course: a.course,
      admittedOn: a.installments[0]?.due ?? "",
      status: feeStatus === "Unpaid" ? "Pending" : feeStatus === "Partly Paid" ? "Partly Paid" : "Active",
      totalFee: r2(t.total),
      paid: r2(t.paid),
      balance: Math.max(0, r2(t.outstanding)),
      feeStatus,
      parts: pays.length,
      lastPaymentOn: pays.length ? pays[pays.length - 1].paidOn ?? "" : "",
      receipts: pays.map((i) => (i.ref?.startsWith("REC-") ? i.ref : `REC-${planKey(a.id)}-${nn(i.no)}`)).join(" · "),
      invoices: pays.map((i) => `INV-2026-${planKey(a.id)}-${nn(i.no)}`).join(" · "),
    };
  });
}

/** Cumulative admissions funnel: how many leads reached each stage, then how many students paid / paid in full. */
export function admissionFunnel(leads: LeadLike[], students: StudentRecord[]): FunnelStep[] {
  const live = leads.filter((l) => l.stage !== "Dropped");
  const reached = (stage: (typeof STAGES)[number]) => {
    const i = STAGES.indexOf(stage);
    return live.filter((l) => STAGES.indexOf(l.stage as (typeof STAGES)[number]) >= i).length;
  };
  const fees = students.map((s) => studentFeeSummary(s));
  return [
    { label: "Enquiries (all leads)", count: leads.length },
    { label: "Contacted", count: reached("Contacted") },
    { label: "BMIT", count: reached("BMIT") },
    { label: "Negotiation", count: reached("Negotiation") },
    { label: "Admitted", count: reached("Admitted") },
    { label: "Fee paid (part or full)", count: fees.filter((f) => f.paid > 0).length },
    { label: "Fully paid", count: fees.filter((f) => f.feeState === "Paid").length },
  ];
}

export interface SourceRow {
  source: string;
  leads: number;
  admitted: number;
  students: number;
  collected: number;
  balance: number;
  openValue: number;
}

/** Lead source performance, including the fees actually collected from the students each source produced. */
export function sourceSummary(leads: LeadLike[], students: StudentRecord[], plans: FeeAccount[] = []): SourceRow[] {
  const map = new Map<string, SourceRow>();
  const row = (k: string) => {
    const key = k || "Unknown";
    if (!map.has(key)) map.set(key, { source: key, leads: 0, admitted: 0, students: 0, collected: 0, balance: 0, openValue: 0 });
    return map.get(key)!;
  };
  for (const l of leads) {
    const r = row(l.source || "Unknown");
    r.leads++;
    if (l.stage === "Admitted") r.admitted++;
    if (l.stage !== "Dropped" && l.stage !== "Admitted") r.openValue += l.value || 0;
  }
  const byLead = leadMap(leads);
  for (const s of students) {
    const lead = s.leadId ? byLead.get(s.leadId) : undefined;
    const r = row(lead?.source || s.referralType || "Direct / Manual");
    const f = studentFeeSummary(s);
    r.students++;
    r.collected = r2(r.collected + f.paid);
    r.balance = r2(r.balance + f.balance);
  }
  for (const a of plans) {
    const r = row(PLAN_SOURCE);
    const t = accountTotals(a);
    r.students++;
    r.collected = r2(r.collected + t.paid);
    r.balance = r2(r.balance + Math.max(0, t.outstanding));
  }
  return Array.from(map.values()).sort((a, b) => b.leads + b.students - (a.leads + a.students));
}

export interface CentreRow {
  centre: string;
  leads: number;
  admitted: number;
  students: number;
  billed: number;
  collected: number;
  balance: number;
}

/** Centre-wise view: leads, admissions and fee position for each branch. */
export function centreSummary(leads: LeadLike[], students: StudentRecord[], plans: FeeAccount[] = []): CentreRow[] {
  const map = new Map<string, CentreRow>();
  const row = (k: string) => {
    if (!map.has(k)) map.set(k, { centre: k, leads: 0, admitted: 0, students: 0, billed: 0, collected: 0, balance: 0 });
    return map.get(k)!;
  };
  for (const l of leads) {
    const r = row(centreOfLead(l));
    r.leads++;
    if (l.stage === "Admitted") r.admitted++;
  }
  for (const s of students) {
    const r = row(centreName(s.centreId));
    const f = studentFeeSummary(s);
    r.students++;
    r.billed = r2(r.billed + f.totalFee);
    r.collected = r2(r.collected + f.paid);
    r.balance = r2(r.balance + f.balance);
  }
  for (const a of plans) {
    const r = row(a.centre || "Unassigned");
    const t = accountTotals(a);
    r.students++;
    r.billed = r2(r.billed + t.total);
    r.collected = r2(r.collected + t.paid);
    r.balance = r2(r.balance + Math.max(0, t.outstanding));
  }
  return Array.from(map.values()).sort((a, b) => b.leads + b.students - (a.leads + a.students));
}
