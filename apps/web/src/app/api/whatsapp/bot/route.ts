/** Chatbot settings (texts, courses, branch details) and the list of chats waiting for a human. Admin only. */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { getBotConfig, handoffList, resumeBot, saveBotConfig } from "@/lib/whatsapp/bot";

export const dynamic = "force-dynamic";
const no = () => NextResponse.json({ error: "Unauthorised" }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return no();
  return NextResponse.json({ ok: true, config: await getBotConfig(), handoffs: await handoffList() });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return no();
  const b = (await req.json().catch(() => ({}))) as { config?: Parameters<typeof saveBotConfig>[0]; resume?: string };
  if (b.resume) await resumeBot(b.resume);
  const config = b.config ? await saveBotConfig(b.config) : await getBotConfig();
  return NextResponse.json({ ok: true, config, handoffs: await handoffList() });
}
