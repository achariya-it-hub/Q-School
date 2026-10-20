/**
 * Minimal BigBlueButton API client (server-only).
 * Every call is signed: checksum = sha(callName + queryString + sharedSecret).
 * Docs: https://docs.bigbluebutton.org/development/api
 */
import { createHash } from "crypto";
import { getSettings, type BbbSettings } from "@/lib/settings/store";

export class BbbError extends Error {
  constructor(
    message: string,
    public key = "error",
  ) {
    super(message);
  }
}

type Params = Record<string, string | number | boolean | undefined>;

function query(params: Params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

export function signedUrl(cfg: Pick<BbbSettings, "url" | "secret" | "algorithm">, call: string, params: Params = {}) {
  const q = query(params);
  const checksum = createHash(cfg.algorithm).update(call + q + cfg.secret).digest("hex");
  return `${cfg.url}${call}?${q ? `${q}&` : ""}checksum=${checksum}`;
}

/* ── tiny XML helpers (BBB responses are small and flat) ── */
const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
export const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].trim()) : "";
};
export const blocks = (xml: string, name: string) => Array.from(xml.matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "g"))).map((m) => m[1]);

async function call(cfg: BbbSettings, name: string, params: Params = {}, timeoutMs = 10000) {
  if (!cfg.url || !cfg.secret) throw new BbbError("BigBlueButton isn't set up yet. Add the server URL and secret in Settings › Live classes.", "notConfigured");
  let res: Response;
  try {
    res = await fetch(signedUrl(cfg, name, params), { cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    throw new BbbError(`Couldn't reach the BigBlueButton server (${(e as Error).name === "TimeoutError" ? "timed out" : "network error"}). Check the URL.`, "unreachable");
  }
  const xml = await res.text();
  if (!xml.includes("<returncode>")) throw new BbbError(`The server answered, but not like BigBlueButton (HTTP ${res.status}). Check the URL ends with /bigbluebutton/.`, "notBbb");
  if (tag(xml, "returncode") !== "SUCCESS") {
    const key = tag(xml, "messageKey") || "FAILED";
    if (key === "checksumError") throw new BbbError("The shared secret is wrong (checksum error). Copy it again with `bbb-conf --secret`.", key);
    throw new BbbError(tag(xml, "message") || key, key);
  }
  return xml;
}

const cfg = async () => (await getSettings()).bbb;

/** Used by "Test connection" — works even before BBB is switched on. */
export async function testConnection(override?: Partial<BbbSettings>) {
  const c = { ...(await cfg()), ...override };
  const xml = await call(c, "getMeetings");
  // the API root (no call) also reports the server version
  let version = "";
  try {
    const r = await fetch(c.url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    version = tag(await r.text(), "version");
  } catch {}
  return { ok: true, version, meetings: blocks(xml, "meeting").length };
}

export interface CreateOptions {
  meetingID: string;
  name: string;
  welcome?: string;
  record?: boolean;
  durationMin?: number;
  maxParticipants?: number;
  logoutURL?: string;
  meta?: Record<string, string>;
}

/** Create is idempotent in BBB: calling it again for a running meeting just returns it. */
export async function createMeeting(o: CreateOptions) {
  const c = await cfg();
  const meta = Object.fromEntries(Object.entries(o.meta ?? {}).map(([k, v]) => [`meta_${k}`, v]));
  const xml = await call(c, "create", {
    name: o.name,
    meetingID: o.meetingID,
    welcome: o.welcome ?? c.welcome,
    record: o.record ?? c.record,
    autoStartRecording: (o.record ?? c.record) && c.autoStartRecording,
    allowStartStopRecording: true,
    muteOnStart: c.muteOnStart,
    webcamsOnlyForModerator: c.webcamsOnlyForModerator,
    guestPolicy: c.guestPolicy,
    duration: o.durationMin ? o.durationMin + 30 : undefined, // grace period before BBB auto-ends
    maxParticipants: o.maxParticipants || c.maxParticipants || undefined,
    logoutURL: o.logoutURL || c.logoutUrl || undefined,
    meetingKeepEvents: true,
    ...meta,
  });
  return { internalMeetingID: tag(xml, "internalMeetingID"), createTime: tag(xml, "createTime") };
}

/** Signed join URL (no server round-trip). role MODERATOR for hosts, VIEWER for students. */
export async function joinUrl(o: { meetingID: string; fullName: string; role: "MODERATOR" | "VIEWER"; userID?: string; redirect?: boolean }) {
  const c = await cfg();
  if (!c.url || !c.secret) throw new BbbError("BigBlueButton isn't set up yet.", "notConfigured");
  return signedUrl(c, "join", {
    meetingID: o.meetingID,
    fullName: o.fullName.slice(0, 80),
    role: o.role,
    userID: o.userID,
    redirect: o.redirect === false ? "false" : "true",
  });
}

export async function isRunning(meetingID: string) {
  const xml = await call(await cfg(), "isMeetingRunning", { meetingID });
  return tag(xml, "running") === "true";
}

export async function meetingInfo(meetingID: string) {
  try {
    const xml = await call(await cfg(), "getMeetingInfo", { meetingID });
    return {
      running: tag(xml, "running") === "true",
      participants: Number(tag(xml, "participantCount") || 0),
      moderators: Number(tag(xml, "moderatorCount") || 0),
      recording: tag(xml, "recording") === "true",
      startTime: Number(tag(xml, "startTime") || 0),
    };
  } catch (e) {
    if (e instanceof BbbError && e.key === "notFound") return { running: false, participants: 0, moderators: 0, recording: false, startTime: 0 };
    throw e;
  }
}

export async function endMeeting(meetingID: string) {
  try {
    await call(await cfg(), "end", { meetingID });
    return true;
  } catch (e) {
    if (e instanceof BbbError && e.key === "notFound") return false;
    throw e;
  }
}

export interface Recording {
  recordID: string;
  name: string;
  published: boolean;
  state: string;
  startTime: number;
  endTime: number;
  participants: number;
  playbackUrl: string;
  lengthMin: number;
}

export async function getRecordings(meetingID: string): Promise<Recording[]> {
  const xml = await call(await cfg(), "getRecordings", { meetingID });
  return blocks(xml, "recording").map((r) => {
    const fmt = blocks(r, "format")[0] ?? "";
    return {
      recordID: tag(r, "recordID"),
      name: tag(r, "name"),
      published: tag(r, "published") === "true",
      state: tag(r, "state"),
      startTime: Number(tag(r, "startTime") || 0),
      endTime: Number(tag(r, "endTime") || 0),
      participants: Number(tag(r, "participants") || 0),
      playbackUrl: tag(fmt, "url"),
      lengthMin: Number(tag(fmt, "length") || 0),
    };
  });
}

export async function publishRecording(recordID: string, publish: boolean) {
  await call(await cfg(), "publishRecordings", { recordID, publish });
}
