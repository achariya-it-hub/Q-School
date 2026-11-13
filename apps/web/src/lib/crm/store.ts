/**
 * CRM lead store (server-only). File-backed stand-in for the Postgres `leads` table:
 *   crm-leads.json        — all leads, newest first
 *   crm-ingest-log.json   — last 200 ingestion events per source (for the Lead Sources screen)
 *   crm-state.json        — round-robin cursor, per-source counters, Meta sync cursor
 * Every connector (Meta, Google Ads, WhatsApp, website, generic webhook) calls `ingestLead()`,
 * which normalises, de-duplicates by external id / phone / email and assigns an owner.
 */
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR, dataFile } from "@/lib/data-dir";
import { recordAuditLog } from "@/lib/audit/store";
import { AGENTS, PIPELINE, STAGES, type PipelineLead, type Stage } from "@qschool/shared";
import {
  isDbConfigured,
  getDbLeads,
  saveDbLead,
  saveDbLeadsBulk,
  deleteDbLead,
  deleteDbLeadsByIds,
  clearDbLeads,
} from "@/lib/db";

const LEADS_FILE = dataFile("crm-leads.json");
const LOG_FILE = dataFile("crm-ingest-log.json");
const STATE_FILE = dataFile("crm-state.json");

export type SourceKey = "meta" | "google" | "whatsapp" | "website" | "webhook";

export const SOURCE_LABEL: Record<SourceKey, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  whatsapp: "WhatsApp",
  website: "Website",
  webhook: "Webhook",
};

export interface CrmLead extends PipelineLead {
  email?: string;
  externalId?: string; // leadgen_id / google lead_id / wa_id
  sourceKey?: SourceKey;
  campaign?: string;
  formName?: string;
  extra?: Record<string, string>;
  isTest?: boolean;
  location?: string;
  centreId?: string;
}

export interface IncomingLead {
  sourceKey: SourceKey;
  /** Display label, e.g. "Meta Ads", "Instagram", "JustDial". Defaults from sourceKey. */
  source?: string;
  externalId?: string;
  name?: string;
  phone?: string;
  email?: string;
  interest?: string;
  campaign?: string;
  formName?: string;
  message?: string;
  extra?: Record<string, string>;
  createdAt?: string;
  isTest?: boolean;
  location?: string;
  centreId?: string;
  owner?: string;
  value?: number;
  stage?: Stage;
}

export interface IngestEvent {
  at: string;
  sourceKey: SourceKey;
  source: string;
  result: "created" | "duplicate" | "error";
  leadId?: string;
  name?: string;
  detail?: string;
}

interface State {
  rr: number;
  counts: Partial<Record<SourceKey, number>>;
  last: Partial<Record<SourceKey, string>>;
  metaSyncedUntil?: number; // unix seconds
}

