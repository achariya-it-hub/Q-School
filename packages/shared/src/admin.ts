/**
 * Q-School Console (admin) demo data. Shapes mirror what the NestJS API will return.
 * Money is in INR (rupees).
 */

export const ADMIN_USER = { name: "Bala", role: "Super Admin", email: "admin@qschool.com" };

export type Range = "6M" | "12M";

/** Monthly revenue (₹), Nov 2025 → Oct 2026 (Oct = month to date). */
export const REVENUE_MONTHLY: { month: string; value: number }[] = [
  { month: "Nov", value: 0 },
  { month: "Dec", value: 0 },
  { month: "Jan", value: 0 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
  { month: "Jul", value: 0 },
  { month: "Aug", value: 0 },
  { month: "Sep", value: 0 },
  { month: "Oct", value: 0 },
];

export interface Kpi {
  key: string;
  label: string;
  value: number;
  format: "inr" | "int" | "pct";
  delta: number; // % change vs previous period
  upIsGood: boolean;
  trend: number[]; // 12 points
}

export const KPIS: Kpi[] = [
  { key: "revenue", label: "Revenue this month", value: 0, format: "inr", delta: 0, upIsGood: true, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { key: "admissions", label: "New admissions", value: 0, format: "int", delta: 0, upIsGood: true, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { key: "students", label: "Active students", value: 0, format: "int", delta: 0, upIsGood: true, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { key: "leads", label: "Open leads", value: 0, format: "int", delta: 0, upIsGood: true, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { key: "attendance", label: "Live attendance", value: 0, format: "pct", delta: 0, upIsGood: true, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { key: "dues", label: "Overdue payments", value: 0, format: "inr", delta: 0, upIsGood: false, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

/** Admissions funnel for the current month. */
export const FUNNEL: { stage: string; value: number }[] = [
  { stage: "Enquiries", value: 0 },
  { stage: "Contacted", value: 0 },
  { stage: "Demo attended", value: 0 },
  { stage: "Negotiation", value: 0 },
  { stage: "Admitted", value: 0 },
];

export const LEAD_SOURCES: { source: string; value: number }[] = [
  { source: "Meta Ads", value: 0 },
  { source: "Website", value: 0 },
  { source: "WhatsApp", value: 0 },
  { source: "Referral", value: 0 },
  { source: "Google Ads", value: 0 },
  { source: "Walk-in", value: 0 },
];

/* ───────────── CRM pipeline ───────────── */

export const STAGES = ["Enquiry", "Contacted", "Demo", "Negotiation", "Admitted", "Dropped"] as const;
export type Stage = (typeof STAGES)[number];

export interface PipelineLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest: string;
  source: string;
  stage: Stage;
  owner: string;
  value: number; // expected fee ₹
  createdAt: string; // ISO
  lastActivity: string; // human
  slaBreached?: boolean;
  timeline: { when: string; what: string }[];
}

export const AGENTS = ["Priya K.", "Rohit M.", "Sneha D.", "Arjun V."];

export const PIPELINE: PipelineLead[] = [];

/* ───────────── Live schedule ───────────── */

export interface Session {
  id: string;
  day: string; // e.g. "Thu 1 Oct"
  time: string;
  title: string;
  kind: "Live Class" | "Webinar" | "Workshop" | "Offline";
  host: string;
  enrolled: number;
  capacity: number;
  status: "Live" | "Upcoming" | "Done";
  room: string;
}

export const SESSIONS: Session[] = [];

/* ───────────── Course performance (keyed by title) ───────────── */

export const COURSE_STATS: Record<string, { status: "Published" | "Draft" | "In review"; completion: number; revenue: number }> = {};

export function inr(n: number, compact = false): string {
  if (compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
