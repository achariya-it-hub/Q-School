import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeSections } from "@/components/landing/home-sections";
import { isAdmin } from "@/lib/crm/auth";
import { getDraftHome, getPublishedHome } from "@/lib/site/store";

// Content is edited in Admin Console › Website, so read it on every request.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { preview?: string } }) {
  // Console users can preview unpublished changes with /?preview=draft
  const preview = searchParams.preview === "draft" && isAdmin();
  const content = preview ? await getDraftHome() : await getPublishedHome();
  const demoVisible = content.sections.some((s) => s.key === "demo" && s.visible);

  return (
    <>
      {preview && (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-[#FFC845] px-4 py-2 text-[13px] font-semibold text-brand-deep">
          Draft preview: visitors can&apos;t see these changes until you publish.
          <Link href="/admin/settings/website" target="_top" className="rounded-lg bg-brand-deep px-2.5 py-1 text-[12px] text-white">
            Back to editor
          </Link>
        </div>
      )}
      <SiteHeader />

      <HomeSections content={content} />

      <SiteFooter stickyCtaSpace={demoVisible} />

      {/* mobile sticky CTA */}
      {demoVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e2ece9] bg-white/95 p-3 backdrop-blur md:hidden">
          <Link href="#demo" className="btn-3d btn-3d-teal flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold">
            Book a free demo class
          </Link>
        </div>
      )}
    </>
  );
}
