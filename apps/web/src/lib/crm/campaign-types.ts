export type CampaignPlatform =
  | "Meta (FB/IG)"
  | "Google Ads"
  | "Meta & Google"
  | "LinkedIn"
  | "YouTube"
  | "WhatsApp Broadcast";

export type ContentPillar =
  | "Brand & Category Awareness"
  | "Program & Framework"
  | "Special Days"
  | "Parent Education & Quantum Habits"
  | "Transformation Story"
  | "Community & Proof"
  | "Centres Spotlight"
  | "Franchise & Business Opportunity"
  | "SMT & Enrolment"
  | "Sales & Admission Ad";

export type ContentFormat =
  | "Static Image"
  | "Video"
  | "Carousel"
  | "Story"
  | "Reel"
  | "Search Ad"
  | "Responsive Display"
  | "Lead Form Ad";

export type TargetAudience = "B2C" | "B2B" | "B2C & B2B";

export type WorkflowStatus =
  | "Draft"
  | "Work in Progress"
  | "Ready for Review"
  | "Completed";

export type ApprovalStatus =
  | "Pending"
  | "Approved"
  | "Changes Requested"
  | "Revision Needed"
  | "Not Required";

export type PublishingStatus =
  | "Draft"
  | "Scheduled"
  | "Published"
  | "Live"
  | "Paused"
  | "Completed";

export interface CampaignItem {
  id: string; // CMP-001
  postDate: string; // YYYY-MM-DD or readable string
  writer: string; // e.g. Srikeha
  contentPillar: ContentPillar;
  format: ContentFormat;
  platforms: CampaignPlatform;
  audience: TargetAudience;
  postConcept: string; // e.g. "Diwali", "National Education Day"
  postContent?: string; // Caption or Ad Copy
  sheetLink?: string; // Link to copy doc
  workedOn?: string; // Date or notes
  status: WorkflowStatus; // Copy / content status
  approvalStatus: ApprovalStatus; // Copy approval
  approvedOn?: string;
  designer?: string; // e.g. Hari
  assignedOn?: string;
  completedOn?: string;
  driveLink?: string; // Asset link in Google Drive / Figma
  creativeApprovalStatus: ApprovalStatus;
  creativeApprovedOn?: string;
  postStatus: PublishingStatus;
  postUrl?: string; // Live ad / social link
  publishedBy?: string;
  publishedOn?: string;
  budget?: number; // Optional ad spend INR
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewCampaignInput = Omit<CampaignItem, "id" | "createdAt" | "updatedAt">;

export const CONTENT_PILLARS: ContentPillar[] = [
  "Brand & Category Awareness",
  "Program & Framework",
  "Special Days",
  "Parent Education & Quantum Habits",
  "Transformation Story",
  "Community & Proof",
  "Centres Spotlight",
  "Franchise & Business Opportunity",
  "SMT & Enrolment",
  "Sales & Admission Ad",
];

export const CONTENT_FORMATS: ContentFormat[] = [
  "Static Image",
  "Video",
  "Carousel",
  "Story",
  "Reel",
  "Search Ad",
  "Responsive Display",
  "Lead Form Ad",
];

export const CAMPAIGN_PLATFORMS: CampaignPlatform[] = [
  "Meta (FB/IG)",
  "Google Ads",
  "Meta & Google",
  "LinkedIn",
  "YouTube",
  "WhatsApp Broadcast",
];

export const WRITERS = ["Srikeha", "Marketing Lead", "Content Team", "AI Assistant"];
export const DESIGNERS = ["Hari", "Creative Studio", "Video Editor", "Freelance"];
