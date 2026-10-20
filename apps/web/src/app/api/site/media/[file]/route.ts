import { promises as fs } from "fs";
import path from "path";
import { MEDIA_DIR } from "@/lib/site/store";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" };

/** Public: serves images uploaded from the website editor. */
export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const m = /^([a-z0-9-]+)\.(jpg|png|webp|gif|avif)$/.exec(params.file);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(MEDIA_DIR, params.file));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[m[2]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
