export interface ModulePermission {
  view: boolean;
  createEdit: boolean;
  delete: boolean;
  export: boolean;
}

export interface ModuleDef {
  key: string;
  name: string;
  group: "CRM" | "Academics" | "Finance" | "ERP" | "Settings";
  description: string;
}

export const MODULES: ModuleDef[] = [
  // CRM
  { key: "leads", name: "Leads & Pipeline", group: "CRM", description: "Lead tracking, pipeline stages, status updates" },
  { key: "events", name: "Events & Footfall", group: "CRM", description: "BMIT camps, workshops, attendee check-in and footfall" },
  { key: "partners", name: "Partners & Referrals", group: "CRM", description: "Marketing partners, referral codes, and commission payouts" },
  { key: "followups", name: "Follow-ups", group: "CRM", description: "Scheduled calls, task reminders, counsellor notes" },
  { key: "lead_sources", name: "Lead Sources", group: "CRM", description: "Meta Ads, Google Ads, website connectors" },
  { key: "whatsapp", name: "WhatsApp Hub", group: "CRM", description: "Message log, bulk broadcast, template management" },

  // Academics
  { key: "students", name: "Students & Admissions", group: "Academics", description: "Student admissions, enrolment, centre activation" },
  { key: "users", name: "Users Directory", group: "Academics", description: "User accounts, role assignment and status" },
  { key: "courses", name: "Courses & Curriculum", group: "Academics", description: "Course builder, lessons, video recordings" },
  { key: "live", name: "Live Classes", group: "Academics", description: "BigBlueButton, Zoom, Teams, hosting & room management" },
  { key: "schedule", name: "Timetable & Schedule", group: "Academics", description: "Batch schedules, recurring sessions, calendars" },

  // Finance
  { key: "fees", name: "Fees & Receivables", group: "Finance", description: "Student fee accounts, payment collection, balances" },
  { key: "invoices", name: "Invoices", group: "Finance", description: "Invoice generation, GST tax calculation, PDF receipts" },
  { key: "payments", name: "Payments & Receipts", group: "Finance", description: "Razorpay/UPI transactions, fee reconciliations" },
  { key: "expenses", name: "Expenses", group: "Finance", description: "Branch expenses, vendor payouts, vouchers" },

  // ERP & Operations
  { key: "staff", name: "HR & Staff Directory", group: "ERP", description: "Staff profiles, branch assignments, biometric punch" },
  { key: "tasks", name: "Staff Tasks", group: "ERP", description: "Task allocation, daily checklists, status tracking" },
  { key: "payroll", name: "Payroll & Payslips", group: "ERP", description: "Salary calculation, allowances, deductions, payslips" },
  { key: "inventory", name: "Inventory & Kits", group: "ERP", description: "Study kits, robot parts, uniform stock" },

  // Settings
  { key: "reports", name: "Reports & Analytics", group: "Settings", description: "Business metrics, footfall reports, financial summaries" },
  { key: "settings", name: "System Settings", group: "Settings", description: "Branch settings, telephony, integrations, tax details" },
  { key: "privileges", name: "User Privileges", group: "Settings", description: "User privilege configuration and security roles" },
];

export const GROUPS = ["CRM", "Academics", "Finance", "ERP", "Settings"] as const;

export type RoleName = "Admin" | "CentreManager" | "Counsellor" | "Finance" | "Faculty" | "Student";

export const fullAccess = (): ModulePermission => ({ view: true, createEdit: true, delete: true, export: true });
export const readOnly = (): ModulePermission => ({ view: true, createEdit: false, delete: false, export: true });
export const noAccess = (): ModulePermission => ({ view: false, createEdit: false, delete: false, export: false });
export const custom = (view: boolean, createEdit: boolean, del: boolean, exp: boolean): ModulePermission => ({
  view,
  createEdit,
  delete: del,
  export: exp,
});

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, Record<string, ModulePermission>> = {
  Admin: Object.fromEntries(MODULES.map((m) => [m.key, fullAccess()])),

  CentreManager: Object.fromEntries(
    MODULES.map((m) => {
      if (m.group === "Academics") return [m.key, fullAccess()];
      if (m.key === "events" || m.key === "leads" || m.key === "followups") return [m.key, fullAccess()];
      if (m.key === "fees" || m.key === "invoices") return [m.key, custom(true, true, false, true)];
      if (m.key === "tasks" || m.key === "staff" || m.key === "inventory") return [m.key, fullAccess()];
      if (m.key === "reports") return [m.key, readOnly()];
      return [m.key, noAccess()];
    })
  ),

  Counsellor: Object.fromEntries(
    MODULES.map((m) => {
      if (m.group === "CRM") return [m.key, custom(true, true, false, true)];
      if (m.key === "students" || m.key === "live" || m.key === "schedule") return [m.key, readOnly()];
      if (m.key === "tasks") return [m.key, custom(true, true, false, false)];
      return [m.key, noAccess()];
    })
  ),

  Finance: Object.fromEntries(
    MODULES.map((m) => {
      if (m.group === "Finance") return [m.key, fullAccess()];
      if (m.key === "payroll") return [m.key, fullAccess()];
      if (m.key === "students" || m.key === "staff") return [m.key, readOnly()];
      if (m.key === "reports") return [m.key, readOnly()];
      return [m.key, noAccess()];
    })
  ),

  Faculty: Object.fromEntries(
    MODULES.map((m) => {
      if (m.key === "courses" || m.key === "live" || m.key === "schedule") return [m.key, fullAccess()];
      if (m.key === "students") return [m.key, readOnly()];
      if (m.key === "tasks") return [m.key, custom(true, true, false, false)];
      return [m.key, noAccess()];
    })
  ),

  Student: Object.fromEntries(
    MODULES.map((m) => {
      if (m.key === "courses" || m.key === "live" || m.key === "schedule" || m.key === "fees") return [m.key, readOnly()];
      return [m.key, noAccess()];
    })
  ),
};
