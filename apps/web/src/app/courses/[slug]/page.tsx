import { notFound } from "next/navigation";
import Link from "next/link";
import { MODE_LABEL, formatINR } from "@qschool/shared";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Icon, type IconName } from "@/components/icons";
import { isAdmin } from "@/lib/crm/auth";
import { canOpen, getCourseForStudent } from "@/lib/courses/public";
import { fmtMinutes, lessonCount, totalMinutes, type LessonType } from "@/lib/courses/types";

export const dynamic = "force-dynamic";

const TYPE: Record<LessonType, { icon: IconName; label: string }> = {
  video: { icon: "video", label: "Video" },
  document: { icon: "lessons", label: "Document" },
  image: { icon: "palette", label: "Images" },
  link: { icon: "external", label: "Link" },
  text: { icon: "pencil", label: "Reading" },
};

export default async function CourseDetail({ params }: { params: { slug: string } }) {
  const admin = isAdmin();
  const course = await getCourseForStudent(params.slug, admin);
  if (!course) notFound();

  const hasCurriculum = lessonCount(course) > 0;
  const minutes = totalMinutes(course);
  const lessons = hasCurriculum ? lessonCount(course) : course.lessons;
  const firstOpen = course.curriculum.flatMap((s) => s.lessons).find((l) => canOpen(l, admin));
  const modules = [
    { t: "Foundations", n: Math.ceil(course.lessons * 0.3) },
    { t: "Core concepts", n: Math.ceil(course.lessons * 0.4) },
    { t: "Advanced applications", n: Math.ceil(course.lessons * 0.2) },
    { t: "Revision + mock tests", n: Math.ceil(course.lessons * 0.1) },
  ];

  return (
    <>
      <SiteHeader />
      {course.status !== "published" && (
        <div className="bg-[#FFC845] px-4 py-2 text-center text-[13px] font-semibold text-brand-deep">
          Draft: only Console users can see this page. Publish it from Admin › Courses.
        </div>
      )}
      <main className="container-qs py-12">
        <Link href="/courses" className="text-sm font-medium text-brand-teal hover:underline">
          ← All courses
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{course.category}</span>
              <span className="chip">{MODE_LABEL[course.mode]}</span>
              {course.level && <span className="chip">{course.level}</span>}
              <span className="chip">★ {course.rating} rating</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-brand-deep">{course.title}</h1>
            {course.subtitle && <p className="mt-2 text-lg text-[#41564f]">{course.subtitle}</p>}
            {course.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.cover} alt="" className="mt-6 aspect-[16/8] w-full rounded-2xl object-cover" />
            )}
            <p className="mt-6 whitespace-pre-line text-[#41564f]">{course.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                [`${lessons}`, "Lessons"],
                [minutes ? fmtMinutes(minutes) : course.durationHours ? `${course.durationHours}h` : "—", "Content"],
                [`${course.learners.toLocaleString("en-IN")}`, "Learners"],
                [course.mode === "recorded" ? "Self-paced" : "Live + replays", "Mode"],
              ].map(([v, l]) => (
                <div key={l} className="card p-4 text-center">
                  <p className="text-lg font-bold text-brand-teal">{v}</p>
                  <p className="text-xs text-[#5c7772]">{l}</p>
                </div>
              ))}
            </div>

            {course.outcomes.length > 0 && (
              <>
                <h2 className="mt-10 text-xl font-bold text-brand-deep">What you&apos;ll learn</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex gap-2.5 text-[14px] text-[#41564f]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal100 text-brand-deep">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="mt-10 text-xl font-bold text-brand-deep">Course content</h2>
            {hasCurriculum ? (
              <>
                <p className="mt-1 text-[13px] text-[#5c7772]">
                  {course.curriculum.length} section{course.curriculum.length === 1 ? "" : "s"} · {lessons} lesson{lessons === 1 ? "" : "s"}{minutes ? ` · ${fmtMinutes(minutes)} total` : ""}
                </p>
                <div className="mt-4 space-y-3">
                  {course.curriculum.map((s, i) => (
                    <details key={s.id} open={i === 0} className="card group overflow-hidden">
                      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-deep text-sm font-bold text-white">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-brand-deep">{s.title}</span>
                          <span className="block text-xs text-[#5c7772]">
                            {s.lessons.length} lessons
                            {s.lessons.some((l) => l.durationMin) ? ` · ${fmtMinutes(s.lessons.reduce((a, l) => a + l.durationMin, 0))}` : ""}
                          </span>
                        </span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8aa39c] transition group-open:rotate-180">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </summary>
                      <ul className="divide-y divide-[#eef5f3] border-t border-[#eef5f3]">
                        {s.lessons.map((l) => {
                          const open = canOpen(l, admin);
                          const inner = (
                            <>
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal100 text-brand-deep">
                                <Icon name={TYPE[l.type].icon} size={15} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={`block truncate text-[13.5px] ${open ? "font-semibold text-brand-deep" : "text-[#41564f]"}`}>{l.title}</span>
                                <span className="block text-[11.5px] text-[#8aa39c]">
                                  {TYPE[l.type].label}
                                  {l.durationMin ? ` · ${fmtMinutes(l.durationMin)}` : ""}
                                  {l.attachments.length ? ` · ${l.attachments.length} resource${l.attachments.length > 1 ? "s" : ""}` : ""}
                                </span>
                              </span>
                              {l.preview ? (
                                <span className="rounded-full bg-brand-teal100 px-2.5 py-1 text-[11px] font-semibold text-brand-deep">Free preview</span>
                              ) : open ? (
                                <span className="text-[11px] font-semibold text-brand-teal">Open</span>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#93a5a0]" aria-label="Locked">
                                  <rect x="5" y="11" width="14" height="10" rx="2" />
                                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                </svg>
                              )}
                            </>
                          );
                          return (
                            <li key={l.id}>
                              {open ? (
                                <Link href={`/courses/${course.slug}/learn/${l.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7fbfa]">
                                  {inner}
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                {modules.map((m, i) => (
                  <div key={m.t} className="card flex items-center gap-4 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-deep text-sm font-bold text-white">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-deep">
                        Module {i + 1}: {m.t}
                      </p>
                      <p className="text-xs text-[#5c7772]">{m.n} lessons · quizzes + assignments</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="card sticky top-24 p-6">
              <p className="text-3xl font-bold text-brand-deep">{course.price ? formatINR(course.price) : "Free"}</p>
              <p className="mt-1 text-xs text-[#5c7772]">One-time · EMI available · GST included</p>
              <Link href="/login" className="btn-primary btn-3d btn-3d-teal mt-5 w-full">
                Enroll now
              </Link>
              {firstOpen ? (
                <Link href={`/courses/${course.slug}/learn/${firstOpen.id}`} className="btn-ghost mt-3 w-full">
                  <Icon name="play" size={14} /> {admin && !firstOpen.preview ? "Open lessons (Console)" : "Watch free preview"}
                </Link>
              ) : (
                <Link href="/#demo" className="btn-ghost mt-3 w-full">
                  Book free demo
                </Link>
              )}
              <ul className="mt-6 space-y-2.5 text-sm text-[#41564f]">
                {["HD recorded lessons + live classes", "Doubt support & mentor guidance", "Tests, assignments & analytics", "QR-verified certificate", "Mobile app with offline access"].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-teal">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
