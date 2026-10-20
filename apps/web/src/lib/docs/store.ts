/**
 * Shared documents: a snapshot of an invoice or receipt behind an unguessable link (/d/<token>),
 * so it can be sent on WhatsApp and opened without signing in. Server-only, stored in shared-docs.json.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { FeeAccount, InvoiceDoc, PaymentTxn } from "@qschool/shared";
import { DATA_DIR } from "@/lib/data-dir";

const FILE = path.join(DATA_DIR, "shared-docs.json");

export type SharedDoc =
  | { token: string; type: "invoice"; ref: string; createdAt: string; inv: InvoiceDoc }
  | { token: string; type: "receipt"; ref: string; createdAt: string; p: PaymentTxn; account?: FeeAccount };

type NewDoc = SharedDoc extends infer D ? (D extends SharedDoc ? Omit<D, "token" | "createdAt"> : never) : never;

let chain: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>) => {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
};

async function readAll(): Promise<SharedDoc[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

/** Same document (type + number) keeps the same link; its snapshot is refreshed. */
export function shareDoc(doc: NewDoc) {
  return serial(async () => {
    const list = await readAll();
    const i = list.findIndex((d) => d.type === doc.type && d.ref === doc.ref);
    const token = i >= 0 ? list[i].token : randomBytes(12).toString("base64url");
    const next = { ...doc, token, createdAt: i >= 0 ? list[i].createdAt : new Date().toISOString() } as SharedDoc;
    if (i >= 0) list[i] = next;
    else list.unshift(next);
    const tmp = `${FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(list.slice(0, 20000)));
    await fs.rename(tmp, FILE);
    return next;
  });
}

export async function getDoc(token: string) {
  if (!/^[\w-]{10,40}$/.test(token)) return null;
  return (await readAll()).find((d) => d.token === token) ?? null;
}
