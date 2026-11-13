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

export interface QSchoolProgram {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  ageRange: string;
  monthlyFee: number;
  annualFee: number;
  feeBasis: string;
  includes: string;
  fee: number;
  description: string;
}

export const QSCHOOL_PROGRAMS: QSchoolProgram[] = [
  {
    id: "divya-yoga",
    name: "Divya Yoga",
    minAge: 6,
    maxAge: 8,
    ageRange: "Age 6 – 8",
    monthlyFee: 5250,
    annualFee: 63000,
    feeBasis: "Monthly / Annual",
    includes: "Q School + Q Learning + annual kit/material fee",
    fee: 63000,
    description: "Foundational yogic postures, pranayama breathing, and body awareness for children aged 6 to 8.",
  },
  {
    id: "divya-mantra",
    name: "Divya Mantra",
    minAge: 9,
    maxAge: 10,
    ageRange: "Age 9 – 10",
    monthlyFee: 5833,
    annualFee: 70000,
    feeBasis: "Monthly / Annual",
    includes: "Q School + Q Learning + annual kit/material fee",
    fee: 70000,
    description: "Sound resonance, sacred chanting, focus, and memory enhancement for children aged 9 to 10.",
  },
  {
    id: "divya-mudra",
    name: "Divya Mudra",
    minAge: 11,
    maxAge: 12,
    ageRange: "Age 11 – 12",
    monthlyFee: 6167,
    annualFee: 74000,
    feeBasis: "Monthly / Annual",
    includes: "Q School + Q Learning + annual kit/material fee",
    fee: 74000,
    description: "Energy gesture science, finger dexterity, reflexology, and mental concentration for ages 11 to 12.",
  },
  {
    id: "divya-tratak",
    name: "Divya Tratak",
    minAge: 13,
    maxAge: 14,
    ageRange: "Age 13 – 14",
    monthlyFee: 6500,
    annualFee: 78000,
    feeBasis: "Monthly / Annual",
    includes: "Q School + Q Learning + annual kit/material fee",
    fee: 78000,
    description: "Gazing and visual focus techniques for laser concentration, willpower, and clarity for ages 13 to 14.",
  },
];

export function getProgramForAge(age: number | string | undefined): QSchoolProgram | null {
  const n = typeof age === "string" ? parseInt(age, 10) : Number(age);
  if (!n || isNaN(n)) return null;
  if (n >= 6 && n <= 8) return QSCHOOL_PROGRAMS[0];
  if (n >= 9 && n <= 10) return QSCHOOL_PROGRAMS[1];
  if (n >= 11 && n <= 12) return QSCHOOL_PROGRAMS[2];
  if (n >= 13 && n <= 14) return QSCHOOL_PROGRAMS[3];
  if (n < 6) return QSCHOOL_PROGRAMS[0];
  return QSCHOOL_PROGRAMS[3];
}

export const COURSES: Course[] = [
  {
    id: "crs-divya-yoga",
    slug: "divya-yoga",
    title: "Divya Yoga (Age 6 – 8)",
    category: "Quantum Schooling",
    mode: "hybrid",
    price: 63000,
    rating: 4.9,
    learners: 0,
    durationHours: 48,
    lessons: 24,
    description: "Foundational yogic postures, pranayama breathing, and body awareness for children aged 6 to 8.",
  },
  {
    id: "crs-divya-mantra",
    slug: "divya-mantra",
    title: "Divya Mantra (Age 9 – 10)",
    category: "Quantum Schooling",
    mode: "hybrid",
    price: 70000,
    rating: 4.9,
    learners: 0,
    durationHours: 48,
    lessons: 24,
    description: "Sound resonance, sacred chanting, focus, and memory enhancement for children aged 9 to 10.",
  },
  {
    id: "crs-divya-mudra",
    slug: "divya-mudra",
    title: "Divya Mudra (Age 11 – 12)",
    category: "Quantum Schooling",
    mode: "hybrid",
    price: 74000,
    rating: 4.8,
    learners: 0,
    durationHours: 48,
    lessons: 24,
    description: "Energy gesture science, finger dexterity, reflexology, and mental concentration for ages 11 to 12.",
  },
  {
    id: "crs-divya-tratak",
    slug: "divya-tratak",
    title: "Divya Tratak (Age 13 – 14)",
    category: "Quantum Schooling",
    mode: "hybrid",
    price: 78000,
    rating: 5.0,
    learners: 0,
    durationHours: 48,
    lessons: 24,
    description: "Gazing and visual focus techniques for laser concentration, willpower, and clarity for ages 13 to 14.",
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
export * from "./progress";
