/**
 * Student admissions (ERP): a parent fills the public admission form, the student is created as
 * "Pending", and the respective centre flips them to "Active" after confirming payment.
 */

import { QSCHOOL_FEE_SCHEDULE } from "./finance";

export type StudentStatus = "Pending" | "Active";

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank transfer", "Cheque"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

/** Branches a student can be admitted to. `name` is what staff and parents see ("Adyar, Chennai"). */
export const ADMISSION_CENTRES = [
  { id: "mk", area: "Moolakulam", city: "Puducherry" },
  { id: "vl", area: "Valasaravakkam", city: "Chennai" },
  { id: "ad", area: "Adyar", city: "Chennai" },
  { id: "tn", area: "Thillai Nagar", city: "Trichy" },
  { id: "sc", area: "Saibaba Colony", city: "Coimbatore" },
  { id: "wf", area: "Whitefield", city: "Bengaluru" },
  { id: "kn", area: "Kasturi Nagar", city: "Bengaluru" },
  { id: "bh", area: "Banjara Hills", city: "Hyderabad" },
  { id: "au", area: "Aundh", city: "Pune" },
].map((b) => ({ id: b.id, name: `${b.area}, ${b.city}`, full: `${b.area}, ${b.city}`, city: b.city }));

export const centreName = (id: string) => ADMISSION_CENTRES.find((c) => c.id === id)?.name ?? id;

/** Short aliases staff / forms use for a branch (e.g. "pondy" → Moolakulam). */
const CENTRE_ALIASES: Record<string, string> = {
  pondy: "mk",
  pondicherry: "mk",
  puducherry: "mk",
  moolakulam: "mk",
  trichy: "tn",
  tiruchirappalli: "tn",
  coimbatore: "sc",
  hyderabad: "bh",
  pune: "au",
};

/**
 * Resolve any free-text location ("Chennai – Adyar", "Adyar, Chennai", "adyar", "ad", "Pondy")
 * to an ADMISSION_CENTRES id. Returns undefined when it can't be pinned to one branch
 * (e.g. "Chennai" alone matches two branches, "Live Online Cohort" matches none).
 */
export function resolveCentreId(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).toLowerCase().replace(/[–—-]/g, " ").replace(/[,]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return undefined;
  const byId = ADMISSION_CENTRES.find((c) => c.id === s);
  if (byId) return byId.id;
  // Area names are unique, so an area match wins.
  const byArea = ADMISSION_CENTRES.find((c) => s.includes(c.name.split(",")[0].toLowerCase()));
  if (byArea) return byArea.id;
  for (const [alias, id] of Object.entries(CENTRE_ALIASES)) {
    if (s.split(" ").includes(alias)) return id;
  }
  // A city with exactly one branch.
  const byCity = ADMISSION_CENTRES.filter((c) => s.includes(c.city.toLowerCase()));
  return byCity.length === 1 ? byCity[0].id : undefined;
}

/** Centre id for a lead: explicit centreId first, else resolved from its free-text location. */
export const leadCentreId = (l: { centreId?: string; location?: string }) =>
  (l.centreId && ADMISSION_CENTRES.some((c) => c.id === l.centreId) ? l.centreId : undefined) ?? resolveCentreId(l.location);

export interface AdmissionPayment {
  amount: number;
  mode: PaymentMode;
  receiptNo: string;
  note?: string;
  confirmedBy: string;
  confirmedAt: string; // ISO
}

/** A Razorpay payment link sent to the parent. When paid, the admission is confirmed automatically. */
export interface PayLink {
  /** razorpay = created and tracked through the API; grayquest = link made in the GrayQuest dashboard and pasted in (confirmed by hand until their API is connected); easebuzz = our /pay/<id> link that opens Easebuzz checkout. */
  provider: "razorpay" | "grayquest" | "easebuzz";
  id: string; // Razorpay link id (plink_...) or the GrayQuest reference
  url: string;
  amount: number;
  description: string;
  createdBy: string;
  createdAt: string; // ISO
  status: "Created" | "Paid" | "Expired" | "Cancelled";
  paidAt?: string;
  method?: string;
  paymentId?: string;
  /** Easebuzz: transaction ids of each checkout attempt (a new one per try, Easebuzz needs unique txnids). */
  attempts?: string[];
}

