"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { SpotlightCard, BorderBeam, ScrollMotion } from "@/components/ui/21st";
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";

export type EcosystemTab = "parents" | "students" | "partners";

const OVERVIEW_CARDS: {
  id: EcosystemTab;
  num: string;
  tag: string;
  desc: string;
  cta: string;
  icon: IconName;
  color: string;
  softBg: string;
}[] = [
  {
    id: "parents",
    num: "01",
    tag: "01. FOR PARENTS",
    desc: "Discover how Q-School can help your child learn better, think bigger and become future-ready.",
    cta: "Explore Your Child's Q-Journey →",
    icon: "users",
    color: "#0E937E",
    softBg: "rgba(14, 147, 126, 0.12)",
  },
  {
    id: "students",
    num: "02",
    tag: "02. FOR STUDENTS",
    desc: "Discover your potential. Strengthen your abilities. Become a confident thinker, creator and leader.",
    cta: "Discover Your Potential →",
    icon: "sparkle",
    color: "#5B6CF0",
    softBg: "rgba(91, 108, 240, 0.12)",
  },
  {
    id: "partners",
    num: "03",
    tag: "03. FOR FRANCHISE PARTNERS",
    desc: "Partner with Q-School to bring future-ready learning to more children and build a meaningful education venture.",
    cta: "Explore Franchise Opportunities →",
    icon: "building",
    color: "#F29A2E",
    softBg: "rgba(242, 154, 46, 0.14)",
  },
];

const PARENTS_PILLARS: { title: string; desc: string; icon: IconName; color: string }[] = [
  {
    title: "Focus & Attention",
    desc: "Build the ability to concentrate and engage with learning.",
    icon: "eye",
    color: "#0E937E",
  },
  {
    title: "Memory & Retention",
    desc: "Strengthen the ability to understand, remember and recall information.",
    icon: "brain",
    color: "#5B6CF0",
  },
  {
    title: "Reasoning & Problem-Solving",
    desc: "Encourage logical thinking and independent solutions.",
    icon: "bulb",
    color: "#F29A2E",
  },
  {
    title: "Creativity & Imagination",
    desc: "Explore ideas and approach challenges from different perspectives.",
    icon: "palette",
    color: "#E2557A",
  },
  {
    title: "Communication & Confidence",
    desc: "Express thoughts and participate with greater confidence.",
    icon: "message",
    color: "#0891B2",
  },
  {
    title: "Learning Independence",
    desc: "Develop habits that support self-directed learning and growth.",
    icon: "award",
    color: "#059669",
  },
];

const STUDENTS_PILLARS: { title: string; desc: string; icon: IconName; color: string }[] = [
  {
    title: "Think Differently",
    desc: "Look at ideas and challenges from new perspectives.",
    icon: "bulb",
    color: "#5B6CF0",
  },
  {
    title: "Learn Better",
    desc: "Explore techniques that support understanding and memory.",
    icon: "brain",
    color: "#0E937E",
  },
  {
    title: "Build Confidence",
    desc: "Become more comfortable expressing your thoughts and ideas.",
    icon: "award",
    color: "#F29A2E",
  },
  {
    title: "Create More",
    desc: "Use imagination and creativity to explore possibilities.",
    icon: "palette",
    color: "#E2557A",
  },
  {
    title: "Solve Challenges",
    desc: "Develop a thoughtful approach to problems.",
    icon: "tools",
    color: "#0891B2",
  },
  {
    title: "Discover Your Strengths",
    desc: "Recognise and develop your individual abilities.",
    icon: "sparkle",
    color: "#059669",
  },
];

const PARTNER_PILLARS: { title: string; desc: string; icon: IconName; color: string }[] = [
  {
    title: "A Distinct Learning Concept",
    desc: "Introduce a structured learning ecosystem focused on children's overall abilities.",
    icon: "brain",
    color: "#0E937E",
  },
  {
    title: "A Defined Programme Portfolio",
    desc: "Explore eight programmes across the Q-School learning ecosystem.",
    icon: "book",
    color: "#5B6CF0",
  },
  {
    title: "A Clear Learning Pathway",
    desc: "Understand the three-year Foundation, Progression and Advanced Development journey.",
    icon: "chart",
    color: "#F29A2E",
  },
  {
    title: "A Growing Education Opportunity",
    desc: "Participate in an initiative focused on the evolving needs of children and families.",
    icon: "building",
    color: "#0891B2",
  },
  {
    title: "A Shared Vision",
    desc: "Be part of an effort to encourage better learning, independent thinking and future readiness.",
    icon: "crown",
    color: "#059669",
  },
];

