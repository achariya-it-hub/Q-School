"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

const SLIDES = [
  {
    eyebrow: "Welcome to Q-School",
    a: "Learn Anytime",
    b: "Grow ",
    hl: "Everywhere",
    lines: ["Live Classes • Workshops • Webinars • Offline Classes", "Certifications • Real World Skills"],
  },
  {
    eyebrow: "Live every day",
    a: "Join Live Classes",
    b: "Learn ",
    hl: "Together",
    lines: ["Interactive sessions • Raise hand • Live Q&A", "Recordings available after class"],
  },
  {
    eyebrow: "Show what you know",
    a: "Earn Certificates",
    b: "Build Your ",
    hl: "Future",
    lines: ["QR-verified credentials • Shareable on LinkedIn", "Recognised by partner schools"],
  },
];

export function Hero() {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [i]);

  const s = SLIDES[i];

  return (
    <section className="relative overflow-hidden rounded-[22px] bg-[#043B34] text-white shadow-[0_18px_40px_-20px_rgba(5,64,56,.7)]">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,#0E937E_0%,transparent_55%),radial-gradient(ellipse_at_10%_110%,#0b5a4f_0%,transparent_50%)]" />
      <svg className="pointer-events-none absolute -right-10 top-0 h-full w-2/3 opacity-25" viewBox="0 0 400 300" fill="none">
        <path d="M0 260C120 160 260 300 400 120" stroke="#2BD6B4" strokeWidth="1" />
        <path d="M30 300C150 180 280 260 400 60" stroke="#2BD6B4" strokeWidth="1" />
        <path d="M80 300C190 210 300 230 400 10" stroke="#2BD6B4" strokeWidth="1" />
      </svg>

      <div className="relative grid min-h-[290px] items-center gap-6 px-6 py-8 sm:px-12 md:grid-cols-[1.5fr_1fr] md:px-16">
        <div key={i} className="animate-[fadeUp_.5s_ease]">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#7FE3CF]">{s.eyebrow}</p>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.08] sm:text-[46px]">
            {s.a}
            <br />
            {s.b}
            <span className="text-[#2BD6B4]">{s.hl}</span>
          </h1>
          <div className="mt-3 space-y-0.5 text-[13.5px] text-white/85">
            {s.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <label className="flex h-12 min-w-[240px] flex-1 items-center gap-3 rounded-full bg-white px-4 text-[#6b807b] sm:max-w-[300px]">
              <Icon name="search" size={18} />
              <input className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-[#93a5a0]" placeholder="Search courses, skills or instructors..." />
              <Icon name="heart" size={17} />
            </label>
            <Link
              href="/courses"
              className="flex h-12 items-center gap-2 rounded-full border-2 border-[#2BD6B4] px-6 text-sm font-semibold text-white transition hover:bg-[#2BD6B4] hover:text-brand-deep"
            >
              Explore Courses <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>

        {/* Visual */}
        <div className="relative hidden h-[250px] md:block">
          <div className="absolute left-[38%] top-[58%] h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#2BD6B455_0%,transparent_65%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            className="absolute left-[38%] top-[58%] w-[150px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_30px_rgba(43,214,180,.45)] brightness-[1.35] saturate-[1.2]"
          />
          <div className="absolute -left-4 top-0 animate-[float_6s_ease-in-out_infinite] rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-md">
            <p className="flex items-center gap-1.5 text-[11px] text-white/75">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF5A5F]" /> Live now
            </p>
            <p className="text-sm font-semibold">245 learners</p>
          </div>
          <div className="absolute bottom-6 right-0 animate-[float_6.5s_ease-in-out_infinite_.5s] rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-md">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Icon name="award" size={15} className="text-[#2BD6B4]" /> Certified
            </p>
            <p className="text-[11px] text-white/75">QR-verified</p>
          </div>
          <p className="absolute right-0 top-0 rotate-[-6deg] text-right font-hand text-[25px] leading-[1.05] text-white/95">
            Skills for a
            <br />
            Brighter
            <br />
            Tomorrow
          </p>
        </div>
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
      >
        <Icon name="chevLeft" size={18} />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
      >
        <Icon name="chevRight" size={18} />
      </button>
      <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Slide ${k + 1}`}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
