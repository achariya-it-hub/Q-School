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
  const appRoot = existsSync(path.join(process.cwd(), "apps", "web"))
    ? path.join(process.cwd(), "apps", "web")
    : process.cwd();

  return appRoot;
}

export const DATA_DIR = pick();
try {
  mkdirSync(DATA_DIR, { recursive: true });
} catch {}

/** Path of a data file, copying the shipped seed into the data folder the first time. */
export function dataFile(name: string) {
  const p = path.join(DATA_DIR, name);
  if (!existsSync(p)) {
    const candidates = [
      path.join(process.cwd(), name),
      path.join(process.cwd(), "apps", "web", name),
      path.join(__dirname, "..", "..", "..", name),
      path.join(__dirname, "..", "..", name),
      path.join(__dirname, "..", name),
    ];
    for (const seed of candidates) {
      try {
        if (seed !== p && existsSync(seed)) {
          copyFileSync(seed, p);
          break;
        }
      } catch {}
    }
  }
  return p;
}
