"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { BorderBeam } from "@/components/ui/21st";
import { QuantumNexus } from "@/components/three/quantum-nexus";
import { QuantumAtomOrbital } from "@/components/ui/quantum-effects";

interface QuestionOption {
  label: string;
  value: string;
  sub: string;
  icon: IconName;
  color: string;
}

interface Question {
  id: string;
  stepLabel: string;
  question: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: "age",
    stepLabel: "Age Window",
    question: "Which age band is your child currently in?",
    options: [
      {
        label: "Ages 6–8 Years (Foundation Window)",
        value: "6-8",
        sub: "Peak sensory neuroplasticity, attention grounding & joyful curiosity",
        icon: "sparkle",
        color: "#2BD6B4",
      },
      {
        label: "Ages 9–11 Years (Progression Window)",
        value: "9-11",
        sub: "Memory architecture, 3× reading fluency & visual math confidence",
        icon: "brain",
        color: "#5B6CF0",
      },
      {
        label: "Ages 12–14 Years (Advanced Window)",
        value: "12-14",
        sub: "Higher-order synthesis, board/Olympiad stamina & leadership voice",
        icon: "crown",
        color: "#FFC845",
      },
    ],
  },
  {
    id: "focus",
    stepLabel: "Primary Growth Goal",
    question: "What is the #1 transformation you want to see in your child?",
    options: [
      {
        label: "Laser Focus & Attention Stamina",
        value: "focus",
        sub: "Overcoming screen distraction, restlessness & wandering attention",
        icon: "eye",
        color: "#0E937E",
      },
      {
        label: "Memory Recall, Reading Speed & Visual Math",
        value: "speed",
        sub: "Retaining chapters effortlessly without exam-eve rote cramming",
        icon: "chart",
        color: "#5B6CF0",
      },
      {
        label: "Creative Thinking & Scientific Curiosity",
        value: "logic",
        sub: "Divergent imagination, whole-brain Q-Science & original problem-solving",
        icon: "palette",
        color: "#F29A2E",
      },
      {
        label: "Stage Confidence, Habits & Emotional Strength",
        value: "confidence",
        sub: "Articulate communication, daily self-discipline & resilience",
        icon: "speech",
        color: "#E2557A",
      },
    ],
  },
  {
    id: "pace",
    stepLabel: "Current Study Style",
    question: "Which description sounds closest to your child at home?",
    options: [
      {
        label: "Bright & capable, yet easily pulled toward screens",
        value: "distracted",
        sub: "Thrives once sensory focus and structured 15-min Quantum Habits kick in",
        icon: "laptop",
        color: "#2BD6B4",
      },
      {
        label: "Curious & quick, needs deeper intellectual challenge",
        value: "fast",
        sub: "Ready for accelerated memory palaces, Q-Way & creative synthesis",
        icon: "bulb",
        color: "#FFC845",
      },
      {
        label: "Thoughtful & observant, hesitant to speak up in groups",
        value: "thoughtful",
        sub: "Blossoms rapidly in Q-School's warm 15-learner mentor cohorts",
        icon: "heart",
        color: "#E2557A",
      },
    ],
  },
];

interface PathwayRecommendation {
  pathway: string;
  readiness: string;
  score: number;
  image: string;
  modules: string[];
  rationale: string;
}

const RECOMMENDATIONS: Record<string, PathwayRecommendation> = {
  focus: {
    pathway: "Q 5D™ Sensory Focus & Cognitive Stamina Track",
    readiness: "Cognitive Focus Readiness: 94%",
    score: 94,
    image: "/images/programs/quantum-vision.jpg",
    modules: ["01. Quantum Vision", "04. Quantum Learning", "Q-Habit Routines"],
    rationale:
      "Targeted sensory activation, Tratak concentration drills, and structured focus blocks to build calm 45-minute unbroken attention without study stress.",
  },
  speed: {
    pathway: "Memory Palaces, Speed Reading & Visual Q-Maths Track",
    readiness: "Accelerated Learning Readiness: 96%",
    score: 96,
    image: "/images/programs/q-maths.jpg",
    modules: ["04. Quantum Learning", "05. Quantum Reading", "07. Q-Maths"],
    rationale:
      "Spatial loci memory architecture, 3× visual reading sweeps, and mental math visualisation that permanently replace rote memorisation.",
  },
  logic: {
    pathway: "Creative Synthesis & Whole-Brain Q-Science Track",
    readiness: "Inventive Discovery Readiness: 95%",
    score: 95,
    image: "/images/programs/quantum-creation.jpg",
    modules: ["02. Quantum Creation", "03. Quantum Way", "08. Q-Science"],
    rationale:
      "Multi-dimensional perception drills paired with visual scientific models so your child connects ideas originally and solves unfamiliar problems with joy.",
  },
  confidence: {
    pathway: "Quantum Mastery & Neo Sapiens Leadership Track",
    readiness: "Leadership & Habit Readiness: 95%",
    score: 95,
    image: "/images/programs/quantum-mastery.jpg",
    modules: ["06. Quantum Mastery", "03. Quantum Way", "5 Quantum Habits"],
    rationale:
      "Stage articulation, emotional regulation, and daily self-discipline systems in supportive 15-learner cohorts led by certified Quantum Mentors.",
  },
};

