"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const APP_ROUTES = ["/admin", "/staff", "/partner", "/instructor", "/dashboard"];

interface ClickWave {
  id: number;
  x: number;
  y: number;
}

/**
 * Global ambient quantum field rendered on public marketing pages:
 * 1. Drifting bioluminescent quantum photons + subtle short-range entanglement lines (2D Canvas, 60fps, low CPU).
 * 2. Smooth cursor-following quantum aura on fine-pointer desktops.
 * 3. Concentric quantum interference wave-packet ripple on click.
 */
export function QuantumAmbientOverlay() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waves, setWaves] = useState<ClickWave[]>([]);

  const isAppRoute = APP_ROUTES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (isAppRoute) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const pointer = { x: -9999, y: -9999, smoothX: width / 2, smoothY: height / 2, active: false };

    const isMobile = width < 768;
    const count = isMobile ? 16 : 34;

    const particles = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: 1.4 + Math.random() * 2.1,
      phase: Math.random() * Math.PI * 2,
      gold: idx % 5 === 0,
    }));

    const onMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    let rafId = 0;
    let tick = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      tick += 0.025;

      ctx.clearRect(0, 0, width, height);

      // Smooth cursor halo on desktop
      if (pointer.active && !isMobile) {
        pointer.smoothX += (pointer.x - pointer.smoothX) * 0.12;
        pointer.smoothY += (pointer.y - pointer.smoothY) * 0.12;

        const grad = ctx.createRadialGradient(
          pointer.smoothX,
          pointer.smoothY,
          0,
          pointer.smoothX,
          pointer.smoothY,
          150,
        );
        grad.addColorStop(0, "rgba(43, 214, 180, 0.11)");
        grad.addColorStop(0.5, "rgba(14, 147, 126, 0.045)");
        grad.addColorStop(1, "rgba(14, 147, 126, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.smoothX, pointer.smoothY, 150, 0, Math.PI * 2);
        ctx.fill();

        // Tiny orbiting quantum ring around cursor
        ctx.save();
        ctx.translate(pointer.smoothX, pointer.smoothY);
        ctx.rotate(tick * 1.1);
        ctx.strokeStyle = "rgba(43, 214, 180, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        const ex = Math.cos(tick * 2.4) * 18;
        const ey = Math.sin(tick * 2.4) * 7;
        ctx.fillStyle = "rgba(255, 200, 69, 0.75)";
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & draw drifting quantum quanta
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gentle quantum attraction/orbit near cursor
        if (pointer.active && !isMobile) {
          const dx = pointer.smoothX - p.x;
          const dy = pointer.smoothY - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 26000 && distSq > 100) {
            p.x += dx * 0.004;
            p.y += dy * 0.004;
          }
        }

        const pulse = 0.45 + 0.45 * Math.sin(tick + p.phase);

        // Entanglement lines between nearby quanta
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < 16500) {
            const alpha = (1 - Math.sqrt(dSq) / 128) * 0.16;
            ctx.strokeStyle = `rgba(14, 147, 126, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = p.gold
          ? `rgba(255, 200, 69, ${pulse * 0.55})`
          : `rgba(43, 214, 180, ${pulse * 0.52})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [isAppRoute]);

  useEffect(() => {
    if (isAppRoute) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setWaves((prev) => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setWaves((prev) => prev.filter((w) => w.id !== id));
      }, 900);
    };

    window.addEventListener("click", onClick, { passive: true });
    return () => window.removeEventListener("click", onClick);
  }, [isAppRoute]);

  if (isAppRoute) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      <AnimatePresence>
        {waves.map((w) => (
          <motion.span
            key={w.id}
            initial={{ scale: 0.2, opacity: 0.75 }}
            animate={{ scale: 2.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ left: w.x - 24, top: w.y - 24 }}
            className="fixed h-12 w-12 rounded-full border border-[#2BD6B4] shadow-[0_0_16px_rgba(43,214,180,0.5)]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Multi-axis 3D tilted Quantum Atom Orbital watermark with revolving glowing electrons.
 * Works cleanly on both dark emerald sections (`theme="dark"`) and light mint/white sections (`theme="light"`).
 */
export function QuantumAtomOrbital({
  className = "",
  size = 340,
  theme = "dark",
}: {
  className?: string;
  size?: number;
  theme?: "dark" | "light";
}) {
  const rawId = useId();
  const gradId = `q-core-${rawId.replace(/:/g, "")}`;
  const strokePrimary = theme === "dark" ? "rgba(43, 214, 180, 0.28)" : "rgba(14, 147, 126, 0.2)";
  const strokeSecondary = theme === "dark" ? "rgba(255, 200, 69, 0.22)" : "rgba(5, 64, 56, 0.14)";
  const coreColor = theme === "dark" ? "#2BD6B4" : "#0E937E";

  return (
    <div
      style={{ width: size, height: size }}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 240"
        className="h-full w-full overflow-visible animate-quantum-spin"
      >
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.9" />
            <stop offset="55%" stopColor={coreColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Quantized Energy Shell */}
        <circle
          cx="120"
          cy="120"
          r="106"
          fill="none"
          stroke={strokeSecondary}
          strokeWidth="1"
          strokeDasharray="4 7"
        />

        {/* 3 Tilted Bohr Electron Orbits */}
        {[0, 60, 120].map((angle, idx) => (
          <g key={angle} transform={`rotate(${angle} 120 120)`}>
            <ellipse
              cx="120"
              cy="120"
              rx="98"
              ry="36"
              fill="none"
              stroke={idx === 1 ? strokeSecondary : strokePrimary}
              strokeWidth="1.35"
            />
            {/* Revolving Electron Node */}
            <circle r={idx === 1 ? "4" : "3.5"} fill={idx === 1 ? "#FFC845" : "#2BD6B4"}>
              <animateMotion
                dur={`${7 + idx * 2.5}s`}
                repeatCount="indefinite"
                path="M 22,120 A 98,36 0 1,0 218,120 A 98,36 0 1,0 22,120 Z"
              />
            </circle>
          </g>
        ))}

        {/* Glowing Quantum Nucleus */}
        <circle cx="120" cy="120" r="22" fill={`url(#${gradId})`} />
        <circle cx="120" cy="120" r="5" fill={theme === "dark" ? "#FFC845" : "#054038"} />
      </svg>
    </div>
  );
}

/**
 * Animated Quantum Wave-Function Interference Divider.
 * Renders phase-shifted harmonic quantum waves and gliding photon energy pulses along section boundaries.
 */
export function QuantumWaveStream({
  theme = "light",
  className = "",
}: {
  theme?: "dark" | "light";
  className?: string;
}) {
  const waveStrokeA = theme === "dark" ? "rgba(43, 214, 180, 0.35)" : "rgba(14, 147, 126, 0.28)";
  const waveStrokeB = theme === "dark" ? "rgba(255, 200, 69, 0.25)" : "rgba(43, 214, 180, 0.35)";

  return (
    <div
      className={`pointer-events-none relative h-10 w-full overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <div className="flex w-[200%] h-full animate-quantum-wave">
        {[0, 1].map((seg) => (
          <svg
            key={seg}
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
            className="h-full w-1/2 shrink-0"
          >
            <path
              d="M0 24 Q 150 4, 300 24 T 600 24 T 900 24 T 1200 24"
              fill="none"
              stroke={waveStrokeA}
              strokeWidth="1.6"
            />
            <path
              d="M0 24 Q 150 44, 300 24 T 600 24 T 900 24 T 1200 24"
              fill="none"
              stroke={waveStrokeB}
              strokeWidth="1.2"
              strokeDasharray="6 6"
            />
          </svg>
        ))}
      </div>

      {/* Gliding Quantum Photon Streak */}
      <div className="absolute top-1/2 -mt-px left-0 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#2BD6B4] to-[#FFC845] rounded-full shadow-[0_0_12px_#2BD6B4] animate-quantum-photon" />
    </div>
  );
}
