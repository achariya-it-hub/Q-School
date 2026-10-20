/**
 * Student admissions (ERP): a parent fills the public admission form, the student is created as
 * "Pending", and the respective centre flips them to "Active" after confirming payment.
 */

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
  /** razorpay = created and tracked through the API; grayquest = link made in the GrayQuest dashboard and pasted in (confirmed by hand until their API is connected). */
  provider: "razorpay" | "grayquest";
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
}

export interface StudentRecord {
  id: string; // STU-0001
  studentName: string;
  dob: string; // YYYY-MM-DD
  grade: string;
  school: string;
  /** File name of the uploaded photo (served by /api/students/photo/<file>). */
  photo: string;
  parentName: string;
  phone: string;
  email: string;
  address: string;
  /** Optional 12-digit Aadhaar number (digits only). Sensitive: shown only to admin / the student's own centre. */
  aadhaar?: string;
  centreId: string;
  /** Salesperson who shared the form link (?sp=NAME). */
  ref: string;
  status: StudentStatus;
  createdAt: string; // ISO
  payment?: AdmissionPayment;
  payLinks?: PayLink[];
}
