/**
 * Home-page content model, editable from Admin Console › Website › Home page.
 * Shared by the server store, the public page and the admin editor (no Node imports here).
 * Defaults mirror the original hard-coded page, so an empty store renders the same site.
 */
import { CENTERS, POPULAR_CATEGORIES } from "@qschool/shared";

export type SectionKey =
  | "hero"
  | "stats"
  | "subjects"
  | "formats"
  | "programs"
  | "how"
  | "live"
  | "why"
  | "testimonials"
  | "centres"
  | "pricing"
  | "faq"
  | "demo";

export const SECTION_META: Record<SectionKey, { label: string; icon: string; help: string; anchor?: string }> = {
  hero: { label: "Hero slider", icon: "sparkle", help: "Full-screen slides at the top of the page" },
  stats: { label: "Stats strip", icon: "chart", help: "Four headline numbers under the hero" },
  subjects: { label: "Subjects ticker", icon: "grid", help: "Scrolling row of subject chips" },
  formats: { label: "Learning formats", icon: "live", help: "Live classes, webinars, workshops, courses" },
  programs: { label: "Popular programs", icon: "book", help: "Program cards from the course catalogue", anchor: "programs" },
  how: { label: "How it works", icon: "clipboard", help: "Three steps from demo to certificate" },
  live: { label: "Webinars & workshops", icon: "webinar", help: "Upcoming events from the schedule", anchor: "live" },
  why: { label: "Why Q-School + app", icon: "shield", help: "Reasons to choose you and the app promo" },
  testimonials: { label: "Parent stories", icon: "message", help: "Testimonials" },
  centres: { label: "Learning centres", icon: "building", help: "Offline centre cards", anchor: "centres" },
  pricing: { label: "Pricing", icon: "rupee", help: "Plans and prices", anchor: "pricing" },
  faq: { label: "FAQ", icon: "help", help: "Questions parents ask", anchor: "faq" },
  demo: { label: "Free demo form", icon: "calendar", help: "Final call to action with the lead form", anchor: "demo" },
};

export interface Cta {
  label: string;
  href: string;
}

export interface HeroSlide {
  id: string;
  enabled: boolean;
  /** collage = brand slide with the class-window collage; photo = full-width background photo */
  layout: "collage" | "photo";
  label: string;
  badge: string;
  kicker: string;
  title: string;
  accent: string;
  body: string;
  primary: Cta;
  secondary: Cta;
  /** photo: background image · collage: photo inside the class window */
  image: string;
  imageAlt: string;
  chips: { icon: string; label: string }[];
  /** collage only */
  windowTitle: string;
  windowMentor: string;
  windowMeta: string;
  trustLearners: string;
  trustRating: string;
  /** photo only: info card on the right */
  card: {
    show: boolean;
    heading: string;
    title: string;
    mentor: string;
    lines: { icon: string; text: string }[];
    seatsLeft: number;
    seatsTotal: number;
  };
}

export interface HomeContent {
  sections: { key: SectionKey; visible: boolean }[];
  hero: { interval: number; slides: HeroSlide[] };
  stats: { items: { value: string; label: string }[] };
  subjects: { items: { label: string; count: string; color: string }[] };
  formats: { kicker: string; title: string; items: { icon: string; title: string; body: string; href: string; color: string }[] };
  programs: { kicker: string; title: string; linkLabel: string; count: number };
  how: { kicker: string; title: string; steps: { icon: string; title: string; body: string }[]; cta: Cta };
  live: { kicker: string; title: string; linkLabel: string };
  why: {
    kicker: string;
    title: string;
    body: string;
    items: { icon: string; title: string; body: string; color: string }[];
    appBadge: string;
    appTitle: string;
    appBody: string;
  };
  testimonials: { kicker: string; title: string; items: { quote: string; who: string; city: string; rating: number }[] };
  centres: { kicker: string; title: string; linkLabel: string; items: { name: string; area: string; city: string; tags: string[] }[] };
  pricing: {
    kicker: string;
    title: string;
    note: string;
    plans: { name: string; price: string; per: string; blurb: string; features: string[]; cta: Cta; featured: boolean }[];
  };
  faq: { kicker: string; title: string; body: string; cta: Cta; items: { q: string; a: string }[] };
  demo: { script: string; title: string; body: string; points: string[]; formTitle: string; formNote: string; button: string };
}

