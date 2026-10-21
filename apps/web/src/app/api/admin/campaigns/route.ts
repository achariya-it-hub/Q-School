import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import {
  bulkCreateCampaigns,
  createCampaign,
  listCampaigns,
  type NewCampaignInput,
} from "@/lib/crm/campaigns-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const campaigns = await listCampaigns();

    const total = campaigns.length;
    const metaCount = campaigns.filter((c) => c.platforms.includes("Meta")).length;
    const googleCount = campaigns.filter((c) => c.platforms.includes("Google")).length;
    const liveCount = campaigns.filter((c) => c.postStatus === "Live" || c.postStatus === "Published").length;
    const pendingApprovalCount = campaigns.filter(
      (c) => c.approvalStatus === "Pending" || c.creativeApprovalStatus === "Pending"
    ).length;

    return NextResponse.json({
      ok: true,
      campaigns,
      stats: {
        total,
        metaCount,
        googleCount,
        liveCount,
        pendingApprovalCount,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();

    // Bulk creation
    if (Array.isArray(body.rows) || Array.isArray(body.campaigns)) {
      const rows = (body.rows || body.campaigns) as any[];
      if (!rows.length) {
        return NextResponse.json({ error: "No campaign rows provided" }, { status: 400 });
      }
      const validRows: NewCampaignInput[] = rows
        .filter((r) => r && (r.postConcept?.trim() || r.concept?.trim()))
        .map((r) => ({
          postDate: String(r.postDate || r.date || new Date().toISOString().split("T")[0]).trim(),
          writer: String(r.writer || "Srikeha").trim(),
          contentPillar: (r.contentPillar || r.pillar || "Brand & Category Awareness") as any,
          format: (r.format || "Static Image") as any,
          platforms: (r.platforms || r.platform || "Meta (FB/IG)") as any,
          audience: (r.audience || "B2C") as any,
          postConcept: String(r.postConcept || r.concept || "").trim(),
          postContent: String(r.postContent || r.content || "").trim(),
          sheetLink: String(r.sheetLink || r.docLink || "").trim(),
          workedOn: String(r.workedOn || "").trim(),
          status: (r.status || "Work in Progress") as any,
          approvalStatus: (r.approvalStatus || "Pending") as any,
          approvedOn: String(r.approvedOn || "").trim(),
          designer: String(r.designer || "Hari").trim(),
          assignedOn: String(r.assignedOn || "").trim(),
          completedOn: String(r.completedOn || "").trim(),
          driveLink: String(r.driveLink || "").trim(),
          creativeApprovalStatus: (r.creativeApprovalStatus || "Pending") as any,
          creativeApprovedOn: String(r.creativeApprovedOn || "").trim(),
          postStatus: (r.postStatus || "Draft") as any,
          postUrl: String(r.postUrl || r.liveUrl || "").trim(),
          publishedBy: String(r.publishedBy || "").trim(),
          publishedOn: String(r.publishedOn || "").trim(),
          budget: typeof r.budget === "number" ? r.budget : Number(r.budget) || 0,
          notes: String(r.notes || "").trim(),
        }));

      if (!validRows.length) {
        return NextResponse.json(
          { error: "No valid campaign rows found (each row needs at least a post concept)" },
          { status: 400 }
        );
      }

      const res = await bulkCreateCampaigns(validRows);
      return NextResponse.json({ ok: true, ...res });
    }

    // Single creation
    if (!body.postConcept?.trim()) {
      return NextResponse.json({ error: "Post concept is required" }, { status: 400 });
    }
    if (!body.postDate?.trim()) {
      return NextResponse.json({ error: "Post date is required" }, { status: 400 });
    }

    const campaign = await createCampaign(body as NewCampaignInput);
    return NextResponse.json({ ok: true, campaign });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
