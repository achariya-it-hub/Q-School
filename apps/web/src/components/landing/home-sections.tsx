"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CENTERS, WEBINAR_LIST } from "@qschool/shared";
import { LeadForm } from "@/components/lead-form";
import { Icon, type IconName } from "@/components/icons";
import { Avatar } from "@/components/dashboard/art";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Reveal } from "@/components/landing/reveal";
import { Tilt } from "@/components/landing/tilt";
import { Parallax } from "@/components/landing/parallax";
import { CountUp } from "@/components/landing/count-up";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { PhotoSlide } from "@/components/landing/photo-slide";
import { QuantumNexus } from "@/components/three/quantum-nexus";
import {
  SpotlightCard,
  BorderBeam,
  ScrollMotion,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/21st";
import { AiVsHiSection } from "@/components/landing/ai-vs-hi-scroll";
import { FiveDFramework } from "@/components/landing/five-d-stack";
import { ProgramsHorizontalScroll } from "@/components/landing/programs-horizontal-scroll";
import { DiagnosticQuiz } from "@/components/landing/diagnostic-quiz";
import { StorySection } from "@/components/landing/story-section";
import { PedagogySection } from "@/components/landing/pedagogy-section";
import { NeoSapiensSection } from "@/components/landing/neo-sapiens-section";
import { JourneyAndPathwaySection } from "@/components/landing/journey-pathway-section";
import { QVerseSection } from "@/components/landing/qverse-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import type { HeroSlide, HomeContent, SectionKey } from "@/lib/site/home-content";

/* Typography & Visual Header Primitives */
const Kicker = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) =>
  children ? (
    <p
      className={`text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-[0.16em] ${
        dark ? "text-[#2BD6B4]" : "text-brand-teal"
      }`}
    >
      {children}
    </p>
  ) : null;

const H2 = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <h2
    className={`mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-[1.2] ${
      dark ? "" : "text-brand-deep"
    }`}
  >
    {children}
  </h2>
);

function BrandSlide({ s }: { s: HeroSlide }) {
  return (
    <div className="container-qs relative grid grid-cols-1 items-center gap-12 pb-28 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
      <div>
        {(s.badge || s.kicker) && (
          <span className="hs-in inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-4 text-xs sm:text-[13px] font-semibold text-white/95 backdrop-blur-sm">
            {s.badge && (
              <span className="rounded-full bg-[#2BD6B4] px-2.5 py-0.5 text-xs font-black text-brand-deep">
                {s.badge}
              </span>
            )}
            {s.kicker}
          </span>
        )}
        <h1
          className="hs-in mt-6 text-[2.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]"
          style={{ ["--d" as string]: "90ms" }}
        >
          {s.title}{" "}
          {s.accent && (
            <span className="relative text-[#2BD6B4] sm:whitespace-nowrap">
              {s.accent}
              <svg
                viewBox="0 0 300 14"
                className="absolute -bottom-2 left-0 h-3 w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 10C70 3 160 1 298 7"
                  fill="none"
                  stroke="#2BD6B4"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity=".6"
                />
              </svg>
            </span>
          )}
        </h1>
        {s.body && (
          <p
            className="hs-in mt-6 max-w-xl text-lg sm:text-[19px] leading-relaxed text-white/85 font-normal"
            style={{ ["--d" as string]: "180ms" }}
          >
            {s.body}
          </p>
        )}
        <div
          className="hs-in mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ ["--d" as string]: "270ms" }}
        >
          {s.primary.label && (
            <MagneticButton href={s.primary.href}>{s.primary.label}</MagneticButton>
          )}
          {s.secondary?.label && (
            <a
              href={s.secondary.href}
              className="btn-3d btn-3d-outline inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white"
            >
              {s.secondary.label}
            </a>
          )}
        </div>

        {(s.trustLearners || s.trustRating) && (
          <div
            className="hs-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ ["--d" as string]: "360ms" }}
          >
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
            {s.trustLearners && s.trustRating && (
              <div className="h-10 w-px bg-white/15 max-sm:hidden" />
            )}
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
      <QuantumNexus
        className="pointer-events-none absolute inset-0 z-0 opacity-45"
        particleCount={95}
        speed={0.45}
        colorScheme="teal"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
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
          s.layout === "collage" ? (
            <BrandSlide key={s.id} s={s} />
          ) : (
            <PhotoSlide key={s.id} s={s} heading={i === 0} />
          ),
        )}
      </HeroCarousel>

      <svg
        viewBox="0 0 1440 60"
        className="pointer-events-none absolute -bottom-px left-0 z-20 h-10 w-full text-[#f4faf8] sm:h-14"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 60V30C240 0 480 0 720 22s480 30 720 0v38Z" fill="currentColor" />
      </svg>
    </section>
  );
}

