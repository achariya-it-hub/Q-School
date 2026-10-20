/**
 * WhatsApp Business Cloud API (Meta) — sending, templates, connection test. Server-only.
 * Every message sent here is written to the WhatsApp log, and its delivery status is updated by the webhook.
 */
import { GRAPH_BASE, GRAPH_VERSION } from "@/lib/crm/connectors";
import { getSettings, type Settings } from "@/lib/settings/store";
import { addMessage, getState, saveTemplates, updateMessage } from "./store";
import { WA_EVENTS, WA_EVENT_KEYS, countParams, renderTemplate, waPhone, type WaEvent, type WaMessage, type WaTemplate } from "./types";

export class WaError extends Error {
  constructor(
    message: string,
    public code = "error",
  ) {
    super(message);
  }
}

const api = (p: string) => `${GRAPH_BASE}/${GRAPH_VERSION}/${p.replace(/^\//, "")}`;

/** Turn Graph API errors into sentences people can act on. */
function explain(status: number, body: string) {
  let e: { message?: string; code?: number; error_data?: { details?: string } } = {};
  try {
    e = JSON.parse(body).error ?? {};
  } catch {}
  const code = e.code ?? 0;
  const known: Record<number, string> = {
    190: "The access token is invalid or has expired. Create a permanent token (System User) in Meta Business Settings.",
    10: "The token doesn't have permission for this number. Give the System User whatsapp_business_messaging and whatsapp_business_management.",
    100: "Meta rejected the request. Check the Phone number ID and Business Account ID.",
    131047: "More than 24 hours since this person last messaged you, so only approved templates can be sent.",
    131026: "The message couldn't be delivered. The number may not be on WhatsApp.",
    132001: "That template doesn't exist (or not in this language). Check the name in WhatsApp Manager.",
    132000: "The number of template values doesn't match the template.",
    132015: "This template is paused by Meta because of low quality.",
    131030: "This number isn't in your test allow-list. Add it in the Meta app, or go live with a real number.",
    80007: "Rate limit reached. Messages will go through when the limit resets.",
  };
  const detail = e.error_data?.details;
  return known[code] ?? `${e.message || `WhatsApp API error ${status}`}${detail ? ` — ${detail}` : ""}`;
}

