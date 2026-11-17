/**
 * Server-only: Easebuzz payment gateway (hosted checkout).
 *
 * Env (never commit real values):
 *   EASEBUZZ_KEY      merchant key
 *   EASEBUZZ_SALT     merchant salt
 *   EASEBUZZ_ENV      "test" (staging kit, default) | "prod"
 *   EASEBUZZ_MID      merchant id (shown in the Console only)
 *   PUBLIC_URL        https://your-domain (used for the return URLs; falls back to the request host)
 *
 * Flow (docs.easebuzz.in → Payment Gateway → Initiate Payment):
 *   1. POST {pay}/payment/initiateLink with the order fields + SHA-512 hash → { status: 1, data: <access_key> }
 *   2. Send the payer to {pay}/pay/<access_key> (hosted checkout: UPI, cards, net banking, wallets, EMI)
 *   3. Easebuzz POSTs the result to surl / furl (and the webhook). We verify the reverse hash before trusting it.
 *   4. Transaction API {dashboard}/transaction/v2.1/retrieve confirms the final status on demand.
 */
import { createHash, timingSafeEqual } from "crypto";

const isProd = () => (process.env.EASEBUZZ_ENV || "test").toLowerCase() === "prod";
export const easebuzzEnv = () => (isProd() ? "prod" : "test");
const PAY = () => (isProd() ? "https://pay.easebuzz.in" : "https://testpay.easebuzz.in");
const DASH = () => (isProd() ? "https://dashboard.easebuzz.in" : "https://testdashboard.easebuzz.in");

export const easebuzzConfigured = () => !!(process.env.EASEBUZZ_KEY && process.env.EASEBUZZ_SALT);
const key = () => (process.env.EASEBUZZ_KEY || "").trim();
const salt = () => (process.env.EASEBUZZ_SALT || "").trim();

const sha512 = (s: string) => createHash("sha512").update(s, "utf8").digest("hex");

const UDFS = ["udf1", "udf2", "udf3", "udf4", "udf5", "udf6", "udf7", "udf8", "udf9", "udf10"] as const;

/** Easebuzz validates these strictly; clean them so a stray character doesn't fail the payment. */
const clean = {
  name: (s: string) => (s || "Parent").replace(/[^A-Za-z .]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) || "Parent",
  product: (s: string) => (s || "Q-School fee").replace(/[^A-Za-z0-9 ,.\-_()/&]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100) || "Q-School fee",
  phone: (s: string) => (s || "").replace(/\D/g, "").slice(-10),
  email: (s?: string) => (s && /^\S+@\S+\.\S+$/.test(s.trim()) ? s.trim() : "payments@theqschool.com"),
  udf: (s?: string) => (s || "").replace(/[^A-Za-z0-9 \-_.:@]/g, "").slice(0, 100),
};

export interface InitiateInput {
  txnid: string; // unique per attempt
  amount: number; // rupees
  productinfo: string;
  firstname: string;
  phone: string;
  email?: string;
  surl: string;
  furl: string;
  udf?: Partial<Record<(typeof UDFS)[number], string>>;
}

/** Step 1: create the checkout session. Returns the hosted checkout URL. */
export async function initiatePayment(i: InitiateInput): Promise<{ accessKey: string; url: string }> {
  if (!easebuzzConfigured()) throw new Error("Easebuzz is not set up yet. Add EASEBUZZ_KEY and EASEBUZZ_SALT on the server and restart.");
  const phone = clean.phone(i.phone);
  if (phone.length !== 10) throw new Error("A 10-digit mobile number is needed for Easebuzz payments");
  const f: Record<string, string> = {
    key: key(),
    txnid: i.txnid.replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 40),
    amount: i.amount.toFixed(2),
    productinfo: clean.product(i.productinfo),
    firstname: clean.name(i.firstname),
    email: clean.email(i.email),
    phone,
    surl: i.surl,
    furl: i.furl,
  };
  for (const u of UDFS) f[u] = clean.udf(i.udf?.[u]);
  // key|txnid|amount|productinfo|firstname|email|udf1|…|udf10|salt
  f.hash = sha512([f.key, f.txnid, f.amount, f.productinfo, f.firstname, f.email, ...UDFS.map((u) => f[u]), salt()].join("|"));

  const r = await fetch(`${PAY()}/payment/initiateLink`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(f).toString(),
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  if (Number(j?.status) !== 1 || !j?.data) {
    const why = typeof j?.data === "string" ? j.data : j?.error_desc || j?.message || `HTTP ${r.status}`;
    throw new Error(`Easebuzz could not start the payment: ${why}`);
  }
  return { accessKey: String(j.data), url: `${PAY()}/pay/${encodeURIComponent(String(j.data))}` };
}

