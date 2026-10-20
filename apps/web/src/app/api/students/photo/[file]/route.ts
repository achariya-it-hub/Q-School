/** Student photos are children's images, so they are only served to a Console admin or the student's own centre. */
import { NextResponse } from "next/server";
import { caller } from "@/lib/students/access";
import { findByPhoto, readPhoto } from "@/lib/students/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const who = await caller();
  if (!who) return new NextResponse("Unauthorised", { status: 401 });
  const s = await findByPhoto(params.file);
  if (!s || (who.kind === "centre" && s.centreId !== who.centreId)) return new NextResponse("Not found", { status: 404 });
  const p = await readPhoto(params.file);
  if (!p) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(p.buf), { headers: { "Content-Type": p.type, "Cache-Control": "private, max-age=3600" } });
}
