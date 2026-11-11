"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { Tilt } from "@/components/landing/tilt";
import { QuantumNexus } from "@/components/three/quantum-nexus";
import { SpotlightCard, BorderBeam, ScrollMotion } from "@/components/ui/21st";
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";

type DomainFilter = "all" | "motor" | "logic" | "sensory";
type ViewMode = "cards" | "matrix";

interface RbiqActivity {
  id: number;
  num: string;
  title: string;
  shortTitle: string;
  pillarBadge: string;
  description: string;
  domain: DomainFilter;
  hemisphere: string;
  image: string;
  icon: IconName;
  accent: string;
  skills: string[];
  classroomDrill: string;
  realLifeImpact: string;
}

const ACTIVITIES: RbiqActivity[] = [
  {
    id: 1,
    num: "01",
    title: "Cup Stacking",
    shortTitle: "Cup Stacking",
    pillarBadge: "Speed & Coordination",
    description: "Develop hand-eye coordination, focus, speed and accuracy.",
    domain: "motor",
    hemisphere: "Left + Right Bilateral Sync",
    image: "/images/rbiq/cup-stacking.jpg",
    icon: "clock",
    accent: "#0E937E",
    skills: ["Hand-Eye Coordination", "Focus", "Speed & Accuracy"],
    classroomDrill:
      "Timed 3-3-3, 3-6-3, and full-cycle pyramid sequences requiring rapid cross-midline hand transitions.",
    realLifeImpact:
      "Sharpens reflex speed, sports agility, handwriting control, and unbroken task concentration.",
  },
  {
    id: 2,
    num: "02",
    title: "Rubik's Cube Solving",
    shortTitle: "Rubik's Cube",
    pillarBadge: "Logical Thinking",
    description: "Encourage logical thinking, pattern recognition and problem-solving.",
    domain: "logic",
    hemisphere: "Algorithmic + Spatial Cortex",
    image: "/images/rbiq/rubiks-cube.jpg",
    icon: "grid",
    accent: "#5B6CF0",
    skills: ["Logical Thinking", "Pattern Recognition", "Problem-Solving"],
    classroomDrill:
      "Progressive layer-by-layer spatial algorithms, look-ahead pattern scanning, and memory-free intuitive moves.",
    realLifeImpact:
      "Builds patience, structured multi-step reasoning, and confidence when facing complex academic puzzles.",
  },
  {
    id: 3,
    num: "03",
    title: "Clairaudience (Auditory Awareness)",
    shortTitle: "Clairaudience",
    pillarBadge: "Auditory Awareness",
    description: "Strengthen listening skills, sound recognition and auditory attention.",
    domain: "sensory",
    hemisphere: "Auditory & Mindful Cortex",
    image: "/images/rbiq/clairaudience.jpg",
    icon: "bell",
    accent: "#2BD6B4",
    skills: ["Listening Skills", "Sound Recognition", "Auditory Attention"],
    classroomDrill:
      "Eyes-closed frequency discrimination, tonal sequence memory, and directional sound-tracking exercises.",
    realLifeImpact:
      "Dramatically improves classroom listening retention, instruction comprehension, and inner calm.",
  },
  {
    id: 4,
    num: "04",
    title: "Parallel Processing",
    shortTitle: "Parallel Processing",
    pillarBadge: "Mental Flexibility",
    description: "Develop mental flexibility, attention and information processing.",
    domain: "logic",
    hemisphere: "Prefrontal Executive Network",
    image: "/images/rbiq/parallel-processing.jpg",
    icon: "brain",
    accent: "#F29A2E",
    skills: ["Mental Flexibility", "Divided Attention", "Information Processing"],
    classroomDrill:
      "Simultaneous dual-pattern sorting, colour-word Stroop challenges, and rapid rule-switching cognitive games.",
    realLifeImpact:
      "Helps learners synthesize multiple concepts at once without cognitive overload during exams.",
  },
  {
    id: 5,
    num: "05",
    title: "Rope Knot",
    shortTitle: "Rope Knot",
    pillarBadge: "Spatial Reasoning",
    description: "Improve spatial reasoning, fine motor skills and sequential thinking.",
    domain: "motor",
    hemisphere: "3D Visuospatial & Motor Sync",
    image: "/images/rbiq/rope-knot.jpg",
    icon: "tools",
    accent: "#E2557A",
    skills: ["Spatial Reasoning", "Fine Motor Skills", "Sequential Thinking"],
    classroomDrill:
      "Tactile topological knot challenges, mental untangling visualization, and step-by-step sequence execution.",
    realLifeImpact:
      "Strengthens 3D geometry intuition, finger dexterity, and orderly step-by-step execution.",
  },
  {
    id: 6,
    num: "06",
    title: "Towel Folding",
    shortTitle: "Towel Folding",
    pillarBadge: "Precision & Organisation",
    description: "Encourage visual-spatial awareness, precision and organisation.",
    domain: "motor",
    hemisphere: "Visual Symmetry & Executive Order",
    image: "/images/rbiq/towel-folding.jpg",
    icon: "box",
    accent: "#10B981",
    skills: ["Visual-Spatial Awareness", "Precision", "Organisation"],
    classroomDrill:
      "Symmetrical geometric folding sequences, fraction-proportion alignment, and mindful neatness routines.",
    realLifeImpact:
      "Cultivates tidy study habits, geometric symmetry perception, and pride in careful craftsmanship.",
  },
  {
    id: 7,
    num: "07",
    title: "Abacus",
    shortTitle: "Abacus",
    pillarBadge: "Mental Calculation",
    description: "Build number sense, visualisation and mental calculation skills.",
    domain: "logic",
    hemisphere: "Left Logic + Right Visualisation",
    image: "/images/rbiq/abacus.jpg",
    icon: "chart",
    accent: "#D97706",
    skills: ["Number Sense", "Visualisation", "Mental Calculation"],
    classroomDrill:
      "Tactile Soroban bead manipulation progressing into Anzan (flash mental abacus) rapid arithmetic.",
    realLifeImpact:
      "Eliminates math fear and finger-counting while unlocking lightning-fast mental calculation.",
  },
  {
    id: 8,
    num: "08",
    title: "Speed Reading",
    shortTitle: "Speed Reading",
    pillarBadge: "Reading Fluency",
    description: "Improve reading fluency, visual tracking and comprehension.",
    domain: "sensory",
    hemisphere: "Visual Span & Language Synthesis",
    image: "/images/rbiq/speed-reading.jpg",
    icon: "book",
    accent: "#2563EB",
    skills: ["Reading Fluency", "Visual Tracking", "Deep Comprehension"],
    classroomDrill:
      "Peripheral eye-span expansion, smooth pointer pacing, chunked phrase capture, and instant recall mapping.",
    realLifeImpact:
      "Enables children to absorb textbooks and storybooks faster while retaining key ideas effortlessly.",
  },
  {
    id: 9,
    num: "09",
    title: "Ambidexterity",
    shortTitle: "Ambidexterity",
    pillarBadge: "Bilateral Coordination",
    description: "Develop bilateral coordination, motor control and hand flexibility.",
    domain: "motor",
    hemisphere: "Corpus Callosum Bridge",
    image: "/images/rbiq/ambidexterity.jpg",
    icon: "palette",
    accent: "#8B5CF6",
    skills: ["Bilateral Coordination", "Motor Control", "Hand Flexibility"],
    classroomDrill:
      "Mirrored two-handed mandala drawing, non-dominant hand writing drills, and synchronized rhythmic tracing.",
    realLifeImpact:
      "Activates both cerebral hemispheres simultaneously, boosting creative fluency and neural adaptability.",
  },
];