/* ───────── file helpers (serialised to avoid interleaved writes) ───────── */

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
  const tmp = `${file}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, file);
  } catch {
    try {
      await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
    } finally {
      await fs.unlink(tmp).catch(() => {});
    }
  }
}

const DEMO_NAMES = new Set([
  "aarav sharma",
  "diya patel",
  "rohan iyer",
  "meera nair",
  "rohan verma",
  "kavya menon",
  "ananya r",
]);

const DEMO_PHONES = new Set([
  "9876543210",
  "9123456780",
  "9988776655",
  "9999999999",
  "1234567890",
  "0000000000",
]);

export function isTestOrDemoLead(lead: CrmLead): boolean {
  if (!lead) return false;
  if (lead.isTest) return true;
  const name = (lead.name || "").trim().toLowerCase();
  if (DEMO_NAMES.has(name)) return true;
  if (/\b(test|testing|demo|sample|dummy|fake)\b/i.test(name)) return true;
  if (/^(test parent|google test|wa test|web test|justdial test)\b/i.test(name)) return true;
  const email = (lead.email || "").trim().toLowerCase();
  if (email && (/@(example|test)\.com$/i.test(email) || email === "aarav.parent@gmail.com" || email === "diya.p@yahoo.com")) {
    return true;
  }
  const ext = (lead.externalId || "").trim();
  if (/^(meta:TEST|google:TeSter-|justdial:JD|wamid\.TEST)/i.test(ext)) return true;
  const digits = (lead.phone || "").replace(/\D/g, "").slice(-10);
  if (digits && DEMO_PHONES.has(digits)) return true;
  return false;
}

async function readLeads(): Promise<CrmLead[]> {
  if (isDbConfigured()) {
    try {
      const dbLeads = await getDbLeads();
      if (dbLeads && Array.isArray(dbLeads)) {
        const testIds = dbLeads.filter((l) => isTestOrDemoLead(l)).map((l) => l.id);
        const cleanLeads = dbLeads.filter((l) => !isTestOrDemoLead(l));
        if (testIds.length > 0) {
          void deleteDbLeadsByIds(testIds);
        }
        let migrated = false;
        for (const l of cleanLeads) {
          if ((l.stage as string) === "Demo") {
            l.stage = "BMIT";
            migrated = true;
          }
        }
        if (migrated && cleanLeads.length > 0) {
          void saveDbLeadsBulk(cleanLeads);
        }
        await writeJson(LEADS_FILE, cleanLeads).catch(() => {});
        return cleanLeads;
      }
    } catch (e) {
      console.warn("[crm] failed to read from db, falling back to file:", e);
    }
  }

  let leads = await readJson<CrmLead[] | null>(LEADS_FILE, null);
  if (leads === null) {
    const candidates = [
      path.join(DATA_DIR, "crm-leads.json"),
      path.join(process.cwd(), "apps", "web", "crm-leads.json"),
      path.join(process.cwd(), "crm-leads.json"),
    ];
    for (const cand of candidates) {
      if (cand !== LEADS_FILE) {
        const found = await readJson<CrmLead[] | null>(cand, null);
        if (found && Array.isArray(found)) {
          leads = found;
          await writeJson(LEADS_FILE, leads).catch(() => {});
          break;
        }
      }
    }
  }

  if (leads && Array.isArray(leads)) {
    const hadTests = leads.some((l) => isTestOrDemoLead(l));
    const cleanLeads = leads.filter((l) => !isTestOrDemoLead(l));
    let migrated = hadTests;
    for (const l of cleanLeads) {
      if ((l.stage as string) === "Demo") {
        l.stage = "BMIT";
        migrated = true;
      }
    }
    if (migrated) {
      await writeJson(LEADS_FILE, cleanLeads).catch(() => {});
    }
    if (isDbConfigured() && cleanLeads.length > 0) {
      void saveDbLeadsBulk(cleanLeads);
    }
    return cleanLeads;
  }
  await writeJson(LEADS_FILE, []);
  return [];
}

function sourceKeyFor(label: string): SourceKey {
  const s = label.toLowerCase();
  if (s.includes("meta") || s.includes("facebook") || s.includes("instagram")) return "meta";
  if (s.includes("google")) return "google";
  if (s.includes("whatsapp")) return "whatsapp";
  if (s.includes("website")) return "website";
  return "webhook";
}

/* ───────── normalisation ───────── */

/** Normalise Indian / international numbers to E.164-ish "+91XXXXXXXXXX". */
export function normalisePhone(raw?: string): string {
  if (!raw) return "";
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  const d = digits.replace(/^0+/, "");
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d}`;
  return d ? `+${d}` : "";
}

const phoneKey = (p?: string) => (p ? p.replace(/\D/g, "").slice(-10) : "");

export function prettyPhone(p: string) {
  const m = p.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : p;
}

const clip = (s: unknown, n: number) => (s === undefined || s === null ? "" : String(s).trim().slice(0, n));

/* ───────── public API ───────── */

export async function listLeads(): Promise<CrmLead[]> {
  return serial(readLeads);
}

export async function readLog(): Promise<IngestEvent[]> {
  const all = await readJson<IngestEvent[]>(LOG_FILE, []);
  const clean = all.filter((e) => !e.name || !/\b(test|testing|demo|sample|dummy|fake)\b/i.test(e.name));
  if (clean.length !== all.length) {
    await writeJson(LOG_FILE, clean).catch(() => {});
  }
  return clean;
}

