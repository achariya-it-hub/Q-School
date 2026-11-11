import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FiveDFramework } from "@/components/landing/five-d-stack";

export const metadata: Metadata = {
  title: "The Q 5D™ XYZTP Framework | Q-School",
  description:
    "One framework. Five dimensions: Conscious → Deep Learning → Flow and Application → Time → Peak Possibility.",
};

export default function Q5DFrameworkPage() {
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
        <FiveDFramework />
      </main>
      <SiteFooter />
    </>
  );
}

