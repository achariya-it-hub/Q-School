import { NextResponse } from "next/server";
import { getCurrentUserEmail, isAdmin } from "@/lib/crm/auth";
import { getAuditLogs, recordAuditLog, type AuditAction } from "@/lib/audit/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") || undefined;
    const action = searchParams.get("action") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const result = await getAuditLogs({
      module,
      action,
      search,
      limit,
      offset,
      startDate,
      endDate,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, module, entityId, entityName, summary, previousData, newData, details } = body;

    if (!action || !module || !summary) {
      return NextResponse.json(
        { error: "action, module, and summary are required" },
        { status: 400 }
      );
    }

    const performedBy = getCurrentUserEmail();
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : undefined;

    const log = await recordAuditLog({
      action: action as AuditAction,
      module: String(module),
      entityId: entityId ? String(entityId) : undefined,
      entityName: entityName ? String(entityName) : undefined,
      summary: String(summary),
      performedBy,
      ipAddress,
      previousData,
      newData,
      details,
    });

    return NextResponse.json({ ok: true, log });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to record audit log" },
      { status: 500 }
    );
  }
}
