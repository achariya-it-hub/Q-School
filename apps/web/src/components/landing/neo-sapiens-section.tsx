"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";

interface NeoTrait {
  id: string;
  title: string;
  tagline: string;
  icon: IconName;
  color: string;
  desc: string;
  realWorldSign: string;
}

const NEO_TRAITS: NeoTrait[] = [
  {
    id: "01",
    title: "Creative Thinker",
    tagline: "Originality Beyond Templates",
    icon: "palette",
    color: "#2BD6B4",
    desc: "Connects seemingly unrelated ideas, imagines novel possibilities, and approaches every question with fresh curiosity.",
    realWorldSign: "Designs original science models, stories, and solutions without copying examples.",
  },
  {
    id: "02",
    title: "Critical Problem Solver",
    tagline: "First-Principles Reasoning",
    icon: "brain",
    color: "#5B6CF0",
    desc: "Analyses complex challenges calmly, questions surface assumptions, and breaks big problems into clear, solvable steps.",
    realWorldSign: "Tackles unfamiliar Olympiad and application questions with zero panic.",
  },
  {
    id: "03",
    title: "Emotionally Resilient",
    tagline: "Calm Under Pressure",
    icon: "heart",
    color: "#E2557A",
    desc: "Recognises emotions, bounces back quickly from setbacks, and maintains inner composure during exams and competitions.",
    realWorldSign: "Treats mistakes as feedback rather than shutting down or losing confidence.",
  },
  {
    id: "04",
    title: "Confident Communicator",
    tagline: "Clarity, Voice & Empathy",
    icon: "speech",
    color: "#FFC845",
    desc: "Expresses ideas articulately on stage and in groups while listening deeply to understand other perspectives.",
    realWorldSign: "Speaks up in class debates, presentations, and interviews with natural poise.",
  },
  {
    id: "05",
    title: "Ethical Decision-Maker",
    tagline: "Grounded in Values",
    icon: "shield",
    color: "#10B981",
    desc: "Guided by integrity, empathy, and timeless human wisdom when choosing how to act and use technology.",
    realWorldSign: "Chooses honesty, kindness, and responsible digital habits even when unsupervised.",
  },
  {
    id: "06",
    title: "Collaborative Leader",
    tagline: "Elevating Every Team",
    icon: "community",
    color: "#F29A2E",
    desc: "Brings out the best in peers, coordinates shared goals, and leads through service, initiative, and accountability.",
    realWorldSign: "Steps forward naturally in group projects, sports, and school leadership roles.",
  },
  {
    id: "07",
    title: "Globally Aware",
    tagline: "Rooted Yet World-Ready",
    icon: "globe",
    color: "#38BDF8",
    desc: "Appreciates India's knowledge heritage while understanding global challenges, cultures, and interconnected systems.",
    realWorldSign: "Engages thoughtfully with world affairs, sustainability, and cross-cultural ideas.",
  },
  {
    id: "08",
    title: "Future-Ready",
    tagline: "Thriving Alongside AI",
    icon: "sparkle",
    color: "#A78BFA",
    desc: "Adapts rapidly to new tools and shifting landscapes because they have mastered how to learn, unlearn, and create.",
    realWorldSign: "Uses technology as a creative amplifier rather than a passive distraction.",
  },
];

interface NeoPillar {
  num: string;
  kicker: string;
  title: string;
  image: string;
  icon: IconName;
  accent: string;
  desc: string;
  highlights: string[];
}

const NEO_PILLARS: NeoPillar[] = [
  {
    num: "01",
    kicker: "Pillar One · Academic Mastery",
    title: "National-Level Academic Excellence",
    image: "/images/pic-brain-boy.png",
    icon: "award",
    accent: "#2BD6B4",
    desc: "By upgrading focus stamina, reading speed, memory architecture, and visual concept comprehension, children achieve top-tier school and national competitive outcomes without burnout.",
    highlights: [
      "3× faster comprehension & recall without rote cramming",
      "Visual mastery of Q-Maths & whole-brain Q-Science",
      "Calm, structured exam execution & Olympiad readiness",
    ],
  },
  {
    num: "02",
    kicker: "Pillar Two · Character & Voice",
    title: "Become a Global Leader",
    image: "/images/pic-globe-boy.png",
    icon: "globe",
    accent: "#FFC845",
    desc: "True leadership begins within. Q-School nurtures articulate communication, emotional maturity, ethical judgement, and collaborative confidence so children can lead on any global stage.",
    highlights: [
      "Stage presence, structured articulation & active listening",
      "Emotional intelligence, resilience & peer leadership",
      "Rooted in timeless values with a global perspective",
    ],
  },
  {
    num: "03",
    kicker: "Pillar Three · Cognitive Edge",
    title: "A Sharper Brain. An Edge in the Age of AI.",
    image: "/images/side-brain.png",
    icon: "brain",
    accent: "#5B6CF0",
    desc: "In an era where AI automates routine answers, Q-School strengthens whole-brain neuroplasticity, intuitive synthesis, and original thought — giving every child an irreplaceable human edge.",
    highlights: [
      "Dual-hemisphere activation: logic paired with intuition",
      "45-minute unbroken deep attention in a distracted world",
      "Divergent creativity that machines cannot replicate",
    ],
  },
];

