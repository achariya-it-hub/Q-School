"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArtKey } from "@qschool/shared";
import { Avatar } from "@/components/dashboard/art";
import { Icon } from "@/components/icons";
import { Photo } from "@/components/landing/photo";
import { PHOTOS } from "@/components/landing/photos";

const SLIDES: {
  photo: { src: string; alt: string };
  art: ArtKey;
  path: string;
  title: string;
  mentor: string;
  meta: string;
  watching: number;
}[] = [
  {
    photo: { src: "/images/bmit-hero.png", alt: "Young learner engaging in Q-School cognitive development" },
    art: "bulb",
    path: "quantum-thinking-lab",
    title: "Every class follows the same six steps",
    mentor: "Q-School Certified Mentors",
    meta: "9 centres in 7 cities",
    watching: 48,
  },
  {
    photo: { src: "/images/rbiq/rbiq-hero.jpg", alt: "RBIQ Whole Brain Development Activity" },
    art: "bulb",
    path: "rbiq-whole-brain",
    title: "RBIQ — Whole Brain Development",
    mentor: "Master Cognitive Coach",
    meta: "Bilateral Brain Sync · Ages 6–14",
    watching: 42,
  },
  {
    photo: { src: "/images/workshop.png", alt: "Neo Sapiens Interactive Workshop at Q-School" },
    art: "bulb",
    path: "neo-sapiens-workshop",
    title: "Neo Sapiens: Future-Ready Intelligence",
    mentor: "Q-5D™ Lead Mentor",
    meta: "Original Thinking & Creativity",
    watching: 39,
  },
  {
    photo: { src: "/images/classroom-centre.jpg", alt: "Q-School Physical Learning Centre Classroom" },
    art: "laptop",
    path: "quantum-classroom",
    title: "Small-Batch Interactive Learning",
    mentor: "Centre Academic Director",
    meta: "Max 15 Learners per Batch",
    watching: 35,
  },
  {
    photo: { src: "/images/rbiq/cup-stacking.jpg", alt: "Cup Stacking Speed & Coordination Drill" },
    art: "bulb",
    path: "speed-coordination",
    title: "Cup Stacking — Speed & Hand-Eye Sync",
    mentor: "RBIQ Motor Lab",
    meta: "Reflex & Focus Training",
    watching: 31,
  },
  {
    photo: { src: "/images/rbiq/rubiks-cube.jpg", alt: "Rubik's Cube Algorithmic & Spatial Reasoning" },
    art: "laptop",
    path: "spatial-reasoning",
    title: "Algorithmic & Spatial Problem Solving",
    mentor: "Q-Maths & Logic Lab",
    meta: "Pattern Recognition",
    watching: 44,
  },
  {
    photo: { src: "/images/rbiq/abacus.jpg", alt: "Quantum Mental Arithmetic & Abacus Visualization" },
    art: "pencil",
    path: "quantum-abacus",
    title: "Mental Arithmetic & Photographic Memory",
    mentor: "Q-Memory Faculty",
    meta: "High-Speed Visualization",
    watching: 37,
  },
  {
    photo: { src: "/images/mentor-student.jpg", alt: "1:1 BMIT Assessment & Personalized Mentorship" },
    art: "pencil",
    path: "bmit-counselling",
    title: "1:1 BMIT Assessment & Cognitive Mapping",
    mentor: "Senior BMIT Counsellor",
    meta: "Personalized Growth Blueprint",
    watching: 29,
  },
  {
    photo: { src: "/images/rbiq/speed-reading.jpg", alt: "Quantum Speed Reading & Comprehension Session" },
    art: "pencil",
    path: "quantum-reading",
    title: "Quantum Speed Reading & Visual Recall",
    mentor: "Q-Reading Specialist",
    meta: "Rapid Comprehension Lab",
    watching: 41,
  },
  {
    photo: { src: "/images/side-brain.png", alt: "Whole-Brain Neural Activation & Focus Training" },
    art: "bulb",
    path: "quantum-focus",
    title: "Whole-Brain Neural Synchrony & Focus",
    mentor: "Q-Vision Lead Coach",
    meta: "Deep Concentration Drills",
    watching: 46,
  },
];

const INTERVAL = 4200;

/** The live-class window in the hero, cycling through classes. */
export type WindowOverride = { photo?: { src: string; alt: string }; title?: string; mentor?: string; meta?: string };

