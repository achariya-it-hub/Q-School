"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";
import { QuantumCoreOrb } from "@/components/three/quantum-core-orb";

interface Capacity {
  label: string;
  icon: IconName;
  tagline: string;
  detail: string;
}

const CAPACITIES: Capacity[] = [
  {
    label: "Attention",
    icon: "eye",
    tagline: "Sustained, Calm Concentration",
    detail: "Builds deep 45-minute cognitive stamina and sensory stillness amidst constant digital distractions.",
  },
  {
    label: "Imagination",
    icon: "sparkle",
    tagline: "Right-Brain Visualization",
    detail: "Activates vivid mental imagery, spatial modelling, and creative synthesis beyond rote textbook memorisation.",
  },
  {
    label: "Judgement",
    icon: "shield",
    tagline: "Independent Ethical Discernment",
    detail: "Trains children to question assumptions, weigh consequences, and make wise, value-grounded decisions.",
  },
  {
    label: "Emotional Awareness",
    icon: "heart",
    tagline: "Self-Regulation & Empathy",
    detail: "Cultivates inner balance, empathy, and resilience under academic or social pressure.",
  },
  {
    label: "Self-Belief",
    icon: "crown",
    tagline: "Unshakeable Inner Confidence",
    detail: "Transforms stage fright and hesitation into articulate expression and authentic leadership.",
  },
  {
    label: "Creativity",
    icon: "palette",
    tagline: "Divergent Problem-Solving",
    detail: "Connects seemingly unrelated ideas to invent resourceful, original solutions to unfamiliar challenges.",
  },
  {
    label: "Original Thought",
    icon: "bulb",
    tagline: "First-Principles Thinking",
    detail: "Moves learners from passive consumers of AI answers to independent thinkers who ask transformative questions.",
  },
];

interface GenAlphaTrait {
  icon: IconName;
  title: string;
  desc: string;
  color: string;
  qschoolSuperpower: string;
}

const GEN_ALPHA_TRAITS: GenAlphaTrait[] = [
  {
    icon: "laptop",
    title: "Digitally Native",
    desc: "Comfortable with technology and digital experiences.",
    color: "#0E937E",
    qschoolSuperpower:
      "Transforms passive screen consumption into active creator capability, hands-on spatial thinking, and structured mental models.",
  },
  {
    icon: "sparkle",
    title: "Instantly Stimulated",
    desc: "Accustomed to fast-paced information and immediate responses.",
    color: "#5B6CF0",
    qschoolSuperpower:
      "Channelling high-speed curiosity through engaging right-brain drills, rapid visualization sprints, and deep-focus exercises.",
  },
  {
    icon: "eye",
    title: "Curious Explorers",
    desc: "Thrive on discovery, interaction, and engaging experiences.",
    color: "#F29A2E",
    qschoolSuperpower:
      "Replaces rigid rote memorisation with Socratic inquiry, sensory exploration kits, and hands-on scientific discovery.",
  },
  {
    icon: "heart",
    title: "Unique Learners",
    desc: "Have individual strengths, distinctive interests, and unique learning needs.",
    color: "#E2557A",
    qschoolSuperpower:
      "Individualised mentor guidance, personalised pace calibration, and psychological safety in cohorts capped at 15 learners.",
  },
  {
    icon: "planet",
    title: "Future-Driven",
    desc: "Need the ability to think independently, adapt, and solve problems.",
    color: "#054038",
    qschoolSuperpower:
      "Embeds ethical judgement, emotional strength, and original multi-solution thinking for a future we cannot yet fully predict.",
  },
];

const MISSION_PILLS = ["Focus", "Learn", "Think", "Create", "Communicate", "Adapt", "Solve", "Lead"];

