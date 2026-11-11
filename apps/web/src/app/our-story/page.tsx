import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorySection } from "@/components/landing/story-section";
import { PedagogySection } from "@/components/landing/pedagogy-section";
import { AiVsHiSection } from "@/components/landing/ai-vs-hi-scroll";

export const metadata: Metadata = {
  title: "Our Story and Founder's Vision | Q-School",
  description:
    "Learn how Q-School helps children build focus, values and thinking skills that marks alone cannot measure.",
};

export default function OurStoryPage() {
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
        <StorySection />
        <PedagogySection />
        <AiVsHiSection />
      </main>
      <SiteFooter />
    </>
  );
}

