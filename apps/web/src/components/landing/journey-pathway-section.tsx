"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { SpotlightCard, BorderBeam } from "@/components/ui/21st";
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";

interface CycleStage {
  num: string;
  name: string;
  tagline: string;
  icon: IconName;
  image: string;
  desc: string;
  inClass: string;
  childTakeaway: string;
}

const CYCLE_STAGES: CycleStage[] = [
  {
    num: "01",
    name: "ENGAGE",
    tagline: "Spark Natural Curiosity",
    icon: "sparkle",
    image: "/images/bmit-hero.png",
    desc: "Capture undivided attention and awaken genuine excitement before a single concept is introduced.",
    inClass: "Socratic opening riddles, sensory breathing reset, and intriguing visual mystery prompts.",
    childTakeaway: "Switches from school fatigue into alert, joyful readiness within 5 minutes.",
  },
  {
    num: "02",
    name: "EXPLORE",
    tagline: "Discover Through Inquiry",
    icon: "eye",
    image: "/images/programs/quantum-vision.jpg",
    desc: "Introduce core principles through hands-on discovery challenges rather than one-way blackboard lectures.",
    inClass: "Interactive exploration kits, pattern-spotting labs, and guided peer experimentation.",
    childTakeaway: "Discovers the 'why' behind concepts firsthand, building lasting curiosity.",
  },
  {
    num: "03",
    name: "PRACTISE",
    tagline: "Wire Deep Neural Pathways",
    icon: "brain",
    image: "/images/programs/quantum-learning.jpg",
    desc: "Strengthen mental stamina, speed, and accuracy through progressive multi-sensory cognitive drills.",
    inClass: "Memory palace construction, dual-hemisphere speed sprints, and visual association workouts.",
    childTakeaway: "Replaces stressful repetition with enjoyable, high-energy brain games.",
  },
  {
    num: "04",
    name: "APPLY",
    tagline: "Solve Real Challenges",
    icon: "tools",
    image: "/images/programs/quantum-creation.jpg",
    desc: "Transfer newly wired capabilities into academic problem-solving, creative builds, and stage tasks.",
    inClass: "Visual Q-Maths & Q-Science challenges, creative synthesis projects, and team simulations.",
    childTakeaway: "Sees immediate proof of how Q-School skills make school subjects effortless.",
  },
  {
    num: "05",
    name: "REFLECT",
    tagline: "Metacognitive Awareness",
    icon: "bulb",
    image: "/images/pic-girl.png",
    desc: "Pause to articulate what was learned, how the mind worked, and where personal growth happened.",
    inClass: "Mentor feedback circle, learner reflection journal, and peer appreciation moments.",
    childTakeaway: "Develops self-awareness, articulateness, and pride in personal progress.",
  },
  {
    num: "06",
    name: "REINFORCE",
    tagline: "Carry Into Daily Life",
    icon: "award",
    image: "/images/workshop.png",
    desc: "Bridge classroom breakthroughs into everyday home study routines through micro-habits and Q-Verse.",
    inClass: "15-minute daily Quantum Habit mission, Q-Verse practice unlock, and parent recap note.",
    childTakeaway: "Turns a 60-minute weekly session into 7 days of compounding transformation.",
  },
];

const BEYOND_CLASSROOM_BRIDGE = [
  {
    step: "Step 01",
    title: "Centre Learning",
    subtitle: "Experiential Micro-Cohorts",
    image: "/images/bmit-hero.png",
    icon: "building" as IconName,
    desc: "High-energy 60-minute sessions in small batches (max 15) led by certified Quantum Mentors.",
  },
  {
    step: "Step 02",
    title: "Guided Practice",
    subtitle: "Structured Skill Drills",
    image: "/images/pic-brain-boy.png",
    icon: "brain" as IconName,
    desc: "Bite-sized Q-Verse cognitive exercises and visual worksheets that reinforce neural pathways mid-week.",
  },
  {
    step: "Step 03",
    title: "Home Reinforcement",
    subtitle: "Parent-Partnered Growth",
    image: "/images/workshop.png",
    icon: "heart" as IconName,
    desc: "Simple 15-minute daily Quantum Habits and transparent parent insights that anchor lifelong character.",
  },
];

