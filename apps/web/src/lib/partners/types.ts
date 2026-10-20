export type PartnerCategory =
  | "Marketing Team"
  | "Affiliate"
  | "School Partner"
  | "Campus Ambassador"
  | "Education Consultant"
  | "Agent";

export type CommissionType = "percentage" | "flat";
export type PartnerStatus = "active" | "inactive" | "pending";
export type PayoutStatus = "Pending" | "Approved" | "Paid";

export interface PartnerBankDetails {
  upiId?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface PartnerStats {
  totalClicks: number;
  totalLeads: number;
  totalAdmissions: number;
  totalRevenue: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
}

export interface Partner {
  id: string; // PRT-001
  code: string; // Unique, e.g. MKT-BALA, ACH-PUDU
  name: string;
  email: string;
  phone: string;
  organization?: string;
  category: PartnerCategory;
  commissionType: CommissionType;
  commissionValue: number; // e.g. 10 (%) or 2000 (flat ₹)
  centreId: string; // "all" or specific centre like "mk"
  status: PartnerStatus;
  bankDetails?: PartnerBankDetails;
  stats: PartnerStats;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface PartnerAdmission {
  id: string; // REF-0001
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  studentId: string; // Linked to ERP STU-XXXX
  studentName: string;
  dob?: string;
  grade: string;
  school?: string;
  parentName: string;
  phone: string;
  email?: string;
  address?: string;
  centreId: string;
  centreName: string;
  course: string;
  feeAmount: number; // Total agreed/collected fee
  commissionAmount: number; // Calculated commission
  paymentMode: string; // Cash, UPI, Card, Net Banking
  paymentStatus: "Paid" | "Partial" | "Pending";
  erpStatus: "Pending" | "Active";
  payoutStatus: PayoutStatus;
  payoutReference?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string; // ISO
}

export interface NewPartnerInput {
  name: string;
  code?: string;
  email: string;
  phone: string;
  organization?: string;
  category: PartnerCategory;
  commissionType: CommissionType;
  commissionValue: number;
  centreId: string;
  notes?: string;
  bankDetails?: PartnerBankDetails;
}

export interface NewPartnerAdmissionInput {
  partnerCode: string;
  studentName: string;
  dob?: string;
  grade: string;
  school?: string;
  parentName: string;
  phone: string;
  email?: string;
  address?: string;
  centreId: string;
  course: string;
  feeAmount: number;
  paymentMode?: string;
  paymentStatus?: "Paid" | "Partial" | "Pending";
  notes?: string;
}

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  "Marketing Team",
  "Affiliate",
  "School Partner",
  "Campus Ambassador",
  "Education Consultant",
  "Agent",
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: "PRT-001",
    code: "MKT-BALA",
    name: "Bala Murugan",
    email: "bala.marketing@qschool.com",
    phone: "9876500111",
    organization: "Q-School Internal Growth Team",
    category: "Marketing Team",
    commissionType: "percentage",
    commissionValue: 10,
    centreId: "all",
    status: "active",
    bankDetails: {
      upiId: "bala@okaxis",
      accountName: "Bala Murugan",
    },
    stats: {
      totalClicks: 142,
      totalLeads: 28,
      totalAdmissions: 5,
      totalRevenue: 125000,
      totalCommission: 12500,
      paidCommission: 8000,
      pendingCommission: 4500,
    },
    notes: "Lead marketing executive for Tamil Nadu and Puducherry school events.",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "PRT-002",
    code: "ACH-PUDU",
    name: "Achariya Campus Promoters",
    email: "outreach@achariya.org",
    phone: "9443211223",
    organization: "Achariya Educational Trust",
    category: "School Partner",
    commissionType: "flat",
    commissionValue: 2000,
    centreId: "mk",
    status: "active",
    bankDetails: {
      upiId: "achariya.trust@sbi",
      accountName: "Achariya Educational Trust",
    },
    stats: {
      totalClicks: 210,
      totalLeads: 45,
      totalAdmissions: 8,
      totalRevenue: 240000,
      totalCommission: 16000,
      paidCommission: 10000,
      pendingCommission: 6000,
    },
    notes: "Campus referral partnership for school students.",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "PRT-003",
    code: "EDT-KAVI",
    name: "Kavitha Rajan",
    email: "kavitha.edtech@gmail.com",
    phone: "9840198765",
    organization: "Kids STEM Network",
    category: "Affiliate",
    commissionType: "percentage",
    commissionValue: 8,
    centreId: "ad",
    status: "active",
    bankDetails: {
      upiId: "kavitha98@icici",
      accountName: "Kavitha Rajan",
    },
    stats: {
      totalClicks: 88,
      totalLeads: 16,
      totalAdmissions: 3,
      totalRevenue: 75000,
      totalCommission: 6000,
      paidCommission: 6000,
      pendingCommission: 0,
    },
    notes: "Adyar branch parenting workshops promoter.",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
