/**
 * Razorpay webhook (public, signature-verified). In the Razorpay Dashboard add a webhook to
 *   https://<your-domain>/api/payments/razorpay/webhook
 * with the event "payment_link.paid" and the same secret as RAZORPAY_WEBHOOK_SECRET.
 * Paid link -> the admission is confirmed and the student becomes Active automatically.
 */
import { NextResponse } from "next/server";
import { modeFor, verifyWebhook } from "@/lib/payments/razorpay";
import { settlePayLink } from "@/lib/students/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  let ev: { event?: string; payload?: { payment_link?: { entity?: { id?: string; amount_paid?: number } }; payment?: { entity?: { id?: string; method?: string } } } };
  try {
    ev = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  if (ev.event === "payment_link.paid") {
    const link = ev.payload?.payment_link?.entity;
    const pay = ev.payload?.payment?.entity;
    if (link?.id) await settlePayLink(link.id, { paymentId: pay?.id, method: pay?.method, amount: (Number(link.amount_paid) || 0) / 100 }, modeFor(pay?.method));
  }
  return NextResponse.json({ ok: true }); // always 200 so Razorpay does not retry unrelated events
}