const THREE_YEAR_PATHWAY = [
  {
    year: "Year 01",
    stage: "FOUNDATION",
    theme: "Awakening Genius & Core Activation",
    classes: "48 Classes · Level 1",
    image: "/images/programs/quantum-vision.jpg",
    accent: "#0E937E",
    modules: ["Q-Vision", "Q-Learning", "Q-Mastery"],
    desc: "Builds unbreakable attention stamina, sensory observation, foundational memory palaces, and daily study habits.",
    milestone: "Calm 45-min focus + 2× recall speed",
  },
  {
    year: "Year 02",
    stage: "PROGRESSION",
    theme: "Expanding Imagination & Speed Fluency",
    classes: "48 Classes · Level 2",
    image: "/images/programs/quantum-creation.jpg",
    accent: "#5B6CF0",
    modules: ["Q-Creation", "Q-Learning", "Q-Mastery", "Q-Maths / Q-Science"],
    desc: "Unlocks divergent creativity, 3× Quantum Reading fluency, visual math/science mastery, and confident stage articulation.",
    milestone: "Independent learning + creative problem-solving",
    featured: true,
  },
  {
    year: "Year 03",
    stage: "ADVANCED DEVELOPMENT",
    theme: "Higher-Order Cognition & Global Leadership",
    classes: "48 Classes · Level 3",
    image: "/images/programs/quantum-way.jpg",
    accent: "#054038",
    modules: ["Q-Way", "Q-Learning", "Q-Mastery", "Neo Sapiens Capstone"],
    desc: "Cultivates rapid intuitive synthesis, ethical decision-making, collaborative leadership, and real-world innovation.",
    milestone: "Certified Neo Sapiens Young Leader",
  },
];

interface QuantumHabit {
  num: string;
  title: string;
  tagline: string;
  icon: IconName;
  color: string;
  desc: string;
  dailyPractice: string;
}

const QUANTUM_HABITS: QuantumHabit[] = [
  {
    num: "01",
    title: "Physically Healthy",
    tagline: "Vitality, Posture & Breath",
    icon: "leaf",
    color: "#10B981",
    desc: "Energises the body-brain connection through mindful breathing, ergonomic posture, hydration, and active movement.",
    dailyPractice: "Morning breathwork + screen-free outdoor play",
  },
  {
    num: "02",
    title: "Emotionally Strong",
    tagline: "Composure & Self-Belief",
    icon: "heart",
    color: "#E2557A",
    desc: "Builds inner calm, gratitude, emotional vocabulary, and the resilience to handle setbacks with grace.",
    dailyPractice: "Evening gratitude reflection + calm pause reset",
  },
  {
    num: "03",
    title: "Intellectually Sharp",
    tagline: "Curiosity & Deep Focus",
    icon: "brain",
    color: "#0E937E",
    desc: "Sustains daily reading, mental math agility, memory mapping, and distraction-free deep study blocks.",
    dailyPractice: "15-min Quantum Reading + visual mind-map recap",
  },
  {
    num: "04",
    title: "Financially Responsible",
    tagline: "Value, Saving & Wise Choices",
    icon: "rupee",
    color: "#F29A2E",
    desc: "Introduces age-appropriate understanding of earning, saving, budgeting, delayed gratification, and generosity.",
    dailyPractice: "Smart pocket-ledger tracking: Save · Spend · Share",
  },
  {
    num: "05",
    title: "Self-Disciplined",
    tagline: "Ownership & Consistency",
    icon: "award",
    color: "#5B6CF0",
    desc: "Transforms external nagging into internal pride — owning schedules, commitments, and tidy study spaces.",
    dailyPractice: "Self-planned study timetable + habit streak tracker",
  },
];

