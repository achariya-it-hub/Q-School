/**
 * Campaign Calendar Store (Server-only).
 * File-backed persistence in DATA_DIR: campaign-calendar.json
 * Tracks Meta (FB/IG), Google Ads, and social campaigns with full workflow:
 * planning, copywriting, design, approvals, and live ad tracking.
 */
import { promises as fs } from "fs";
import { dataFile } from "@/lib/data-dir";
import { recordAuditLog } from "@/lib/audit/store";
import {
  type CampaignItem,
  type NewCampaignInput,
} from "./campaign-types";

export * from "./campaign-types";

const CAMPAIGNS_FILE = dataFile("campaign-calendar.json");

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

const SEED_CAMPAIGNS: CampaignItem[] = [
  {
    id: "CMP-001",
    postDate: "2026-10-22",
    writer: "Srikeha",
    contentPillar: "Sales & Admission Ad",
    format: "Lead Form Ad",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Admissions Open - Free Robotics Trial Class",
    postContent: "Unlock your child's coding & robotics superpower! Hands-on kits, AI learning, Grade 1-12. Limited seats per centre.",
    sheetLink: "https://docs.google.com/document/d/demo-copy-1",
    workedOn: "2026-10-21",
    status: "Completed",
    approvalStatus: "Approved",
    approvedOn: "2026-10-21",
    designer: "Hari",
    assignedOn: "2026-10-20",
    completedOn: "2026-10-21",
    driveLink: "https://drive.google.com/drive/folders/demo-creatives-1",
    creativeApprovalStatus: "Approved",
    creativeApprovedOn: "2026-10-21",
    postStatus: "Live",
    postUrl: "https://facebook.com/ads/manager/demo-ad-101",
    publishedBy: "Marketing Team",
    publishedOn: "2026-10-22",
    budget: 5000,
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-21T16:00:00.000Z",
  },
  {
    id: "CMP-002",
    postDate: "2026-10-24",
    writer: "Srikeha",
    contentPillar: "Program & Framework",
    format: "Search Ad",
    platforms: "Google Ads",
    audience: "B2C",
    postConcept: "Best Robotics Classes for Kids in Puducherry & Online",
    postContent: "Top-Rated Robotics & STEM Institute. Interactive hardware kits, expert trainers, weekly projects. Register today!",
    sheetLink: "https://docs.google.com/document/d/demo-copy-2",
    workedOn: "2026-10-21",
    status: "Completed",
    approvalStatus: "Approved",
    approvedOn: "2026-10-21",
    designer: "Hari",
    assignedOn: "2026-10-21",
    completedOn: "2026-10-21",
    driveLink: "https://drive.google.com/drive/folders/demo-creatives-2",
    creativeApprovalStatus: "Approved",
    creativeApprovedOn: "2026-10-21",
    postStatus: "Scheduled",
    postUrl: "https://ads.google.com/aw/campaigns/demo-ad-102",
    publishedBy: "Ad Ops",
    publishedOn: "2026-10-24",
    budget: 7500,
    createdAt: "2026-10-19T10:00:00.000Z",
    updatedAt: "2026-10-21T17:00:00.000Z",
  },
  {
    id: "CMP-003",
    postDate: "2026-11-02",
    writer: "Srikeha",
    contentPillar: "Brand & Category Awareness",
    format: "Static Image",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Why 21st-Century Kids Need Robotics Before High School",
    postContent: "Critical thinking, problem-solving, and STEM foundations made fun through active building.",
    sheetLink: "https://docs.google.com/document/d/demo-copy-3",
    workedOn: "2026-10-21",
    status: "Work in Progress",
    approvalStatus: "Pending",
    designer: "Hari",
    assignedOn: "2026-10-22",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-10-21T10:00:00.000Z",
  },
  {
    id: "CMP-004",
    postDate: "2026-11-04",
    writer: "Srikeha",
    contentPillar: "Brand & Category Awareness",
    format: "Static Image",
    platforms: "LinkedIn",
    audience: "B2B",
    postConcept: "School Lab Partnership & Integrated STEM Programs",
    postContent: "Empower your school with turn-key robotics curriculum, certified trainers, and lab setup.",
    sheetLink: "https://docs.google.com/document/d/demo-copy-4",
    status: "Work in Progress",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T11:00:00.000Z",
    updatedAt: "2026-10-20T11:00:00.000Z",
  },
  {
    id: "CMP-005",
    postDate: "2026-11-06",
    writer: "Srikeha",
    contentPillar: "Program & Framework",
    format: "Video",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Hands-on Drone & Autonomous Rover Coding",
    postContent: "Watch our Grade 6 students program line-following sensors in under 45 minutes!",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T12:00:00.000Z",
    updatedAt: "2026-10-20T12:00:00.000Z",
  },
  {
    id: "CMP-006",
    postDate: "2026-11-08",
    writer: "Srikeha",
    contentPillar: "Special Days",
    format: "Story",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Diwali",
    postContent: "Illuminate curious minds this Diwali! Special festive scholarship up to 50% for early enrolments.",
    status: "Work in Progress",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T13:00:00.000Z",
    updatedAt: "2026-10-20T13:00:00.000Z",
  },
  {
    id: "CMP-007",
    postDate: "2026-11-10",
    writer: "Srikeha",
    contentPillar: "Program & Framework",
    format: "Carousel",
    platforms: "Google Ads",
    audience: "B2C",
    postConcept: "From Scratch to Python: 4-Stage Progressive Robotics Roadmap",
    postContent: "A structured, age-appropriate learning journey designed by educators and engineers.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T14:00:00.000Z",
    updatedAt: "2026-10-20T14:00:00.000Z",
  },
  {
    id: "CMP-008",
    postDate: "2026-11-11",
    writer: "Srikeha",
    contentPillar: "Special Days",
    format: "Story",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "National Education Day (India)",
    postContent: "Honoring visionary learning with future-ready practical education for every child in India.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T15:00:00.000Z",
    updatedAt: "2026-10-20T15:00:00.000Z",
  },
  {
    id: "CMP-009",
    postDate: "2026-11-13",
    writer: "Srikeha",
    contentPillar: "Brand & Category Awareness",
    format: "Video",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Screen Time vs Build Time",
    postContent: "How to channel your kid's gaming passion into real software and hardware engineering.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T16:00:00.000Z",
    updatedAt: "2026-10-20T16:00:00.000Z",
  },
  {
    id: "CMP-010",
    postDate: "2026-11-16",
    writer: "Srikeha",
    contentPillar: "Parent Education & Quantum Habits",
    format: "Carousel",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Quantum Habits for Young Innovators",
    postContent: "5 daily micro-habits that foster resilience, logical inquiry, and curiosity in children.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T17:00:00.000Z",
    updatedAt: "2026-10-20T17:00:00.000Z",
  },
  {
    id: "CMP-011",
    postDate: "2026-11-18",
    writer: "Srikeha",
    contentPillar: "Transformation Story",
    format: "Video",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Student Spotlight: Built a Smart Plant Watering Device",
    postContent: "Aarav (Grade 5) solved his family's garden watering problem using soil sensors and Arduino.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "CMP-012",
    postDate: "2026-11-20",
    writer: "Srikeha",
    contentPillar: "Community & Proof",
    format: "Video",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Q-School Robotics Showcase & Expo Highlights",
    postContent: "Over 350 parent visits across our Moolakulam and virtual centres. Hear what parents have to say!",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T19:00:00.000Z",
    updatedAt: "2026-10-20T19:00:00.000Z",
  },
  {
    id: "CMP-013",
    postDate: "2026-11-23",
    writer: "Srikeha",
    contentPillar: "Centres Spotlight",
    format: "Carousel",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "Inside Q-School Learning Labs",
    postContent: "Clean, safe, high-tech environments where students build with real microcontrollers and 3D printing.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T20:00:00.000Z",
    updatedAt: "2026-10-20T20:00:00.000Z",
  },
  {
    id: "CMP-014",
    postDate: "2026-11-23",
    writer: "Srikeha",
    contentPillar: "Special Days",
    format: "Story",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "World Children's Day",
    postContent: "Every child is born an engineer. Give them the tools to build their dreams.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T21:00:00.000Z",
    updatedAt: "2026-10-20T21:00:00.000Z",
  },
  {
    id: "CMP-015",
    postDate: "2026-11-25",
    writer: "Srikeha",
    contentPillar: "Franchise & Business Opportunity",
    format: "Video",
    platforms: "LinkedIn",
    audience: "B2B",
    postConcept: "Bring Q-School Robotics to Your City: Partner with Us",
    postContent: "Proven ed-tech curriculum, teacher training certification, and high operational returns.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-20T22:00:00.000Z",
    updatedAt: "2026-10-20T22:00:00.000Z",
  },
  {
    id: "CMP-016",
    postDate: "2026-11-25",
    writer: "Srikeha",
    contentPillar: "SMT & Enrolment",
    format: "Static Image",
    platforms: "Meta & Google",
    audience: "B2C",
    postConcept: "Weekend Batch Admissions Open",
    postContent: "Saturday & Sunday immersive batches. Reserve your child's hardware kit before batches close.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    budget: 6000,
    createdAt: "2026-10-20T23:00:00.000Z",
    updatedAt: "2026-10-20T23:00:00.000Z",
  },
];

