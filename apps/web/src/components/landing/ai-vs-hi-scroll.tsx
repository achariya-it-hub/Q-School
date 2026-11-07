"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useInView,
} from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface AiVsHiDimension {
  num: string;
  icon: IconName;
  image: string;
  aiCapability: string;
  aiLimit: string;
  hiTitle: string;
  hiSubtitle: string;
  hiDesc: string;
  qschoolPractice: string;
}

const AI_VS_HI_DIMENSIONS: AiVsHiDimension[] = [
  {
    num: "01",
    icon: "brain",
    image: "/images/programs/q-maths.jpg",
    aiCapability: "Processes information at vast speed",
    aiLimit: "Predicts statistical tokens from past data without true comprehension or questioning.",
    hiTitle: "Thinks Critically & Independently",
    hiSubtitle: "First-Principles Reasoning",
    hiDesc:
      "Goes beyond algorithmic patterns to question assumptions, weigh context, and form independent judgements when no template exists.",
    qschoolPractice: "Trained via Socratic inquiry, mental models & multi-path logic labs.",
  },
  {
    num: "02",
    icon: "palette",
    image: "/images/programs/quantum-creation.jpg",
    aiCapability: "Recognises patterns & generates outputs",
    aiLimit: "Remixes existing training datasets into derivative combinations without lived wonder.",
    hiTitle: "Creates, Imagines & Innovates",
    hiSubtitle: "Original Human Spark",
    hiDesc:
      "Births genuinely new artistic, scientific, and conceptual breakthroughs from curiosity, sensory perception, and bold imagination.",
    qschoolPractice: "Trained via right-brain visualization & Quantum Creation studios.",
  },
  {
    num: "03",
    icon: "heart",
    image: "/images/programs/quantum-mastery.jpg",
    aiCapability: "Automates repetitive tasks",
    aiLimit: "Simulates polite phrasing without consciousness, care, or emotional courage.",
    hiTitle: "Understands Emotions & Human Values",
    hiSubtitle: "Empathy & Inner Balance",
    hiDesc:
      "Reads unspoken human feelings, builds deep trust, regulates stress under pressure, and uplifts teams through genuine compassion.",
    qschoolPractice: "Trained via Quantum Mastery emotional strength & reflection circles.",
  },
  {
    num: "04",
    icon: "shield",
    image: "/images/programs/quantum-way.jpg",
    aiCapability: "Supports data-driven decisions",
    aiLimit: "Optimises narrow metrics blindly—unable to bear moral responsibility for human outcomes.",
    hiTitle: "Applies Judgement, Empathy & Responsibility",
    hiSubtitle: "Ethical Leadership",
    hiDesc:
      "Leads with an inner moral compass, wisdom, and accountability—deciding not just what can be done, but what should be done.",
    qschoolPractice: "Trained via Neo Sapiens ethical leadership & real-world team missions.",
  },
];

interface HiMatterPillar {
  name: string;
  icon: IconName;
  outcome: string;
}

const HI_MATTERS_PILLARS: HiMatterPillar[] = [
  {
    name: "Focus",
    icon: "eye",
    outcome: "Deep, distraction-proof attention in an age of infinite notifications.",
  },
  {
    name: "Memory",
    icon: "brain",
    outcome: "Structured mental frameworks ready for instant synthesis and recall.",
  },
  {
    name: "Comprehension",
    icon: "book",
    outcome: "Grasping deep meaning, nuance, and context rather than skimming.",
  },
  {
    name: "Creativity",
    icon: "sparkle",
    outcome: "Inventing fresh possibilities that no prompt or formula can replicate.",
  },
  {
    name: "Emotional Awareness",
    icon: "heart",
    outcome: "Staying grounded, empathetic, and resilient through rapid change.",
  },
  {
    name: "Independent Thinking",
    icon: "bulb",
    outcome: "Using AI as a tool—never surrendering judgement to a machine.",
  },
];

