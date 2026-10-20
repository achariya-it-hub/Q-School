/**
 * Automatic WhatsApp messages: live-session confirmations, reminders, start / change / cancel / replay
 * notices, new-lead welcome, and the webhook (delivery receipts, replies, STOP). Server-only.
 */
import { getSettings, type Settings } from "@/lib/settings/store";
import { listSessions, patchSession } from "@/lib/live/store";
import type { LiveSession, Registration } from "@/lib/live/types";
import { enqueue, publicOrigin, send } from "./client";
import { addMessage, applyStatuses, getState, noteInbound, setOptOut } from "./store";
import { waPhone, type WaEvent, type WaStatus } from "./types";

const first = (name: string) => name.trim().split(/\s+/)[0] || "there";
const IST = "Asia/Kolkata";

export const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: IST }).replace(/\bam\b|\bpm\b/gi, (m) => m.toLowerCase()) + " IST";

const timeOnly = (iso: string) => new Date(iso).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: IST }).toLowerCase() + " IST";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: IST });

/** “tomorrow at 5:00 pm IST”, “in 1 hour (at 5:00 pm IST)”… */
export function relativeWhen(iso: string, now = Date.now()) {
  const start = Date.parse(iso);
  const mins = Math.round((start - now) / 60000);
  if (mins < 180) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const span = h ? `${h} hour${h > 1 ? "s" : ""}${m >= 5 ? ` ${m} min` : ""}` : `${Math.max(1, m)} minutes`;
    return `in ${span} (at ${timeOnly(iso)})`;
  }
  const today = dayKey(new Date(now));
  const tomorrow = dayKey(new Date(now + 86400_000));
  const d = dayKey(new Date(start));
  if (d === today) return `today at ${timeOnly(iso)}`;
  if (d === tomorrow) return `tomorrow at ${timeOnly(iso)}`;
  return `on ${fmtWhen(iso)}`;
}

function eventOn(st: Settings, ev: WaEvent) {
  return st.whatsapp.enabled && !!st.whatsapp.token && !!st.whatsapp.phoneNumberId && st.whatsapp.events[ev].enabled;
}

function queueEvent(st: Settings, ev: WaEvent, to: string, name: string, params: string[], ref: string) {
  const cfg = st.whatsapp.events[ev];
  return enqueue([() => send({ to, name, template: cfg.template, language: cfg.language, params, event: ev, ref, respectOptOut: true })]);
}

const joinLink = (origin: string, r: Registration) => (origin ? `${origin}/live/join/${r.token}` : `/live/join/${r.token}`);

/* ───────── live sessions ───────── */

export async function liveRegistered(s: LiveSession, r: Registration, req?: Request) {
  const st = await getSettings();
  if (!eventOn(st, "live_registered")) return 0;
  return queueEvent(st, "live_registered", r.phone, r.name, [first(r.name), s.title, fmtWhen(s.startsAt), joinLink(publicOrigin(st, req), r)], s.id);
}

/** Message everyone registered for a session. Each notice goes out once per session (tracked in `notified`). */
export async function liveNotice(sessionId: string, ev: "live_starting" | "live_changed" | "live_cancelled" | "live_replay", req?: Request, opts: { once?: boolean } = {}) {
  const st = await getSettings();
  if (!eventOn(st, ev)) return 0;
  const key = ev === "live_changed" ? `changed-${Date.now()}` : ev;
  let fresh = true;
  const s = await patchSession(sessionId, (x) => {
    fresh = !(x.notified ?? []).includes(key);
    return fresh ? { notified: [...(x.notified ?? []), key] } : {};
  });
  if (opts.once !== false && !fresh) return 0;
  const origin = publicOrigin(st, req);
  const cfg = st.whatsapp.events[ev];
  const regs = ev === "live_starting" ? s.registrations.filter((r) => !r.joinedAt) : s.registrations;
  return enqueue(
    regs.map((r) => () => {
      const params =
        ev === "live_starting"
          ? [first(r.name), s.title, joinLink(origin, r)]
          : ev === "live_changed"
            ? [first(r.name), s.title, fmtWhen(s.startsAt), joinLink(origin, r)]
            : ev === "live_cancelled"
              ? [first(r.name), s.title, fmtWhen(s.startsAt)]
              : [first(r.name), s.title, s.recordingUrl || `${origin}/live`];
      return send({ to: r.phone, name: r.name, template: cfg.template, language: cfg.language, params, event: ev, ref: s.id, respectOptOut: true });
    }),
  );
}

/**
 * Called every minute. For each upcoming session, sends the reminder whose time has come.
 * If the server was down and several reminders are overdue, only the closest one is sent.
 */
export async function reminderTick(now = Date.now()) {
  const st = await getSettings();
  if (!eventOn(st, "live_reminder") || !st.whatsapp.reminders.length) return 0;
  const origin = publicOrigin(st);
  const cfg = st.whatsapp.events.live_reminder;
  let queued = 0;
  for (const s of await listSessions()) {
    if (s.status !== "scheduled" || !s.registrations.length) continue;
    const start = Date.parse(s.startsAt);
    if (now >= start) continue;
    const done = new Set(s.notified ?? []);
    const due = st.whatsapp.reminders.filter((m) => now >= start - m * 60_000 && !done.has(`rem-${m}`));
    if (!due.length) continue;
    const pick = Math.min(...due);
    const at = start - pick * 60_000;
    await patchSession(s.id, (x) => ({ notified: Array.from(new Set([...(x.notified ?? []), ...due.map((m) => `rem-${m}`)])) }));
    // people who registered after this reminder time just got the details in their confirmation
    const regs = s.registrations.filter((r) => Date.parse(r.at) <= at);
    queued += enqueue(
      regs.map((r) => () =>
        send({
          to: r.phone,
          name: r.name,
          template: cfg.template,
          language: cfg.language,
          params: [first(r.name), s.title, relativeWhen(s.startsAt, Date.now()), joinLink(origin, r)],
          event: "live_reminder",
          ref: s.id,
          respectOptOut: true,
        }),
      ),
    );
  }
  return queued;
}

