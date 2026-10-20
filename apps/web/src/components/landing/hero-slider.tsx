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
  { photo: PHOTOS.liveClass, art: "bulb", path: "design-thinking", title: "Design Thinking for Young Minds", mentor: "Meera Nair", meta: "Session 6 of 12", watching: 42 },
  { photo: PHOTOS.codingClass, art: "laptop", path: "coding-for-beginners", title: "Coding for Beginners", mentor: "Rahul Verma", meta: "Session 3 of 10", watching: 36 },
  { photo: PHOTOS.writingClass, art: "pencil", path: "creative-writing", title: "Creative Writing Workshop", mentor: "Kavya Iyer", meta: "Day 2 of 2", watching: 28 },
];

const INTERVAL = 5000;

/** The live-class window in the hero, cycling through classes. */
export type WindowOverride = { photo?: { src: string; alt: string }; title?: string; mentor?: string; meta?: string };

/** Pass `single` to show just the first class with no slider controls; `first` overrides its content. */
export function HeroSlider({ single = false, first }: { single?: boolean; first?: WindowOverride }) {
  const head = { ...SLIDES[0], ...Object.fromEntries(Object.entries(first ?? {}).filter(([, v]) => v !== undefined)) };
  const slides = single ? [head] : [head, ...SLIDES.slice(1)];
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
