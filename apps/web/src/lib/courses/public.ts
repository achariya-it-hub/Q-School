/**
 * Student-facing course reads (server-only). Published courses from the Console's
 * courses.json; falls back to the built-in sample catalogue if that file is empty.
 * Console users (isAdmin) may also open drafts and every lesson, for previewing.
 */
import { COURSES } from "@qschool/shared";
import { readCourses } from "./store";
import { EMPTY_COURSE, type Course, type Lesson } from "./types";

const fromSample = (): Course[] => COURSES.map((c) => ({ ...EMPTY_COURSE, ...c, curriculum: [], status: "published" as const }));

export async function getCatalogue(): Promise<Course[]> {
  const all = await readCourses();
  return all.length ? all.filter((c) => c.status === "published") : fromSample();
}

export async function getCourseForStudent(slug: string, admin: boolean): Promise<Course | null> {
  const all = await readCourses();
  const list = all.length ? all : fromSample();
  const c = list.find((x) => x.slug === slug) ?? null;
  if (!c) return null;
  return c.status === "published" || admin ? c : null;
}

/** Until enrolment lands, students can open free-preview lessons; Console users can open all. */
export const canOpen = (l: Lesson, admin: boolean) => admin || l.preview;

export function findLesson(c: Course, lessonId: string) {
  const flat = c.curriculum.flatMap((s, si) => s.lessons.map((l, li) => ({ l, si, li, section: s })));
  const i = flat.findIndex((x) => x.l.id === lessonId);
  return i < 0 ? null : { ...flat[i], prev: flat[i - 1]?.l ?? null, next: flat[i + 1]?.l ?? null, index: i, total: flat.length };
}
