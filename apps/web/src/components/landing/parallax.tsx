"use client";

import { useEffect, useRef } from "react";

/**
 * Moves its content vertically at a different speed from the page while it is
 * on screen. speed > 0 drifts up as you scroll down, speed < 0 drifts down.
 * Pass the positioning classes (absolute, top-…, etc.) via className.
 * Off for prefers-reduced-motion (see globals.css).
 */
export function Parallax({
  children,
  className = "",
  speed = 0.15,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      // distance of the element centre from the viewport centre
      const d = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.translate = `0 ${(d * speed).toFixed(1)}px`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} data-parallax className={`will-change-[translate] ${className}`} style={style}>
      {children}
    </div>
  );
}
