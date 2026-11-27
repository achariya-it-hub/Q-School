/**
 * Server-only: Console lists that are shared by every device (fee plans, expenses, leave requests, inventory).
 * Database (qs_meta) when DATABASE_URL is set, else a JSON file in the data folder.
 */
import { promises as fs } from "fs";
import { accountPaidAmount, type FeeAccount } from "@qschool/shared";
import { dataFile } from "@/lib/data-dir";
import { getDbMetaText, isDbConfigured, setDbMetaText } from "@/lib/db";

export const SYNC_KEYS = {
  accounts: "finance_accounts_v1", // key kept from the first release of fee-plan sync
  expenses: "expenses_v1",
  leaves: "leaves_v1",
  stock: "stock_v1",
} as const;
export type SyncKey = keyof typeof SYNC_KEYS;

const fileFor = (k: SyncKey) => dataFile(`sync-${k}.json`);

export async function readList(k: SyncKey): Promise<unknown[] | null> {
  if (isDbConfigured()) {
    const r = await getDbMetaText(SYNC_KEYS[k]);
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

export async function writeList(k: SyncKey, items: unknown[]) {
  if (isDbConfigured()) {
    if (!(await setDbMetaText(SYNC_KEYS[k], JSON.stringify(items)))) throw new Error("could not save to the database");
    return;
  }
  await fs.writeFile(fileFor(k), JSON.stringify(items, null, 2));
}

// One change at a time on this server, so a payment and a list upload can't interleave.
let chain: Promise<unknown> = Promise.resolve();
export function lockedSync<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

/**
 * A browser uploads its whole fee-plan list. Never let a stale copy undo a payment that is already saved:
 * when the saved plan has more money received than the uploaded one, the saved plan is kept.
 */
export function keepSavedPayments(incoming: FeeAccount[], saved: FeeAccount[]): FeeAccount[] {
  const byId = new Map(saved.filter((a) => a && typeof a.id === "string").map((a) => [a.id, a]));
  return incoming.map((a) => {
    const s = a && byId.get(a.id);
    if (!(s && Array.isArray(s.installments) && Array.isArray(a.installments))) return a;
    // A corrected payment (higher revision) always beats an older copy, even though it holds less money.
    const sr = s.rev ?? 0;
    const ir = a.rev ?? 0;
    if (sr !== ir) return sr > ir ? s : a;
    return accountPaidAmount(s) > accountPaidAmount(a) ? s : a;
  });
}
