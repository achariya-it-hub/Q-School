import Link from "next/link";
import { CENTERS, PROGRAMS, WEBINAR_LIST, WORKSHOPS, fmtCount } from "@qschool/shared";
import { LeadForm } from "@/components/lead-form";
import { Icon, type IconName } from "@/components/icons";
import { Art, Avatar } from "@/components/dashboard/art";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Reveal } from "@/components/landing/reveal";
import { Tilt } from "@/components/landing/tilt";
import { Parallax } from "@/components/landing/parallax";
import { CountUp } from "@/components/landing/count-up";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { PhotoSlide } from "@/components/landing/photo-slide";
import { QuantumNexus } from "@/components/three/quantum-nexus";
import { QuantumCoreOrb } from "@/components/three/quantum-core-orb";
import { QuantumBrainMesh } from "@/components/three/quantum-brain-mesh";
import {
  SpotlightCard,
  BorderBeam,
  ScrollMotion,
  StaggerContainer,
  StaggerItem,
  TiltCard21,
} from "@/components/ui/21st";
import type { HeroSlide, HomeContent, SectionKey } from "@/lib/site/home-content";

/* Renders the home page from editable content (Admin Console › Website & Official Brochure). */

const Kicker = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) =>
  children ? <p className={`text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-[0.16em] ${dark ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{children}</p> : null;

const H2 = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2 className={`mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-[1.2] ${dark ? "" : "text-brand-deep"}`}>{children}</h2>
);

function BrandSlide({ s }: { s: HeroSlide }) {
  return (
    <div className="container-qs relative grid grid-cols-1 items-center gap-12 pb-28 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
      <div>
        {(s.badge || s.kicker) && (
          <span className="hs-in inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-4 text-xs sm:text-[13px] font-semibold text-white/95 backdrop-blur-xs">
            {s.badge && <span className="rounded-full bg-[#2BD6B4] px-2.5 py-0.5 text-xs font-black text-brand-deep">{s.badge}</span>}
            {s.kicker}
          </span>
        )}
        <h1 className="hs-in mt-6 text-[2.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]" style={{ ["--d" as string]: "90ms" }}>
          {s.title}{" "}
          {s.accent && (
            <span className="relative text-[#2BD6B4] sm:whitespace-nowrap">
              {s.accent}
              <svg viewBox="0 0 300 14" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden>
                <path d="M2 10C70 3 160 1 298 7" fill="none" stroke="#2BD6B4" strokeWidth="3" strokeLinecap="round" opacity=".6" />
              </svg>
            </span>
          )}
        </h1>
        {s.body && (
          <p className="hs-in mt-6 max-w-xl text-lg sm:text-[19px] leading-relaxed text-white/85 font-normal" style={{ ["--d" as string]: "180ms" }}>
            {s.body}
          </p>
        )}
        <div className="hs-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "270ms" }}>
          {s.primary.label && (
            <Link href={s.primary.href} className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-base font-bold shadow-lg">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-deep text-[#2BD6B4] shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
                <Icon name="play" size={13} fill="currentColor" />
              </span>
              {s.primary.label}
            </Link>
          )}
          {s.secondary.label && (
            <Link href={s.secondary.href} className="btn-3d btn-3d-glass inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-base font-bold backdrop-blur-sm">
              {s.secondary.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>

        {(s.trustLearners || s.trustRating) && (
          <div className="hs-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ ["--d" as string]: "360ms" }}>
            {s.trustLearners && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {["Asha V", "Rohit S", "Neha J", "Kiran B"].map((n) => (
                    <Avatar key={n} name={n} size={36} className="!ring-brand-deep" />
                  ))}
                </div>
                <p className="text-[13px] leading-tight text-white/75">
                  <b className="block text-[15px] text-white">{s.trustLearners}</b>
                  across India
                </p>
              </div>
            )}
            {s.trustLearners && s.trustRating && <div className="h-10 w-px bg-white/15 max-sm:hidden" />}
            {s.trustRating && (
              <div>
                <div className="flex gap-0.5 text-[#FFC845]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-1 text-[13px] text-white/75">
                  <b className="text-white">{s.trustRating}</b> from parent reviews
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hs-in" style={{ ["--d" as string]: "200ms" }}>
        <Tilt max={5} glare={false} className="mx-auto w-full max-w-[520px]">
          <HeroVisual
            classWindow={{
              photo: s.image ? { src: s.image, alt: s.imageAlt || s.windowTitle } : undefined,
              title: s.windowTitle || undefined,
              mentor: s.windowMentor || undefined,
              meta: s.windowMeta || undefined,
            }}
          />
        </Tilt>
      </div>
    </div>
  );
}

function Hero({ c }: { c: HomeContent["hero"] }) {
  const slides = c.slides.filter((s) => s.enabled);
  if (!slides.length) return null;
  return (
    <section className="relative overflow-hidden bg-brand-deep text-white">
      {/* 3D Quantum Particle Constellation Canvas */}
      <QuantumNexus className="pointer-events-none absolute inset-0 z-0 opacity-45" particleCount={95} speed={0.45} colorScheme="teal" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden
      />
      <Parallax speed={-0.25} className="pointer-events-none absolute -right-40 -top-40">
        <div className="h-[520px] w-[520px] rounded-full bg-brand-teal/40 blur-3xl" aria-hidden />
      </Parallax>
      <Parallax speed={0.2} className="pointer-events-none absolute -bottom-48 -left-32">
        <div className="h-[420px] w-[420px] rounded-full bg-[#2BD6B4]/20 blur-3xl" aria-hidden />
      </Parallax>

      <HeroCarousel labels={slides.map((s) => s.label)} interval={c.interval * 1000}>
        {slides.map((s, i) =>
          s.layout === "collage" ? <BrandSlide key={s.id} s={s} /> : <PhotoSlide key={s.id} s={s} heading={i === 0} />,
        )}
      </HeroCarousel>

      <svg viewBox="0 0 1440 60" className="pointer-events-none absolute -bottom-px left-0 z-20 h-10 w-full text-[#f4faf8] sm:h-14" preserveAspectRatio="none" aria-hidden>
        <path d="M0 60V30C240 0 480 0 720 22s480 30 720 0v38Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function Stats({ c, overlap }: { c: HomeContent["stats"]; overlap: boolean }) {
  if (!c.items.length) return null;
  const cols = c.items.length >= 4 ? "lg:grid-cols-4" : c.items.length === 3 ? "lg:grid-cols-3" : "";
  return (
    <section className={`container-qs relative z-10 ${overlap ? "-mt-4" : "mt-10"}`}>
      <Reveal variant="zoom">
        <div className={`emboss grid grid-cols-2 gap-2.5 rounded-[22px] p-2.5 ${cols}`}>
          {c.items.map((s, i) => (
            <div key={i} className="deboss rounded-2xl px-4 py-5 text-center">
              <p className="text-emboss text-2xl font-bold text-brand-deep sm:text-[1.7rem]">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-[12.5px] text-[#5c7772]">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Subjects({ c }: { c: HomeContent["subjects"] }) {
  if (!c.items.length) return null;
  return (
    <section className="relative mt-8 overflow-hidden py-3" aria-label="Core Mantras">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4faf8]" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4faf8]" aria-hidden />
      <div className="flex w-max animate-marquee gap-3">
        {[...c.items, ...c.items].map((s, i) => (
          <span
            key={i}
            aria-hidden={i >= c.items.length}
            className="emboss inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-bold tracking-wide text-[#41564f]"
          >
            <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: s.color }} />
            {s.label}
            {s.count && <span className="rounded-md bg-[#2BD6B4]/15 px-1.5 py-0.2 text-[11px] text-[#0E937E] font-bold">{s.count}</span>}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── 1. The Q-School Story & Gen Alpha ───────────────────────── */
function StoryAndGenAlpha() {
  const traits = [
    { icon: "laptop", title: "Digitally Native", desc: "Comfortable with technology and digital experiences.", color: "#0E937E" },
    { icon: "sparkle", title: "Instantly Stimulated", desc: "Accustomed to fast-paced information and immediate responses.", color: "#5B6CF0" },
    { icon: "eye", title: "Curious Explorers", desc: "Thrive on discovery, interaction, and engaging experiences.", color: "#F29A2E" },
    { icon: "heart", title: "Unique Learners", desc: "Have individual strengths, distinctive interests, and unique learning needs.", color: "#E2557A" },
    { icon: "planet", title: "Future-Driven", desc: "Need the ability to think independently, adapt, and solve problems.", color: "#054038" },
  ];

  return (
    <section id="story" className="relative scroll-mt-20 py-24 bg-gradient-to-b from-[#F4F8F7] via-white to-[#F4F8F7] border-y border-[#E2ECE9] overflow-hidden">
      {/* 3D Ambient Quantum Field */}
      <QuantumNexus className="pointer-events-none absolute inset-0 opacity-30" particleCount={85} speed={0.35} colorScheme="emerald" />

      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The Q-School Story</Kicker>
          <H2>A Brighter Future Starts With the Learner</H2>
          <p className="mt-4 text-lg sm:text-xl leading-relaxed text-[#3b544e]">
            Every generation of parents has asked the same question in a different way: <strong className="text-brand-ink font-bold">what will my child need to thrive?</strong> For children growing up alongside smartphones, artificial intelligence, and constant change, the answer is evolving faster than any curriculum can keep pace.
          </p>
        </ScrollMotion>

        {/* Narrative & Founder Quote Split */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* Left Card: The Shift */}
          <ScrollMotion variant="fade-left" className="h-full">
            <SpotlightCard
              spotlightColor="rgba(43, 214, 180, 0.22)"
              borderColor="rgba(43, 214, 180, 0.5)"
              className="p-8 sm:p-10 shadow-xl flex h-full flex-col justify-between group"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4]/20 !text-[#0B6E5F] font-bold">THE SHIFT</span>
                  <span className="text-xs font-bold text-[#0E937E] uppercase tracking-wider">Human Intelligence First</span>
                </div>
                <h3 className="mt-5 text-2xl sm:text-3xl font-extrabold text-brand-ink">Beyond Competing with Machines</h3>
                <p className="mt-4 text-base sm:text-[17px] leading-relaxed text-[#4b635e]">
                  Q-School (The Quantum Schooling) was created to respond to that shift — <strong className="text-brand-ink font-semibold">not by teaching children to compete with machines</strong>, but by deliberately developing the human capacities that remain essential:
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {["Attention", "Imagination", "Judgement", "Emotional Awareness", "Self-Belief", "Creativity", "Original Thought"].map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-white/95 px-4 py-1.5 text-xs sm:text-[13.5px] font-bold text-brand-deep border border-[#CFE3DD] shadow-xs hover:border-[#2BD6B4] hover:shadow-[0_0_14px_rgba(43,214,180,0.45)] hover:scale-105 transition duration-300 cursor-default"
                    >
                      ✦ {c}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm sm:text-base leading-relaxed text-[#4b635e]">
                  Drawing from contemporary learning methods, cognitive-development practices, and selected principles inspired by India’s knowledge traditions, Q-School brings these dimensions together in one structured learning journey.
                </p>

                {/* Mentor Photo Card */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-[#CFE3DD] shadow-sm group/img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/mentor-student.jpg"
                    alt="Q-School Certified Mentor guiding young learner"
                    className="h-48 w-full object-cover transition duration-700 group-hover/img:scale-105"
                  />
                  <div className="bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-[#0B6E5F] flex items-center justify-between">
                    <span>Individualised Mentor Guidance</span>
                    <span className="text-[#6b807b] font-normal">Ages 6–14 Years</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 border-t border-[#E2ECE9] pt-6 flex items-center gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-deep text-[#2BD6B4] shadow-md">
                  <Icon name="award" size={22} />
                </span>
                <div>
                  <p className="text-base font-bold text-brand-ink">For Children Aged 6–14 Years</p>
                  <p className="text-xs sm:text-sm text-[#5c7772]">48 Classes Per Annum · Continuous Developmental Journey</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollMotion>

          {/* Right Card: Founder's Quote with 21st.dev Border Beam */}
          <ScrollMotion variant="fade-right" delay={0.15} className="h-full">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#054038] via-[#04332D] to-[#011C18] p-8 text-white sm:p-10 shadow-2xl border border-[#2BD6B4]/30 group">
              {/* 21st.dev Radiant Border Beam */}
              <BorderBeam size={280} duration={10} colorFrom="#2BD6B4" colorTo="#0E937E" borderWidth={2} />

              {/* Interactive 3D Quantum Atom Core */}
              <div className="absolute -top-10 -right-10 w-60 h-60 pointer-events-auto opacity-80 group-hover:opacity-100 transition duration-500">
                <QuantumCoreOrb />
              </div>
              <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#2BD6B4]/15 blur-2xl" />

              <div className="relative z-10">
                <span className="font-hand text-6xl leading-none text-[#2BD6B4]">&ldquo;</span>
                <blockquote className="mt-2 text-lg sm:text-xl lg:text-[22px] font-medium leading-relaxed text-white/95 max-w-[88%]">
                  Education must do more than transfer information. It must develop the human being who receives it. My vision for Q-School is to help every child discover their strengths, build the habits to use them well, and grow with the confidence to navigate a world that is changing every day.
                </blockquote>
                <div className="mt-8 border-t border-white/15 pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-[#2BD6B4]">Dr J Arawindhan</p>
                    <p className="text-sm text-white/75">Founder, Chief Mentor &amp; Managing Director, Q-School</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#2BD6B4] border border-[#2BD6B4]/30 backdrop-blur-xs">
                    <span className="h-2 w-2 rounded-full bg-[#2BD6B4] animate-ping" />
                    3D Quantum Core
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/15 pt-6 text-xs sm:text-sm">
                <div className="rounded-2xl bg-white/10 p-4.5 backdrop-blur-xs border border-white/10 hover:border-[#2BD6B4]/50 transition">
                  <p className="font-bold text-[#2BD6B4] uppercase tracking-wider text-xs">Our Mission</p>
                  <p className="mt-1.5 text-white/85 leading-relaxed">Systematically develop every child&apos;s ability to focus, learn, think, create, communicate, adapt, solve and lead in an AI-driven world.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4.5 backdrop-blur-xs border border-white/10 hover:border-[#2BD6B4]/50 transition">
                  <p className="font-bold text-[#2BD6B4] uppercase tracking-wider text-xs">Our Vision</p>
                  <p className="mt-1.5 text-white/85 leading-relaxed">The definitive future-readiness programme recognized nationally as the trusted partner that develops the learner behind the learning.</p>
                </div>
              </div>
            </div>
          </ScrollMotion>
        </div>

        {/* Gen Alpha & New-Age Parenting Challenge */}
        <ScrollMotion variant="fade-up" delay={0.2} className="mt-18 rounded-3xl bg-[#F4F8F7] border border-[#CFE3DD] p-8 sm:p-11 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 relative">
              <div className="overflow-hidden rounded-3xl border border-[#CFE3DD] shadow-md aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gen-alpha-kid.jpg"
                  alt="Generation Alpha Learner"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-3 -right-3 rounded-2xl bg-[#054038] text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-lg border border-[#2BD6B4]/30">
                Ages 6–14 Years
              </span>
            </div>

            <div className="lg:col-span-7">
              <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">GEN ALPHA</span>
              <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-ink">A New Generation. A New World. A New Way to Learn.</h3>
              <p className="mt-3.5 text-base sm:text-lg text-[#4b635e] leading-relaxed">
                Born into a digitally connected world, Generation Alpha is growing up alongside artificial intelligence, smart technology and rapid global change. Their future calls for adaptability, creativity, critical thinking, and emotional intelligence.
              </p>
              <div className="mt-5 rounded-2xl border border-[#2BD6B4]/40 bg-[#E9F6F3] p-5 text-left">
                <p className="text-sm sm:text-base font-semibold text-brand-deep italic">
                  &ldquo;My child is growing up in a world I never experienced. Am I preparing them for the future they will inherit?&rdquo;
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-[#41564f]">
                  The answer lies in nurturing the child behind the learning — attention, judgment, and original imagination.
                </p>
              </div>
            </div>
          </div>

          {/* 5 Traits with 21st.dev Stagger & Spotlight */}
          <StaggerContainer className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" staggerDelay={0.08}>
            {traits.map((t, idx) => (
              <StaggerItem key={idx}>
                <SpotlightCard
                  spotlightColor="rgba(14, 147, 126, 0.15)"
                  className="p-5 text-center h-full flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <span className="icon-3d mx-auto h-13 w-13 rounded-2xl" style={{ ["--c" as string]: t.color }}>
                      <Icon name={t.icon as IconName} size={24} />
                    </span>
                    <h4 className="mt-4 text-base sm:text-[17px] font-bold text-brand-ink">{t.title}</h4>
                    <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-[#5c7772]">{t.desc}</p>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ScrollMotion>
      </div>
    </section>
  );
}

/* ───────────────────────── 2. Traditional Education vs. Q-School & 10 Core Abilities ───────────────────────── */
function PedagogySection() {
  const comparison = [
    { dim: "Focus of Learning", trad: "What children learn (Syllabus)", qs: "How children learn, think and apply" },
    { dim: "Core Objective", trad: "Covering the Curriculum", qs: "Building Cognitive & Human Capability" },
    { dim: "Approach", trad: "Rote Knowledge & Memorisation", qs: "Real-World Practical Application" },
    { dim: "Cognitive Depth", trad: "Academic Learning alone", qs: "Learning + Systematic Thinking" },
    { dim: "Success Metric", trad: "Single Subject Exam Marks", qs: "Whole-Child Human Development" },
  ];

  const abilities = [
    { num: "01", name: "Focus & Attention", desc: "Sensory activation, concentration stamina, and deep observation." },
    { num: "02", name: "Memory & Learning", desc: "Memory palaces, visual association, and long-term retention." },
    { num: "03", name: "Thinking & Reasoning", desc: "Mental models, pattern discovery, and logical deduction." },
    { num: "04", name: "Creativity", desc: "Divergent thinking, imagination, and transforming ideas into action." },
    { num: "05", name: "Communication", desc: "Expressing ideas clearly, articulation, and empathetic listening." },
    { num: "06", name: "Problem Solving", desc: "Breaking down complex challenges and strategic execution." },
    { num: "07", name: "Habits", desc: "Daily physical, intellectual, and self-disciplinary atomic routines." },
    { num: "08", name: "Emotional Strength", desc: "Self-awareness, emotional regulation, and handling setbacks." },
    { num: "09", name: "Adaptability", desc: "Navigating uncertainty with curiosity, flexibility, and resilience." },
    { num: "10", name: "Leadership", desc: "Ethical decision-making, collaboration, and bringing out the best in teams." },
  ];

  return (
    <section id="pedagogy" className="scroll-mt-20 py-24 bg-[#F4F8F7]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>Why Q-School?</Kicker>
          <H2>School teaches the curriculum. Q-School develops the learner.</H2>
          <p className="mt-4 text-lg sm:text-xl italic font-semibold text-brand-teal">
            &ldquo;Who is systematically developing a child&apos;s ability to learn, think, adapt and create?&rdquo;
          </p>
        </ScrollMotion>

        {/* Matrix comparison with 21st.dev ScrollMotion */}
        <ScrollMotion variant="fade-up" delay={0.1} className="mt-14 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#E2ECE9] bg-[#054038] text-white p-5 sm:p-6 font-bold text-base sm:text-lg">
            <div>Dimension</div>
            <div className="text-white/80">Traditional Education</div>
            <div className="text-[#2BD6B4]">Q-School (Quantum Schooling)</div>
          </div>
          <div className="divide-y divide-[#EEF3F1]">
            {comparison.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-5 sm:p-6 gap-2 text-base sm:text-[16.5px] items-center hover:bg-[#F9FBFB] transition">
                <div className="font-bold text-brand-deep">{row.dim}</div>
                <div className="text-[#6b807b] flex items-center gap-2">
                  <span className="text-red-400 font-bold">✕</span> {row.trad}
                </div>
                <div className="font-extrabold text-[#0B6E5F] flex items-center gap-2">
                  <span className="text-[#0E937E] font-black">✓</span> {row.qs}
                </div>
              </div>
            ))}
          </div>
        </ScrollMotion>

        {/* 10 Core Abilities with 21st.dev Stagger & SpotlightCards */}
        <div className="mt-20">
          <ScrollMotion variant="fade-up" className="mx-auto max-w-2xl text-center">
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">THE FOUNDATION</span>
            <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-ink">10 Core Abilities Systematically Developed</h3>
            <p className="mt-3 text-base sm:text-lg text-[#4b635e] leading-relaxed">
              Q-School works alongside formal schooling to nurture the foundational capacities behind every academic and life success.
            </p>
          </ScrollMotion>

          <StaggerContainer className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" staggerDelay={0.06}>
            {abilities.map((a) => (
              <StaggerItem key={a.num}>
                <SpotlightCard
                  spotlightColor="rgba(43, 214, 180, 0.18)"
                  className="p-6 h-full flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-brand-teal">{a.num}</span>
                      <span className="h-2 w-2 rounded-full bg-[#2BD6B4]" />
                    </div>
                    <h4 className="mt-3.5 text-base sm:text-[17px] font-bold text-brand-ink">{a.name}</h4>
                    <p className="mt-2 text-xs sm:text-[13.5px] leading-relaxed text-[#5c7772]">{a.desc}</p>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Hands-On Workshop Feature Banner */}
          <ScrollMotion variant="fade-up" delay={0.15} className="mt-16 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-xl grid grid-cols-1 md:grid-cols-12 items-stretch">
            <div className="relative md:col-span-5 min-h-[260px] md:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/workshop.png"
                alt="Interactive Q-School Workshop"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-xs sm:text-[13px] font-bold text-brand-deep backdrop-blur-xs shadow-md">
                Active Learning Cohorts
              </span>
            </div>
            <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">IMMERSIVE PEDAGOGY</span>
                <h4 className="mt-3.5 text-2xl sm:text-3xl font-extrabold text-brand-ink">Where Learning Truly Comes Alive</h4>
                <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">
                  Moving children away from passive screens and rote textbooks into collaborative, high-energy cognitive workshops. Children debate, sketch mental models, solve spatial puzzles, and build real leadership habits together.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2.5 text-xs sm:text-sm font-bold text-brand-deep">
                <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Hands-On Drills</span>
                <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Max 15 per Cohort</span>
                <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ 9 Centres in India</span>
              </div>
            </div>
          </ScrollMotion>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3. AI vs. HI (Human Intelligence) ───────────────────────── */
function AIvsHI() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#054038] via-[#032D27] to-[#054038] py-24 text-white">
      {/* 3D Quantum Nexus Synapse Background */}
      <QuantumNexus className="pointer-events-none absolute inset-0 opacity-40" particleCount={110} speed={0.4} colorScheme="teal" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-teal/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-[#2BD6B4]/20 blur-3xl" />

      <div className="container-qs relative z-10">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">AI VS. HI</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem] text-white">
            AI Can Process. <span className="text-[#2BD6B4]">Human Intelligence Can Transform.</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-white/85 leading-relaxed">
            Artificial Intelligence is reshaping how we learn, work, and live. It can process information, recognize patterns, and automate tasks. But human progress also depends on <strong className="text-white">empathy, imagination, independent judgement, and ethical decision-making.</strong>
          </p>
        </ScrollMotion>

        {/* 3D Interactive Dual-Hemisphere Brain (AI Computation vs HI Consciousness) */}
        <div className="mt-10 mb-8">
          <QuantumBrainMesh />
        </div>

        {/* Side by Side with 21st.dev ScrollMotion & BorderBeam */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* AI */}
          <ScrollMotion variant="fade-left" className="h-full">
            <div className="h-full rounded-3xl border border-white/15 bg-white/10 p-7 sm:p-9 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[#2BD6B4]">
                    <Icon name="ai" size={26} />
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Artificial Intelligence (AI)</h3>
                    <p className="text-xs sm:text-sm text-white/60">Automated Computation &amp; Pattern Output</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-4 text-base sm:text-[16.5px] text-white/80">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                    <span><strong>Processes information at speed</strong> across vast datasets.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                    <span><strong>Recognises patterns</strong> and generates statistical outputs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                    <span><strong>Automates repetitive tasks</strong> and structured workflows.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-white/40 shrink-0" />
                    <span><strong>Supports data-driven decisions</strong> within programmed parameters.</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollMotion>

          {/* HI with 21st.dev Border Beam */}
          <ScrollMotion variant="fade-right" delay={0.12} className="h-full">
            <div className="relative h-full rounded-3xl border-2 border-[#2BD6B4] bg-gradient-to-b from-[#0a5a4e] to-[#04332c] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden group">
              {/* 21st.dev Border Beam */}
              <BorderBeam size={260} duration={10} colorFrom="#2BD6B4" colorTo="#2BB39C" borderWidth={2.5} />

              <div className="relative z-10">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2BD6B4] text-brand-deep shadow-md">
                    <Icon name="brain" size={26} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-white">Human Intelligence (HI)</h3>
                      <span className="rounded-full bg-[#2BD6B4]/25 px-2.5 py-0.5 text-[11px] font-black text-[#2BD6B4]">Q-SCHOOL FOCUS</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2BD6B4]">Original Consciousness, Emotion &amp; Ethics</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-4 text-base sm:text-[16.5px] text-white/95">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                    <span><strong>Thinks critically and independently</strong> beyond algorithmic bias.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                    <span><strong>Creates, imagines and innovates</strong> novel artistic &amp; scientific breakthroughs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                    <span><strong>Understands emotions</strong>, empathy, and human shared values.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#2BD6B4] shrink-0" />
                    <span><strong>Applies judgement, empathy and ethical responsibility</strong> to lead humanity.</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollMotion>
        </div>

        {/* Core quote bar */}
        <ScrollMotion variant="fade-up" delay={0.2} className="mt-14 rounded-2xl bg-white/10 border border-white/20 p-6 text-center max-w-4xl mx-auto backdrop-blur-sm">
          <p className="font-hand text-2xl sm:text-3xl text-[#2BD6B4]">&ldquo;AI may change the world. Human intelligence will shape its future.&rdquo;</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-semibold text-white/85">
            <span>Focus</span> • <span>Memory</span> • <span>Comprehension</span> • <span>Creativity</span> • <span>Emotional Awareness</span> • <span>Independent Thinking</span>
          </div>
        </ScrollMotion>
      </div>
    </section>
  );
}
/* ───────────────────────── 4. The Q 5D™ XYZTP Framework ───────────────────────── */
function Framework5D() {
  const dimensions = [
    { code: "X", name: "CONSCIOUS", subtitle: "Focus & Understand", desc: "Attention, observation and conscious engagement with learning.", color: "#0E937E" },
    { code: "Y", name: "DEEP LEARNING", subtitle: "Practise & Internalise", desc: "Repetition, reinforcement and deep cognitive skill development.", color: "#5B6CF0" },
    { code: "Z", name: "FLOW & APPLICATION", subtitle: "Apply & Express", desc: "Integrating learning into confident, natural real-world application.", color: "#F29A2E" },
    { code: "T", name: "TIME", subtitle: "Efficiency & Fluency", desc: "Developing greater speed, intellectual fluency, organisation and efficiency.", color: "#E2557A" },
    { code: "P", name: "PEAK POSSIBILITY", subtitle: "Potential in Action", desc: "Expressing developed abilities through creativity, ethics, and leadership.", color: "#2BD6B4" },
  ];

  const intelligence = [
    { title: "Cognitive Intelligence", desc: "Memory, focus, concentration, and rapid processing." },
    { title: "Sensory & Perceptual", desc: "Observation, sensory awareness, and intuitive thinking." },
    { title: "Creative Intelligence", desc: "Imagination, originality, and out-of-the-box problem-solving." },
    { title: "Emotional Intelligence", desc: "Self-awareness, emotional regulation, and empathy." },
    { title: "Conscious Awareness", desc: "Mindfulness, reflection, and inner cognitive clarity." },
  ];

  return (
    <section id="framework" className="scroll-mt-20 py-24 bg-white border-b border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The Q 5D™ XYZTP Framework</Kicker>
          <H2>One Framework. Five Dimensions. A Progressive Learning Journey.</H2>
          <p className="mt-4 text-lg sm:text-xl text-[#4b635e] leading-relaxed">
            Our proprietary 5D architecture structures each child’s transformation from initial understanding to peak human performance.
          </p>
        </ScrollMotion>

        {/* 5 Dimensions Grid with 21st.dev Stagger & SpotlightCards */}
        <StaggerContainer className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5" staggerDelay={0.08}>
          {dimensions.map((d, i) => (
            <StaggerItem key={d.code} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.2)"
                className="p-7 h-full flex flex-col justify-between hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl font-black text-white text-lg shadow-md" style={{ background: d.color }}>
                      {d.code}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-[#0E937E]">Dim 0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl sm:text-2xl font-extrabold text-brand-ink">{d.name}</h3>
                  <p className="text-xs sm:text-sm font-bold text-brand-teal mt-1">{d.subtitle}</p>
                  <p className="mt-3.5 text-sm sm:text-[14.5px] leading-relaxed text-[#4b635e]">{d.desc}</p>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Progressive Flow Banner */}
        <ScrollMotion variant="fade-up" delay={0.15} className="mt-14 rounded-3xl bg-gradient-to-r from-[#054038] via-[#04332D] to-[#054038] p-8 text-white text-center shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#2BD6B4] font-extrabold">Progressive Learning Flow</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 font-bold text-sm sm:text-base">
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">UNDERSTAND</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">PRACTISE</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">INTERNALISE</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">APPLY</span>
            <span className="text-[#2BD6B4] text-lg">➔</span>
            <span className="rounded-xl bg-[#2BD6B4] text-brand-deep px-5 py-2 font-black shadow-md">EXPRESS</span>
          </div>
        </ScrollMotion>

        {/* 5 Interconnected Intelligence Dimensions */}
        <div className="mt-18">
          <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6b807b]">Five Interconnected Intelligence Dimensions</p>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {intelligence.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-[#CFE3DD] bg-[#F7FAF9] p-5 text-center hover:bg-white hover:shadow-md transition">
                <p className="text-base sm:text-[17px] font-bold text-brand-deep">{item.title}</p>
                <p className="mt-2 text-xs sm:text-sm text-[#4b635e] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 5. 8 Q-School Programs ───────────────────────── */
function Programs({ c }: { c: HomeContent["programs"] }) {
  const programs = PROGRAMS;
  return (
    <section id="programs" className="scroll-mt-20 bg-white py-24 border-t border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
            <p className="mt-3 text-base sm:text-lg text-[#4b635e]">
              Structured neuro-cognitive development, speed learning, and leadership across 48 classes per annum.
            </p>
          </div>
          <Link href="#demo" className="btn-3d btn-3d-mint inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md">
            Book a Free Demo for Any Program →
          </Link>
        </ScrollMotion>

        {/* 8 Programs with 21st.dev Stagger & SpotlightCards */}
        <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" staggerDelay={0.06}>
          {programs.map((p) => (
            <StaggerItem key={p.slug} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.18)"
                className="group flex h-full flex-col justify-between overflow-hidden p-6 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Program Image Banner */}
                  <div className="relative -mx-6 -mt-6 mb-4 h-44 overflow-hidden bg-[#054038]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || `/images/programs/${p.slug}.jpg`}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="chip !px-2.5 !py-0.5 !text-[11px] !bg-white/95 !text-[#054038] font-black shadow-xs backdrop-blur-xs">
                        {p.badge}
                      </span>
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
                        48 Classes
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-2 text-xl font-extrabold text-brand-ink group-hover:text-brand-teal transition">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#0E937E] mt-1">{p.format}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#4b635e]">{p.overview}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-md bg-[#F4F8F7] border border-[#E2ECE9] px-2.5 py-1 text-xs font-semibold text-[#41564f]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 border-t border-[#EEF3F1] pt-4 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-brand-ink">Ages 6–14 Y</span>
                  <Link
                    href="#demo"
                    className="btn-3d btn-3d-teal rounded-lg px-3.5 py-2 text-xs sm:text-[13px] font-bold"
                  >
                    Enrol / Demo →
                  </Link>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ───────────────────────── 6. Who is a Neo Sapiens? & The 3 Pillars ───────────────────────── */
function NeoSapiensSection() {
  const traits = [
    { title: "Creative Thinker", desc: "Imagines, innovates and creates original solutions.", icon: "bulb" },
    { title: "Critical Problem Solver", desc: "Analyses challenges and thinks strategically.", icon: "tools" },
    { title: "Emotionally Resilient", desc: "Adapts, stays balanced, and grows through challenges.", icon: "heart" },
    { title: "Confident Communicator", desc: "Expresses ideas clearly and listens with empathy.", icon: "speech" },
    { title: "Ethical Decision-Maker", desc: "Makes responsible choices guided by timeless values.", icon: "shield" },
    { title: "Collaborative Leader", desc: "Works with others and brings out the best in teams.", icon: "users" },
    { title: "Globally Aware", desc: "Understands diverse perspectives and the world around them.", icon: "globe" },
    { title: "Future-Ready", desc: "Remains curious, adaptable, and prepared for what lies ahead.", icon: "sparkle" },
  ];

  const pillars = [
    { num: "01", title: "National-Level Academic Excellence", desc: "Build stronger learning capabilities, sharper thinking, and academic confidence that excels in examinations and beyond." },
    { num: "02", title: "Become a Global Leader", desc: "Develop the mindset, emotional resilience, ethical foundation, and communication skills to lead on a global stage." },
    { num: "03", title: "A Sharper Brain in the Age of AI", desc: "Strengthen human intelligence, original creativity, and critical reasoning to possess an unbeatable lifelong edge." },
  ];

  return (
    <section id="neo-sapiens" className="scroll-mt-20 py-24 bg-white border-t border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The Future Learner</Kicker>
          <H2>Who is a Neo Sapiens?</H2>
          <p className="mt-4 text-lg sm:text-xl leading-relaxed text-[#3b544e]">
            A <strong className="text-brand-ink font-bold">Neo Sapiens</strong> is a future-ready learner equipped with the skills, mindset, and values to think, adapt, create, and lead in an ever-changing world.
          </p>
          <p className="mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#0E937E]">THINK · LEARN · LEAD · CREATE</p>
        </ScrollMotion>

        {/* 8 Persona Traits with 21st.dev Stagger & SpotlightCards */}
        <StaggerContainer className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.06}>
          {traits.map((t, idx) => (
            <StaggerItem key={idx}>
              <SpotlightCard
                spotlightColor="rgba(14, 147, 126, 0.16)"
                className="flex items-start gap-4 p-5 h-full hover:shadow-md transition"
              >
                <span className="icon-3d h-11 w-11 shrink-0 rounded-xl" style={{ ["--c" as string]: "#0E937E" }}>
                  <Icon name={t.icon as IconName} size={22} />
                </span>
                <div>
                  <h4 className="text-base sm:text-[17px] font-bold text-brand-ink">{t.title}</h4>
                  <p className="mt-1.5 text-xs sm:text-[13.5px] text-[#4b635e] leading-relaxed">{t.desc}</p>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* The 3 Pillars with 21st.dev Border Beam */}
        <ScrollMotion variant="fade-up" delay={0.15} className="mt-18 relative rounded-3xl bg-gradient-to-br from-[#054038] via-[#04332D] to-[#0A5A4E] p-8 sm:p-12 text-white shadow-2xl overflow-hidden group">
          <BorderBeam size={300} duration={12} colorFrom="#2BD6B4" colorTo="#0E937E" borderWidth={2} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">THE CORE PILLARS</span>
              <h3 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">The 3 Pillars of Neo Sapiens</h3>
              <p className="mt-3 text-base sm:text-lg text-white/85 leading-relaxed">
                Nurturing a complete human being with an Aware Mind, Agile Brain, and Authentic Spirit.
              </p>

              <div className="mt-8 space-y-4">
                {pillars.map((p) => (
                  <div key={p.num} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm hover:bg-white/15 transition">
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl font-black text-[#2BD6B4]">{p.num}</span>
                      <h4 className="text-lg font-bold text-white">{p.title}</h4>
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed pl-9">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative overflow-hidden rounded-3xl border-2 border-[#2BD6B4]/50 shadow-2xl bg-[#042d27] max-w-[380px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/bmit-hero.png"
                  alt="Engineering the Neo Sapiens"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 inset-x-4 text-center">
                  <span className="chip !bg-white/95 !text-brand-deep !font-black !text-xs shadow-md">
                    Engineering Future-Ready Human Beings
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 border-t border-white/15 pt-6 text-center font-bold tracking-wide text-xs sm:text-sm text-[#2BD6B4] uppercase">
            THINK SMARTER · LEARN DEEPER · LEAD BETTER — ENGINEERING THE NEO SAPIENS
          </p>
        </ScrollMotion>
      </div>
    </section>
  );
}

/* ───────────────────────── 7. The 48-Class Journey, Pathway & Habits ───────────────────────── */
function FortyEightClassJourney() {
  const stages = [
    { num: "01", name: "ENGAGE", desc: "Capture attention and ignite natural interest." },
    { num: "02", name: "EXPLORE", desc: "Introduce a concept, principle, or real challenge." },
    { num: "03", name: "PRACTISE", desc: "Strengthen neural understanding through repetition." },
    { num: "04", name: "APPLY", desc: "Use learning in meaningful tasks, codes, and projects." },
    { num: "05", name: "REFLECT", desc: "Synthesize and internalize what was learned." },
    { num: "06", name: "REINFORCE", desc: "Carry learning and positive habits into everyday life." },
  ];

  const pathways = [
    { year: "Year 01", stage: "FOUNDATION", modules: ["Q-Vision", "Q-Learning", "Q-Mastery"], desc: "Sensory activation, memory palaces, and atomic daily habit systems." },
    { year: "Year 02", stage: "PROGRESSION", modules: ["Q-Creation", "Q-Learning", "Q-Mastery"], desc: "Expanded imagination, creative synthesis, and communication agility." },
    { year: "Year 03", stage: "ADVANCED DEVELOPMENT", modules: ["Q-Way", "Q-Learning", "Q-Mastery"], desc: "Higher-order cognition, holistic thinking, and global leadership." },
  ];

  const habits = [
    { title: "Physically Healthy", icon: "heart", desc: "Energy, posture, and active sensory well-being." },
    { title: "Emotionally Strong", icon: "shield", desc: "Resilience, self-awareness, and emotional balance." },
    { title: "Intellectually Sharp", icon: "brain", desc: "Critical thinking, focus stamina, and memory agility." },
    { title: "Financially Responsible", icon: "rupee", desc: "Understanding value, resourcefulness, and smart choices." },
    { title: "Self-Disciplined", icon: "award", desc: "Consistent execution and pride in daily habits." },
  ];

  return (
    <section className="scroll-mt-20 py-24 bg-[#F4F8F7]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-3xl text-center">
          <Kicker>The 48-Class Journey</Kicker>
          <H2>48 Classes. One Continuous Developmental Journey.</H2>
          <p className="mt-4 text-base sm:text-lg text-[#4b635e]">
            48 classes per annum structured into a 6-stage continuous cycle. Learning does not end when the class ends.
          </p>
        </ScrollMotion>

        {/* 6 Stages Grid with 21st.dev Stagger */}
        <StaggerContainer className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" staggerDelay={0.06}>
          {stages.map((st) => (
            <StaggerItem key={st.num}>
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.18)"
                className="p-5 text-center h-full flex flex-col justify-between hover:shadow-md transition"
              >
                <span className="text-sm font-black text-brand-teal">{st.num}</span>
                <h4 className="mt-2 text-base font-extrabold text-brand-ink">{st.name}</h4>
                <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[#5c7772]">{st.desc}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Continuous Beyond Classroom Banner */}
        <ScrollMotion variant="fade-up" delay={0.12} className="mt-10 rounded-2xl border border-[#2BD6B4]/50 bg-[#E2ECE9] p-6 text-center shadow-xs">
          <p className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-[#054038]">Learning Continues Beyond The Classroom</p>
          <p className="mt-2 text-sm sm:text-base font-extrabold text-brand-ink">
            CENTRE LEARNING <span className="text-brand-teal font-black">➔</span> GUIDED PRACTICE <span className="text-brand-teal font-black">➔</span> HOME REINFORCEMENT
          </p>
        </ScrollMotion>

        {/* 3-Year Pathway & Quantum Habits Grid */}
        <div className="mt-18 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Pathway with 21st.dev SpotlightCard */}
          <ScrollMotion variant="fade-left" className="h-full">
            <SpotlightCard className="p-8 h-full flex flex-col justify-between shadow-lg">
              <div>
                <span className="chip !px-3.5 !py-1 !text-xs !bg-[#054038] !text-white font-bold">STRUCTURED PROGRESSION</span>
                <h3 className="mt-4 text-2xl font-extrabold text-brand-ink">The 3-Year Q-School Pathway</h3>
                <div className="mt-6 space-y-4">
                  {pathways.map((pw, i) => (
                    <div key={i} className="rounded-2xl border border-[#CFE3DD] bg-[#F7FAF9] p-5 hover:bg-white transition">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-brand-deep">{pw.year} — {pw.stage}</span>
                        <span className="text-xs font-bold text-[#0E937E] bg-brand-teal100 px-3 py-1 rounded-full">48 Classes</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pw.modules.map((m) => (
                          <span key={m} className="rounded-lg bg-white px-3 py-1 text-xs sm:text-[13px] font-bold text-brand-ink border border-[#CFE3DD] shadow-xs">
                            {m}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs sm:text-sm text-[#4b635e] leading-relaxed">{pw.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </ScrollMotion>

          {/* Quantum Habits with 21st.dev SpotlightCard */}
          <ScrollMotion variant="fade-right" delay={0.12} className="h-full">
            <SpotlightCard className="p-8 h-full flex flex-col justify-between shadow-lg">
              <div>
                <span className="chip !px-3.5 !py-1 !text-xs !bg-[#0E937E] !text-white font-bold">DAILY ROUTINES</span>
                <h3 className="mt-4 text-2xl font-extrabold text-brand-ink">Quantum Habits</h3>
                <p className="mt-1.5 text-xs sm:text-sm font-bold text-[#0E937E]">Small Habits. Big Possibilities. Habit → Practice → Growth.</p>
                <div className="mt-6 space-y-3.5">
                  {habits.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#EEF3F1] bg-[#FDFCF9] p-4 hover:bg-white hover:border-[#2BD6B4]/50 transition">
                      <span className="icon-3d h-10 w-10 shrink-0 rounded-xl" style={{ ["--c" as string]: "#0E937E" }}>
                        <Icon name={h.icon as IconName} size={20} />
                      </span>
                      <div>
                        <p className="text-base font-bold text-brand-ink">{h.title}</p>
                        <p className="text-xs sm:text-[13px] text-[#5c7772]">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-[#EEF3F1] pt-5 text-center">
                <Link href="#demo" className="btn-3d btn-3d-teal inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold shadow-md">
                  Begin Your Child&apos;s Q-Journey →
                </Link>
              </div>
            </SpotlightCard>
          </ScrollMotion>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 8. Q-Verse: Transformative Ecosystem ───────────────────────── */
function QVerseSection() {
  const ecosystem = [
    { name: "Q MEMORY", tagline: "Remember More. Learn Faster.", icon: "bulb", color: "#0E937E" },
    { name: "Q VISION", tagline: "Expand Perspectives. See a Bigger Tomorrow.", icon: "planet", color: "#5B6CF0" },
    { name: "Q LEARNING", tagline: "Deeper Understanding. Lifelong Learning.", icon: "book", color: "#F29A2E" },
    { name: "Q MASTERY", tagline: "Practice. Progress. Achieve Excellence.", icon: "award", color: "#E2557A" },
    { name: "Q MATH", tagline: "Stronger Logic. Real-Life Application.", icon: "robot", color: "#3C7DBF" },
    { name: "Q PARENTING", tagline: "Empowered Parents. Brighter Generations.", icon: "users", color: "#6B2A6E" },
    { name: "Q SCIENCE", tagline: "Curiosity Today. Innovation Tomorrow.", icon: "leaf", color: "#4CAF6E" },
    { name: "Q CREATION", tagline: "Imagine. Create. Express. Turn Ideas into Reality.", icon: "palette", color: "#E0782F" },
    { name: "Q WAY", tagline: "Right Values. Right Choices. A Meaningful Life.", icon: "shield", color: "#054038" },
    { name: "Q HABIT", tagline: "Disciplined Today. A Brighter Tomorrow.", icon: "sparkle", color: "#2BD6B4" },
  ];

  return (
    <section className="py-20 bg-white border-t border-[#E2ECE9]">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>Q-Verse</Kicker>
          <H2>A Transformative Ecosystem</H2>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-teal">
            EXPLORE · LEARN · GROW · CREATE · LEAD
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ecosystem.map((item, idx) => (
            <div key={idx} className="emboss emboss-hover flex flex-col justify-between rounded-2xl bg-[#FDFCF9] p-5 text-center border border-[#CFE3DD]">
              <div>
                <span className="icon-3d mx-auto h-11 w-11 rounded-xl" style={{ ["--c" as string]: item.color }}>
                  <Icon name={item.icon as IconName} size={20} />
                </span>
                <h4 className="mt-3 text-sm font-extrabold text-brand-ink">{item.name}</h4>
                <p className="mt-1 text-xs text-[#5c7772] leading-tight">{item.tagline}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Brochure Page 15 Closing Statement */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#054038] via-[#04332D] to-[#054038] p-8 text-center text-white shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#2BD6B4] font-extrabold">HOLISTIC LEARNING FOR A BRIGHTER TOMORROW</p>
          <p className="mt-2 text-xl sm:text-2xl font-black tracking-wide">
            LEARN BETTER · THINK BIGGER · BECOME FUTURE-READY
          </p>
          <p className="mt-2 text-xs sm:text-sm text-white/80">
            For children aged 6–14 years · 48 Classes Per Annum · 9 Experiential Learning Centres
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="#centres" className="btn-3d btn-3d-mint text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl">
              Locate Your Nearest Centre →
            </Link>
            <Link href="#demo" className="btn-3d btn-3d-glass text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl">
              Book a Free Demo Class
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Formats({ c }: { c: HomeContent["formats"] }) {
  return (
    <section className="container-qs py-20">
      <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {c.items.map((f, i) => (
          <Reveal key={i} delay={i * 90} variant="zoom">
            <Tilt className="h-full rounded-2xl">
              <Link href={f.href} className="emboss emboss-hover press group flex h-full flex-col rounded-2xl p-6 [transform-style:preserve-3d]">
                <span className="icon-3d h-14 w-14 rounded-2xl [transform:translateZ(36px)]" style={{ ["--c" as string]: f.color }}>
                  <Icon name={f.icon as IconName} size={26} />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold text-brand-ink">{f.title}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[#5c7772]">{f.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-teal">
                  Learn more <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function How({ c }: { c: HomeContent["how"] }) {
  const cols = c.steps.length === 4 ? "md:grid-cols-4" : c.steps.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <section className="container-qs py-20">
      <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
      </Reveal>
      <ol className={`relative mt-14 grid grid-cols-1 gap-10 md:gap-6 ${cols}`}>
        {c.steps.length > 1 && (
          <Reveal variant="line" className="absolute left-[16%] right-[16%] top-9 hidden border-t-2 border-dashed border-brand-teal500/40 !duration-[1400ms] md:block" />
        )}
        {c.steps.map((s, i) => (
          <Reveal key={i} delay={200 + i * 220} variant="zoom" className="relative text-center">
            <li className="list-none">
              <span className="group relative mx-auto block h-[72px] w-[72px]">
                <span className="icon-3d h-[72px] w-[72px] rounded-[22px]" style={{ ["--c" as string]: "#0B6E5F" }}>
                  <Icon name={s.icon as IconName} size={30} />
                </span>
                <span className="icon-3d absolute -right-2 -top-2 h-8 w-8 rounded-full text-[13px] font-bold ring-4 ring-[#f4faf8]" style={{ ["--c" as string]: "#2BD6B4" }}>
                  <span className="relative text-brand-deep">{i + 1}</span>
                </span>
              </span>
              <h3 className="mt-6 text-[18px] font-semibold text-brand-ink">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-[#5c7772]">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
      {c.cta.label && (
        <div className="mt-12 text-center">
          <Link href={c.cta.href} className="btn-3d btn-3d-teal inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold">
            {c.cta.label}
          </Link>
        </div>
      )}
    </section>
  );
}

function Live({ c }: { c: HomeContent["live"] }) {
  const webinars = WEBINAR_LIST.filter((w) => !w.recorded).slice(0, 3);
  const workshops = WORKSHOPS.filter((w) => !w.past).slice(0, 3);
  return (
    <section id="live" className="scroll-mt-20 bg-brand-deep py-20 text-white">
      <div className="container-qs">
        <Reveal variant="blur" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Kicker dark>{c.kicker}</Kicker>
            <H2 dark>{c.title}</H2>
          </div>
          {c.linkLabel && (
            <Link href="/live" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#2BD6B4] hover:underline">
              {c.linkLabel} →
            </Link>
          )}
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal variant="left">
            <div className="emboss-dark h-full rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <span className="icon-3d h-8 w-8 rounded-lg" style={{ ["--c" as string]: "#5B6CF0" }}>
                  <Icon name="webinar" size={16} />
                </span>{" "}
                Webinars
                <span className="ml-auto rounded-full bg-[#2BD6B4]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#2BD6B4]">FREE</span>
              </div>
              <ul className="mt-5 space-y-3">
                {webinars.map((w) => (
                  <li key={w.id} className="emboss-dark emboss-dark-hover flex items-center gap-3 rounded-2xl p-3 sm:gap-4">
                    <Art art={w.art} className="h-12 w-12 shrink-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_6px_14px_-6px_rgba(0,0,0,.6)] sm:h-16 sm:w-16" iconSize={22} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14.5px] font-semibold leading-snug sm:truncate">{w.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-white/65">
                        {w.by} · {w.date}
                      </p>
                      <p className="mt-0.5 text-[12px] text-white/50">{w.registered} registered</p>
                    </div>
                    <Link href="#demo" className="btn-3d btn-3d-white shrink-0 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold">
                      Register
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120} variant="right">
            <div className="emboss-dark h-full rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <span className="icon-3d h-8 w-8 rounded-lg" style={{ ["--c" as string]: "#F29A2E" }}>
                  <Icon name="tools" size={16} />
                </span>{" "}
                Workshops
              </div>
              <ul className="mt-5 space-y-3">
                {workshops.map((w) => (
                  <li key={w.id} className="emboss-dark emboss-dark-hover flex items-center gap-3 rounded-2xl p-3 sm:gap-4">
                    <Art art={w.art} className="h-12 w-12 shrink-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_6px_14px_-6px_rgba(0,0,0,.6)] sm:h-16 sm:w-16" iconSize={22} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14.5px] font-semibold leading-snug sm:truncate">{w.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-white/65">{w.date}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-white/50">
                        <Icon name={w.mode === "Online" ? "globe" : "pin"} size={12} />
                        {w.mode === "Online" ? "Online" : w.city} · {w.days}
                        {w.seatsLeft ? ` · ${w.seatsLeft} seats left` : ""}
                      </p>
                    </div>
                    <Link href="#demo" className="btn-3d btn-3d-glass shrink-0 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold">
                      Reserve
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Why({ c }: { c: HomeContent["why"] }) {
  return (
    <section className="container-qs grid grid-cols-1 items-center gap-14 py-20 lg:grid-cols-2">
      <Reveal variant="left">
        <Kicker>{c.kicker}</Kicker>
        <H2>{c.title}</H2>
        {c.body && <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#5c7772]">{c.body}</p>}
        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {c.items.map((w, i) => (
            <div key={i} className="emboss emboss-hover group flex gap-3.5 rounded-2xl p-4">
              <span className="icon-3d h-11 w-11 shrink-0 rounded-xl" style={{ ["--c" as string]: w.color }}>
                <Icon name={w.icon as IconName} size={21} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-brand-ink">{w.title}</p>
                <p className="mt-0.5 text-[13px] text-[#5c7772]">{w.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={150} variant="right">
        <Tilt max={4} className="rounded-[28px]">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-teal to-brand-deep p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),inset_0_-3px_0_rgba(0,0,0,.2),0_30px_60px_-24px_rgba(5,64,56,.7)] sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden />
            <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
              <div>
                {c.appBadge && <span className="rounded-full bg-white/15 px-3 py-1 text-[11.5px] font-semibold">{c.appBadge}</span>}
                <h3 className="mt-4 text-2xl font-bold leading-snug">{c.appTitle}</h3>
                <p className="mt-2 text-[14px] text-white/80">{c.appBody}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {["Google Play", "App Store"].map((s) => (
                    <span key={s} className="btn-3d btn-3d-glass inline-flex items-center gap-2 rounded-xl !bg-black/30 px-3.5 py-2 text-[12.5px] font-semibold">
                      <Icon name="download" size={15} /> {s}
                      <span className="rounded bg-white/20 px-1.5 text-[10px] font-medium">Soon</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="mx-auto w-[150px] rotate-3 rounded-[26px] border-[5px] border-[#021f1b] bg-[#F3F8F6] p-2 shadow-2xl">
                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-[#021f1b]/80" />
                <div className="rounded-xl bg-brand-deep p-2.5 text-white">
                  <p className="text-[8px] text-white/70">Good morning,</p>
                  <p className="text-[11px] font-semibold">Ananya</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/20">
                    <div className="h-full w-3/5 rounded-full bg-[#2BD6B4]" />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(["live", "book", "webinar", "award"] as IconName[]).map((n) => (
                    <div key={n} className="emboss flex aspect-square items-center justify-center rounded-lg text-brand-teal">
                      <Icon name={n} size={18} />
                    </div>
                  ))}
                </div>
                <Art art="laptop" className="mt-2 h-14 rounded-lg" iconSize={20} />
              </div>
            </div>
          </div>
        </Tilt>
      </Reveal>
    </section>
  );
}

function Testimonials({ c }: { c: HomeContent["testimonials"] }) {
  if (!c.items.length) return null;
  return (
    <section className="bg-white py-24 border-y border-[#E2ECE9]">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.1}>
          {c.items.map((t, i) => (
            <StaggerItem key={i} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(43, 214, 180, 0.2)"
                className="flex h-full flex-col justify-between p-8 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <span className="font-hand text-6xl leading-none text-brand-teal500" aria-hidden>
                    &ldquo;
                  </span>
                  {t.rating > 0 && (
                    <div className="-mt-1 mb-3 flex gap-1 text-[#FFC845]" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: Math.round(t.rating) }, (_, k) => (
                        <Icon key={k} name="star" size={16} fill="currentColor" strokeWidth={0} className="drop-shadow-[0_1px_0_rgba(183,121,31,.5)]" />
                      ))}
                    </div>
                  )}
                  <blockquote className="text-base sm:text-[17px] leading-relaxed text-[#2b3d38] font-medium">{t.quote}</blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3.5 border-t border-[#E2ECE9] pt-5">
                  <span className="icon-3d h-11 w-11 rounded-full">
                    <Icon name="users" size={20} />
                  </span>
                  <span className="text-sm">
                    <b className="block text-base font-bold text-brand-ink">{t.who}</b>
                    <span className="text-[#6b807b]">{t.city}</span>
                  </span>
                </figcaption>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function Centres({ c }: { c: HomeContent["centres"] }) {
  return (
    <section id="centres" className="container-qs scroll-mt-20 py-24">
      <ScrollMotion variant="blur-in" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          <p className="mt-3 text-base sm:text-lg text-[#4b635e]">
            CONFIDENT LEARNERS · COMPASSIONATE THINKERS · FUTURE-READY LEADERS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:+919944454840"
            className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold shadow-md"
          >
            <Icon name="phone" size={16} /> Central Desk: 99444 54840
          </a>
        </div>
      </ScrollMotion>

      {/* Centre Environment Showcase */}
      <ScrollMotion variant="fade-up" delay={0.1} className="mt-10 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="relative lg:col-span-5 min-h-[260px] lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/classroom-centre.jpg"
            alt="Q-School Learning Centre"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-1.5 text-xs sm:text-sm font-bold text-brand-deep backdrop-blur-xs shadow-md">
            Purpose-Built Quantum Pods
          </span>
        </div>
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <span className="chip !px-3.5 !py-1 !text-xs !bg-[#0E937E] !text-white font-bold">PHYSICAL HUBS</span>
            <h3 className="mt-3.5 text-2xl sm:text-3xl font-extrabold text-brand-ink">State-of-the-Art Quantum Learning Spaces</h3>
            <p className="mt-3 text-base sm:text-[17px] text-[#4b635e] leading-relaxed">
              Designed for sensory activation, ergonomic posture, and deep focus. Every centre features certified Quantum Mentors, low teacher-student ratios (maximum 15 learners per cohort), and dedicated exploration kits.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5 text-xs sm:text-sm font-bold text-brand-deep">
            <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Chennai (Valasaravakkam &amp; Adyar)</span>
            <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Bengaluru (Whitefield &amp; Kasturi Nagar)</span>
            <span className="rounded-xl bg-[#E2ECE9] px-3.5 py-2">✦ Hyderabad, Pune, Trichy, Coimbatore, Pondy</span>
          </div>
        </div>
      </ScrollMotion>

      {/* 9 Centres Grid with 21st.dev Stagger & SpotlightCards */}
      <StaggerContainer className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.08}>
        {CENTERS.map((ct, i) => (
          <StaggerItem key={ct.id} className="h-full">
            <SpotlightCard
              spotlightColor="rgba(43, 214, 180, 0.18)"
              className="p-7 h-full flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="chip !px-3 !py-1 !text-xs !bg-brand-teal100 !text-brand-deep font-extrabold">
                    {ct.city}
                  </span>
                  <span className="text-xs font-bold text-[#0E937E]">Branch 0{i + 1}</span>
                </div>

                <h3 className="mt-4 text-xl font-extrabold text-brand-ink">{ct.name}</h3>

                <p className="mt-3 text-sm text-[#4b635e] leading-relaxed">
                  <Icon name="pin" size={15} className="inline mr-1 text-[#0E937E]" />
                  {ct.address}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {ct.batches.map((b) => (
                    <span key={b} className="chip !px-3 !py-1 !text-xs">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-[#EEF3F1] pt-5 flex items-center justify-between gap-2">
                <a
                  href={`tel:${ct.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-teal hover:underline"
                >
                  <Icon name="phone" size={15} />
                  <span>{ct.phone}</span>
                </a>
                <Link
                  href="#demo"
                  className="btn-3d btn-3d-teal rounded-lg px-4 py-2 text-xs sm:text-sm font-bold"
                >
                  Book Visit →
                </Link>
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

function Pricing({ c }: { c: HomeContent["pricing"] }) {
  if (!c.plans.length) return null;
  const cols = c.plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : c.plans.length === 2 ? "md:grid-cols-2" : c.plans.length === 1 ? "" : "md:grid-cols-3";
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-24">
      <div className="container-qs">
        <ScrollMotion variant="blur-in" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </ScrollMotion>
        <StaggerContainer className={`mx-auto mt-14 grid max-w-5xl grid-cols-1 items-stretch gap-8 ${cols}`} staggerDelay={0.1}>
          {c.plans.map((p, i) => (
            <StaggerItem key={i} className="h-full">
              <div className={`relative h-full ${p.featured ? "md:-top-3" : ""}`}>
                <SpotlightCard
                  spotlightColor={p.featured ? "rgba(43, 214, 180, 0.3)" : "rgba(14, 147, 126, 0.15)"}
                  borderColor={p.featured ? "#2BD6B4" : undefined}
                  className={`relative flex h-full flex-col p-8 transition-all duration-300 hover:shadow-2xl ${
                    p.featured
                      ? "bg-gradient-to-b from-[#0a5a4e] to-brand-deep text-white shadow-xl border-2 border-[#2BD6B4]"
                      : "bg-[#FDFCF9] border border-[#CFE3DD]"
                  }`}
                >
                  {p.featured && (
                    <>
                      <BorderBeam size={220} duration={8} colorFrom="#2BD6B4" colorTo="#2BB39C" borderWidth={2.5} />
                      <span className="btn-3d btn-3d-mint absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-black shadow-md">RECOMMENDED</span>
                    </>
                  )}
                  <p className={`text-base font-extrabold uppercase tracking-wider ${p.featured ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{p.name}</p>
                  <p className="mt-4">
                    <span className={`text-4xl font-extrabold ${p.featured ? "text-white" : "text-brand-ink"}`}>{p.price}</span>
                    <span className={`ml-1.5 text-sm ${p.featured ? "text-white/70" : "text-[#6b807b]"}`}>{p.per}</span>
                  </p>
                  <p className={`mt-2.5 text-sm leading-relaxed ${p.featured ? "text-white/80" : "text-[#5c7772]"}`}>{p.blurb}</p>
                  <ul className="mt-7 flex-1 space-y-3.5">
                    {p.features.map((f, k) => (
                      <li key={k} className="flex gap-3 text-sm sm:text-[15px]">
                        <span className="icon-3d mt-0.5 h-5 w-5 shrink-0 rounded-full" style={{ ["--c" as string]: p.featured ? "#2BD6B4" : "#0E937E" }}>
                          <Icon name="check" size={12} strokeWidth={3.2} />
                        </span>
                        <span className={p.featured ? "text-white/95" : "text-[#3b544e]"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {p.cta.label && (
                    <Link
                      href={p.cta.href}
                      className={`btn-3d mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold shadow-md ${p.featured ? "btn-3d-mint" : "btn-3d-teal"}`}
                    >
                      {p.cta.label}
                    </Link>
                  )}
                </SpotlightCard>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        {c.note && <p className="mt-10 text-center text-xs sm:text-sm text-[#6b807b]">{c.note}</p>}
      </div>
    </section>
  );
}

function Faq({ c }: { c: HomeContent["faq"] }) {
  return (
    <section id="faq" className="container-qs scroll-mt-20 py-24 border-t border-[#E2ECE9]">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] items-start">
        <ScrollMotion variant="fade-left">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          {c.body && <p className="mt-4 text-base sm:text-lg text-[#4b635e] leading-relaxed">{c.body}</p>}
          {c.cta.label && (
            <Link href={c.cta.href} className="btn-3d btn-3d-outline mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-bold shadow-xs">
              <Icon name="message" size={18} /> {c.cta.label}
            </Link>
          )}
        </ScrollMotion>
        <ScrollMotion variant="fade-right" delay={0.12}>
          <div className="space-y-4">
            {c.items.map((f, i) => (
              <details key={i} className="emboss group rounded-2xl px-6 py-5 open:shadow-md transition duration-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base sm:text-lg font-bold text-brand-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="icon-3d no-lift h-8 w-8 shrink-0 rounded-full group-open:rotate-45">
                    <Icon name="plus" size={15} strokeWidth={2.4} />
                  </span>
                </summary>
                <p className="mt-4 whitespace-pre-line pr-8 text-sm sm:text-base leading-relaxed text-[#4b635e] border-t border-[#E2ECE9]/60 pt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </ScrollMotion>
      </div>
    </section>
  );
}

function Demo({ c }: { c: HomeContent["demo"] }) {
  return (
    <section id="demo" className="container-qs scroll-mt-20 py-12">
      <ScrollMotion variant="fade-up">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-16 shadow-2xl border border-white/10">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-teal/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#2BD6B4]/25 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-hand text-2xl sm:text-3xl text-[#2BD6B4]">{c.script}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">{c.title}</h2>
              {c.body && <p className="mt-4 max-w-lg text-base sm:text-lg text-white/85 leading-relaxed">{c.body}</p>}
              <ul className="mt-6 space-y-3">
                {c.points.map((x, i) => (
                  <li key={i} className="flex items-center gap-3 text-base sm:text-[16.5px] text-white/95">
                    <span className="icon-3d h-6 w-6 rounded-full shrink-0" style={{ ["--c" as string]: "#2BD6B4" }}>
                      <Icon name="check" size={14} strokeWidth={3} className="text-brand-deep" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>

              {/* Happy Family Trust Card */}
              <div className="mt-7 flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 p-4 max-w-lg backdrop-blur-xs">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#2BD6B4]/50 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/side-family.png"
                    alt="Parent & Child Learning Success"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Trusted by 25,000+ Happy Families</p>
                  <p className="text-xs sm:text-[13px] text-white/75 mt-0.5">Personalized assessment &amp; zero obligation to enrol.</p>
                </div>
              </div>

              {/* Direct counselor callout */}
              <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-5 max-w-lg">
                <p className="text-xs sm:text-sm uppercase tracking-wider text-[#2BD6B4] font-bold">Speak to Our Q-School Counsellor Today</p>
                <div className="mt-3 flex flex-wrap items-center gap-5 text-sm font-bold">
                  <a href="tel:+919944454840" className="hover:text-[#2BD6B4] flex items-center gap-1.5 transition">
                    <Icon name="phone" size={16} /> +91 99444 54840
                  </a>
                  <a href="mailto:info@theqschool.com" className="hover:text-[#2BD6B4] flex items-center gap-1.5 transition">
                    <Icon name="message" size={16} /> info@theqschool.com
                  </a>
                </div>
              </div>
            </div>

            <Tilt max={3} glare={false} className="rounded-3xl">
              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-7 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-9">
                <h3 className="text-xl sm:text-2xl font-bold text-brand-deep">{c.formTitle}</h3>
                {c.formNote && <p className="mb-6 mt-1.5 text-xs sm:text-sm text-[#5c7772]">{c.formNote}</p>}
                <LeadForm source="landing_demo" cta={c.button} />
              </div>
            </Tilt>
          </div>
        </div>
      </ScrollMotion>
    </section>
  );
}

const RENDER: Record<SectionKey, (c: HomeContent, ctx: { overlap: boolean }) => React.ReactNode> = {
  hero: (c) => <Hero c={c.hero} />,
  stats: (c, ctx) => <Stats c={c.stats} overlap={ctx.overlap} />,
  subjects: (c) => <Subjects c={c.subjects} />,
  formats: (c) => <Formats c={c.formats} />,
  programs: (c) => <Programs c={c.programs} />,
  how: (c) => <How c={c.how} />,
  live: (c) => <Live c={c.live} />,
  why: (c) => <Why c={c.why} />,
  testimonials: (c) => <Testimonials c={c.testimonials} />,
  centres: (c) => <Centres c={c.centres} />,
  pricing: (c) => <Pricing c={c.pricing} />,
  faq: (c) => <Faq c={c.faq} />,
  demo: (c) => <Demo c={c.demo} />,
};

export function HomeSections({ content }: { content: HomeContent }) {
  const visible = content.sections.filter((s) => s.visible);
  return (
    <>
      {visible.map((s, i) => (
        <div key={s.key} data-section={s.key} className="contents">
          {RENDER[s.key](content, { overlap: i > 0 && visible[i - 1].key === "hero" })}
          {/* Weave the brochure narrative seamlessly into the page flow */}
          {s.key === "subjects" && (
            <>
              <StoryAndGenAlpha />
              <PedagogySection />
              <AIvsHI />
              <Framework5D />
            </>
          )}
          {s.key === "programs" && (
            <>
              <NeoSapiensSection />
              <FortyEightClassJourney />
              <QVerseSection />
            </>
          )}
        </div>
      ))}
    </>
  );
}
