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
import { persistRead, persistWrite } from "@/lib/persist";
import { recordAuditLog } from "@/lib/audit/store";
import { enrollLeadAsStudent, syncAdmittedLeads } from "@/lib/students/store";
import { AGENTS, PIPELINE, STAGES, centreName, leadCentreId, resolveCentreId, studentPayments, type PipelineLead, type Stage } from "@qschool/shared";
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
  /** Ids of deleted leads (last 500), so a stale local copy is never re-synced back. */
  deleted?: string[];
}

/* ───────── file helpers (serialised to avoid interleaved writes) ───────── */

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

/** Lead-source log & counters (and deleted-lead tombstones) live in the database so every server instance agrees. */
const shared = (file: string) => file === LOG_FILE || file === STATE_FILE;

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(shared(file) ? await persistRead(file) : await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  if (shared(file)) {
    await persistWrite(file, JSON.stringify(data, null, 2));
    return;
  }
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

/**
 * Old bundled sample data (seeded demo pipeline / connector test pings). Only these are hidden on read.
 * Leads that merely *look* like tests (name "Test", phone 9999999999) are kept and badged "Test" —
 * they are removed only when an admin clicks "Remove test leads". Previously every read silently
 * deleted them, so a test lead created to verify the flow vanished within seconds.
 */
function isSeedDemoLead(lead: CrmLead): boolean {
  if (!lead) return false;
  const ext = (lead.externalId || "").trim();
  if (/^(meta:TEST|google:TeSter-|justdial:JD|wamid\.TEST)/i.test(ext)) return true;
  const email = (lead.email || "").trim().toLowerCase();
  if (email === "aarav.parent@gmail.com" || email === "diya.p@yahoo.com") return true;
  const name = (lead.name || "").trim().toLowerCase();
  const digits = (lead.phone || "").replace(/\D/g, "").slice(-10);
  return DEMO_NAMES.has(name) && DEMO_PHONES.has(digits);
}

/** Normalise stored leads. `changed` lists leads whose fields were fixed (to be re-saved); `seedIds` are sample rows to drop. */
function migrate(leads: CrmLead[]): { leads: CrmLead[]; changed: CrmLead[]; seedIds: string[] } {
  const changed: CrmLead[] = [];
  const seedIds = leads.filter((l) => l && l.id && isSeedDemoLead(l)).map((l) => l.id);
  const out = leads.filter((l) => l && l.id && !isSeedDemoLead(l));
  for (const l of out) {
    let dirty = false;
    if ((l.stage as string) === "Demo") {
      l.stage = "BMIT";
      dirty = true;
    }
    if (!Array.isArray(l.timeline)) {
      l.timeline = [];
      dirty = true;
    }
    // Pin free-text locations ("Chennai – Adyar") to a branch so centre filters / centre heads see them.
    const cid = leadCentreId(l);
    if (cid && l.centreId !== cid) {
      l.centreId = cid;
      dirty = true;
    }
    if (cid && !l.location) {
      l.location = centreName(cid);
      dirty = true;
    }
    if (!l.isTest && isTestOrDemoLead(l)) {
      l.isTest = true;
      dirty = true;
    }
    if (dirty) changed.push(l);
  }
  return { leads: out, changed, seedIds };
}

async function readLeads(): Promise<CrmLead[]> {
  const fileLeads = await readJson<CrmLead[] | null>(LEADS_FILE, null);

  if (isDbConfigured()) {
    try {
      const dbLeads = await getDbLeads();
      if (dbLeads && Array.isArray(dbLeads)) {
        // Union with the local file: a lead whose DB write failed recently must not disappear from the
        // pipeline. Only recent (24h), never-deleted leads qualify, so a lead deleted on another server
        // instance is not resurrected from a stale local copy. Orphans are re-synced to the DB.
        const dbIds = new Set(dbLeads.map((l: CrmLead) => l.id));
        const st = await readState();
        const tomb = new Set(st.deleted ?? []);
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const orphans = (fileLeads ?? []).filter(
          (l) => l && l.id && !dbIds.has(l.id) && !tomb.has(l.id) && Date.parse(l.createdAt || "") > cutoff,
        );
        const merged = [...orphans, ...dbLeads].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        const { leads, changed, seedIds } = migrate(merged);
        const toSave = new Map<string, CrmLead>();
        for (const l of [...orphans, ...changed]) if (!seedIds.includes(l.id)) toSave.set(l.id, l);
        if (toSave.size) await saveDbLeadsBulk([...toSave.values()]);
        if (seedIds.length) await deleteDbLeadsByIds(seedIds.filter((id) => dbIds.has(id)));
        await writeJson(LEADS_FILE, leads).catch(() => {});
        return leads;
      }
    } catch (e) {
      console.warn("[crm] failed to read from db, falling back to file:", e);
    }
  }

  let leads = fileLeads;
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
    const res = migrate(leads);
    if (res.changed.length || res.seedIds.length) await writeJson(LEADS_FILE, res.leads).catch(() => {});
    return res.leads;
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

/** Unique lead id (timestamp alone collides when two leads arrive in the same millisecond). */
const newLeadId = () => `L-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/* ───────── public API ───────── */

export async function listLeads(): Promise<CrmLead[]> {
  return serial(readLeads);
}

export async function readLog(): Promise<IngestEvent[]> {
  // Test pings are kept: they're how staff confirm a connector works.
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
          what: `Re-enquired via ${source}${input.interest ? ` — ${clip(input.interest, 80)}` : ""}${input.location ? ` (${clip(input.location, 60)})` : ""}${input.message ? `: “${clip(input.message, 120)}”` : ""}`,
        });
        dup.lastActivity = "Just now";
        if (["Dropped"].includes(dup.stage)) dup.stage = "Enquiry";
        // A re-enquiry that names a branch fills in a lead that had none (it used to be ignored, so the
        // lead never showed under that location).
        const cid = clip(input.centreId, 32) || resolveCentreId(input.location);
        if (cid && !leadCentreId(dup)) {
          dup.centreId = cid;
          dup.location = centreName(cid);
        } else if (!dup.location && input.location) {
          dup.location = clip(input.location, 120);
        }
        if (input.isTest) dup.isTest = true;
        // An admission form for a parent who is already a lead moves that lead forward to Application
        // (never to Admitted: that happens only on payment) and links the new student record.
        const behind = STAGES.indexOf(dup.stage) < STAGES.indexOf("Application") || dup.stage === "Dropped";
        if (input.stage === "Application" && behind) {
          dup.timeline.push({ when, what: `Moved to Application (admission form submitted, was ${dup.stage})` });
          dup.stage = "Application";
        }
        if (input.extra) {
          const add: Record<string, string> = {};
          for (const [k, v] of Object.entries(input.extra)) if (!(dup.extra && k in dup.extra)) add[k] = v;
          if (Object.keys(add).length) dup.extra = { ...(dup.extra || {}), ...add };
        }
        if (dup.stage === "Application" || dup.stage === "Admitted") {
          try {
            const { student } = await enrollLeadAsStudent(dup);
            if (dup.extra?.["Student ID"] !== student.id) dup.extra = { ...(dup.extra || {}), "Student ID": student.id };
          } catch (e) {
            console.error("[crm] failed to link student for re-enquiring lead:", e);
          }
        }
        await writeJson(LEADS_FILE, leads);
        if (isDbConfigured()) await saveDbLead(dup);
      }
      await log({ at: new Date().toISOString(), sourceKey: input.sourceKey, source, result: "duplicate", leadId: dup.id, name: dup.name });
      return { result: "duplicate" as const, lead: dup };
    }

    const centreId = clip(input.centreId, 32) || resolveCentreId(input.location) || undefined;
    const location = centreId ? centreName(centreId) : clip(input.location, 120) || undefined;
    const owner = input.owner || AGENTS[st.rr % AGENTS.length];
    const lead: CrmLead = {
      id: newLeadId(),
      name: clip(input.name, 120) || (phone ? `Lead ${prettyPhone(phone)}` : "Unknown lead"),
      phone: prettyPhone(phone),
      email: email || undefined,
      interest: clip(input.interest, 120) || clip(input.formName, 120) || "General enquiry",
      source,
      sourceKey: input.sourceKey,
      // A new lead never starts as Admitted: that needs a recorded payment. Forms arrive as Application.
      stage: input.stage && STAGES.includes(input.stage) ? (input.stage === "Admitted" ? "Application" : input.stage) : "Enquiry",
      owner,
      value: typeof input.value === "number" ? input.value : 0,
      location,
      centreId,
      createdAt: now.toISOString(),
      lastActivity: "Just now",
      externalId: input.externalId,
      campaign: clip(input.campaign, 120) || undefined,
      formName: clip(input.formName, 120) || undefined,
      extra: input.extra,
      isTest: undefined,
      timeline: [
        {
          when,
          what: `Lead captured from ${source}${location ? ` (${location})` : ""}${input.formName ? ` · form “${clip(input.formName, 60)}”` : ""}${input.campaign ? ` · ${clip(input.campaign, 60)}` : ""}${input.externalId ? ` · ref ${input.externalId}` : ""}`,
        },
        ...(input.message ? [{ when, what: `Message: “${clip(input.message, 200)}”` }] : []),
        { when, what: input.owner ? `Assigned to ${owner} (${location || "Centre"})` : `Auto-assigned to ${owner} (round-robin)` },
      ],
    };
    if (input.isTest || isTestOrDemoLead(lead)) lead.isTest = true;
    leads.unshift(lead);
    if (!input.owner) st.rr = (st.rr + 1) % AGENTS.length;
    st.counts[input.sourceKey] = (st.counts[input.sourceKey] ?? 0) + 1;
    st.last[input.sourceKey] = new Date().toISOString();
    await writeJson(LEADS_FILE, leads);
    // Awaited: on serverless hosts a fire-and-forget write can be frozen after the response is sent,
    // and the next read (from the DB) would then not contain the new lead.
    if (isDbConfigured()) await saveDbLead(lead);
    await writeJson(STATE_FILE, st);
    await log({ at: new Date().toISOString(), sourceKey: input.sourceKey, source, result: "created", leadId: lead.id, name: lead.name });
    if (lead.stage === "Application") {
      try {
        const { student } = await enrollLeadAsStudent(lead);
        lead.extra = { ...(lead.extra || {}), "Student ID": student.id };
        lead.timeline.push({ when, what: `Automatically enrolled in Students (${student.id}) · Pending until the first fee payment` });
        await writeJson(LEADS_FILE, leads);
        if (isDbConfigured()) await saveDbLead(lead);
      } catch (e) {
        console.error("[crm] failed to auto-enroll admitted lead:", e);
      }
    }
    // WhatsApp welcome (loaded lazily: the WhatsApp module isn't needed for ingestion itself)
    void import("@/lib/whatsapp/automations").then((m) => m.leadCreated(lead)).catch(() => undefined);
    return { result: "created" as const, lead };
  });
}

export async function updateLead(
  id: string,
  patch: { stage?: Stage; owner?: string; value?: number; activity?: string; extra?: Record<string, any> },
  opts: { paid?: boolean } = {},
): Promise<CrmLead | null> {
  return serial(async () => {
    const leads = await readLeads();
    const l = leads.find((x) => x.id === id);
    if (!l) return null;
    const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    let stageChange: { from: string; to: string } | null = null;
    if (patch.stage && STAGES.includes(patch.stage) && patch.stage !== l.stage) {
      stageChange = { from: l.stage, to: patch.stage };
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
    if (l.stage === "Application" || l.stage === "Admitted") {
      let hasPayment = !!opts.paid;
      try {
        const { student, created } = await enrollLeadAsStudent(l);
        if (l.extra?.["Student ID"] !== student.id) {
          l.extra = { ...(l.extra || {}), "Student ID": student.id };
        }
        if (created) {
          l.timeline.push({ when, what: `Automatically enrolled in Students (${student.id}) · Pending until the first fee payment` });
        }
        if (studentPayments(student).length > 0) hasPayment = true;
      } catch (e) {
        console.error("[crm] failed to auto-enroll lead:", e);
      }
      // Admitted = fee paid. Moving a lead there by hand before any payment keeps it at Application;
      // it moves to Admitted automatically when the first payment is recorded.
      if (stageChange && stageChange.to === "Admitted" && !hasPayment) {
        l.stage = "Application";
        const k = l.timeline.map((t) => t.what).lastIndexOf("Moved to Admitted");
        if (k >= 0) l.timeline.splice(k, 1);
        l.timeline.push({ when, what: "Kept at Application: the lead becomes Admitted automatically once the first fee payment is recorded" });
        stageChange = stageChange.from === "Application" ? null : { from: stageChange.from, to: "Application" };
      }
    }
    l.slaBreached = false;
    l.lastActivity = "Just now";
    await writeJson(LEADS_FILE, leads);
    if (isDbConfigured()) await saveDbLead(l);
    if (stageChange) {
      await recordAuditLog({
        action: "STATUS_CHANGE",
        module: "Leads",
        entityId: l.id,
        entityName: l.name,
        summary: `Lead ${l.name} moved ${stageChange.from} → ${stageChange.to} (${l.owner})`,
        previousData: { stage: stageChange.from },
        newData: { stage: stageChange.to, owner: l.owner },
      }).catch(() => {});
    }
    return l;
  });
}

/** Find the lead for a phone number (last 10 digits) and apply a stage / timeline update. Used by BMIT bookings & check-ins. */
export async function updateLeadByPhone(
  phone: string,
  patch: { stage?: Stage; activity?: string; extra?: Record<string, any>; onlyFromStages?: Stage[] },
  opts: { paid?: boolean } = {},
): Promise<CrmLead | null> {
  const key = phoneKey(phone);
  if (!key) return null;
  const lead = (await listLeads()).find((l) => phoneKey(l.phone) === key);
  if (!lead) return null;
  const stage = patch.stage && (!patch.onlyFromStages || patch.onlyFromStages.includes(lead.stage)) ? patch.stage : undefined;
  return updateLead(lead.id, { stage, activity: patch.activity, extra: patch.extra }, opts);
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
    const touched = new Map<string, CrmLead>();

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
        const dupCid = clip(input.centreId, 32) || resolveCentreId(input.location);
        if (dupCid && !leadCentreId(dup)) {
          dup.centreId = dupCid;
          dup.location = centreName(dupCid);
        }
        duplicateCount++;
        results.push(dup);
        touched.set(dup.id, dup);
      } else {
        const owner =
          input.owner && AGENTS.includes(input.owner)
            ? input.owner
            : AGENTS[st.rr % AGENTS.length];

        const stage: Stage =
          input.stage && STAGES.includes(input.stage) ? input.stage : "Enquiry";

        const centreId = clip(input.centreId, 32) || resolveCentreId(input.location) || undefined;
        const location = centreId ? centreName(centreId) : clip(input.location, 120) || undefined;
        const lead: CrmLead = {
          id: newLeadId(),
          name: clip(input.name, 120) || (phone ? `Lead ${prettyPhone(phone)}` : "Unknown lead"),
          phone: prettyPhone(phone),
          email: email || undefined,
          interest: clip(input.interest, 120) || "General enquiry",
          source,
          sourceKey,
          stage,
          owner,
          value: typeof input.value === "number" ? Math.max(0, input.value) : 0,
          location,
          centreId,
          createdAt: now.toISOString(),
          lastActivity: "Just now",
          externalId: input.externalId,
          campaign: clip(input.campaign, 120) || undefined,
          formName: clip(input.formName, 120) || undefined,
          timeline: [
            {
              when,
              what: `Imported via Bulk Upload · Source: ${source}${location ? ` (${location})` : ""}${input.campaign ? ` · ${clip(input.campaign, 60)}` : ""}`,
            },
            { when, what: `Assigned to ${owner}` },
          ],
        };
        if (input.isTest || isTestOrDemoLead(lead)) lead.isTest = true;

        leads.unshift(lead);
        st.rr = (st.rr + 1) % AGENTS.length;
        st.counts[sourceKey] = (st.counts[sourceKey] ?? 0) + 1;
        st.last[sourceKey] = now.toISOString();
        createdCount++;
        results.push(lead);
        touched.set(lead.id, lead);
      }
    }

    await writeJson(LEADS_FILE, leads);
    // Only the rows this upload touched (it used to re-write every lead in the CRM, fire-and-forget).
    if (isDbConfigured() && touched.size) await saveDbLeadsBulk([...touched.values()]);
    await writeJson(STATE_FILE, st);
    const bulkAdmitted = results.filter((l) => l.stage === "Admitted");
    if (bulkAdmitted.length > 0) {
      await syncAdmittedLeads(bulkAdmitted).catch((e) => console.error("[crm] bulk syncAdmittedLeads failed:", e));
    }

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
    await tombstone([id]);
    const logs = await readJson<IngestEvent[]>(LOG_FILE, []);
    const cleanLogs = logs.filter((e) => e.leadId !== id && (!target?.name || e.name !== target.name));
    if (cleanLogs.length !== logs.length) {
      await writeJson(LOG_FILE, cleanLogs).catch(() => {});
    }
    return leads.length !== next.length;
  });
}

/** Delete several leads at once (admin bulk delete). Returns how many existed and were removed. */
export async function deleteLeads(ids: string[]): Promise<number> {
  const set = new Set(ids);
  if (!set.size) return 0;
  return serial(async () => {
    const leads = await readLeads();
    const next = leads.filter((l) => !set.has(l.id));
    await writeJson(LEADS_FILE, next);
    if (isDbConfigured()) await deleteDbLeadsByIds([...set]);
    await tombstone([...set]);
    const logs = await readJson<IngestEvent[]>(LOG_FILE, []);
    const cleanLogs = logs.filter((e) => !e.leadId || !set.has(e.leadId));
    if (cleanLogs.length !== logs.length) await writeJson(LOG_FILE, cleanLogs).catch(() => {});
    return leads.length - next.length;
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
    await tombstone(toRemove.map((l) => l.id));
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
    await tombstone(existing.map((l) => l.id));
    return { removed: existing.length };
  });
}

/** Remember deleted ids so the DB/file union in readLeads never re-syncs them back. */
async function tombstone(ids: string[]) {
  if (!ids.length) return;
  const st = await readState();
  st.deleted = [...ids, ...(st.deleted ?? []).filter((x) => !ids.includes(x))].slice(0, 500);
  await writeJson(STATE_FILE, st).catch(() => {});
}


