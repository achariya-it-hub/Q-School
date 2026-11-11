import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProgram, PROGRAMS } from "@qschool/shared";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { Icon } from "@/components/icons";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const program = findProgram(params.slug);
  if (!program) {
    return { title: "Program Not Found | Q-School" };
  }
  return {
    title: `${program.title} — ${program.overview} | Q-School`,
    description: `${program.title}: ${program.overview}. ${program.format} for ages 6–14 at Q-School.`,
  };
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = findProgram(params.slug);
  if (!program) notFound();

  return (
    <>
      <SiteHeader />
      <main className="bg-[#f4faf8] pb-20">
        {/* Hero */}
        <section className="bg-brand-deep text-white py-16 lg:py-20">
          <div className="container-qs">
            <Link
              href="/#programs"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2BD6B4] hover:underline"
            >
              ← Back to all programs
            </Link>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="inline-block rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                  {program.format}
                </span>
                <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {program.title}
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  What your child builds
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2BD6B4]">
                  {program.overview}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {program.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-8">
                  <a
                    href="#book-demo"
                    className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-extrabold text-brand-deep"
                  >
                    Book a Free 45-Min Demo
                  </a>
                </div>
              </div>

              {program.image && (
                <div className="lg:col-span-5">
                  <div className="overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={program.image}
                      alt={program.title}
                      className="h-72 w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details & Curriculum */}
        <section className="container-qs mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-9 shadow-sm">
              <h2 className="text-2xl font-extrabold text-brand-deep">
                Key Outcomes in {program.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {program.learn.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-[#2b3d38]">
                    <span
                      className="icon-3d mt-0.5 h-6 w-6 rounded-full shrink-0"
                      style={{ ["--c" as string]: "#0E937E" }}
                    >
                      <Icon name="check" size={14} strokeWidth={3} className="text-white" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-9 shadow-sm">
              <h2 className="text-2xl font-extrabold text-brand-deep">Program Modules</h2>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {program.curriculum.map((mod, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#E2ECE9] bg-[#F8FCFB] p-4 flex items-start gap-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-deep text-xs font-black text-[#2BD6B4]">
                      0{i + 1}
                    </span>
                    <span className="font-bold text-sm sm:text-base text-brand-ink">{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-9 shadow-sm">
              <h2 className="text-xl font-extrabold text-brand-deep">Explore Other Programs</h2>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {PROGRAMS.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/programs/${p.slug}`}
                    className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                      p.slug === program.slug
                        ? "bg-brand-deep text-[#2BD6B4]"
                        : "bg-[#F4FAF8] border border-[#CFE3DD] text-brand-ink hover:border-brand-teal"
                    }`}
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div id="book-demo" className="lg:col-span-5 scroll-mt-24">
            <div className="rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-deep">
                Book your child&apos;s free demo class
              </h2>
              <p className="mt-1.5 mb-6 text-xs sm:text-sm text-[#5c7772]">
                A free 45-minute session. No obligation. Our counsellor will call you within 24 hours.
              </p>
              <LeadForm
                source={`program_${program.slug}`}
                defaultProgram={program.title}
                cta="Book a Free Demo"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

