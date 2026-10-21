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

export const PROGRAMS: Program[] = [];

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
