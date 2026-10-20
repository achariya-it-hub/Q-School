/**
 * Server-only: Razorpay Payment Links (centres send a link to the parent; the student is activated when it is paid).
 * Keys live in deploy/local-pc/server.env.ps1: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
 * Card EMI (3 to 24 months) is switched on in the Razorpay Dashboard; the customer then sees EMI on the link's checkout.
 */
import { createHmac, timingSafeEqual } from "crypto";

const API = "https://api.razorpay.com/v1";

export const razorpayConfigured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const auth = () => "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

async function call(path: string, init?: RequestInit) {
  if (!razorpayConfigured()) throw new Error("Online payments are not set up yet. Add the Razorpay keys on the server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) and restart.");
  const r = await fetch(API + path, { ...init, headers: { Authorization: auth(), "Content-Type": "application/json" }, cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.description || `Razorpay error ${r.status}`);
  return j;
}

export interface LinkInput {
  amount: number; // rupees
  description: string;
  reference: string;
  name: string;
  phone: string;
  email?: string;
  notes: Record<string, string>;
  expireDays?: number;
}

const e164 = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length === 10 ? `+91${d}` : `+${d}`;
};

export async function createPayLink(i: LinkInput): Promise<{ id: string; url: string }> {
  const body: Record<string, unknown> = {
    amount: Math.round(i.amount * 100),
    currency: "INR",
    accept_partial: false,
    description: i.description.slice(0, 200),
    reference_id: i.reference.slice(0, 40),
    customer: { name: i.name.slice(0, 80), contact: e164(i.phone), ...(i.email ? { email: i.email } : {}) },
    notify: { sms: true, email: !!i.email },
    reminder_enable: true,
    notes: i.notes,
  };
  if (i.expireDays) body.expire_by = Math.floor(Date.now() / 1000) + i.expireDays * 86400;
  const j = await call("/payment_links", { method: "POST", body: JSON.stringify(body) });
  return { id: String(j.id), url: String(j.short_url) };
}

export interface LinkState {
  status: "created" | "partially_paid" | "expired" | "cancelled" | "paid";
  paymentId?: string;
  method?: string;
  amountPaid: number; // rupees
}

export async function fetchPayLink(id: string): Promise<LinkState> {
  const j = await call(`/payment_links/${encodeURIComponent(id)}`);
  const pay = Array.isArray(j.payments) ? j.payments.find((p: { status?: string }) => p.status === "captured") ?? j.payments[0] : undefined;
  return { status: j.status, paymentId: pay?.payment_id, method: pay?.method, amountPaid: (Number(j.amount_paid) || 0) / 100 };
}

/** X-Razorpay-Signature = HMAC-SHA256(raw body, webhook secret) in hex. */
export function verifyWebhook(raw: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const mine = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(mine);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Razorpay payment method -> the mode recorded on the admission. */
export const modeFor = (method?: string) => (method === "card" || method === "emi" ? "Card" : method === "netbanking" ? "Bank transfer" : "UPI");
