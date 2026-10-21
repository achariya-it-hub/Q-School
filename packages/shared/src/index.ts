/** Q-School shared package: brand tokens + catalog data shared by web and mobile. */

export const BRAND = {
  name: "Q-School",
  tagline: "Quantum Schooling",
  colors: {
    deep: "#054038",
    teal: "#0E937E",
    teal500: "#2BB39C",
    teal100: "#D7F0EB",
    ink: "#010D0B",
  },
} as const;

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  mode: "live" | "recorded" | "hybrid";
  price: number;
  rating: number;
  learners: number;
  durationHours: number;
  lessons: number;
  description: string;
}

export const COURSES: Course[] = [];

export interface Webinar {
  id: string;
  title: string;
  presenter: string;
  datetime: string;
  seats: number;
  registered: number;
  free: boolean;
}

export const WEBINARS: Webinar[] = [];

export const CATEGORIES = ["All", "School", "Competitive", "Science", "Coding", "Skills"];

export const MODE_LABEL: Record<Course["mode"], string> = {
  live: "🔴 Live",
  recorded: "▶ Recorded",
  hybrid: "◎ Hybrid",
};

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export * from "./student";
export * from "./admin";
export * from "./finance";
export * from "./admission";
export * from "./payroll";
