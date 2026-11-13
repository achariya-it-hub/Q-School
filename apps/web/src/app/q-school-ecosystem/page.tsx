import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EcosystemExperience } from "@/components/landing/ecosystem-experience";

export const metadata: Metadata = {
  title: "Q-School Ecosystem | Beyond Learning. Towards a Bigger Future.",
  description:
    "Be a part of the Q-School movement. Different journeys. One vision. A future-ready generation — for Parents, Students, and Franchise Partners.",
};

export default function QSchoolEcosystemPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <EcosystemExperience />
      </main>
      <SiteFooter />
    </>
  );
}
