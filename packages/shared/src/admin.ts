/**
 * Q-School Console (admin) demo data. Shapes mirror what the NestJS API will return.
 * Money is in INR (rupees).
 */

export const ADMIN_USER = { name: "Bala", role: "Super Admin", email: "admin@qschool.com" };

export type Range = "6M" | "12M";

/** Monthly revenue (₹), Nov 2025 → Oct 2026 (Oct = month to date). */
export const REVENUE_MONTHLY: { month: string; value: number }[] = [
  { month: "Nov", value: 820000 },
  { month: "Dec", value: 760000 },
  { month: "Jan", value: 1040000 },
  { month: "Feb", value: 980000 },
  { month: "Mar", value: 1210000 },
  { month: "Apr", value: 1390000 },
  { month: "May", value: 1180000 },
  { month: "Jun", value: 1460000 },
  { month: "Jul", value: 1620000 },
  { month: "Aug", value: 1580000 },
  { month: "Sep", value: 1840000 },
  { month: "Oct", value: 1910000 },
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
  { key: "revenue", label: "Revenue this month", value: 1910000, format: "inr", delta: 3.8, upIsGood: true, trend: REVENUE_MONTHLY.map((r) => r.value) },
  { key: "admissions", label: "New admissions", value: 342, format: "int", delta: 12.4, upIsGood: true, trend: [180, 172, 210, 205, 238, 260, 244, 281, 297, 290, 305, 342] },
  { key: "students", label: "Active students", value: 8214, format: "int", delta: 4.1, upIsGood: true, trend: [6100, 6240, 6420, 6610, 6790, 6980, 7120, 7330, 7560, 7790, 7890, 8214] },
  { key: "leads", label: "Open leads", value: 1286, format: "int", delta: -6.2, upIsGood: true, trend: [1120, 1180, 1260, 1310, 1390, 1420, 1460, 1440, 1410, 1380, 1371, 1286] },
  { key: "attendance", label: "Live attendance", value: 87, format: "pct", delta: 1.6, upIsGood: true, trend: [82, 81, 83, 84, 83, 85, 84, 86, 85, 86, 86, 87] },
  { key: "dues", label: "Overdue payments", value: 214000, format: "inr", delta: 9.3, upIsGood: false, trend: [150, 162, 158, 171, 166, 180, 175, 188, 192, 186, 196, 214].map((n) => n * 1000) },
];

/** Admissions funnel for the current month. */
export const FUNNEL: { stage: string; value: number }[] = [
  { stage: "Enquiries", value: 2140 },
  { stage: "Contacted", value: 1620 },
  { stage: "Demo attended", value: 812 },
  { stage: "Negotiation", value: 486 },
  { stage: "Admitted", value: 342 },
];

