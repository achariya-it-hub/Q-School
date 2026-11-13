"use client";

import { useRef, useState } from "react";
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
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";

interface ComparisonDimension {
  id: string;
  badge: string;
  icon: IconName;
  tradTitle: string;
  tradSub: string;
  qsTitle: string;
  qsSub: string;
  impactScore: string;
}

const COMPARISON_ROWS: ComparisonDimension[] = [
  {
    id: "01",
    badge: "Focus of Learning",
    icon: "brain",
    tradTitle: "What children learn",
    tradSub: "Completing chapters, copying notes, and memorising fixed syllabus answers.",
    qsTitle: "How children learn, think & apply",
    qsSub: "Mastering mental models, memory architecture, and independent synthesis across every subject.",
    impactScore: "3× Faster Concept Mastery",
  },
  {
    id: "02",
    badge: "Core Foundation",
    icon: "sparkle",
    tradTitle: "Curriculum Delivery",
    tradSub: "Standardised one-pace lectures designed around annual board syllabi.",
    qsTitle: "Human Capability Architecture",
    qsSub: "Deliberately engineering focus, imagination, judgement, and cognitive stamina.",
    impactScore: "48 Guided Sessions / Yr",
  },
  {
    id: "03",
    badge: "Depth of Mastery",
    icon: "bulb",
    tradTitle: "Passive Knowledge",
    tradSub: "Storing definitions and formulas until exam day—often forgotten weeks later.",
    qsTitle: "Living Application",
    qsSub: "Multi-sensory experiential drills that turn ideas into real-world creative action.",
    impactScore: "Long-Term Neural Retention",
  },
  {
    id: "04",
    badge: "Cognitive Mode",
    icon: "eye",
    tradTitle: "Academic Learning Alone",
    tradSub: "Left-brain linear repetition focused on single-right-answer worksheets.",
    qsTitle: "Learning + Whole-Brain Thinking",
    qsSub: "Uniting logical analysis with right-brain visualization, intuition, and divergent inquiry.",
    impactScore: "Left + Right Brain Synergy",
  },
  {
    id: "05",
    badge: "True Outcome",
    icon: "crown",
    tradTitle: "Subject Performance",
    tradSub: "Measured strictly by report card marks and classroom test rankings.",
    qsTitle: "Holistic Human Development",
    qsSub: "Graduating confident, articulate, emotionally resilient leaders ready for an AI world.",
    impactScore: "Future-Ready Neo Sapiens",
  },
];

interface CoreAbility {
  num: string;
  name: string;
  icon: IconName;
  color: string;
  image: string;
  programTag: string;
  desc: string;
  drill: string;
  parentSign: string;
}

