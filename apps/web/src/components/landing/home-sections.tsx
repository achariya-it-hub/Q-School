import Link from "next/link";
import { PROGRAMS, WEBINAR_LIST, WORKSHOPS, fmtCount } from "@qschool/shared";
import { LeadForm } from "@/components/lead-form";
import { Icon, type IconName } from "@/components/icons";
import { Art, Avatar } from "@/components/dashboard/art";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Reveal } from "@/components/landing/reveal";
import { Tilt } from "@/components/landing/tilt";
import { Parallax } from "@/components/landing/parallax";
import { CountUp } from "@/components/landing/count-up";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { PhotoSlide } from "@/components/landing/photo-slide";
import type { HeroSlide, HomeContent, SectionKey } from "@/lib/site/home-content";

/* Renders the home page from editable content (Admin Console › Website). */

const Kicker = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) =>
  children ? <p className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{children}</p> : null;

const H2 = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2 className={`mt-3 text-3xl font-bold sm:text-[2.1rem] ${dark ? "" : "text-brand-deep"}`}>{children}</h2>
);

function BrandSlide({ s }: { s: HeroSlide }) {
  return (
    <div className="container-qs relative grid grid-cols-1 items-center gap-12 pb-28 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
      <div>
        {(s.badge || s.kicker) && (
          <span className="hs-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-[12.5px] font-medium text-white/90">
            {s.badge && <span className="rounded-full bg-[#2BD6B4] px-2 py-0.5 text-[11px] font-bold text-brand-deep">{s.badge}</span>}
            {s.kicker}
          </span>
        )}
        <h1 className="hs-in mt-6 text-[2.35rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]" style={{ ["--d" as string]: "90ms" }}>
          {s.title}{" "}
          {s.accent && (
            <span className="relative text-[#2BD6B4] sm:whitespace-nowrap">
              {s.accent}
              <svg viewBox="0 0 300 14" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden>
                <path d="M2 10C70 3 160 1 298 7" fill="none" stroke="#2BD6B4" strokeWidth="3" strokeLinecap="round" opacity=".6" />
              </svg>
            </span>
          )}
        </h1>
        {s.body && (
          <p className="hs-in mt-6 max-w-xl text-[16.5px] leading-relaxed text-white/75" style={{ ["--d" as string]: "180ms" }}>
            {s.body}
          </p>
        )}
        <div className="hs-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "270ms" }}>
          {s.primary.label && (
            <Link href={s.primary.href} className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-deep text-[#2BD6B4] shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
                <Icon name="play" size={12} fill="currentColor" />
              </span>
              {s.primary.label}
            </Link>
          )}
          {s.secondary.label && (
            <Link href={s.secondary.href} className="btn-3d btn-3d-glass inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
              {s.secondary.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>

        {(s.trustLearners || s.trustRating) && (
          <div className="hs-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ ["--d" as string]: "360ms" }}>
            {s.trustLearners && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {["Asha V", "Rohit S", "Neha J", "Kiran B"].map((n) => (
                    <Avatar key={n} name={n} size={36} className="!ring-brand-deep" />
                  ))}
                </div>
                <p className="text-[13px] leading-tight text-white/75">
                  <b className="block text-[15px] text-white">{s.trustLearners}</b>
                  across India
                </p>
              </div>
            )}
            {s.trustLearners && s.trustRating && <div className="h-10 w-px bg-white/15 max-sm:hidden" />}
            {s.trustRating && (
              <div>
                <div className="flex gap-0.5 text-[#FFC845]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-1 text-[13px] text-white/75">
                  <b className="text-white">{s.trustRating}</b> from parent reviews
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hs-in" style={{ ["--d" as string]: "200ms" }}>
        <Tilt max={5} glare={false} className="mx-auto w-full max-w-[520px]">
          <HeroVisual
            classWindow={{
              photo: s.image ? { src: s.image, alt: s.imageAlt || s.windowTitle } : undefined,
              title: s.windowTitle || undefined,
              mentor: s.windowMentor || undefined,
              meta: s.windowMeta || undefined,
            }}
          />
        </Tilt>
      </div>
    </div>
  );
}

function Hero({ c }: { c: HomeContent["hero"] }) {
  const slides = c.slides.filter((s) => s.enabled);
  if (!slides.length) return null;
  return (
    <section className="relative overflow-hidden bg-brand-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden
      />
      <Parallax speed={-0.25} className="pointer-events-none absolute -right-40 -top-40">
        <div className="h-[520px] w-[520px] rounded-full bg-brand-teal/40 blur-3xl" aria-hidden />
      </Parallax>
      <Parallax speed={0.2} className="pointer-events-none absolute -bottom-48 -left-32">
        <div className="h-[420px] w-[420px] rounded-full bg-[#2BD6B4]/20 blur-3xl" aria-hidden />
      </Parallax>

      <HeroCarousel labels={slides.map((s) => s.label)} interval={c.interval * 1000}>
        {slides.map((s, i) =>
          s.layout === "collage" ? <BrandSlide key={s.id} s={s} /> : <PhotoSlide key={s.id} s={s} heading={i === 0} />,
        )}
      </HeroCarousel>

      <svg viewBox="0 0 1440 60" className="pointer-events-none absolute -bottom-px left-0 z-20 h-10 w-full text-[#f4faf8] sm:h-14" preserveAspectRatio="none" aria-hidden>
        <path d="M0 60V30C240 0 480 0 720 22s480 30 720 0v38Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function Stats({ c, overlap }: { c: HomeContent["stats"]; overlap: boolean }) {
  if (!c.items.length) return null;
  const cols = c.items.length >= 4 ? "lg:grid-cols-4" : c.items.length === 3 ? "lg:grid-cols-3" : "";
  return (
    <section className={`container-qs relative z-10 ${overlap ? "-mt-4" : "mt-10"}`}>
      <Reveal variant="zoom">
        <div className={`emboss grid grid-cols-2 gap-2.5 rounded-[22px] p-2.5 ${cols}`}>
          {c.items.map((s, i) => (
            <div key={i} className="deboss rounded-2xl px-4 py-5 text-center">
              <p className="text-emboss text-2xl font-bold text-brand-deep sm:text-[1.7rem]">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-[12.5px] text-[#5c7772]">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Subjects({ c }: { c: HomeContent["subjects"] }) {
  if (!c.items.length) return null;
  return (
    <section className="relative mt-12 overflow-hidden py-4" aria-label="Subjects">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4faf8]" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4faf8]" aria-hidden />
      <div className="flex w-max animate-marquee gap-3">
        {[...c.items, ...c.items].map((s, i) => (
          <span
            key={i}
            aria-hidden={i >= c.items.length}
            className="emboss inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium text-[#41564f]"
          >
            <span className="h-2.5 w-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,.6),0_1px_2px_rgba(0,0,0,.25)]" style={{ background: s.color }} />
            {s.label}
            {s.count && <span className="text-[#8aa39c]">{s.count}</span>}
          </span>
        ))}
      </div>
    </section>
  );
}

function Formats({ c }: { c: HomeContent["formats"] }) {
  return (
    <section className="container-qs py-20">
      <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {c.items.map((f, i) => (
          <Reveal key={i} delay={i * 90} variant="zoom">
            <Tilt className="h-full rounded-2xl">
              <Link href={f.href} className="emboss emboss-hover press group flex h-full flex-col rounded-2xl p-6 [transform-style:preserve-3d]">
                <span className="icon-3d h-14 w-14 rounded-2xl [transform:translateZ(36px)]" style={{ ["--c" as string]: f.color }}>
                  <Icon name={f.icon as IconName} size={26} />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold text-brand-ink">{f.title}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[#5c7772]">{f.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-teal">
                  Learn more <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Programs({ c }: { c: HomeContent["programs"] }) {
  const programs = PROGRAMS.slice(0, c.count);
  return (
    <section id="programs" className="scroll-mt-20 bg-white py-20">
      <div className="container-qs">
        <Reveal variant="blur" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
          </div>
          {c.linkLabel && (
            <Link href="/courses" className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand-teal hover:underline">
              {c.linkLabel} →
            </Link>
          )}
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {programs.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 110} variant="flip">
              <Tilt className="h-full rounded-3xl">
                <Link href="/courses" className="emboss emboss-hover press group flex h-full flex-col overflow-hidden rounded-3xl">
                  <Art art={p.art} className="aspect-[16/10]" iconSize={58}>
                    {p.badge && (
                      <span className="btn-3d btn-3d-white pointer-events-none absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold">{p.badge}</span>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">{p.format}</span>
                  </Art>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[17px] font-semibold leading-snug text-brand-ink group-hover:text-brand-teal">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-[13.5px] text-[#5c7772]">{p.overview}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#5c7772]">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="star" size={14} fill="#FFC845" strokeWidth={0} />
                        <b className="text-brand-ink">{p.rating}</b> ({fmtCount(p.ratings)})
                      </span>
                      {p.lessons && (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="lessons" size={14} /> {p.lessons} lessons
                        </span>
                      )}
                      {(p.hours || p.duration) && (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" size={14} /> {p.hours ? `${p.hours} h` : p.duration}
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex items-center gap-2.5 border-t border-[#EEF3F1] pt-4">
                      <Avatar name={p.instructor} size={30} className="!ring-0" />
                      <span className="flex-1 text-[13px] font-medium text-[#41564f]">{p.instructor}</span>
                      <span className="btn-3d btn-3d-teal rounded-lg px-3 py-1.5 text-[12.5px] font-semibold">Enrol →</span>
                    </div>
                  </div>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function How({ c }: { c: HomeContent["how"] }) {
  const cols = c.steps.length === 4 ? "md:grid-cols-4" : c.steps.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <section className="container-qs py-20">
      <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
      </Reveal>
      <ol className={`relative mt-14 grid grid-cols-1 gap-10 md:gap-6 ${cols}`}>
        {c.steps.length > 1 && (
          <Reveal variant="line" className="absolute left-[16%] right-[16%] top-9 hidden border-t-2 border-dashed border-brand-teal500/40 !duration-[1400ms] md:block" />
        )}
        {c.steps.map((s, i) => (
          <Reveal key={i} delay={200 + i * 220} variant="zoom" className="relative text-center">
            <li className="list-none">
              <span className="group relative mx-auto block h-[72px] w-[72px]">
                <span className="icon-3d h-[72px] w-[72px] rounded-[22px]" style={{ ["--c" as string]: "#0B6E5F" }}>
                  <Icon name={s.icon as IconName} size={30} />
                </span>
                <span className="icon-3d absolute -right-2 -top-2 h-8 w-8 rounded-full text-[13px] font-bold ring-4 ring-[#f4faf8]" style={{ ["--c" as string]: "#2BD6B4" }}>
                  <span className="relative text-brand-deep">{i + 1}</span>
                </span>
              </span>
              <h3 className="mt-6 text-[18px] font-semibold text-brand-ink">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-[#5c7772]">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
      {c.cta.label && (
        <div className="mt-12 text-center">
          <Link href={c.cta.href} className="btn-3d btn-3d-teal inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold">
            {c.cta.label}
          </Link>
        </div>
      )}
    </section>
  );
}

function Live({ c }: { c: HomeContent["live"] }) {
  const webinars = WEBINAR_LIST.filter((w) => !w.recorded).slice(0, 3);
  const workshops = WORKSHOPS.filter((w) => !w.past).slice(0, 3);
  return (
    <section id="live" className="scroll-mt-20 bg-brand-deep py-20 text-white">
      <div className="container-qs">
        <Reveal variant="blur" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Kicker dark>{c.kicker}</Kicker>
            <H2 dark>{c.title}</H2>
          </div>
          {c.linkLabel && (
            <Link href="/live" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#2BD6B4] hover:underline">
              {c.linkLabel} →
            </Link>
          )}
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal variant="left">
            <div className="emboss-dark h-full rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <span className="icon-3d h-8 w-8 rounded-lg" style={{ ["--c" as string]: "#5B6CF0" }}>
                  <Icon name="webinar" size={16} />
                </span>{" "}
                Webinars
                <span className="ml-auto rounded-full bg-[#2BD6B4]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#2BD6B4]">FREE</span>
              </div>
              <ul className="mt-5 space-y-3">
                {webinars.map((w) => (
                  <li key={w.id} className="emboss-dark emboss-dark-hover flex items-center gap-3 rounded-2xl p-3 sm:gap-4">
                    <Art art={w.art} className="h-12 w-12 shrink-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_6px_14px_-6px_rgba(0,0,0,.6)] sm:h-16 sm:w-16" iconSize={22} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14.5px] font-semibold leading-snug sm:truncate">{w.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-white/65">
                        {w.by} · {w.date}
                      </p>
                      <p className="mt-0.5 text-[12px] text-white/50">{w.registered} registered</p>
                    </div>
                    <Link href="#demo" className="btn-3d btn-3d-white shrink-0 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold">
                      Register
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120} variant="right">
            <div className="emboss-dark h-full rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <span className="icon-3d h-8 w-8 rounded-lg" style={{ ["--c" as string]: "#F29A2E" }}>
                  <Icon name="tools" size={16} />
                </span>{" "}
                Workshops
              </div>
              <ul className="mt-5 space-y-3">
                {workshops.map((w) => (
                  <li key={w.id} className="emboss-dark emboss-dark-hover flex items-center gap-3 rounded-2xl p-3 sm:gap-4">
                    <Art art={w.art} className="h-12 w-12 shrink-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_6px_14px_-6px_rgba(0,0,0,.6)] sm:h-16 sm:w-16" iconSize={22} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14.5px] font-semibold leading-snug sm:truncate">{w.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-white/65">{w.date}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-white/50">
                        <Icon name={w.mode === "Online" ? "globe" : "pin"} size={12} />
                        {w.mode === "Online" ? "Online" : w.city} · {w.days}
                        {w.seatsLeft ? ` · ${w.seatsLeft} seats left` : ""}
                      </p>
                    </div>
                    <Link href="#demo" className="btn-3d btn-3d-glass shrink-0 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold">
                      Reserve
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Why({ c }: { c: HomeContent["why"] }) {
  return (
    <section className="container-qs grid grid-cols-1 items-center gap-14 py-20 lg:grid-cols-2">
      <Reveal variant="left">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
        {c.body && <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#5c7772]">{c.body}</p>}
        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {c.items.map((w, i) => (
            <div key={i} className="emboss emboss-hover group flex gap-3.5 rounded-2xl p-4">
              <span className="icon-3d h-11 w-11 shrink-0 rounded-xl" style={{ ["--c" as string]: w.color }}>
                <Icon name={w.icon as IconName} size={21} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-brand-ink">{w.title}</p>
                <p className="mt-0.5 text-[13px] text-[#5c7772]">{w.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={150} variant="right">
        <Tilt max={4} className="rounded-[28px]">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-teal to-brand-deep p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),inset_0_-3px_0_rgba(0,0,0,.2),0_30px_60px_-24px_rgba(5,64,56,.7)] sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden />
            <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
              <div>
                {c.appBadge && <span className="rounded-full bg-white/15 px-3 py-1 text-[11.5px] font-semibold">{c.appBadge}</span>}
                <h3 className="mt-4 text-2xl font-bold leading-snug">{c.appTitle}</h3>
                <p className="mt-2 text-[14px] text-white/80">{c.appBody}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {["Google Play", "App Store"].map((s) => (
                    <span key={s} className="btn-3d btn-3d-glass inline-flex items-center gap-2 rounded-xl !bg-black/30 px-3.5 py-2 text-[12.5px] font-semibold">
                      <Icon name="download" size={15} /> {s}
                      <span className="rounded bg-white/20 px-1.5 text-[10px] font-medium">Soon</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="mx-auto w-[150px] rotate-3 rounded-[26px] border-[5px] border-[#021f1b] bg-[#F3F8F6] p-2 shadow-2xl">
                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-[#021f1b]/80" />
                <div className="rounded-xl bg-brand-deep p-2.5 text-white">
                  <p className="text-[8px] text-white/70">Good morning,</p>
                  <p className="text-[11px] font-semibold">Ananya</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/20">
                    <div className="h-full w-3/5 rounded-full bg-[#2BD6B4]" />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(["live", "book", "webinar", "award"] as IconName[]).map((n) => (
                    <div key={n} className="emboss flex aspect-square items-center justify-center rounded-lg text-brand-teal">
                      <Icon name={n} size={18} />
                    </div>
                  ))}
                </div>
                <Art art="laptop" className="mt-2 h-14 rounded-lg" iconSize={20} />
              </div>
            </div>
          </div>
        </Tilt>
      </Reveal>
    </section>
  );
}

function Testimonials({ c }: { c: HomeContent["testimonials"] }) {
  if (!c.items.length) return null;
  return (
    <section className="bg-white py-20">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {c.items.map((t, i) => (
            <Reveal key={i} delay={(i % 3) * 120} variant="flip">
              <figure className="emboss emboss-hover flex h-full flex-col rounded-3xl p-7 transition hover:-translate-y-1">
                <span className="font-hand text-6xl leading-none text-brand-teal500" aria-hidden>
                  &ldquo;
                </span>
                {t.rating > 0 && (
                  <div className="-mt-1 mb-2 flex gap-0.5 text-[#FFC845]" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: Math.round(t.rating) }, (_, k) => (
                      <Icon key={k} name="star" size={14} fill="currentColor" strokeWidth={0} className="drop-shadow-[0_1px_0_rgba(183,121,31,.5)]" />
                    ))}
                  </div>
                )}
                <blockquote className="flex-1 text-[15px] leading-relaxed text-[#2b3d38]">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#E2ECE9] pt-5 shadow-[0_-1px_0_#fff]">
                  <span className="icon-3d h-10 w-10 rounded-full">
                    <Icon name="users" size={18} />
                  </span>
                  <span className="text-[13px]">
                    <b className="block text-brand-ink">{t.who}</b>
                    <span className="text-[#6b807b]">{t.city}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Centres({ c }: { c: HomeContent["centres"] }) {
  return (
    <section id="centres" className="container-qs scroll-mt-20 py-20">
      <Reveal variant="blur" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </div>
        {c.linkLabel && (
          <Link href="#demo" className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand-teal hover:underline">
            {c.linkLabel} →
          </Link>
        )}
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {c.items.map((ct, i) => (
          <Reveal key={i} delay={(i % 3) * 100} variant="zoom">
            <Tilt className="h-full rounded-2xl">
              <div className="emboss emboss-hover flex h-full gap-4 rounded-2xl p-5">
                <Art art="building" className="h-20 w-20 shrink-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_16px_-8px_rgba(5,64,56,.6)]" iconSize={30} />
                <div className="min-w-0">
                  <p className="text-[15.5px] font-semibold text-brand-ink">{ct.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-[#5c7772]">
                    <Icon name="pin" size={13} /> {[ct.area, ct.city].filter(Boolean).join(", ")}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {ct.tags.map((b) => (
                      <span key={b} className="chip !px-2.5 !py-0.5 !text-[11px]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pricing({ c }: { c: HomeContent["pricing"] }) {
  if (!c.plans.length) return null;
  const cols = c.plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : c.plans.length === 2 ? "md:grid-cols-2" : c.plans.length === 1 ? "" : "md:grid-cols-3";
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </Reveal>
        <div className={`mx-auto mt-12 grid max-w-5xl grid-cols-1 items-stretch gap-6 ${cols}`}>
          {c.plans.map((p, i) => (
            <Reveal key={i} delay={i * 120} variant="flip">
              <Tilt max={5} className={`h-full rounded-3xl ${p.featured ? "md:-top-3" : ""}`}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-7 ${
                    p.featured
                      ? "bg-gradient-to-b from-[#0a5a4e] to-brand-deep text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2),inset_0_-3px_0_rgba(0,0,0,.25),0_30px_60px_-20px_rgba(5,64,56,.65)]"
                      : "emboss emboss-hover"
                  }`}
                >
                  {p.featured && (
                    <span className="btn-3d btn-3d-mint absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold">MOST POPULAR</span>
                  )}
                  <p className={`text-[15px] font-semibold ${p.featured ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{p.name}</p>
                  <p className="mt-3">
                    <span className={`text-4xl font-bold ${p.featured ? "" : "text-brand-ink"}`}>{p.price}</span>
                    <span className={`ml-1 text-[14px] ${p.featured ? "text-white/70" : "text-[#6b807b]"}`}>{p.per}</span>
                  </p>
                  <p className={`mt-2 text-[13.5px] ${p.featured ? "text-white/75" : "text-[#5c7772]"}`}>{p.blurb}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f, k) => (
                      <li key={k} className="flex gap-2.5 text-[13.5px]">
                        <span className="icon-3d mt-px h-[18px] w-[18px] shrink-0 rounded-full" style={{ ["--c" as string]: p.featured ? "#2BD6B4" : "#0E937E" }}>
                          <Icon name="check" size={11} strokeWidth={3.2} />
                        </span>
                        <span className={p.featured ? "text-white/90" : "text-[#41564f]"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {p.cta.label && (
                    <Link
                      href={p.cta.href}
                      className={`btn-3d mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-[14px] font-semibold ${p.featured ? "btn-3d-mint" : "btn-3d-outline"}`}
                    >
                      {p.cta.label}
                    </Link>
                  )}
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
        {c.note && <p className="mt-8 text-center text-[12.5px] text-[#6b807b]">{c.note}</p>}
      </div>
    </section>
  );
}

function Faq({ c }: { c: HomeContent["faq"] }) {
  return (
    <section id="faq" className="container-qs scroll-mt-20 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal variant="left">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          {c.body && <p className="mt-4 text-[14.5px] text-[#5c7772]">{c.body}</p>}
          {c.cta.label && (
            <Link href={c.cta.href} className="btn-3d btn-3d-outline mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              <Icon name="message" size={16} /> {c.cta.label}
            </Link>
          )}
        </Reveal>
        <Reveal delay={120} variant="right">
          <div className="space-y-3">
            {c.items.map((f, i) => (
              <details key={i} className="emboss group rounded-2xl px-5 py-4 open:shadow-[inset_0_2px_6px_rgba(5,64,56,.08)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-brand-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="icon-3d no-lift h-8 w-8 shrink-0 rounded-full group-open:rotate-45">
                    <Icon name="plus" size={15} strokeWidth={2.4} />
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line pr-10 text-[14px] leading-relaxed text-[#5c7772]">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Demo({ c }: { c: HomeContent["demo"] }) {
  return (
    <section id="demo" className="container-qs scroll-mt-20 py-6">
      <Reveal variant="wipe">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-teal/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#2BD6B4]/25 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              {c.script && <p className="font-hand text-3xl text-[#2BD6B4]">{c.script}</p>}
              <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-[2.4rem]">{c.title}</h2>
              {c.body && <p className="mt-4 max-w-md text-[15px] text-white/75">{c.body}</p>}
              <ul className="mt-6 space-y-2.5">
                {c.points.map((x, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-white/90">
                    <span className="icon-3d h-6 w-6 rounded-full" style={{ ["--c" as string]: "#2BD6B4" }}>
                      <Icon name="check" size={13} strokeWidth={3} className="text-brand-deep" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <Tilt max={3} glare={false} className="rounded-3xl">
              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-6 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-8">
                <h3 className="text-lg font-bold text-brand-deep">{c.formTitle}</h3>
                {c.formNote && <p className="mb-5 mt-1 text-[13px] text-[#5c7772]">{c.formNote}</p>}
                <LeadForm source="landing_demo" cta={c.button} />
              </div>
            </Tilt>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const RENDER: Record<SectionKey, (c: HomeContent, ctx: { overlap: boolean }) => React.ReactNode> = {
  hero: (c) => <Hero c={c.hero} />,
  stats: (c, ctx) => <Stats c={c.stats} overlap={ctx.overlap} />,
  subjects: (c) => <Subjects c={c.subjects} />,
  formats: (c) => <Formats c={c.formats} />,
  programs: (c) => <Programs c={c.programs} />,
  how: (c) => <How c={c.how} />,
  live: (c) => <Live c={c.live} />,
  why: (c) => <Why c={c.why} />,
  testimonials: (c) => <Testimonials c={c.testimonials} />,
  centres: (c) => <Centres c={c.centres} />,
  pricing: (c) => <Pricing c={c.pricing} />,
  faq: (c) => <Faq c={c.faq} />,
  demo: (c) => <Demo c={c.demo} />,
};

export function HomeSections({ content }: { content: HomeContent }) {
  const visible = content.sections.filter((s) => s.visible);
  return (
    <>
      {visible.map((s, i) => (
        <div key={s.key} data-section={s.key} className="contents">
          {RENDER[s.key](content, { overlap: i > 0 && visible[i - 1].key === "hero" })}
        </div>
      ))}
    </>
  );
}