export function NeoSapiensSection() {
  const [activeTraitIdx, setActiveTraitIdx] = useState(0);
  const [activePillarIdx, setActivePillarIdx] = useState(0);

  const activeTrait = NEO_TRAITS[activeTraitIdx];

  return (
    <section
      id="neo-sapiens"
      className="relative overflow-hidden bg-gradient-to-b from-[#04352E] via-[#032621] to-[#011815] py-24 md:py-32 text-white border-t border-white/10"
    >
      {/* Ambient Orbital Glows */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[#2BD6B4]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-[#FFC845]/10 blur-3xl"
        aria-hidden
      />

      <div className="container-qs relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFC845]/15 border border-[#FFC845]/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#FFC845]">
            <Icon name="crown" size={14} /> Who Is a Neo Sapiens?
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Engineering the <span className="text-[#2BD6B4]">Neo Sapiens</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed">
            A Neo Sapiens is a future-ready young human being equipped with the cognitive sharpness, emotional strength, creative courage, and ethical grounding to thrive in a rapidly transforming world.
          </p>

          {/* Brochure Mantra Strip: THINK · LEARN · LEAD · CREATE */}
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-white/5 border border-white/15 px-5 py-2.5 backdrop-blur-md">
            {["THINK", "LEARN", "LEAD", "CREATE"].map((word, idx) => (
              <div key={word} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-[#2BD6B4]">
                  {word}
                </span>
                {idx < 3 && <span className="text-[#FFC845] font-black">·</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* PART 1: Interactive 8 Neo Sapiens Traits Explorer */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 8 Pictorial Archetype Tiles (2x4 Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {NEO_TRAITS.map((trait, idx) => {
              const isSelected = idx === activeTraitIdx;
              return (
                <motion.button
                  key={trait.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActiveTraitIdx(idx)}
                  onMouseEnter={() => setActiveTraitIdx(idx)}
                  className={`text-left rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-gradient-to-br from-[#085549] to-[#04332C] border-[#2BD6B4] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#021C18] shadow-md transition-transform"
                    style={{ backgroundColor: trait.color }}
                  >
                    <Icon name={trait.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-white/55">
                        Trait {trait.id}
                      </span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-[#2BD6B4] shadow-[0_0_8px_#2BD6B4]" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5 leading-snug">
                      {trait.title}
                    </h3>
                    <p className="text-xs text-[#2BD6B4] font-semibold mt-0.5">
                      {trait.tagline}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Visual Neo Sapiens Portrait + Active Trait Telemetry Card */}
          <div className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-3xl border border-[#2BD6B4]/40 bg-[#042E28] shadow-2xl flex flex-col justify-between">
              <BorderBeam size={240} duration={12} colorFrom="#2BD6B4" colorTo="#FFC845" />

              {/* Portrait Header with Orbital Halo */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pic-globe-boy.png"
                  alt="Neo Sapiens Future-Ready Learner"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#042E28] via-[#042E28]/30 to-transparent" />

                {/* Rotating Subtle Orbital Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-dashed border-[#2BD6B4]/40"
                  aria-hidden
                />

                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-[#021C18]/85 backdrop-blur-md px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#FFC845] border border-[#FFC845]/40">
                    8 Neo Sapiens Capabilities
                  </span>
                </div>
              </div>

              {/* Dynamic Active Trait Readout */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTrait.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#021C18]"
                        style={{ backgroundColor: activeTrait.color }}
                      >
                        <Icon name={activeTrait.icon} size={15} />
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
                        Active Archetype · {activeTrait.id} / 08
                      </span>
                    </div>

                    <h4 className="text-2xl font-black text-white mt-2">
                      {activeTrait.title}
                    </h4>
                    <p className="text-sm sm:text-base text-white/85 leading-relaxed mt-2">
                      {activeTrait.desc}
                    </p>

                    <div className="mt-4 rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-[11px] font-black uppercase tracking-wider text-[#FFC845]">
                        What You See in Real Life
                      </p>
                      <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium leading-relaxed">
                        {activeTrait.realWorldSign}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* PART 2: Brochure Page 11 — The 3 Pillars of Neo Sapiens */}
        <div className="mt-24 pt-16 border-t border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
              The Three-Fold Outcome
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2">
              The 3 Pillars of <span className="text-[#FFC845]">Neo Sapiens</span>
            </h3>
            <p className="text-sm sm:text-base text-white/75 mt-3">
              Every 48-class annual cycle converges on three concrete, lifelong advantages for your child.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {NEO_PILLARS.map((pillar, idx) => {
              const isFocused = activePillarIdx === idx;
              return (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onMouseEnter={() => setActivePillarIdx(idx)}
                  onClick={() => setActivePillarIdx(idx)}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    isFocused
                      ? "border-[#2BD6B4] bg-gradient-to-b from-[#07473E] to-[#03231E] shadow-[0_24px_60px_rgba(0,0,0,0.5)] -translate-y-1.5"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                >
                  {isFocused && (
                    <BorderBeam
                      size={200}
                      duration={10}
                      colorFrom={pillar.accent}
                      colorTo="#2BD6B4"
                    />
                  )}

                  <div>
                    {/* Pictorial Artwork Header */}
                    <div className="relative h-56 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05352E] via-[#05352E]/30 to-transparent" />

                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-[#021C18] shadow-lg"
                          style={{ backgroundColor: pillar.accent }}
                        >
                          {pillar.num}
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#021C18]/80 backdrop-blur-md text-white border border-white/15">
                          <Icon name={pillar.icon} size={18} />
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-5 right-5">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#2BD6B4]">
                          {pillar.kicker}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 sm:p-7">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                        {pillar.title}
                      </h4>
                      <p className="text-sm text-white/80 leading-relaxed mt-3">
                        {pillar.desc}
                      </p>

                      <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
                        {pillar.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] text-white/90 font-medium"
                          >
                            <Icon
                              name="checkCircle"
                              size={16}
                              className="shrink-0 mt-0.5 text-[#2BD6B4]"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <a
                      href="#demo"
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2BD6B4] group-hover:text-[#FFC845] transition"
                    >
                      Begin Your Child&apos;s Neo Sapiens Journey
                      <Icon name="arrowRight" size={14} />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

