"use client";

import { useEffect, useRef, useState } from "react";

export type RevealVariant = "up" | "left" | "right" | "zoom" | "blur" | "flip" | "line" | "wipe";

/**
 * Animates content in as it scrolls into view. Content is visible on the
 * server render and without JS. Only elements that start below the fold are
 * hidden, and only after mount, so nothing flashes. Respects
 * prefers-reduced-motion (see globals.css).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as: Tag = "div",
}: {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  as?: "div" | "li" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = [
    className,
    `reveal-${variant}`,
    state === "static" ? "" : "reveal",
    state === "hidden" ? "reveal-hidden" : "",
    state === "shown" ? "reveal-shown" : "",
  ].join(" ");

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cls}
      style={state === "shown" && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