async function graph<T>(st: Settings, p: string, init?: { method?: string; body?: unknown; token?: string }): Promise<T> {
  const token = init?.token ?? st.whatsapp.token;
  if (!token) throw new WaError("WhatsApp isn't connected yet. Add the access token in Settings › WhatsApp.", "not_configured");
  let r: Response;
  try {
    r = await fetch(api(p), {
      method: init?.method ?? "GET",
      headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    throw new WaError(`Couldn't reach Meta's servers (${(e as Error).message}).`, "network");
  }
  const text = await r.text();
  if (!r.ok) throw new WaError(explain(r.status, text), "api");
  return JSON.parse(text || "{}") as T;
}

/* ───────── connection & templates ───────── */

export async function testConnection(o: { token?: string; phoneNumberId?: string; wabaId?: string } = {}) {
  const st = await getSettings();
  const phoneId = o.phoneNumberId || st.whatsapp.phoneNumberId;
  if (!phoneId) throw new WaError("Add the Phone number ID first.");
  const p = await graph<{ display_phone_number?: string; verified_name?: string; quality_rating?: string; messaging_limit_tier?: string }>(
    st,
    `${phoneId}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier`,
    { token: o.token || undefined },
  );
  let templates: number | null = null;
  const waba = o.wabaId || st.whatsapp.wabaId;
  if (waba) {
    const t = await graph<{ data?: unknown[] }>(st, `${waba}/message_templates?fields=name&limit=200`, { token: o.token || undefined });
    templates = t.data?.length ?? 0;
  }
  return { number: p.display_phone_number ?? "", name: p.verified_name ?? "", quality: p.quality_rating ?? "", tier: p.messaging_limit_tier ?? "", templates };
}

interface GraphTemplate {
  name: string;
  language: string;
  status: string;
  category: string;
  components?: Array<{
    type: string;
    text?: string;
    format?: string;
    buttons?: Array<{ type: string; text?: string; url?: string; phone_number?: string }>;
  }>;
}

export async function syncTemplates(): Promise<WaTemplate[]> {
  const st = await getSettings();
  if (!st.whatsapp.wabaId) throw new WaError("Add the WhatsApp Business Account ID in Settings › WhatsApp to load templates.");
  const out: WaTemplate[] = [];
  let next: string | null = `${st.whatsapp.wabaId}/message_templates?fields=name,language,status,category,components&limit=100`;
  for (let i = 0; next && i < 10; i++) {
    const page: { data?: GraphTemplate[]; paging?: { next?: string } } = await graph(st, next);
    for (const t of page.data ?? []) {
      const body = t.components?.find((c) => c.type === "BODY")?.text ?? "";
      const header = t.components?.find((c) => c.type === "HEADER")?.text;
      const footer = t.components?.find((c) => c.type === "FOOTER")?.text;
      const buttons = t.components?.find((c) => c.type === "BUTTONS")?.buttons?.map((b) => b.text || b.type) ?? [];
      out.push({
        name: t.name,
        language: t.language,
        status: t.status,
        category: t.category,
        body,
        header,
        footer,
        buttons: buttons.length ? buttons : undefined,
        params: countParams(body),
      });
    }
    const n = page.paging?.next;
    next = n ? n.replace(/^https?:\/\/[^/]+\/v[\d.]+\//, "") : null;
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  await saveTemplates(out);
  return out;
}

export interface CreateTemplateInput {
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language?: string;
  body: string;
  header?: string;
  footer?: string;
  buttons?: Array<{
    type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
    text: string;
    url?: string;
    phone_number?: string;
  }>;
  exampleParams?: string[];
}

export async function createCustomTemplate(input: CreateTemplateInput) {
  const st = await getSettings();
  if (!st.whatsapp.wabaId) throw new WaError("Add the WhatsApp Business Account ID in Settings › WhatsApp first.");

  const name = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (!name) throw new WaError("Please provide a valid template name (lowercase letters, numbers, and underscores).");

  const bodyText = input.body?.trim();
  if (!bodyText) throw new WaError("Template body text is required.");

  const lang = input.language?.trim() || st.whatsapp.language || "en_US";
  const category = input.category || "UTILITY";

  const components: Array<Record<string, unknown>> = [];

  // Optional Header
  if (input.header?.trim()) {
    components.push({
      type: "HEADER",
      format: "TEXT",
      text: input.header.trim(),
    });
  }

  // Body
  const paramMatches = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g), (m) => Number(m[1]));
  const paramCount = paramMatches.length ? Math.max(...paramMatches) : 0;

  const bodyComp: Record<string, unknown> = {
    type: "BODY",
    text: bodyText,
  };

  if (paramCount > 0) {
    const samples = Array.from({ length: paramCount }, (_, i) => {
      const v = input.exampleParams?.[i]?.trim();
      return v || `Sample${i + 1}`;
    });
    bodyComp.example = {
      body_text: [samples],
    };
  }
  components.push(bodyComp);

  // Optional Footer
  if (input.footer?.trim()) {
    components.push({
      type: "FOOTER",
      text: input.footer.trim().slice(0, 60),
    });
  }

  // Optional Buttons
  if (input.buttons && input.buttons.length > 0) {
    const btns = input.buttons.slice(0, 3).map((b) => {
      if (b.type === "URL") {
        return { type: "URL", text: b.text.trim().slice(0, 25), url: b.url?.trim() || "https://qschool.in" };
      }
      if (b.type === "PHONE_NUMBER") {
        return { type: "PHONE_NUMBER", text: b.text.trim().slice(0, 25), phone_number: b.phone_number?.trim() || "+919876543210" };
      }
      return { type: "QUICK_REPLY", text: b.text.trim().slice(0, 25) };
    });
    components.push({
      type: "BUTTONS",
      buttons: btns,
    });
  }

  const res = await graph<{ id?: string; status?: string }>(st, `${st.whatsapp.wabaId}/message_templates`, {
    method: "POST",
    body: {
      name,
      language: lang,
      category,
      components,
    },
  });

  await syncTemplates().catch(() => undefined);
  return { id: res.id, status: res.status ?? "PENDING", name };
}

export async function deleteCustomTemplate(name: string) {
  const st = await getSettings();
  if (!st.whatsapp.wabaId) throw new WaError("WhatsApp Business Account ID is missing.");
  await graph(st, `${st.whatsapp.wabaId}/message_templates?name=${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  return syncTemplates();
}

/** Submit the app's templates (see WA_EVENTS) for approval. Existing names are skipped. */
export async function createDefaultTemplates(only?: WaEvent[]) {
  const st = await getSettings();
  if (!st.whatsapp.wabaId) throw new WaError("Add the WhatsApp Business Account ID first.");
  const existing = await syncTemplates().catch(() => [] as WaTemplate[]);
  const results: { event: WaEvent; template: string; result: "created" | "exists" | "error"; detail?: string }[] = [];
  for (const k of only ?? WA_EVENT_KEYS) {
    const ev = st.whatsapp.events[k];
    const def = WA_EVENTS[k];
    const lang = ev.language || st.whatsapp.language;
    if (existing.some((t) => t.name === ev.template && t.language === lang)) {
      results.push({ event: k, template: ev.template, result: "exists" });
      continue;
    }
    const example = [...def.example];
    if (k === "lead_welcome") example[2] = st.general.orgName;
    try {
      await graph(st, `${st.whatsapp.wabaId}/message_templates`, {
        method: "POST",
        body: {
          name: ev.template,
          language: lang,
          category: "UTILITY",
          components: [{ type: "BODY", text: def.body, example: { body_text: [example] } }],
        },
      });
      results.push({ event: k, template: ev.template, result: "created" });
    } catch (e) {
      results.push({ event: k, template: ev.template, result: "error", detail: (e as Error).message });
    }
  }
  await syncTemplates().catch(() => undefined);
  return results;
}

/* ───────── sending ───────── */

// WhatsApp rejects template values with new lines, tabs or more than 4 spaces in a row.
const clean = (v: unknown) =>
  String(v ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {4,}/g, "   ")
    .trim()
    .slice(0, 1000) || "-";

export interface SendInput {
  to: string;
  name?: string;
  template?: string;
  language?: string;
  params?: string[];
  text?: string;
  /** up to 3 quick-reply buttons (chatbot) */
  buttons?: { id: string; title: string }[];
  /** a tap-to-open list menu (chatbot), up to 10 rows */
  list?: { button: string; rows: { id: string; title: string; description?: string }[] };
  event?: WaMessage["event"];
  ref?: string;
  /** automatic messages and broadcasts respect STOP; a manual send from the Console does not */
  respectOptOut?: boolean;
}

export async function send(o: SendInput): Promise<WaMessage> {
  const st = await getSettings();
  const w = st.whatsapp;
  if (!w.token || !w.phoneNumberId) throw new WaError("WhatsApp isn't connected yet. Set it up in Settings › WhatsApp.", "not_configured");
  const phone = waPhone(o.to, w.country);
  if (phone.length < 10) throw new WaError(`“${o.to}” isn't a valid mobile number.`, "bad_number");
  const state = await getState();
  const params = (o.params ?? []).map(clean);
  const lang = o.language || w.language;

  let text = o.text?.trim() ?? "";
  if (o.template) {
    const known = state.templates.find((t) => t.name === o.template && t.language === lang) ?? state.templates.find((t) => t.name === o.template);
    const def = WA_EVENT_KEYS.map((k) => WA_EVENTS[k]).find((d) => d.template === o.template);
    const body = known?.body || def?.body;
    text = body ? renderTemplate(body, params) : `[${o.template}] ${params.join(" · ")}`;
  }
  if (!o.template && !text) throw new WaError("Type a message first.");

  const base = { dir: "out" as const, phone, name: o.name, kind: o.template ? ("template" as const) : ("text" as const), template: o.template, text, event: o.event, ref: o.ref };

  if (o.respectOptOut && state.optOut.includes(phone)) {
    return addMessage({ ...base, status: "failed", error: "Not sent: this person replied STOP (opted out)" });
  }

  const msg = await addMessage({ ...base, status: "sending" });
  const body = o.template
    ? {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: { name: o.template, language: { code: lang }, components: params.length ? [{ type: "body", parameters: params.map((p) => ({ type: "text", text: p })) }] : [] },
      }
    : o.list
      ? {
          messaging_product: "whatsapp",
          to: phone,
          type: "interactive",
          interactive: {
            type: "list",
            body: { text: text.slice(0, 1024) },
            action: { button: o.list.button.slice(0, 20), sections: [{ title: "Options", rows: o.list.rows.slice(0, 10).map((r) => ({ id: r.id.slice(0, 200), title: r.title.slice(0, 24), ...(r.description ? { description: r.description.slice(0, 72) } : {}) })) }] },
          },
        }
      : o.buttons?.length
        ? {
            messaging_product: "whatsapp",
            to: phone,
            type: "interactive",
            interactive: { type: "button", body: { text: text.slice(0, 1024) }, action: { buttons: o.buttons.slice(0, 3).map((b) => ({ type: "reply", reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) } })) } },
          }
        : { messaging_product: "whatsapp", to: phone, type: "text", text: { body: text.slice(0, 4096), preview_url: true } };
  try {
    const r = await graph<{ messages?: { id: string }[] }>(st, `${w.phoneNumberId}/messages`, { method: "POST", body });
    return (await updateMessage(msg.id, { wamid: r.messages?.[0]?.id, status: "sent" })) ?? msg;
  } catch (e) {
    return (await updateMessage(msg.id, { status: "failed", error: (e as Error).message })) ?? msg;
  }
}

/* ───────── background queue (bulk sends never block a request) ───────── */

const q = globalThis as unknown as { __waQueue?: (() => Promise<unknown>)[]; __waBusy?: boolean };

export function enqueue(jobs: (() => Promise<unknown>)[]) {
  q.__waQueue = [...(q.__waQueue ?? []), ...jobs];
  if (!q.__waBusy) void drain();
  return jobs.length;
}

async function drain() {
  q.__waBusy = true;
  try {
    while (q.__waQueue?.length) {
      const job = q.__waQueue.shift()!;
      await job().catch((e) => console.error("[whatsapp]", (e as Error).message));
      await new Promise((r) => setTimeout(r, 60)); // well under Meta's 80 msg/s
    }
  } finally {
    q.__waBusy = false;
  }
}

export const queueLength = () => q.__waQueue?.length ?? 0;

/** The public address for links in messages (Hostinger and other proxies forward the real host). */
export function publicOrigin(st: Settings, req?: Request) {
  if (st.whatsapp.siteUrl) return st.whatsapp.siteUrl;
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/+$/, "");
  if (req) {
    const h = req.headers;
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "");
    if (host) return `${proto}://${host}`;
  }
  return "";
}
