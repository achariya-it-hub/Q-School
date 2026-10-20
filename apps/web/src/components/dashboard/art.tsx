import { ART, type ArtKey } from "@qschool/shared";
import { Icon, type IconName } from "@/components/icons";

/**
 * Illustrated thumbnail: brand gradient + soft glow + glyph.
 * Pass `src` to show a real photo instead once course media exists.
 */
export function Art({
  art,
  src,
  className = "",
  iconSize = 44,
  children,
}: {
  art: ArtKey;
  src?: string;
  className?: string;
  iconSize?: number;
  children?: React.ReactNode;
}) {
  const a = ART[art];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${a.from} 0%, ${a.to} 100%)` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl"
            style={{ background: `radial-gradient(circle, ${a.accent} 0%, transparent 55%)` }}
          />
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full border border-white/15" />
          <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full border border-white/10" />
          <span className="absolute left-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-white/50" />
          <span className="absolute right-[22%] bottom-[24%] h-1 w-1 rounded-full bg-white/60" />
          <span className="absolute right-[30%] top-[18%] h-1 w-1 rounded-full" style={{ background: a.accent }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: a.accent }}>
            <Icon name={art as IconName} size={iconSize} strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 12px ${a.accent}aa)` }} />
          </div>
        </>
      )}
      {children}
    </div>
  );
}

export function Avatar({ name, size = 44, className = "" }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2BB39C] to-[#054038] font-semibold text-white ring-2 ring-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
