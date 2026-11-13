import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { COURSES } from "@qschool/shared";
import { dataFile } from "@/lib/data-dir";
import { isAdmin } from "@/lib/crm/auth";
import { resetDbDemoData } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit/store";

async function writeJsonSafe(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export async function POST() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Reset all operational JSON stores to clean empty states
    const emptyArrays = [
      "crm-leads.json",
      "crm-events.json",
      "crm-ingest-log.json",
      "crm-attendees.json",
      "leads.json",
      "students.json",
      "student-progress.json",
      "partners.json",
      "partner-admissions.json",
      "campaign-calendar.json",
      "tasks.json",
      "live-sessions.json",
      "whatsapp-messages.json",
      "shared-docs.json",
      "audit-logs.json",
    ];

    for (const name of emptyArrays) {
      await writeJsonSafe(dataFile(name), []);
    }

    await writeJsonSafe(dataFile("crm-state.json"), { rr: 0, counts: {}, last: {} });
    await fs.unlink(dataFile("payroll.json")).catch(() => {});
    await fs.unlink(dataFile("punches.json")).catch(() => {});

    // 2. Reset courses.json learners count to 0 while keeping official catalog
    const cleanCourses = COURSES.map((c) => ({ ...c, learners: 0 }));
    await writeJsonSafe(dataFile("courses.json"), cleanCourses);

    // 3. Reset Postgres demo tables if DB is configured
    await resetDbDemoData().catch(() => false);

    // 4. Record initial clean audit entry
    await recordAuditLog({
      action: "DELETE",
      module: "System Settings",
      entityId: "ERP-RESET",
      entityName: "Full ERP Demo Data Reset",
      summary:
        "All demo/test records across CRM, Admissions, Progress Tracker, Finance, Partners, Campaigns, Payroll, Tasks, and Live Sessions were reset.",
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      message: "All ERP demo data has been reset to a clean state.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to reset ERP demo data" },
      { status: 500 }
    );
  }
}
