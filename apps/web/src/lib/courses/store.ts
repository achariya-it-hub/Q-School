/**
 * Course store (server-only). courses.json holds the catalogue + curriculum; uploaded
 * lesson files live in course-media/ and are served (with Range support) by
 * /api/course-media/[file]. Swap for Postgres + object storage / a video host later.
 */
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { DATA_DIR, dataFile } from "@/lib/data-dir";
import { Readable, Transform } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeWebStream } from "stream/web";
import { COURSE_STATS } from "@qschool/shared";
import {
  CATEGORIES,
  EMPTY_COURSE,
  LEVELS,
  UPLOAD_KINDS,
  lessonCount,
  totalMinutes,
  toEmbedUrl,
  uid,
  type Course,
  type Lesson,
  type MediaFile,
  type UploadKind,
} from "./types";

const COURSES_FILE = dataFile("courses.json");
export const COURSE_MEDIA_DIR = path.join(DATA_DIR, "course-media");

/* ───────── sanitising ───────── */

const str = (v: unknown, max = 300, fb = "") => (typeof v === "string" ? v.trim().slice(0, max) : fb);
const num = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
};
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown, max = 200): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);

/** Only our own media URLs or https links are accepted for files and images. */
const safeUrl = (v: unknown) => {
  const s = str(v, 1000);
  return /^(\/api\/(course-media|site\/media)\/[\w.-]+$|https:\/\/)/.test(s) ? s : "";
};
const safeLink = (v: unknown) => {
  const s = str(v, 1000);
  return /^https?:\/\//i.test(s) ? s : "";
};

function media(v: unknown): MediaFile | null {
  const o = obj(v);
  const url = safeUrl(o.url);
  return url ? { url, name: str(o.name, 200, "file"), size: num(o.size, 0, 1e12, 0), mime: str(o.mime, 100) } : null;
}

function lesson(v: unknown): Lesson {
  const o = obj(v);
  const type = (["video", "document", "image", "link", "text"] as const).includes(o.type as never) ? (o.type as Lesson["type"]) : "text";
  const source = o.source === "embed" ? "embed" : "upload";
  const url = type === "video" && source === "embed" ? (toEmbedUrl(str(o.url, 500)) ? str(o.url, 500) : "") : type === "link" ? safeLink(o.url) : "";
  return {
    id: str(o.id, 40) || uid("l"),
    title: str(o.title, 160, "Untitled lesson") || "Untitled lesson",
    type,
    source,
    file: type === "video" || type === "document" ? media(o.file) : null,
    url,
    images: type === "image" ? arr(o.images, 30).map((x) => ({ ...(media(x) as MediaFile), caption: str(obj(x).caption, 200) })).filter((x) => x.url) : [],
    body: str(o.body, 20000),
    durationMin: num(o.durationMin, 0, 1000, 0),
    preview: o.preview === true,
    downloadable: o.downloadable === true,
    attachments: arr(o.attachments, 20).map(media).filter(Boolean) as MediaFile[],
  };
}

export function normalizeCourse(v: unknown, prev?: Partial<Course>): Course {
  const o = obj(v);
  const base = { ...EMPTY_COURSE, ...prev };
  const has = (k: string) => k in o;
  const curriculum = has("curriculum")
    ? arr(o.curriculum, 60).map((s) => {
        const so = obj(s);
        return { id: str(so.id, 40) || uid("s"), title: str(so.title, 160, "Section") || "Section", lessons: arr(so.lessons, 300).map(lesson) };
      })
    : (base.curriculum ?? []);
  const title = has("title") ? str(o.title, 160) : base.title;
  const counted = lessonCount({ curriculum });
  const minutes = totalMinutes({ curriculum });
  return {
    id: prev?.id ?? "",
    slug: prev?.slug ?? "",
    title,
    subtitle: has("subtitle") ? str(o.subtitle, 200) : base.subtitle ?? "",
    category: has("category") && CATEGORIES.includes(str(o.category)) ? str(o.category) : base.category,
    mode: has("mode") && ["live", "recorded", "hybrid"].includes(str(o.mode)) ? (str(o.mode) as Course["mode"]) : base.mode,
    level: has("level") && LEVELS.includes(str(o.level)) ? str(o.level) : base.level ?? "Beginner",
    language: has("language") ? str(o.language, 40, "English") : base.language ?? "English",
    price: has("price") ? num(o.price, 0, 10_000_000, 0) : base.price,
    rating: base.rating ?? 5,
    learners: base.learners ?? 0,
    // counts follow the curriculum once it has lessons; otherwise keep the typed values
    lessons: counted || (has("lessons") ? num(o.lessons, 0, 5000, 0) : base.lessons),
    durationHours: minutes ? Math.round((minutes / 60) * 10) / 10 : has("durationHours") ? num(o.durationHours, 0, 5000, 0) : base.durationHours,
    description: has("description") ? str(o.description, 5000) : base.description,
    cover: has("cover") ? safeUrl(o.cover) : base.cover ?? "",
    outcomes: has("outcomes") ? arr(o.outcomes, 12).map((x) => str(x, 160)).filter(Boolean) : base.outcomes ?? [],
    status: has("status") ? (o.status === "published" ? "published" : "draft") : base.status ?? "draft",
    curriculum,
    updatedAt: new Date().toISOString(),
  };
}

/* ───────── courses.json ───────── */

let chain: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>) => {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
};

