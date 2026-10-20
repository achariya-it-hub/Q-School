"use client";

import { useCallback, useEffect, useRef, useState } from "react";


/**
 * Full-width hero carousel. Every child is one whole-screen slide; slides are
 * stacked in one grid cell so the section keeps the height of the tallest one.
 * Auto-advances (paused while hovering the controls, while focused, when the tab
 * is hidden, or with the pause button), with arrows, dots, swipe and ← → keys.
 * No auto-advance for prefers-reduced-motion.
 */
export function HeroCarousel({ children, labels, interval = 7000 }: { children: React.ReactNode; labels: string[]; interval?: number }) {
  const INTERVAL = interval;
  const slides: React.ReactNode[] = (Array.isArray(children) ? children : [children]).filter(
    (c) => c !== null && c !== undefined && c !== false,
  );
  const n = slides.length;
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false); // hover / focus on controls
  const [stopped, setStopped] = useState(false); // pause button or reduced motion
  const [hidden, setHidden] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStopped(true);
    const vis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);

  const running = !hold && !stopped && !hidden && n > 1;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(i + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, running, go, INTERVAL]);

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(i + 1);
        if (e.key === "ArrowLeft") go(i - 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        touchX.current = null;
      }}
    >
      <div className="grid">
        {slides.map((slide, k) => (
          <div
            key={k}
            data-active={k === i}
            className={`hero-slide relative [grid-area:1/1] transition-opacity duration-700 ${
              k === i ? "z-10 opacity-100" : "pointer-events-none invisible z-0 opacity-0"
            }`}
            style={{ transitionProperty: "opacity, visibility" }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} of ${n}: ${labels[k] ?? ""}`}
            aria-hidden={k !== i}
          >
            {slide}
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          {/* arrows (desktop) */}
          {(
            [
              ["Previous slide", -1, "left-3 xl:left-6", "M15 18l-6-6 6-6"],
              ["Next slide", 1, "right-3 xl:right-6", "M9 6l6 6-6 6"],
            ] as const
          ).map(([label, d, pos, path]) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => go(i + d)}
              onMouseEnter={() => setHold(true)}
              onMouseLeave={() => setHold(false)}
              className={`absolute ${pos} top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-110 hover:bg-white hover:text-brand-deep lg:flex`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d={path} />
              </svg>
            </button>
          ))}

          {/* dots + pause */}
          <div
            className="absolute bottom-14 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2 backdrop-blur sm:bottom-20"
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
          >
            {slides.map((_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Show slide ${k + 1}: ${labels[k] ?? ""}`}
                aria-current={k === i}
                onClick={() => go(k)}
                className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                  k === i ? "w-10 bg-white/30" : "w-2 bg-white/45 hover:bg-white/80"
                }`}
              >
                {k === i && (
                  <span
                    key={`${i}-${running}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-[#2BD6B4]"
                    style={running ? { animation: `slider-progress ${INTERVAL}ms linear forwards` } : { width: "100%" }}
                  />
                )}
              </button>
            ))}
            <button
              type="button"
              aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setStopped((v) => !v)}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              {stopped ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
