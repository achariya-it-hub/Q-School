import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | The Q School",
  description: "Privacy Policy and data protection terms for The Q School and its educational ERP/LMS services.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 29, 2026";

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-brand-ink flex flex-col justify-between">
      <SiteHeader />

      <main className="container-qs mx-auto px-4 py-12 max-w-4xl flex-1">
        <div className="mb-8 border-b border-[#E2ECE9] pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">Legal & Compliance</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-ink">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[#6b807b]">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-[#2C3E3A]">
          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>The Q School</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We respect your privacy and are committed
              to protecting the personal data of our students, prospective applicants, webinar attendees, and visitors.
              This Privacy Policy explains how we collect, use, store, and safeguard your information when you interact
              with our website, educational ERP portal (<strong>https://erp.theqschool.com</strong>), mobile applications,
              and our advertising campaigns on platforms such as Meta (Facebook and Instagram) and Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">2. Information We Collect</h2>
            <p>We may collect and process the following categories of personal information:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>
                <strong>Contact Information:</strong> Full name, phone number, WhatsApp contact number, and email address.
              </li>
              <li>
                <strong>Educational & Professional Background:</strong> Course of interest (e.g., BMIT, AI programs, technical degrees), educational qualifications, current occupation, and learning goals.
              </li>
              <li>
                <strong>Ad Submissions & Inquiries:</strong> Information you voluntarily provide when submitting an inquiry through our website forms or instant lead forms on Meta (Facebook / Instagram) and Google Ads.
              </li>
              <li>
                <strong>Account & ERP Usage:</strong> Login credentials, attendance records, batch schedules, assignment submissions, course progression, and communication logs within the LMS.
              </li>
              <li>
                <strong>Technical Information:</strong> IP address, browser type, operating system, and general usage analytics when visiting our web portal.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">3. How We Use Your Information</h2>
            <p>We utilize the collected information for legitimate educational and institutional purposes, including:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Responding to your inquiries and providing comprehensive course information, fee structures, and counselling.</li>
              <li>Processing registrations for demo classes, live webinars, workshops, and admissions.</li>
              <li>Sending transactional updates, schedule notifications, and reminders via Email, SMS, or WhatsApp.</li>
              <li>Operating, securing, and maintaining our student management and ERP systems.</li>
              <li>Analyzing and improving our curriculum, educational services, and advertising efficacy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">4. Meta (Facebook & Instagram) Lead Ads</h2>
            <p>
              When you submit your contact details via Meta Lead Ads on Facebook or Instagram, your information is
              securely transmitted via Meta Graph Webhooks directly to our encrypted CRM server.
            </p>
            <p className="mt-2">
              We use this information exclusively to fulfill your specific request (such as scheduling an academic counselling
              session or sending you a course prospectus). <strong>We never sell, rent, or trade your lead data to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">5. Data Sharing and Third-Party Disclosures</h2>
            <p>
              We do not share your personal information with external organizations, except in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>
                <strong>Trusted Service Providers:</strong> Cloud infrastructure hosting, transactional SMS/WhatsApp messaging gateways, and payment processors who operate under strict non-disclosure and data protection agreements.
              </li>
              <li>
                <strong>Legal Requirements:</strong> When mandated by applicable law, court order, or governmental authorities to comply with statutory legal processes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">6. Data Security and Retention</h2>
            <p>
              We implement industry-standard technical and organizational security controls (including SSL/TLS encryption,
              restricted database access, and cryptographic authentication) to protect your personal data from unauthorized
              access, alteration, disclosure, or destruction.
            </p>
            <p className="mt-2">
              We retain your information only as long as necessary to fulfill the educational purposes for which it was
              collected or to comply with statutory and academic record-keeping obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">7. User Data Deletion &amp; Your Rights</h2>
            <p>
              You have the right to access, correct, or request the complete deletion of your personal data stored in our systems.
            </p>
            <div className="mt-3 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-4">
              <h3 className="font-semibold text-brand-ink text-sm">How to request data deletion:</h3>
              <p className="mt-1 text-sm text-[#41564f]">
                If you wish to delete your user account, contact records, or data submitted through Facebook/Instagram forms,
                please send an email with the subject line <strong>&quot;Data Deletion Request&quot;</strong> to{" "}
                <a href="mailto:admin@theqschool.com" className="font-semibold text-brand-teal hover:underline">
                  admin@theqschool.com
                </a>{" "}
                or visit our dedicated{" "}
                <Link href="/data-deletion" className="font-semibold text-brand-teal hover:underline">
                  User Data Deletion Instructions page
                </Link>.
              </p>
              <p className="mt-2 text-xs text-[#6b807b]">
                Requests are processed within 48 to 72 business hours, after which all corresponding personal identifiers are permanently purged from active databases.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-ink mb-3">8. Contact Us</h2>
            <p>
              If you have any questions, feedback, or concerns regarding this Privacy Policy or our data handling practices, please contact our compliance desk:
            </p>
            <div className="mt-3 text-sm text-[#41564f] space-y-1">
              <p><strong>The Q School</strong></p>
              <p>Email: <a href="mailto:admin@theqschool.com" className="text-brand-teal hover:underline">admin@theqschool.com</a></p>
              <p>Website: <a href="https://erp.theqschool.com" className="text-brand-teal hover:underline">https://erp.theqschool.com</a></p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
