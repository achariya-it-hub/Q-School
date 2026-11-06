"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { QuantumBrainMesh } from "@/components/three/quantum-brain-mesh";
import { QuantumNexus } from "@/components/three/quantum-nexus";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface AiVsHiItem {
  hiTitle: string;
  hiDesc: string;
  aiContrast: string;
}

const aiVsHiData: AiVsHiItem[] = [
  {
    hiTitle: "Thinks Critically & Independently",
    hiDesc: "Goes beyond algorithmic bias to question, analyze, and form original judgements without relying on statistical templates.",
    aiContrast: "Generates statistical outputs strictly based on historical training data patterns.",
  },
  {
    hiTitle: "Creates & Imagines",
    hiDesc: "Drives novel artistic, mathematical and scientific breakthroughs through true original consciousness and creative intuition.",
    aiContrast: "Remixes existing internet datasets to generate plausible, but derivative, content.",
  },
  {
    hiTitle: "Understands Emotion & Empathy",
    hiDesc: "Connects with human shared values, fostering emotional self-regulation, deep listening, and enduring peer trust.",
    aiContrast: "Simulates conversational empathy and tone matching without genuine feeling or consciousness.",
  },
  {
    hiTitle: "Applies Ethical Responsibility",
    hiDesc: "Leads humanity with an inner moral compass, holistic accountability, and purposeful action for future generations.",
    aiContrast: "Operates strictly within programmed objective functions and automated optimization metrics.",
  },
];

function ScrollHighlightCard({
  item,
}: {
  item: AiVsHiItem;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Triggers when card is in the vertical center of the screen
  const isInView = useInView(ref, { margin: "-30% 0px -30% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.35, scale: 0.95, x: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0.35, scale: 0.95, x: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative p-8 rounded-3xl border transition-all duration-500 ${
        isInView
          ? "border-[#2BD6B4] bg-gradient-to-br from-[#054038]/80 to-[#0A2924]/90 shadow-[0_0_50px_-10px_rgba(43,214,180,0.35)] backdrop-blur-md"
          : "border-white/10 bg-white/5 backdrop-blur-xs"
      }`}
    >
      {/* Active Indicator Line */}
      <motion.div
        className="absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full bg-gradient-to-b from-[#2BD6B4] to-[#0E937E]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isInView ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ originY: 0 }}
      />

      <div className="pl-4">
        <h4 className="text-2xl font-bold text-white mb-3 flex flex-wrap items-center gap-3">
          {item.hiTitle}
          {isInView && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs px-3 py-1 rounded-full bg-[#2BD6B4]/25 text-[#2BD6B4] border border-[#2BD6B4]/40 font-bold"
            >
              Q-School Focus
            </motion.span>
          )}
        </h4>
        <p className="text-white/90 text-lg leading-relaxed mb-5 font-normal">
          {item.hiDesc}
        </p>

        {/* AI Contrast Box */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/40 border border-white/10">
          <span className="text-[#2BD6B4] text-xs font-mono font-bold mt-0.5">AI LIMIT:</span>
          <p className="text-white/60 text-sm italic">{item.aiContrast}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AiVsHiSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const aiOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.7, 0.7, 1]);

  return (
    <section ref={containerRef} id="ai-vs-hi" className="relative bg-[#054038] py-24 md:py-32 overflow-hidden text-white">
      {/* 3D Quantum Synapse Background */}
      <QuantumNexus className="pointer-events-none absolute inset-0 opacity-35" particleCount={100} speed={0.4} colorScheme="teal" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2BD6B4]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#2BD6B4] font-black tracking-wider text-xs sm:text-sm uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
            The Future of Learning
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mt-5 mb-5 tracking-tight">
            AI Can Process. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2BD6B4] via-[#7BF2DA] to-[#FFC845]">
              Human Intelligence Transforms.
            </span>
          </h2>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            While machines automate calculation and process datasets, Q-School empowers children to build the human faculties that remain vital: attention, imagination, and original thought.
          </p>
        </motion.div>

        {/* 3D Interactive Dual-Hemisphere Brain Mesh */}
        <div className="mb-14">
          <QuantumBrainMesh />
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* LEFT: Sticky AI Column */}
          <motion.div
            className="hidden lg:block relative"
            style={{ opacity: aiOpacity }}
          >
            <div className="sticky top-28 p-8 sm:p-10 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner">
                  🤖
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Artificial Intelligence (AI)</h3>
                  <p className="text-xs sm:text-sm text-white/60">Automated Computation &amp; Pattern Matching</p>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed mb-6 text-base">
                AI systems process data at scale within predefined boundaries. They calculate probabilities, but cannot experience curiosity, ethical conviction, or spontaneous creative intuition.
              </p>
              <ul className="space-y-4">
                {[
                  "Processes information at vast speeds across static databases",
                  "Recognises statistical patterns from past inputs",
                  "Automates repetitive workflows and code scaffolds",
                  "Operates strictly within programmed optimization parameters",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60 text-sm sm:text-base">
                    <span className="mt-2 w-2 h-2 rounded-full bg-white/40 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl bg-white/10 p-4 border border-white/10 text-xs text-white/70">
                <span className="font-bold text-[#2BD6B4]">Machine Limit:</span> Lacks emotional nuance, self-awareness, moral agency, and physical-sensory perception.
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Scrolling HI Column */}
          <div className="space-y-8">
            {aiVsHiData.map((item, index) => (
              <ScrollHighlightCard
                key={index}
                item={item}
                index={index}
                total={aiVsHiData.length}
              />
            ))}
          </div>
        </div>

        {/* Bottom Magnetic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mt-20"
        >
          <MagneticButton href="#demo">
            Develop Your Child&apos;s Human Intelligence
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
