import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, isAdmin, verify } from "@/lib/crm/auth";
import { discardDraft, getSiteFile, publish, restoreToDraft, saveDraft, type SiteFile } from "@/lib/site/store";
import { DEFAULT_HOME } from "@/lib/site/home-content";

export const dynamic = "force-dynamic";

const view = (f: SiteFile) => ({
  published: f.published,
  publishedAt: f.publishedAt,
  draft: f.draft,
  draftSavedAt: f.draftSavedAt,
  history: f.history.map((h, i) => ({ index: i, at: h.at, by: h.by })),
  defaults: DEFAULT_HOME,
});

/** Website editor state (Console only). */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json(view(await getSiteFile()));
}

/**
 * PUT { action: "draft", content }    save draft
 *     { action: "publish", content }  make it live (previous version goes to history)
 *     { action: "discard" }           drop the draft
 *     { action: "restore", index }    load a past version into the draft
 */
export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const by = verify(cookies().get(COOKIE)?.value) ?? "admin";
  let body: { action?: string; content?: unknown; index?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    switch (body.action) {
      case "draft":
        return NextResponse.json(view(await saveDraft(body.content)));
      case "publish":
        return NextResponse.json(view(await publish(body.content, by)));
      case "discard":
        return NextResponse.json(view(await discardDraft()));
      case "restore":
        return NextResponse.json(view(await restoreToDraft(Number(body.index))));
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Could not save" }, { status: 400 });
  }
}
