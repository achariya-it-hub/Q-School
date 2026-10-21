/**
 * Where the app keeps its data (leads, settings, courses, users, live sessions) and uploads.
 * Server-only.
 *
 *   CRM_DATA_DIR set        → that folder
 *   production, not set     → ~/qschool-data  (outside the deploy folder, so a redeploy never wipes it)
 *   development             → the app folder, as before
 *
 * Seed files shipped with the app (courses.json, users.json) are copied into the data folder
 * the first time, so a fresh server starts with the same demo content.
 */
import { copyFileSync, existsSync, mkdirSync, accessSync, constants } from "fs";
import os from "os";
import path from "path";

function pick(): string {
  const env = process.env.CRM_DATA_DIR?.trim();
  if (env) return path.resolve(env);
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmp = path.join(os.tmpdir(), "qschool-data");
    try {
      mkdirSync(tmp, { recursive: true });
      return tmp;
    } catch {}
  }
  if (process.env.NODE_ENV !== "production") return process.cwd();
  const home = path.join(os.homedir(), "qschool-data");
  try {
    mkdirSync(home, { recursive: true });
    accessSync(home, constants.W_OK);
    return home;
  } catch {
    console.warn(`[q-school] could not use ${home} for data; falling back to ${process.cwd()}. Set CRM_DATA_DIR.`);
    return process.cwd();
  }
}

export const DATA_DIR = pick();
try {
  mkdirSync(DATA_DIR, { recursive: true });
} catch {}

/** Path of a data file, copying the shipped seed into the data folder the first time. */
export function dataFile(name: string) {
  const p = path.join(DATA_DIR, name);
  if (DATA_DIR !== process.cwd() && !existsSync(p)) {
    const seed = path.join(process.cwd(), name);
    try {
      if (existsSync(seed)) copyFileSync(seed, p);
    } catch {}
  }
  return p;
}
