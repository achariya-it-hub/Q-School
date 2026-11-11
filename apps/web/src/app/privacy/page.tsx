import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Q-School - A Unit of Divine Grace Foundation",
  description:
    "Privacy Policy and child & parent data protection terms for Q-School (A Unit of Divine Grace Foundation).",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 11, 2026";

  return (
    <div className="min-h-screen bg-[#F4FAF8] text-brand-ink flex flex-col justify-between">
      <SiteHeader />

      <main className="container-qs mx-auto px-4 py-12 max-w-4xl flex-1">
        <div className="mb-8 rounded-3xl border border-[#CFE3DD] bg-brand-deep p-8 sm:p-10 text-white shadow-lg">
          <span className="inline-block rounded-full bg-[#2BD6B4]/20 border border-[#2BD6B4]/40 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
            Legal &amp; Compliance
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#9ED8CC] font-semibold">
            Q-School - A Unit of Divine Grace Foundation · Last updated: {lastUpdated}
          </p>
        </div>

        <div className="rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-10 shadow-sm space-y-8 text-[15px] leading-relaxed text-[#2C3E3A]">
          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>Q-School - A Unit of Divine Grace Foundation</strong> (&quot;Q-School&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We respect the privacy of parents, guardians, and young learners aged 6–14 and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and safeguard information when you interact with our website (<strong>https://www.theqschool.com</strong>), learning centres across India, live online cohorts, RBIQ assessments, and mobile/web learning portals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">2. Information We Collect</h2>
            <p>We collect only the information required to deliver our educational programs and counselling services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Parent / Guardian Contact Information:</strong> Parent&apos;s full name, phone number, WhatsApp number, email address, and city or preferred learning centre.
              </li>
              <li>
                <strong>Learner Details (Submitted by Parent/Guardian):</strong> Child&apos;s name, age or school grade, program of interest (Q-Vision, Q-Creation, Q-Way, Q-Learning, Q-Reading, Q-Mastery, Q-Maths, Q-Science, or RBIQ), and assessment notes shared during demo classes.
              </li>
              <li>
                <strong>Learning Progress &amp; Attendance:</strong> Batch schedules, class attendance, weekly progress updates on focus, memory, habits and confidence, and capstone project records.
              </li>
              <li>
                <strong>Technical &amp; Website Analytics:</strong> Standard browser type, device type, IP address, and form interaction logs used to keep our platform secure and responsive.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information exclusively for educational and parent-support purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Scheduling and conducting your child&apos;s free 45-minute demo class or RBIQ whole-brain assessment.</li>
              <li>Recommending the right starting program and pathway (Year 1 Foundation, Year 2 Progression, Year 3 Advanced, or RBIQ) for your child&apos;s age and needs.</li>
              <li>Sending batch schedules, class reminders, and weekly parent progress reports via call, WhatsApp, SMS, or email.</li>
              <li>Providing learner access to Q-Master AI and guided home-practice resources.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">4. Communication &amp; Opt-Out</h2>
            <p>
              When you submit an enquiry or demo booking form on our website or through social campaigns (Meta / Google), you consent to being contacted by Q-School via phone call, WhatsApp, SMS, or email. You may opt out of WhatsApp or promotional messages at any time by replying <strong>STOP</strong> or contacting our support desk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">5. Data Sharing &amp; Protection</h2>
            <p>
              <strong>We never sell, rent, or trade parent or student data to third parties.</strong> Information is shared only with authorised Q-School mentors, academic counsellors, and trusted infrastructure providers (such as secure cloud hosting, payment gateways, and transactional messaging services) bound by strict confidentiality obligations, or when required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">6. Data Security, Access &amp; Deletion Rights</h2>
            <p>
              We implement industry-standard encryption and access controls to safeguard your family&apos;s records. Parents and guardians may request access to, correction of, or deletion of their personal data at any time by emailing{" "}
              <a href="mailto:info@theqschool.com" className="font-bold text-brand-teal hover:underline">
                info@theqschool.com
              </a>{" "}
              or visiting our{" "}
              <Link href="/data-deletion" className="font-bold text-brand-teal hover:underline">
                User Data Deletion page
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-brand-deep mb-3">7. Contact Us</h2>
            <div className="rounded-2xl border border-[#CFE3DD] bg-[#F4FAF8] p-5 text-sm text-[#2b3d38] space-y-1.5">
              <p className="font-extrabold text-brand-deep text-base">
                Q-School - A Unit of Divine Grace Foundation
              </p>
              <p>
                Phone / WhatsApp:{" "}
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
                <Link href="/refund-policy" className="font-bold text-brand-teal hover:underline">
                  Refund Policy →
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
