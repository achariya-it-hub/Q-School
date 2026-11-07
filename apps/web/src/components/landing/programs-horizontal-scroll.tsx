"use client";

import { useRef, useState, type MouseEvent } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { PROGRAMS, type Program } from "@qschool/shared";
import { Icon } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";

function ProgramCard({
  program,
  index,
  onInspect,
}: {
  program: Program;
  index: number;
  onInspect: (p: Program) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 16 });
  const springY = useSpring(y, { stiffness: 150, damping: 16 });

  const rotateX = useTransform(springY, [-100, 100], [6, -6]);
  const rotateY = useTransform(springX, [-100, 100], [-6, 6]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cleanTitle = program.title.replace(/^\d+\.\s*/, "");
  const numLabel = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-[320px] sm:w-[375px] p-6 sm:p-7 rounded-3xl border border-white/15 bg-gradient-to-b from-[#06453C]/95 to-[#02211C]/95 backdrop-blur-xl mx-3 sm:mx-4 group hover:border-[#2BD6B4]/70 transition-colors duration-300 shadow-2xl flex flex-col justify-between"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(480px circle at center, rgba(43, 214, 180, 0.16), transparent 65%)",
        }}
      />

      <div className="relative z-10" style={{ transform: "translateZ(24px)" }}>
        {/* Pictorial Header */}
        <div className="relative -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 mb-5 h-48 overflow-hidden rounded-t-3xl bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.image || `/images/programs/${program.slug}.jpg`}
            alt={cleanTitle}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#053B34] via-black/25 to-transparent" />

          {/* Top Bar */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC845] text-xs font-black text-[#03221E] shadow-lg">
              {numLabel}
            </span>
            <span className="rounded-full bg-[#03221E]/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#2BD6B4] border border-[#2BD6B4]/30">
              {program.badge || "Q-PROGRAM"}
            </span>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between">
            <span className="rounded-full bg-white/95 px-3 py-0.5 text-xs font-black text-[#054038] shadow-md">
              {program.tags[0] || "Ages 6–14"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-[#FFC845]">
              ★ {program.rating.toFixed(1)} · 48 Classes
            </span>
          </div>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-[#2BD6B4]">
          {program.format}
        </p>
        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#2BD6B4] transition mt-0.5">
          {cleanTitle}
        </h3>
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed mt-2 line-clamp-3">
          {program.overview}
        </p>

        {/* Key Capability Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {program.learn.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-[#2BD6B4] font-semibold border border-white/10"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Card Actions */}
      <div className="relative z-10 mt-6 border-t border-white/15 pt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onInspect(program)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold text-white transition"
        >
          <Icon name="book" size={14} className="text-[#2BD6B4]" />
          Syllabus &amp; Outcomes
        </button>
        <a
          href="#demo"
          className="rounded-xl bg-[#2BD6B4] px-4 py-2 text-xs font-black text-[#03221E] shadow-md hover:bg-[#FFC845] transition"
        >
          Book Demo →
        </a>
      </div>
    </motion.div>
  );
}

export function ProgramsHorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-68%"]);
  const programs = PROGRAMS;

  return (
    <>
      <section
        ref={containerRef}
        id="programs"
        className="relative lg:h-[340vh] bg-[#021F1B] text-white scroll-mt-16"
      >
        {/* Sticky Viewport for Desktop */}
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center overflow-hidden py-20 lg:py-0">
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-32 right-20 h-96 w-96 rounded-full bg-[#0E937E]/20 blur-3xl"
            aria-hidden
          />

          {/* Section Header + Quick Program Inspector Pills */}
          <div className="px-6 md:px-12 max-w-7xl mx-auto w-full mb-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[#2BD6B4] font-black tracking-wider text-xs uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
                  <Icon name="grid" size={14} /> 8 Signature Q-School Programs
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-3 tracking-tight">
                  8 Programs. <span className="text-[#2BD6B4]">One Holistic Ecosystem.</span>
                </h2>
                <p className="text-white/80 mt-2 text-sm sm:text-base max-w-2xl">
                  From sensory activation and memory palaces to visual Q-Maths, whole-brain Q-Science, and leadership mastery — click any program pill to inspect its syllabus.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/courses"
                  className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 px-4 py-3 text-xs sm:text-sm font-bold text-white transition"
                >
                  Age-Group Courses →
                </a>
                <a
                  href="#demo"
                  className="btn-3d btn-3d-mint text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md"
                >
                  Book Free Demo →
                </a>
              </div>
            </div>

            {/* Interactive Quick-Inspect Pill Strip */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {programs.map((p, idx) => {
                const shortName = p.title.replace(/^\d+\.\s*/, "");
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSelectedProgram(p)}
                    className="shrink-0 rounded-full border border-white/15 bg-white/5 hover:bg-[#2BD6B4] hover:text-[#03221E] hover:border-[#2BD6B4] px-3.5 py-1.5 text-xs font-bold text-white/85 transition flex items-center gap-1.5"
                  >
                    <span className="text-[#FFC845] group-hover:text-[#03221E] font-black">
                      0{idx + 1}
                    </span>
                    <span>{shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Track (Desktop Scroll-Driven / Mobile Swipeable) */}
          <div className="hidden lg:block">
            <motion.div style={{ x }} className="flex items-stretch pl-12 w-max">
              {programs.map((program, idx) => (
                <ProgramCard
                  key={program.slug}
                  program={program}
                  index={idx}
                  onInspect={(p) => setSelectedProgram(p)}
                />
              ))}

              {/* Final CTA Card */}
              <div className="flex-shrink-0 w-[340px] p-8 rounded-3xl border border-dashed border-[#2BD6B4]/60 bg-gradient-to-br from-[#054038]/70 to-[#02211C]/80 backdrop-blur-md mx-4 flex flex-col justify-center items-center text-center shadow-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2BD6B4]/20 text-[#2BD6B4] border border-[#2BD6B4]/40 mb-4">
                  <Icon name="sparkle" size={30} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Not Sure Where to Begin?
                </h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Take our 60-second cognitive readiness diagnostic to discover the ideal starting track for your child.
                </p>
                <a
                  href="#diagnostic-quiz"
                  className="rounded-full bg-[#FFC845] text-[#03221E] font-black px-6 py-3 text-sm hover:bg-white transition shadow-lg"
                >
                  Take the Cognitive Quiz →
                </a>
              </div>
            </motion.div>
          </div>

          {/* Mobile / Tablet Touch-Scrollable Grid */}
          <div className="lg:hidden overflow-x-auto no-scrollbar pb-4">
            <div className="flex items-stretch px-4 w-max">
              {programs.map((program, idx) => (
                <ProgramCard
                  key={program.slug}
                  program={program}
                  index={idx}
                  onInspect={(p) => setSelectedProgram(p)}
                />
              ))}
            </div>
          </div>

          {/* Scroll Progress Indicator for Desktop */}
          <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-3 rounded-full bg-white/5 border border-white/10 px-5 py-2 backdrop-blur-md">
            <span className="text-[11px] text-[#2BD6B4] font-bold uppercase tracking-widest">
              Scroll to Glide Through All 8 Programs
            </span>
            <div className="w-36 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="h-full bg-gradient-to-r from-[#0E937E] via-[#2BD6B4] to-[#FFC845] origin-left"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Program Deep-Dive Syllabus Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProgram(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#2BD6B4]/50 bg-[#032621] text-white shadow-2xl"
            >
              <BorderBeam size={240} duration={10} colorFrom="#2BD6B4" colorTo="#FFC845" />

              {/* Modal Banner */}
              <div className="relative h-56 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProgram.image || `/images/programs/${selectedProgram.slug}.jpg`}
                  alt={selectedProgram.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#032621] via-[#032621]/45 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  aria-label="Close program syllabus"
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-[#2BD6B4] hover:text-[#032621] transition"
                >
                  <Icon name="x" size={18} />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="rounded-full bg-[#2BD6B4] px-3 py-1 text-xs font-black text-[#032621]">
                    {selectedProgram.format}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    {selectedProgram.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {selectedProgram.overview}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#2BD6B4] mb-3">
                      What Your Child Develops
                    </p>
                    <ul className="space-y-2 text-xs sm:text-sm text-white/90">
                      {selectedProgram.learn.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Icon
                            name="checkCircle"
                            size={16}
                            className="text-[#2BD6B4] shrink-0 mt-0.5"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#FFC845] mb-3">
                      Core Curriculum Modules
                    </p>
                    <ol className="space-y-2.5 text-xs sm:text-sm text-white/90">
                      {selectedProgram.curriculum.map((mod, idx) => (
                        <li key={mod} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FFC845]/20 text-[11px] font-black text-[#FFC845]">
                            0{idx + 1}
                          </span>
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#06453C] border border-[#2BD6B4]/30 p-5">
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      Experience {selectedProgram.title.replace(/^\d+\.\s*/, "")} Live
                    </p>
                    <p className="text-xs text-white/75 mt-0.5">
                      Free 45-minute diagnostic demo class at any of our 9 centres or online.
                    </p>
                  </div>
                  <a
                    href="#demo"
                    onClick={() => setSelectedProgram(null)}
                    className="rounded-xl bg-[#2BD6B4] px-6 py-3 text-xs sm:text-sm font-black text-[#032621] hover:bg-[#FFC845] transition shrink-0 shadow-lg"
                  >
                    Book Free Demo Session →
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
