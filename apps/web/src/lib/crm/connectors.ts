/**
 * Lead-source connectors: payload → IncomingLead. Pure functions, shared by the real webhook
 * routes and the "Send test lead" button, so a test exercises exactly the production parser.
 *
 * Formats (checked Oct 2026):
 *  - Meta Lead Ads webhook: { object:"page", entry:[{ changes:[{ field:"leadgen", value:{ leadgen_id, form_id, page_id, ad_id, created_time } }] }] }
 *    then GET graph.facebook.com/{version}/{leadgen_id} → { field_data:[{ name, values:[] }] }
 *  - Google Ads lead form webhook: { lead_id, user_column_data:[{ column_id, string_value, column_name }], google_key, is_test, form_id, campaign_id, … }
 *  - WhatsApp Cloud API webhook: { object:"whatsapp_business_account", entry:[{ changes:[{ field:"messages", value:{ contacts:[{ profile:{name}, wa_id }], messages:[{ from, id, text:{body}, referral? }] } }] }] }
 */
import type { IncomingLead } from "./store";

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v25.0";
/** Overridable for local testing against a mock Graph API. */
export const GRAPH_BASE = (process.env.META_GRAPH_BASE || "https://graph.facebook.com").replace(/\/$/, "");

/* ───────── Meta (Facebook + Instagram Lead Ads) ───────── */

export interface MetaLeadgenChange {
  leadgen_id: string;
  form_id?: string;
  page_id?: string;
  ad_id?: string;
  adgroup_id?: string;
  created_time?: number;
}

export function parseMetaWebhook(body: unknown): MetaLeadgenChange[] {
  const b = body as { object?: string; entry?: { changes?: { field?: string; value?: MetaLeadgenChange }[] }[] };
  if (b?.object !== "page" || !Array.isArray(b.entry)) return [];
  return b.entry.flatMap((e) => (e.changes ?? []).filter((c) => c.field === "leadgen" && c.value?.leadgen_id).map((c) => c.value!));
}

export interface MetaLead {
  id: string;
  created_time?: string;
  form_id?: string;
  ad_id?: string;
  campaign_name?: string;
  ad_name?: string;
  platform?: string; // "fb" | "ig"
  field_data?: { name: string; values: string[] }[];
}

const pick = (m: Record<string, string>, ...keys: string[]) => {
  for (const k of keys) if (m[k]) return m[k];
  return "";
};

export function mapMetaLead(l: MetaLead, formName?: string): IncomingLead {
  const f: Record<string, string> = {};
  for (const d of l.field_data ?? []) f[d.name.toLowerCase()] = (d.values ?? []).join(", ");
  const name = pick(f, "full_name", "name") || [pick(f, "first_name"), pick(f, "last_name")].filter(Boolean).join(" ");
  const known = new Set(["full_name", "name", "first_name", "last_name", "phone_number", "phone", "email", "course", "interested_in", "which_course_are_you_interested_in?"]);
  const extra = Object.fromEntries(Object.entries(f).filter(([k]) => !known.has(k)));
  return {
    sourceKey: "meta",
    source: l.platform === "ig" ? "Instagram Ads" : "Meta Ads",
    externalId: `meta:${l.id}`,
    name,
    phone: pick(f, "phone_number", "phone"),
    email: pick(f, "email"),
    interest: pick(f, "course", "interested_in", "which_course_are_you_interested_in?"),
    campaign: l.campaign_name || l.ad_name,
    formName,
    extra,
    createdAt: l.created_time,
  };
}

/** Fetch one lead's answers from the Graph API (needs a Page token with leads_retrieval). */
export async function fetchMetaLead(leadgenId: string, token: string): Promise<MetaLead> {
  const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${encodeURIComponent(leadgenId)}?fields=id,created_time,form_id,ad_id,ad_name,campaign_name,platform,field_data&access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `Graph API ${r.status}`);
  return j as MetaLead;
}