export async function readState(): Promise<State> {
  return readJson<State>(STATE_FILE, { rr: 0, counts: {}, last: {} });
}

export async function setMetaCursor(unix: number) {
  return serial(async () => {
    const st = await readState();
    st.metaSyncedUntil = unix;
    await writeJson(STATE_FILE, st);
  });
}

async function log(ev: IngestEvent) {
  const all = await readJson<IngestEvent[]>(LOG_FILE, []);
  all.unshift(ev);
  await writeJson(LOG_FILE, all.slice(0, 200));
}

export async function logError(sourceKey: SourceKey, detail: string) {
  return serial(() => log({ at: new Date().toISOString(), sourceKey, source: SOURCE_LABEL[sourceKey], result: "error", detail: clip(detail, 300) }));
}

/**
 * Create or merge a lead. Duplicate = same external id, or same phone (last 10 digits), or same email.
 * Duplicates get a timeline entry ("Re-enquired via …") instead of a new card.
 */
export async function ingestLead(input: IncomingLead): Promise<{ result: "created" | "duplicate"; lead: CrmLead }> {
  return serial(async () => {
    const leads = await readLeads();
    const st = await readState();
    const source = clip(input.source || SOURCE_LABEL[input.sourceKey], 40);
    const phone = normalisePhone(input.phone);
    const email = clip(input.email, 160).toLowerCase();
    const now = input.createdAt ? new Date(input.createdAt) : new Date();
    const when = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    const dup = leads.find(
      (l) =>
        (input.externalId && l.externalId === input.externalId) ||
        (phone && phoneKey(l.phone) === phoneKey(phone)) ||
        (email && l.email && l.email.toLowerCase() === email),
    );

    if (dup) {
      const already = input.externalId && dup.externalId === input.externalId && dup.timeline.some((t) => t.what.includes(input.externalId!));
      if (!already) {
        dup.timeline.push({
          when,
          what: `Re-enquired via ${source}${input.interest ? ` — ${clip(input.interest, 80)}` : ""}${input.message ? `: “${clip(input.message, 120)}”` : ""}`,
        });
        dup.lastActivity = "Just now";
        if (["Dropped"].includes(dup.stage)) dup.stage = "Enquiry";
        await writeJson(LEADS_FILE, leads);
        if (isDbConfigured()) {
          void saveDbLead(dup);
        }
      }
      await log({ at: new Date().toISOString(), sourceKey: input.sourceKey, source, result: "duplicate", leadId: dup.id, name: dup.name });
      return { result: "duplicate" as const, lead: dup };
    }

    const owner = input.owner || AGENTS[st.rr % AGENTS.length];
    const lead: CrmLead = {
      id: `L-${Date.now().toString(36).toUpperCase()}`,
      name: clip(input.name, 120) || (phone ? `Lead ${prettyPhone(phone)}` : "Unknown lead"),
      phone: prettyPhone(phone),
      email: email || undefined,
      interest: clip(input.interest, 120) || clip(input.formName, 120) || "General enquiry",
      source,
      sourceKey: input.sourceKey,
      stage: input.stage || "Enquiry",
      owner,
      value: typeof input.value === "number" ? input.value : 0,
      location: clip(input.location, 120) || undefined,
      centreId: clip(input.centreId, 32) || undefined,
      createdAt: now.toISOString(),
      lastActivity: "Just now",
      externalId: input.externalId,
      campaign: clip(input.campaign, 120) || undefined,
      formName: clip(input.formName, 120) || undefined,
      extra: input.extra,
      isTest: input.isTest || undefined,
      timeline: [
        {
          when,
          what: `Lead captured from ${source}${input.location ? ` (${input.location})` : ""}${input.formName ? ` · form “${clip(input.formName, 60)}”` : ""}${input.campaign ? ` · ${clip(input.campaign, 60)}` : ""}${input.externalId ? ` · ref ${input.externalId}` : ""}`,
        },
        ...(input.message ? [{ when, what: `Message: “${clip(input.message, 200)}”` }] : []),
        { when, what: input.owner ? `Assigned to ${owner} (${input.location || "Centre"})` : `Auto-assigned to ${owner} (round-robin)` },
      ],
    };
    leads.unshift(lead);
    st.rr = (st.rr + 1) % AGENTS.length;
    st.counts[input.sourceKey] = (st.counts[input.sourceKey] ?? 0) + 1;
    st.last[input.sourceKey] = new Date().toISOString();
    await writeJson(LEADS_FILE, leads);
    if (isDbConfigured()) {
      void saveDbLead(lead);
    }
    await writeJson(STATE_FILE, st);
    await log({ at: new Date().toISOString(), sourceKey: input.sourceKey, source, result: "created", leadId: lead.id, name: lead.name });
    // WhatsApp welcome (loaded lazily: the WhatsApp module isn't needed for ingestion itself)
    void import("@/lib/whatsapp/automations").then((m) => m.leadCreated(lead)).catch(() => undefined);
    return { result: "created" as const, lead };
  });
}

