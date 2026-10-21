/**
 * Live sessions (webinars, workshops, live classes) run on BigBlueButton. Server-only,
 * stored in live-sessions.json. Each registration gets a private join token so the
 * student's link works without an account; the BBB join URL is only created at join time.
 */
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/data-dir";
import { randomBytes } from "crypto";
import { PLATFORMS, type LiveKind, type LiveSession, type Platform, type Registration } from "./types";
import { getSettings } from "@/lib/settings/store";

const FILE = path.join(DATA_DIR, "live-sessions.json");

let chain: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>) => {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
};

async function readAll(): Promise<LiveSession[]> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8"));
    // sessions created before platforms existed ran on BigBlueButton
    return Array.isArray(raw) ? raw.map((x: Partial<LiveSession>) => ({ platform: "bbb" as Platform, joinUrl: "", hostUrl: "", passcode: "", ...x }) as LiveSession) : [];
  } catch {
    return [];
  }
}
async function writeAll(list: LiveSession[]) {
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, FILE);
}

const s = (v: unknown, max = 300, fb = "") => (typeof v === "string" ? v.trim().slice(0, max) : fb);
const n = (v: unknown, min: number, max: number, fb: number) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.min(max, Math.max(min, Math.round(x))) : fb;
};
const id = (p: string) => `${p}_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;

const PLATFORM_KEYS = Object.keys(PLATFORMS) as Platform[];

function checkLink(platform: Platform, url: string, field: string, jupiterUrl: string) {
  if (!url) return;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error(`${field} isn't a valid link`);
  }
  if (u.protocol !== "https:") throw new Error(`${field} must start with https://`);
  if (platform === "livekit") return;
  const rx = PLATFORMS[platform].hosts;
  if (rx && !rx.test(u.hostname)) throw new Error(`${field} doesn't look like a ${PLATFORMS[platform].label} link`);
  if (platform === "jupitermeet" && jupiterUrl && !url.startsWith(jupiterUrl)) throw new Error(`${field} should be on your JupiterMeet site (${jupiterUrl})`);
}

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "class";

type Editable = Omit<LiveSession, "id" | "meetingId" | "registrations" | "createdAt" | "status" | "startedAt" | "endedAt" | "peakAttendance" | "recordingUrl">;

async function cleanWithPlatform(input: Record<string, unknown>, prev?: LiveSession): Promise<Editable> {
  const base = clean(input, prev);
  const st = await getSettings();
  const platform: Platform = PLATFORM_KEYS.includes(input.platform as Platform) ? (input.platform as Platform) : (prev?.platform ?? st.platforms.defaultPlatform);
  if (!st.platforms.enabled[platform] && platform !== prev?.platform) throw new Error(`${PLATFORMS[platform].label} is switched off in Settings › Live classes`);
  let joinUrl = "joinUrl" in input ? s(input.joinUrl, 1000) : (prev?.joinUrl ?? "");
  const hostUrl = "hostUrl" in input ? s(input.hostUrl, 1000) : (prev?.hostUrl ?? "");
  const passcode = "passcode" in input ? s(input.passcode, 60) : (prev?.passcode ?? "");
  if (platform === "bbb") return { ...base, platform, joinUrl: "", hostUrl: "", passcode: "" };
  if (platform === "livekit" && !joinUrl) {
    const lkDomain = st.platforms.livekitDomain || "meet.livekit.io";
    joinUrl = `https://${lkDomain}/rooms/QSchool-${slug(base.title)}-${randomBytes(4).toString("hex")}`;
  }
  if (platform === "jitsi" && !joinUrl) joinUrl = `https://${st.platforms.jitsiDomain}/QSchool-${slug(base.title)}-${randomBytes(4).toString("hex")}`;
  if (!joinUrl) throw new Error(`Add the ${PLATFORMS[platform].label} meeting link`);
  checkLink(platform, joinUrl, "Meeting link", st.platforms.jupiterUrl);
  checkLink(platform, hostUrl, "Host link", st.platforms.jupiterUrl);
  return { ...base, platform, joinUrl, hostUrl, passcode };
}