export async function listCampaigns(): Promise<CampaignItem[]> {
  const existing = await readJson<CampaignItem[] | null>(CAMPAIGNS_FILE, null);
  if (existing && Array.isArray(existing)) {
    return existing;
  }
  // Initialize with seed data matching user's spreadsheet
  await writeJson(CAMPAIGNS_FILE, SEED_CAMPAIGNS);
  return SEED_CAMPAIGNS;
}

export async function getCampaignById(id: string): Promise<CampaignItem | null> {
  const list = await listCampaigns();
  return list.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function createCampaign(input: NewCampaignInput): Promise<CampaignItem> {
  return serial(async () => {
    const list = await listCampaigns();
    const id = `CMP-${String(list.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();

    const item: CampaignItem = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(item);
    await writeJson(CAMPAIGNS_FILE, list);

    await recordAuditLog({
      action: "CREATE",
      module: "Campaign Calendar",
      entityId: id,
      entityName: `${item.postConcept} (${item.platforms})`,
      summary: `Created ${item.platforms} campaign post "${item.postConcept}" scheduled for ${item.postDate}`,
      newData: item,
    }).catch(() => {});

    return item;
  });
}

export async function bulkCreateCampaigns(
  inputs: NewCampaignInput[]
): Promise<{ created: number; campaigns: CampaignItem[] }> {
  return serial(async () => {
    const list = await listCampaigns();
    const now = new Date().toISOString();

    // Determine starting numeric ID
    const maxNum = list.reduce((max, c) => {
      const match = c.id.match(/^CMP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    const createdItems: CampaignItem[] = [];

    inputs.forEach((input, idx) => {
      const id = `CMP-${String(maxNum + idx + 1).padStart(3, "0")}`;
      const item: CampaignItem = {
        postDate: input.postDate,
        writer: input.writer || "Srikeha",
        contentPillar: input.contentPillar || "Brand & Category Awareness",
        format: input.format || "Static Image",
        platforms: input.platforms || "Meta (FB/IG)",
        audience: input.audience || "B2C",
        postConcept: input.postConcept,
        postContent: input.postContent || "",
        sheetLink: input.sheetLink || "",
        workedOn: input.workedOn || "",
        status: input.status || "Work in Progress",
        approvalStatus: input.approvalStatus || "Pending",
        approvedOn: input.approvedOn || "",
        designer: input.designer || "Hari",
        assignedOn: input.assignedOn || "",
        completedOn: input.completedOn || "",
        driveLink: input.driveLink || "",
        creativeApprovalStatus: input.creativeApprovalStatus || "Pending",
        creativeApprovedOn: input.creativeApprovedOn || "",
        postStatus: input.postStatus || "Draft",
        postUrl: input.postUrl || "",
        publishedBy: input.publishedBy || "",
        publishedOn: input.publishedOn || "",
        budget: typeof input.budget === "number" ? Math.max(0, input.budget) : 0,
        notes: input.notes || "",
        id,
        createdAt: now,
        updatedAt: now,
      };
      createdItems.push(item);
    });

    list.unshift(...createdItems);
    await writeJson(CAMPAIGNS_FILE, list);

    await recordAuditLog({
      action: "CREATE",
      module: "Campaign Calendar",
      entityId: `BULK-${Date.now()}`,
      entityName: `Bulk Upload (${createdItems.length} campaigns)`,
      summary: `Bulk imported ${createdItems.length} campaign posts into Campaign Calendar`,
      newData: { count: createdItems.length, sample: createdItems.slice(0, 5).map((c) => c.postConcept) },
    }).catch(() => {});

    return { created: createdItems.length, campaigns: createdItems };
  });
}

export async function updateCampaign(
  id: string,
  updates: Partial<CampaignItem>
): Promise<CampaignItem> {
  return serial(async () => {
    const list = await listCampaigns();
    const idx = list.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error("Campaign entry not found");

    const prev = { ...list[idx] };
    const updated: CampaignItem = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[idx] = updated;
    await writeJson(CAMPAIGNS_FILE, list);

    await recordAuditLog({
      action: "UPDATE",
      module: "Campaign Calendar",
      entityId: id,
      entityName: `${updated.postConcept} (${updated.platforms})`,
      summary: `Updated campaign "${updated.postConcept}" (${updated.platforms}) - Status: ${updated.postStatus}`,
      previousData: prev,
      newData: updated,
    }).catch(() => {});

    return updated;
  });
}

export async function deleteCampaign(id: string): Promise<boolean> {
  return serial(async () => {
    const list = await listCampaigns();
    const idx = list.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return false;

    const removed = list.splice(idx, 1)[0];
    await writeJson(CAMPAIGNS_FILE, list);

    await recordAuditLog({
      action: "DELETE",
      module: "Campaign Calendar",
      entityId: id,
      entityName: removed.postConcept,
      summary: `Deleted campaign post "${removed.postConcept}" scheduled for ${removed.postDate}`,
      previousData: removed,
    }).catch(() => {});

    return true;
  });
}
