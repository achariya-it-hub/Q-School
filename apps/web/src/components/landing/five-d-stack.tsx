"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Dimension {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  desc: string;
  drills: string;
  outcome: string;
}

const dimensions: Dimension[] = [
  {
    id: "X",
    title: "CONSCIOUS",
    subtitle: "Focus & Understand",
    color: "from-[#0E937E] to-[#2BD6B4]",
    desc: "Attention, observation, and conscious engagement with learning. Builds high cognitive stamina and active listening.",
    drills: "Dual-n-back sensory drills, candle concentration focus, 45-minute unbroken attention blocks.",
    outcome: "Filters out digital noise and screen fatigue; cultivates deep, calm focus.",
  },
  {
    id: "Y",
    title: "DEEP LEARNING",
    subtitle: "Practise & Internalise",
    color: "from-[#5B6CF0] to-[#8B5CF6]",
    desc: "Repetition, reinforcement, and skill internalisation through multi-sensory experiential drills.",
    drills: "Memory palace loci navigation, visual association matrices, right-brain chunking exercises.",
    outcome: "Anchors mental frameworks permanently without tedious rote cramming.",
  },
  {
    id: "Z",
    title: "FLOW & APPLICATION",
    subtitle: "Apply & Express",
    color: "from-[#F29A2E] to-[#F59E0B]",
    desc: "Applying and expressing learning naturally and confidently in complex real-world scenarios.",
    drills: "Inventive robotics challenges, lateral logic riddles, collaborative cross-disciplinary builds.",
    outcome: "Transforms theoretical knowledge into confident, spontaneous creative execution.",
  },
  {
    id: "T",
    title: "TIME",
    subtitle: "Speed, Fluency & Efficiency",
    color: "from-[#E2557A] to-[#EC4899]",
    desc: "Developing speed, fluency, organisation, rapid information processing, and time mastery.",
    drills: "Speed mental Vedic math sprints, rapid visual text absorption, timed conceptual articulation.",
    outcome: "Multiplies computation and reading speed by 3x while preserving deep comprehension.",
  },
  {
    id: "P",
    title: "PEAK POSSIBILITY",
    subtitle: "Potential in Action",
    color: "from-[#2BD6B4] to-[#10B981]",
    desc: "Creative confidence, ethical leadership, moral courage, and bringing out the best in oneself and others.",
    drills: "Capstone social innovation projects, ethical dilemma debate circles, peer mentoring.",
    outcome: "Graduates resilient, empathetic leaders grounded in authentic human values.",
  },
];

export function FiveDFramework() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % dimensions.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + dimensions.length) % dimensions.length);

  const activeDim = dimensions[activeIndex];

  return (
    <section id="framework" className="relative bg-[#042823] py-24 md:py-32 overflow-hidden text-white border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#2BD6B4] font-black tracking-wider text-xs sm:text-sm uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
            Proprietary Architecture
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            The Q 5D™ XYZTP Framework
          </h2>
          <p className="text-white/80 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            One framework. Five dimensions. A progressive developmental journey orchestrating every child&apos;s transformation from understanding to peak performance.
          </p>
        </div>

        {/* 3D Stack Container */}
        <div className="relative h-[540px] md:h-[480px] flex items-center justify-center perspective-1000">
          {/* Dynamic Background Glow for active card */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.35, scale: 1.25 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className={`absolute w-[440px] h-[440px] rounded-full blur-[120px] bg-gradient-to-r ${activeDim.color} pointer-events-none`}
          />

          {/* The Stacked Cards */}
          <div className="relative w-full max-w-xl h-full flex items-center justify-center">
            {dimensions.map((dim, index) => {
              // Calculate position relative to active index
              let offset = index - activeIndex;
              if (offset > 2) offset -= dimensions.length;
              if (offset < -2) offset += dimensions.length;

              const isActive = offset === 0;
              const zIndex = dimensions.length - Math.abs(offset);

              // 3D Transform values
              const scale = 1 - Math.abs(offset) * 0.08;
              const translateY = offset * 26;
              const translateZ = -Math.abs(offset) * 90;
              const opacity = 1 - Math.abs(offset) * 0.28;

              return (
                <motion.div
                  key={dim.id}
                  initial={false}
                  animate={{
                    scale,
                    y: translateY,
                    z: translateZ,
                    opacity: isActive ? 1 : opacity,
                    zIndex,
                    rotateX: isActive ? 0 : offset * -4,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 28 }}
                  onClick={() => (isActive ? null : setActiveIndex(index))}
                  className={`
                    absolute w-full max-w-lg p-7 sm:p-9 rounded-3xl border backdrop-blur-xl cursor-pointer transition-colors duration-300
                    ${
                      isActive
                        ? "border-[#2BD6B4]/60 bg-gradient-to-br from-[#054038]/95 to-[#02211C]/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }
                  `}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Gradient Accent Line */}
                  <div
                    className={`absolute top-0 left-8 right-8 h-1.5 rounded-b-full bg-gradient-to-r ${dim.color} ${
                      isActive ? "opacity-100 shadow-[0_0_12px_rgba(43,214,180,0.8)]" : "opacity-30"
                    }`}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${dim.color}`}>
                        {dim.id}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{dim.title}</h3>
                      <p className="text-[#2BD6B4] font-bold text-sm sm:text-base mt-0.5">{dim.subtitle}</p>
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-[#2BD6B4] px-3 py-1 text-xs font-black text-brand-deep shadow-md">
                        Active Dimension
                      </span>
                    ) : (
                      <span className="text-xs text-white/50 font-semibold">Click to inspect</span>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pt-2"
                      >
                        <p className="text-white/90 text-base leading-relaxed">{dim.desc}</p>

                        <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                          <p className="text-[11px] font-black uppercase tracking-wider text-[#2BD6B4]">
                            Classroom Neural Drills
                          </p>
                          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">{dim.drills}</p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                          <p className="text-[11px] font-black uppercase tracking-wider text-[#2BD6B4]">
                            Developmental Milestone
                          </p>
                          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">{dim.outcome}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous dimension"
            className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/15 transition-colors font-bold text-lg"
          >
            ←
          </button>

          <div className="flex gap-2.5">
            {dimensions.map((dim, index) => (
              <button
                key={dim.id}
                type="button"
                aria-label={`Jump to dimension ${dim.id}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-10 bg-[#2BD6B4] shadow-[0_0_10px_#2BD6B4]" : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next dimension"
            className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/15 transition-colors font-bold text-lg"
          >
            →
          </button>
        </div>

        {/* 5 Interconnected Dimensions Banner */}
        <div className="mt-16 rounded-3xl bg-white/5 border border-white/15 p-6 sm:p-8 backdrop-blur-md">
          <p className="text-xs font-black uppercase tracking-widest text-[#2BD6B4] text-center mb-4">
            Progressive Developmental Flow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-bold text-xs sm:text-sm">
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">UNDERSTAND</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">PRACTISE</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">INTERNALISE</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">APPLY</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-[#2BD6B4] text-brand-deep px-5 py-2 font-black shadow-md">
              EXPRESS (PEAK)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