export async function updateLead(
  id: string,
  patch: { stage?: Stage; owner?: string; value?: number; activity?: string; extra?: Record<string, any> },
): Promise<CrmLead | null> {
  return serial(async () => {
    const leads = await readLeads();
    const l = leads.find((x) => x.id === id);
    if (!l) return null;
    const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    if (patch.stage && STAGES.includes(patch.stage) && patch.stage !== l.stage) {
      l.stage = patch.stage;
      l.timeline.push({ when, what: `Moved to ${patch.stage}` });
    }
    if (patch.owner && patch.owner !== l.owner) {
      l.owner = clip(patch.owner, 60);
      l.timeline.push({ when, what: `Reassigned to ${l.owner}` });
    }
    if (typeof patch.value === "number" && patch.value >= 0) l.value = patch.value;
    if (patch.extra && typeof patch.extra === "object") {
      l.extra = { ...(l.extra || {}), ...patch.extra };
    }
    if (patch.activity) l.timeline.push({ when, what: clip(patch.activity, 300) });
    l.slaBreached = false;
    l.lastActivity = "Just now";
    await writeJson(LEADS_FILE, leads);
    if (isDbConfigured()) {
      void saveDbLead(l);
    }
    return l;
  });
}

export async function bulkIngestLeads(
  inputs: (IncomingLead & { owner?: string; value?: number; stage?: Stage })[]
): Promise<{ created: number; duplicate: number; total: number; leads: CrmLead[] }> {
  return serial(async () => {
    const leads = await readLeads();
    const st = await readState();
    let createdCount = 0;
    let duplicateCount = 0;
    const now = new Date();
    const when = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const results: CrmLead[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const sourceKey = input.sourceKey || "webhook";
      const source = clip(input.source || SOURCE_LABEL[sourceKey] || "Bulk Upload", 40);
      const phone = normalisePhone(input.phone);
      const email = clip(input.email, 160).toLowerCase();

      // Check duplicate against existing leads
      const dup = leads.find(
        (l) =>
          (input.externalId && l.externalId === input.externalId) ||
          (phone && phoneKey(l.phone) === phoneKey(phone)) ||
          (email && l.email && l.email.toLowerCase() === email)
      );

      if (dup) {
        dup.timeline.push({
          when,
          what: `Re-enquired via ${source} (Bulk Upload)${input.interest ? ` — ${clip(input.interest, 80)}` : ""}`,
        });
        dup.lastActivity = "Just now";
        if (input.owner && AGENTS.includes(input.owner)) dup.owner = input.owner;
        if (typeof input.value === "number" && input.value > 0) dup.value = input.value;
        if (input.stage && STAGES.includes(input.stage)) dup.stage = input.stage;
        duplicateCount++;
        results.push(dup);
      } else {
        const owner =
          input.owner && AGENTS.includes(input.owner)
            ? input.owner
            : AGENTS[st.rr % AGENTS.length];

        const stage: Stage =
          input.stage && STAGES.includes(input.stage) ? input.stage : "Enquiry";

        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const lead: CrmLead = {
          id: `L-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`,
          name: clip(input.name, 120) || (phone ? `Lead ${prettyPhone(phone)}` : "Unknown lead"),
          phone: prettyPhone(phone),
          email: email || undefined,
          interest: clip(input.interest, 120) || "General enquiry",
          source,
          sourceKey,
          stage,
          owner,
          value: typeof input.value === "number" ? Math.max(0, input.value) : 0,
          createdAt: now.toISOString(),
          lastActivity: "Just now",
          externalId: input.externalId,
          campaign: clip(input.campaign, 120) || undefined,
          formName: clip(input.formName, 120) || undefined,
          timeline: [
            {
              when,
              what: `Imported via Bulk Upload · Source: ${source}${input.campaign ? ` · ${clip(input.campaign, 60)}` : ""}`,
            },
            { when, what: `Assigned to ${owner}` },
          ],
        };

        leads.unshift(lead);
        st.rr = (st.rr + 1) % AGENTS.length;
        st.counts[sourceKey] = (st.counts[sourceKey] ?? 0) + 1;
        st.last[sourceKey] = now.toISOString();
        createdCount++;
        results.push(lead);
      }
    }

    await writeJson(LEADS_FILE, leads);
    if (isDbConfigured()) {
      void saveDbLeadsBulk(leads);
    }
    await writeJson(STATE_FILE, st);

    await recordAuditLog({
      action: "CREATE",
      module: "Leads",
      entityId: `BULK-${Date.now()}`,
      entityName: `Bulk Upload (${inputs.length} leads)`,
      summary: `Bulk imported ${inputs.length} leads: ${createdCount} created, ${duplicateCount} merged/duplicate`,
      newData: { total: inputs.length, created: createdCount, duplicate: duplicateCount },
    }).catch(() => {});

    return {
      created: createdCount,
      duplicate: duplicateCount,
      total: inputs.length,
      leads: results,
    };
  });
}

