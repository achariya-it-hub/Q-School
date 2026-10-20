import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { readPhoto } from "@/lib/admin-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return new NextResponse("Unauthorised", { status: 401 });
  const buf = readPhoto();
  if (!buf) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-cache" } });
}
