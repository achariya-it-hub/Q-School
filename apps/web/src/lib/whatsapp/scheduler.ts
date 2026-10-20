/** Runs the WhatsApp reminder check every minute inside the Node.js server (started from instrumentation.ts). */
import { reminderTick } from "./automations";

const g = globalThis as unknown as { __waTimer?: ReturnType<typeof setInterval> };

export function startScheduler() {
  if (g.__waTimer || process.env.WHATSAPP_SCHEDULER === "off") return;
  const tick = () => reminderTick().catch((e) => console.error("[whatsapp] reminder check failed:", (e as Error).message));
  setTimeout(tick, 15_000);
  g.__waTimer = setInterval(tick, 60_000);
}
