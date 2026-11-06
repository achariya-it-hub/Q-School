"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CENTERS, PROGRAMS, WEBINAR_LIST, WORKSHOPS, fmtCount } from "@qschool/shared";
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
import { QuantumNexus } from "@/components/three/quantum-nexus";
import { QuantumCoreOrb } from "@/components/three/quantum-core-orb";
import { QuantumBrainMesh } from "@/components/three/quantum-brain-mesh";
import {
  SpotlightCard,
  BorderBeam,
  ScrollMotion,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/21st";
import type { HeroSlide, HomeContent, SectionKey } from "@/lib/site/home-content";

/* Typography & Visual Header Primitives */
const Kicker = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) =>
  children ? (
    <p className={`text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-[0.16em] ${dark ? "text-[#2BD6B4]" : "text-brand-teal"}`}>
      {children}
    </p>
  ) : null;

const H2 = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2 className={`mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-[1.2] ${dark ? "" : "text-brand-deep"}`}>
    {children}
  </h2>
);

function BrandSlide({ s }: { s: HeroSlide }) {
  return (
    <div className="container-qs relative grid grid-cols-1 items-center gap-12 pb-28 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
      <div>
        {(s.badge || s.kicker) && (
          <span className="hs-in inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-4 text-xs sm:text-[13px] font-semibold text-white/95 backdrop-blur-xs">
            {s.badge && <span className="rounded-full bg-[#2BD6B4] px-2.5 py-0.5 text-xs font-black text-brand-deep">{s.badge}</span>}
            {s.kicker}
          </span>
        )}
        <h1 className="hs-in mt-6 text-[2.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]" style={{ ["--d" as string]: "90ms" }}>
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
          <p className="hs-in mt-6 max-w-xl text-lg sm:text-[19px] leading-relaxed text-white/85 font-normal" style={{ ["--d" as string]: "180ms" }}>
            {s.body}
          </p>
        )}
        <div className="hs-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "270ms" }}>
          {s.primary.label && (
            <Link href={s.primary.href} className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-base font-bold shadow-lg">
              <span>{s.primary.label}</span>
              <span className="font-mono text-lg">→</span>
            </Link>
          )}
          {s.secondary?.label && (
            <Link href={s.secondary.href} className="btn-3d btn-3d-outline inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white">
              {s.secondary.label}
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
      <QuantumNexus className="pointer-events-none absolute inset-0 z-0 opacity-45" particleCount={95} speed={0.45} colorScheme="teal" />
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
    <section className="relative mt-8 overflow-hidden py-3" aria-label="Core Mantras">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4faf8]" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4faf8]" aria-hidden />
      <div className="flex w-max animate-marquee gap-3">
        {[...c.items, ...c.items].map((s, i) => (
          <span
            key={i}
            aria-hidden={i >= c.items.length}
            className="emboss inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-bold tracking-wide text-[#41564f]"
          >
            <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: s.color }} />
            {s.label}
            {s.count && <span className="rounded-md bg-[#2BD6B4]/15 px-1.5 py-0.2 text-[11px] text-[#0E937E] font-bold">{s.count}</span>}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── 1. The Q-School Story & Gen Alpha ───────────────────────── */
function StoryAndGenAlpha() {
  const [activeTrait, setActiveTrait] = useState<number>(0);

  const traits = [
    {
      icon: "laptop",
      title: "Digitally Native",
      desc: "Comfortable with technology and digital experiences.",
      color: "#0E937E",
      qschoolSuperpower: "Transforms passive screen consumption into active creator capability, hands-on spatial thinking, and computational logic.",
    },
    {
      icon: "sparkle",
      title: "Instantly Stimulated",
      desc: "Accustomed to fast-paced information and immediate responses.",
      color: "#5B6CF0",
      qschoolSuperpower: "Harnesses dopamine feedback loops through gamified speed drills, dual-n-back mental challenges, and 1-minute recall sprints.",
    },
    {
      icon: "eye",
      title: "Curious Explorers",
      desc: "Thrive on discovery, interaction, and engaging experiences.",
      color: "#F29A2E",
      qschoolSuperpower: "Replaces rigid textbook answers with Socratic questioning, hands-on robotics kits, and real-world scientific inquiry.",
    },
    {
      icon: "heart",
      title: "Unique Learners",
      desc: "Have individual strengths, distinctive interests, and unique learning needs.",
      color: "#E2557A",
      qschoolSuperpower: "Individualized 1:1 mentor coaching, tailored pace calibration, and psychological safety in micro-cohorts of 15.",
    },
    {
      icon: "planet",
      title: "Future-Driven",
      desc: "Need the ability to think independently, adapt, and solve problems.",
      color: "#054038",
      qschoolSuperpower: "Embeds ethical judgement, emotional equilibrium, and divergent multi-solution thinking before machines automate standard tasks.",
    },
  ];

  return (
    <section id="story" className="relative scroll-mt-20 py-24 bg-gradient-to-b from-[#F4F8F7] via-white to-[#F4F8F7] border-y border-[#E2ECE9] overflow-hidden">
      <QuantumNexus className="pointer-events-none absolute inset-0 opacity-30" particleCount={85} speed={0.35} colorScheme="emerald" />

      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The Q-School Story</Kicker>
          <H2>A Brighter Future Starts With the Learner</H2>
          <p className="mt-4 text-lg sm:text-xl leading-relaxed text-[#3b544e]">
            Every generation of parents has asked the same question in a different way: <strong className="text-brand-ink font-bold">what will my child need to thrive?</strong> For children growing up alongside smartphones, artificial intelligence, and constant change, the answer is evolving faster than any curriculum can keep pace.
          </p>
        </ScrollMotion>

        {/* Narrative & Founder Quote Split */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* Left Card: The Shift */}
          <ScrollMotion variant="fade-left" className="h-full">
            <SpotlightCard
              spotlightColor="rgba(43, 214, 180, 0.22)"
              borderColor="rgba(43, 214, 180, 0.5)"
              className="p-8 sm:p-10 shadow-xl flex h-full flex-col justify-between group"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4]/20 !text-[#0B6E5F] font-bold">THE SHIFT</span>
                  <span className="text-xs font-bold text-[#0E937E] uppercase tracking-wider">Human Intelligence First</span>
                </div>
                <h3 className="mt-5 text-2xl sm:text-3xl font-extrabold text-brand-ink">Beyond Competing with Machines</h3>
                <p className="mt-4 text-base sm:text-[17px] leading-relaxed text-[#4b635e]">
                  Q-School (The Quantum Schooling) was created to respond to that shift — <strong className="text-brand-ink font-semibold">not by teaching children to compete with machines</strong>, but by deliberately developing the human capacities that remain essential:
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {["Attention", "Imagination", "Judgement", "Emotional Awareness", "Self-Belief", "Creativity", "Original Thought"].map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-white/95 px-4 py-1.5 text-xs sm:text-[13.5px] font-bold text-brand-deep border border-[#CFE3DD] shadow-xs hover:border-[#2BD6B4] hover:shadow-[0_0_14px_rgba(43,214,180,0.45)] hover:scale-105 transition duration-300 cursor-default"
                    >
                      ✦ {c}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm sm:text-base leading-relaxed text-[#4b635e]">
                  Drawing from contemporary learning methods, cognitive-development practices, and selected principles inspired by India’s knowledge traditions, Q-School brings these dimensions together in one structured learning journey.
                </p>

                {/* Real Mentor & Student Photo Frame */}
                <div className="mt-6 relative overflow-hidden rounded-2xl border border-[#CFE3DD] shadow-md group/img">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/images/uploaded/mentor-student.jpg"
                      alt="Q-School Certified Mentor guiding young learner"
                      fill
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-cover transition duration-700 group-hover/img:scale-105"
                    />
                  </div>
                  <div className="bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-[#0B6E5F] flex items-center justify-between">
                    <span>Individualised Mentor Guidance</span>
                    <span className="text-[#6b807b] font-normal">Ages 6–14 Years</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 border-t border-[#E2ECE9] pt-6 flex items-center gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-deep text-[#2BD6B4] shadow-md">
                  <Icon name="award" size={22} />
                </span>
                <div>
                  <p className="text-base font-bold text-brand-ink">For Children Aged 6–14 Years</p>
                  <p className="text-xs sm:text-sm text-[#5c7772]">48 Classes Per Annum · Continuous Developmental Journey</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollMotion>

          {/* Right Card: Founder's Quote with 21st.dev Border Beam */}
          <ScrollMotion variant="fade-right" delay={0.15} className="h-full">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#054038] via-[#04332D] to-[#011C18] p-8 text-white sm:p-10 shadow-2xl border border-[#2BD6B4]/30 group">
              <BorderBeam size={280} duration={10} colorFrom="#2BD6B4" colorTo="#0E937E" borderWidth={2} />

              <div className="absolute -top-10 -right-10 w-60 h-60 pointer-events-auto opacity-80 group-hover:opacity-100 transition duration-500">
                <QuantumCoreOrb />
              </div>
              <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#2BD6B4]/15 blur-2xl" />

              <div className="relative z-10">
                <span className="font-hand text-6xl leading-none text-[#2BD6B4]">&ldquo;</span>
                <blockquote className="mt-2 text-lg sm:text-xl lg:text-[22px] font-medium leading-relaxed text-white/95 max-w-[88%]">
                  Education must do more than transfer information. It must develop the human being who receives it. My vision for Q-School is to help every child discover their strengths, build the habits to use them well, and grow with the confidence to navigate a world that is changing every day.
                </blockquote>
                <div className="mt-8 border-t border-white/15 pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-[#2BD6B4]">Dr J Arawindhan</p>
                    <p className="text-sm text-white/75">Founder, Chief Mentor &amp; Managing Director, Q-School</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#2BD6B4] border border-[#2BD6B4]/30 backdrop-blur-xs">
                    <span className="h-2 w-2 rounded-full bg-[#2BD6B4] animate-ping" />
                    3D Quantum Core
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/15 pt-6 text-xs sm:text-sm">
                <div className="rounded-2xl bg-white/10 p-4.5 backdrop-blur-xs border border-white/10 hover:border-[#2BD6B4]/50 transition">
                  <p className="font-bold text-[#2BD6B4] uppercase tracking-wider text-xs">Our Mission</p>
                  <p className="mt-1.5 text-white/85 leading-relaxed">Systematically develop every child&apos;s ability to focus, learn, think, create, communicate, adapt, solve and lead in an AI-driven world.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4.5 backdrop-blur-xs border border-white/10 hover:border-[#2BD6B4]/50 transition">
                  <p className="font-bold text-[#2BD6B4] uppercase tracking-wider text-xs">Our Vision</p>
                  <p className="mt-1.5 text-white/85 leading-relaxed">The definitive future-readiness programme recognized nationally as the trusted partner that develops the learner behind the learning.</p>
                </div>
              </div>
            </div>
          </ScrollMotion>
        </div>

        {/* Gen Alpha & New-Age Parenting Challenge */}
        <ScrollMotion variant="fade-up" delay={0.2} className="mt-18 rounded-3xl bg-[#F4F8F7] border border-[#CFE3DD] p-8 sm:p-11 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative overflow-hidden rounded-3xl border border-[#CFE3DD] shadow-md aspect-[4/3]">
                <Image
                  src="/images/uploaded/gen-alpha-kid.jpg"
                  alt="Generation Alpha Learner"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover"
                />
              </div>
              <span className="absolute -bottom-3 -right-3 rounded-2xl bg-[#054038] text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-lg border border-[#2BD6B4]/30">
                Ages 6–14 Years
              </span>
            </div>

            <div className="lg:col-span-7">
              <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">GEN ALPHA</span>
              <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-ink">A New Generation. A New World. A New Way to Learn.</h3>
              <p className="mt-3.5 text-base sm:text-lg text-[#4b635e] leading-relaxed">
                Born into a digitally connected world, Generation Alpha is growing up alongside artificial intelligence, smart technology and rapid global change. Their future calls for adaptability, creativity, critical thinking, and emotional intelligence.
              </p>
              <div className="mt-5 rounded-2xl border border-[#2BD6B4]/40 bg-[#E9F6F3] p-5 text-left">
                <p className="text-sm sm:text-base font-semibold text-brand-deep italic">
                  &ldquo;My child is growing up in a world I never experienced. Am I preparing them for the future they will inherit?&rdquo;
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-[#41564f]">
                  The answer lies in nurturing the child behind the learning — attention, judgment, and original imagination.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Trait Tabs */}
          <div className="mt-10">
            <p className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-[#0E937E] mb-3 text-center sm:text-left">
              Click Any Trait to View Q-School&apos;s Pedagogical Transformation:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {traits.map((t, idx) => {
                const isActive = activeTrait === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTrait(idx)}
                    className={`rounded-2xl p-4 text-left transition-all duration-300 border ${
                      isActive
                        ? "bg-white border-[#2BD6B4] shadow-[0_8px_20px_rgba(43,214,180,0.25)] scale-[1.02] ring-2 ring-[#2BD6B4]/30"
                        : "bg-white/70 border-[#CFE3DD] hover:bg-white hover:border-[#2BD6B4]/50"
                    }`}
                  >
                    <span className="icon-3d h-10 w-10 rounded-xl" style={{ ["--c" as string]: t.color }}>
                      <Icon name={t.icon as IconName} size={20} />
                    </span>
                    <h4 className="mt-2.5 text-sm sm:text-base font-extrabold text-brand-ink">{t.title}</h4>
                    <p className="mt-1 text-xs text-[#6b807b] line-clamp-2">{t.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Trait Deep-Dive Spotlight */}
            <div className="mt-6 rounded-2xl bg-white border border-[#2BD6B4]/40 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2ECE9] pb-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full animate-ping" style={{ backgroundColor: traits[activeTrait].color }} />
                  <span className="text-sm font-black uppercase text-[#0B6E5F]">
                    How Q-School Guides: {traits[activeTrait].title}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#6b807b]">Trait 0{activeTrait + 1} of 05</span>
              </div>
              <p className="mt-3.5 text-base sm:text-[17px] font-medium text-brand-deep leading-relaxed">
                {traits[activeTrait].qschoolSuperpower}
              </p>
            </div>
          </div>
        </ScrollMotion>
      </div>
    </section>
  );
}

/* ───────────────────────── 2. Traditional Education vs. Q-School & 10 Core Abilities ───────────────────────── */
function PedagogySection() {
  const [viewMode, setViewMode] = useState<"sidebyside" | "qschool" | "traditional">("sidebyside");
  const [selectedAbility, setSelectedAbility] = useState<number>(0);

  const comparison = [
    { dim: "Focus of Learning", trad: "What children learn (Syllabus rote)", qs: "How children learn, think, synthesize and apply" },
    { dim: "Core Objective", trad: "Covering exam curriculum", qs: "Building lifelong cognitive & human capability" },
    { dim: "Pedagogy", trad: "Passive memorisation & rote drills", qs: "Multi-sensory experiential application & mental agility" },
    { dim: "Cognitive Depth", trad: "Single-subject academic testing", qs: "Whole-brain neural stamina & divergent problem-solving" },
    { dim: "Success Metric", trad: "Exam marks & rankings", qs: "Real-world resilience, confidence & leadership" },
  ];

  const abilities = [
    { num: "01", name: "Focus & Attention", desc: "Sensory activation, concentration stamina, and deep observation.", drill: "Dual-N-Back focus cycles & candle observation drills" },
    { num: "02", name: "Memory & Learning", desc: "Memory palaces, visual association, and long-term retention.", drill: "Spatial loci memory grids & rapid association linkages" },
    { num: "03", name: "Thinking & Reasoning", desc: "Mental models, pattern discovery, and logical deduction.", drill: "Syllogistic logic puzzles & first-principles problem sets" },
    { num: "04", name: "Creativity", desc: "Divergent thinking, imagination, and transforming ideas into action.", drill: "Alternative-uses challenges & inventive concept mashups" },
    { num: "05", name: "Communication", desc: "Expressing ideas clearly, articulation, and empathetic listening.", drill: "1-minute extempore framing & constructive debate circles" },
    { num: "06", name: "Problem Solving", desc: "Breaking down complex challenges and strategic execution.", drill: "Root-cause tree mapping & backward induction games" },
    { num: "07", name: "Habits", desc: "Daily physical, intellectual, and self-disciplinary atomic routines.", drill: "Daily 15-minute micro-habit ledger & reflection logs" },
    { num: "08", name: "Emotional Strength", desc: "Self-awareness, emotional regulation, and handling setbacks.", drill: "Emotional weather forecasting & resilience reframing" },
    { num: "09", name: "Adaptability", desc: "Navigating uncertainty with curiosity, flexibility, and resilience.", drill: "Constraint-shift simulation & variable rule challenges" },
    { num: "10", name: "Leadership", desc: "Ethical decision-making, collaboration, and bringing out the best in teams.", drill: "Cohort capstone coordination & ethical dilemma trials" },
  ];

  return (
    <section id="pedagogy" className="scroll-mt-20 py-24 bg-[#F4F8F7]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>Why Q-School?</Kicker>
          <H2>School teaches the curriculum. Q-School develops the learner.</H2>
          <p className="mt-4 text-lg sm:text-xl italic font-semibold text-brand-teal">
            &ldquo;Who is systematically developing a child&apos;s ability to learn, think, adapt and create?&rdquo;
          </p>

          {/* Interactive View Switcher */}
          <div className="mt-8 inline-flex items-center rounded-2xl bg-white p-1.5 shadow-md border border-[#CFE3DD]">
            <button
              type="button"
              onClick={() => setViewMode("sidebyside")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                viewMode === "sidebyside" ? "bg-brand-deep text-white shadow-xs" : "text-[#4b635e] hover:text-brand-deep"
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              type="button"
              onClick={() => setViewMode("qschool")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                viewMode === "qschool" ? "bg-[#0E937E] text-white shadow-xs" : "text-[#4b635e] hover:text-brand-deep"
              }`}
            >
              ⚡ Q-School Transformation
            </button>
            <button
              type="button"
              onClick={() => setViewMode("traditional")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                viewMode === "traditional" ? "bg-red-700 text-white shadow-xs" : "text-[#4b635e] hover:text-brand-deep"
              }`}
            >
              🏛️ Traditional Schooling
            </button>
          </div>
        </ScrollMotion>

        {/* Dynamic Comparison Matrix */}
        <ScrollMotion variant="fade-up" delay={0.1} className="mt-12 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-xl">
          {viewMode === "sidebyside" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#E2ECE9] bg-[#054038] text-white p-5 sm:p-6 font-bold text-base sm:text-lg">
                <div>Dimension</div>
                <div className="text-white/80">Traditional Education</div>
                <div className="text-[#2BD6B4]">Q-School (Quantum Schooling)</div>
              </div>
              <div className="divide-y divide-[#EEF3F1]">
                {comparison.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-5 sm:p-6 gap-2 text-base sm:text-[16.5px] items-center hover:bg-[#F9FBFB] transition">
                    <div className="font-bold text-brand-deep">{row.dim}</div>
                    <div className="text-[#6b807b] flex items-center gap-2">
                      <span className="text-red-400 font-bold">✕</span> {row.trad}
                    </div>
                    <div className="font-extrabold text-[#0B6E5F] flex items-center gap-2">
                      <span className="text-[#0E937E] font-black">✓</span> {row.qs}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === "qschool" && (
            <div className="p-8 sm:p-12 bg-gradient-to-br from-[#054038] via-[#04332D] to-[#011C18] text-white">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#2BD6B4] px-3 py-1 text-xs font-black text-brand-deep">Q-SCHOOL FOCUS</span>
                <span className="text-sm font-bold text-[#2BD6B4]">Developing the Human Learner</span>
              </div>
              <h3 className="mt-4 text-2xl sm:text-4xl font-extrabold">Human Capability Architecture</h3>
              <p className="mt-3 text-base sm:text-lg text-white/85 max-w-2xl">
                Q-School builds whole-child neural adaptability, divergent problem-solving, and conscious focus.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {comparison.map((row, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                    <span className="text-xs font-extrabold uppercase text-[#2BD6B4]">{row.dim}</span>
                    <p className="mt-2 text-lg font-bold text-white leading-snug">{row.qs}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === "traditional" && (
            <div className="p-8 sm:p-12 bg-[#FFF8F7] border-l-8 border-red-500">
              <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-xs font-black">TRADITIONAL CURRICULUM</span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-red-950">Curriculum Delivery Limitations</h3>
              <p className="mt-2 text-base text-red-900/80 max-w-2xl">
                Designed during the industrial era for information transmission and single-subject exam rankings.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {comparison.map((row, idx) => (
                  <div key={idx} className="rounded-2xl border border-red-200 bg-white p-5 shadow-xs">
                    <span className="text-xs font-extrabold uppercase text-red-700">{row.dim}</span>
                    <p className="mt-2 text-base font-semibold text-gray-800 leading-snug">{row.trad}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollMotion>

        {/* 10 Core Abilities Interactive Showcase */}
        <div className="mt-24">
          <ScrollMotion variant="fade-up" className="mx-auto max-w-2xl text-center">
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">THE FOUNDATION</span>
            <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-ink">10 Core Abilities Systematically Developed</h3>
            <p className="mt-3 text-base text-[#4b635e]">
              Click any ability below to reveal the specific in-class neural drill practiced in our 48 classes.
            </p>
          </ScrollMotion>

          {/* Interactive Ability Grid */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {abilities.map((ab, idx) => {
              const isSelected = selectedAbility === idx;
              return (
                <button
                  key={ab.num}
                  type="button"
                  onClick={() => setSelectedAbility(idx)}
                  className={`rounded-2xl p-4.5 text-left transition-all duration-300 border ${
                    isSelected
                      ? "bg-white border-[#2BD6B4] shadow-[0_8px_24px_rgba(43,214,180,0.3)] ring-2 ring-[#2BD6B4]/40 scale-[1.03]"
                      : "bg-[#F7FAF9] border-[#CFE3DD] hover:bg-white hover:border-[#2BD6B4]/60"
                  }`}
                >
                  <span className="text-xs font-black text-[#0E937E]">{ab.num}</span>
                  <h4 className="mt-1 text-base font-extrabold text-brand-ink">{ab.name}</h4>
                  <p className="mt-1.5 text-xs text-[#5c7772] line-clamp-2">{ab.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Active Ability Spotlight Card */}
          <div className="mt-6 rounded-3xl bg-white border border-[#2BD6B4]/50 p-7 sm:p-9 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE9] pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#0E937E]">Core Ability {abilities[selectedAbility].num}</span>
                <h4 className="text-2xl font-black text-brand-deep">{abilities[selectedAbility].name}</h4>
              </div>
              <span className="rounded-full bg-brand-teal100 px-4 py-1.5 text-xs sm:text-sm font-bold text-[#0B6E5F]">
                48 Classes Progressive Development
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#6b807b]">Developmental Goal</p>
                <p className="mt-1 text-base text-brand-ink font-medium leading-relaxed">{abilities[selectedAbility].desc}</p>
              </div>
              <div className="rounded-2xl bg-[#E9F6F3] p-4.5 border border-[#2BD6B4]/30">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#0B6E5F]">Typical Classroom Drill</p>
                <p className="mt-1 text-base text-brand-deep font-bold leading-relaxed">{abilities[selectedAbility].drill}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3. AI vs. HI (Human Intelligence) ───────────────────────── */
function AIvsHI() {
  const [activeTab, setActiveTab] = useState<"both" | "hi" | "ai">("both");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#054038] via-[#032D27] to-[#054038] py-24 text-white">
      <QuantumNexus className="pointer-events-none absolute inset-0 opacity-40" particleCount={110} speed={0.4} colorScheme="teal" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-teal/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-[#2BD6B4]/20 blur-3xl" />

      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">AI VS. HI</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem] text-white">
            AI Can Process. <span className="text-[#2BD6B4]">Human Intelligence Can Transform.</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-white/85 leading-relaxed">
            Artificial Intelligence is reshaping how we learn, work, and live. It can process information, recognize patterns, and automate tasks. But human progress also depends on <strong className="text-white">empathy, imagination, independent judgement, and ethical decision-making.</strong>
          </p>

          {/* Interactive Switch */}
          <div className="mt-8 inline-flex items-center rounded-2xl bg-white/10 p-1.5 backdrop-blur-md border border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab("both")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                activeTab === "both" ? "bg-[#2BD6B4] text-brand-deep shadow-md" : "text-white/80 hover:text-white"
              }`}
            >
              Side-by-Side Dual View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hi")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                activeTab === "hi" ? "bg-[#2BD6B4] text-brand-deep shadow-md" : "text-white/80 hover:text-white"
              }`}
            >
              🧠 Human Intelligence (HI) Focus
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                activeTab === "ai" ? "bg-white/30 text-white shadow-md" : "text-white/80 hover:text-white"
              }`}
            >
              🤖 AI Algorithmic Processing
            </button>
          </div>
        </ScrollMotion>

        {/* 3D Interactive Dual-Hemisphere Brain */}
        <div className="mt-10 mb-8">
          <QuantumBrainMesh />
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {(activeTab === "both" || activeTab === "ai") && (
            <ScrollMotion variant="fade-left" className="h-full">
              <div className="h-full rounded-3xl border border-white/15 bg-white/10 p-7 sm:p-9 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[#2BD6B4]">
                      <Icon name="ai" size={26} />
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Artificial Intelligence (AI)</h3>
                      <p className="text-xs sm:text-sm text-white/60">Automated Computation &amp; Pattern Output</p>
                    </div>
                  </div>
                  <ul className="mt-8 space-y-4 text-base sm:text-[16.5px] text-white/80">
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                      <span><strong>Processes information at speed</strong> across vast datasets.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                      <span><strong>Recognises patterns</strong> and generates statistical outputs.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                      <span><strong>Automates repetitive tasks</strong> and structured workflows.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                      <span><strong>Supports data-driven decisions</strong> within programmed parameters.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollMotion>
          )}

          {(activeTab === "both" || activeTab === "hi") && (
            <ScrollMotion variant="fade-right" delay={0.12} className="h-full">
              <div className="relative h-full rounded-3xl border-2 border-[#2BD6B4] bg-gradient-to-b from-[#0a5a4e] to-[#04332c] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden group">
                <BorderBeam size={260} duration={10} colorFrom="#2BD6B4" colorTo="#2BB39C" borderWidth={2.5} />

                <div className="relative z-10">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2BD6B4] text-brand-deep shadow-md">
                      <Icon name="brain" size={26} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-white">Human Intelligence (HI)</h3>
                        <span className="rounded-full bg-[#2BD6B4]/25 px-2.5 py-0.5 text-[11px] font-black text-[#2BD6B4]">Q-SCHOOL FOCUS</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#2BD6B4]">Original Consciousness, Emotion &amp; Ethics</p>
                    </div>
                  </div>
                  <ul className="mt-8 space-y-4 text-base sm:text-[16.5px] text-white/95">
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                      <span><strong>Thinks critically and independently</strong> beyond algorithmic bias.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                      <span><strong>Creates, imagines and innovates</strong> novel artistic &amp; scientific breakthroughs.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                      <span><strong>Understands emotions</strong>, empathy, and human shared values.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                      <span><strong>Applies judgement, empathy and ethical responsibility</strong> to lead humanity.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollMotion>
          )}
        </div>

        {/* Core quote bar */}
        <ScrollMotion variant="fade-up" delay={0.2} className="mt-14 rounded-2xl bg-white/10 border border-white/20 p-6 text-center max-w-4xl mx-auto backdrop-blur-sm">
          <p className="font-hand text-2xl sm:text-3xl text-[#2BD6B4]">&ldquo;AI may change the world. Human intelligence will shape its future.&rdquo;</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-semibold text-white/85">
            <span>Focus</span> • <span>Memory</span> • <span>Comprehension</span> • <span>Creativity</span> • <span>Emotional Awareness</span> • <span>Independent Thinking</span>
          </div>
        </ScrollMotion>
      </div>
    </section>
  );
}

/* ───────────────────────── 4. The Q 5D™ XYZTP Framework ───────────────────────── */
function Framework5D() {
  const [activeDimension, setActiveDimension] = useState<string>("X");

  const dimensions = [
    {
      code: "X",
      name: "CONSCIOUS",
      subtitle: "Focus & Understand",
      desc: "Attention, observation and conscious engagement with learning.",
      color: "#0E937E",
      drills: "Dual-n-back sensory drills, micro-distraction filters, 45-minute unbroken deep attention sprints.",
      outcome: "Builds high cognitive stamina and filters digital noise effortlessly.",
    },
    {
      code: "Y",
      name: "DEEP LEARNING",
      subtitle: "Practise & Internalise",
      desc: "Repetition, reinforcement and deep cognitive skill development.",
      color: "#5B6CF0",
      drills: "Visual mnemonic association, spatial memory palaces, high-frequency retrieval matrices.",
      outcome: "Permanently anchors mental frameworks without mindless rote memorization.",
    },
    {
      code: "Z",
      name: "FLOW & APPLICATION",
      subtitle: "Apply & Express",
      desc: "Integrating learning into confident, natural real-world application.",
      color: "#F29A2E",
      drills: "Hands-on robotics prototyping, lateral puzzle simulations, live peer problem-solving.",
      outcome: "Transforms abstract knowledge into real-world inventive output.",
    },
    {
      code: "T",
      name: "TIME",
      subtitle: "Efficiency & Fluency",
      desc: "Developing greater speed, intellectual fluency, organisation and efficiency.",
      color: "#E2557A",
      drills: "Speed mental arithmetic sprints, timed conceptual articulation, structured cognitive pacing.",
      outcome: "Achieves rapid calculation, sharp conversational fluidity, and effortless time mastery.",
    },
    {
      code: "P",
      name: "PEAK POSSIBILITY",
      subtitle: "Potential in Action",
      desc: "Expressing developed abilities through creativity, ethics, and leadership.",
      color: "#2BD6B4",
      drills: "Collaborative capstone projects, ethical scenario debates, mentoring junior peers.",
      outcome: "Produces resilient, confident, authentic leaders of the AI era.",
    },
  ];

  const activeDim = dimensions.find((d) => d.code === activeDimension) || dimensions[0];

  const intelligence = [
    { title: "Cognitive Intelligence", desc: "Memory, focus, concentration, and rapid processing." },
    { title: "Sensory & Perceptual", desc: "Observation, sensory awareness, and intuitive thinking." },
    { title: "Creative Intelligence", desc: "Imagination, originality, and out-of-the-box problem-solving." },
    { title: "Emotional Intelligence", desc: "Self-awareness, emotional regulation, and empathy." },
    { title: "Conscious Awareness", desc: "Mindfulness, reflection, and inner cognitive clarity." },
  ];

  return (
    <section id="framework" className="scroll-mt-20 py-24 bg-white border-b border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The Q 5D™ XYZTP Framework</Kicker>
          <H2>One Framework. Five Dimensions. A Progressive Learning Journey.</H2>
          <p className="mt-4 text-lg sm:text-xl text-[#4b635e] leading-relaxed">
            Our proprietary 5D architecture structures each child’s transformation from initial understanding to peak human performance.
          </p>
        </ScrollMotion>

        {/* Interactive Dimension Selector Tabs */}
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {dimensions.map((d) => {
            const isSelected = activeDimension === d.code;
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => setActiveDimension(d.code)}
                className={`rounded-2xl px-5 py-3.5 text-left transition-all duration-300 border flex items-center gap-3 ${
                  isSelected
                    ? "bg-[#054038] text-white border-[#2BD6B4] shadow-lg scale-105"
                    : "bg-[#F7FAF9] text-brand-ink border-[#CFE3DD] hover:bg-white"
                }`}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-sm text-white"
                  style={{ backgroundColor: d.color }}
                >
                  {d.code}
                </span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider opacity-80">Dim {d.code}</span>
                  <span className="block text-sm font-extrabold">{d.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Dimension Spotlight Showcase Card */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#054038] via-[#04332D] to-[#011C18] p-8 sm:p-12 text-white shadow-2xl border border-[#2BD6B4]/40 relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#2BD6B4]/10 blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl font-black text-4xl text-white shadow-xl"
                style={{ backgroundColor: activeDim.color }}
              >
                {activeDim.code}
              </span>
              <h3 className="mt-4 text-2xl font-black text-white">{activeDim.name}</h3>
              <p className="mt-1 text-sm font-bold text-[#2BD6B4]">{activeDim.subtitle}</p>
              <p className="mt-3 text-sm text-white/85 leading-relaxed">{activeDim.desc}</p>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/15">
                <span className="text-xs font-black uppercase text-[#2BD6B4] tracking-wider">In-Class Neural Drills</span>
                <p className="mt-1.5 text-base sm:text-lg text-white font-semibold leading-relaxed">
                  {activeDim.drills}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/15">
                <span className="text-xs font-black uppercase text-[#2BD6B4] tracking-wider">Measurable Learner Outcome</span>
                <p className="mt-1.5 text-base sm:text-lg text-white font-semibold leading-relaxed">
                  {activeDim.outcome}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white">48 Classes / Year</span>
                <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white">Micro-Cohorts (Max 15)</span>
                <span className="rounded-xl bg-[#2BD6B4] px-3.5 py-1.5 text-xs font-black text-brand-deep">
                  Certified Mentors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Flow Banner */}
        <ScrollMotion variant="fade-up" delay={0.15} className="mt-14 rounded-3xl bg-gradient-to-r from-[#054038] via-[#04332D] to-[#054038] p-8 text-white text-center shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#2BD6B4] font-extrabold">Progressive Learning Flow</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 font-bold text-sm sm:text-base">
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">UNDERSTAND</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">PRACTISE</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">INTERNALISE</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">APPLY</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-[#2BD6B4] text-brand-deep px-5 py-2 font-black shadow-md">EXPRESS</span>
          </div>
        </ScrollMotion>

        {/* 5 Interconnected Intelligence Dimensions */}
        <div className="mt-18">
          <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6b807b]">Five Interconnected Intelligence Dimensions</p>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {intelligence.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-[#CFE3DD] bg-[#F7FAF9] p-5 text-center hover:bg-white hover:shadow-md transition">
                <p className="text-base sm:text-[17px] font-bold text-brand-deep">{item.title}</p>
                <p className="mt-2 text-xs sm:text-sm text-[#4b635e] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 5. 8 Q-School Programs ───────────────────────── */
function Programs({ c }: { c: HomeContent["programs"] }) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const programs = PROGRAMS;

  const filtered = programs.filter((p) => {
    if (filterCategory === "foundation") return p.slug === "divya-yoga" || p.slug === "shilpa-shastra";
    if (filterCategory === "speed") return p.slug === "ganitham" || p.slug === "vedic-maths" || p.slug === "bmit";
    if (filterCategory === "science") return p.slug === "stem" || p.slug === "robotics" || p.slug === "chess";
    return true;
  });

  return (
    <section id="programs" className="scroll-mt-20 bg-white py-24 border-t border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
            <p className="mt-3 text-base sm:text-lg text-[#4b635e]">
              Structured neuro-cognitive development, speed learning, and leadership across 48 classes per annum.
            </p>
          </div>
          <Link href="#demo" className="btn-3d btn-3d-mint inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md">
            Book a Free Demo for Any Program →
          </Link>
        </ScrollMotion>

        {/* Interactive Filter Pills */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          {[
            { id: "all", label: "All 8 Programs" },
            { id: "foundation", label: "Foundation & Sensory (Ages 4–8)" },
            { id: "speed", label: "Speed & Cognitive Mastery (Ages 7–12)" },
            { id: "science", label: "Logic, STEM & Robotics (Ages 9–16)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                filterCategory === tab.id
                  ? "bg-brand-deep text-[#2BD6B4] shadow-md scale-105"
                  : "bg-[#F4F8F7] text-[#4b635e] hover:bg-[#E2ECE9]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 8 Programs Grid with Real Images */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => {
            const isExpanded = expandedProgram === p.slug;
            return (
              <SpotlightCard
                key={p.slug}
                spotlightColor="rgba(43, 214, 180, 0.18)"
                className="group flex flex-col justify-between overflow-hidden p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div>
                  <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden bg-[#054038]">
                    <Image
                      src={p.image || `/images/programs/${p.slug}.jpg`}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="chip !px-2.5 !py-0.5 !text-[11px] !bg-white/95 !text-[#054038] font-black shadow-xs backdrop-blur-xs">
                        {p.tags[0] || "Ages 6–14"}
                      </span>
                      <span className="text-[11px] font-bold text-[#2BD6B4] drop-shadow">
                        48 Classes / Year
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-brand-ink group-hover:text-brand-teal transition">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-[#5c7772] line-clamp-2">
                    {p.overview}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.learn.slice(0, 3).map((h) => (
                      <span key={h} className="rounded-md bg-[#F4F8F7] px-2 py-0.5 text-[11px] text-[#0B6E5F] font-semibold border border-[#CFE3DD]">
                        ✦ {h}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Syllabus Preview */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-[#EEF3F1] pt-3 text-xs text-[#4b635e] space-y-1.5 animate-fadeIn">
                      <p className="font-bold text-brand-ink">Curriculum Focus:</p>
                      <p>{p.overview}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-[#EEF3F1] pt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedProgram(isExpanded ? null : p.slug)}
                    className="text-xs font-bold text-[#0E937E] hover:underline"
                  >
                    {isExpanded ? "Hide Details ↑" : "Quick Syllabus ↓"}
                  </button>
                  <Link
                    href={`/programs/${p.slug}`}
                    className="btn-3d btn-3d-mint rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-sm"
                  >
                    Explore →
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 6. Engineering the Neo Sapiens ───────────────────────── */
function NeoSapiensSection() {
  const [activePillar, setActivePillar] = useState<number>(0);

  const pillars = [
    {
      num: "01",
      title: "Aware Mind",
      desc: "Emotional intelligence, mindful focus, and ethical decision-making.",
      metrics: "Conscious observation, internal self-regulation, empathy calibration.",
    },
    {
      num: "02",
      title: "Agile Brain",
      desc: "Rapid information processing, adaptable thinking, and creative problem-solving.",
      metrics: "Spatial speed calculation, divergent thinking, multi-sensory agility.",
    },
    {
      num: "03",
      title: "Authentic Spirit",
      desc: "Self-belief, resilience, confidence, and grounding in India's timeless wisdom.",
      metrics: "Moral leadership, intrinsic motivation, collaborative pride.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#054038] via-[#04332D] to-[#011C18] py-24 text-white">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#2BD6B4]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-brand-teal/20 blur-3xl" />

      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">THE ULTIMATE VISION</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem] text-white">
            Engineering the <span className="text-[#2BD6B4]">Neo Sapiens</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-white/85 leading-relaxed">
            The next evolution of human capability. A learner who is aware of themselves, agile in their thinking, and authentic in their actions.
          </p>
        </ScrollMotion>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2BD6B4]">The 3 Pillars of Neo Sapiens</span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">Nurturing a Complete Human Being</h3>

            <div className="mt-8 space-y-4">
              {pillars.map((p, idx) => {
                const isActive = activePillar === idx;
                return (
                  <button
                    key={p.num}
                    type="button"
                    onClick={() => setActivePillar(idx)}
                    className={`w-full text-left rounded-2xl p-5 backdrop-blur-sm transition-all border ${
                      isActive
                        ? "bg-white/20 border-[#2BD6B4] shadow-lg scale-[1.01]"
                        : "bg-white/10 border-white/15 hover:bg-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl font-black text-[#2BD6B4]">{p.num}</span>
                        <h4 className="text-lg font-bold text-white">{p.title}</h4>
                      </div>
                      <span className="text-xs text-[#2BD6B4] font-semibold">{isActive ? "Active" : "Click to view"}</span>
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed pl-9">{p.desc}</p>
                    {isActive && (
                      <p className="mt-3 text-xs text-[#2BD6B4] pl-9 font-semibold">
                        ✦ Focus Areas: {p.metrics}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative overflow-hidden rounded-3xl border-2 border-[#2BD6B4]/50 shadow-2xl bg-[#042d27] max-w-[380px] w-full">
              <div className="relative h-96 w-full">
                <Image
                  src="/images/uploaded/bmit-hero.png"
                  alt="Engineering the Neo Sapiens - Dr J Arawindhan"
                  fill
                  sizes="380px"
                  className="object-contain p-4"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 inset-x-4 text-center">
                <span className="chip !bg-white/95 !text-brand-deep !font-black !text-xs shadow-md">
                  Engineering Future-Ready Human Beings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 7. The 48-Class Journey, Pathway & Habits ───────────────────────── */
function FortyEightClassJourney() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    { num: "01", name: "ENGAGE", desc: "Capture attention and ignite natural interest.", inClass: "Socratic opening prompt, cognitive curiosity puzzle, and sensory activation." },
    { num: "02", name: "EXPLORE", desc: "Introduce a concept, principle, or real challenge.", inClass: "Hands-on kits, pattern discovery, and collaborative peer observation." },
    { num: "03", name: "PRACTISE", desc: "Strengthen neural understanding through repetition.", inClass: "Timed speed drills, dual-n-back exercises, and memory palace anchors." },
    { num: "04", name: "APPLY", desc: "Use learning in meaningful tasks, codes, and projects.", inClass: "Real-world engineering challenges, creative storytelling, and math tournaments." },
    { num: "05", name: "REFLECT", desc: "Synthesize and internalize what was learned.", inClass: "Self-assessment log, peer articulation, and emotional balance check-in." },
    { num: "06", name: "REINFORCE", desc: "Carry learning and positive habits into everyday life.", inClass: "Take-home 15-minute quantum habit routine and parental reinforcement guide." },
  ];

  const pathways = [
    { year: "Year 01", stage: "FOUNDATION", modules: ["Q-Vision", "Q-Learning", "Q-Mastery"], desc: "Sensory activation, memory palaces, and atomic daily habit systems." },
    { year: "Year 02", stage: "PROGRESSION", modules: ["Q-Creation", "Q-Learning", "Q-Mastery"], desc: "Expanded imagination, creative synthesis, and communication agility." },
    { year: "Year 03", stage: "ADVANCED DEVELOPMENT", modules: ["Q-Way", "Q-Learning", "Q-Mastery"], desc: "Higher-order cognition, holistic thinking, and global leadership." },
  ];

  const habits = [
    { title: "Physically Healthy", icon: "heart", desc: "Energy, posture, and active sensory well-being." },
    { title: "Emotionally Strong", icon: "shield", desc: "Resilience, self-awareness, and emotional balance." },
    { title: "Intellectually Sharp", icon: "brain", desc: "Critical thinking, focus stamina, and memory agility." },
    { title: "Financially Responsible", icon: "rupee", desc: "Understanding value, resourcefulness, and smart choices." },
    { title: "Self-Disciplined", icon: "award", desc: "Consistent execution and pride in daily habits." },
  ];

  return (
    <section className="scroll-mt-20 py-24 bg-[#F4F8F7]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The 48-Class Journey</Kicker>
          <H2>48 Classes. One Continuous Developmental Journey.</H2>
          <p className="mt-4 text-base sm:text-lg text-[#4b635e]">
            48 classes per annum structured into a 6-stage continuous cycle. Learning does not end when the class ends.
          </p>
        </ScrollMotion>

        {/* 6 Stages Interactive Timeline */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((st, idx) => {
            const isActive = activeStage === idx;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`rounded-2xl p-4 text-center transition-all duration-300 border ${
                  isActive
                    ? "bg-[#054038] text-white border-[#2BD6B4] shadow-lg scale-105"
                    : "bg-white text-brand-ink border-[#CFE3DD] hover:border-[#2BD6B4]/60"
                }`}
              >
                <span className={`text-xs font-black ${isActive ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{st.num}</span>
                <h4 className="mt-1 text-base font-extrabold">{st.name}</h4>
                <p className={`mt-1 text-[11px] leading-tight line-clamp-2 ${isActive ? "text-white/80" : "text-[#6b807b]"}`}>{st.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep-Dive Spotlight Card */}
        <div className="mt-6 rounded-3xl bg-white border border-[#2BD6B4]/50 p-7 sm:p-9 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2ECE9] pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0E937E]">Stage 0{activeStage + 1} of 06</span>
              <h4 className="text-2xl font-black text-brand-deep">{stages[activeStage].name}</h4>
            </div>
            <span className="rounded-full bg-brand-teal100 px-4 py-1.5 text-xs font-bold text-[#0B6E5F]">
              Active In Every 60-Minute Class
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b807b]">Stage Purpose</p>
              <p className="mt-1.5 text-base text-brand-ink font-medium leading-relaxed">{stages[activeStage].desc}</p>
            </div>
            <div className="rounded-2xl bg-[#E9F6F3] p-4.5 border border-[#2BD6B4]/30">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#0B6E5F]">Classroom Dynamic</p>
              <p className="mt-1.5 text-base text-brand-deep font-bold leading-relaxed">{stages[activeStage].inClass}</p>
            </div>
          </div>
        </div>

        {/* 3-Year Pathway & Quantum Habits Grid */}
        <div className="mt-18 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <SpotlightCard className="p-8 h-full flex flex-col justify-between shadow-lg">
            <div>
              <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">STRUCTURED PROGRESSION</span>
              <h3 className="mt-4 text-2xl font-extrabold text-brand-ink">The 3-Year Q-School Pathway</h3>
              <div className="mt-6 space-y-4">
                {pathways.map((pw, i) => (
                  <div key={i} className="rounded-2xl border border-[#CFE3DD] bg-[#F7FAF9] p-5 hover:bg-white transition">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-brand-deep">{pw.year} — {pw.stage}</span>
                      <span className="text-xs font-bold text-[#0E937E] bg-brand-teal100 px-3 py-1 rounded-full">48 Classes</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pw.modules.map((m) => (
                        <span key={m} className="rounded-lg bg-white px-3 py-1 text-xs sm:text-[13px] font-bold text-brand-ink border border-[#CFE3DD] shadow-xs">
                          {m}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs sm:text-sm text-[#4b635e] leading-relaxed">{pw.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-8 h-full flex flex-col justify-between shadow-lg">
            <div>
              <span className="chip !px-3.5 !py-1 !text-xs !bg-[#0E937E] !text-white font-bold">DAILY ROUTINES</span>
              <h3 className="mt-4 text-2xl font-extrabold text-brand-ink">Quantum Habits</h3>
              <p className="mt-1.5 text-xs sm:text-sm font-bold text-[#0E937E]">Small Habits. Big Possibilities. Habit → Practice → Growth.</p>
              <div className="mt-6 space-y-3.5">
                {habits.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#EEF3F1] bg-[#FDFCF9] p-4 hover:bg-white hover:border-[#2BD6B4]/50 transition">
                    <span className="icon-3d h-10 w-10 shrink-0 rounded-xl" style={{ ["--c" as string]: "#0E937E" }}>
                      <Icon name={h.icon as IconName} size={20} />
                    </span>
                    <div>
                      <p className="text-base font-bold text-brand-ink">{h.title}</p>
                      <p className="text-xs sm:text-[13px] text-[#5c7772]">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 8. Q-Verse Digital Learning Platform ───────────────────────── */
function QVerseSection() {
  const pillars = [
    { title: "Continuous Learning", desc: "Access session recaps, interactive exercises, and guided home practice anytime." },
    { title: "Parent Visibility", desc: "Transparent progress metrics and mentor observations to stay closely connected." },
    { title: "Mentor Support", desc: "Ongoing developmental touchpoints and habit monitoring beyond classroom hours." },
  ];

  return (
    <section className="scroll-mt-20 py-24 bg-white border-y border-[#E2ECE9]">
      <div className="container-qs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">DIGITAL ECOSYSTEM</span>
            <H2>Q-Verse: Learning Beyond The Physical Classroom</H2>
            <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">
              Q-School combines physical centre learning with the Q-Verse digital platform — giving children and parents a seamless, transparent bridge between classroom practice and daily routine reinforcement.
            </p>
            <div className="mt-8 space-y-4">
              {pillars.map((p, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-[#EEF3F1] bg-[#F7FAF9] p-5 hover:bg-white hover:shadow-md transition">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-deep text-[#2BD6B4] font-bold text-sm">
                    0{i + 1}
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-brand-ink">{p.title}</h4>
                    <p className="mt-1 text-xs sm:text-sm text-[#5c7772] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[#CFE3DD] bg-gradient-to-br from-[#054038] to-[#0A2924] p-8 text-white shadow-xl">
              <span className="rounded-full bg-[#2BD6B4] px-3 py-1 text-xs font-black text-brand-deep">Q-VERSE APP</span>
              <h3 className="mt-4 text-2xl font-extrabold text-white">Transparent Learning Metrics</h3>
              <p className="mt-2 text-sm text-white/80">Every session is benchmarked across the 5D cognitive dimensions.</p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Focus Stamina", val: "94%" },
                  { label: "Speed Recall", val: "+280%" },
                  { label: "Habit Consistency", val: "98%" },
                  { label: "Peer Collaboration", val: "High" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between rounded-xl bg-white/10 p-3 text-xs sm:text-sm">
                    <span className="text-white/85">{m.label}</span>
                    <span className="font-mono font-bold text-[#2BD6B4]">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
            <SpotlightCard spotlightColor="rgba(43, 214, 180, 0.2)" className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300">
              <div>
                <span className="icon-3d h-14 w-14 rounded-2xl" style={{ ["--c" as string]: f.color }}>
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
              <SpotlightCard spotlightColor="rgba(43, 214, 180, 0.2)" className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300">
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
  return (
    <section id="live" className="scroll-mt-20 py-24 bg-white border-y border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {webinars.map((w) => (
            <div key={w.id} className="rounded-2xl border border-[#CFE3DD] p-6 hover:shadow-lg transition">
              <span className="chip !px-2.5 !py-0.5 !text-[11px] !bg-brand-teal100 !text-[#0B6E5F] font-bold">
                {w.date}
              </span>
              <h4 className="mt-3 text-lg font-bold text-brand-ink">{w.title}</h4>
              <p className="mt-2 text-xs text-[#5c7772]">Conducted by {w.by} · {w.duration}</p>
              <Link href="#demo" className="mt-4 inline-block text-xs font-bold text-brand-teal hover:underline">
                Register Free →
              </Link>
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
            <SpotlightCard spotlightColor="rgba(43, 214, 180, 0.2)" className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300">
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

function Testimonials({ c }: { c: HomeContent["testimonials"] }) {
  if (!c.items.length) return null;
  return (
    <section className="bg-white py-24 border-y border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {c.items.map((t, i) => (
            <StaggerItem key={i} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.2)"
                className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <span className="font-hand text-6xl leading-none text-brand-teal500" aria-hidden>
                    &ldquo;
                  </span>
                  {t.rating > 0 && (
                    <div className="-mt-1 mb-3 flex gap-1 text-[#FFC845]" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: Math.round(t.rating) }, (_, k) => (
                        <Icon key={k} name="star" size={16} fill="currentColor" strokeWidth={0} className="drop-shadow-[0_1px_0_rgba(183,121,31,.5)]" />
                      ))}
                    </div>
                  )}
                  <blockquote className="text-base sm:text-[17px] leading-relaxed text-[#2b3d38] font-medium">{t.quote}</blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3.5 border-t border-[#E2ECE9] pt-5">
                  <span className="icon-3d h-11 w-11 rounded-full">
                    <Icon name="users" size={20} />
                  </span>
                  <span className="text-sm">
                    <b className="block text-base font-bold text-brand-ink">{t.who}</b>
                    <span className="text-[#6b807b]">{t.city}</span>
                  </span>
                </figcaption>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

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
      <ScrollMotion variant="blur-in" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          <p className="mt-3 text-base sm:text-lg text-[#4b635e]">
            CONFIDENT LEARNERS · COMPASSIONATE THINKERS · FUTURE-READY LEADERS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:+919944454840"
            className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold shadow-md"
          >
            <Icon name="phone" size={16} /> Central Desk: 99444 54840
          </a>
        </div>
      </ScrollMotion>

      {/* Centre Environment Showcase */}
      <ScrollMotion variant="fade-up" delay={0.1} className="mt-10 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="relative lg:col-span-5 min-h-[260px] lg:min-h-full">
          <Image
            src="/images/uploaded/classroom-centre.jpg"
            alt="Q-School Learning Centre Classroom"
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-1.5 text-xs sm:text-sm font-bold text-brand-deep backdrop-blur-xs shadow-md">
            Purpose-Built Quantum Pods
          </span>
        </div>
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#0E937E] !text-white font-bold">PHYSICAL HUBS</span>
            <h3 className="mt-3.5 text-2xl sm:text-3xl font-extrabold text-brand-ink">State-of-the-Art Quantum Learning Spaces</h3>
            <p className="mt-3 text-base sm:text-[17px] text-[#4b635e] leading-relaxed">
              Designed for sensory activation, ergonomic posture, and deep focus. Every centre features certified Quantum Mentors, low teacher-student ratios (maximum 15 learners per cohort), and dedicated exploration kits.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5 text-xs sm:text-sm font-bold text-brand-deep">
            <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Chennai (Valasaravakkam &amp; Adyar)</span>
            <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Bengaluru (Whitefield &amp; Kasturi Nagar)</span>
            <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Hyderabad, Pune, Trichy, Coimbatore, Pondy</span>
          </div>
        </div>
      </ScrollMotion>

      {/* Interactive City Filter Pills */}
      <div className="mt-12 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#6b807b] mr-2">Filter by City:</span>
        {[
          { id: "all", label: "All 9 Centres" },
          { id: "puducherry", label: "Puducherry (HQ)" },
          { id: "chennai", label: "Chennai (2)" },
          { id: "bengaluru", label: "Bengaluru (2)" },
          { id: "hyderabad", label: "Hyderabad" },
          { id: "trichy", label: "Trichy" },
          { id: "pune", label: "Pune" },
          { id: "coimbatore", label: "Coimbatore" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCity(c.id)}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition ${
              selectedCity === c.id
                ? "bg-brand-deep text-[#2BD6B4] shadow-md"
                : "bg-white border border-[#CFE3DD] text-[#4b635e] hover:bg-[#F4F8F7]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 9 Centres Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {filteredCentres.map((ct, i) => (
          <SpotlightCard
            key={ct.id}
            spotlightColor="rgba(43, 214, 180, 0.18)"
            className="p-7 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="chip !px-3 !py-1 !text-xs !bg-brand-teal100 !text-brand-deep font-extrabold">
                  {ct.city}
                </span>
                <span className="text-xs font-bold text-[#0E937E]">Branch 0{i + 1}</span>
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-brand-ink">{ct.name}</h3>

              <p className="mt-3 text-sm text-[#4b635e] leading-relaxed">
                <Icon name="pin" size={15} className="inline mr-1 text-[#0E937E]" />
                {ct.address}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {ct.batches.map((b) => (
                  <span key={b} className="chip !px-3 !py-1 !text-xs">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-[#EEF3F1] pt-5 flex items-center justify-between gap-2">
              <a
                href={`tel:${ct.phone}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-teal hover:underline"
              >
                <Icon name="phone" size={15} />
                <span>{ct.phone}</span>
              </a>
              <Link
                href="#demo"
                className="btn-3d btn-3d-teal rounded-lg px-4 py-2 text-xs sm:text-sm font-bold"
              >
                Book Visit →
              </Link>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

function Pricing({ c }: { c: HomeContent["pricing"] }) {
  if (!c.plans.length) return null;
  const cols = c.plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : c.plans.length === 2 ? "md:grid-cols-2" : c.plans.length === 1 ? "" : "md:grid-cols-3";
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-24">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <div className={`mt-14 grid grid-cols-1 gap-6 ${cols}`}>
          {c.plans.map((p, i) => (
            <div key={i} className="rounded-3xl border border-[#CFE3DD] p-8 shadow-sm hover:shadow-lg transition">
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
  if (!c.items.length) return null;
  return (
    <section id="faq" className="scroll-mt-20 bg-[#F4F8F7] py-24">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <ScrollMotion variant="fade-up" delay={0.1} className="mx-auto mt-14 max-w-3xl divide-y divide-[#E2ECE9] rounded-3xl bg-white p-6 sm:p-9 shadow-lg border border-[#CFE3DD]">
          <div className="divide-y divide-[#EEF3F1]">
            {c.items.map((f, i) => (
              <details key={i} className="group py-5 first:pt-0 last:pb-0" open={i === 0}>
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold text-brand-ink text-base sm:text-lg">
                  <span>{f.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F4F8F7] text-brand-teal transition-transform duration-300 group-open:rotate-180">
                    <Icon name="chevDown" size={16} />
                  </span>
                </summary>
                <p className="mt-4 whitespace-pre-line pr-8 text-sm sm:text-base leading-relaxed text-[#4b635e] border-t border-[#E2ECE9]/60 pt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </ScrollMotion>
      </div>
    </section>
  );
}

/* ───────────────────────── 10. Interactive Child Cognitive Profiler Widget ───────────────────────── */
function CognitiveProfilerWidget() {
  const [ageGroup, setAgeGroup] = useState<string>("8-11");
  const [focusArea, setFocusArea] = useState<string>("focus");
  const [learningStyle, setLearningStyle] = useState<string>("fast");

  const recommendations: Record<string, { pathway: string; score: string; rationale: string }> = {
    focus: {
      pathway: "Q-5D Cognitive Stamina & Dual-Hemisphere Focus (BMIT)",
      score: "Cognitive Focus Index: 92% Ready",
      rationale: "Targeted sensory activation and concentration drills to build unbreakable 45-minute sustained attention.",
    },
    speed: {
      pathway: "Speed Vedic Ganitham & Neural Pattern Recognition",
      score: "Speed Math Index: 96% Ready",
      rationale: "Multi-step mental arithmetic and visual calculation algorithms eliminating reliance on calculator tools.",
    },
    creativity: {
      pathway: "STEM, Robotics & Shilpa Shastra Divergent Innovation",
      score: "Inventive Potential: 95% Ready",
      rationale: "Hands-on engineering kits combined with classical geometric design to bridge art, logic, and code.",
    },
    confidence: {
      pathway: "Q-Way Leadership & Empathetic Communication",
      score: "Leadership Agility: 90% Ready",
      rationale: "Public articulation, structured debate reasoning, and emotional equilibrium coaching in micro-cohorts.",
    },
  };

  const currentRec = recommendations[focusArea] || recommendations.focus;

  return (
    <section className="container-qs py-12 scroll-mt-20">
      <div className="rounded-3xl bg-gradient-to-br from-[#054038] via-[#04332D] to-[#011C18] p-8 sm:p-12 text-white shadow-2xl border border-[#2BD6B4]/40 relative overflow-hidden">
        <BorderBeam size={300} duration={12} colorFrom="#2BD6B4" colorTo="#0E937E" borderWidth={2} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center">
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">
              INTERACTIVE DIAGNOSTIC
            </span>
            <h3 className="mt-3 text-2xl sm:text-4xl font-black text-white">
              Discover Your Child&apos;s Cognitive Pathway
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Answer 3 quick questions to generate a personalized Q-School developmental recommendation.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Age */}
            <div className="rounded-2xl bg-white/10 p-5 border border-white/15 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase text-[#2BD6B4]">Step 1: Child&apos;s Age</span>
              <div className="mt-3 space-y-2">
                {[
                  { id: "4-7", label: "Ages 4–7 (Early Childhood)" },
                  { id: "8-11", label: "Ages 8–11 (Middle Years)" },
                  { id: "12-16", label: "Ages 12–16 (Adolescence)" },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAgeGroup(a.id)}
                    className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                      ageGroup === a.id ? "bg-[#2BD6B4] text-brand-deep font-bold shadow-md" : "bg-white/10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Primary Focus Needed */}
            <div className="rounded-2xl bg-white/10 p-5 border border-white/15 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase text-[#2BD6B4]">Step 2: Primary Growth Area</span>
              <div className="mt-3 space-y-2">
                {[
                  { id: "focus", label: "Focus & Attention Stamina" },
                  { id: "speed", label: "Speed Math & Memory Retention" },
                  { id: "creativity", label: "Creative Logic & Robotics" },
                  { id: "confidence", label: "Confidence & Articulation" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocusArea(f.id)}
                    className={`w-full text-left rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                      focusArea === f.id ? "bg-[#2BD6B4] text-brand-deep font-bold shadow-md" : "bg-white/10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Current Habit */}
            <div className="rounded-2xl bg-white/10 p-5 border border-white/15 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase text-[#2BD6B4]">Step 3: Learning Pace</span>
              <div className="mt-3 space-y-2">
                {[
                  { id: "distracted", label: "Easily distracted by screens" },
                  { id: "fast", label: "Curious, finishes fast, needs challenge" },
                  { id: "deliberate", label: "Quiet, thoughtful, needs confidence" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLearningStyle(l.id)}
                    className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                      learningStyle === l.id ? "bg-[#2BD6B4] text-brand-deep font-bold shadow-md" : "bg-white/10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic Result Output */}
          <div className="mt-8 rounded-2xl bg-white/15 border border-[#2BD6B4]/60 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#2BD6B4]">
                  Personalized Diagnostic Output
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentRec.pathway}
                </h4>
              </div>
              <span className="rounded-full bg-[#2BD6B4] px-4 py-1.5 text-xs font-black text-brand-deep shadow-md shrink-0">
                {currentRec.score}
              </span>
            </div>
            <p className="mt-4 text-sm sm:text-base text-white/90 leading-relaxed font-medium">
              {currentRec.rationale}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/15">
              <span className="text-xs text-white/70">
                Recommended for {ageGroup} age group across 48 continuous classes.
              </span>
              <a
                href="#demo"
                className="btn-3d btn-3d-mint rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-center shadow-lg"
              >
                Claim This Free Demo Assessment Below ↓
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 11. Final Demo Booking Section ───────────────────────── */
function Demo({ c }: { c: HomeContent["demo"] }) {
  return (
    <section id="demo" className="container-qs scroll-mt-20 py-12">
      <ScrollMotion variant="fade-up">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-16 shadow-2xl border border-white/10">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-teal/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#2BD6B4]/25 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-hand text-2xl sm:text-3xl text-[#2BD6B4]">{c.script}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">{c.title}</h2>
              {c.body && <p className="mt-4 max-w-lg text-base sm:text-lg text-white/85 leading-relaxed">{c.body}</p>}
              <ul className="mt-6 space-y-3">
                {c.points.map((x, i) => (
                  <li key={i} className="flex items-center gap-3 text-base sm:text-[16.5px] text-white/95">
                    <span className="icon-3d h-6 w-6 rounded-full shrink-0" style={{ ["--c" as string]: "#2BD6B4" }}>
                      <Icon name="check" size={14} strokeWidth={3} className="text-brand-deep" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>

              {/* Happy Family Trust Card with Real Image */}
              <div className="mt-7 flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 p-4 max-w-lg backdrop-blur-xs">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#2BD6B4]/50 shadow-sm">
                  <Image
                    src="/images/uploaded/side-family.png"
                    alt="Parent & Child Learning Success"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Trusted by 25,000+ Happy Families</p>
                  <p className="text-xs sm:text-[13px] text-white/75 mt-0.5">Personalized assessment &amp; zero obligation to enrol.</p>
                </div>
              </div>

              {/* Direct counselor callout */}
              <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-5 max-w-lg">
                <p className="text-xs sm:text-sm uppercase tracking-wider text-[#2BD6B4] font-bold">Speak to Our Q-School Counsellor Today</p>
                <div className="mt-3 flex flex-wrap items-center gap-5 text-sm font-bold">
                  <a href="tel:+919944454840" className="hover:text-[#2BD6B4] flex items-center gap-1.5 transition">
                    <Icon name="phone" size={16} /> +91 99444 54840
                  </a>
                  <a href="mailto:info@theqschool.com" className="hover:text-[#2BD6B4] flex items-center gap-1.5 transition">
                    <Icon name="message" size={16} /> info@theqschool.com
                  </a>
                </div>
              </div>
            </div>

            <Tilt max={3} glare={false} className="rounded-3xl">
              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-7 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-9">
                <h3 className="text-xl sm:text-2xl font-bold text-brand-deep">{c.formTitle}</h3>
                {c.formNote && <p className="mb-6 mt-1.5 text-xs sm:text-sm text-[#5c7772]">{c.formNote}</p>}
                <LeadForm source="landing_demo" cta={c.button} />
              </div>
            </Tilt>
          </div>
        </div>
      </ScrollMotion>
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
  demo: (c) => (
    <>
      <CognitiveProfilerWidget />
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
          {/* Weave the brochure narrative seamlessly into the page flow */}
          {s.key === "subjects" && (
            <>
              <StoryAndGenAlpha />
              <PedagogySection />
              <AIvsHI />
              <Framework5D />
            </>
          )}
          {s.key === "programs" && (
            <>
              <NeoSapiensSection />
              <FortyEightClassJourney />
              <QVerseSection />
            </>
          )}
        </div>
      ))}
    </>
  );
}
