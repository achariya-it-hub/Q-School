/**
 * Database-backed replacement for the JSON files the stores used to keep on disk.
 *
 * On Vercel the disk is a per-instance /tmp that is wiped on every cold start, so anything kept only in a
 * file differs between servers, devices and visits. With DATABASE_URL set, these helpers keep each file's
 * content in Postgres (qs_meta, key "file:<name>") so every instance and every device sees the same data.
 * Without a database (local development) they behave exactly like plain files.
 *
 * Drop-in for `fs.readFile(file, "utf8")` / `fs.writeFile(file, text)`: a missing document still throws
 * (so existing "catch → defaults" code keeps working).
 */
import { promises as fs } from "fs";
import path from "path";
import { deleteDbMetaKeys, getDbMetaText, isDbConfigured, setDbMetaText } from "@/lib/db";

const keyOf = (file: string) => `file:${path.basename(file)}`;

/** Keys whose last database read failed: never overwrite them with data built from an empty fallback. */
const unreadable = new Set<string>();

export async function persistRead(file: string): Promise<string> {
  if (!isDbConfigured()) return fs.readFile(file, "utf8");
  const key = keyOf(file);
  const r = await getDbMetaText(key);
  if (!r.ok) {
    unreadable.add(key);
    throw new Error("database unavailable");
  }
  unreadable.delete(key);
  if (r.value !== null) return r.value;
  // First read after the database was switched on: seed it from the local copy, if there is one.
  const text = await fs.readFile(file, "utf8");
  await setDbMetaText(key, text);
  return text;
}

export async function persistWrite(file: string, text: string): Promise<void> {
  if (isDbConfigured()) {
    const key = keyOf(file);
    if (unreadable.has(key)) {
      const r = await getDbMetaText(key);
      if (!r.ok) throw new Error("Database unavailable — not overwriting saved data. Please retry.");
      unreadable.delete(key);
    }
    if (!(await setDbMetaText(key, text))) throw new Error("Could not save to the database. Please retry.");
  }
  // Local copy (best effort): the only copy in development, a cache on a server.
  try {
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, text);
    await fs.rename(tmp, file);
  } catch {
    await fs.writeFile(file, text).catch(() => {});
  }
}

export async function persistDelete(file: string): Promise<void> {
  if (isDbConfigured()) await deleteDbMetaKeys([keyOf(file)]);
  await fs.unlink(file).catch(() => {});
}
