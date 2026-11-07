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
import { AiVsHiSection } from "@/components/landing/ai-vs-hi-scroll";
import { FiveDFramework } from "@/components/landing/five-d-stack";
import { ProgramsHorizontalScroll } from "@/components/landing/programs-horizontal-scroll";
import { DiagnosticQuiz } from "@/components/landing/diagnostic-quiz";
import { StorySection } from "@/components/landing/story-section";
import { PedagogySection } from "@/components/landing/pedagogy-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
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
            <MagneticButton href={s.primary.href}>
              {s.primary.label}
            </MagneticButton>
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
/* Extracted into @/components/landing/story-section.tsx (StorySection) */


/* ───────────────────────── 2. Traditional Education vs. Q-School & 10 Core Abilities ───────────────────────── */
/* Extracted into @/components/landing/pedagogy-section.tsx (PedagogySection) */

/* Sections 3 (AI vs HI), 4 (5D Framework), and 5 (8 Programs) are rendered via dedicated interactive modules:
   - AiVsHiSection (Sticky split-screen with in-view scroll lighting & AI contrast)
   - FiveDFramework (Interactive 3D Stacked Card Deck with spring physics)
   - ProgramsHorizontalScroll (Horizontal pinned glide with 3D tilt cards & radial follower)
*/

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
                  src="/images/pic-globe-boy.png"
                  alt="Engineering the Neo Sapiens - Q-School"
                  fill
                  sizes="380px"
                  className="object-cover"
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
            src="/images/bmit-hero.png"
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
                    src="/images/side-family.png"
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
          {/* Weave the brochure narrative seamlessly into the page flow */}
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
              <FortyEightClassJourney />
              <QVerseSection />
            </>
          )}
        </div>
      ))}
    </>
  );
}
