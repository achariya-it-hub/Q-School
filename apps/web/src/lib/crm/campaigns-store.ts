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
    postDate: "2026-11-02",
    writer: "Sneka",
    contentPillar: "Brand & Category Awareness",
    format: "Static Image",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Introducing Q School - Engineering the Neo-Sapiens",
    postContent: "Introducing Q School - Engineering the Neo-Sapiens. Discover how we nurture tomorrow's innovators with cognitive excellence and transformative learning.",
    sheetLink: "https://docs.google.com/document/d/1ERJeuEh5B7DWuqlm5b-N6kwNGouR2ddZX-bWkilI050/edit?usp=sharing",
    workedOn: "2026-10-27",
    status: "Completed",
    approvalStatus: "Approved",
    approvedOn: "2026-10-29",
    designer: "Hari",
    assignedOn: "2026-10-29",
    completedOn: "2026-10-30",
    driveLink: "https://drive.google.com/file/d/1vXKnH5TmtY1FvQb2Mkmwrmsd8bSrkGV-/view?usp=drive_link",
    creativeApprovalStatus: "Approved",
    creativeApprovedOn: "2026-10-30",
    postStatus: "Published",
    postUrl: "https://www.facebook.com/photo?fbid=122121890691442176&set=a.122098985283442176",
    facebookUrl: "https://www.facebook.com/photo?fbid=122121890691442176&set=a.122098985283442176",
    instaUrl: "https://www.instagram.com/p/DfQ71VSDfXu/?utm_source=ig_web_copy_link&vrfl=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA==",
    publishedBy: "Ram",
    publishedOn: "2026-11-03",
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-11-03T10:00:00.000Z",
  },
  {
    id: "CMP-002",
    postDate: "2026-11-04",
    writer: "Sneka",
    contentPillar: "Brand & Category Awareness",
    format: "Static Image",
    platforms: "Linkedin/X",
    audience: "B2B",
    postConcept: "What is Q School? Meet the three pillars - Q Vision, Q Learning, Q Mastery",
    postContent: "What is Q School? Meet the three pillars - Q Vision, Q Learning, Q Mastery. Empowering minds with holistic, future-ready education.",
    sheetLink: "https://docs.google.com/document/d/1ERJeuEh5B7DWuqlm5b-N6kwNGouR2ddZX-bWkilI050/edit?usp=sharing",
    workedOn: "2026-10-27",
    status: "Completed",
    approvalStatus: "Approved",
    approvedOn: "2026-11-03",
    designer: "Hari",
    assignedOn: "2026-10-30",
    completedOn: "2026-11-03",
    driveLink: "https://drive.google.com/file/d/1vdf2phi6JIsXn_TVV2PtV9-3T8L6d552/view?usp=drive_link",
    creativeApprovalStatus: "Approved",
    creativeApprovedOn: "2026-11-03",
    postStatus: "Scheduled",
    postUrl: "https://www.facebook.com/photo/?fbid=122122017081442176&set=a.122098985283442176",
    facebookUrl: "https://www.facebook.com/photo/?fbid=122122017081442176&set=a.122098985283442176",
    instaUrl: "https://www.instagram.com/p/DfTLDddCSor/?utm_source=ig_web_copy_link&xtok=NTc4MTIwNjQ2YQ==",
    publishedBy: "Ram",
    publishedOn: "2026-11-04",
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-11-03T16:00:00.000Z",
  },
  {
    id: "CMP-003",
    postDate: "2026-11-06",
    writer: "Sneka",
    contentPillar: "Program & Framework",
    format: "Static Image",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Program & Framework",
    postContent: "Exploring Q-School's signature developmental programs and holistic frameworks.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-004",
    postDate: "2026-11-08",
    writer: "Sneka",
    contentPillar: "Special Days",
    format: "Story",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Diwali",
    postContent: "Wishing all families a luminous, joy-filled Diwali filled with wisdom, curiosity, and new beginnings.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-005",
    postDate: "2026-11-10",
    writer: "Sneka",
    contentPillar: "Program & Framework",
    format: "Carousel",
    platforms: "Linkedin/X",
    audience: "B2B",
    postConcept: "Program & Framework",
    postContent: "A deep dive into our educational pedagogy and transformative curriculum for partners and educators.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-006",
    postDate: "2026-11-11",
    writer: "Sneka",
    contentPillar: "Special Days",
    format: "Story",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "National Education Day (India)",
    postContent: "Honoring visionary learning with future-ready practical education for every child in India on National Education Day.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-007",
    postDate: "2026-11-11",
    writer: "Sneka",
    contentPillar: "Brand & Category Awareness",
    format: "Video",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Brand & Category Awareness",
    postContent: "Unveiling what makes Q-School unique in building higher-order cognitive capabilities.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-008",
    postDate: "2026-11-13",
    writer: "Sneka",
    contentPillar: "Parent Education & Quantum Habits",
    format: "Carousel",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Parent Education & Quantum Habits",
    postContent: "Daily practices and micro-habits that reinforce cognitive mastery and emotional balance at home.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-009",
    postDate: "2026-11-16",
    writer: "Sneka",
    contentPillar: "Transformation Story",
    format: "Video",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Transformation Story",
    postContent: "Real breakthroughs: See how students unlock speed reading, focus, and photographic memory.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-010",
    postDate: "2026-11-18",
    writer: "Sneka",
    contentPillar: "Community & Proof",
    format: "Video",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Community & Proof",
    postContent: "Parents share their experience witnessing their children excel academically and mentally.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-011",
    postDate: "2026-11-20",
    writer: "Sneka",
    contentPillar: "Centres Spotlight",
    format: "Carousel",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Centres Spotlight",
    postContent: "A tour of our modern centres designed for immersive sensory awakening and focus training.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-012",
    postDate: "2026-11-20",
    writer: "Sneka",
    contentPillar: "Special Days",
    format: "Story",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "World Children's Day",
    postContent: "Every child possesses extraordinary potential. On World Children's Day, we celebrate their brilliance.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-013",
    postDate: "2026-11-23",
    writer: "Sneka",
    contentPillar: "Franchise & Business Opportunity",
    format: "Video",
    platforms: "Linkedin/X",
    audience: "B2B",
    postConcept: "Franchise & Business Opportunity",
    postContent: "Partner with Q-School: Bring proven cognitive enhancement and whole-brain education to your region.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-014",
    postDate: "2026-11-25",
    writer: "Sneka",
    contentPillar: "BMIT & Enrolment",
    format: "Static Image",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "BMIT & Enrolment",
    postContent: "Book your child's Brain & Mind Intelligence Test (BMIT) slot today and discover their learning quotient.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-015",
    postDate: "2026-11-27",
    writer: "Sneka",
    contentPillar: "Community & Proof",
    format: "Carousel",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Community & Proof",
    postContent: "Celebrating student milestones, blindfold reading certifications, and parent satisfaction.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "CMP-016",
    postDate: "2026-11-30",
    writer: "Sneka",
    contentPillar: "Transformation Story",
    format: "Video",
    platforms: "FB/IG",
    audience: "B2C",
    postConcept: "Transformation Story",
    postContent: "Month-end recap of incredible student progress across speed reading, memory, and cognitive growth.",
    status: "Draft",
    approvalStatus: "Pending",
    designer: "Hari",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
];

export async function listCampaigns(): Promise<CampaignItem[]> {
  const existing = await readJson<CampaignItem[] | null>(CAMPAIGNS_FILE, null);
  if (existing && Array.isArray(existing)) {
    return existing;
  }
  await writeJson(CAMPAIGNS_FILE, []);
  return [];
}

export async function resetToOfficialCalendar(): Promise<CampaignItem[]> {
  return serial(async () => {
    await writeJson(CAMPAIGNS_FILE, SEED_CAMPAIGNS);
    return SEED_CAMPAIGNS;
  });
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
