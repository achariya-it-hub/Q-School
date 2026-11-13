"use client";

import Image from "next/image";
import { Icon } from "@/components/icons";
import { Parallax } from "@/components/landing/parallax";
import { HeroSlider, type WindowOverride } from "@/components/landing/hero-slider";

/**
 * Ultra-modern Hero Visual Showcase:
 * Integrates the live class window, authentic Neo Sapiens artwork,
 * real Q-School centre photos, and holographic floating cognitive badges.
 */
export function HeroVisual({ classWindow }: { classWindow?: WindowOverride } = {}) {
  return (
    <div className="relative mx-auto w-full max-w-[540px] pb-24 pt-4 sm:pb-20">
      {/* Dynamic Ambient Glow Behind Hero */}
      <div className="absolute inset-x-4 top-8 h-80 rounded-full bg-gradient-to-tr from-[#2BD6B4]/35 via-brand-teal/30 to-[#5B6CF0]/25 blur-3xl" aria-hidden />

      {/* Back Layer: Authentic Mentor & Student Session Photo */}
      <Parallax speed={0.05} className="absolute -top-7 -left-3 z-0 hidden sm:block">
        <div className="relative h-44 w-36 -rotate-6 overflow-hidden rounded-3xl border-2 border-white/20 bg-brand-deep/60 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-0 hover:scale-105">
          <Image
            src="/images/pic-brain-boy.png"
            alt="Q-School young learner activating quantum intelligence"
            fill
            sizes="160px"
            className="object-cover opacity-90 transition-opacity hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="absolute bottom-2 left-2.5 inline-flex items-center gap-1 rounded-full bg-[#054038]/90 px-2 py-0.5 text-[10px] font-bold text-[#2BD6B4] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2BD6B4] animate-ping" />
            1:1 Mentor Guide
          </span>
        </div>
      </Parallax>

      {/* Main Focal Window: Hero Slider / Interactive Class Preview */}
      <div className="relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        <div className="rounded-3xl border border-white/25 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
          <HeroSlider first={classWindow} />
        </div>
      </div>

      {/* Front Layer: Authentic Q-School Physical Centre Badge */}
      <Parallax speed={-0.06} className="absolute -left-3 -bottom-5 z-20 sm:-bottom-4 sm:-left-6">
        <div className="relative h-32 w-44 rotate-3 overflow-hidden rounded-2xl border-2 border-white/30 bg-brand-deep/80 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-0 hover:scale-105">
          <Image
            src="/images/side-family.png"
            alt="Q-School Learning Centre"
            fill
            sizes="180px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2BD6B4] px-2 py-0.5 text-[9.5px] font-black text-brand-deep shadow-sm">
              <Icon name="pin" size={10} /> 9 Physical Centres
            </span>
            <p className="mt-0.5 text-[10.5px] font-semibold text-white drop-shadow">Puducherry & across India</p>
          </div>
        </div>
      </Parallax>

      {/* Floating Holographic Badge 1: Real-time Cognitive Stamina */}
      <Parallax speed={0.12} className="absolute -right-3 top-8 z-30 sm:-right-8">
        <div className="flex animate-float items-center gap-3 rounded-2xl border border-white/25 bg-white/95 px-4 py-3 shadow-[0_12px_32px_rgba(5,64,56,0.18)] backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0E937E] to-[#2BD6B4] text-brand-deep shadow-md">
            <Icon name="sparkle" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0E937E] animate-pulse" />
              <p className="text-[12px] font-extrabold uppercase tracking-wide text-brand-ink">Cognitive Stamina</p>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-black text-[#0B6E5F]">98% Active</span>
              <div className="flex items-end gap-0.5 h-3">
                {[6, 10, 14, 9, 12, 16, 11].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-[#2BD6B4]"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Parallax>

      {/* Floating Holographic Badge 2: Q-5D Framework Badge */}
      <Parallax speed={0.06} className="absolute -left-2 top-[38%] z-30 sm:-left-9">
        <div className="flex animate-float items-center gap-2.5 rounded-2xl border border-white/30 bg-gradient-to-br from-[#054038] to-[#0A2924] p-3 text-white shadow-2xl backdrop-blur-md" style={{ animationDelay: "1.4s" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2BD6B4] text-brand-deep font-black text-xs shadow-inner">
            5D
          </div>
          <div>
            <p className="text-[11.5px] font-bold text-[#2BD6B4]">Q 5D™ Framework</p>
            <p className="text-[10px] text-white/80">Spatial · Speed · Divergent</p>
          </div>
        </div>
      </Parallax>

      {/* Floating Holographic Badge 3: 48 Classes Per Year Continuous Journey */}
      <Parallax speed={-0.08} className="absolute -right-2 bottom-3 z-30 sm:-right-6">
        <div className="flex animate-float items-center gap-3 rounded-2xl border border-[#CFE3DD] bg-white/95 px-3.5 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur-md" style={{ animationDelay: "2.1s" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5B6CF0]/15 text-[#5B6CF0]">
            <Icon name="calendar" size={18} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-brand-ink">48 Classes / Annum</p>
            <p className="text-[10.5px] font-medium text-[#5c7772]">4 Core + 2 Buffer / Month</p>
          </div>
        </div>
      </Parallax>

      {/* Floating Holographic Badge 4: Parent Trust Rating */}
      <Parallax speed={0.16} className="absolute right-6 -top-6 z-30 hidden sm:block">
        <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-md">
          <div className="flex text-[#F29A2E]">
            {[...Array(5)].map((_, i) => (
              <Icon key={i} name="star" size={13} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-[11.5px] font-bold text-brand-deep">4.9 / 5.0 (25k+ Families)</span>
        </div>
      </Parallax>
    </div>
  );
}