/**
 * Verify the result Easebuzz posts to surl/furl/webhook.
 * Reverse hash: salt|status|udf10|…|udf1|email|firstname|productinfo|amount|txnid|key
 */
export function verifyResponse(p: Record<string, string>): boolean {
  if (!easebuzzConfigured() || !p?.hash) return false;
  if ((p.key || "").trim() !== key()) return false;
  const seq = [salt(), p.status ?? "", ...[...UDFS].reverse().map((u) => p[u] ?? ""), p.email ?? "", p.firstname ?? "", p.productinfo ?? "", p.amount ?? "", p.txnid ?? "", p.key ?? ""];
  const mine = Buffer.from(sha512(seq.join("|")));
  const theirs = Buffer.from(String(p.hash).toLowerCase());
  return mine.length === theirs.length && timingSafeEqual(mine, theirs);
}

export interface TxnState {
  status: "success" | "failure" | "pending" | "userCancelled" | "dropped" | "bounced" | "unknown";
  easepayid?: string;
  mode?: string;
  amount?: number;
  raw?: unknown;
}

const normStatus = (s?: string): TxnState["status"] => {
  const v = String(s || "").toLowerCase();
  if (v === "success") return "success";
  if (v === "failure" || v === "failed") return "failure";
  if (v === "usercancelled") return "userCancelled";
  if (v === "dropped") return "dropped";
  if (v === "bounced") return "bounced";
  if (v === "pending" || v === "initiated") return "pending";
  return "unknown";
};

/** Transaction API: ask Easebuzz for the final status of one txnid. */
export async function retrieveTransaction(txnid: string): Promise<TxnState> {
  if (!easebuzzConfigured()) throw new Error("Easebuzz is not set up yet.");
  const body = new URLSearchParams({ txnid, key: key(), hash: sha512([key(), txnid, salt()].join("|")) });
  const r = await fetch(`${DASH()}/transaction/v2.1/retrieve`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  const list = Array.isArray(j?.msg) ? j.msg : j?.msg && typeof j.msg === "object" ? [j.msg] : [];
  if (!j?.status || !list.length) return { status: "unknown", raw: j };
  // A txnid can have several attempts; a success wins, else the latest.
  const t = list.find((x: any) => normStatus(x?.status) === "success") ?? list[list.length - 1];
  return { status: normStatus(t?.status), easepayid: t?.easepayid, mode: t?.mode, amount: Number(t?.amount) || undefined, raw: t };
}

/** Easebuzz mode (UPI, CC, DC, NB, MW, EMI…) → the mode recorded on the admission. */
export const easebuzzModeFor = (mode?: string) => {
  const m = String(mode || "").toUpperCase();
  if (["CC", "DC", "EMI", "CARD", "DEBIT CARD", "CREDIT CARD"].includes(m)) return "Card";
  if (["NB", "NETBANKING", "NET BANKING"].includes(m)) return "Bank transfer";
  return "UPI";
};

/** Base URL for return URLs: PUBLIC_URL / PUBLIC_BASE_URL, else the incoming request's host. */
export function publicBase(req: Request): string {
  const env = (process.env.PUBLIC_URL || process.env.PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
  if (env) return env;
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3100";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
