/**
 * "Send test lead": runs a realistic sample payload through the SAME parser the live webhook uses,
 * then into the pipeline (flagged as test). Lets you check mapping before ad accounts are connected.
 */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { mapGeneric, mapGoogleLead, mapMetaLead, mapWhatsApp, samplePayload, type GoogleLeadPayload, type MetaLead } from "@/lib/crm/connectors";
import { ingestLead, type IncomingLead } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { source } = await req.json().catch(() => ({ source: "" }));
  let leads: IncomingLead[] = [];
  switch (source) {
    case "meta":
      leads = [mapMetaLead(samplePayload("meta") as unknown as MetaLead, "Oct admissions form")];
      break;
    case "google":
      leads = [mapGoogleLead(samplePayload("google") as unknown as GoogleLeadPayload)];
      break;
    case "whatsapp":
      leads = mapWhatsApp(samplePayload("whatsapp"));
      break;
    case "website": {
      const w = samplePayload("website") as unknown as Record<string, string>;
      leads = [{ sourceKey: "website", source: "Website", name: w.name, phone: w.phone, email: w.email, interest: w.interest, formName: w.source }];
      break;
    }
    case "webhook":
      leads = [mapGeneric("justdial", samplePayload("webhook") as unknown as Record<string, unknown>)];
      break;
    default:
      return NextResponse.json({ error: "Unknown source" }, { status: 400 });
  }
  const results = [];
  for (const l of leads) results.push(await ingestLead({ ...l, isTest: true }));
  return NextResponse.json({ ok: true, results: results.map((r) => ({ result: r.result, id: r.lead.id, name: r.lead.name, owner: r.lead.owner })) });
}
