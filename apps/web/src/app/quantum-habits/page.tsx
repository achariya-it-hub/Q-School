import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JourneyAndPathwaySection } from "@/components/landing/journey-pathway-section";

export const metadata: Metadata = {
  title: "Quantum Habits | Q-School",
  description:
    "Small habits. Big possibilities. Habit → Practice → Growth across five lasting routines.",
};

export default function QuantumHabitsPage() {
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
        <JourneyAndPathwaySection />
      </main>
      <SiteFooter />
    </>
  );
}

