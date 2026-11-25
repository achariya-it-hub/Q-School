/**
 * Record a payment on a fee plan (FA-…) on the server, so every device sees it and the admission follows:
 *   POST { accountId, instNo, method, ref, amount, account? }
 *        `account` = the browser's copy of the plan, used only when the plan was never uploaded yet.
 *   → { ok, account, leadId?, studentId? }
 * After saving: the matching CRM lead (by phone) moves to Admitted, and the matching student becomes Active.
 */
import { NextResponse } from "next/server";
import { accountTotals, applyInstallmentPayment, istToday, type FeeAccount, type PayMethod } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { recordAuditLog } from "@/lib/audit/store";
import { lockedSync, readList, writeList } from "@/lib/console-sync";
import { updateLeadByPhone } from "@/lib/crm/store";
import { confirmAdmissionFromFeePlan } from "@/lib/students/store";

export const dynamic = "force-dynamic";

const METHODS: PayMethod[] = ["UPI", "Card", "Net Banking", "Cash", "EMI", "Cheque"];
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const accountId = String(b.accountId ?? "");
  const instNo = Number(b.instNo);
  const method = String(b.method ?? "") as PayMethod;
  const ref = String(b.ref ?? "").trim().slice(0, 60);
  const amount = Math.round(Number(b.amount) * 100) / 100;
  if (!accountId || !(instNo >= 1)) return NextResponse.json({ error: "accountId and instNo required" }, { status: 400 });
  if (!METHODS.includes(method)) return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
  if (!(amount >= 1)) return NextResponse.json({ error: "Enter the amount paid" }, { status: 400 });

  let account: FeeAccount;
  let paidNow = amount;
  try {
    account = await lockedSync(async () => {
      const all = ((await readList("accounts")) ?? []) as FeeAccount[];
      let i = all.findIndex((a) => a?.id === accountId);
      if (i < 0) {
        const c = b.account as FeeAccount | undefined;
        if (!c || c.id !== accountId || typeof c.student !== "string" || !Array.isArray(c.installments)) throw new Error("Fee plan not found. Refresh and try again.");
        all.unshift(c);
        i = 0;
      }
      const target = all[i].installments.find((x) => x.no === instNo);
      if (!target) throw new Error("Installment not found. Refresh and try again.");
      if (target.paidOn) throw new Error("This installment is already paid (perhaps on another device). Refresh to see it.");
      paidNow = Math.min(amount, target.amount);
      const next = applyInstallmentPayment(all[i], instNo, method, ref, paidNow, istToday());
      if (!next) throw new Error("Could not apply the payment");
      if (!next.admissionNo && all[i].admissionNo) next.admissionNo = all[i].admissionNo;
      all[i] = next;
      await writeList("accounts", all);
      return next;
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const t = accountTotals(account, istToday());
  const status = t.outstanding > 0 ? "Partly Paid" : "Paid";

  // The fee is paid, so the admission is confirmed: lead → Admitted, student → Active.
  let leadId: string | undefined;
  let studentId: string | undefined;
  try {
    const lead = account.phone
      ? await updateLeadByPhone(
          account.phone,
          {
            stage: "Admitted",
            activity: `Fee plan ${account.id}: ${money(paidNow)} received (${method}) · ${status}${t.outstanding > 0 ? ` · balance ${money(t.outstanding)}` : ""}${ref ? ` · Ref ${ref}` : ""}`,
            extra: { "Fee Status": status, "Fee Paid": String(t.paid), "Fee Balance": String(t.outstanding), "Fee Plan": account.id },
          },
          { paid: true },
        )
      : null;
    leadId = lead?.id;
    const student = await confirmAdmissionFromFeePlan({
      studentId: account.admissionNo?.startsWith("STU-") ? account.admissionNo : lead?.extra?.["Student ID"],
      name: account.student,
      phone: account.phone,
    });
    studentId = student?.id;
    // Link the plan to the student so dashboards show one card for this child, not two.
    if (studentId && !account.admissionNo) {
      account = { ...account, admissionNo: studentId };
      const linked = account;
      await lockedSync(async () => {
        const all = ((await readList("accounts")) ?? []) as FeeAccount[];
        const i = all.findIndex((a) => a?.id === linked.id);
        if (i >= 0 && !all[i].admissionNo) {
          all[i] = { ...all[i], admissionNo: linked.admissionNo };
          await writeList("accounts", all);
        }
      });
    }
  } catch (e) {
    console.warn("[fee-plans] admission update after payment failed:", e);
  }

  await recordAuditLog({
    action: "CREATE",
    module: "Fees & Payments",
    entityId: account.id,
    entityName: account.student,
    summary: `${money(paidNow)} received from ${account.student} (${account.id}) via ${method} · ${status}${t.outstanding > 0 ? ` · balance ${money(t.outstanding)}` : ""}${ref ? ` · Ref ${ref}` : ""}${leadId ? ` · lead ${leadId} Admitted` : ""}`,
    newData: { accountId: account.id, instNo, amount: paidNow, method, ref, paid: t.paid, balance: t.outstanding, leadId, studentId },
  }).catch(() => {});

  return NextResponse.json({ ok: true, account, leadId, studentId });
}
