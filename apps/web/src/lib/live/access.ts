/** When may a registered student enter the room? (server-only) */
import { isRunning } from "@/lib/bbb/client";
import { getSettings } from "@/lib/settings/store";
import { phase, type LiveSession } from "./types";

export async function roomOpen(s: LiveSession): Promise<boolean> {
  const p = phase(s);
  if (p !== "live" && p !== "upcoming") return false;
  if (s.platform === "bbb") {
    const st = await getSettings();
    if (!st.bbb.enabled) return false;
    return isRunning(s.meetingId).catch(() => false);
  }
  // link-based platforms: open once the host presses Start, or from N minutes before the start time
  if (p === "live") return true;
  const st = await getSettings();
  return Date.now() >= Date.parse(s.startsAt) - st.bbb.joinEarlyMinutes * 60_000;
}
