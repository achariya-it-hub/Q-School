/** Public reads for /live (server-only). */
import { listSessions } from "./store";
import { phase, type LiveSession } from "./types";

// never expose meeting links or passcodes publicly: students get them only through their personal join link
export type PublicSession = Omit<LiveSession, "registrations" | "meetingId" | "joinUrl" | "hostUrl" | "passcode"> & { registered: number; phase: ReturnType<typeof phase> };

export async function publicSessions(): Promise<PublicSession[]> {
  const all = await listSessions();
  return all
    .filter((s) => s.published && s.status !== "cancelled")
    .map(({ registrations, meetingId: _m, joinUrl: _j, hostUrl: _h, passcode: _p, ...s }) => ({ ...s, registered: registrations.length, phase: phase(s) }));
}

export function calendarLink(s: Pick<LiveSession, "title" | "startsAt" | "durationMin" | "description">, joinUrl: string) {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(s.startsAt);
  const end = new Date(start.getTime() + s.durationMin * 60000);
  const p = new URLSearchParams({ action: "TEMPLATE", text: s.title, dates: `${f(start)}/${f(end)}`, details: `${s.description}\n\nJoin: ${joinUrl}`.slice(0, 1500) });
  return `https://calendar.google.com/calendar/render?${p}`;
}
