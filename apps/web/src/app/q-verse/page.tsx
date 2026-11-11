import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QVerseSection } from "@/components/landing/qverse-section";

export const metadata: Metadata = {
  title: "The Q-Verse | Q-School",
  description:
    "One ecosystem, ten connected tracks: Eight core programs for children, with Q-Habit and Q-Parenting supporting learning at home.",
};

export default function QVersePage() {
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
        <QVerseSection />
      </main>
      <SiteFooter />
    </>
  );
}