const STAT_META: { icon: IconName; color: string; badge: string }[] = [
  { icon: "calendar", color: "#0E937E", badge: "Annual Cycle" },
  { icon: "sparkle", color: "#5B6CF0", badge: "Peak Window" },
  { icon: "building", color: "#F29A2E", badge: "7 Cities" },
  { icon: "brain", color: "#E2557A", badge: "Whole-Child" },
];

function Stats({ c, overlap }: { c: HomeContent["stats"]; overlap: boolean }) {
  if (!c.items.length) return null;
  const cols =
    c.items.length >= 4
      ? "lg:grid-cols-4"
      : c.items.length === 3
      ? "lg:grid-cols-3"
      : "";
  return (
    <section className={`container-qs relative z-10 ${overlap ? "-mt-5" : "mt-10"}`}>
      <Reveal variant="zoom">
        <div
          className={`grid grid-cols-2 gap-3 sm:gap-4 rounded-[26px] bg-white/90 backdrop-blur-md p-3 sm:p-4 border border-[#CFE3DD] shadow-[0_20px_50px_-20px_rgba(5,64,56,0.18)] ${cols}`}
        >
          {c.items.map((s, i) => {
            const meta = STAT_META[i % STAT_META.length];
            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#F8FCFB] to-white border border-[#E2F0EC] px-4 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#2BD6B4]/60"
              >
                <div
                  className="absolute top-0 inset-x-0 h-1 opacity-80"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className="icon-3d h-10 w-10 rounded-xl shrink-0"
                    style={{ ["--c" as string]: meta.color }}
                  >
                    <Icon name={meta.icon} size={19} />
                  </span>
                  <span className="rounded-full bg-[#EDF7F4] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0E937E]">
                    {meta.badge}
                  </span>
                </div>
                <p className="text-emboss text-2xl font-black text-brand-deep sm:text-3xl">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-1 text-xs sm:text-[13px] font-medium text-[#4b635e] leading-snug">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

function Subjects({ c }: { c: HomeContent["subjects"] }) {
  if (!c.items.length) return null;
  return (
    <section className="relative mt-8 overflow-hidden py-3" aria-label="Core Mantras">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4faf8]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4faf8]"
        aria-hidden
      />
      <div className="flex w-max animate-marquee gap-3">
        {[...c.items, ...c.items].map((s, i) => (
          <span
            key={i}
            aria-hidden={i >= c.items.length}
            className="emboss inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-bold tracking-wide text-[#41564f]"
          >
            <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: s.color }} />
            {s.label}
            {s.count && (
              <span className="rounded-md bg-[#2BD6B4]/15 px-1.5 py-0.5 text-[11px] text-[#0E937E] font-bold">
                {s.count}
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

function Formats({ c }: { c: HomeContent["formats"] }) {
  if (!c.items.length) return null;
  return (
    <section id="formats" className="container-qs scroll-mt-20 py-24">
      <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
      </ScrollMotion>
      <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.08}>
        {c.items.map((f, i) => (
          <StaggerItem key={i} className="h-full">
            <SpotlightCard
              spotlightColor="rgba(43, 214, 180, 0.2)"
              className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <span
                  className="icon-3d h-14 w-14 rounded-2xl"
                  style={{ ["--c" as string]: f.color }}
                >
                  <Icon name={f.icon as IconName} size={28} />
                </span>
                <h3 className="mt-5 text-2xl font-bold text-brand-ink">{f.title}</h3>
                <p className="mt-3 text-base text-[#5c7772] leading-relaxed">{f.body}</p>
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

function How({ c }: { c: HomeContent["how"] }) {
  if (!c.steps.length) return null;
  return (
    <section id="how" className="bg-[#f0f6f4] py-24">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {c.steps.map((st, i) => (
            <StaggerItem key={i} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.2)"
                className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal text-white font-bold text-base shadow-md">
                    0{i + 1}
                  </span>
                  <h3 className="mt-5 text-2xl font-bold text-brand-ink">{st.title}</h3>
                  <p className="mt-3 text-base text-[#5c7772] leading-relaxed">{st.body}</p>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function Live({ c }: { c: HomeContent["live"] }) {
  const webinars = WEBINAR_LIST.slice(0, 3);
  if (!webinars.length) return null;
  return (
    <section id="live" className="scroll-mt-20 py-24 bg-white border-y border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {webinars.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-[#CFE3DD] p-6 hover:shadow-lg transition"
            >
              <span className="chip !px-2.5 !py-0.5 !text-[11px] !bg-brand-teal100 !text-[#0B6E5F] font-bold">
                {w.date}
              </span>
              <h4 className="mt-3 text-lg font-bold text-brand-ink">{w.title}</h4>
              <p className="mt-2 text-xs text-[#5c7772]">
                Conducted by {w.by} · {w.duration}
              </p>
              <a
                href="#demo"
                className="mt-4 inline-block text-xs font-bold text-brand-teal hover:underline"
              >
                Register Free →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why({ c }: { c: HomeContent["why"] }) {
  if (!c.items.length) return null;
  return (
    <section id="why" className="container-qs scroll-mt-20 py-24">
      <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
      </ScrollMotion>
      <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.08}>
        {c.items.map((card, i) => (
          <StaggerItem key={i} className="h-full">
            <SpotlightCard
              spotlightColor="rgba(43, 214, 180, 0.2)"
              className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <h3 className="text-xl font-bold text-brand-ink">{card.title}</h3>
                <p className="mt-3 text-sm text-[#5c7772] leading-relaxed">{card.body}</p>
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

const TESTIMONIAL_OUTCOMES = [
  { tag: "3× Reading Speed & Exam Calm", program: "Quantum Learning + Vision", avatarName: "Priya R" },
  { tag: "Visual Math & Emotional Balance", program: "Q-Maths + Q-Mastery", avatarName: "Karthik M" },
  { tag: "School Prefect & Stage Confidence", program: "Quantum Mastery", avatarName: "Meera S" },
];

function Testimonials({ c }: { c: HomeContent["testimonials"] }) {
  if (!c.items.length) return null;
  return (
    <section className="bg-gradient-to-b from-white to-[#F4FAF8] py-24 border-y border-[#E2ECE9]">
      <div className="container-qs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-14">
          <ScrollMotion variant="blur-in" className="lg:col-span-7">
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
            <p className="mt-3 text-base text-[#4b635e] max-w-xl">
              Across Chennai, Bengaluru, Hyderabad, Pune, Puducherry, Trichy, and Coimbatore, parents see tangible shifts in focus, self-discipline, and joyful learning within weeks.
            </p>
          </ScrollMotion>

          {/* Pictorial Parent Trust Banner */}
          <ScrollMotion variant="fade-up" delay={0.1} className="lg:col-span-5">
            <div className="flex items-center gap-4 rounded-3xl bg-[#054038] text-white p-5 sm:p-6 shadow-xl border border-[#2BD6B4]/30">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#2BD6B4]/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/side-family.png"
                  alt="Happy Q-School Family"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#FFC845]">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <Icon key={k} name="star" size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                  <span className="ml-1.5 text-xs font-black text-white">4.9 / 5.0</span>
                </div>
                <p className="text-lg font-extrabold text-white mt-1">
                  25,000+ Learners Empowered
                </p>
                <p className="text-xs text-[#2BD6B4] font-semibold mt-0.5">
                  Verified Parent Feedback · Ages 6–14
                </p>
              </div>
            </div>
          </ScrollMotion>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {c.items.map((t, i) => {
            const extra = TESTIMONIAL_OUTCOMES[i % TESTIMONIAL_OUTCOMES.length];
            return (
              <StaggerItem key={i} className="h-full">
                <SpotlightCard
                  spotlightColor="rgba(43, 214, 180, 0.2)"
                  className="flex h-full flex-col justify-between p-7 sm:p-8 hover:shadow-xl transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="rounded-full bg-[#E6F4F0] px-3 py-1 text-[11px] font-black text-[#0E937E]">
                        ✦ {extra.tag}
                      </span>
                      {t.rating > 0 && (
                        <div
                          className="flex gap-0.5 text-[#FFC845]"
                          aria-label={`${t.rating} out of 5 stars`}
                        >
                          {Array.from({ length: Math.round(t.rating) }, (_, k) => (
                            <Icon
                              key={k}
                              name="star"
                              size={14}
                              fill="currentColor"
                              strokeWidth={0}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <blockquote className="text-base sm:text-[16.5px] leading-relaxed text-[#2b3d38] font-medium">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </div>

                  <figcaption className="mt-7 flex items-center justify-between gap-3 border-t border-[#E2ECE9] pt-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={extra.avatarName} size={42} />
                      <span className="text-sm">
                        <b className="block text-sm sm:text-base font-extrabold text-brand-ink">
                          {t.who}
                        </b>
                        <span className="text-xs text-[#5c7772] font-semibold">{t.city}</span>
                      </span>
                    </div>
                    <span className="rounded-lg bg-[#F4FAF8] border border-[#CFE3DD] px-2.5 py-1 text-[10px] font-bold text-brand-deep shrink-0">
                      {extra.program}
                    </span>
                  </figcaption>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

const CITY_FILTERS = [
  { id: "all", label: "All 9 Centres" },
  { id: "chennai", label: "Chennai (2)" },
  { id: "bengaluru", label: "Bengaluru (2)" },
  { id: "puducherry", label: "Puducherry" },
  { id: "hyderabad", label: "Hyderabad" },
  { id: "pune", label: "Pune" },
  { id: "trichy", label: "Trichy" },
  { id: "coimbatore", label: "Coimbatore" },
];

const CENTRE_IMAGES = [
  "/images/bmit-hero.png",
  "/images/workshop.png",
  "/images/side-brain.png",
  "/images/side-family.png",
  "/images/pic-brain-boy.png",
  "/images/pic-girl.png",
  "/images/programs/quantum-vision.jpg",
  "/images/programs/quantum-creation.jpg",
  "/images/programs/quantum-learning.jpg",
];

/* ───────────────────────── 9. Interactive Centres Explorer ───────────────────────── */
function Centres({ c }: { c: HomeContent["centres"] }) {
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const centres = CENTERS;

  const filteredCentres = centres.filter((ct) => {
    if (selectedCity === "all") return true;
    return ct.city.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <section id="centres" className="container-qs scroll-mt-20 py-24">
      <ScrollMotion
        variant="blur-in"
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          <p className="mt-3 text-xs sm:text-sm font-black tracking-[0.14em] text-[#0E937E]">
            CONFIDENT LEARNERS · COMPASSIONATE THINKERS · FUTURE-READY LEADERS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:+919944454840"
            className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold shadow-md"
          >
            <Icon name="phone" size={16} /> Central Helpline: +91 99444 54840
          </a>
        </div>
      </ScrollMotion>

      {/* Pictorial Dual-Photo Centre Environment Showcase */}
      <ScrollMotion
        variant="fade-up"
        delay={0.1}
        className="mt-10 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch"
      >
        <div className="lg:col-span-5 grid grid-cols-2 gap-1 bg-[#054038] min-h-[250px]">
          <div className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bmit-hero.png"
              alt="Q-School Experiential Cohort"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-brand-deep shadow-md">
              Max 15 / Cohort
            </span>
          </div>
          <div className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/workshop.png"
              alt="Mentor and Parent Alignment"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-[#2BD6B4] px-3 py-1 text-[11px] font-black text-[#03221E] shadow-md">
              1:1 Mentor Care
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between">
          <div>
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-[#2BD6B4] font-black">
              9 EXPERIENTIAL HUBS + LIVE ONLINE
            </span>
            <h3 className="mt-3.5 text-2xl sm:text-3xl font-extrabold text-brand-ink">
              Purpose-Built Quantum Learning Environments
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
              Every Q-School centre is designed for calm sensory activation, hands-on cognitive kits, and individualised coaching by certified Quantum Mentors — with weekend and weekday evening batches tailored around school hours.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-[#E6F0ED]">
            <div>
              <p className="text-xl sm:text-2xl font-black text-brand-deep">9</p>
              <p className="text-xs text-[#5c7772] font-semibold">Physical Centres</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#0E937E]">15 Max</p>
              <p className="text-xs text-[#5c7772] font-semibold">Learners Per Batch</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-brand-deep">45 Min</p>
              <p className="text-xs text-[#5c7772] font-semibold">Free Diagnostic Demo</p>
            </div>
          </div>
        </div>
      </ScrollMotion>

      {/* Animated City Filter Pills */}
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5c7772] mr-2">
          Select City:
        </span>
        {CITY_FILTERS.map((city) => {
          const isSelected = selectedCity === city.id;
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => setSelectedCity(city.id)}
              className={`relative rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition ${
                isSelected
                  ? "text-[#2BD6B4] shadow-md"
                  : "bg-white border border-[#CFE3DD] text-[#4b635e] hover:bg-[#F4F8F7]"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="city-filter-pill"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-brand-deep"
                />
              )}
              <span className="relative z-10">{city.label}</span>
            </button>
          );
        })}
      </div>

      {/* 9 Pictorial Centres Grid */}
      <motion.div layout className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCentres.map((ct) => {
          const globalIndex = centres.findIndex((item) => item.id === ct.id);
          const thumb = CENTRE_IMAGES[Math.max(0, globalIndex) % CENTRE_IMAGES.length];
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `Q-School ${ct.name} ${ct.address}`,
          )}`;

          return (
            <motion.div
              key={ct.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28 }}
            >
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.18)"
                className="h-full flex flex-col justify-between hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Centre Visual Banner */}
                  <div className="relative h-36 w-full overflow-hidden bg-[#054038]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={ct.name}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#054038]/90 via-[#054038]/25 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-full bg-white/95 px-3 py-0.5 text-xs font-black text-brand-deep shadow-sm">
                        {ct.city}
                      </span>
                      <span className="rounded-full bg-[#03221E]/80 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-[#2BD6B4] border border-white/15">
                        Centre 0{globalIndex + 1}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                        {ct.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs sm:text-sm text-[#4b635e] leading-relaxed flex items-start gap-2">
                      <Icon
                        name="pin"
                        size={16}
                        className="shrink-0 mt-0.5 text-[#0E937E]"
                      />
                      <span>{ct.address}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {ct.batches.map((b) => (
                        <span
                          key={b}
                          className="rounded-lg bg-[#F2FAF8] border border-[#CFE3DD] px-2.5 py-1 text-[11px] font-bold text-brand-deep"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-[#EEF3F1] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:+91${ct.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-brand-teal hover:underline"
                    >
                      <Icon name="phone" size={14} />
                      <span>{ct.phone}</span>
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${ct.name} in Google Maps`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#5c7772] hover:text-brand-deep transition"
                    >
                      <Icon name="external" size={13} /> Map
                    </a>
                  </div>

                  <a
                    href="#demo"
                    className="btn-3d btn-3d-teal rounded-lg px-3.5 py-2 text-xs font-bold"
                  >
                    Book Visit →
                  </a>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

function Pricing({ c }: { c: HomeContent["pricing"] }) {
  if (!c.plans.length) return null;
  const cols =
    c.plans.length === 4
      ? "md:grid-cols-2 lg:grid-cols-4"
      : c.plans.length === 2
      ? "md:grid-cols-2"
      : c.plans.length === 1
      ? ""
      : "md:grid-cols-3";
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-24">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <div className={`mt-14 grid grid-cols-1 gap-6 ${cols}`}>
          {c.plans.map((p, i) => (
            <div
              key={i}
              className="rounded-3xl border border-[#CFE3DD] p-8 shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-brand-ink">{p.name}</h3>
              <p className="mt-2 text-3xl font-extrabold text-brand-deep">{p.price}</p>
              <p className="mt-3 text-sm text-[#5c7772]">{p.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ c }: { c: HomeContent["faq"] }) {
  const [openIdx, setOpenIdx] = useState<number>(0);
  if (!c.items.length) return null;

  return (
    <section id="faq" className="scroll-mt-20 bg-[#F4F8F7] py-24">
      <div className="container-qs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Pictorial Sticky Counsellor & Parent Guide Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
            {c.body && (
              <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
                {c.body}
              </p>
            )}

            <div className="mt-7 relative overflow-hidden rounded-3xl border border-[#CFE3DD] bg-[#054038] text-white shadow-xl">
              <BorderBeam size={200} duration={11} colorFrom="#2BD6B4" colorTo="#FFC845" />
              <div className="relative h-52 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pic-girl.png"
                  alt="Q-School Young Learner"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#054038] via-[#054038]/30 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-[#2BD6B4] px-3 py-1 text-[11px] font-black text-[#03221E]">
                  Parent Guidance Desk
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-extrabold text-white">
                  Have Questions About Your Child&apos;s Age or Learning Needs?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1.5 leading-relaxed">
                  Speak directly with a Q-School Academic Counsellor for a zero-obligation 1:1 guidance call.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="tel:+919944454840"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2BD6B4] px-4 py-2.5 text-xs font-black text-[#03221E] hover:bg-[#FFC845] transition"
                  >
                    <Icon name="phone" size={14} /> +91 99444 54840
                  </a>
                  <a
                    href={c.cta?.href || "#demo"}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
                  >
                    {c.cta?.label || "Book Free Demo"} →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Animated Interactive Accordion */}
          <div className="lg:col-span-7 space-y-3.5">
            {c.items.map((f, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-white border-[#0E937E] shadow-lg"
                      : "bg-white/90 border-[#CFE3DD] hover:border-[#0E937E]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                          isOpen
                            ? "bg-[#054038] text-[#2BD6B4]"
                            : "bg-[#E6F4F0] text-[#0E937E]"
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <span className="font-extrabold text-brand-ink text-base sm:text-lg leading-snug">
                        {f.q}
                      </span>
                    </div>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        isOpen
                          ? "bg-[#0E937E] text-white rotate-180"
                          : "bg-[#F4F8F7] text-brand-teal"
                      }`}
                    >
                      <Icon name="chevDown" size={16} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pl-16">
                          <div className="border-t border-[#E6F0ED] pt-4 whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#4b635e]">
                            {f.a}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Demo({ c }: { c: HomeContent["demo"] }) {
  return (
    <section id="demo" className="container-qs scroll-mt-20 py-14">
      <ScrollMotion variant="fade-up">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-16 shadow-2xl border border-[#2BD6B4]/30">
          <BorderBeam size={280} duration={14} colorFrom="#2BD6B4" colorTo="#FFC845" />
          <div
            className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-teal/50 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#2BD6B4]/25 blur-3xl"
            aria-hidden
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-hand text-2xl sm:text-3xl text-[#2BD6B4]">{c.script}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">
                {c.title}
              </h2>
              {c.body && (
                <p className="mt-4 max-w-lg text-base sm:text-lg text-white/85 leading-relaxed">
                  {c.body}
                </p>
              )}
              <ul className="mt-6 space-y-3">
                {c.points.map((x, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-base sm:text-[16.5px] text-white/95"
                  >
                    <span
                      className="icon-3d h-6 w-6 rounded-full shrink-0"
                      style={{ ["--c" as string]: "#2BD6B4" }}
                    >
                      <Icon name="check" size={14} strokeWidth={3} className="text-brand-deep" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>

              {/* Happy Family Trust Card */}
              <div className="mt-7 flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 p-4 max-w-lg backdrop-blur-md">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#2BD6B4]/60 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/side-family.png"
                    alt="Parent and Child Learning Success"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Trusted by 25,000+ Happy Families Across India
                  </p>
                  <p className="text-xs sm:text-[13px] text-white/80 mt-0.5">
                    Includes personalised cognitive stamina evaluation &amp; zero obligation to enrol.
                  </p>
                </div>
              </div>

              {/* Direct Counsellor Callout */}
              <div className="mt-5 rounded-2xl bg-white/10 border border-white/15 p-5 max-w-lg backdrop-blur-md">
                <p className="text-xs uppercase tracking-wider text-[#FFC845] font-black">
                  Direct Academic Counsellor Desk · www.theqschool.com
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-5 text-sm font-bold">
                  <a
                    href="tel:+919944454840"
                    className="hover:text-[#2BD6B4] flex items-center gap-1.5 transition"
                  >
                    <Icon name="phone" size={16} className="text-[#2BD6B4]" /> +91 99444 54840
                  </a>
                  <a
                    href="mailto:info@theqschool.com"
                    className="hover:text-[#2BD6B4] flex items-center gap-1.5 transition"
                  >
                    <Icon name="message" size={16} className="text-[#2BD6B4]" /> info@theqschool.com
                  </a>
                </div>
              </div>
            </div>

            <Tilt max={3} glare={false} className="rounded-3xl">
              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-7 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-9">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4F0] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0E937E] mb-3">
                  <Icon name="calendar" size={13} /> Free 45-Minute Diagnostic Demo
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-deep">
                  {c.formTitle}
                </h3>
                {c.formNote && (
                  <p className="mb-6 mt-1.5 text-xs sm:text-sm text-[#5c7772]">{c.formNote}</p>
                )}
                <LeadForm source="landing_demo" cta={c.button} />
              </div>
            </Tilt>
          </div>
        </div>
      </ScrollMotion>
    </section>
  );
}

const RENDER: Record<SectionKey, (c: HomeContent, ctx: { overlap: boolean }) => ReactNode> = {
  hero: (c) => <Hero c={c.hero} />,
  stats: (c, ctx) => <Stats c={c.stats} overlap={ctx.overlap} />,
  subjects: (c) => <Subjects c={c.subjects} />,
  formats: (c) => <Formats c={c.formats} />,
  programs: () => <ProgramsHorizontalScroll />,
  how: (c) => <How c={c.how} />,
  live: (c) => <Live c={c.live} />,
  why: (c) => <Why c={c.why} />,
  testimonials: (c) => <Testimonials c={c.testimonials} />,
  centres: (c) => <Centres c={c.centres} />,
  pricing: (c) => <Pricing c={c.pricing} />,
  faq: (c) => <Faq c={c.faq} />,
  demo: (c) => (
    <>
      <DiagnosticQuiz />
      <Demo c={c.demo} />
    </>
  ),
};

export function HomeSections({ content }: { content: HomeContent }) {
  const visible = content.sections.filter((s) => s.visible);
  return (
    <>
      {visible.map((s, i) => (
        <div key={s.key} data-section={s.key} className="contents">
          {RENDER[s.key](content, { overlap: i > 0 && visible[i - 1].key === "hero" })}
          {/* Weave the complete 16-page Q-School Brochure narrative seamlessly into the landing flow */}
          {s.key === "subjects" && (
            <>
              <StorySection />
              <PedagogySection />
              <AiVsHiSection />
              <FiveDFramework />
            </>
          )}
          {s.key === "programs" && (
            <>
              <NeoSapiensSection />
              <JourneyAndPathwaySection />
              <QVerseSection />
            </>
          )}
        </div>
      ))}
    </>
  );
}
