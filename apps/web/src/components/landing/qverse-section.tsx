"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";

interface QVerseSpoke {
  id: string;
  name: string;
  tagline: string;
  icon: IconName;
  color: string;
  image: string;
  desc: string;
  feature: string;
}

const QVERSE_SPOKES: QVerseSpoke[] = [
  {
    id: "01",
    name: "Q Memory",
    tagline: "Effortless Long-Term Recall",
    icon: "brain",
    color: "#0E937E",
    image: "/images/programs/quantum-learning.jpg",
    desc: "Equips learners with spatial memory palaces, visual pegging, and associative encoding so chapters stay anchored permanently.",
    feature: "100-Item Recall & Visual Loci Challenges",
  },
  {
    id: "02",
    name: "Q Vision",
    tagline: "Laser Focus & Sensory Clarity",
    icon: "eye",
    color: "#2BD6B4",
    image: "/images/programs/quantum-vision.jpg",
    desc: "Trains sustained attention stamina, peripheral observation, and calm concentration in an age of digital distraction.",
    feature: "45-Minute Unbroken Focus Stamina",
  },
  {
    id: "03",
    name: "Q Learning",
    tagline: "3× Reading & Study Velocity",
    icon: "book",
    color: "#5B6CF0",
    image: "/images/programs/quantum-reading.jpg",
    desc: "Transforms textbook study through Quantum Reading sweeps, radiant mind-maps, and active synthesis notes.",
    feature: "Rapid Chapter Absorption & Mind-Mapping",
  },
  {
    id: "04",
    name: "Q Mastery",
    tagline: "Confidence, Voice & Leadership",
    icon: "crown",
    color: "#F29A2E",
    image: "/images/programs/quantum-mastery.jpg",
    desc: "Develops emotional intelligence, stage communication, self-belief, and leadership readiness for school and life.",
    feature: "Public Speaking & Emotional Composure Labs",
  },
  {
    id: "05",
    name: "Q Math",
    tagline: "High-Speed Visual Mathematics",
    icon: "chart",
    color: "#E2557A",
    image: "/images/programs/q-maths.jpg",
    desc: "Eliminates math anxiety with intuitive mental calculation, Vedic number patterns, and geometric visualisation.",
    feature: "Mental Speed Calculation Without Finger-Counting",
  },
  {
    id: "06",
    name: "Q Parenting",
    tagline: "Conscious Family Partnership",
    icon: "users",
    color: "#10B981",
    image: "/images/side-family.png",
    desc: "Aligns parents and mentors with practical guidance on screen balance, encouragement, and nurturing a calm home study culture.",
    feature: "Parent Orientation Circles & Progress Insights",
  },
  {
    id: "07",
    name: "Q Science",
    tagline: "Whole-Brain Scientific Inquiry",
    icon: "planet",
    color: "#38BDF8",
    image: "/images/programs/q-science.jpg",
    desc: "Makes physics, chemistry, and biology vivid, visual, and intuitive through experiential models and story mnemonics.",
    feature: "Visual Concept Models for Grades 6–12 Foundations",
  },
  {
    id: "08",
    name: "Q Creation",
    tagline: "Imagination & Original Design",
    icon: "palette",
    color: "#A78BFA",
    image: "/images/programs/quantum-creation.jpg",
    desc: "Nurtures divergent ideation, creative synthesis, and the courage to turn original ideas into tangible prototypes.",
    feature: "Cross-Disciplinary Innovation Challenges",
  },
  {
    id: "09",
    name: "Q Way",
    tagline: "Higher-Order Intuitive Thinking",
    icon: "sparkle",
    color: "#EC4899",
    image: "/images/programs/quantum-way.jpg",
    desc: "Advances learners into holistic systems thinking, rapid pattern comprehension, and independent meta-learning.",
    feature: "Meta-Learning & Holistic Decision Frameworks",
  },
  {
    id: "10",
    name: "Q Habit",
    tagline: "Atomic Daily Character Systems",
    icon: "award",
    color: "#D97706",
    image: "/images/workshop.png",
    desc: "Anchors health, discipline, gratitude, reading, and financial responsibility through simple 15-minute daily routines.",
    feature: "Daily Streak Tracking & Mentor Check-Ins",
  },
];

const APP_METRICS = [
  { label: "Focus & Attention Stamina", val: "94%", width: "94%" },
  { label: "Speed Recall & Comprehension", val: "3.0×", width: "90%" },
  { label: "Daily Quantum Habit Consistency", val: "98%", width: "98%" },
  { label: "Stage & Peer Confidence Index", val: "96%", width: "96%" },
];

