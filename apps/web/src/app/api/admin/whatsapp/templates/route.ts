import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { createCustomTemplate, createDefaultTemplates, deleteCustomTemplate, syncTemplates } from "@/lib/whatsapp/client";
import { getState } from "@/lib/whatsapp/store";
import { WA_EVENT_KEYS, type WaEvent } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

/** GET: templates (?refresh=1 reloads them from Meta). */
export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const refresh = new URL(req.url).searchParams.get("refresh") === "1";
  try {
    if (refresh) await syncTemplates();
    const st = await getState();
    return NextResponse.json({ templates: st.templates, syncedAt: st.templatesAt });
  } catch (e) {
    const st = await getState();
    return NextResponse.json({ templates: st.templates, syncedAt: st.templatesAt, error: (e as Error).message });
  }
}

/** POST: create a custom template or submit the app's default templates to Meta for approval. */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as {
    events?: string[];
    custom?: boolean;
    name?: string;
    category?: "UTILITY" | "MARKETING" | "AUTHENTICATION";
    language?: string;
    body?: string;
    header?: string;
    footer?: string;
    buttons?: Array<{ type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"; text: string; url?: string; phone_number?: string }>;
    exampleParams?: string[];
  };

  // If creating a custom template:
  if (b.custom || (b.name && b.body)) {
    try {
      const res = await createCustomTemplate({
        name: b.name ?? "",
        category: b.category ?? "UTILITY",
        language: b.language,
        body: b.body ?? "",
        header: b.header,
        footer: b.footer,
        buttons: b.buttons,
        exampleParams: b.exampleParams,
      });
      const st = await getState();
      return NextResponse.json({ success: true, result: res, templates: st.templates, syncedAt: st.templatesAt });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  // Otherwise handle batch system templates:
  const only = b.events?.filter((e): e is WaEvent => WA_EVENT_KEYS.includes(e as WaEvent));
  try {
    const results = await createDefaultTemplates(only?.length ? only : undefined);
    const st = await getState();
    return NextResponse.json({ results, templates: st.templates, syncedAt: st.templatesAt });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** DELETE ?name=...: delete a template from Meta. */
export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const name = new URL(req.url).searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Template name is required" }, { status: 400 });
  try {
    await deleteCustomTemplate(name);
    const st = await getState();
    return NextResponse.json({ success: true, templates: st.templates, syncedAt: st.templatesAt });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
