/** Live session types (shared by Console, API and public pages). */

export type LiveKind = "webinar" | "workshop" | "class";
export type LiveStatus = "scheduled" | "live" | "ended" | "cancelled";

export const KIND_LABEL: Record<LiveKind, string> = { webinar: "Webinar", workshop: "Workshop", class: "Live class" };

export type Platform = "livekit" | "bbb" | "teams" | "zoom" | "jitsi" | "jupitermeet" | "other";

export const PLATFORMS: Record<
  Platform,
  { label: string; short: string; color: string; linkHint: string; hostHint?: string; studentTip: string; note?: string; hosts?: RegExp }
> = {
  livekit: {
    label: "LiveKit (Zoom Alternative)",
    short: "LiveKit",
    color: "#002CF2",
    linkHint: "Leave blank to auto-create room, or paste LiveKit room link",
    hostHint: "Optional host moderator link",
    studentTip: "Opens in your browser powered by WebRTC. No app installation or Zoom account required.",
    note: "LiveKit WebRTC: Ultra-low latency, crystal-clear audio & video, screen sharing and recording. Works in any browser on desktop and mobile without installing Zoom.",
    hosts: /(^|\.)(livekit\.(io|cloud)|meet\.livekit\.io)/,
  },
  bbb: {
    label: "BigBlueButton",
    short: "BBB",
    color: "#2A4D8F",
    linkHint: "Created automatically on your BigBlueButton server",
    studentTip: "Opens in your browser. Allow the microphone when asked, or choose “Listen only”.",
  },
  teams: {
    label: "Microsoft Teams",
    short: "Teams",
    color: "#5B5FC7",
    linkHint: "Teams meeting link (Copy link from the meeting in Teams)",
    studentTip: "Opens Microsoft Teams. On a laptop choose “Continue on this browser”; on a phone, install the Teams app first.",
    note: "Free Teams ends group meetings after 60 minutes. Teams Essentials allows up to 300 people for 30 hours.",
    hosts: /(^|\.)teams\.(microsoft|live)\.com$/,
  },
  zoom: {
    label: "Zoom",
    short: "Zoom",
    color: "#0B5CFF",
    linkHint: "Zoom invite link (https://…zoom.us/j/…)",
    hostHint: "Optional: your host start link, so “Start” opens Zoom as host",
    studentTip: "Opens Zoom. Install the Zoom app, or choose “Join from your browser” on a laptop.",
    note: "Free Zoom ends meetings after 40 minutes.",
    hosts: /(^|\.)zoom\.(us|com)$/,
  },
  jitsi: {
    label: "Jitsi Meet",
    short: "Jitsi",
    color: "#1D76BA",
    linkHint: "Leave blank to create a room automatically",
    studentTip: "Opens in your browser. On a phone, install the Jitsi Meet app for the best experience.",
    note: "On the public meet.jit.si service the host may need to sign in to start the room. A self-hosted Jitsi server avoids this.",
  },
  jupitermeet: {
    label: "JupiterMeet",
    short: "JupiterMeet",
    color: "#7A3FD1",
    linkHint: "Meeting link from your JupiterMeet dashboard",
    studentTip: "Opens in your browser. Allow the camera and microphone when asked.",
    note: "JupiterMeet's standard edition connects people peer-to-peer, which suits small groups. Use Teams, Zoom or BigBlueButton for 100+ students.",
  },
  other: {
    label: "Other link",
    short: "Link",
    color: "#41564F",
    linkHint: "Any meeting or livestream link (Google Meet, YouTube Live…)",
    studentTip: "Opens the meeting in a new page.",
  },
};

export interface Registration {
  id: string;
  name: string;
  phone: string;
  email: string;
  at: string;
  token: string;
  joinedAt: string | null;
}

export interface LiveSession {
  id: string;
  kind: LiveKind;
  title: string;
  description: string;
  host: string;
  startsAt: string; // ISO
  durationMin: number;
  capacity: number; // 0 = unlimited
  price: number; // 0 = free
  record: boolean;
  published: boolean; // listed on /live
  replayPublic: boolean; // show the recording on /live after it ends
  platform: Platform; // where the session runs ("bbb" for older records)
  joinUrl: string; // external platforms: student link (only revealed to registered students at start time)
  hostUrl: string; // external platforms: optional host start link (e.g. Zoom start_url)
  passcode: string; // shown to registered students on their join page
  meetingId: string;
  status: LiveStatus;
  registrations: Registration[];
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  peakAttendance: number;
  recordingUrl: string;
  notified?: string[]; // WhatsApp messages already sent for this session ("rem-1440", "starting", "replay"…)
}

/** Status shown to people, combining stored state and the clock. */
export function phase(x: Pick<LiveSession, "status" | "startsAt" | "durationMin">, now = Date.now()) {
  if (x.status === "cancelled") return "cancelled" as const;
  if (x.status === "live") return "live" as const;
  if (x.status === "ended") return "ended" as const;
  const start = Date.parse(x.startsAt);
  if (now > start + (x.durationMin + 60) * 60_000) return "past" as const; // scheduled but never started
  return "upcoming" as const;
}

export const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST";
