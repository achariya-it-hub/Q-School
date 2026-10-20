import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { BbbError, testConnection } from "@/lib/bbb/client";
import { normaliseBbbUrl } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

/** Test the BBB server with the values in the form (unsaved), falling back to saved ones. */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { url?: string; secret?: string; algorithm?: string };
  const override: Record<string, string> = {};
  if (b.url) override.url = normaliseBbbUrl(b.url);
  if (b.secret) override.secret = b.secret.trim();
  if (b.algorithm === "sha1" || b.algorithm === "sha256") override.algorithm = b.algorithm;
  try {
    return NextResponse.json(await testConnection(override));
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, key: e instanceof BbbError ? e.key : "error" }, { status: 200 });
  }
}
