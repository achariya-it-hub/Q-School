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
    title: "01. Quantum Vision",
    type: "course",
    format: "Foundation for Learning · 48 Classes",
    image: "/images/programs/quantum-vision.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1240,
    badge: "FOUNDATION 01",
    art: "planet",
    instructor: "Dr J Arawindhan & Quantum Mentors",
    overview:
      "Sensory and cognitive activation. Helps children develop better focus, concentration, sensory awareness, intuitive thinking, and builds the brain's capacity for observation.",
    tags: ["Ages 6–14", "Focus & Attention", "Sensory Awareness", "Intuitive Thinking"],
    learn: [
      "Focus & Concentration activation",
      "Heightened sensory perception & observation",
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
    title: "02. Quantum Creation",
    type: "course",
    format: "Expand Imagination · 48 Classes",
    image: "/images/programs/quantum-creation.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 980,
    badge: "EXPAND 02",
    art: "palette",
    instructor: "Quantum Creative Mentors",
    overview:
      "Advanced sensory development through enhanced perception, memory, imagination, intuition, and creative expression. Connect ideas, perceive possibilities differently, and transform intentions into purposeful action.",
    tags: ["Ages 6–14", "Perception", "Creative Expression", "Imagination"],
    learn: [
      "Multi-dimensional perception expansion",
      "Visual and kinesthetic imagination synthesis",
      "Creative problem-solving under uncertainty",
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
    title: "03. Quantum Way",
    type: "course",
    format: "Learn, Apply & Evolve · Advanced",
    image: "/images/programs/quantum-way.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.8,
    ratings: 850,
    badge: "ADVANCED 03",
    art: "ai",
    instructor: "Senior Quantum Faculty",
    overview:
      "Advanced stage of intuitive learning and higher-order perception. Develop deeper observation, intuitive comprehension, rapid information processing, and holistic approaches to knowledge.",
    tags: ["Higher-Order Cognition", "Intuitive Comprehension", "Rapid Processing"],
    learn: [
      "Deeper observation & contextual comprehension",
      "Intuitive information synthesis",
      "Rapid data processing & holistic thinking",
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
    title: "04. Quantum Learning",
    type: "course",
    format: "Learn Better. Remember Longer.",
    image: "/images/programs/quantum-learning.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1420,
    badge: "MEMORY & RETENTION",
    art: "bulb",
    instructor: "Cognitive Memory Specialists",
    overview:
      "Advanced memory techniques and structured learning strategies moving children beyond rote memorisation. Visualisation, association, and right-brain learning methods for long-term retention.",
    tags: ["Memory Techniques", "Visual Association", "Long-Term Retention"],
    learn: [
      "Mnemonic structures and mental memory palaces",
      "Visual association for formulas, terms & dates",
      "Right-brain associative chunking",
      "Rapid recall without stress or exam anxiety",
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
    title: "05. Quantum Reading",
    type: "course",
    format: "Read Faster. Understand Deeper.",
    image: "/images/programs/quantum-reading.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.8,
    ratings: 1120,
    badge: "SPEED & COMPREHENSION",
    art: "pencil",
    instructor: "Reading Comprehension Masters",
    overview:
      "Develops reading speed, comprehension, and visual processing. Children learn techniques to process written information 3x–5x faster while maintaining deep understanding and recall.",
    tags: ["Speed Reading", "Visual Processing", "Comprehension"],
    learn: [
      "Expanding peripheral visual span",
      "Minimizing subvocalization & eye regression",
      "Contextual skimming and rapid absorption",
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
    title: "06. Quantum Mastery",
    type: "course",
    format: "Life Skills for a Brighter Tomorrow",
    image: "/images/programs/quantum-mastery.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1650,
    badge: "LEADERSHIP & EQ",
    art: "leader",
    instructor: "Leadership & Emotional Mentors",
    overview:
      "Emotional intelligence, positive habits, financial intelligence, communication, and leadership. Children develop self-awareness, emotional regulation, confidence, and responsibility.",
    tags: ["Emotional Intelligence", "Positive Habits", "Financial Intelligence", "Leadership"],
    learn: [
      "Self-awareness and emotional regulation",
      "Atomic habit loops for daily discipline",
      "Practical financial literacy & smart decision-making",
      "Public speaking, empathetic listening & collaborative leadership",
    ],
    curriculum: [
      "Emotional Regulation & Resilience",
      "Daily Habit Architecture (Physical & Mental)",
      "Financial Intelligence for Young Minds",
      "Team Dynamics & Global Leadership",
    ],
  },
  {
    slug: "q-maths",
    title: "07. Q-Maths",
    type: "course",
    format: "See, Understand & Think Mathematically",
    image: "/images/programs/q-maths.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1380,
    badge: "MATHEMATICAL LOGIC",
    art: "robot",
    instructor: "Q-Maths Master Mentors",
    overview:
      "Visual and intuitive mathematics programme. Visualise concepts, recognise patterns, and build strong mental models through activity-based learning and flexible calculation.",
    tags: ["Visual Math", "Pattern Recognition", "Mental Models"],
    learn: [
      "Geometric and algebraic mental models",
      "Pattern recognition across numerical sequences",
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
    title: "08. Q-Science",
    type: "course",
    format: "Explore, Understand & Discover",
    image: "/images/programs/q-science.jpg",
    lessons: 48,
    hours: 72,
    rating: 4.9,
    ratings: 1290,
    badge: "WHOLE-BRAIN SCIENCE",
    art: "leaf",
    instructor: "Whole-Brain Science Faculty",
    overview:
      "Right-brain and whole-brain approach to science for Grades 6–8. Introduces advanced concepts from Grades 9–12 through visualisation, stories, songs, and memory techniques.",
    tags: ["Grades 6–8", "Physics, Chemistry, Biology", "Whole-Brain Science"],
    learn: [
      "Visualising complex microscopic & cosmic phenomena",
      "Intuitive understanding of Grades 9–12 science foundations",
      "Retention of scientific laws and formulas through story mnemonics",
      "Experimental curiosity and scientific method",
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
  return PROGRAMS.find((p) => p.slug === slug);
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
    name: "Valasaravakkam Centre",
    area: "Valasaravakkam",
    city: "Chennai",
    address: "No: 18 A, Now No: 24/A, Lamech Street, Janaki Nagar, Valasaravakkam, Chennai, Tamil Nadu - 600087",
    phone: "9345917288",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "ad",
    name: "Adyar Centre",
    area: "Adyar",
    city: "Chennai",
    address: "E4/9, 8th Cross Street, Indira Nagar, Adyar, Chennai, Tamil Nadu - 600020",
    phone: "9345917287",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "kn",
    name: "Kasturi Nagar Centre",
    area: "Kasturi Nagar",
    city: "Bengaluru",
    address: "147, 4th Cross Road, Doctors Layout, Bennigana Halli, Kasturi Nagar, Bengaluru, Karnataka - 560043",
    phone: "9345916970",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "wf",
    name: "Whitefield Centre",
    area: "Whitefield",
    city: "Bengaluru",
    address: "No. 21, Hagdur Main Road, Whitefield Road, Bengaluru, Karnataka - 560066",
    phone: "8925846858",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "mk",
    name: "Moolakulam Centre",
    area: "Moolakulam",
    city: "Puducherry",
    address: "103/1, Adhikesavan Nagar, Oulgaret Commune, Moolakulam, Puducherry - 605010",
    phone: "9345916910",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "bh",
    name: "Banjara Hills Centre",
    area: "Banjara Hills",
    city: "Hyderabad",
    address: "Door No: 8-2-684/5&6, Plot No: 5&6, Road No: 12, Banjara Hills, Hyderabad, Telangana - 500034",
    phone: "9025224879",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "tn",
    name: "Thillai Nagar Centre",
    area: "Thillai Nagar",
    city: "Trichy",
    address: "Plot No: 25, First Floor, 11th Cross, Thillai Nagar, Trichy, Tamil Nadu - 620018",
    phone: "9345917202",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "au",
    name: "Aundh Centre",
    area: "Aundh",
    city: "Pune",
    address: "S. No. 256/254, Bungalow No. 2, Lane 1, Green Park Society Road, Behind Anand Park, Aundh, Pune, Maharashtra - 411007",
    phone: "9944367256",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
  },
  {
    id: "sc",
    name: "Saibaba Colony Centre",
    area: "Saibaba Colony",
    city: "Coimbatore",
    address: "9/7A, Bharathi Park, 5th Cross Road, Saibaba Colony, Coimbatore, Tamil Nadu - 641011",
    phone: "8925973133",
    batches: ["48 Classes / Annum", "Weekend Batches", "Weekday Evening"],
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
