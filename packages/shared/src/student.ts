/**
 * Student-experience mock data shared by the web dashboard and the mobile app.
 * Mirrors the Q-School UI mockups (Ananya's account). Replace with API data once
 * the NestJS backend lands — the shapes here are what the screens consume.
 */

/** Artwork key — each app maps it to an icon; the gradient below is shared. */
export type ArtKey =
  | "bulb"
  | "laptop"
  | "pencil"
  | "planet"
  | "leader"
  | "palette"
  | "robot"
  | "ai"
  | "heart"
  | "speech"
  | "python"
  | "leaf"
  | "building";

export const ART: Record<ArtKey, { from: string; to: string; accent: string }> = {
  bulb: { from: "#0B2A3A", to: "#1F5F6B", accent: "#FFC845" },
  laptop: { from: "#1E3A5F", to: "#3C7DBF", accent: "#9FD3FF" },
  pencil: { from: "#7A4A1F", to: "#D98A3D", accent: "#FFE1B0" },
  planet: { from: "#0A1633", to: "#2C3F8F", accent: "#FFB45C" },
  leader: { from: "#4A1E0F", to: "#E0782F", accent: "#FFD27A" },
  palette: { from: "#6B2A6E", to: "#E3648C", accent: "#FFE07A" },
  robot: { from: "#123B4E", to: "#2D8FB0", accent: "#C8F3FF" },
  ai: { from: "#1B1F3B", to: "#4B4FA8", accent: "#9CE7FF" },
  heart: { from: "#5E1F3C", to: "#D9668E", accent: "#FFD6E3" },
  speech: { from: "#0F4C45", to: "#2BB39C", accent: "#D7F0EB" },
  python: { from: "#1D3557", to: "#2F7A3E", accent: "#FFE873" },
  leaf: { from: "#164D2C", to: "#4CAF6E", accent: "#D9F7C4" },
  building: { from: "#2F4A6B", to: "#7FB2D9", accent: "#FFE9B8" },
};

export const STUDENT = {
  name: "Student",
  firstName: "Student",
  email: "student@example.com",
  role: "Student",
  initials: "ST",
  progress: 0,
  enrolled: 0,
  completed: 0,
  certificates: 0,
  hours: 0,
  notifications: 0,
};

export type ProgramType = "course" | "workshop" | "webinar" | "live";

export interface Program {
  slug: string;
  title: string;
  type: ProgramType;
  /** Short line under the title, e.g. "Self-paced Course" or "Live Workshop". */
  format: string;
  image?: string;
  lessons?: number;
  hours?: number;
  duration?: string;
  date?: string;
  seatsLeft?: number;
  rating: number;
  ratings: number;
  badge?: string;
  art: ArtKey;
  instructor: string;
  overview: string;
  tags: string[];
  learn: string[];
  curriculum: string[];
}