function clean(input: Record<string, unknown>, prev?: LiveSession): Omit<Editable, "platform" | "joinUrl" | "hostUrl" | "passcode"> {
  const kind = (["webinar", "workshop", "class"] as LiveKind[]).includes(input.kind as LiveKind) ? (input.kind as LiveKind) : (prev?.kind ?? "webinar");
  const startsAt = s(input.startsAt, 40) && !Number.isNaN(Date.parse(String(input.startsAt))) ? new Date(String(input.startsAt)).toISOString() : prev?.startsAt;
  if (!startsAt) throw new Error("Pick a date and time");
  const title = "title" in input ? s(input.title, 160) : (prev?.title ?? "");
  if (!title) throw new Error("Title is required");
  return {
    kind,
    title,
    description: "description" in input ? s(input.description, 4000) : (prev?.description ?? ""),
    host: "host" in input ? s(input.host, 80) : (prev?.host ?? ""),
    startsAt,
    durationMin: "durationMin" in input ? n(input.durationMin, 15, 600, 60) : (prev?.durationMin ?? 60),
    capacity: "capacity" in input ? n(input.capacity, 0, 5000, 0) : (prev?.capacity ?? 0),
    price: "price" in input ? n(input.price, 0, 1_000_000, 0) : (prev?.price ?? 0),
    record: "record" in input ? input.record === true : (prev?.record ?? true),
    published: "published" in input ? input.published === true : (prev?.published ?? true),
    replayPublic: "replayPublic" in input ? input.replayPublic === true : (prev?.replayPublic ?? false),
  };
}

export async function listSessions() {
  return (await readAll()).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
export async function getSession(sid: string) {
  return (await readAll()).find((x) => x.id === sid) ?? null;
}

export function createSession(input: Record<string, unknown>) {
  return serial(async () => {
    const list = await readAll();
    const x: LiveSession = {
      ...(await cleanWithPlatform(input)),
      id: id("ls"),
      meetingId: `qs-${randomBytes(9).toString("hex")}`,
      status: "scheduled",
      registrations: [],
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      peakAttendance: 0,
      recordingUrl: "",
    };
    list.push(x);
    await writeAll(list);
    return x;
  });
}

export function updateSession(sid: string, input: Record<string, unknown>) {
  return serial(async () => {
    const list = await readAll();
    const i = list.findIndex((x) => x.id === sid);
    if (i < 0) throw new Error("Session not found");
    const cur = list[i];
    list[i] = {
      ...cur,
      ...(await cleanWithPlatform(input, cur)),
      ...(input.status === "cancelled" || (input.status === "scheduled" && cur.status === "cancelled") ? { status: input.status as LiveSession["status"] } : {}),
    };
    await writeAll(list);
    return list[i];
  });
}

export function patchSession(sid: string, fn: (x: LiveSession) => Partial<LiveSession>) {
  return serial(async () => {
    const list = await readAll();
    const i = list.findIndex((x) => x.id === sid);
    if (i < 0) throw new Error("Session not found");
    list[i] = { ...list[i], ...fn(list[i]) };
    await writeAll(list);
    return list[i];
  });
}

export function deleteSession(sid: string) {
  return serial(async () => {
    const list = await readAll();
    const left = list.filter((x) => x.id !== sid);
    if (left.length === list.length) throw new Error("Session not found");
    await writeAll(left);
  });
}

export function register(sid: string, p: { name: string; phone: string; email: string }) {
  return serial(async () => {
    const list = await readAll();
    const i = list.findIndex((x) => x.id === sid);
    if (i < 0) throw new Error("Session not found");
    const x = list[i];
    if (!x.published || x.status === "cancelled") throw new Error("Registrations are closed for this session");
    const digits = p.phone.replace(/\D/g, "").slice(-10);
    const existing = x.registrations.find((r) => r.phone.replace(/\D/g, "").slice(-10) === digits);
    if (existing) return { session: x, reg: existing, again: true };
    if (x.capacity && x.registrations.length >= x.capacity) throw new Error("Sorry, this session is full");
    const reg: Registration = { id: id("rg"), name: p.name, phone: p.phone, email: p.email, at: new Date().toISOString(), token: randomBytes(18).toString("base64url"), joinedAt: null };
    x.registrations.push(reg);
    await writeAll(list);
    return { session: x, reg, again: false };
  });
}

export async function findByToken(token: string) {
  if (!/^[\w-]{20,40}$/.test(token)) return null;
  for (const x of await readAll()) {
    const reg = x.registrations.find((r) => r.token === token);
    if (reg) return { session: x, reg };
  }
  return null;
}

export function markJoined(sid: string, regId: string) {
  return patchSession(sid, (x) => ({
    registrations: x.registrations.map((r) => (r.id === regId && !r.joinedAt ? { ...r, joinedAt: new Date().toISOString() } : r)),
  }));
}
