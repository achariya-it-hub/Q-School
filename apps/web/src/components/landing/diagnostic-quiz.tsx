"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionOption {
  label: string;
  value: string;
  sub?: string;
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: "age",
    question: "What is your child's age group?",
    options: [
      { label: "Ages 4–7 (Early Childhood)", value: "early", sub: "Neuroplasticity & Sensory Grounding" },
      { label: "Ages 8–11 (Middle Years)", value: "middle", sub: "Cognitive Stamina & Speed Logic" },
      { label: "Ages 12–16 (Adolescence)", value: "adolescent", sub: "Higher-Order Synthesis & Leadership" },
    ],
  },
  {
    id: "focus",
    question: "What is their primary area for growth right now?",
    options: [
      { label: "Focus & Attention Stamina", value: "focus", sub: "Overcoming screen distraction & wandering mind" },
      { label: "Speed Math & Memory Retention", value: "speed", sub: "Stress-free calculation without formulas" },
      { label: "Creative Logic & Problem Solving", value: "logic", sub: "Divergent thinking, robotics & STEM curiosity" },
      { label: "Confidence & Articulation", value: "confidence", sub: "Public communication & emotional resilience" },
    ],
  },
  {
    id: "pace",
    question: "How would you describe their learning pace?",
    options: [
      { label: "Easily distracted by screens & digital devices", value: "distracted", sub: "Needs active sensory focus training" },
      { label: "Curious, finishes schoolwork fast, needs deep challenge", value: "fast", sub: "Ready for advanced mental acceleration" },
      { label: "Quiet, thoughtful, hesitant to speak up or make mistakes", value: "thoughtful", sub: "Flourishes with empathetic 1:1 mentor coaching" },
    ],
  },
];

const recommendations: Record<string, { pathway: string; readiness: string; rationale: string }> = {
  focus: {
    pathway: "Q-5D Cognitive Stamina & Dual-Hemisphere Focus (BMIT + Q-Vision)",
    readiness: "Cognitive Focus Index: 92% Ready",
    rationale: "Targeted sensory activation and concentration drills to build unbreakable 45-minute sustained attention and calm mental stamina.",
  },
  speed: {
    pathway: "Speed Vedic Ganitham & Memory Palaces (Q-Maths + Quantum Learning)",
    readiness: "Speed Math Readiness: 96% Ready",
    rationale: "Mental arithmetic visualization and spatial loci memory techniques that eliminate rote memorization and reliance on calculators.",
  },
  logic: {
    pathway: "STEM, Robotics & Shilpa Shastra Divergent Innovation (Q-Science + Q-Creation)",
    readiness: "Inventive Logic Index: 95% Ready",
    rationale: "Hands-on engineering challenges combined with classical Indian spatial geometry to bridge art, logic, and physical prototyping.",
  },
  confidence: {
    pathway: "Quantum Mastery & Neo Sapiens Leadership Track (Q-Mastery + Q-Way)",
    readiness: "Leadership Potential: 94% Ready",
    rationale: "Public articulation, structured debate reasoning, and emotional equilibrium coaching in intimate micro-cohorts of 15.",
  },
};

export function DiagnosticQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);

  const handleOptionClick = (optionValue: string) => {
    const currentQ = questions[step];
    const newAnswers = { ...answers, [currentQ.id]: optionValue };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      setDirection(1);
      setStep(questions.length); // Result state
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
  };

  const selectedFocus = answers.focus || "focus";
  const result = recommendations[selectedFocus] || recommendations.focus;

  // Animation variants for sliding questions
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  };

  const progress = (step / questions.length) * 100;

  return (
    <section id="diagnostic-quiz" className="relative bg-[#021A16] py-24 md:py-32 scroll-mt-20 text-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-[#2BD6B4] font-black tracking-wider text-xs sm:text-sm uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
            Interactive Diagnostic
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Discover Your Child&apos;s Cognitive Pathway
          </h2>
          <p className="text-white/80 mt-3 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Answer 3 quick questions to generate a personalized Q-School developmental assessment and recommended curriculum track.
          </p>
        </div>

        <div className="relative p-7 sm:p-11 rounded-3xl border border-white/15 bg-gradient-to-b from-[#054038]/90 to-[#02211C]/95 backdrop-blur-xl shadow-2xl min-h-[460px] flex flex-col justify-between overflow-hidden">
          {/* Progress Bar */}
          {step < questions.length && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0E937E] via-[#2BD6B4] to-[#5B6CF0]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Back Button */}
          {step > 0 && step < questions.length && (
            <button
              type="button"
              onClick={handleBack}
              className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              ← Back
            </button>
          )}

          {/* Question / Result Area */}
          <div className="flex-1 flex flex-col justify-center mt-6">
            <AnimatePresence mode="wait" custom={direction}>
              {step < questions.length ? (
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2BD6B4] mb-2">
                    Question 0{step + 1} of 0{questions.length}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
                    {questions[step].question}
                  </h3>

                  <div className="grid gap-3.5">
                    {questions[step].options.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.015, x: 4 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleOptionClick(option.value)}
                        className="w-full text-left p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#2BD6B4] hover:bg-[#2BD6B4]/10 transition-all flex items-center justify-between group shadow-sm"
                      >
                        <div>
                          <p className="text-base sm:text-lg font-bold text-white group-hover:text-[#2BD6B4] transition">
                            {option.label}
                          </p>
                          {option.sub && (
                            <p className="text-xs text-white/60 mt-0.5">{option.sub}</p>
                          )}
                        </div>
                        <span className="text-white/40 group-hover:text-[#2BD6B4] transition font-bold text-xl ml-3">
                          →
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // RESULT STATE
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-4"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-[#0E937E] to-[#2BD6B4] flex items-center justify-center text-3xl shadow-lg text-brand-deep">
                    ✨
                  </div>
                  <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">
                    DIAGNOSTIC COMPLETE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
                    {result.pathway}
                  </h3>
                  <p className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-bold text-[#2BD6B4] mb-4">
                    {result.readiness}
                  </p>
                  <p className="text-white/85 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
                    {result.rationale}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href="#demo"
                      className="btn-3d btn-3d-mint rounded-xl px-8 py-3.5 text-sm font-black shadow-lg text-brand-deep"
                    >
                      Claim This Free Demo Assessment ↓
                    </a>
                    <button
                      type="button"
                      onClick={resetQuiz}
                      className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 transition"
                    >
                      Retake Quiz ↺
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