export const PROGRAMS: Program[] = [
  {
    slug: "quantum-vision",
    title: "Q-Vision",
    type: "course",
    format: "Year 1 Foundation · 48 Classes",
    image: "/images/programs/quantum-vision.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1240,
    badge: "Q-VISION",
    art: "planet",
    instructor: "Dr J Arawindhan & Quantum Mentors",
    overview: "Focus, attention and observation",
    tags: ["Ages 6–14", "Focus & Attention", "Observation", "Year 1 Foundation"],
    learn: [
      "Focus, attention and observation",
      "Heightened sensory perception & concentration stamina",
      "Intuitive thinking & mental agility",
      "Foundational neuro-cognitive training",
    ],
    curriculum: [
      "Sensory Awakening & Focus Drills",
      "Peripheral & Deep Observation",
      "Intuitive Cognition Mechanics",
      "Integration with Daily Studies",
    ],
  },
  {
    slug: "quantum-creation",
    title: "Q-Creation",
    type: "course",
    format: "Year 2 Progression · 48 Classes",
    image: "/images/programs/quantum-creation.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 980,
    badge: "Q-CREATION",
    art: "palette",
    instructor: "Quantum Creative Mentors",
    overview: "Imagination and creative expression",
    tags: ["Ages 6–14", "Imagination", "Creative Expression", "Year 2 Progression"],
    learn: [
      "Imagination and creative expression",
      "Visual and kinesthetic idea synthesis",
      "Creative problem-solving with empathy",
      "Translating creative thought into purposeful projects",
    ],
    curriculum: [
      "Perceptual Expansion Drills",
      "Creative Association Matrix",
      "Divergent Idea Synthesis",
      "Real-World Innovation Challenges",
    ],
  },
  {
    slug: "quantum-way",
    title: "Q-Way",
    type: "course",
    format: "Year 3 Advanced · 48 Classes",
    image: "/images/programs/quantum-way.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.8,
    ratings: 850,
    badge: "Q-WAY",
    art: "ai",
    instructor: "Senior Quantum Faculty",
    overview: "Intuitive comprehension and higher-order thinking",
    tags: ["Ages 6–14", "Intuitive Comprehension", "Higher-Order Thinking", "Year 3 Advanced"],
    learn: [
      "Intuitive comprehension and higher-order thinking",
      "Deeper observation & contextual understanding",
      "Rapid information synthesis & holistic reasoning",
      "Meta-learning: learning how to learn",
    ],
    curriculum: [
      "Advanced Intuitive Processing",
      "Holistic Pattern Architecture",
      "Cognitive Synthesis & Expression",
      "Self-Directed Learner Evolution",
    ],
  },
  {
    slug: "quantum-learning",
    title: "Q-Learning",
    type: "course",
    format: "Core Track (Years 1–3) · 48 Classes",
    image: "/images/programs/quantum-learning.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1420,
    badge: "Q-LEARNING",
    art: "bulb",
    instructor: "Cognitive Memory Specialists",
    overview: "Memory techniques that replace rote learning",
    tags: ["Ages 6–14", "Memory Techniques", "Visual Association", "Long-Term Retention"],
    learn: [
      "Memory techniques that replace rote learning",
      "Mnemonic structures and mental memory palaces",
      "Visual association for formulas, terms & dates",
      "Rapid recall with exam confidence",
    ],
    curriculum: [
      "Memory Architecture & Encoding",
      "Associative Retrieval Networks",
      "Right-Brain Conceptual Anchoring",
      "Academic Revision Blueprints",
    ],
  },
  {
    slug: "quantum-reading",
    title: "Q-Reading",
    type: "course",
    format: "Skill Add-On · 48 Classes",
    image: "/images/programs/quantum-reading.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.8,
    ratings: 1120,
    badge: "Q-READING",
    art: "pencil",
    instructor: "Reading Comprehension Masters",
    overview: "Faster reading with strong comprehension",
    tags: ["Ages 6–14", "Speed Reading", "Strong Comprehension", "Visual Processing"],
    learn: [
      "Faster reading with strong comprehension",
      "Expanding peripheral visual span",
      "Minimizing subvocalization & eye regression",
      "High-speed retention & summary synthesis",
    ],
    curriculum: [
      "Visual Field Calibration",
      "Pacing & Rhythmic Reading",
      "Syntopical Reading & Analysis",
      "Complex Text Decoupling",
    ],
  },
  {
    slug: "quantum-mastery",
    title: "Q-Mastery",
    type: "course",
    format: "Core Track (Years 1–3) · 48 Classes",
    image: "/images/programs/quantum-mastery.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1650,
    badge: "Q-MASTERY",
    art: "leader",
    instructor: "Leadership & Emotional Mentors",
    overview: "Habits, emotional intelligence and leadership",
    tags: ["Ages 6–14", "Habits", "Emotional Intelligence", "Leadership"],
    learn: [
      "Habits, emotional intelligence and leadership",
      "Self-awareness and emotional regulation",
      "Daily routines for health, study & financial responsibility",
      "Public speaking, empathetic listening & teamwork",
    ],
    curriculum: [
      "Emotional Regulation & Resilience",
      "Daily Habit Architecture (Physical & Mental)",
      "Financial Responsibility for Young Minds",
      "Team Dynamics & Purposeful Leadership",
    ],
  },
  {
    slug: "q-maths",
    title: "Q-Maths",
    type: "course",
    format: "Skill Add-On · 48 Classes",
    image: "/images/programs/q-maths.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1380,
    badge: "Q-MATHS",
    art: "robot",
    instructor: "Q-Maths Master Mentors",
    overview: "Visual, pattern-based mathematics",
    tags: ["Ages 6–14", "Visual Math", "Pattern Recognition", "Mental Models"],
    learn: [
      "Visual, pattern-based mathematics",
      "Geometric and algebraic mental models",
      "Stress-free mental arithmetic and calculation",
      "Applying mathematical logic to real-world problems",
    ],
    curriculum: [
      "Visual Foundations of Number Sense",
      "Pattern Discovery & Mental Math",
      "Applied Geometric Reasoning",
      "Mathematical Confidence & Problem Solving",
    ],
  },
  {
    slug: "q-science",
    title: "Q-Science",
    type: "course",
    format: "Grades 6–8 Add-On · 48 Classes",
    image: "/images/programs/q-science.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1290,
    badge: "Q-SCIENCE",
    art: "leaf",
    instructor: "Whole-Brain Science Faculty",
    overview: "Science concepts through stories and visualisation (Grades 6–8)",
    tags: ["Grades 6–8", "Stories & Visualisation", "Physics, Chemistry, Biology"],
    learn: [
      "Science concepts through stories and visualisation (Grades 6–8)",
      "Visualising complex microscopic & cosmic phenomena",
      "Retention of scientific concepts through story mnemonics",
      "Experimental curiosity and scientific reasoning",
    ],
    curriculum: [
      "Matter, Atoms & Energy Dynamics",
      "Living Systems & Cellular Architecture",
      "Forces, Motion & Quantum World",
      "Creative Scientific Inquiry",
    ],
  },
];