export async function readCourses(): Promise<Course[]> {
  try {
    const raw = JSON.parse(await fs.readFile(COURSES_FILE, "utf8"));
    if (!Array.isArray(raw)) return [];
    // older records have no curriculum/status — fill the gaps without inventing content
    return raw.map((c: Partial<Course>) => ({
      ...EMPTY_COURSE,
      curriculum: [],
      ...c,
      // records created before the builder have no status: carry over the catalogue's status
      status: c.status ?? (COURSE_STATS[c.title ?? ""]?.status === "Draft" ? "draft" : "published"),
    })) as Course[];
  } catch {
    return [];
  }
}

async function writeCourses(courses: Course[]) {
  const tmp = `${COURSES_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(courses, null, 2));
  await fs.rename(tmp, COURSES_FILE);
}

export async function getCourse(idOrSlug: string) {
  return (await readCourses()).find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null;
}

const slugify = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "course";

export function createCourse(input: unknown) {
  return serial(async () => {
    const courses = await readCourses();
    const c = normalizeCourse(input);
    if (!c.title) throw new Error("Title is required");
    c.id = uid("c");
    let slug = slugify(c.title);
    while (courses.some((x) => x.slug === slug)) slug = `${slugify(c.title)}-${Math.random().toString(36).slice(2, 5)}`;
    c.slug = slug;
    courses.unshift(c);
    await writeCourses(courses);
    return c;
  });
}

export function updateCourse(id: string, input: unknown) {
  return serial(async () => {
    const courses = await readCourses();
    const i = courses.findIndex((c) => c.id === id);
    if (i < 0) throw new Error("Course not found");
    const next = normalizeCourse(input, courses[i]);
    if (!next.title) throw new Error("Title is required");
    courses[i] = next;
    await writeCourses(courses);
    return next;
  });
}

export function deleteCourse(id: string) {
  return serial(async () => {
    const courses = await readCourses();
    const left = courses.filter((c) => c.id !== id);
    if (left.length === courses.length) throw new Error("Course not found");
    await writeCourses(left);
    return id;
  });
}

/* ───────── media ───────── */

const EXT_MIME: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
export const mimeForFile = (name: string) => EXT_MIME[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

const ALLOWED: Record<UploadKind, string[]> = {
  video: ["mp4", "m4v", "mov", "webm"],
  document: ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx"],
  image: ["jpg", "png", "webp", "gif"],
  attachment: ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "zip", "jpg", "png", "webp", "gif"],
};

/** File signature → canonical extension group (so a renamed .exe can't pass as a .pdf). */
function sniff(b: Buffer): string | null {
  if (b.length < 12) return null;
  const ascii = (s: number, e: number) => b.subarray(s, e).toString("latin1");
  if (ascii(4, 8) === "ftyp") return "isobmff"; // mp4 / mov / m4v
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm";
  if (ascii(0, 5) === "%PDF-") return "pdf";
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) return "zip"; // docx/pptx/xlsx/zip
  if (b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return "ole"; // doc/ppt/xls
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(0, 4) === "GIF8") return "gif";
  return null;
}
const SIG_EXT: Record<string, string[]> = {
  isobmff: ["mp4", "m4v", "mov"],
  webm: ["webm"],
  pdf: ["pdf"],
  zip: ["docx", "pptx", "xlsx", "zip"],
  ole: ["doc", "ppt", "xls"],
  jpg: ["jpg"],
  png: ["png"],
  webp: ["webp"],
  gif: ["gif"],
};

export class UploadError extends Error {
  constructor(
    msg: string,
    public status = 400,
  ) {
    super(msg);
  }
}

/** Stream a request body to disk (no buffering of large videos), then verify its signature. */
export async function saveCourseMedia(body: ReadableStream<Uint8Array>, kind: UploadKind, originalName: string, declaredSize: number): Promise<MediaFile> {
  const rule = UPLOAD_KINDS[kind];
  if (declaredSize > rule.max) throw new UploadError(`File is too large (${rule.label})`, 413);
  let ext = originalName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "jpeg") ext = "jpg";
  if (!ALLOWED[kind].includes(ext)) throw new UploadError(`This file type isn't allowed here (${rule.label})`, 415);

  await fs.mkdir(COURSE_MEDIA_DIR, { recursive: true });
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const file = `${id}.${ext}`;
  const full = path.join(COURSE_MEDIA_DIR, file);

  let bytes = 0;
  let head = Buffer.alloc(0);
  const counter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      bytes += chunk.length;
      if (head.length < 16) head = Buffer.concat([head, chunk.subarray(0, 16 - head.length)]);
      if (bytes > rule.max) return cb(new UploadError(`File is too large (${rule.label})`, 413));
      cb(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(body as unknown as NodeWebStream<Uint8Array>), counter, createWriteStream(full));
  } catch (e) {
    await fs.rm(full, { force: true });
    if (e instanceof UploadError) throw e;
    throw new UploadError("Upload interrupted. Please try again.", 400);
  }
  const sig = sniff(head);
  if (!sig || !SIG_EXT[sig].includes(ext)) {
    await fs.rm(full, { force: true });
    throw new UploadError("The file's contents don't match its type. Please export it again and retry.", 415);
  }
  return {
    url: `/api/course-media/${file}`,
    name: originalName.replace(/[^\w .()+-]/g, "_").slice(0, 160) || file,
    size: bytes,
    mime: EXT_MIME[ext],
  };
}