export function EcosystemExperience() {
  const [activeTab, setActiveTab] = useState<EcosystemTab>("parents");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as EcosystemTab | null;
    if (tabParam === "parents" || tabParam === "students" || tabParam === "partners") {
      setActiveTab(tabParam);
    } else if (window.location.hash === "#for-students") {
      setActiveTab("students");
    } else if (window.location.hash === "#for-franchise-partners") {
      setActiveTab("partners");
    }
  }, []);

  const handleSelectAudience = (tab: EcosystemTab) => {
    setActiveTab(tab);
    const el = document.getElementById("ecosystem-detail-view");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#F4FAF8]">
      {/* 1. Hero & 3-Audience Movement Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021B17] via-[#054038] to-[#021915] py-20 lg:py-28 text-white">
        <QuantumWaveStream theme="dark" className="opacity-70" />
        <QuantumAtomOrbital
          theme="dark"
          size={380}
          className="pointer-events-none absolute -right-24 top-10 opacity-45"
        />
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#2BD6B4]/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-[#FFC845]/10 blur-3xl"
          aria-hidden
        />

        <div className="container-qs relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/35 bg-[#2BD6B4]/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#2BD6B4]">
              <Icon name="sparkle" size={14} /> BE A PART OF THE Q-SCHOOL MOVEMENT
            </span>

            <h1 className="mt-5 text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.12] text-white">
              BEYOND LEARNING.{" "}
              <span className="bg-gradient-to-r from-[#2BD6B4] via-[#7CF3DA] to-[#FFD875] bg-clip-text text-transparent">
                TOWARDS A BIGGER FUTURE.
              </span>
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-white/85 font-medium max-w-2xl mx-auto leading-relaxed">
              Different journeys. One vision. A future-ready generation.
            </p>
          </div>

          {/* 3 Audience Cards: 01. FOR PARENTS | 02. FOR STUDENTS | 03. FOR FRANCHISE PARTNERS */}
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {OVERVIEW_CARDS.map((card) => {
              const isSelected = activeTab === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => handleSelectAudience(card.id)}
                  className={`group cursor-pointer relative flex flex-col justify-between overflow-hidden rounded-[28px] border p-7 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 ${
                    isSelected
                      ? "border-[#2BD6B4] bg-white/[0.13] shadow-[0_24px_60px_-15px_rgba(43,214,180,0.3)] ring-2 ring-[#2BD6B4]/40"
                      : "border-white/15 bg-white/[0.07] hover:border-[#2BD6B4]/60 hover:bg-white/[0.11]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/40 bg-[#03221D]/85 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[#2BD6B4]">
                        {card.tag}
                      </span>
                      <span
                        className="icon-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md"
                        style={{ ["--c" as string]: card.color }}
                      >
                        <Icon name={card.icon} size={20} />
                      </span>
                    </div>

                    <p className="mt-6 text-base sm:text-[17px] leading-relaxed text-white/95 font-medium">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/15">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAudience(card.id);
                      }}
                      className="inline-flex items-center gap-2 text-sm sm:text-[15px] font-extrabold text-[#FFD875] group-hover:text-[#2BD6B4] transition-colors"
                    >
                      <span>{card.cta}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Interactive Audience Switcher & In-Detail View */}
      <section id="ecosystem-detail-view" className="scroll-mt-20 py-20">
        <div className="container-qs">
          {/* Audience Selector Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {OVERVIEW_CARDS.map((card) => {
              const isSelected = activeTab === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveTab(card.id)}
                  className={`inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all ${
                    isSelected
                      ? "bg-brand-deep text-[#2BD6B4] shadow-lg ring-2 ring-[#2BD6B4]/40"
                      : "bg-white border border-[#CFE3DD] text-[#4b635e] hover:border-brand-teal hover:text-brand-deep"
                  }`}
                >
                  <Icon name={card.icon} size={16} />
                  <span>{card.tag}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "parents" && (
              <motion.div
                key="parents"
                id="for-parents"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-[34px] border border-[#CFE3DD] bg-white p-7 sm:p-10 lg:p-14 shadow-xl"
              >
                <BorderBeam size={280} duration={14} colorFrom="#0E937E" colorTo="#2BD6B4" />

                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F0] border border-[#BFE0D8] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0E937E]">
                    <Icon name="users" size={14} /> 01. FOR PARENTS · Your Child&apos;s Future Starts Here
                  </span>
                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-brand-deep leading-[1.15]">
                    Give Your Child More Than Academic Knowledge.{" "}
                    <span className="text-brand-teal">Give Them the Ability to Think.</span>
                  </h2>
                  <p className="mt-5 text-base sm:text-lg text-[#3d5550] leading-relaxed">
                    Every child has the potential to do more than memorise lessons and score marks. The ability to focus, understand, remember, reason, create and make confident decisions can shape how they learn and approach life&apos;s challenges.
                  </p>
                  <p className="mt-3.5 text-base sm:text-lg text-[#3d5550] leading-relaxed">
                    Q-School offers a structured learning experience for children aged 6–14, designed to complement formal schooling and strengthen essential abilities through its eight learning programmes.
                  </p>
                </div>

                {/* What Your Child Can Develop */}
                <div className="mt-12">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-deep mb-6">
                    What Your Child Can Develop
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {PARENTS_PILLARS.map((item, idx) => (
                      <SpotlightCard
                        key={item.title}
                        spotlightColor="rgba(14, 147, 126, 0.16)"
                        className="p-6 rounded-2xl border border-[#DCECE7] bg-gradient-to-b from-[#F9FCFB] to-white hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="icon-3d flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{ ["--c" as string]: item.color }}
                          >
                            <Icon name={item.icon} size={20} />
                          </span>
                          <span className="rounded-lg bg-[#E6F4F0] px-2.5 py-1 text-xs font-black text-[#0E937E]">
                            0{idx + 1}
                          </span>
                        </div>
                        <h4 className="mt-4 text-lg font-extrabold text-brand-deep">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm text-[#4b635e] leading-relaxed">
                          {item.desc}
                        </p>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>

                {/* Explore Your Child's Q-Journey CTA Box */}
                <div className="mt-12 rounded-3xl bg-brand-deep p-7 sm:p-10 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-2xl">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#2BD6B4]">
                      Explore Your Child&apos;s Q-Journey
                    </span>
                    <h4 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                      Shape How Your Child Learns, Thinks &amp; Grows
                    </h4>
                    <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                      Discover the programmes, understand the learning pathway and see how Q-School can become a meaningful part of your child&apos;s development.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/#pathway"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FFD875] hover:text-[#2BD6B4] transition"
                      >
                        <span>Discover the Q-School Learning Journey →</span>
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 shrink-0 w-full lg:w-auto">
                    <a
                      href="#ecosystem-enquiry"
                      className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-xs sm:text-sm font-black text-brand-deep"
                    >
                      Book a BMIT Assessment for Your Child
                    </a>
                    <Link
                      href="/#programs"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
                    >
                      Explore Our Programmes
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div
                key="students"
                id="for-students"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-[34px] border border-[#CFE3DD] bg-white p-7 sm:p-10 lg:p-14 shadow-xl"
              >
                <BorderBeam size={280} duration={14} colorFrom="#5B6CF0" colorTo="#2BD6B4" />

                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF0FF] border border-[#C7CEFF] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5B6CF0]">
                    <Icon name="sparkle" size={14} /> 02. FOR STUDENTS · Discover Your Potential
                  </span>
                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-brand-deep leading-[1.15]">
                    Don&apos;t Just Learn More.{" "}
                    <span className="text-[#5B6CF0]">Discover What You Can Do More.</span>
                  </h2>
                  <p className="mt-5 text-base sm:text-lg text-[#3d5550] leading-relaxed">
                    Your potential goes beyond textbooks, examinations and classroom learning. It is in how you observe, question, understand, imagine, solve problems and turn ideas into action.
                  </p>
                  <p className="mt-3.5 text-base sm:text-lg text-[#3d5550] leading-relaxed">
                    At Q-School, you get opportunities to explore different ways of learning, strengthen your abilities and discover new possibilities through an engaging, structured learning journey.
                  </p>
                </div>

                {/* Your Q-School Journey Helps You */}
                <div className="mt-12">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-deep mb-6">
                    Your Q-School Journey Helps You
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {STUDENTS_PILLARS.map((item, idx) => (
                      <SpotlightCard
                        key={item.title}
                        spotlightColor="rgba(91, 108, 240, 0.16)"
                        className="p-6 rounded-2xl border border-[#DCECE7] bg-gradient-to-b from-[#F9FCFB] to-white hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="icon-3d flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{ ["--c" as string]: item.color }}
                          >
                            <Icon name={item.icon} size={20} />
                          </span>
                          <span className="rounded-lg bg-[#EEF0FF] px-2.5 py-1 text-xs font-black text-[#5B6CF0]">
                            0{idx + 1}
                          </span>
                        </div>
                        <h4 className="mt-4 text-lg font-extrabold text-brand-deep">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm text-[#4b635e] leading-relaxed">
                          {item.desc}
                        </p>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>

                {/* Your Potential Has More Possibilities CTA Box */}
                <div className="mt-12 rounded-3xl bg-brand-deep p-7 sm:p-10 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-2xl">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#2BD6B4]">
                      Your Potential Has More Possibilities
                    </span>
                    <h4 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                      Become a Confident Thinker, Creator &amp; Leader
                    </h4>
                    <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                      Explore the Q-Verse, discover the programmes and take your first step towards becoming a confident thinker, creator and future-ready learner.
                    </p>
                    <div className="mt-4">
                      <a
                        href="#ecosystem-enquiry"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FFD875] hover:text-[#2BD6B4] transition"
                      >
                        <span>Begin Your Q-School Journey →</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 shrink-0 w-full lg:w-auto">
                    <a
                      href="#ecosystem-enquiry"
                      className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-xs sm:text-sm font-black text-brand-deep"
                    >
                      Discover Your Potential
                    </a>
                    <Link
                      href="/q-verse"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
                    >
                      Explore the Q-Verse
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "partners" && (
              <motion.div
                key="partners"
                id="for-franchise-partners"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-[34px] border border-[#CFE3DD] bg-white p-7 sm:p-10 lg:p-14 shadow-xl"
              >
                <BorderBeam size={280} duration={14} colorFrom="#F29A2E" colorTo="#2BD6B4" />

                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF5E6] border border-[#FAD7A0] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#D97706]">
                    <Icon name="building" size={14} /> 03. FOR FRANCHISE PARTNERS · Education Partnership Opportunities
                  </span>
                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-brand-deep leading-[1.15]">
                    Bring a New Dimension of Learning{" "}
                    <span className="text-brand-teal">to Your Community.</span>
                  </h2>
                  <p className="mt-5 text-base sm:text-lg text-[#3d5550] leading-relaxed">
                    The future of education is not limited to what children learn. It is also about how they think, understand, create and apply their knowledge.
                  </p>
                  <p className="mt-3.5 text-base sm:text-lg text-[#3d5550] leading-relaxed">
                    Q-School aims to build a learning ecosystem focused on developing essential human abilities alongside conventional education. We welcome conversations with entrepreneurs, education leaders and aspiring partners who share this vision.
                  </p>
                </div>

                {/* Why Explore a Q-School Partnership? */}
                <div className="mt-12">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-deep mb-6">
                    Why Explore a Q-School Partnership?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {PARTNER_PILLARS.map((item, idx) => (
                      <SpotlightCard
                        key={item.title}
                        spotlightColor="rgba(242, 154, 46, 0.16)"
                        className="p-6 rounded-2xl border border-[#DCECE7] bg-gradient-to-b from-[#F9FCFB] to-white hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="icon-3d flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{ ["--c" as string]: item.color }}
                          >
                            <Icon name={item.icon} size={20} />
                          </span>
                          <span className="rounded-lg bg-[#FFF5E6] px-2.5 py-1 text-xs font-black text-[#D97706]">
                            0{idx + 1}
                          </span>
                        </div>
                        <h4 className="mt-4 text-lg font-extrabold text-brand-deep">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm text-[#4b635e] leading-relaxed">
                          {item.desc}
                        </p>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>

                {/* Let's Explore the Possibility of Building Together CTA Box */}
                <div className="mt-12 rounded-3xl bg-brand-deep p-7 sm:p-10 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-2xl">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FFD875]">
                      Let&apos;s Explore the Possibility of Building Together
                    </span>
                    <h4 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                      Build a Meaningful Education Venture with Q-School
                    </h4>
                    <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                      If you are interested in bringing Q-School to your city or community, connect with our team to understand the partnership opportunity, operating model, requirements and next steps.
                    </p>
                    <div className="mt-4">
                      <a
                        href="#ecosystem-enquiry"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FFD875] hover:text-[#2BD6B4] transition"
                      >
                        <span>Enquire About Becoming a Q-School Partner →</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 shrink-0 w-full lg:w-auto">
                    <a
                      href="#ecosystem-enquiry"
                      className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-xs sm:text-sm font-black text-brand-deep"
                    >
                      Explore Franchise Opportunities
                    </a>
                    <a
                      href="tel:+919944454840"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
                    >
                      <Icon name="phone" size={15} className="text-[#2BD6B4]" />
                      Connect with Our Partnership Team
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. Lead & Partnership Enquiry Form */}
      <section id="ecosystem-enquiry" className="container-qs scroll-mt-20 pb-20">
        <ScrollMotion variant="fade-up">
          <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-16 shadow-2xl border border-[#2BD6B4]/30">
            <BorderBeam size={280} duration={14} colorFrom="#2BD6B4" colorTo="#FFC845" />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#2BD6B4]/35 bg-[#2BD6B4]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#2BD6B4]">
                  {activeTab === "partners"
                    ? "Franchise & Partnership Desk"
                    : activeTab === "students"
                    ? "Student Discovery Desk"
                    : "Parent Counselling Desk"}
                </span>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                  {activeTab === "partners"
                    ? "Enquire About Becoming a Q-School Partner"
                    : activeTab === "students"
                    ? "Begin Your Q-School Journey"
                    : "Book a BMIT Assessment for Your Child"}
                </h2>
                <p className="mt-4 max-w-lg text-base text-white/85 leading-relaxed">
                  {activeTab === "partners"
                    ? "Connect with our partnership team to explore bringing Q-School to your city or community."
                    : "Schedule your child's Brain Mapping & Intelligence Test (BMIT) Assessment. Our counsellor will call you within 24 hours."}
                </p>
                <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-5 max-w-lg backdrop-blur-md">
                  <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                    <a href="tel:+919944454840" className="text-[#2BD6B4] hover:underline">
                      +91 99444 54840
                    </a>{" "}
                    (call or WhatsApp) ·{" "}
                    <a href="mailto:info@theqschool.com" className="text-[#2BD6B4] hover:underline">
                      info@theqschool.com
                    </a>{" "}
                    · Mon–Sat, 9am–7pm IST
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-7 text-brand-ink shadow-2xl sm:p-9">
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-deep">
                  {activeTab === "partners"
                    ? "Connect with Our Partnership Team"
                    : "Book a BMIT Assessment"}
                </h3>
                <p className="mb-6 mt-1.5 text-xs sm:text-sm text-[#5c7772]">
                  {activeTab === "partners"
                    ? "Share your details and our franchise team will reach out within 24 hours."
                    : "Schedule your child's BMIT Assessment. Our counsellor will call you within 24 hours."}
                </p>
                <LeadForm
                  source={`ecosystem_${activeTab}`}
                  cta={
                    activeTab === "partners"
                      ? "Explore Franchise Opportunities"
                      : activeTab === "students"
                      ? "Discover Your Potential"
                      : "Book a BMIT Assessment"
                  }
                />
              </div>
            </div>
          </div>
        </ScrollMotion>
      </section>
    </div>
  );
}