const CORE_ABILITIES: CoreAbility[] = [
  {
    num: "01",
    name: "Focus & Attention",
    icon: "eye",
    color: "#0E937E",
    image: "/images/programs/quantum-vision.jpg",
    programTag: "Quantum Vision",
    desc: "Sensory activation, sustained concentration stamina, and calm, unbroken observation.",
    drill: "Dual-N-Back sensory focus cycles & mindful Tratak observation sprints.",
    parentSign: "Sits through study blocks calmly without reaching for screens every 5 minutes.",
  },
  {
    num: "02",
    name: "Memory & Learning",
    icon: "brain",
    color: "#5B6CF0",
    image: "/images/programs/quantum-learning.jpg",
    programTag: "Quantum Learning",
    desc: "Spatial memory palaces, vivid visual association, and effortless long-term recall.",
    drill: "Loci memory-grid mapping & high-speed right-brain story-chain encoding.",
    parentSign: "Recalls complex science & history chapters weeks later without last-minute cramming.",
  },
  {
    num: "03",
    name: "Thinking & Reasoning",
    icon: "bulb",
    color: "#0891B2",
    image: "/images/programs/q-maths.jpg",
    programTag: "Q-Maths & Logic",
    desc: "First-principles mental models, pattern recognition, and structured logical deduction.",
    drill: "Visual pattern matrices, syllogistic riddles & multi-path mental calculation.",
    parentSign: "Asks deeper 'why' and 'how' questions instead of memorising steps blindly.",
  },
  {
    num: "04",
    name: "Creativity",
    icon: "palette",
    color: "#F29A2E",
    image: "/images/programs/quantum-creation.jpg",
    programTag: "Quantum Creation",
    desc: "Divergent imagination, original synthesis, and turning bold ideas into reality.",
    drill: "10-uses divergent design sprints & intuitive sensory visualization labs.",
    parentSign: "Generates original stories, inventions, and fresh angles on school projects.",
  },
  {
    num: "05",
    name: "Communication",
    icon: "speech",
    color: "#E2557A",
    image: "/images/programs/quantum-reading.jpg",
    programTag: "Quantum Reading & Expression",
    desc: "Clear vocal articulation, structured storytelling, and active empathetic listening.",
    drill: "60-second structured extempore speaking & Socratic peer dialogue circles.",
    parentSign: "Speaks up with clarity and poise in front of teachers, guests, and classmates.",
  },
  {
    num: "06",
    name: "Problem Solving",
    icon: "kanban",
    color: "#7C3AED",
    image: "/images/programs/q-science.jpg",
    programTag: "Q-Science Inquiry",
    desc: "Deconstructing unfamiliar challenges calmly and testing strategic solutions.",
    drill: "Root-cause tree decomposition & hands-on real-world scientific mystery labs.",
    parentSign: "Tackles tricky homework problems independently before asking for hints.",
  },
  {
    num: "07",
    name: "Habits",
    icon: "clock",
    color: "#10B981",
    image: "/images/pic-brain-boy.png",
    programTag: "Quantum Habits",
    desc: "Daily physical, intellectual, and self-disciplinary micro-routines that compound.",
    drill: "21-day Quantum Habit tracker, morning clarity rituals & reflection journals.",
    parentSign: "Takes ownership of daily reading, sleep, and study routines without nagging.",
  },
  {
    num: "08",
    name: "Emotional Strength",
    icon: "heart",
    color: "#EC4899",
    image: "/images/programs/quantum-mastery.jpg",
    programTag: "Quantum Mastery",
    desc: "Self-awareness, inner calm under exam pressure, and bouncing back from setbacks.",
    drill: "Breath-anchored emotional regulation & growth-mindset reframing labs.",
    parentSign: "Handles mistakes, competition, and tough feedback with composure and grace.",
  },
  {
    num: "09",
    name: "Adaptability",
    icon: "planet",
    color: "#D97706",
    image: "/images/side-brain.png",
    programTag: "Quantum Way",
    desc: "Navigating rapid change and unfamiliar situations with curiosity and cognitive agility.",
    drill: "Rule-shift strategy games & rapid perspective-switching simulations.",
    parentSign: "Welcomes new challenges, subjects, and environments with excitement rather than fear.",
  },
  {
    num: "10",
    name: "Leadership",
    icon: "crown",
    color: "#054038",
    image: "/images/programs/quantum-way.jpg",
    programTag: "Neo Sapiens Capstone",
    desc: "Ethical judgement, collaborative teamwork, and inspiring excellence in peers.",
    drill: "Micro-cohort team missions, ethical dilemma councils & peer mentoring.",
    parentSign: "Steps forward responsibly in group settings and uplifts younger or quieter peers.",
  },
];

