import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "User Data Deletion Instructions | The Q School",
  description: "Instructions for requesting deletion of user data and lead submissions for The Q School and ERP platform.",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] text-brand-ink flex flex-col justify-between">
      <SiteHeader />

      <main className="container-qs mx-auto px-4 py-12 max-w-4xl flex-1">
        <div className="mb-8 border-b border-[#E2ECE9] pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">Data Rights & Privacy</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-ink">
            User Data Deletion Instructions
          </h1>
          <p className="mt-2 text-sm text-[#6b807b]">
            Compliant with Meta Platform Terms &amp; GDPR / Applicable Data Protection Regulations
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-[15px] leading-relaxed text-[#2C3E3A]">
          <p>
            The Q School (&quot;The Q School&quot;, &quot;Q-School ERP&quot;) values your personal privacy. In accordance with Meta Platform
            rules for Facebook and Instagram Lead Ads and general data protection standards, users have the right to request
            the complete removal of their personal data from our servers.
          </p>

          <section className="rounded-2xl border border-[#E2ECE9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-ink mb-3">How to Request Deletion of Your Data</h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm text-[#384C46]">
              <li>
                <strong>By Email (Recommended):</strong>
                <p className="mt-1">
                  Send an email from the email address associated with your registration or lead submission to:
                  <br />
                  <a href="mailto:admin@theqschool.com" className="font-semibold text-brand-teal hover:underline">
                    admin@theqschool.com
                  </a>
                </p>
                <p className="mt-1">
                  Subject: <code>Data Deletion Request - [Your Name]</code>
                </p>
                <p className="mt-1">
                  In the body of the email, please include the phone number and email address you used when filling out the form so we can locate your record.
                </p>
              </li>
              <li>
                <strong>Through Facebook / Meta App Settings:</strong>
                <p className="mt-1">
                  You can also manage or remove authorized apps via your Facebook account:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Go to your Facebook Profile → <strong>Settings &amp; Privacy</strong> → <strong>Settings</strong>.</li>
                  <li>Click <strong>Apps and Websites</strong>.</li>
                  <li>Locate <strong>The Q School</strong>, check the box, and click <strong>Remove</strong>.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-ink mb-2">What Happens Once You Submit a Request?</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-[#41564f]">
              <li>Our data privacy officer will verify the request within 24 hours.</li>
              <li>Your contact information (name, email, phone number, and form submissions) will be permanently purged from our CRM and marketing databases within 48 to 72 business hours.</li>
              <li>You will receive a confirmation email once the deletion process is complete.</li>
            </ul>
          </section>

          <p className="text-xs text-[#7B8E89]">
            For more details on how we protect your information, please view our full{" "}
            <Link href="/privacy" className="text-brand-teal underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
