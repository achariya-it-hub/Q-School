/**
 * Easebuzz webhook (server-to-server, hash-verified). In the Easebuzz dashboard set the Transaction webhook URL to
 *   https://<your-domain>/api/payments/easebuzz/webhook
 * Catches payments where the payer closed the browser before returning to the site.
 */
import { NextResponse } from "next/server";
import { handleEasebuzzResult, readEasebuzzBody } from "@/lib/payments/easebuzz-result";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const r = await handleEasebuzzResult(await readEasebuzzBody(req));
  if (!r.ok) return NextResponse.json({ error: "Bad hash" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
