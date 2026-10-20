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
  sections: (Object.keys(SECTION_META) as SectionKey[]).map((key) => ({ key, visible: true })),
  hero: {
    interval: 7,
    slides: [
      {
        ...BLANK_SLIDE,
        id: "brand",
        layout: "collage",
        label: "Live classes for curious kids",
        badge: "NEW",
        kicker: "October batches now open",
        title: "Where curious kids become",
        accent: "confident learners",
        body: "Live classes, workshops, webinars and self-paced courses in design thinking, coding, communication and more. Taught by expert mentors, online or at a centre near you.",
        primary: { label: "Book a free demo class", href: "#demo" },
        secondary: { label: "Explore programs", href: "#programs" },
        image: u("photo-1623076189461-f7706b741c04"),
        imageAlt: "Young learner in a live class on a laptop",
        windowTitle: "Design Thinking for Young Minds",
        windowMentor: "Meera Nair",
        windowMeta: "Session 6 of 12",
        trustLearners: "25,000+ learners",
        trustRating: "4.8 / 5",
      },
      {
        ...BLANK_SLIDE,
        id: "coding",
        label: "Coding for Beginners",
        badge: "NEW BATCH",
        kicker: "Starts 12 October",
        title: "Coding for Beginners:",
        accent: "build your first app",
        body: "From block-based logic to real code in 10 live sessions. Kids build games and small apps they can proudly show family and friends.",
        primary: { label: "Book a free coding demo", href: "#demo" },
        secondary: { label: "See all programs", href: "#programs" },
        image: u("photo-1653566031285-8e198bca09d5", 1920),
        imageAlt: "Young learner coding on a laptop",
        chips: [
          { icon: "users", label: "Grades 4–9" },
          { icon: "live", label: "10 live sessions" },
          { icon: "award", label: "Certificate" },
        ],
        card: {
          show: true,
          heading: "Next batch",
          title: "Coding for Beginners",
          mentor: "Rahul Verma",
          lines: [
            { icon: "calendar", text: "Sat & Sun · 11:00 AM" },
            { icon: "clock", text: "60-minute live classes" },
            { icon: "laptop", text: "Online, laptop or tablet" },
          ],
          seatsLeft: 4,
          seatsTotal: 15,
        },
      },
      {
        ...BLANK_SLIDE,
        id: "workshops",
        label: "Hands-on workshops at our centres",
        badge: "WORKSHOPS",
        kicker: "Robotics Workshop · 5–6 Nov",
        title: "Hands-on workshops",
        accent: "at a centre near you",
        body: "Robotics, art and creative-writing workshops in Chennai, Bengaluru, Hyderabad, Pune and more. Kits and materials included, just bring your curiosity.",
        primary: { label: "Reserve a workshop seat", href: "#live" },
        secondary: { label: "Find a centre", href: "#centres" },
        image: u("photo-1585980243496-fe29a36bd382", 1920),
        imageAlt: "Children building a project together at a workshop",
        chips: [
          { icon: "building", label: "9 branches" },
          { icon: "calendar", label: "Weekend batches" },
          { icon: "tools", label: "Kits included" },
        ],
        card: {
          show: true,
          heading: "Next batch",
          title: "Robotics Workshop, Whitefield",
          mentor: "Arvind Rao",
          lines: [
            { icon: "pin", text: "Whitefield centre" },
            { icon: "calendar", text: "5–6 Nov · 10 AM – 1 PM" },
            { icon: "robot", text: "Build and code a robot car" },
          ],
          seatsLeft: 6,
          seatsTotal: 20,
        },
      },
    ],
  },
  stats: {
    items: [
      { value: "25,000+", label: "Learners taught" },
      { value: "1,200+", label: "Live classes a month" },
      { value: "4.8 / 5", label: "Average parent rating" },
      { value: "9", label: "Offline learning centres" },
    ],
  },
  subjects: { items: POPULAR_CATEGORIES.map((c) => ({ label: c.label, count: c.count, color: c.color })) },
  formats: {
    kicker: "One platform, every way to learn",
    title: "Learn the way your child learns best",
    items: [
      { icon: "live", title: "Live classes", body: "Small interactive batches with whiteboard, polls and doubt-clearing in every session.", href: "/live", color: "#0E937E" },
      { icon: "webinar", title: "Webinars", body: "Free expert talks on AI, space, wellness and study skills, with replays for registrants.", href: "#live", color: "#5B6CF0" },
      { icon: "tools", title: "Workshops", body: "Hands-on robotics, art and writing workshops, online or at a centre near you.", href: "#live", color: "#F29A2E" },
      { icon: "video", title: "Self-paced courses", body: "HD lessons to learn anytime, with offline downloads in the mobile app.", href: "/courses", color: "#E2557A" },
    ],
  },
  programs: { kicker: "Popular programs", title: "Start with a parent favourite", linkLabel: "View all programs", count: 3 },
  how: {
    kicker: "How it works",
    title: "From first class to first certificate",
    steps: [
      { icon: "calendar", title: "Book a free demo", body: "Pick a program and a time. We send the joining link on WhatsApp." },
      { icon: "users", title: "Meet your mentor", body: "A short call to understand your child's goals and suggest the right batch." },
      { icon: "award", title: "Learn and earn certificates", body: "Weekly progress reports for parents and a certificate on every completion." },
    ],
    cta: { label: "Book your free demo", href: "#demo" },
  },
  live: { kicker: "Happening this month", title: "Free webinars and hands-on workshops", linkLabel: "See the full calendar" },
  why: {
    kicker: "Why parents choose Q-School",
    title: "Real teaching, not just videos",
    body: "Every program combines live mentoring with practice, projects and feedback, so children build skills they can actually use.",
    items: [
      { icon: "users", title: "Batches of 15 or fewer", body: "Every child gets seen, heard and asked.", color: "#0E937E" },
      { icon: "shield", title: "Safe, ad-free platform", body: "Verified mentors and recorded sessions.", color: "#5B6CF0" },
      { icon: "chart", title: "Progress parents can see", body: "Attendance, scores and mentor notes each week.", color: "#F29A2E" },
      { icon: "phone", title: "Learn on any device", body: "Web, Android and iOS, with offline downloads.", color: "#E2557A" },
    ],
    appBadge: "Android and iOS",
    appTitle: "Classes in your pocket",
    appBody: "Join live classes, download lessons for offline viewing and get reminders before every session.",
  },
  testimonials: {
    kicker: "Parent stories",
    title: "Small changes parents notice first",
    items: [
      { quote: "My daughter used to dread presentations. After the communication course she volunteered to host her school's annual day.", who: "Parent of a Grade 7 learner", city: "Chennai", rating: 5 },
      { quote: "The live coding batch is the first class he logs into early. The mentor actually reviews every project.", who: "Parent of a Grade 5 learner", city: "Bengaluru", rating: 5 },
      { quote: "The weekly report tells me exactly what was covered and where she needs help. No more guessing.", who: "Parent of a Grade 9 learner", city: "Hyderabad", rating: 5 },
    ],
  },
  centres: {
    kicker: "Offline learning centres",
    title: "Prefer a classroom? Visit us.",
    linkLabel: "Book a centre visit",
    items: CENTERS.map((c) => ({ name: c.name, area: c.area, city: c.city, tags: [...c.batches] })),
  },
  pricing: {
    kicker: "Simple plans",
    title: "Start free. Upgrade when you're ready.",
    note: "Prices include GST. Sibling and annual discounts available at the centres.",
    plans: [
      { name: "Explorer", price: "Free", per: "", blurb: "Try Q-School with no commitment.", features: ["All free webinars, live", "1 demo class of any program", "Community access", "Certificates for webinars"], cta: { label: "Start free", href: "/login" }, featured: false },
      { name: "Plus", price: "₹799", per: "/ month", blurb: "Everything a curious learner needs.", features: ["Unlimited self-paced courses", "2 live batches a month", "Mentor doubt-clearing", "Weekly parent reports", "Offline downloads in the app"], cta: { label: "Book a free demo", href: "#demo" }, featured: true },
      { name: "Centre batch", price: "₹2,499", per: "/ month", blurb: "In-person learning at our centres.", features: ["Weekday or weekend batches", "Hands-on labs and kits", "Everything in Plus", "Parent-mentor meetings"], cta: { label: "Find a centre", href: "#centres" }, featured: false },
    ],
  },
  faq: {
    kicker: "FAQ",
    title: "Questions parents ask",
    body: "Can't find your answer? Our counsellors reply on WhatsApp within an hour.",
    cta: { label: "Talk to a counsellor", href: "#demo" },
    items: [
      { q: "Which age groups do you teach?", a: "Programs are designed for learners from Grade 3 to Grade 12. Each program page lists the recommended grades." },
      { q: "What happens in the free demo class?", a: "Your child joins a real live session for 45 minutes. Afterwards a mentor calls you to share feedback and suggest the right batch. There is no obligation to enrol." },
      { q: "What if my child misses a live class?", a: "Every live class is recorded. The replay appears in the student dashboard and the mobile app within an hour." },
      { q: "Do you offer offline classes?", a: "Yes. We have 9 learning centres across Puducherry, Chennai, Trichy, Coimbatore, Bengaluru, Hyderabad and Pune with weekday and weekend batches." },
      { q: "How do payments and receipts work?", a: "Pay online by UPI, card or net banking, or at the centre. A GST invoice and receipt are emailed to you immediately, and you can pay fees in instalments." },
      { q: "Can I switch or cancel my plan?", a: "You can change programs or cancel a monthly plan at any time from your account. Fees already paid for the current month are not refunded." },
    ],
  },
  demo: {
    script: "Your first class is on us",
    title: "Book a free demo class today",
    body: "Share a few details and a counsellor will WhatsApp you a slot within the hour. No payment needed.",
    points: ["45-minute live session with a mentor", "Personal feedback on your child", "No obligation to enrol"],
    formTitle: "Reserve your free seat",
    formNote: "Takes 20 seconds.",
    button: "Book my free demo",
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
