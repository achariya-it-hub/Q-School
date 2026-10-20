import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { createCourse, deleteCourse, getCourse, readCourses, updateCourse } from "@/lib/courses/store";

export const dynamic = "force-dynamic";

const unauthorised = () => NextResponse.json({ error: "Unauthorised" }, { status: 401 });
const fail = (e: unknown, status = 400) => NextResponse.json({ error: (e as Error).message || "Something went wrong" }, { status });

// GET all courses, or one with ?id=
export async function GET(req: Request) {
  if (!isAdmin()) return unauthorised();
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const course = await getCourse(id);
    return course ? NextResponse.json({ ok: true, course }) : NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  const courses = await readCourses();
  return NextResponse.json({ ok: true, count: courses.length, courses });
}

// POST create course (details + curriculum)
export async function POST(req: Request) {
  if (!isAdmin()) return unauthorised();
  try {
    return NextResponse.json({ ok: true, course: await createCourse(await req.json()) });
  } catch (e) {
    return fail(e);
  }
}

// PUT update course { id, ...fields }
export async function PUT(req: Request) {
  if (!isAdmin()) return unauthorised();
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    return NextResponse.json({ ok: true, course: await updateCourse(String(body.id), body) });
  } catch (e) {
    return fail(e, (e as Error).message === "Course not found" ? 404 : 400);
  }
}

// DELETE course ?id=
export async function DELETE(req: Request) {
  if (!isAdmin()) return unauthorised();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, id: await deleteCourse(id) });
  } catch (e) {
    return fail(e, 404);
  }
}