/** Pull leads for a form created after `since` (unix seconds) — used by "Sync now" as a webhook safety net. */
export async function fetchMetaFormLeads(formId: string, token: string, since: number): Promise<MetaLead[]> {
  const filtering = JSON.stringify([{ field: "time_created", operator: "GREATER_THAN", value: since }]);
  let url: string | null =
    `${GRAPH_BASE}/${GRAPH_VERSION}/${encodeURIComponent(formId)}/leads?fields=id,created_time,form_id,ad_id,ad_name,campaign_name,platform,field_data&limit=100&filtering=${encodeURIComponent(filtering)}&access_token=${encodeURIComponent(token)}`;
  const out: MetaLead[] = [];
  for (let page = 0; url && page < 10; page++) {
    const r: Response = await fetch(url, { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `Graph API ${r.status}`);
    out.push(...(j.data ?? []));
    url = j.paging?.next ?? null;
  }
  return out;
}

/* ───────── Google Ads lead form extension ───────── */

export interface GoogleLeadPayload {
  lead_id?: string;
  user_column_data?: { column_id?: string; column_name?: string; string_value?: string }[];
  google_key?: string;
  is_test?: boolean;
  form_id?: number | string;
  campaign_id?: number | string;
  gcl_id?: string;
  lead_submit_time?: string;
}

export function mapGoogleLead(p: GoogleLeadPayload): IncomingLead {
  const c: Record<string, string> = {};
  const extra: Record<string, string> = {};
  for (const col of p.user_column_data ?? []) {
    const id = (col.column_id || "").toUpperCase();
    const v = col.string_value ?? "";
    if (id) c[id] = v;
    if (!["FULL_NAME", "FIRST_NAME", "LAST_NAME", "EMAIL", "WORK_EMAIL", "PHONE_NUMBER", "WORK_PHONE"].includes(id)) extra[col.column_name || id] = v;
  }
  const name = c.FULL_NAME || [c.FIRST_NAME, c.LAST_NAME].filter(Boolean).join(" ");
  const interestKey = Object.keys(extra).find((k) => /course|program|interest|class/i.test(k));
  return {
    sourceKey: "google",
    source: "Google Ads",
    externalId: p.lead_id ? `google:${p.lead_id}` : undefined,
    name,
    phone: c.PHONE_NUMBER || c.WORK_PHONE,
    email: c.EMAIL || c.WORK_EMAIL,
    interest: interestKey ? extra[interestKey] : undefined,
    campaign: p.campaign_id ? `Campaign ${p.campaign_id}` : undefined,
    formName: p.form_id ? `Lead form ${p.form_id}` : undefined,
    extra: { ...extra, ...(p.gcl_id ? { gclid: p.gcl_id } : {}) },
    createdAt: p.lead_submit_time,
    isTest: !!p.is_test,
  };
}

/* ───────── WhatsApp Cloud API ───────── */

interface WaChangeValue {
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  messages?: {
    from?: string;
    id?: string;
    timestamp?: string;
    type?: string;
    text?: { body?: string };
    button?: { text?: string };
    interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
    referral?: { source_type?: string; source_id?: string; headline?: string; body?: string; ctwa_clid?: string };
  }[];
}

/** Every inbound message becomes an IncomingLead; the store merges repeat senders into one lead. */
export function mapWhatsApp(body: unknown): IncomingLead[] {
  const b = body as { object?: string; entry?: { changes?: { field?: string; value?: WaChangeValue }[] }[] };
  if (b?.object !== "whatsapp_business_account") return [];
  const out: IncomingLead[] = [];
  for (const e of b.entry ?? [])
    for (const ch of e.changes ?? []) {
      if (ch.field !== "messages" || !ch.value?.messages) continue;
      const names = new Map((ch.value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]));
      for (const m of ch.value.messages) {
        const text = m.text?.body || m.button?.text || m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || `[${m.type ?? "message"}]`;
        const ad = m.referral;
        out.push({
          sourceKey: "whatsapp",
          source: ad ? "WhatsApp (Click-to-WhatsApp ad)" : "WhatsApp",
          externalId: m.from ? `wa:${m.from}` : undefined,
          name: names.get(m.from) || undefined,
          phone: m.from ? `+${m.from}` : undefined,
          message: text,
          interest: ad?.headline,
          campaign: ad ? `${ad.source_type ?? "ad"} ${ad.source_id ?? ""}`.trim() : undefined,
          extra: ad?.ctwa_clid ? { ctwa_clid: ad.ctwa_clid } : undefined,
          createdAt: m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : undefined,
        });
      }
    }
  return out;
}

