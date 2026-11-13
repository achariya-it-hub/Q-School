"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
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
import { ProgramsHorizontalScroll } from "@/components/landing/programs-horizontal-scroll";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";
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

        {(s.trustLearners || s.trustRating || s.windowMeta) && (
          <div
            className="hs-in mt-10 flex flex-wrap items-center gap-x-6 gap-y-4"
            style={{ ["--d" as string]: "360ms" }}
          >
            {s.trustLearners && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {["Asha V", "Rohit S", "Neha J", "Kiran B"].map((n) => (
                    <Avatar key={n} name={n} size={34} className="!ring-brand-deep" />
                  ))}
                </div>
                <p className="text-[13px] leading-tight text-white/85">
                  <b className="block text-[15px] text-white">{s.trustLearners}</b>
                </p>
              </div>
            )}
            {s.trustLearners && s.trustRating && (
              <div className="h-8 w-px bg-white/15 max-sm:hidden" />
            )}
            {s.trustRating && (
              <div>
                <div className="flex gap-0.5 text-[#FFC845]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-1 text-[13px] text-white/85">
                  <b className="text-white">{s.trustRating}</b>
                </p>
              </div>
            )}
            {s.windowMeta && (
              <>
                <div className="h-8 w-px bg-white/15 max-sm:hidden" />
                <div className="flex items-center gap-2 text-[13px] text-white/85">
                  <Icon name="building" size={16} className="text-[#2BD6B4]" />
                  <b className="text-white">{s.windowMeta}</b>
                </div>
              </>
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
        className="pointer-events-none absolute inset-0 z-0 opacity-50"
        particleCount={100}
        speed={0.45}
        colorScheme="teal"
      />
      <QuantumAtomOrbital
        theme="dark"
        size={340}
        className="absolute -left-24 top-12 opacity-45 z-0"
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

/* ───────────────────────── Section 2 — Why Q-School ───────────────────────── */
function Why({ c }: { c: HomeContent["why"] }) {
  if (!c.items.length) return null;
  return (
    <section id="why" className="container-qs scroll-mt-20 py-24">
      <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
        {c.body && (
          <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">
            {c.body}
          </p>
        )}
      </ScrollMotion>
      <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.08}>
        {c.items.map((card, i) => (
          <StaggerItem key={i} className="h-full">
            <SpotlightCard
              spotlightColor="rgba(43, 214, 180, 0.2)"
              className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <span
                  className="icon-3d h-12 w-12 rounded-2xl mb-5 inline-flex items-center justify-center"
                  style={{ ["--c" as string]: card.color || "#0E937E" }}
                >
                  <Icon name={(card.icon as IconName) || "brain"} size={24} />
                </span>
                <h3 className="text-xl font-bold text-brand-ink">{card.title}</h3>
                <p className="mt-3 text-base text-[#5c7772] leading-relaxed">{card.body}</p>
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

/* ───────────────────────── Section 3 — How it works ───────────────────────── */
const HOW_STEP_META: {
  icon: IconName;
  color: string;
  softBg: string;
  phase: string;
  caption: string;
}[] = [
  {
    icon: "sparkle",
    color: "#0E937E",
    softBg: "rgba(14, 147, 126, 0.12)",
    phase: "In Class",
    caption: "Captures attention",
  },
  {
    icon: "eye",
    color: "#5B6CF0",
    softBg: "rgba(91, 108, 240, 0.12)",
    phase: "In Class",
    caption: "Introduces a challenge",
  },
  {
    icon: "brain",
    color: "#0891B2",
    softBg: "rgba(8, 145, 178, 0.12)",
    phase: "In Class",
    caption: "Builds skill through practice",
  },
  {
    icon: "tools",
    color: "#F29A2E",
    softBg: "rgba(242, 154, 46, 0.14)",
    phase: "In Class",
    caption: "Applies it to a real task",
  },
  {
    icon: "bulb",
    color: "#E2557A",
    softBg: "rgba(226, 85, 122, 0.12)",
    phase: "In Class",
    caption: "Ends with reflection",
  },
  {
    icon: "award",
    color: "#059669",
    softBg: "rgba(5, 150, 105, 0.12)",
    phase: "At Home",
    caption: "Guided home practice",
  },
];

function How({ c }: { c: HomeContent["how"] }) {
  const [activeStep, setActiveStep] = useState<number>(0);
  if (!c.steps.length) return null;

  return (
    <section
      id="how"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-[#EDF7F4] via-[#F4FAF8] to-white py-24 border-y border-[#DCECE7]"
    >
      {/* Subtle decorative background accents */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(43, 214, 180, 0.18), transparent 40%), radial-gradient(circle at 85% 80%, rgba(14, 147, 126, 0.14), transparent 45%)",
        }}
        aria-hidden
      />
      <QuantumAtomOrbital
        theme="light"
        size={320}
        className="pointer-events-none absolute -right-24 top-10 opacity-60"
      />

      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0E937E]/25 bg-white/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0E937E] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#2BD6B4] animate-pulse" />
            {c.kicker}
          </span>
          <H2>{c.title}</H2>

          {/* Interactive Flow Pill Strip */}
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-[#CFE3DD] bg-white/85 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#41564f] shadow-sm backdrop-blur">
            {c.steps.map((st, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onMouseEnter={() => setActiveStep(idx)}
                  onClick={() => setActiveStep(idx)}
                  className={`rounded-lg px-2 py-0.5 transition-colors ${
                    activeStep === idx
                      ? "bg-brand-deep text-[#2BD6B4] font-extrabold"
                      : "hover:text-brand-deep"
                  }`}
                >
                  {st.title}
                </button>
                {idx < c.steps.length - 1 && (
                  <span className="text-[#0E937E] font-black" aria-hidden>
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </ScrollMotion>

        {/* Six-step visual pipeline — Wide Rounded-Rectangle 3x2 Grid */}
        <div className="relative mt-12">
          <StaggerContainer
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.07}
          >
            {c.steps.map((st, i) => {
              const meta = HOW_STEP_META[i % HOW_STEP_META.length];
              const isActive = activeStep === i;
              return (
                <StaggerItem key={i} className="h-full">
                  <div
                    onMouseEnter={() => setActiveStep(i)}
                    onClick={() => setActiveStep(i)}
                    className={`group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 ${
                      isActive
                        ? "-translate-y-1 border-[#0E937E] shadow-[0_18px_40px_-16px_rgba(5,64,56,0.22)] ring-2 ring-[#2BD6B4]/35"
                        : "border-[#CFE3DD] shadow-sm hover:-translate-y-1 hover:border-[#0E937E]/60 hover:shadow-lg"
                    }`}
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute inset-x-0 top-0 h-1.5 transition-opacity duration-300"
                      style={{ backgroundColor: meta.color }}
                    />

                    {/* Subtle corner glow */}
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        backgroundColor: meta.softBg,
                        opacity: isActive ? 1 : 0.55,
                      }}
                      aria-hidden
                    />

                    <div>
                      {/* Horizontal Header: 3D Icon + Title & Badges */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span
                            className="icon-3d flex h-13 w-13 shrink-0 items-center justify-center rounded-xl p-3 shadow-md transition-transform duration-300 group-hover:scale-105"
                            style={{ ["--c" as string]: meta.color }}
                          >
                            <Icon name={(st.icon as IconName) || meta.icon} size={24} />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-black tracking-wider transition-colors ${
                                  isActive
                                    ? "bg-brand-deep text-[#2BD6B4]"
                                    : "bg-[#F0F7F5] text-brand-deep"
                                }`}
                              >
                                STEP 0{i + 1}
                              </span>
                              <span
                                className="whitespace-nowrap rounded-md px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                                style={{
                                  backgroundColor: meta.softBg,
                                  color: meta.color,
                                }}
                              >
                                {meta.phase}
                              </span>
                            </div>
                            <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-brand-deep">
                              {st.title}
                            </h3>
                          </div>
                        </div>

                        {i < c.steps.length - 1 && (
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E6F4F0] text-xs font-black text-[#0E937E] transition-transform duration-300 group-hover:translate-x-0.5"
                            aria-hidden
                          >
                            →
                          </span>
                        )}
                      </div>

                      {/* Step Description */}
                      <p className="mt-4 text-sm leading-relaxed text-[#4b635e] font-medium">
                        {st.body || meta.caption}
                      </p>
                    </div>

                    {/* Bottom progress dot indicator */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#EDF4F2] pt-3">
                      <span className="text-xs font-bold text-[#5c7772]">
                        {i === c.steps.length - 1 ? "Weekly Cycle" : `Next: ${c.steps[i + 1].title}`}
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                        style={{ backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Elevated Story & Parent Progress Update Card */}
        <ScrollMotion variant="fade-up" delay={0.15} className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-brand-deep p-7 sm:p-10 text-white shadow-xl border border-[#2BD6B4]/30">
            <BorderBeam size={240} duration={12} colorFrom="#2BD6B4" colorTo="#FFC845" />
            <div
              className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#2BD6B4]/20 blur-3xl"
              aria-hidden
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                  <Icon name="checkCircle" size={14} /> Classroom + Guided Home Practice
                </div>
                <p className="mt-4 text-base sm:text-[17.5px] text-white/95 leading-relaxed font-medium">
                  Each class captures attention, introduces a challenge, builds skill through practice, applies it to a real task, and ends with reflection. Learning continues at home through guided practice, and parents get a weekly progress update on focus, memory, habits and confidence.
                </p>

                {/* Weekly Parent Update Pillars */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70 mr-1">
                    Weekly Parent Update:
                  </span>
                  {["Focus", "Memory", "Habits", "Confidence"].map((metric) => (
                    <span
                      key={metric}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-[#2BD6B4]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FFC845]" />
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              {c.cta?.label && (
                <div className="lg:col-span-4 flex lg:justify-end">
                  <Link
                    href={c.cta.href || "/q-5d-framework"}
                    className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm sm:text-base font-extrabold text-brand-deep shadow-lg"
                  >
                    <span>{c.cta.label}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ScrollMotion>
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

/* ───────────────────────── Section 5 — The 3-year pathway & 5 Short Concept Blocks ───────────────────────── */
function Pricing({ c }: { c: HomeContent["pricing"] }) {
  if (!c.plans.length) return null;
  return (
    <>
      <section id="pathway" className="scroll-mt-20 bg-white py-24 border-t border-[#E2ECE9]">
        <div id="pricing" className="scroll-mt-20" />
        <div className="container-qs">
          <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
          </ScrollMotion>

          {/* 3-year pathway table / cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {c.plans.map((p, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-[#CFE3DD] bg-gradient-to-b from-[#F8FCFB] to-white p-7 sm:p-8 shadow-sm hover:shadow-lg transition"
              >
                <div>
                  <span className="inline-block rounded-full bg-[#E6F4F0] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0E937E]">
                    {p.name}
                  </span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5c7772]">
                    Programs
                  </p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-brand-deep">
                    {p.price}
                  </h3>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5c7772]">
                    Focus
                  </p>
                  <p className="mt-1 text-base font-semibold text-brand-ink">{p.blurb}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Supporting pathway copy & CTA */}
          <ScrollMotion variant="fade-up" delay={0.1} className="mx-auto mt-10 max-w-3xl text-center">
            <div className="space-y-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
              <p>
                Q-Reading, Q-Maths and Q-Science are available as add-ons. Your counsellor will recommend the right starting point for your child&apos;s age and needs.
              </p>
              <p>
                Each year includes 48 classes (about one a week), learning kits, progress assessments and parent reviews.
              </p>
              <p>
                Year 3 ends with a capstone project and a Q-School completion certificate.
              </p>
            </div>
            <div className="mt-8">
              <a
                href="#demo"
                className="btn-3d btn-3d-teal inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold"
              >
                Book a BMIT Assessment
              </a>
            </div>
          </ScrollMotion>
        </div>
      </section>

      <ConceptBlocks />
    </>
  );
}

const RBIQ_ACTIVITIES = [
  {
    num: "01",
    title: "Cup Stacking",
    shortTitle: "Cup Stacking",
    pillar: "Speed & Coordination",
    desc: "Develop hand-eye coordination, focus, speed and accuracy.",
    icon: "clock" as IconName,
    color: "#0E937E",
  },
  {
    num: "02",
    title: "Rubik's Cube Solving",
    shortTitle: "Rubik's Cube",
    pillar: "Logical Thinking",
    desc: "Encourage logical thinking, pattern recognition and problem-solving.",
    icon: "grid" as IconName,
    color: "#5B6CF0",
  },
  {
    num: "03",
    title: "Clairaudience (Auditory Awareness)",
    shortTitle: "Clairaudience",
    pillar: "Auditory Awareness",
    desc: "Strengthen listening skills, sound recognition and auditory attention.",
    icon: "bell" as IconName,
    color: "#0891B2",
  },
  {
    num: "04",
    title: "Parallel Processing",
    shortTitle: "Parallel Processing",
    pillar: "Mental Flexibility",
    desc: "Develop mental flexibility, attention and information processing.",
    icon: "brain" as IconName,
    color: "#F29A2E",
  },
  {
    num: "05",
    title: "Rope Knot",
    shortTitle: "Rope Knot",
    pillar: "Spatial Reasoning",
    desc: "Improve spatial reasoning, fine motor skills and sequential thinking.",
    icon: "tools" as IconName,
    color: "#E2557A",
  },
  {
    num: "06",
    title: "Towel Folding",
    shortTitle: "Towel Folding",
    pillar: "Precision & Organisation",
    desc: "Encourage visual-spatial awareness, precision and organisation.",
    icon: "box" as IconName,
    color: "#10B981",
  },
  {
    num: "07",
    title: "Abacus",
    shortTitle: "Abacus",
    pillar: "Mental Calculation",
    desc: "Build number sense, visualisation and mental calculation skills.",
    icon: "chart" as IconName,
    color: "#D97706",
  },
  {
    num: "08",
    title: "Speed Reading",
    shortTitle: "Speed Reading",
    pillar: "Reading Fluency",
    desc: "Improve reading fluency, visual tracking and comprehension.",
    icon: "book" as IconName,
    color: "#2563EB",
  },
  {
    num: "09",
    title: "Ambidexterity",
    shortTitle: "Ambidexterity",
    pillar: "Bilateral Coordination",
    desc: "Develop bilateral coordination, motor control and hand flexibility.",
    icon: "palette" as IconName,
    color: "#8B5CF6",
  },
];

/* ───────────────────────── 5 Short Concept Blocks (Linking to Separate Pages) ───────────────────────── */
function ConceptBlocks() {
  const [rbiqOption, setRbiqOption] = useState<"option1" | "option2">("option1");
  return (
    <section className="bg-[#F4FAF8] py-20 border-t border-[#E2ECE9]">
      <div className="container-qs space-y-8">
        {/* 1. Our Mission, Our Vision and Founder's Message */}
        <div
          id="mission-vision"
          className="relative overflow-hidden rounded-[34px] border border-[#2BD6B4]/35 bg-gradient-to-br from-[#021B17] via-[#04302A] to-[#021915] p-6 sm:p-10 lg:p-12 text-white shadow-[0_32px_80px_-20px_rgba(3,34,29,0.55)]"
        >
          <BorderBeam size={300} duration={14} colorFrom="#2BD6B4" colorTo="#FFC845" borderWidth={2} />
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#2BD6B4]/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#FFC845]/10 blur-3xl"
            aria-hidden
          />

          {/* Section Header */}
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/35 bg-[#2BD6B4]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#2BD6B4]">
              <Icon name="sparkle" size={14} /> Purpose &amp; Leadership
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-tight text-white">
              Our Mission, Our Vision and{" "}
              <span className="bg-gradient-to-r from-[#2BD6B4] via-[#7CF3DA] to-[#FFD875] bg-clip-text text-transparent">
                Founder&apos;s Message
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
              A brighter future starts with the learner. Q-School helps children build the focus, values and thinking skills that marks alone cannot measure.
            </p>
          </div>

          {/* Dual Cards: OUR MISSION & OUR VISION */}
          <div className="relative z-10 mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            {/* OUR MISSION */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/15 bg-gradient-to-b from-white/[0.10] to-white/[0.04] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#2BD6B4]/60">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/40 bg-[#03221D]/80 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#2BD6B4]">
                    <Icon name="leader" size={14} /> OUR MISSION
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2BD6B4] text-[#03221D] shadow-md">
                    <Icon name="sparkle" size={20} />
                  </span>
                </div>

                <p className="mt-5 text-base sm:text-[17px] leading-relaxed text-white/95 font-medium">
                  To systematically develop every child&apos;s ability to{" "}
                  <strong className="font-extrabold text-[#2BD6B4]">
                    focus, learn, think, create, communicate, adapt, solve and lead
                  </strong>{" "}
                  - equipping them with the human capabilities that remain essential in an AI-driven world.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-5 border-t border-white/10">
                {[
                  "Focus",
                  "Learn",
                  "Think",
                  "Create",
                  "Communicate",
                  "Adapt",
                  "Solve",
                  "Lead",
                ].map((pill, idx) => (
                  <div
                    key={pill}
                    className="flex items-center gap-1.5 rounded-xl border border-[#2BD6B4]/25 bg-[#03221D]/70 px-2.5 py-1.5 text-xs font-bold text-[#B8F5E8]"
                  >
                    <span className="text-[10px] font-black text-[#2BD6B4]">0{idx + 1}</span>
                    <span className="truncate">{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* OUR VISION */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/15 bg-gradient-to-b from-white/[0.10] to-white/[0.04] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#FFC845]/60">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC845]/45 bg-[#03221D]/80 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD875]">
                    <Icon name="globe" size={14} /> OUR VISION
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD875] to-[#F4B63F] text-[#03221D] shadow-md">
                    <Icon name="crown" size={20} />
                  </span>
                </div>

                <p className="mt-5 text-base sm:text-[17px] leading-relaxed text-white/95 font-medium">
                  To be the definitive future-readiness programme for children aged 6–14 recognised nationally as the trusted partner that develops{" "}
                  <strong className="font-extrabold text-[#FFD875]">
                    the learner behind the learning
                  </strong>
                  , and prepares every child, with confidence, for a future we cannot yet fully predict.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2.5 pt-5 border-t border-white/10">
                {[
                  { value: "Ages 6–14", label: "Future-Readiness" },
                  { value: "9 Centres", label: "National Trust" },
                  { value: "Confidence", label: "Learner First" },
                ].map((item) => (
                  <div
                    key={item.value}
                    className="rounded-xl border border-white/15 bg-[#03221D]/70 px-3 py-2 text-center"
                  >
                    <p className="text-xs sm:text-sm font-extrabold text-[#FFD875]">{item.value}</p>
                    <p className="mt-0.5 text-[10.5px] text-white/70">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Founder's Message Showcase */}
          <div className="relative z-10 mt-7 rounded-[26px] border border-[#2BD6B4]/30 bg-[#03221D]/85 p-6 sm:p-9 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC845]/40 bg-[#FFC845]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD875]">
                  <Icon name="award" size={14} /> Founder&apos;s Message
                </span>

                <blockquote className="mt-4 text-lg sm:text-xl lg:text-[22px] font-medium leading-relaxed text-white/95 italic">
                  &ldquo;Education must do more than transfer information.{" "}
                  <span className="not-italic font-extrabold text-[#2BD6B4]">
                    It must develop the human being who receives it.
                  </span>{" "}
                  My vision for Q-School is to help every child discover their strengths, build the habits to use them well, and grow with the confidence to navigate a world that is changing every day.&rdquo;
                </blockquote>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between gap-5 rounded-2xl border border-white/15 bg-white/[0.05] p-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD875] via-[#F4B63F] to-[#D99116] text-lg font-black text-[#03221D] shadow-lg">
                    JA
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-extrabold text-white">
                      - Dr J Arawindhan
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[#9ED8CC] leading-snug">
                      Founder, Chief Mentor &amp; Managing Director, Q-School
                    </p>
                  </div>
                </div>

                <Link
                  href="/our-story"
                  className="inline-flex items-center justify-between rounded-xl border border-[#2BD6B4]/35 bg-[#2BD6B4]/15 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#2BD6B4] hover:bg-[#2BD6B4] hover:text-[#03221D] transition"
                >
                  <span>Read our full story</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Grid for 2, 3, 4, 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2. The Q 5D™ Framework */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-8 shadow-sm">
            <div>
              <Kicker>The Q 5D™ Framework</Kicker>
              <h3 className="mt-2 text-xl sm:text-2xl font-extrabold text-brand-deep">
                One framework. Five dimensions.
              </h3>
              <p className="mt-3 rounded-xl bg-[#F4FAF8] border border-[#E2ECE9] px-4 py-3 text-xs sm:text-sm font-extrabold text-brand-ink">
                Conscious → Deep Learning → Flow and Application → Time → Peak Possibility
              </p>
              <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
                In simple terms: understand, practise, internalise, apply, express.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#EEF3F1]">
              <Link
                href="/q-5d-framework"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-teal hover:text-brand-deep transition"
              >
                Explore the framework →
              </Link>
            </div>
          </div>

          {/* 3. Who Is a Neo Sapiens? */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#CFE3DD] bg-white p-7 sm:p-8 shadow-sm">
            <div>
              <Kicker>Who Is a Neo Sapiens?</Kicker>
              <h3 className="mt-2 text-xl sm:text-2xl font-extrabold text-brand-deep">
                A future-ready learner who can think, adapt, create and lead.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
                At Q-School, we use the term Neo Sapiens for the kind of young person we aim to develop: someone who pairs strong academics with creativity, emotional balance and clear values.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-[#2b3d38]">
                <li>
                  <b className="text-brand-deep">Strong academics:</b> better learning skills and exam confidence
                </li>
                <li>
                  <b className="text-brand-deep">Leadership and character:</b> resilience, ethics and communication
                </li>
                <li>
                  <b className="text-brand-deep">Human skills for the age of AI:</b> original thinking and critical reasoning
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-4 border-t border-[#EEF3F1]">
              <Link
                href="/neo-sapiens"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-teal hover:text-brand-deep transition"
              >
                What is a Neo Sapiens? →
              </Link>
            </div>
          </div>
        </div>

        {/* Q-School Ecosystem Movement Showcase */}
        <div
          id="q-school-ecosystem"
          className="relative overflow-hidden rounded-[34px] border border-[#CFE3DD] bg-white p-6 sm:p-10 lg:p-12 shadow-lg"
        >
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F0] border border-[#BFE0D8] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0E937E]">
              <Icon name="sparkle" size={14} /> BE A PART OF THE Q-SCHOOL MOVEMENT
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-deep">
              BEYOND LEARNING.{" "}
              <span className="text-brand-teal">TOWARDS A BIGGER FUTURE.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
              Different journeys. One vision. A future-ready generation.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                tag: "01. FOR PARENTS",
                desc: "Discover how Q-School can help your child learn better, think bigger and become future-ready.",
                cta: "Explore Your Child's Q-Journey →",
                href: "/q-school-ecosystem?tab=parents#ecosystem-detail-view",
                icon: "users" as IconName,
                color: "#0E937E",
              },
              {
                tag: "02. FOR STUDENTS",
                desc: "Discover your potential. Strengthen your abilities. Become a confident thinker, creator and leader.",
                cta: "Discover Your Potential →",
                href: "/q-school-ecosystem?tab=students#ecosystem-detail-view",
                icon: "sparkle" as IconName,
                color: "#5B6CF0",
              },
              {
                tag: "03. FOR FRANCHISE PARTNERS",
                desc: "Partner with Q-School to bring future-ready learning to more children and build a meaningful education venture.",
                cta: "Explore Franchise Opportunities →",
                href: "/q-school-ecosystem?tab=partners#ecosystem-detail-view",
                icon: "building" as IconName,
                color: "#F29A2E",
              },
            ].map((item) => (
              <div
                key={item.tag}
                className="flex flex-col justify-between rounded-2xl border border-[#DCECE7] bg-gradient-to-b from-[#F9FCFB] to-white p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#0E937E] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-[#E6F4F0] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0E937E]">
                      {item.tag}
                    </span>
                    <span
                      className="icon-3d flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ ["--c" as string]: item.color }}
                    >
                      <Icon name={item.icon} size={19} />
                    </span>
                  </div>
                  <p className="mt-4 text-sm sm:text-base text-[#2b3d38] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EEF3F1]">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-teal hover:text-brand-deep transition"
                  >
                    {item.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RBIQ – Whole Brain Development Program Showcase (Option 1 & Option 2) */}
        <div
          id="rbiq"
          className="relative overflow-hidden rounded-[34px] border border-[#CFE3DD] bg-white p-6 sm:p-10 lg:p-12 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E6F0ED] pb-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F0] border border-[#BFE0D8] px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0E937E]">
                <Icon name="brain" size={14} />{" "}
                {rbiqOption === "option1"
                  ? "RBIQ – Whole Brain Development Program"
                  : "RBIQ – Whole Brain Development"}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-deep">
                Unlock Potential.{" "}
                <span className="text-brand-teal">Engineer Brilliance.</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
                {rbiqOption === "option1"
                  ? "Engaging activities designed to strengthen children's cognitive development, concentration, coordination, memory and problem-solving abilities."
                  : "Engaging activities designed to strengthen children's cognitive abilities, focus, coordination and problem-solving skills."}
              </p>
            </div>

            {/* Option 1 / Option 2 Switcher */}
            <div className="inline-flex rounded-2xl border border-[#CFE3DD] bg-[#F4FAF8] p-1.5 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setRbiqOption("option1")}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                  rbiqOption === "option1"
                    ? "bg-brand-deep text-[#2BD6B4] shadow-sm"
                    : "text-[#4b635e] hover:text-brand-deep"
                }`}
              >
                Option 1: Detailed View
              </button>
              <button
                type="button"
                onClick={() => setRbiqOption("option2")}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                  rbiqOption === "option2"
                    ? "bg-brand-deep text-[#2BD6B4] shadow-sm"
                    : "text-[#4b635e] hover:text-brand-deep"
                }`}
              >
                Option 2: Compact Skills
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg sm:text-xl font-extrabold text-brand-deep mb-5">
              9 Skill-Building Activities
            </h3>

            {rbiqOption === "option1" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {RBIQ_ACTIVITIES.map((act) => (
                  <div
                    key={act.num}
                    className="group rounded-2xl border border-[#DCECE7] bg-gradient-to-b from-[#F9FCFB] to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#0E937E] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="icon-3d flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ ["--c" as string]: act.color }}
                      >
                        <Icon name={act.icon} size={19} />
                      </span>
                      <span className="rounded-lg bg-[#E6F4F0] px-2.5 py-1 text-xs font-black text-[#0E937E]">
                        {act.num}
                      </span>
                    </div>
                    <h4 className="mt-4 text-base sm:text-lg font-extrabold text-brand-deep">
                      {act.num.replace(/^0/, "")}. {act.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#4b635e] leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {RBIQ_ACTIVITIES.map((act) => (
                  <div
                    key={act.num}
                    className="flex items-center gap-3.5 rounded-2xl border border-[#DCECE7] bg-[#F8FCFB] p-4 transition hover:border-[#0E937E] hover:bg-white hover:shadow-sm"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm"
                      style={{ backgroundColor: act.color }}
                    >
                      {act.num}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-brand-deep truncate">
                        {act.shortTitle}
                      </p>
                      <p className="text-xs font-bold text-[#0E937E]">
                        – {act.pillar}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The RBIQ Advantage & CTA Banner */}
          <div className="mt-8 rounded-2xl bg-brand-deep p-6 sm:p-8 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2BD6B4]">
                {rbiqOption === "option1"
                  ? "The RBIQ Advantage"
                  : "Think Better. Learn Better. Grow Stronger."}
              </p>
              {rbiqOption === "option1" && (
                <p className="mt-1.5 text-sm sm:text-base text-white/85 font-medium">
                  Structured activities. Guided practice. Progressive challenges. Meaningful learning experiences.
                </p>
              )}
              <h4 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#FFD875]">
                {rbiqOption === "option1"
                  ? "Give Your Child the Opportunity to Think, Learn and Perform Better."
                  : "Think Better. Learn Better. Grow Stronger."}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/rbiq"
                className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-black text-brand-deep"
              >
                {rbiqOption === "option1" ? "Explore RBIQ" : "Explore RBIQ Programs"} →
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
              >
                Book an Assessment
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Section 6 — What parents say ───────────────────────── */
const TESTIMONIAL_AVATARS = ["Priya R", "Karthik M", "Meera S"];

function Testimonials({ c }: { c: HomeContent["testimonials"] }) {
  if (!c.items.length) return null;
  return (
    <section className="relative overflow-hidden bg-white py-24 border-y border-[#E2ECE9]">
      <QuantumAtomOrbital
        theme="light"
        size={340}
        className="absolute -right-24 top-12 opacity-70"
      />
      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center mb-14">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>

        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {c.items.map((t, i) => {
            const avatarName = TESTIMONIAL_AVATARS[i % TESTIMONIAL_AVATARS.length];
            return (
              <StaggerItem key={i} className="h-full">
                <SpotlightCard
                  spotlightColor="rgba(43, 214, 180, 0.2)"
                  className="flex h-full flex-col justify-between p-7 sm:p-8 hover:shadow-xl transition-all duration-300"
                >
                  <div>
                    {t.rating > 0 && (
                      <div
                        className="flex gap-0.5 text-[#FFC845] mb-4"
                        aria-label={`${t.rating} out of 5 stars`}
                      >
                        {Array.from({ length: Math.round(t.rating) }, (_, k) => (
                          <Icon
                            key={k}
                            name="star"
                            size={15}
                            fill="currentColor"
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                    )}

                    <blockquote className="text-base sm:text-[16.5px] leading-relaxed text-[#2b3d38] font-medium">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </div>

                  <figcaption className="mt-7 flex items-center gap-3 border-t border-[#E2ECE9] pt-5">
                    <Avatar name={avatarName} size={42} />
                    <span className="text-sm">
                      <b className="block text-sm sm:text-base font-extrabold text-brand-ink">
                        {t.who}
                      </b>
                      <span className="text-xs text-[#5c7772] font-semibold">{t.city}</span>
                    </span>
                  </figcaption>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <p className="mt-8 text-center text-xs sm:text-sm text-[#5c7772]">
          Individual results vary.
        </p>
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
  { id: "trichy", label: "Trichy" },
  { id: "pune", label: "Pune" },
  { id: "coimbatore", label: "Coimbatore" },
];

/* ───────────────────────── Section 7 — Centres ───────────────────────── */
function Centres({ c }: { c: HomeContent["centres"] }) {
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const centres = CENTERS;

  const filteredCentres = centres.filter((ct) => {
    if (selectedCity === "all") return true;
    return ct.city.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <section id="centres" className="relative scroll-mt-20 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <QuantumAtomOrbital
          theme="light"
          size={360}
          className="absolute -left-24 top-20 opacity-70"
        />
      </div>
      <QuantumWaveStream theme="light" className="mb-8" />
      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          <p className="mt-3 text-base sm:text-lg text-[#4b635e] leading-relaxed">
            Learn at one of our 9 centres or join a live online cohort from anywhere in India. Batches are limited to 15 children.
          </p>
        </ScrollMotion>

        {/* Animated City Filter Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
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

        {/* 9 Centres Grid */}
        <motion.div layout className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCentres.map((ct) => {
            const cleanTel = ct.phone.replace(/\s+/g, "");
            return (
              <motion.div
                key={ct.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <SpotlightCard
                  spotlightColor="rgba(43, 214, 180, 0.18)"
                  className="h-full flex flex-col justify-between p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#E6F4F0] px-3 py-1 text-xs font-black text-[#0E937E]">
                        {ct.city}
                      </span>
                      <span className="text-xs font-bold text-[#5c7772]">{ct.area}</span>
                    </div>
                    <h3 className="mt-3 text-lg sm:text-xl font-extrabold text-brand-deep">
                      {ct.city} — {ct.area}
                    </h3>
                    <p className="mt-2.5 text-sm text-[#4b635e] leading-relaxed flex items-start gap-2">
                      <Icon name="pin" size={16} className="shrink-0 mt-0.5 text-[#0E937E]" />
                      <span>{ct.address}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#EEF3F1] flex items-center justify-between gap-2">
                    <a
                      href={`tel:${cleanTel}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-brand-teal hover:underline"
                    >
                      <Icon name="phone" size={14} />
                      <span>{ct.phone}</span>
                    </a>
                    <a
                      href="#demo"
                      className="btn-3d btn-3d-teal rounded-lg px-3.5 py-2 text-xs font-bold"
                    >
                      Book a Visit
                    </a>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <p className="text-sm font-semibold text-[#4b635e]">
            Batches: Weekend &amp; weekday evening (confirm per centre).
          </p>
          <div className="mt-5">
            <a
              href="#demo"
              className="btn-3d btn-3d-teal inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold"
            >
              Book a Visit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Section 8 — Frequently asked questions ───────────────────────── */
const FAQ_META: {
  tag: string;
  icon: IconName;
  color: string;
  softBg: string;
}[] = [
  {
    tag: "Why Q-School",
    icon: "sparkle",
    color: "#0E937E",
    softBg: "rgba(14, 147, 126, 0.12)",
  },
  {
    tag: "Ages & Starting Point",
    icon: "users",
    color: "#5B6CF0",
    softBg: "rgba(91, 108, 240, 0.12)",
  },
  {
    tag: "Schedule & Batches",
    icon: "calendar",
    color: "#0891B2",
    softBg: "rgba(8, 145, 178, 0.12)",
  },
  {
    tag: "45-Min Free Demo",
    icon: "eye",
    color: "#F29A2E",
    softBg: "rgba(242, 154, 46, 0.14)",
  },
  {
    tag: "Fees & Enrolment",
    icon: "rupee",
    color: "#E2557A",
    softBg: "rgba(226, 85, 122, 0.12)",
  },
  {
    tag: "Live Online & Centres",
    icon: "globe",
    color: "#059669",
    softBg: "rgba(5, 150, 105, 0.12)",
  },
];

function Faq({ c }: { c: HomeContent["faq"] }) {
  const [openIdx, setOpenIdx] = useState<number>(0);
  const [expandAll, setExpandAll] = useState<boolean>(false);
  if (!c.items.length) return null;

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-[#EDF7F4] via-[#F4FAF8] to-white py-24 border-t border-[#DCECE7]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(43, 214, 180, 0.16), transparent 40%), radial-gradient(circle at 88% 85%, rgba(14, 147, 126, 0.12), transparent 45%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <QuantumAtomOrbital
          theme="light"
          size={320}
          className="absolute -right-20 top-14 opacity-65"
        />
      </div>

      <div className="container-qs relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Sticky Column: Header, Quick Facts & Counsellor Desk */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0E937E]/25 bg-white/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0E937E] shadow-sm">
              <Icon name="help" size={14} /> {c.kicker}
            </span>
            <H2>{c.title}</H2>
            <p className="mt-3 text-sm sm:text-base text-[#4b635e] leading-relaxed">
              Clear answers on how Q-School works alongside your child&apos;s regular school, how batches are structured, and what happens in your free 45-minute demo.
            </p>

            {/* At-a-glance Quick Highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Age Group", val: "6–14 Years", icon: "users" as IconName },
                { label: "Annual Cycle", val: "48 Classes / Yr", icon: "calendar" as IconName },
                { label: "Cohort Size", val: "Up to 15 Learners", icon: "shield" as IconName },
                { label: "First Step", val: "Free 45-Min Demo", icon: "sparkle" as IconName },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-2xl border border-[#CFE3DD] bg-white/95 p-3.5 shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F0] text-[#0E937E]">
                    <Icon name={stat.icon} size={17} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#5c7772]">
                      {stat.label}
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-brand-deep">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Parent Guidance Card */}
            <div className="mt-6 relative overflow-hidden rounded-3xl border border-[#2BD6B4]/30 bg-brand-deep text-white shadow-xl">
              <BorderBeam size={200} duration={11} colorFrom="#2BD6B4" colorTo="#FFC845" />
              <div className="relative h-44 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pic-girl.png"
                  alt="Q-School Young Learner"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/35 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-[#2BD6B4] px-3 py-1 text-[11px] font-black text-[#03221E] shadow-sm">
                  Parent Guidance Desk
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  Not sure which program or year fits your child?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1.5 leading-relaxed">
                  Speak with our counsellor or book a BMIT Assessment. No obligation to enrol.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="#demo"
                    className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black text-brand-deep"
                  >
                    Book a BMIT Assessment →
                  </a>
                  <a
                    href="tel:+919944454840"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
                  >
                    <Icon name="phone" size={14} className="text-[#2BD6B4]" /> +91 99444 54840
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Rich Accordion */}
          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold text-[#4b635e]">
                Showing all <span className="text-brand-deep font-extrabold">{c.items.length}</span> essential parent questions
              </p>
              <button
                type="button"
                onClick={() => setExpandAll((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE3DD] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#0E937E] shadow-sm hover:border-[#0E937E] transition"
              >
                <Icon name={expandAll ? "x" : "plus"} size={13} />
                {expandAll ? "Collapse all" : "Expand all answers"}
              </button>
            </div>

            <div className="space-y-4">
              {c.items.map((f, i) => {
                const meta = FAQ_META[i % FAQ_META.length];
                const isOpen = expandAll || openIdx === i;
                return (
                  <div
                    key={i}
                    className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "bg-white border-[#0E937E] shadow-[0_20px_45px_-18px_rgba(5,64,56,0.2)] ring-2 ring-[#2BD6B4]/30"
                        : "bg-white/95 border-[#CFE3DD] shadow-sm hover:border-[#0E937E]/60 hover:shadow-md"
                    }`}
                  >
                    {/* Left vertical color indicator */}
                    <div
                      className="
                        absolute inset-y-0 left-0 w-1.5 transition-opacity duration-300
                      "
                      style={{
                        backgroundColor: meta.color,
                        opacity: isOpen ? 1 : 0.45,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (expandAll) {
                          setExpandAll(false);
                          setOpenIdx(i);
                        } else {
                          setOpenIdx(openIdx === i ? -1 : i);
                        }
                      }}
                      aria-expanded={isOpen}
                      className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 pl-6 sm:pl-7 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className="icon-3d mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105"
                          style={{ ["--c" as string]: meta.color }}
                        >
                          <Icon name={meta.icon} size={20} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#5c7772]">
                              Question 0{i + 1}
                            </span>
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                              style={{
                                backgroundColor: meta.softBg,
                                color: meta.color,
                              }}
                            >
                              {meta.tag}
                            </span>
                          </div>
                          <span className="block font-extrabold text-brand-deep text-base sm:text-lg leading-snug">
                            {f.q}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? "border-[#0E937E] bg-brand-deep text-[#2BD6B4] rotate-180 shadow-sm"
                            : "border-[#DCECE7] bg-[#F4F8F7] text-brand-teal group-hover:bg-[#E6F4F0]"
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
                          <div className="px-6 sm:px-7 pb-6 pl-6 sm:pl-[4.75rem]">
                            <div className="rounded-2xl bg-[#F6FBF9] border border-[#E2F0EC] p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-[#2b3d38] font-medium">
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
      </div>
    </section>
  );
}

/* ───────────────────────── Section 9 — Final call to action and form ───────────────────────── */
function Demo({ c }: { c: HomeContent["demo"] }) {
  return (
    <section id="demo" className="container-qs scroll-mt-20 py-16">
      <ScrollMotion variant="fade-up">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-16 shadow-2xl border border-[#2BD6B4]/30">
          <BorderBeam size={280} duration={14} colorFrom="#2BD6B4" colorTo="#FFC845" />
          <QuantumAtomOrbital
            theme="dark"
            size={340}
            className="absolute -right-20 -top-20 opacity-50"
          />
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
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">
                {c.title}
              </h2>
              {c.body && (
                <p className="mt-4 max-w-lg text-base sm:text-lg text-white/85 leading-relaxed">
                  {c.body}
                </p>
              )}
              {c.points.length > 0 && (
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
              )}

              {/* Direct Contact Strip */}
              <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-5 max-w-lg backdrop-blur-md">
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  <a href="tel:+919944454840" className="text-[#2BD6B4] hover:underline">
                    +91 99444 54840
                  </a>{" "}
                  (call or WhatsApp) ·{" "}
                  <a href="mailto:info@theqschool.com" className="text-[#2BD6B4] hover:underline">
                    info@theqschool.com
                  </a>{" "}
                  · Mon–Sat, 9am–7pm IST
                </p>
              </div>
            </div>

            <Tilt max={3} glare={false} className="rounded-3xl">
              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-7 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-9">
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
