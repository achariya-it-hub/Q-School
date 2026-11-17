/**
 * Console-authenticated: create a direct Easebuzz hosted checkout session (from Payments / Fees screens).
 * POST { amount, name, phone, email?, description?, returnPath?, accountId?, instNo? } → { ok: true, url, txnid, env }
 */
import { NextResponse } from "next/server";
import { caller } from "@/lib/students/access";
import { easebuzzConfigured, easebuzzEnv, initiatePayment, publicBase } from "@/lib/payments/easebuzz";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const who = await caller();
  if (!who) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  if (!easebuzzConfigured()) {
    return NextResponse.json(
      { error: "Easebuzz is not set up yet. Add EASEBUZZ_KEY and EASEBUZZ_SALT on the server and restart." },
      { status: 400 },
    );
  }

  const b = await req.json().catch(() => ({}));
  const amount = Math.round(Number(b.amount) * 100) / 100;
  if (!(amount >= 1)) return NextResponse.json({ error: "Enter a valid amount (minimum ₹1)" }, { status: 400 });

  const phone = String(b.phone ?? "").replace(/\D/g, "").slice(-10);
  if (phone.length !== 10) {
    return NextResponse.json({ error: "Enter a 10-digit mobile number" }, { status: 400 });
  }

  const base = publicBase(req);
  const txnid = `QS${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const returnPath = typeof b.returnPath === "string" && b.returnPath.startsWith("/") ? b.returnPath : "/admin/payments";

  try {
    const { url } = await initiatePayment({
      txnid,
      amount,
      productinfo: String(b.description || "Q-School Fee Payment"),
      firstname: String(b.name || "Parent"),
      phone,
      email: b.email ? String(b.email) : undefined,
      surl: `${base}/api/payments/easebuzz/return`,
      furl: `${base}/api/payments/easebuzz/return`,
      udf: {
        udf1: `DIRECT:${returnPath.replace(/[^A-Za-z0-9/_-]/g, "")}`,
        udf2: b.accountId ? String(b.accountId) : "",
        udf3: b.instNo ? String(b.instNo) : "",
      },
    });
    return NextResponse.json({ ok: true, url, txnid, env: easebuzzEnv() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not start Easebuzz checkout";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