/** Pass `single` to show just the first class with no slider controls; `first` overrides its content. */
export function HeroSlider({ single = false, first }: { single?: boolean; first?: WindowOverride }) {
  const head = { ...SLIDES[0], ...Object.fromEntries(Object.entries(first ?? {}).filter(([, v]) => v !== undefined)) };
  const rest = SLIDES.filter((sl) => sl.photo.src !== head.photo.src);
  const slides = single ? [head] : [head, ...rest];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || !motionOk || n < 2) return;
    const t = window.setTimeout(() => go(i + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, paused, motionOk, go, n]);

  const s = slides[i];

  return (
    <div
      className="relative z-10 overflow-hidden rounded-[22px] border border-white/15 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Live classes on Q-School"
    >
      <div className="flex items-center gap-1.5 border-b border-[#EEF3F1] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B5E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFC845]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2BD6B4]" />
        <span className="ml-3 truncate text-[11px] font-medium text-[#6b807b]">qschool.live / {s.path}</span>
      </div>

      {/* slides */}
      <div
        className="group/slider relative aspect-[16/10] bg-brand-deep"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
          touchX.current = null;
        }}
      >
        {slides.map((sl, k) => (
          <div
            key={sl.path}
            className={`absolute inset-0 transition-opacity duration-700 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={k !== i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} of ${n}: ${sl.title}`}
          >
            <Photo
              src={sl.photo.src}
              alt={sl.photo.alt}
              fallbackArt={sl.art}
              eager={k === 0}
              className="h-full w-full"
              imgClassName={`transition-transform duration-[6000ms] ease-out ${k === i && motionOk ? "scale-110" : "scale-100"}`}
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" aria-hidden />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2445C] px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
          </span>
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur">
            <Icon name="users" size={12} className="mr-1 inline -translate-y-px" />
            {s.watching} watching
          </span>
        </div>

        {/* student cam picture-in-picture */}
        <Photo
          src={PHOTOS.coding.src}
          alt={PHOTOS.coding.alt}
          fallbackArt="laptop"
          eager
          className="!absolute bottom-3 right-3 h-[72px] w-24 rounded-xl shadow-lg ring-2 ring-white/80"
        >
          <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[9px] font-medium text-white">Arjun</span>
        </Photo>

        <div className="absolute bottom-3 left-3 flex -space-x-1">
          {["Sara K", "Dev P", "Isha R"].map((nm) => (
            <Avatar key={nm} name={nm} size={28} />
          ))}
          <span className="flex h-7 items-center rounded-full bg-black/45 pl-2.5 pr-2 text-[10px] font-semibold text-white ring-2 ring-white backdrop-blur">
            +{s.watching - 4}
          </span>
        </div>

        {/* arrows */}
        {n > 1 &&
          (
            [
            ["Previous class", -1, "left-2", "M15 18l-6-6 6-6"],
            ["Next class", 1, "right-2", "M9 6l6 6-6 6"],
          ] as const
        ).map(([label, d, pos, path]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => go(i + d)}
            className={`absolute ${pos} top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-brand-deep opacity-0 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white focus-visible:opacity-100 group-hover/slider:opacity-100 sm:flex`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={path} />
            </svg>
          </button>
          ))}

        {/* dots + progress */}
        <div className={`absolute left-1/2 top-3.5 flex -translate-x-1/2 gap-1.5 max-sm:hidden ${n > 1 ? "" : "hidden"}`}>
          {slides.map((sl, k) => (
            <button
              key={sl.path}
              type="button"
              aria-label={`Show ${sl.title}`}
              aria-current={k === i}
              onClick={() => go(k)}
              className={`relative h-1.5 overflow-hidden rounded-full bg-white/40 transition-all duration-300 ${k === i ? "w-7" : "w-1.5 hover:bg-white/70"}`}
            >
              {k === i && (
                <span
                  key={`${i}-${paused}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={
                    motionOk && !paused
                      ? { animation: `slider-progress ${INTERVAL}ms linear forwards` }
                      : { width: "100%" }
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* info row */}
      <div className="flex items-center gap-3 px-4 py-3.5" aria-live="polite">
        <Avatar name={s.mentor} size={38} />
        <div key={i} className="min-w-0 flex-1 animate-fade-up">
          <p className="truncate text-[13.5px] font-semibold text-brand-ink">{s.title}</p>
          <p className="text-[11.5px] text-[#6b807b]">
            {s.mentor} · {s.meta}
          </p>
        </div>
        <span className="btn-3d btn-3d-teal rounded-xl px-3 py-2 text-[12px] font-semibold">Join</span>
      </div>

      {/* mobile dots under the image */}
      <div className={`flex justify-center gap-1.5 pb-3 sm:hidden ${n > 1 ? "" : "!hidden"}`}>
        {slides.map((sl, k) => (
          <button
            key={sl.path}
            type="button"
            aria-label={`Show ${sl.title}`}
            onClick={() => go(k)}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-brand-teal" : "w-1.5 bg-[#cfe3de]"}`}
          />
        ))}
      </div>
    </div>
  );
}
