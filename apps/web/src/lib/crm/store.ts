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
import { DATA_DIR } from "@/lib/data-dir";
import { AGENTS, PIPELINE, STAGES, type PipelineLead, type Stage } from "@qschool/shared";

const DIR = DATA_DIR;
const LEADS_FILE = path.join(DIR, "crm-leads.json");
const LOG_FILE = path.join(DIR, "crm-ingest-log.json");
const STATE_FILE = path.join(DIR, "crm-state.json");

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
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

async function readLeads(): Promise<CrmLead[]> {
  const leads = await readJson<CrmLead[] | null>(LEADS_FILE, null);
  if (leads) return leads;
  // First run: seed with the demo pipeline so the board isn't empty.
  const seed: CrmLead[] = PIPELINE.map((l) => ({ ...l, sourceKey: sourceKeyFor(l.source) }));
  await writeJson(LEADS_FILE, seed);
  return seed;
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
  return readJson<IngestEvent[]>(LOG_FILE, []);
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
      }
      await log({ at: new Date().toISOString(), sourceKey: input.sourceKey, source, result: "duplicate", leadId: dup.id, name: dup.name });
      return { result: "duplicate" as const, lead: dup };
    }

    const owner = AGENTS[st.rr % AGENTS.length];
    const lead: CrmLead = {
      id: `L-${Date.now().toString(36).toUpperCase()}`,
      name: clip(input.name, 120) || (phone ? `Lead ${prettyPhone(phone)}` : "Unknown lead"),
      phone: prettyPhone(phone),
      email: email || undefined,
      interest: clip(input.interest, 120) || clip(input.formName, 120) || "General enquiry",
      source,
      sourceKey: input.sourceKey,
      stage: "Enquiry",
      owner,
      value: 0,
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
          what: `Lead captured from ${source}${input.formName ? ` · form “${clip(input.formName, 60)}”` : ""}${input.campaign ? ` · ${clip(input.campaign, 60)}` : ""}${input.externalId ? ` · ref ${input.externalId}` : ""}`,
        },
        ...(input.message ? [{ when, what: `Message: “${clip(input.message, 200)}”` }] : []),
        { when, what: `Auto-assigned to ${owner} (round-robin)` },
      ],
    };
    leads.unshift(lead);
    st.rr = (st.rr + 1) % AGENTS.length;
    st.counts[input.sourceKey] = (st.counts[input.sourceKey] ?? 0) + 1;
    st.last[input.sourceKey] = new Date().toISOString();
    await writeJson(LEADS_FILE, leads);
    await writeJson(STATE_FILE, st);
    await log({ at: new Date().toISOString(), sourceKey: input.sourceKey, source, result: "created", leadId: lead.id, name: lead.name });
    // WhatsApp welcome (loaded lazily: the WhatsApp module isn't needed for ingestion itself)
    void import("@/lib/whatsapp/automations").then((m) => m.leadCreated(lead)).catch(() => undefined);
    return { result: "created" as const, lead };
  });
}

export async function updateLead(
  id: string,
  patch: { stage?: Stage; owner?: string; value?: number; activity?: string },
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
    if (patch.activity) l.timeline.push({ when, what: clip(patch.activity, 300) });
    l.slaBreached = false;
    l.lastActivity = "Just now";
    await writeJson(LEADS_FILE, leads);
    return l;
  });
}