export function QVerseSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeSpoke = QVERSE_SPOKES[activeIdx];

  return (
    <section
      id="q-verse"
      className="scroll-mt-20 py-24 md:py-32 bg-white border-y border-[#E2ECE9] overflow-hidden"
    >
      <div className="container-qs">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#054038] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
            <Icon name="planet" size={14} /> A Transformative Ecosystem
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.7rem] font-extrabold tracking-tight text-brand-deep leading-[1.15]">
            Welcome to <span className="text-[#0E937E]">Q-Verse</span>: 10 Spokes of Growth
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">
            Q-Verse unites 10 interconnected developmental domains with a live digital companion — connecting physical centre mentorship, home practice, and parent visibility in one seamless ecosystem.
          </p>

          {/* Brochure Mantra: EXPLORE · LEARN · GROW · CREATE · LEAD */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-full bg-[#F2FAF8] border border-[#CFE3DD] px-5 py-2">
            {["EXPLORE", "LEARN", "GROW", "CREATE", "LEAD"].map((word, idx) => (
              <div key={word} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs font-black tracking-[0.18em] text-[#054038]">
                  {word}
                </span>
                {idx < 4 && <span className="text-[#0E937E] font-black">·</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive 10-Spoke Explorer + Visual Spotlight */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 10 Interactive Spoke Cards (2x5 Grid) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3.5">
            {QVERSE_SPOKES.map((spoke, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <motion.button
                  key={spoke.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActiveIdx(idx)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`text-left rounded-2xl p-4 transition-all duration-300 border flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-[#054038] text-white border-[#2BD6B4] shadow-xl"
                      : "bg-[#F7FBF9] text-brand-ink border-[#D7EAE4] hover:bg-white hover:border-[#0E937E]/60 hover:shadow-md"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ backgroundColor: spoke.color }}
                  >
                    <Icon name={spoke.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          isSelected ? "text-[#2BD6B4]" : "text-[#6b807b]"
                        }`}
                      >
                        Spoke {spoke.id}
                      </span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-[#2BD6B4]" />
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold leading-snug mt-0.5 truncate">
                      {spoke.name}
                    </h3>
                    <p
                      className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${
                        isSelected ? "text-white/80" : "text-[#5c7772]"
                      }`}
                    >
                      {spoke.tagline}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Sticky Pictorial Spoke Console + Q-Verse App Telemetry */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSpoke.id}
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.28 }}
                className="relative overflow-hidden rounded-3xl border border-[#CFE3DD] bg-[#054038] text-white shadow-2xl"
              >
                <BorderBeam size={220} duration={10} colorFrom="#2BD6B4" colorTo="#FFC845" />

                <div className="relative h-56 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSpoke.image}
                    alt={activeSpoke.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#054038] via-[#054038]/35 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#03221E]/85 backdrop-blur-md px-3.5 py-1 text-xs font-black text-[#2BD6B4] border border-[#2BD6B4]/30">
                      Q-Verse Spoke {activeSpoke.id} / 10
                    </span>
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg"
                      style={{ backgroundColor: activeSpoke.color }}
                    >
                      <Icon name={activeSpoke.icon} size={20} />
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-5 right-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#FFC845]">
                      {activeSpoke.tagline}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                      {activeSpoke.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                    {activeSpoke.desc}
                  </p>
                  <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 p-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2BD6B4] text-[#054038]">
                      <Icon name="checkCircle" size={18} />
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#2BD6B4]">
                        Signature Capability
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {activeSpoke.feature}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Q-Verse Digital Companion & Parent Visibility Card */}
            <div className="rounded-3xl border border-[#CFE3DD] bg-[#F4FAF8] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-full bg-[#0E937E] px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">
                  Q-Verse Digital Portal
                </span>
                <span className="text-xs font-bold text-[#054038]">
                  Parent &amp; Learner App
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-brand-deep">
                Transparent 5D Growth Tracking
              </h4>
              <p className="text-xs sm:text-sm text-[#4b635e] mt-1 leading-relaxed">
                Track session recaps, guided home practice, habit streaks, and mentor observations in real time.
              </p>

              <div className="mt-5 space-y-3">
                {APP_METRICS.map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-xs font-bold text-brand-ink mb-1">
                      <span>{m.label}</span>
                      <span className="text-[#0E937E] font-black">{m.val}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#DCECE7] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: m.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#054038] to-[#0E937E]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

