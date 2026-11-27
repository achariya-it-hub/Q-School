/**
 * Correct a payment that was recorded with the wrong (too high) amount on a fee plan (FA-…):
 *   POST { accountId, instNo, amount, reason, balanceDue? }
 * The installment keeps `amount` (what was really received) and the rest returns as a new unpaid installment.
 * Receipt and invoice follow automatically (they are derived), the change is written to the audit trail.
 */
import { NextResponse } from "next/server";
import { accountTotals, correctInstallmentPayment, istToday, type FeeAccount } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { recordAuditLog } from "@/lib/audit/store";
import { lockedSync, readList, writeList } from "@/lib/console-sync";

export const dynamic = "force-dynamic";

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const accountId = String(b.accountId ?? "");
  const instNo = Number(b.instNo);
  const amount = Math.round(Number(b.amount) * 100) / 100;
  const reason = String(b.reason ?? "").trim().slice(0, 200);
  const balanceDue = b.balanceDue ? String(b.balanceDue) : undefined;
  if (!accountId || !(instNo >= 1)) return NextResponse.json({ error: "accountId and instNo required" }, { status: 400 });
  if (!(amount > 0)) return NextResponse.json({ error: "Enter the amount actually received" }, { status: 400 });
  if (reason.length < 3) return NextResponse.json({ error: "Enter a short reason for the correction" }, { status: 400 });

  let before = 0;
  let account: FeeAccount;
  try {
    account = await lockedSync(async () => {
      const all = ((await readList("accounts")) ?? []) as FeeAccount[];
      const i = all.findIndex((a) => a?.id === accountId);
      if (i < 0) throw new Error("Fee plan not found. Refresh and try again.");
      const target = all[i].installments.find((x) => x.no === instNo);
      if (!target || !target.paidOn) throw new Error("That installment has no recorded payment.");
      if (target.refunded) throw new Error("That payment was refunded; it can't be corrected.");
      if (!(amount < target.amount)) throw new Error(`The corrected amount must be lower than the recorded ${money(target.amount)}.`);
      before = target.amount;
      const next = correctInstallmentPayment(all[i], instNo, amount, balanceDue);
      if (!next) throw new Error("Could not apply the correction");
      all[i] = next;
      await writeList("accounts", all);
      return next;
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const t = accountTotals(account, istToday());
  await recordAuditLog({
    action: "UPDATE",
    module: "Fees & Payments",
    entityId: account.id,
    entityName: account.student,
    summary: `Payment corrected for ${account.student} (${account.id}) installment ${instNo}: ${money(before)} → ${money(amount)} received · balance now ${money(t.outstanding)} · reason: ${reason}`,
    previousData: { accountId: account.id, instNo, amount: before },
    newData: { accountId: account.id, instNo, amount, paid: t.paid, balance: t.outstanding, reason },
  }).catch(() => {});

  return NextResponse.json({ ok: true, account, balance: t.outstanding, paid: t.paid });
}
