import Link from "next/link";
import { Avatar } from "@/components/dashboard/art";
import { Icon, type IconName } from "@/components/icons";
import { Photo } from "@/components/landing/photo";
import type { HeroSlide } from "@/lib/site/home-content";

/** A full-width hero slide: background photo, headline, CTAs and an optional info card. */
export function PhotoSlide({ s, heading = false }: { s: HeroSlide; heading?: boolean }) {
  const Title = heading ? "h1" : "h2";
  const filled = Math.max(0, s.card.seatsTotal - s.card.seatsLeft);
  const showCard = s.card.show && (s.card.title || s.card.lines.length > 0);
  return (
    <div className="relative flex h-full min-h-[640px] items-start overflow-hidden lg:min-h-0 lg:items-center">
      {/* background photo with brand-tinted overlays */}
      <Photo src={s.image} alt={s.imageAlt} fallbackArt="bulb" className="!absolute inset-0" imgClassName="hero-kenburns" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/20" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-transparent to-brand-deep/30" aria-hidden />

      <div className={`container-qs relative grid w-full grid-cols-1 items-center gap-10 pb-28 pt-14 lg:pb-32 lg:pt-20 ${showCard ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <div className={showCard ? "" : "max-w-3xl"}>
          {(s.badge || s.kicker) && (
            <span className="hs-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-[12.5px] font-medium text-white/90 backdrop-blur" style={{ ["--d" as string]: "0ms" }}>
              {s.badge && <span className="rounded-full bg-[#FFC845] px-2 py-0.5 text-[11px] font-bold text-brand-deep">{s.badge}</span>}
              {s.kicker}
            </span>
          )}
          <Title className="hs-in mt-6 text-[2.35rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]" style={{ ["--d" as string]: "90ms" }}>
            {s.title} {s.accent && <span className="text-[#2BD6B4]">{s.accent}</span>}
          </Title>
          {s.body && (
            <p className="hs-in mt-6 max-w-xl text-[16.5px] leading-relaxed text-white/80" style={{ ["--d" as string]: "180ms" }}>
              {s.body}
            </p>
          )}
          {s.chips.length > 0 && (
            <div className="hs-in mt-6 flex flex-wrap gap-2" style={{ ["--d" as string]: "260ms" }}>
              {s.chips.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-medium backdrop-blur">
                  <Icon name={c.icon as IconName} size={14} className="text-[#2BD6B4]" /> {c.label}
                </span>
              ))}
            </div>
          )}
          <div className="hs-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "340ms" }}>
            {s.primary.label && (
              <Link href={s.primary.href} className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
                {s.primary.label}
              </Link>
            )}
            {s.secondary.label && (
              <Link href={s.secondary.href} className="btn-3d btn-3d-glass inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
                {s.secondary.label} <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>

        {showCard && (
          <div className="hs-in flex lg:justify-end" style={{ ["--d" as string]: "420ms" }}>
            <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_30px_60px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl sm:max-w-[340px]">
              {s.card.heading && <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2BD6B4]">{s.card.heading}</p>}
              {s.card.title && <p className="mt-2 text-xl font-bold leading-snug">{s.card.title}</p>}
              {s.card.mentor && (
                <div className="mt-4 flex items-center gap-3">
                  <Avatar name={s.card.mentor} size={36} className="!ring-white/30" />
                  <p className="text-[13px] leading-tight text-white/80">
                    <b className="block text-white">{s.card.mentor}</b> Lead mentor
                  </p>
                </div>
              )}
              {s.card.lines.length > 0 && (
                <ul className="mt-5 space-y-2.5 border-t border-white/15 pt-4">
                  {s.card.lines.map((l, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-white/85">
                      <span className="icon-3d h-7 w-7 rounded-lg" style={{ ["--c" as string]: "#0E937E" }}>
                        <Icon name={l.icon as IconName} size={14} />
                      </span>
                      {l.text}
                    </li>
                  ))}
                </ul>
              )}
              {s.card.seatsTotal > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-[12px] text-white/70">
                    <span>Seats filled</span>
                    <b className="text-white">
                      {filled} / {s.card.seatsTotal}
                    </b>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2BD6B4] to-[#FFC845]" style={{ width: `${Math.min(100, (filled / s.card.seatsTotal) * 100)}%` }} />
                  </div>
                  {s.card.seatsLeft > 0 && <p className="mt-2 text-[12px] font-semibold text-[#FFC845]">Only {s.card.seatsLeft} seats left</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