const DOMAIN_FILTERS: { id: DomainFilter; label: string; icon: IconName }[] = [
  { id: "all", label: "All 9 Activities", icon: "grid" },
  { id: "motor", label: "Coordination & Spatial (4)", icon: "tools" },
  { id: "logic", label: "Logic & Mental Math (3)", icon: "brain" },
  { id: "sensory", label: "Auditory & Reading Fluency (2)", icon: "eye" },
];

const ADVANTAGES = [
  {
    num: "01",
    title: "Structured Activities",
    icon: "grid" as IconName,
    color: "#0E937E",
    desc: "Every session follows a carefully sequenced whole-brain blueprint balancing tactile, visual, auditory, and logical activation.",
  },
  {
    num: "02",
    title: "Guided Practice",
    icon: "users" as IconName,
    color: "#5B6CF0",
    desc: "Certified Q-School mentors coach posture, technique, and focus in small cohorts so every child masters each skill with confidence.",
  },
  {
    num: "03",
    title: "Progressive Challenges",
    icon: "chart" as IconName,
    color: "#F29A2E",
    desc: "Graduated levels keep learners in the sweet spot between joyful play and brain-stretching mastery — never bored, never overwhelmed.",
  },
  {
    num: "04",
    title: "Meaningful Learning Experiences",
    icon: "sparkle" as IconName,
    color: "#E2557A",
    desc: "Screen-free, hands-on breakthroughs that translate directly into sharper school focus, faster homework, and genuine self-belief.",
  },
];

