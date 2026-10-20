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

export const COURSES: Course[] = [
  {
    id: "c1",
    slug: "quantum-physics-foundations",
    title: "Quantum Physics Foundations",
    category: "Science",
    mode: "hybrid",
    price: 4999,
    rating: 4.8,
    learners: 1240,
    durationHours: 32,
    lessons: 48,
    description:
      "Master the fundamentals of quantum mechanics — wave functions, uncertainty, and quantization — with live doubt-clearing sessions and recorded lessons.",
  },
  {
    id: "c2",
    slug: "jee-mathematics-complete",
    title: "JEE Mathematics Complete",
    category: "Competitive",
    mode: "live",
    price: 12999,
    rating: 4.9,
    learners: 3120,
    durationHours: 120,
    lessons: 180,
    description:
      "Complete JEE Maths syllabus with daily live classes, problem-solving marathons, weekly tests and personalized performance analytics.",
  },
  {
    id: "c3",
    slug: "neet-biology-crash-course",
    title: "NEET Biology Crash Course",
    category: "Competitive",
    mode: "recorded",
    price: 2999,
    rating: 4.7,
    learners: 5840,
    durationHours: 60,
    lessons: 92,
    description:
      "High-yield NEET Biology revision — NCERT line-by-line, diagrams, mnemonics and 3000+ practice MCQs with detailed solutions.",
  },
  {
    id: "c4",
    slug: "class-10-science",
    title: "Class 10 Science (CBSE)",
    category: "School",
    mode: "hybrid",
    price: 3999,
    rating: 4.8,
    learners: 8210,
    durationHours: 80,
    lessons: 120,
    description:
      "Full CBSE Class 10 Science — Physics, Chemistry, Biology with chapter tests, sample papers and live revision classes before boards.",
  },
  {
    id: "c5",
    slug: "python-for-students",
    title: "Python Programming for Students",
    category: "Coding",
    mode: "recorded",
    price: 1999,
    rating: 4.9,
    learners: 4460,
    durationHours: 24,
    lessons: 56,
    description:
      "Learn Python from zero — logic building, projects and competitive coding basics, designed for school and college students.",
  },
  {
    id: "c6",
    slug: "spoken-english-mastery",
    title: "Spoken English Mastery",
    category: "Skills",
    mode: "live",
    price: 2499,
    rating: 4.6,
    learners: 2380,
    durationHours: 40,
    lessons: 60,
    description:
      "Daily live speaking practice, grammar foundation, vocabulary building and interview preparation with certified trainers.",
  },
];

export interface Webinar {
  id: string;
  title: string;
  presenter: string;
  datetime: string;
  seats: number;
  registered: number;
  free: boolean;
}

export const WEBINARS: Webinar[] = [
  {
    id: "w1",
    title: "Crack JEE 2027: Strategy Session",
    presenter: "Dr. A. Sharma",
    datetime: "2026-10-04T17:00:00+05:30",
    seats: 500,
    registered: 412,
    free: true,
  },
  {
    id: "w2",
    title: "NEET Biology: Human Physiology Deep Dive",
    presenter: "Prof. R. Iyer",
    datetime: "2026-10-06T18:30:00+05:30",
    seats: 300,
    registered: 187,
    free: true,
  },
  {
    id: "w3",
    title: "Parent's Guide to Board Exams",
    presenter: "Ms. K. Menon",
    datetime: "2026-10-08T11:00:00+05:30",
    seats: 200,
    registered: 64,
    free: true,
  },
];

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
