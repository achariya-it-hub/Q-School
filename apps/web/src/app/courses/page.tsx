import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Catalogue } from "@/components/courses/catalogue";
import { getCatalogue } from "@/lib/courses/public";

// Courses are managed in Admin Console › Courses, so read them on every request.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCatalogue();
  return (
    <>
      <SiteHeader />
      <main className="container-qs py-12">
        <h1 className="text-3xl font-bold text-brand-deep">All courses</h1>
        <p className="mt-2 text-sm text-[#5c7772]">Live batches, recorded programs and hybrid learning tracks.</p>
        <Catalogue courses={courses} />
      </main>
      <SiteFooter />
    </>
  );
}
