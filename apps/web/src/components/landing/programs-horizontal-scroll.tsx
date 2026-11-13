"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PROGRAMS, type Program } from "@qschool/shared";
import { Icon } from "@/components/icons";
import { SpotlightCard } from "@/components/ui/21st";
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";

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

function toShortSlug(slug: string) {
  return slug.replace(/^quantum-/, "q-");
}

function ProgramBentoCard({
  program,
  index,
}: {
  program: Program;
  index: number;
}) {
  const cleanTitle = program.title.replace(/^\d+\.\s*/, "");
  const numLabel = String(index + 1).padStart(2, "0");
  const accent = PROGRAM_ACCENTS[index % PROGRAM_ACCENTS.length];
  const href = `/programs/${toShortSlug(program.slug)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
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

          {/* Photography Header */}
          <div className="relative h-44 w-full overflow-hidden bg-[#083A32]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.image || `/images/programs/${program.slug}.jpg`}
              alt={cleanTitle}
              className="h-full w-full object-cover brightness-105 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#03221E]/90 via-[#03221E]/30 to-transparent" />
            <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFC845] text-xs font-black text-[#03221E] shadow-md">
                {numLabel}
              </span>
              <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#054038] shadow-sm">
                {program.tags[0] || "Ages 6–14"}
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#054038] group-hover:text-[#0E937E] transition-colors leading-snug">
                {cleanTitle}
              </h3>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#0E937E]">
                What your child builds
              </p>
              <p className="text-[#2b3d38] text-base font-medium leading-relaxed mt-1">
                {program.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer Link */}
        <div className="px-6 pb-5 pt-4 border-t border-[#E8F2EF] bg-[#F9FCFB] flex items-center justify-between gap-3">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0E937E] hover:text-[#054038] transition"
          >
            Learn more →
          </Link>
          <a
            href="#demo"
            className="text-xs font-bold text-[#5c7772] hover:text-brand-deep transition"
          >
            Book a BMIT Assessment
          </a>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export function ProgramsHorizontalScroll() {
  const allPrograms = PROGRAMS;

  return (
    <section
      id="programs"
      className="relative scroll-mt-20 bg-gradient-to-b from-[#F4FAF8] via-white to-[#EAF5F1] py-24 border-t border-[#D7EAE4]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#2BD6B4]/15 blur-3xl" />
        <div className="absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-[#0E937E]/10 blur-3xl" />
        <QuantumAtomOrbital
          theme="light"
          size={340}
          className="absolute -left-24 top-12 opacity-75"
        />
      </div>

      <QuantumWaveStream theme="light" className="mb-6" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#054038] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#2BD6B4] shadow-sm">
            <Icon name="grid" size={14} /> Programs
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-[#054038] leading-[1.15]">
            Eight programs, one journey
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {allPrograms.map((program, idx) => (
            <ProgramBentoCard
              key={program.slug}
              program={program}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
