import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import type { FeeAccount } from "@qschool/shared";
import { keepSavedPayments } from "@/lib/console-sync";
import { caller } from "@/lib/students/access";
import { dataFile } from "@/lib/data-dir";
import { getDbMetaJson, isDbConfigured, setDbMetaJson } from "@/lib/db";

export const dynamic = "force-dynamic";

const META_KEY = "finance_accounts_v1";
const FILE = dataFile("finance-accounts.json");

async function readAccounts(): Promise<FeeAccount[]> {
  if (isDbConfigured()) {
    const db = await getDbMetaJson<FeeAccount[]>(META_KEY);
    if (Array.isArray(db)) return db;
  }
  try {
    const disk = JSON.parse(await fs.readFile(FILE, "utf8"));
    if (Array.isArray(disk)) {
      if (isDbConfigured() && disk.length > 0) await setDbMetaJson(META_KEY, disk);
      return disk;
    }
  } catch {}
  return [];
}

async function writeAccounts(accounts: FeeAccount[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(accounts, null, 2)).catch(() => {});
  if (isDbConfigured()) {
    await setDbMetaJson(META_KEY, accounts);
  }
}

export async function GET() {
  const who = await caller();
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const accounts = await readAccounts();
  return NextResponse.json({ ok: true, accounts });
}

export async function POST(req: Request) {
  const who = await caller();
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!Array.isArray(b.accounts)) {
    return NextResponse.json({ error: "accounts array required" }, { status: 400 });
  }
  const clean: FeeAccount[] = b.accounts
    .filter((a: any) => a && typeof a.id === "string" && typeof a.student === "string" && Array.isArray(a.installments))
    .slice(0, 2000);
  // A stale copy from another device must not undo a payment that is already saved.
  const next = keepSavedPayments(clean, await readAccounts());
  await writeAccounts(next);
  return NextResponse.json({ ok: true, accounts: next });
}
