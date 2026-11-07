"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";

interface Dimension {
  id: string;
  order: string;
  flowVerb: string;
  title: string;
  subtitle: string;
  icon: IconName;
  image: string;
  color: string;
  accentHex: string;
  desc: string;
  drills: string;
  outcome: string;
  metric: string;
}

const DIMENSIONS: Dimension[] = [
  {
    id: "X",
    order: "1st Dimension",
    flowVerb: "UNDERSTAND",
    title: "CONSCIOUS",
    subtitle: "Focus & Understand",
    icon: "eye",
    image: "/images/programs/quantum-vision.jpg",
    color: "from-[#0E937E] to-[#2BD6B4]",
    accentHex: "#2BD6B4",
    desc: "Attention, observation, and conscious engagement with learning. Builds high cognitive stamina, sensory clarity, and active listening.",
    drills: "Dual-n-back sensory drills, Tratak concentration focus, and 45-minute unbroken attention blocks.",
    outcome: "Filters out digital noise and screen fatigue; cultivates calm, laser-sharp focus.",
    metric: "45-Min Deep Focus",
  },
  {
    id: "Y",
    order: "2nd Dimension",
    flowVerb: "PRACTISE",
    title: "DEEP LEARNING",
    subtitle: "Practise & Internalise",
    icon: "brain",
    image: "/images/programs/quantum-learning.jpg",
    color: "from-[#5B6CF0] to-[#8B5CF6]",
    accentHex: "#8B5CF6",
    desc: "Deliberate repetition, neural reinforcement, and skill internalisation through multi-sensory experiential drills.",
    drills: "Memory palace loci navigation, visual association matrices, and right-brain chunking exercises.",
    outcome: "Anchors mental frameworks permanently without stressful exam-eve rote cramming.",
    metric: "3× Long-Term Recall",
  },
  {
    id: "Z",
    order: "3rd Dimension",
    flowVerb: "INTERNALISE",
    title: "FLOW & APPLICATION",
    subtitle: "Apply Naturally in Flow",
    icon: "palette",
    image: "/images/programs/quantum-creation.jpg",
    color: "from-[#F29A2E] to-[#FFC845]",
    accentHex: "#FFC845",
    desc: "Applying and expressing internalised concepts naturally, intuitively, and confidently in unfamiliar real-world scenarios.",
    drills: "Inventive STEM & design challenges, lateral logic riddles, and collaborative cross-disciplinary builds.",
    outcome: "Transforms classroom knowledge into effortless, spontaneous creative problem-solving.",
    metric: "Zero-Hesitation Flow",
  },
  {
    id: "T",
    order: "4th Dimension",
    flowVerb: "APPLY",
    title: "TIME",
    subtitle: "Speed, Fluency & Efficiency",
    icon: "clock",
    image: "/images/programs/quantum-reading.jpg",
    color: "from-[#E2557A] to-[#EC4899]",
    accentHex: "#F472B6",
    desc: "Developing cognitive velocity, reading fluency, personal organisation, rapid information synthesis, and time mastery.",
    drills: "High-speed mental Q-Maths sprints, Quantum Reading visual sweeps, and timed conceptual articulation.",
    outcome: "Multiplies reading and computation speed while preserving 90%+ comprehension accuracy.",
    metric: "3× Processing Speed",
  },
  {
    id: "P",
    order: "5th Dimension",
    flowVerb: "EXPRESS",
    title: "PEAK POSSIBILITY",
    subtitle: "Potential in Action",
    icon: "crown",
    image: "/images/pic-globe-boy.png",
    color: "from-[#2BD6B4] to-[#FFC845]",
    accentHex: "#2BD6B4",
    desc: "Creative confidence, ethical leadership, moral courage, and bringing out peak human potential in oneself and peers.",
    drills: "Neo Sapiens capstone innovation showcases, ethical dilemma circles, and stage articulation.",
    outcome: "Graduates resilient, articulate young leaders grounded in timeless human values.",
    metric: "Neo Sapiens Leadership",
  },
];

interface InterconnectedIntelligence {
  num: string;
  title: string;
  subtitle: string;
  icon: IconName;
  image: string;
  accent: string;
  desc: string;
}

