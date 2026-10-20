import { Icon } from "@/components/icons";
import { Parallax } from "@/components/landing/parallax";
import { Photo } from "@/components/landing/photo";
import { HeroSlider, type WindowOverride } from "@/components/landing/hero-slider";
import { PHOTOS } from "@/components/landing/photos";

/**
 * Hero collage: a live-class window with real photos layered around it and
 * floating progress cards. Layers drift at different speeds on scroll.
 */
export function HeroVisual({ classWindow }: { classWindow?: WindowOverride } = {}) {
  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-28 pt-6 sm:pb-24">
      {/* glow */}
      <div className="absolute inset-x-6 top-10 h-72 rounded-full bg-brand-teal500/30 blur-3xl" aria-hidden />

      {/* back photo: robotics (top-left, behind the window) */}
      <Parallax speed={0.04} className="absolute -top-8 left-4 z-0 hidden sm:block">
        <Photo
          src={PHOTOS.robotics.src}
          alt={PHOTOS.robotics.alt}
          fallbackArt="robot"
          eager
          className="photo-tile h-48 w-40 -rotate-[8deg] rounded-3xl"
        >
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            Robotics lab
          </span>
        </Photo>
      </Parallax>

      {/* classroom window: slider of live classes */}
      <HeroSlider single first={classWindow} />

      {/* front photo: group at a centre (bottom-left, over the window) */}
      <Parallax speed={-0.06} className="absolute -left-2 bottom-0 z-20 sm:-bottom-1 sm:-left-6">
        <Photo
          src={PHOTOS.group.src}
          alt={PHOTOS.group.alt}
          fallbackArt="building"
          eager
          className="photo-tile aspect-[4/3] w-36 rotate-[5deg] rounded-2xl"
        >
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-deep">
            <Icon name="pin" size={10} /> Chennai centre
          </span>
        </Photo>
      </Parallax>

      {/* floating: certificate */}
      <Parallax speed={0.05} className="absolute -left-2 top-[34%] z-30 sm:-left-10 sm:top-[46%]">
        <div className="flex animate-float items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl">
          <span className="icon-3d h-9 w-9 rounded-xl" style={{ ["--c" as string]: "#F2B33D" }}>
            <Icon name="award" size={18} />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-brand-ink">Certificate earned</p>
            <p className="text-[10.5px] text-[#6b807b]">Creative Writing</p>
          </div>
        </div>
      </Parallax>

      {/* floating: next class */}
      <Parallax speed={-0.1} className="absolute -right-2 bottom-4 z-30 sm:-right-6">
        <div className="flex animate-float items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl" style={{ animationDelay: "1.2s" }}>
          <span className="icon-3d h-9 w-9 rounded-xl">
            <Icon name="calendar" size={17} />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-brand-ink">Next class · 4:00 PM</p>
            <p className="text-[10.5px] text-[#6b807b]">Reminder sent on WhatsApp</p>
          </div>
        </div>
      </Parallax>

      {/* floating: progress */}
      <Parallax speed={0.14} className="absolute -right-10 top-[14%] z-30 hidden sm:block">
        <div className="animate-float rounded-2xl bg-white px-3.5 py-3 shadow-xl" style={{ animationDelay: "2.2s" }}>
          <p className="text-[10.5px] font-medium text-[#6b807b]">This week</p>
          <p className="text-[15px] font-semibold text-brand-ink">5 h 20 m learnt</p>
          <div className="mt-2 flex h-8 items-end gap-1">
            {[40, 65, 30, 80, 55, 95, 70].map((h, i) => (
              <span key={i} className="w-2.5 rounded-sm bg-brand-teal500" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.45 }} />
            ))}
          </div>
        </div>
      </Parallax>
    </div>
  );
}