export interface StudentRecord {
  id: string; // STU-0001
  studentName: string;
  dob: string; // YYYY-MM-DD
  age?: string | number;
  gender?: string;
  grade?: string;
  school?: string;
  /** File name of the uploaded photo (served by /api/students/photo/<file>). */
  photo: string;
  /** Data URL backup of the photo so serverless deployments never lose photos across cold starts. */
  photoData?: string;
  parentName: string;
  fatherName?: string;
  fatherProfession?: string;
  motherName?: string;
  motherProfession?: string;
  phone: string;
  email?: string;
  address: string;
  /** Optional 12-digit Aadhaar number (digits only). Sensitive: shown only to admin / the student's own centre. */
  aadhaar?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  siblingName?: string;
  siblingAge?: string | number;
  acceptedByName?: string;
  acceptedTerms?: boolean;
  referralType?: string;
  referredBy?: string;
  centreId: string;
  /** Salesperson who shared the form link (?sp=NAME). */
  ref: string;
  status: StudentStatus;
  createdAt: string; // ISO
  /** Linked CRM lead id (e.g. L-...) when enrolled from Leads & Pipeline. */
  leadId?: string;
  /** Agreed total course fee (₹), used to track part payments and remaining balance. */
  totalFee?: number;
  /** Latest payment (kept for backwards compatibility). */
  payment?: AdmissionPayment;
  /** All payments received (full or part / installments). */
  payments?: AdmissionPayment[];
  payLinks?: PayLink[];
}

export type StudentFeeState = "Unpaid" | "Partial" | "Paid";

/** Ordered list of payments received on a student (supports legacy single `payment` records). */
export function studentPayments(s: Pick<StudentRecord, "payment" | "payments">): AdmissionPayment[] {
  if (Array.isArray(s.payments) && s.payments.length > 0) return s.payments;
  return s.payment ? [s.payment] : [];
}

/** Total fee, amount paid so far, remaining balance, and payment status for a student. */
export function studentFeeSummary(s: Pick<StudentRecord, "grade" | "age" | "totalFee" | "payment" | "payments">) {
  const list = studentPayments(s);
  const paid = Math.round(list.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) * 100) / 100;
  const inferred = inferStudentCourseFee(s.grade, s.age).totalFee;
  const rawTotal = Number(s.totalFee) > 0 ? Number(s.totalFee) : paid > 0 ? Math.max(paid, inferred) : inferred;
  const totalFee = Math.round(rawTotal * 100) / 100;
  const balance = Math.max(0, Math.round((totalFee - paid) * 100) / 100);
  const feeState: StudentFeeState = paid <= 0 ? "Unpaid" : balance > 0 ? "Partial" : "Paid";
  return { payments: list, paid, totalFee, balance, feeState };
}

/** Match a course/interest/age to an official Q-School program and default fee. */
export function inferStudentCourseFee(rawCourse?: string | null, age?: string | number | null, explicitValue?: number): { course: string; totalFee: number; monthlyFee: number } {
  const txt = String(rawCourse || "").trim();
  const lower = txt.toLowerCase();
  // Check exact / substring match against QSCHOOL_FEE_SCHEDULE (longest name first so "Divya Tratak 14 yrs" wins over "Divya Tratak").
  const sorted = [...QSCHOOL_FEE_SCHEDULE].sort((a, b) => b.course.length - a.course.length);
  const byName = sorted.find((p) => lower.includes(p.course.toLowerCase()));
  if (byName) {
    return {
      course: byName.course,
      totalFee: explicitValue && explicitValue > 0 ? explicitValue : byName.annualFee,
      monthlyFee: byName.monthlyFee,
    };
  }
  const n = typeof age === "number" ? age : parseInt(String(age || "").replace(/\D/g, ""), 10);
  if (n && !Number.isNaN(n)) {
    const byAge =
      n <= 8 ? QSCHOOL_FEE_SCHEDULE[0] :
      n <= 10 ? QSCHOOL_FEE_SCHEDULE[1] :
      n <= 12 ? QSCHOOL_FEE_SCHEDULE[2] :
      n === 13 ? QSCHOOL_FEE_SCHEDULE[3] :
      QSCHOOL_FEE_SCHEDULE[4];
    if (byAge) {
      const generic = !txt || /^(course|general enquiry|not sure yet|admission.*|d)$/i.test(txt);
      return {
        course: generic ? byAge.course : txt,
        totalFee: explicitValue && explicitValue > 0 ? explicitValue : byAge.annualFee,
        monthlyFee: byAge.monthlyFee,
      };
    }
  }
  const cleanCourse = !txt || /^(course|general enquiry|not sure yet)$/i.test(txt) ? "Divya Yoga" : txt;
  return {
    course: cleanCourse,
    totalFee: explicitValue && explicitValue > 0 ? explicitValue : 63000,
    monthlyFee: 5250,
  };
}