const INTELLIGENCE_PILLARS: InterconnectedIntelligence[] = [
  {
    num: "01",
    title: "Cognitive Intelligence",
    subtitle: "Think · Analyse · Recall",
    icon: "brain",
    image: "/images/side-brain.png",
    accent: "#2BD6B4",
    desc: "Sharpens analytical reasoning, memory palaces, pattern recognition, and mental agility across subjects.",
  },
  {
    num: "02",
    title: "Sensory & Perceptual",
    subtitle: "Observe · Sense · Absorb",
    icon: "eye",
    image: "/images/programs/quantum-vision.jpg",
    accent: "#5B6CF0",
    desc: "Awakens peripheral vision, auditory precision, kinesthetic balance, and deep observational clarity.",
  },
  {
    num: "03",
    title: "Creative Intelligence",
    subtitle: "Imagine · Synthesise · Invent",
    icon: "palette",
    image: "/images/programs/quantum-creation.jpg",
    accent: "#FFC845",
    desc: "Unlocks divergent thinking, visual storytelling, and original connections that algorithms cannot replicate.",
  },
  {
    num: "04",
    title: "Emotional Intelligence",
    subtitle: "Regulate · Empathise · Connect",
    icon: "heart",
    image: "/images/side-family.png",
    accent: "#E2557A",
    desc: "Builds calm composure under exam pressure, empathy for peers, and authentic interpersonal confidence.",
  },
  {
    num: "05",
    title: "Conscious Awareness",
    subtitle: "Reflect · Choose · Lead",
    icon: "sparkle",
    image: "/images/bmit-hero.png",
    accent: "#10B981",
    desc: "Cultivates mindful presence, ethical judgement, self-discipline, and purposeful daily habits.",
  },
];