export function StorySection() {
  const [activeCapacity, setActiveCapacity] = useState<number>(0);
  const [activeTrait, setActiveTrait] = useState<number>(0);

  const selectedCap = CAPACITIES[activeCapacity];
  const selectedTrait = GEN_ALPHA_TRAITS[activeTrait];

  return (
    <section
      id="story"
      className="relative scroll-mt-20 overflow-hidden border-y border-[#DCEBE6] bg-gradient-to-b from-[#F3FAF8] via-white to-[#EEF7F4] py-24 lg:py-32"
    >
      {/* Crisp Architectural Background Grid & Soft Ambient Light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(#B8DDD4 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#2BD6B4]/15 via-[#0E937E]/10 to-[#5B6CF0]/10 blur-3xl"
        aria-hidden
      />

      <div className="container-qs relative z-10">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0E937E]/25 bg-white/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B6E5F] shadow-xs backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-[#0E937E] animate-pulse" />
            The Q-School Story
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#05332C] sm:text-5xl lg:text-[3.15rem] lg:leading-[1.12]">
            A Brighter Future Starts{" "}
            <span className="relative inline-block bg-gradient-to-r from-[#054038] via-[#0E937E] to-[#17B899] bg-clip-text text-transparent">
              With the Learner
              <svg
                viewBox="0 0 320 12"
                className="pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M4 9C85 2 220 2 316 8"
                  fill="none"
                  stroke="#2BD6B4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="mt-6 text-base leading-relaxed text-[#425B55] sm:text-lg lg:text-[19px]">
            Every generation of parents has asked the same question in a different way:{" "}
            <strong className="rounded-md bg-[#E4F6F1] px-2 py-0.5 font-bold text-[#054038]">
              what will my child need to thrive?
            </strong>{" "}
            For children growing up alongside smartphones, artificial intelligence, and constant change, the answer is evolving faster than any curriculum can keep pace.
          </p>
        </motion.div>

        {/* ─── BLOCK 1: The Paradigm Shift (Asymmetric Visual + Interactive Capacities Bento) ─── */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Left Visual Showcase Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="group relative flex h-full min-h-[440px] flex-col justify-between overflow-hidden rounded-[28px] border border-[#0E937E]/25 bg-[#042E28] p-6 text-white shadow-[0_24px_60px_-18px_rgba(5,64,56,0.28)] sm:p-7">
              {/* Full-bleed High-Res Q-School Visual */}
              <img
                src="/images/bmit-hero.png"
                alt="Q-School learners exploring quantum concepts together"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {/* Multi-stop Cinematic Gradient Overlay */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#021C18] via-[#042E28]/45 to-[#042E28]/25"
                aria-hidden
              />

              {/* Top Floating Status Bar */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#054038]/80 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4] backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#2BD6B4] animate-ping" />
                  Human Intelligence First
                </span>
                <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
                  Ages 6–14 Yrs
                </span>
              </div>

              {/* Bottom Glassmorphic Info Dock */}
              <div className="relative z-10 mt-auto pt-36">
                <div className="rounded-2xl border border-white/20 bg-[#042B25]/85 p-4.5 shadow-xl backdrop-blur-xl sm:p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#2BD6B4]/50 shadow-md">
                      <img
                        src="/images/pic-girl.png"
                        alt="Young Neo Sapiens learner"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                        Structured Journey
                      </p>
                      <p className="text-base font-extrabold leading-snug text-white">
                        48 Classes Per Annum
                      </p>
                      <p className="mt-0.5 text-xs text-white/75">
                        Individualised mentor guidance · Max 15 per cohort
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Interactive Shift & Capacities Card (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-[#CDE3DD] bg-white p-7 shadow-[0_20px_55px_-20px_rgba(5,64,56,0.12)] sm:p-10">
              {/* Subtle Corner Glow */}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#2BD6B4]/15 blur-3xl"
                aria-hidden
              />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F7F3] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#096A5B]">
                    The Shift
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A7670]">
                    Modern Cognitive Science × Indic Wisdom
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-[#05332C] sm:text-3xl">
                  Beyond Competing with Machines
                </h3>

                <p className="mt-3.5 text-base leading-relaxed text-[#46605A] sm:text-[16.5px]">
                  Q-School (The Quantum Schooling) was created to respond to that shift —{" "}
                  <strong className="font-bold text-[#05332C]">
                    not by teaching children to compete with machines
                  </strong>
                  , but by deliberately developing the 7 human capacities that remain irreplaceable:
                </p>

                {/* Interactive 7 Capacities Selector */}
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {CAPACITIES.map((cap, idx) => {
                      const active = idx === activeCapacity;
                      return (
                        <button
                          key={cap.label}
                          type="button"
                          onMouseEnter={() => setActiveCapacity(idx)}
                          onClick={() => setActiveCapacity(idx)}
                          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-[13px] font-bold transition-all duration-200 ${
                            active
                              ? "bg-[#054038] text-white shadow-[0_8px_20px_-4px_rgba(5,64,56,0.4)] scale-[1.03]"
                              : "bg-[#F3FAF8] text-[#14463E] border border-[#D3E7E1] hover:border-[#0E937E] hover:bg-[#E7F6F2]"
                          }`}
                        >
                          <span className={active ? "text-[#2BD6B4]" : "text-[#0E937E]"}>
                            <Icon name={cap.icon} size={15} />
                          </span>
                          {cap.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Animated Active Capacity Spotlight */}
                  <div className="mt-4 min-h-[92px] rounded-2xl border border-[#BCE4DA] bg-gradient-to-r from-[#EFFAF7] via-[#F6FCFA] to-white p-4 sm:p-5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedCap.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-3.5"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#054038] text-[#2BD6B4] shadow-sm">
                          <Icon name={selectedCap.icon} size={20} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-[#05332C] sm:text-base">
                              {selectedCap.label}
                            </h4>
                            <span className="rounded-full bg-[#2BD6B4]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#086355]">
                              {selectedCap.tagline}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#46605A] sm:text-sm">
                            {selectedCap.detail}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Synthesis Footer */}
              <div className="relative z-10 mt-6 border-t border-[#E4F0EC] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#4E6862]">
                  Uniting contemporary learning methods, cognitive-development practices, and timeless principles inspired by <strong className="font-semibold text-[#054038]">India&apos;s knowledge traditions</strong>.
                </p>
                <a
                  href="#programs"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0E937E] hover:text-[#054038] transition"
                >
                  Explore 8 Programs <Icon name="arrowRight" size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── BLOCK 2: Founder's Message + Mission & Vision Bento (Zero Dead Space!) ─── */}
        <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Left: Luxury Editorial Founder's Message Card (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-[#2BD6B4]/35 bg-gradient-to-br from-[#054038] via-[#04322C] to-[#021B17] p-8 text-white shadow-[0_25px_65px_-18px_rgba(4,45,39,0.45)] sm:p-10">
              <BorderBeam size={260} duration={11} colorFrom="#2BD6B4" colorTo="#FFC845" borderWidth={2} />

              {/* Subtle Architectural Rings Watermark */}
              <svg
                viewBox="0 0 400 400"
                className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 text-[#2BD6B4]/10"
                fill="none"
                aria-hidden
              >
                <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="200" cy="200" r="135" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" />
              </svg>

              {/* Top Header: Eyebrow + Contained 3D Quantum Orb Medallion */}
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/30 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#2BD6B4] backdrop-blur-xs">
                  <Icon name="sparkle" size={14} />
                  Founder&apos;s Message
                </div>

                {/* Neatly Docked 3D Quantum Orb Emblem (Never overlaps quote!) */}
                <div className="relative hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xs overflow-hidden">
                  <div className="h-24 w-24 pointer-events-none">
                    <QuantumCoreOrb />
                  </div>
                </div>
              </div>

              {/* Editorial Quote Body */}
              <div className="relative z-10 my-6">
                <span
                  className="block font-serif text-6xl leading-none text-[#2BD6B4]/40 select-none"
                  aria-hidden
                >
                  &ldquo;
                </span>
                <blockquote className="-mt-4 text-lg font-medium leading-[1.68] text-white/95 sm:text-xl lg:text-[21.5px]">
                  Education must do more than transfer information. It must develop the human being who receives it. My vision for Q-School is to help every child discover their strengths, build the habits to use them well, and grow with the confidence to navigate a world that is changing every day.
                </blockquote>
              </div>

              {/* Founder Attribution Bar */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BD6B4] to-[#0E937E] text-lg font-black text-[#032520] shadow-lg ring-2 ring-white/20">
                    JA
                  </div>
                  <div>
                    <p className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                      Dr J Arawindhan
                    </p>
                    <p className="text-xs sm:text-sm text-[#A5D8CD]">
                      Founder, Chief Mentor &amp; Managing Director, Q-School
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFC845]/35 bg-[#FFC845]/10 px-3.5 py-2 text-xs font-bold text-[#FFD875]">
                  <Icon name="award" size={15} />
                  Engineering the Neo Sapiens
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Stacked Mission & Vision Bento Cards (5 Cols — Balanced Height, Zero Empty Void) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex flex-col justify-between gap-6 lg:col-span-5"
          >
            {/* Card 01: OUR MISSION */}
            <div className="group relative flex-1 overflow-hidden rounded-[26px] border border-[#CBE3DC] bg-white p-6 shadow-[0_16px_40px_-18px_rgba(5,64,56,0.12)] transition-all duration-300 hover:border-[#0E937E] hover:shadow-[0_20px_50px_-16px_rgba(14,147,126,0.2)] sm:p-7">
              <div className="absolute right-5 top-5 text-4xl font-black text-[#0E937E]/10 transition-colors group-hover:text-[#0E937E]/20">
                01
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#054038] to-[#0E937E] text-[#2BD6B4] shadow-md">
                  <Icon name="leader" size={20} />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0E937E]">
                    Purpose &amp; Action
                  </p>
                  <h3 className="text-lg font-extrabold text-[#05332C] sm:text-xl">Our Mission</h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#445E58] sm:text-[15px]">
                To systematically develop every child&apos;s ability to focus, learn, think, create, communicate, adapt, solve and lead — equipping them with the human capabilities that remain essential in an AI-driven world.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {MISSION_PILLS.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-md bg-[#EBF7F4] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#096A5B]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 02: OUR VISION */}
            <div className="group relative flex-1 overflow-hidden rounded-[26px] border border-[#BDE0D6] bg-gradient-to-br from-[#E9F8F4] via-[#F2FBF8] to-white p-6 shadow-[0_16px_40px_-18px_rgba(5,64,56,0.12)] transition-all duration-300 hover:border-[#0E937E] hover:shadow-[0_20px_50px_-16px_rgba(14,147,126,0.2)] sm:p-7">
              <div className="absolute right-5 top-5 text-4xl font-black text-[#054038]/10 transition-colors group-hover:text-[#054038]/20">
                02
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0E937E] to-[#2BD6B4] text-[#032822] shadow-md">
                  <Icon name="globe" size={20} />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#096A5B]">
                    National Benchmark
                  </p>
                  <h3 className="text-lg font-extrabold text-[#05332C] sm:text-xl">Our Vision</h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#3B554F] sm:text-[15px]">
                To be the definitive future-readiness programme for children aged 6–14 recognised nationally as the trusted partner that develops <strong className="font-bold text-[#05332C]">the learner behind the learning</strong>, and prepares every child, with confidence, for a future we cannot yet fully predict.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── BLOCK 3: Gen Alpha & The New-Age Parenting Challenge ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="mt-12 overflow-hidden rounded-[32px] border border-[#CCE2DC] bg-white p-7 shadow-[0_24px_65px_-22px_rgba(5,64,56,0.14)] sm:p-11"
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Authentic Neural Learner Visual Showcase */}
            <div className="relative lg:col-span-5">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#CDE3DD] bg-[#042E28] shadow-xl">
                <img
                  src="/images/side-brain.png"
                  alt="Generation Alpha learner activating neural pathways at Q-School"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03241F]/80 via-transparent to-transparent"
                  aria-hidden
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-extrabold text-[#054038] shadow-md">
                    Generation Alpha · Ages 6–14
                  </span>
                  <span className="rounded-full bg-[#2BD6B4] px-3 py-1 text-[11px] font-black text-[#032520]">
                    Whole-Brain Activation
                  </span>
                </div>
              </div>
            </div>

            {/* Gen Alpha Narrative & Parenting Quote */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#054038] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                Understanding Gen Alpha
              </span>
              <h3 className="mt-3.5 text-2xl font-extrabold tracking-tight text-[#05332C] sm:text-3xl lg:text-[2.1rem] lg:leading-[1.18]">
                A New Generation. A New World.{" "}
                <span className="text-[#0E937E]">A New Way to Learn.</span>
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-[#46605A] sm:text-[17px]">
                Born into a digitally connected world, Generation Alpha is growing up alongside artificial intelligence, smart technology, and rapid global change. Their future demands more than academic memorisation — it calls for adaptability, creativity, critical thinking, and emotional intelligence.
              </p>

              {/* New-Age Parenting Challenge Callout */}
              <div className="mt-5 flex items-start gap-4 rounded-2xl border border-[#2BD6B4]/40 bg-gradient-to-r from-[#E9F8F4] to-[#F5FCFA] p-5">
                <div className="relative hidden sm:block h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#0E937E]/30 shadow-xs">
                  <img
                    src="/images/workshop.png"
                    alt="Parent and child learning together"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#0E937E]">
                    The New-Age Parenting Question
                  </p>
                  <p className="mt-1 text-sm font-bold italic text-[#05332C] sm:text-base">
                    &ldquo;My child is growing up in a world I never experienced. Am I preparing them for the future they will inherit?&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-[#48635D] sm:text-[13.5px]">
                    The answer lies in nurturing the child beyond textbooks and technology.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 5 Gen Alpha Traits Explorer */}
          <div className="mt-10 border-t border-[#E4F0EC] pt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0E937E] sm:text-[13px]">
                Explore the 5 Gen Alpha Traits &amp; Q-School&apos;s Response
              </p>
              <span className="text-xs font-semibold text-[#647F79]">
                Select any card below
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {GEN_ALPHA_TRAITS.map((t, idx) => {
                const isActive = activeTrait === idx;
                return (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => setActiveTrait(idx)}
                    className={`group rounded-2xl p-4 text-left transition-all duration-300 border ${
                      isActive
                        ? "bg-[#054038] text-white border-[#054038] shadow-[0_12px_28px_-6px_rgba(5,64,56,0.35)] -translate-y-0.5"
                        : "bg-[#F6FBF9] text-[#05332C] border-[#D5E8E2] hover:bg-white hover:border-[#0E937E]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isActive ? "bg-white/15 text-[#2BD6B4]" : "icon-3d"
                      }`}
                      style={!isActive ? { ["--c" as string]: t.color } : undefined}
                    >
                      <Icon name={t.icon} size={20} />
                    </span>
                    <h4 className={`mt-3 text-sm font-extrabold sm:text-[15px] ${isActive ? "text-white" : "text-[#05332C]"}`}>
                      {t.title}
                    </h4>
                    <p className={`mt-1 text-xs line-clamp-2 leading-relaxed ${isActive ? "text-white/80" : "text-[#5C7670]"}`}>
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Animated Active Trait Transformation Spotlight */}
            <div className="mt-5 rounded-2xl border border-[#BCE4DA] bg-gradient-to-r from-[#EFFAF7] via-white to-[#EFFAF7] p-5 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTrait.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
                      style={{ backgroundColor: selectedTrait.color }}
                    >
                      <Icon name={selectedTrait.icon} size={21} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black uppercase tracking-wider text-[#0B6E5F]">
                          Q-School Pedagogical Advantage · {selectedTrait.title}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-[#05332C] sm:text-base">
                        {selectedTrait.qschoolSuperpower}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 self-start sm:self-center rounded-full bg-[#054038]/8 px-3 py-1 text-xs font-extrabold text-[#054038]">
                    0{activeTrait + 1} / 05
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
