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
import type { HeroSlide, HomeContent, SectionKey } from "@/lib/site/home-content";

/* Renders the home page from editable content (Admin Console › Website & Official Brochure). */

const Kicker = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) =>
  children ? <p className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{children}</p> : null;

const H2 = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2 className={`mt-3 text-3xl font-bold sm:text-[2.1rem] ${dark ? "" : "text-brand-deep"}`}>{children}</h2>
);

function BrandSlide({ s }: { s: HeroSlide }) {
  return (
    <div className="container-qs relative grid grid-cols-1 items-center gap-12 pb-28 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
      <div>
        {(s.badge || s.kicker) && (
          <span className="hs-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-[12.5px] font-medium text-white/90">
            {s.badge && <span className="rounded-full bg-[#2BD6B4] px-2 py-0.5 text-[11px] font-bold text-brand-deep">{s.badge}</span>}
            {s.kicker}
          </span>
        )}
        <h1 className="hs-in mt-6 text-[2.35rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]" style={{ ["--d" as string]: "90ms" }}>
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
          <p className="hs-in mt-6 max-w-xl text-[16.5px] leading-relaxed text-white/75" style={{ ["--d" as string]: "180ms" }}>
            {s.body}
          </p>
        )}
        <div className="hs-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "270ms" }}>
          {s.primary.label && (
            <Link href={s.primary.href} className="btn-3d btn-3d-mint inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-deep text-[#2BD6B4] shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
                <Icon name="play" size={12} fill="currentColor" />
              </span>
              {s.primary.label}
            </Link>
          )}
          {s.secondary.label && (
            <Link href={s.secondary.href} className="btn-3d btn-3d-glass inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
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
    <section id="story" className="scroll-mt-20 py-20 bg-white border-y border-[#E2ECE9]">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-3xl text-center">
          <Kicker>The Q-School Story</Kicker>
          <H2>A Brighter Future Starts With the Learner</H2>
          <p className="mt-4 text-[16px] leading-relaxed text-[#41564f]">
            Every generation of parents has asked the same question in a different way: <strong className="text-brand-ink">what will my child need to thrive?</strong> For children growing up alongside smartphones, artificial intelligence, and constant change, the answer is evolving faster than any curriculum can keep pace.
          </p>
        </Reveal>

        {/* Narrative & Founder Quote Split */}
        <div className="mt-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <Reveal variant="left">
            <div className="emboss flex h-full flex-col justify-between rounded-3xl p-7 sm:p-9 bg-[#F9FBFB] border border-[#CFE3DD]">
              <div>
                <span className="chip !px-3 !py-1 !text-xs !bg-[#2BD6B4]/20 !text-[#0B6E5F] font-bold">THE SHIFT</span>
                <h3 className="mt-4 text-2xl font-bold text-brand-ink">Beyond Competing with Machines</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#5c7772]">
                  Q-School (The Quantum Schooling) was created to respond to that shift — <strong className="text-brand-ink font-semibold">not by teaching children to compete with machines</strong>, but by deliberately developing the human capacities that remain essential:
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Attention", "Imagination", "Judgement", "Emotional Awareness", "Self-Belief", "Creativity", "Original Thought"].map((c) => (
                    <span key={c} className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-brand-deep border border-[#CFE3DD] shadow-xs">
                      ✦ {c}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-[14.5px] leading-relaxed text-[#5c7772]">
                  Drawing from contemporary learning methods, cognitive-development practices, and selected principles inspired by India’s knowledge traditions, Q-School brings these dimensions together in one structured learning journey.
                </p>
              </div>

              <div className="mt-8 border-t border-[#E2ECE9] pt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-deep text-[#2BD6B4]">
                  <Icon name="award" size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-ink">For Children Aged 6–14 Years</p>
                  <p className="text-xs text-[#6b807b]">48 Classes Per Annum · Continuous Developmental Journey</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} variant="right">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#054038] to-[#0A5A4E] p-7 text-white sm:p-9 shadow-xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#2BD6B4]/15 blur-2xl" />
              <div>
                <span className="font-hand text-5xl leading-none text-[#2BD6B4]">&ldquo;</span>
                <blockquote className="mt-2 text-[17px] font-medium leading-relaxed text-white/95">
                  Education must do more than transfer information. It must develop the human being who receives it. My vision for Q-School is to help every child discover their strengths, build the habits to use them well, and grow with the confidence to navigate a world that is changing every day.
                </blockquote>
                <div className="mt-6 border-t border-white/15 pt-4">
                  <p className="text-[16px] font-bold text-[#2BD6B4]">Dr J Arawindhan</p>
                  <p className="text-[13px] text-white/70">Founder, Chief Mentor &amp; Managing Director, Q-School</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/15 pt-6 text-xs">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                  <p className="font-bold text-[#2BD6B4] uppercase tracking-wider text-[11px]">Our Mission</p>
                  <p className="mt-1 text-white/80 leading-relaxed">Systematically develop every child&apos;s ability to focus, learn, think, create, communicate, adapt, solve and lead in an AI-driven world.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                  <p className="font-bold text-[#2BD6B4] uppercase tracking-wider text-[11px]">Our Vision</p>
                  <p className="mt-1 text-white/80 leading-relaxed">The definitive future-readiness programme recognized nationally as the trusted partner that develops the learner behind the learning.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Gen Alpha & New-Age Parenting Challenge */}
        <div className="mt-16 rounded-3xl bg-[#F4F8F7] border border-[#CFE3DD] p-7 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip !px-3 !py-1 !text-xs !bg-[#054038] !text-white font-bold">GEN ALPHA</span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-brand-ink">A New Generation. A New World. A New Way to Learn.</h3>
            <p className="mt-3 text-sm text-[#5c7772]">
              Born into a digitally connected world, Generation Alpha is growing up alongside artificial intelligence, smart technology and rapid global change. Their future calls for adaptability, creativity, critical thinking, and emotional intelligence.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {traits.map((t, idx) => (
              <div key={idx} className="emboss flex flex-col rounded-2xl bg-white p-5 text-center border border-[#E2ECE9]">
                <span className="icon-3d mx-auto h-12 w-12 rounded-xl" style={{ ["--c" as string]: t.color }}>
                  <Icon name={t.icon as IconName} size={22} />
                </span>
                <h4 className="mt-4 text-[15px] font-bold text-brand-ink">{t.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#5c7772]">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#2BD6B4]/40 bg-[#E9F6F3] p-6 text-center">
            <p className="text-sm sm:text-base font-semibold text-brand-deep italic">
              &ldquo;My child is growing up in a world I never experienced. Am I preparing them for the future they will inherit?&rdquo;
            </p>
            <p className="mt-2 text-xs sm:text-sm text-[#41564f]">
              From screen-time struggles to attention fragmentation, study pressure and emotional development, modern parents face a new set of questions. <strong>The answer lies in nurturing the child beyond textbooks and technology.</strong>
            </p>
          </div>
        </div>
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
    <section id="pedagogy" className="scroll-mt-20 py-20 bg-[#F4F8F7]">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>Why Q-School?</Kicker>
          <H2>School teaches the curriculum. Q-School develops the learner.</H2>
          <p className="mt-3 text-[15px] italic font-medium text-brand-teal">
            &ldquo;Who is systematically developing a child&apos;s ability to learn, think, adapt and create?&rdquo;
          </p>
        </Reveal>

        {/* Matrix comparison */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#E2ECE9] bg-[#054038] text-white p-4 sm:p-5 font-bold text-sm sm:text-base">
            <div>Dimension</div>
            <div className="text-white/80">Traditional Education</div>
            <div className="text-[#2BD6B4]">Q-School (Quantum Schooling)</div>
          </div>
          <div className="divide-y divide-[#EEF3F1]">
            {comparison.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 gap-2 text-sm sm:text-[14.5px] items-center hover:bg-[#F9FBFB] transition">
                <div className="font-semibold text-brand-deep">{row.dim}</div>
                <div className="text-[#6b807b] flex items-center gap-2">
                  <span className="text-red-400 font-bold">✕</span> {row.trad}
                </div>
                <div className="font-bold text-[#0B6E5F] flex items-center gap-2">
                  <span className="text-[#0E937E] font-extrabold">✓</span> {row.qs}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10 Core Abilities */}
        <div className="mt-16">
          <div className="mx-auto max-w-xl text-center">
            <span className="chip !px-3 !py-1 !text-xs !bg-[#054038] !text-white font-bold">THE FOUNDATION</span>
            <h3 className="mt-3 text-2xl font-bold text-brand-ink">10 Core Abilities Systematically Developed</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#5c7772]">
              Q-School works alongside formal schooling to nurture the foundational capacities behind every academic and life success.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {abilities.map((a) => (
              <div key={a.num} className="emboss emboss-hover flex flex-col justify-between rounded-2xl bg-white p-5 border border-[#CFE3DD]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-teal">{a.num}</span>
                    <span className="h-2 w-2 rounded-full bg-[#2BD6B4]" />
                  </div>
                  <h4 className="mt-3 text-[15px] font-bold text-brand-ink">{a.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#5c7772]">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3. AI vs. HI (Human Intelligence) ───────────────────────── */
function AIvsHI() {
  return (
    <section className="relative overflow-hidden bg-[#054038] py-20 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-teal/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-[#2BD6B4]/20 blur-3xl" />

      <div className="container-qs relative">
        <Reveal variant="blur" className="mx-auto max-w-3xl text-center">
          <span className="chip !px-3.5 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">AI VS. HI</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl text-white">
            AI Can Process. <span className="text-[#2BD6B4]">Human Intelligence Can Transform.</span>
          </h2>
          <p className="mt-4 text-[16px] text-white/80 leading-relaxed">
            Artificial Intelligence is reshaping how we learn, work, and live. It can process information, recognize patterns, and automate tasks. But human progress also depends on <strong className="text-white">empathy, imagination, independent judgement, and ethical decision-making.</strong>
          </p>
        </Reveal>

        {/* Side by Side */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* AI */}
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-[#2BD6B4]">
                <Icon name="ai" size={24} />
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Artificial Intelligence (AI)</h3>
                <p className="text-xs text-white/60">Automated Computation &amp; Pattern Output</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3.5 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-white/40" />
                <span><strong>Processes information at speed</strong> across vast datasets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-white/40" />
                <span><strong>Recognises patterns</strong> and generates statistical outputs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-white/40" />
                <span><strong>Automates repetitive tasks</strong> and structured workflows.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-white/40" />
                <span><strong>Supports data-driven decisions</strong> within programmed parameters.</span>
              </li>
            </ul>
          </div>

          {/* HI */}
          <div className="rounded-3xl border-2 border-[#2BD6B4] bg-gradient-to-b from-[#0a5a4e] to-[#04332c] p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2BD6B4] text-brand-deep shadow-md">
                <Icon name="brain" size={24} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Human Intelligence (HI)</h3>
                  <span className="rounded-full bg-[#2BD6B4]/20 px-2 py-0.5 text-[10px] font-bold text-[#2BD6B4]">Q-SCHOOL FOCUS</span>
                </div>
                <p className="text-xs text-[#2BD6B4]">Original Consciousness, Emotion &amp; Ethics</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3.5 text-sm text-white/95">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2BD6B4]" />
                <span><strong>Thinks critically and independently</strong> beyond algorithmic bias.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2BD6B4]" />
                <span><strong>Creates, imagines and innovates</strong> novel artistic &amp; scientific breakthroughs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2BD6B4]" />
                <span><strong>Understands emotions</strong>, empathy, and human shared values.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2BD6B4]" />
                <span><strong>Applies judgement, empathy and ethical responsibility</strong> to lead humanity.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core quote bar */}
        <div className="mt-12 rounded-2xl bg-white/10 border border-white/20 p-5 text-center max-w-3xl mx-auto">
          <p className="font-hand text-2xl text-[#2BD6B4]">&ldquo;AI may change the world. Human intelligence will shape its future.&rdquo;</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs font-semibold text-white/80">
            <span>Focus</span> • <span>Memory</span> • <span>Comprehension</span> • <span>Creativity</span> • <span>Emotional Awareness</span> • <span>Independent Thinking</span>
          </div>
        </div>
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
    <section id="framework" className="scroll-mt-20 py-20 bg-white">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>The Q 5D™ XYZTP Framework</Kicker>
          <H2>One Framework. Five Dimensions. A Progressive Learning Journey.</H2>
          <p className="mt-3 text-sm text-[#5c7772]">
            Our proprietary 5D architecture structures each child’s transformation from initial understanding to peak human performance.
          </p>
        </Reveal>

        {/* 5 Dimensions Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {dimensions.map((d, i) => (
            <div key={d.code} className="emboss emboss-hover flex flex-col justify-between rounded-3xl p-6 border border-[#CFE3DD] bg-[#FDFCF9]">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl font-black text-white text-base shadow-sm" style={{ background: d.color }}>
                  {d.code}
                </span>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#0E937E]">Dimension {i + 1}</p>
                <h3 className="text-lg font-bold text-brand-ink">{d.name}</h3>
                <p className="text-xs font-semibold text-brand-teal mt-0.5">{d.subtitle}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#5c7772]">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progressive Flow Banner */}
        <div className="mt-10 rounded-2xl bg-[#054038] p-6 text-white text-center shadow-lg">
          <p className="text-xs uppercase tracking-widest text-[#2BD6B4] font-bold">Progressive Learning Flow</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-bold text-xs sm:text-sm">
            <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/20">UNDERSTAND</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/20">PRACTISE</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/20">INTERNALISE</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/20">APPLY</span>
            <span className="text-[#2BD6B4]">➔</span>
            <span className="rounded-xl bg-[#2BD6B4] text-brand-deep px-3.5 py-1.5 font-black shadow-sm">EXPRESS</span>
          </div>
        </div>

        {/* 5 Interconnected Intelligence Dimensions */}
        <div className="mt-14">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-[#6b807b]">Five Interconnected Intelligence Dimensions</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {intelligence.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-[#E2ECE9] bg-[#F7FAF9] p-4 text-center">
                <p className="text-sm font-bold text-brand-deep">{item.title}</p>
                <p className="mt-1 text-xs text-[#5c7772]">{item.desc}</p>
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
    <section id="programs" className="scroll-mt-20 bg-white py-20 border-t border-[#E2ECE9]">
      <div className="container-qs">
        <Reveal variant="blur" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Kicker>{c.kicker}</Kicker>
            <H2>{c.title}</H2>
            <p className="mt-2 text-sm text-[#5c7772]">
              Structured neuro-cognitive development, speed learning, and leadership across 48 classes per annum.
            </p>
          </div>
          <Link href="#demo" className="btn-3d btn-3d-mint inline-flex items-center gap-1 text-xs font-bold px-4 py-2.5 rounded-xl">
            Book a Free Demo for Any Program →
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {programs.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 90} variant="zoom">
              <Tilt className="h-full rounded-3xl">
                <div className="emboss emboss-hover group flex h-full flex-col justify-between rounded-3xl bg-[#FDFCF9] p-6 border border-[#CFE3DD]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="chip !px-2.5 !py-0.5 !text-[10px] !bg-[#054038] !text-white font-bold">
                        {p.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-[#0E937E]">48 Classes</span>
                    </div>

                    <h3 className="mt-4 text-[17px] font-bold text-brand-ink group-hover:text-brand-teal transition">
                      {p.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#0E937E] mt-0.5">{p.format}</p>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#5c7772]">{p.overview}</p>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-md bg-white border border-[#E2ECE9] px-2 py-0.5 text-[10.5px] font-medium text-[#41564f]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#EEF3F1] pt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-ink">Ages 6–14 Y</span>
                    <Link
                      href="#demo"
                      className="btn-3d btn-3d-teal rounded-lg px-3 py-1.5 text-xs font-semibold"
                    >
                      Enrol / Demo →
                    </Link>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
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
    <section id="neo-sapiens" className="scroll-mt-20 py-20 bg-white border-t border-[#E2ECE9]">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-3xl text-center">
          <Kicker>The Future Learner</Kicker>
          <H2>Who is a Neo Sapiens?</H2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-[#41564f]">
            A <strong className="text-brand-ink">Neo Sapiens</strong> is a future-ready learner equipped with the skills, mindset, and values to think, adapt, create, and lead in an ever-changing world.
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#0E937E]">THINK · LEARN · LEAD · CREATE</p>
        </Reveal>

        {/* 8 Persona Traits */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {traits.map((t, idx) => (
            <div key={idx} className="emboss emboss-hover flex items-start gap-3.5 rounded-2xl bg-[#FDFCF9] p-4 border border-[#CFE3DD]">
              <span className="icon-3d h-10 w-10 shrink-0 rounded-xl" style={{ ["--c" as string]: "#0E937E" }}>
                <Icon name={t.icon as IconName} size={20} />
              </span>
              <div>
                <h4 className="text-[14.5px] font-bold text-brand-ink">{t.title}</h4>
                <p className="mt-1 text-xs text-[#5c7772] leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The 3 Pillars */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#054038] to-[#0A5A4E] p-8 sm:p-12 text-white shadow-xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip !px-3 !py-1 !text-xs !bg-[#2BD6B4] !text-brand-deep font-black">THE CORE PILLARS</span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">The 3 Pillars of Neo Sapiens</h3>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.num} className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-[#2BD6B4]">{p.num}</span>
                  <h4 className="mt-2 text-lg font-bold text-white">{p.title}</h4>
                  <p className="mt-2.5 text-xs text-white/80 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center font-bold tracking-wide text-xs sm:text-sm text-[#2BD6B4] uppercase">
            THINK SMARTER · LEARN DEEPER · LEAD BETTER — ENGINEERING THE NEO SAPIENS
          </p>
        </div>
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
    <section className="scroll-mt-20 py-20 bg-[#F4F8F7]">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>The 48-Class Journey</Kicker>
          <H2>48 Classes. One Continuous Developmental Journey.</H2>
          <p className="mt-3 text-sm text-[#5c7772]">
            48 classes per annum structured into a 6-stage continuous cycle. Learning does not end when the class ends.
          </p>
        </Reveal>

        {/* 6 Stages Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((st) => (
            <div key={st.num} className="emboss flex flex-col justify-between rounded-2xl bg-white p-4 text-center border border-[#CFE3DD]">
              <span className="text-xs font-black text-brand-teal">{st.num}</span>
              <h4 className="mt-2 text-sm font-bold text-brand-ink">{st.name}</h4>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[#5c7772]">{st.desc}</p>
            </div>
          ))}
        </div>

        {/* Continuous Beyond Classroom Banner */}
        <div className="mt-8 rounded-2xl border border-[#2BD6B4]/50 bg-[#E2ECE9] p-5 text-center">
          <p className="text-xs uppercase tracking-wider font-bold text-[#054038]">Learning Continues Beyond The Classroom</p>
          <p className="mt-1 text-sm font-extrabold text-brand-ink">
            CENTRE LEARNING <span className="text-brand-teal">➔</span> GUIDED PRACTICE <span className="text-brand-teal">➔</span> HOME REINFORCEMENT
          </p>
        </div>

        {/* 3-Year Pathway & Quantum Habits Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pathway */}
          <div className="emboss rounded-3xl bg-white p-7 border border-[#CFE3DD]">
            <span className="chip !px-3 !py-1 !text-xs !bg-[#054038] !text-white font-bold">STRUCTURED PROGRESSION</span>
            <h3 className="mt-3 text-xl font-bold text-brand-ink">The 3-Year Q-School Pathway</h3>
            <div className="mt-6 space-y-4">
              {pathways.map((pw, i) => (
                <div key={i} className="rounded-2xl border border-[#E2ECE9] bg-[#F7FAF9] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-deep">{pw.year} — {pw.stage}</span>
                    <span className="text-[11px] font-bold text-[#0E937E] bg-brand-teal100 px-2.5 py-0.5 rounded-full">48 Classes</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pw.modules.map((m) => (
                      <span key={m} className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-brand-ink border border-[#CFE3DD]">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[#5c7772]">{pw.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Habits */}
          <div className="emboss rounded-3xl bg-white p-7 border border-[#CFE3DD] flex flex-col justify-between">
            <div>
              <span className="chip !px-3 !py-1 !text-xs !bg-[#0E937E] !text-white font-bold">DAILY ROUTINES</span>
              <h3 className="mt-3 text-xl font-bold text-brand-ink">Quantum Habits</h3>
              <p className="mt-1 text-xs font-semibold text-[#0E937E]">Small Habits. Big Possibilities. Habit → Practice → Growth.</p>
              <div className="mt-6 space-y-3">
                {habits.map((h, i) => (
                  <div key={i} className="flex items-center gap-3.5 rounded-2xl border border-[#EEF3F1] bg-[#FDFCF9] p-3.5">
                    <span className="icon-3d h-9 w-9 shrink-0 rounded-xl" style={{ ["--c" as string]: "#0E937E" }}>
                      <Icon name={h.icon as IconName} size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">{h.title}</p>
                      <p className="text-xs text-[#5c7772]">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#EEF3F1] pt-4 text-center">
              <Link href="#demo" className="btn-3d btn-3d-teal inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold">
                Begin Your Child&apos;s Q-Journey →
              </Link>
            </div>
          </div>
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
    <section className="bg-white py-20">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {c.items.map((t, i) => (
            <Reveal key={i} delay={(i % 3) * 120} variant="flip">
              <figure className="emboss emboss-hover flex h-full flex-col rounded-3xl p-7 transition hover:-translate-y-1">
                <span className="font-hand text-6xl leading-none text-brand-teal500" aria-hidden>
                  &ldquo;
                </span>
                {t.rating > 0 && (
                  <div className="-mt-1 mb-2 flex gap-0.5 text-[#FFC845]" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: Math.round(t.rating) }, (_, k) => (
                      <Icon key={k} name="star" size={14} fill="currentColor" strokeWidth={0} className="drop-shadow-[0_1px_0_rgba(183,121,31,.5)]" />
                    ))}
                  </div>
                )}
                <blockquote className="flex-1 text-[15px] leading-relaxed text-[#2b3d38]">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#E2ECE9] pt-5 shadow-[0_-1px_0_#fff]">
                  <span className="icon-3d h-10 w-10 rounded-full">
                    <Icon name="users" size={18} />
                  </span>
                  <span className="text-[13px]">
                    <b className="block text-brand-ink">{t.who}</b>
                    <span className="text-[#6b807b]">{t.city}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Centres({ c }: { c: HomeContent["centres"] }) {
  return (
    <section id="centres" className="container-qs scroll-mt-20 py-20">
      <Reveal variant="blur" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          <p className="mt-2 text-sm text-[#5c7772]">
            CONFIDENT LEARNERS · COMPASSIONATE THINKERS · FUTURE-READY LEADERS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:+919944454840"
            className="btn-3d btn-3d-mint inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"
          >
            <Icon name="phone" size={14} /> Central Desk: 99444 54840
          </a>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {CENTERS.map((ct, i) => (
          <Reveal key={ct.id} delay={(i % 3) * 100} variant="zoom">
            <Tilt className="h-full rounded-2xl">
              <div className="emboss emboss-hover flex h-full flex-col justify-between rounded-2xl p-6 bg-white border border-[#CFE3DD]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip !px-2.5 !py-0.5 !text-[11px] !bg-brand-teal100 !text-brand-deep font-bold">
                      {ct.city}
                    </span>
                    <span className="text-[11px] font-bold text-[#0E937E]">Branch 0{i + 1}</span>
                  </div>

                  <h3 className="mt-3 text-[17px] font-bold text-brand-ink">{ct.name}</h3>

                  <p className="mt-2 text-xs leading-relaxed text-[#5c7772]">
                    <Icon name="pin" size={13} className="inline mr-1 text-[#0E937E]" />
                    {ct.address}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {ct.batches.map((b) => (
                      <span key={b} className="chip !px-2.5 !py-0.5 !text-[10.5px]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-[#EEF3F1] pt-4 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${ct.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:underline"
                  >
                    <Icon name="phone" size={13} />
                    <span>{ct.phone}</span>
                  </a>
                  <Link
                    href="#demo"
                    className="btn-3d btn-3d-teal rounded-lg px-3 py-1.5 text-[11.5px] font-semibold"
                  >
                    Book Visit →
                  </Link>
                </div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pricing({ c }: { c: HomeContent["pricing"] }) {
  if (!c.plans.length) return null;
  const cols = c.plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : c.plans.length === 2 ? "md:grid-cols-2" : c.plans.length === 1 ? "" : "md:grid-cols-3";
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20">
      <div className="container-qs">
        <Reveal variant="blur" className="mx-auto max-w-2xl text-center">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
        </Reveal>
        <div className={`mx-auto mt-12 grid max-w-5xl grid-cols-1 items-stretch gap-6 ${cols}`}>
          {c.plans.map((p, i) => (
            <Reveal key={i} delay={i * 120} variant="flip">
              <Tilt max={5} className={`h-full rounded-3xl ${p.featured ? "md:-top-3" : ""}`}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-7 ${
                    p.featured
                      ? "bg-gradient-to-b from-[#0a5a4e] to-brand-deep text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2),inset_0_-3px_0_rgba(0,0,0,.25),0_30px_60px_-20px_rgba(5,64,56,.65)]"
                      : "emboss emboss-hover"
                  }`}
                >
                  {p.featured && (
                    <span className="btn-3d btn-3d-mint absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold">RECOMMENDED</span>
                  )}
                  <p className={`text-[15px] font-semibold ${p.featured ? "text-[#2BD6B4]" : "text-brand-teal"}`}>{p.name}</p>
                  <p className="mt-3">
                    <span className={`text-3xl font-bold ${p.featured ? "" : "text-brand-ink"}`}>{p.price}</span>
                    <span className={`ml-1 text-[13px] ${p.featured ? "text-white/70" : "text-[#6b807b]"}`}>{p.per}</span>
                  </p>
                  <p className={`mt-2 text-[13px] ${p.featured ? "text-white/75" : "text-[#5c7772]"}`}>{p.blurb}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f, k) => (
                      <li key={k} className="flex gap-2.5 text-[13px]">
                        <span className="icon-3d mt-px h-[18px] w-[18px] shrink-0 rounded-full" style={{ ["--c" as string]: p.featured ? "#2BD6B4" : "#0E937E" }}>
                          <Icon name="check" size={11} strokeWidth={3.2} />
                        </span>
                        <span className={p.featured ? "text-white/90" : "text-[#41564f]"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {p.cta.label && (
                    <Link
                      href={p.cta.href}
                      className={`btn-3d mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-[14px] font-semibold ${p.featured ? "btn-3d-mint" : "btn-3d-outline"}`}
                    >
                      {p.cta.label}
                    </Link>
                  )}
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
        {c.note && <p className="mt-8 text-center text-[12.5px] text-[#6b807b]">{c.note}</p>}
      </div>
    </section>
  );
}

function Faq({ c }: { c: HomeContent["faq"] }) {
  return (
    <section id="faq" className="container-qs scroll-mt-20 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal variant="left">
          <Kicker>{c.kicker}</Kicker>
          <H2>{c.title}</H2>
          {c.body && <p className="mt-4 text-[14.5px] text-[#5c7772]">{c.body}</p>}
          {c.cta.label && (
            <Link href={c.cta.href} className="btn-3d btn-3d-outline mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              <Icon name="message" size={16} /> {c.cta.label}
            </Link>
          )}
        </Reveal>
        <Reveal delay={120} variant="right">
          <div className="space-y-3">
            {c.items.map((f, i) => (
              <details key={i} className="emboss group rounded-2xl px-5 py-4 open:shadow-[inset_0_2px_6px_rgba(5,64,56,.08)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-brand-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="icon-3d no-lift h-8 w-8 shrink-0 rounded-full group-open:rotate-45">
                    <Icon name="plus" size={15} strokeWidth={2.4} />
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line pr-10 text-[14px] leading-relaxed text-[#5c7772]">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Demo({ c }: { c: HomeContent["demo"] }) {
  return (
    <section id="demo" className="container-qs scroll-mt-20 py-8">
      <Reveal variant="wipe">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-deep px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-teal/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#2BD6B4]/25 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-hand text-2xl sm:text-3xl text-[#2BD6B4]">{c.script}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-[2.5rem]">{c.title}</h2>
              {c.body && <p className="mt-4 max-w-md text-[15px] text-white/80 leading-relaxed">{c.body}</p>}
              <ul className="mt-6 space-y-2.5">
                {c.points.map((x, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-white/90">
                    <span className="icon-3d h-6 w-6 rounded-full" style={{ ["--c" as string]: "#2BD6B4" }}>
                      <Icon name="check" size={13} strokeWidth={3} className="text-brand-deep" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>

              {/* Direct counselor callout */}
              <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-4.5 max-w-md">
                <p className="text-xs uppercase tracking-wider text-[#2BD6B4] font-bold">Speak to Our Q-School Counsellor Today</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <a href="tel:+919944454840" className="hover:text-[#2BD6B4] flex items-center gap-1 transition">
                    <Icon name="phone" size={14} /> +91 99444 54840
                  </a>
                  <a href="mailto:info@theqschool.com" className="hover:text-[#2BD6B4] flex items-center gap-1 transition">
                    <Icon name="message" size={14} /> info@theqschool.com
                  </a>
                </div>
              </div>
            </div>

            <Tilt max={3} glare={false} className="rounded-3xl">
              <div className="rounded-3xl bg-gradient-to-b from-white to-[#f3faf8] p-6 text-brand-ink shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_rgba(5,64,56,.08),0_40px_70px_-25px_rgba(0,0,0,.6)] sm:p-8">
                <h3 className="text-lg font-bold text-brand-deep">{c.formTitle}</h3>
                {c.formNote && <p className="mb-5 mt-1 text-[13px] text-[#5c7772]">{c.formNote}</p>}
                <LeadForm source="landing_demo" cta={c.button} />
              </div>
            </Tilt>
          </div>
        </div>
      </Reveal>
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
