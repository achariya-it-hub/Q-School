import type { Metadata } from "next";
import Image from "next/image";
import { inr, studentFeeSummary } from "@qschool/shared";
import { easebuzzConfigured, easebuzzEnv } from "@/lib/payments/easebuzz";
import { findPayLink } from "@/lib/students/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pay fees | Q-School", robots: { index: false, follow: false } };

const BANNER: Record<string, { tone: string; title: string; body: string }> = {
  success: { tone: "border-emerald-200 bg-emerald-50 text-emerald-900", title: "Payment successful", body: "Thank you! Your payment was received. A confirmation will follow from the Q-School team." },
  paid: { tone: "border-emerald-200 bg-emerald-50 text-emerald-900", title: "Already paid", body: "This fee has already been paid. No further action is needed." },
  failure: { tone: "border-rose-200 bg-rose-50 text-rose-900", title: "Payment failed", body: "The payment did not go through and no money was taken. Please try again or use another method." },
  cancelled: { tone: "border-amber-200 bg-amber-50 text-amber-900", title: "Payment cancelled", body: "You cancelled the payment. You can try again whenever you are ready." },
  invalid: { tone: "border-rose-200 bg-rose-50 text-rose-900", title: "We couldn't verify this payment", body: "If money was debited, it will be confirmed automatically or refunded. Please contact Q-School with the reference below." },
  error: { tone: "border-rose-200 bg-rose-50 text-rose-900", title: "Couldn't start the payment", body: "Please try again in a moment." },
  expired: { tone: "border-slate-200 bg-slate-50 text-slate-800", title: "Link expired", body: "This payment link has expired. Please ask Q-School for a new one." },
  cancelled_link: { tone: "border-slate-200 bg-slate-50 text-slate-800", title: "Link cancelled", body: "This payment link is no longer active. Please ask Q-School for a new one." },
};

const mask = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  return d.length >= 4 ? `•••••• ${d.slice(-4)}` : "";
};

export default async function PayPage({ params, searchParams }: { params: { linkId: string }; searchParams: Record<string, string | undefined> }) {
  const found = await findPayLink(decodeURIComponent(params.linkId));
  const result = searchParams.result;

  if (!found || found.link.provider !== "easebuzz") {
    return (
      <Shell>
        <h1 className="text-xl font-extrabold text-brand-deep">Payment link not found</h1>
        <p className="mt-2 text-[14px] text-[#41564f]">Please check the link you received, or contact Q-School on +91 99444 54840.</p>
      </Shell>
    );
  }

  const { student, link } = found;
  const fee = studentFeeSummary(student);
  const isPaid = link.status === "Paid";
  const isPartPayment = fee.totalFee > link.amount;
  const balanceAfterThis = isPaid ? fee.balance : Math.max(0, Math.round((fee.balance - link.amount) * 100) / 100);
  const bannerKey = isPaid ? (result === "success" ? "success" : "paid") : link.status === "Expired" ? "expired" : link.status === "Cancelled" ? "cancelled_link" : result;
  const banner = bannerKey ? BANNER[bannerKey] : undefined;
  // Returned "success" but not settled yet (e.g. webhook still on its way): reassure instead of offering to pay twice.
  const processing = !isPaid && result === "success";

  return (
    <Shell>
      {easebuzzEnv() === "test" && (
        <p className="mb-4 rounded-lg bg-amber-100 px-3 py-1.5 text-center text-[12px] font-bold uppercase tracking-wider text-amber-900">
          Test mode · Easebuzz staging · no real money is charged
        </p>
      )}
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-teal">
        {isPartPayment ? "Q-School part-payment checkout" : "Q-School fee payment"}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold text-brand-deep">{inr(link.amount)}</h1>
      <p className="mt-1 text-[14px] text-[#41564f]">{link.description}</p>

      {isPartPayment && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-[#D8EAE4] bg-[#F4FAF8] p-3 text-center text-[12px]">
          <div>
            <p className="text-[10.5px] text-[#6b807b]">Total Course Fee</p>
            <p className="font-bold text-brand-ink">{inr(fee.totalFee)}</p>
          </div>
          <div>
            <p className="text-[10.5px] text-[#6b807b]">{isPaid ? "Total Paid" : "Paying Now"}</p>
            <p className="font-bold text-[#0E937E]">{inr(isPaid ? fee.paid : link.amount)}</p>
          </div>
          <div>
            <p className="text-[10.5px] text-[#6b807b]">{isPaid ? "Balance Left" : "Balance After"}</p>
            <p className="font-bold text-brand-ink">{inr(balanceAfterThis)}</p>
          </div>
        </div>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#F7FAF9] p-4 text-[13px]">
        <div>
          <dt className="text-[11px] text-[#7B8E89]">Student</dt>
          <dd className="font-semibold text-brand-ink">{student.studentName}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-[#7B8E89]">Parent</dt>
          <dd className="font-semibold text-brand-ink">{student.parentName}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-[#7B8E89]">Mobile</dt>
          <dd className="font-semibold text-brand-ink">{mask(student.phone)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-[#7B8E89]">Reference</dt>
          <dd className="font-mono text-[12px] font-semibold text-brand-ink">{link.id}</dd>
        </div>
      </dl>

      {(banner || processing) && (
        <div className={`mt-5 rounded-xl border p-4 ${processing ? BANNER.success.tone : banner!.tone}`}>
          <p className="font-bold">{processing ? "Payment received, confirming…" : banner!.title}</p>
          <p className="mt-1 text-[13px]">
            {processing ? "Your payment went through. It will show as confirmed within a few minutes — you don't need to pay again." : banner!.body}
          </p>
          {(searchParams.ref || searchParams.msg) && (
            <p className="mt-2 text-[12px] opacity-80">
              {searchParams.ref && <>Ref: {searchParams.ref} </>}
              {searchParams.msg && <>· {searchParams.msg}</>}
            </p>
          )}
        </div>
      )}

      {link.status === "Created" && !processing && (
        easebuzzConfigured() ? (
          <form action="/api/payments/easebuzz/start" method="POST" className="mt-6">
            <input type="hidden" name="linkId" value={link.id} />
            <button type="submit" className="btn-3d btn-3d-teal w-full rounded-xl px-6 py-4 text-[15px] font-extrabold">
              {result && result !== "success" ? "Try again" : "Pay"} {inr(link.amount)} securely
            </button>
            <p className="mt-3 text-center text-[12px] text-[#6b807b]">UPI · Cards · Net banking · Wallets · EMI — processed securely by Easebuzz</p>
          </form>
        ) : (
          <p className="mt-6 rounded-xl bg-rose-50 p-3 text-[13px] text-rose-800">Online payment is temporarily unavailable. Please contact Q-School.</p>
        )
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[#F4FAF8] px-4 py-10 sm:items-center">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <Image src="/logo.png" alt="Q-School" width={120} height={40} className="h-10 w-auto" />
        </div>
        <div className="rounded-2xl border border-[#D9E6E2] bg-white p-6 shadow-sm">{children}</div>
        <p className="mt-4 text-center text-[11.5px] text-[#7B8E89]">Questions? Call or WhatsApp +91 99444 54840 · info@theqschool.com</p>
      </div>
    </main>
  );
}