const u = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const BLANK_SLIDE: HeroSlide = {
  id: "",
  enabled: true,
  layout: "photo",
  label: "New slide",
  badge: "NEW",
  kicker: "Short line next to the badge",
  title: "Headline goes",
  accent: "here",
  body: "One or two sentences that explain the offer.",
  primary: { label: "Book a free demo", href: "#demo" },
  secondary: { label: "Explore programs", href: "#programs" },
  image: "",
  imageAlt: "",
  chips: [],
  windowTitle: "",
  windowMentor: "",
  windowMeta: "",
  trustLearners: "",
  trustRating: "",
  card: { show: false, heading: "Next batch", title: "", mentor: "", lines: [], seatsLeft: 0, seatsTotal: 0 },
};

export const DEFAULT_HOME: HomeContent = {
  sections: [
    { key: "hero", visible: true },
    { key: "stats", visible: false },
    { key: "subjects", visible: false },
    { key: "formats", visible: false },
    { key: "why", visible: true },
    { key: "how", visible: true },
    { key: "programs", visible: true },
    { key: "pricing", visible: true },
    { key: "live", visible: false },
    { key: "testimonials", visible: true },
    { key: "centres", visible: true },
    { key: "faq", visible: true },
    { key: "demo", visible: true },
  ],
  hero: {
    interval: 7,
    slides: [
      {
        ...BLANK_SLIDE,
        id: "brand",
        layout: "collage",
        label: "Thinking, Memory & Confidence",
        badge: "Ages 6–14",
        kicker: "48 classes a year · 9 centres + online",
        title: "Help your child learn how to think,",
        accent: "not just what to memorise.",
        body: "Q-School builds focus, memory, confidence and original thinking alongside regular school, in small batches of up to 15.",
        primary: { label: "Book a Free 45-Min Demo", href: "#demo" },
        secondary: { label: "See Programs", href: "#programs" },
        image: "/images/bmit-hero.png",
        imageAlt: "Young learner engaging in Q-School cognitive development",
        windowTitle: "Every class follows the same six steps",
        windowMentor: "Q-School Certified Mentors",
        windowMeta: "9 centres in 7 cities",
        trustLearners: "25,000+ learners",
        trustRating: "4.9 / 5 on Google",
      },
    ],
  },
  stats: {
    items: [
      { value: "6–14", label: "Ages" },
      { value: "48", label: "Classes a Year" },
      { value: "9", label: "Centres in 7 Cities + Online" },
      { value: "15", label: "Max Children per Batch" },
    ],
  },
  subjects: {
    items: [
      { label: "FOCUS", count: "01", color: "#0E937E" },
      { label: "MEMORY", count: "02", color: "#5B6CF0" },
      { label: "REASONING", count: "03", color: "#F29A2E" },
      { label: "CONFIDENCE", count: "04", color: "#E2557A" },
      { label: "ORIGINAL THINKING", count: "05", color: "#2BD6B4" },
      { label: "HABITS", count: "06", color: "#054038" },
      { label: "CREATIVITY", count: "07", color: "#3C7DBF" },
      { label: "LEADERSHIP", count: "08", color: "#4CAF6E" },
    ],
  },
  formats: {
    kicker: "Why Q-School",
    title: "School teaches the curriculum. Q-School develops the learner.",
    items: [
      {
        icon: "brain",
        title: "Think critically",
        body: "Question, reason and solve problems independently.",
        href: "#programs",
        color: "#0E937E",
      },
      {
        icon: "palette",
        title: "Create with empathy",
        body: "Imagine new ideas and express them with confidence.",
        href: "#programs",
        color: "#5B6CF0",
      },
      {
        icon: "crown",
        title: "Lead with purpose",
        body: "Build habits, resilience and the ability to work with others.",
        href: "#programs",
        color: "#F29A2E",
      },
    ],
  },
  programs: {
    kicker: "Programs",
    title: "Eight programs, one journey",
    linkLabel: "Learn more →",
    count: 8,
  },
  how: {
    kicker: "How it works",
    title: "Every class follows the same six steps",
    steps: [
      { icon: "sparkle", title: "Engage", body: "Captures attention and sparks curiosity." },
      { icon: "eye", title: "Explore", body: "Introduces a challenge through discovery." },
      { icon: "brain", title: "Practise", body: "Builds skill through deliberate practice." },
      { icon: "tools", title: "Apply", body: "Applies skill to a real task." },
      { icon: "bulb", title: "Reflect", body: "Ends with reflection on what was learned." },
      { icon: "award", title: "Reinforce", body: "Continues at home through guided practice." },
    ],
    cta: { label: "Learn about the Q 5D™ framework →", href: "/q-5d-framework" },
  },
  live: { kicker: "Learning Beyond the Classroom", title: "Centre Learning → Guided Practice → Home Reinforcement", linkLabel: "See batch timings" },
  why: {
    kicker: "Why Q-School",
    title: "School teaches the curriculum. Q-School develops the learner.",
    body: "Children today grow up with smartphones, constant distraction and AI. Marks still matter, but so do attention, imagination, judgement and emotional strength. Q-School trains these skills on purpose, in structured weekly classes that work alongside your child's school.",
    items: [
      { icon: "brain", title: "Think critically", body: "Question, reason and solve problems independently.", color: "#0E937E" },
      { icon: "palette", title: "Create with empathy", body: "Imagine new ideas and express them with confidence.", color: "#5B6CF0" },
      { icon: "crown", title: "Lead with purpose", body: "Build habits, resilience and the ability to work with others.", color: "#F29A2E" },
    ],
    appBadge: "Q-Master AI",
    appTitle: "Continuous Learner Support",
    appBody: "Access Q-Master AI tutor for instant academic doubt-solving, guided habit trackers, and progress reports.",
  },
  testimonials: {
    kicker: "What parents say",
    title: "What parents say",
    items: [
      {
        quote: "Before Q-School, my son struggled with focus and spent hours cramming for tests. After three months, he reads noticeably faster and feels far more confident in exams.",
        who: "Priya R., parent of a Grade 6 learner",
        city: "Adyar, Chennai",
        rating: 5,
      },
      {
        quote: "Tuition repeats the textbook. Q-School taught my daughter how to think, visualise maths and manage her emotions.",
        who: "Karthik M., parent of a Grade 5 learner",
        city: "Whitefield, Bengaluru",
        rating: 5,
      },
      {
        quote: "Q-Mastery helped my daughter become a school prefect. She speaks clearly, plans her own study time and believes in herself.",
        who: "Meera S., parent of a Grade 8 learner",
        city: "Banjara Hills, Hyderabad",
        rating: 5,
      },
    ],
  },
  centres: {
    kicker: "Centres",
    title: "Find a centre near you",
    linkLabel: "Book a Visit",
    items: CENTERS.map((c) => ({
      name: c.name,
      area: c.area,
      city: c.city,
      tags: [c.phone, ...c.batches],
    })),
  },
  pricing: {
    kicker: "The 3-year pathway",
    title: "A clear path, year by year",
    note: "Q-Reading, Q-Maths and Q-Science are available as add-ons. Your counsellor will recommend the right starting point for your child's age and needs. Each year includes 48 classes (about one a week), learning kits, progress assessments and parent reviews. Year 3 ends with a capstone project and a Q-School completion certificate.",
    plans: [
      {
        name: "Year 1: Foundation",
        price: "Q-Vision + Q-Learning + Q-Mastery",
        per: "48 classes",
        blurb: "Focus, memory and daily habits",
        features: [
          "Q-Vision: Focus, attention and observation",
          "Q-Learning: Memory techniques that replace rote learning",
          "Q-Mastery: Habits, emotional intelligence and leadership",
          "48 classes, learning kits, progress assessments & parent reviews",
        ],
        cta: { label: "Book a Free Demo", href: "#demo" },
        featured: false,
      },
      {
        name: "Year 2: Progression",
        price: "Q-Creation + Q-Learning + Q-Mastery",
        per: "48 classes",
        blurb: "Imagination, retention and communication",
        features: [
          "Q-Creation: Imagination and creative expression",
          "Q-Learning: Memory techniques that replace rote learning",
          "Q-Mastery: Habits, emotional intelligence and leadership",
          "48 classes, learning kits, progress assessments & parent reviews",
        ],
        cta: { label: "Book a Free Demo", href: "#demo" },
        featured: true,
      },
      {
        name: "Year 3: Advanced",
        price: "Q-Way + Q-Learning + Q-Mastery",
        per: "48 classes",
        blurb: "Higher-order thinking and leadership",
        features: [
          "Q-Way: Intuitive comprehension and higher-order thinking",
          "Q-Learning: Memory techniques that replace rote learning",
          "Q-Mastery: Habits, emotional intelligence and leadership",
          "Ends with a capstone project and a Q-School completion certificate",
        ],
        cta: { label: "Book a Free Demo", href: "#demo" },
        featured: false,
      },
    ],
  },
  faq: {
    kicker: "FAQ",
    title: "Frequently asked questions",
    body: "Have questions about your child's age or starting point? Call or WhatsApp +91 99444 54840 or email info@theqschool.com.",
    cta: { label: "Book a Free Demo", href: "#demo" },
    items: [
      {
        q: "What is Q-School, and how is it different from school or tuition?",
        a: "School teaches the syllabus, and tuition repeats it. Q-School works on how your child learns: focus, memory, reasoning, communication and emotional strength. It complements school and does not replace it.",
      },
      {
        q: "Which age group is it for, and where does my child start?",
        a: "Q-School is for children aged 6 to 14. Every child begins with a short assessment and demo, and our counsellor recommends the right program and year (e.g. ages 6–8: Year 1 Foundation; ages 9–11: Year 1 or 2; ages 12–14: accelerated track based on assessment).",
      },
      {
        q: "How often are classes, and how long are they?",
        a: "There are 48 classes a year, about one a week, each lasting 60 to 90 minutes. Classes run in small batches of up to 15 children, at the centre or online.",
      },
      {
        q: "What happens in the free demo?",
        a: "The demo is a free 45-minute class with a Q-School mentor, followed by a short conversation with a counsellor about your child's strengths and goals. There is no obligation to enrol.",
      },
      {
        q: "What does it cost?",
        a: "Fees depend on the program and city. Your counsellor will share the details after the demo.",
      },
      {
        q: "Do you offer online classes?",
        a: "Yes. Live, mentor-led online cohorts are open to families across India and abroad. Ask a counsellor about batch timings.",
      },
    ],
  },
  demo: {
    script: "Free 45-Minute Demo Session",
    title: "Book your child's free demo class",
    body: "A free 45-minute session. No obligation. Our counsellor will call you within 24 hours.",
    points: [
      "Ages 6–14 · Small batches of up to 15",
      "48 mentor-led classes a year",
      "9 centres across 7 cities + live online",
      "No obligation to enrol",
    ],
    formTitle: "Book your child's free demo class",
    formNote: "A free 45-minute session. No obligation. Our counsellor will call you within 24 hours.",
    button: "Book a Free Demo",
  },
};

