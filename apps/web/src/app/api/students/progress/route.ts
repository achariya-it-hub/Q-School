import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import {
  listProgress,
  getProgress,
  saveProgress,
  deleteProgress,
  syncFromAdmissions,
} from "@/lib/students/progress-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const centreId = searchParams.get("centre") || undefined;
    const items = await listProgress(centreId);
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("[api/students/progress] GET error:", err);
    return NextResponse.json({ error: err?.message || "Failed to load progress records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Trigger auto-sync from admissions if requested
    if (body.action === "sync") {
      const res = await syncFromAdmissions();
      const items = await listProgress();
      return NextResponse.json({ ok: true, ...res, items });
    }

    if (!body.studentName || !String(body.studentName).trim()) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }

    const saved = await saveProgress(body);
    return NextResponse.json({ ok: true, item: saved });
  } catch (err: any) {
    console.error("[api/students/progress] POST error:", err);
    return NextResponse.json({ error: err?.message || "Failed to save progress record" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.id) {
      return NextResponse.json({ error: "Record ID is required for update" }, { status: 400 });
    }
    const saved = await saveProgress(body);
    return NextResponse.json({ ok: true, item: saved });
  } catch (err: any) {
    console.error("[api/students/progress] PUT error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update progress record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    const ok = await deleteProgress(id);
    return NextResponse.json({ ok, deletedId: id });
  } catch (err: any) {
    console.error("[api/students/progress] DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete progress record" }, { status: 500 });
  }
}

