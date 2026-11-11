import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NeoSapiensSection } from "@/components/landing/neo-sapiens-section";

export const metadata: Metadata = {
  title: "What Is a Neo Sapiens? | Q-School",
  description:
    "A future-ready learner who pairs strong academics with creativity, emotional balance and clear values.",
};

export default function NeoSapiensPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#f4faf8]">
        <div className="container-qs pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-teal hover:text-brand-deep transition"
          >
            ← Back to Home
          </Link>
        </div>
        <NeoSapiensSection />
      </main>
      <SiteFooter />
    </>
  );
}

