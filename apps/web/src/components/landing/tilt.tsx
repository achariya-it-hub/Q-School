"use client";

import { useEffect, useRef } from "react";

/**
 * Tilts its content toward the cursor in 3D with a soft light glare.
 * Only on devices with a fine pointer that hover; off for touch and for
 * prefers-reduced-motion. Children can pop out with `[transform:translateZ(..)]`
 * as long as each ancestor up to here keeps `[transform-style:preserve-3d]`.
 */
export function Tilt({
  children,
  className = "",
  max = 7,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transition = "transform 90ms linear";
        el.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * max * 2).toFixed(2)}deg) rotateY(${((x - 0.5) * max * 2).toFixed(2)}deg)`;
        el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        el.dataset.tilt = "on";
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.transition = "transform 600ms cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "";
      delete el.dataset.tilt;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt relative [transform-style:preserve-3d] ${className}`}>
      {children}
      {glare && <span aria-hidden className="tilt-glare" />}
    </div>
  );
}
