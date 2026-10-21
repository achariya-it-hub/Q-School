import { NextResponse } from "next/server";
import { isAdmin, getCurrentUserEmail } from "@/lib/crm/auth";
import { createCourse, deleteCourse, getCourse, readCourses, updateCourse } from "@/lib/courses/store";
import { recordAuditLog } from "@/lib/audit/store";

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
    const course = await createCourse(await req.json());
    recordAuditLog({
      action: "CREATE",
      module: "Courses",
      entityId: course.id,
      entityName: course.title,
      performedBy: getCurrentUserEmail() || "admin",
      summary: `Created new course "${course.title}" (${course.category}, Level: ${course.level})`,
      newData: course,
    }).catch(() => {});
    return NextResponse.json({ ok: true, course });
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
    const existing = await getCourse(String(body.id));
    const course = await updateCourse(String(body.id), body);
    recordAuditLog({
      action: "UPDATE",
      module: "Courses",
      entityId: course.id,
      entityName: course.title,
      performedBy: getCurrentUserEmail() || "admin",
      summary: `Updated course "${course.title}" details/curriculum`,
      previousData: existing || undefined,
      newData: course,
    }).catch(() => {});
    return NextResponse.json({ ok: true, course });
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
    const existing = await getCourse(id);
    const deletedId = await deleteCourse(id);
    recordAuditLog({
      action: "DELETE",
      module: "Courses",
      entityId: id,
      entityName: existing?.title || id,
      performedBy: getCurrentUserEmail() || "admin",
      summary: `Deleted course "${existing?.title || id}"`,
      previousData: existing || undefined,
    }).catch(() => {});
    return NextResponse.json({ ok: true, id: deletedId });
  } catch (e) {
    return fail(e, 404);
  }
}

