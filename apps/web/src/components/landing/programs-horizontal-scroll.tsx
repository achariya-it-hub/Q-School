"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROGRAMS, type Program } from "@qschool/shared";
import { Icon, type IconName } from "@/components/icons";
import { SpotlightCard, BorderBeam } from "@/components/ui/21st";

type CategoryKey = "all" | "sensory" | "mastery" | "stem";

const CATEGORIES: { id: CategoryKey; label: string; count: number; icon: IconName }[] = [
  { id: "all", label: "All 8 Programs", count: 8, icon: "grid" },
  { id: "sensory", label: "Sensory & Intuition (01–03)", count: 3, icon: "eye" },
  { id: "mastery", label: "Memory, Speed & Life Skills (04–06)", count: 3, icon: "brain" },
  { id: "stem", label: "Visual Maths & Science (07–08)", count: 2, icon: "planet" },
];

const PROGRAM_CATEGORY: Record<string, CategoryKey> = {
  "quantum-vision": "sensory",
  "quantum-creation": "sensory",
  "quantum-way": "sensory",
  "quantum-learning": "mastery",
  "quantum-reading": "mastery",
  "quantum-mastery": "mastery",
  "q-maths": "stem",
  "q-science": "stem",
};

const PROGRAM_ACCENTS = [
  "#0E937E",
  "#5B6CF0",
  "#D97706",
  "#054038",
  "#E2557A",
  "#F29A2E",
  "#2563EB",
  "#10B981",
];