export function FiveDFramework() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeIntel, setActiveIntel] = useState(0);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % DIMENSIONS.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + DIMENSIONS.length) % DIMENSIONS.length);

  const activeDim = DIMENSIONS[activeIndex];

  return (
    <section
      id="framework"
      className="relative bg-gradient-to-b from-[#03221E] via-[#042D27] to-[#021B17] py-24 md:py-32 overflow-hidden text-white border-y border-white/10"
    >
      {/* Ambient Neural Grid & Halos */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(43,214,180,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(43,214,180,0.5) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#0E937E]/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-[#2BD6B4]/15 blur-3xl" aria-hidden />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-[#2BD6B4] font-black tracking-widest text-xs uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
            <Icon name="sparkle" size={14} /> Proprietary Learning Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            The <span className="text-[#2BD6B4]">Q 5D™ XYZTP</span> Framework
          </h2>
          <p className="text-white/80 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            One unified architecture. Five progressive dimensions orchestrating every child&apos;s journey from conscious attention to peak human possibility.
          </p>
        </motion.div>

        {/* Quick-Jump Dimension Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {DIMENSIONS.map((dim, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 border ${
                  isSelected
                    ? "text-[#03221E] border-[#2BD6B4] shadow-[0_0_24px_rgba(43,214,180,0.35)]"
                    : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="five-d-active-pill"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2BD6B4] to-[#6EE7B7]"
                  />
                )}
                <span
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                    isSelected ? "bg-[#03221E] text-[#2BD6B4]" : "bg-white/10 text-[#2BD6B4]"
                  }`}
                >
                  {dim.id}
                </span>
                <span className="relative z-10">{dim.title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive 3D Stack + Visual Spotlight Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Visual Artwork & Telemetry Preview for Active Dimension */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDim.id}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#053830] shadow-2xl"
              >
                <BorderBeam size={220} duration={10} colorFrom="#2BD6B4" colorTo="#FFC845" />
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeDim.image}
                    alt={`${activeDim.id} Dimension - ${activeDim.title}`}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03221E] via-[#03221E]/35 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#03221E]/85 backdrop-blur-md px-3.5 py-1 text-xs font-black text-[#2BD6B4] border border-[#2BD6B4]/40">
                      {activeDim.order}
                    </span>
                    <span className="rounded-full bg-[#FFC845] px-3 py-1 text-xs font-black text-[#03221E] shadow-md">
                      {activeDim.metric}
                    </span>
                  </div>

                  {/* Bottom Axis Overlay */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#2BD6B4]">
                        Axis {activeDim.id} · {activeDim.flowVerb}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                        {activeDim.title}
                      </h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2BD6B4] text-[#03221E] shadow-lg">
                      <Icon name={activeDim.icon} size={24} />
                    </div>
                  </div>
                </div>

                {/* Coordinate Progress Strip */}
                <div className="p-5 bg-[#021C18]/90 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[#2BD6B4]">
                      5D Progression Coordinate
                    </span>
                    <span className="font-mono font-bold text-white">
                      0{activeIndex + 1} / 05 ({(activeIndex + 1) * 20}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeIndex + 1) * 20}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${activeDim.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: 3D Stacked Interactive Deck */}
          <div className="lg:col-span-7">
            <div className="relative h-[470px] sm:h-[440px] flex items-center justify-center">
              {/* Dynamic Ambient Halo */}
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 0.3, scale: 1.15 }}
                transition={{ duration: 0.6 }}
                className={`absolute w-[360px] h-[360px] rounded-full blur-[110px] bg-gradient-to-r ${activeDim.color} pointer-events-none`}
              />

              <div className="relative w-full max-w-xl h-full flex items-center justify-center">
                {DIMENSIONS.map((dim, index) => {
                  let offset = index - activeIndex;
                  if (offset > 2) offset -= DIMENSIONS.length;
                  if (offset < -2) offset += DIMENSIONS.length;

                  const isActive = offset === 0;
                  const zIndex = DIMENSIONS.length - Math.abs(offset);
                  const scale = 1 - Math.abs(offset) * 0.065;
                  const translateY = offset * 24;
                  const opacity = 1 - Math.abs(offset) * 0.3;

                  return (
                    <motion.div
                      key={dim.id}
                      initial={false}
                      animate={{
                        scale,
                        y: translateY,
                        opacity: isActive ? 1 : opacity,
                        zIndex,
                      }}
                      transition={{ type: "spring", stiffness: 240, damping: 28 }}
                      onClick={() => (!isActive ? setActiveIndex(index) : undefined)}
                      className={`absolute w-full p-6 sm:p-8 rounded-3xl border backdrop-blur-xl transition-colors duration-300 ${
                        isActive
                          ? "border-[#2BD6B4]/60 bg-gradient-to-br from-[#06483F]/95 to-[#02211C]/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)] cursor-default"
                          : "border-white/10 bg-white/5 hover:border-white/25 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`absolute top-0 left-8 right-8 h-1.5 rounded-b-full bg-gradient-to-r ${dim.color} ${
                          isActive ? "opacity-100" : "opacity-30"
                        }`}
                      />

                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl font-black bg-gradient-to-br ${dim.color} text-[#021C18] shadow-lg`}
                          >
                            {dim.id}
                          </span>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                              {dim.order}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                              {dim.title}
                            </h3>
                            <p className="text-[#2BD6B4] font-bold text-xs sm:text-sm">
                              {dim.subtitle}
                            </p>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="rounded-full bg-[#2BD6B4]/20 border border-[#2BD6B4]/50 px-3 py-1 text-[11px] font-black text-[#2BD6B4] shrink-0">
                            Active Axis
                          </span>
                        ) : (
                          <span className="text-xs text-white/50 font-semibold shrink-0">
                            Inspect →
                          </span>
                        )}
                      </div>

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-3.5 pt-2"
                        >
                          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                            {dim.desc}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                              <p className="text-[11px] font-black uppercase tracking-wider text-[#2BD6B4] flex items-center gap-1.5">
                                <Icon name="sparkle" size={13} /> Classroom Neural Drills
                              </p>
                              <p className="text-xs sm:text-[13px] text-white/85 mt-1.5 leading-relaxed">
                                {dim.drills}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                              <p className="text-[11px] font-black uppercase tracking-wider text-[#FFC845] flex items-center gap-1.5">
                                <Icon name="award" size={13} /> Developmental Milestone
                              </p>
                              <p className="text-xs sm:text-[13px] text-white/85 mt-1.5 leading-relaxed">
                                {dim.outcome}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Deck Controls */}
            <div className="flex items-center justify-center gap-5 mt-6">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous dimension"
                className="w-11 h-11 rounded-full border border-white/20 bg-white/5 text-white flex items-center justify-center hover:bg-[#2BD6B4] hover:text-[#03221E] hover:border-[#2BD6B4] transition-all font-bold"
              >
                <Icon name="chevLeft" size={18} />
              </button>

              <div className="flex gap-2">
                {DIMENSIONS.map((dim, idx) => (
                  <button
                    key={dim.id}
                    type="button"
                    aria-label={`Jump to dimension ${dim.id}`}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-10 bg-[#2BD6B4] shadow-[0_0_10px_#2BD6B4]"
                        : "w-2.5 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next dimension"
                className="w-11 h-11 rounded-full border border-white/20 bg-white/5 text-white flex items-center justify-center hover:bg-[#2BD6B4] hover:text-[#03221E] hover:border-[#2BD6B4] transition-all font-bold"
              >
                <Icon name="chevRight" size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Progressive Developmental Flow Pipeline */}
        <div className="mt-14 rounded-3xl bg-white/5 border border-white/15 p-6 sm:p-8 backdrop-blur-md">
          <p className="text-xs font-black uppercase tracking-widest text-[#2BD6B4] text-center mb-5">
            Click Any Stage · Progressive Developmental Flow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 font-bold text-xs sm:text-sm">
            {DIMENSIONS.map((dim, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div key={dim.id} className="flex items-center gap-2.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 border ${
                      isSelected
                        ? "bg-[#2BD6B4] text-[#03221E] border-[#2BD6B4] font-black shadow-[0_0_20px_rgba(43,214,180,0.4)] scale-105"
                        : "bg-white/10 text-white/85 border-white/15 hover:bg-white/20"
                    }`}
                  >
                    <span className="text-[11px] opacity-75">[{dim.id}]</span>
                    <span>{dim.flowVerb}</span>
                  </button>
                  {idx < DIMENSIONS.length - 1 && (
                    <span className="text-[#2BD6B4] font-black" aria-hidden>
                      ➔
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Brochure Page 7 Lower Feature: The 5 Interconnected Intelligence Dimensions */}
        <div className="mt-20 pt-16 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FFC845]">
                Holistic Whole-Child Synergy
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-2">
                5 Interconnected Intelligence Dimensions
              </h3>
            </div>
            <p className="text-sm sm:text-base text-white/75 max-w-md">
              Rather than training isolated academic skills, Q-School activates five mutually reinforcing human intelligences simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {INTELLIGENCE_PILLARS.map((pillar, idx) => {
              const isHighlighted = activeIntel === idx;
              return (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: idx * 0.07 }}
                  onMouseEnter={() => setActiveIntel(idx)}
                  onClick={() => setActiveIntel(idx)}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isHighlighted
                      ? "border-[#2BD6B4] bg-[#064239] shadow-[0_16px_40px_rgba(0,0,0,0.45)] -translate-y-1.5"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  {/* Pictorial Header */}
                  <div>
                    <div className="relative h-36 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#042D27] via-[#042D27]/30 to-transparent" />
                      <span className="absolute top-3 left-3 rounded-lg bg-[#03221E]/85 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-black text-[#2BD6B4] border border-white/15">
                        {pillar.num}
                      </span>
                      <span
                        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl text-[#03221E] shadow-md"
                        style={{ backgroundColor: pillar.accent }}
                      >
                        <Icon name={pillar.icon} size={18} />
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#2BD6B4]">
                        {pillar.subtitle}
                      </p>
                      <h4 className="text-lg font-extrabold text-white mt-1 leading-snug">
                        {pillar.title}
                      </h4>
                      <p className="text-xs sm:text-[13px] text-white/80 mt-2.5 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4">
                    <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: isHighlighted ? "100%" : "35%",
                          backgroundColor: pillar.accent,
                        }}
                      />
                    </div>
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
