import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RbiqExperience } from "@/components/rbiq/rbiq-experience";

export const metadata: Metadata = {
  title: "RBIQ – Whole Brain Development Program | Q-School",
  description:
    "Unlock Potential. Engineer Brilliance. 9 engaging whole-brain skill-building activities designed to strengthen children's cognitive development, concentration, coordination, memory, and problem-solving abilities.",
};

export default function RbiqPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <RbiqExperience />
      </main>
      <SiteFooter />
    </>
  );
}

