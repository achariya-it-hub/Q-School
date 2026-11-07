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
    { key: "stats", visible: true },
    { key: "subjects", visible: true },
    { key: "formats", visible: false },
    { key: "programs", visible: true },
    { key: "how", visible: false },
    { key: "live", visible: false },
    { key: "why", visible: false },
    { key: "centres", visible: true },
    { key: "pricing", visible: false },
    { key: "testimonials", visible: true },
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
        label: "Engineering the Neo Sapiens",
        badge: "AGES 6–14 YEARS",
        kicker: "48 Classes Per Annum · Quantum Schooling",
        title: "Engineering the Neo Sapiens:",
        accent: "Shaping Future Leaders",
        body: "Awakening Genius. Activating Quantum Intelligence. Shaping Future-Ready Human Beings. We systematically develop the essential human capacities that remain vital in an AI-driven world: attention, imagination, judgement, emotional awareness, self-belief, and original thought.",
        primary: { label: "Book a Free Demo Class", href: "#demo" },
        secondary: { label: "Explore 8 Q-Programs", href: "#programs" },
        image: "/images/bmit-hero.png",
        imageAlt: "Young learner engaging in quantum cognitive development",
        windowTitle: "The Q 5D™ XYZTP Learning Journey",
        windowMentor: "Dr J Arawindhan & Quantum Mentors",
        windowMeta: "48 Classes / Annum · 9 Centres",
        trustLearners: "25,000+ Learners",
        trustRating: "4.9 / 5",
      },
      {
        ...BLANK_SLIDE,
        id: "coding",
        label: "AI vs. Human Intelligence",
        badge: "AI VS. HI",
        kicker: "The Future Needs More Than Artificial Intelligence",
        title: "AI Can Process.",
        accent: "Human Intelligence Transforms.",
        body: "AI may change the world; human intelligence will shape its future. While machines automate and process data, Q-School empowers children to think critically, create with empathy, build emotional strength, and lead with purpose.",
        primary: { label: "Read the Q-School Story", href: "#story" },
        secondary: { label: "Founder's Vision", href: "#vision" },
        image: "/images/side-brain.png",
        imageAlt: "Child developing high-order reasoning and cognitive skills",
        chips: [
          { icon: "shield", label: "Critical Thinking" },
          { icon: "heart", label: "Emotional Resilience" },
          { icon: "award", label: "Global Leadership" },
        ],
        card: {
          show: true,
          heading: "The 3 Pillars",
          title: "The Neo Sapiens Advantage",
          mentor: "Q-School Pedagogy",
          lines: [
            { icon: "award", text: "National-Level Academic Excellence" },
            { icon: "globe", text: "Become a Global Leader" },
            { icon: "brain", text: "A Sharper Brain in the Age of AI" },
          ],
          seatsLeft: 5,
          seatsTotal: 15,
        },
      },
      {
        ...BLANK_SLIDE,
        id: "workshops",
        label: "9 Centres Across India",
        badge: "OFFLINE & ONLINE",
        kicker: "Chennai · Bengaluru · Hyderabad · Pune · Trichy · Coimbatore · Pondy",
        title: "Holistic Learning for a",
        accent: "Brighter Tomorrow",
        body: "48 classes. One continuous developmental journey. Structured progression across Year 1 Foundation, Year 2 Progression, and Year 3 Advanced Development at our 9 physical learning centres and live online interactive cohorts.",
        primary: { label: "Find Your Nearest Centre", href: "#centres" },
        secondary: { label: "Speak to a Counsellor", href: "#demo" },
        image: "/images/workshop.png",
        imageAlt: "Parent and child engaging in interactive Quantum Schooling learning session",
        chips: [
          { icon: "building", label: "9 Dedicated Centres" },
          { icon: "calendar", label: "48 Classes / Annum" },
          { icon: "tools", label: "Activity-Based Learning" },
        ],
        card: {
          show: true,
          heading: "Now Enrolling",
          title: "Weekend & Weekday Batches",
          mentor: "Certified Quantum Mentors",
          lines: [
            { icon: "pin", text: "9 Centres in 7 Cities" },
            { icon: "calendar", text: "Continuous 6-Stage Journey" },
            { icon: "users", text: "Small batches of 15 max" },
          ],
          seatsLeft: 6,
          seatsTotal: 15,
        },
      },
    ],
  },
  stats: {
    items: [
      { value: "48", label: "Classes Per Annum Continuous Journey" },
      { value: "6–14", label: "Ages for Peak Cognitive Transformation" },
      { value: "9", label: "Physical Centres in Chennai, BLR, HYD, Pune..." },
      { value: "10", label: "Core Human Abilities Developed Beyond Textbooks" },
    ],
  },
  subjects: {
    items: [
      { label: "FOCUS", count: "01", color: "#0E937E" },
      { label: "LEARN", count: "02", color: "#5B6CF0" },
      { label: "THINK", count: "03", color: "#F29A2E" },
      { label: "CREATE", count: "04", color: "#E2557A" },
      { label: "COMMUNICATE", count: "05", color: "#2BD6B4" },
      { label: "ADAPT", count: "06", color: "#054038" },
      { label: "SOLVE", count: "07", color: "#3C7DBF" },
      { label: "LEAD", count: "08", color: "#4CAF6E" },
      { label: "ENGINEERING THE NEO SAPIENS", count: "6–14Y", color: "#FFC845" },
      { label: "Q 5D™ XYZTP FRAMEWORK", count: "5D", color: "#0E937E" },
      { label: "AI VS. HI", count: "TRANSFORM", color: "#2BD6B4" },
      { label: "48 CLASSES PER ANNUM", count: "CONTINUOUS", color: "#E2557A" },
    ],
  },
  formats: {
    kicker: "The Q-School Learning Model",
    title: "School teaches the curriculum. Q-School develops the learner.",
    items: [
      {
        icon: "brain",
        title: "Cognitive Activation",
        body: "Focus, attention, sensory perception, and intuitive thinking drills that build brain plasticity and capacity.",
        href: "#programs",
        color: "#0E937E",
      },
      {
        icon: "bulb",
        title: "Memory & Speed Reading",
        body: "Visualisation, association, and right-brain techniques to read 3x faster, remember longer, and eliminate rote cramming.",
        href: "#programs",
        color: "#5B6CF0",
      },
      {
        icon: "leader",
        title: "Mastery & Life Skills",
        body: "Emotional regulation, daily habit systems, financial intelligence, and empathetic communication for global leadership.",
        href: "#programs",
        color: "#F29A2E",
      },
      {
        icon: "tools",
        title: "Visual Math & Science",
        body: "Q-Maths and whole-brain Q-Science that make complex Grade 9–12 concepts intuitive, visual, and unforgettable for Grades 6–8.",
        href: "#programs",
        color: "#E2557A",
      },
    ],
  },
  programs: {
    kicker: "8 Q-School Programs",
    title: "A Holistic Ecosystem for Every Dimension of Growth",
    linkLabel: "Explore all 8 programs",
    count: 8,
  },
  how: {
    kicker: "The 48-Class Journey",
    title: "48 Classes. One Continuous Developmental Journey.",
    steps: [
      { icon: "sparkle", title: "01. Engage & 02. Explore", body: "Capture attention, spark natural curiosity, and introduce concepts through interactive discovery challenges." },
      { icon: "tools", title: "03. Practise & 04. Apply", body: "Strengthen neural pathways through deliberate practice and apply learning into real-world projects and meaningful tasks." },
      { icon: "award", title: "05. Reflect & 06. Reinforce", body: "Consolidate deep understanding and carry positive learning habits into daily life, school exams, and personal growth." },
    ],
    cta: { label: "Book a Free 45-Min Demo Class", href: "#demo" },
  },
  live: { kicker: "Learning Beyond the Classroom", title: "Centre Learning → Guided Practice → Home Reinforcement", linkLabel: "See batch timings" },
  why: {
    kicker: "Why Q-School Matters Today",
    title: "Nurturing the child beyond textbooks and technology",
    body: "Modern children face screen-time struggles, attention fragmentation, study pressure, and an uncertain AI-driven job market. Q-School empowers children to discover their innate genius, strengthen cognitive stamina, and lead with confidence.",
    items: [
      { icon: "users", title: "Small Batches of 15 Max", body: "Individual attention so every child is seen, heard, coached, and nurtured.", color: "#0E937E" },
      { icon: "shield", title: "Q 5D™ XYZTP Architecture", body: "Progressive dimension flow: Conscious → Deep Learning → Flow → Time → Peak Possibility.", color: "#5B6CF0" },
      { icon: "chart", title: "Weekly Progress Tracker", body: "Clear feedback for parents tracking focus, memory recall, habits, and emotional resilience.", color: "#F29A2E" },
      { icon: "building", title: "9 Modern Centres", body: "Dedicated experiential learning labs in Chennai, BLR, Hyderabad, Pune, Trichy, Coimbatore & Pondy.", color: "#E2557A" },
    ],
    appBadge: "Q-Master AI & Portal",
    appTitle: "Continuous Learner Support",
    appBody: "Access Q-Master AI tutor for instant academic doubt-solving, guided habit trackers, and progress reports in one owned ecosystem.",
  },
  testimonials: {
    kicker: "Parent Experiences",
    title: "What parents notice when the learner behind the learning develops",
    items: [
      { quote: "Before Q-School, my son struggled with focus and spent hours cramming for tests. Within 3 months of Quantum Learning and Vision, his reading speed tripled and his exam confidence skyrocketed.", who: "Parent of Grade 6 Learner", city: "Chennai (Adyar)", rating: 5 },
      { quote: "The difference between traditional tuition and Q-School is night and day. Tuition repeats the school textbook; Q-School actually trained my daughter how to think, visualize math, and regulate her emotions.", who: "Parent of Grade 5 Learner", city: "Bengaluru (Whitefield)", rating: 5 },
      { quote: "Q-Mastery helped my daughter step up as a school prefect. She speaks with clarity, manages her study schedule independently, and has developed genuine self-belief.", who: "Parent of Grade 8 Learner", city: "Hyderabad (Banjara Hills)", rating: 5 },
    ],
  },
  centres: {
    kicker: "Q-School Across 9 Centres",
    title: "Visit Our Dedicated Experiential Learning Centres",
    linkLabel: "Book a Centre Visit",
    items: CENTERS.map((c) => ({
      name: c.name,
      area: c.area,
      city: c.city,
      tags: [c.phone, ...c.batches],
    })),
  },
  pricing: {
    kicker: "The Q-School Pathway",
    title: "A Structured 3-Year Progression for Every Child",
    note: "All programmes include 48 classes per annum, learning kits, diagnostic evaluations, and parent progress reviews.",
    plans: [
      {
        name: "Year 01 - Foundation",
        price: "Foundation",
        per: "· 48 Classes",
        blurb: "Awakening genius & core cognitive activation.",
        features: [
          "Q-Vision: Focus, concentration & sensory perception",
          "Q-Learning: Memory palaces & visual association",
          "Q-Mastery: Emotional resilience & daily habits",
          "Comprehensive baseline cognitive assessment",
          "Centre learning + guided practice reinforcement",
        ],
        cta: { label: "Book Foundation Demo", href: "#demo" },
        featured: false,
      },
      {
        name: "Year 02 - Progression",
        price: "Progression",
        per: "· 48 Classes",
        blurb: "Expanding imagination & intuitive mastery.",
        features: [
          "Q-Creation: Imagination & creative synthesis",
          "Q-Learning: Advanced retention & conceptual chunking",
          "Q-Mastery: Communication & financial intelligence",
          "Q-Maths & Q-Science foundation integration",
          "Bi-weekly mentor doubt-clearing sessions",
        ],
        cta: { label: "Book a Free Demo", href: "#demo" },
        featured: true,
      },
      {
        name: "Year 03 - Advanced",
        price: "Advanced",
        per: "· 48 Classes",
        blurb: "Higher-order cognition & global leadership.",
        features: [
          "Q-Way: Intuitive comprehension & holistic thinking",
          "Q-Learning: Rapid data processing & meta-learning",
          "Q-Mastery: Collaborative leadership & global ethics",
          "Neo Sapiens capstone project presentation",
          "Official Q-School Neo Sapiens graduation credential",
        ],
        cta: { label: "Speak to a Counsellor", href: "#demo" },
        featured: false,
      },
    ],
  },
  faq: {
    kicker: "Frequently Asked Questions",
    title: "Everything parents want to know about Quantum Schooling",
    body: "Have specific questions about your child? Our academic counsellors are available to assist you at +91 99444 54840 or info@theqschool.com.",
    cta: { label: "Talk to a Counsellor", href: "#demo" },
    items: [
      {
        q: "What is Q-School (Quantum Schooling) and how does it differ from regular schooling?",
        a: "School teaches the curriculum; Q-School develops the learner.\n\nWhile traditional schooling focuses on what children learn (syllabus, memorisation, and test scores), Q-School systematically develops HOW children learn, think, adapt, and create. We deliberately cultivate the foundational human capacities that textbooks overlook: attention stamina, imaginative perception, logical reasoning, emotional strength, and original thought.",
      },
      {
        q: "Who is a 'Neo Sapiens'?",
        a: "A Neo Sapiens is a future-ready learner equipped with the skills, mindset, and values to think, adapt, create, and lead in a rapidly evolving world.\n\nThe 3 Pillars of Neo Sapiens:\n1. National-Level Academic Excellence: Building sharper learning capabilities and academic confidence.\n2. Become a Global Leader: Developing the mindset, emotional resilience, and ethics to lead on a global stage.\n3. A Sharper Brain in the Age of AI: Strengthening critical thinking and creative synthesis where machines cannot compete.",
      },
      {
        q: "What is the 48-Class Journey?",
        a: "Q-School runs 48 classes per annum in a structured continuous developmental cycle:\n\n• 01. Engage: Capture attention and ignite genuine interest.\n• 02. Explore: Introduce concepts through interactive discovery challenges.\n• 03. Practise: Deepen understanding with cognitive drills.\n• 04. Apply: Use learning in meaningful real-world tasks.\n• 05. Reflect: Synthesize what was learned.\n• 06. Reinforce: Carry learning into everyday life.\n\nLearning continues beyond the classroom through Centre Learning → Guided Practice → Home Reinforcement.",
      },
      {
        q: "What is the Q 5D™ XYZTP Framework?",
        a: "Our proprietary 5-dimensional framework orchestrates the child's progressive learning journey:\n\n• 1st Dimension (X: Conscious): Focus, attention, observation & conscious engagement.\n• 2nd Dimension (Y: Deep Learning): Practice, repetition, reinforcement & skill internalisation.\n• 3rd Dimension (Z: Flow & Application): Applying and expressing learning naturally and confidently.\n• 4th Dimension (T: Time): Developing speed, fluency, organisation, and efficiency.\n• 5th Dimension (P: Peak Possibility): Potential in action through creative confidence and leadership.\n\nProgressive flow: UNDERSTAND → PRACTISE → INTERNALISE → APPLY → EXPRESS.",
      },
      {
        q: "Which age group is Q-School designed for?",
        a: "Q-School is specifically engineered for children aged 6 to 14 years—the crucial neurological window for neuroplasticity, cognitive habit formation, and emotional development.",
      },
      {
        q: "Where are the 9 Q-School Learning Centres located?",
        a: "We have 9 physical learning centres:\n• Chennai: Valasaravakkam (Ph: 9345917288) & Adyar (Ph: 9345917287)\n• Bengaluru: Kasturi Nagar (Ph: 9345916970) & Whitefield (Ph: 8925846858)\n• Puducherry: Moolakulam (Ph: 9345916910)\n• Hyderabad: Banjara Hills (Ph: 9025224879)\n• Trichy: Thillai Nagar (Ph: 9345917202)\n• Pune: Aundh (Ph: 9944367256)\n• Coimbatore: Saibaba Colony (Ph: 8925973133)\n\nWe also offer live online cohorts for families across India and worldwide.",
      },
    ],
  },
  demo: {
    script: "Marks show what a child knows. Abilities influence what they can do.",
    title: "Begin Your Child's Q-Journey Today",
    body: "Speak to our Q-School counsellor or schedule a free 45-minute demo session at any of our 9 centres or online. Experience the Quantum Schooling difference.",
    points: [
      "For Children Aged 6–14 Years",
      "48 Classes Per Annum structured developmental journey",
      "Cognitive stamina & learning ability evaluation",
      "No obligation to enrol",
    ],
    formTitle: "Book a Free 45-Min Demo Session",
    formNote: "Takes 20 seconds · Our counsellor will call you shortly.",
    button: "Begin Your Child's Q-Journey",
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
        body: str(o.body, 300),
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
          return { name: str(y.name, 60), area: str(y.area, 40), city: str(y.city, 40), tags: arr(y.tags, (t) => str(t, 30), 6) };
        }, 12),
      }),
      d.centres,
    ),
    pricing: pick(
      "pricing",
      (o) => ({
        kicker: str(o.kicker, 80),
        title: str(o.title, 120),
        note: str(o.note, 200),
        plans: arr(o.plans, (x) => {
          const y = obj(x);
          return {
            name: str(y.name, 40),
            price: str(y.price, 20),
            per: str(y.per, 20),
            blurb: str(y.blurb, 120),
            features: arr(y.features, (f) => str(f, 80), 10),
            cta: cta(y.cta, { label: "Book a free demo", href: "#demo" }),
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
        formTitle: str(o.formTitle, 60),
        formNote: str(o.formNote, 60),
        button: str(o.button, 40, "Book my free demo"),
      }),
      d.demo,
    ),
  };
}
