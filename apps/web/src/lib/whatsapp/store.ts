/**
 * WhatsApp message log + conversation state (server-only).
 *   whatsapp-messages.json  newest first, capped
 *   whatsapp-state.json     opt-outs, last inbound time per number (24-hour window), synced templates
 */
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { DATA_DIR } from "@/lib/data-dir";
import type { WaMessage, WaStatus, WaTemplate } from "./types";

const MSG_FILE = path.join(DATA_DIR, "whatsapp-messages.json");
const STATE_FILE = path.join(DATA_DIR, "whatsapp-state.json");
const MAX = 5000;

interface State {
  optOut: string[];
  lastInbound: Record<string, string>;
  templates: WaTemplate[];
  templatesAt: string | null;
}

const g = globalThis as unknown as { __waChain?: Promise<unknown> };
const serial = <T>(fn: () => Promise<T>) => {
  const run = (g.__waChain ?? Promise.resolve()).then(fn, fn);
  g.__waChain = run.catch(() => undefined);
  return run;
};

async function readJson<T>(file: string, fb: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fb;
  }
}
async function writeJson(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 1));
  await fs.rename(tmp, file);
}
const readMsgs = () => readJson<WaMessage[]>(MSG_FILE, []);
const readState = async (): Promise<State> => ({ optOut: [], lastInbound: {}, templates: [], templatesAt: null, ...(await readJson<Partial<State>>(STATE_FILE, {})) });

export const newId = () => `wm_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;

export function addMessage(m: Omit<WaMessage, "id" | "at"> & { id?: string; at?: string }) {
  return serial(async () => {
    const list = await readMsgs();
    const msg: WaMessage = { id: m.id ?? newId(), at: m.at ?? new Date().toISOString(), ...m } as WaMessage;
    list.unshift(msg);
    await writeJson(MSG_FILE, list.slice(0, MAX));
    return msg;
  });
}

export function updateMessage(id: string, patch: Partial<WaMessage>) {
  return serial(async () => {
    const list = await readMsgs();
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return null;
    list[i] = { ...list[i], ...patch, updatedAt: new Date().toISOString() };
    await writeJson(MSG_FILE, list);
    return list[i];
  });
}

const RANK: Record<WaStatus, number> = { sending: 0, sent: 1, delivered: 2, read: 3, failed: 4, received: 0 };

/** Delivery receipts from the webhook. Statuses only move forward (a late "delivered" never overwrites "read"). */
export function applyStatuses(updates: { wamid: string; status: WaStatus; error?: string }[]) {
  if (!updates.length) return Promise.resolve(0);
  return serial(async () => {
    const list = await readMsgs();
    let n = 0;
    for (const u of updates) {
      const m = list.find((x) => x.wamid === u.wamid);
      if (!m) continue;
      if (u.status === "failed" || RANK[u.status] > RANK[m.status]) {
        m.status = u.status;
        if (u.error) m.error = u.error;
        m.updatedAt = new Date().toISOString();
        n++;
      }
    }
    if (n) await writeJson(MSG_FILE, list);
    return n;
  });
}

export async function listMessages(opts: { phone?: string; limit?: number; dir?: "in" | "out"; q?: string } = {}) {
  let list = await readMsgs();
  if (opts.phone) list = list.filter((m) => m.phone.slice(-10) === opts.phone!.slice(-10));
  if (opts.dir) list = list.filter((m) => m.dir === opts.dir);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    list = list.filter((m) => `${m.name ?? ""} ${m.phone} ${m.text} ${m.template ?? ""} ${m.ref ?? ""}`.toLowerCase().includes(q));
  }
  return list.slice(0, opts.limit ?? 200);
}

export async function messageStats() {
  const list = await readMsgs();
  const since = Date.now() - 30 * 86400_000;
  const recent = list.filter((m) => Date.parse(m.at) >= since);
  const out = recent.filter((m) => m.dir === "out");
  const count = (s: WaStatus[]) => out.filter((m) => s.includes(m.status)).length;
  return {
    sent30: out.length,
    delivered30: count(["delivered", "read"]),
    read30: count(["read"]),
    failed30: count(["failed"]),
    received30: recent.filter((m) => m.dir === "in").length,
  };
}

/* ───────── conversation state ───────── */

export const getState = readState;

export function noteInbound(phone: string, at = new Date().toISOString()) {
  return serial(async () => {
    const st = await readState();
    st.lastInbound[phone] = at;
    await writeJson(STATE_FILE, st);
  });
}

export function setOptOut(phone: string, out: boolean) {
  return serial(async () => {
    const st = await readState();
    const set = new Set(st.optOut);
    if (out) set.add(phone);
    else set.delete(phone);
    st.optOut = Array.from(set);
    await writeJson(STATE_FILE, st);
    return out;
  });
}

export function saveTemplates(templates: WaTemplate[]) {
  return serial(async () => {
    const st = await readState();
    st.templates = templates;
    st.templatesAt = new Date().toISOString();
    await writeJson(STATE_FILE, st);
  });
}

/** Free-form messages are only allowed within 24 hours of the person's last message. */
export function windowOpen(st: State, phone: string, now = Date.now()) {
  const t = st.lastInbound[phone];
  return !!t && now - Date.parse(t) < 24 * 3600_000;
}
