/**
 * Partners, Affiliates and Admission Referrals Store (server-only).
 * File-backed persistence in DATA_DIR:
 *   partners.json           — partners, marketing executives & affiliates
 *   partner-admissions.json — admissions referred by partners, linked to ERP STU-XXXX
 */
import { promises as fs } from "fs";
import path from "path";
import { ADMISSION_CENTRES, centreName } from "@qschool/shared";
import { DATA_DIR, dataFile } from "@/lib/data-dir";
import { addStudent, type NewStudent } from "@/lib/students/store";
import { ingestLead } from "@/lib/crm/store";
import {
  INITIAL_PARTNERS,
  type NewPartnerAdmissionInput,
  type NewPartnerInput,
  type Partner,
  type PartnerAdmission,
  type PayoutStatus,
} from "./types";

export * from "./types";

const PARTNERS_FILE = dataFile("partners.json");
const ADMISSIONS_FILE = dataFile("partner-admissions.json");

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

/* ───────── Partners Management ───────── */

export async function listPartners(): Promise<Partner[]> {
  const partners = await readJson<Partner[] | null>(PARTNERS_FILE, null);
  if (partners && Array.isArray(partners)) {
    return partners;
  }
  await writeJson(PARTNERS_FILE, []);
  return [];
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const partners = await listPartners();
  return partners.find((p) => p.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function getPartnerByCode(code: string): Promise<Partner | null> {
  const partners = await listPartners();
  const cleanCode = code.trim().toUpperCase();
  return partners.find((p) => p.code.toUpperCase() === cleanCode) || null;
}

function generatePartnerCode(name: string, existing: Partner[]): string {
  const prefix = name
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase() || "MKT";
  const num = Math.floor(100 + Math.random() * 900);
  const code = `${prefix}-${num}`;
  if (existing.some((p) => p.code === code)) {
    return `${prefix}-${num + 7}`;
  }
  return code;
}

export async function createPartner(input: NewPartnerInput): Promise<Partner> {
  return serial(async () => {
    const partners = await listPartners();
    const id = `PRT-${String(partners.length + 1).padStart(3, "0")}`;
    const code = input.code?.trim().toUpperCase() || generatePartnerCode(input.name, partners);

    if (partners.some((p) => p.code.toUpperCase() === code)) {
      throw new Error(`Referral code "${code}" is already in use by another partner.`);
    }

    const now = new Date().toISOString();
    const partner: Partner = {
      id,
      code,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      organization: input.organization?.trim(),
      category: input.category,
      commissionType: input.commissionType,
      commissionValue: Number(input.commissionValue) || 0,
      centreId: input.centreId || "all",
      status: "active",
      bankDetails: input.bankDetails,
      notes: input.notes?.trim(),
      stats: {
        totalClicks: 0,
        totalLeads: 0,
        totalAdmissions: 0,
        totalRevenue: 0,
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    partners.unshift(partner);
    await writeJson(PARTNERS_FILE, partners);
    return partner;
  });
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
  return serial(async () => {
    const partners = await listPartners();
    const idx = partners.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Partner not found");

    if (updates.code) {
      const codeUpper = updates.code.trim().toUpperCase();
      const existing = partners.find((p) => p.id !== id && p.code.toUpperCase() === codeUpper);
      if (existing) throw new Error(`Code "${codeUpper}" is already in use`);
      updates.code = codeUpper;
    }

    const updated = {
      ...partners[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    partners[idx] = updated;
    await writeJson(PARTNERS_FILE, partners);
    return updated;
  });
}

/* ───────── Partner Admissions & ERP Ingestion ───────── */

export async function listPartnerAdmissions(partnerId?: string): Promise<PartnerAdmission[]> {
  const admissions = await readJson<PartnerAdmission[]>(ADMISSIONS_FILE, []);
  if (partnerId) {
    return admissions.filter((a) => a.partnerId === partnerId || a.partnerCode.toUpperCase() === partnerId.toUpperCase());
  }
  return admissions;
}

export async function createPartnerAdmission(input: NewPartnerAdmissionInput): Promise<{
  admission: PartnerAdmission;
  studentId: string;
  isDuplicateStudent: boolean;
}> {
  return serial(async () => {
    const partner = await getPartnerByCode(input.partnerCode);
    if (!partner) {
      throw new Error(`Invalid partner referral code: "${input.partnerCode}"`);
    }
    if (partner.status !== "active") {
      throw new Error(`Partner code "${partner.code}" is currently deactivated.`);
    }

    // 1. Prepare student record for ERP (students.json)
    const newStudentInput: NewStudent = {
      studentName: input.studentName.trim(),
      dob: input.dob || "2015-01-01",
      grade: input.grade.trim(),
      school: input.school?.trim() || "Not specified",
      parentName: input.parentName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim().toLowerCase() || `${input.phone.trim().slice(-10)}@parent.qschool.in`,
      address: input.address?.trim() || "Local Centre Admission",
      centreId: input.centreId || (partner.centreId !== "all" ? partner.centreId : "mk"),
      ref: partner.code, // Attributed directly in ERP
    };

    // Add to ERP student database
    const { student, duplicate } = await addStudent(newStudentInput, null);

    // 2. Ingest into CRM pipeline as Enrolled lead
    try {
      await ingestLead({
        sourceKey: "webhook",
        source: `Partner: ${partner.name} (${partner.code})`,
        name: `${input.studentName.trim()} (P: ${input.parentName.trim()})`,
        phone: input.phone.trim(),
        email: input.email?.trim() || undefined,
        interest: `${input.course} (Admission by ${partner.name})`,
        message: `Direct admission processed via Partner Referral App by ${partner.name} [Code: ${partner.code}]. Fee: Rs.${input.feeAmount}. ERP ID: ${student.id}`,
      });
    } catch (crmErr) {
      console.warn("CRM ingest warning for partner admission:", crmErr);
    }

    // 3. Calculate Commission
    const fee = Number(input.feeAmount) || 0;
    let commission = 0;
    if (partner.commissionType === "percentage") {
      commission = Math.round((fee * partner.commissionValue) / 100);
    } else {
      commission = partner.commissionValue;
    }

    // 4. Save Partner Admission Record
    const admissions = await listPartnerAdmissions();
    const admissionId = `REF-${String(admissions.length + 1).padStart(4, "0")}`;
    const now = new Date().toISOString();

    const admissionRecord: PartnerAdmission = {
      id: admissionId,
      partnerId: partner.id,
      partnerCode: partner.code,
      partnerName: partner.name,
      studentId: student.id,
      studentName: input.studentName.trim(),
      dob: input.dob,
      grade: input.grade.trim(),
      school: input.school?.trim(),
      parentName: input.parentName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim(),
      address: input.address?.trim(),
      centreId: newStudentInput.centreId,
      centreName: centreName(newStudentInput.centreId),
      course: input.course || "Comprehensive Robotics & AI Program",
      feeAmount: fee,
      commissionAmount: commission,
      paymentMode: input.paymentMode || "Cash",
      paymentStatus: input.paymentStatus || "Paid",
      erpStatus: student.status,
      payoutStatus: "Pending",
      notes: input.notes?.trim(),
      createdAt: now,
    };

    admissions.unshift(admissionRecord);
    await writeJson(ADMISSIONS_FILE, admissions);

    // 5. Update Partner Stats
    const partners = await listPartners();
    const pIdx = partners.findIndex((p) => p.id === partner.id);
    if (pIdx !== -1) {
      const p = partners[pIdx];
      p.stats = {
        ...p.stats,
        totalAdmissions: p.stats.totalAdmissions + 1,
        totalRevenue: p.stats.totalRevenue + fee,
        totalCommission: p.stats.totalCommission + commission,
        pendingCommission: p.stats.pendingCommission + commission,
      };
      p.updatedAt = now;
      await writeJson(PARTNERS_FILE, partners);
    }

    return {
      admission: admissionRecord,
      studentId: student.id,
      isDuplicateStudent: duplicate,
    };
  });
}

export async function updateAdmissionPayout(
  admissionId: string,
  payoutStatus: PayoutStatus,
  payoutReference?: string
): Promise<PartnerAdmission> {
  return serial(async () => {
    const admissions = await listPartnerAdmissions();
    const idx = admissions.findIndex((a) => a.id === admissionId);
    if (idx === -1) throw new Error("Admission referral record not found");

    const prev = admissions[idx];
    const prevStatus = prev.payoutStatus;

    const updated: PartnerAdmission = {
      ...prev,
      payoutStatus,
      payoutReference: payoutReference || prev.payoutReference,
      paidAt: payoutStatus === "Paid" ? new Date().toISOString() : prev.paidAt,
    };

    admissions[idx] = updated;
    await writeJson(ADMISSIONS_FILE, admissions);

    // Update partner stats if moving to Paid or from Paid
    if (prevStatus !== "Paid" && payoutStatus === "Paid") {
      const partners = await listPartners();
      const pIdx = partners.findIndex((p) => p.id === prev.partnerId);
      if (pIdx !== -1) {
        const p = partners[pIdx];
        p.stats.paidCommission += prev.commissionAmount;
        p.stats.pendingCommission = Math.max(0, p.stats.pendingCommission - prev.commissionAmount);
        p.updatedAt = new Date().toISOString();
        await writeJson(PARTNERS_FILE, partners);
      }
    }

    return updated;
  });
}

export async function recordPartnerClick(code: string) {
  try {
    const partner = await getPartnerByCode(code);
    if (!partner) return;
    const partners = await listPartners();
    const pIdx = partners.findIndex((p) => p.id === partner.id);
    if (pIdx !== -1) {
      partners[pIdx].stats.totalClicks += 1;
      await writeJson(PARTNERS_FILE, partners);
    }
  } catch (err) {
    console.warn("Click recording error:", err);
  }
}