function TransformationRowCard({
  row,
  index,
  viewMode,
}: {
  row: ComparisonDimension;
  index: number;
  viewMode: "bridge" | "qschool" | "traditional";
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { margin: "-18% 0px -18% 0px", once: false });

  if (viewMode === "qschool") {
    return (
      <motion.div
        ref={rowRef}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        className="group relative overflow-hidden rounded-3xl border border-[#2BD6B4]/30 bg-gradient-to-br from-[#04322B] via-[#054038] to-[#021C18] p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2BD6B4]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#2BD6B4]/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
            <Icon name={row.icon} size={14} />
            {row.badge}
          </span>
          <span className="text-xs font-black text-white/40">{row.id}</span>
        </div>
        <h4 className="mt-4 text-xl font-extrabold text-white">{row.qsTitle}</h4>
        <p className="mt-2 text-sm leading-relaxed text-white/80">{row.qsSub}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-[#2BD6B4]/30 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#7CF3DA]">
          <Icon name="check" size={14} /> {row.impactScore}
        </div>
      </motion.div>
    );
  }

  if (viewMode === "traditional") {
    return (
      <motion.div
        ref={rowRef}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-slate-600">
            {row.badge}
          </span>
          <span className="text-xs font-black text-slate-300">{row.id}</span>
        </div>
        <h4 className="mt-4 text-xl font-extrabold text-slate-800">{row.tradTitle}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{row.tradSub}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
          ✕ Syllabus-bound scope
        </div>
      </motion.div>
    );
  }

  // Default: Scroll-Reactive Transformation Bridge Row
  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="relative grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_84px_1.18fr] lg:gap-6"
    >
      {/* Left: Traditional Schooling Baseline Card */}
      <div
        className={`rounded-3xl border p-6 transition-all duration-500 ${
          isInView
            ? "border-slate-300/90 bg-white/95 shadow-md"
            : "border-slate-200/70 bg-white/60 opacity-75"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
            Traditional Education
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
            {row.badge}
          </span>
        </div>
        <h4 className="mt-2.5 text-lg font-bold text-slate-700 sm:text-xl">
          {row.tradTitle}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
          {row.tradSub}
        </p>
      </div>

      {/* Center: Scroll-Activated Quantum Bridge Node */}
      <div className="relative z-10 flex items-center justify-center py-1 lg:py-0">
        <motion.div
          animate={
            isInView
              ? {
                  scale: [1, 1.1, 1],
                  boxShadow: "0 0 28px rgba(43, 214, 180, 0.55)",
                }
              : {
                  scale: 0.92,
                  boxShadow: "0 0 0px rgba(43, 214, 180, 0)",
                }
          }
          transition={{ duration: 0.45 }}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-colors duration-500 ${
            isInView
              ? "border-[#2BD6B4] bg-[#054038] text-[#2BD6B4]"
              : "border-[#CFE3DD] bg-white text-[#5C7772]"
          }`}
        >
          <Icon name={row.icon} size={22} />
        </motion.div>
      </div>

      {/* Right: Q-School Quantum Capability Upgrade Card */}
      <div
        className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-0.5 sm:p-7 ${
          isInView
            ? "border-[#0E937E] bg-gradient-to-br from-[#054038] via-[#064B42] to-[#032621] text-white shadow-[0_22px_50px_-16px_rgba(5,64,56,0.45)]"
            : "border-[#CDE3DD] bg-white text-[#05332C] shadow-sm"
        }`}
      >
        {/* Subtle Radial Glow when Active */}
        {isInView && (
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#2BD6B4]/20 blur-2xl"
            aria-hidden
          />
        )}

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
              isInView
                ? "bg-[#2BD6B4]/20 text-[#2BD6B4]"
                : "bg-[#E6F7F3] text-[#096A5B]"
            }`}
          >
            <Icon name="sparkle" size={12} /> Q-School Advantage
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
              isInView
                ? "border border-[#FFD875]/35 bg-[#FFD875]/15 text-[#FFD875]"
                : "bg-[#F1F8F6] text-[#0E937E]"
            }`}
          >
            {row.impactScore}
          </span>
        </div>

        <h4
          className={`relative z-10 mt-3 text-lg font-extrabold sm:text-xl ${
            isInView ? "text-white" : "text-[#05332C]"
          }`}
        >
          {row.qsTitle}
        </h4>

        <p
          className={`relative z-10 mt-1.5 text-xs leading-relaxed sm:text-sm ${
            isInView ? "text-white/85" : "text-[#4A645E]"
          }`}
        >
          {row.qsSub}
        </p>

        {/* Scroll-Animated Capability Bar */}
        <div
          className={`relative z-10 mt-4 h-1.5 w-full overflow-hidden rounded-full ${
            isInView ? "bg-white/15" : "bg-[#E4F0EC]"
          }`}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: isInView ? "100%" : "32%" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#2BD6B4] via-[#5BF0D4] to-[#FFD875]"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function PedagogySection() {
  const [viewMode, setViewMode] = useState<"bridge" | "qschool" | "traditional">("bridge");
  const [selectedAbility, setSelectedAbility] = useState<number>(0);

  const bridgeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bridgeRef,
    offset: ["start 75%", "end 40%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });
  const spineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const activeAb = CORE_ABILITIES[selectedAbility];

  const handleNextAbility = () =>
    setSelectedAbility((prev) => (prev + 1) % CORE_ABILITIES.length);
  const handlePrevAbility = () =>
    setSelectedAbility((prev) => (prev - 1 + CORE_ABILITIES.length) % CORE_ABILITIES.length);

  return (
    <section
      id="pedagogy"
      className="relative scroll-mt-20 bg-gradient-to-b from-[#EEF7F4] via-[#F7FCFA] to-[#EDF6F3] py-24 lg:py-32"
    >
      {/* Subtle Ambient Orbs & Quantum Atom Orbitals (clipped safely so sticky children work) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-40 top-24 h-[460px] w-[460px] rounded-full bg-[#2BD6B4]/12 blur-3xl" />
        <div className="absolute -left-40 bottom-24 h-[460px] w-[460px] rounded-full bg-[#0E937E]/10 blur-3xl" />
        <QuantumAtomOrbital
          theme="light"
          size={360}
          className="absolute -left-24 top-16 opacity-80"
        />
        <QuantumAtomOrbital
          theme="light"
          size={300}
          className="absolute -right-20 bottom-36 opacity-65"
        />
      </div>

      <QuantumWaveStream theme="light" className="mb-8" />

      <div className="container-qs relative z-10">
        {/* ─── PART 1: Header & Provocative Question ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0E937E]/25 bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B6E5F] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#0E937E] animate-ping" />
            Why Q-School?
          </span>

          {/* Balanced Two-Line Display Heading — Never orphans "Q-" */}
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#05332C] sm:text-5xl lg:text-[3.1rem] lg:leading-[1.15]">
            <span className="block text-[#294842]">School teaches the curriculum.</span>
            <span className="mt-1 block bg-gradient-to-r from-[#054038] via-[#0E937E] to-[#17B899] bg-clip-text text-transparent">
              <span className="whitespace-nowrap">Q-School</span> develops the learner.
            </span>
          </h2>

          {/* Provocative Question Pill Banner */}
          <div className="mx-auto mt-6 inline-flex max-w-2xl items-center gap-3 rounded-2xl border border-[#2BD6B4]/40 bg-white/90 px-5 py-3.5 shadow-sm backdrop-blur-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#054038] text-[#2BD6B4]">
              <Icon name="sparkle" size={18} />
            </span>
            <p className="text-left text-sm font-bold italic leading-snug text-[#084D43] sm:text-base">
              &ldquo;Who is systematically developing a child&apos;s ability to learn, think, adapt and create?&rdquo;
            </p>
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#4C6761] sm:text-base">
            Q-School works <strong className="font-bold text-[#05332C]">alongside formal schooling</strong> — building the cognitive engine, focus, and human capabilities that lift every subject at school and every stage of life.
          </p>

          {/* Animated Segmented Lens Switcher */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-[#CBE3DC] bg-white p-1.5 shadow-md">
            {(
              [
                { id: "bridge", label: "⚡ Transformation Bridge" },
                { id: "qschool", label: "✦ Q-School Focus" },
                { id: "traditional", label: "🏛️ Traditional Scope" },
              ] as const
            ).map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={`relative rounded-xl px-4 py-2.5 text-xs font-extrabold transition-colors sm:text-sm ${
                    active ? "text-white" : "text-[#49635D] hover:text-[#05332C]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="pedagogy-view-pill"
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                      className="absolute inset-0 rounded-xl bg-[#054038] shadow-md"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── PART 2: Scroll-Driven Transformation Bridge ─── */}
        <div ref={bridgeRef} className="relative mt-14">
          {viewMode === "bridge" ? (
            <div className="relative">
              {/* Column Headers on Desktop */}
              <div className="mb-6 hidden lg:grid lg:grid-cols-[1fr_84px_1.18fr] lg:gap-6 px-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Standard Schooling Alone
                </div>
                <div className="text-center text-[11px] font-black uppercase tracking-widest text-[#0E937E]">
                  Shift
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#054038]">
                  <span className="h-2 w-2 rounded-full bg-[#0E937E] animate-pulse" />
                  With Q-School (Quantum Schooling)
                </div>
              </div>

              {/* Central Vertical Scroll-Progress Quantum Spine (Desktop) */}
              <div
                className="pointer-events-none absolute bottom-10 top-14 hidden w-1 -translate-x-1/2 rounded-full bg-[#D3E8E2] lg:block"
                style={{ left: "calc((100% - 84px) * (1 / 2.18) + 42px)" }}
                aria-hidden
              >
                <motion.div
                  style={{ height: spineHeight }}
                  className="w-full rounded-full bg-gradient-to-b from-[#0E937E] via-[#2BD6B4] to-[#FFD875] shadow-[0_0_16px_rgba(43,214,180,0.8)]"
                />
              </div>

              <div className="space-y-5">
                {COMPARISON_ROWS.map((row, idx) => (
                  <TransformationRowCard
                    key={row.id}
                    row={row}
                    index={idx}
                    viewMode="bridge"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {COMPARISON_ROWS.map((row, idx) => (
                <TransformationRowCard
                  key={row.id}
                  row={row}
                  index={idx}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── PART 3: 10 Core Abilities Interactive Neural Console ─── */}
        <div className="mt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#054038] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#2BD6B4]">
              <Icon name="award" size={14} />
              10 Core Abilities Developed
            </span>
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-[#05332C] sm:text-4xl">
              Marks Show What a Child Knows.{" "}
              <span className="text-[#0E937E]">Abilities Shape What They Can Do.</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#4C6761] sm:text-base">
              Hover or tap any of the 10 core abilities below to inspect the live classroom drill and real-world changes parents observe at home.
            </p>
          </motion.div>

          {/* Side-by-Side Interactive Console: Left 10 Tiles + Right Live Drill Stage */}
          <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Left (7 Cols): 2x5 Interactive Ability Tiles */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-2 lg:col-span-7">
              {CORE_ABILITIES.map((ab, idx) => {
                const isSelected = selectedAbility === idx;
                return (
                  <motion.button
                    key={ab.num}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, delay: idx * 0.035 }}
                    onMouseEnter={() => setSelectedAbility(idx)}
                    onClick={() => setSelectedAbility(idx)}
                    className={`group relative flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${
                      isSelected
                        ? "border-[#0E937E] bg-white shadow-[0_16px_38px_-12px_rgba(14,147,126,0.28)] -translate-y-0.5 ring-2 ring-[#2BD6B4]/40"
                        : "border-[#D3E7E1] bg-white/75 hover:border-[#0E937E]/60 hover:bg-white"
                    }`}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: isSelected ? ab.color : "#054038" }}
                    >
                      <Icon name={ab.icon} size={20} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black tracking-wider text-[#0E937E]">
                          ABILITY {ab.num}
                        </span>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-[#0E937E] animate-ping" />
                        )}
                      </div>
                      <h4 className="mt-0.5 truncate text-sm font-extrabold text-[#05332C] sm:text-base">
                        {ab.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#58736C]">
                        {ab.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Right (5 Cols): Live Dark-Emerald Classroom Drill Stage */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 relative flex h-full flex-col justify-between overflow-hidden rounded-[30px] border border-[#2BD6B4]/35 bg-gradient-to-br from-[#042F29] via-[#054038] to-[#021915] text-white shadow-[0_28px_70px_-18px_rgba(4,45,39,0.5)]">
                <BorderBeam size={260} duration={12} colorFrom="#2BD6B4" colorTo="#FFC845" borderWidth={2} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAb.num}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-1 flex-col justify-between"
                  >
                    {/* Visual Program Header */}
                    <div>
                      <div className="relative h-52 w-full overflow-hidden">
                        <img
                          src={activeAb.image}
                          alt={activeAb.name}
                          className="h-full w-full object-cover object-center"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#042F29] via-[#042F29]/45 to-black/20"
                          aria-hidden
                        />

                        <div className="absolute left-5 right-5 top-4 flex items-center justify-between">
                          <span className="rounded-full border border-[#2BD6B4]/40 bg-[#03221D]/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#2BD6B4] backdrop-blur-md">
                            {activeAb.programTag}
                          </span>
                          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
                            {activeAb.num} / 10
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-6 right-6 flex items-center gap-3">
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ring-2 ring-white/20"
                            style={{ backgroundColor: activeAb.color }}
                          >
                            <Icon name={activeAb.icon} size={22} />
                          </span>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ED8CC]">
                              Core Capability Spotlight
                            </p>
                            <h4 className="text-2xl font-extrabold tracking-tight text-white">
                              {activeAb.name}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Deep-Dive Details */}
                      <div className="space-y-4 p-6 sm:p-7">
                        <p className="text-sm leading-relaxed text-white/85 sm:text-[15px]">
                          {activeAb.desc}
                        </p>

                        <div className="rounded-2xl border border-[#2BD6B4]/30 bg-white/[0.07] p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                            <Icon name="sparkle" size={14} />
                            In-Class Quantum Drill
                          </div>
                          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-white">
                            {activeAb.drill}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#FFC845]/30 bg-[#FFC845]/[0.08] p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#FFD875]">
                            <Icon name="checkCircle" size={14} />
                            What Parents Notice at Home
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-white/90">
                            {activeAb.parentSign}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation Bar */}
                    <div className="flex items-center justify-between border-t border-white/15 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrevAbility}
                          aria-label="Previous ability"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:border-[#2BD6B4] hover:bg-[#2BD6B4] hover:text-[#03221D]"
                        >
                          <Icon name="chevLeft" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextAbility}
                          aria-label="Next ability"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:border-[#2BD6B4] hover:bg-[#2BD6B4] hover:text-[#03221D]"
                        >
                          <Icon name="chevRight" size={16} />
                        </button>
                      </div>

                      <a
                        href="#demo"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#2BD6B4] px-4 py-2 text-xs font-extrabold text-[#03221D] shadow-md transition hover:bg-[#52E5C6]"
                      >
                        Book a BMIT Assessment <Icon name="arrowRight" size={14} />
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
