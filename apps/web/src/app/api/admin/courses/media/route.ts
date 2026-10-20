import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { UploadError, saveCourseMedia } from "@/lib/courses/store";
import { UPLOAD_KINDS, type UploadKind } from "@/lib/courses/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Upload one lesson file. The raw file is the request body (streamed to disk, so
 * large videos don't sit in memory):  PUT /api/admin/courses/media?kind=video&name=intro.mp4
 */
export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const kind = q.get("kind") as UploadKind;
  const name = (q.get("name") || "").slice(0, 200);
  if (!(kind in UPLOAD_KINDS)) return NextResponse.json({ error: "Unknown upload kind" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Missing file name" }, { status: 400 });
  if (!req.body) return NextResponse.json({ error: "Empty file" }, { status: 400 });
  try {
    const file = await saveCourseMedia(req.body, kind, name, Number(req.headers.get("content-length") || 0));
    return NextResponse.json({ ok: true, file });
  } catch (e) {
    const status = e instanceof UploadError ? e.status : 500;
    return NextResponse.json({ error: (e as Error).message || "Upload failed" }, { status });
  }
}
