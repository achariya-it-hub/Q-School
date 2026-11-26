import { NextResponse } from "next/server";
import { caller } from "@/lib/students/access";
import {
  listProgress,
  getProgress,
  saveProgress,
  deleteProgress,
  syncFromAdmissions,
} from "@/lib/students/progress-store";

export const dynamic = "force-dynamic";

/**
 * Student progress tracker. Requires a Console or centre-staff login; a centre login only ever sees and
 * changes its own centre's records.
 */
const deny = () => NextResponse.json({ error: "Unauthorised — sign in first" }, { status: 401 });
const forbid = () => NextResponse.json({ error: "This record belongs to another centre" }, { status: 403 });

export async function GET(req: Request) {
  const who = await caller();
  if (!who) return deny();
  try {
    const { searchParams } = new URL(req.url);
    const centreId = who.kind === "centre" ? who.centreId : searchParams.get("centre") || undefined;
    const items = await listProgress(centreId);
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("[api/students/progress] GET error:", err);
    return NextResponse.json({ error: err?.message || "Failed to load progress records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const who = await caller();
  if (!who) return deny();
  try {
    const body = await req.json().catch(() => ({}));

    // Trigger auto-sync from admissions if requested (admin only: it covers every centre)
    if (body.action === "sync") {
      if (who.kind !== "admin") return forbid();
      const res = await syncFromAdmissions();
      const items = await listProgress();
      return NextResponse.json({ ok: true, ...res, items });
    }

    if (!body.studentName || !String(body.studentName).trim()) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }
    if (who.kind === "centre") body.centreId = who.centreId;

    const saved = await saveProgress(body);
    return NextResponse.json({ ok: true, item: saved });
  } catch (err: any) {
    console.error("[api/students/progress] POST error:", err);
    return NextResponse.json({ error: err?.message || "Failed to save progress record" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const who = await caller();
  if (!who) return deny();
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.id) {
      return NextResponse.json({ error: "Record ID is required for update" }, { status: 400 });
    }
    if (who.kind === "centre") {
      const cur = await getProgress(String(body.id));
      if (cur && cur.centreId !== who.centreId) return forbid();
      body.centreId = who.centreId;
    }
    const saved = await saveProgress(body);
    return NextResponse.json({ ok: true, item: saved });
  } catch (err: any) {
    console.error("[api/students/progress] PUT error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update progress record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const who = await caller();
  if (!who) return deny();
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
    if (who.kind === "centre") {
      const cur = await getProgress(id);
      if (cur && cur.centreId !== who.centreId) return forbid();
    }

    const ok = await deleteProgress(id);
    return NextResponse.json({ ok, deletedId: id });
  } catch (err: any) {
    console.error("[api/students/progress] DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete progress record" }, { status: 500 });
  }
}
