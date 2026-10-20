import Link from "next/link";
import {
  ENROLLMENTS,
  EVENTS,
  HUB,
  POPULAR_CATEGORIES,
  SCHEDULE,
  STUDENT,
  TODAY,
  pct,
  type HubKey,
} from "@qschool/shared";
import { Icon, type IconName } from "@/components/icons";
import { DashboardShell } from "@/components/dashboard/shell";
import { Hero } from "@/components/dashboard/hero";
import { Recommended } from "@/components/dashboard/recommended";
import { Art, Avatar } from "@/components/dashboard/art";

export const metadata = { title: "Dashboard · Q-School Learn" };

const HUB_ICON: Record<HubKey, IconName> = {
  courses: "book",
  live: "live",
  workshops: "palette",
  webinars: "webinar",
  offline: "building",
  certifications: "award",
  assessments: "clipboard",
  community: "community",
};

const CAT_ICON: IconName[] = ["sparkle", "laptop", "pencil", "message", "users", "leader", "lessons", "leaf"];

const KIND_COLOR: Record<string, string> = {
  "Live Class": "#0E937E",
  Webinar: "#2563EB",
  Workshop: "#E8853D",
};

function SectionHead({ title, href, cta, small }: { title: string; href: string; cta: string; small?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className={`${small ? "text-[17px]" : "text-xl"} font-semibold text-brand-ink`}>{title}</h2>
      <Link href={href} className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-brand-teal hover:underline">
        {cta} <Icon name="arrowRight" size={14} />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const continuing = ENROLLMENTS.filter((e) => e.status === "in-progress").filter((e) => e.slug !== "coding-for-beginners");

  return (
    <DashboardShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* ── Main column ── */}
        <div className="min-w-0 space-y-5">
          <Hero />

          {/* Q-Master AI Banner */}
          <section className="relative overflow-hidden rounded-3xl border border-[#2BD6B4]/30 bg-gradient-to-r from-[#054038] via-[#0E937E] to-[#054038] p-5 text-white shadow-[0_12px_32px_-12px_rgba(5,64,56,0.5)]">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-2 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-mark.png" alt="Q-Master" className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">Q-Master AI Tutor</h3>
                    <span className="rounded-full bg-[#2BD6B4] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#054038]">
                      Real Doubts 🧠
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5 font-medium">
                    Have an academic doubt? Ask Q-Master for instant explanations in Science, Math, Anatomy, Physics, & Coding!
                  </p>
                </div>
              </div>

              <Link
                href="/q-master"
                className="whitespace-nowrap rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-[#054038] shadow-md transition hover:scale-105 active:scale-95"
              >
                Ask Doubt Now ➔
              </Link>
            </div>
          </section>

          {/* Learning hub */}
          <section id="hub" className="grid grid-cols-4 gap-2 sm:gap-3 2xl:grid-cols-8">
            {HUB.map((h) => (
              <Link
                key={h.key}
                href={h.key === "courses" ? "/courses" : h.key === "live" || h.key === "webinars" ? "/live" : "/dashboard"}
                className="group flex flex-col items-center rounded-2xl border border-[#E2ECE9] bg-white px-1 py-3 text-center sm:px-2 sm:py-4 transition hover:-translate-y-1 hover:shadow-[0_14px_26px_-18px_rgba(5,64,56,.5)]"
              >
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-[14px] text-white shadow-[inset_0_-3px_0_rgba(0,0,0,.15),inset_0_2px_0_rgba(255,255,255,.35)] transition group-hover:scale-110"
                  style={{ background: `linear-gradient(160deg, ${h.from}, ${h.to})`, boxShadow: `0 8px 16px -8px ${h.to}, inset 0 -3px 0 rgba(0,0,0,.15), inset 0 2px 0 rgba(255,255,255,.35)` }}
                >
                  <Icon name={HUB_ICON[h.key]} size={24} />
                </span>
                <span className="mt-2 text-[11px] font-semibold leading-tight text-brand-ink sm:mt-2.5 sm:text-[13px]">{h.label}</span>
                <span className="mt-0.5 hidden text-[11px] text-[#6b807b] sm:block">{h.sub}</span>
              </Link>
            ))}
          </section>

          <Recommended />

          {/* Continue learning */}
          <section id="continue" className="rounded-[22px] border border-[#E2ECE9] bg-white p-4 sm:p-5">
            <SectionHead title="Continue Learning" href="/dashboard#continue" cta="View My Learning" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {continuing.map((e) => {
                const p = pct(e);
                return (
                  <div key={e.slug} className="flex gap-3 rounded-2xl border border-[#EEF3F1] p-2.5 transition hover:border-[#D7F0EB] hover:bg-[#FAFDFC]">
                    <Art art={e.art} className="h-[86px] w-[96px] shrink-0 rounded-xl" iconSize={34}>
                      <span className="absolute bottom-1.5 left-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#054038] text-white ring-2 ring-white/80">
                        <Icon name="play" size={12} fill="currentColor" />
                      </span>
                    </Art>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-1">
                        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-brand-ink">{e.title}</p>
                        <Icon name="more" size={16} className="shrink-0 text-[#6b807b]" />
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EFEC]">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#2BB39C] to-[#0E937E]" style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-brand-teal">{p}%</span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[11px] text-[#6b807b]">{e.done}/{e.total} lessons</span>
                          <button className="rounded-full bg-[#054038] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-teal">
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Popular categories */}
          <section className="rounded-[22px] border border-[#E2ECE9] bg-white p-4 sm:p-5">
            <SectionHead title="Popular Categories" href="/courses" cta="View All" />
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-2.5">
              {POPULAR_CATEGORIES.map((c, k) => (
                <Link
                  key={c.label}
                  href="/courses"
                  className="flex items-center gap-2.5 rounded-xl border border-[#EEF3F1] px-3 py-2.5 transition hover:border-[#D7F0EB] hover:bg-[#F7FBFA]"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${c.color}14`, color: c.color }}
                  >
                    <Icon name={CAT_ICON[k]} size={18} />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[12.5px] font-semibold text-brand-ink">{c.label}</span>
                    <span className="block text-[11px] text-[#6b807b]">{c.count} Courses</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <aside className="space-y-5">
          {/* Profile progress */}
          <section className="rounded-[22px] border border-[#E2ECE9] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={STUDENT.name} size={54} />
                <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#22C55E]" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-brand-ink">{STUDENT.name}</p>
                <p className="text-xs text-[#6b807b]">Keep going, you&apos;re doing great!</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-[13px]">
              <span className="font-medium text-brand-deep">Learning Progress</span>
              <span className="font-semibold text-brand-teal">{STUDENT.progress}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E6EFEC]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0E937E] to-[#2BD6B4]" style={{ width: `${STUDENT.progress}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-3 divide-x divide-[#EEF3F1]">
              {[
                { n: STUDENT.enrolled, l: "Enrolled", icon: "users" as IconName, c: "#0E937E" },
                { n: STUDENT.completed, l: "Completed", icon: "check" as IconName, c: "#0E937E" },
                { n: 3, l: "Certificates", icon: "award" as IconName, c: "#2563EB" },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center gap-1.5 px-1 text-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.c}17`, color: s.c }}>
                    <Icon name={s.icon} size={18} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-lg font-semibold text-brand-ink">{s.n}</span>
                    <span className="block text-[10.5px] text-[#6b807b]">{s.l}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Today's schedule */}
          <section id="schedule" className="rounded-[22px] border border-[#E2ECE9] bg-white p-5">
            <SectionHead title="Today's Schedule" href="/dashboard#schedule" cta="View Calendar" small />
            <div className="mt-4 flex gap-3">
              <div className="flex h-fit w-12 shrink-0 flex-col items-center rounded-xl border border-[#E2ECE9] py-2 text-center">
                <span className="text-[11px] text-[#6b807b]">{TODAY.weekday}</span>
                <span className="text-xl font-bold leading-tight text-brand-ink">{TODAY.day}</span>
                <span className="text-[11px] text-[#6b807b]">{TODAY.month}</span>
              </div>
              <ol className="relative min-w-0 flex-1 space-y-3 border-l border-dashed border-[#CFE3DD] pl-4">
                {SCHEDULE.map((s) => (
                  <li key={s.title} className="relative">
                    <span
                      className="absolute -left-[21.5px] top-3 h-2.5 w-2.5 rounded-full border-2 bg-white"
                      style={{ borderColor: KIND_COLOR[s.kind] }}
                    />
                    <div className="flex items-center gap-2 rounded-xl bg-[#F6FAF9] p-2.5 pr-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-[#6b807b]">{s.time}</p>
                        <p className="text-[12.5px] font-semibold" style={{ color: KIND_COLOR[s.kind] }}>{s.kind}</p>
                        <p className="text-[12px] leading-snug text-brand-ink">{s.title}</p>
                      </div>
                      {s.action === "Join" ? (
                        <button className="flex items-center gap-1 rounded-lg bg-[#054038] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-teal">
                          <Icon name="video" size={13} /> Join
                        </button>
                      ) : (
                        <button className="rounded-lg border border-[#CFE3DD] bg-white px-3.5 py-1.5 text-[11px] font-semibold text-brand-deep transition hover:border-brand-teal">
                          View
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Upcoming events */}
          <section className="rounded-[22px] border border-[#E2ECE9] bg-white p-5">
            <SectionHead title="Upcoming Events" href="/live" cta="View All" small />
            <div className="mt-4 space-y-3">
              {EVENTS.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <Art art={e.art} className="h-[62px] w-[66px] shrink-0 rounded-xl" iconSize={26} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug text-brand-ink">{e.title}</p>
                    <p className="text-[11px] text-[#6b807b]">By {e.by}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6b807b]">
                      <Icon name="clock" size={12} /> {e.meta}
                    </p>
                  </div>
                  <button className="rounded-lg bg-[#054038] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-teal">
                    Register
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </DashboardShell>
  );
}