function ProgramBentoCard({
  program,
  index,
  onInspect,
}: {
  program: Program;
  index: number;
  onInspect: (idx: number) => void;
}) {
  const cleanTitle = program.title.replace(/^\d+\.\s*/, "");
  const numLabel = String(index + 1).padStart(2, "0");
  const accent = PROGRAM_ACCENTS[index % PROGRAM_ACCENTS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      className="h-full"
    >
      <SpotlightCard
        spotlightColor="rgba(14, 147, 126, 0.14)"
        borderColor="rgba(14, 147, 126, 0.45)"
        className="group h-full flex flex-col justify-between border-[#CFE3DD] bg-white shadow-[0_12px_34px_-14px_rgba(5,64,56,0.14)] hover:shadow-[0_22px_48px_-14px_rgba(5,64,56,0.24)] hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex flex-col flex-1">
          {/* Top Accent Strip */}
          <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

          {/* Crisp Bright Photography Header */}
          <div className="relative h-52 w-full overflow-hidden bg-[#083A32]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.image || `/images/programs/${program.slug}.jpg`}
              alt={cleanTitle}
              className="h-full w-full object-cover brightness-110 contrast-105 transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle Bottom Gradient Only — Keeps Artwork Bright & Visible */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#03221E]/90 via-[#03221E]/35 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC845] text-xs font-black text-[#03221E] shadow-md">
                {numLabel}
              </span>
              <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#054038] shadow-sm">
                {program.badge || "Q-PROGRAM"}
              </span>
            </div>

            {/* Bottom Photo Meta */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#2BD6B4] px-3 py-0.5 text-xs font-black text-[#03221E] shadow-sm">
                {program.tags[0] || "Ages 6–14"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#03221E]/85 backdrop-blur-sm px-2.5 py-0.5 text-xs font-bold text-[#FFC845] border border-white/15">
                ★ {program.rating.toFixed(1)} · 48 Classes
              </span>
            </div>
          </div>

          {/* Card Content — Aligned & High Contrast */}
          <div className="p-6 flex-1 flex flex-col">
            <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#0E937E]">
              {program.format}
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#054038] group-hover:text-[#0E937E] transition-colors mt-1 leading-snug">
              {cleanTitle}
            </h3>
            <p className="text-[#3f5954] text-sm leading-relaxed mt-2.5">
              {program.overview}
            </p>

            {/* Aligned Key Outcomes List */}
            <ul className="mt-4 pt-4 border-t border-[#E8F2EF] space-y-2">
              {program.learn.slice(0, 3).map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs sm:text-[13px] font-semibold text-[#1f3530]"
                >
                  <Icon
                    name="checkCircle"
                    size={15}
                    className="text-[#0E937E] shrink-0 mt-0.5"
                  />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aligned Card Footer Actions */}
        <div className="px-6 pb-6 pt-4 border-t border-[#E8F2EF] bg-[#F9FCFB] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onInspect(index)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#BFE0D8] bg-white hover:bg-[#E6F4F0] px-3.5 py-2.5 text-xs font-extrabold text-[#054038] transition shadow-sm"
          >
            <Icon name="book" size={14} className="text-[#0E937E]" />
            View Syllabus
          </button>
          <a
            href="#demo"
            className="btn-3d btn-3d-teal inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white"
          >
            Book Demo <Icon name="arrowRight" size={13} />
          </a>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export function ProgramsHorizontalScroll() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [inspectedIdx, setInspectedIdx] = useState<number | null>(null);

  const allPrograms = PROGRAMS;

  const filteredPrograms = allPrograms
    .map((program, originalIndex) => ({ program, originalIndex }))
    .filter(({ program }) => {
      if (selectedCategory === "all") return true;
      return PROGRAM_CATEGORY[program.slug] === selectedCategory;
    });

  const selectedProgram = inspectedIdx !== null ? allPrograms[inspectedIdx] : null;

  return (
    <>
      <section
        id="programs"
        className="relative scroll-mt-20 bg-gradient-to-b from-[#F4FAF8] via-white to-[#EAF5F1] py-24 md:py-28 border-t border-[#D7EAE4]"
      >
        {/* Subtle Decorative Background Accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#2BD6B4]/15 blur-3xl" />
          <div className="absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-[#0E937E]/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Clean, Unclipped, Symmetrical Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#054038] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#2BD6B4] shadow-sm">
              <Icon name="grid" size={14} /> The Q-School Curriculum · Ages 6–14
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#054038] leading-[1.15]">
              8 Signature Programs.{" "}
              <span className="text-[#0E937E]">One Holistic Ecosystem.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">
              From sensory focus and memory palaces to 3× Quantum Reading, visual Q-Maths, whole-brain Q-Science, and leadership mastery — explore every pillar of our 48-class annual journey.
            </p>
          </motion.div>

          {/* Aligned Category Filter Bar (Wraps Cleanly — Zero Horizontal Scrollbars) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                    isSelected
                      ? "text-white shadow-md"
                      : "bg-white text-[#3f5954] border border-[#CFE3DD] hover:border-[#0E937E] hover:text-[#054038]"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="programs-category-pill"
                      transition={{ type: "spring", stiffness: 340, damping: 28 }}
                      className="absolute inset-0 rounded-full bg-[#054038]"
                    />
                  )}
                  <Icon
                    name={cat.icon}
                    size={15}
                    className={`relative z-10 ${
                      isSelected ? "text-[#2BD6B4]" : "text-[#0E937E]"
                    }`}
                  />
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Perfectly Aligned 3-Column Bento Grid (8 Programs + 9th Diagnostic Guide Card) */}
          <motion.div
            layout
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch"
          >
            {filteredPrograms.map(({ program, originalIndex }) => (
              <ProgramBentoCard
                key={program.slug}
                program={program}
                index={originalIndex}
                onInspect={(idx) => setInspectedIdx(idx)}
              />
            ))}

            {/* 9th Card: Symmetrical Pathway Guidance & Courses CTA Card */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="h-full"
            >
              <div className="relative h-full overflow-hidden rounded-3xl border border-[#2BD6B4]/50 bg-gradient-to-b from-[#054038] via-[#04332C] to-[#021E1A] p-7 text-white shadow-xl flex flex-col justify-between">
                <BorderBeam size={220} duration={11} colorFrom="#2BD6B4" colorTo="#FFC845" />

                <div>
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/15 mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/side-brain.png"
                      alt="Personalised Q-School Cognitive Pathway"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03221E] via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-[#FFC845] px-3 py-1 text-[11px] font-black text-[#03221E] shadow-md">
                      Personalised Recommendation
                    </span>
                  </div>

                  <span className="text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
                    Guided Selection
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 leading-snug">
                    Not Sure Which Program Fits Your Child Best?
                  </h3>
                  <p className="text-sm text-white/85 leading-relaxed mt-3">
                    Every learner aged 6–14 starts with a personalised cognitive readiness check so our mentors match the right foundation and pace.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/15 space-y-3">
                  <a
                    href="#diagnostic-quiz"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2BD6B4] hover:bg-[#FFC845] px-5 py-3 text-xs sm:text-sm font-black text-[#03221E] transition shadow-lg"
                  >
                    <Icon name="sparkle" size={16} />
                    Take 60-Sec Cognitive Quiz →
                  </a>
                  <a
                    href="/courses"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-xs font-bold text-white transition"
                  >
                    View Age-Group Courses (6–14 Yrs) →
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RBIQ Whole Brain Development Spotlight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="mt-10 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center"
          >
            <div className="relative h-56 lg:h-full lg:col-span-4 min-h-[210px] overflow-hidden bg-[#054038]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/rbiq/rbiq-hero.jpg"
                alt="RBIQ Whole Brain Development Program"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03221E]/75 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 rounded-full bg-[#FFC845] px-3 py-1 text-[11px] font-black text-[#03221E] shadow-md">
                9 Skill-Building Activities
              </span>
            </div>

            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4F0] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0E937E]">
                  <Icon name="brain" size={13} /> RBIQ – Whole Brain Development Program
                </span>
                <h3 className="mt-2 text-2xl font-extrabold text-[#054038]">
                  Unlock Potential. Engineer Brilliance.
                </h3>
                <p className="mt-1.5 text-sm text-[#4b635e] max-w-xl leading-relaxed">
                  Cup Stacking · Rubik&apos;s Cube · Clairaudience · Parallel Processing · Rope Knot · Towel Folding · Abacus · Speed Reading · Ambidexterity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="/rbiq"
                  className="btn-3d btn-3d-teal inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-extrabold text-white"
                >
                  Explore RBIQ <Icon name="arrowRight" size={14} />
                </a>
                <a
                  href="/rbiq#book-assessment"
                  className="rounded-xl border border-[#BFE0D8] bg-[#F4FAF8] hover:bg-[#E6F4F0] px-4 py-3 text-xs sm:text-sm font-extrabold text-[#054038] transition"
                >
                  Book an Assessment
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Program Deep-Dive Syllabus Modal (With Prev / Next Switcher) */}
      <AnimatePresence>
        {selectedProgram && inspectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectedIdx(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6"
          >
            <motion.div
              key={selectedProgram.slug}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#CFE3DD] bg-white text-brand-ink shadow-2xl"
            >
              {/* Modal Photo Header */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#054038]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProgram.image || `/images/programs/${selectedProgram.slug}.jpg`}
                  alt={selectedProgram.title}
                  className="h-full w-full object-cover brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#032621] via-[#032621]/35 to-transparent" />

                {/* Top Controls: Prev / Next / Close */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setInspectedIdx(
                          (inspectedIdx - 1 + allPrograms.length) % allPrograms.length,
                        )
                      }
                      aria-label="Previous program"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-[#2BD6B4] hover:text-[#032621] transition"
                    >
                      <Icon name="chevLeft" size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectedIdx((inspectedIdx + 1) % allPrograms.length)}
                      aria-label="Next program"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-[#2BD6B4] hover:text-[#032621] transition"
                    >
                      <Icon name="chevRight" size={17} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedIdx(null)}
                    aria-label="Close syllabus modal"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-[#E2557A] transition"
                  >
                    <Icon name="x" size={17} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="rounded-full bg-[#2BD6B4] px-3 py-1 text-xs font-black text-[#032621]">
                    {selectedProgram.format}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-2">
                    {selectedProgram.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-sm sm:text-base text-[#3f5954] leading-relaxed font-medium">
                  {selectedProgram.overview}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-[#F2FAF8] border border-[#CFE3DD] p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#0E937E] mb-3">
                      What Your Child Develops
                    </p>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-brand-ink font-semibold">
                      {selectedProgram.learn.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Icon
                            name="checkCircle"
                            size={16}
                            className="text-[#0E937E] shrink-0 mt-0.5"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-[#FFFDF6] border border-[#F3DFA2] p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#B7791F] mb-3">
                      Core Curriculum Modules
                    </p>
                    <ol className="space-y-2.5 text-xs sm:text-sm text-brand-ink font-semibold">
                      {selectedProgram.curriculum.map((mod, idx) => (
                        <li key={mod} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FFC845] text-[11px] font-black text-[#03221E]">
                            0{idx + 1}
                          </span>
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#054038] text-white p-5">
                  <div>
                    <p className="text-sm sm:text-base font-extrabold">
                      Experience {selectedProgram.title.replace(/^\d+\.\s*/, "")} Live
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Free 45-minute diagnostic demo session at any of our 9 centres or online.
                    </p>
                  </div>
                  <a
                    href="#demo"
                    onClick={() => setInspectedIdx(null)}
                    className="rounded-xl bg-[#2BD6B4] px-6 py-3 text-xs sm:text-sm font-black text-[#032621] hover:bg-[#FFC845] transition shrink-0 shadow-md"
                  >
                    Book Free Demo →
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
