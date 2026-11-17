/**
 * Shared handling of an Easebuzz result (surl / furl / webhook).
 * Trusts the payload only after the reverse-hash check, then settles the payment link
 * (marks it Paid and activates the admission). Safe to run twice.
 */
import { easebuzzModeFor, verifyResponse } from "@/lib/payments/easebuzz";
import { settlePayLink } from "@/lib/students/store";

export async function readEasebuzzBody(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => ({}));
    return Object.fromEntries(Object.entries(j ?? {}).map(([k, v]) => [k, String(v ?? "")]));
  }
  const raw = await req.text();
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

/** linkId from udf1, else from the txnid ("<linkId>-<attempt>"). */
export const linkIdOf = (p: Record<string, string>) => p.udf1 || (p.txnid || "").replace(/-\d+$/, "");

export async function handleEasebuzzResult(p: Record<string, string>): Promise<{ ok: boolean; status: string; linkId: string }> {
  const linkId = linkIdOf(p);
  if (!verifyResponse(p)) {
    console.warn("[easebuzz] rejected result with a bad hash for txnid", p.txnid);
    return { ok: false, status: "invalid", linkId };
  }
  const status = String(p.status || "").toLowerCase();
  if (status === "success" && linkId) {
    await settlePayLink(
      linkId,
      { paymentId: p.easepayid || p.txnid, method: p.mode ? `Easebuzz ${p.mode}` : "Easebuzz", amount: Number(p.amount) || Number(p.net_amount_debit) || 0 },
      easebuzzModeFor(p.mode),
    );
  }
  return { ok: true, status, linkId };
}