export function RbiqExperience() {
  const [domain, setDomain] = useState<DomainFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [spotlightIdx, setSpotlightIdx] = useState<number>(0);
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  const filteredActivities = ACTIVITIES.filter((a) =>
    domain === "all" ? true : a.domain === domain,
  );

  const activeSpotlight = ACTIVITIES[spotlightIdx];
  const modalActivity = modalIdx !== null ? ACTIVITIES[modalIdx] : null;

  return (
    <div className="bg-[#F4FAF8] text-brand-ink">
      {/* ═══════════════════════ 1. HERO SECTION ═══════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#054038] via-[#04332C] to-[#021E1A] text-white pt-14 pb-24 lg:pt-20 lg:pb-28">
        <QuantumNexus
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          particleCount={85}
          speed={0.4}
          colorScheme="teal"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#2BD6B4]/20 blur-3xl"
          aria-hidden
        />
        <QuantumAtomOrbital
          theme="dark"
          size={360}
          className="absolute -left-24 bottom-12 opacity-50"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/40 bg-[#2BD6B4]/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
              <Icon name="brain" size={14} />{" "}
              {viewMode === "cards"
                ? "RBIQ – Whole Brain Development Program"
                : "RBIQ – Whole Brain Development"}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight text-white">
              Unlock Potential.{" "}
              <span className="text-[#2BD6B4] block sm:inline">Engineer Brilliance.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/85 leading-relaxed max-w-xl">
              {viewMode === "cards"
                ? "Engaging activities designed to strengthen children's cognitive development, concentration, coordination, memory and problem-solving abilities."
                : "Engaging activities designed to strengthen children's cognitive abilities, focus, coordination and problem-solving skills."}
            </p>

            {/* Mantra Strip */}
            <div className="mt-6 inline-flex flex-wrap items-center gap-2.5 rounded-2xl bg-white/10 border border-white/15 px-4 py-2.5 backdrop-blur-md">
              <span className="text-xs sm:text-sm font-extrabold text-[#FFC845]">
                Think Better.
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#2BD6B4]">
                Learn Better.
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Grow Stronger.
              </span>
            </div>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <a
                href="#activities"
                className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm sm:text-base font-black text-[#03221E] shadow-lg"
              >
                {viewMode === "cards" ? "Explore RBIQ" : "Explore RBIQ Programs"}{" "}
                <Icon name="arrowDown" size={16} />
              </a>
              <a
                href="#book-assessment"
                className="btn-3d btn-3d-outline inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm sm:text-base font-bold text-white"
              >
                <Icon name="calendar" size={17} className="text-[#2BD6B4]" />
                Book an Assessment
              </a>
            </div>

            {/* Quick Stat Pills */}
            <div className="mt-9 grid grid-cols-3 gap-3 max-w-lg pt-6 border-t border-white/15">
              <div>
                <p className="text-2xl font-black text-[#2BD6B4]">9</p>
                <p className="text-xs text-white/75 font-medium">Skill-Building Activities</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FFC845]">360°</p>
                <p className="text-xs text-white/75 font-medium">Left + Right Brain Sync</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-white/75 font-medium">Screen-Free Tactile Flow</p>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <Tilt max={4} glare={false}>
              <div className="relative rounded-3xl border border-[#2BD6B4]/40 bg-[#063D35]/80 p-3 shadow-2xl backdrop-blur-xl">
                <BorderBeam size={260} duration={12} colorFrom="#2BD6B4" colorTo="#FFC845" />
                <div className="relative h-[320px] sm:h-[400px] w-full overflow-hidden rounded-2xl bg-[#03221E]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/rbiq/rbiq-hero.jpg"
                    alt="RBIQ Whole Brain Development Program in action"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#021C18]/90 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#03221E]/85 backdrop-blur-md px-3.5 py-1 text-xs font-black text-[#2BD6B4] border border-[#2BD6B4]/40">
                      Ages 6–14 Years
                    </span>
                    <span className="rounded-full bg-[#FFC845] px-3 py-1 text-xs font-black text-[#03221E] shadow-md">
                      Whole-Brain Activation
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[#03221E]/85 backdrop-blur-md border border-white/15 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#2BD6B4]">
                        Active Cognitive Domains
                      </p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        Focus · Coordination · Logic · Memory · Speed Fluency
                      </p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2BD6B4] text-[#03221E] shadow-md">
                      <Icon name="sparkle" size={22} />
                    </span>
                  </div>
                </div>
              </div>
            </Tilt>
          </motion.div>
        </div>

        {/* Wave Transition */}
        <svg
          viewBox="0 0 1440 60"
          className="pointer-events-none absolute -bottom-px left-0 z-20 h-10 w-full text-[#F4FAF8] sm:h-14"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 60V30C240 0 480 0 720 22s480 30 720 0v38Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* ═══════════════════════ 2. 9 SKILL-BUILDING ACTIVITIES ═══════════════════════ */}
      <section id="activities" className="relative scroll-mt-20 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <QuantumAtomOrbital
            theme="light"
            size={360}
            className="absolute -right-24 top-16 opacity-75"
          />
          <QuantumAtomOrbital
            theme="light"
            size={280}
            className="absolute -left-20 bottom-20 opacity-65"
          />
        </div>
        <QuantumWaveStream theme="light" className="mb-8" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header + View Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#0E937E]">
                Hands-On Neuro-Cognitive Training
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-[2.7rem] font-extrabold tracking-tight text-[#054038] leading-[1.15]">
                9 Skill-Building <span className="text-[#0E937E]">Activities</span>
              </h2>
              <p className="mt-3 text-base text-[#4b635e] leading-relaxed">
                Each activity targets specific neural circuits across the left and right hemispheres — strengthening coordination, auditory focus, spatial logic, mental math, and reading fluency.
              </p>
            </div>

            {/* Interactive View Switcher (Option 1 Detailed Cards vs Option 2 Skill Matrix) */}
            <div className="inline-flex rounded-2xl border border-[#CFE3DD] bg-white p-1.5 shadow-sm self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`relative rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                  viewMode === "cards" ? "text-white" : "text-[#4b635e] hover:text-[#054038]"
                }`}
              >
                {viewMode === "cards" && (
                  <motion.span
                    layoutId="rbiq-view-mode"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#054038]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon name="grid" size={14} /> Option 1: Detailed Program
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`relative rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                  viewMode === "matrix" ? "text-white" : "text-[#4b635e] hover:text-[#054038]"
                }`}
              >
                {viewMode === "matrix" && (
                  <motion.span
                    layoutId="rbiq-view-mode"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#054038]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon name="sparkle" size={14} /> Option 2: Skill Matrix
                </span>
              </button>
            </div>
          </div>

          {viewMode === "cards" ? (
            <>
              {/* Domain Filter Pills */}
              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                {DOMAIN_FILTERS.map((f) => {
                  const isSelected = domain === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDomain(f.id)}
                      className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition ${
                        isSelected
                          ? "text-white shadow-md"
                          : "bg-white border border-[#CFE3DD] text-[#4b635e] hover:border-[#0E937E]"
                      }`}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="rbiq-domain-pill"
                          transition={{ type: "spring", stiffness: 340, damping: 28 }}
                          className="absolute inset-0 rounded-full bg-[#0E937E]"
                        />
                      )}
                      <Icon
                        name={f.icon}
                        size={14}
                        className={`relative z-10 ${
                          isSelected ? "text-[#FFC845]" : "text-[#0E937E]"
                        }`}
                      />
                      <span className="relative z-10">{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Symmetrical 3x3 Pictorial Bento Grid */}
              <motion.div
                layout
                className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch"
              >
                {filteredActivities.map((act, idx) => (
                  <motion.div
                    key={act.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: (idx % 3) * 0.07 }}
                    className="h-full"
                  >
                    <SpotlightCard
                      spotlightColor="rgba(14, 147, 126, 0.14)"
                      borderColor="rgba(14, 147, 126, 0.45)"
                      className="group h-full flex flex-col justify-between border-[#CFE3DD] bg-white shadow-[0_12px_32px_-14px_rgba(5,64,56,0.14)] hover:shadow-[0_22px_48px_-14px_rgba(5,64,56,0.24)] hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex flex-col flex-1">
                        <div className="h-1.5 w-full" style={{ backgroundColor: act.accent }} />

                        {/* Activity Custom Photograph */}
                        <div className="relative h-52 w-full overflow-hidden bg-[#054038]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={act.image}
                            alt={`${act.title} — ${act.pillarBadge}`}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#03221E]/90 via-[#03221E]/30 to-transparent" />
                          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/35 to-transparent" />

                          {/* Top Number + Skill Focus Badge */}
                          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC845] text-xs font-black text-[#03221E] shadow-md">
                              {act.num}
                            </span>
                            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#054038] shadow-sm">
                              {act.pillarBadge}
                            </span>
                          </div>

                          {/* Bottom Brain Circuit Pill */}
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#03221E]/85 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-[#2BD6B4] border border-white/15">
                              <Icon name={act.icon} size={13} />
                              {act.hemisphere}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl sm:text-2xl font-extrabold text-[#054038] group-hover:text-[#0E937E] transition-colors leading-snug">
                            {act.title}
                          </h3>
                          <p className="mt-2 text-sm sm:text-[15px] text-[#3f5954] leading-relaxed font-medium">
                            {act.description}
                          </p>

                          {/* Skill Tags */}
                          <div className="mt-4 pt-4 border-t border-[#E8F2EF] flex flex-wrap gap-1.5">
                            {act.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg bg-[#F0F9F6] border border-[#CFE3DD] px-2.5 py-1 text-[11px] font-bold text-[#054038]"
                              >
                                ✦ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 pb-6 pt-4 border-t border-[#E8F2EF] bg-[#F9FCFB] flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setModalIdx(act.id - 1)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#BFE0D8] bg-white hover:bg-[#E6F4F0] px-3.5 py-2 text-xs font-extrabold text-[#054038] transition shadow-sm"
                        >
                          <Icon name="eye" size={14} className="text-[#0E937E]" />
                          How It Works
                        </button>
                        <a
                          href="#book-assessment"
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0E937E] hover:text-[#054038] transition"
                        >
                          Book Assessment <Icon name="arrowRight" size={13} />
                        </a>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            /* Option 2 Interactive Quick Skill Matrix + Live Visual Console */
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Crisp 9-Row Skill Matrix (Option 2 Format) */}
              <div className="lg:col-span-6 space-y-2.5">
                {ACTIVITIES.map((act, idx) => {
                  const isActive = spotlightIdx === idx;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setSpotlightIdx(idx)}
                      onMouseEnter={() => setSpotlightIdx(idx)}
                      className={`w-full text-left rounded-2xl px-5 py-4 border transition-all flex items-center justify-between gap-4 ${
                        isActive
                          ? "bg-[#054038] text-white border-[#2BD6B4] shadow-lg"
                          : "bg-white text-brand-ink border-[#CFE3DD] hover:border-[#0E937E]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                            isActive
                              ? "bg-[#FFC845] text-[#03221E]"
                              : "bg-[#E6F4F0] text-[#054038]"
                          }`}
                        >
                          {act.num}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-extrabold truncate">
                            {act.shortTitle}{" "}
                            <span
                              className={
                                isActive ? "text-[#2BD6B4]" : "text-[#0E937E]"
                              }
                            >
                              – {act.pillarBadge}
                            </span>
                          </p>
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              isActive ? "text-white/80" : "text-[#5c7772]"
                            }`}
                          >
                            {act.description}
                          </p>
                        </div>
                      </div>
                      <Icon
                        name="chevRight"
                        size={17}
                        className={
                          isActive ? "text-[#2BD6B4] shrink-0" : "text-[#8aa39d] shrink-0"
                        }
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right: Sticky Visual Spotlight Console */}
              <div className="lg:col-span-6 lg:sticky lg:top-24">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSpotlight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="relative overflow-hidden rounded-3xl border border-[#2BD6B4]/40 bg-[#054038] text-white shadow-2xl"
                  >
                    <BorderBeam size={220} duration={11} colorFrom="#2BD6B4" colorTo="#FFC845" />
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeSpotlight.image}
                        alt={activeSpotlight.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#054038] via-[#054038]/30 to-transparent" />
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="rounded-full bg-[#FFC845] px-3.5 py-1 text-xs font-black text-[#03221E] shadow-md">
                          Activity {activeSpotlight.num} of 09
                        </span>
                        <span className="rounded-full bg-[#03221E]/85 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-[#2BD6B4] border border-white/15">
                          {activeSpotlight.hemisphere}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-6 right-6">
                        <p className="text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
                          {activeSpotlight.pillarBadge}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                          {activeSpotlight.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4">
                      <p className="text-base text-white/90 leading-relaxed">
                        {activeSpotlight.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                          <p className="text-[11px] font-black uppercase tracking-wider text-[#2BD6B4]">
                            In-Studio Practice
                          </p>
                          <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed">
                            {activeSpotlight.classroomDrill}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                          <p className="text-[11px] font-black uppercase tracking-wider text-[#FFC845]">
                            Academic &amp; Life Impact
                          </p>
                          <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed">
                            {activeSpotlight.realLifeImpact}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-4">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                          Think Better · Learn Better · Grow Stronger
                        </p>
                        <a
                          href="#book-assessment"
                          className="rounded-xl bg-[#2BD6B4] px-5 py-2.5 text-xs font-black text-[#03221E] hover:bg-[#FFC845] transition shrink-0 shadow-md"
                        >
                          Book Assessment →
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ 3. THE RBIQ ADVANTAGE ═══════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-white border-y border-[#E2ECE9]">
        <QuantumAtomOrbital
          theme="light"
          size={320}
          className="absolute -left-20 top-14 opacity-70"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F0] border border-[#BFE0D8] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#054038]">
              <Icon name="award" size={14} className="text-[#0E937E]" /> Why Parents Choose RBIQ
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#054038]">
              The <span className="text-[#0E937E]">RBIQ Advantage</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#4b635e] font-medium">
              Structured activities. Guided practice. Progressive challenges. Meaningful learning experiences.
            </p>
          </ScrollMotion>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map((adv, idx) => (
              <motion.div
                key={adv.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
              >
                <SpotlightCard className="h-full p-7 border-[#CFE3DD] hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="icon-3d h-12 w-12 rounded-2xl"
                      style={{ ["--c" as string]: adv.color }}
                    >
                      <Icon name={adv.icon} size={22} />
                    </span>
                    <span className="text-2xl font-black text-[#CFE3DD]">{adv.num}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#054038]">{adv.title}</h3>
                  <p className="mt-2.5 text-sm text-[#4b635e] leading-relaxed">{adv.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          {/* Highlight Callout Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-14 rounded-3xl bg-gradient-to-r from-[#054038] via-[#075449] to-[#054038] p-8 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFC845]">
                Think Better · Learn Better · Grow Stronger
              </p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                Give Your Child the Opportunity to Think, Learn and Perform Better.
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="#activities"
                className="rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-5 py-3.5 text-xs sm:text-sm font-bold text-white transition"
              >
                Explore RBIQ
              </a>
              <a
                href="#book-assessment"
                className="rounded-xl bg-[#2BD6B4] hover:bg-[#FFC845] px-6 py-3.5 text-xs sm:text-sm font-black text-[#03221E] transition shadow-lg"
              >
                Book an Assessment →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ 4. BOOK AN RBIQ ASSESSMENT ═══════════════════════ */}
      <section id="book-assessment" className="scroll-mt-20 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[32px] bg-[#054038] px-6 py-12 text-white sm:px-12 sm:py-16 shadow-2xl border border-[#2BD6B4]/30">
            <BorderBeam size={260} duration={13} colorFrom="#2BD6B4" colorTo="#FFC845" />
            <QuantumAtomOrbital
              theme="dark"
              size={340}
              className="absolute -right-20 -top-16 opacity-50"
            />
            <div
              className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#0E937E]/45 blur-3xl"
              aria-hidden
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2BD6B4]/20 border border-[#2BD6B4]/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#2BD6B4]">
                  <Icon name="sparkle" size={13} /> Whole-Brain Readiness Check
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight">
                  Book Your Child&apos;s <span className="text-[#2BD6B4]">RBIQ Assessment</span>
                </h2>
                <p className="mt-4 text-base text-white/85 leading-relaxed max-w-lg">
                  Experience our 9 skill-building activities firsthand at any of our 9 Q-School Learning Centres. Our mentors will assess your child&apos;s focus, bilateral coordination, and cognitive profile.
                </p>

                <ul className="mt-6 space-y-3 text-sm sm:text-base text-white/95">
                  {[
                    "Hands-on trial of Cup Stacking, Rubik's Cube, Abacus & Speed Reading",
                    "1-on-1 whole-brain coordination & concentration feedback",
                    "Designed for children aged 6–14 years across 9 branches",
                    "Zero obligation — personalised developmental roadmap",
                  ].map((pt) => (
                    <li key={pt} className="flex items-start gap-3">
                      <span
                        className="icon-3d h-6 w-6 rounded-full shrink-0 mt-0.5"
                        style={{ ["--c" as string]: "#2BD6B4" }}
                      >
                        <Icon
                          name="check"
                          size={13}
                          strokeWidth={3}
                          className="text-brand-deep"
                        />
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 rounded-2xl bg-white/10 border border-white/15 p-4 max-w-md backdrop-blur-md flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#FFC845]">
                      Speak to an RBIQ Mentor
                    </p>
                    <a
                      href="tel:+919944454840"
                      className="mt-1 inline-flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-white hover:text-[#2BD6B4] transition"
                    >
                      <Icon name="phone" size={15} className="text-[#2BD6B4]" /> +91 99444 54840
                    </a>
                  </div>
                  <a
                    href="/#centres"
                    className="rounded-xl bg-white/15 hover:bg-white/25 px-3.5 py-2 text-xs font-bold text-white transition"
                  >
                    9 Branches →
                  </a>
                </div>
              </div>

              <Tilt max={3} glare={false} className="rounded-3xl">
                <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-7 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-9">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4F0] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0E937E] mb-3">
                    <Icon name="calendar" size={13} /> Free RBIQ Discovery Session
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-deep">
                    Schedule an RBIQ Assessment
                  </h3>
                  <p className="mb-6 mt-1.5 text-xs sm:text-sm text-[#5c7772]">
                    Takes 20 seconds · Our academic counsellor will confirm your preferred slot.
                  </p>
                  <LeadForm source="rbiq_assessment" cta="Book an RBIQ Assessment" />
                </div>
              </Tilt>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ACTIVITY DETAIL MODAL ═══════════════════════ */}
      <AnimatePresence>
        {modalActivity && modalIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalIdx(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6"
          >
            <motion.div
              key={modalActivity.id}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#CFE3DD] bg-white text-brand-ink shadow-2xl"
            >
              <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-[#054038]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={modalActivity.image}
                  alt={modalActivity.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#032621] via-[#032621]/30 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setModalIdx((modalIdx - 1 + ACTIVITIES.length) % ACTIVITIES.length)
                      }
                      aria-label="Previous activity"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-[#2BD6B4] hover:text-[#032621] transition"
                    >
                      <Icon name="chevLeft" size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalIdx((modalIdx + 1) % ACTIVITIES.length)}
                      aria-label="Next activity"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-[#2BD6B4] hover:text-[#032621] transition"
                    >
                      <Icon name="chevRight" size={17} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalIdx(null)}
                    aria-label="Close activity modal"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-[#E2557A] transition"
                  >
                    <Icon name="x" size={17} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="rounded-full bg-[#FFC845] px-3 py-1 text-xs font-black text-[#032621]">
                    Activity {modalActivity.num} · {modalActivity.pillarBadge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-2">
                    {modalActivity.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-base text-[#3f5954] font-medium leading-relaxed">
                  {modalActivity.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#F2FAF8] border border-[#CFE3DD] p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#0E937E] mb-2">
                      Guided Studio Drill
                    </p>
                    <p className="text-xs sm:text-sm text-brand-ink font-semibold leading-relaxed">
                      {modalActivity.classroomDrill}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FFFDF6] border border-[#F3DFA2] p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#B7791F] mb-2">
                      Real-Life Cognitive Benefit
                    </p>
                    <p className="text-xs sm:text-sm text-brand-ink font-semibold leading-relaxed">
                      {modalActivity.realLifeImpact}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {modalActivity.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-[#E6F4F0] px-3 py-1 text-xs font-extrabold text-[#054038]"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#054038] text-white p-5">
                  <div>
                    <p className="text-sm font-extrabold">
                      Let Your Child Try {modalActivity.shortTitle} Live
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Included in our free RBIQ Whole-Brain Assessment session.
                    </p>
                  </div>
                  <a
                    href="#book-assessment"
                    onClick={() => setModalIdx(null)}
                    className="rounded-xl bg-[#2BD6B4] px-6 py-3 text-xs sm:text-sm font-black text-[#032621] hover:bg-[#FFC845] transition shrink-0"
                  >
                    Book an Assessment →
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