export function findProgram(slug: string): Program | undefined {
  const normalized = slug.toLowerCase().replace(/^q-/, "quantum-");
  return PROGRAMS.find((p) => p.slug === slug || p.slug === normalized);
}

export interface Enrollment {
  slug: string;
  title: string;
  done: number;
  total: number;
  art: ArtKey;
  status: "in-progress" | "completed";
}

export const ENROLLMENTS: Enrollment[] = [];

export const pct = (e: { done: number; total: number }) => (e.total > 0 ? Math.round((e.done / e.total) * 100) : 0);

export const NEXT_LIVE = {
  title: "No live sessions right now",
  when: "Check back later",
  art: "leaf" as ArtKey,
};

export interface Workshop {
  id: string;
  title: string;
  days: string;
  mode: "Online" | "Offline";
  city?: string;
  date: string;
  seatsLeft?: number;
  art: ArtKey;
  past?: boolean;
}

export const WORKSHOPS: Workshop[] = [];

export interface WebinarItem {
  id: string;
  title: string;
  by: string;
  date: string;
  duration: string;
  registered: string;
  art: ArtKey;
  recorded?: boolean;
}

export const WEBINAR_LIST: WebinarItem[] = [];

export interface Center {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  phone: string;
  batches: string[];
}

/** The 9 official learning centres with complete addresses and direct contact numbers from the Q-School Brochure. */
export const CENTERS: Center[] = [
  {
    id: "vl",
    name: "Valasaravakkam",
    area: "Valasaravakkam",
    city: "Chennai",
    address: "24/A (Old No. 18A), Lamech Street, Janaki Nagar, Chennai 600087",
    phone: "+91 93459 17288",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "ad",
    name: "Adyar",
    area: "Adyar",
    city: "Chennai",
    address: "E4/9, 8th Cross Street, Indira Nagar, Chennai 600020",
    phone: "+91 93459 17287",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "kn",
    name: "Kasturi Nagar",
    area: "Kasturi Nagar",
    city: "Bengaluru",
    address: "147, 4th Cross Road, Doctors Layout, Bennigana Halli, Bengaluru 560043",
    phone: "+91 93459 16970",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "wf",
    name: "Whitefield",
    area: "Whitefield",
    city: "Bengaluru",
    address: "No. 21, Hagdur Main Road, Whitefield Road, Bengaluru 560066",
    phone: "+91 89258 46858",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "mk",
    name: "Moolakulam",
    area: "Moolakulam",
    city: "Puducherry",
    address: "103/1, Adhikesavan Nagar, Oulgaret Commune, Moolakulam, Puducherry 605010",
    phone: "+91 93459 16910",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "bh",
    name: "Banjara Hills",
    area: "Banjara Hills",
    city: "Hyderabad",
    address: "Door No. 8-2-684/5 & 6, Plot No. 5 & 6, Road No. 12, Hyderabad 500034",
    phone: "+91 90252 24879",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "tn",
    name: "Thillai Nagar",
    area: "Thillai Nagar",
    city: "Trichy",
    address: "Plot No. 25, First Floor, 11th Cross, Thillai Nagar, Trichy 620018",
    phone: "+91 93459 17202",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "au",
    name: "Aundh",
    area: "Aundh",
    city: "Pune",
    address: "S. No. 256/254, Bungalow No. 2, Lane 1, Green Park Society Road, behind Anand Park, Aundh, Pune 411007",
    phone: "+91 99443 67256",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
  {
    id: "sc",
    name: "Saibaba Colony",
    area: "Saibaba Colony",
    city: "Coimbatore",
    address: "9/7A, Bharathi Park, 5th Cross Road, Saibaba Colony, Coimbatore 641011",
    phone: "+91 89259 73133",
    batches: ["Weekend & weekday evening (confirm per centre)"],
  },
];

export interface Certificate {
  id: string;
  title: string;
  completed: string;
}

export const CERTIFICATES: Certificate[] = [];

export type HubKey =
  | "courses"
  | "live"
  | "workshops"
  | "webinars"
  | "offline"
  | "certifications"
  | "assessments"
  | "community";

export const HUB: { key: HubKey; label: string; sub: string; from: string; to: string }[] = [
  { key: "courses", label: "Courses", sub: "Structured Learning", from: "#FF9A3D", to: "#F2652B" },
  { key: "live", label: "Live Classes", sub: "Interactive Sessions", from: "#FF6B6B", to: "#E0313B" },
  { key: "workshops", label: "Workshops", sub: "Hands-on Learning", from: "#B57BFF", to: "#7C3AED" },
  { key: "webinars", label: "Webinars", sub: "Expert Knowledge", from: "#2FD1B5", to: "#0E937E" },
  { key: "offline", label: "Offline Classes", sub: "Physical Centers", from: "#5AA9FF", to: "#2563EB" },
  { key: "certifications", label: "Certifications", sub: "Recognized Credentials", from: "#FFC24A", to: "#F59E0B" },
  { key: "assessments", label: "Assessments", sub: "Track Your Progress", from: "#4FC3F7", to: "#0284C7" },
  { key: "community", label: "Community", sub: "Learn Together", from: "#E879F9", to: "#A21CAF" },
];

export interface ScheduleItem {
  time: string;
  kind: "Live Class" | "Webinar" | "Workshop";
  title: string;
  action: "Join" | "View";
}

export const TODAY = { weekday: "Thu", day: 1, month: "Oct" };

export const SCHEDULE: ScheduleItem[] = [];

export const EVENTS: { id: string; title: string; by: string; meta: string; art: ArtKey }[] = [];

export const POPULAR_CATEGORIES = [
  { label: "Personal Development", count: "0", color: "#E2445C" },
  { label: "STEM & Technology", count: "0", color: "#2563EB" },
  { label: "Arts & Creativity", count: "0", color: "#E2445C" },
  { label: "Language Skills", count: "0", color: "#9333EA" },
  { label: "Mental Wellness", count: "0", color: "#0E937E" },
  { label: "Leadership", count: "0", color: "#F59E0B" },
  { label: "Teaching & Education", count: "0", color: "#2563EB" },
  { label: "Life Skills", count: "0", color: "#0E937E" },
];

export const LIVE_SESSION = {
  title: "No live session",
  host: "—",
  viewers: 0,
  chat: [],
};

export const COMMUNITY_POSTS: { id: string; who: string; when: string; text: string; likes: number; replies: number }[] = [];

export const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));
