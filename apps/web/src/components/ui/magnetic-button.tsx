"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function MagneticButton({ children, onClick, href, className = "" }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth spring physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring configuration for that "magnetic" pull feel
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    // Calculate distance from cursor to center of button
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Apply a maximum pull distance (30px)
    const pullX = (clientX - centerX) * 0.35;
    const pullY = (clientY - centerY) * 0.35;

    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: xSpring, y: ySpring }}
      className={`
        relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-base sm:text-lg
        bg-gradient-to-r from-[#0E937E] via-[#2BD6B4] to-[#5B6CF0] text-brand-deep
        shadow-[0_10px_40px_-10px_rgba(43,214,180,0.6)]
        transition-all duration-300 ease-out cursor-pointer
        ${isHovered ? "shadow-[0_20px_50px_-10px_rgba(43,214,180,0.85)] scale-105" : "scale-100"}
        overflow-hidden group ${className}
      `}
    >
      {/* Animated background glow on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#5B6CF0] via-[#2BD6B4] to-[#0E937E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2 font-black tracking-wide text-brand-deep">
        {children}
        <motion.span
          animate={isHovered ? { x: 5 } : { x: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          →
        </motion.span>
      </span>
    </motion.div>
  );

  if (href) {
    return <a href={href} className="inline-block">{content}</a>;
  }

  return content;
}
