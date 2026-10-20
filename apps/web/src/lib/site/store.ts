/**
 * Website content store (server-only). File-backed like the CRM store:
 *   site-content.json  { published, draft, publishedAt, draftSavedAt, history[] }
 *   site-media/        images uploaded from the Console, served by /api/site/media/[file]
 * Swap for a Postgres `site_content` row + object storage when the database lands.
 */
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/data-dir";
import { DEFAULT_HOME, normalizeHome, type HomeContent } from "./home-content";

const DIR = DATA_DIR;
const FILE = path.join(DIR, "site-content.json");
export const MEDIA_DIR = path.join(DIR, "site-media");
const HISTORY = 10;

export interface SiteFile {
  published: HomeContent;
  publishedAt: string | null;
  draft: HomeContent | null;
  draftSavedAt: string | null;
  history: { at: string; by: string; content: HomeContent }[];
}

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function read(): Promise<SiteFile> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8"));
    return {
      published: normalizeHome(raw.published),
      publishedAt: raw.publishedAt ?? null,
      draft: raw.draft ? normalizeHome(raw.draft) : null,
      draftSavedAt: raw.draftSavedAt ?? null,
      history: Array.isArray(raw.history)
        ? raw.history.slice(0, HISTORY).map((h: { at: string; by: string; content: unknown }) => ({ at: h.at, by: h.by, content: normalizeHome(h.content) }))
        : [],
    };
  } catch {
    return { published: DEFAULT_HOME, publishedAt: null, draft: null, draftSavedAt: null, history: [] };
  }
}

async function write(f: SiteFile) {
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(f, null, 2));
  await fs.rename(tmp, FILE);
}

/** What visitors see. */
export async function getPublishedHome(): Promise<HomeContent> {
  return (await read()).published;
}

/** Draft if there is one, else the published content (for admin preview). */
export async function getDraftHome(): Promise<HomeContent> {
  const f = await read();
  return f.draft ?? f.published;
}

export async function getSiteFile() {
  return read();
}

export function saveDraft(content: unknown) {
  return serial(async () => {
    const f = await read();
    f.draft = normalizeHome(content);
    f.draftSavedAt = new Date().toISOString();
    await write(f);
    return f;
  });
}

export function publish(content: unknown, by: string) {
  return serial(async () => {
    const f = await read();
    if (f.publishedAt) f.history = [{ at: f.publishedAt, by, content: f.published }, ...f.history].slice(0, HISTORY);
    f.published = normalizeHome(content);
    f.publishedAt = new Date().toISOString();
    f.draft = null;
    f.draftSavedAt = null;
    await write(f);
    return f;
  });
}

export function discardDraft() {
  return serial(async () => {
    const f = await read();
    f.draft = null;
    f.draftSavedAt = null;
    await write(f);
    return f;
  });
}

/** Load an older published version into the draft (publish it to make it live). */
export function restoreToDraft(index: number) {
  return serial(async () => {
    const f = await read();
    const h = f.history[index];
    if (!h) throw new Error("Version not found");
    f.draft = h.content;
    f.draftSavedAt = new Date().toISOString();
    await write(f);
    return f;
  });
}

/* ───────── media ───────── */

export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

/** Check magic bytes so a renamed non-image can't be uploaded. */
export function sniffImage(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (buf.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  return null;
}

export async function saveMedia(buf: Buffer, type: string) {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${MEDIA_TYPES[type]}`;
  await fs.writeFile(path.join(MEDIA_DIR, name), buf);
  return `/api/site/media/${name}`;
}

export async function listMedia() {
  try {
    const names = await fs.readdir(MEDIA_DIR);
    const out = await Promise.all(
      names
        .filter((n) => /^[a-z0-9-]+\.(jpg|png|webp|gif|avif)$/.test(n))
        .map(async (n) => ({ url: `/api/site/media/${n}`, at: (await fs.stat(path.join(MEDIA_DIR, n))).mtimeMs })),
    );
    return out.sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}