/* ───────────────────────── sanitising ───────────────────────── */

const str = (v: unknown, max = 400, fallback = "") => (typeof v === "string" ? v.slice(0, max) : fallback);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const arr = <T>(v: unknown, map: (x: unknown, i: number) => T, max = 30): T[] =>
  Array.isArray(v) ? v.slice(0, max).map(map) : [];
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Links: on-site paths, #anchors, https:// and mailto:/tel: only (no javascript: etc.). */
export function safeHref(v: unknown, fallback = "#demo") {
  const s = str(v, 500).trim();
  if (!s) return fallback;
  if (/^(\/(?!\/)|#|https:\/\/|http:\/\/|mailto:|tel:)/i.test(s)) return s;
  return fallback;
}
/** Images: on-site paths, uploaded media and https URLs only. */
export function safeImage(v: unknown) {
  const s = str(v, 800).trim();
  return /^(\/(?!\/)|https:\/\/)/i.test(s) ? s : "";
}
const color = (v: unknown, fallback: string) => {
  const s = str(v, 9);
  return /^#[0-9a-f]{3,8}$/i.test(s) ? s : fallback;
};
const cta = (v: unknown, d: Cta): Cta => {
  const o = obj(v);
  return { label: str(o.label, 60, d.label), href: safeHref(o.href, d.href) };
};

/** Coerce anything (old file, hand-edited JSON, API body) into a valid HomeContent. */
export function normalizeHome(input: unknown): HomeContent {
  const d = DEFAULT_HOME;
  const i = obj(input);
  const keys = Object.keys(SECTION_META) as SectionKey[];

  // sections: keep saved order, drop unknown keys, append any new ones
  const seen = new Set<SectionKey>();
  const sections: HomeContent["sections"] = [];
  for (const s of arr(i.sections, (x) => obj(x), 40)) {
    const key = s.key as SectionKey;
    if (keys.includes(key) && !seen.has(key)) {
      seen.add(key);
      sections.push({ key, visible: bool(s.visible, true) });
    }
  }
  for (const key of keys) if (!seen.has(key)) sections.push({ key, visible: true });

  const sec = <K extends keyof HomeContent>(k: K) => (k in i ? obj(i[k]) : null);

  const hero = sec("hero");
  const slides = hero
    ? arr(
        hero.slides,
        (x, n) => {
          const s = obj(x);
          const c = obj(s.card);
          return {
            id: str(s.id, 40) || `s${n}_${Math.random().toString(36).slice(2, 7)}`,
            enabled: bool(s.enabled, true),
            layout: s.layout === "collage" ? "collage" : "photo",
            label: str(s.label, 80, "Slide"),
            badge: str(s.badge, 24),
            kicker: str(s.kicker, 80),
            title: str(s.title, 120),
            accent: str(s.accent, 120),
            body: str(s.body, 400),
            primary: cta(s.primary, BLANK_SLIDE.primary),
            secondary: cta(s.secondary, BLANK_SLIDE.secondary),
            image: safeImage(s.image),
            imageAlt: str(s.imageAlt, 160),
            chips: arr(s.chips, (y) => ({ icon: str(obj(y).icon, 30, "check"), label: str(obj(y).label, 40) }), 6),
            windowTitle: str(s.windowTitle, 80),
            windowMentor: str(s.windowMentor, 60),
            windowMeta: str(s.windowMeta, 60),
            trustLearners: str(s.trustLearners, 40),
            trustRating: str(s.trustRating, 20),
            card: {
              show: bool(c.show, false),
              heading: str(c.heading, 30, "Next batch"),
              title: str(c.title, 80),
              mentor: str(c.mentor, 60),
              lines: arr(c.lines, (y) => ({ icon: str(obj(y).icon, 30, "check"), text: str(obj(y).text, 60) }), 5),
              seatsLeft: num(c.seatsLeft, 0, 9999, 0),
              seatsTotal: num(c.seatsTotal, 0, 9999, 0),
            },
          } satisfies HeroSlide;
        },
        8,
      )
    : d.hero.slides;

  const pick = <T>(k: keyof HomeContent, fn: (o: Record<string, unknown>) => T, fallback: T): T => {
    const o = sec(k);
    return o ? fn(o) : fallback;
  };

  return {
    sections,
    hero: { interval: hero ? num(hero.interval, 3, 30, d.hero.interval) : d.hero.interval, slides },
    stats: pick("stats", (o) => ({ items: arr(o.items, (x) => ({ value: str(obj(x).value, 20), label: str(obj(x).label, 50) }), 6) }), d.stats),
    subjects: pick(
      "subjects",
      (o) => ({ items: arr(o.items, (x) => ({ label: str(obj(x).label, 40), count: str(obj(x).count, 12), color: color(obj(x).color, "#0E937E") }), 24) }),
      d.subjects,
    ),
    formats: pick(
      "formats",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        items: arr(o.items, (x) => {
          const y = obj(x);
          return { icon: str(y.icon, 30, "live"), title: str(y.title, 50), body: str(y.body, 220), href: safeHref(y.href, "#programs"), color: color(y.color, "#0E937E") };
        }, 8),
      }),
      d.formats,
    ),
    programs: pick("programs", (o) => ({ kicker: str(o.kicker, 80), title: str(o.title, 120), linkLabel: str(o.linkLabel, 40), count: num(o.count, 1, 12, 3) }), d.programs),
    how: pick(
      "how",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        steps: arr(o.steps, (x) => ({ icon: str(obj(x).icon, 30, "check"), title: str(obj(x).title, 60), body: str(obj(x).body, 200) }), 6),
        cta: cta(o.cta, d.how.cta),
      }),
      d.how,
    ),
    live: pick("live", (o) => ({ kicker: str(o.kicker, 80), title: str(o.title, 120), linkLabel: str(o.linkLabel, 40) }), d.live),
    why: pick(
      "why",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        body: str(o.body, 400),
        items: arr(o.items, (x) => {
          const y = obj(x);
          return { icon: str(y.icon, 30, "check"), title: str(y.title, 60), body: str(y.body, 160), color: color(y.color, "#0E937E") };
        }, 8),
        appBadge: str(o.appBadge, 40),
        appTitle: str(o.appTitle, 60),
        appBody: str(o.appBody, 200),
      }),
      d.why,
    ),
    testimonials: pick(
      "testimonials",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        items: arr(o.items, (x) => {
          const y = obj(x);
          return { quote: str(y.quote, 400), who: str(y.who, 60), city: str(y.city, 40), rating: num(y.rating, 0, 5, 5) };
        }, 12),
      }),
      d.testimonials,
    ),
    centres: pick(
      "centres",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        linkLabel: str(o.linkLabel, 40),
        items: arr(o.items, (x) => {
          const y = obj(x);
          return { name: str(y.name, 60), area: str(y.area, 40), city: str(y.city, 40), tags: arr(y.tags, (t) => str(t, 60), 6) };
        }, 12),
      }),
      d.centres,
    ),
    pricing: pick(
      "pricing",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        note: str(o.note, 400),
        plans: arr(o.plans, (x) => {
          const y = obj(x);
          return {
            name: str(y.name, 40),
            price: str(y.price, 80),
            per: str(y.per, 30),
            blurb: str(y.blurb, 120),
            features: arr(y.features, (f) => str(f, 100), 10),
            cta: cta(y.cta, { label: "Book a Free Demo", href: "#demo" }),
            featured: bool(y.featured, false),
          };
        }, 4),
      }),
      d.pricing,
    ),
    faq: pick(
      "faq",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        body: str(o.body, 200),
        cta: cta(o.cta, d.faq.cta),
        items: arr(o.items, (x) => ({ q: str(obj(x).q, 160), a: str(obj(x).a, 800) }), 20),
      }),
      d.faq,
    ),
    demo: pick(
      "demo",
      (o) => ({
        script: str(o.script, 60),
        title: str(o.title, 120),
        body: str(o.body, 300),
        points: arr(o.points, (p) => str(p, 80), 6),
        formTitle: str(o.formTitle, 80),
        formNote: str(o.formNote, 160),
        button: str(o.button, 40, "Book a Free Demo"),
      }),
      d.demo,
    ),
  };
}
