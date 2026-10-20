import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/crm/auth";
import { MAX_MEDIA_BYTES, MEDIA_TYPES, listMedia, saveMedia, sniffImage } from "@/lib/site/store";

export const dynamic = "force-dynamic";

/** Media library for the website editor. */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ media: await listMedia() });
}

/** Upload one image (multipart field "file"). JPG, PNG, WebP, GIF or AVIF up to 4 MB. */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Send the image as form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_MEDIA_BYTES) return NextResponse.json({ error: "Image is larger than 4 MB" }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniffImage(buf);
  if (!type || !MEDIA_TYPES[type]) return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF or AVIF images" }, { status: 415 });
  return NextResponse.json({ url: await saveMedia(buf, type) });
}
