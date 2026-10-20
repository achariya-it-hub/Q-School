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
  name: "Ananya Sharma",
  firstName: "Ananya",
  email: "ananya@example.com",
  role: "Student",
  initials: "AS",
  progress: 68,
  enrolled: 12,
  completed: 8,
  certificates: 4,
  hours: 32,
  notifications: 3,
};

export type ProgramType = "course" | "workshop" | "webinar" | "live";

export interface Program {
  slug: string;
  title: string;
  type: ProgramType;
  /** Short line under the title, e.g. "Self-paced Course" or "Live Workshop". */
  format: string;
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
    slug: "design-thinking-for-young-minds",
    title: "Design Thinking for Young Minds",
    type: "course",
    format: "Self-paced Course",
    lessons: 20,
    hours: 6,
    rating: 4.8,
    ratings: 1200,
    badge: "Bestseller",
    art: "bulb",
    instructor: "Meera Nair",
    overview:
      "Learn how to solve real world problems using design thinking. This course helps you develop creativity, empathy and innovation skills.",
    tags: ["Creativity", "Problem Solving", "Innovation"],
    learn: [
      "Understand design thinking process",
      "Work on real world projects",
      "Collaborate with peers",
      "Create your own solutions",
    ],
    curriculum: ["Empathise", "Define the problem", "Ideate", "Prototype", "Test & iterate"],
  },
  {
    slug: "coding-for-beginners",
    title: "Coding for Beginners",
    type: "course",
    format: "Self-paced Course",
    lessons: 30,
    hours: 8,
    rating: 4.7,
    ratings: 856,
    art: "laptop",
    instructor: "Rahul Verma",
    overview:
      "Start coding from scratch with block-based logic, then move to real code. Build small games and apps along the way.",
    tags: ["Logic", "STEM", "Projects"],
    learn: ["Think like a programmer", "Loops, conditions and functions", "Build three mini games", "Debug your own code"],
    curriculum: ["Getting started", "Logic & loops", "Functions", "Mini games", "Final project"],
  },
  {
    slug: "creative-writing-workshop",
    title: "Creative Writing Workshop",
    type: "workshop",
    format: "Live Workshop",
    duration: "2 Days",
    date: "15 Oct 2026",
    seatsLeft: 45,
    rating: 4.9,
    ratings: 420,
    art: "pencil",
    instructor: "Kavya Iyer",
    overview: "Two days of guided story-writing, poetry and feedback circles with a published author.",
    tags: ["Writing", "Expression", "Storytelling"],
    learn: ["Plan a short story", "Write vivid descriptions", "Give and take feedback", "Publish to the class anthology"],
    curriculum: ["Ideas & prompts", "Characters", "Dialogue", "Editing", "Showcase"],
  },
  {
    slug: "science-explorers-webinar",
    title: "Science Explorers Webinar",
    type: "webinar",
    format: "Live Webinar",
    duration: "1 Hour",
    date: "22 Oct 2026",
    rating: 4.8,
    ratings: 610,
    art: "planet",
    instructor: "Dr. Arjun Rao",
    overview: "A live tour of the solar system with experiments you can try at home.",
    tags: ["Science", "Space", "Curiosity"],
    learn: ["How planets form", "Simple home experiments", "Careers in space science", "Live Q&A"],
    curriculum: ["Our solar system", "Experiments", "Q&A"],
  },
  {
    slug: "leadership-skills-for-students",
    title: "Leadership Skills for Students",
    type: "course",
    format: "Self-paced Course",
    lessons: 25,
    hours: 7,
    rating: 4.7,
    ratings: 934,
    art: "leader",
    instructor: "Sanjay Menon",
    overview: "Build confidence, teamwork and decision-making through real school scenarios.",
    tags: ["Leadership", "Teamwork", "Confidence"],
    learn: ["Lead a team project", "Communicate with confidence", "Make decisions under pressure", "Resolve conflicts"],
    curriculum: ["Know yourself", "Communication", "Teams", "Decisions", "Capstone"],
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

export const ENROLLMENTS: Enrollment[] = [
  { slug: "effective-communication", title: "Effective Communication for Students", done: 16, total: 20, art: "speech", status: "in-progress" },
  { slug: "python-for-kids", title: "Python for Kids", done: 9, total: 30, art: "python", status: "in-progress" },
  { slug: "design-thinking-for-young-minds", title: "Design Thinking for Young Minds", done: 12, total: 20, art: "bulb", status: "in-progress" },
  { slug: "coding-for-beginners", title: "Coding for Beginners", done: 9, total: 30, art: "laptop", status: "in-progress" },
  { slug: "creative-writing-workshop", title: "Creative Writing Workshop", done: 8, total: 8, art: "pencil", status: "completed" },
];

export const pct = (e: { done: number; total: number }) => Math.round((e.done / e.total) * 100);

export const NEXT_LIVE = {
  title: "Science for a Sustainable Future",
  when: "Today, 5:00 PM - 6:00 PM",
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

export const WORKSHOPS: Workshop[] = [
  { id: "ws1", title: "Creative Writing Workshop", days: "2 Days", mode: "Online", date: "15 Oct - 16 Oct 2026", seatsLeft: 45, art: "pencil" },
  { id: "ws2", title: "Art & Creativity Workshop", days: "1 Day", mode: "Offline", city: "Chennai", date: "22 Oct 2026", art: "palette" },
  { id: "ws3", title: "Robotics Workshop", days: "2 Days", mode: "Offline", city: "Bangalore", date: "5 Nov - 6 Nov 2026", art: "robot" },
  { id: "ws4", title: "Young Inventors Lab", days: "1 Day", mode: "Online", date: "12 Sep 2026", art: "bulb", past: true },
];

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

export const WEBINAR_LIST: WebinarItem[] = [
  { id: "wb1", title: "Future of AI in Education", by: "Dr. Rajesh Kumar", date: "12 Oct 2026", duration: "1 Hour", registered: "1.2K", art: "ai" },
  { id: "wb2", title: "Mental Wellness for Students", by: "Priya Sharma", date: "25 Oct 2026", duration: "1 Hour", registered: "856", art: "heart" },
  { id: "wb3", title: "Space Exploration & Beyond", by: "ISRO Expert", date: "28 Oct 2026", duration: "1 Hour", registered: "1.5K", art: "planet" },
  { id: "wb4", title: "Study Smarter, Not Harder", by: "Anil Kapoor", date: "18 Sep 2026", duration: "45 Min", registered: "2.1K", art: "bulb", recorded: true },
];

export interface Center {
  id: string;
  name: string;
  area: string;
  city: string;
  batches: string[];
}

/** The 9 branches (same as the admission form's centres in admission.ts). */
export const CENTERS: Center[] = (
  [
    ["mk", "Moolakulam", "Puducherry"],
    ["vl", "Valasaravakkam", "Chennai"],
    ["ad", "Adyar", "Chennai"],
    ["tn", "Thillai Nagar", "Trichy"],
    ["sc", "Saibaba Colony", "Coimbatore"],
    ["wf", "Whitefield", "Bengaluru"],
    ["kn", "Kasturi Nagar", "Bengaluru"],
    ["bh", "Banjara Hills", "Hyderabad"],
    ["au", "Aundh", "Pune"],
  ] as const
).map(([id, area, city]) => ({ id, name: `${area} Learning Center`, area, city, batches: ["Regular Classes", "Weekend Batches"] }));

export interface Certificate {
  id: string;
  title: string;
  completed: string;
}

export const CERTIFICATES: Certificate[] = [
  { id: "ct1", title: "Design Thinking for Young Minds", completed: "12 Sep 2026" },
  { id: "ct2", title: "Creative Writing Workshop", completed: "20 Aug 2026" },
  { id: "ct3", title: "Effective Communication", completed: "15 Jul 2026" },
  { id: "ct4", title: "Public Speaking Basics", completed: "02 Jun 2026" },
];

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

export const SCHEDULE: ScheduleItem[] = [
  { time: "10:00 AM - 11:30 AM", kind: "Live Class", title: "Design Thinking for Young Minds", action: "Join" },
  { time: "03:00 PM - 04:00 PM", kind: "Webinar", title: "Future of AI in Education", action: "Join" },
  { time: "05:00 PM - 06:00 PM", kind: "Workshop", title: "Art & Creativity for Kids", action: "View" },
];

export const EVENTS = [
  { id: "ev1", title: "Mental Wellness for Students", by: "Priya Sharma", meta: "25 Oct 2026 • 1 Hour", art: "heart" as ArtKey },
  { id: "ev2", title: "Robotics & Innovation Workshop", by: "Q-School Team", meta: "5 Nov 2026 • Offline", art: "robot" as ArtKey },
  { id: "ev3", title: "Space Exploration & Beyond", by: "ISRO Expert", meta: "12 Nov 2026 • Webinar", art: "planet" as ArtKey },
];

export const POPULAR_CATEGORIES = [
  { label: "Personal Development", count: "120+", color: "#E2445C" },
  { label: "STEM & Technology", count: "85+", color: "#2563EB" },
  { label: "Arts & Creativity", count: "60+", color: "#E2445C" },
  { label: "Language Skills", count: "70+", color: "#9333EA" },
  { label: "Mental Wellness", count: "45+", color: "#0E937E" },
  { label: "Leadership", count: "50+", color: "#F59E0B" },
  { label: "Teaching & Education", count: "90+", color: "#2563EB" },
  { label: "Life Skills", count: "65+", color: "#0E937E" },
];

export const LIVE_SESSION = {
  title: "Design Thinking for Young Minds",
  host: "Meera Nair",
  viewers: 245,
  chat: [
    { who: "Riya", time: "10:02 AM", text: "This is very useful!" },
    { who: "Aarav", time: "10:03 AM", text: "Can you explain this again?" },
    { who: "Instructor", time: "10:03 AM", text: "Sure, let me explain with an example." },
    { who: "Kavya", time: "10:04 AM", text: "Great session! 👍" },
    { who: "Vikram", time: "10:04 AM", text: "Will the recording be available?" },
  ],
};

export const COMMUNITY_POSTS = [
  { id: "p1", who: "Riya Patel", when: "2h ago", text: "Just finished my first design-thinking prototype — a reusable lunchbox planner! 🎉", likes: 48, replies: 12 },
  { id: "p2", who: "Aarav Singh", when: "5h ago", text: "Anyone up for a study group on Python loops this weekend?", likes: 21, replies: 9 },
  { id: "p3", who: "Kavya Iyer", when: "1d ago", text: "Sharing my notes from the Science Explorers webinar 🚀", likes: 76, replies: 18 },
];

export const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));
