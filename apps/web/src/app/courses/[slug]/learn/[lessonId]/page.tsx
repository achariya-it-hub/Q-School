import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { isAdmin } from "@/lib/crm/auth";
import { canOpen, findLesson, getCourseForStudent } from "@/lib/courses/public";
import { fmtMinutes, fmtSize, toEmbedUrl, type Lesson, type LessonType, type MediaFile } from "@/lib/courses/types";

export const dynamic = "force-dynamic";

const TYPE: Record<LessonType, IconName> = { video: "video", document: "lessons", image: "palette", link: "external", text: "pencil" };
const dl = (f: MediaFile) => `${f.url}?download=${encodeURIComponent(f.name)}`;

function Player({ l }: { l: Lesson }) {
  if (l.type === "video") {
    const embed = l.source === "embed" ? toEmbedUrl(l.url) : null;
    if (embed)
      return (
        <iframe
          src={embed}
          title={l.title}
          className="aspect-video w-full rounded-2xl bg-black"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      );
    if (l.file)
      return (
        <video src={l.file.url} controls playsInline preload="metadata" controlsList="nodownload" className="aspect-video w-full rounded-2xl bg-black">
          Your browser can&apos;t play this video.
        </video>
      );
  }
  if (l.type === "document" && l.file) {
    const pdf = l.file.mime === "application/pdf";
    return (
      <div className="space-y-3">
        {pdf && <iframe src={`${l.file.url}${l.downloadable ? "" : "#toolbar=0"}`} title={l.title} className="h-[72vh] w-full rounded-2xl border border-[#e2ece9] bg-white" />}
        <div className="card flex flex-wrap items-center gap-3 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal100 text-brand-deep">
            <Icon name="lessons" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-brand-deep">{l.file.name}</span>
            <span className="block text-[12px] text-[#5c7772]">{fmtSize(l.file.size)}</span>
          </span>
          {/* Office files can't be previewed in the browser, so they are always offered as a download */}
          {(l.downloadable || !pdf) && (
            <a href={dl(l.file)} className="btn-primary btn-3d btn-3d-teal !px-4 !py-2.5">
              <Icon name="download" size={15} /> Download
            </a>
          )}
        </div>
      </div>
    );
  }
  if (l.type === "image" && l.images.length) {
    return (
      <div className={`grid gap-4 ${l.images.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {l.images.map((img) => (
          <figure key={img.url} className="card overflow-hidden">
            <a href={img.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption || l.title} className="w-full bg-[#f4faf8] object-contain" />
            </a>
            {img.caption && <figcaption className="px-4 py-3 text-[13px] text-[#41564f]">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }
  if (l.type === "link" && l.url) {
    let host = l.url;
    try {
      host = new URL(l.url).hostname.replace(/^www\./, "");
    } catch {}
    return (
      <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal100 text-brand-deep">
          <Icon name="external" size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-brand-deep">{l.title}</span>
          <span className="block truncate text-[13px] text-[#5c7772]">{host}</span>
        </span>
        <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary btn-3d btn-3d-teal">
          Open link <Icon name="external" size={15} />
        </a>
      </div>
    );
  }
  if (l.type === "text") return null;
  return <div className="card p-8 text-center text-sm text-[#5c7772]">This lesson&apos;s content is being prepared.</div>;
}

export default async function LearnPage({ params }: { params: { slug: string; lessonId: string } }) {
  const admin = isAdmin();
  const course = await getCourseForStudent(params.slug, admin);
  if (!course) notFound();
  const found = findLesson(course, params.lessonId);
  if (!found) notFound();
  const { l, section, prev, next, index, total } = found;
  const allowed = canOpen(l, admin);

  return (
    <div className="min-h-screen bg-[#f4faf8]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#e2ece9] bg-white/95 px-4 backdrop-blur">
        <Link href={`/courses/${course.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-brand-deep hover:bg-[#eef6f3]">
          ← <span className="hidden max-w-[40vw] truncate sm:inline">{course.title}</span>
          <span className="sm:hidden">Course</span>
        </Link>
        <span className="ml-auto text-[12px] text-[#5c7772]">
          Lesson {index + 1} of {total}
        </span>
        {admin && !l.preview && <span className="rounded-full bg-[#FFF6E0] px-2.5 py-1 text-[11px] font-semibold text-[#8A5A00]">Console preview</span>}
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 p-4 lg:grid-cols-[1fr_340px] lg:p-6">
        <main className="min-w-0">
          {allowed ? (
            <>
              <Player l={l} />
              <div className="mt-5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-teal">{section.title}</p>
                <h1 className="mt-1 text-2xl font-bold text-brand-deep">{l.title}</h1>
                {l.durationMin > 0 && <p className="mt-1 text-[13px] text-[#5c7772]">{fmtMinutes(l.durationMin)}</p>}
                {l.body && <div className={`mt-4 whitespace-pre-line leading-relaxed text-[#2b3d38] ${l.type === "text" ? "card p-6 text-[15.5px]" : "text-[14.5px]"}`}>{l.body}</div>}
              </div>

              {l.attachments.length > 0 && (
                <section className="mt-6">
                  <h2 className="text-[15px] font-semibold text-brand-deep">Resources</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {l.attachments.map((a) => (
                      <li key={a.url}>
                        <a href={dl(a)} className="card flex items-center gap-3 p-3 transition hover:border-brand-teal">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-teal100 text-brand-deep">
                            <Icon name="download" size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-brand-deep">{a.name}</span>
                            <span className="block text-[11.5px] text-[#5c7772]">{fmtSize(a.size)}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <div className="card flex flex-col items-center p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal100 text-brand-deep">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <h1 className="mt-4 text-xl font-bold text-brand-deep">{l.title}</h1>
              <p className="mt-2 max-w-sm text-sm text-[#5c7772]">This lesson is part of the full course. Enrol to unlock every lesson, or book a free demo class first.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/login" className="btn-primary btn-3d btn-3d-teal">
                  Enrol now
                </Link>
                <Link href="/#demo" className="btn-ghost">
                  Book free demo
                </Link>
              </div>
            </div>
          )}

          <nav className="mt-8 flex justify-between gap-3 border-t border-[#e2ece9] pt-5">
            {prev ? (
              <Link href={`/courses/${course.slug}/learn/${prev.id}`} className="btn-ghost !px-4 !py-2.5">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/courses/${course.slug}/learn/${next.id}`} className="btn-primary btn-3d btn-3d-teal !px-4 !py-2.5">
                Next lesson →
              </Link>
            )}
          </nav>
        </main>

        <aside className="h-max overflow-hidden rounded-2xl border border-[#e2ece9] bg-white lg:sticky lg:top-20">
          <p className="border-b border-[#eef5f3] px-4 py-3 text-[13px] font-semibold text-brand-deep">Course content</p>
          <div className="max-h-[70vh] overflow-y-auto">
            {course.curriculum.map((s, si) => (
              <div key={s.id}>
                <p className="bg-[#f7fbfa] px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[#5c7772]">
                  {si + 1}. {s.title}
                </p>
                <ul>
                  {s.lessons.map((x) => {
                    const here = x.id === l.id;
                    const open = canOpen(x, admin);
                    const row = (
                      <>
                        <Icon name={TYPE[x.type]} size={15} className={here ? "text-white" : "text-brand-teal"} />
                        <span className="min-w-0 flex-1 truncate">{x.title}</span>
                        {x.durationMin > 0 && <span className={`text-[11px] ${here ? "text-white/70" : "text-[#8aa39c]"}`}>{fmtMinutes(x.durationMin)}</span>}
                        {!open && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#93a5a0]">
                            <rect x="5" y="11" width="14" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                          </svg>
                        )}
                      </>
                    );
                    return (
                      <li key={x.id}>
                        <Link
                          href={`/courses/${course.slug}/learn/${x.id}`}
                          aria-current={here ? "page" : undefined}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] ${here ? "bg-brand-deep font-semibold text-white" : open ? "text-brand-deep hover:bg-[#f1f8f6]" : "text-[#7b908b] hover:bg-[#f7fbfa]"}`}
                        >
                          {row}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
