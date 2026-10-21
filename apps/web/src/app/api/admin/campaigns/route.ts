import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { createCampaign, listCampaigns, type NewCampaignInput } from "@/lib/crm/campaigns-store";

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
    const body = (await req.json()) as NewCampaignInput;

    if (!body.postConcept?.trim()) {
      return NextResponse.json({ error: "Post concept is required" }, { status: 400 });
    }
    if (!body.postDate?.trim()) {
      return NextResponse.json({ error: "Post date is required" }, { status: 400 });
    }

    const campaign = await createCampaign(body);
    return NextResponse.json({ ok: true, campaign });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
