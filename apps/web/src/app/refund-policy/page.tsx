import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Q-School - A Unit of Divine Grace Foundation",
  description:
    "Refund, cancellation, and batch transfer policy for Q-School - A Unit of Divine Grace Foundation.",
};

export default function RefundPolicyPage() {
  const lastUpdated = "November 11, 2026";

  return (
    <div className="min-h-screen bg-[#F4FAF8] text-brand-ink flex flex-col justify-between">
      <SiteHeader />

      <main className="container-qs mx-auto px-4 py-12 max-w-4xl flex-1">
        <div className="mb-8 rounded-3xl border border-[#CFE3DD] bg-brand-deep p-8 sm:p-10 text-white shadow-lg">
          <span className="inline-block rounded-full bg-[#2BD6B4]/20 border border-[#2BD6B4]/40 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
            Parent &amp; Enrolment Terms
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2 text-sm text-[#9ED8CC] font-semibold">
            Q-School - A Unit of Divine Grace Foundation · Last updated: {lastUpdated}
          </p>
        </div>

        <div className="rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-10 shadow-sm space-y-8 text-[15px] leading-relaxed text-[#2C3E3A]">
          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">
              1. Free Demo Class &amp; Assessment (Zero Obligation)
            </h2>
            <p>
              Every child at <strong>Q-School - A Unit of Divine Grace Foundation</strong> begins with a <strong>free 45-minute demo session or RBIQ assessment</strong>. There is no fee and no obligation to enrol during or after the demo class. We encourage parents and children to experience our teaching methodology firsthand before making an enrolment decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">
              2. Program Enrolment &amp; Cooling-Off Period
            </h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Before Batch Commencement:</strong> If a parent requests cancellation in writing at least 48 hours prior to the start of the first scheduled class of the enrolled batch, 100% of the tuition fee paid (excluding any opened physical learning kits and applicable payment gateway charges) is eligible for a refund.
              </li>
              <li>
                <strong>Within the First 2 Classes (7-Day Trial Window):</strong> If you feel the program is not the right fit for your child within the first 2 attended sessions (or within 7 calendar days of batch start, whichever comes first), you may request a cancellation for a pro-rated refund after deducting the registration/administrative fee and the cost of physical learning kits issued.
              </li>
              <li>
                <strong>After 2 Classes / 7 Days:</strong> Because Q-School cohorts are strictly capped at 15 children per batch and mentor seats are reserved for the annual 48-class cycle, fees are non-refundable once a learner has completed more than 2 classes or 7 calendar days from batch commencement.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">
              3. Batch Transfers &amp; Mode Switching (Centre ↔ Live Online)
            </h2>
            <p>
              We understand that family schedules and locations can change. Instead of cancelling, parents may request at no additional tuition cost:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Batch Timing Change:</strong> Moving between weekend and weekday evening batches at the same centre (subject to seat availability within the 15-child limit).
              </li>
              <li>
                <strong>Centre-to-Centre or Online Transfer:</strong> Transferring your child&apos;s active enrolment between any of our 9 physical centres (Chennai, Bengaluru, Puducherry, Hyderabad, Trichy, Pune, Coimbatore) or switching seamlessly to a live mentor-led online cohort.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">
              4. Learning Kits &amp; Study Materials
            </h2>
            <p>
              Physical learning kits, activity tools (such as RBIQ tactile kits), and workbooks are custom-issued to each learner upon enrolment. Opened or used learning kits are non-returnable and non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">
              5. How to Request a Refund or Transfer
            </h2>
            <p>
              To request a cancellation, refund, or batch transfer, please email{" "}
              <a href="mailto:info@theqschool.com" className="font-bold text-brand-teal hover:underline">
                info@theqschool.com
              </a>{" "}
              with your child&apos;s name, registered phone number, centre name, and fee receipt details. Approved refunds are processed back to the original payment method within <strong>7 to 10 working days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">6. Support &amp; Grievance Redressal</h2>
            <div className="rounded-2xl border border-[#CFE3DD] bg-[#F4FAF8] p-5 text-sm text-[#2b3d38] space-y-1.5">
              <p className="font-extrabold text-brand-deep text-base">
                Q-School - A Unit of Divine Grace Foundation
              </p>
              <p>
                Helpline (Call / WhatsApp):{" "}
                <a href="tel:+919944454840" className="font-bold text-brand-teal hover:underline">
                  +91 99444 54840
                </a>{" "}
                (Mon–Sat, 9am–7pm IST)
              </p>
              <p>
                Email:{" "}
                <a href="mailto:info@theqschool.com" className="font-bold text-brand-teal hover:underline">
                  info@theqschool.com
                </a>
              </p>
              <p>
                Also see our{" "}
                <Link href="/privacy" className="font-bold text-brand-teal hover:underline">
                  Privacy Policy →
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

