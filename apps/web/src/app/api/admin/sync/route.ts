import { NextResponse } from "next/server";
import type { FeeAccount } from "@qschool/shared";
import { isAdmin } from "@/lib/crm/auth";
import { SYNC_KEYS, keepSavedPayments, lockedSync, readList, writeList, type SyncKey } from "@/lib/console-sync";

export const dynamic = "force-dynamic";

/**
 * Console data that used to live only in each browser's localStorage (fee plans, expenses, leave requests,
 * inventory). Kept in the database so every device and every login sees the same records.
 *   GET  → { accounts, expenses, leaves, stock }   (null = never saved yet, so the browser may upload its own copy)
 *   POST → { key, items }                           replaces that list (fee-plan payments already saved are kept)
 * Fee-plan payments themselves go through /api/admin/fee-plans/pay.
 */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const out: Record<string, unknown[] | null> = {};
    for (const k of Object.keys(SYNC_KEYS) as SyncKey[]) out[k] = await readList(k);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const key = String(b.key ?? "") as SyncKey;
  if (!(key in SYNC_KEYS)) return NextResponse.json({ error: "Unknown list" }, { status: 400 });
  if (!Array.isArray(b.items)) return NextResponse.json({ error: "items array required" }, { status: 400 });
  const items = b.items.filter((x: unknown) => x && typeof x === "object").slice(0, 5000);
  try {
    const saved = await lockedSync(async () => {
      let next: unknown[] = items;
      if (key === "accounts") next = keepSavedPayments(items as FeeAccount[], ((await readList("accounts")) ?? []) as FeeAccount[]);
      await writeList(key, next);
      return next;
    });
    // `kept` = true when the server kept newer payments than this browser had: it should reload the list.
    return NextResponse.json({ ok: true, count: saved.length, kept: JSON.stringify(saved) !== JSON.stringify(items) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