export function JourneyAndPathwaySection() {
  const [activeStage, setActiveStage] = useState(0);
  const [activeHabit, setActiveHabit] = useState(0);

  const currentStage = CYCLE_STAGES[activeStage];

  return (
    <section
      id="journey"
      className="relative scroll-mt-20 py-24 md:py-32 bg-gradient-to-b from-[#F4FAF8] via-white to-[#EDF6F3] overflow-hidden"
    >
      <QuantumAtomOrbital
        theme="light"
        size={360}
        className="absolute -right-24 top-16 opacity-75"
      />
      <QuantumAtomOrbital
        theme="light"
        size={280}
        className="absolute -left-20 bottom-24 opacity-65"
      />

      <QuantumWaveStream theme="light" className="mb-8" />

      <div className="container-qs relative z-10">
        {/* ═══════════════════════ PART 1: 48-CLASS 6-STAGE CYCLE ═══════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[13.5px] font-bold uppercase tracking-[0.16em] text-brand-teal">
            The 48-Class Developmental Architecture
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-[2.7rem] font-extrabold tracking-tight leading-[1.15] text-brand-deep">
            48 Classes. <span className="text-[#0E937E]">One Continuous Journey.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">
            Every session in Q-School&apos;s 48-class annual calendar follows a scientifically sequenced 6-stage learning loop — ensuring concepts move from initial spark to lifelong habit.
          </p>
        </motion.div>

        {/* Interactive 6-Stage Loop Selector */}
        <div className="mt-12 relative">
          {/* Connecting Progress Rail (Desktop) */}
          <div
            className="hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-[#D6EAE4] rounded-full z-0"
            aria-hidden
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#054038] via-[#0E937E] to-[#2BD6B4] rounded-full"
              animate={{ width: `${(activeStage / (CYCLE_STAGES.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {CYCLE_STAGES.map((st, idx) => {
              const isActive = activeStage === idx;
              const isPassed = idx <= activeStage;
              return (
                <motion.button
                  key={st.num}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveStage(idx)}
                  className={`rounded-2xl p-4 text-left transition-all duration-300 border shadow-sm ${
                    isActive
                      ? "bg-[#054038] text-white border-[#2BD6B4] shadow-[0_14px_30px_rgba(5,64,56,0.28)] scale-[1.03]"
                      : isPassed
                      ? "bg-white text-brand-ink border-[#0E937E]/50 hover:border-[#0E937E]"
                      : "bg-white text-brand-ink border-[#CFE3DD] hover:border-[#0E937E]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-[#2BD6B4] text-[#054038]"
                          : "bg-[#E6F4F0] text-[#0E937E]"
                      }`}
                    >
                      {st.num}
                    </span>
                    <Icon
                      name={st.icon}
                      size={16}
                      className={isActive ? "text-[#FFC845]" : "text-[#0E937E]"}
                    />
                  </div>
                  <h3 className="mt-3 text-base font-extrabold tracking-tight">
                    {st.name}
                  </h3>
                  <p
                    className={`mt-0.5 text-[11px] font-medium line-clamp-1 ${
                      isActive ? "text-[#2BD6B4]" : "text-[#5c7772]"
                    }`}
                  >
                    {st.tagline}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Pictorial Active Stage Spotlight Console */}
        <div className="mt-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.num}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-3xl border border-[#BFE0D8] bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch"
            >
              {/* Stage Photo */}
              <div className="relative lg:col-span-5 min-h-[250px] sm:min-h-[290px] overflow-hidden bg-[#054038]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentStage.image}
                  alt={`${currentStage.num} ${currentStage.name}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#032621]/90 via-[#032621]/25 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-[#2BD6B4] px-3.5 py-1 text-xs font-black text-[#032621] shadow-md">
                    Stage {currentStage.num} of 06
                  </span>
                </div>
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2BD6B4]">
                    {currentStage.tagline}
                  </p>
                  <h4 className="text-2xl sm:text-3xl font-black mt-0.5">
                    {currentStage.name}
                  </h4>
                </div>
              </div>

              {/* Stage Pedagogical Breakdown */}
              <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E6F0ED]">
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0E937E]">
                      <Icon name={currentStage.icon} size={16} /> Active Inside Every 60-Min Session
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStage(
                            (prev) => (prev - 1 + CYCLE_STAGES.length) % CYCLE_STAGES.length,
                          )
                        }
                        aria-label="Previous stage"
                        className="h-8 w-8 rounded-full border border-[#CFE3DD] flex items-center justify-center text-brand-deep hover:bg-[#E6F4F0] transition"
                      >
                        <Icon name="chevLeft" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStage((prev) => (prev + 1) % CYCLE_STAGES.length)}
                        aria-label="Next stage"
                        className="h-8 w-8 rounded-full border border-[#CFE3DD] flex items-center justify-center text-brand-deep hover:bg-[#E6F4F0] transition"
                      >
                        <Icon name="chevRight" size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-base sm:text-lg font-semibold text-brand-ink leading-relaxed">
                    {currentStage.desc}
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#F2FAF8] border border-[#CFE8E1] p-4">
                      <p className="text-[11px] font-black uppercase tracking-wider text-[#0E937E]">
                        In-Class Mentor Experience
                      </p>
                      <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-deep leading-relaxed">
                        {currentStage.inClass}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FFFDF5] border border-[#F5E1A4] p-4">
                      <p className="text-[11px] font-black uppercase tracking-wider text-[#B7791F]">
                        Learner Transformation
                      </p>
                      <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-ink leading-relaxed">
                        {currentStage.childTakeaway}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══════════════════════ PART 2: LEARNING BEYOND THE CLASSROOM BRIDGE ═══════════════════════ */}
        <div className="mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#0E937E]">
                Learning Does Not End When Class Ends
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-deep mt-1">
                Centre Learning ➔ Guided Practice ➔ Home Reinforcement
              </h3>
            </div>
            <span className="rounded-full bg-[#054038] text-[#2BD6B4] px-4 py-1.5 text-xs font-black w-fit">
              360° Continuity Loop
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BEYOND_CLASSROOM_BRIDGE.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
              >
                <SpotlightCard className="h-full overflow-hidden shadow-md hover:shadow-xl">
                  <div className="relative h-44 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#054038]/85 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-0.5 text-[11px] font-black text-brand-deep shadow-sm">
                      {item.step}
                    </span>
                    <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2BD6B4] text-[#054038] shadow-md">
                      <Icon name={item.icon} size={20} />
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E937E]">
                      {item.subtitle}
                    </p>
                    <h4 className="text-xl font-extrabold text-brand-ink mt-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#4b635e] mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════ PART 3: THE 3-YEAR Q-SCHOOL PATHWAY ═══════════════════════ */}
        <div className="mt-24 pt-16 border-t border-[#D7EAE4]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-[#2BD6B4] font-black">
              MULTI-YEAR ROADMAP
            </span>
            <h3 className="mt-3 text-3xl sm:text-4xl font-extrabold text-brand-deep">
              The Structured 3-Year Q-School Pathway
            </h3>
            <p className="mt-3 text-base text-[#4b635e]">
              A clear, compounding developmental staircase — from foundational cognitive awakening in Year 1 to Neo Sapiens leadership in Year 3.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
            {THREE_YEAR_PATHWAY.map((pw, idx) => (
              <motion.div
                key={pw.year}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                  pw.featured
                    ? "bg-[#054038] text-white border-[#2BD6B4] shadow-2xl lg:-translate-y-2"
                    : "bg-white text-brand-ink border-[#CFE3DD] shadow-lg hover:shadow-xl"
                }`}
              >
                {pw.featured && (
                  <BorderBeam size={220} duration={11} colorFrom="#2BD6B4" colorTo="#FFC845" />
                )}

                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pw.image}
                      alt={`${pw.year} ${pw.stage}`}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${
                        pw.featured
                          ? "from-[#054038] via-[#054038]/35 to-transparent"
                          : "from-black/70 via-black/20 to-transparent"
                      }`}
                    />
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="rounded-full bg-[#FFC845] px-3.5 py-1 text-xs font-black text-[#03221E] shadow-md">
                        {pw.year}
                      </span>
                      <span className="rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white border border-white/15">
                        {pw.classes}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-5 right-5">
                      <p className="text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
                        {pw.stage}
                      </p>
                      <h4 className="text-xl font-black text-white leading-tight mt-0.5">
                        {pw.theme}
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <p
                      className={`text-xs font-black uppercase tracking-wider mb-2.5 ${
                        pw.featured ? "text-[#2BD6B4]" : "text-[#0E937E]"
                      }`}
                    >
                      Core Modules Included
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pw.modules.map((m) => (
                        <span
                          key={m}
                          className={`rounded-lg px-3 py-1 text-xs font-bold border ${
                            pw.featured
                              ? "bg-white/10 text-white border-white/15"
                              : "bg-[#F2FAF8] text-brand-deep border-[#CFE3DD]"
                          }`}
                        >
                          ✦ {m}
                        </span>
                      ))}
                    </div>

                    <p
                      className={`mt-4 text-sm leading-relaxed ${
                        pw.featured ? "text-white/85" : "text-[#4b635e]"
                      }`}
                    >
                      {pw.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div
                    className={`rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold ${
                      pw.featured
                        ? "bg-white/10 text-[#FFC845] border border-white/15"
                        : "bg-[#EDF7F4] text-[#054038] border border-[#CFE3DD]"
                    }`}
                  >
                    <Icon name="award" size={16} className="shrink-0" />
                    <span>Outcome: {pw.milestone}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════ PART 4: THE 5 QUANTUM HABITS ═══════════════════════ */}
        <div className="mt-24 pt-16 border-t border-[#D7EAE4]">
          <div className="rounded-[32px] bg-gradient-to-br from-[#054038] via-[#04332C] to-[#021E1A] p-7 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#2BD6B4]/15 blur-3xl"
              aria-hidden
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2BD6B4]/15 border border-[#2BD6B4]/35 px-4 py-1 text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
                  <Icon name="sparkle" size={13} /> Small Habits · Big Possibilities
                </span>
                <h3 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
                  The 5 <span className="text-[#FFC845]">Quantum Habits</span>
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl">
                  Talent sparks potential, but daily habits compound it. Q-School instils five foundational life habits in every learner.
                </p>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/10 border border-white/15 px-5 py-3 text-xs sm:text-sm font-black tracking-wider">
                <span className="text-[#2BD6B4]">HABIT</span>
                <span className="text-white/50">➔</span>
                <span className="text-[#FFC845]">PRACTICE</span>
                <span className="text-white/50">➔</span>
                <span className="text-white">GROWTH</span>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {QUANTUM_HABITS.map((habit, idx) => {
                const isSelected = activeHabit === idx;
                return (
                  <motion.div
                    key={habit.num}
                    whileHover={{ y: -4 }}
                    onMouseEnter={() => setActiveHabit(idx)}
                    onClick={() => setActiveHabit(idx)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-white text-brand-ink border-[#2BD6B4] shadow-xl"
                        : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                          style={{ backgroundColor: habit.color }}
                        >
                          <Icon name={habit.icon} size={20} />
                        </span>
                        <span
                          className={`text-xs font-black ${
                            isSelected ? "text-[#0E937E]" : "text-white/50"
                          }`}
                        >
                          {habit.num}
                        </span>
                      </div>

                      <h4 className="text-lg font-extrabold leading-snug">
                        {habit.title}
                      </h4>
                      <p
                        className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${
                          isSelected ? "text-[#0E937E]" : "text-[#2BD6B4]"
                        }`}
                      >
                        {habit.tagline}
                      </p>
                      <p
                        className={`text-xs leading-relaxed mt-3 ${
                          isSelected ? "text-[#4b635e]" : "text-white/80"
                        }`}
                      >
                        {habit.desc}
                      </p>
                    </div>

                    <div
                      className={`mt-4 pt-3 border-t text-[11px] font-bold ${
                        isSelected
                          ? "border-[#E2ECE9] text-brand-deep"
                          : "border-white/15 text-[#FFC845]"
                      }`}
                    >
                      ✦ {habit.dailyPractice}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

