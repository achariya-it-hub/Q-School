import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { dataFile } from "@/lib/data-dir";
import { getDbMetaText, isDbConfigured, setDbMetaText } from "@/lib/db";
import { isAdmin } from "@/lib/crm/auth";

export const dynamic = "force-dynamic";

/**
 * Console data that used to live only in each browser's localStorage (fee plans, expenses, leave requests,
 * inventory). Kept in the database so every device and every login sees the same records.
 *   GET  → { accounts, expenses, leaves, stock }   (null = never saved yet, so the browser may upload its own copy)
 *   POST → { key, items }                           replaces that list
 */
const KEYS = {
  accounts: "finance_accounts_v1", // key kept from the first release of fee-plan sync
  expenses: "expenses_v1",
  leaves: "leaves_v1",
  stock: "stock_v1",
} as const;
type SyncKey = keyof typeof KEYS;

const fileFor = (k: SyncKey) => dataFile(`sync-${k}.json`);

async function read(k: SyncKey): Promise<unknown[] | null> {
  if (isDbConfigured()) {
    const r = await getDbMetaText(KEYS[k]);
    if (!r.ok) throw new Error("database unavailable");
    if (r.value === null) return null;
    try {
      const v = JSON.parse(r.value);
      return Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  }
  try {
    const v = JSON.parse(await fs.readFile(fileFor(k), "utf8"));
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

async function write(k: SyncKey, items: unknown[]) {
  if (isDbConfigured()) {
    if (!(await setDbMetaText(KEYS[k], JSON.stringify(items)))) throw new Error("could not save to the database");
    return;
  }
  await fs.writeFile(fileFor(k), JSON.stringify(items, null, 2));
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const out: Record<string, unknown[] | null> = {};
    for (const k of Object.keys(KEYS) as SyncKey[]) out[k] = await read(k);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const key = String(b.key ?? "") as SyncKey;
  if (!(key in KEYS)) return NextResponse.json({ error: "Unknown list" }, { status: 400 });
  if (!Array.isArray(b.items)) return NextResponse.json({ error: "items array required" }, { status: 400 });
  const items = b.items.filter((x: unknown) => x && typeof x === "object").slice(0, 5000);
  try {
    await write(key, items);
    return NextResponse.json({ ok: true, count: items.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