function HiScrollCard({
  item,
  index,
  isActive,
  onActivate,
}: {
  item: AiVsHiDimension;
  index: number;
  isActive: boolean;
  onActivate: (idx: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { margin: "-35% 0px -35% 0px" });

  useEffect(() => {
    if (isInView) {
      onActivate(index);
    }
  }, [isInView, index, onActivate]);

  return (
    <motion.div
      ref={cardRef}
      onClick={() => onActivate(index)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`group relative cursor-pointer overflow-hidden rounded-[28px] border p-6 transition-all duration-500 sm:p-8 ${
        isActive
          ? "border-[#2BD6B4] bg-gradient-to-br from-[#064A40]/95 via-[#053B33]/95 to-[#021E19]/95 shadow-[0_24px_65px_-15px_rgba(43,214,180,0.35)] scale-[1.01]"
          : "border-white/12 bg-white/[0.04] opacity-65 hover:border-white/25 hover:bg-white/[0.07] hover:opacity-95"
      }`}
    >
      {isActive && (
        <BorderBeam size={240} duration={10} colorFrom="#2BD6B4" colorTo="#FFC845" borderWidth={2} />
      )}

      {/* Left Animated Energy Bar */}
      <motion.div
        className="absolute bottom-7 left-0 top-7 w-1.5 rounded-r-full bg-gradient-to-b from-[#2BD6B4] via-[#7BF2DA] to-[#FFC845]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isActive ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{ originY: 0 }}
      />

      <div className="relative z-10 pl-2 sm:pl-3">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-[#2BD6B4] to-[#0E937E] text-[#03221D] shadow-lg"
                  : "bg-white/10 text-[#2BD6B4]"
              }`}
            >
              <Icon name={item.icon} size={21} />
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#2BD6B4]">
                HI Dimension {item.num}
              </span>
              <p className="text-xs font-semibold text-white/65">{item.hiSubtitle}</p>
            </div>
          </div>

          {isActive && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD875]/40 bg-[#FFD875]/15 px-3 py-1 text-[11px] font-extrabold text-[#FFD875]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD875] animate-ping" />
              Human Intelligence Edge
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h4 className="mt-5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {item.hiTitle}
        </h4>
        <p className="mt-2.5 text-sm leading-relaxed text-white/85 sm:text-base">
          {item.hiDesc}
        </p>

        {/* Dual Contrast Boxes: Machine Ceiling vs Q-School Activation */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-400/20 bg-[#041824]/70 p-4">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-sky-300">
              <Icon name="ai" size={14} />
              Where AI Stops
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300/85">
              {item.aiLimit}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2BD6B4]/30 bg-[#032520]/80 p-4">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4]">
              <Icon name="sparkle" size={14} />
              How Q-School Builds It
            </div>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/90">
              {item.qschoolPractice}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AiVsHiSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activePillar, setActivePillar] = useState<number>(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  const ringRotate = useTransform(smoothScroll, [0, 1], [0, 180]);
  const progressBarWidth = `${((activeIndex + 1) / AI_VS_HI_DIMENSIONS.length) * 100}%`;

  const currentDim = AI_VS_HI_DIMENSIONS[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="ai-vs-hi"
      className="relative scroll-mt-20 bg-gradient-to-b from-[#021915] via-[#042E28] to-[#021814] py-24 text-white lg:py-32"
    >
      {/* Contained Background Layer (overflow-hidden kept HERE so CSS sticky works cleanly!) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Left Cool Silicon Glow vs Right Warm Human Intelligence Glow */}
        <div className="absolute -left-32 top-1/4 h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[130px]" />
        <div className="absolute -right-32 top-1/3 h-[560px] w-[560px] rounded-full bg-[#2BD6B4]/15 blur-[140px]" />
        <div className="absolute bottom-16 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[#FFC845]/[0.07] blur-[130px]" />

        {/* Subtle Precision Matrix Grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <div className="container-qs relative z-10">
        {/* ─── PART 1: Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/35 bg-[#2BD6B4]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#2BD6B4]">
            <span className="h-2 w-2 rounded-full bg-[#2BD6B4] animate-ping" />
            AI vs. HI · The Future of Learning
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.45rem] lg:leading-[1.1]">
            <span className="block text-slate-200">AI Can Process.</span>
            <span className="mt-1.5 block bg-gradient-to-r from-[#2BD6B4] via-[#7CF3DA] to-[#FFC845] bg-clip-text text-transparent">
              Human Intelligence Can Transform.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Artificial Intelligence is reshaping how we learn, work, and live. It can process information, recognise patterns, and automate tasks—but{" "}
            <strong className="font-bold text-white">
              human progress depends on empathy, imagination, independent judgement, and ethical decision-making.
            </strong>
          </p>
        </motion.div>

        {/* ─── PART 2: Interactive Dual-Hemisphere Visual Banner (Replaces Blurry Blob!) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="mt-14 overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-r from-[#061A28]/90 via-[#042B26]/95 to-[#063830]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* Left Side: Cold Silicon Computation */}
            <div className="rounded-2xl border border-sky-400/20 bg-[#04131F]/80 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-sky-300">
                  <Icon name="ai" size={14} />
                  Artificial Intelligence (AI)
                </span>
                <span className="font-mono text-xs text-sky-300/70">SILICON · 0101</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  "High-Speed Data Processing",
                  "Statistical Pattern Matching",
                  "Repetitive Task Automation",
                  "Data-Driven Optimization",
                ].map((cap) => (
                  <div
                    key={cap}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-slate-300"
                  >
                    <span className="mr-1.5 text-sky-400">▸</span>
                    {cap}
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Scroll-Rotated Quantum Synergy Core */}
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              <motion.svg
                style={{ rotate: ringRotate }}
                viewBox="0 0 120 120"
                className="absolute inset-0 h-full w-full text-[#2BD6B4]/50"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
                <circle cx="60" cy="6" r="4" fill="#38BDF8" />
                <circle cx="60" cy="114" r="4" fill="#FFC845" />
              </motion.svg>
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-[#2BD6B4]/50 bg-gradient-to-br from-[#054038] to-[#021915] shadow-[0_0_30px_rgba(43,214,180,0.4)]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                  AI
                </span>
                <span className="my-0.5 h-px w-8 bg-white/25" />
                <span className="text-xs font-black uppercase tracking-widest text-[#FFD875]">
                  HI ★
                </span>
              </div>
            </div>

            {/* Right Side: Living Human Intelligence with Authentic Learner Visual */}
            <div className="relative overflow-hidden rounded-2xl border border-[#2BD6B4]/35 bg-gradient-to-br from-[#06453C] to-[#032620] p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#2BD6B4]/60 shadow-lg">
                  <img
                    src="/images/side-brain.png"
                    alt="Human Intelligence Neural Activation"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2BD6B4]/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                    <Icon name="sparkle" size={13} />
                    Human Intelligence (HI)
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-white sm:text-xl">
                    Consciousness, Purpose &amp; Genius
                  </h3>
                  <p className="mt-0.5 text-xs text-white/80">
                    Critical Thought · Imagination · Empathy · Ethical Leadership
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── PART 3: True Sticky Split-Screen Explorer ─── */}
        <div className="mt-16 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Sticky Live Telemetry & Visual Console (5 Cols) */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <div className="overflow-hidden rounded-[30px] border border-white/15 bg-[#03221D]/90 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              {/* Dynamic Crossfading Artwork Window */}
              <div className="relative h-56 w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentDim.image}
                    src={currentDim.image}
                    alt={currentDim.hiTitle}
                    initial={{ opacity: 0.3, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.3 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03221D] via-[#03221D]/35 to-black/25"
                  aria-hidden
                />

                {/* Step Switcher Pills Overlay */}
                <div className="absolute left-5 right-5 top-4 flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    Dimension {currentDim.num} of 04
                  </span>
                  <div className="flex gap-1.5">
                    {AI_VS_HI_DIMENSIONS.map((d, i) => (
                      <button
                        key={d.num}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Select dimension ${d.num}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          i === activeIndex
                            ? "w-7 bg-[#2BD6B4]"
                            : "w-2.5 bg-white/35 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-4 left-6 right-6">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                    Active Comparison Lens
                  </p>
                  <h3 className="mt-0.5 text-xl font-extrabold text-white">
                    {currentDim.hiTitle}
                  </h3>
                </div>
              </div>

              {/* Console Body: Live AI vs HI Comparison Readout */}
              <div className="p-6 sm:p-7">
                {/* Scroll Progress Bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white/65">HI Transformation Progress</span>
                    <span className="text-[#2BD6B4]">{currentDim.num} / 04</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2BD6B4] to-[#FFD875] transition-all duration-500"
                      style={{ width: progressBarWidth }}
                    />
                  </div>
                </div>

                {/* AI Capability on Current Dimension */}
                <div className="rounded-2xl border border-sky-400/20 bg-[#051824]/85 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300">
                      🤖 AI Baseline
                    </span>
                    <span className="rounded-md bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                      Automated
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-white">
                    {currentDim.aiCapability}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300/75">
                    {currentDim.aiLimit}
                  </p>
                </div>

                {/* HI Transformation on Current Dimension */}
                <div className="mt-3.5 rounded-2xl border border-[#2BD6B4]/35 bg-gradient-to-br from-[#06453C] to-[#042B25] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FFD875]">
                      ✦ Q-School HI Mastery
                    </span>
                    <span className="rounded-md bg-[#2BD6B4]/20 px-2 py-0.5 text-[10px] font-bold text-[#2BD6B4]">
                      Irreplaceable
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-white">
                    {currentDim.hiSubtitle}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/85">
                    {currentDim.qschoolPractice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Scrolling Human Intelligence Cards (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            {AI_VS_HI_DIMENSIONS.map((item, index) => (
              <HiScrollCard
                key={item.num}
                item={item}
                index={index}
                isActive={activeIndex === index}
                onActivate={setActiveIndex}
              />
            ))}
          </div>
        </div>

        {/* ─── PART 4: "Why Human Intelligence Matters" Interactive 6-Pillar Stage & Manifesto ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="mt-20 overflow-hidden rounded-[32px] border border-[#2BD6B4]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-7 backdrop-blur-xl sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFD875]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FFD875]">
                Why Human Intelligence Matters
              </span>
              <h3 className="mt-3.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Prepare Your Child to Lead the Future
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                When learning focuses only on memorisation and standardised outcomes, essential human capabilities receive less attention. Q-School nurtures six vital faculties—select any pillar below:
              </p>

              {/* Interactive 6-Pillar Selector */}
              <div className="mt-6 flex flex-wrap gap-2">
                {HI_MATTERS_PILLARS.map((pillar, idx) => {
                  const selected = idx === activePillar;
                  return (
                    <button
                      key={pillar.name}
                      type="button"
                      onMouseEnter={() => setActivePillar(idx)}
                      onClick={() => setActivePillar(idx)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all sm:text-[13px] ${
                        selected
                          ? "bg-[#2BD6B4] text-[#03221D] shadow-[0_8px_24px_rgba(43,214,180,0.4)] scale-[1.03]"
                          : "border border-white/15 bg-white/[0.05] text-white/85 hover:border-[#2BD6B4]/50 hover:bg-white/10"
                      }`}
                    >
                      <Icon name={pillar.icon} size={15} />
                      {pillar.name}
                    </button>
                  );
                })}
              </div>

              {/* Active Pillar Readout */}
              <div className="mt-4 rounded-2xl border border-white/15 bg-[#021B17]/80 p-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={HI_MATTERS_PILLARS[activePillar].name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="text-sm font-medium text-[#B8F5E8]"
                  >
                    <strong className="text-white">
                      {HI_MATTERS_PILLARS[activePillar].name}:
                    </strong>{" "}
                    {HI_MATTERS_PILLARS[activePillar].outcome}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Closing Brochure Quote + Magnetic CTA */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#FFD875]/30 bg-gradient-to-br from-[#053D35] to-[#021915] p-7 text-center shadow-2xl lg:col-span-5 sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD875]/15 text-[#FFD875]">
                <Icon name="crown" size={24} />
              </span>
              <blockquote className="mt-4 text-xl font-extrabold leading-snug text-white sm:text-2xl">
                &ldquo;AI may change the world.{" "}
                <span className="text-[#FFD875]">
                  Human intelligence will shape its future.
                </span>
                &rdquo;
              </blockquote>
              <p className="mt-2.5 text-xs text-white/70 sm:text-sm">
                Helping children aged 6–14 become confident learners, creative thinkers, and responsible future leaders.
              </p>
              <div className="mt-6">
                <MagneticButton href="#demo">
                  Activate Human Intelligence
                </MagneticButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
