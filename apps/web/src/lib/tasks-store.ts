/** Server-only: staff tasks persisted to tasks.json (seeded from the demo tasks). Writes are serialised. */
import { promises as fs } from "fs";
import { STAFF_TASKS, applyTaskAction, type StaffTask, type TaskAction } from "@qschool/shared";
import { dataFile } from "@/lib/data-dir";

const FILE = dataFile("tasks.json");
let queue: Promise<unknown> = Promise.resolve();

export async function readTasks(): Promise<StaffTask[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return structuredClone(STAFF_TASKS);
  }
}

/** Apply one action atomically (read → change → write) and return the new list. */
export function performTaskAction(action: TaskAction, by: string): Promise<StaffTask[]> {
  const run = async () => {
    const next = applyTaskAction(await readTasks(), action, by, new Date().toISOString().slice(0, 10));
    await fs.writeFile(FILE, JSON.stringify(next, null, 2));
    return next;
  };
  const p = queue.then(run, run);
  queue = p.catch(() => undefined);
  return p;
}

const TYPES = ["create", "status", "milestone", "blocker", "resolve", "update"];
export function isTaskAction(a: unknown): a is TaskAction {
  return !!a && typeof a === "object" && TYPES.includes((a as { type?: string }).type ?? "");
}
