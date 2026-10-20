/**
 * Course + curriculum model (shared by the Console builder, API and student pages).
 * No Node imports here.
 */

export type LessonType = "video" | "document" | "image" | "link" | "text";

export const LESSON_TYPES: { type: LessonType; label: string; icon: string; help: string }[] = [
  { type: "video", label: "Video", icon: "video", help: "Upload MP4/WebM/MOV or paste a YouTube / Vimeo link" },
  { type: "document", label: "Document", icon: "lessons", help: "PDF, PowerPoint, Word or Excel" },
  { type: "image", label: "Images", icon: "palette", help: "One image or a small gallery" },
  { type: "link", label: "Link", icon: "external", help: "Any web page, Google Drive or Docs link" },
  { type: "text", label: "Text / notes", icon: "pencil", help: "Written lesson or reading notes" },
];

export interface MediaFile {
  url: string;
  name: string;
  size: number;
  mime: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  /** video: "upload" plays `file`; "embed" plays `url` (YouTube/Vimeo) */
  source: "upload" | "embed";
  file: MediaFile | null;
  url: string;
  images: (MediaFile & { caption: string })[];
  body: string;
  durationMin: number;
  preview: boolean;
  downloadable: boolean;
  attachments: MediaFile[];
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type CourseMode = "live" | "recorded" | "hybrid";
export type CourseStatus = "draft" | "published";

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  mode: CourseMode;
  level: string;
  language: string;
  price: number;
  rating: number;
  learners: number;
  durationHours: number;
  lessons: number;
  description: string;
  cover: string;
  outcomes: string[];
  status: CourseStatus;
  curriculum: CourseSection[];
  updatedAt?: string;
}

export const CATEGORIES = ["School", "Competitive", "Science", "Coding", "Skills", "Arts", "Communication"];
export const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

export const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const newLesson = (type: LessonType, title = ""): Lesson => ({
  id: uid("l"),
  title,
  type,
  source: "upload",
  file: null,
  url: "",
  images: [],
  body: "",
  durationMin: 0,
  preview: false,
  downloadable: type === "document",
  attachments: [],
});

export const newSection = (title = "New section"): CourseSection => ({ id: uid("s"), title, lessons: [] });

export const EMPTY_COURSE: Omit<Course, "id" | "slug"> = {
  title: "",
  subtitle: "",
  category: "Science",
  mode: "hybrid",
  level: "Beginner",
  language: "English",
  price: 3999,
  rating: 5,
  learners: 0,
  durationHours: 0,
  lessons: 0,
  description: "",
  cover: "",
  outcomes: [],
  status: "draft",
  curriculum: [newSection("Getting started")],
};

/* ───────── upload rules (checked again on the server by file signature) ───────── */

export const UPLOAD_KINDS = {
  video: { label: "MP4, WebM or MOV up to 2 GB", max: 2 * 1024 ** 3, accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v" },
  document: { label: "PDF, PPT(X), DOC(X) or XLS(X) up to 100 MB", max: 100 * 1024 ** 2, accept: ".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx" },
  image: { label: "JPG, PNG, WebP or GIF up to 10 MB", max: 10 * 1024 ** 2, accept: "image/jpeg,image/png,image/webp,image/gif" },
  attachment: { label: "Documents or images up to 100 MB", max: 100 * 1024 ** 2, accept: ".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,image/jpeg,image/png,image/webp,image/gif" },
} as const;
export type UploadKind = keyof typeof UPLOAD_KINDS;

/** Which lesson type a dropped file should become. */
export function lessonTypeForFile(name: string, mime: string): LessonType | null {
  const n = name.toLowerCase();
  if (mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/.test(n)) return "video";
  if (mime.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/.test(n)) return "image";
  if (/\.(pdf|pptx?|docx?|xlsx?)$/.test(n)) return "document";
  return null;
}

/* ───────── video links ───────── */

/** YouTube / Vimeo page URL → privacy-friendly embed URL, or null if not recognised. */
export function toEmbedUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(?:\/video)?\/(\d+)(?:\/(\w+))?/);
    if (!m) return null;
    const hash = m[2] || u.searchParams.get("h");
    return `https://player.vimeo.com/video/${m[1]}${hash ? `?h=${hash}` : ""}`;
  }
  return null;
}

export const fmtSize = (b: number) =>
  b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(1)} GB` : b >= 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

export const fmtMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} m` : ""}`.trim() : `${m} min`);

export const lessonCount = (c: Pick<Course, "curriculum">) => c.curriculum.reduce((a, s) => a + s.lessons.length, 0);
export const totalMinutes = (c: Pick<Course, "curriculum">) => c.curriculum.reduce((a, s) => a + s.lessons.reduce((b, l) => b + (l.durationMin || 0), 0), 0);