export async function deleteLead(id: string): Promise<boolean> {
  return serial(async () => {
    const leads = await readLeads();
    const target = leads.find((l) => l.id === id);
    const next = leads.filter((l) => l.id !== id);
    await writeJson(LEADS_FILE, next);
    if (isDbConfigured()) {
      await deleteDbLead(id);
    }
    const logs = await readJson<IngestEvent[]>(LOG_FILE, []);
    const cleanLogs = logs.filter((e) => e.leadId !== id && (!target?.name || e.name !== target.name));
    if (cleanLogs.length !== logs.length) {
      await writeJson(LOG_FILE, cleanLogs).catch(() => {});
    }
    return leads.length !== next.length;
  });
}

export async function removeTestLeads(): Promise<{ removed: number; remaining: number }> {
  return serial(async () => {
    let all: CrmLead[] = [];
    if (isDbConfigured()) {
      const dbLeads = await getDbLeads().catch(() => null);
      if (dbLeads && Array.isArray(dbLeads)) {
        all = dbLeads;
      }
    }
    if (!all.length) {
      all = await readJson<CrmLead[]>(LEADS_FILE, []);
    }
    const toRemove = all.filter((l) => isTestOrDemoLead(l));
    const remaining = all.filter((l) => !isTestOrDemoLead(l));
    if (isDbConfigured() && toRemove.length > 0) {
      await deleteDbLeadsByIds(toRemove.map((l) => l.id));
    }
    await writeJson(LEADS_FILE, remaining);
    const logs = await readJson<IngestEvent[]>(LOG_FILE, []);
    const removedIds = new Set(toRemove.map((l) => l.id));
    const cleanLogs = logs.filter(
      (e) =>
        (!e.leadId || !removedIds.has(e.leadId)) &&
        (!e.name || !/\b(test|testing|demo|sample|dummy|fake)\b/i.test(e.name))
    );
    await writeJson(LOG_FILE, cleanLogs).catch(() => {});
    return { removed: toRemove.length, remaining: remaining.length };
  });
}

export async function clearAllLeads(): Promise<{ removed: number }> {
  return serial(async () => {
    const existing = await readLeads();
    await writeJson(LEADS_FILE, []);
    await writeJson(LOG_FILE, []);
    await writeJson(STATE_FILE, { rr: 0, counts: {}, last: {} });
    if (isDbConfigured()) {
      await clearDbLeads();
    }
    return { removed: existing.length };
  });
}


