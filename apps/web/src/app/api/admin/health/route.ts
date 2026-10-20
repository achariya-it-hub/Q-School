import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/crm/auth";
import { DATA_DIR } from "@/lib/data-dir";

export const dynamic = "force-dynamic";

/** Console-only check after deploying: where data is kept and whether the app can write there. */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  let writable = false;
  try {
    const probe = path.join(DATA_DIR, `.write-test-${process.pid}`);
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
    writable = true;
  } catch {}
  const insideApp = path.resolve(DATA_DIR) === path.resolve(process.cwd());
  return NextResponse.json({
    ok: writable && !(process.env.NODE_ENV === "production" && insideApp),
    dataDir: DATA_DIR,
    writable,
    insideAppFolder: insideApp,
    node: process.version,
    env: process.env.NODE_ENV,
    warning: insideApp && process.env.NODE_ENV === "production" ? "Data is inside the app folder and will be lost on the next deploy. Set CRM_DATA_DIR." : null,
  });
}
