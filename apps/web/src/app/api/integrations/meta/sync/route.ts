/**
 * "Sync now": pulls recent leads for every form in META_FORM_IDS via the Graph API.
 * Safety net for missed webhooks; dedupe by leadgen id means re-running is harmless.
 */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { fetchMetaFormLeads, mapMetaLead } from "@/lib/crm/connectors";
import { ingestLead, logError, readState, setMetaCursor } from "@/lib/crm/store";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const forms = (process.env.META_FORM_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || !forms.length) {
    return NextResponse.json({ error: "Set META_PAGE_ACCESS_TOKEN and META_FORM_IDS to enable sync" }, { status: 400 });
  }

  const st = await readState();
  const since = st.metaSyncedUntil ?? Math.floor(Date.now() / 1000) - 7 * 86400; // first sync: last 7 days
  const started = Math.floor(Date.now() / 1000);
  let created = 0;
  let duplicate = 0;
  const errors: string[] = [];

  for (const form of forms) {
    try {
      const leads = await fetchMetaFormLeads(form, token, since);
      for (const l of leads) {
        const r = await ingestLead(mapMetaLead(l, `Form ${form}`));
        r.result === "created" ? created++ : duplicate++;
      }
    } catch (e) {
      errors.push(`Form ${form}: ${(e as Error).message}`);
      await logError("meta", `Sync form ${form}: ${(e as Error).message}`);
    }
  }
  if (!errors.length) await setMetaCursor(started);
  return NextResponse.json({ ok: errors.length === 0, created, duplicate, errors });
}