export const LEAD_SOURCES: { source: string; value: number }[] = [
  { source: "Meta Ads", value: 812 },
  { source: "Website", value: 534 },
  { source: "WhatsApp", value: 398 },
  { source: "Referral", value: 214 },
  { source: "Google Ads", value: 126 },
  { source: "Walk-in", value: 56 },
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

export const PIPELINE: PipelineLead[] = [
  { id: "L-1042", name: "Meera Krishnan", phone: "+91 98400 11223", interest: "Design Thinking for Young Minds", source: "Meta Ads", stage: "Enquiry", owner: "Priya K.", value: 4999, createdAt: "2026-10-01T05:10:00Z", lastActivity: "12 min ago", timeline: [{ when: "Today 10:40", what: "Lead created from Meta Lead Ad" }] },
  { id: "L-1041", name: "Rahul Bhat (parent)", phone: "+91 99001 22334", interest: "Coding for Beginners", source: "Website", stage: "Enquiry", owner: "Rohit M.", value: 3999, createdAt: "2026-10-01T03:55:00Z", lastActivity: "1 h ago", slaBreached: true, timeline: [{ when: "Today 09:25", what: "Website enquiry form" }] },
  { id: "L-1039", name: "Fatima Sheikh", phone: "+91 90031 77881", interest: "Robotics Workshop", source: "WhatsApp", stage: "Enquiry", owner: "Sneha D.", value: 2499, createdAt: "2026-09-30T11:00:00Z", lastActivity: "Yesterday", timeline: [{ when: "Yesterday 16:30", what: "WhatsApp opt-in via click-to-chat ad" }] },
  { id: "L-1036", name: "Karthik Rao", phone: "+91 98861 44556", interest: "Leadership Skills for Students", source: "Referral", stage: "Contacted", owner: "Arjun V.", value: 4499, createdAt: "2026-09-29T07:00:00Z", lastActivity: "3 h ago", timeline: [{ when: "29 Sep", what: "Referred by Aarav Patel" }, { when: "Today 08:10", what: "Call — interested, wants weekend batch" }] },
  { id: "L-1033", name: "Divya Menon", phone: "+91 94470 55667", interest: "Creative Writing Workshop", source: "Meta Ads", stage: "Contacted", owner: "Priya K.", value: 2499, createdAt: "2026-09-28T07:00:00Z", lastActivity: "Yesterday", timeline: [{ when: "28 Sep", what: "Lead created from Meta Lead Ad" }, { when: "30 Sep", what: "WhatsApp brochure sent" }] },
  { id: "L-1029", name: "Siddharth Jain", phone: "+91 98200 66778", interest: "Python for Kids", source: "Google Ads", stage: "Demo", owner: "Rohit M.", value: 3999, createdAt: "2026-09-26T07:00:00Z", lastActivity: "Today", timeline: [{ when: "26 Sep", what: "Google Ads lead" }, { when: "27 Sep", what: "Demo booked via Cal.com" }, { when: "Today 07:30", what: "Attended demo — rated 5/5" }] },
  { id: "L-1027", name: "Ananya Iyer", phone: "+91 98450 88990", interest: "Design Thinking for Young Minds", source: "Website", stage: "Demo", owner: "Sneha D.", value: 4999, createdAt: "2026-09-25T07:00:00Z", lastActivity: "2 days ago", slaBreached: true, timeline: [{ when: "25 Sep", what: "Website enquiry" }, { when: "29 Sep", what: "Demo booked for 3 Oct" }] },
  { id: "L-1021", name: "Vikram Singh", phone: "+91 99860 11220", interest: "Coding for Beginners + Robotics", source: "Referral", stage: "Negotiation", owner: "Arjun V.", value: 7499, createdAt: "2026-09-22T07:00:00Z", lastActivity: "5 h ago", timeline: [{ when: "22 Sep", what: "Referral" }, { when: "24 Sep", what: "Demo attended" }, { when: "Today", what: "Asked for sibling discount — 10% offered" }] },
  { id: "L-1018", name: "Neha Gupta", phone: "+91 98111 22990", interest: "Spoken English Mastery", source: "Meta Ads", stage: "Negotiation", owner: "Priya K.", value: 2499, createdAt: "2026-09-20T07:00:00Z", lastActivity: "Yesterday", timeline: [{ when: "20 Sep", what: "Meta Lead Ad" }, { when: "23 Sep", what: "Demo attended" }, { when: "30 Sep", what: "EMI options shared" }] },
  { id: "L-1012", name: "Aditya Kulkarni", phone: "+91 98220 33445", interest: "Design Thinking for Young Minds", source: "WhatsApp", stage: "Admitted", owner: "Rohit M.", value: 4999, createdAt: "2026-09-15T07:00:00Z", lastActivity: "29 Sep", timeline: [{ when: "15 Sep", what: "WhatsApp enquiry" }, { when: "18 Sep", what: "Demo attended" }, { when: "29 Sep", what: "Paid ₹4,999 via Razorpay — INV-2026-0912" }] },
  { id: "L-1009", name: "Pooja Reddy", phone: "+91 90000 44556", interest: "Coding for Beginners", source: "Website", stage: "Admitted", owner: "Sneha D.", value: 3999, createdAt: "2026-09-12T07:00:00Z", lastActivity: "27 Sep", timeline: [{ when: "12 Sep", what: "Website enquiry" }, { when: "27 Sep", what: "Paid ₹3,999 via UPI" }] },
  { id: "L-1004", name: "Imran Khan", phone: "+91 98670 55443", interest: "Robotics Workshop", source: "Google Ads", stage: "Dropped", owner: "Arjun V.", value: 2499, createdAt: "2026-09-08T07:00:00Z", lastActivity: "20 Sep", timeline: [{ when: "8 Sep", what: "Google Ads lead" }, { when: "20 Sep", what: "Dropped — schedule clash" }] },
];

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

export const SESSIONS: Session[] = [
  { id: "s1", day: "Thu 1 Oct", time: "10:00 – 11:30", title: "Design Thinking for Young Minds", kind: "Live Class", host: "Meera Nair", enrolled: 245, capacity: 300, status: "Done", room: "BBB-01" },
  { id: "s2", day: "Thu 1 Oct", time: "15:00 – 16:00", title: "Future of AI in Education", kind: "Webinar", host: "Dr. Rajesh Kumar", enrolled: 1210, capacity: 1500, status: "Live", room: "BBB-Webinar" },
  { id: "s3", day: "Thu 1 Oct", time: "17:00 – 18:00", title: "Art & Creativity for Kids", kind: "Workshop", host: "Kavya Iyer", enrolled: 38, capacity: 40, status: "Upcoming", room: "Chennai · Studio A" },
  { id: "s4", day: "Fri 2 Oct", time: "11:00 – 12:00", title: "Coding for Beginners — Batch B", kind: "Live Class", host: "Rahul Verma", enrolled: 86, capacity: 100, status: "Upcoming", room: "BBB-02" },
  { id: "s5", day: "Fri 2 Oct", time: "16:00 – 18:00", title: "Robotics Lab", kind: "Offline", host: "Sanjay Menon", enrolled: 22, capacity: 24, status: "Upcoming", room: "Bangalore · Lab 1" },
  { id: "s6", day: "Sat 3 Oct", time: "09:30 – 11:00", title: "Leadership Skills — Weekend", kind: "Live Class", host: "Sanjay Menon", enrolled: 132, capacity: 150, status: "Upcoming", room: "BBB-01" },
  { id: "s7", day: "Sat 3 Oct", time: "17:00 – 18:00", title: "Crack JEE 2027: Strategy Session", kind: "Webinar", host: "Dr. A. Sharma", enrolled: 412, capacity: 500, status: "Upcoming", room: "BBB-Webinar" },
  { id: "s8", day: "Sun 4 Oct", time: "10:00 – 13:00", title: "Creative Writing Workshop — Day 1", kind: "Workshop", host: "Kavya Iyer", enrolled: 55, capacity: 100, status: "Upcoming", room: "BBB-03" },
];

/* ───────────── Course performance (keyed by title) ───────────── */

export const COURSE_STATS: Record<string, { status: "Published" | "Draft" | "In review"; completion: number; revenue: number }> = {
  "Quantum Physics Foundations": { status: "Published", completion: 62, revenue: 412000 },
  "JEE Mathematics Complete": { status: "Published", completion: 48, revenue: 1840000 },
  "NEET Biology Crash Course": { status: "Published", completion: 71, revenue: 960000 },
  "Class 10 Science (CBSE)": { status: "Published", completion: 66, revenue: 1210000 },
  "Python Programming for Students": { status: "In review", completion: 74, revenue: 388000 },
  "Spoken English Mastery": { status: "Draft", completion: 58, revenue: 214000 },
};

export function inr(n: number, compact = false): string {
  if (compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