const KNOWN_SOURCES: Record<string, string> = {
  justdial: "JustDial",
  indiamart: "IndiaMART",
  sulekha: "Sulekha",
  shiksha: "Shiksha",
  urbanpro: "UrbanPro",
  zapier: "Zapier",
  make: "Make",
  typeform: "Typeform",
  sheets: "Google Sheets",
  linkedin: "LinkedIn Lead Gen",
};

/* ───────── Generic webhook (JustDial, Sulekha, IndiaMART, Zapier/Make, Typeform, Sheets…) ───────── */

export function mapGeneric(source: string, b: Record<string, unknown>): IncomingLead {
  const g = (...k: string[]) => {
    for (const key of k) {
      const v = b[key];
      if (v !== undefined && v !== null && String(v).trim()) return String(v);
    }
    return "";
  };
  return {
    sourceKey: "webhook",
    source: KNOWN_SOURCES[source] ?? source.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()).slice(0, 40),
    externalId: g("id", "lead_id", "leadId", "query_id") ? `${source}:${g("id", "lead_id", "leadId", "query_id")}` : undefined,
    name: g("name", "full_name", "fullName", "sender_name", "SENDER_NAME"),
    phone: g("phone", "mobile", "phone_number", "mobileNumber", "SENDER_MOBILE"),
    email: g("email", "email_id", "SENDER_EMAIL"),
    interest: g("interest", "course", "category", "product", "QUERY_PRODUCT_NAME"),
    message: g("message", "requirement", "query", "QUERY_MESSAGE"),
    campaign: g("campaign", "utm_campaign"),
  };
}

/* ───────── sample payloads for "Send test lead" ───────── */

export function samplePayload(source: "meta" | "google" | "whatsapp" | "website" | "webhook") {
  const n = Math.floor(Math.random() * 90000) + 10000;
  const phone = `98${String(n).padStart(5, "0")}${String(n).slice(0, 3)}`;
  switch (source) {
    case "meta":
      return {
        id: `TEST${n}`,
        created_time: new Date().toISOString(),
        platform: n % 2 ? "ig" : "fb",
        campaign_name: "Oct admissions — Design Thinking",
        field_data: [
          { name: "full_name", values: [`Test Parent ${n}`] },
          { name: "phone_number", values: [`+91${phone}`] },
          { name: "email", values: [`parent${n}@example.com`] },
          { name: "course", values: ["Design Thinking for Young Minds"] },
          { name: "child_grade", values: ["Grade 6"] },
        ],
      } satisfies MetaLead;
    case "google":
      return {
        lead_id: `TeSter-${n}`,
        api_version: "1.0",
        form_id: 40000000000,
        campaign_id: 12345678901,
        google_key: process.env.GOOGLE_ADS_WEBHOOK_KEY || "test-key",
        is_test: true,
        gcl_id: `gclid-${n}`,
        lead_submit_time: new Date().toISOString(),
        user_column_data: [
          { column_name: "Full Name", string_value: `Google Test ${n}`, column_id: "FULL_NAME" },
          { column_name: "User Phone", string_value: `+91${phone}`, column_id: "PHONE_NUMBER" },
          { column_name: "User Email", string_value: `g${n}@example.com`, column_id: "EMAIL" },
          { column_name: "Which course?", string_value: "Coding for Beginners", column_id: "CUSTOM_QUESTION_1" },
        ],
      } satisfies GoogleLeadPayload & { api_version: string };
    case "whatsapp":
      return {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "WABA_ID",
            changes: [
              {
                field: "messages",
                value: {
                  messaging_product: "whatsapp",
                  metadata: { display_phone_number: "919000000000", phone_number_id: "PHONE_ID" },
                  contacts: [{ profile: { name: `WA Test ${n}` }, wa_id: `91${phone}` }],
                  messages: [
                    {
                      from: `91${phone}`,
                      id: `wamid.TEST${n}`,
                      timestamp: String(Math.floor(Date.now() / 1000)),
                      type: "text",
                      text: { body: "Hi, I saw your ad. What are the fees for Robotics Workshop?" },
                      referral: { source_type: "ad", source_id: "120200000000", headline: "Robotics Workshop — Bangalore" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };
    case "website":
      return { name: `Web Test ${n}`, phone, email: `w${n}@example.com`, interest: "JEE / NEET", source: "landing_hero" };
    default:
      return { name: `JustDial Test ${n}`, mobile: phone, category: "Coaching classes", requirement: "Looking for Class 10 Science tuition", lead_id: `JD${n}` };
  }
}