export function DiagnosticQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);

  const handleOptionClick = (optionValue: string) => {
    const currentQ = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: optionValue };
    setAnswers(newAnswers);

    setDirection(1);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const resetQuiz = () => {
    setDirection(-1);
    setStep(0);
    setAnswers({});
  };

  const selectedFocus = answers.focus || "focus";
  const result = RECOMMENDATIONS[selectedFocus] || RECOMMENDATIONS.focus;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
  };

  return (
    <section
      id="diagnostic-quiz"
      className="relative bg-gradient-to-b from-[#021A16] via-[#042B25] to-[#031F1B] py-24 md:py-28 scroll-mt-20 text-white overflow-hidden"
    >
      <QuantumNexus
        className="pointer-events-none absolute inset-0 z-0 opacity-35"
        particleCount={55}
        speed={0.38}
        colorScheme="teal"
      />
      <QuantumAtomOrbital
        theme="dark"
        size={320}
        className="absolute -left-20 bottom-8 opacity-55"
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-[#2BD6B4]/10 blur-3xl"
        aria-hidden
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[#2BD6B4] font-black tracking-wider text-xs uppercase bg-[#2BD6B4]/15 px-4 py-1.5 rounded-full border border-[#2BD6B4]/30">
            <Icon name="sparkle" size={14} /> 60-Second Cognitive Diagnostic
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Discover Your Child&apos;s <span className="text-[#2BD6B4]">Ideal Q-Pathway</span>
          </h2>
          <p className="text-white/80 mt-3 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Answer 3 quick questions (Ages 6–14) to preview a personalised Q-School program combination before your free 45-minute demo assessment.
          </p>
        </div>

        {/* Step Pill Header */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
          {QUESTIONS.map((q, idx) => {
            const isCurrent = step === idx;
            const isDone = step > idx;
            return (
              <div
                key={q.id}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all ${
                  isCurrent
                    ? "bg-[#2BD6B4] text-[#021A16] border-[#2BD6B4] shadow-md"
                    : isDone
                    ? "bg-[#0E937E]/30 text-[#2BD6B4] border-[#2BD6B4]/40"
                    : "bg-white/5 text-white/50 border-white/10"
                }`}
              >
                <span className="font-black">0{idx + 1}</span>
                <span className="hidden sm:inline">{q.stepLabel}</span>
              </div>
            );
          })}
        </div>

        <div className="relative p-6 sm:p-10 rounded-3xl border border-white/15 bg-gradient-to-b from-[#06453C]/90 to-[#02211C]/95 backdrop-blur-xl shadow-2xl min-h-[450px] flex flex-col justify-between overflow-hidden">
          <BorderBeam size={240} duration={12} colorFrom="#2BD6B4" colorTo="#FFC845" />

          {/* Question / Result Area */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              {step < QUESTIONS.length ? (
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-[#2BD6B4]">
                      Step 0{step + 1} of 0{QUESTIONS.length} · {QUESTIONS[step].stepLabel}
                    </p>
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="text-white/70 hover:text-[#2BD6B4] transition-colors inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Icon name="chevLeft" size={14} /> Previous
                      </button>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
                    {QUESTIONS[step].question}
                  </h3>

                  <div className="grid gap-3.5">
                    {QUESTIONS[step].options.map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleOptionClick(option.value)}
                        className="w-full text-left p-4 sm:p-5 rounded-2xl border border-white/15 bg-white/5 hover:border-[#2BD6B4] hover:bg-[#2BD6B4]/10 transition-all flex items-center justify-between gap-4 group shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[#021A16] shadow-md"
                            style={{ backgroundColor: option.color }}
                          >
                            <Icon name={option.icon} size={22} />
                          </span>
                          <div>
                            <p className="text-base sm:text-lg font-bold text-white group-hover:text-[#2BD6B4] transition">
                              {option.label}
                            </p>
                            <p className="text-xs sm:text-[13px] text-white/65 mt-0.5">
                              {option.sub}
                            </p>
                          </div>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 group-hover:bg-[#2BD6B4] group-hover:text-[#021A16] transition">
                          <Icon name="arrowRight" size={16} />
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  {/* Pictorial Result Card */}
                  <div className="md:col-span-5 relative h-64 md:h-80 rounded-2xl overflow-hidden border border-[#2BD6B4]/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.image}
                      alt={result.pathway}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#021A16] via-[#021A16]/25 to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-[#FFC845] px-3 py-1 text-[11px] font-black text-[#021A16] shadow-md">
                      Age Band: {answers.age || "6–14"} Yrs
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-[#021A16]/85 backdrop-blur-md p-3 border border-white/15">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-[#2BD6B4]">Profile Match</span>
                        <span className="text-white">{result.score}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.score}%` }}
                          transition={{ duration: 0.7 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#2BD6B4] to-[#FFC845]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Details */}
                  <div className="md:col-span-7 text-left">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2BD6B4] px-3.5 py-1 text-xs font-black text-[#021A16]">
                      <Icon name="checkCircle" size={14} /> PERSONALISED TRACK READY
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 leading-tight">
                      {result.pathway}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#FFC845] mt-1.5">
                      {result.readiness}
                    </p>
                    <p className="text-white/85 text-sm sm:text-base mt-3 leading-relaxed">
                      {result.rationale}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.modules.map((mod) => (
                        <span
                          key={mod}
                          className="rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-[#2BD6B4]"
                        >
                          ✦ {mod}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 items-center">
                      <a
                        href="#demo"
                        className="btn-3d btn-3d-mint rounded-xl px-6 py-3.5 text-xs sm:text-sm font-black shadow-lg text-brand-deep"
                      >
                        Book a BMIT Assessment ↓
                      </a>
                      <button
                        type="button"
                        onClick={resetQuiz}
                        className="px-4 py-3 rounded-xl border border-white/20 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition"
                      >
                        Retake ↺
                      </button>
                    </div>
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