/* ───────── CRM ───────── */

export async function leadCreated(lead: { id: string; name: string; phone: string; interest: string; sourceKey?: string; formName?: string; isTest?: boolean }) {
  // WhatsApp enquiries get the auto-reply instead; live registrations get their own confirmation
  if (lead.sourceKey === "whatsapp" || lead.formName === "live_registration" || lead.isTest || !lead.phone) return 0;
  const st = await getSettings();
  if (!eventOn(st, "lead_welcome")) return 0;
  const name = lead.name.startsWith("Lead +") ? "there" : first(lead.name);
  return queueEvent(st, "lead_welcome", lead.phone, lead.name, [name, lead.interest || "our courses", st.general.orgName], lead.id);
}

/* ───────── webhook: delivery receipts, replies, STOP ───────── */

interface WaValue {
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  messages?: { from?: string; id?: string; timestamp?: string; type?: string; text?: { body?: string }; button?: { text?: string }; interactive?: { button_reply?: { id?: string; title?: string }; list_reply?: { id?: string; title?: string } }; image?: { caption?: string }; document?: { filename?: string } }[];
  statuses?: { id?: string; status?: string; recipient_id?: string; errors?: { code?: number; title?: string; message?: string; error_data?: { details?: string } }[] }[];
}

export interface BotInbound {
  phone: string;
  name?: string;
  text: string;
  /** id of the tapped button / list row (undefined for typed text) */
  id?: string;
}

const STOP = /^\s*(stop|unsubscribe|stop all|opt out|optout|cancel)\s*$/i;
const START = /^\s*(start|subscribe|unstop|opt in)\s*$/i;

export async function handleWebhook(body: unknown) {
  const b = body as { object?: string; entry?: { changes?: { field?: string; value?: WaValue }[] }[] };
  if (b?.object !== "whatsapp_business_account") return { statuses: 0, inbound: 0, newSenders: [] as string[], msgs: [] as BotInbound[] };
  const statuses: { wamid: string; status: WaStatus; error?: string }[] = [];
  const st = await getSettings();
  const state = await getState();
  let inbound = 0;
  const newSenders: string[] = [];
  const msgs: BotInbound[] = [];

  for (const e of b.entry ?? [])
    for (const ch of e.changes ?? []) {
      const v = ch.value;
      if (ch.field !== "messages" || !v) continue;
      for (const s of v.statuses ?? []) {
        if (!s.id || !s.status) continue;
        const status = (["sent", "delivered", "read", "failed"].includes(s.status) ? s.status : null) as WaStatus | null;
        if (!status) continue;
        const err = s.errors?.[0];
        statuses.push({ wamid: s.id, status, error: err ? err.error_data?.details || err.message || err.title : undefined });
      }
      const names = new Map((v.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]));
      for (const m of v.messages ?? []) {
        if (!m.from) continue;
        inbound++;
        const phone = waPhone(`+${m.from}`);
        const text = m.text?.body || m.button?.text || m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || m.image?.caption || (m.document?.filename ? `📎 ${m.document.filename}` : `[${m.type ?? "message"}]`);
        const at = m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString();
        if (!state.lastInbound[phone] && !STOP.test(text) && !START.test(text)) newSenders.push(phone);
        await addMessage({ dir: "in", phone, name: names.get(m.from) || undefined, kind: "text", text, status: "received", wamid: m.id, at });
        await noteInbound(phone, at);
        state.lastInbound[phone] = at;
        if (!STOP.test(text) && !START.test(text)) msgs.push({ phone, name: names.get(m.from) || undefined, text, id: m.interactive?.button_reply?.id || m.interactive?.list_reply?.id });
        if (STOP.test(text)) {
          await setOptOut(phone, true);
          if (st.whatsapp.token) enqueue([() => send({ to: phone, text: "You won't get any more updates from us on WhatsApp. Reply START to turn them back on.", event: "auto_reply" })]);
        } else if (START.test(text)) {
          await setOptOut(phone, false);
          if (st.whatsapp.token) enqueue([() => send({ to: phone, text: "Welcome back! You'll get class updates and reminders here again.", event: "auto_reply" })]);
        }
      }
    }
  await applyStatuses(statuses);
  return { statuses: statuses.length, inbound, newSenders, msgs };
}

/** First message from a new number: the auto-reply set in Settings › WhatsApp. */
export async function autoReply(phone: string, name?: string) {
  const st = await getSettings();
  const w = st.whatsapp;
  if (!w.enabled || !w.autoReply || !w.autoReplyText.trim() || !w.token || !w.phoneNumberId) return 0;
  return enqueue([() => send({ to: phone, name, text: w.autoReplyText.replace(/\{name\}/g, name ? first(name) : "there"), event: "auto_reply" })]);
}
