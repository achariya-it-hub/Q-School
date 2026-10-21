/**
 * Audit Trail Store (Server-only).
 * Tracks creates, modifications, updates, deletions and sensitive actions
 * across all modules and pages in Q-School LMS / ERP.
 * File-backed persistence in DATA_DIR: audit-logs.json
 */
import { promises as fs } from "fs";
import { dataFile } from "@/lib/data-dir";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "STATUS_CHANGE" | "PAYOUT";

export interface AuditLog {
  id: string; // aud_1729...
  timestamp: string; // ISO
  action: AuditAction;
  module: string; // "Students" | "Users" | "Fees & Payments" | "Courses" | "Partners & Referrals" | "Staff & Payroll" | "Inventory" | "Settings" | "Leads" | "Expenses"
  entityId?: string;
  entityName?: string;
  summary: string;
  performedBy: string; // User email / admin
  ipAddress?: string;
  previousData?: any;
  newData?: any;
  details?: Record<string, any>;
}

export interface AuditFilterParams {
  module?: string;
  action?: string;
  search?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

const AUDIT_FILE = dataFile("audit-logs.json");

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function readLogs(): Promise<AuditLog[]> {
  try {
    const raw = await fs.readFile(AUDIT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLogs(logs: AuditLog[]): Promise<void> {
  const tmp = `${AUDIT_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(logs, null, 2));
  await fs.rename(tmp, AUDIT_FILE);
}

/**
 * Record an audit trail entry. Safe to call anywhere on the server.
 */
export async function recordAuditLog(entry: {
  action: AuditAction;
  module: string;
  entityId?: string;
  entityName?: string;
  summary: string;
  performedBy?: string;
  ipAddress?: string;
  previousData?: any;
  newData?: any;
  details?: Record<string, any>;
}): Promise<AuditLog> {
  return serial(async () => {
    const logs = await readLogs();
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action: entry.action,
      module: entry.module,
      entityId: entry.entityId,
      entityName: entry.entityName,
      summary: entry.summary,
      performedBy: entry.performedBy || "Admin",
      ipAddress: entry.ipAddress,
      previousData: entry.previousData,
      newData: entry.newData,
      details: entry.details,
    };

    // Prepend latest logs, keep up to 10,000 logs
    logs.unshift(newLog);
    if (logs.length > 10000) {
      logs.length = 10000;
    }

    await writeLogs(logs);
    return newLog;
  });
}

/**
 * Query audit logs with search, filter, and pagination
 */
export async function getAuditLogs(params: AuditFilterParams = {}): Promise<{
  logs: AuditLog[];
  total: number;
  stats: {
    total: number;
    creates: number;
    updates: number;
    deletes: number;
    todayCount: number;
  };
  modules: string[];
}> {
  const allLogs = await readLogs();
  const today = new Date().toISOString().split("T")[0];

  const modulesSet = new Set<string>();
  let creates = 0;
  let updates = 0;
  let deletes = 0;
  let todayCount = 0;

  for (const log of allLogs) {
    if (log.module) modulesSet.add(log.module);
    if (log.action === "CREATE") creates++;
    if (log.action === "UPDATE") updates++;
    if (log.action === "DELETE") deletes++;
    if (log.timestamp && log.timestamp.startsWith(today)) todayCount++;
  }

  let filtered = allLogs;

  if (params.module && params.module !== "all") {
    filtered = filtered.filter((l) => l.module.toLowerCase() === params.module!.toLowerCase());
  }

  if (params.action && params.action !== "all") {
    filtered = filtered.filter((l) => l.action.toLowerCase() === params.action!.toLowerCase());
  }

  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (l) =>
        (l.summary && l.summary.toLowerCase().includes(q)) ||
        (l.entityName && l.entityName.toLowerCase().includes(q)) ||
        (l.entityId && l.entityId.toLowerCase().includes(q)) ||
        (l.performedBy && l.performedBy.toLowerCase().includes(q)) ||
        (l.module && l.module.toLowerCase().includes(q))
    );
  }

  if (params.startDate) {
    filtered = filtered.filter((l) => l.timestamp >= params.startDate!);
  }

  if (params.endDate) {
    filtered = filtered.filter((l) => l.timestamp <= params.endDate!);
  }

  const total = filtered.length;
  const offset = params.offset || 0;
  const limit = params.limit || 50;
  const pagedLogs = filtered.slice(offset, offset + limit);

  return {
    logs: pagedLogs,
    total,
    stats: {
      total: allLogs.length,
      creates,
      updates,
      deletes,
      todayCount,
    },
    modules: Array.from(modulesSet).sort(),
  };
}
