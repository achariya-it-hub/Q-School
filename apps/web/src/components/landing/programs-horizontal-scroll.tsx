"use client";

import { useRef, useState, type MouseEvent } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { PROGRAMS, type Program } from "@qschool/shared";

function ProgramCard({ program }: { program: Program }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for 3D tilt
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(springY, [-100, 100], [8, -8]);
  const rotateY = useTransform(springX, [-100, 100], [-8, 8]);

  const [expanded, setExpanded] = useState(false);

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

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-[320px] sm:w-[380px] p-6 sm:p-8 rounded-3xl border border-white/15 bg-gradient-to-b from-[#054038]/90 to-[#02211C]/95 backdrop-blur-xl mx-3 sm:mx-4 group hover:border-[#2BD6B4]/60 transition-colors duration-300 shadow-2xl flex flex-col justify-between"
    >
      {/* Glowing radial gradient follower */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "radial-gradient(500px circle at center, rgba(43, 214, 180, 0.18), transparent 60%)",
        }}
      />

      <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
        {/* Photo Container */}
        <div className="relative -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-5 h-44 overflow-hidden rounded-t-3xl bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.image || `/images/programs/${program.slug}.jpg`}
            alt={program.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#054038] via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded-full bg-white/95 px-3 py-0.5 text-xs font-black text-brand-deep shadow-md">
              {program.tags[0] || "Ages 6–14"}
            </span>
            <span className="text-[11px] font-bold text-[#2BD6B4] drop-shadow">
              48 Classes / Annum
            </span>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#2BD6B4] transition">
          {program.title}
        </h3>
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed mt-2 line-clamp-3">
          {program.overview}
        </p>

        {/* Highlights */}
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

        {/* Expandable Syllabus */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 border-t border-white/15 pt-3 text-xs text-white/90 space-y-1.5"
          >
            <p className="font-bold text-[#2BD6B4]">Syllabus Modules:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-white/80">
              {program.curriculum.slice(0, 4).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Card Actions */}
      <div className="relative z-10 mt-6 border-t border-white/15 pt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-[#2BD6B4] hover:underline"
        >
          {expanded ? "Hide Syllabus ↑" : "Quick Syllabus ↓"}
        </button>
        <a
          href={`/programs/${program.slug}`}
          className="rounded-xl bg-[#2BD6B4] px-4 py-2 text-xs font-black text-brand-deep shadow-md hover:bg-white transition"
        >
          Explore →
        </a>
      </div>
    </motion.div>
  );
}

export function ProgramsHorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Maps vertical scroll to horizontal glide
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-72%"]);

  const programs = PROGRAMS;

  return (
    <section ref={containerRef} id="programs" className="relative lg:h-[360vh] bg-[#021F1B] text-white">
      {/* Sticky Container for Desktop */}
      <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center overflow-hidden py-16 lg:py-0">
        {/* Section Header */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto w-full mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[#2BD6B4] font-black tracking-wider text-xs sm:text-sm uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
                The Q-School Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-3 tracking-tight">
                8 Programs. One Continuous Journey.
              </h2>
              <p className="text-white/80 mt-2 text-sm sm:text-base max-w-xl">
                Structured neuro-cognitive development, speed learning, and leadership across 48 classes per annum.
              </p>
            </div>
            <a
              href="#demo"
              className="btn-3d btn-3d-mint text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md w-fit"
            >
              Book Free Demo for Any Program →
            </a>
          </div>
        </div>

        {/* Horizontal Track for Desktop / Horizontal Overflow for Mobile */}
        <div className="overflow-x-auto lg:overflow-visible no-scrollbar pb-6 lg:pb-0">
          <motion.div
            style={{ x }}
            className="flex items-stretch pl-6 md:pl-12 w-max lg:w-auto"
          >
            {programs.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}

            {/* Final CTA Card at the end */}
            <div className="flex-shrink-0 w-[300px] sm:w-[360px] p-8 rounded-3xl border border-dashed border-[#2BD6B4]/50 bg-gradient-to-br from-[#054038]/60 to-[#02211C]/60 backdrop-blur-md mx-4 flex flex-col justify-center items-center text-center shadow-xl">
              <span className="text-3xl mb-3">🎯</span>
              <h3 className="text-2xl font-black text-white mb-2">Not Sure Where to Start?</h3>
              <p className="text-white/80 text-xs sm:text-sm mb-6 leading-relaxed">
                Take our 60-second interactive diagnostic assessment to identify your child&apos;s cognitive profile and ideal pathway.
              </p>
              <a
                href="#diagnostic-quiz"
                className="rounded-full bg-white text-brand-deep font-black px-6 py-3 text-xs sm:text-sm hover:bg-[#2BD6B4] transition shadow-lg"
              >
                Take the Cognitive Quiz →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Progress Indicator for Desktop */}
        <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-3">
          <span className="text-[11px] text-[#2BD6B4] font-bold uppercase tracking-widest">
            Scroll to Explore 8 Programs
          </span>
          <div className="w-36 h-1.5 bg-white/15 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full bg-gradient-to-r from-[#0E937E] via-[#2BD6B4] to-[#5B6CF0] origin-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
