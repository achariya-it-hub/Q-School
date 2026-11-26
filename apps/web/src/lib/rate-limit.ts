/**
 * Small in-memory throttles (per server instance; on serverless each instance counts separately, which still
 * stops quick scripted guessing). Server-only.
 */
const buckets = new Map<string, number[]>();

/** Counts a hit and returns true when `key` has gone over `max` hits within `windowMs`. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return recent.length > max;
}

/** Client IP as set by the hosting platform. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

/** Failed-login counter: blocked after `max` failures within the window; a success clears it. */
const failures = new Map<string, number[]>();
export const loginBlocked = (key: string, max = 8, windowMs = 10 * 60_000) => (failures.get(key) ?? []).filter((t) => Date.now() - t < windowMs).length >= max;
export function loginFailed(key: string, windowMs = 10 * 60_000) {
  const now = Date.now();
  failures.set(key, [...(failures.get(key) ?? []).filter((t) => now - t < windowMs), now]);
}
export const loginSucceeded = (key: string) => void failures.delete(key);
