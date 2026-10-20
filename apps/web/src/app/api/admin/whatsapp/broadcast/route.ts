import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { listLeads, updateLead } from "@/lib/crm/store";
import { getSession } from "@/lib/live/store";
import { getSettings } from "@/lib/settings/store";
import { enqueue, send } from "@/lib/whatsapp/client";
import { getState } from "@/lib/whatsapp/store";
import { waPhone } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

type Audience =
  | { type: "leads"; stages?: string[]; sources?: string[]; includeTest?: boolean }
  | { type: "session"; sessionId: string; only?: "all" | "joined" | "absent" }
  | { type: "numbers"; list: string };

interface Person {
  phone: string;
  name: string;
  leadId?: string;
}

/**
 * Send one approved template to many people. Values can use {name} (first name).
 * { template, language?, params: string[], audience, dryRun? }
 * People who replied STOP are skipped. Messages go out in the background, about 15 per second.
 */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { template?: string; language?: string; params?: unknown[]; audience?: Audience; dryRun?: boolean };
  const st = await getSettings();
  const template = typeof b.template === "string" && /^[a-z0-9_]{1,512}$/.test(b.template) ? b.template : "";
  if (!b.dryRun && !template) return NextResponse.json({ error: "Pick an approved template" }, { status: 400 });
  const a = b.audience;
  let people: Person[] = [];
  if (a?.type === "leads") {
    const stages = new Set(a.stages ?? []);
    const sources = new Set(a.sources ?? []);
    people = (await listLeads())
      .filter((l) => (a.includeTest || !l.isTest) && (!stages.size || stages.has(l.stage)) && (!sources.size || sources.has(l.sourceKey ?? "webhook")))
      .map((l) => ({ phone: l.phone, name: l.name, leadId: l.id }));
  } else if (a?.type === "session") {
    const s = await getSession(String(a.sessionId));
    if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    people = s.registrations.filter((r) => (a.only === "joined" ? r.joinedAt : a.only === "absent" ? !r.joinedAt : true)).map((r) => ({ phone: r.phone, name: r.name }));
  } else if (a?.type === "numbers") {
    // one person per line ("Ananya R, 98450 11122"); a line with only numbers may hold several, split by , or ;
    people = String(a.list ?? "")
      .split(/\n+/)
      .flatMap((line) => (/[a-z]/i.test(line) ? [line] : line.split(/[,;]+/)))
      .map((line) => {
        const m = line.trim().match(/^(.*?)[\s,:-]*(\+?\d[\d\s-]{8,16}\d)$/);
        return m ? { name: m[1].trim(), phone: m[2] } : { name: "", phone: line.trim() };
      })
      .filter((p) => p.phone);
  } else return NextResponse.json({ error: "Choose who to send to" }, { status: 400 });

  const state = await getState();
  const seen = new Set<string>();
  const list: (Person & { wa: string })[] = [];
  let invalid = 0;
  let optedOut = 0;
  for (const p of people) {
    const wa = waPhone(p.phone, st.whatsapp.country);
    if (wa.length < 11 || wa.length > 15) {
      invalid++;
      continue;
    }
    if (seen.has(wa)) continue;
    seen.add(wa);
    if (state.optOut.includes(wa)) {
      optedOut++;
      continue;
    }
    list.push({ ...p, wa });
  }
  if (b.dryRun) return NextResponse.json({ count: list.length, invalid, optedOut, sample: list.slice(0, 5).map((p) => p.name || `+${p.wa}`) });
  if (!st.whatsapp.token || !st.whatsapp.phoneNumberId) return NextResponse.json({ error: "WhatsApp isn't connected yet. Set it up in Settings › WhatsApp." }, { status: 400 });
  if (list.length > 5000) return NextResponse.json({ error: "Up to 5,000 people per broadcast. Narrow the audience." }, { status: 400 });

  const vals = Array.isArray(b.params) ? b.params.slice(0, 20).map((p) => String(p ?? "")) : [];
  const firstName = (n: string) => n.trim().split(/\s+/)[0] || "there";
  const queued = enqueue(
    list.map((p) => async () => {
      const m = await send({
        to: p.wa,
        name: p.name || undefined,
        template,
        language: b.language,
        params: vals.map((v) => v.replace(/\{name\}/gi, firstName(p.name))),
        event: "broadcast",
        ref: p.leadId,
        respectOptOut: true,
      });
      if (p.leadId && m.status !== "failed") await updateLead(p.leadId, { activity: `WhatsApp broadcast “${template}” sent` }).catch(() => undefined);
    }),
  );
  return NextResponse.json({ queued, invalid, optedOut });
}
