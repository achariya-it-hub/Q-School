"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat like "25,000+" or "4.8 / 5" up from zero when it scrolls into
 * view. Server render and no-JS show the final value.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const m = value.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  const target = m ? parseFloat(m[1].replace(/,/g, "")) : NaN;
  const decimals = m && m[1].includes(".") ? m[1].split(".")[1].length : 0;
  const suffix = m ? m[2] : "";
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || Number.isNaN(target) || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    setN(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(target * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  const shown =
    n === null || Number.isNaN(target)
      ? value
      : n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  return (
    <span ref={ref} aria-label={value} className="tabular-nums">
      {shown}
    </span>
  );
}
