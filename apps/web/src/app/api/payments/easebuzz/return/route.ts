/**
 * Easebuzz surl/furl: the payer's browser is POSTed here after checkout.
 * Verify, settle, then send them to the friendly result page.
 */
import { NextResponse } from "next/server";
import { publicBase } from "@/lib/payments/easebuzz";
import { handleEasebuzzResult, readEasebuzzBody } from "@/lib/payments/easebuzz-result";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const base = publicBase(req);
  const p = await readEasebuzzBody(req);
  const r = await handleEasebuzzResult(p);
  const result = !r.ok ? "invalid" : r.status === "success" ? "success" : r.status === "usercancelled" ? "cancelled" : "failure";
  const q = new URLSearchParams({
    result,
    ...(p.easepayid ? { ref: p.easepayid } : {}),
    ...(p.txnid ? { txnid: p.txnid } : {}),
    ...(p.amount ? { amount: p.amount } : {}),
    ...(p.mode ? { mode: p.mode } : {}),
    ...(p.udf2 ? { accountId: p.udf2 } : {}),
    ...(p.udf3 ? { instNo: p.udf3 } : {}),
    ...(p.error_Message || p.error ? { msg: String(p.error_Message || p.error).slice(0, 160) } : {}),
  });
  if (r.linkId.startsWith("DIRECT:")) {
    const path = r.linkId.slice("DIRECT:".length) || "/admin/payments";
    const safePath = path.startsWith("/") ? path : "/admin/payments";
    return NextResponse.redirect(`${base}${safePath}?${q}`, 303);
  }
  return NextResponse.redirect(`${base}/pay/${encodeURIComponent(r.linkId || "unknown")}?${q}`, 303);
}

// Someone opening the URL directly.
export async function GET(req: Request) {
  return NextResponse.redirect(`${publicBase(req)}/`, 303);
}
