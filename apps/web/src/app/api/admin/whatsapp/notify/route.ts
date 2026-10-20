import { NextResponse } from "next/server";
import { fmtDate, inr, type FeeAccount, type InvoiceDoc, type PaymentTxn } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { shareDoc } from "@/lib/docs/store";
import { getSettings } from "@/lib/settings/store";
import { publicOrigin, send } from "@/lib/whatsapp/client";
import { WA_EVENTS } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

const first = (n: string) => n.trim().split(/\s+/)[0] || "there";
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : 0);

/**
 * Bills & payments on WhatsApp, sent from the Console.
 *  { event: "invoice", to, name, inv }            → saves a shareable copy (/d/<token>) and sends qs_invoice
 *  { event: "receipt", to, name, p, account? }    → same for a payment receipt
 *  { event: "fee_reminder", to, name, amount, item, due }
 */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const st = await getSettings();
  const event = b.event === "invoice" || b.event === "receipt" || b.event === "fee_reminder" ? b.event : null;
  if (!event) return NextResponse.json({ error: "Unknown message type" }, { status: 400 });
  const cfg = st.whatsapp.events[event];
  if (!cfg.enabled) return NextResponse.json({ error: `“${WA_EVENTS[event].label}” messages are switched off in Settings › WhatsApp` }, { status: 400 });
  const to = str(b.to, 30);
  const name = str(b.name, 120);
  const origin = publicOrigin(st, req);
  let params: string[];
  let ref: string;
  let link = "";
  try {
    if (event === "invoice") {
      const inv = b.inv as InvoiceDoc;
      if (!inv || !str(inv.id) || !num(inv.amount)) throw new Error("Invoice details are missing");
      const clean: InvoiceDoc = { ...inv, id: str(inv.id, 40), student: str(inv.student, 120), item: str(inv.item, 200), amount: num(inv.amount), due: str(inv.due, 30), date: str(inv.date, 30) };
      const d = await shareDoc({ type: "invoice", ref: clean.id, inv: clean });
      link = `${origin}/d/${d.token}`;
      params = [first(name || clean.student), clean.id, clean.item, inr(clean.amount), fmtDate(clean.due), link];
      ref = clean.id;
    } else if (event === "receipt") {
      const p = b.p as PaymentTxn;
      if (!p || !str(p.receiptNo) || !num(p.amount)) throw new Error("Receipt details are missing");
      const clean: PaymentTxn = { ...p, receiptNo: str(p.receiptNo, 40), student: str(p.student, 120), item: str(p.item, 200), amount: num(p.amount) };
      const d = await shareDoc({ type: "receipt", ref: clean.receiptNo!, p: clean, account: (b.account as FeeAccount) || undefined });
      link = `${origin}/d/${d.token}`;
      params = [first(name || clean.student), inr(clean.amount), clean.item, clean.receiptNo!, link];
      ref = clean.receiptNo!;
    } else {
      if (!num(b.amount)) throw new Error("Amount is missing");
      params = [first(name), inr(num(b.amount)), str(b.item) || "your course", fmtDate(str(b.due, 30)), st.general.supportPhone || st.general.whatsapp];
      ref = str(b.ref, 60) || str(b.item);
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const message = await send({ to, name, template: cfg.template, language: cfg.language, params, event, ref });
    if (message.status === "failed") return NextResponse.json({ error: message.error, message, link }, { status: 502 });
    return NextResponse.json({ message, link });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, link }, { status: 400 });
  }
}
